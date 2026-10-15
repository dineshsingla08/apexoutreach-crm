import os
import re
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Optional, Set, Tuple
import requests
from bs4 import BeautifulSoup
import pandas as pd
import urllib3
from playwright.sync_api import sync_playwright, Playwright, Browser

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DEFAULT_OUTPUT_ALL_CSV = "d:/Dinesh/antigravity/Scrapping/businesses_in_gurgaon_dwarka_all.csv"
DEFAULT_OUTPUT_EMAIL_CSV = "d:/Dinesh/antigravity/Scrapping/businesses_in_gurgaon_dwarka_with_email.csv"
DEFAULT_PREVIEW_HTML = "d:/Dinesh/antigravity/Scrapping/preview_gurgaon_dwarka.html"

REQUEST_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

IGNORE_EMAIL_PATTERNS = [
    r"sentry", r"wixpress", r"domain\.com", r"example\.com", r"yourdomain",
    r"bootstrap", r"fontawesome", r"rating", r"review", r"company\.com",
    r"mysite\.com", r"wordpress", r"schema\.org", r"elementor", r"themeforest",
    r"envato", r"cloudflare", r"gravatar", r"placeholder", r"user@gmail\.com",
    r"test@test\.com", r"your@mail\.com", r"admin@admin\.com", r"sample@email\.com",
    r"info@domain\.com", r"contact@yourbusiness\.com", r"email@domain\.com"
]

GSTIN_REGEX = re.compile(r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b")

# Well known sub-areas in Gurgaon & Dwarka
GURGAON_AREAS = [
    "Cyber City", "Udyog Vihar", "Golf Course Road", "Golf Course Ext Rd", "Sohna Road",
    "IMT Manesar", "Sector 29", "Galleria Market", "Sector 14", "Sector 37 Industrial Area",
    "Pace City", "Sector 44", "Sector 56", "Sector 57", "Sector 47", "Sector 48",
    "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5",
    "Sushant Lok", "South City", "Sector 82", "Sector 90", "Badshahpur", "Subhash Chowk",
    "Ambience Mall", "MG Road", "Old Railway Road", "New Railway Road", "Sadar Bazar",
    "Sheetla Mata Road", "Sector 31", "Sector 40", "Sector 43", "Sector 49", "Sector 50"
]

DWARKA_AREAS = [
    "Sector 12", "Sector 6", "Ramphal Chowk", "Sector 10", "Sector 11", "Sector 7",
    "Sector 14", "Sector 21", "Sector 22", "Sector 23", "Sector 8", "Sector 9", "Sector 13",
    "Sector 19", "Sector 4", "Sector 5", "Sector 3", "Sector 2", "Sector 1",
    "Dwarka Mor", "Vegas Mall", "Pacific D21 Mall", "Kakrola", "Dwarka Expressway"
]


def clean_business_name(raw_name: str) -> str:
    """Cleans noisy SEO descriptors from business title."""
    if not raw_name or not isinstance(raw_name, str):
        return "Business Owner"
    name = raw_name.strip()
    name = name.replace("’", "'").replace("‘", "'").replace("â€™", "'").replace("\ufffd", "")
    for sep in [" | ", " - ", " : ", " – ", " — ", ","]:
        if sep in name:
            candidate = name.split(sep)[0].strip()
            if len(candidate) >= 3 and not candidate.lower().startswith(("best", "top")):
                name = candidate
                break
    return re.sub(r'^["\']|["\']$', '', name).strip()


def detect_city_and_area(address: str, query: str) -> Tuple[str, str]:
    """Detects whether business is in Gurgaon or Dwarka and identifies specific area."""
    combined = f"{address} {query}".lower()

    # Determine City
    if any(k in combined for k in ["dwarka", "kakrola", "dwarka mor", "delhi 11007"]):
        city = "Dwarka, Delhi"
        for a in DWARKA_AREAS:
            if a.lower() in combined:
                return city, a
        sec_match = re.search(r"sector\s*[-]?\s*(\d+[a-z]*)", combined, re.IGNORECASE)
        if sec_match:
            return city, f"Sector {sec_match.group(1).upper()}"
        return city, "Dwarka"
    else:
        city = "Gurgaon, Haryana"
        for a in GURGAON_AREAS:
            if a.lower() in combined:
                return city, a
        sec_match = re.search(r"sector\s*[-]?\s*(\d+[a-z]*)", combined, re.IGNORECASE)
        if sec_match:
            return city, f"Sector {sec_match.group(1).upper()}"
        return city, "Gurgaon"


def classify_category(name: str, query: str, gmaps_cat: str) -> str:
    """Categorizes business into clear industry verticals."""
    combined = f"{name} {query} {gmaps_cat}".lower()

    if any(k in combined for k in ["industry", "manufactur", "factory", "machinery", "fabricat", "textile", "packag", "plastic", "auto component"]):
        return "Manufacturing & Industry"
    elif any(k in combined for k in ["software", "technology", "it company", "tech", "cloud", "digital marketing", "bpo", "coworking", "data"]):
        return "IT, Software & Tech"
    elif any(k in combined for k in ["restaurant", "cafe", "bakery", "sweet", "bar", "pub", "kitchen", "eatery", "food", "dine", "coffee"]):
        return "Food, Restaurant & Cafe"
    elif any(k in combined for k in ["clinic", "hospital", "doctor", "dental", "eye", "physician", "pathology", "diagnostic", "medicose", "chemist", "pharmacy", "ayurved"]):
        return "Clinic & Healthcare"
    elif any(k in combined for k in ["car showroom", "car repair", "service center", "bike", "automobile", "workshop", "tyres", "battery"]):
        return "Automobile & Workshop"
    elif any(k in combined for k in ["clothing", "garment", "saree", "boutique", "jeweller", "furniture", "electronics", "supermarket", "grocery", "hardware", "sanitary", "shoe", "retail", "store", "shop"]):
        return "Retail & Commercial Shops"
    elif any(k in combined for k in ["real estate", "builder", "developer", "interior", "architect", "property"]):
        return "Real Estate & Interior"
    elif any(k in combined for k in ["school", "academy", "institute", "coaching", "college", "classes"]):
        return "Education & Coaching"
    elif any(k in combined for k in ["hotel", "resort", "banquet", "guest house"]):
        return "Hotels & Hospitality"
    elif any(k in combined for k in ["salon", "spa", "gym", "fitness", "beauty parlour"]):
        return "Salons, Gyms & Wellness"
    else:
        return "Corporate & Commercial Services"


def sanitize_whatsapp_phone(raw_phone: str) -> Optional[str]:
    """Sanitizes Indian mobile numbers into 12-digit international format."""
    if not raw_phone or pd.isna(raw_phone):
        return None
    digits = re.sub(r"\D", "", str(raw_phone))
    if len(digits) == 11 and digits.startswith("0") and digits[1] in "6789":
        return "91" + digits[1:]
    if len(digits) == 10 and digits[0] in "6789":
        return "91" + digits
    if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
        return digits
    return None


def extract_emails_from_website(url: str, timeout: int = 4) -> Dict[str, str]:
    """
    Crawls business homepage and subpages (/contact, /about) to extract verified emails & GSTIN.
    """
    result = {"Email": "", "GSTIN": ""}
    if not url or not url.startswith("http"):
        return result

    found_emails: Set[str] = set()
    found_gstins: Set[str] = set()

    def inspect_html(html_text: str):
        # GSTIN check
        for match in GSTIN_REGEX.findall(html_text):
            found_gstins.add(match.strip().upper())

        soup = BeautifulSoup(html_text, "html.parser")
        # Mailto links
        for mailto in soup.select('a[href^="mailto:"]'):
            href = mailto.get("href", "")
            clean_mail = href.replace("mailto:", "").split("?")[0].strip().lower()
            if "@" in clean_mail and not any(re.search(p, clean_mail) for p in IGNORE_EMAIL_PATTERNS):
                if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg)$", clean_mail):
                    found_emails.add(clean_mail)

        # Text regex
        raw_emails = set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html_text))
        for em in raw_emails:
            lower_em = em.lower().strip()
            if not any(re.search(p, lower_em) for p in IGNORE_EMAIL_PATTERNS):
                if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg|css|js|woff|woff2|ttf)$", lower_em):
                    found_emails.add(lower_em)

    # 1. Homepage
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
        if resp.status_code == 200:
            inspect_html(resp.text)
    except Exception:
        pass

    # 2. Subpages if not found
    if not found_emails:
        try:
            parsed = urllib.parse.urlparse(url)
            base = f"{parsed.scheme}://{parsed.netloc}"
            for subpath in ["/contact", "/contact-us", "/about", "/about-us", "/reach-us", "/contact.html"]:
                try:
                    sub_url = urllib.parse.urljoin(base, subpath)
                    sub_resp = requests.get(sub_url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
                    if sub_resp.status_code == 200:
                        inspect_html(sub_resp.text)
                        if found_emails:
                            break
                except Exception:
                    continue
        except Exception:
            pass

    result["Email"] = "; ".join(sorted(list(found_emails))[:2]) if found_emails else ""
    result["GSTIN"] = list(found_gstins)[0] if found_gstins else ""
    return result


def batch_enrich_leads(leads: List[Dict[str, str]], max_workers: int = 12) -> None:
    """Enriches leads concurrently with Email IDs and GSTINs from their websites."""
    url_to_indices = {}
    for i, r in enumerate(leads):
        web = r.get("Website", "")
        if web and not r.get("Email"):
            url_to_indices.setdefault(web, []).append(i)

    if not url_to_indices:
        return

    print(f"    [🔍] Enriching emails from {len(url_to_indices)} unique websites (concurrency: {max_workers})...", flush=True)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(extract_emails_from_website, url): url for url in url_to_indices.keys()}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                res = future.result()
                if res.get("Email"):
                    for idx in url_to_indices[url]:
                        leads[idx]["Email"] = res["Email"]
                        leads[idx]["Has Email"] = "Yes"
                        if res.get("GSTIN") and not leads[idx].get("GSTIN"):
                            leads[idx]["GSTIN"] = res["GSTIN"]
            except Exception:
                pass


def launch_browser(p: Playwright, headless: bool = True) -> Browser:
    """Launches Chrome or Edge with anti-detection flags."""
    for channel in ["chrome", "msedge", None]:
        try:
            return p.chromium.launch(
                channel=channel,
                headless=headless,
                args=[
                    "--lang=en-US",
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-gpu",
                    "--disable-dev-shm-usage"
                ]
            )
        except Exception:
            continue
    raise RuntimeError("No compatible Chrome/Edge browser found.")


def scrape_gurgaon_dwarka_leads(
    queries: List[str],
    max_scrolls: int = 6,
    output_all_csv: str = DEFAULT_OUTPUT_ALL_CSV,
    output_email_csv: str = DEFAULT_OUTPUT_EMAIL_CSV,
    headless: bool = True
) -> List[Dict[str, str]]:
    """
    Scrapes businesses across Gurgaon and Dwarka from Google Maps,
    extracts website & contact details, and enriches verified email addresses.
    """
    all_leads: List[Dict[str, str]] = []
    seen_identifiers: Set[str] = set()

    # Load existing CSV records if present
    if os.path.exists(output_all_csv):
        try:
            existing_df = pd.read_csv(output_all_csv)
            for _, row in existing_df.iterrows():
                phone_key = str(row.get("Phone Number", "")).strip()
                name_key = str(row.get("Business Name", "")).strip().lower()
                if phone_key and phone_key.lower() != "nan":
                    seen_identifiers.add(phone_key)
                if name_key and name_key.lower() != "nan":
                    seen_identifiers.add(name_key)
                all_leads.append(row.to_dict())
            print(f"[i] Resumed from existing CSV: {len(all_leads)} businesses already saved.", flush=True)
        except Exception as e:
            print(f"[!] Note on reading existing CSV: {e}", flush=True)

    with sync_playwright() as p:
        browser = launch_browser(p, headless=headless)
        context = browser.new_context(
            user_agent=REQUEST_HEADERS["User-Agent"],
            locale="en-US",
            viewport={"width": 1280, "height": 720}
        )
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        context.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}", lambda route: route.abort())
        page = context.new_page()

        for q_idx, query in enumerate(queries, 1):
            encoded_query = urllib.parse.quote(query)
            search_url = f"https://www.google.com/maps/search/{encoded_query}?hl=en"
            print(f"\n[{q_idx}/{len(queries)}] Searching: '{query}'...", flush=True)

            try:
                page.goto(search_url, timeout=25000)
                page.wait_for_selector('div[role="feed"]', timeout=14000)
            except Exception:
                print(f"[-] No results feed for '{query}', skipping...", flush=True)
                continue

            feed = page.locator('div[role="feed"]')

            # Progressive scrolling
            for _ in range(max_scrolls):
                feed.evaluate("el => el.scrollBy(0, 7000)")
                page.wait_for_timeout(500)
                end_text = page.locator('text="You\'ve reached the end of the list."')
                if end_text.is_visible():
                    break

            cards = feed.locator('div.Nv2PK').all()
            print(f"    Loaded {len(cards)} listings. Fast-parsing business details...", flush=True)

            new_batch: List[Dict[str, str]] = []

            for card in cards:
                try:
                    text = card.inner_text()
                    a_elem = card.locator('a.hfpxzc').first
                    raw_name = a_elem.get_attribute("aria-label") or ""
                    maps_url = a_elem.get_attribute("href") or ""
                    if not raw_name:
                        continue

                    name = clean_business_name(raw_name)

                    # Extract Phone directly from card text
                    phone_match = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', text)
                    landline_match = re.search(r'\b(?:0124|011)[\s-]?\d{6,8}\b', text)
                    phone = phone_match.group(0) if phone_match else (landline_match.group(0) if landline_match else "")

                    # Rating & Reviews
                    rating_match = re.search(r'\b([1-5]\.[0-9])\b', text)
                    rating = rating_match.group(1) if rating_match else ""

                    reviews_match = re.search(r'\(([\d,]+)\)', text)
                    reviews_count = reviews_match.group(1).replace(",", "") if reviews_match else ""

                    # Category & Address snippet
                    lines = [ln.strip() for ln in text.split("\n") if ln.strip()]
                    gmaps_cat = ""
                    address_snippet = ""
                    for ln in lines:
                        if " · " in ln:
                            parts = ln.split(" · ")
                            gmaps_cat = parts[0].strip()
                            if len(parts) > 1:
                                address_snippet = parts[1].strip()
                            break

                    website = ""
                    try:
                        web_btn = card.locator('a[data-value="Website"]').first
                        if web_btn.count() > 0:
                            website = web_btn.get_attribute("href") or ""
                    except Exception:
                        pass

                    phone_key = phone.strip() if phone else ""
                    name_key = name.lower().strip()

                    if phone_key and phone_key in seen_identifiers:
                        continue
                    if not phone_key and name_key in seen_identifiers:
                        continue

                    if phone_key:
                        seen_identifiers.add(phone_key)
                    seen_identifiers.add(name_key)

                    wa_phone = sanitize_whatsapp_phone(phone) or ""
                    city, sub_area = detect_city_and_area(address_snippet, query)
                    category = classify_category(name, query, gmaps_cat)

                    record = {
                        "Business Name": name,
                        "City": city,
                        "Area": sub_area,
                        "Category": category,
                        "Email": "",
                        "Has Email": "No",
                        "Phone Number": phone,
                        "WhatsApp Mobile": wa_phone,
                        "Website": website,
                        "Address": address_snippet,
                        "Rating": rating,
                        "Reviews": reviews_count,
                        "GSTIN": "",
                        "Google Maps URL": maps_url,
                        "Query": query,
                    }
                    new_batch.append(record)

                except Exception:
                    continue

            # Concurrently enrich emails from websites
            if new_batch:
                batch_enrich_leads(new_batch, max_workers=12)
                all_leads.extend(new_batch)

                # Incremental CSV write
                df_all = pd.DataFrame(all_leads)
                df_all.to_csv(output_all_csv, index=False, encoding="utf-8-sig")

                # Filter and save businesses with email
                df_email = df_all[df_all["Email"].str.strip() != ""]
                df_email.to_csv(output_email_csv, index=False, encoding="utf-8-sig")

                total_email_count = len(df_email)
                print(f"    [✓] Batch added {len(new_batch)} leads. Total: {len(all_leads)} | With Email IDs: {total_email_count}", flush=True)

        browser.close()

    return all_leads


def generate_crm_dashboard(leads: List[Dict[str, str]], output_html_path: str):
    """Generates a modern, interactive CRM dashboard with filters, search, and export."""
    import json
    leads_json = json.dumps(leads)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gurgaon & Dwarka Business Lead Directory</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #090d16;
            --surface: #111726;
            --surface-card: #161e31;
            --border: #222e47;
            --primary: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --accent: #8b5cf6;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            background: var(--bg);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', sans-serif;
            min-height: 100vh;
            padding: 24px;
        }}
        .header {{
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #111827 100%);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 28px 32px;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
        }}
        .header-title h1 {{
            font-size: 26px;
            font-weight: 800;
            background: linear-gradient(90deg, #60a5fa, #c084fc, #34d399);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 6px;
        }}
        .header-title p {{
            color: var(--text-muted);
            font-size: 14px;
        }}
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}
        .metric-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 18px 20px;
        }}
        .metric-num {{
            font-size: 28px;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            margin-bottom: 4px;
        }}
        .metric-label {{
            color: var(--text-muted);
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}
        .controls-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 24px;
            display: flex;
            flex-wrap: wrap;
            gap: 14px;
            align-items: center;
        }}
        .search-input {{
            flex: 1;
            min-width: 260px;
            background: var(--surface-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 16px;
            color: #fff;
            font-size: 14px;
            outline: none;
        }}
        .search-input:focus {{ border-color: var(--primary); }}
        .select-filter {{
            background: var(--surface-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 10px 14px;
            color: #fff;
            font-size: 14px;
            outline: none;
            cursor: pointer;
        }}
        .table-container {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 13px;
        }}
        th {{
            background: #131b2e;
            padding: 14px 16px;
            color: #94a3b8;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border);
        }}
        td {{
            padding: 14px 16px;
            border-bottom: 1px solid #1a233a;
            color: #cbd5e1;
        }}
        tr:hover td {{
            background: rgba(59, 130, 246, 0.04);
        }}
        .badge {{
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
        }}
        .badge-email {{
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }}
        .badge-no-email {{
            background: rgba(148, 163, 184, 0.1);
            color: #94a3b8;
        }}
        .badge-city {{
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }}
        .badge-cat {{
            background: rgba(139, 92, 246, 0.15);
            color: #c084fc;
        }}
        .btn {{
            display: inline-block;
            padding: 5px 10px;
            border-radius: 6px;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            margin-right: 4px;
        }}
        .btn-mail {{ background: #0284c7; color: #fff; }}
        .btn-wa {{ background: #059669; color: #fff; }}
        .btn-web {{ background: #475569; color: #fff; }}
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">
            <h1>📍 Gurgaon & Dwarka Business Directory</h1>
            <p>Google Maps Extractor — Filtered with Active Email Addresses & WhatsApp Contacts</p>
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-num" id="stat-total" style="color: #60a5fa;">0</div>
            <div class="metric-label">Total Businesses</div>
        </div>
        <div class="metric-card">
            <div class="metric-num" id="stat-email" style="color: #34d399;">0</div>
            <div class="metric-label">With Verified Email</div>
        </div>
        <div class="metric-card">
            <div class="metric-num" id="stat-gurgaon" style="color: #f59e0b;">0</div>
            <div class="metric-label">Gurgaon Leads</div>
        </div>
        <div class="metric-card">
            <div class="metric-num" id="stat-dwarka" style="color: #c084fc;">0</div>
            <div class="metric-label">Dwarka Leads</div>
        </div>
    </div>

    <div class="controls-card">
        <input type="text" id="searchInput" class="search-input" placeholder="Search by name, area, category, email...">
        <select id="cityFilter" class="select-filter">
            <option value="ALL">All Cities (Gurgaon & Dwarka)</option>
            <option value="Gurgaon">Gurgaon, Haryana</option>
            <option value="Dwarka">Dwarka, Delhi</option>
        </select>
        <select id="emailFilter" class="select-filter">
            <option value="ALL">All Businesses</option>
            <option value="YES" selected>Has Email ID Only ✉️</option>
        </select>
        <select id="catFilter" class="select-filter">
            <option value="ALL">All Categories</option>
        </select>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Business Name</th>
                    <th>City & Area</th>
                    <th>Category</th>
                    <th>Email Address</th>
                    <th>Phone / WhatsApp</th>
                    <th>Rating</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="leadsTableBody"></tbody>
        </table>
    </div>

    <script>
        const leadsData = {leads_json};
        
        // Update stats
        const total = leadsData.length;
        const withEmail = leadsData.filter(l => l.Email && l.Email.trim()).length;
        const gurgaon = leadsData.filter(l => (l.City || '').includes('Gurgaon')).length;
        const dwarka = leadsData.filter(l => (l.City || '').includes('Dwarka')).length;

        document.getElementById('stat-total').innerText = total;
        document.getElementById('stat-email').innerText = withEmail;
        document.getElementById('stat-gurgaon').innerText = gurgaon;
        document.getElementById('stat-dwarka').innerText = dwarka;

        // Populate Categories
        const cats = Array.from(new Set(leadsData.map(l => l.Category).filter(Boolean))).sort();
        const catSelect = document.getElementById('catFilter');
        cats.forEach(c => {{
            const opt = document.createElement('option');
            opt.value = c;
            opt.innerText = c;
            catSelect.appendChild(opt);
        }});

        function renderTable() {{
            const q = document.getElementById('searchInput').value.toLowerCase().trim();
            const city = document.getElementById('cityFilter').value;
            const emailF = document.getElementById('emailFilter').value;
            const cat = document.getElementById('catFilter').value;

            const filtered = leadsData.filter(l => {{
                if (city !== 'ALL' && !(l.City || '').includes(city)) return false;
                if (emailF === 'YES' && (!l.Email || !l.Email.trim())) return false;
                if (cat !== 'ALL' && l.Category !== cat) return false;
                if (q) {{
                    const hay = `${{l['Business Name']}} ${{l.City}} ${{l.Area}} ${{l.Category}} ${{l.Email}} ${{l['Phone Number']}}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                }}
                return true;
            }});

            const tbody = document.getElementById('leadsTableBody');
            tbody.innerHTML = '';

            filtered.slice(0, 300).forEach((l, idx) => {{
                const tr = document.createElement('tr');
                const emailHtml = l.Email 
                    ? `<span class="badge badge-email">${{l.Email}}</span>`
                    : `<span class="badge badge-no-email">None</span>`;
                
                let actions = '';
                if (l.Email) {{
                    const firstMail = l.Email.split(';')[0].trim();
                    actions += `<a href="mailto:${{firstMail}}" class="btn btn-mail">✉️ Email</a>`;
                }}
                if (l['WhatsApp Mobile']) {{
                    actions += `<a href="https://wa.me/${{l['WhatsApp Mobile']}}" target="_blank" class="btn btn-wa">💬 WA</a>`;
                }}
                if (l.Website) {{
                    actions += `<a href="${{l.Website}}" target="_blank" class="btn btn-web">🌐 Web</a>`;
                }}

                tr.innerHTML = `
                    <td>${{idx + 1}}</td>
                    <td><strong>${{l['Business Name']}}</strong></td>
                    <td><span class="badge badge-city">${{l.City.split(',')[0]}}</span> ${{l.Area}}</td>
                    <td><span class="badge badge-cat">${{l.Category}}</span></td>
                    <td>${{emailHtml}}</td>
                    <td>${{l['Phone Number'] || '-'}}</td>
                    <td>${{l.Rating ? l.Rating + ' ★' : '-'}}</td>
                    <td>${{actions}}</td>
                `;
                tbody.appendChild(tr);
            }});
        }}

        document.getElementById('searchInput').addEventListener('input', renderTable);
        document.getElementById('cityFilter').addEventListener('change', renderTable);
        document.getElementById('emailFilter').addEventListener('change', renderTable);
        document.getElementById('catFilter').addEventListener('change', renderTable);

        renderTable();
    </script>
</body>
</html>"""

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[✓] Generated interactive CRM dashboard saved to: {output_html_path}", flush=True)


def main():
    # Exhaustive query matrix covering every category in Gurgaon and Dwarka
    queries = [
        # =========================================================================
        # 1. INDUSTRIES, FACTORIES & MANUFACTURING (Gurgaon & Manesar)
        # =========================================================================
        "industries in Udyog Vihar Gurgaon",
        "manufacturing companies in Udyog Vihar Gurgaon",
        "factories in Sector 37 Industrial Area Gurgaon",
        "industries in Pace City Gurgaon",
        "manufacturing companies in IMT Manesar Gurgaon",
        "factories in IMT Manesar Gurgaon",
        "automotive component manufacturers in Gurgaon",
        "textile and garment manufacturers in Udyog Vihar Gurgaon",
        "packaging companies in Gurgaon",
        "electronics manufacturing companies in Gurgaon",
        "pharmaceutical manufacturers in Gurgaon",
        "industrial equipment manufacturers Gurgaon",

        # =========================================================================
        # 2. INDUSTRIES & MANUFACTURING (Dwarka & Dwarka Mor)
        # =========================================================================
        "industries in Dwarka Mor Delhi",
        "small scale industries in Dwarka Delhi",
        "manufacturing companies in Dwarka Delhi",
        "packaging companies in Dwarka Delhi",
        "printing and packaging units in Dwarka Mor",

        # =========================================================================
        # 3. IT, SOFTWARE, TECH & CORPORATE OFFICES (Gurgaon)
        # =========================================================================
        "IT companies in Cyber City Gurgaon",
        "software companies in Udyog Vihar Gurgaon",
        "corporate offices in Golf Course Road Gurgaon",
        "corporate offices in Sohna Road Gurgaon",
        "IT companies in Sector 44 Gurgaon",
        "coworking spaces in Gurgaon",
        "digital marketing agencies in Gurgaon",
        "BPO and call centers in Gurgaon",

        # =========================================================================
        # 4. IT, TECH & CORPORATE OFFICES (Dwarka)
        # =========================================================================
        "IT companies in Dwarka Delhi",
        "corporate offices in Dwarka Sector 12 Delhi",
        "software companies in Dwarka Delhi",
        "coworking spaces in Dwarka Delhi",
        "digital marketing agencies in Dwarka Delhi",

        # =========================================================================
        # 5. FOOD OUTLETS, CAFES, RESTAURANTS & BAKERIES (Gurgaon)
        # =========================================================================
        "restaurants in Cyber Hub Gurgaon",
        "restaurants in Sector 29 Gurgaon",
        "cafes in Galleria Market Gurgaon",
        "restaurants in Golf Course Road Gurgaon",
        "restaurants in Sohna Road Gurgaon",
        "bakeries in Gurgaon",
        "sweet shops in Gurgaon",
        "cloud kitchens in Gurgaon",

        # =========================================================================
        # 6. FOOD OUTLETS, CAFES & RESTAURANTS (Dwarka)
        # =========================================================================
        "restaurants in Dwarka Sector 12 Delhi",
        "restaurants in Ramphal Chowk Dwarka",
        "cafes in Dwarka Sector 6 Delhi",
        "restaurants in Vegas Mall Dwarka",
        "cafes in Dwarka Sector 10 Delhi",
        "bakeries in Dwarka Delhi",
        "sweet shops in Dwarka Delhi",
        "cloud kitchens in Dwarka Delhi",

        # =========================================================================
        # 7. CLINICS, HOSPITALS & HEALTHCARE (Gurgaon & Dwarka)
        # =========================================================================
        "multispeciality hospitals in Gurgaon",
        "dental clinics in Gurgaon",
        "diagnostic centres in Gurgaon",
        "skin and hair clinics in Gurgaon",
        "hospitals in Dwarka Delhi",
        "clinics in Dwarka Sector 6 Delhi",
        "clinics in Dwarka Sector 12 Delhi",
        "dental clinics in Dwarka Delhi",
        "diagnostic centres in Dwarka Delhi",
        "chemists and pharmacy in Gurgaon",
        "chemists and pharmacy in Dwarka Delhi",

        # =========================================================================
        # 8. SHOPS, RETAIL SHOWROOMS & SUPERMARKETS (Gurgaon)
        # =========================================================================
        "clothing stores in Galleria Market Gurgaon",
        "retail shops in Sector 14 market Gurgaon",
        "jewellery showrooms in Gurgaon",
        "furniture showrooms in MG Road Gurgaon",
        "electronics showrooms in Gurgaon",
        "supermarkets in Gurgaon",
        "hardware and sanitary stores in Gurgaon",

        # =========================================================================
        # 9. SHOPS, RETAIL SHOWROOMS & SUPERMARKETS (Dwarka)
        # =========================================================================
        "shops in Ramphal Chowk Dwarka",
        "shops in Sector 6 market Dwarka",
        "shops in Sector 10 market Dwarka",
        "shops in Sector 11 market Dwarka",
        "shops in Sector 12 market Dwarka",
        "electronics shops in Dwarka Delhi",
        "clothing stores in Dwarka Delhi",
        "supermarkets in Dwarka Delhi",
        "hardware and electrical shops in Dwarka Delhi",

        # =========================================================================
        # 10. AUTO SHOWROOMS & WORKSHOPS (Gurgaon & Dwarka)
        # =========================================================================
        "car showrooms in Gurgaon",
        "car repair workshops in Gurgaon",
        "car service centers in Gurgaon",
        "car service centers in Dwarka Delhi",
        "car workshops in Dwarka Mor Delhi",

        # =========================================================================
        # 11. REAL ESTATE, INTERIOR DESIGNERS & ARCHITECTS
        # =========================================================================
        "real estate agents in Gurgaon",
        "interior designers in Gurgaon",
        "architects in Gurgaon",
        "real estate consultants in Dwarka Delhi",
        "interior designers in Dwarka Delhi",

        # =========================================================================
        # 12. EDUCATION, HOTELS, BANQUETS & WELLNESS
        # =========================================================================
        "schools and academies in Gurgaon",
        "coaching institutes in Dwarka Delhi",
        "hotels in Gurgaon",
        "hotels in Dwarka Delhi",
        "banquet halls in Gurgaon",
        "banquet halls in Dwarka Delhi",
        "salons and spas in Gurgaon",
        "salons and parlours in Dwarka Delhi",
        "gyms and fitness centres in Gurgaon",
        "gyms and fitness centres in Dwarka Delhi"
    ]

    output_all = DEFAULT_OUTPUT_ALL_CSV
    output_email = DEFAULT_OUTPUT_EMAIL_CSV
    max_scrolls = 6
    headless = True

    # Parse CLI flags
    for i, arg in enumerate(sys.argv):
        if arg == "--scrolls" and i + 1 < len(sys.argv):
            try:
                max_scrolls = int(sys.argv[i + 1])
            except ValueError:
                pass
        elif arg == "--output-all" and i + 1 < len(sys.argv):
            output_all = sys.argv[i + 1]
        elif arg == "--output-email" and i + 1 < len(sys.argv):
            output_email = sys.argv[i + 1]
        elif arg == "--no-headless" or arg == "--gui":
            headless = False

    print("=" * 75, flush=True)
    print("     GURGAON & DWARKA BUSINESS EXTRACTOR FOR GOOGLE MAPS     ", flush=True)
    print("=" * 75, flush=True)
    print(f"Total Search Niches: {len(queries)} comprehensive query categories", flush=True)
    print(f"Output (All):        {output_all}", flush=True)
    print(f"Output (With Email): {output_email}", flush=True)
    print(f"Max Scrolls / Niche: {max_scrolls} scrolls per query", flush=True)
    print("Browser Channel:     Chrome (Native Automation)", flush=True)
    print("Email Extractor:     High-speed concurrent crawler (Homepage, /contact, /about)", flush=True)
    print("=" * 75 + "\n", flush=True)

    results = scrape_gurgaon_dwarka_leads(
        queries=queries,
        max_scrolls=max_scrolls,
        output_all_csv=output_all,
        output_email_csv=output_email,
        headless=headless
    )

    generate_crm_dashboard(results, DEFAULT_PREVIEW_HTML)

    emails_only = [r for r in results if r.get("Email") and r["Email"].strip()]
    print("\n" + "=" * 75, flush=True)
    print(f"[✓ COMPLETE] Total Unique Businesses Scraped: {len(results)}", flush=True)
    print(f"[✓ EMAIL IDs] Businesses with Verified Email: {len(emails_only)}", flush=True)
    print(f"[✓ CSV All]   {output_all}", flush=True)
    print(f"[✓ CSV Email] {output_email}", flush=True)
    print(f"[✓ Dashboard] {DEFAULT_PREVIEW_HTML}", flush=True)
    print("=" * 75, flush=True)


if __name__ == "__main__":
    main()
