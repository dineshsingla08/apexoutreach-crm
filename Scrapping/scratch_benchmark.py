import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import re
import time
import urllib.parse
from playwright.sync_api import sync_playwright

def test_fast_extract(query):
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-US"
        )
        context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
        context.route("**/*.{png,jpg,jpeg,gif,webp,woff,woff2,ttf}", lambda route: route.abort())
        page = context.new_page()

        encoded = urllib.parse.quote(query)
        page.goto(f"https://www.google.com/maps/search/{encoded}?hl=en", timeout=25000)
        page.wait_for_selector('div[role="feed"]', timeout=15000)
        feed = page.locator('div[role="feed"]')

        # Scroll 5 times
        for _ in range(5):
            feed.evaluate("el => el.scrollBy(0, 6000)")
            page.wait_for_timeout(500)

        cards = feed.locator('div.Nv2PK').all()
        print(f"Total cards found for '{query}': {len(cards)}")

        extracted = []
        t0 = time.time()
        for idx, card in enumerate(cards):
            text = card.inner_text()
            a_elem = card.locator('a.hfpxzc').first
            name = a_elem.get_attribute("aria-label") or ""
            href = a_elem.get_attribute("href") or ""
            if not name:
                continue

            # Phone from text
            phone_match = re.search(r'(?:0|\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}', text)
            phone = phone_match.group(0) if phone_match else ""

            # Rating
            rating_match = re.search(r'\b([1-5]\.[0-9])\b', text)
            rating = rating_match.group(1) if rating_match else ""

            extracted.append({
                "name": name,
                "phone": phone,
                "rating": rating,
                "url": href
            })

        t1 = time.time()
        print(f"Extracted {len(extracted)} items in {t1 - t0:.2f} seconds!")
        for item in extracted[:10]:
            print(f" - {item['name']} | Phone: {item['phone']} | Rating: {item['rating']}")

        browser.close()

if __name__ == "__main__":
    test_fast_extract("kirana store in Chaura Bazar Karnal")
