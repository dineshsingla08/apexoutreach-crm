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
    feed = page.locator('div[role="feed"]')
    
    for _ in range(4):
        feed.evaluate("el => el.scrollBy(0, 5000)")
        page.wait_for_timeout(400)
        
    cards = feed.locator('div.Nv2PK').all()
    print(f"Total cards: {len(cards)}")
    with_phone = 0
    without_phone = 0
    for card in cards:
        txt = card.inner_text()
        pm = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', txt)
        lm = re.search(r'\b0184[\s-]?\d{6,7}\b', txt)
        if pm or lm:
            with_phone += 1
        else:
            without_phone += 1
    print(f"With phone directly on card: {with_phone}")
    print(f"Without phone on card: {without_phone}")
    browser.close()
