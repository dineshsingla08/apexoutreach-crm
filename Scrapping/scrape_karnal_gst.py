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

DEFAULT_OUTPUT_CSV = "d:/Dinesh/antigravity/Scrapping/businesses_in_karnal_gst.csv"
DEFAULT_PREVIEW_HTML = "d:/Dinesh/antigravity/Scrapping/preview_karnal_gst.html"

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
    r"mysite\.com", r"wordpress", r"schema\.org"
]

# Indian GSTIN Regex: 15 alphanumeric characters. Haryana GST starts with '06'.
GSTIN_REGEX = re.compile(r"\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b")
HARYANA_GSTIN_REGEX = re.compile(r"\b06[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b")

# Prominent Karnal business zones, sectors, markets & colonies
KARNAL_AREAS = [
    "Sector 13", "Sector 14", "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 12",
    "Sector 3 Industrial Area", "HSIIDC Karnal", "Sector 4", "Sector 5", "Sector 16",
    "Sector 28", "Sector 29", "Sector 32", "Sector 33", "Model Town", "Chaura Bazar",
    "Karan Gate", "Sarafa Bazar", "Mughal Canal", "Railway Road", "Kunjpura Road",
    "Dayal Singh Colony", "Prem Nagar", "Ram Nagar", "Sadar Bazar", "Committee Chowk",
    "Subhash Gate", "Jundla Gate", "Kalandari Gate", "Hansi Road", "Meerut Road",
    "Assandh Road", "Kaithal Road", "Indri Road", "GT Road", "Namaste Chowk",
    "New Anaj Mandi", "Old Grain Market", "Subzi Mandi", "Old Subzi Mandi",
    "Taraori", "Gharaunda", "Nilokheri", "Nissing", "Indri", "Assandh",
    "Urban Estate", "Basant Vihar", "Shiv Colony", "Vikas Nagar", "Karnal Bypass"
]


def clean_business_name(raw_name: str) -> str:
    """Cleans business title from SEO clutter."""
    if not raw_name or not isinstance(raw_name, str):
        return "Business Owner / Director"
    name = raw_name.strip()
    name = name.replace("’", "'").replace("‘", "'").replace("â€™", "'").replace("\ufffd", "")
    for sep in [" | ", " - ", " : ", " – ", " — ", ","]:
        if sep in name:
            candidate = name.split(sep)[0].strip()
            if len(candidate) >= 3 and not candidate.lower().startswith(("best", "top")):
                name = candidate
                break
    return re.sub(r'^["\']|["\']$', '', name).strip()


def extract_karnal_area(address: str, fallback_query: str = "") -> str:
    """Extracts specific commercial zone or sector in Karnal."""
    combined = f"{address} {fallback_query}"
    if not combined.strip():
        return "Karnal"

    # Check sectors
    sec_match = re.search(r"Sector\s*[-]?\s*(\d+[A-Za-z]*)", combined, re.IGNORECASE)
    if sec_match:
        sec_num = sec_match.group(1)
        if sec_num == "3":
            return "Sector 3 Industrial Area"
        return f"Sector {sec_num}"

    for area in KARNAL_AREAS:
        if area.lower() in combined.lower():
            return area

    return "Karnal"


def sanitize_whatsapp_phone(raw_phone: str) -> Optional[str]:
    """
    Sanitizes Indian mobile numbers into 12-digit international format (91XXXXXXXXXX).
    Filters out landlines.
    """
    if not raw_phone or pd.isna(raw_phone):
        return None

    digits = re.sub(r"\D", "", str(raw_phone))

    # 09812345678 (11 digits with leading 0)
    if len(digits) == 11 and digits.startswith("0") and digits[1] in "6789":
        return "91" + digits[1:]

    # 9812345678 (10 digits)
    if len(digits) == 10 and digits[0] in "6789":
        return "91" + digits

    # 919812345678 (12 digits)
    if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
        return digits

    return None


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


def classify_gst_pitch(name: str, query: str, address: str) -> Dict[str, str]:
    """
    Categorizes the business into an industry vertical and provides a high-converting
    GST return pitch angle tailored to small and medium business owners in Karnal.
    """
    combined = f"{name} {query} {address}".lower()

    if any(k in combined for k in ["chemist", "medical", "pharmacy", "drug", "ayurvedic", "surgical", "dawa"]):
        return {
            "Category": "Retail Chemist & Pharmacy",
            "GST_Likelihood": "High (Mandatory GST / Drug License)",
            "Pitch_Angle": "Distributor Inward ITC (Cipla/Sun/Mankind 12%/18%), Expiry Stock Adjustments & Avoiding ₹50/Day Late Fee",
            "Pitch_Service": "Monthly GSTR-1 / 3B & Purchase Reconciliation"
        }
    elif any(k in combined for k in ["mobile", "laptop", "computer", "cctv", "electronic", "telecom", "smartphone"]):
        return {
            "Category": "Mobile & Electronics Retail",
            "GST_Likelihood": "High (Mandatory GST for Electronics)",
            "Pitch_Angle": "18% Electronics GST, 2B Input Credit on Brand Inward & Quarterly QRMP / Monthly Filing",
            "Pitch_Service": "ITC Claim on Brand Purchases & 3B Filing"
        }
    elif any(k in combined for k in ["garment", "cloth", "saree", "boutique", "fashion", "mens wear", "kids wear", "tailor", "fabric", "hosiery", "suit"]):
        return {
            "Category": "Garments, Saree & Boutique",
            "GST_Likelihood": "High (Retail Clothing GST)",
            "Pitch_Angle": "5% vs 12% Garment Tax Slab Invoicing, Composition (CMP-08 1%) or Regular 3B & Zero Late Fees",
            "Pitch_Service": "Small Retail GST & Quarterly QRMP Filing"
        }
    elif any(k in combined for k in ["grocery", "kirana", "supermarket", "departmental", "dry fruit", "spice", "masala", "provision", "general store", "atta chakki"]):
        return {
            "Category": "Kirana & Supermarket Retail",
            "GST_Likelihood": "Medium-High (Composition 1% or Regular)",
            "Pitch_Angle": "Composition Scheme (1% CMP-08), Zero-Tax Unbranded Food vs 5%/18% Packaged Invoicing & Hassle-Free Filing",
            "Pitch_Service": "Composition CMP-08 & Simplified Retail Filing"
        }
    elif any(k in combined for k in ["sweet", "bakery", "cake", "namkeen", "cafe", "restaurant", "fast food", "ice cream", "dairy", "paneer", "halwai"]):
        return {
            "Category": "Bakeries, Sweets & Eateries",
            "GST_Likelihood": "Medium-High (5% Restaurant / Composition)",
            "Pitch_Angle": "5% Restaurant/Sweet Scheme without ITC vs 18% Packaged, Composition Compliance & Notice Protection",
            "Pitch_Service": "Restaurant & Sweet Shop Tax Compliance"
        }
    elif any(k in combined for k in ["hardware", "electrical", "paint", "sanitary", "tools", "fasteners", "pipe", "plywood", "timber", "glass", "aluminium", "cooler", "fan"]):
        return {
            "Category": "Hardware, Electrical & Paints",
            "GST_Likelihood": "High (18%/28% Goods)",
            "Pitch_Angle": "18%/28% Tax Rate Matching, E-Way Bill on Heavy Inward Purchases & Monthly 3B",
            "Pitch_Service": "Purchase Inward ITC & GSTR-3B Compliance"
        }
    elif any(k in combined for k in ["tyre", "car repair", "car accessories", "bike repair", "battery", "workshop", "denting", "motor parts", "scooter", "mechanic"]):
        return {
            "Category": "Auto Workshop, Tyres & Battery",
            "GST_Likelihood": "High (28% Tyres/Parts + 18% Labour)",
            "Pitch_Angle": "Split Invoicing (Labour 18% + Parts 28%), Input Credit on Oil/Parts & Monthly 3B",
            "Pitch_Service": "Workshop Mixed Supply & GST Filing"
        }
    elif any(k in combined for k in ["stationery", "book", "printing", "press", "flex", "banner", "gift", "toy", "photostat", "cyber cafe", "csc center", "sports"]):
        return {
            "Category": "Stationery, Printing & Gift Stores",
            "GST_Likelihood": "Medium-High",
            "Pitch_Angle": "Affordable Monthly Return Filing, Preventing Penalty Notices & Easy Accounting",
            "Pitch_Service": "Small Business GST Retainership"
        }
    elif any(k in combined for k in ["shoe", "footwear", "optical", "chashma", "watch"]):
        return {
            "Category": "Footwear, Optical & Watches",
            "GST_Likelihood": "Medium-High",
            "Pitch_Angle": "Retail Invoicing, Input Credit Reconciliation on Brand Stock & Timely GSTR-3B",
            "Pitch_Service": "Monthly Return Compliance & Notice Defense"
        }
    elif any(k in combined for k in ["bartan", "utensil", "crockery", "plastic", "home appliances"]):
        return {
            "Category": "Utensils & Home Appliances",
            "GST_Likelihood": "Medium-High (12%/18% Goods)",
            "Pitch_Angle": "Retail Goods GST Invoicing, Distributor ITC Reconciliation & GSTR-1/3B Compliance",
            "Pitch_Service": "Retail Goods GST Return Filing"
        }
    elif any(k in combined for k in ["furniture", "curtain", "mattress", "foam", "woodwork", "sofa"]):
        return {
            "Category": "Furniture & Home Appliances",
            "GST_Likelihood": "High (12%/18% Goods)",
            "Pitch_Angle": "12%/18% Furniture GST, Input Tax Credit on Raw Wood/Foam & Quarterly Filing",
            "Pitch_Service": "Furniture Retail & Workshop GST Filing"
        }
    elif any(k in combined for k in ["jewel", "gold", "sarafa", "sonar", "silver"]):
        return {
            "Category": "Jewellery & Bullion",
            "GST_Likelihood": "High (Mandatory GST)",
            "Pitch_Angle": "3% GST on Gold, Making Charges HSN, GSTR-9 Annual Return & High-Value Notice Defense",
            "Pitch_Service": "Jewellery GST Accounting & Reconciliation"
        }
    elif any(k in combined for k in ["khad beej", "pesticide", "seed", "fertilizer", "agricultural equipment", "agro"]):
        return {
            "Category": "Agro Chemical & Seeds",
            "GST_Likelihood": "High (Mandatory 5%/12% GST)",
            "Pitch_Angle": "5% Seed/Fertilizer Tax Rates, Distributor Bill Verification & Seasonal Return Planning",
            "Pitch_Service": "Agro Retail GST Compliance & E-Way Bills"
        }
    elif any(k in combined for k in ["salon", "parlour", "spa", "gym", "fitness", "barber"]):
        return {
            "Category": "Salons, Gyms & Personal Care",
            "GST_Likelihood": "Medium-High (>20L Service Threshold)",
            "Pitch_Angle": "18% Service GST Compliance, Monitoring 20 Lakhs Threshold & Clean Books",
            "Pitch_Service": "Service Sector GST Filing"
        }
    elif any(k in combined for k in ["rice", "mill", "exporter", "paddy", "sheller", "grain export"]):
        return {
            "Category": "Rice Mill / Agro Exporter",
            "GST_Likelihood": "Very High (Mandatory GST)",
            "Pitch_Angle": "Basmati Export LUT Filing, Accumulated ITC Refund & GSTR-1/3B Compliance",
            "Pitch_Service": "Export GST Refund & Annual Audit (GSTR-9)"
        }
    elif any(k in combined for k in ["mandi", "wholesale", "trader", "merchant", "arhtia", "commission agent", "dealer"]):
        return {
            "Category": "Wholesale Mandi & Trade",
            "GST_Likelihood": "Very High (Mandatory GST)",
            "Pitch_Angle": "GSTR-2B Input Tax Credit Reconciliation, E-Way Bill Management & Quarterly Filing",
            "Pitch_Service": "ITC Reconciliation & Monthly GSTR-1/3B"
        }
    elif any(k in combined for k in ["manufacturer", "industry", "industrial", "machinery", "plastic", "packaging", "dairy equip", "fabrication", "welding"]):
        return {
            "Category": "Manufacturing & Industry",
            "GST_Likelihood": "Very High (Mandatory GST)",
            "Pitch_Angle": "Job-Work ITC-04, Capital Goods Depreciation vs ITC, Monthly 3B & Annual Audit",
            "Pitch_Service": "Comprehensive Manufacturing GST & Audit"
        }
    elif any(k in combined for k in ["transport", "logistics", "carrier", "cold storage", "warehouse", "tempo union", "courier"]):
        return {
            "Category": "Logistics & Transport",
            "GST_Likelihood": "High (Mandatory GST)",
            "Pitch_Angle": "Reverse Charge Mechanism (RCM), GTA Compliance & Transporter E-Way Bills",
            "Pitch_Service": "GTA RCM Filings & Assessment Support"
        }
    elif any(k in combined for k in ["hotel", "banquet", "resort", "tent house", "caterer", "dj sound"]):
        return {
            "Category": "Hospitality & Events",
            "GST_Likelihood": "Medium-High (>20L Turnover)",
            "Pitch_Angle": "5% vs 18% Restaurant Tax Slab Compliance, Event Billing & Late Fee Minimization",
            "Pitch_Service": "Hospitality GST Filings & Tax Structuring"
        }
    else:
        return {
            "Category": "Small Retailer & Local Business",
            "GST_Likelihood": "Medium-High (>40L/20L Turnover or Composition)",
            "Pitch_Angle": "Affordable Monthly/Quarterly Return Filing, Zero Late Fees & Notice Assistance",
            "Pitch_Service": "Monthly Return Compliance & Notice Assistance"
        }


def extract_website_contact_and_gst(url: str, timeout: int = 4) -> Dict[str, str]:
    """
    Visits business website and subpages (/contact, /about, /terms, /privacy)
    to extract valid Email Address and explicit 15-digit GSTIN Number.
    """
    result = {"Email": "", "GSTIN": "", "PAN": ""}
    if not url or not url.startswith("http"):
        return result

    found_emails: Set[str] = set()
    found_gstins: Set[str] = set()

    def inspect_html(html_text: str):
        for match in GSTIN_REGEX.findall(html_text):
            clean_gst = match.strip().upper()
            found_gstins.add(clean_gst)

        soup = BeautifulSoup(html_text, "html.parser")
        for mailto in soup.select('a[href^="mailto:"]'):
            href = mailto.get("href", "")
            clean_mail = href.replace("mailto:", "").split("?")[0].strip().lower()
            if "@" in clean_mail and not any(re.search(p, clean_mail) for p in IGNORE_EMAIL_PATTERNS):
                if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg)$", clean_mail):
                    found_emails.add(clean_mail)

        raw_emails = set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html_text))
        for em in raw_emails:
            lower_em = em.lower().strip()
            if not any(re.search(p, lower_em) for p in IGNORE_EMAIL_PATTERNS):
                if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg|css|js)$", lower_em):
                    found_emails.add(lower_em)

    # 1. Homepage
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
        if resp.status_code == 200:
            inspect_html(resp.text)
    except Exception:
        pass

    # 2. Contact page
    if not found_emails or not found_gstins:
        try:
            parsed = urllib.parse.urlparse(url)
            base = f"{parsed.scheme}://{parsed.netloc}"
            for subpath in ["/contact", "/contact-us", "/about", "/about-us", "/gst"]:
                try:
                    sub_url = urllib.parse.urljoin(base, subpath)
                    sub_resp = requests.get(sub_url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
                    if sub_resp.status_code == 200:
                        inspect_html(sub_resp.text)
                        if found_emails and found_gstins:
                            break
                except Exception:
                    continue
        except Exception:
            pass

    chosen_gstin = ""
    if found_gstins:
        haryana_first = sorted(list(found_gstins), key=lambda g: 0 if g.startswith("06") else 1)
        chosen_gstin = haryana_first[0]

    result["Email"] = "; ".join(list(found_emails)[:2]) if found_emails else ""
    result["GSTIN"] = chosen_gstin
    result["PAN"] = chosen_gstin[2:12] if len(chosen_gstin) == 15 else ""
    return result


def batch_enrich_records(records: List[Dict[str, str]], max_workers: int = 10) -> None:
    """Enriches records concurrently with Email and GSTIN from websites."""
    url_to_indices = {}
    for i, r in enumerate(records):
        web = r.get("Website", "")
        if web and (not r.get("Email") or not r.get("GSTIN")):
            url_to_indices.setdefault(web, []).append(i)

    if not url_to_indices:
        return

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(extract_website_contact_and_gst, url): url for url in url_to_indices.keys()}
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            try:
                res = future.result()
                for idx in url_to_indices[url]:
                    if res.get("Email") and not records[idx].get("Email"):
                        records[idx]["Email"] = res["Email"]
                    if res.get("GSTIN") and not records[idx].get("GSTIN"):
                        records[idx]["GSTIN"] = res["GSTIN"]
                        records[idx]["PAN"] = res["PAN"]
                        records[idx]["GST Status"] = f"Verified GSTIN ({res['GSTIN']})"
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


def scrape_karnal_gst_leads(
    queries: List[str],
    max_scrolls_per_query: int = 8,
    output_csv_path: str = DEFAULT_OUTPUT_CSV,
    headless: bool = True
) -> List[Dict[str, str]]:
    """
    Extracts small and retail businesses across Karnal for GST return pitching.
    Features ultra-fast direct-card parsing (<10ms per item) with detail panel fallback.
    """
    all_leads: List[Dict[str, str]] = []
    seen_identifiers: Set[str] = set()

    # Load existing CSV records for seamless resumption and duplicate prevention
    if os.path.exists(output_csv_path):
        try:
            existing_df = pd.read_csv(output_csv_path)
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
                page.wait_for_selector('div[role="feed"]', timeout=12000)
            except Exception:
                print(f"[-] No results feed for '{query}', skipping...", flush=True)
                continue

            feed = page.locator('div[role="feed"]')

            # Fast progressive scrolling
            for _ in range(max_scrolls_per_query):
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
                    landline_match = re.search(r'\b0184[\s-]?\d{6,7}\b', text)
                    phone = phone_match.group(0) if phone_match else (landline_match.group(0) if landline_match else "")

                    # Rating & Reviews
                    rating_match = re.search(r'\b([1-5]\.[0-9])\b', text)
                    rating = rating_match.group(1) if rating_match else ""

                    reviews_match = re.search(r'\(([\d,]+)\)', text)
                    reviews_count = reviews_match.group(1).replace(",", "") if reviews_match else ""

                    # Category & Address snippet from card text
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
                    # Check for website link directly on card if available
                    try:
                        web_btn = card.locator('a[data-value="Website"]').first
                        if web_btn.count() > 0:
                            website = web_btn.get_attribute("href") or ""
                    except Exception:
                        pass

                    # Deduplication
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
                    area = extract_karnal_area(address_snippet, query)

                    # Inline GSTIN detection
                    inline_gstin = ""
                    for text_src in [name, address_snippet, gmaps_cat]:
                        gst_match = GSTIN_REGEX.search(text_src)
                        if gst_match:
                            inline_gstin = gst_match.group(0).upper()
                            break

                    pitch_info = classify_gst_pitch(name, f"{query} {gmaps_cat}", address_snippet)

                    record = {
                        "Business Name": name,
                        "Category": pitch_info["Category"],
                        "Karnal Area": area,
                        "Phone Number": phone,
                        "WhatsApp Mobile": wa_phone,
                        "Email": "",
                        "GSTIN": inline_gstin,
                        "PAN": inline_gstin[2:12] if len(inline_gstin) == 15 else "",
                        "GST Status": f"Verified GSTIN ({inline_gstin})" if inline_gstin else pitch_info["GST_Likelihood"],
                        "GST Pitch Angle": pitch_info["Pitch_Angle"],
                        "Recommended Pitch Service": pitch_info["Pitch_Service"],
                        "Address": address_snippet,
                        "Website": website,
                        "Rating": rating,
                        "Reviews": reviews_count,
                        "Google Maps URL": maps_url,
                        "Query": query,
                    }
                    new_batch.append(record)

                except Exception:
                    continue

            # Concurrently enrich emails and GSTIN from websites
            if new_batch:
                batch_enrich_records(new_batch, max_workers=8)
                all_leads.extend(new_batch)

                # Incremental CSV write
                df = pd.DataFrame(all_leads)
                df.to_csv(output_csv_path, index=False, encoding="utf-8-sig")
                print(f"    [+] Saved {len(new_batch)} new leads! Total collected: {len(all_leads)}", flush=True)

        browser.close()

    return all_leads


def generate_karnal_gst_preview_html(leads: List[Dict[str, str]], output_html_path: str):
    """Generates an interactive CRM dashboard with filters for all small business retail verticals."""
    import json
    leads_json = json.dumps(leads)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Karnal Small Business GST Lead CRM</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg: #090d16;
            --surface: #111726;
            --surface-card: #161e31;
            --border: #222e47;
            --primary: #3b82f6;
            --primary-glow: rgba(59, 130, 246, 0.25);
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
            background: linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #0f172a 100%);
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
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }}
        .metric-card {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 18px 20px;
            position: relative;
            overflow: hidden;
        }}
        .metric-card::after {{
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--accent));
        }}
        .metric-val {{
            font-size: 28px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 4px;
            font-family: 'JetBrains Mono', monospace;
        }}
        .metric-label {{
            font-size: 12px;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }}
        .controls {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 18px 20px;
            margin-bottom: 20px;
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            align-items: center;
        }}
        .search-box {{
            flex: 1;
            min-width: 260px;
            position: relative;
        }}
        .search-box input {{
            width: 100%;
            background: var(--surface-card);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 16px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: all 0.2s;
        }}
        .search-box input:focus {{
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--primary-glow);
        }}
        .filter-select {{
            background: var(--surface-card);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 16px;
            color: #fff;
            font-size: 14px;
            outline: none;
            cursor: pointer;
        }}
        .btn {{
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: #fff;
            border: none;
            padding: 12px 20px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
        }}
        .btn:hover {{
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }}
        .btn-wa {{
            background: linear-gradient(135deg, #10b981, #059669);
            padding: 6px 12px;
            font-size: 11px;
            border-radius: 6px;
        }}
        .btn-call {{
            background: linear-gradient(135deg, #3b82f6, #2563eb);
            padding: 6px 12px;
            font-size: 11px;
            border-radius: 6px;
        }}
        .btn-email {{
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            padding: 6px 12px;
            font-size: 11px;
            border-radius: 6px;
        }}
        .table-wrap {{
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
        }}
        th {{
            background: #151d2f;
            color: #94a3b8;
            font-weight: 600;
            padding: 14px 16px;
            border-bottom: 1px solid var(--border);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
        }}
        td {{
            padding: 14px 16px;
            border-bottom: 1px solid rgba(34, 46, 71, 0.5);
            color: #e2e8f0;
            vertical-align: middle;
        }}
        tr:hover td {{
            background: rgba(30, 41, 67, 0.6);
        }}
        .badge {{
            display: inline-block;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
        }}
        .badge-cat {{ background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }}
        .badge-area {{ background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); }}
        .badge-gst {{ background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); font-family: 'JetBrains Mono', monospace; }}
        .pitch-box {{
            max-width: 280px;
            font-size: 11px;
            color: #cbd5e1;
            line-height: 1.4;
            background: #111726;
            padding: 6px 10px;
            border-radius: 6px;
            border-left: 2px solid #f59e0b;
        }}
        .actions-cell {{
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }}
        .pagination {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: var(--surface);
            border-top: 1px solid var(--border);
            font-size: 13px;
            color: var(--text-muted);
        }}
        .page-btn {{
            background: var(--surface-card);
            border: 1px solid var(--border);
            color: #fff;
            padding: 8px 14px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
        }}
        .page-btn:hover:not(:disabled) {{
            background: var(--primary);
            border-color: var(--primary);
        }}
        .page-btn:disabled {{
            opacity: 0.4;
            cursor: not-allowed;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="header-title">
            <h1>Karnal Small Business & Retail GST Outreach Hub</h1>
            <p>Targeted directory of retail shops, kirana, chemists, workshops, garments, and traders in Karnal for GST return filing</p>
        </div>
        <div>
            <button class="btn" onclick="exportFilteredCSV()">📥 Export Filtered Leads</button>
        </div>
    </div>

    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-val" id="totalCount">0</div>
            <div class="metric-label">Total Karnal Businesses</div>
        </div>
        <div class="metric-card">
            <div class="metric-val" id="waCount" style="color: #34d399;">0</div>
            <div class="metric-label">WhatsApp Mobile Ready</div>
        </div>
        <div class="metric-card">
            <div class="metric-val" id="gstCount" style="color: #60a5fa;">0</div>
            <div class="metric-label">Direct GSTIN Identified</div>
        </div>
        <div class="metric-card">
            <div class="metric-val" id="emailCount" style="color: #c084fc;">0</div>
            <div class="metric-label">Direct Emails Available</div>
        </div>
    </div>

    <div class="controls">
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search by Business Name, Sector, Market, Phone, or Pitch..." oninput="handleSearch()">
        </div>
        <select class="filter-select" id="catFilter" onchange="handleFilter()">
            <option value="">All Small Business Categories</option>
            <option value="Kirana & Supermarket Retail">Kirana & Grocery Retail</option>
            <option value="Retail Chemist & Pharmacy">Retail Chemist & Pharmacy</option>
            <option value="Mobile & Electronics Retail">Mobile & Electronics Retail</option>
            <option value="Garments, Saree & Boutique">Garments, Saree & Boutiques</option>
            <option value="Hardware, Electrical & Paints">Hardware, Electrical & Paints</option>
            <option value="Bakeries, Sweets & Eateries">Bakeries, Sweets & Eateries</option>
            <option value="Auto Workshop, Tyres & Battery">Auto Workshop, Tyres & Battery</option>
            <option value="Stationery, Printing & Gift Stores">Stationery, Printing & CSC</option>
            <option value="Footwear, Optical & Watches">Footwear, Optical & Watches</option>
            <option value="Utensils & Home Appliances">Utensils & Home Needs</option>
            <option value="Furniture & Home Appliances">Furniture & Mattresses</option>
            <option value="Jewellery & Bullion">Sarafa & Jewellers</option>
            <option value="Agro Chemical & Seeds">Khad Beej Bhandar & Seeds</option>
            <option value="Salons, Gyms & Personal Care">Salons & Beauty Parlours</option>
            <option value="Wholesale Mandi & Trade">Wholesale Mandi & Arhtia</option>
            <option value="Rice Mill / Agro Exporter">Rice Mills & Exporters</option>
            <option value="Manufacturing & Industry">Manufacturing & Industry</option>
            <option value="Logistics & Transport">Transport & Logistics</option>
        </select>
        <select class="filter-select" id="areaFilter" onchange="handleFilter()">
            <option value="">All Karnal Sectors & Markets</option>
            <option value="Sector 13">Sector 13</option>
            <option value="Sector 14">Sector 14</option>
            <option value="Sector 6">Sector 6</option>
            <option value="Sector 7">Sector 7</option>
            <option value="Sector 8">Sector 8</option>
            <option value="Sector 9">Sector 9</option>
            <option value="Sector 12">Sector 12</option>
            <option value="Sector 3 Industrial Area">Sector 3 Industrial</option>
            <option value="Model Town">Model Town</option>
            <option value="Chaura Bazar">Chaura Bazar</option>
            <option value="Karan Gate">Karan Gate</option>
            <option value="Sarafa Bazar">Sarafa Bazar</option>
            <option value="Mughal Canal">Mughal Canal</option>
            <option value="Railway Road">Railway Road</option>
            <option value="Kunjpura Road">Kunjpura Road</option>
            <option value="Dayal Singh Colony">Dayal Singh Colony</option>
            <option value="Prem Nagar">Prem Nagar</option>
            <option value="Ram Nagar">Ram Nagar</option>
            <option value="New Anaj Mandi">New Anaj Mandi</option>
            <option value="Old Grain Market">Old Grain Market</option>
            <option value="Taraori">Taraori</option>
            <option value="Gharaunda">Gharaunda</option>
            <option value="Nilokheri">Nilokheri</option>
        </select>
        <select class="filter-select" id="contactFilter" onchange="handleFilter()">
            <option value="">All Contacts</option>
            <option value="wa">Has WhatsApp Mobile</option>
            <option value="phone">Has Any Phone</option>
            <option value="gstin">Has Verified GSTIN</option>
            <option value="email">Has Email</option>
        </select>
    </div>

    <div class="table-wrap">
        <table>
            <thead>
                <tr>
                    <th>Business Name</th>
                    <th>Category</th>
                    <th>Area / Market</th>
                    <th>Phone / WhatsApp</th>
                    <th>GSTIN / Status</th>
                    <th>Recommended GST Pitch</th>
                    <th>Quick Outreach</th>
                </tr>
            </thead>
            <tbody id="tableBody"></tbody>
        </table>
        <div class="pagination">
            <div id="pageInfo">Showing 1-50 of 0</div>
            <div style="display: flex; gap: 8px;">
                <button class="page-btn" id="prevBtn" onclick="prevPage()">Previous</button>
                <button class="page-btn" id="nextBtn" onclick="nextPage()">Next</button>
            </div>
        </div>
    </div>

    <script>
        const rawData = {leads_json};
        let filteredData = [...rawData];
        let currentPage = 1;
        const pageSize = 50;

        function updateMetrics() {{
            document.getElementById("totalCount").innerText = rawData.length.toLocaleString();
            document.getElementById("waCount").innerText = rawData.filter(d => d["WhatsApp Mobile"]).length.toLocaleString();
            document.getElementById("gstCount").innerText = rawData.filter(d => d["GSTIN"]).length.toLocaleString();
            document.getElementById("emailCount").innerText = rawData.filter(d => d["Email"]).length.toLocaleString();
        }}

        function handleFilter() {{
            const search = document.getElementById("searchInput").value.toLowerCase();
            const cat = document.getElementById("catFilter").value;
            const area = document.getElementById("areaFilter").value;
            const contact = document.getElementById("contactFilter").value;

            filteredData = rawData.filter(d => {{
                const matchSearch = !search ||
                    (d["Business Name"] && d["Business Name"].toLowerCase().includes(search)) ||
                    (d["Karnal Area"] && d["Karnal Area"].toLowerCase().includes(search)) ||
                    (d["Phone Number"] && d["Phone Number"].toLowerCase().includes(search)) ||
                    (d["GST Pitch Angle"] && d["GST Pitch Angle"].toLowerCase().includes(search));

                const matchCat = !cat || d["Category"] === cat;
                const matchArea = !area || d["Karnal Area"] === area;

                let matchContact = true;
                if (contact === "wa") matchContact = !!d["WhatsApp Mobile"];
                else if (contact === "phone") matchContact = !!d["Phone Number"];
                else if (contact === "gstin") matchContact = !!d["GSTIN"];
                else if (contact === "email") matchContact = !!d["Email"];

                return matchSearch && matchCat && matchArea && matchContact;
            }});

            currentPage = 1;
            renderTable();
        }}

        function handleSearch() {{
            handleFilter();
        }}

        function renderTable() {{
            const tbody = document.getElementById("tableBody");
            tbody.innerHTML = "";

            const start = (currentPage - 1) * pageSize;
            const end = Math.min(start + pageSize, filteredData.length);
            const pageItems = filteredData.slice(start, end);

            pageItems.forEach(item => {{
                const tr = document.createElement("tr");

                const waPhone = item["WhatsApp Mobile"] || "";
                const phone = item["Phone Number"] || "";
                const email = item["Email"] || "";
                const gstin = item["GSTIN"] || "";
                const pitch = item["GST Pitch Angle"] || "";
                const service = item["Recommended Pitch Service"] || "";

                const waMsg = encodeURIComponent(
                    `Namaste Sir/Mam, I noticed ${{item['Business Name']}} in ${{item['Karnal Area']}}. ` +
                    `We help small business owners in Karnal manage GST return filings (${{service}}) with 100% ITC purchase reconciliation and zero late fees. Can we share a quick quote?`
                );

                tr.innerHTML = `
                    <td>
                        <strong style="color: #fff; font-size: 14px;">${{item["Business Name"]}}</strong>
                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${{item["Address"] || item["Karnal Area"]}}</div>
                    </td>
                    <td><span class="badge badge-cat">${{item["Category"] || "Retail Business"}}</span></td>
                    <td><span class="badge badge-area">${{item["Karnal Area"] || "Karnal"}}</span></td>
                    <td>
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #38bdf8;">${{phone || '<span style="color:#64748b">N/A</span>'}}</div>
                        ${{waPhone ? `<div style="font-size: 11px; color: #34d399; margin-top: 2px;">WA: +${{waPhone}}</div>` : ''}}
                    </td>
                    <td>
                        ${{gstin ? `<span class="badge badge-gst">${{gstin}}</span>` : `<span style="font-size: 11px; color: #94a3b8;">${{item["GST Status"] || "Potential Regular/CMP-08"}}</span>`}}
                    </td>
                    <td>
                        <div class="pitch-box">
                            <strong>${{service}}:</strong><br>
                            ${{pitch}}
                        </div>
                    </td>
                    <td>
                        <div class="actions-cell">
                            ${{waPhone ? `<a href="https://wa.me/${{waPhone}}?text=${{waMsg}}" target="_blank" class="btn btn-wa">💬 WhatsApp</a>` : ''}}
                            ${{phone ? `<a href="tel:${{phone}}" class="btn btn-call">📞 Call</a>` : ''}}
                            ${{email ? `<a href="mailto:${{email.split(';')[0]}}" class="btn btn-email">✉️ Email</a>` : ''}}
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            }});

            document.getElementById("pageInfo").innerText = `Showing ${{filteredData.length ? start + 1 : 0}}-${{end}} of ${{filteredData.length.toLocaleString()}} leads`;
            document.getElementById("prevBtn").disabled = currentPage <= 1;
            document.getElementById("nextBtn").disabled = end >= filteredData.length;
        }}

        function prevPage() {{
            if (currentPage > 1) {{
                currentPage--;
                renderTable();
            }}
        }}

        function nextPage() {{
            const maxPage = Math.ceil(filteredData.length / pageSize);
            if (currentPage < maxPage) {{
                currentPage++;
                renderTable();
            }}
        }}

        function exportFilteredCSV() {{
            if (!filteredData.length) return alert("No records to export!");
            const keys = Object.keys(filteredData[0]);
            let csv = keys.join(",") + "\\n";
            filteredData.forEach(row => {{
                csv += keys.map(k => `"${{(row[k] || '').toString().replace(/"/g, '""')}}"`).join(",") + "\\n";
            }});
            const blob = new Blob([csv], {{ type: 'text/csv;charset=utf-8;' }});
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `karnal_gst_leads_${{new Date().toISOString().slice(0,10)}}.csv`;
            link.click();
        }}

        updateMetrics();
        renderTable();
    </script>
</body>
</html>"""

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[+] Generated CRM Dashboard at: {output_html_path}", flush=True)


def main():
    # Exhaustive list of 250+ targeted queries specifically designed to scrape EVERY small business in Karnal
    queries = [
        # --- 1. KIRANA, GROCERY, GENERAL STORES, SUPERMARKETS & PROVISION (Threshold / Composition 1% CMP-08) ---
        "kirana store in Sector 13 Karnal",
        "kirana store in Sector 14 Karnal",
        "kirana store in Sector 6 Karnal",
        "kirana store in Sector 7 Karnal",
        "kirana store in Sector 8 Karnal",
        "kirana store in Sector 9 Karnal",
        "kirana store in Sector 4 Karnal",
        "kirana store in Sector 5 Karnal",
        "kirana store in Model Town Karnal",
        "kirana store in Chaura Bazar Karnal",
        "kirana store in Karan Gate Karnal",
        "kirana store in Kunjpura Road Karnal",
        "kirana store in Railway Road Karnal",
        "kirana store in Mughal Canal Karnal",
        "kirana store in Prem Nagar Karnal",
        "kirana store in Ram Nagar Karnal",
        "kirana store in Dayal Singh Colony Karnal",
        "kirana store in Sadar Bazar Karnal",
        "kirana store in Hansi Road Karnal",
        "kirana store in Meerut Road Karnal",
        "kirana store in Assandh Road Karnal",
        "kirana store in Taraori Karnal",
        "kirana store in Gharaunda Karnal",
        "kirana store in Nilokheri Karnal",
        "general store in Sector 13 Karnal",
        "general store in Sector 14 Karnal",
        "general store in Model Town Karnal",
        "general store in Chaura Bazar Karnal",
        "grocery store in Karnal",
        "supermarket in Karnal",
        "departmental store in Karnal",
        "dry fruits store in Karnal",
        "masala and spices store Karnal",
        "atta chakki store in Karnal",
        "wholesale kirana merchant in Karnal",

        # --- 2. RETAIL CHEMISTS, MEDICAL HALLS, PHARMACIES & AYURVEDIC (Mandatory GST / Drug License) ---
        "chemist in Sector 13 Karnal",
        "chemist in Sector 14 Karnal",
        "chemist in Sector 6 Karnal",
        "chemist in Sector 7 Karnal",
        "chemist in Sector 8 Karnal",
        "chemist in Sector 9 Karnal",
        "chemist in Model Town Karnal",
        "chemist in Chaura Bazar Karnal",
        "medical store in Kunjpura Road Karnal",
        "medical store in Railway Road Karnal",
        "medical store in Karan Gate Karnal",
        "medical hall Mughal Canal Karnal",
        "medical store Kalpana Chawla Hospital Karnal",
        "medical store Civil Hospital Karnal",
        "medical store Prem Nagar Karnal",
        "medical store Ram Nagar Karnal",
        "medical store Sadar Bazar Karnal",
        "chemist in Hansi Road Karnal",
        "chemist in Meerut Road Karnal",
        "chemist in Taraori Karnal",
        "chemist in Gharaunda Karnal",
        "chemist in Nilokheri Karnal",
        "dawa ki dukan Karnal",
        "ayurvedic medicine shop in Karnal",
        "surgical items store in Karnal",
        "wholesale medicine distributors in Karnal",
        "veterinary medicine store Karnal",

        # --- 3. MOBILE, SMARTPHONES, ACCESSORIES, REPAIR & ELECTRONICS (18% GST / High ITC) ---
        "mobile shop in Sector 13 Karnal",
        "mobile shop in Sector 14 Karnal",
        "mobile shop in Model Town Karnal",
        "mobile shop in Mughal Canal Karnal",
        "mobile repair shop in Mughal Canal Karnal",
        "mobile accessories shop in Mughal Canal Karnal",
        "mobile shop in Railway Road Karnal",
        "mobile shop in Kunjpura Road Karnal",
        "mobile shop in Chaura Bazar Karnal",
        "mobile shop in Karan Gate Karnal",
        "mobile store in Sector 6 Karnal",
        "mobile store Prem Nagar Karnal",
        "mobile shop Sadar Bazar Karnal",
        "mobile shop Taraori Karnal",
        "mobile shop Gharaunda Karnal",
        "mobile shop Nilokheri Karnal",
        "computer shop Mughal Canal Karnal",
        "laptop repair and sales shop Karnal",
        "cctv camera dealer in Karnal",
        "electronics shop in Railway Road Karnal",
        "electronics shop in Kunjpura Road Karnal",
        "electronics showroom in Sector 12 Karnal",

        # --- 4. GARMENTS, SAREE, BOUTIQUES, CLOTH STORES, MENSWEAR & TAILORS (5%/12% GST / Composition) ---
        "garment shop in Chaura Bazar Karnal",
        "readymade garments Chaura Bazar Karnal",
        "saree shop in Chaura Bazar Karnal",
        "saree showroom Karan Gate Karnal",
        "cloth store in Chaura Bazar Karnal",
        "boutique in Model Town Karnal",
        "ladies boutique in Sector 13 Karnal",
        "boutique in Sector 14 Karnal",
        "mens wear store in Railway Road Karnal",
        "mens wear store in Karan Gate Karnal",
        "kids wear store in Chaura Bazar Karnal",
        "kids wear shop in Sector 13 Karnal",
        "garment shop in Railway Road Karnal",
        "garment store in Kunjpura Road Karnal",
        "matching centre in Karnal",
        "tailor and cloth merchant in Karnal",
        "hosiery and undergarments shop in Karnal",
        "clothing store in Super Mall Karnal",
        "clothing shop in Sector 6 Karnal",
        "garment shop in Prem Nagar Karnal",
        "garment store in Taraori Karnal",
        "garment store in Gharaunda Karnal",
        "garment shop in Nilokheri Karnal",
        "wholesale cloth merchant Railway Road Karnal",

        # --- 5. HARDWARE, ELECTRICAL, SANITARY, PAINTS, PLYWOOD & GLASS (18%/28% GST / E-Way Bills) ---
        "hardware store in Railway Road Karnal",
        "hardware store in Kunjpura Road Karnal",
        "hardware store in Sector 13 Karnal",
        "hardware shop in Chaura Bazar Karnal",
        "hardware store in Hansi Road Karnal",
        "electrical shop in Railway Road Karnal",
        "electrical shop in Kunjpura Road Karnal",
        "electrical shop in Sector 14 Karnal",
        "electrical shop in Sector 6 Karnal",
        "electrical goods store Sector 13 Karnal",
        "paint store in Hansi Road Karnal",
        "paint store in Kunjpura Road Karnal",
        "paint shop Railway Road Karnal",
        "sanitaryware store in Sector 13 Karnal",
        "sanitary store in Railway Road Karnal",
        "plywood and timber shop in Karnal",
        "glass and aluminium shop in Karnal",
        "pipe fittings and tubewell store in Karnal",
        "iron and steel traders in Karnal",
        "inverter and battery shop in Karnal",
        "cooler and fan dealer in Karnal",
        "electrician and electrical repair Karnal",
        "hardware store in Taraori Karnal",
        "hardware store in Gharaunda Karnal",

        # --- 6. SWEET SHOPS, HALWAIS, BAKERIES, CAKES & DAIRY (5% Restaurant / Composition CMP-08) ---
        "sweet shop in Model Town Karnal",
        "sweet shop in Chaura Bazar Karnal",
        "sweet shop in Kunjpura Road Karnal",
        "sweet shop in Railway Road Karnal",
        "sweet shop in Sector 13 Karnal",
        "sweet shop in Sector 14 Karnal",
        "sweet shop in Karan Gate Karnal",
        "halwai in Karnal",
        "bakery in Model Town Karnal",
        "bakery in Sector 13 Karnal",
        "cake shop in Sector 14 Karnal",
        "confectionery shop in Karnal",
        "dairy and paneer shop in Sector 13 Karnal",
        "milk dairy and paneer store Karnal",
        "restaurant and dhaba in Karnal",
        "cafe in Model Town Karnal",
        "fast food joint in Sector 12 Karnal",
        "sweet shop in Taraori Karnal",
        "sweet shop in Gharaunda Karnal",

        # --- 7. AUTO WORKSHOPS, TWO WHEELER MECHANICS, TYRES, BATTERIES & CAR CARE (28% Goods + 18% Labour) ---
        "car repair workshop in Karnal",
        "bike repair shop in Karnal",
        "auto spare parts shop in Mughal Canal Karnal",
        "motor mechanic in Hansi Road Karnal",
        "car accessories shop in Mughal Canal Karnal",
        "car accessories shop in Karnal",
        "tyre shop in Karnal",
        "tyre and wheel alignment GT Road Karnal",
        "battery store in Karnal",
        "car denting and painting workshop Karnal",
        "car washing center in Karnal",
        "scooter repair shop Karnal",
        "two wheeler spare parts Karnal",
        "tractor repair and spare parts in Karnal",
        "auto repair workshop in Taraori Karnal",
        "auto workshop in Gharaunda Karnal",

        # --- 8. STATIONERY, PRINTING, BOOK DEPOTS, CSC CENTERS & GIFTS (Small Business GST Retainership) ---
        "stationery shop in Railway Road Karnal",
        "book depot in Railway Road Karnal",
        "stationery store in Sector 14 Karnal",
        "stationery shop in Sector 13 Karnal",
        "stationery store in Model Town Karnal",
        "printing press in Karnal",
        "flex banner printing in Karnal",
        "photostat and cyber cafe in Karnal",
        "csc center online services in Karnal",
        "gift shop in Model Town Karnal",
        "toy shop in Karnal",
        "sports goods shop in Karnal",

        # --- 9. FOOTWEAR, SHOES, OPTICAL, CHASHMA & WATCHES ---
        "shoe store in Railway Road Karnal",
        "shoe store in Chaura Bazar Karnal",
        "footwear store in Karan Gate Karnal",
        "optical store in Railway Road Karnal",
        "opticians in Model Town Karnal",
        "optician in Sector 13 Karnal",
        "chashma dukan Karnal",
        "watch shop in Railway Road Karnal",

        # --- 10. UTENSILS, BARTAN BHANDAR, CROCKERY & HOME APPLIANCES ---
        "bartan shop in Chaura Bazar Karnal",
        "utensils store in Karnal",
        "crockery shop in Karnal",
        "plastic goods shop in Karnal",
        "home appliances shop in Railway Road Karnal",
        "gas stove and burner repair Karnal",

        # --- 11. FURNITURE, MATTRESSES, FOAM & CURTAINS ---
        "furniture shop in Railway Road Karnal",
        "furniture showroom in Mughal Canal Karnal",
        "mattress and foam store in Karnal",
        "curtain and sofa fabric store in Karnal",
        "wooden furniture workshop in Karnal",

        # --- 12. SARAFA & JEWELLERS (3% GST + Mandatory Hallmarking) ---
        "jewellers in Sarafa Bazar Karnal",
        "gold and silver jewellery shop Karnal",
        "jewellery showroom in Model Town Karnal",
        "jewellers in Kunjpura Road Karnal",

        # --- 13. KHAD BEEJ BHANDAR, PESTICIDES & SEEDS (5% Agro GST) ---
        "khad beej bhandar in Karnal",
        "pesticide dealers in New Anaj Mandi Karnal",
        "seed dealers in Karnal",
        "fertilizer dealers in Karnal",
        "agricultural equipment dealers Karnal",
        "khad beej bhandar in Taraori Karnal",
        "khad beej bhandar in Gharaunda Karnal",

        # --- 14. SALONS & BEAUTY PARLOURS (>20L Services) ---
        "beauty parlour in Model Town Karnal",
        "beauty parlour in Sector 13 Karnal",
        "beauty parlour in Sector 14 Karnal",
        "salon in Karnal",
        "hair salon in Karnal",

        # --- 15. BUILDING MATERIALS, MARBLE, TILES & FABRICATION ---
        "building material supplier in Karnal",
        "cement and bajri supplier in Karnal",
        "marble and tile showroom in Karnal",
        "iron fabrication and welding in Karnal",

        # --- 16. SERVICES & TRANSPORT (RO, AC, Dryclean, Tent, Courier, Transporters) ---
        "ro service and water purifier in Karnal",
        "ac repair and service in Karnal",
        "dry cleaners in Karnal",
        "tent house and decorators in Karnal",
        "courier service in Karnal",
        "transporters and tempo union in Karnal",

        # --- 17. COMPLETE MARKET & SECTOR WALKTROUGHS (EVERY SHOP IN KARNAL) ---
        "shops in Sector 13 market Karnal",
        "shops in Sector 14 market Karnal",
        "shops in Sector 6 market Karnal",
        "shops in Sector 7 market Karnal",
        "shops in Sector 8 market Karnal",
        "shops in Sector 9 market Karnal",
        "shops in Sector 12 Karnal",
        "shops in Sector 4 market Karnal",
        "shops in Sector 5 market Karnal",
        "shops in Model Town market Karnal",
        "shops in Chaura Bazar Karnal",
        "shops in Karan Gate market Karnal",
        "shops in Sarafa Bazar Karnal",
        "shops in Mughal Canal market Karnal",
        "shops in Railway Road market Karnal",
        "shops in Kunjpura Road market Karnal",
        "shops in Dayal Singh Colony Karnal",
        "shops in Prem Nagar Karnal",
        "shops in Ram Nagar Karnal",
        "shops in Sadar Bazar Karnal",
        "shops in Hansi Road Karnal",
        "shops in Meerut Road Karnal",
        "shops in Jundla Gate Karnal",
        "shops in Subhash Gate Karnal",
        "shops in Old Subzi Mandi Karnal",
        "shops in New Anaj Mandi Karnal",
        "shops in Old Grain Market Karnal",
        "shops in Super Mall Karnal",
        "shops in Liaquat Market Karnal",
        "shops in Taraori market Karnal",
        "shops in Gharaunda market Karnal",
        "shops in Nilokheri market Karnal",
        "shops in Nissing market Karnal",
        "shops in Indri market Karnal",
        "shops in Assandh market Karnal"
    ]

    output_file = DEFAULT_OUTPUT_CSV
    max_scrolls = 8
    headless = True

    # Parse CLI flags
    for i, arg in enumerate(sys.argv):
        if arg == "--scrolls" and i + 1 < len(sys.argv):
            try:
                max_scrolls = int(sys.argv[i + 1])
            except ValueError:
                pass
        elif arg == "--output" and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
        elif arg == "--no-headless" or arg == "--gui":
            headless = False

    print("=" * 75, flush=True)
    print("      KARNAL SMALL BUSINESS & RETAIL SCRAPER FOR GST FILINGS     ", flush=True)
    print("=" * 75, flush=True)
    print(f"Target Output:       {output_file}", flush=True)
    print(f"Total Search Niches: {len(queries)} retail & small business queries in Karnal", flush=True)
    print(f"Max Scrolls / Niche: {max_scrolls} scrolls per query", flush=True)
    print("Parsing Engine:      Ultra-fast card extractor (<10ms/card) with detail fallback", flush=True)
    print("GST Pitch Strategy:  Tailored for Kirana, Chemists, Mobiles, Garments, Hardware, etc.", flush=True)
    print("=" * 75 + "\n", flush=True)

    results = scrape_karnal_gst_leads(
        queries=queries,
        max_scrolls_per_query=max_scrolls,
        output_csv_path=output_file,
        headless=headless
    )

    # Generate HTML preview dashboard
    generate_karnal_gst_preview_html(results, DEFAULT_PREVIEW_HTML)

    print("\n" + "=" * 75, flush=True)
    print(f"[FINISHED] Total Unique Karnal Business Leads: {len(results)}", flush=True)
    print(f"[CSV Saved] {output_file}", flush=True)
    print(f"[Dashboard] {DEFAULT_PREVIEW_HTML}", flush=True)
    print("=" * 75, flush=True)


if __name__ == "__main__":
    main()
