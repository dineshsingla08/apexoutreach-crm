import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import re
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page()
    page.goto('https://www.google.com/maps/search/chemist+in+Sector+13+Karnal?hl=en')
    page.wait_for_selector('div[role="feed"]', timeout=20000)
    feed = page.locator('div[role="feed"]')
    
    for _ in range(4):
        feed.evaluate("el => el.scrollBy(0, 5000)")
        page.wait_for_timeout(400)
        
    cards = feed.locator('div.Nv2PK').all()
    print(f"Total cards: {len(cards)}")
    for i, card in enumerate(cards[:10]):
        txt = card.inner_text()
        a_elem = card.locator('a.hfpxzc').first
        name = a_elem.get_attribute("aria-label") or ""
        href = a_elem.get_attribute("href") or ""
        
        web_elem = card.locator('a[data-value="Website"]').first
        website = web_elem.get_attribute("href") if web_elem.is_visible() else ""
        
        pm = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', txt)
        lm = re.search(r'\b0184[\s-]?\d{6,7}\b', txt)
        phone = pm.group(0) if pm else (lm.group(0) if lm else "")
        
        print(f"[{i+1}] {name} | Phone: {phone} | Web: {website}")
    browser.close()
