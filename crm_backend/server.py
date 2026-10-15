import os
import re
import sys
import time
import json
import random
import threading
import smtplib
import urllib.parse
import gzip
import math
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import make_msgid
from typing import List, Dict, Optional, Set
from difflib import SequenceMatcher
import requests
from bs4 import BeautifulSoup
import pandas as pd
from flask import Flask, request, jsonify, send_from_directory, Response, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fast_engine import FastLeadStore

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.environ.get("BASE_DIR", os.path.join(os.path.dirname(__file__), "..")))
SCRAPPING_DIR = os.path.join(BASE_DIR, "Scrapping")
DIST_DIR = os.path.join(BASE_DIR, "crm_app", "dist")
os.makedirs(SCRAPPING_DIR, exist_ok=True)

# High-Performance SQLite WAL Store for 5 Million Leads
FAST_DB_PATH = os.path.join(SCRAPPING_DIR, "crm_leads_fast.db")
fast_store = FastLeadStore(FAST_DB_PATH)

# In-Memory Cache for Instant (< 1ms) Leads Retrieval and Gzip Streaming
GLOBAL_LEADS_CACHE = {
    "master": {
        "mtime": 0,
        "data": None,
        "json_raw": None,
        "json_gz": None
    },
    "files": {}
}

CRM_STATE_FILE = os.path.join(SCRAPPING_DIR, "crm_lead_status.json")
ACCOUNTS_CONFIG_FILE = os.path.join(SCRAPPING_DIR, "crm_accounts_config.json")
CUSTOM_TEMPLATES_FILE = os.path.join(SCRAPPING_DIR, "crm_custom_templates.json")
DAILY_TRACKER_FILE = os.path.join(SCRAPPING_DIR, "crm_daily_tracker.json")
CALENDAR_EVENTS_FILE = os.path.join(SCRAPPING_DIR, "crm_calendar_events.json")
TASKS_FILE = os.path.join(SCRAPPING_DIR, "crm_tasks.json")
WHATSAPP_TEMPLATES_FILE = os.path.join(SCRAPPING_DIR, "crm_whatsapp_templates.json")

# Default account profiles
DEFAULT_ACCOUNTS = [
    {
        "id": "ishant_singla",
        "name": "CA Ishant Singla",
        "email": "Ishantsingla94@gmail.com",
        "phone": "+91 7015147209",
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "Ishantsingla94@gmail.com",
        "smtp_pass": "dfeb ract fsqo cesu",
        "designation": "Chartered Accountant & Financial Advisor",
        "location": "Karnal / Delhi NCR",
        "is_active": True
    },
    {
        "id": "dinesh_singhal",
        "name": "CA Ishant Singla (via Relay)",
        "email": "Dineshvidhi815@gmail.com",
        "phone": "+91 7015147209",
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "smtp_user": "Dineshvidhi815@gmail.com",
        "smtp_pass": "glqx vnmm irpv fqmg",
        "designation": "Chartered Accountant & Wealth Advisor",
        "location": "Gurgaon, Dwarka & Delhi NCR",
        "is_active": True
    }
]

# In-memory batch job tracker
batch_job = {
    "is_running": False,
    "is_paused": False,
    "should_stop": False,
    "total": 0,
    "sent": 0,
    "failed": 0,
    "current_lead": "",
    "current_email": "",
    "logs": [],
    "start_time": None,
    "csv_name": ""
}

# In-memory Google Maps scraper tracker
scraper_job = {
    "is_running": False,
    "should_stop": False,
    "query": "",
    "city": "",
    "limit": 25,
    "found": 0,
    "emails_found": 0,
    "current_business": "",
    "leads": [],
    "logs": [],
    "output_filename": "",
    "start_time": None
}

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
    r"bootstrap", r"fontawesome", r"rating", r"review", r"company\.com", r"mysite\.com"
]

# ----------------- Helper Functions -----------------

def get_accounts():
    if os.path.exists(ACCOUNTS_CONFIG_FILE):
        try:
            with open(ACCOUNTS_CONFIG_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_ACCOUNTS

def save_accounts(accounts):
    with open(ACCOUNTS_CONFIG_FILE, "w", encoding="utf-8") as f:
        json.dump(accounts, f, indent=4)

def get_crm_state():
    if os.path.exists(CRM_STATE_FILE):
        try:
            with open(CRM_STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_crm_state(state):
    with open(CRM_STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=4)

def get_daily_tracker():
    today = time.strftime("%Y-%m-%d")
    default_tracker = {
        "date": today,
        "sent_today": 0,
        "daily_limit": 50,
        "token": "apex_secret_cron_2026",
        "target_file": "businesses_in_gurgaon_dwarka_with_email.csv",
        "last_dispatch": None,
        "micro_batch_size": 4,
        "batch_cooldown": 10,
        "jitter_min": 3.0,
        "jitter_max": 7.0
    }
    if os.path.exists(DAILY_TRACKER_FILE):
        try:
            with open(DAILY_TRACKER_FILE, "r", encoding="utf-8") as f:
                saved = json.load(f)
                if saved.get("date") == today:
                    for k, v in default_tracker.items():
                        if k not in saved:
                            saved[k] = v
                    return saved
                else:
                    default_tracker["daily_limit"] = saved.get("daily_limit", 50)
                    default_tracker["token"] = saved.get("token", "apex_secret_cron_2026")
                    default_tracker["target_file"] = saved.get("target_file", default_tracker["target_file"])
                    default_tracker["micro_batch_size"] = saved.get("micro_batch_size", 4)
                    default_tracker["batch_cooldown"] = saved.get("batch_cooldown", 10)
                    default_tracker["jitter_min"] = saved.get("jitter_min", 3.0)
                    default_tracker["jitter_max"] = saved.get("jitter_max", 7.0)
        except Exception:
            pass
    return default_tracker

def save_daily_tracker(tracker):
    with open(DAILY_TRACKER_FILE, "w", encoding="utf-8") as f:
        json.dump(tracker, f, indent=4)

def get_calendar_events():
    if os.path.exists(CALENDAR_EVENTS_FILE):
        try:
            with open(CALENDAR_EVENTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_calendar_events(events):
    with open(CALENDAR_EVENTS_FILE, "w", encoding="utf-8") as f:
        json.dump(events, f, indent=4)

def get_tasks():
    if os.path.exists(TASKS_FILE):
        try:
            with open(TASKS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def save_tasks(tasks):
    with open(TASKS_FILE, "w", encoding="utf-8") as f:
        json.dump(tasks, f, indent=4)

DEFAULT_WHATSAPP_TEMPLATES = [
    {
        "id": "liquid_mf",
        "title": "Liquid Mutual Fund Treasury (~7%)",
        "category": "Mutual Funds",
        "text": "Hello {name} Team, this is {sender_name} (Chartered Accountant & Wealth Advisor). I noticed your business in {area}. Are you currently earning 6.75%+ interest on your surplus business cash, or is it sitting idle in a 0% current account? Would love to share a quick 2-minute overview on high-liquidity treasury mutual funds with instant 24h withdrawal. Let me know if you'd be open to a quick chat!"
    },
    {
        "id": "rating_compliment",
        "title": "Google Rating Compliment & Intro",
        "category": "Reputation & Partnership",
        "text": "Hi {name} Team! Saw your impressive {rating}★ rating on Google Maps in {area} — kudos to your team! I'm {sender_name}, a practicing Chartered Accountant working with top businesses across {city}. We specialize in optimizing idle treasury reserves and reducing tax leakages without locking funds. Would you be open to connecting for 4 minutes this Thursday?"
    },
    {
        "id": "ca_working_capital",
        "title": "360° Working Capital & Tax Structuring",
        "category": "Corporate Finance",
        "text": "Dear {name} Team, quick CA query: As we review quarterly balance sheet efficiency for {category} firms in {area}, parking short-term supplier reserves in Liquid & Arbitrage funds yields ~7% annualized returns with superior tax advantages over bank FDs. Let me know if you would like a 1-page treasury yield projection for {name}!"
    },
    {
        "id": "gentle_followup",
        "title": "Gentle Follow-Up & Check-in",
        "category": "Follow-Up",
        "text": "Hello {name} Team! Following up on the brief email I sent you earlier regarding working capital treasury yields for {name}. Just wanted to check if you had a moment to review it? Always happy to share a quick 2-minute calculation for your idle cash!"
    },
    {
        "id": "quick_call",
        "title": "4-Minute Quick Introduction Call",
        "category": "Direct Outreach",
        "text": "Hi {name} Team, {sender_name} here from {sender_location}. I'm advising several prominent {category} firms in {area} on treasury liquidity and CA advisory. Would you be open to a 4-minute call tomorrow around 11:30 AM or 3:00 PM?"
    }
]

def get_whatsapp_templates():
    if os.path.exists(WHATSAPP_TEMPLATES_FILE):
        try:
            with open(WHATSAPP_TEMPLATES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_WHATSAPP_TEMPLATES

def save_whatsapp_templates(templates):
    with open(WHATSAPP_TEMPLATES_FILE, "w", encoding="utf-8") as f:
        json.dump(templates, f, indent=4)

def log_lead_engagement(lead_id_or_email, channel, action, details="", new_status=None):
    if not lead_id_or_email:
        return {}
    crm_state = get_crm_state()
    lead_state = crm_state.setdefault(str(lead_id_or_email), {})
    current_status = lead_state.get("status", "New")
    
    if new_status:
        lead_state["status"] = new_status
    elif action in ("email_sent", "whatsapp_sent") and current_status == "New":
        lead_state["status"] = "Contacted"
    elif action in ("reply_received", "simulated_reply"):
        lead_state["status"] = "Interested"
    elif action in ("meeting_scheduled", "task_created"):
        if current_status in ("New", "Contacted"):
            lead_state["status"] = "Follow-up"

    history = lead_state.setdefault("engagement_history", [])
    history.append({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "channel": channel,
        "action": action,
        "status": lead_state.get("status", current_status),
        "details": details or f"{action.replace('_', ' ').capitalize()} via {channel}"
    })
    lead_state["last_contacted"] = time.strftime("%Y-%m-%d %H:%M:%S")
    lead_state["updated_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_crm_state(crm_state)
    return lead_state

def generate_ai_personalization(lead: Dict, account: Dict, angle: str = "mutual_fund", tone: str = "consultative", custom_prompt: str = "") -> Dict:
    name = clean_business_name(lead.get("name") or lead.get("Business Name") or "Business Owner")
    city = lead.get("city") or "Delhi NCR"
    area = lead.get("area") or city
    category = lead.get("category") or "Commercial Business"
    rating = str(lead.get("rating") or "").strip()
    reviews = str(lead.get("reviews") or "").strip()
    sender_name = account.get("name", "CA Ishant Singla")
    sender_phone = account.get("phone", "+91 7015147209")
    sender_location = account.get("location", "Gurgaon & Delhi NCR")

    rating_clause = f"Noticed your {rating}★ rating on Google Maps in {area} — congratulations to your leadership team. " if rating else f"Noticed your prominent market standing across {area}. "

    if angle == "rating_compliment":
        subject = f"Compliments on {name}'s {rating}★ rating in {area} (+ quick treasury query)" if rating else f"Quick query regarding {name}'s commercial operations in {area}"
        hook = f"Dear {name} Team,\n\n{rating_clause}Maintaining strong client trust takes consistent operational discipline."
        pitch = f"As a Chartered Accountant advising business owners in {city}, I often see high-performing {category} companies leaving operational cash sitting in 0% current accounts or low-return fixed deposits.\n\nWe assist leadership teams in deploying idle operational reserves into institutional Liquid Mutual Funds earning ~6.75% to 7.10% safe returns with instant 24-hour liquidity and zero lock-in."
        cta = f"Could we connect for a brief 4-minute phone call this Thursday or Friday to share a tailored working capital yield calculation for {name}?"
        wa = f"Hi {name} Team! {rating_clause}I'm {sender_name} (CA & Wealth Advisor). Wanted to share a quick 2-minute idea on how {category} businesses in {area} are earning ~7% annualized on idle operational funds with 24-hour instant withdrawal. Would you be open to a quick 4-minute chat this week?"

    elif angle == "gst_audit":
        subject = f"360° Financial & Tax Structuring for {name} ({city})"
        hook = f"Dear {name} Management,\n\nIn our fiscal review of growing {category} enterprises in {area}, proactive tax planning and treasury allocation directly impact bottom-line EBITDA."
        pitch = f"Beyond standard GST filings and audits, our CA practice assists corporate clients in optimizing idle working capital reserves through tax-smart Arbitrage and Liquid funds, outperforming traditional fixed deposits on a post-tax basis without liquidity lock-up."
        cta = f"Would you be open to an introductory 5-minute conversation with CA Ishant Singla this week regarding {name}'s treasury and tax optimization?"
        wa = f"Hello {name} Team, this is {sender_name} (Chartered Accountant). Are you currently optimizing your company's short-term reserves for maximum tax efficiency? We help businesses in {area} earn ~7% safe returns with instant liquidity. Would love to share a 1-page overview if interested!"

    elif angle == "working_capital":
        subject = f"Working Capital & Banking Liquidity Optimization for {name}"
        hook = f"Dear {name} Finance Team,\n\nManaging supplier disbursements and advance collections in {area} requires high liquidity and zero capital risk."
        pitch = f"Institutional Liquid & Overnight Mutual Funds provide daily compounding (~6.75%–7.10% annualized) while allowing funds to be withdrawn to your current account on T+1 days seamlessly for vendor payments, payroll, or advance tax liabilities."
        cta = f"I'd welcome the chance to share a 1-page treasury overview tailored to {name}. Would 11:30 AM this Wednesday work for a quick phone briefing?"
        wa = f"Hi {name} Team, quick question from {sender_name} (CA & Treasury Advisor): Is {name} currently earning interest on short-term vendor reserves, or is it parked at 0%? Liquid funds allow instant T+1 withdrawal at ~7% yield. Let me know if you'd like a quick 2-minute brief!"

    elif angle == "custom" and custom_prompt:
        subject = f"Partnership & Treasury Optimization for {name}"
        hook = f"Dear {name} Leadership,\n\n{custom_prompt}\n\nRegarding your {category} presence in {area}:"
        pitch = f"As a Chartered Accountant and wealth advisor, I assist firms across {city} in safely growing surplus liquidity (~6.75%–7.10%) while maintaining 100% instant operational access."
        cta = f"Let's schedule a 4-minute introductory call this week to review options for {name}."
        wa = f"Hi {name} Team, {sender_name} here. {custom_prompt} Would love to connect for 4 minutes regarding liquidity solutions for your business in {area}."

    else: # Default mutual_fund
        subject = f"Optimizing {name}'s Surplus Working Capital (~7% Liquid Yield)"
        hook = f"Dear {name} Management,\n\nI hope business is going strong in {area}!"
        pitch = f"Most {category} businesses maintain substantial buffer funds in current accounts earning 0% interest, or in FDs subject to tax deductions and penalties.\n\nInstitutional Liquid Mutual Funds offer:\n• ~6.75% to 7.10% annualized yields with daily compounding\n• 100% instant 24-hour withdrawal directly into your bank account\n• Bank-grade safety and superior post-tax efficiency"
        cta = f"Could we connect for a brief 4-minute phone call this week to see what your cash reserves could safely yield?"
        wa = f"Hello {name} Team! Are you currently earning 6.75%+ on {name}'s surplus cash, or is it sitting idle in a current account? Liquid funds offer 24h instant withdrawal and bank-grade safety. Let's do a quick 4-minute chat if you'd like a free calculation!"

    if tone == "punchy":
        subject = f"Quick question on {name}'s cash reserves ({area})"
        body_plain = f"Dear {name} Team,\n\n{rating_clause}Most businesses in {area} leave surplus capital in 0% current accounts.\n\nAs a Chartered Accountant, I help local firms earn ~6.75% to 7.10% safe returns in liquid mutual funds with instant 24-hour withdrawal.\n\nCould we do a brief 4-minute call this Thursday or Friday to see what your cash reserves could yield?\n\nBest regards,\n{sender_name}\n{sender_phone}"
    elif tone == "executive":
        subject = f"Treasury & Liquidity Advisory for {name}"
        body_plain = f"{hook}\n\n{pitch}\n\n{cta}\n\nWarm regards,\n{sender_name}\nChartered Accountant & Wealth Advisor\n{sender_phone} | {sender_location}"
    else:
        body_plain = f"{hook}\n\n{pitch}\n\n{cta}\n\nBest regards,\n{sender_name}\n{account.get('designation', 'Chartered Accountant')}\nPhone/WhatsApp: {sender_phone}\n{sender_location}"

    card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); padding: 22px 24px; color: #ffffff;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #a5b4fc; margin-bottom: 6px;">CA Wealth & Treasury Brief</div>
            <h2 style="margin: 0; font-size: 19px; font-weight: 700; color: #ffffff;">{name}</h2>
            <div style="font-size: 12px; color: #c7d2fe; margin-top: 4px;">{area} • {category}</div>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.65;">
            {body_plain.replace(chr(10), '<br/>')}
        </div>
        <div style="background: #f8fafc; padding: 14px 24px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; display: flex; justify-content: space-between;">
            <span>From: <strong>{sender_name}</strong> ({sender_phone})</span>
            <span style="color: #4f46e5; font-weight: 600;">ApexOutreach AI Studio</span>
        </div>
    </div>"""

    return {
        "success": True,
        "subject": subject,
        "body_plain": body_plain,
        "card_html": card_html,
        "suggested_wa": wa,
        "angle": angle,
        "tone": tone
    }

def clean_business_name(raw_name: str) -> str:
    if not raw_name or not isinstance(raw_name, str):
        return "Business Owner"
    name = raw_name.strip().replace("’", "'").replace("‘", "'").replace("â€™", "'").replace("\ufffd", "")
    for sep in [" | ", " - ", " : ", " – ", " — ", ","]:
        if sep in name:
            candidate = name.split(sep)[0].strip()
            if len(candidate) >= 3 and not candidate.lower().startswith(("best", "top")):
                name = candidate
                break
    return re.sub(r'^["\']|["\']$', '', name).strip()

def sanitize_phone(raw_phone: str) -> str:
    if not raw_phone or pd.isna(raw_phone):
        return ""
    digits = re.sub(r"\D", "", str(raw_phone))
    if len(digits) == 11 and digits.startswith("0") and digits[1] in "6789":
        return "91" + digits[1:]
    if len(digits) == 10 and digits[0] in "6789":
        return "91" + digits
    if len(digits) == 12 and digits.startswith("91") and digits[2] in "6789":
        return digits
    return digits

# ----------------- FUZZY MATCHING, DEDUPLICATION & LEAD SCORING -----------------

GENERIC_DOMAINS = {
    "gmail.com", "yahoo.com", "yahoo.co.in", "hotmail.com", "outlook.com",
    "rediffmail.com", "rediff.com", "icloud.com", "aol.com", "protonmail.com",
    "google.com", "facebook.com", "instagram.com", "linkedin.com", "twitter.com",
    "youtube.com", "wa.me", "api.whatsapp.com", "justdial.com", "indiamart.com",
    "tradeindia.com", "sulekha.com", "wix.com", "wordpress.com"
}

LEGAL_BUSINESS_WORDS = [
    r"\bpvt\b", r"\bpvt\.\b", r"\bprivate\b", r"\bltd\b", r"\bltd\.\b", r"\blimited\b",
    r"\bllp\b", r"\binc\b", r"\bcorp\b", r"\bco\b", r"\bco\.\b", r"\benterprises\b",
    r"\bservices\b", r"\bsolutions\b", r"\bconsultants\b", r"\btechnologies\b",
    r"\bindustries\b", r"\bassociates\b", r"\band\b", r"\b&\b", r"\bdr\b", r"\bdr\.\b",
    r"\bclinic\b", r"\bhospital\b", r"\bcenter\b", r"\bcentre\b"
]

def extract_clean_domain(url_or_email: str) -> str:
    """Extracts normalized clean root domain excluding generic mail/social providers."""
    if not url_or_email or not isinstance(url_or_email, str):
        return ""
    val = url_or_email.strip().lower()
    domain = ""
    if "@" in val:
        domain = val.split("@")[-1].strip()
    else:
        if not val.startswith(("http://", "https://")):
            val = "http://" + val
        try:
            parsed = urllib.parse.urlparse(val)
            domain = parsed.netloc.strip()
        except Exception:
            domain = ""
    domain = re.sub(r":\d+$", "", domain)
    domain = re.sub(r"^(www\.|m\.)", "", domain)
    if not domain or "." not in domain or domain in GENERIC_DOMAINS:
        return ""
    if len(domain) < 4:
        return ""
    return domain

def normalize_phone_number(raw_phone: str) -> str:
    """Extracts last 10 digits for consistent phone/whatsapp duplicate checking."""
    if not raw_phone or pd.isna(raw_phone):
        return ""
    digits = re.sub(r"\D", "", str(raw_phone))
    if len(digits) >= 10:
        return digits[-10:]
    return ""

def normalize_business_title(name: str) -> str:
    """Normalizes company name for fuzzy similarity comparison."""
    if not name or not isinstance(name, str):
        return ""
    cleaned = clean_business_name(name).lower()
    cleaned = re.sub(r"[^\w\s]", " ", cleaned)
    for pat in LEGAL_BUSINESS_WORDS:
        cleaned = re.sub(pat, " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned

def are_leads_fuzzy_duplicate(lead_a: Dict, lead_b: Dict):
    """
    Determines if lead_a and lead_b represent the same business.
    Returns (is_duplicate: bool, reason: str, confidence: float)
    """
    email_a = str(lead_a.get("email") or "").strip().lower()
    email_b = str(lead_b.get("email") or "").strip().lower()
    if email_a and email_b and "@" in email_a and email_a == email_b:
        return True, f"exact_email:{email_a}", 1.0

    dom_a = extract_clean_domain(lead_a.get("website") or email_a)
    dom_b = extract_clean_domain(lead_b.get("website") or email_b)
    if dom_a and dom_b and dom_a == dom_b:
        return True, f"domain_match:{dom_a}", 0.98

    phone_a = normalize_phone_number(lead_a.get("phone") or lead_a.get("wa_phone"))
    phone_b = normalize_phone_number(lead_b.get("phone") or lead_b.get("wa_phone"))
    if phone_a and phone_b and len(phone_a) == 10 and phone_a == phone_b:
        return True, f"phone_match:{phone_a}", 0.95

    norm_a = normalize_business_title(lead_a.get("name") or lead_a.get("Business Name") or "")
    norm_b = normalize_business_title(lead_b.get("name") or lead_b.get("Business Name") or "")
    if norm_a and norm_b and len(norm_a) >= 4 and len(norm_b) >= 4:
        city_a = (lead_a.get("city") or "").lower().strip()
        city_b = (lead_b.get("city") or "").lower().strip()
        ratio = SequenceMatcher(None, norm_a, norm_b).ratio()
        if ratio >= 0.88:
            return True, f"fuzzy_name_match:{round(ratio*100)}%", ratio
        elif ratio >= 0.82 and (city_a and city_b and city_a == city_b):
            return True, f"fuzzy_name_city_match:{round(ratio*100)}%", ratio

    return False, "", 0.0

def merge_lead_records(target: Dict, incoming: Dict, match_reason: str):
    """Merges incoming lead attributes into target record to retain the richest information."""
    target_email = str(target.get("email") or "").strip()
    inc_email = str(incoming.get("email") or "").strip()
    if not target_email and inc_email and "@" in inc_email:
        target["email"] = inc_email
        target["has_email"] = True
    elif target_email and inc_email and "@" in inc_email:
        t_dom = extract_clean_domain(target_email)
        i_dom = extract_clean_domain(inc_email)
        if not t_dom and i_dom:
            target["email"] = inc_email
            target["has_email"] = True

    if not target.get("phone") and incoming.get("phone"):
        target["phone"] = incoming["phone"]
    if not target.get("wa_phone") and incoming.get("wa_phone"):
        target["wa_phone"] = incoming["wa_phone"]

    try:
        t_rev = int(re.sub(r"\D", "", str(target.get("reviews") or "0")) or 0)
        i_rev = int(re.sub(r"\D", "", str(incoming.get("reviews") or "0")) or 0)
        if i_rev > t_rev:
            target["reviews"] = str(incoming.get("reviews"))
            if incoming.get("rating"):
                target["rating"] = str(incoming.get("rating"))
    except Exception:
        if not target.get("rating") and incoming.get("rating"):
            target["rating"] = str(incoming["rating"])

    if not target.get("website") and incoming.get("website"):
        target["website"] = incoming["website"]

    t_addr = str(target.get("address") or "")
    i_addr = str(incoming.get("address") or "")
    if len(i_addr) > len(t_addr):
        target["address"] = i_addr

    if target.get("city") in ["", "Delhi NCR"] and incoming.get("city") not in ["", "Delhi NCR"]:
        target["city"] = incoming["city"]
    if target.get("area") in ["", target.get("city")] and incoming.get("area") not in ["", incoming.get("city")]:
        target["area"] = incoming["area"]

    stage_hierarchy = {"New": 1, "Contacted": 2, "Interested": 3, "Follow-up": 4, "Converted": 5, "Do Not Contact": 6}
    t_stage_val = stage_hierarchy.get(target.get("status", "New"), 1)
    i_stage_val = stage_hierarchy.get(incoming.get("status", "New"), 1)
    if i_stage_val > t_stage_val:
        target["status"] = incoming.get("status")

    t_hist = target.setdefault("engagement_history", [])
    i_hist = incoming.get("engagement_history") or []
    existing_keys = {f"{h.get('timestamp')}_{h.get('action')}" for h in t_hist}
    for eh in i_hist:
        k = f"{eh.get('timestamp')}_{eh.get('action')}"
        if k not in existing_keys:
            t_hist.append(eh)
            existing_keys.add(k)

    target["merged_count"] = target.get("merged_count", 1) + 1
    dedup_tags = target.setdefault("dedup_tags", [])
    if match_reason and match_reason not in dedup_tags:
        dedup_tags.append(match_reason)

def calculate_lead_score(lead: Dict) -> Dict:
    """Calculates an automated Lead Score (0 - 100) and Tier classification."""
    email_pts = 0
    domain_pts = 0
    phone_pts = 0
    rating_pts = 0
    review_pts = 0
    website_pts = 0

    email = str(lead.get("email") or "").strip()
    if email and "@" in email and not any(re.search(p, email.lower()) for p in IGNORE_EMAIL_PATTERNS):
        email_pts = 35
        dom = extract_clean_domain(email)
        if dom and dom not in GENERIC_DOMAINS:
            domain_pts = 10

    phone = str(lead.get("phone") or lead.get("wa_phone") or "").strip()
    if phone and len(re.sub(r"\D", "", phone)) >= 10:
        phone_pts = 20

    rating_str = str(lead.get("rating") or "").strip()
    try:
        if rating_str and rating_str.lower() != "nan":
            rf = float(rating_str)
            if rf >= 4.5:
                rating_pts = 15
            elif rf >= 4.0:
                rating_pts = 10
            elif rf > 0:
                rating_pts = 5
    except Exception:
        pass

    reviews_str = str(lead.get("reviews") or "").strip()
    try:
        if reviews_str and reviews_str.lower() != "nan":
            rc = int(re.sub(r"\D", "", reviews_str) or 0)
            if rc >= 25:
                review_pts = 10
            elif rc >= 5:
                review_pts = 5
    except Exception:
        pass

    website = str(lead.get("website") or "").strip()
    if website and website.lower() not in ["", "nan"] and (website.startswith("http") or "." in website):
        website_pts = 10

    total_score = min(100, email_pts + domain_pts + phone_pts + rating_pts + review_pts + website_pts)

    if total_score >= 70:
        tier = "Tier A: Hot 🔥"
        tier_code = "hot"
    elif total_score >= 40:
        tier = "Tier B: Warm ⭐"
        tier_code = "warm"
    else:
        tier = "Tier C: Cold ❄️"
        tier_code = "cold"

    return {
        "score": total_score,
        "tier": tier,
        "tier_code": tier_code,
        "breakdown": {
            "email_pts": email_pts,
            "domain_pts": domain_pts,
            "phone_pts": phone_pts,
            "rating_pts": rating_pts,
            "review_pts": review_pts,
            "website_pts": website_pts,
            "total": total_score
        }
    }

def deduplicate_dataframe(df: pd.DataFrame) -> Dict:
    """Runs smart fuzzy deduplication on a pandas DataFrame."""
    total_rows = len(df)
    if total_rows <= 1:
        return {"cleaned_df": df, "duplicates_merged": 0, "unique_count": total_rows}

    raw_records = []
    for idx, row in df.iterrows():
        raw_records.append(dict(row))

    merged_records = []
    by_email = {}
    by_domain = {}
    by_phone = {}
    by_norm_prefix = {}
    duplicates_merged = 0

    for rec in raw_records:
        lead_dict = {
            "name": str(rec.get("Business Name") or rec.get("Name") or ""),
            "email": str(rec.get("Email") or "").strip(),
            "phone": str(rec.get("Phone Number") or rec.get("Phone") or "").strip(),
            "wa_phone": str(rec.get("WhatsApp Mobile") or "").strip(),
            "website": str(rec.get("Website") or "").strip(),
            "city": str(rec.get("City") or "").strip(),
            "area": str(rec.get("Area") or "").strip(),
            "category": str(rec.get("Category") or "").strip(),
            "rating": str(rec.get("Rating") or "").strip(),
            "reviews": str(rec.get("Reviews") or "").strip(),
            "address": str(rec.get("Address") or "").strip()
        }
        if not lead_dict["wa_phone"]:
            lead_dict["wa_phone"] = sanitize_phone(lead_dict["phone"])

        matched_idx = None
        match_reason = ""

        em = lead_dict["email"].lower()
        if em and "@" in em and em in by_email:
            matched_idx = by_email[em]
            match_reason = f"exact_email:{em}"

        if matched_idx is None:
            dom = extract_clean_domain(lead_dict["website"] or em)
            if dom and dom in by_domain:
                matched_idx = by_domain[dom]
                match_reason = f"domain_match:{dom}"

        if matched_idx is None:
            ph = normalize_phone_number(lead_dict["phone"] or lead_dict["wa_phone"])
            if ph and ph in by_phone:
                matched_idx = by_phone[ph]
                match_reason = f"phone_match:{ph}"

        if matched_idx is None:
            norm_n = normalize_business_title(lead_dict["name"])
            if norm_n and len(norm_n) >= 4:
                prefix = norm_n[:3]
                candidates = by_norm_prefix.get(prefix, [])
                for existing_norm, idx_ref in candidates:
                    if abs(len(existing_norm) - len(norm_n)) > 15:
                        continue
                    ratio = SequenceMatcher(None, norm_n, existing_norm).ratio()
                    if ratio >= 0.88:
                        matched_idx = idx_ref
                        match_reason = f"fuzzy_name:{round(ratio*100)}%"
                        break

        if matched_idx is not None:
            merge_lead_records(merged_records[matched_idx], lead_dict, match_reason)
            duplicates_merged += 1
        else:
            new_idx = len(merged_records)
            lead_dict["merged_count"] = 1
            lead_dict["dedup_tags"] = []
            merged_records.append(lead_dict)

            if em and "@" in em:
                by_email[em] = new_idx
            dom = extract_clean_domain(lead_dict["website"] or em)
            if dom:
                by_domain[dom] = new_idx
            ph = normalize_phone_number(lead_dict["phone"] or lead_dict["wa_phone"])
            if ph:
                by_phone[ph] = new_idx
            norm_n = normalize_business_title(lead_dict["name"])
            if norm_n and len(norm_n) >= 3:
                by_norm_prefix.setdefault(norm_n[:3], []).append((norm_n, new_idx))

    cleaned_df = pd.DataFrame(merged_records)
    return {
        "cleaned_df": cleaned_df,
        "duplicates_merged": duplicates_merged,
        "unique_count": len(merged_records)
    }

def extract_email_from_url(url: str, timeout: int = 3) -> str:
    if not url or not url.startswith("http"):
        return ""
    found = set()
    try:
        resp = requests.get(url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for m in soup.select('a[href^="mailto:"]'):
                href = m.get("href", "")
                clean = href.replace("mailto:", "").split("?")[0].strip().lower()
                if "@" in clean and not any(re.search(p, clean) for p in IGNORE_EMAIL_PATTERNS):
                    if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg)$", clean):
                        found.add(clean)
            for em in re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", resp.text):
                em_l = em.lower().strip()
                if not any(re.search(p, em_l) for p in IGNORE_EMAIL_PATTERNS):
                    if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg|css|js)$", em_l):
                        found.add(em_l)
            if not found:
                parsed = urllib.parse.urlparse(url)
                contact_url = f"{parsed.scheme}://{parsed.netloc}/contact"
                try:
                    c_resp = requests.get(contact_url, headers=REQUEST_HEADERS, timeout=timeout, verify=False)
                    if c_resp.status_code == 200:
                        for em in re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", c_resp.text):
                            em_l = em.lower().strip()
                            if not any(re.search(p, em_l) for p in IGNORE_EMAIL_PATTERNS):
                                if not re.search(r"\.(png|jpg|jpeg|webp|gif|svg|css|js)$", em_l):
                                    found.add(em_l)
                except Exception:
                    pass
    except Exception:
        pass
    return list(found)[0] if found else ""

def interpolate_text(text: str, lead: Dict, account: Dict) -> str:
    if not text:
        return ""
    name = clean_business_name(lead.get("name") or lead.get("Business Name") or lead.get("Name") or "Business Owner")
    city = lead.get("city") or lead.get("City") or "Delhi NCR"
    area = lead.get("area") or lead.get("Area") or lead.get("Karnal Area") or city
    category = lead.get("category") or lead.get("Category") or "Commercial Trade"
    rating = str(lead.get("rating") or lead.get("Rating") or "").strip()
    reviews = str(lead.get("reviews") or lead.get("Reviews") or "").strip()

    sender_name = account.get("name", "CA Ishant Singla")
    sender_email = account.get("email", "Ishantsingla94@gmail.com")
    sender_phone = account.get("phone", "+91 7015147209")

    replacements = {
        "{name}": name,
        "{business_name}": name,
        "{city}": city,
        "{area}": area,
        "{category}": category,
        "{rating}": rating,
        "{reviews}": reviews,
        "{sender_name}": sender_name,
        "{sender_email}": sender_email,
        "{sender_phone}": sender_phone,
    }

    res = text
    for k, v in replacements.items():
        res = re.sub(re.escape(k), str(v), res, flags=re.IGNORECASE)
    return res

def list_workspace_csvs():
    csv_files = []
    # 1. Master virtual option
    csv_files.append({
        "filename": "MASTER_CRM",
        "display_name": "🌟 Unified Master CRM (4,773 Leads • Master DB)",
        "size_kb": 1420.5,
        "row_count": 4773,
        "is_master": True,
        "columns": ["Business Name", "City", "Area", "Category", "Email", "Phone", "WhatsApp", "Rating", "Source"]
    })

    scan_dirs = [SCRAPPING_DIR, BASE_DIR]
    seen_paths = set()
    for d in scan_dirs:
        if os.path.exists(d):
            for f in os.listdir(d):
                if f.endswith(".csv"):
                    full_p = os.path.join(d, f)
                    if full_p not in seen_paths:
                        seen_paths.add(full_p)
                        size_kb = round(os.path.getsize(full_p) / 1024, 1)
                        row_count = 0
                        try:
                            with open(full_p, "rb") as cf:
                                row_count = max(0, sum(1 for _ in cf) - 1)
                        except Exception:
                            row_count = 0
                        try:
                            df = pd.read_csv(full_p, nrows=2)
                            cols = list(df.columns)
                        except Exception:
                            cols = []
                        csv_files.append({
                            "filename": f,
                            "path": full_p,
                            "size_kb": size_kb,
                            "row_count": row_count,
                            "columns": cols
                        })
    def sort_key(x):
        fn = x["filename"].lower()
        if fn == "master_crm": return -1
        if "gurgaon_dwarka_with_email" in fn: return 0
        if "gurgaon_dwarka_all" in fn: return 1
        if "karnal_gst" in fn: return 2
        if "clinics" in fn: return 3
        if "scraped_" in fn: return 4
        if "sent_log" in fn: return 10
        return 5
    return sorted(csv_files, key=sort_key)

# ----------------- Dynamic Email Builder -----------------

def build_template_email(
    template_id: str,
    lead: Dict,
    account: Dict,
    custom_subject: str = "",
    custom_body: str = ""
) -> Dict[str, str]:
    name = clean_business_name(lead.get("Business Name") or lead.get("Name") or lead.get("name") or "Business Owner")
    city = lead.get("City") or lead.get("city") or "Delhi NCR"
    area = lead.get("Area") or lead.get("area") or lead.get("Karnal Area") or city
    category = lead.get("Category") or lead.get("category") or "Corporate & Commercial"
    rating = str(lead.get("Rating") or lead.get("rating") or "").strip()
    reviews = str(lead.get("Reviews") or lead.get("reviews") or "").strip()
    
    sender_name = account.get("name", "CA Ishant Singla")
    sender_email = account.get("email", "Ishantsingla94@gmail.com")
    sender_phone = account.get("phone", "+91 7015147209")
    clean_wa = sanitize_phone(sender_phone)
    if not clean_wa.startswith("91") and len(clean_wa) == 10:
        clean_wa = "91" + clean_wa

    praise_txt = ""
    try:
        if rating and float(rating) >= 4.0:
            rev_txt = f" across {reviews} reviews" if reviews and reviews != "0" and reviews.lower() != "nan" else ""
            praise_txt = f" (Congratulations on your strong {rating}★ market reputation{rev_txt}!)"
    except Exception:
        pass

    # IF USER PROVIDED CUSTOM SUBJECT & BODY IN UI:
    if custom_subject and custom_body:
        interpolated_sub = interpolate_text(custom_subject, lead, account)
        interpolated_body = interpolate_text(custom_body, lead, account)
        
        paragraphs = [p.strip() for p in interpolated_body.split("\n\n") if p.strip()]
        html_body_paragraphs = "".join([f"<p style='margin-bottom: 12px;'>{p.replace('\n', '<br>')}</p>" for p in paragraphs])

        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        💡 Direct Outreach • {area}
    </div>
    {html_body_paragraphs}
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">
            💬 Chat on WhatsApp
        </a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">
            📞 Call {sender_phone}
        </a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; line-height: 1.5;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7; text-decoration: none;">{sender_phone}</a> &nbsp;|&nbsp; 
        Email: <a href="mailto:{sender_email}" style="color: #0284c7; text-decoration: none;">{sender_email}</a>
    </div>
</div>"""

        full_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin: 0; padding: 20px; background-color: #f8fafc;">{card_html}</body></html>"""
        return {
            "subject": interpolated_sub,
            "body_plain": interpolated_body,
            "card_html": card_html,
            "full_html": full_html
        }

    # PRE-BUILT TEMPLATES
    cat_lower = category.lower()
    if template_id == "mutual_fund":
        subject = f"Smart Mutual Fund & Treasury Investment for {name}"
        if any(k in cat_lower for k in ["manufactur", "industry", "factory", "machinery", "packag"]):
            hook = f"For manufacturing businesses and industrial units in <strong>{area}</strong>, holding idle raw material capital or vendor reserves in 0% current accounts costs lakhs in lost returns every year."
        elif any(k in cat_lower for k in ["software", "tech", "it company", "digital", "bpo"]):
            hook = f"For fast-growing tech, software, and corporate firms in <strong>{area}</strong>, managing operational cash flow and retainer buffers smartly is critical."
        else:
            hook = f"Most commercial businesses in <strong>{area}</strong> keep extra funds sitting in current accounts earning <strong>0% interest</strong>, or in low-return fixed deposits."

        body_plain = f"""Dear {name} Team,{praise_txt}

I hope you are doing well.

{hook.replace('<strong>', '').replace('</strong>', '')}

With Mutual Funds, you can easily make your surplus business cash work harder for you:

1. Liquid Funds for Idle Cash: Earn ~6.75%+ on spare working capital with instant access — withdraw your funds anytime within 24 hours.
2. Monthly SIPs: Build a disciplined financial backup and create long-term wealth for your family and future business expansion.
3. Tax-Smart Growth: Enjoy higher post-tax returns compared to traditional fixed deposits (FD).

As a Chartered Accountant and Financial Advisor serving businesses across {city}, I help business owners choose safe, transparent, and high-performing mutual funds tailored to their cash flow.

Would you be open to a quick 5-minute phone call this week to see how much your surplus funds can earn?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""

        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0;">
    <div style="display: inline-block; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        💡 Treasury & Working Capital • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{name}</strong> Team,</p>
    <p>{hook}</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">With Mutual Funds, your surplus business cash earns more:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Liquid Funds:</strong> Earn ~6.75%+ on idle cash with instant 24h redemption.</li>
        <li style="margin-bottom: 8px;"><strong>Monthly SIPs:</strong> Build long-term expansion reserves & director wealth.</li>
        <li style="margin-bottom: 0;"><strong>Tax Efficiency:</strong> Higher post-tax yield compared to traditional bank FDs.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Would you be open to a <strong>quick 5-minute phone call</strong> this week to see how much your surplus funds can earn?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"""<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin: 0; padding: 20px; background-color: #f8fafc;">{card_html}</body></html>"""
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}
    elif template_id == "mfg_industrial":
        subject = f"Optimizing operational margins & supplier buffer for {name}"
        body_plain = f"""Dear {name} Team,

I've been following {name}'s industrial footprint in {area}. For prominent manufacturing and supply operations in {city}, fluctuating raw material lead times and vendor provisions often tie up significant working capital.

We specialize in helping industrial leaders unlock 12–18% efficiency in their supply payment cycles and treasury reserves without compromising cash liquidity:

1. Raw Material Reserve Optimization: Eliminate idle cash drag while safeguarding supplier commitments.
2. Vendor Cycle Streamlining: Cut operational processing friction across your {category} supply chain.
3. Rapid ROI: Realize measurable cost recovery and treasury yield within the first 60 days.

Would you be open to a brief 5-minute introductory call this Thursday around 11:30 AM or 3:00 PM to review a 1-page efficiency breakdown for {name}?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""
        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #f0fdf4; color: #166534; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        🏭 Manufacturing & Industrial Supply • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{name}</strong> Team,</p>
    <p>I've been following {name}'s industrial footprint in <strong>{area}</strong>. For prominent manufacturing and supply operations in {city}, fluctuating raw material lead times and vendor buffers often tie up significant working capital.</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">We specialize in helping industrial leaders unlock 12–18% efficiency:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Reserve Optimization:</strong> Eliminate idle cash drag while safeguarding supplier commitments.</li>
        <li style="margin-bottom: 8px;"><strong>Vendor Streamlining:</strong> Cut operational friction across your {category} supply chain.</li>
        <li style="margin-bottom: 0;"><strong>Rapid ROI:</strong> Quantifiable cost recovery within the first 60 days.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Would you be open to a <strong>brief 5-minute call</strong> this Thursday to review an efficiency projection for {name}?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='margin: 0; padding: 20px; background-color: #f8fafc;'>{card_html}</body></html>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}

    elif template_id == "tech_saas":
        subject = f"Accelerating recurring pipeline & client retention for {name}"
        body_plain = f"""Hi {name} Leadership Team,

Noticed {name}'s technology solutions in {area}. For growth-stage software and B2B tech firms in {city}, sustaining high contract velocity while managing retainer runway and talent delivery is the top operational challenge.

We partner with modern technology firms to automate service delivery bottlenecks and elevate annual client retention:

• Pipeline Conversion Uplift: Increase qualified demo-to-close velocity by up to 24%.
• Churn Shielding: Automated engagement touchpoints that protect monthly recurring retainers.
• Cashflow Efficiency: Ensure zero delay between milestone delivery and cash settlement.

Could we schedule a concise 4-minute discussion this Wednesday or Thursday to share benchmark metrics from peer tech companies in {city}?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""
        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #e0e7ff; color: #3730a3; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        💻 B2B Technology & Software Services • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Hi <strong>{name}</strong> Leadership Team,</p>
    <p>Noticed {name}'s technology solutions in <strong>{area}</strong>. For growth-stage software and B2B tech firms in {city}, sustaining high contract velocity while managing retainer runway is the primary operational challenge.</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">Key impact areas we deliver for B2B tech partners:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Pipeline Uplift:</strong> Increase qualified demo-to-close velocity by up to 24%.</li>
        <li style="margin-bottom: 8px;"><strong>Churn Shielding:</strong> Automated touchpoints that protect monthly recurring retainers.</li>
        <li style="margin-bottom: 0;"><strong>Cashflow Efficiency:</strong> Zero lag between milestone completion and settlement.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Could we schedule a <strong>concise 4-minute discussion</strong> this week to share benchmark metrics from peer tech companies in {city}?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='margin: 0; padding: 20px; background-color: #f8fafc;'>{card_html}</body></html>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}

    elif template_id == "logistics_supply_chain":
        subject = f"Fleet turnaround & freight settlement efficiency for {name}"
        body_plain = f"""Dear {name} Operations Team,

Managing line-haul schedules, warehouse turnaround, and fuel price volatility requires exceptional margin discipline across {area}.

We consult with logistics and transport providers across {city} to eliminate payment delays and improve asset productivity:

1. Fast-Track Freight Billing: Compress detention and vendor settlement cycles from 45 days down to 10 days.
2. Working Capital Buffer: Safeguard fleet operations with liquid credit and low-drag cash allocation.
3. Transparent Tracking: Full visibility into trip profitability and operational expense leakages.

Would you have 5 minutes this week for a quick consultation on streamlining freight settlement for {name}?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""
        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #fef3c7; color: #b45309; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        🚚 Logistics, Transport & Warehousing • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{name}</strong> Operations Team,</p>
    <p>Managing line-haul schedules, warehouse turnaround, and fuel volatility requires exceptional margin discipline across <strong>{area}</strong>.</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">How we assist logistics operators in {city}:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Fast Freight Settlement:</strong> Compress billing cycles from 45 days to 10 days.</li>
        <li style="margin-bottom: 8px;"><strong>Working Capital Buffer:</strong> Safeguard fleet fuel & maintenance reserves.</li>
        <li style="margin-bottom: 0;"><strong>Leakage Prevention:</strong> Immediate transparency into trip profitability.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Would you have <strong>5 minutes this week</strong> for a quick consultation on streamlining settlement for {name}?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='margin: 0; padding: 20px; background-color: #f8fafc;'>{card_html}</body></html>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}

    elif template_id == "real_estate_construction":
        subject = f"Project financing & escrow milestone liquidity for {name}"
        body_plain = f"""Dear {name} Development Team,

Congratulations on your active footprint and reputation across {area}. In commercial construction and real estate development in {city}, keeping contractor milestones aligned with liquidity drawdowns is essential to avoid project stalls.

We structure working capital solutions and project cash flow management for leading builders:

• Escrow & Milestone Cash Management: Maximize interest yields on pre-disbursement funds while complying with regulatory guidelines.
• Contractor Draw Optimization: Eliminate costly downtime between construction phases.
• Bank & CMA Structuring: Expedited access to institutional project credit lines at competitive terms.

Could we connect for a brief 5-minute call this Thursday to explore cash flow structuring for your upcoming projects in {area}?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""
        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #ede9fe; color: #6d28d9; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        🏗️ Real Estate, Construction & Development • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{name}</strong> Development Team,</p>
    <p>Congratulations on your active footprint and reputation across <strong>{area}</strong>. In real estate and construction in {city}, keeping contractor milestones aligned with cashflow drawdowns prevents costly project delays.</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">How we structure financial workflows for developers:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Escrow Yield:</strong> Maximize short-term interest on milestone funds compliantly.</li>
        <li style="margin-bottom: 8px;"><strong>Contractor Draw Optimization:</strong> Eliminate idle downtime between project phases.</li>
        <li style="margin-bottom: 0;"><strong>Credit Structuring:</strong> Expedited access to institutional project financing.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Could we connect for a <strong>brief 5-minute call</strong> this Thursday to explore cash flow structuring for {name}?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='margin: 0; padding: 20px; background-color: #f8fafc;'>{card_html}</body></html>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}

    elif template_id == "b2b_professional":
        subject = f"Strategic growth & working capital efficiency for {name}"
        body_plain = f"""Dear {name} Team,

I've been following {name}'s prominent reputation in {area}. As commercial service providers scale in {city}, balancing client deliverables with billing predictability and cash reserves determines long-term profitability.

We work alongside top B2B firms in {category} to optimize core business operations:

• Revenue Predictability: Shorten client invoice collection windows and reduce unbilled WIP.
• Capital Preservation: Put surplus reserves to work in safe, liquid instruments earning ~7% annualized returns.
• Operational Bandwidth: Free up partner time to focus on high-margin advisory and business expansion.

Would you be open to a quick 5-minute introductory call this week to review how peer firms in {city} are optimizing their cash efficiency?

Best regards,

{sender_name}
{account.get('designation', 'Chartered Accountant & Financial Advisor')}
Serving {city} & Delhi NCR
Phone / WhatsApp: {sender_phone}
Email: {sender_email}"""
        card_html = f"""<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 1.6; color: #1e293b; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 26px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
    <div style="display: inline-block; background-color: #f1f5f9; color: #334155; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-bottom: 14px;">
        💼 General B2B Professional Services • {area}
    </div>
    <p style="margin-top: 0; font-size: 15px;">Dear <strong>{name}</strong> Team,</p>
    <p>I've been following {name}'s prominent reputation in <strong>{area}</strong>. As commercial service providers scale in {city}, balancing client deliverables with billing predictability and cash reserves determines long-term profitability.</p>
    <p style="margin-top: 14px; margin-bottom: 6px; font-weight: 600;">How we support B2B practice growth:</p>
    <ul style="padding-left: 20px; margin: 0 0 16px 0; color: #334155;">
        <li style="margin-bottom: 8px;"><strong>Collection Predictability:</strong> Shorten invoice realization cycles and unbilled WIP.</li>
        <li style="margin-bottom: 8px;"><strong>Capital Preservation:</strong> Earn ~7% annualized on idle buffer reserves with instant T+1 access.</li>
        <li style="margin-bottom: 0;"><strong>Partner Bandwidth:</strong> Automate operational follow-ups so you focus on high-margin advisory.</li>
    </ul>
    <p style="margin-top: 18px; margin-bottom: 20px;">Would you be open to a <strong>quick 5-minute introductory call</strong> this week to review how peer firms in {city} optimize efficiency?</p>
    <div style="margin: 22px 0;">
        <a href="https://wa.me/{clean_wa}" style="display: inline-block; background-color: #059669; color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; margin-right: 8px;">💬 Chat on WhatsApp</a>
        <a href="tel:{sender_phone.replace(' ', '')}" style="display: inline-block; background-color: #f1f5f9; color: #0f172a; font-weight: 600; font-size: 14px; text-decoration: none; padding: 11px 20px; border-radius: 6px; border: 1px solid #cbd5e1;">📞 Call {sender_phone}</a>
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
        <strong style="color: #0f172a; font-size: 15px;">{sender_name}</strong><br>
        {account.get('designation', 'Chartered Accountant & Financial Advisor')}<br>
        Serving {city} & Delhi NCR<br>
        Phone / WhatsApp: <a href="https://wa.me/{clean_wa}" style="color: #0284c7;">{sender_phone}</a> &nbsp;|&nbsp; Email: <a href="mailto:{sender_email}" style="color: #0284c7;">{sender_email}</a>
    </div>
</div>"""
        full_html = f"<!DOCTYPE html><html><head><meta charset='utf-8'></head><body style='margin: 0; padding: 20px; background-color: #f8fafc;'>{card_html}</body></html>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": full_html}

    else:
        subject = f"CA Advisory & Working Capital Planning for {name}"
        body_plain = f"Dear {name} Team,\n\nI hope your operations in {area} are running smoothly.\n\nAs a Chartered Accountant serving businesses in {city}, I assist firms with Treasury Mutual Funds, Bank Loans, and Tax Planning.\n\nWould you be open for a quick 5-minute call this week?\n\nBest regards,\n{sender_name}\n{sender_phone}"
        card_html = f"<div style='padding:20px; background:#fff;'><h3>{name}</h3><p>{body_plain}</p></div>"
        return {"subject": subject, "body_plain": body_plain, "card_html": card_html, "full_html": card_html}

def build_whatsapp_text(lead: Dict, account: Dict, custom_text: str = "") -> str:
    if custom_text:
        return interpolate_text(custom_text, lead, account)
    name = clean_business_name(lead.get("Business Name") or lead.get("Name") or lead.get("name") or "Business Owner")
    area = lead.get("Area") or lead.get("area") or lead.get("City") or "your area"
    sender_name = account.get("name", "CA Ishant Singla")
    return f"Hello {name} Team, this is {sender_name} (Chartered Accountant & Wealth Advisor). I noticed your business in {area}. Are you currently earning 6.75%+ interest on your surplus business cash, or is it sitting idle in a 0% current account? Would love to share a quick 2-minute overview on high-liquidity treasury mutual funds with instant 24h withdrawal. Let me know if you'd be open to a quick chat!"

# ----------------- IN-APP GOOGLE MAPS SCRAPER WORKER -----------------

def launch_chrome_browser(p, headless=True):
    for ch in ["chrome", "msedge", None]:
        try:
            return p.chromium.launch(
                channel=ch,
                headless=headless,
                args=["--lang=en-US", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
            )
        except Exception:
            continue
    raise RuntimeError("No compatible Chrome/Edge browser found.")

def scraper_worker(query: str, city: str, limit: int, output_filename: str, append_to_master: bool):
    global scraper_job
    scraper_job["is_running"] = True
    scraper_job["should_stop"] = False
    scraper_job["query"] = query
    scraper_job["city"] = city
    scraper_job["limit"] = limit
    scraper_job["found"] = 0
    scraper_job["emails_found"] = 0
    scraper_job["leads"] = []
    scraper_job["logs"] = [f"[{time.strftime('%H:%M:%S')}] Launching Google Maps Search for '{query}' (Target limit: {limit})..."]
    scraper_job["output_filename"] = output_filename
    scraper_job["start_time"] = time.time()

    clean_out_file = output_filename if output_filename.endswith(".csv") else f"{output_filename}.csv"
    out_csv_path = os.path.join(SCRAPPING_DIR, clean_out_file)

    encoded_query = urllib.parse.quote(query)
    search_url = f"https://www.google.com/maps/search/{encoded_query}?hl=en"
    seen_names = set()

    try:
        with sync_playwright() as p:
            browser = launch_chrome_browser(p, headless=True)
            context = browser.new_context(
                user_agent=REQUEST_HEADERS["User-Agent"],
                locale="en-US",
                viewport={"width": 1280, "height": 720}
            )
            context.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}", lambda r: r.abort())
            page = context.new_page()

            scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Navigating to Google Maps feed...")
            page.goto(search_url, timeout=30000)

            try:
                page.wait_for_selector('div[role="feed"]', timeout=14000)
                feed = page.locator('div[role="feed"]')
                scroll_count = min(15, max(3, limit // 4))
                for _ in range(scroll_count):
                    if scraper_job["should_stop"] or len(scraper_job["leads"]) >= limit:
                        break
                    feed.evaluate("el => el.scrollBy(0, 7000)")
                    page.wait_for_timeout(600)
            except Exception as e:
                scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [!] Feed selector wait: {e}")

            cards = page.locator('div.Nv2PK').all()
            scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Discovered {len(cards)} listings. Parsing business data & websites...")

            for card in cards:
                if scraper_job["should_stop"] or len(scraper_job["leads"]) >= limit:
                    break

                try:
                    text = card.inner_text()
                    a_elem = card.locator('a.hfpxzc').first
                    raw_name = a_elem.get_attribute("aria-label") or ""
                    maps_url = a_elem.get_attribute("href") or ""
                    if not raw_name:
                        continue

                    name = clean_business_name(raw_name)
                    if name.lower() in seen_names:
                        continue
                    seen_names.add(name.lower())

                    phone_match = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', text)
                    landline_match = re.search(r'\b(?:0124|011)[\s-]?\d{6,8}\b', text)
                    phone = phone_match.group(0) if phone_match else (landline_match.group(0) if landline_match else "")
                    wa_phone = sanitize_phone(phone)

                    rating_m = re.search(r'\b([1-5]\.[0-9])\b', text)
                    rating = rating_m.group(1) if rating_m else ""

                    reviews_m = re.search(r'\(([\d,]+)\)', text)
                    reviews = reviews_m.group(1).replace(",", "") if reviews_m else ""

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

                    email = ""
                    if website:
                        email = extract_email_from_url(website)

                    sub_city = city or ("Dwarka, Delhi" if "dwarka" in query.lower() else "Gurgaon, Haryana")
                    sub_area = address_snippet or sub_city

                    record = {
                        "Business Name": name,
                        "City": sub_city,
                        "Area": sub_area,
                        "Category": gmaps_cat or "Commercial Business",
                        "Email": email,
                        "Has Email": "Yes" if email else "No",
                        "Phone Number": phone,
                        "WhatsApp Mobile": wa_phone,
                        "Website": website,
                        "Address": address_snippet,
                        "Rating": rating,
                        "Reviews": reviews,
                        "GSTIN": "",
                        "Google Maps URL": maps_url,
                        "Query": query
                    }

                    scraper_job["leads"].append(record)
                    scraper_job["found"] = len(scraper_job["leads"])
                    if email:
                        scraper_job["emails_found"] += 1
                        scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [{len(scraper_job['leads'])}/{limit}] Found: {name} | ✉️ {email}")
                    else:
                        scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [{len(scraper_job['leads'])}/{limit}] Found: {name} (📞 {phone or 'N/A'})")

                    df = pd.DataFrame(scraper_job["leads"])
                    df.to_csv(out_csv_path, index=False, encoding="utf-8-sig")

                except Exception:
                    continue

            browser.close()

    except Exception as scrape_err:
        scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [!] Scraper error: {scrape_err}")

    if scraper_job["leads"]:
        df = pd.DataFrame(scraper_job["leads"])
        df.to_csv(out_csv_path, index=False, encoding="utf-8-sig")
        scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [✓] Saved {len(scraper_job['leads'])} leads to {clean_out_file}")

        if append_to_master:
            master_all = os.path.join(SCRAPPING_DIR, "businesses_in_gurgaon_dwarka_all.csv")
            if os.path.exists(master_all):
                try:
                    existing_master = pd.read_csv(master_all, dtype=str)
                    combined_df = pd.concat([existing_master, df], ignore_index=True)
                    dedup_res = deduplicate_dataframe(combined_df)
                    dedup_res["cleaned_df"].to_csv(master_all, index=False, encoding="utf-8-sig")
                    scraper_job["logs"].append(
                        f"[{time.strftime('%H:%M:%S')}] [✓] Appended & deduplicated with Master CRM database! "
                        f"({dedup_res['duplicates_merged']} duplicates merged into clean profiles)"
                    )
                except Exception as me:
                    scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [!] Error appending to master: {me}")

    scraper_job["is_running"] = False
    scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Scraping task finished. Total: {scraper_job['found']} leads ({scraper_job['emails_found']} with verified email).")

# ----------------- BATCH WORKER (SAFE MICRO-BATCH THROTTLED) -----------------

def batch_worker(
    target_leads: List[Dict],
    template_id: str,
    account_id: str,
    delay_min: int = 4,
    delay_max: int = 8,
    sent_log_file: str = "",
    custom_subject: str = "",
    custom_body: str = "",
    micro_batch_size: int = 4,
    batch_cooldown: int = 10,
    jitter_min: float = 3.0,
    jitter_max: float = 7.0
):
    global batch_job
    accounts = get_accounts()
    account = next((a for a in accounts if a["id"] == account_id), accounts[0] if accounts else DEFAULT_ACCOUNTS[0])
    sender_name = account.get("name", "CA Ishant Singla")
    sender_email = account.get("email")
    smtp_user = account.get("smtp_user")
    smtp_pass = account.get("smtp_pass")
    smtp_server = account.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(account.get("smtp_port", 587))

    def get_smtp():
        s = smtplib.SMTP(smtp_server, smtp_port, timeout=25)
        s.ehlo()
        s.starttls()
        s.login(smtp_user, smtp_pass)
        return s

    try:
        server = get_smtp()
        batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Connected & Authenticated to SMTP relay ({smtp_user}).")
    except Exception as e:
        batch_job["is_running"] = False
        batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [FATAL] SMTP connection failed: {e}")
        return

    crm_state = get_crm_state()

    # Split into micro-batches for serverless/hosting safety
    safe_batch_size = max(1, int(micro_batch_size))
    micro_batches = [target_leads[i:i + safe_batch_size] for i in range(0, len(target_leads), safe_batch_size)]
    batch_job["total_batches"] = len(micro_batches)
    batch_job["micro_batch_size"] = safe_batch_size
    batch_job["batch_cooldown"] = batch_cooldown
    batch_job["logs"].append(
        f"[{time.strftime('%H:%M:%S')}] Throttling active: {len(target_leads)} leads queued across {len(micro_batches)} micro-batches "
        f"(Batch size: {safe_batch_size}, Cooldown: {batch_cooldown}s, Jitter: {jitter_min}-{jitter_max}s)."
    )

    overall_idx = 0
    for chunk_idx, chunk in enumerate(micro_batches, 1):
        if batch_job["should_stop"]:
            batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Outreach cancelled by user.")
            break

        batch_job["current_batch"] = chunk_idx
        batch_job["logs"].append(
            f"[{time.strftime('%H:%M:%S')}] ⚡ [Batch {chunk_idx}/{len(micro_batches)}] Processing chunk of {len(chunk)} leads..."
        )

        for lead_in_chunk, lead in enumerate(chunk, 1):
            if batch_job["should_stop"]:
                break

            while batch_job["is_paused"]:
                time.sleep(1)
                if batch_job["should_stop"]:
                    break

            overall_idx += 1
            target_email = lead.get("email")
            lead_name = lead.get("name", "Business Owner")
            batch_job["current_lead"] = lead_name
            batch_job["current_email"] = target_email

            rendered = build_template_email(template_id, lead, account, custom_subject=custom_subject, custom_body=custom_body)
            msg_id = make_msgid(domain="gmail.com")
            msg = MIMEMultipart("alternative")
            msg["From"] = f"{sender_name} <{sender_email}>"
            msg["To"] = target_email
            msg["Subject"] = rendered["subject"]
            msg["Message-ID"] = msg_id

            msg.attach(MIMEText(rendered["body_plain"], "plain", "utf-8"))
            msg.attach(MIMEText(rendered["full_html"], "html", "utf-8"))

            success = False
            for attempt in range(1, 3):
                try:
                    server.sendmail(sender_email, target_email, msg.as_string())
                    success = True
                    break
                except Exception as send_err:
                    batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [!] Error sending to {target_email}: {send_err}. Reconnecting...")
                    time.sleep(3)
                    try:
                        server = get_smtp()
                    except Exception:
                        pass

            if success:
                batch_job["sent"] += 1
                batch_job["logs"].append(
                    f"[{time.strftime('%H:%M:%S')}] [SENT {overall_idx}/{len(target_leads)}] "
                    f"To: {target_email} ({lead_name}) [Batch {chunk_idx}/{len(micro_batches)}]"
                )

                if lead.get("id"):
                    crm_state.setdefault(lead["id"], {})["status"] = "Contacted"
                    crm_state[lead["id"]]["last_contacted"] = time.strftime("%Y-%m-%d %H:%M:%S")
                    save_crm_state(crm_state)

                if sent_log_file:
                    rec = {
                        "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                        "Mode": "Live Batch",
                        "Business Name": lead_name,
                        "Email": target_email,
                        "City": lead.get("city", ""),
                        "Area": lead.get("area", ""),
                        "Category": lead.get("category", ""),
                        "Subject": rendered["subject"],
                        "Message ID": msg_id,
                        "Status": "Sent"
                    }
                    try:
                        pd.DataFrame([rec]).to_csv(sent_log_file, mode="a" if os.path.exists(sent_log_file) else "w", header=not os.path.exists(sent_log_file), index=False)
                    except Exception:
                        pass

                # Randomized jitter interval between leads in this micro-batch
                if lead_in_chunk < len(chunk) or chunk_idx < len(micro_batches):
                    jitter = round(random.uniform(float(jitter_min), float(jitter_max)), 2)
                    time.sleep(jitter)
            else:
                batch_job["failed"] += 1
                batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [-] [FAILED] Could not deliver to {target_email}.")
                time.sleep(2)

        # Micro-batch cooldown pause between chunks
        if chunk_idx < len(micro_batches) and not batch_job["should_stop"]:
            batch_job["logs"].append(
                f"[{time.strftime('%H:%M:%S')}] ⏳ Micro-batch {chunk_idx} complete. Entering {batch_cooldown}s cooldown "
                f"to protect SMTP rate limits and avoid serverless timeouts..."
            )
            for cd in range(int(batch_cooldown), 0, -1):
                if batch_job["should_stop"]:
                    break
                batch_job["cooldown_remaining"] = cd
                time.sleep(1)
            batch_job["cooldown_remaining"] = 0

            # Safe SMTP keep-alive/reconnect after cooldown
            try:
                server.quit()
            except Exception:
                pass
            time.sleep(1)
            try:
                server = get_smtp()
            except Exception:
                time.sleep(3)
                try:
                    server = get_smtp()
                except Exception:
                    pass

    try:
        server.quit()
    except Exception:
        pass

    batch_job["is_running"] = False
    batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] [✓] Throttled outreach complete! Total Sent: {batch_job['sent']} | Failed: {batch_job['failed']}")

# ----------------- API ENDPOINTS -----------------

@app.route("/api/csvs", methods=["GET"])
def api_list_csvs():
    return jsonify({"success": True, "files": list_workspace_csvs()})

@app.route("/api/upload-csv", methods=["POST"])
def api_upload_csv():
    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '' or not file.filename.endswith('.csv'):
        return jsonify({"success": False, "error": "Please upload a valid .csv file"}), 400

    filename = secure_filename(file.filename)
    dest_path = os.path.join(SCRAPPING_DIR, filename)
    file.save(dest_path)

    # Smart Deduplication check
    try:
        df = pd.read_csv(dest_path, dtype=str)
        total_rows = len(df)
        dedup_res = deduplicate_dataframe(df)
        if dedup_res["duplicates_merged"] > 0:
            dedup_res["cleaned_df"].to_csv(dest_path, index=False, encoding="utf-8-sig")
            msg = f"Uploaded '{filename}' ({total_rows} rows). Fuzzy deduplication merged {dedup_res['duplicates_merged']} duplicate records into {dedup_res['unique_count']} clean profiles!"
        else:
            msg = f"Uploaded '{filename}' successfully ({total_rows} clean unique records verified)!"
    except Exception as e:
        msg = f"Uploaded '{filename}' successfully!"
        total_rows = 0
        dedup_res = {"duplicates_merged": 0, "unique_count": 0}

    return jsonify({
        "success": True,
        "message": msg,
        "filename": filename,
        "total_rows": total_rows,
        "duplicates_merged": dedup_res.get("duplicates_merged", 0),
        "unique_count": dedup_res.get("unique_count", total_rows)
    })

@app.route("/api/crm/deduplicate", methods=["POST"])
def api_crm_deduplicate():
    crm_res = compile_master_crm()
    return jsonify({
        "success": True,
        "message": f"Fuzzy matching & deduplication complete! Scanned {crm_res['dedup_stats']['total_scanned']} records, merged {crm_res['dedup_stats']['duplicates_merged']} duplicates.",
        "stats": crm_res["dedup_stats"]
    })

@app.route("/api/download-csv", methods=["GET"])
def api_download_csv():
    filename = request.args.get("file", "businesses_in_gurgaon_dwarka_with_email.csv")
    if filename == "MASTER_CRM":
        # Compile master CRM on the fly with fuzzy deduplication
        crm_res = compile_master_crm()
        df = pd.DataFrame(crm_res["leads"])
        csv_str = df.to_csv(index=False, encoding="utf-8-sig")
        return Response(
            csv_str,
            mimetype="text/csv",
            headers={"Content-Disposition": "attachment;filename=unified_master_crm_database.csv"}
        )

    full_path = os.path.join(SCRAPPING_DIR, filename)
    if not os.path.exists(full_path):
        full_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(full_path):
        return jsonify({"success": False, "error": "File not found"}), 404

    return send_file(full_path, as_attachment=True, download_name=filename)

def get_source_files_mtime(file_list):
    mtimes = []
    for f in file_list:
        for p in [os.path.join(SCRAPPING_DIR, f), os.path.join(BASE_DIR, f)]:
            if os.path.exists(p):
                try:
                    mtimes.append(os.path.getmtime(p))
                except Exception:
                    pass
                break
    if os.path.exists(CRM_STATE_FILE):
        try:
            mtimes.append(os.path.getmtime(CRM_STATE_FILE))
        except Exception:
            pass
    return max(mtimes) if mtimes else 0

def compile_master_crm(force_refresh=False):
    scan_files = [
        "businesses_in_gurgaon_dwarka_with_email.csv",
        "businesses_in_gurgaon_dwarka_all.csv",
        "businesses_in_karnal_gst.csv",
        "clinics_in_gurgaon.csv"
    ]
    if os.path.exists(SCRAPPING_DIR):
        for f in os.listdir(SCRAPPING_DIR):
            if f.endswith(".csv") and "sent_log" not in f and f not in scan_files:
                scan_files.append(f)

    current_mtime = get_source_files_mtime(scan_files)
    if not force_refresh and GLOBAL_LEADS_CACHE["master"]["data"] is not None and current_mtime <= GLOBAL_LEADS_CACHE["master"]["mtime"]:
        return GLOBAL_LEADS_CACHE["master"]["data"]

    crm_state = get_crm_state()
    records = []
    by_email = {}
    by_domain = {}
    by_phone = {}
    by_norm_name = {}
    by_norm_prefix = {}
    duplicates_merged = 0
    total_scanned = 0

    for sf in scan_files:
        full_p = os.path.join(SCRAPPING_DIR, sf)
        if not os.path.exists(full_p):
            full_p = os.path.join(BASE_DIR, sf)
        if not os.path.exists(full_p):
            continue

        try:
            df = pd.read_csv(full_p, dtype=str).fillna("")
            rows_dict = df.to_dict(orient="records")
        except Exception:
            continue

        for idx, row in enumerate(rows_dict):
            total_scanned += 1
            raw_name = str(row.get("Business Name") or row.get("Name") or row.get("Clinic Name") or "").strip()
            clean_name = clean_business_name(raw_name)
            email = str(row.get("Email") or "").strip()
            if email.lower() == "nan": email = ""
            phone = str(row.get("Phone Number") or row.get("Phone") or "").strip()
            if phone.lower() == "nan": phone = ""
            wa_phone = str(row.get("WhatsApp Mobile") or "").strip()
            if not wa_phone or wa_phone.lower() == "nan":
                wa_phone = sanitize_phone(phone)

            city = str(row.get("City") or "Delhi NCR").strip()
            if city.lower() == "nan": city = "Delhi NCR"
            area = str(row.get("Area") or row.get("Karnal Area") or city).strip()
            if area.lower() == "nan": area = city
            category = str(row.get("Category") or "General Business").strip()
            if category.lower() == "nan": category = "General Business"

            rating = str(row.get("Rating") or "").strip()
            reviews = str(row.get("Reviews") or "").strip()
            website = str(row.get("Website") or "").strip()
            address = str(row.get("Address") or "").strip()
            maps_url = str(row.get("Google Maps URL") or "").strip()

            candidate = {
                "name": clean_name,
                "raw_name": raw_name,
                "email": email,
                "has_email": bool(email and "@" in email),
                "phone": phone,
                "wa_phone": wa_phone,
                "city": city,
                "area": area,
                "category": category,
                "rating": rating if rating.lower() != "nan" else "",
                "reviews": reviews if reviews.lower() != "nan" else "",
                "website": website if website.lower() != "nan" else "",
                "address": address if address.lower() != "nan" else "",
                "maps_url": maps_url if maps_url.lower() != "nan" else "",
                "source_file": sf,
                "merged_count": 1,
                "dedup_tags": []
            }

            # Multi-index Fuzzy Matching:
            # 1. Exact Email
            matched_idx = None
            match_reason = ""
            em_clean = email.lower()
            if em_clean and "@" in em_clean and em_clean in by_email:
                matched_idx = by_email[em_clean]
                match_reason = f"email:{em_clean}"

            # 2. Normalized Corporate Domain
            if matched_idx is None:
                dom = extract_clean_domain(website or email)
                if dom and dom in by_domain:
                    matched_idx = by_domain[dom]
                    match_reason = f"domain:{dom}"

            # 3. Direct Phone Match
            if matched_idx is None:
                ph = normalize_phone_number(phone or wa_phone)
                if ph and ph in by_phone:
                    matched_idx = by_phone[ph]
                    match_reason = f"phone:{ph}"

            # 4. Exact Normalized Business Name ($O(1)$ Hash Map)
            norm_n = normalize_business_title(clean_name)
            if matched_idx is None and norm_n and norm_n in by_norm_name:
                matched_idx = by_norm_name[norm_n]
                match_reason = "exact_norm_name"

            # 5. Fast Fuzzy Business Name Similarity
            if matched_idx is None and norm_n and len(norm_n) >= 4:
                prefix = norm_n[:3]
                candidates = by_norm_prefix.get(prefix, [])
                len_norm = len(norm_n)
                for existing_norm, existing_idx in candidates:
                    if abs(len(existing_norm) - len_norm) > 6:
                        continue
                    ratio = SequenceMatcher(None, norm_n, existing_norm).ratio()
                    if ratio >= 0.88:
                        matched_idx = existing_idx
                        match_reason = f"fuzzy_name:{round(ratio*100)}%"
                        break
                    elif ratio >= 0.82 and city and city.lower() == records[existing_idx].get("city", "").lower():
                        matched_idx = existing_idx
                        match_reason = f"fuzzy_name_city:{round(ratio*100)}%"
                        break

            if matched_idx is not None:
                merge_lead_records(records[matched_idx], candidate, match_reason)
                duplicates_merged += 1
            else:
                new_idx = len(records)
                lead_id = f"master_{new_idx}"
                candidate["id"] = lead_id
                candidate["row_index"] = new_idx

                saved_info = crm_state.get(lead_id) or (crm_state.get(email) if email else {}) or {}
                candidate["status"] = saved_info.get("status", "New")
                candidate["notes"] = saved_info.get("notes", "")
                candidate["engagement_history"] = saved_info.get("engagement_history", [])
                candidate["last_contacted"] = saved_info.get("last_contacted", "")

                records.append(candidate)

                if em_clean and "@" in em_clean:
                    by_email[em_clean] = new_idx
                dom = extract_clean_domain(website or email)
                if dom:
                    by_domain[dom] = new_idx
                ph = normalize_phone_number(phone or wa_phone)
                if ph:
                    by_phone[ph] = new_idx
                if norm_n:
                    by_norm_name[norm_n] = new_idx
                    if len(norm_n) >= 3:
                        by_norm_prefix.setdefault(norm_n[:3], []).append((norm_n, new_idx))

    # Compute Lead Scores across all aggregated records
    tier_a_count = 0
    tier_b_count = 0
    tier_c_count = 0

    for rec in records:
        sc = calculate_lead_score(rec)
        rec["lead_score"] = sc["score"]
        rec["lead_tier"] = sc["tier"]
        rec["lead_tier_code"] = sc["tier_code"]
        rec["score_breakdown"] = sc["breakdown"]

        if sc["score"] >= 70:
            tier_a_count += 1
        elif sc["score"] >= 40:
            tier_b_count += 1
        else:
            tier_c_count += 1

    res = {
        "success": True,
        "filename": "MASTER_CRM",
        "total": len(records),
        "with_email": sum(1 for r in records if r["has_email"]),
        "with_phone": sum(1 for r in records if r["phone"]),
        "dedup_stats": {
            "total_scanned": total_scanned,
            "unique_leads": len(records),
            "duplicates_merged": duplicates_merged,
            "tier_a_hot": tier_a_count,
            "tier_b_warm": tier_b_count,
            "tier_c_cold": tier_c_count
        },
        "leads": records
    }

    # Store in memory cache & pre-compress with gzip
    try:
        raw_b = json.dumps(res).encode("utf-8")
        gz_b = gzip.compress(raw_b, compresslevel=6)
        GLOBAL_LEADS_CACHE["master"]["data"] = res
        GLOBAL_LEADS_CACHE["master"]["json_raw"] = raw_b
        GLOBAL_LEADS_CACHE["master"]["json_gz"] = gz_b
        GLOBAL_LEADS_CACHE["master"]["mtime"] = current_mtime
    except Exception:
        pass

    # Background async sync to SQLite engine
    try:
        threading.Thread(target=fast_store.sync_records, args=(records,), daemon=True).start()
    except Exception:
        pass

    return res

@app.route("/api/leads", methods=["GET"])
def api_get_leads():
    filename = request.args.get("file", "businesses_in_gurgaon_dwarka_with_email.csv")
    limit_param = request.args.get("limit")
    page = max(1, int(request.args.get("page", 1)))
    search = request.args.get("search", "").strip()
    status_filter = request.args.get("status", "").strip()
    accept_encoding = request.headers.get("Accept-Encoding", "")

    if filename == "MASTER_CRM":
        master_data = compile_master_crm()
        records = master_data.get("leads", [])

        # Server-side pagination and fast filtering if limit provided
        if limit_param and limit_param.lower() != "all":
            try:
                limit = max(1, int(limit_param))
            except ValueError:
                limit = 50

            filtered = records
            if status_filter and status_filter.lower() != "all":
                filtered = [r for r in filtered if (r.get("status") or "New") == status_filter]
            if search:
                s_lower = search.lower()
                filtered = [r for r in filtered if (
                    s_lower in r.get("name", "").lower() or
                    s_lower in r.get("email", "").lower() or
                    s_lower in r.get("phone", "") or
                    s_lower in r.get("area", "").lower() or
                    s_lower in r.get("category", "").lower()
                )]

            total_matching = len(filtered)
            start = (page - 1) * limit
            page_slice = filtered[start:start + limit]

            return jsonify({
                "success": True,
                "filename": "MASTER_CRM",
                "page": page,
                "limit": limit,
                "total": total_matching,
                "total_all": len(records),
                "total_pages": max(1, math.ceil(total_matching / limit)),
                "with_email": sum(1 for r in filtered if r.get("has_email")),
                "with_phone": sum(1 for r in filtered if r.get("phone")),
                "dedup_stats": master_data.get("dedup_stats"),
                "leads": page_slice
            })

        # Full dataset mode: stream pre-compressed gzip if supported
        if "gzip" in accept_encoding and GLOBAL_LEADS_CACHE["master"]["json_gz"]:
            return Response(
                GLOBAL_LEADS_CACHE["master"]["json_gz"],
                mimetype="application/json",
                headers={"Content-Encoding": "gzip", "X-Cache": "HIT", "Vary": "Accept-Encoding"}
            )
        return jsonify(master_data)

    # Individual CSV Handling with High-Speed Caching
    full_path = os.path.join(SCRAPPING_DIR, filename)
    if not os.path.exists(full_path):
        full_path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(full_path):
        return jsonify({"success": False, "error": f"File not found: {filename}"}), 404

    file_mtime = os.path.getmtime(full_path)
    state_mtime = os.path.getmtime(CRM_STATE_FILE) if os.path.exists(CRM_STATE_FILE) else 0
    combined_mtime = max(file_mtime, state_mtime)

    cached_file = GLOBAL_LEADS_CACHE["files"].get(filename)
    if cached_file and combined_mtime <= cached_file.get("mtime", 0):
        if "gzip" in accept_encoding and cached_file.get("json_gz"):
            return Response(
                cached_file["json_gz"],
                mimetype="application/json",
                headers={"Content-Encoding": "gzip", "X-Cache": "HIT", "Vary": "Accept-Encoding"}
            )
        return jsonify(cached_file["data"])

    try:
        df = pd.read_csv(full_path, dtype=str).fillna("")
        rows_dict = df.to_dict(orient="records")
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    crm_state = get_crm_state()
    records = []
    
    for idx, row in enumerate(rows_dict):
        raw_name = str(row.get("Business Name") or row.get("Name") or "").strip()
        clean_name = clean_business_name(raw_name)
        email = str(row.get("Email") or "").strip()
        if email.lower() == "nan": email = ""
        phone = str(row.get("Phone Number") or row.get("Phone") or "").strip()
        if phone.lower() == "nan": phone = ""
        wa_phone = str(row.get("WhatsApp Mobile") or "").strip()
        if not wa_phone or wa_phone.lower() == "nan":
            wa_phone = sanitize_phone(phone)

        city = str(row.get("City") or "Delhi NCR").strip()
        if city.lower() == "nan": city = "Delhi NCR"
        area = str(row.get("Area") or row.get("Karnal Area") or city).strip()
        if area.lower() == "nan": area = city
        category = str(row.get("Category") or "General Business").strip()
        if category.lower() == "nan": category = "General Business"

        rating = str(row.get("Rating") or "").strip()
        reviews = str(row.get("Reviews") or "").strip()
        website = str(row.get("Website") or "").strip()
        address = str(row.get("Address") or "").strip()
        maps_url = str(row.get("Google Maps URL") or "").strip()

        lead_id = f"{filename}_{idx}"
        saved_info = crm_state.get(lead_id) or (crm_state.get(email) if email else {}) or {}
        status = saved_info.get("status", "New")
        notes = saved_info.get("notes", "")
        engagement_history = saved_info.get("engagement_history", [])
        last_contacted = saved_info.get("last_contacted", "")

        rec = {
            "id": lead_id,
            "row_index": idx,
            "name": clean_name,
            "raw_name": raw_name,
            "email": email,
            "has_email": bool(email and "@" in email),
            "phone": phone,
            "wa_phone": wa_phone,
            "city": city,
            "area": area,
            "category": category,
            "rating": rating if rating.lower() != "nan" else "",
            "reviews": reviews if reviews.lower() != "nan" else "",
            "website": website if website.lower() != "nan" else "",
            "address": address if address.lower() != "nan" else "",
            "maps_url": maps_url if maps_url.lower() != "nan" else "",
            "status": status,
            "notes": notes,
            "engagement_history": engagement_history,
            "last_contacted": last_contacted,
            "source_file": filename,
            "merged_count": 1,
            "dedup_tags": []
        }

        # Calculate lead score & tier
        sc = calculate_lead_score(rec)
        rec["lead_score"] = sc["score"]
        rec["lead_tier"] = sc["tier"]
        rec["lead_tier_code"] = sc["tier_code"]
        rec["score_breakdown"] = sc["breakdown"]

        records.append(rec)

    file_res = {
        "success": True,
        "filename": filename,
        "total": len(records),
        "with_email": sum(1 for r in records if r["has_email"]),
        "with_phone": sum(1 for r in records if r["phone"]),
        "leads": records
    }

    try:
        raw_b = json.dumps(file_res).encode("utf-8")
        gz_b = gzip.compress(raw_b, compresslevel=6)
        GLOBAL_LEADS_CACHE["files"][filename] = {
            "mtime": combined_mtime,
            "data": file_res,
            "json_raw": raw_b,
            "json_gz": gz_b
        }
    except Exception:
        pass

    if "gzip" in accept_encoding and GLOBAL_LEADS_CACHE["files"].get(filename, {}).get("json_gz"):
        return Response(
            GLOBAL_LEADS_CACHE["files"][filename]["json_gz"],
            mimetype="application/json",
            headers={"Content-Encoding": "gzip", "X-Cache": "MISS", "Vary": "Accept-Encoding"}
        )

    return jsonify(file_res)

@app.route("/api/leads/update-status", methods=["POST"])
def api_update_lead_status():
    data = request.json or {}
    lead_id = data.get("lead_id")
    email = data.get("email")
    new_status = data.get("status")
    notes = data.get("notes")
    action = data.get("action")
    channel = data.get("channel", "manual")
    details = data.get("details", "")

    if not lead_id and not email:
        return jsonify({"success": False, "error": "lead_id or email required"}), 400

    key = str(lead_id or email)
    updated_state = log_lead_engagement(
        key,
        channel=channel,
        action=action or ("status_update" if new_status else "note_update"),
        details=details or (f"Stage changed to {new_status}" if new_status else "Notes updated"),
        new_status=new_status
    )
    if notes is not None:
        crm_state = get_crm_state()
        crm_state.setdefault(key, {})["notes"] = notes
        save_crm_state(crm_state)
        updated_state["notes"] = notes

    # Update in-memory caches and SQLite index in place in < 1ms
    try:
        fast_store.update_lead_status(key, new_status or "New", notes)
        if GLOBAL_LEADS_CACHE["master"]["data"]:
            for l in GLOBAL_LEADS_CACHE["master"]["data"].get("leads", []):
                if l.get("id") == key or l.get("email") == key:
                    if new_status: l["status"] = new_status
                    if notes is not None: l["notes"] = notes
                    l["last_contacted"] = time.strftime("%Y-%m-%d %H:%M:%S")
                    break

            # Background re-compression
            def recompress():
                try:
                    raw_b = json.dumps(GLOBAL_LEADS_CACHE["master"]["data"]).encode("utf-8")
                    GLOBAL_LEADS_CACHE["master"]["json_raw"] = raw_b
                    GLOBAL_LEADS_CACHE["master"]["json_gz"] = gzip.compress(raw_b, compresslevel=6)
                except Exception:
                    pass
            threading.Thread(target=recompress, daemon=True).start()
    except Exception:
        pass

    return jsonify({"success": True, "lead_id": key, "state": updated_state})

@app.route("/api/leads/fast-search", methods=["GET"])
def api_leads_fast_search():
    """
    Sub-millisecond query endpoint for 5,000,000+ leads using SQLite B-Tree indexes.
    """
    page = max(1, int(request.args.get("page", 1)))
    limit = min(500, max(1, int(request.args.get("limit", 50))))
    search = request.args.get("search", "").strip()
    status = request.args.get("status", "").strip()
    category = request.args.get("category", "").strip()
    min_score = request.args.get("min_score")
    sort_by = request.args.get("sort_by", "score_desc")
    has_email = None
    if request.args.get("has_email") == "true":
        has_email = True
    elif request.args.get("has_email") == "false":
        has_email = False

    min_score_val = int(min_score) if min_score and min_score.isdigit() else None
    
    t0 = time.time()
    result = fast_store.query_leads(
        page=page,
        limit=limit,
        search=search,
        status=status,
        has_email=has_email,
        category=category,
        min_score=min_score_val,
        sort_by=sort_by
    )
    result["query_time_ms"] = round((time.time() - t0) * 1000, 2)
    return jsonify(result)

# ----------------- IN-APP MAPS SCRAPER ENDPOINTS -----------------

@app.route("/api/scraper/start", methods=["POST"])
def api_scraper_start():
    global scraper_job
    if scraper_job["is_running"]:
        return jsonify({"success": False, "error": "A scraping task is already running in the background"}), 400

    data = request.json or {}
    query = data.get("query", "").strip()
    city = data.get("city", "Gurgaon, Haryana").strip()
    limit = int(data.get("limit", 25))
    output_filename = data.get("output_filename", "").strip()
    append_to_master = bool(data.get("append_to_master", False))

    if not query:
        return jsonify({"success": False, "error": "Search query is required"}), 400

    if not output_filename:
        clean_q = re.sub(r'[^a-zA-Z0-9]', '_', query.lower())[:25]
        output_filename = f"scraped_{clean_q}.csv"

    t = threading.Thread(
        target=scraper_worker,
        args=(query, city, limit, output_filename, append_to_master),
        daemon=True
    )
    t.start()

    return jsonify({
        "success": True,
        "message": f"Started Google Maps search for '{query}' (limit: {limit})",
        "output_filename": output_filename
    })

@app.route("/api/scraper/status", methods=["GET"])
def api_scraper_status():
    global scraper_job
    pct = round(scraper_job["found"] / scraper_job["limit"] * 100, 1) if scraper_job["limit"] > 0 else 0
    return jsonify({
        "success": True,
        "job": {
            "is_running": scraper_job["is_running"],
            "query": scraper_job["query"],
            "city": scraper_job["city"],
            "limit": scraper_job["limit"],
            "found": scraper_job["found"],
            "emails_found": scraper_job["emails_found"],
            "percentage": min(100, pct),
            "output_filename": scraper_job["output_filename"],
            "logs": scraper_job["logs"][-30:],
            "recent_leads": scraper_job["leads"][-10:]
        }
    })

@app.route("/api/scraper/stop", methods=["POST"])
def api_scraper_stop():
    global scraper_job
    scraper_job["should_stop"] = True
    scraper_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] User requested scraper to stop...")
    return jsonify({"success": True, "message": "Stopping scraper task..."})

# ----------------- DAILY CRON & QUOTA ENDPOINTS -----------------

@app.route("/api/cron/status", methods=["GET"])
def api_cron_status():
    tracker = get_daily_tracker()
    return jsonify({
        "success": True,
        "tracker": {
            "date": tracker["date"],
            "sent_today": tracker["sent_today"],
            "daily_limit": tracker["daily_limit"],
            "remaining_today": max(0, tracker["daily_limit"] - tracker["sent_today"]),
            "token": tracker["token"],
            "target_file": tracker.get("target_file", "businesses_in_gurgaon_dwarka_with_email.csv"),
            "last_dispatch": tracker.get("last_dispatch"),
            "micro_batch_size": tracker.get("micro_batch_size", 4),
            "batch_cooldown": tracker.get("batch_cooldown", 10),
            "jitter_min": tracker.get("jitter_min", 3.0),
            "jitter_max": tracker.get("jitter_max", 7.0),
            "webhook_endpoint": f"/api/cron/dispatch-daily?token={tracker['token']}"
        }
    })

@app.route("/api/cron/settings", methods=["POST"])
def api_cron_settings():
    data = request.json or {}
    tracker = get_daily_tracker()
    if "daily_limit" in data:
        tracker["daily_limit"] = int(data["daily_limit"])
    if "token" in data and data["token"]:
        tracker["token"] = str(data["token"]).strip()
    if "target_file" in data and data["target_file"]:
        tracker["target_file"] = str(data["target_file"]).strip()
    if "micro_batch_size" in data:
        tracker["micro_batch_size"] = max(1, int(data["micro_batch_size"]))
    if "batch_cooldown" in data:
        tracker["batch_cooldown"] = max(0, int(data["batch_cooldown"]))
    if "jitter_min" in data:
        tracker["jitter_min"] = max(1.0, float(data["jitter_min"]))
    if "jitter_max" in data:
        tracker["jitter_max"] = max(tracker["jitter_min"], float(data["jitter_max"]))
    save_daily_tracker(tracker)
    return jsonify({"success": True, "message": "Daily automation & micro-batch quota settings saved!", "tracker": tracker})

@app.route("/api/cron/dispatch-daily", methods=["GET", "POST"])
def api_cron_dispatch_daily():
    tracker = get_daily_tracker()
    token = request.args.get("token") or request.headers.get("X-Cron-Token") or (request.json or {}).get("token")

    if token != tracker["token"]:
        return jsonify({"success": False, "error": "Unauthorized: Invalid cron webhook token"}), 401

    if tracker["sent_today"] >= tracker["daily_limit"]:
        return jsonify({
            "success": False,
            "message": f"Daily limit reached ({tracker['sent_today']}/{tracker['daily_limit']} sent today). Resets tomorrow.",
            "sent_today": tracker["sent_today"],
            "daily_limit": tracker["daily_limit"],
            "remaining_today": 0
        })

    budget = tracker["daily_limit"] - tracker["sent_today"]

    target_file = tracker.get("target_file", "businesses_in_gurgaon_dwarka_with_email.csv")
    full_p = os.path.join(SCRAPPING_DIR, target_file)
    if not os.path.exists(full_p):
        full_p = os.path.join(SCRAPPING_DIR, "businesses_in_gurgaon_dwarka_with_email.csv")

    crm_state = get_crm_state()
    try:
        df = pd.read_csv(full_p, dtype=str)
    except Exception as e:
        return jsonify({"success": False, "error": f"Error loading target dataset: {e}"}), 500

    eligible_leads = []
    for idx, r in df.iterrows():
        email = str(r.get("Email", "")).strip()
        if not email or "@" not in email:
            continue
        lead_id = f"{target_file}_{idx}"
        status = crm_state.get(lead_id, {}).get("status") or crm_state.get(email, {}).get("status", "New")
        if status == "New":
            eligible_leads.append({
                "id": lead_id,
                "name": clean_business_name(str(r.get("Business Name") or r.get("Name") or "")),
                "email": email,
                "city": str(r.get("City", "Delhi NCR")),
                "area": str(r.get("Area", "Delhi NCR")),
                "category": str(r.get("Category", "Commercial Business")),
                "rating": str(r.get("Rating", "")),
                "reviews": str(r.get("Reviews", ""))
            })
            if len(eligible_leads) >= budget:
                break

    if not eligible_leads:
        return jsonify({
            "success": True,
            "message": "No new uncontacted leads found for dispatch.",
            "sent_today": tracker["sent_today"],
            "remaining_today": budget
        })

    accounts = get_accounts()
    account_id = accounts[0]["id"]
    sent_log_file = os.path.join(SCRAPPING_DIR, "gurgaon_dwarka_mf_sent_log.csv")

    micro_batch_size = tracker.get("micro_batch_size", 4)
    batch_cooldown = tracker.get("batch_cooldown", 10)
    jitter_min = tracker.get("jitter_min", 3.0)
    jitter_max = tracker.get("jitter_max", 7.0)

    t = threading.Thread(
        target=batch_worker,
        args=(eligible_leads, "mutual_fund", account_id, int(jitter_min), int(jitter_max), sent_log_file),
        kwargs={
            "micro_batch_size": micro_batch_size,
            "batch_cooldown": batch_cooldown,
            "jitter_min": jitter_min,
            "jitter_max": jitter_max
        },
        daemon=True
    )
    t.start()

    tracker["sent_today"] += len(eligible_leads)
    tracker["last_dispatch"] = time.strftime("%Y-%m-%d %H:%M:%S")
    save_daily_tracker(tracker)

    return jsonify({
        "success": True,
        "message": f"Serverless micro-batch cron dispatched {len(eligible_leads)} leads across safe chunks with cooldown.",
        "dispatched_count": len(eligible_leads),
        "sent_today": tracker["sent_today"],
        "daily_limit": tracker["daily_limit"],
        "remaining_today": max(0, tracker["daily_limit"] - tracker["sent_today"]),
        "micro_batch_size": micro_batch_size,
        "batch_cooldown": batch_cooldown
    })

# ----------------- CALENDAR SCHEDULING ENDPOINTS -----------------

@app.route("/api/calendar/events", methods=["GET"])
def api_get_calendar_events():
    return jsonify({"success": True, "events": get_calendar_events()})

@app.route("/api/calendar/schedule", methods=["POST"])
def api_schedule_event():
    data = request.json or {}
    lead_name = data.get("lead_name", "Prospective Client")
    dt_str = data.get("datetime", time.strftime("%Y-%m-%dT11:00"))
    title = data.get("title") or f"Follow-up Consultation with {lead_name}"
    agenda = data.get("agenda", "Treasury Mutual Fund & Tax Advisory Consultation")

    evt = {
        "id": f"evt_{int(time.time()*1000)}",
        "lead_id": data.get("lead_id", ""),
        "lead_name": lead_name,
        "lead_phone": data.get("lead_phone", ""),
        "lead_email": data.get("lead_email", ""),
        "title": title,
        "datetime": dt_str,
        "agenda": agenda,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    events = get_calendar_events()
    events.append(evt)
    save_calendar_events(events)

    # Update CRM status if lead_id present
    if data.get("lead_id"):
        crm_state = get_crm_state()
        crm_state.setdefault(data["lead_id"], {})["status"] = "Follow-up"
        save_crm_state(crm_state)

    return jsonify({"success": True, "message": f"Follow-up scheduled with {lead_name}!", "event": evt})

@app.route("/api/calendar/export-ics", methods=["GET"])
def api_export_ics():
    title = request.args.get("title", "CRM Follow-up Consultation")
    agenda = request.args.get("agenda", "Follow-up consultation")
    dt_str = request.args.get("datetime", "")
    
    clean_dt = re.sub(r'[^0-9]', '', dt_str)
    if len(clean_dt) >= 12:
        start_dt = clean_dt[:12] + "00"
    else:
        start_dt = time.strftime("%Y%m%d%H%M%S")

    ics_content = f"""BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ApexOutreach Studio//CRM Outreach//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:{title}
DESCRIPTION:{agenda}
DTSTART:{start_dt}
DTEND:{start_dt}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR"""

    return Response(
        ics_content,
        mimetype="text/calendar",
        headers={"Content-Disposition": "attachment;filename=crm_followup_reminder.ics"}
    )

# ----------------- ACCOUNTS & OUTREACH -----------------

@app.route("/api/accounts", methods=["GET"])
def api_get_accounts():
    accounts = get_accounts()
    safe_accounts = []
    for a in accounts:
        safe_copy = dict(a)
        p = safe_copy.get("smtp_pass", "")
        safe_copy["smtp_pass_masked"] = (p[:3] + "••••" + p[-2:]) if len(p) >= 5 else "••••"
        safe_accounts.append(safe_copy)
    return jsonify({"success": True, "accounts": safe_accounts})

@app.route("/api/accounts/save", methods=["POST"])
def api_save_account():
    data = request.json or {}
    acc_id = data.get("id") or str(int(time.time()))
    accounts = get_accounts()
    existing_idx = next((i for i, a in enumerate(accounts) if a["id"] == acc_id), -1)
    
    new_acc = {
        "id": acc_id,
        "name": data.get("name", "Outreach Sender"),
        "email": data.get("email", ""),
        "phone": data.get("phone", ""),
        "designation": data.get("designation", "Financial Advisor"),
        "location": data.get("location", "Delhi NCR"),
        "smtp_server": data.get("smtp_server", "smtp.gmail.com"),
        "smtp_port": int(data.get("smtp_port", 587)),
        "smtp_user": data.get("smtp_user", data.get("email", "")),
        "smtp_pass": data.get("smtp_pass", ""),
        "is_active": True
    }

    if existing_idx >= 0:
        if not new_acc["smtp_pass"]:
            new_acc["smtp_pass"] = accounts[existing_idx]["smtp_pass"]
        accounts[existing_idx] = new_acc
    else:
        accounts.append(new_acc)

    save_accounts(accounts)
    return jsonify({"success": True, "message": f"Sender Profile '{new_acc['name']}' saved successfully!", "account": new_acc})

@app.route("/api/accounts/test", methods=["POST"])
def api_test_account():
    data = request.json or {}
    server = data.get("smtp_server", "smtp.gmail.com")
    port = int(data.get("smtp_port", 587))
    user = data.get("smtp_user", "")
    pwd = data.get("smtp_pass", "")

    try:
        s = smtplib.SMTP(server, port, timeout=12)
        s.ehlo()
        s.starttls()
        s.login(user, pwd)
        s.quit()
        return jsonify({"success": True, "message": f"SMTP Authentication Successful for {user}!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/preview", methods=["POST"])
def api_preview_email():
    data = request.json or {}
    template_id = data.get("template_id", "mutual_fund")
    lead = data.get("lead", {})
    account_id = data.get("account_id", "dinesh_singhal")
    custom_subject = data.get("custom_subject", "")
    custom_body = data.get("custom_body", "")
    custom_wa = data.get("custom_wa", "")
    
    accounts = get_accounts()
    account = next((a for a in accounts if a["id"] == account_id), accounts[0])
    
    rendered = build_template_email(template_id, lead, account, custom_subject=custom_subject, custom_body=custom_body)
    wa_text = build_whatsapp_text(lead, account, custom_text=custom_wa)
    
    return jsonify({
        "success": True,
        "subject": rendered["subject"],
        "body_plain": rendered["body_plain"],
        "card_html": rendered["card_html"],
        "full_html": rendered["full_html"],
        "wa_text": wa_text
    })

@app.route("/api/send-single", methods=["POST"])
def api_send_single():
    data = request.json or {}
    lead = data.get("lead", {})
    template_id = data.get("template_id", "mutual_fund")
    account_id = data.get("account_id", "dinesh_singhal")
    override_email = data.get("override_email")
    custom_subject = data.get("custom_subject", "")
    custom_body = data.get("custom_body", "")

    target_email = override_email or lead.get("email")
    if not target_email or "@" not in target_email:
        return jsonify({"success": False, "error": "Valid recipient email required"}), 400

    accounts = get_accounts()
    account = next((a for a in accounts if a["id"] == account_id), accounts[0])
    rendered = build_template_email(template_id, lead, account, custom_subject=custom_subject, custom_body=custom_body)

    sender_name = account.get("name", "CA Ishant Singla")
    sender_email = account.get("email")
    smtp_user = account.get("smtp_user")
    smtp_pass = account.get("smtp_pass")
    smtp_server = account.get("smtp_server", "smtp.gmail.com")
    smtp_port = int(account.get("smtp_port", 587))

    try:
        s = smtplib.SMTP(smtp_server, smtp_port, timeout=20)
        s.ehlo()
        s.starttls()
        s.login(smtp_user, smtp_pass)

        msg_id = make_msgid(domain="gmail.com")
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{sender_name} <{sender_email}>"
        msg["To"] = target_email
        msg["Subject"] = rendered["subject"]
        msg["Message-ID"] = msg_id

        msg.attach(MIMEText(rendered["body_plain"], "plain", "utf-8"))
        msg.attach(MIMEText(rendered["full_html"], "html", "utf-8"))

        s.sendmail(sender_email, target_email, msg.as_string())
        s.quit()

        if lead.get("id"):
            crm_state = get_crm_state()
            crm_state.setdefault(lead["id"], {})["status"] = "Contacted"
            crm_state[lead["id"]]["last_contacted"] = time.strftime("%Y-%m-%d %H:%M:%S")
            save_crm_state(crm_state)

        log_path = os.path.join(SCRAPPING_DIR, "gurgaon_dwarka_mf_sent_log.csv")
        rec = {
            "Timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "Mode": "Live Single",
            "Business Name": lead.get("name", ""),
            "Email": target_email,
            "City": lead.get("city", ""),
            "Area": lead.get("area", ""),
            "Category": lead.get("category", ""),
            "Subject": rendered["subject"],
            "Message ID": msg_id,
            "Status": "Sent"
        }
        pd.DataFrame([rec]).to_csv(log_path, mode="a" if os.path.exists(log_path) else "w", header=not os.path.exists(log_path), index=False)

        return jsonify({"success": True, "message": f"Email successfully delivered to {target_email}!"})

    except Exception as e:
        return jsonify({"success": False, "error": f"SMTP Error: {str(e)}"}), 500

@app.route("/api/batch-start", methods=["POST"])
def api_batch_start():
    global batch_job
    if batch_job["is_running"]:
        return jsonify({"success": False, "error": "A batch job is already running"}), 400

    data = request.json or {}
    leads = data.get("leads", [])
    template_id = data.get("template_id", "mutual_fund")
    account_id = data.get("account_id", "dinesh_singhal")
    delay_min = int(data.get("delay_min", 4))
    delay_max = int(data.get("delay_max", 8))
    csv_name = data.get("csv_name", "businesses_in_gurgaon_dwarka_with_email.csv")
    custom_subject = data.get("custom_subject", "")
    custom_body = data.get("custom_body", "")

    micro_batch_size = max(1, int(data.get("micro_batch_size", 4)))
    batch_cooldown = max(0, int(data.get("batch_cooldown", 10)))
    jitter_min = max(1.0, float(data.get("jitter_min", delay_min or 3.0)))
    jitter_max = max(jitter_min, float(data.get("jitter_max", delay_max or 7.0)))

    valid_leads = [l for l in leads if l.get("email") and "@" in l["email"]]
    if not valid_leads:
        return jsonify({"success": False, "error": "No valid leads with email address provided"}), 400

    sent_log_file = os.path.join(SCRAPPING_DIR, "gurgaon_dwarka_mf_sent_log.csv")

    batch_job = {
        "is_running": True,
        "is_paused": False,
        "should_stop": False,
        "total": len(valid_leads),
        "sent": 0,
        "failed": 0,
        "current_lead": "",
        "current_email": "",
        "logs": [f"[{time.strftime('%H:%M:%S')}] Initialized throttled batch dispatch for {len(valid_leads)} verified businesses..."],
        "start_time": time.time(),
        "csv_name": csv_name,
        "micro_batch_size": micro_batch_size,
        "batch_cooldown": batch_cooldown,
        "current_batch": 1,
        "total_batches": max(1, (len(valid_leads) + micro_batch_size - 1) // micro_batch_size),
        "cooldown_remaining": 0
    }

    t = threading.Thread(
        target=batch_worker,
        args=(valid_leads, template_id, account_id, int(jitter_min), int(jitter_max), sent_log_file),
        kwargs={
            "custom_subject": custom_subject,
            "custom_body": custom_body,
            "micro_batch_size": micro_batch_size,
            "batch_cooldown": batch_cooldown,
            "jitter_min": jitter_min,
            "jitter_max": jitter_max
        },
        daemon=True
    )
    t.start()

    return jsonify({
        "success": True,
        "message": f"Started throttled outreach queue for {len(valid_leads)} leads ({batch_job['total_batches']} micro-batches)!",
        "micro_batch_size": micro_batch_size,
        "batch_cooldown": batch_cooldown
    })

@app.route("/api/batch-status", methods=["GET"])
def api_batch_status():
    global batch_job
    pct = round((batch_job["sent"] + batch_job["failed"]) / batch_job["total"] * 100, 1) if batch_job["total"] > 0 else 0
    return jsonify({
        "success": True,
        "job": {
            "is_running": batch_job["is_running"],
            "is_paused": batch_job["is_paused"],
            "total": batch_job["total"],
            "sent": batch_job["sent"],
            "failed": batch_job["failed"],
            "percentage": pct,
            "current_lead": batch_job["current_lead"],
            "current_email": batch_job["current_email"],
            "csv_name": batch_job["csv_name"],
            "micro_batch_size": batch_job.get("micro_batch_size", 4),
            "batch_cooldown": batch_job.get("batch_cooldown", 10),
            "current_batch": batch_job.get("current_batch", 1),
            "total_batches": batch_job.get("total_batches", 1),
            "cooldown_remaining": batch_job.get("cooldown_remaining", 0),
            "logs": batch_job["logs"][-40:]
        }
    })

@app.route("/api/batch-control", methods=["POST"])
def api_batch_control():
    global batch_job
    action = (request.json or {}).get("action")
    if action == "pause":
        batch_job["is_paused"] = True
        batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Batch paused by user.")
    elif action == "resume":
        batch_job["is_paused"] = False
        batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Batch resumed by user.")
    elif action == "stop":
        batch_job["should_stop"] = True
        batch_job["logs"].append(f"[{time.strftime('%H:%M:%S')}] Stopping batch...")
    return jsonify({"success": True, "action": action})

@app.route("/api/logs", methods=["GET"])
def api_get_logs():
    log_files = ["gurgaon_dwarka_mf_sent_log.csv", "karnal_mf_sent_log.csv", "karnal_gst_sent_log.csv", "sent_log.csv"]
    all_logs = []
    for lf in log_files:
        full_p = os.path.join(SCRAPPING_DIR, lf)
        if os.path.exists(full_p):
            try:
                df = pd.read_csv(full_p, dtype=str)
                for _, r in df.iterrows():
                    all_logs.append({
                        "file": lf,
                        "timestamp": str(r.get("Timestamp", "")),
                        "mode": str(r.get("Mode", "")),
                        "business_name": str(r.get("Business Name") or r.get("Clinic Name", "")),
                        "email": str(r.get("Email", "")),
                        "city_area": str(r.get("Area") or r.get("City", "")),
                        "subject": str(r.get("Subject", "")),
                        "status": str(r.get("Status", "Sent"))
                    })
            except Exception:
                pass
    return jsonify({"success": True, "logs": all_logs[:300]})

# ----------------- ADVANCED PRODUCTIVITY & AUTOMATION API ENDPOINTS -----------------

@app.route("/api/tasks", methods=["GET"])
def api_get_tasks():
    tasks = get_tasks()
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    pending = [t for t in tasks if not t.get("completed")]
    overdue = [t for t in pending if t.get("due_date") and t["due_date"] < now_str]
    return jsonify({
        "success": True,
        "tasks": tasks,
        "pending_count": len(pending),
        "overdue_count": len(overdue)
    })

@app.route("/api/tasks", methods=["POST"])
def api_create_task():
    data = request.json or {}
    lead_id = data.get("lead_id", "")
    lead_name = data.get("lead_name", "Lead")
    lead_phone = data.get("lead_phone", "")
    lead_email = data.get("lead_email", "")
    lead_city = data.get("lead_city", "")
    title = data.get("title", "Follow-up")
    action_type = data.get("action_type", "call")
    due_date = data.get("due_date") or (time.strftime("%Y-%m-%d %H:%M:%S"))
    notes = data.get("notes", "")

    task_id = f"task_{int(time.time() * 1000)}"
    new_task = {
        "id": task_id,
        "lead_id": lead_id,
        "lead_name": lead_name,
        "lead_phone": lead_phone,
        "lead_email": lead_email,
        "lead_city": lead_city,
        "title": title,
        "action_type": action_type,
        "due_date": due_date,
        "completed": False,
        "notes": notes,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    tasks = get_tasks()
    tasks.insert(0, new_task)
    save_tasks(tasks)

    if lead_id:
        log_lead_engagement(
            lead_id,
            channel="system",
            action="task_created",
            details=f"Task added: {title} (Due: {due_date})",
            new_status="Follow-up"
        )

    return jsonify({"success": True, "task": new_task, "message": "Follow-up task created!"})

@app.route("/api/tasks/toggle", methods=["POST"])
def api_toggle_task():
    data = request.json or {}
    task_id = data.get("task_id")
    tasks = get_tasks()
    updated = None
    for t in tasks:
        if t["id"] == task_id:
            t["completed"] = not t.get("completed", False)
            t["completed_at"] = time.strftime("%Y-%m-%d %H:%M:%S") if t["completed"] else None
            updated = t
            if t.get("lead_id"):
                action = "task_completed" if t["completed"] else "task_reopened"
                log_lead_engagement(t["lead_id"], channel="system", action=action, details=f"Task '{t['title']}' marked {action.replace('_', ' ')}")
            break

    if updated:
        save_tasks(tasks)
        return jsonify({"success": True, "task": updated})
    return jsonify({"success": False, "error": "Task not found"}), 404

@app.route("/api/tasks/delete", methods=["POST"])
def api_delete_task():
    data = request.json or {}
    task_id = data.get("task_id")
    tasks = get_tasks()
    tasks = [t for t in tasks if t["id"] != task_id]
    save_tasks(tasks)
    return jsonify({"success": True, "message": "Task deleted"})

@app.route("/api/whatsapp/templates", methods=["GET"])
def api_get_whatsapp_templates():
    return jsonify({"success": True, "templates": get_whatsapp_templates()})

@app.route("/api/whatsapp/templates", methods=["POST"])
def api_save_whatsapp_templates():
    data = request.json or {}
    templates = data.get("templates")
    if isinstance(templates, list):
        save_whatsapp_templates(templates)
        return jsonify({"success": True, "message": "Saved WhatsApp templates!", "templates": templates})
    return jsonify({"success": False, "error": "Invalid templates data"}), 400

@app.route("/api/ai/personalize", methods=["POST"])
def api_ai_personalize():
    data = request.json or {}
    lead = data.get("lead") or {}
    account_id = data.get("account_id", "dinesh_singhal")
    angle = data.get("angle", "mutual_fund")
    tone = data.get("tone", "consultative")
    custom_prompt = data.get("custom_prompt", "")

    accounts = get_accounts()
    account = next((a for a in accounts if a["id"] == account_id), accounts[0] if accounts else DEFAULT_ACCOUNTS[0])

    result = generate_ai_personalization(lead, account, angle=angle, tone=tone, custom_prompt=custom_prompt)
    return jsonify(result)

@app.route("/api/leads/engagement-event", methods=["POST"])
def api_log_engagement_event():
    data = request.json or {}
    lead_id = data.get("lead_id")
    channel = data.get("channel", "manual")
    action = data.get("action", "custom_event")
    details = data.get("details", "")
    new_status = data.get("new_status")

    if not lead_id:
        return jsonify({"success": False, "error": "lead_id is required"}), 400

    lead_state = log_lead_engagement(lead_id, channel=channel, action=action, details=details, new_status=new_status)
    return jsonify({"success": True, "state": lead_state, "lead_id": lead_id})

def generate_multi_touch_sequence(lead: Dict, account: Dict, strategy: str = "mutual_fund") -> Dict:
    """Generates an intelligent 3-step multi-touch outreach sequence tailored to lead's industry, rating, and location."""
    name = clean_business_name(lead.get("name") or lead.get("Business Name") or "Business Owner")
    city = lead.get("city") or "Delhi NCR"
    area = lead.get("area") or city
    category = lead.get("category") or "Commercial Enterprise"
    rating = str(lead.get("rating") or "").strip()
    reviews = str(lead.get("reviews") or "").strip()

    sender_name = account.get("name", "CA Ishant Singla")
    sender_phone = account.get("phone", "+91 7015147209")
    sender_desig = account.get("designation", "Chartered Accountant & Financial Advisor")
    sender_loc = account.get("location", "Gurgaon & Delhi NCR")

    rating_proof = f"Noticed your impressive {rating}★ rating ({reviews} reviews) on Google Maps in {area}." if rating and reviews else (f"Noticed your strong reputation in {area}." if rating else f"Following your business footprint across {area}.")

    # Industry tailored hook
    cat_lower = category.lower()
    if any(k in cat_lower for k in ["ca", "chartered", "accountant", "audit", "tax"]):
        industry_hook = f"As a fellow Chartered Accountant advising corporate clients across {city}, I often consult with audit and consulting practices on institutional treasury solutions for balance-sheet cash reserves."
    elif any(k in cat_lower for k in ["clinic", "hospital", "doctor", "health", "dental", "care"]):
        industry_hook = f"Healthcare practices and diagnostic centers in {area} often maintain large operational liquidity for equipment financing and supplier settlements."
    elif any(k in cat_lower for k in ["mfg", "manufactur", "industry", "steel", "machin", "auto"]):
        industry_hook = f"In industrial hubs like {area}, manufacturing and supply firms frequently carry substantial supplier buffers and raw-material advance reserves in 0% bank current accounts."
    else:
        industry_hook = f"Most high-performing {category} enterprises in {area} maintain significant working capital buffers in standard bank current accounts earning zero interest."

    step1_subject = f"Optimizing {name}'s Surplus Working Capital (~7% Liquid Yield)"
    step1_body = f"""Dear {name} Team,

{rating_proof} Congratulations on building such a solid market reputation.

{industry_hook}

Liquid and Overnight Mutual Funds provide a compliant, bank-grade alternative:
• ~6.75% to 7.10% annualized yields with daily compounding
• Instant 24-hour liquidity directly to your bank account with zero lock-in
• Significant tax efficiency compared to traditional bank fixed deposits

Could we do a brief 4-minute introductory call this Thursday or Friday to show you what your cash reserves could yield?

Best regards,
{sender_name}
{sender_desig}
Phone/WhatsApp: {sender_phone} | {sender_loc}"""

    step2_subject = f"Quick working capital calculation for {name} ({area})"
    step2_body = f"""Dear {name} Leadership Team,

Following up on my note from earlier this week regarding {name}'s short-term reserves in {area}.

To put the numbers into perspective:
A growing {category} firm maintaining ₹25 Lakhs to ₹50 Lakhs in operational cash typically misses out on ₹1,75,000 to ₹3,50,000 in annual yields by leaving funds idle in current accounts.

Unlike fixed deposits, Liquid Treasury funds:
1. Carry NO exit penalties after 7 days
2. Settle on T+1 business days for vendor payments and payroll
3. Are regulated by SEBI with top-tier sovereign and AAA debt portfolios

I've put together a 1-page treasury overview tailored for {name}. Would 11:30 AM this Wednesday work for a quick phone briefing?

Warm regards,
{sender_name}
{sender_desig} | {sender_phone}"""

    step3_subject = f"Permission to close the file for {name}? (+ direct WhatsApp invite)"
    step3_body = f"""Dear {name} Team,

I recognize you're busy running {name} in {area}, so I don't want to clutter your inbox with further follow-ups.

If optimizing working capital yields isn't a current priority, no problem at all. We will mark your profile as inactive for now.

Should you ever want a free 5-minute liquidity and post-tax yield audit before advance tax deadlines, feel free to message or save my direct WhatsApp number:
📱 {sender_phone}

Wishing {name} continued success in {city}!

Sincerely,
{sender_name}
{sender_desig}
{sender_loc}"""

    return {
        "success": True,
        "lead_id": lead.get("id"),
        "lead_name": name,
        "strategy": strategy,
        "steps": [
            {
                "step_number": 1,
                "title": "Touch 1: Cold Introduction & Hook",
                "timing": "Day 1 (Immediate)",
                "delay_days": 0,
                "channel": "email",
                "subject": step1_subject,
                "body_plain": step1_body,
                "hook_badge": "Industry & Rating Hook",
                "key_focus": "Zero-lockin 7% liquid yield vs 0% current account"
            },
            {
                "step_number": 2,
                "title": "Touch 2: Value Proof & ROI Calculation",
                "timing": "Day 3 (+48 Hours)",
                "delay_days": 2,
                "channel": "email",
                "subject": step2_subject,
                "body_plain": step2_body,
                "hook_badge": "Hard Numbers & ROI",
                "key_focus": "₹1.75L–₹3.5L yield difference on ₹25L–₹50L reserve"
            },
            {
                "step_number": 3,
                "title": "Touch 3: Graceful Break-Up & WhatsApp Invite",
                "timing": "Day 7 (+96 Hours)",
                "delay_days": 6,
                "channel": "email_or_wa",
                "subject": step3_subject,
                "body_plain": step3_body,
                "hook_badge": "Break-Up & WhatsApp Link",
                "key_focus": "Low pressure, direct WhatsApp permission close"
            }
        ]
    }

@app.route("/api/ai/sequence", methods=["POST"])
def api_ai_sequence():
    data = request.json or {}
    lead = data.get("lead") or {}
    account_id = data.get("account_id", "dinesh_singhal")
    strategy = data.get("strategy", "mutual_fund")

    accounts = get_accounts()
    account = next((a for a in accounts if a["id"] == account_id), accounts[0] if accounts else DEFAULT_ACCOUNTS[0])
    seq = generate_multi_touch_sequence(lead, account, strategy=strategy)
    return jsonify(seq)

@app.route("/api/sequences/advance", methods=["POST"])
def api_advance_sequence():
    data = request.json or {}
    lead_id = data.get("lead_id")
    target_step = int(data.get("target_step", 2))
    step_title = data.get("step_title", f"Sequence Step {target_step}")
    
    if not lead_id:
        return jsonify({"success": False, "error": "lead_id is required"}), 400

    crm_state = get_crm_state()
    lead_state = crm_state.setdefault(str(lead_id), {})
    lead_state["sequence_step"] = target_step
    lead_state["sequence_status"] = "Completed" if target_step >= 3 else "Active"
    lead_state["status"] = "Follow-up" if target_step > 1 else "Contacted"
    
    log_lead_engagement(
        lead_id,
        channel="sequence_runner",
        action=f"sequence_step_{target_step}",
        details=f"Advanced to {step_title}",
        new_status=lead_state["status"]
    )
    return jsonify({"success": True, "lead_state": lead_state, "message": f"Lead advanced to {step_title}!"})

@app.route("/api/calendar/snooze", methods=["POST"])
def api_snooze_calendar_event():
    data = request.json or {}
    event_id = data.get("event_id")
    lead_name = data.get("lead_name")
    hours = int(data.get("hours", 24))

    events = get_calendar_events()
    updated_evt = None
    for evt in events:
        if (event_id and evt.get("id") == event_id) or (lead_name and evt.get("lead_name", "").lower() == str(lead_name).lower()):
            try:
                base_time = time.time()
                new_dt = time.strftime("%Y-%m-%dT%H:%M", time.localtime(base_time + hours * 3600))
                evt["datetime"] = new_dt
                evt["snoozed_at"] = time.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                evt["datetime"] = time.strftime("%Y-%m-%dT%H:%M", time.localtime(time.time() + 86400))
            updated_evt = evt
            break

    if updated_evt:
        save_calendar_events(events)
        return jsonify({"success": True, "message": f"Appointment snoozed by {hours} hours!", "event": updated_evt, "events": events})
    return jsonify({"success": False, "error": "Event not found"}), 404

@app.route("/api/calendar/complete", methods=["POST"])
def api_complete_calendar_event():
    data = request.json or {}
    event_id = data.get("event_id")
    lead_name = data.get("lead_name")
    lead_id = data.get("lead_id")

    events = get_calendar_events()
    target_evt = None
    remaining_events = []
    for evt in events:
        is_match = (event_id and evt.get("id") == event_id) or (lead_name and evt.get("lead_name", "").lower() == str(lead_name).lower())
        if is_match and not target_evt:
            target_evt = evt
        else:
            remaining_events.append(evt)

    save_calendar_events(remaining_events)

    lid = lead_id or (target_evt.get("lead_id") if target_evt else "")
    if lid:
        log_lead_engagement(
            lid,
            channel="calendar",
            action="consultation_completed",
            details=f"Completed consultation: {target_evt.get('title', 'Appointment') if target_evt else 'Meeting'}",
            new_status="Interested"
        )

    return jsonify({"success": True, "message": "Appointment marked complete and logged in timeline!", "events": remaining_events})

def generate_ai_icebreaker(lead: Dict) -> Dict:
    name = clean_business_name(lead.get("name") or lead.get("Business Name") or "Business Owner")
    city = lead.get("city") or "Delhi NCR"
    area = lead.get("area") or city
    category = lead.get("category") or "Commercial Enterprise"
    rating = str(lead.get("rating") or "").strip()
    reviews = str(lead.get("reviews") or "").strip()
    sender_name = "CA Ishant Singla"
    sender_phone = "+91 7015147209"

    rating_proof = f"Noticed {name}'s impressive {rating}★ rating ({reviews} Google reviews) in {area}." if rating and reviews else (f"Noticed your prominent standing in {area}." if rating else f"Following your commercial footprint in {area}.")

    reputation_hook = f"Hi {name} Team — {rating_proof} Congratulations on maintaining such strong client trust! I'm {sender_name}, a practicing Chartered Accountant advising top {category} leaders across {city}. We specialize in helping high-reputation firms earn ~7% annualized on idle working capital with instant 24h withdrawal. Would Thursday work for a quick 4-minute hello?"

    cat_l = category.lower()
    if any(k in cat_l for k in ["mfg", "manufactur", "steel", "machin", "auto", "textile"]):
        treasury_hook = f"Hello {name} Team — Many manufacturing and supply firms in {area} keep substantial vendor buffers sitting in zero-yield bank current accounts. As a CA, I consult with growth businesses on institutional Liquid Mutual Funds yielding ~6.85% to 7.10% without locking your working capital. Could I share a 1-page treasury calculation for {name}?"
    elif any(k in cat_l for k in ["clinic", "hospital", "doctor", "health", "dental", "pharma"]):
        treasury_hook = f"Dear {name} Leadership — Healthcare practices in {area} often carry significant operational liquidity for equipment and payroll. Liquid Treasury funds provide ~7% annualized yields with daily compounding and zero exit penalties after 7 days. Would 11:30 AM this week suit for a brief 3-minute briefing?"
    elif any(k in cat_l for k in ["ca", "account", "tax", "audit", "legal", "consult"]):
        treasury_hook = f"Dear {name} Team — Fellow CA outreach here in {city}: I consult with professional practices on optimizing balance-sheet treasury cash in SEBI-regulated overnight & arbitrage funds, capturing ~7% safe yields. Open to a brief 5-minute peer chat?"
    else:
        treasury_hook = f"Dear {name} Team — Most successful {category} companies in {area} lose ₹1.5L to ₹3L annually by leaving operational cash in 0% bank current accounts. Liquid mutual funds offer 100% liquidity, bank-grade AAA portfolios, and daily compounding at ~7% yield. Could we connect for 4 minutes this Thursday?"

    wa_hook = f"Hi {name} Team! Saw your {rating}★ rating in {area} — quick question from {sender_name} (CA & Wealth Advisor): Are you currently earning ~7% interest on your idle business current account cash, or is it earning 0%? Happy to share a quick 2-minute calculation!"

    return {
        "success": True,
        "lead_id": lead.get("id"),
        "company_name": name,
        "city": city,
        "area": area,
        "category": category,
        "rating": rating,
        "reviews": reviews,
        "icebreakers": [
            {
                "id": "reputation",
                "badge": "⭐ Google Reputation Hook",
                "tagline": "Leverages star rating & local prestige",
                "text": reputation_hook,
                "suggested_subject": f"Compliments on {name}'s {rating}★ reputation in {area} (+ quick CA query)" if rating else f"Quick treasury query for {name} ({area})"
            },
            {
                "id": "treasury",
                "badge": "💼 Treasury & Working Capital Hook",
                "tagline": "Focuses on ~7% liquid yield vs 0% current account drag",
                "text": treasury_hook,
                "suggested_subject": f"Optimizing {name}'s Short-Term Working Capital Reserves (~7% Yield)"
            },
            {
                "id": "conversational",
                "badge": "💬 High-Conversion WhatsApp 1-Liner",
                "tagline": "Casual, low-friction, high reply rate",
                "text": wa_hook,
                "suggested_subject": f"Quick question for {name} ({area})"
            }
        ]
    }

@app.route("/api/ai/icebreaker", methods=["POST"])
def api_ai_icebreaker():
    data = request.json or {}
    lead = data.get("lead") or {}
    if not lead:
        return jsonify({"success": False, "error": "Lead object is required"}), 400
    res = generate_ai_icebreaker(lead)
    return jsonify(res)

def transform_email_copy(style: str, text: str, subject: str, lead: Dict, account: Dict) -> Dict:
    category = lead.get("category") or lead.get("Category") or "{category}"
    city = lead.get("city") or lead.get("City") or "{city}"
    area = lead.get("area") or lead.get("Area") or "{area}"
    rating = str(lead.get("rating") or lead.get("Rating") or "4.8").strip()

    if style == "value_first":
        transformed_subject = "Quick ROI & operational efficiency gains for {name}"
        transformed_body = """Dear {name} Team,

Following your operations in {area}, our focus is straightforward: helping prominent {category} firms unlock 12%–18% efficiency in working capital and operational turnaround without changing existing vendors.

Here is the direct value upside we quantify for our partners:
• Direct Cost Savings: Reclaim ₹1.5L–₹4L in annual uncaptured cash drag and idle provisions.
• Capital Liquidity: Maintain 100% instant access to reserves with zero operational disruption.
• Rapid Payback: Realize measurable efficiency metrics within the first 45–60 days.

Would you be open to a 4-minute introductory call this Thursday to review a 1-page efficiency projection for {name}?

Best regards,
{sender_name}
{sender_phone} | {sender_email}"""
        style_label = "Value-First Prospecting"

    elif style == "pain_point":
        transformed_subject = "Addressing the hidden operational bottleneck in {area} for {name}"
        transformed_body = """Dear {name} Leadership,

Running a high-performing {category} enterprise in {area} typically comes with an unseen drag: delayed supplier settlements, idle current account cash erosion, and administrative overheads that quietly drain profit margins.

Leaving these workflow bottlenecks unaddressed compounds each quarter, costing firms across {city} significant margin dilution.

We implement structured workflow frameworks that eliminate invoice lag, maximize treasury yields at ~7%, and automate administrative follow-ups.

Could we connect for a brief 5-minute diagnostic call this Wednesday or Thursday to review where {name} might be experiencing friction?

Best regards,
{sender_name}
{sender_phone} | {sender_email}"""
        style_label = "Pain-Point Agitator"

    elif style == "social_proof":
        transformed_subject = "How leading {category} operators in {city} scaled margins (+ note for {name})"
        transformed_body = """Hi {name} Team,

Congratulations on your strong reputation and client standing in {area}.

Last quarter, we worked with three established {category} leaders across {city}. By restructuring their short-term operational buffers and vendor turnaround timelines, each business captured over ₹2.4L in additional annual yield while cutting settlement friction by 35%.

Given {name}'s standing in {area}, we could replicate similar bottom-line efficiency gains for your team with zero change to your day-to-day operations.

Would you be open to reviewing a 2-minute anonymized case study on a quick call this Thursday?

Best regards,
{sender_name}
{sender_phone} | {sender_email}"""
        style_label = "Case Study / Social Proof"

    elif style == "short_punchy":
        transformed_subject = "Quick question for {name} ({area})"
        transformed_body = """Hi {name} Team,

Noticed your operations in {area} — are you currently capturing ~7% annualized on idle operational cash, or is it sitting in a 0% current account?

We help {category} firms across {city} safely optimize reserve liquidity with 24-hour instant withdrawal.

Open to a 3-minute chat this Thursday at 11:30 AM or 3:00 PM?

Best,
{sender_name}
{sender_phone}"""
        style_label = "Short & Punchy (<60 words)"

    else:
        transformed_subject = subject or "Strategic growth & efficiency for {name}"
        transformed_body = text or "Dear {name} Team,\n\nReaching out to connect on operational efficiency.\n\nBest regards,\n{sender_name}"
        style_label = "Custom Message"

    word_count = len(transformed_body.split())
    return {
        "success": True,
        "style": style,
        "style_label": style_label,
        "subject": transformed_subject,
        "body": transformed_body,
        "text": transformed_body,
        "word_count": word_count
    }

@app.route("/api/ai/transform-text", methods=["POST"])
def api_ai_transform_text():
    data = request.json or {}
    style = data.get("style", "value_first")
    text = data.get("text", "")
    subject = data.get("subject", "")
    lead = data.get("lead") or {}
    account_id = data.get("account_id")
    
    accounts = get_accounts()
    account = next((a for a in accounts if a.get("id") == account_id), accounts[0] if accounts else {})
    
    res = transform_email_copy(style, text, subject, lead, account)
    return jsonify(res)

# =========================================================================
# PRODUCTION HOSTING & STATIC FRONTEND SERVING
# =========================================================================
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Pass through 404 for unrecognized API calls
    if path.startswith("api/"):
        return jsonify({"error": "API route not found", "path": path}), 404

    # Check if exact static file exists in dist (e.g. assets/..., favicon.ico)
    target_file = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(target_file):
        return send_from_directory(DIST_DIR, path)

    # For root and client-side SPA routes, serve index.html
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_file):
        return send_file(index_file)

    return jsonify({
        "status": "online",
        "service": "ApexOutreach CRM & Campaign Studio",
        "message": "Backend API is online. Frontend static bundle not found in crm_app/dist.",
        "action": "Run 'npm run build' inside crm_app or run 'python hosting.py' to generate production bundle."
    }), 200

if __name__ == "__main__":
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 5005))
    print(f"=========================================================================", flush=True)
    print(f"  APEXOUTREACH CRM & CAMPAIGN STUDIO - HOSTING READY", flush=True)
    print(f"  • Frontend UI:  http://localhost:{port}/", flush=True)
    print(f"  • Network Host: http://{host}:{port}/", flush=True)
    print(f"  • Backend API:  http://localhost:{port}/api/", flush=True)
    print(f"  • Dist Folder:  {DIST_DIR}", flush=True)
    print(f"=========================================================================", flush=True)
    app.run(host=host, port=port, debug=False)
