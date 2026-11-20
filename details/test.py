import base64
import csv
import os
import random
import re
import time

from curl_cffi import requests
from lxml import html

INPUT_CSV = os.path.join(os.getcwd(), "links_result 2.csv")
OUTPUT_CSV = os.path.join(os.getcwd(), "phone_results.csv")
COOKIE_FILE = os.path.join(os.getcwd(), "cookies.json")
SESSION_DIR = os.path.join(os.getcwd(), "chrome_session")

START_ROW = 5001
MIN_DELAY = 3
MAX_DELAY = 3

OUTPUT_FIELDS = [

    "profile_name",
    "profile_url",
    "Phone_number",
    "Url",
    "Name",
    "Location1",
    "Location2",
    "Line_type",
    "Carrier",
]

HEADERS = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://thatsthem.com/",
    "sec-ch-ua": '"Google Chrome";v="124", "Chromium";v="124", "Not-A.Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}


def save_rows(rows):
    if not rows:
        return
    exists = os.path.exists(OUTPUT_CSV) and os.path.getsize(OUTPUT_CSV) > 0
    try:
        with open(OUTPUT_CSV, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
            if not exists:
                writer.writeheader()
            writer.writerows(rows)
    except PermissionError:
        fb = OUTPUT_CSV.replace(".csv", "_backup.csv")
        print(f"    [!] File locked (open in Excel) — writing to fallback: {fb}")
        with open(fb, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=OUTPUT_FIELDS)
            if not os.path.exists(fb) or os.path.getsize(fb) == 0:
                writer.writeheader()
            writer.writerows(rows)


def read_profiles(path, skip_rows=0):
    profiles = []
    with open(path, newline="", encoding="utf-8") as f:
        for i, row in enumerate(csv.DictReader(f), start=1):
            if i < skip_rows:
                continue
            profiles.append({
                "serial": row.get("serial", str(i)),
                "name": row.get("name", ""),
                "url": row["url"]
            })
    return profiles


def get_already_scraped_data():
    scraped_phones = set()
    scraped_profiles = set()
    total_rows = 0

    target_files = [OUTPUT_CSV]
    fb = OUTPUT_CSV.replace(".csv", "_backup.csv")
    if os.path.exists(fb):
        target_files.append(fb)

    for file_path in target_files:
        if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
            try:
                with open(file_path, newline="", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for r in reader:
                        total_rows += 1
                        url_val = r.get("Url") or r.get("phone_url")
                        if url_val:
                            scraped_phones.add(url_val.strip().lower())
                        if r.get("profile_url"):
                            scraped_profiles.add(r["profile_url"].strip().lower())
            except Exception:
                pass

    return scraped_phones, scraped_profiles, total_rows


def create_session():
    session = requests.Session(impersonate="chrome")

    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "en-US,en;q=0.9",
    })

    return session


def fetch_url(session, url, referer=None):
    headers = {}

    if referer:
        headers["Referer"] = referer

    try:
        response = session.get(
            url,
            headers=headers,
            timeout=20,
            allow_redirects=True,
        )

        if response.status_code in (403, 429, 503):
            print(
                f"[!] Request blocked or rate-limited: "
                f"{response.status_code} — {url}"
            )
            return None

        if any(marker in response.text.lower() for marker in (
            "challenge-form",
            "checking your browser",
            "attention required",
            "captcha",
        )):
            print(f"[!] Verification challenge detected: {url}")
            return None

        return response

    except Exception as exc:
        print(f"[!] Request failed: {exc}")
        return None


# ──────────────────────────────────────────────────────────────────────────────
# HTML PARSER: EXTRACT 1ST RESULT DETAILS
# ──────────────────────────────────────────────────────────────────────────────
def _clean(nodes):
    return " ".join(t.strip() for t in nodes if t.strip())


def parse_phone_page(html_text, phone_url):
    tree = html.fromstring(html_text)

    # Phone number
    phone_number = phone_url.rstrip("/").split("/phone/")[-1]
    heading = _clean(tree.xpath("//h1//text()"))
    m = re.search(r'\d{3}[\-\s]\d{3}[\-\s]\d{4}', heading)
    if m:
        phone_number = m.group(0)

    # Sidebar Phone Details: Location1, Line Type, Carrier
    def sidebar_val(label):
        nodes = tree.xpath(
            f"//div[dt[contains(., '{label}')]]/dd//text() | "
            f"//dt[contains(., '{label}')]/following-sibling::dd//text() | "
            f"//*[contains(text(),'{label}')]/following-sibling::*[1]//text()"
        )
        return _clean(nodes)

    location1 = sidebar_val("Location")
    line_type = sidebar_val("Line Type")
    carrier = sidebar_val("Carrier")

    # Person records on phone page
    records = tree.xpath('//div[contains(@class,"record") and contains(@class,"rounded")]')
    if not records:
        records = tree.xpath('//div[contains(@class,"border-b")][.//h2]')
    if not records:
        records = tree.xpath('//div[contains(@class,"record")]')

    if not records:
        return None

    # First result only as required
    rec = records[0]
    name_nodes = rec.xpath('.//h2//span//text() | .//h2//text()')
    name = " ".join(" ".join(name_nodes).split()).strip()

    # Location2: from 'Lives in ...' in record card
    location2 = ""
    lives_nodes = rec.xpath('.//p[contains(text(),"Lives in")]//text()')
    if lives_nodes:
        location2 = " ".join(" ".join(lives_nodes).split()).replace("Lives in", "").strip()
    if not location2:
        location2 = location1

    return {
        "phone_number": phone_number,
        "name": name,
        "location1": location1,
        "location2": location2,
        "line_type": line_type,
        "carrier": carrier,
    }


# ──────────────────────────────────────────────────────────────────────────────
# MAIN CONTROLLER (TURBO FAST EXECUTION)
# ──────────────────────────────────────────────────────────────────────────────
def main():
    print("=" * 65)
    print("  ThatsThem Turbo-Fast Phone Scraper (20x Speed Mode)")
    print(f"  Input  -> {INPUT_CSV}")
    print(f"  Output -> {OUTPUT_CSV}")
    print("=" * 65 + "\n")

    if not os.path.exists(INPUT_CSV):
        print(f"[!] {INPUT_CSV} not found. Run extract_links.py first.")
        raise SystemExit(1)

    session = create_session()

    total_in_csv = 0
    with open(INPUT_CSV, newline="", encoding="utf-8") as f:
        total_in_csv = sum(1 for _ in f) - 1

    profiles = read_profiles(INPUT_CSV, skip_rows=START_ROW)
    total = total_in_csv

    scraped_phones, scraped_profiles, existing_rows = get_already_scraped_data()
    print(f"[*] Total profiles in CSV: {total_in_csv}")
    if START_ROW > 1:
        print(f"[*] Starting from row / index: {START_ROW}")
    if scraped_profiles:
        print(f"[*] {len(scraped_profiles)} profiles already scraped — resuming automatically!")
    if scraped_phones:
        print(f"[*] {len(scraped_phones)} phone URLs already saved ({existing_rows} total rows in CSV).\n")

    saved_count = existing_rows

    for idx, profile in enumerate(profiles, start=START_ROW):
        profile_url = profile["url"]
        profile_name = profile["name"]
        profile_serial = profile.get("serial", str(idx))

        # Auto-resume: skip completed profile
        if profile_url.strip().lower() in scraped_profiles:
            continue

        print(f"\n[{profile_serial}/{total}]  {profile_name}")
        print(f"            {profile_url}")

        # Fetch profile page in ~0.5s via curl_cffi
        resp = fetch_url(session, profile_url)
        if not resp or resp.status_code != 200:
            print(f"    [!] Failed to load profile: status {getattr(resp, 'status_code', 'ERR')}")
            continue

        tree = html.fromstring(resp.text)

        # Strictly extract ONLY spans located under the "Phone Numbers" section
        raw_spans = tree.xpath(
            '//*[contains(text(),"Phone Numbers:")]/following::ul[contains(@class,"dot-condensed")][1]/li/span | '
            '//*[contains(text(),"Phone Numbers")]/following::ul[contains(@class,"dot-condensed")][1]/li/span'
        )

        # Filter strictly for Phone Numbers: exclude emails (@) and addresses
        spans = []
        for sp in raw_spans:
            txt = sp.text_content().strip()
            if "@" in txt:
                continue
            if re.search(r'\d{3}[\-\.\s]', txt):
                spans.append(sp)

        # Cap max 10 phones per person to prevent flooding Cloudflare (e.g. Aastha Patel had 75 phones)
        if len(spans) > 10:
            spans = spans[:10]

        if not spans:
            print("    [~] No phone buttons found — skipping profile.")
            scraped_profiles.add(profile_url.strip().lower())
            continue

        print(f"    [+] {len(spans)} phone button(s) found.")

        # Compute base64 pathname token for direct Alpine resolution
        pathname = "/" + profile_url.split("thatsthem.com/")[-1].lstrip("/")
        p_base64 = base64.b64encode(pathname.encode()).decode().replace("+", "-").replace("/", "_").rstrip("=")

        for p_idx, span in enumerate(spans, start=1):
            token = span.get("x-href.go")

            # If button has no x-href.go, skip immediately to next button
            if not token:
                print(f"    [~] Phone {p_idx}/{len(spans)} has no active link — skipping to next button.")
                continue

            # Build direct resolution URL
            go_url = f"https://thatsthem.com/go/{token}.{p_base64}"

            # Fetch resolved phone page directly (takes ~0.5s)
            phone_resp = fetch_url(session, go_url, referer=profile_url)
            if not phone_resp or phone_resp.status_code != 200 or "/phone/" not in phone_resp.url:
                current_u = getattr(phone_resp, "url", go_url)
                print(
                    f"    [~] Phone {p_idx}/{len(spans)} could not be opened ({current_u}) — skipping to next button.")
                continue

            phone_url = phone_resp.url.strip().lower()
            if phone_url in scraped_phones:
                print(f"    -> Phone {p_idx}/{len(spans)}: {phone_resp.url} (Already scraped — skipping)")
                continue

            parsed = parse_phone_page(phone_resp.text, phone_resp.url)
            if parsed and parsed.get("name"):
                row = {
                    "profile_name": profile_name,
                    "profile_url": profile_url,
                    "Phone_number": parsed["phone_number"],
                    "Url": phone_resp.url,
                    "Name": parsed["name"],
                    "Location1": parsed["location1"],
                    "Location2": parsed["location2"],
                    "Line_type": parsed["line_type"],
                    "Carrier": parsed["carrier"],
                }
                save_rows([row])
                scraped_phones.add(phone_url)
                saved_count += 1
                print(
                    f"    -> Phone {p_idx}/{len(spans)}: {parsed['phone_number']} | [+] Saved: {parsed['name']} | Loc1: {parsed['location1']} | Loc2: {parsed['location2']} | {parsed['line_type']} | {parsed['carrier']}")
            else:
                print(f"    -> Phone {p_idx}/{len(spans)}: {phone_resp.url} | [~] No person record found.")

            # Short gentle delay (1 - 2 sec)
            time.sleep(random.uniform(MIN_DELAY, MAX_DELAY))

        # Mark profile complete
        scraped_profiles.add(profile_url.strip().lower())

    print("\n" + "=" * 65)
    print(f"[+] All Done! Total rows saved: {saved_count}")
    print(f"    Saved to: {OUTPUT_CSV}")
    print("=" * 65)


if __name__ == "__main__":
    main()

print("Hello")
