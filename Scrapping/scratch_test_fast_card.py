import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page()
    page.goto('https://www.google.com/maps/search/kirana+store+in+Sector+13+Karnal?hl=en')
    page.wait_for_selector('div[role="feed"]', timeout=20000)
    cards = page.locator('div.Nv2PK').all()
    print(f"Cards count: {len(cards)}")
    for i, card in enumerate(cards[:6]):
        text = card.inner_text()
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        a_elem = card.locator('a.hfpxzc').first
        name = a_elem.get_attribute("aria-label") or ""
        href = a_elem.get_attribute("href") or ""
        
        # Phone regex
        phone_match = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', text)
        phone = phone_match.group(0) if phone_match else ""
        
        print(f"[{i+1}] Name: {name}")
        print(f"    Phone: {phone}")
        print(f"    Full lines: {lines}")
    browser.close()
