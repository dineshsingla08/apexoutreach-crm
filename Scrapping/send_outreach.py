import os
import re
import sys
import time
import random
import json
import smtplib
import imaplib
import email
from email.header import decode_header
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import make_msgid
from typing import List, Dict, Tuple, Optional
import pandas as pd

# Default file paths
DEFAULT_CSV_PATH = "d:/Dinesh/antigravity/Scrapping/clinics_in_gurgaon.csv"
CONFIG_PATH = "d:/Dinesh/antigravity/Scrapping/email_config.json"
SENT_LOG_PATH = "d:/Dinesh/antigravity/Scrapping/sent_log.csv"
PREVIEW_HTML_PATH = "d:/Dinesh/antigravity/Scrapping/preview_outreach.html"

# Blacklist of dummy/placeholder emails to skip
DUMMY_EMAIL_PATTERNS = [
    r"example\.com",
    r"domain\.com",
    r"mysite\.com",
    r"company\.com",
    r"dummy@",
    r"sentry\.io",
    r"wixpress",
    r"yourdomain",
    r"filler@",
    r"text@gmail\.com",
    r"your@mail\.com",
    r"test@test\.com",
    r"admin@admin\.com",
    r"user@gmail\.com",
]

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def clean_clinic_name(raw_name: str) -> str:
    """Shortens lengthy SEO titles into a clean, natural clinic/doctor name."""
    if not raw_name or not isinstance(raw_name, str):
        return "Doctor / Clinic Director"
    name = raw_name.strip()
    name = name.replace("’", "'").replace("‘", "'").replace("â€™", "'").replace("\ufffd", "")
    for sep in [" | ", " - ", " : ", " – ", " — ", ","]:
        if sep in name:
            candidate = name.split(sep)[0].strip()
            if len(candidate) >= 3 and not candidate.lower().startswith("best"):
                name = candidate
                break
    name = re.sub(r'^["\']|["\']$', '', name).strip()
    return name


def extract_sector(address: str) -> str:
    """Extracts sector or major area from Gurgaon address."""
    if not address or not isinstance(address, str):
        return "Gurgaon"
    
    sec_match = re.search(r"Sector\s*[-]?\s*(\d+[A-Za-z]*)", address, re.IGNORECASE)
    if sec_match:
        return f"Sector {sec_match.group(1)}"
    
    areas = [
        "DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "DLF Phase 4", "DLF Phase 5",
        "Golf Course Road", "Golf Course Ext", "Sohna Road", "Badshahpur",
        "Palam Vihar", "Sushant Lok", "South City", "Dwarka Expressway",
        "New Gurgaon", "Cyber City", "Old Railway Road"
    ]
    for area in areas:
        if area.lower() in address.lower():
            return area
            
    return "Gurgaon"


def find_column(df: pd.DataFrame, candidates: List[str]) -> Optional[str]:
    """Finds matching column name case-insensitively from candidates."""
    lower_cols = {col.lower().strip(): col for col in df.columns}
    for cand in candidates:
        if cand.lower().strip() in lower_cols:
            return lower_cols[cand.lower().strip()]
    for cand in candidates:
        for lower_col, orig_col in lower_cols.items():
            if cand.lower().strip() in lower_col:
                return orig_col
    return None


def get_single_generic_template(
    clinic_name: str,
    area: str,
    rating: str = "",
    sender_name: str = "Vidhi Singhal",
    sender_email: str = "Dineshvidhi815@gmail.com",
    sender_phone: str = "+91 8958573159"
) -> Dict[str, str]:
    """
    Returns ONE short, generic, high-converting onboarding template designed
    for Digital & Performance Marketing for any clinic or doctor.
    Dynamically personalizes with clinic name, area, and Google review praise.
    """
    phone_text = f"\nPhone / WhatsApp: {sender_phone}" if sender_phone else ""
    phone_html = f"<br><span style='color: #64748b; font-size: 13px;'>Phone / WhatsApp: {sender_phone}</span>" if sender_phone else ""
    
    praise_txt = ""
    praise_html = ""
    try:
        if rating and float(str(rating).strip()) >= 4.0:
            clean_r = str(rating).strip()
            praise_txt = f" (congrats on your {clean_r}★ patient reviews)"
            praise_html = f" <span style='color:#059669; font-weight:500;'>(congrats on your {clean_r}★ patient reviews)</span>"
    except Exception:
        pass

    subject = f"Quick idea to scale patient appointments for {clinic_name}"
    
    body = f"""Hi {clinic_name} Team,

I came across your practice in {area}{praise_txt} and wanted to reach out briefly.

We help clinics and doctors in Gurgaon scale their monthly patient appointments through targeted performance marketing:

• High-Intent Google Search Ads: Capturing patients in {area} actively searching for doctor consultations near you right now.
• Targeted Meta Ads (Instagram/FB): Building local reach and awareness for your clinic and treatments.
• Direct WhatsApp Booking: Connecting prospective patients directly to your front desk to confirm appointments.

We work strictly on a performance model focused on real, paying patient appointments—not vanity social media likes.

Would you be open to a brief 5-minute call this week to see if this could add 25–40 new patient appointments for {clinic_name} next month?

Best regards,

{sender_name}
Digital & Performance Marketing | Healthcare Growth
Email: {sender_email}{phone_text}
Gurgaon, Haryana
"""

    card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 580px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p style="margin-top: 0;">Hi <strong>{clinic_name}</strong> Team,</p>
    <p>I came across your practice in <strong>{area}</strong>{praise_html} and wanted to reach out briefly.</p>
    <p>We help clinics and doctors in Gurgaon scale their monthly patient appointments through targeted performance marketing:</p>
    <ul style="padding-left: 20px; margin: 14px 0;">
        <li style="margin-bottom: 8px;"><strong>High-Intent Google Search Ads</strong>: Capturing patients in {area} actively searching for doctor consultations near you right now.</li>
        <li style="margin-bottom: 8px;"><strong>Targeted Meta Ads (Instagram/FB)</strong>: Building local reach and awareness for your clinic and treatments.</li>
        <li style="margin-bottom: 8px;"><strong>Direct WhatsApp Booking</strong>: Connecting prospective patients directly to your front desk to confirm appointments.</li>
    </ul>
    <p>We work strictly on a performance model focused on real, paying patient appointments—not vanity social media likes.</p>
    <p>Would you be open to a brief 5-minute call this week to see if this could add 25–40 new patient appointments for {clinic_name} next month?</p>
    <p style="margin-top: 24px; margin-bottom: 4px;">Best regards,</p>
    <p style="margin: 0; line-height: 1.5;">
        <strong>{sender_name}</strong><br>
        <span style="color: #64748b; font-size: 13px;">Digital & Performance Marketing | Healthcare Growth</span><br>
        <span style="color: #64748b; font-size: 13px;">Email: {sender_email}</span>{phone_html}<br>
        <span style="color: #64748b; font-size: 13px;">Gurgaon, Haryana</span>
    </p>
</div>"""

    full_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 16px; background-color: #f8fafc;">
    {card_html}
</body>
</html>"""

    return {
        "id": "performance_marketing_short_generic",
        "subject": subject,
        "body": body,
        "card_html": card_html,
        "html": full_html
    }


def load_leads(sheet_path: str) -> List[Dict[str, str]]:
    """
    Dynamically loads and sanitizes clinic leads from CSV or Excel.
    Pulls real data fields: Name, Email, Address, Area, Rating, Reviews, Phone, Website.
    """
    if not os.path.exists(sheet_path):
        print(f"[!] Sheet file not found at: {sheet_path}")
        return []

    print(f"[+] Loading sheet from: {sheet_path}", flush=True)
    try:
        if sheet_path.lower().endswith((".xlsx", ".xls")):
            df = pd.read_excel(sheet_path)
        else:
            try:
                df = pd.read_csv(sheet_path, encoding="utf-8")
            except UnicodeDecodeError:
                df = pd.read_csv(sheet_path, encoding="latin1")
    except Exception as e:
        print(f"[!] Error reading sheet: {e}")
        return []

    print(f"    Total rows in sheet: {len(df)}")

    email_col = find_column(df, ["email", "mail", "e-mail", "email address", "contact email", "primary email"])
    name_col = find_column(df, ["name", "clinic name", "clinic", "practice name", "doctor name", "business name"])
    addr_col = find_column(df, ["address", "location", "area", "sector", "city"])
    phone_col = find_column(df, ["phone number", "phone", "contact", "mobile", "telephone"])
    web_col = find_column(df, ["website", "web", "url", "site"])
    rating_col = find_column(df, ["rating", "rate", "stars", "score"])
    reviews_col = find_column(df, ["reviews", "review count", "num reviews"])
    maps_col = find_column(df, ["google maps url", "maps url", "map url", "gmaps"])
    query_col = find_column(df, ["query", "search query", "keyword", "specialty"])

    if not email_col:
        print(f"[!] ERROR: Could not find an Email column in the sheet.")
        print(f"    Available columns: {df.columns.tolist()}")
        return []

    print(f"    [✓] Detected Columns -> Email: '{email_col}', Name: '{name_col}', Address: '{addr_col}', Rating: '{rating_col}'")

    valid_leads = []
    seen_emails = set()

    for idx, row in df.iterrows():
        raw_email = str(row.get(email_col, "")).strip()
        if not raw_email or raw_email.lower() == "nan":
            continue

        candidates = [e.strip().lower() for e in re.split(r"[;,]", raw_email) if e.strip()]
        
        selected_email = ""
        for em in candidates:
            if "@" in em and not any(re.search(pat, em) for pat in DUMMY_EMAIL_PATTERNS):
                selected_email = em
                break

        if not selected_email or selected_email in seen_emails:
            continue

        seen_emails.add(selected_email)

        raw_name = str(row.get(name_col, "")) if name_col else ""
        raw_addr = str(row.get(addr_col, "")) if addr_col else ""
        raw_phone = str(row.get(phone_col, "")) if phone_col else ""
        raw_web = str(row.get(web_col, "")) if web_col else ""
        raw_rating = str(row.get(rating_col, "")) if rating_col else ""
        raw_reviews = str(row.get(reviews_col, "")) if reviews_col else ""
        raw_maps = str(row.get(maps_col, "")) if maps_col else ""
        raw_query = str(row.get(query_col, "")) if query_col else ""

        clinic_name = clean_clinic_name(raw_name) if raw_name and raw_name.lower() != "nan" else "Doctor / Practice Director"
        area = extract_sector(raw_addr) if raw_addr and raw_addr.lower() != "nan" else "Gurgaon"

        valid_leads.append({
            "Name": clinic_name,
            "RawName": raw_name if raw_name.lower() != "nan" else "",
            "Email": selected_email,  # DYNAMIC RECIPIENT FROM SHEET
            "Area": area,
            "Rating": raw_rating if raw_rating.lower() != "nan" else "",
            "Reviews": raw_reviews if raw_reviews.lower() != "nan" else "",
            "Phone": raw_phone if raw_phone.lower() != "nan" else "",
            "Website": raw_web if raw_web.lower() != "nan" else "",
            "Address": raw_addr if raw_addr.lower() != "nan" else "",
            "GoogleMapsUrl": raw_maps if raw_maps.lower() != "nan" else "",
            "Query": raw_query if raw_query.lower() != "nan" else "",
            "SheetRow": idx + 2  # 1-indexed header + row
        })

    print(f"    [✓] Found {len(valid_leads)} valid leads with verified emails in the sheet.\n")
    return valid_leads


def load_sent_log(log_path: str = SENT_LOG_PATH) -> pd.DataFrame:
    """Loads existing sent log with normalized columns for tracking."""
    expected_cols = [
        "Timestamp", "Mode", "Clinic Name", "Email", "Area", "Subject",
        "Message ID", "Status", "Read Receipt Requested",
        "Reply Received", "Reply Timestamp", "Reply Subject", "Reply Snippet"
    ]
    if os.path.exists(log_path):
        try:
            df = pd.read_csv(log_path)
            for col in expected_cols:
                if col not in df.columns:
                    if col == "Mode":
                        df[col] = "Live"
                    elif col == "Reply Received":
                        df[col] = "No"
                    elif col in ["Reply Timestamp", "Reply Subject", "Reply Snippet"]:
                        df[col] = "-"
                    elif col == "Read Receipt Requested":
                        df[col] = "Yes"
                    elif col == "Status":
                        df[col] = "Sent"
                    elif col == "Message ID":
                        df[col] = "-"
                    else:
                        df[col] = ""
            return df[expected_cols]
        except Exception:
            pass
    return pd.DataFrame(columns=expected_cols)


def check_incoming_replies(config: Dict, log_path: str = SENT_LOG_PATH) -> int:
    """
    Connects to Gmail IMAP and scans recent inbox messages for replies
    from any recipient listed in sent_log.csv.
    Updates sent_log.csv with Reply Received: Yes, Timestamp, Subject, and Snippet.
    """
    df = load_sent_log(log_path)
    if df.empty:
        return 0

    tracked_emails = set(df["Email"].dropna().str.lower().tolist())
    if not tracked_emails:
        return 0

    imap_server = config.get("imap_server", "imap.gmail.com")
    imap_port = int(config.get("imap_port", 993))
    imap_user = config.get("smtp_username", "")
    imap_pass = config.get("smtp_password", "")

    if not imap_user or not imap_pass:
        return 0

    print("[+] Connecting to Gmail IMAP to check for incoming replies & read receipts...", flush=True)
    replies_found = 0

    try:
        mail = imaplib.IMAP4_SSL(imap_server, imap_port)
        mail.login(imap_user, imap_pass)
        status, count = mail.select("inbox", readonly=True)
        total = int(count[0])

        # Scan the most recent 100 messages in the mailbox
        scan_range = max(1, total - 100)
        typ, data = mail.fetch(f"{scan_range}:{total}", "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE MESSAGE-ID IN-REPLY-TO REFERENCES)])")

        updated = False
        for item in data:
            if not isinstance(item, tuple):
                continue
            
            raw_headers = item[1]
            msg = email.message_from_bytes(raw_headers)
            from_hdr = str(msg.get("From", ""))
            sub_hdr = str(msg.get("Subject", ""))
            date_hdr = str(msg.get("Date", ""))
            
            # Decode subject
            decoded_sub = ""
            for part, enc in decode_header(sub_hdr):
                if isinstance(part, bytes):
                    decoded_sub += part.decode(enc or "utf-8", errors="ignore")
                else:
                    decoded_sub += str(part)

            # Extract sender email
            email_match = re.search(r"[\w\.-]+@[\w\.-]+", from_hdr)
            if not email_match:
                continue

            sender_email = email_match.group(0).lower()

            if sender_email in tracked_emails:
                mask = df["Email"].str.lower() == sender_email
                if (df.loc[mask, "Reply Received"] != "Yes").any():
                    df.loc[mask, "Reply Received"] = "Yes"
                    df.loc[mask, "Reply Timestamp"] = date_hdr
                    df.loc[mask, "Reply Subject"] = decoded_sub
                    df.loc[mask, "Reply Snippet"] = f"Reply from {sender_email}"
                    updated = True
                    replies_found += 1
                    print(f"    [🔔 RESPONSE DETECTED] From: {sender_email}")
                    print(f"        Subject: {decoded_sub}")
                    print(f"        Date:    {date_hdr}")

        mail.logout()

        if updated:
            df.to_csv(log_path, index=False)
            print(f"[✓] sent_log.csv updated with newly detected responses!", flush=True)

    except Exception as e:
        print(f"[!] IMAP check note: {e}", flush=True)

    # Print summary table of responses
    yes_replies = df[df["Reply Received"] == "Yes"]
    total_sent = len(df)
    print("\n" + "=" * 65, flush=True)
    print("                 OUTREACH ENGAGEMENT TRACKER                     ", flush=True)
    print("=" * 65, flush=True)
    print(f"Total Emails Logged in History: {total_sent}", flush=True)
    print(f"Responses Received:            {len(yes_replies)}", flush=True)
    print(f"Response Rate:                 {(len(yes_replies) / total_sent * 100) if total_sent else 0:.1f}%", flush=True)
    if not yes_replies.empty:
        print("-" * 65, flush=True)
        print("Recent Responses:")
        for _, r in yes_replies.tail(5).iterrows():
            print(f" • [{r['Reply Timestamp']}] {r['Clinic Name']} ({r['Email']}): {r['Reply Subject']}")
    print("=" * 65 + "\n", flush=True)

    return replies_found


def generate_preview_html(leads: List[Dict[str, str]], output_html_path: str, config: Dict):
    """Generates the interactive dynamic HTML preview dashboard."""
    sender_name = config.get("sender_name", "Vidhi Singhal")
    sender_email = config.get("sender_email", "Dineshvidhi815@gmail.com")
    sender_phone = config.get("sender_phone", "")
    leads_json = json.dumps(leads)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthcare Performance Marketing - Quick idea to boost your revenue</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #f1f5f9;
            color: #0f172a;
            line-height: 1.5;
        }}
        .top-navbar {{
            background: linear-gradient(135deg, #1e3a8a, #2563eb);
            color: #fff;
            padding: 20px 32px;
            box-shadow: 0 4px 15px rgba(30, 58, 138, 0.15);
        }}
        .top-navbar h1 {{
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 4px;
        }}
        .top-navbar p {{
            font-size: 14px;
            opacity: 0.9;
        }}
        .stats-bar {{
            display: flex;
            gap: 16px;
            margin-top: 14px;
            flex-wrap: wrap;
        }}
        .stat-badge {{
            background: rgba(255, 255, 255, 0.16);
            backdrop-filter: blur(8px);
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
        }}
        .stat-badge strong {{
            color: #fef08a;
        }}

        .main-container {{
            max-width: 1380px;
            margin: 24px auto;
            padding: 0 20px;
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 24px;
            align-items: start;
        }}

        .sidebar {{
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            height: calc(100vh - 170px);
            position: sticky;
            top: 20px;
        }}
        .sidebar-header {{
            padding: 16px;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }}
        .search-box {{
            width: 100%;
            padding: 10px 14px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            font-size: 13px;
            outline: none;
            transition: border-color 0.2s;
        }}
        .search-box:focus {{
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }}
        .chips-container {{
            display: flex;
            gap: 6px;
            margin-top: 10px;
            overflow-x: auto;
            padding-bottom: 4px;
        }}
        .chip {{
            background: #e2e8f0;
            color: #334155;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 11px;
            cursor: pointer;
            white-space: nowrap;
            border: none;
        }}
        .chip.active {{
            background: #2563eb;
            color: #ffffff;
        }}
        .leads-list {{
            overflow-y: auto;
            flex: 1;
            padding: 8px;
        }}
        .lead-item {{
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            margin-bottom: 6px;
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }}
        .lead-item:hover {{
            background: #f8fafc;
            border-color: #cbd5e1;
        }}
        .lead-item.selected {{
            background: #eff6ff;
            border-color: #3b82f6;
        }}
        .lead-item-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }}
        .lead-name {{
            font-weight: 600;
            font-size: 13px;
            color: #1e293b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
        }}
        .lead-sector {{
            background: #e0f2fe;
            color: #0369a1;
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: 500;
        }}
        .lead-meta {{
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #64748b;
        }}
        .lead-email {{
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 220px;
            color: #0284c7;
            font-family: monospace;
            font-size: 11px;
        }}
        .rating-pill {{
            color: #d97706;
            font-weight: 600;
            font-size: 11px;
        }}

        .preview-stage {{
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 15px rgba(0,0,0,0.04);
            overflow: hidden;
        }}
        .preview-header {{
            background: #f8fafc;
            padding: 18px 24px;
            border-bottom: 1px solid #e2e8f0;
        }}
        .badge-row {{
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }}
        .pill-badge {{
            font-size: 12px;
            font-weight: 600;
            padding: 4px 10px;
            border-radius: 6px;
        }}
        .pill-blue {{ background: #dbeafe; color: #1e40af; }}
        .pill-green {{ background: #d1fae5; color: #065f46; }}
        .pill-orange {{ background: #fef3c7; color: #92400e; }}
        
        .header-detail-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
            margin-top: 10px;
            padding: 12px;
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            font-size: 13px;
        }}
        .detail-item strong {{ color: #475569; font-size: 11px; text-transform: uppercase; display: block; }}
        .detail-item span {{ color: #0f172a; font-weight: 500; }}

        .email-meta-box {{
            background: #f1f5f9;
            padding: 14px 20px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 14px;
        }}
        .email-field {{
            margin-bottom: 6px;
            display: flex;
            align-items: center;
        }}
        .email-field strong {{
            width: 70px;
            color: #64748b;
            font-size: 13px;
        }}
        .dynamic-to-value {{
            color: #0284c7;
            font-weight: 600;
            background: #e0f2fe;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: monospace;
        }}
        .dynamic-sub-value {{
            color: #0f172a;
            font-weight: 600;
        }}

        .view-controls {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            border-bottom: 1px solid #e2e8f0;
            background: #ffffff;
        }}
        .tab-btn {{
            background: none;
            border: 1px solid #cbd5e1;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            margin-right: 8px;
        }}
        .tab-btn.active {{
            background: #2563eb;
            color: #ffffff;
            border-color: #2563eb;
        }}
        .btn-copy {{
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            color: #334155;
            transition: all 0.2s;
        }}
        .btn-copy:hover {{
            background: #e2e8f0;
        }}

        .email-body-stage {{
            padding: 32px 24px;
            background: #f8fafc;
            min-height: 400px;
        }}
        .email-card {{
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 28px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.03);
            line-height: 1.6;
            color: #1e293b;
        }}
        .plain-text-box {{
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 13px;
            background: #ffffff;
            padding: 24px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            max-width: 650px;
            margin: 0 auto;
            color: #334155;
            line-height: 1.6;
        }}

        .csv-row-table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }}
        .csv-row-table td, .csv-row-table th {{
            padding: 10px 14px;
            border-bottom: 1px solid #e2e8f0;
        }}
        .csv-row-table th {{
            background: #f8fafc;
            width: 160px;
            color: #475569;
            text-align: left;
        }}

        .toast {{
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #0f172a;
            color: #ffffff;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 100;
        }}
        .toast.show {{
            opacity: 1;
        }}
    </style>
</head>
<body>

    <header class="top-navbar">
        <h1>Healthcare Performance Marketing - Quick idea to boost your revenue</h1>
        <p>Interactive Outreach Engine & Dynamic Lead Email Previewer (Gurgaon Healthcare Clinics)</p>
        <div class="stats-bar">
            <div class="stat-badge">Total Sheet Leads: <strong>{len(leads)}</strong></div>
            <div class="stat-badge">Batch Daily Limit: <strong>{config.get('send_limit', 50)}</strong></div>
            <div class="stat-badge">Recipient: <strong>100% Dynamic from CSV</strong></div>
            <div class="stat-badge">Sender: <strong>{sender_name} ({sender_email})</strong></div>
        </div>
    </header>

    <div class="main-container">
        <aside class="sidebar">
            <div class="sidebar-header">
                <input type="text" id="searchInput" class="search-box" placeholder="Search clinic, sector, or email...">
                <div class="chips-container">
                    <button class="chip active" onclick="filterBySector('ALL')">All ({len(leads)})</button>
                    <button class="chip" onclick="filterBySector('4.5+')">⭐ 4.5+</button>
                    <button class="chip" onclick="filterBySector('Sector 56')">Sec 56</button>
                    <button class="chip" onclick="filterBySector('DLF')">DLF</button>
                    <button class="chip" onclick="filterBySector('Sohna')">Sohna Rd</button>
                    <button class="chip" onclick="filterBySector('Sector 14')">Sec 14</button>
                    <button class="chip" onclick="filterBySector('Golf')">Golf Course</button>
                </div>
            </div>
            <div class="leads-list" id="leadsListContainer"></div>
        </aside>

        <main class="preview-stage">
            <div class="preview-header">
                <div class="badge-row">
                    <span class="pill-badge pill-blue" id="headerRowBadge">Row 4 in CSV</span>
                    <span class="pill-badge pill-green" id="headerRatingBadge">⭐ 4.8 Rating</span>
                    <span class="pill-badge pill-orange" id="headerAreaBadge">Sector 56</span>
                </div>
                <h2 id="headerClinicName" style="font-size: 20px; font-weight: 700; color: #0f172a;">Wellstar Clinic & Diagnostic Pvt. Ltd.</h2>
                
                <div class="header-detail-grid">
                    <div class="detail-item">
                        <strong>Address:</strong>
                        <span id="detailAddress">-</span>
                    </div>
                    <div class="detail-item">
                        <strong>Phone Number:</strong>
                        <span id="detailPhone">-</span>
                    </div>
                    <div class="detail-item">
                        <strong>Website:</strong>
                        <span id="detailWebsite">-</span>
                    </div>
                    <div class="detail-item">
                        <strong>Specialty / Query:</strong>
                        <span id="detailQuery">-</span>
                    </div>
                </div>
            </div>

            <div class="email-meta-box">
                <div class="email-field">
                    <strong>To:</strong>
                    <span class="dynamic-to-value" id="fieldTo">lab@wellstarclinic.com</span>
                    <button class="btn-copy" style="margin-left: 8px; padding: 2px 6px; font-size: 11px;" onclick="copyToClipboard(currentLead.Email, 'Recipient email copied!')">Copy</button>
                </div>
                <div class="email-field">
                    <strong>From:</strong>
                    <span style="color: #475569; font-size: 13px;">{sender_name} &lt;{sender_email}&gt;</span>
                </div>
                <div class="email-field" style="margin-bottom: 0;">
                    <strong>Subject:</strong>
                    <span class="dynamic-sub-value" id="fieldSubject">-</span>
                    <button class="btn-copy" style="margin-left: 8px; padding: 2px 6px; font-size: 11px;" onclick="copyToClipboard(currentSubject, 'Subject line copied!')">Copy</button>
                </div>
            </div>

            <div class="view-controls">
                <div>
                    <button class="tab-btn active" id="btnHtmlTab" onclick="switchTab('html')">Visual Email View</button>
                    <button class="tab-btn" id="btnTextTab" onclick="switchTab('text')">Plain Text View</button>
                    <button class="tab-btn" id="btnDataTab" onclick="switchTab('data')">CSV Row Data</button>
                </div>
                <div>
                    <button class="btn-copy" onclick="copyFullEmail()">Copy Full Email</button>
                </div>
            </div>

            <div class="email-body-stage">
                <div id="htmlView" style="display: block;"></div>
                <div id="textView" style="display: none;">
                    <div class="plain-text-box" id="plainTextContent"></div>
                </div>
                <div id="dataView" style="display: none;">
                    <table class="csv-row-table" id="dataTableContent"></table>
                </div>
            </div>
        </main>
    </div>

    <div class="toast" id="toast">Copied to clipboard!</div>

    <script>
        const leadsData = {leads_json};
        const senderName = "{sender_name}";
        const senderEmail = "{sender_email}";
        const senderPhone = "{sender_phone}";

        let currentSelectedIndex = 0;
        let currentLead = leadsData[0] || {{}};
        let currentSubject = "";
        let currentBody = "";
        let activeTab = "html";
        let activeSectorFilter = "ALL";

        function renderLeadsList(filterText = "", sectorFilter = "ALL") {{
            const container = document.getElementById("leadsListContainer");
            container.innerHTML = "";

            const query = filterText.toLowerCase().trim();

            leadsData.forEach((lead, index) => {{
                if (sectorFilter === "4.5+") {{
                    const r = parseFloat(lead.Rating || 0);
                    if (r < 4.5) return;
                }} else if (sectorFilter !== "ALL") {{
                    if (!lead.Area.toLowerCase().includes(sectorFilter.toLowerCase())) return;
                }}

                if (query) {{
                    const match = lead.Name.toLowerCase().includes(query) ||
                                  lead.Area.toLowerCase().includes(query) ||
                                  lead.Email.toLowerCase().includes(query);
                    if (!match) return;
                }}

                const item = document.createElement("div");
                item.className = "lead-item" + (index === currentSelectedIndex ? " selected" : "");
                item.onclick = () => selectLead(index);

                item.innerHTML = `
                    <div class="lead-item-header">
                        <div class="lead-name" title="${{lead.Name}}">${{lead.Name}}</div>
                        <span class="lead-sector">${{lead.Area}}</span>
                    </div>
                    <div class="lead-meta">
                        <span class="lead-email" title="${{lead.Email}}">To: ${{lead.Email}}</span>
                        <span class="rating-pill">${{lead.Rating ? '★ ' + lead.Rating : ''}}</span>
                    </div>
                `;
                container.appendChild(item);
            }});
        }}

        function selectLead(index) {{
            currentSelectedIndex = index;
            currentLead = leadsData[index];

            document.querySelectorAll(".lead-item").forEach((el, i) => {{
                el.classList.toggle("selected", i === index);
            }});

            renderActiveLeadPreview();
        }}

        function renderActiveLeadPreview() {{
            if (!currentLead) return;

            document.getElementById("headerRowBadge").innerText = `Row ${{currentLead.SheetRow}} in CSV`;
            document.getElementById("headerRatingBadge").innerText = currentLead.Rating ? `⭐ ${{currentLead.Rating}} (${{currentLead.Reviews || '0'}} reviews)` : 'Verified Clinic';
            document.getElementById("headerAreaBadge").innerText = currentLead.Area;
            document.getElementById("headerClinicName").innerText = currentLead.Name;

            document.getElementById("detailAddress").innerText = currentLead.Address || "Gurgaon";
            document.getElementById("detailPhone").innerText = currentLead.Phone || "Not listed";
            
            const webEl = document.getElementById("detailWebsite");
            if (currentLead.Website) {{
                let cleanUrl = currentLead.Website.replace(/^https?:\\/\\//i, '').replace(/\\/$/, '');
                webEl.innerHTML = `<a href="${{currentLead.Website}}" target="_blank" style="color: #2563eb; text-decoration: none;">${{cleanUrl}}</a>`;
            }} else {{
                webEl.innerText = "Not listed";
            }}

            document.getElementById("detailQuery").innerText = currentLead.Query || "Clinics in Gurgaon";
            document.getElementById("fieldTo").innerText = currentLead.Email;

            let praiseTxt = "";
            let praiseHtml = "";
            if (currentLead.Rating && parseFloat(currentLead.Rating) >= 4.0) {{
                praiseTxt = ` (congrats on your ${{currentLead.Rating}}★ patient reviews)`;
                praiseHtml = ` <span style="color:#059669; font-weight:500;">(congrats on your ${{currentLead.Rating}}★ patient reviews)</span>`;
            }}

            currentSubject = `Quick idea to scale patient appointments for ${{currentLead.Name}}`;
            document.getElementById("fieldSubject").innerText = currentSubject;

            const phoneText = senderPhone ? `\\nPhone / WhatsApp: ${{senderPhone}}` : "";
            const phoneHtml = senderPhone ? `<br><span style="color: #64748b; font-size: 13px;">Phone / WhatsApp: ${{senderPhone}}</span>` : "";

            currentBody = `Hi ${{currentLead.Name}} Team,\\n\\nI came across your practice in ${{currentLead.Area}}${{praiseTxt}} and wanted to reach out briefly.\\n\\nWe help clinics and doctors in Gurgaon scale their monthly patient appointments through targeted performance marketing:\\n\\n• High-Intent Google Search Ads: Capturing patients in ${{currentLead.Area}} actively searching for doctor consultations near you right now.\\n• Targeted Meta Ads (Instagram/FB): Building local reach and awareness for your clinic and treatments.\\n• Direct WhatsApp Booking: Connecting prospective patients directly to your front desk to confirm appointments.\\n\\nWe work strictly on a performance model focused on real, paying patient appointments—not vanity social media likes.\\n\\nWould you be open to a brief 5-minute call this week to see if this could add 25–40 new patient appointments for ${{currentLead.Name}} next month?\\n\\nBest regards,\\n\\n${{senderName}}\\nDigital & Performance Marketing | Healthcare Growth\\nEmail: ${{senderEmail}}${{phoneText}}\\nGurgaon, Haryana`;

            document.getElementById("htmlView").innerHTML = `
                <div class="email-card">
                    <p style="margin-top: 0; margin-bottom: 14px;">Hi <strong>${{currentLead.Name}}</strong> Team,</p>
                    <p style="margin-bottom: 14px;">I came across your practice in <strong>${{currentLead.Area}}</strong>${{praiseHtml}} and wanted to reach out briefly.</p>
                    <p style="margin-bottom: 12px;">We help clinics and doctors in Gurgaon scale their monthly patient appointments through targeted performance marketing:</p>
                    <ul style="padding-left: 20px; margin-bottom: 16px;">
                        <li style="margin-bottom: 8px;"><strong>High-Intent Google Search Ads</strong>: Capturing patients in ${{currentLead.Area}} actively searching for doctor consultations near you right now.</li>
                        <li style="margin-bottom: 8px;"><strong>Targeted Meta Ads (Instagram/FB)</strong>: Building local reach and awareness for your clinic and treatments.</li>
                        <li style="margin-bottom: 8px;"><strong>Direct WhatsApp Booking</strong>: Connecting prospective patients directly to your front desk to confirm appointments.</li>
                    </ul>
                    <p style="margin-bottom: 14px;">We work strictly on a performance model focused on real, paying patient appointments—not vanity social media likes.</p>
                    <p style="margin-bottom: 24px;">Would you be open to a brief 5-minute call this week to see if this could add 25–40 new patient appointments for ${{currentLead.Name}} next month?</p>
                    <p style="margin-bottom: 4px;">Best regards,</p>
                    <p style="margin: 0; line-height: 1.4;">
                        <strong>${{senderName}}</strong><br>
                        <span style="color: #64748b; font-size: 13px;">Digital & Performance Marketing | Healthcare Growth</span><br>
                        <span style="color: #64748b; font-size: 13px;">Email: ${{senderEmail}}</span>${{phoneHtml}}<br>
                        <span style="color: #64748b; font-size: 13px;">Gurgaon, Haryana</span>
                    </p>
                </div>
            `;

            document.getElementById("plainTextContent").innerText = currentBody;

            document.getElementById("dataTableContent").innerHTML = `
                <tr><th>Clinic Name</th><td>${{currentLead.Name}}</td></tr>
                <tr><th>Original Name</th><td>${{currentLead.RawName}}</td></tr>
                <tr><th>Dynamic Email</th><td><strong>${{currentLead.Email}}</strong></td></tr>
                <tr><th>Area / Sector</th><td>${{currentLead.Area}}</td></tr>
                <tr><th>Full Address</th><td>${{currentLead.Address}}</td></tr>
                <tr><th>Phone Number</th><td>${{currentLead.Phone}}</td></tr>
                <tr><th>Website</th><td>${{currentLead.Website}}</td></tr>
                <tr><th>Google Rating</th><td>${{currentLead.Rating}} (${{currentLead.Reviews}} reviews)</td></tr>
                <tr><th>Search Query</th><td>${{currentLead.Query}}</td></tr>
                <tr><th>CSV Sheet Row</th><td>Row ${{currentLead.SheetRow}}</td></tr>
            `;
        }}

        function switchTab(tab) {{
            activeTab = tab;
            document.getElementById("btnHtmlTab").classList.toggle("active", tab === 'html');
            document.getElementById("btnTextTab").classList.toggle("active", tab === 'text');
            document.getElementById("btnDataTab").classList.toggle("active", tab === 'data');

            document.getElementById("htmlView").style.display = tab === 'html' ? 'block' : 'none';
            document.getElementById("textView").style.display = tab === 'text' ? 'block' : 'none';
            document.getElementById("dataView").style.display = tab === 'data' ? 'block' : 'none';
        }}

        function filterBySector(sector) {{
            activeSectorFilter = sector;
            document.querySelectorAll(".chip").forEach(btn => {{
                btn.classList.toggle("active", btn.innerText.includes(sector) || (sector === 'ALL' && btn.innerText.includes('All')));
            }});
            const query = document.getElementById("searchInput").value;
            renderLeadsList(query, sector);
        }}

        document.getElementById("searchInput").addEventListener("input", (e) => {{
            renderLeadsList(e.target.value, activeSectorFilter);
        }});

        function copyToClipboard(text, msg = "Copied to clipboard!") {{
            navigator.clipboard.writeText(text).then(() => {{
                showToast(msg);
            }});
        }}

        function copyFullEmail() {{
            const fullText = `Subject: ${{currentSubject}}\\nTo: ${{currentLead.Email}}\\n\\n${{currentBody}}`;
            copyToClipboard(fullText, "Full email copied!");
        }}

        function showToast(msg) {{
            const t = document.getElementById("toast");
            t.innerText = msg;
            t.classList.add("show");
            setTimeout(() => t.classList.remove("show"), 2000);
        }}

        renderLeadsList();
        renderActiveLeadPreview();
    </script>
</body>
</html>"""

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[+] Dynamic Preview HTML generated at: {output_html_path}", flush=True)


def send_outreach_emails(
    leads: List[Dict[str, str]],
    config: Dict,
    mode: str = "Live",
    dry_run: bool = False,
    limit: Optional[int] = 50,
    delay_range: Tuple[int, int] = (4, 8),
    force: bool = False
):
    """
    Sends personalized cold outreach emails dynamically to each recipient from the sheet.
    Logs each send to sent_log.csv with full tracking headers and metadata.
    """
    sent_df = load_sent_log(SENT_LOG_PATH)
    
    # In Live mode, filter out emails that have already been sent in Live mode
    if mode == "Live" and not force:
        already_sent_emails = set(sent_df[sent_df["Mode"] == "Live"]["Email"].dropna().str.lower().tolist())
        pending_leads = [l for l in leads if l["Email"].lower() not in already_sent_emails]
    else:
        pending_leads = leads

    if limit:
        pending_leads = pending_leads[:limit]

    sender_name = config.get("sender_name", "Vidhi Singhal")
    sender_email = config.get("sender_email", "Dineshvidhi815@gmail.com")
    sender_phone = config.get("sender_phone", "")

    print("\n" + "=" * 65, flush=True)
    print("      HEALTHCARE PERFORMANCE MARKETING OUTREACH ENGINE          ", flush=True)
    print("=" * 65, flush=True)
    print(f"Total Leads Loaded:         {len(leads)}", flush=True)
    print(f"Already Contacted in Live:  {len(sent_df[sent_df['Mode'] == 'Live']) if not sent_df.empty else 0}", flush=True)
    print(f"Queued to Send This Batch:  {len(pending_leads)}", flush=True)
    print(f"Mode:                       {mode.upper()}{' (DRY-RUN)' if dry_run else ''}", flush=True)
    print(f"Sender Identity:            {sender_name} <{sender_email}>", flush=True)
    print("=" * 65 + "\n", flush=True)

    if not pending_leads:
        print("[✓] All available leads in the sheet have already been contacted!")
        print("    No new leads pending in this batch.")
        return

    if dry_run:
        print("[i] DRY-RUN MODE: No actual emails will be dispatched.")
        for idx, lead in enumerate(pending_leads[:3], 1):
            t = get_single_generic_template(
                clinic_name=lead["Name"],
                area=lead["Area"],
                rating=lead.get("Rating", ""),
                sender_name=sender_name,
                sender_email=sender_email,
                sender_phone=sender_phone
            )
            print(f"[Sample #{idx}] Row {lead.get('SheetRow')} in sheet | To: {lead['Email']}")
            print(f"Subject: {t['subject']}")
            print(f"Preview:\n{t['body'][:180]}...\n" + "-" * 50)
        return

    # LIVE SMTP SENDING
    smtp_server = config.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(config.get("smtp_port", 587))
    smtp_user = config.get("smtp_username", "")
    smtp_pass = config.get("smtp_password", "")

    if not smtp_user or not smtp_pass:
        print("[!] ERROR: SMTP credentials missing in email_config.json!")
        return

    print(f"[+] Connecting to SMTP server {smtp_server}:{smtp_port}...", flush=True)
    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.login(smtp_user, smtp_pass)
        print("[✓] SMTP Authentication Successful! Dispatching...\n", flush=True)
    except Exception as err:
        print(f"[!] SMTP Connection Failed: {err}", flush=True)
        return

    sent_count = 0

    for idx, lead in enumerate(pending_leads, 1):
        t = get_single_generic_template(
            clinic_name=lead["Name"],
            area=lead["Area"],
            rating=lead.get("Rating", ""),
            sender_name=sender_name,
            sender_email=sender_email,
            sender_phone=sender_phone
        )

        # Unique RFC Message-ID for tracking replies
        msg_id = make_msgid(domain="gmail.com")

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{sender_name} <{sender_email}>"
        msg["To"] = lead["Email"]
        msg["Subject"] = t["subject"]
        msg["Message-ID"] = msg_id
        
        # Read receipt request headers
        msg["Disposition-Notification-To"] = sender_email
        msg["Return-Receipt-To"] = sender_email
        msg["X-Campaign"] = "Healthcare-Performance-Marketing-Gurgaon"
        msg["X-Lead-Row"] = str(lead.get("SheetRow", ""))

        msg.attach(MIMEText(t["body"], "plain", "utf-8"))
        msg.attach(MIMEText(t["html"], "html", "utf-8"))

        try:
            server.sendmail(sender_email, lead["Email"], msg.as_string())
            sent_count += 1
            print(f"[{idx}/{len(pending_leads)}] [SENT] To: {lead['Email']} | Clinic: {lead['Name']} ({lead['Area']})", flush=True)

            sent_record = {
                "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "Mode": mode,
                "Clinic Name": lead["Name"],
                "Email": lead["Email"],
                "Area": lead["Area"],
                "Subject": t["subject"],
                "Message ID": msg_id,
                "Status": "Sent",
                "Read Receipt Requested": "Yes",
                "Reply Received": "No",
                "Reply Timestamp": "-",
                "Reply Subject": "-",
                "Reply Snippet": "-"
            }

            # Progressive sent log saving
            pd.DataFrame([sent_record]).to_csv(
                SENT_LOG_PATH,
                mode="a" if os.path.exists(SENT_LOG_PATH) else "w",
                header=not os.path.exists(SENT_LOG_PATH),
                index=False
            )

            # Jitter delay between dispatches
            if idx < len(pending_leads):
                sleep_sec = random.uniform(delay_range[0], delay_range[1])
                time.sleep(sleep_sec)

        except Exception as e:
            print(f"[-] [FAILED] To: {lead['Email']} - Error: {e}", flush=True)
            time.sleep(2)

    server.quit()
    print(f"\n[✓] Outreach Batch Completed! {sent_count} emails dispatched.", flush=True)


def main():
    # 1. Load configuration
    config = {
        "sheet_path": DEFAULT_CSV_PATH,
        "test_mode": True,
        "test_recipient": "dineshsingla08@gmail.com",
        "dry_run": False,
        "send_limit": 50,
        "check_replies_on_start": True,
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_username": "Dineshvidhi815@gmail.com",
        "smtp_password": "glqx vnmm irpv fqmg",
        "imap_server": "imap.gmail.com",
        "imap_port": 993,
        "sender_name": "Vidhi Singhal",
        "sender_email": "Dineshvidhi815@gmail.com",
        "sender_phone": "+91 8958573159",
        "delay_seconds_min": 4,
        "delay_seconds_max": 8
    }

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                user_config = json.load(f)
                config.update(user_config)
        except Exception as e:
            print(f"[!] Warning reading config: {e}")

    # CLI overrides
    sheet_path = config.get("sheet_path", DEFAULT_CSV_PATH)
    for i, arg in enumerate(sys.argv):
        if arg == "--sheet" and i + 1 < len(sys.argv):
            sheet_path = sys.argv[i + 1]

    dry_run = config.get("dry_run", False)
    if "--live" in sys.argv:
        dry_run = False
        config["test_mode"] = False
    if "--dry-run" in sys.argv:
        dry_run = True

    send_limit = config.get("send_limit", 50)
    for i, arg in enumerate(sys.argv):
        if arg == "--limit" and i + 1 < len(sys.argv):
            try:
                send_limit = int(sys.argv[i + 1])
            except ValueError:
                pass

    force = "--force" in sys.argv

    # Check incoming replies via IMAP if enabled
    if config.get("check_replies_on_start", True) or "--check-replies" in sys.argv:
        check_incoming_replies(config, SENT_LOG_PATH)
        if "--check-replies" in sys.argv and len(sys.argv) == 2:
            return

    # Test mode logic:
    # If user explicitly asks for --test or --test-to, or config["test_mode"] is True
    is_test_mode = "--test" in sys.argv or "--test-to" in sys.argv or config.get("test_mode", True)
    test_target = config.get("test_recipient", "dineshsingla08@gmail.com")
    for i, arg in enumerate(sys.argv):
        if arg == "--test-to" and i + 1 < len(sys.argv):
            test_target = sys.argv[i + 1]
            is_test_mode = True

    # 2. Load leads dynamically from sheet
    all_sheet_leads = load_leads(sheet_path)
    if not all_sheet_leads:
        print("[!] No leads found in sheet. Please verify the sheet path.")
        return

    # Update rich HTML preview
    generate_preview_html(all_sheet_leads, PREVIEW_HTML_PATH, config)

    # 3. Execution logic: TEST MODE vs LIVE MODE
    if is_test_mode:
        sample_lead = all_sheet_leads[0]
        print(f"\n[🔒 TEST MODE ACTIVE] Destination locked to: {test_target}")
        print(f"[i] Sending strictly ONE test email using clinic data from sheet row 1.")
        leads_to_send = [
            {
                "Name": sample_lead["Name"],
                "Email": test_target,
                "Area": sample_lead["Area"],
                "Rating": sample_lead.get("Rating", ""),
                "Reviews": sample_lead.get("Reviews", ""),
                "Phone": sample_lead.get("Phone", ""),
                "Website": sample_lead.get("Website", ""),
                "Address": sample_lead.get("Address", ""),
                "SheetRow": sample_lead["SheetRow"]
            }
        ]
        send_outreach_emails(
            leads=leads_to_send,
            config=config,
            mode="Test",
            dry_run=dry_run,
            limit=1,
            delay_range=(1, 2),
            force=True
        )
        print(f"\n[i] TEST COMPLETED! Exactly 1 test email sent to {test_target}.")
        print("[i] To start the automated daily 50-email live dispatches:")
        print("    1. Set 'test_mode': false in email_config.json")
        print("    2. Run: python send_outreach.py\n")
        return

    # LIVE DAILY BATCH MODE: Pick next unsent 50 leads from CSV
    sent_df = load_sent_log(SENT_LOG_PATH)
    already_sent_live = set(sent_df[sent_df["Mode"] == "Live"]["Email"].dropna().str.lower().tolist())
    
    unsent_leads = [l for l in all_sheet_leads if l["Email"].lower() not in already_sent_live]

    total_leads = len(all_sheet_leads)
    already_sent_count = len(already_sent_live)
    queued_count = min(len(unsent_leads), send_limit)
    remaining_after = max(0, len(unsent_leads) - queued_count)
    days_left = (remaining_after + send_limit - 1) // send_limit if send_limit else 0

    print("\n" + "=" * 65, flush=True)
    print("     DAILY HEALTHCARE OUTREACH CAMPAIGN PROGRESSION             ", flush=True)
    print("=" * 65, flush=True)
    print(f"Total Verified Leads in CSV:  {total_leads}", flush=True)
    print(f"Already Contacted Previously: {already_sent_count} ({(already_sent_count / total_leads * 100) if total_leads else 0:.1f}%)", flush=True)
    print(f"Remaining Unsent Leads:       {len(unsent_leads)}", flush=True)
    print(f"Sending in Today's Batch:     {queued_count}", flush=True)
    print(f"Remaining After Today:        {remaining_after} (~{days_left} days remaining)", flush=True)
    print("=" * 65 + "\n", flush=True)

    if not unsent_leads:
        print("[✓] All leads in the CSV sheet have been successfully contacted!")
        print("    Outreach campaign complete. No new emails to dispatch today.")
        return

    delay_min = int(config.get("delay_seconds_min", 4))
    delay_max = int(config.get("delay_seconds_max", 8))

    send_outreach_emails(
        leads=unsent_leads,
        config=config,
        mode="Live",
        dry_run=dry_run,
        limit=send_limit,
        delay_range=(delay_min, delay_max),
        force=force
    )


if __name__ == "__main__":
    main()
