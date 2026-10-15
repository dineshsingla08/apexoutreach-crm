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
    cards = feed.locator('div.Nv2PK').all()
    for i, c in enumerate(cards[:5]):
        links = c.locator('a').all()
        for l in links:
            href = l.get_attribute("href") or ""
            al = l.get_attribute("aria-label") or ""
            print(f"Card {i+1} link: href={href[:40]}... aria={al}")
    browser.close()
