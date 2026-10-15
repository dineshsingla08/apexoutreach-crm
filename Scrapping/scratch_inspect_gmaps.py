import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page()
    page.goto('https://www.google.com/maps/search/chemist+in+Karnal?hl=en')
    page.wait_for_selector('div[role="feed"]', timeout=20000)
    cards = page.locator('div.Nv2PK').all()
    print(f"Total cards found: {len(cards)}")
    for i in range(min(5, len(cards))):
        print(f"\n--- Card {i+1} ---")
        print(cards[i].inner_text())
        a_elem = cards[i].locator('a.hfpxzc').first
        print("Aria label:", a_elem.get_attribute("aria-label"))
        print("Href:", a_elem.get_attribute("href"))
    browser.close()
