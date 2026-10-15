import os
import re
import sys
import time
import random
import json
import urllib.parse
from typing import List, Dict, Tuple, Optional
import pandas as pd
from playwright.sync_api import sync_playwright

# File paths
DEFAULT_CSV_PATH = "d:/Dinesh/antigravity/Scrapping/clinics_in_gurgaon.csv"
CONFIG_PATH = "d:/Dinesh/antigravity/Scrapping/whatsapp_config.json"
SENT_LOG_PATH = "d:/Dinesh/antigravity/Scrapping/whatsapp_sent_log.csv"
PREVIEW_HTML_PATH = "d:/Dinesh/antigravity/Scrapping/preview_whatsapp.html"
SESSION_DIR = "d:/Dinesh/antigravity/Scrapping/.whatsapp_session"

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


def sanitize_whatsapp_phone(raw_phone: str) -> Optional[str]:
    """
    Sanitizes Indian phone numbers into international WhatsApp format (e.g. 919729526111).
    Validates that the number is a valid 10-digit mobile starting with 6, 7, 8, 9.
    Filters out landlines (e.g. 0124...).
    """
    if not raw_phone or pd.isna(raw_phone):
        return None
    
    digits = re.sub(r"\D", "", str(raw_phone))
    
    # Format: 09729526111 (11 digits with leading 0)
    if len(digits) == 11 and digits.startswith("0") and digits[1] in "6789":
        return "91" + digits[1:]
    
    # Format: 9729526111 (10 digits)
    if len(digits) == 10 and digits[0] in "6789":
        return "91" + digits
        
    # Format: 919729526111 (12 digits with country code)
    if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
        return digits
        
    return None


def get_whatsapp_template(
    clinic_name: str,
    area: str,
    rating: str = "",
    sender_name: str = "Vidhi Singhal"
) -> Dict[str, str]:
    """
    Generates a conversational, high-converting WhatsApp message tailored for clinics.
    Uses native WhatsApp formatting (*bold*).
    """
    praise_txt = ""
    try:
        if rating and float(str(rating).strip()) >= 4.0:
            clean_r = str(rating).strip()
            praise_txt = f" (congrats on your {clean_r}★ Google rating)"
    except Exception:
        pass

    message = f"""Hi *{clinic_name}* Team 👋

I came across your practice in *{area}*{praise_txt} and wanted to reach out directly.

Quick question: Are you currently looking to acquire *25–40 qualified patient OPD appointments* every month via targeted performance marketing?

We build predictable patient acquisition systems for clinics in Gurgaon:
• *High-Intent Google Search Ads*: Target patients actively searching for doctor consultations near you in {area}.
• *Meta Ads (Instagram/FB)*: Build strong local trust and patient treatment inquiries.
• *Automated WhatsApp Booking*: Route prospective patients directly to your front desk to confirm appointments.

We work strictly on ROI and verified patient consultations—not vanity social media likes.

Would you be open to a quick 3-minute chat or seeing a short breakdown of patient demand in {area}?

Reply *YES* and I will share a quick 1-page growth roadmap for {clinic_name}.

Best regards,
*{sender_name}*
Healthcare Growth Lead | Clinical Performance Marketing
Gurgaon, Haryana"""

    return {
        "text": message,
        "encoded": urllib.parse.quote(message)
    }


def load_whatsapp_leads(sheet_path: str) -> List[Dict[str, str]]:
    """
    Loads and sanitizes clinic leads with valid WhatsApp mobile numbers.
    """
    if not os.path.exists(sheet_path):
        print(f"[!] Sheet not found: {sheet_path}")
        return []

    print(f"[+] Loading clinics from: {sheet_path}", flush=True)
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

    # Map columns
    cols = {c.lower().strip(): c for c in df.columns}
    phone_col = next((cols[k] for k in cols if any(p in k for p in ["phone", "mobile", "contact"])), None)
    name_col = next((cols[k] for k in cols if any(p in k for p in ["name", "clinic"])), None)
    addr_col = next((cols[k] for k in cols if any(p in k for p in ["address", "location", "area"])), None)
    rating_col = next((cols[k] for k in cols if "rating" in k), None)
    reviews_col = next((cols[k] for k in cols if "review" in k), None)

    if not phone_col:
        print(f"[!] ERROR: Could not find Phone Number column in sheet.")
        return []

    valid_leads = []
    seen_phones = set()

    for idx, row in df.iterrows():
        raw_phone = str(row.get(phone_col, "")).strip()
        wa_phone = sanitize_whatsapp_phone(raw_phone)
        if not wa_phone or wa_phone in seen_phones:
            continue

        seen_phones.add(wa_phone)
        raw_name = str(row.get(name_col, "")) if name_col else ""
        raw_addr = str(row.get(addr_col, "")) if addr_col else ""
        raw_rating = str(row.get(rating_col, "")) if rating_col else ""
        raw_reviews = str(row.get(reviews_col, "")) if reviews_col else ""

        clinic_name = clean_clinic_name(raw_name) if raw_name and raw_name.lower() != "nan" else "Doctor / Clinic Director"
        area = extract_sector(raw_addr) if raw_addr and raw_addr.lower() != "nan" else "Gurgaon"

        valid_leads.append({
            "Name": clinic_name,
            "RawName": raw_name,
            "Phone": wa_phone,  # 12-digit international format (91XXXXXXXXXX)
            "RawPhone": raw_phone,
            "Area": area,
            "Rating": raw_rating if raw_rating.lower() != "nan" else "",
            "Reviews": raw_reviews if raw_reviews.lower() != "nan" else "",
            "Address": raw_addr if raw_addr.lower() != "nan" else "",
            "SheetRow": idx + 2
        })

    print(f"    [✓] Found {len(valid_leads)} clinics with verified WhatsApp mobile numbers.\n")
    return valid_leads


def load_whatsapp_sent_log(log_path: str = SENT_LOG_PATH) -> pd.DataFrame:
    """Loads or creates the WhatsApp outreach tracking log."""
    expected_cols = [
        "Timestamp", "Mode", "Clinic Name", "Phone Number", "Area",
        "Rating", "Status", "Reply Received", "Reply Timestamp", "Reply Snippet"
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
                    elif col in ["Reply Timestamp", "Reply Snippet"]:
                        df[col] = "-"
                    elif col == "Status":
                        df[col] = "Sent"
                    else:
                        df[col] = ""
            return df[expected_cols]
        except Exception:
            pass
    return pd.DataFrame(columns=expected_cols)


def generate_whatsapp_preview_html(leads: List[Dict[str, str]], output_html_path: str, config: Dict):
    """Generates an interactive WhatsApp conversation simulator preview."""
    sender_name = config.get("sender_name", "Vidhi Singhal")
    sender_phone = config.get("sender_phone", "8958573159")
    leads_json = json.dumps(leads)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp Outreach Funnel - Healthcare Clinics</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #111b21;
            color: #e9edef;
            line-height: 1.5;
        }}
        .top-navbar {{
            background: #202c33;
            color: #fff;
            padding: 16px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #2a3942;
        }}
        .brand {{ display: flex; align-items: center; gap: 10px; }}
        .wa-icon {{
            background: #25d366;
            color: #fff;
            font-size: 20px;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }}
        .stats-badge {{
            background: #2a3942;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            color: #00a884;
            font-weight: 600;
        }}

        .main-layout {{
            max-width: 1300px;
            margin: 20px auto;
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 20px;
            height: calc(100vh - 100px);
            padding: 0 16px;
        }}

        /* Left Chat List */
        .chat-list-panel {{
            background: #111b21;
            border: 1px solid #2a3942;
            border-radius: 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }}
        .search-area {{
            padding: 12px;
            background: #202c33;
            border-bottom: 1px solid #2a3942;
        }}
        .search-input {{
            width: 100%;
            background: #111b21;
            border: 1px solid #2a3942;
            padding: 8px 12px;
            border-radius: 8px;
            color: #e9edef;
            font-size: 13px;
            outline: none;
        }}
        .search-input:focus {{ border-color: #00a884; }}
        .contacts-scroll {{
            flex: 1;
            overflow-y: auto;
        }}
        .contact-card {{
            padding: 12px 16px;
            border-bottom: 1px solid #202c33;
            cursor: pointer;
            transition: background 0.15s;
        }}
        .contact-card:hover {{ background: #202c33; }}
        .contact-card.active {{ background: #2a3942; }}
        .card-top {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }}
        .contact-name {{ font-size: 14px; font-weight: 600; color: #e9edef; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; }}
        .contact-area {{ font-size: 11px; background: #005c4b; color: #d1fae5; padding: 2px 6px; border-radius: 4px; }}
        .card-sub {{ display: flex; justify-content: space-between; font-size: 12px; color: #8696a0; }}
        .contact-phone {{ font-family: monospace; color: #53bdeb; }}

        /* Right Chat Simulator */
        .chat-stage {{
            background: #0b141a;
            border: 1px solid #2a3942;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background-image: radial-gradient(#202c33 1px, transparent 1px);
            background-size: 20px 20px;
        }}
        .chat-stage-header {{
            background: #202c33;
            padding: 14px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #2a3942;
        }}
        .active-user-info {{ display: flex; align-items: center; gap: 12px; }}
        .avatar {{
            width: 40px;
            height: 40px;
            background: #00a884;
            color: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
        }}
        .chat-stage-body {{
            flex: 1;
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }}
        .message-bubble-outgoing {{
            align-self: flex-end;
            background: #005c4b;
            color: #e9edef;
            padding: 14px 18px;
            border-radius: 8px 8px 0px 8px;
            max-width: 580px;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            position: relative;
        }}
        .bubble-meta {{
            display: flex;
            justify-content: flex-end;
            align-items: center;
            gap: 4px;
            margin-top: 8px;
            font-size: 11px;
            color: #8696a0;
        }}
        .double-check {{ color: #53bdeb; font-weight: bold; }}

        .action-bar {{
            background: #202c33;
            padding: 12px 20px;
            border-top: 1px solid #2a3942;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        .btn {{
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }}
        .btn-wa {{ background: #00a884; color: #fff; }}
        .btn-wa:hover {{ background: #02906f; }}
        .btn-copy {{ background: #2a3942; color: #e9edef; }}
        .btn-copy:hover {{ background: #374751; }}

        .toast {{
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #00a884;
            color: #fff;
            padding: 10px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 600;
            opacity: 0;
            transition: opacity 0.3s;
            z-index: 100;
        }}
        .toast.show {{ opacity: 1; }}
    </style>
</head>
<body>

    <header class="top-navbar">
        <div class="brand">
            <div class="wa-icon">💬</div>
            <div>
                <h1 style="font-size: 17px; font-weight: 700;">WhatsApp Outreach Funnel Simulator</h1>
                <p style="font-size: 12px; color: #8696a0;">Sender: +91 {sender_phone} ({sender_name}) | Test Receiver: +91 {config.get('test_recipient')}</p>
            </div>
        </div>
        <div class="stats-badge">
            {len(leads)} Verified WhatsApp Mobiles in CSV
        </div>
    </header>

    <div class="main-layout">
        <!-- Contact List -->
        <aside class="chat-list-panel">
            <div class="search-area">
                <input type="text" id="searchContact" class="search-input" placeholder="Search clinic, sector, or mobile...">
            </div>
            <div class="contacts-scroll" id="contactsContainer"></div>
        </aside>

        <!-- Chat Simulator -->
        <main class="chat-stage">
            <div class="chat-stage-header">
                <div class="active-user-info">
                    <div class="avatar" id="avatarLetter">W</div>
                    <div>
                        <div style="font-size: 15px; font-weight: 600;" id="activeClinicName">Wellstar Clinic</div>
                        <div style="font-size: 12px; color: #8696a0;" id="activeClinicMeta">+91 9729526111 • Sector 56</div>
                    </div>
                </div>
                <div>
                    <span id="activeRatingBadge" style="background: #2a3942; color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">⭐ 4.8 Rating</span>
                </div>
            </div>

            <div class="chat-stage-body">
                <div class="message-bubble-outgoing" id="chatBubble">
                    <!-- Dynamic WhatsApp text -->
                </div>
            </div>

            <div class="action-bar">
                <div style="font-size: 13px; color: #8696a0;">
                    Simulating dispatch from: <strong>+91 {sender_phone}</strong>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-copy" onclick="copyTextMessage()">Copy Message</button>
                    <a id="btnOpenWeb" href="#" target="_blank" class="btn btn-wa">Open in WhatsApp Web ↗</a>
                </div>
            </div>
        </main>
    </div>

    <div class="toast" id="toast">Message copied to clipboard!</div>

    <script>
        const leads = {leads_json};
        const senderName = "{sender_name}";
        let selectedIndex = 0;
        let currentLead = leads[0] || {{}};
        let currentRawText = "";

        function renderContacts(query = "") {{
            const container = document.getElementById("contactsContainer");
            container.innerHTML = "";
            const q = query.toLowerCase().trim();

            leads.forEach((l, idx) => {{
                if (q && !l.Name.toLowerCase().includes(q) && !l.Area.toLowerCase().includes(q) && !l.Phone.includes(q)) {{
                    return;
                }}

                const div = document.createElement("div");
                div.className = "contact-card" + (idx === selectedIndex ? " active" : "");
                div.onclick = () => selectContact(idx);

                div.innerHTML = `
                    <div class="card-top">
                        <span class="contact-name">${{l.Name}}</span>
                        <span class="contact-area">${{l.Area}}</span>
                    </div>
                    <div class="card-sub">
                        <span class="contact-phone">+${{l.Phone}}</span>
                        <span>${{l.Rating ? '⭐ ' + l.Rating : ''}}</span>
                    </div>
                `;
                container.appendChild(div);
            }});
        }}

        function selectContact(idx) {{
            selectedIndex = idx;
            currentLead = leads[idx];

            document.querySelectorAll(".contact-card").forEach((el, i) => {{
                el.classList.toggle("active", i === idx);
            }});

            renderActiveChat();
        }}

        function renderActiveChat() {{
            if (!currentLead) return;

            document.getElementById("activeClinicName").innerText = currentLead.Name;
            document.getElementById("activeClinicMeta").innerText = `+${{currentLead.Phone}} • ${{currentLead.Area}}`;
            document.getElementById("avatarLetter").innerText = currentLead.Name.charAt(0);
            document.getElementById("activeRatingBadge").innerText = currentLead.Rating ? `⭐ ${{currentLead.Rating}} (${{currentLead.Reviews || '0'}} reviews)` : "Verified Clinic";

            let praise = "";
            if (currentLead.Rating && parseFloat(currentLead.Rating) >= 4.0) {{
                praise = ` (congrats on your ${{currentLead.Rating}}★ Google rating)`;
            }}

            currentRawText = `Hi *${{currentLead.Name}}* Team 👋\\n\\nI came across your practice in *${{currentLead.Area}}*${{praise}} and wanted to reach out directly.\\n\\nQuick question: Are you currently looking to acquire *25–40 qualified patient OPD appointments* every month via targeted performance marketing?\\n\\nWe build predictable patient acquisition systems for clinics in Gurgaon:\\n• *High-Intent Google Search Ads*: Target patients actively searching for doctor consultations near you in ${{currentLead.Area}}.\\n• *Meta Ads (Instagram/FB)*: Build strong local trust and patient treatment inquiries.\\n• *Automated WhatsApp Booking*: Route prospective patients directly to your front desk to confirm appointments.\\n\\nWe work strictly on ROI and verified patient consultations—not vanity social media likes.\\n\\nWould you be open to a quick 3-minute chat or seeing a short breakdown of patient demand in ${{currentLead.Area}}?\\n\\nReply *YES* and I will share a quick 1-page growth roadmap for ${{currentLead.Name}}.\\n\\nBest regards,\\n*${{senderName}}*\\nHealthcare Growth Lead | Clinical Performance Marketing\\nGurgaon, Haryana`;

            // Convert *bold* to <strong> for browser rendering
            let htmlFormatted = currentRawText.replace(/\\*(.*?)\\*/g, "<strong>$1</strong>");
            htmlFormatted = htmlFormatted.replace(/\\n/g, "<br>");

            const now = new Date();
            const timeStr = now.toLocaleTimeString([], {{ hour: '2-digit', minute: '2-digit' }});

            document.getElementById("chatBubble").innerHTML = `
                ${{htmlFormatted}}
                <div class="bubble-meta">
                    <span>${{timeStr}}</span>
                    <span class="double-check">✓✓</span>
                </div>
            `;

            // WhatsApp Web direct click-to-chat URL
            const encoded = encodeURIComponent(currentRawText);
            document.getElementById("btnOpenWeb").href = `https://web.whatsapp.com/send?phone=${{currentLead.Phone}}&text=${{encoded}}`;
        }}

        function copyTextMessage() {{
            navigator.clipboard.writeText(currentRawText).then(() => {{
                const t = document.getElementById("toast");
                t.classList.add("show");
                setTimeout(() => t.classList.remove("show"), 2000);
            }});
        }}

        document.getElementById("searchContact").addEventListener("input", (e) => {{
            renderContacts(e.target.value);
        }});

        renderContacts();
        renderActiveChat();
    </script>
</body>
</html>"""

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"[+] WhatsApp Preview Dashboard generated at: {output_html_path}", flush=True)


def send_whatsapp_messages(
    leads: List[Dict[str, str]],
    config: Dict,
    mode: str = "Live",
    dry_run: bool = False,
    limit: int = 50,
    delay_range: Tuple[int, int] = (10, 20),
    force: bool = False
):
    """
    Automates sending WhatsApp outreach messages via WhatsApp Web with persistent browser session.
    Logs each message to whatsapp_sent_log.csv.
    """
    sent_df = load_whatsapp_sent_log(SENT_LOG_PATH)

    if mode == "Live" and not force:
        already_sent_phones = set(sent_df[sent_df["Mode"] == "Live"]["Phone Number"].dropna().astype(str).tolist())
        pending_leads = [l for l in leads if str(l["Phone"]) not in already_sent_phones]
    else:
        pending_leads = leads

    if limit:
        pending_leads = pending_leads[:limit]

    sender_name = config.get("sender_name", "Vidhi Singhal")
    sender_phone = config.get("sender_phone", "8958573159")

    print("\n" + "=" * 65, flush=True)
    print("      WHATSAPP HEALTHCARE PERFORMANCE MARKETING OUTREACH        ", flush=True)
    print("=" * 65, flush=True)
    print(f"Total Leads Loaded:         {len(leads)}", flush=True)
    print(f"Already Contacted in Live:  {len(sent_df[sent_df['Mode'] == 'Live']) if not sent_df.empty else 0}", flush=True)
    print(f"Queued in This Batch:       {len(pending_leads)}", flush=True)
    print(f"Mode:                       {mode.upper()}{' (DRY-RUN)' if dry_run else ''}", flush=True)
    print(f"Sender WhatsApp:            +91 {sender_phone} ({sender_name})", flush=True)
    print("=" * 65 + "\n", flush=True)

    if not pending_leads:
        print("[✓] All available clinic contacts in the sheet have already been messaged!")
        return 0

    if dry_run:
        print("[i] DRY-RUN MODE: No actual WhatsApp messages will be dispatched.")
        for idx, lead in enumerate(pending_leads[:3], 1):
            t = get_whatsapp_template(lead["Name"], lead["Area"], lead.get("Rating", ""), sender_name=sender_name)
            print(f"[Sample #{idx}] +{lead['Phone']} ({lead['Name']} - {lead['Area']})")
            print(f"Direct Link: https://wa.me/{lead['Phone']}?text={t['encoded'][:60]}...")
            print(f"Message Preview:\n{t['text'][:160]}...\n" + "-" * 50)
        return 0

    # PLAYWRIGHT AUTOMATION
    print("[+] Launching WhatsApp Web Automation Engine...", flush=True)
    os.makedirs(SESSION_DIR, exist_ok=True)

    with sync_playwright() as p:
        try:
            # Launch persistent browser context with anti-detection stealth flags
            context = p.chromium.launch_persistent_context(
                user_data_dir=SESSION_DIR,
                channel="chrome",
                headless=config.get("headless", False),
                ignore_default_args=["--enable-automation"],
                args=[
                    "--start-maximized",
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars"
                ]
            )
            context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
            page = context.pages[0] if context.pages else context.new_page()

            print("[+] Opening WhatsApp Web...", flush=True)
            page.goto("https://web.whatsapp.com", wait_until="load", timeout=60000)

            # Intelligent check for WhatsApp login state
            print("[i] Checking WhatsApp login status...", flush=True)
            is_logged_in = False
            
            # Wait up to 20 seconds to see whether existing session or QR login appears
            for _ in range(10):
                time.sleep(2)
                if page.query_selector("#pane-side, [data-testid='chat-list']"):
                    is_logged_in = True
                    break
                if page.query_selector("canvas, [data-testid='qrcode'], span:has-text('Log in with phone number')"):
                    break
            
            if not is_logged_in:
                print("\n" + "=" * 65, flush=True)
                print(" [!] WHATSAPP AUTHENTICATION REQUIRED (ONE-TIME SETUP)", flush=True)
                print(f"     Sender Number: +91 {sender_phone} ({sender_name})", flush=True)
                print(f"     1. Open WhatsApp on your phone (+91 {sender_phone})", flush=True)
                print("     2. Tap Menu (3 dots) or Settings -> Linked Devices -> Link a Device", flush=True)
                print("     3. Scan the QR code shown in the open Chrome browser window", flush=True)
                print("        (A fresh QR screenshot is also saved to: whatsapp_qr.png)", flush=True)
                print("=" * 65 + "\n", flush=True)
                
                # Take initial screenshot of QR
                try:
                    qr_canvas = page.query_selector("canvas[aria-label='Scan me!'], canvas, div[data-ref]")
                    if qr_canvas:
                        qr_canvas.screenshot(path="d:/Dinesh/antigravity/Scrapping/whatsapp_qr.png")
                    else:
                        page.screenshot(path="d:/Dinesh/antigravity/Scrapping/whatsapp_qr.png")
                except Exception:
                    page.screenshot(path="d:/Dinesh/antigravity/Scrapping/whatsapp_qr.png")

                # Wait up to 300s (5 minutes) for user to scan QR code, auto-refreshing if expired
                for sec in range(0, 300, 3):
                    if page.query_selector("#pane-side, [data-testid='chat-list']"):
                        is_logged_in = True
                        break
                    
                    # Auto-refresh expired QR if reload button appears
                    reload_btn = page.query_selector("button:has-text('Click to reload'), span[data-icon='refresh'], [data-testid='refresh-qr'], div[data-ref] button")
                    if reload_btn:
                        try:
                            reload_btn.click()
                            time.sleep(2)
                            qr_canvas = page.query_selector("canvas[aria-label='Scan me!'], canvas, div[data-ref]")
                            if qr_canvas:
                                qr_canvas.screenshot(path="d:/Dinesh/antigravity/Scrapping/whatsapp_qr.png")
                            else:
                                page.screenshot(path="d:/Dinesh/antigravity/Scrapping/whatsapp_qr.png")
                            print("     [i] QR code refreshed & saved to whatsapp_qr.png", flush=True)
                        except Exception:
                            pass
                    time.sleep(3)

                if not is_logged_in:
                    print("[!] WhatsApp login timed out (300s).")
                    print("    Please run 'python send_whatsapp.py' and scan the QR code to pair your device.")
                    context.close()
                    return 0

                print("[✓] WhatsApp Web Login Successful! Session saved permanently.\n", flush=True)
            else:
                print("[✓] WhatsApp Web Session already active!\n", flush=True)

            sent_count = 0
            for idx, lead in enumerate(pending_leads, 1):
                t = get_whatsapp_template(lead["Name"], lead["Area"], lead.get("Rating", ""), sender_name=sender_name)
                target_phone = lead["Phone"]
                url = f"https://web.whatsapp.com/send?phone={target_phone}"

                print(f"[{idx}/{len(pending_leads)}] Opening chat for: +{target_phone} ({lead['Name']})...", flush=True)

                try:
                    page.goto(url, wait_until="load", timeout=45000)
                    time.sleep(3)

                    # Wait up to 30s for chat input box or invalid phone dialog
                    msg_sent = False
                    start_t = time.time()
                    while time.time() - start_t < 30:
                        # Check for invalid phone dialog
                        invalid_alert = page.query_selector("div[data-animate-modal-popup='true']")
                        if invalid_alert and any(w in invalid_alert.inner_text().lower() for w in ["invalid", "not on whatsapp", "phone number shared"]):
                            print(f"    [-] Number +{target_phone} is not on WhatsApp. Skipping.", flush=True)
                            ok_btn = invalid_alert.query_selector("button")
                            if ok_btn:
                                ok_btn.click()
                            break

                        # Check chat message input
                        input_box = page.query_selector("footer div[contenteditable='true'], div[contenteditable='true'][data-tab='10']")
                        if input_box and input_box.is_visible():
                            input_box.focus()
                            time.sleep(0.5)
                            
                            # Type message lines with Shift+Enter for clean paragraph formatting
                            lines = t["text"].split("\n")
                            for l_idx, line in enumerate(lines):
                                if line:
                                    page.keyboard.insert_text(line)
                                if l_idx < len(lines) - 1:
                                    page.keyboard.down("Shift")
                                    page.keyboard.press("Enter")
                                    page.keyboard.up("Shift")
                            
                            time.sleep(1)
                            
                            # Click Send button or press Enter
                            send_btn = page.query_selector("button[aria-label='Send'], span[data-icon='send'], [data-testid='send'], button:has(span[data-icon='send'])")
                            if send_btn and send_btn.is_visible():
                                send_btn.click()
                            else:
                                page.keyboard.press("Enter")
                                
                            time.sleep(3)
                            msg_sent = True
                            break

                        time.sleep(1)

                    if msg_sent:
                        sent_count += 1
                        time.sleep(1)
                        try:
                            page.screenshot(path="d:/Dinesh/antigravity/Scrapping/last_sent_wa.png")
                        except Exception:
                            pass
                        print(f"    [✓] [SENT] Message dispatched to +{target_phone}!", flush=True)

                        # Log send
                        sent_record = {
                            "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                            "Mode": mode,
                            "Clinic Name": lead["Name"],
                            "Phone Number": target_phone,
                            "Area": lead["Area"],
                            "Rating": lead.get("Rating", ""),
                            "Status": "Sent",
                            "Reply Received": "No",
                            "Reply Timestamp": "-",
                            "Reply Snippet": "-"
                        }
                        pd.DataFrame([sent_record]).to_csv(
                            SENT_LOG_PATH,
                            mode="a" if os.path.exists(SENT_LOG_PATH) else "w",
                            header=not os.path.exists(SENT_LOG_PATH),
                            index=False
                        )

                        # Anti-spam jitter delay
                        if idx < len(pending_leads):
                            sleep_sec = random.uniform(delay_range[0], delay_range[1])
                            print(f"    [⏳ Waiting {sleep_sec:.1f}s before next contact...]", flush=True)
                            time.sleep(sleep_sec)
                    else:
                        print(f"    [-] Could not deliver message to +{target_phone} (timed out waiting for chat).", flush=True)

                except Exception as err:
                    print(f"    [-] Failed to send to +{target_phone}: {err}", flush=True)
                    time.sleep(2)

            context.close()
            print(f"\n[✓] WhatsApp Batch Completed! {sent_count} messages delivered.", flush=True)
            return sent_count

        except Exception as e:
            print(f"[!] Browser automation error: {e}", flush=True)
            return 0


def main():
    config = {
        "sheet_path": DEFAULT_CSV_PATH,
        "test_mode": True,
        "sender_phone": "8958573159",
        "test_recipient": "9729526111",
        "dry_run": False,
        "send_limit": 50,
        "sender_name": "Vidhi Singhal",
        "delay_seconds_min": 10,
        "delay_seconds_max": 20,
        "headless": False
    }

    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                user_cfg = json.load(f)
                config.update(user_cfg)
        except Exception:
            pass

    # CLI flags
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

    if "--login" in sys.argv:
        print("[+] Opening Chrome for WhatsApp Web pairing...")
        os.makedirs(SESSION_DIR, exist_ok=True)
        with sync_playwright() as p:
            context = p.chromium.launch_persistent_context(
                user_data_dir=SESSION_DIR,
                channel="chrome",
                headless=False,
                ignore_default_args=["--enable-automation"],
                args=[
                    "--start-maximized",
                    "--no-sandbox",
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars"
                ]
            )
            context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
            page = context.pages[0] if context.pages else context.new_page()
            page.goto("https://web.whatsapp.com")
            print(f"[i] Scan the QR code in Chrome with your WhatsApp on: +91 {config.get('sender_phone', '8958573159')}")
            print("[i] Waiting up to 180s for pairing...")
            try:
                page.wait_for_selector("#pane-side, [data-testid='chat-list']", timeout=180000)
                print("[✓] WhatsApp Web successfully linked! Session saved permanently.")
            except Exception:
                print("[!] Pairing window closed or timed out.")
            context.close()
        return

    is_test_mode = "--test" in sys.argv or "--test-to" in sys.argv or config.get("test_mode", True)
    test_target = config.get("test_recipient", "9729526111")
    for i, arg in enumerate(sys.argv):
        if arg == "--test-to" and i + 1 < len(sys.argv):
            test_target = sys.argv[i + 1]
            is_test_mode = True

    # 1. Load leads from sheet
    all_leads = load_whatsapp_leads(sheet_path)
    if not all_leads:
        print("[!] No valid mobile leads found in sheet.")
        return

    # 2. Generate interactive HTML preview
    generate_whatsapp_preview_html(all_leads, PREVIEW_HTML_PATH, config)

    # 3. Test Mode vs Live Daily Batch Mode
    if is_test_mode:
        sample_lead = all_leads[0]
        cleaned_test_target = sanitize_whatsapp_phone(test_target) or f"91{test_target}"
        print(f"\n[🔒 WHATSAPP TEST MODE ACTIVE] Destination locked to: +{cleaned_test_target}")
        print(f"[i] Sender Number: +91 {config.get('sender_phone', '8958573159')}")
        print(f"[i] Sending strictly ONE test message using clinic data from sheet row 1.\n")
        
        leads_to_send = [
            {
                "Name": sample_lead["Name"],
                "Phone": cleaned_test_target,
                "Area": sample_lead["Area"],
                "Rating": sample_lead.get("Rating", ""),
                "Reviews": sample_lead.get("Reviews", ""),
                "SheetRow": sample_lead["SheetRow"]
            }
        ]
        sent_count = send_whatsapp_messages(
            leads=leads_to_send,
            config=config,
            mode="Test",
            dry_run=dry_run,
            limit=1,
            delay_range=(2, 3),
            force=True
        )
        if sent_count and sent_count > 0:
            print(f"\n[✓] TEST COMPLETED! Message successfully delivered to +{cleaned_test_target}.")
            print("[i] To start the automated daily 50-clinic WhatsApp dispatches:")
            print("    1. Set 'test_mode': false in whatsapp_config.json")
            print("    2. Run: python send_whatsapp.py\n")
        else:
            if not dry_run:
                print(f"\n[!] Test message not dispatched (QR scan pending or timed out).")
                print(f"    Please link WhatsApp once: python send_whatsapp.py --login")
        return

    # LIVE DAILY BATCH MODE: Next unsent 50 clinics from CSV
    sent_df = load_whatsapp_sent_log(SENT_LOG_PATH)
    already_sent_live = set(sent_df[sent_df["Mode"] == "Live"]["Phone Number"].dropna().astype(str).tolist())
    unsent_leads = [l for l in all_leads if str(l["Phone"]) not in already_sent_live]

    total_leads = len(all_leads)
    already_sent_count = len(already_sent_live)
    queued_count = min(len(unsent_leads), send_limit)
    remaining_after = max(0, len(unsent_leads) - queued_count)
    days_left = (remaining_after + send_limit - 1) // send_limit if send_limit else 0

    print("\n" + "=" * 65, flush=True)
    print("     DAILY WHATSAPP OUTREACH CAMPAIGN PROGRESSION               ", flush=True)
    print("=" * 65, flush=True)
    print(f"Total Verified Mobiles in CSV: {total_leads}", flush=True)
    print(f"Already Contacted Previously:  {already_sent_count} ({(already_sent_count / total_leads * 100) if total_leads else 0:.1f}%)", flush=True)
    print(f"Remaining Unsent Leads:        {len(unsent_leads)}", flush=True)
    print(f"Sending in Today's Batch:      {queued_count}", flush=True)
    print(f"Remaining After Today:         {remaining_after} (~{days_left} days remaining)", flush=True)
    print("=" * 65 + "\n", flush=True)

    if not unsent_leads:
        print("[✓] All mobile leads in the CSV sheet have been successfully contacted!")
        return

    delay_min = int(config.get("delay_seconds_min", 10))
    delay_max = int(config.get("delay_seconds_max", 20))

    send_whatsapp_messages(
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
