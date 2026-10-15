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
    
    # Scroll down multiple times
    for _ in range(8):
        feed.evaluate("el => el.scrollBy(0, 8000)")
        page.wait_for_timeout(700)
        
    cards = feed.locator('div.Nv2PK').all()
    print(f"Cards loaded after scrolling: {len(cards)}")
    browser.close()
