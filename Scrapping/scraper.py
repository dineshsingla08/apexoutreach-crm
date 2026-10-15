import os
import re
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Set
import requests
from bs4 import BeautifulSoup
import pandas as pd
import urllib3
from playwright.sync_api import sync_playwright, Playwright, Browser

# Suppress SSL warnings for web scraping
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# HTTP Headers for fetching clinic contact/about pages
REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

IGNORE_EMAIL_PATTERNS = [
    r"sentry",
    r"wixpress",
    r"domain\.com",
    r"example\.com",
    r"yourdomain",
    r"bootstrap",
    r"fontawesome",
    r"rating",
    r"review",
    r"company\.com",
    r"mysite\.com",
]

def launch_compatible_browser(playwright_instance: Playwright, headless: bool = True) -> Browser:
    """Launches Chrome or Edge available on Windows."""
    for channel in ["chrome", "msedge", None]:
        try:
            if channel:
                return playwright_instance.chromium.launch(
                    channel=channel,
                    headless=headless,
                    args=["--lang=en-US", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
                )
            return playwright_instance.chromium.launch(
                headless=headless,
                args=["--lang=en-US", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
            )
        except Exception:
            continue
    raise RuntimeError("No compatible browser found. Please install Chrome or Edge.")

def extract_email_from_text(text: str) -> Set[str]:
    """Finds valid email addresses from text."""
    raw_emails = set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text))
    clean_emails = set()
    for email in raw_emails:
        lower_email = email.lower().strip()
        if any(re.search(pat, lower_email) for pat in IGNORE_EMAIL_PATTERNS):
            continue
        if re.search(r"\.(png|jpg|jpeg|webp|gif|svg|css|js|woff|woff2|ttf)$", lower_email):
            continue
        clean_emails.add(lower_email)
    return clean_emails

def extract_email_from_url(url: str, timeout: int = 3) -> str:
    """Fast email extraction from homepage and /contact."""
    if not url or not url.startswith("http"):
        return ""
    
    found_emails: Set[str] = set()

    def check_url(target_url: str):
        try:
            resp = requests.get(target_url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for mailto in soup.select('a[href^="mailto:"]'):
                    href = mailto.get("href", "")
                    clean_mail = href.replace("mailto:", "").split("?")[0].strip().lower()
                    if "@" in clean_mail and not any(re.search(p, clean_mail) for p in IGNORE_EMAIL_PATTERNS):
                        if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg)$", clean_mail):
                            found_emails.add(clean_mail)

                text_emails = extract_email_from_text(resp.text)
                found_emails.update(text_emails)
        except Exception:
            pass

    # 1. Check Homepage
    check_url(url)
    
    # 2. Check /contact if not found
    if not found_emails:
        try:
            parsed = urllib.parse.urlparse(url)
            base = f"{parsed.scheme}://{parsed.netloc}"
            check_url(urllib.parse.urljoin(base, "/contact"))
            if not found_emails:
                check_url(urllib.parse.urljoin(base, "/contact-us"))
        except Exception:
            pass

    return "; ".join(list(found_emails)[:2]) if found_emails else ""

def clean_phone(raw_phone: str) -> str:
    if not raw_phone:
        return ""
    phone = re.sub(r'^[^\d+]+', '', raw_phone)
    return phone.replace("\n", " ").strip()

def clean_address(raw_addr: str) -> str:
    if not raw_addr:
        return ""
    addr = re.sub(r'^[^\w\d]+', '', raw_addr)
    return addr.replace("\n", ", ").strip()

def batch_enrich_emails(records: List[Dict[str, str]], max_workers: int = 15) -> None:
    """Enriches a batch of clinic records with emails concurrently."""
    url_to_indices = {}
    for i, r in enumerate(records):
        web = r.get("Website", "")
        if web and not r.get("Email"):
            url_to_indices.setdefault(web, []).append(i)

    if not url_to_indices:
        return

    print(f"[*] Concurrently fetching emails for {len(url_to_indices)} websites ({max_workers} threads)...", flush=True)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(extract_email_from_url, url): url for url in url_to_indices.keys()}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                email = future.result()
                if email:
                    for idx in url_to_indices[url]:
                        records[idx]["Email"] = email
            except Exception:
                pass

def scrape_fast_google_maps(
    search_queries: List[str],
    max_results_per_query: int = 40,
    output_csv_path: str = "clinics_in_gurgaon.csv",
    headless: bool = True
) -> List[Dict[str, str]]:
    """
    High-speed Google Maps scraper for Gurgaon clinics.
    Uses media-blocking and multithreaded email enrichment.
    """
    all_clinics: List[Dict[str, str]] = []
    seen_identifiers: Set[str] = set()

    # Load existing CSV records for smooth resumption
    if os.path.exists(output_csv_path):
        try:
            existing_df = pd.read_csv(output_csv_path)
            for _, row in existing_df.iterrows():
                key = str(row.get("Phone Number", "")).strip() or str(row.get("Name", "")).strip().lower()
                if key:
                    seen_identifiers.add(key)
                all_clinics.append(row.to_dict())
            print(f"[i] Resuming from existing CSV: {len(all_clinics)} records already saved.", flush=True)
        except Exception as e:
            print(f"[!] Note on reading existing CSV: {e}", flush=True)

    with sync_playwright() as p:
        browser = launch_compatible_browser(p, headless=headless)
        context = browser.new_context(
            user_agent=REQUEST_HEADERS["User-Agent"],
            locale="en-US",
            viewport={"width": 1280, "height": 720}
        )
        # Block media for 4x faster network speed
        context.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}", lambda route: route.abort())
        page = context.new_page()

        for q_idx, query in enumerate(search_queries, 1):
            encoded_query = urllib.parse.quote(query)
            search_url = f"https://www.google.com/maps/search/{encoded_query}?hl=en"
            print(f"\n[{q_idx}/{len(search_queries)}] Searching: '{query}'...", flush=True)

            try:
                page.goto(search_url, timeout=25000)
                page.wait_for_selector('div[role="feed"]', timeout=10000)
            except Exception:
                print(f"[-] No results feed for: {query}, moving to next...", flush=True)
                continue

            feed = page.locator('div[role="feed"]')

            # Fast scrolling
            prev_count = 0
            stagnant_scrolls = 0
            while stagnant_scrolls < 4:
                count = feed.locator('a.hfpxzc').count()
                if count >= max_results_per_query:
                    break

                end_text = page.locator('text="You\'ve reached the end of the list."')
                if end_text.is_visible():
                    break

                feed.evaluate("el => el.scrollBy(0, 4000)")
                page.wait_for_timeout(600)

                new_count = feed.locator('a.hfpxzc').count()
                if new_count == prev_count:
                    stagnant_scrolls += 1
                else:
                    stagnant_scrolls = 0
                prev_count = new_count

            total_items = feed.locator('a.hfpxzc').count()
            print(f"    Loaded {total_items} listings. Extracting details...", flush=True)

            new_query_records: List[Dict[str, str]] = []
            
            for idx in range(total_items):
                try:
                    item = feed.locator('a.hfpxzc').nth(idx)
                    name = item.get_attribute("aria-label") or ""
                    maps_url = item.get_attribute("href") or ""
                    if not name:
                        continue

                    # Fast click & short pause
                    item.scroll_into_view_if_needed()
                    item.click()
                    page.wait_for_timeout(600)

                    # Extract details
                    title_elem = page.locator('h1.DUwDvf').first
                    if title_elem.is_visible(timeout=800):
                        name = title_elem.inner_text().strip()

                    phone = ""
                    phone_btns = page.locator('button[data-item-id^="phone:tel:"]').all()
                    if phone_btns:
                        phone = clean_phone(phone_btns[0].inner_text())

                    address = ""
                    addr_btns = page.locator('button[data-item-id="address"]').all()
                    if addr_btns:
                        address = clean_address(addr_btns[0].inner_text())

                    website = ""
                    web_btns = page.locator('a[data-item-id="authority"]').all()
                    if web_btns:
                        website = web_btns[0].get_attribute("href") or ""

                    rating = ""
                    reviews_count = ""
                    try:
                        star_loc = page.locator('div.F7nice span[aria-hidden="true"]').first
                        if star_loc.is_visible(timeout=300):
                            rating = star_loc.inner_text().strip()
                        rev_loc = page.locator('div.F7nice span[aria-label*="reviews"]').first
                        if rev_loc.is_visible(timeout=300):
                            reviews_count = rev_loc.inner_text().strip().replace("(", "").replace(")", "")
                    except Exception:
                        pass

                    dedup_key = phone if phone else name.lower()
                    if dedup_key in seen_identifiers:
                        continue
                    seen_identifiers.add(dedup_key)

                    record = {
                        "Name": name,
                        "Phone Number": phone,
                        "Email": "",
                        "Address": address,
                        "Website": website,
                        "Rating": rating,
                        "Reviews": reviews_count,
                        "Google Maps URL": maps_url,
                        "Query": query,
                    }
                    new_query_records.append(record)

                except Exception:
                    continue

            # Batch enrich emails concurrently in parallel threads
            if new_query_records:
                batch_enrich_emails(new_query_records, max_workers=12)
                all_clinics.extend(new_query_records)

                # Save directly to CSV
                pd.DataFrame(all_clinics).to_csv(output_csv_path, index=False, encoding="utf-8-sig")
                print(f"    Added {len(new_query_records)} new leads! Total so far: {len(all_clinics)}", flush=True)

        browser.close()

    return all_clinics

def main():
    # Exhaustive sector and specialty queries for Gurgaon
queries = [
        # --- Major Sector Hubs & Commercial Areas ---
        "clinics in Sector 14 Gurgaon",
        "clinics in Sector 15 Gurgaon",
        "clinics in Sector 31 Gurgaon",
        "clinics in Sector 46 Gurgaon",
        "clinics in Sector 56 Gurgaon",
        "clinics in DLF Phase 1 2 3 Gurgaon",
        "clinics in DLF Phase 4 5 Gurgaon",
        "clinics in Golf Course Road Gurgaon",
        "clinics in Golf Course Extension Road Gurgaon",
        "clinics in Sushant Lok Gurgaon",
        "clinics in South City Gurgaon",
        "clinics in Udyog Vihar Gurgaon",
        "clinics in Old Gurgaon Railway Road",

        # --- Sohna Town & Sohna Road Corridor ---
        "clinics in Sohna Gurgaon",
        "clinics in Sohna Road Gurgaon",
        "clinics in Badshahpur Gurgaon",
        "clinics in Sector 48 Gurgaon Sohna Road",
        "clinics in Sector 49 Gurgaon Rosewood City",
        "clinics in Sector 67 68 Sohna Road",
        "clinics in Damdama Road Sohna",

        # --- Palam Vihar & Nearby Areas ---
        "clinics in Palam Vihar Gurgaon",
        "clinics in Sector 1 Palam Vihar Gurgaon",
        "clinics in Rezangla Road Palam Vihar",
        "clinics in Palam Vihar Extension Gurgaon",

        # --- Dwarka Expressway Belt (Sectors 99 to 115) ---
        "clinics in Dwarka Expressway Gurgaon",
        "clinics in Sector 99 Gurgaon",
        "clinics in Sector 102 103 Gurgaon",
        "clinics in Sector 104 105 Gurgaon",
        "clinics in Sector 106 108 Gurgaon",
        "clinics in Sector 109 110 Gurgaon",
        "clinics in Sector 111 112 113 Gurgaon",
        "clinics in New Gurgaon Sector 37D",

        # --- New Gurgaon / Southern Peripheral Road (SPR) ---
        "clinics in Sector 82 83 Gurgaon",
        "clinics in Sector 84 85 Gurgaon",
        "clinics in Sector 90 92 Gurgaon",

        # --- High-Intent Medical Specialties ---
        "dental clinic in gurgaon",
        "skin clinic in gurgaon",
        "multispeciality clinic in gurgaon",
        "pediatric clinic in gurgaon",
        "IVF Clinics in gurgaon",
        "eye clinic in gurgaon",
        "ENT clinic in gurgaon",
        "orthopedic clinic in gurgaon",
        "physiotherapy clinic in gurgaon",
        "gynecology clinic in gurgaon",
        "dermatologist clinic in gurgaon"
    ]

    output_file = "d:/Dinesh/antigravity/Scrapping/clinics_in_gurgaon.csv"
    print("=" * 65, flush=True)
    print("      FAST GOOGLE MAPS CLINIC SCRAPER - GURGAON (OPTIMIZED)    ", flush=True)
    print("=" * 65, flush=True)
    print(f"Target Output: {output_file}", flush=True)
    print(f"Total Search Niches & Sectors: {len(queries)}", flush=True)
    print("Optimizations: Media blocking, 12x parallel email worker threads", flush=True)
    print("=" * 65, flush=True)

    results = scrape_fast_google_maps(
        search_queries=queries,
        max_results_per_query=40,
        output_csv_path=output_file,
        headless=True
    )

    print("\n" + "=" * 65, flush=True)
    print(f"[FINISHED] Total Unique Clinic Leads Scraped: {len(results)}", flush=True)
    print(f"[FINISHED] Saved to: {output_file}", flush=True)
    print("=" * 65, flush=True)

if __name__ == "__main__":
    main()
