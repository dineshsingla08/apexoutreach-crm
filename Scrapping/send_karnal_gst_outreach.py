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
CONFIG_PATH = "d:/Dinesh/antigravity/Scrapping/email_config_karnal_gst.json"
SENT_LOG_PATH = "d:/Dinesh/antigravity/Scrapping/karnal_gst_sent_log.csv"
PREVIEW_HTML_PATH = "d:/Dinesh/antigravity/Scrapping/preview_karnal_gst_email.html"

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


def clean_business_name(raw_name: str) -> str:
    """Cleans noisy SEO descriptors into a crisp, natural business name."""
    if not raw_name or not isinstance(raw_name, str):
        return "Business Owner"
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


def build_gst_ca_email(
    business_name: str,
    area: str,
    category: str,
    pitch_angle: str,
    recommended_service: str,
    rating: str = "",
    reviews: str = "",
    sender_name: str = "CA Ishant Singla",
    sender_email: str = "Ishantsingla94@gmail.com",
    sender_phone: str = "+91 7015147209"
) -> Dict[str, str]:
    """
    Generates a catchy, hook-driven, 360° CA Financial & Tax Advisory email.
    Explicitly features:
    - GST Returns & 2B ITC Reconciliation
    - Income Tax Returns (ITR) & Tax Minimization
    - CMA (Credit Monitoring Analysis) & Bank CC/OD Limits
    - Forecasting, Projected Financials & Project Reports (DPR)
    - Mutual Fund & Corporate Treasury Investment
    """
    clean_area = area if area and area.lower() != "nan" and area != "Karnal" else "Karnal"
    cat_text = category if category and category.lower() != "nan" else "commercial trade & manufacturing"
    
    praise_txt = ""
    praise_html = ""
    try:
        if rating and float(str(rating).strip()) >= 4.0:
            clean_r = str(rating).strip()
            rev_txt = f" across {reviews} reviews" if reviews and str(reviews).strip() != "nan" else ""
            praise_txt = f" (congratulations on your strong {clean_r}★ market reputation{rev_txt})"
            praise_html = f" <span style='color:#047857; font-weight:600;'>(congratulations on your strong {clean_r}★ market reputation{rev_txt})</span>"
    except Exception:
        pass

    clean_wa = re.sub(r"[^\d]", "", sender_phone)
    if not clean_wa.startswith("91") and len(clean_wa) == 10:
        clean_wa = "91" + clean_wa
    clean_phone = sender_phone.replace(" ", "")

    subject = f"CA & Financial Advisory for {business_name}"

    body = f"""Dear {business_name} Team,

I'll keep this brief.

We are a Karnal-based Chartered Accountancy practice helping businesses in {clean_area} save taxes, secure bank funding, and manage surplus capital under one roof:

• GST & Income Tax (ITR): Timely filings, 100% 2B purchase credit matching & zero-penalty compliance.
• Bank Loans & CMA Reports: Fast-track approvals & limit enhancements for CC/OD and term loans.
• Project Reports & Projections: Bank-ready DPRs and 3-5 year projected financials for business expansion.
• Mutual Fund Investments: Growing surplus business profits with high-yield, tax-efficient returns.

Would you be open to a quick 5-minute phone call this week to see how we can assist {business_name}?

Feel free to reply to this email or drop me a text directly on WhatsApp at {sender_phone}.

Best regards,

{sender_name}
Chartered Accountant & Financial Advisor
Phone / WhatsApp: {sender_phone}
Email: {sender_email}
Karnal, Haryana
"""

    card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 550px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{business_name}</strong> Team,</p>
    
    <p>I'll keep this brief.</p>
    
    <p>We are a Karnal-based Chartered Accountancy practice helping growing businesses in <strong>{clean_area}</strong> manage taxes, bank funding, and surplus capital under one roof:</p>
    
    <ul style="padding-left: 20px; margin: 16px 0; color: #334155; line-height: 1.7;">
        <li style="margin-bottom: 8px;"><strong>GST & Income Tax (ITR):</strong> Timely filings, 100% 2B input credit matching & notice protection.</li>
        <li style="margin-bottom: 8px;"><strong>Bank Loans & CMA Reports:</strong> Fast-track approvals & limit enhancements for CC/OD limits and term loans.</li>
        <li style="margin-bottom: 8px;"><strong>Project Reports & Projections:</strong> Bank-ready DPRs and projected financials for business expansion.</li>
        <li style="margin-bottom: 0;"><strong>Mutual Fund Investments:</strong> Smart treasury management to grow surplus profits with tax-efficient returns.</li>
    </ul>

    <p style="margin-top: 18px; margin-bottom: 20px; font-size: 15px;">
        Would you be open to a <strong>quick 5-minute phone call</strong> this week to see how we can assist {business_name}?
    </p>

    <!-- Clear CTAs -->
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 18px; border-radius: 6px; margin-right: 8px;">
            💬 Chat on WhatsApp
        </a>
        <a href="tel:{clean_phone}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 18px; border-radius: 6px; border: 1px solid #cbd5e1;">
            📞 Call {sender_phone}
        </a>
    </div>

    <!-- Minimal Signature -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        Chartered Accountant & Financial Advisor<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7; text-decoration: none;">{sender_phone}</a> &nbsp;|&nbsp; 
        Email: <a href="mailto:{sender_email}" style="color: #0284c7; text-decoration: none;">{sender_email}</a><br>
        Karnal, Haryana
    </div>
</div>"""

    full_html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 20px; background-color: #f8fafc;">
    {card_html}
</body>
</html>"""

    return {
        "id": "karnal_gst_ca_minimal",
        "subject": subject,
        "body": body,
        "card_html": card_html,
        "html": full_html
    }


def load_karnal_leads(csv_path: str) -> List[Dict[str, str]]:
    """Loads and normalizes business leads from Karnal GST CSV."""
    if not os.path.exists(csv_path):
        print(f"[!] File not found: {csv_path}")
        return []

    print(f"[+] Reading leads from: {csv_path}", flush=True)
    df = pd.read_csv(csv_path, encoding="utf-8", dtype=str)
    print(f"    Total rows in CSV: {len(df)}")

    valid_leads = []
    seen_emails = set()

    for idx, row in df.iterrows():
        raw_email = str(row.get("Email", "")).strip()
        if not raw_email or raw_email.lower() == "nan":
            continue

        # Split multiple emails and clean URL prefixes or artifacts like http://, mailto:, etc.
        candidates = [e.strip() for e in re.split(r"[;,\s]", raw_email) if e.strip()]
        selected_email = ""
        for em in candidates:
            # Clean common scrape artifacts
            clean_em = re.sub(r'^(https?://|mailto:|u003e|[<>\s"\'\\])+', '', em, flags=re.IGNORECASE)
            clean_em = re.sub(r'([<>\s"\'\\])+$', '', clean_em).strip().lower()
            if "@" in clean_em and "." in clean_em.split("@")[-1]:
                if not any(re.search(pat, clean_em) for pat in DUMMY_EMAIL_PATTERNS):
                    selected_email = clean_em
                    break

        if not selected_email or selected_email in seen_emails:
            continue

        seen_emails.add(selected_email)

        raw_name = str(row.get("Business Name", ""))
        biz_name = clean_business_name(raw_name)
        area = str(row.get("Karnal Area", "Karnal")).strip()
        if not area or area.lower() == "nan":
            area = "Karnal"

        category = str(row.get("Category", "")).strip()
        pitch_angle = str(row.get("GST Pitch Angle", "")).strip()
        rec_service = str(row.get("Recommended Pitch Service", "")).strip()
        rating = str(row.get("Rating", "")).strip()
        reviews = str(row.get("Reviews", "")).strip()
        phone = str(row.get("WhatsApp Mobile", row.get("Phone Number", ""))).strip()

        valid_leads.append({
            "Name": biz_name,
            "RawName": raw_name,
            "Email": selected_email,
            "Area": area,
            "Category": category,
            "GSTPitchAngle": pitch_angle,
            "RecommendedPitchService": rec_service,
            "Rating": rating,
            "Reviews": reviews,
            "Phone": phone,
            "SheetRow": idx + 2
        })

    print(f"    [✓] Extracted {len(valid_leads)} valid business leads with active emails.\n")
    return valid_leads


def load_sent_log(log_path: str = SENT_LOG_PATH) -> pd.DataFrame:
    """Loads tracking log of sent emails."""
    expected_cols = [
        "Timestamp", "Mode", "Business Name", "Email", "Area", "Category",
        "Subject", "Message ID", "Status"
    ]
    if os.path.exists(log_path):
        try:
            return pd.read_csv(log_path)
        except Exception:
            pass
    return pd.DataFrame(columns=expected_cols)


def run_campaign():
    # 1. Load config
    if not os.path.exists(CONFIG_PATH):
        print(f"[!] Error: Config file not found at {CONFIG_PATH}")
        return

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    sheet_path = config.get("sheet_path", "d:/Dinesh/antigravity/Scrapping/businesses_in_karnal_gst.csv")
    test_mode = config.get("test_mode", True)
    test_recipient = config.get("test_recipient", "dineshsingla08@gmail.com")
    dry_run = config.get("dry_run", False)
    send_limit = int(config.get("send_limit", 50))
    sender_name = config.get("sender_name", "CA Ishant Singla")
    sender_email = config.get("sender_email", "Ishantsingla94@gmail.com")
    sender_phone = config.get("sender_phone", "+91 7015147209")
    smtp_server = config.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(config.get("smtp_port", 587))
    smtp_user = config.get("smtp_username", sender_email)
    smtp_pass = config.get("smtp_password", "").strip()

    # CLI override flags
    if "--live" in sys.argv:
        test_mode = False
        dry_run = False
    if "--test" in sys.argv:
        test_mode = True
    if "--dry-run" in sys.argv:
        dry_run = True

    print("=" * 65)
    print("      KARNAL GST BUSINESSES CA EMAIL OUTREACH SYSTEM         ")
    print("=" * 65)
    print(f"Sender Identity:  {sender_name} ({sender_email})")
    print(f"Phone / WhatsApp: {sender_phone}")
    print(f"Mode:             {'[TEST MODE] (Sending sample to ' + test_recipient + ')' if test_mode else '[LIVE OUTREACH]'}")
    print(f"Dry Run:          {dry_run}")
    print("=" * 65 + "\n")

    # 2. Load leads
    all_leads = load_karnal_leads(sheet_path)
    if not all_leads:
        print("[!] No valid leads found.")
        return

    # Generate interactive HTML preview of the first lead
    sample_lead = all_leads[0]
    sample_email = build_gst_ca_email(
        business_name=sample_lead["Name"],
        area=sample_lead["Area"],
        category=sample_lead["Category"],
        pitch_angle=sample_lead["GSTPitchAngle"],
        recommended_service=sample_lead["RecommendedPitchService"],
        rating=sample_lead["Rating"],
        reviews=sample_lead["Reviews"],
        sender_name=sender_name,
        sender_email=sender_email,
        sender_phone=sender_phone
    )
    with open(PREVIEW_HTML_PATH, "w", encoding="utf-8") as pf:
        pf.write(sample_email["html"])
    print(f"[✓] Generated HTML preview saved to: {PREVIEW_HTML_PATH}")

    # Determine targets
    if test_mode:
        print(f"\n[🔒 TEST MODE ACTIVE]")
        print(f"Rendering live template for first business: {sample_lead['Name']} ({sample_lead['Area']})")
        print(f"Destination locked to test recipient: {test_recipient}\n")
        
        leads_to_send = [{
            "Name": sample_lead["Name"],
            "RawName": sample_lead["RawName"],
            "Email": test_recipient,
            "Area": sample_lead["Area"],
            "Category": sample_lead["Category"],
            "GSTPitchAngle": sample_lead["GSTPitchAngle"],
            "RecommendedPitchService": sample_lead["RecommendedPitchService"],
            "Rating": sample_lead["Rating"],
            "Reviews": sample_lead["Reviews"],
            "Phone": sample_lead["Phone"],
            "SheetRow": sample_lead["SheetRow"]
        }]
    else:
        sent_df = load_sent_log(SENT_LOG_PATH)
        if not sent_df.empty and "Mode" in sent_df.columns:
            already_sent = set(sent_df[sent_df["Mode"] == "Live"]["Email"].dropna().str.lower().tolist())
        elif not sent_df.empty:
            already_sent = set(sent_df["Email"].dropna().str.lower().tolist())
        else:
            already_sent = set()
        leads_to_send = [l for l in all_leads if l["Email"].lower() not in already_sent][:send_limit]
        print(f"[+] Total Verified Leads: {len(all_leads)} | Already Contacted (Live): {len(already_sent)} | Batch To Send: {len(leads_to_send)}")

    if not leads_to_send:
        print("[✓] All leads have already been contacted. Nothing to send.")
        return

    # Check dry run
    if dry_run:
        print("\n[i] DRY RUN MODE: No emails will be transmitted.")
        for idx, lead in enumerate(leads_to_send[:3], 1):
            t = build_gst_ca_email(
                business_name=lead["Name"],
                area=lead["Area"],
                category=lead["Category"],
                pitch_angle=lead["GSTPitchAngle"],
                recommended_service=lead["RecommendedPitchService"],
                rating=lead["Rating"],
                reviews=lead["Reviews"],
                sender_name=sender_name,
                sender_email=sender_email,
                sender_phone=sender_phone
            )
            print(f"\n--- Preview #{idx} to {lead['Email']} ---")
            print(f"Subject: {t['subject']}")
            print(t["body"][:250] + "...")
        return

    def get_smtp_session():
        s = smtplib.SMTP(smtp_server, smtp_port, timeout=30)
        s.ehlo()
        s.starttls()
        s.login(smtp_user, smtp_pass)
        return s

    # Initial SMTP Connection
    print(f"\n[+] Connecting to SMTP Server {smtp_server}:{smtp_port}...", flush=True)
    try:
        server = get_smtp_session()
        print("[✓] SMTP Authentication Successful! Dispatching...\n", flush=True)
    except Exception as err:
        print(f"[!] SMTP Connection Failed: {err}")
        return

    sent_count = 0
    delay_min = int(config.get("delay_seconds_min", 5))
    delay_max = int(config.get("delay_seconds_max", 10))

    for idx, lead in enumerate(leads_to_send, 1):
        # Refresh connection every 25 emails to prevent Gmail connection drop
        if idx > 1 and (idx - 1) % 25 == 0:
            try:
                server.quit()
            except Exception:
                pass
            time.sleep(3)
            try:
                server = get_smtp_session()
            except Exception as e:
                print(f"[!] Periodic SMTP refresh notice: {e}, retrying in 5s...")
                time.sleep(5)
                server = get_smtp_session()

        t = build_gst_ca_email(
            business_name=lead["Name"],
            area=lead["Area"],
            category=lead["Category"],
            pitch_angle=lead["GSTPitchAngle"],
            recommended_service=lead["RecommendedPitchService"],
            rating=lead["Rating"],
            reviews=lead["Reviews"],
            sender_name=sender_name,
            sender_email=sender_email,
            sender_phone=sender_phone
        )

        msg_id = make_msgid(domain="gmail.com")
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{sender_name} <{sender_email}>"
        msg["To"] = lead["Email"]
        msg["Subject"] = t["subject"]
        msg["Message-ID"] = msg_id
        msg["Disposition-Notification-To"] = sender_email
        msg["Return-Receipt-To"] = sender_email
        msg["X-Campaign"] = "Karnal-GST-CA-Outreach"

        msg.attach(MIMEText(t["body"], "plain", "utf-8"))
        msg.attach(MIMEText(t["html"], "html", "utf-8"))

        send_success = False
        for send_attempt in range(1, 3):
            try:
                server.sendmail(sender_email, lead["Email"], msg.as_string())
                send_success = True
                break
            except (smtplib.SMTPServerDisconnected, smtplib.SMTPConnectError, ConnectionResetError, BrokenPipeError, TimeoutError, OSError) as conn_err:
                print(f"[!] SMTP disconnected on lead #{idx} (attempt {send_attempt}): {conn_err}. Reconnecting in 5s...", flush=True)
                time.sleep(5)
                try:
                    server = get_smtp_session()
                except Exception as rec_err:
                    print(f"[!] Reconnection failed: {rec_err}")
            except Exception as send_err:
                print(f"[-] [FAILED] To: {lead['Email']} - Error: {send_err}")
                break

        if send_success:
            sent_count += 1
            print(f"[{idx}/{len(leads_to_send)}] [SENT] To: {lead['Email']} | Business: {lead['Name']} ({lead['Area']})", flush=True)

            # Record in log
            rec = {
                "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "Mode": "Test" if test_mode else "Live",
                "Business Name": lead["Name"],
                "Email": lead["Email"],
                "Area": lead["Area"],
                "Category": lead["Category"],
                "Subject": t["subject"],
                "Message ID": msg_id,
                "Status": "Sent"
            }
            pd.DataFrame([rec]).to_csv(
                SENT_LOG_PATH,
                mode="a" if os.path.exists(SENT_LOG_PATH) else "w",
                header=not os.path.exists(SENT_LOG_PATH),
                index=False
            )

            if idx < len(leads_to_send):
                time.sleep(random.uniform(delay_min, delay_max))
        else:
            print(f"[-] Delivery failed for {lead['Email']}, continuing to next lead.")
            time.sleep(2)

    try:
        server.quit()
    except Exception:
        pass
    print(f"\n" + "=" * 65)
    if test_mode:
        print(f"[✓] TEST EMAIL COMPLETED!")
        print(f"    Check your inbox at: {test_recipient}")
        print(f"    If everything looks great, set 'test_mode': false in email_config_karnal_gst.json to start live outreach.")
    else:
        print(f"[✓] Batch completed: {sent_count} emails sent.")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_campaign()
