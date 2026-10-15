import os
import re
import sys
import time
import random
import json
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import make_msgid
from typing import List, Dict, Optional
import pandas as pd

# Default file paths
CONFIG_PATH = "d:/Dinesh/antigravity/Scrapping/email_config_karnal_mf.json"
DEFAULT_SENT_LOG_PATH = "d:/Dinesh/antigravity/Scrapping/gurgaon_dwarka_mf_sent_log.csv"
PREVIEW_HTML_PATH = "d:/Dinesh/antigravity/Scrapping/preview_gurgaon_dwarka_mf_email.html"

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
    r"sample@email\.com",
    r"noreply",
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
            if len(candidate) >= 3 and not candidate.lower().startswith(("best", "top")):
                name = candidate
                break
    name = re.sub(r'^["\']|["\']$', '', name).strip()
    return name


def get_industry_pitch(category: str, area: str) -> Dict[str, str]:
    """Generates dynamic category-specific hooks for Mutual Fund cash flow optimization."""
    cat_lower = category.lower() if category else ""

    if any(k in cat_lower for k in ["manufactur", "industry", "factory", "machinery", "textile", "packag", "agro"]):
        return {
            "hook": f"For manufacturing businesses and industrial units in {area}, holding idle raw material capital or vendor reserves in 0% current accounts costs lakhs in lost returns every year.",
            "point1": "<strong>Liquid Funds for Operational Cash:</strong> Earn ~6.75% to 7.10% returns on idle working capital with instant T+1 liquidity for supplier payments and payroll.",
            "point2": "<strong>Capex & Equipment SIPs:</strong> Build a dedicated cash reserve for plant upgrades, new machinery, and long-term business expansion.",
            "point3": "<strong>Tax-Smart Treasury Yield:</strong> Significant tax-efficiency compared to standard bank FDs, preserving your manufacturing margins."
        }
    elif any(k in cat_lower for k in ["software", "tech", "it company", "digital", "bpo", "coworking", "consulting"]):
        return {
            "hook": f"For fast-growing tech, software, and corporate firms in {area}, managing operational cash flow and retainer buffers smartly is critical.",
            "point1": "<strong>Corporate Treasury Management:</strong> Park client advances, retainer surpluses, and tax provisions in institutional liquid & ultra-short funds with daily returns.",
            "point2": "<strong>Automated Monthly SIPs:</strong> Build substantial financial reserves for future hiring, tech expansion, and director wealth creation.",
            "point3": "<strong>Superior Post-Tax Returns:</strong> Optimize corporate treasury returns compared to low-yielding savings/fixed bank accounts."
        }
    elif any(k in cat_lower for k in ["clinic", "hospital", "doctor", "dental", "eye", "healthcare", "chemist", "pharmacy"]):
        return {
            "hook": f"For medical practices, clinics, and healthcare establishments in {area}, clinical profits can be structured into high-growth investment avenues rather than staying idle.",
            "point1": "<strong>High-Yield Liquid Funds:</strong> Earn daily compounding returns on day-to-day clinic cash reserves with 24-hour instant withdrawal facility.",
            "point2": "<strong>Wealth-Creation SIPs:</strong> Build a substantial personal and family wealth portfolio to beat inflation and achieve financial independence.",
            "point3": "<strong>Tax-Optimized Growth:</strong> Professional portfolio structuring to maximize returns while legally minimizing tax liability on surplus income."
        }
    elif any(k in cat_lower for k in ["real estate", "builder", "developer", "interior", "architect"]):
        return {
            "hook": f"For real estate and construction firms in {area}, large project cash flows and advance bookings can generate substantial interim income while awaiting site deployment.",
            "point1": "<strong>Short-Term Liquid Parking:</strong> Park project advances in overnight & liquid funds to earn high interest until milestone contractor payouts.",
            "point2": "<strong>Capital Appreciation SIPs:</strong> Systematically reinvest project earnings into balanced equity portfolios for long-term capital growth.",
            "point3": "<strong>Zero Lock-in Liquidity:</strong> Complete freedom to redeem capital within 24 hours whenever land or vendor procurement arises."
        }
    elif any(k in cat_lower for k in ["auto", "vehicle", "workshop", "showroom"]):
        return {
            "hook": f"For automobile dealerships, showrooms, and service hubs in {area}, vehicle sales profits and spare inventory funds can work much harder than 0% current accounts.",
            "point1": "<strong>Inventory & Working Capital Treasury:</strong> Earn attractive daily yield on rotational funds before remitting to OEMs or parts distributors.",
            "point2": "<strong>Long-Term Business SIPs:</strong> Create a strong capital reserve for showroom expansion and new dealership opportunities.",
            "point3": "<strong>Better Post-Tax Yield:</strong> Clean, transparent returns that beat traditional bank deposits with zero withdrawal penalties."
        }
    else:
        return {
            "hook": f"Most commercial businesses in {area} keep extra funds sitting in current accounts earning <strong>0% interest</strong>, or in low-return fixed deposits.",
            "point1": "<strong>Liquid Funds for Idle Working Capital:</strong> Earn ~6.75%+ on spare cash with complete freedom to withdraw anytime within 24 hours.",
            "point2": "<strong>Systematic Monthly SIPs:</strong> Build a disciplined financial backup and create long-term wealth for your family and future business expansion.",
            "point3": "<strong>Tax-Smart Growth:</strong> Enjoy higher post-tax returns compared to traditional bank fixed deposits (FD)."
        }


def build_dynamic_mf_email(
    business_name: str,
    city: str,
    area: str,
    category: str,
    rating: str = "",
    reviews: str = "",
    sender_name: str = "CA Ishant Singla",
    sender_email: str = "Ishantsingla94@gmail.com",
    sender_phone: str = "+91 7015147209"
) -> Dict[str, str]:
    """
    Builds a highly personalized, dynamic Mutual Fund investment email
    tailored specifically for the business's industry, city, area, and rating.
    """
    clean_city = city if city and city.lower() != "nan" else "Delhi NCR"
    clean_area = area if area and area.lower() != "nan" and area != clean_city else clean_city

    # Rating praise snippet
    praise_txt = ""
    praise_html = ""
    try:
        if rating and float(str(rating).strip()) >= 4.0:
            clean_r = str(rating).strip()
            rev_txt = f" across {reviews} reviews" if reviews and str(reviews).strip() != "nan" and reviews != "0" else ""
            praise_txt = f" (Congratulations on your strong {clean_r}★ market reputation{rev_txt}!)"
            praise_html = f" <span style='color: #047857; font-weight: 600;'>(Congratulations on your strong {clean_r}★ market reputation{rev_txt}!)</span>"
    except Exception:
        pass

    pitch = get_industry_pitch(category, clean_area)

    clean_wa = re.sub(r"[^\d]", "", sender_phone)
    if not clean_wa.startswith("91") and len(clean_wa) == 10:
        clean_wa = "91" + clean_wa
    clean_phone = sender_phone.replace(" ", "")

    subject = f"Smart Mutual Fund & Treasury Investment for {business_name}"

    body = f"""Dear {business_name} Team,{praise_txt}

I hope you are doing well.

{pitch['hook']}

With Mutual Funds, you can easily make your surplus business cash work harder for you:

1. Liquid Funds for Idle Cash: Earn ~6.75%+ on spare working capital with instant access — withdraw your funds anytime within 24 hours.
2. Monthly SIPs: Build a disciplined financial backup and create long-term wealth for your family and future business expansion.
3. Tax-Smart Growth: Enjoy higher post-tax returns compared to traditional fixed deposits (FD).

As a Chartered Accountant and Financial Advisor serving businesses across {clean_city}, I help business owners choose safe, transparent, and high-performing mutual funds tailored to their cash flow.

Would you be open to a quick 5-minute phone call this week to see how much your surplus funds can earn?

Feel free to reply to this email, or message me directly on WhatsApp at {sender_phone}.

Warm regards,

{sender_name}
Chartered Accountant & Financial Advisor
Serving {clean_city} & Surrounding NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}
"""

    card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        💡 Smart Cash & Treasury Advisory • {clean_area}
    </div>

    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{business_name}</strong> Team,{praise_html}</p>
    
    <p>I hope you are doing well.</p>
    
    <p>{pitch['hook']}</p>
    
    <p>With Mutual Funds, you can easily make your surplus business cash work harder for you:</p>
    
    <ul style="padding-left: 20px; margin: 16px 0; color: #334155; line-height: 1.7;">
        <li style="margin-bottom: 9px;">
            {pitch['point1']}
        </li>
        <li style="margin-bottom: 9px;">
            {pitch['point2']}
        </li>
        <li style="margin-bottom: 0;">
            {pitch['point3']}
        </li>
    </ul>

    <p style="margin-top: 16px; margin-bottom: 20px; font-size: 15px;">
        As a Chartered Accountant and Financial Advisor serving businesses across <strong>{clean_city}</strong>, I help owners pick safe, SEBI-regulated, and high-performing mutual funds tailored to their cash flow.
    </p>

    <p style="margin-bottom: 20px; font-size: 15px;">
        Would you be open to a <strong>quick 5-minute phone call</strong> this week to see how much your surplus funds can earn?
    </p>

    <!-- Clear CTAs -->
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">
            💬 Chat on WhatsApp
        </a>
        <a href="tel:{clean_phone}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">
            📞 Call {sender_phone}
        </a>
    </div>

    <!-- Minimal Signature -->
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        Chartered Accountant & Financial Advisor<br>
        Serving {clean_city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7; text-decoration: none;">{sender_phone}</a> &nbsp;|&nbsp; 
        Email: <a href="mailto:{sender_email}" style="color: #0284c7; text-decoration: none;">{sender_email}</a>
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
        "id": "gurgaon_dwarka_mf_investment",
        "subject": subject,
        "body": body,
        "card_html": card_html,
        "html": full_html
    }


def load_dynamic_leads(csv_path: str) -> List[Dict[str, str]]:
    """Loads and normalizes business leads from any CSV (Gurgaon/Dwarka or Karnal)."""
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

        candidates = [e.strip() for e in re.split(r"[;,\s]", raw_email) if e.strip()]
        selected_email = ""
        for em in candidates:
            clean_em = re.sub(r'^(https?://|mailto:|u003e|[<>\s"\'\\])+', '', em, flags=re.IGNORECASE)
            clean_em = re.sub(r'([<>\s"\'\\])+$', '', clean_em).strip().lower()
            if "@" in clean_em and "." in clean_em.split("@")[-1]:
                if not any(re.search(pat, clean_em) for pat in DUMMY_EMAIL_PATTERNS):
                    selected_email = clean_em
                    break

        if not selected_email or selected_email in seen_emails:
            continue

        seen_emails.add(selected_email)

        raw_name = str(row.get("Business Name", row.get("Name", "")))
        biz_name = clean_business_name(raw_name)

        city = str(row.get("City", "Delhi NCR")).strip()
        if not city or city.lower() == "nan":
            city = "Gurgaon / Delhi NCR"

        area = str(row.get("Area", row.get("Karnal Area", city))).strip()
        if not area or area.lower() == "nan":
            area = city

        category = str(row.get("Category", "Corporate & Commercial Services")).strip()
        rating = str(row.get("Rating", "")).strip()
        reviews = str(row.get("Reviews", "")).strip()
        phone = str(row.get("WhatsApp Mobile", row.get("Phone Number", ""))).strip()

        valid_leads.append({
            "Name": biz_name,
            "RawName": raw_name,
            "Email": selected_email,
            "City": city,
            "Area": area,
            "Category": category,
            "Rating": rating,
            "Reviews": reviews,
            "Phone": phone,
            "SheetRow": idx + 2
        })

    print(f"    [✓] Extracted {len(valid_leads)} valid businesses with active email addresses.\n")
    return valid_leads


def load_sent_log(log_path: str) -> pd.DataFrame:
    """Loads tracking log of sent emails."""
    expected_cols = [
        "Timestamp", "Mode", "Business Name", "Email", "City", "Area", "Category",
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

    sheet_path = config.get("sheet_path", "d:/Dinesh/antigravity/Scrapping/businesses_in_gurgaon_dwarka_with_email.csv")
    sent_log_path = config.get("sent_log_path", DEFAULT_SENT_LOG_PATH)
    test_mode = config.get("test_mode", False)
    test_recipient = config.get("test_recipient", "dineshsingla08@gmail.com")
    dry_run = config.get("dry_run", False)
    send_limit = int(config.get("send_limit", 5000))
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

    for arg in sys.argv:
        if arg.startswith("--limit="):
            try:
                send_limit = int(arg.split("=")[1])
            except ValueError:
                pass

    print("=" * 65)
    print("   DYNAMIC MUTUAL FUND EMAIL OUTREACH (GURGAON & DWARKA)   ")
    print("=" * 65)
    print(f"Sender Identity:  {sender_name} ({sender_email})")
    print(f"Phone / WhatsApp: {sender_phone}")
    print(f"Mode:             {'[TEST MODE] (Sending sample to ' + test_recipient + ')' if test_mode else '[LIVE OUTREACH - ONE BY ONE]'}")
    print(f"Dry Run:          {dry_run}")
    print(f"Send Limit:       {send_limit}")
    print(f"Lead Source:      {sheet_path}")
    print(f"Tracking Log:     {sent_log_path}")
    print("=" * 65 + "\n")

    # 2. Load leads
    all_leads = load_dynamic_leads(sheet_path)
    if not all_leads:
        print("[!] No valid leads found.")
        return

    # Generate interactive HTML preview of the first lead
    sample_lead = all_leads[0]
    sample_email = build_dynamic_mf_email(
        business_name=sample_lead["Name"],
        city=sample_lead["City"],
        area=sample_lead["Area"],
        category=sample_lead["Category"],
        rating=sample_lead.get("Rating", ""),
        reviews=sample_lead.get("Reviews", ""),
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
        print(f"Rendering dynamic template for: {sample_lead['Name']} ({sample_lead['Area']}, {sample_lead['City']}) - {sample_lead['Category']}")
        print(f"Destination locked to test recipient: {test_recipient}\n")
        
        leads_to_send = [{
            "Name": sample_lead["Name"],
            "RawName": sample_lead["RawName"],
            "Email": test_recipient,
            "City": sample_lead["City"],
            "Area": sample_lead["Area"],
            "Category": sample_lead["Category"],
            "Rating": sample_lead.get("Rating", ""),
            "Reviews": sample_lead.get("Reviews", ""),
            "Phone": sample_lead["Phone"],
            "SheetRow": sample_lead["SheetRow"]
        }]
    else:
        sent_df = load_sent_log(sent_log_path)
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
            t = build_dynamic_mf_email(
                business_name=lead["Name"],
                city=lead["City"],
                area=lead["Area"],
                category=lead["Category"],
                rating=lead.get("Rating", ""),
                reviews=lead.get("Reviews", ""),
                sender_name=sender_name,
                sender_email=sender_email,
                sender_phone=sender_phone
            )
            print(f"\n--- Preview #{idx} to {lead['Email']} ({lead['City']} | {lead['Category']}) ---")
            print(f"Subject: {t['subject']}")
            print(t["body"][:300] + "...")
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
        print("[✓] SMTP Authentication Successful! Dispatching one by one...\n", flush=True)
    except Exception as err:
        print(f"[!] SMTP Connection Failed: {err}")
        return

    sent_count = 0
    delay_min = int(config.get("delay_seconds_min", 5))
    delay_max = int(config.get("delay_seconds_max", 10))

    for idx, lead in enumerate(leads_to_send, 1):
        # Refresh connection periodically every 25 emails
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

        t = build_dynamic_mf_email(
            business_name=lead["Name"],
            city=lead["City"],
            area=lead["Area"],
            category=lead["Category"],
            rating=lead.get("Rating", ""),
            reviews=lead.get("Reviews", ""),
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
        msg["X-Campaign"] = "Gurgaon-Dwarka-MF-Outreach"

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
            print(f"[{idx}/{len(leads_to_send)}] [SENT] To: {lead['Email']} | {lead['Name']} ({lead['Area']}, {lead['City']}) - {lead['Category']}", flush=True)

            rec = {
                "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                "Mode": "Test" if test_mode else "Live",
                "Business Name": lead["Name"],
                "Email": lead["Email"],
                "City": lead["City"],
                "Area": lead["Area"],
                "Category": lead["Category"],
                "Subject": t["subject"],
                "Message ID": msg_id,
                "Status": "Sent"
            }
            pd.DataFrame([rec]).to_csv(
                sent_log_path,
                mode="a" if os.path.exists(sent_log_path) else "w",
                header=not os.path.exists(sent_log_path),
                index=False
            )

            if idx < len(leads_to_send):
                delay = random.uniform(delay_min, delay_max)
                print(f"    Waiting {delay:.1f}s before next email...")
                time.sleep(delay)
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
        print(f"    Sample test email sent to: {test_recipient}")
        print(f"    To start sending live one by one to all businesses, run with: python send_karnal_mf_outreach.py --live")
    else:
        print(f"[✓] Batch completed: {sent_count} Mutual Fund emails sent successfully.")
    print("=" * 65 + "\n")


if __name__ == "__main__":
    run_campaign()
