import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
import re
import urllib3
import requests
from bs4 import BeautifulSoup

urllib3.disable_warnings()

headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0 Safari/537.36"}
test_urls = [
    "http://wellstarclinic.com/",
    "https://mantraayurveda.com/",
    "http://apolloclinicgurugram.com/"
]

for url in test_urls:
    try:
        r = requests.get(url, headers=headers, timeout=5, verify=False)
        soup = BeautifulSoup(r.text, "html.parser")
        mailtos = [a.get("href").replace("mailto:", "").split("?")[0].lower() for a in soup.select('a[href^="mailto:"]')]
        raw = set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", r.text))
        print(f"URL: {url} -> mailtos: {mailtos} | raw: {list(raw)[:3]}")
    except Exception as e:
        print(f"URL: {url} -> Error: {e}")
