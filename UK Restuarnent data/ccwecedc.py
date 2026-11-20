import os
import re
import json
import threading
import time
import sys
import csv
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse, parse_qs, unquote, urlencode, quote
import requests

try:
    from pymongo import MongoClient, UpdateOne, ASCENDING
    from pymongo.errors import BulkWriteError, ConnectionFailure
    from bson import ObjectId
except ImportError:
    print("[FATAL] pymongo not installed -> pip install pymongo")
    sys.exit(1)

COOKIES: dict = {
    "__Secure-1PSID": "g.a000_whnkwAhhg57NOkQZPk005Rxem6KjNV_Sx_EhdfboomflCfSAzl8O0l0Byx9BkROFXdGQgACgYKAZgSARQSFQHGX2MiLwYFR_grPKz3Sn59At2wVxoVAUF8yKq5bi_i3azLe49CpKQdRxZY0076",
    "__Secure-1PSIDTS": "sidts-CjYBPWEu2c1tmr-g5CWKYWJTUVT2RnpK7GVrvR3XEmMRB_uSEfKhTXkb_siMisChfBVF2kpuiqEQAA",
}

BASE_HEADERS: dict = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "priority": "u=1, i",
    "referer": "https://www.google.com/",
    "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "x-browser-channel": "stable",
    "x-browser-copyright": "Copyright 2026 Google LLC. All Rights Reserved.",
    "x-browser-validation": "BB3WKzEsBuaUZYbuV2Xo/+eltkU=",
    "x-browser-year": "2026",
    "x-client-data": "CKmdygEIlqHLAQiFoM0BCLjCzwEIks2UMAiRzpQwCOHVlDAI59aUMAj01pQwCKbXlDAIvteUMBiQ1JQw",
    "x-maps-diversion-context-bin": "CAE=",
}

SEARCH_HEADERS: dict = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9",
    "sec-ch-ua": '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "referer": "https://www.google.com/",
}

MONGO_URI = "mongodb://localhost:27017/"
MONGO_DB_NAME = "update_google_map"
MONGO_COLLECTION = "reviews"
GUJRERA_COLL = "gujrera_data"

OUTPUT_ROOT = "reviews_output"
BATCH_SIZE = 5
PAGE_DELAY = 2.0
REVIEW_LIMIT = 0
MAX_RETRIES = 30
RETRY_DELAY = 4.0

_COOKIE_EXPIRED = threading.Event()


def now_iso():
    return datetime.now(tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def safe_folder_name(name: str) -> str:
    name = re.sub(r'[<>:"/\\|?*]', '_', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:120]


def _safe(obj, *keys, default=None):
    for k in keys:
        try:
            obj = obj[k]
        except:
            return default
    return obj if obj is not None else default


def _is_valid_str(v, min_len=2):
    return isinstance(v, str) and len(v) >= min_len


def _ts_to_parts(ts_val):
    if not ts_val: return "", "", ""
    try:
        val = int(ts_val)
        seconds = val / 1_000_000 if val > 1_000_000_000_000_000 else val / 1_000
        dt = datetime.fromtimestamp(seconds, tz=timezone.utc)
        return dt.strftime("%Y-%m-%dT%H:%M:%SZ"), dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M:%S")
    except:
        return "", "", ""


def to_file_url(path: str) -> str:
    try:
        return Path(path).resolve().as_uri()
    except:
        p = os.path.abspath(path).replace("\\", "/")
        if not p.startswith("/"): p = "/" + p
        return f"file://{quote(p, safe='/:@')}"


class CookieExpiredError(RuntimeError):
    pass


def _is_expired(resp) -> bool:
    if resp is None: return False
    final = (resp.url or "").lower()
    if "accounts.google.com/signin" in final: return True
    if "accounts.google.com/servicelogin" in final: return True
    if resp.status_code == 401:                      return True
    return False


def validate_cookies():
    print("\n[Cookie Check] Validating cookies...")
    try:
        resp = requests.get(
            "https://www.google.com/maps/search/test",
            headers=SEARCH_HEADERS, cookies=COOKIES,
            timeout=30, allow_redirects=True,
        )
    except requests.RequestException as e:
        print(f"  Network error: {e}");
        sys.exit(1)

    if _is_expired(resp):
        print("  COOKIES EXPIRED")
        sys.exit(1)

    print(f"  Cookies VALID  (status={resp.status_code})")


def _raw_get(url: str, xhr: bool = True):
    headers = BASE_HEADERS if xhr else SEARCH_HEADERS
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, headers=headers, cookies=COOKIES,
                                timeout=90, allow_redirects=True)
        except requests.RequestException as e:
            print(f"    [Attempt {attempt}] Network error: {e}")
            if attempt < MAX_RETRIES: time.sleep(RETRY_DELAY * attempt); continue
            return None

        if _is_expired(resp):
            _COOKIE_EXPIRED.set()
            raise CookieExpiredError("Google redirected to login. Update COOKIES and re-run.")

        if resp.status_code == 200:                    return resp
        if resp.status_code == 429:
            w = RETRY_DELAY * attempt * 2
            print(f"    [Attempt {attempt}] 429 rate-limit, waiting {w:.0f}s")
            time.sleep(w);
            continue
        if resp.status_code in (500, 502, 503, 504):
            time.sleep(RETRY_DELAY * attempt);
            continue
        if resp.status_code == 403:
            time.sleep(RETRY_DELAY * attempt * 2);
            continue
        print(f"    [Attempt {attempt}] status={resp.status_code}")
        return None
    return None


def http_get(url):       return _raw_get(url, xhr=True)


def http_get_plain(url): return _raw_get(url, xhr=False)


def get_mongo_client():
    try:
        c = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        c.server_info();
        return c
    except ConnectionFailure as e:
        print(f"[FATAL] MongoDB: {e}");
        sys.exit(1)


POSITIVE_KEYWORDS = [
    "clean", "comfortable", "friendly", "great", "excellent", "amazing", "wonderful",
    "nice", "good", "perfect", "love", "loved", "enjoyed", "happy", "satisfied",
    "spacious", "quiet", "convenient", "helpful", "attentive", "recommend", "beautiful",
    "fantastic", "impressed", "best", "cozy", "warm", "polite", "fast", "easy",
    "pleasant", "awesome", "outstanding", "value", "affordable", "professional",
]
NEGATIVE_KEYWORDS = [
    "dirty", "bad", "terrible", "awful", "horrible", "disgusting", "worst", "poor",
    "rude", "unfriendly", "unclean", "noisy", "smelly", "broken", "old", "outdated",
    "slow", "disappointing", "disappointed", "uncomfortable", "unsafe", "avoid",
    "never", "stain", "bug", "bedbug", "mold", "leak", "overpriced", "expensive",
    "scam", "fraud", "complaint", "issue", "problem", "cockroach", "pest", "stolen",
]

FIELD_MAP = [
    ("Project Name", "project_name"),
    ("Project URL", "project_url"),
    ("Project Address", "project_address"),
    ("Locality", "locality"),
    ("Taluka", "taluka"),
    ("District", "district"),
    ("Pincode", "pincode"),
    ("State", "state"),
    ("Status", "status"),
    ("Latitude", "latitude"),
    ("Longitude", "longitude"),
    ("Review Id", "review_id"),
    ("Review Url", "review_url"),
    ("Reviewer Name", "reviewer_name"),
    ("Reviewer Id", "reviewer_id"),
    ("Reviewer Url", "reviewer_url"),
    ("Reviewer Avatar", "reviewer_avatar"),
    ("Verified Buyer Tag", "verified_buyer"),
    ("Review Date", "review_date"),
    ("Review Datetime ISO", "review_datetime_iso"),
    ("Rating", "rating"),
    ("Review Title", "review_title"),
    ("Review Text", "review_text"),
    ("Pros Section", "pros"),
    ("Cons Section", "cons"),
    ("Would Recommend", "would_recommend"),
    ("Sentiment", "sentiment"),
    ("Reply Text", "reply_text"),
    ("Reply Date", "reply_date"),
    ("Reply Datetime ISO", "reply_datetime_iso"),
    ("Language", "language"),
    ("Likes", "likes"),
    ("Source Platform", "source_platform"),
    ("Aspect Ratings", "aspect_ratings"),
    ("Scraped At", "scraped_at"),
]
CSV_HEADERS = [h for h, _ in FIELD_MAP]


def classify_sentiment(rating) -> str:
    try:
        r = int(rating)
        if r >= 4: return "Positive"
        if r <= 2: return "Negative"
        return "Neutral"
    except:
        return "Unknown"


def _rating_fallback(rating):
    try:
        r = int(rating)
        if r >= 4: return "Generally positive experience", "N/A"
        if r == 3: return "Some positives noted", "Some negatives noted"
        return "N/A", "Generally negative experience"
    except:
        return "N/A", "N/A"


def extract_pros_cons(text, rating=None):
    if not text or not text.strip(): return _rating_fallback(rating)
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+|\n+", text.strip()) if len(s.strip()) > 10]
    pros, cons = [], []
    for s in sentences:
        lo = s.lower()
        p = sum(1 for kw in POSITIVE_KEYWORDS if kw in lo)
        n = sum(1 for kw in NEGATIVE_KEYWORDS if kw in lo)
        if p > n:
            pros.append(s)
        elif n > p:
            cons.append(s)
        elif n == p > 0:
            pros.append(s); cons.append(s)
    if not pros and not cons: return _rating_fallback(rating)
    return (" | ".join(pros) if pros else "N/A", " | ".join(cons) if cons else "N/A")


def extract_review_title(text, max_len=80):
    if not text: return ""
    m = re.search(r"Positive:\s*(.+?)(?:\.|Negative:|$)", text, re.IGNORECASE)
    if m:
        t = m.group(1).strip()
        return t[:max_len] + ("..." if len(t) > max_len else "")
    first = re.split(r"(?<=[.!?])\s+", text.strip())[0]
    return first[:max_len] + ("..." if len(first) > max_len else "")


def detect_would_recommend(text, rating):
    if text:
        lo = text.lower()
        neg = ["would not recommend", "wouldn't recommend", "won't be back", "will not return", "never again"]
        pos = ["would recommend", "highly recommend", "will be back", "definitely return", "coming back"]
        if any(s in lo for s in neg): return "N"
        if any(s in lo for s in pos): return "Y"
    try:
        r = int(rating)
        if r >= 4: return "Y"
        if r <= 2: return "N"
    except:
        pass
    return "Unknown"


def build_boq_reviews_url(place_id_hex, place_slug="", token=""):
    inner = [
        None, 1, None, None, None, None, None, None, None, None, None,
        [place_id_hex, None, None, place_slug if place_slug else None],
        None, None, "",
        None,
        [1, 1, None, [[3], [4], [5], [6], [7]]],
        None, None,
        token,
        None, None, None,
        0
    ]
    reqpld = [None, [None, None, None, None, None, None, None, None, None, inner]]
    reqpld_json = json.dumps(reqpld, separators=(',', ':'))

    params = {
        "udm": "1",
        "reqpld": reqpld_json,
        "msc": "gwsrpc",
        "opi": "89978449",
    }
    return "https://www.google.com/httpservice/web/PrivateLocalSearchUiDataService/GetLocalBoqProxy?" + urlencode(
        params)


def parse_boq_response(raw_text):
    text = raw_text.strip()
    for prefix in [")]}'", ")]}", ")]}'\n", ")]}'\r\n"]:
        if text.startswith(prefix):
            text = text[len(prefix):].strip()
            break
    parsed = None
    if text.startswith("{"):
        try:
            wrapper = json.loads(text)
            if "d" in wrapper:
                inner = wrapper["d"]
                for p in [")]}'", ")]}", ")]}'\n"]:
                    if inner.startswith(p): inner = inner[len(p):].strip()
                parsed = json.loads(inner)
        except (json.JSONDecodeError, TypeError):
            pass

    if parsed is None:
        if text.startswith("/*"):
            text = re.sub(r'/\*.*?\*/\s*$', '', text, flags=re.DOTALL).strip()
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError:
            for line in text.split("\n"):
                line = line.strip()
                if line.startswith(("[", "{")):
                    try:
                        parsed = json.loads(line); break
                    except:
                        continue

    if parsed is None:
        return None, [], ""
    reviews_arr = _safe(parsed, 1, 10, 2, default=[]) or []
    if not reviews_arr:
        for outer_idx in [0, 1, 2]:
            for mid_idx in [9, 10, 11]:
                candidate = _safe(parsed, outer_idx, mid_idx, 2, default=None)
                if isinstance(candidate, list) and candidate:
                    first = candidate[0] if candidate else None
                    if isinstance(first, list) and len(first) > 5:
                        reviews_arr = candidate
                        break
            if reviews_arr:
                break
    next_token = _extract_next_token_boq(parsed, raw_text)

    return parsed, reviews_arr, next_token


def _extract_next_token_boq(parsed, raw_text):
    candidate = _safe(parsed, 1, 10, 1, default=None)
    if isinstance(candidate, str) and len(candidate) > 20:
        return candidate
    candidate = _safe(parsed, 1, 10, 3, default=None)
    if isinstance(candidate, str) and len(candidate) > 20:
        return candidate
    container = _safe(parsed, 1, 10, default=None)
    if isinstance(container, list):
        for i, item in enumerate(container):
            if i == 2:
                continue
            if isinstance(item, str) and len(item) > 20:
                return item

    data_block = _safe(parsed, 1, default=None)
    if isinstance(data_block, list):
        for i, item in enumerate(data_block):
            if isinstance(item, str) and len(item) > 30:
                return item
    for m in re.findall(r'"([A-Za-z0-9+/=_\-]{40,})"', raw_text):
        if (len(m) > 40
                and not m.startswith("http")
                and not m.startswith("sidts-")
                and not m.startswith("g.a000")
                and "google" not in m.lower()
                and "/" not in m[:5]
                and not re.match(r'^\d+$', m)):
            return m

    return ""


def _extract_reviewer_id(profile_url):
    if not profile_url:
        return ""
    m = re.search(r'/contrib/(\d+)', profile_url)
    return m.group(1) if m else ""


def _extract_aspect_ratings_v2(entry):
    aspects = {}
    guided = _safe(entry, 30, default=None)
    if not isinstance(guided, list):
        return aspects

    for g in guided:
        if not isinstance(g, list) or len(g) < 12:
            continue
        label = _safe(g, 5, default="") or _safe(g, 1, default="")
        rating_arr = _safe(g, 11, default=None)
        if label and isinstance(rating_arr, list) and rating_arr:
            try:
                aspects[label] = int(rating_arr[0])
            except (TypeError, ValueError, IndexError):
                pass
    return aspects


def _detect_source_platform_v2(entry):
    source = _safe(entry, 44, default=None)
    if isinstance(source, list) and source:
        name = _safe(source, 0, default="")
        if isinstance(name, str) and name:
            return name.lower()
    return "google"


def _detect_verified_buyer_v2(entry):
    source = _detect_source_platform_v2(entry)
    third_party = {"choicehotels", "priceline", "expedia", "booking", "tripadvisor",
                   "hotels.com", "agoda", "makemytrip", "goibibo"}
    if source in third_party:
        return "Y"
    local_guide = _safe(entry, 3, 5, default=None)
    if isinstance(local_guide, list) and len(local_guide) >= 2 and local_guide[1] == 1:
        return "N"
    return "N"


def _parse_reply_v2(entry):
    for idx in [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43]:
        block = _safe(entry, idx, default=None)
        if isinstance(block, list) and len(block) >= 2:
            for sub in block:
                if isinstance(sub, str) and len(sub) > 10 and not sub.startswith("http"):
                    reply_text = sub.replace("\n", " ").replace("\r", " ").strip()
                    for item in block:
                        if isinstance(item, (int, str)):
                            ts = _ts_to_parts(item)
                            if ts[0]:
                                return reply_text, ts[0], ts[1]
                    return reply_text, "", ""
    for idx in range(31, min(len(entry) if isinstance(entry, list) else 0, 50)):
        block = _safe(entry, idx, default=None)
        if isinstance(block, list):
            text_cand = _safe(block, 0, default=None) or _safe(block, 1, default=None)
            if isinstance(text_cand, str) and len(text_cand) > 15:
                if not text_cand.startswith("http") and not text_cand.startswith("["):
                    ts_cand = None
                    for item in block:
                        if isinstance(item, (int, float)):
                            ts = _ts_to_parts(item)
                            if ts[0]:
                                ts_cand = ts
                                break
                    reply_text = text_cand.replace("\n", " ").replace("\r", " ").strip()
                    if ts_cand:
                        return reply_text, ts_cand[0], ts_cand[1]
                    return reply_text, "", ""
    return "", "", ""


def _parse_review(entry):
    stars = _safe(entry, 1, default=None)
    if stars is None:
        stars = _safe(entry, 45, default=None)
    try:
        stars = int(stars)
    except (TypeError, ValueError):
        stars = None
    ts_ms = _safe(entry, 2, 2, default=None)
    iso, date_str, _ = _ts_to_parts(ts_ms)
    ts_sec = int(ts_ms) / 1_000 if ts_ms else 0

    # Reviewer info
    reviewer_name = _safe(entry, 3, 0, default="Anonymous") or "Anonymous"
    reviewer_avatar = _safe(entry, 3, 1, default="") or ""
    reviewer_url = _safe(entry, 3, 2, default="") or ""
    reviewer_id = _extract_reviewer_id(reviewer_url)

    # Review ID
    review_id_raw = _safe(entry, 5, default="") or ""
    canon_id = (f"{reviewer_id}-{ts_sec}"
                if reviewer_id and ts_sec else review_id_raw)

    # Review URL
    review_url = _safe(entry, 12, default="") or ""

    # Language
    language = _safe(entry, 26, default="") or ""

    raw_text = _safe(entry, 27, default="") or ""
    if not raw_text:
        raw_text = _safe(entry, 28, default="") or ""
    clean = re.sub(r'<br\s*/?>', ' ', raw_text)
    clean = re.sub(r'<[^>]+>', '', clean)
    clean = clean.replace("\n", " ").replace("\r", " ").strip()
    pros, cons = extract_pros_cons(clean, stars)
    reply_text, reply_iso, reply_date = _parse_reply_v2(entry)
    aspects = _extract_aspect_ratings_v2(entry)

    # Source platform
    source_platform = _detect_source_platform_v2(entry)

    # Verified buyer
    verified = _detect_verified_buyer_v2(entry)

    # Likes — check various positions
    likes = 0
    for idx in [6, 7, 8, 9]:
        v = _safe(entry, idx, default=None)
        if isinstance(v, int) and v > 0:
            likes = v
            break
    # Also try nested [6][0]
    if likes == 0:
        v = _safe(entry, 6, 0, default=None)
        if isinstance(v, int) and v > 0:
            likes = v

    return {
        "review_id": canon_id,
        "review_url": review_url,
        "reviewer_name": reviewer_name,
        "reviewer_id": reviewer_id,
        "reviewer_url": reviewer_url,
        "reviewer_avatar": reviewer_avatar,
        "verified_buyer": verified,
        "review_date": date_str,
        "review_datetime_iso": iso,
        "rating": stars,
        "review_title": extract_review_title(clean),
        "review_text": clean,
        "pros": pros,
        "cons": cons,
        "would_recommend": detect_would_recommend(clean, stars),
        "sentiment": classify_sentiment(stars),
        "reply_text": reply_text,
        "reply_date": reply_date,
        "reply_datetime_iso": reply_iso,
        "language": language,
        "likes": likes,
        "source_platform": source_platform,
        "aspect_ratings": aspects,
        "scraped_at": now_iso(),
    }


def build_place_url(place_id):
    return (
        "https://www.google.com/maps/preview/place?gl=&q="
        f"&pb=!1m16!1s{place_id}"
        "!3m8!1m3!1d1281.9551308306093!2d-84.5094143!3d42.742177"
        "!3m2!1i1520!2i336!4f13.1!4m2!3d42.742177!4d-84.506834"
        "!15m2!1m1!4s%2Fg%2F1tgtg32n!12m4!2m3!1i320!2i120!4i8"
        "!13m32!3m1!2i9!6m3!1m2!1i360!2i256!7m24!1m3!1e1!2b0!3e3"
        "!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3"
        "!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!9b0"
        "!14m6!7e140!9st1eVadPBDbiGnesP5Z7umAw!15i26172"
        "!17st1eVadPBDbiGnesP5Z7umAw%3A292342202393!24m1!2e1"
        "!15m39!1m2!18m1!17b1!4b1!11m2!3e1!3e0!17b1!20m2!1e3!1e1"
        "!24b1!29b1!72m18!1m8!2b1!5b1!7b1!12m4!1b1!2b1!4m1!1e1"
        "!4b0!8m6!1m2!4m1!1e1!3sother_user_google_review_posts!6m1!1e1"
        "!9b1!89b1!98m3!1b1!2b1!3b1!122m1!1b1!30m3!6m2!1b1!2b1!37i767"
    )


# ─────────────────────────────────────────────────────────────
#  STEP 1 — Google Search -> CID
# ─────────────────────────────────────────────────────────────
def google_search_cid(query, tag=""):
    print(f"  [{tag}] Step 1 -- Search: '{query}'")
    from lxml import html as lxml_html
    resp = http_get_plain("https://www.google.com/search?" + urlencode({"q": query, "udm": "1"}))
    if resp:
        tree = lxml_html.fromstring(resp.text)
        cids = tree.xpath('//div[@class="cXedhc"]/a/@data-ludocid')
        if cids:
            print(f"  [{tag}] CID (xpath): {cids[0]}")
            return cids[0]
        m = re.search(r'maps\?cid=(\d+)', resp.text)
        if m:
            print(f"  [{tag}] CID (regex): {m.group(1)}")
            return m.group(1)
    print(f"  [{tag}] Step 1a -- Try tbm=map search...")
    search_keyword = quote(query)
    url = f"https://www.google.com/search?tbm=map&authuser=0&hl=en&gl=in&pb=!4m9!1m3!1d36848.13262414378!2d72.5146445462796!3d23.114529803530267!2m0!3m2!1i1920!2i482!4f13.1!7i20!10b1!12m26!1m5!18b1!30b1!31m1!1b1!34e1!2m4!5m1!6e2!20e3!39b1!10b1!12b1!13b1!16b1!17m1!3e1!20m4!5e2!6b1!8b1!14b1!46m1!1b0!96b1!99b1!19m4!2m3!1i360!2i120!4i8!20m65!2m2!1i203!2i100!3m2!2i4!5b1!6m6!1m2!1i86!2i86!1m2!1i408!2i240!7m33!1m3!1e1!2b0!3e3!1m3!1e2!2b1!3e2!1m3!1e2!2b0!3e3!1m3!1e8!2b0!3e3!1m3!1e10!2b0!3e3!1m3!1e10!2b1!3e2!1m3!1e10!2b0!3e4!1m3!1e9!2b1!3e2!2b1!9b0!15m16!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20!1m7!1m2!1m1!1e2!2m2!1i195!2i195!3i20!22m5!1sUiRXaqPlGMSUseMPoOzC4AI%3A55!2s1i%3A0%2Ct%3A150715%2Cp%3AUiRXaqPlGMSUseMPoOzC4AI%3A55!7e81!12e3!17sUiRXaqPlGMSUseMPoOzC4AI%3A60!24m109!1m27!13m9!2b1!3b1!4b1!6i1!8b1!9b1!14b1!20b1!25b1!18m16!3b1!4b1!5b1!6b1!9b1!13b1!14b1!17b1!20b1!21b1!22b1!32b1!33m1!1b1!34b1!36e2!10m1!8e3!11m1!3e1!17b1!20m2!1e3!1e6!24b1!25b1!26b1!27b1!29b1!30m1!2b1!36b1!37b1!39m3!2m2!2i1!3i1!43b1!52b1!54m1!1b1!55b1!56m1!1b1!61m2!1m1!1e1!65m5!3m4!1m3!1m2!1i224!2i298!72m22!1m8!2b1!5b1!7b1!12m4!1b1!2b1!4m1!1e1!4b1!8m10!1m6!4m1!1e1!4m1!1e3!4m1!1e4!3sother_user_google_review_posts__and__hotel_and_vr_partner_review_posts!6m1!1e1!9b1!89b1!90m2!1m1!1e2!98m3!1b1!2b1!3b1!103b1!113b1!114m3!1b1!2m1!1b1!117b1!122m1!1b1!126b1!127b1!128m1!1b0!26m4!2m3!1i80!2i92!4i8!30m28!1m6!1m2!1i0!2i0!2m2!1i530!2i482!1m6!1m2!1i1870!2i0!2m2!1i1920!2i482!1m6!1m2!1i0!2i0!2m2!1i1920!2i20!1m6!1m2!1i0!2i462!2m2!1i1920!2i482!34m19!2b1!3b1!4b1!6b1!8m6!1b1!3b1!4b1!5b1!6b1!7b1!9b1!12b1!14b1!20b1!23b1!25b1!26b1!31b1!37m1!1e81!42b1!47m0!49m10!3b1!6m2!1b1!2b1!7m2!1e3!2b1!8b1!9b1!10e2!50m4!2e2!3m2!1b1!3b1!67m5!7b1!10b1!14b1!15m1!1b0!69i786!77b1&q={search_keyword}&nfpr=1&tch=1&ech=1&psi=UiRXaqPlGMSUseMPoOzC4AI.1784095830088.1"

    resp_map = http_get_plain(url)
    if resp_map:
        html = resp_map.text
        text = re.sub(r'/\*.*?\*/\s*$', '', html, flags=re.DOTALL)
        try:
            outer = json.loads(text)
            payload = outer.get("d", "").replace(")]}'", "")
            google_data = json.loads(payload)

            data_cid = ''
            try:
                data_cid = google_data[16][3][0][4][0][00][1]
            except:
                pass

            if not data_cid:
                try:
                    data_cid = google_data[16][3][0][-1][0][00][1]
                except:
                    pass

            if data_cid:
                print(f"  [{tag}] CID (tbm=map): {data_cid}")
                return str(data_cid)
        except Exception:
            pass

    print(f"  [{tag}] CID not found")
    return ""


# ─────────────────────────────────────────────────────────────
#  STEP 2 — CID -> place_id (hex)  +  /g/ slug
# ─────────────────────────────────────────────────────────────
def cid_to_place_id(cid, tag=""):
    if not cid:
        return "", ""
    print(f"  [{tag}] Step 2 -- CID -> place_id + slug")
    resp = http_get_plain(f"https://www.google.com/maps?cid={cid}")
    if not resp:
        return "", ""

    text = resp.text
    m = re.search(r'(0x[0-9a-fA-F]+:0x[0-9a-fA-F]+)', text)
    if not m:
        m = re.search(r'(0x[0-9a-fA-F]+%3A0x[0-9a-fA-F]+)', text, re.IGNORECASE)
        if m:
            place_id_hex = unquote(m.group(1))
        else:
            print(f"  [{tag}] place_id not found")
            return "", ""
    else:
        place_id_hex = m.group(1)
    slug = ""
    m_slug = re.search(r'(/g/[a-zA-Z0-9_\-]+)', text)
    if m_slug:
        slug = m_slug.group(1)

    print(f"  [{tag}] place_id: {place_id_hex}  |  slug: {slug or '(none)'}")
    return place_id_hex, slug


# ─────────────────────────────────────────────────────────────
#  STEP 3A — Place Details  (using old preview endpoint)
# ─────────────────────────────────────────────────────────────
def fetch_place_details(place_id_hex, tag=""):
    pid_encoded = place_id_hex.replace(":", "%3A")
    print(f"  [{tag}] Step 3a -- Place details")
    resp = http_get(build_place_url(pid_encoded))
    if not resp or len(resp.text) < 200:
        return {}
    raw = resp.text
    j = None
    for line in raw.strip().split("\n"):
        line = line.strip()
        if line.startswith(("[", "{")):
            try:
                j = json.loads(line); break
            except:
                continue
    if j is None:
        try:
            j = json.loads(re.sub(r"^\s*\)\s*\]\s*\}\s*'?\s*\n?", "", raw.strip()))
        except:
            return {}
    b = _safe(j, 6)
    if not isinstance(b, list):
        return {}
    name = _safe(b, 12) or ""
    address = _safe(b, 20) or ""
    if not _is_valid_str(name) and _is_valid_str(address):
        name = address.split(",")[0].strip()
    stats = _safe(b, 4) or []
    try:
        avg_rating = str(round(float(_safe(stats, 7)), 1))
    except:
        avg_rating = None
    try:
        review_count = int(_safe(stats, 8))
    except:
        review_count = None
    lat = lng = None
    for lat_path, lng_path in [
        ((9, 2), (9, 3)),
        ((19, 0), (19, 1)),
        ((10, 2), (10, 3)),
    ]:
        try:
            _lat = _safe(b, *lat_path, default=None)
            _lng = _safe(b, *lng_path, default=None)
            if _lat is not None and _lng is not None:
                lat = float(_lat)
                lng = float(_lng)
                break
        except (TypeError, ValueError):
            pass

    print(f"  [{tag}] {name} | {avg_rating}* | {review_count} reviews | lat={lat} lng={lng}")
    return {
        "place_details": {"name": name if _is_valid_str(name) else "Unknown",
                          "address": address if _is_valid_str(address) else "Unknown"},
        "totals": {"review_count": review_count, "average_rating": avg_rating},
        "coordinates": {"latitude": lat, "longitude": lng},
    }


def fetch_all_reviews_paged(place_id_hex, place_slug, project_folder, tag=""):
    raw_dir = os.path.join(project_folder, "raw")
    extracted_dir = os.path.join(project_folder, "extracted")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(extracted_dir, exist_ok=True)

    print(f"  [{tag}] Step 3b -- Scraping ALL pages (GetLocalBoqProxy)...")
    all_reviews = []
    token = ""
    page = 0
    consecutive_empty = 0
    MAX_EMPTY = 3
    seen_review_ids = set()

    while True:
        if _COOKIE_EXPIRED.is_set():
            raise CookieExpiredError("Cookie expired -- signalled by another thread.")

        page += 1
        print(f"  [{tag}] -- Page {page} (token={'<first>' if not token else token[:20] + '...'}) --")

        url = build_boq_reviews_url(place_id_hex, place_slug, token)
        resp = http_get(url)

        if not resp:
            print(f"  [{tag}] Page {page} request failed -- stopping")
            break

        raw_text = resp.text
        raw_len = len(raw_text)
        parsed_data, raw_entries, next_token = parse_boq_response(raw_text)

        if parsed_data is None:
            print(f"  [{tag}]   Response parse failed")
            with open(os.path.join(raw_dir, f"page_{page:03d}_raw_debug.txt"), "w", encoding="utf-8") as f:
                f.write(raw_text[:100000])
            break

        print(f"  [{tag}]   raw_entries: {len(raw_entries)}")
        print(f"  [{tag}]   next_token: {'YES -> ' + next_token[:25] + '...' if next_token else 'NONE (last page)'}")

        if next_token and next_token == token:
            print(f"  [{tag}]   Next token is identical to current token -- stopping to avoid infinite loop")
            break

        # Parse individual reviews
        extracted_reviews = []
        parse_errors = []
        new_reviews_count = 0
        for i, entry in enumerate(raw_entries):
            if not isinstance(entry, list) or len(entry) < 5:
                continue
            try:
                rev = _parse_review(entry)
                extracted_reviews.append(rev)
                if rev["review_id"] and rev["review_id"] not in seen_review_ids:
                    seen_review_ids.add(rev["review_id"])
                    new_reviews_count += 1
            except Exception as exc:
                parse_errors.append({"index": i, "error": str(exc)})

        all_reviews.extend(extracted_reviews)
        with open(os.path.join(raw_dir, f"page_{page:03d}_raw.json"), "w", encoding="utf-8") as f:
            json.dump({
                "page": page, "scraped_at": now_iso(), "request_url": url,
                "response_chars": raw_len, "has_next_page": bool(next_token),
                "next_token": next_token, "raw_entry_count": len(raw_entries),
                "raw_response": parsed_data, "_raw_text_backup": raw_text[:50000],
            }, f, ensure_ascii=False, indent=2)

        # Save extracted reviews
        with open(os.path.join(extracted_dir, f"page_{page:03d}_extracted.json"), "w", encoding="utf-8") as f:
            json.dump({
                "page": page, "scraped_at": now_iso(),
                "review_count": len(extracted_reviews), "new_review_count": new_reviews_count,
                "has_next_page": bool(next_token),
                "parse_errors": parse_errors, "reviews": extracted_reviews,
            }, f, ensure_ascii=False, indent=2)

        print(
            f"  [{tag}] Page {page:>3} | +{new_reviews_count:>3} new reviews (total this page: {len(extracted_reviews)}) "
            f"| total scraped: {len(all_reviews):>4} | {'LAST PAGE' if not next_token else f'-> page {page + 1}'}")

        if not next_token:
            print(f"\n  [{tag}] Done. Pages: {page}, Reviews: {len(all_reviews)}")
            break

        if new_reviews_count == 0:
            consecutive_empty += 1
            if consecutive_empty >= MAX_EMPTY:
                print(f"  [{tag}]   {MAX_EMPTY} consecutive pages with no new reviews -- stopping")
                break
        else:
            consecutive_empty = 0

        if REVIEW_LIMIT > 0 and len(seen_review_ids) >= REVIEW_LIMIT:
            print(f"  [{tag}]   Reached REVIEW_LIMIT of {REVIEW_LIMIT} -- stopping")
            break

        token = next_token
        time.sleep(PAGE_DELAY)

    if REVIEW_LIMIT > 0 and len(all_reviews) > REVIEW_LIMIT:
        # Keep only up to REVIEW_LIMIT unique reviews
        unique_reviews = []
        seen = set()
        for r in all_reviews:
            if r["review_id"] not in seen:
                seen.add(r["review_id"])
                unique_reviews.append(r)
                if len(unique_reviews) >= REVIEW_LIMIT:
                    break
        all_reviews = unique_reviews
    else:
        # Deduplicate all_reviews to ensure no duplicates in CSV
        unique_reviews = []
        seen = set()
        for r in all_reviews:
            if r["review_id"] not in seen:
                seen.add(r["review_id"])
                unique_reviews.append(r)
        all_reviews = unique_reviews

    return all_reviews


# ─────────────────────────────────────────────────────────────
# SAVE CSV / SUMMARY / MONGO  (unchanged from original)
# ─────────────────────────────────────────────────────────────
def save_csv(reviews, filepath):
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS, extrasaction="ignore")
        writer.writeheader()
        for rev in reviews:
            row = {}
            for csv_header, internal_key in FIELD_MAP:
                val = rev.get(internal_key, "")
                if internal_key == "aspect_ratings": val = json.dumps(val) if val else ""
                row[csv_header] = val if val is not None else ""
            writer.writerow(row)
    print(f"    CSV: {filepath}  ({len(reviews)} rows, {os.path.getsize(filepath) // 1024}KB)")


def save_summary(reviews, place, project_folder, query,
                 project_name, locality, taluka, district, pincode, state):
    rp = len([f for f in os.listdir(os.path.join(project_folder, "raw")) if f.endswith(".json")])
    ep = len([f for f in os.listdir(os.path.join(project_folder, "extracted")) if f.endswith(".json")])
    summary = {
        "project_name": project_name, "locality": locality, "taluka": taluka,
        "district": district, "pincode": pincode, "state": state,
        "search_query": query, "scraped_at": now_iso(),
        "place_name": place.get("place_details", {}).get("name", "Unknown"),
        "place_address": place.get("place_details", {}).get("address", "Unknown"),
        "latitude": place.get("coordinates", {}).get("latitude"),
        "longitude": place.get("coordinates", {}).get("longitude"),
        "average_rating": place.get("totals", {}).get("average_rating"),
        "total_reviews_on_google": place.get("totals", {}).get("review_count"),
        "total_scraped": len(reviews), "total_pages_scraped": rp,
        "sentiment": {lbl: sum(1 for r in reviews if r["sentiment"] == lbl)
                      for lbl in ("Positive", "Neutral", "Negative", "Unknown")},
        "verified_buyer": sum(1 for r in reviews if r.get("verified_buyer") == "Y"),
        "would_recommend_Y": sum(1 for r in reviews if r.get("would_recommend") == "Y"),
        "with_reply": sum(1 for r in reviews if r.get("reply_text")),
        "files": {"raw_pages": f"{rp} files in raw/", "extracted": f"{ep} files in extracted/",
                  "combined_csv": "all_reviews.csv", "summary": "summary.json"},
    }
    path = os.path.join(project_folder, "summary.json")
    with open(path, "w", encoding="utf-8") as f: json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"    Summary: {path}");
    return summary


def save_reviews_to_mongo(reviews, place, place_id_hex,
                          project_name, project_url, project_address,
                          locality, taluka, district, pincode, state):
    client = get_mongo_client();
    db = client[MONGO_DB_NAME];
    col = db[MONGO_COLLECTION]
    col.create_index([("review_id", ASCENDING)], unique=True, background=True)
    lat = place.get("coordinates", {}).get("latitude")
    lng = place.get("coordinates", {}).get("longitude")
    enriched = [{**rev, "project_name": project_name, "project_url": project_url,
                 "project_address": project_address, "locality": locality,
                 "taluka": taluka, "district": district, "pincode": str(pincode),
                 "state": state, "status": "Done", "place_id": place_id_hex,
                 "latitude": lat, "longitude": lng}
                for rev in reviews]
    ops = [UpdateOne({"review_id": d["review_id"]}, {"$set": d}, upsert=True) for d in enriched]
    inserted = updated = 0
    if ops:
        try:
            res = col.bulk_write(ops, ordered=False)
            inserted = res.upserted_count;
            updated = res.modified_count
        except BulkWriteError as bwe:
            print(f"    [WARN] Partial bulk-write: {bwe.details}")
    db["place_meta"].update_one(
        {"place_id": place_id_hex},
        {"$set": {**place.get("place_details", {}), **place.get("totals", {}), **place.get("coordinates", {}),
                  "place_id": place_id_hex, "project_name": project_name,
                  "project_url": project_url, "project_address": project_address,
                  "locality": locality, "taluka": taluka, "district": district,
                  "pincode": str(pincode), "state": state,
                  "updated_at": now_iso()}}, upsert=True)
    print(f"    MongoDB: inserted={inserted}, updated={updated}, total={len(reviews)}")
    client.close()


# ─────────────────────────────────────────────────────────────
# STATUS MANAGER  (unchanged)
# ─────────────────────────────────────────────────────────────
def set_status(record_id: str, status: str, extra: dict = None):
    client = get_mongo_client();
    db = client[MONGO_DB_NAME];
    col = db[GUJRERA_COLL]
    update = {"status": status, "updated_at": now_iso()}
    if extra: update.update(extra)
    col.update_one({"_id": ObjectId(record_id)}, {"$set": update})
    icon = {"Done": "[OK]", "Error": "[ERR]", "Processing": "[...]", "CookieExpired": "[COOKIE]"}.get(status, "->")
    print(f"    {icon} [{record_id[:8]}...] Status -> {status}")
    client.close()


def reset_cookie_expired_to_pending():
    client = get_mongo_client();
    db = client[MONGO_DB_NAME];
    col = db[GUJRERA_COLL]
    res = col.update_many({"status": "CookieExpired"},
                          {"$set": {"status": "Pending", "updated_at": now_iso()}})
    client.close()
    if res.modified_count:
        print(f"  Reset {res.modified_count} 'CookieExpired' -> 'Pending'")


def _save_partial(reviews, folder, purl, pname, paddr, locality, taluka, district, pincode, state, s):
    if not reviews: return
    try:
        p = os.path.join(folder, "all_reviews_partial.csv")
        save_csv([{**r, "project_name": pname, "project_url": purl,
                   "project_address": paddr, "locality": locality,
                   "taluka": taluka, "district": district,
                   "pincode": pincode, "state": state, "status": s} for r in reviews], p)
        print(f"     Partial CSV: {len(reviews)} rows -> {p}")
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────
# PROCESS ONE PROJECT
# ─────────────────────────────────────────────────────────────
def process_project(record):
    if _COOKIE_EXPIRED.is_set(): return

    record_id = str(record["_id"])
    pname = str(record.get("name", record.get("Project Name", ""))).strip()
    purl = str(record.get("Project URL", "")).strip()
    paddr = str(record.get("location", record.get("Project Address", ""))).strip()
    locality = str(record.get("Locality", "")).strip()
    taluka = str(record.get("Taluka", "")).strip()
    district = str(record.get("District", "")).strip()
    pincode = str(record.get("Pincode", "")).strip()
    state = str(record.get("State", "")).strip()
    tag = pname[:25]

    # Extract 6-digit zip code from location using regex
    zip_match = re.search(r'\b\d{6}\b', paddr)
    extracted_zip = zip_match.group(0) if zip_match else ""

    if not pincode and extracted_zip:
        pincode = extracted_zip

    if pincode:
        query = f"{pname}, {pincode}".strip()
    elif taluka:
        query = f"{pname} {taluka}".strip()
    else:
        addr_part = paddr.split(",")[0] if paddr else ""
        query = f"{pname} {addr_part}".strip()

    print(f"\n{'=' * 65}")
    print(f"  PROJECT  : {pname}")
    print(f"  ADDRESS  : {paddr}")
    print(f"  LOCALITY : {locality}  |  TALUKA : {taluka}")
    print(f"  DISTRICT : {district}  |  STATE  : {state}  |  PIN: {pincode}")
    print(f"  RECORD   : {record_id}")
    print(f"{'=' * 65}")

    folder_name = safe_folder_name(f"{pname}_{pincode}")
    project_folder = os.path.join(OUTPUT_ROOT, folder_name)
    os.makedirs(project_folder, exist_ok=True)
    abs_folder = str(Path(project_folder).resolve())
    csv_path = str(Path(abs_folder) / "all_reviews.csv")
    summary_path = str(Path(abs_folder) / "summary.json")
    raw_dir = str(Path(abs_folder) / "raw")
    folder_url = to_file_url(abs_folder)
    csv_url = to_file_url(csv_path)
    summary_url = to_file_url(summary_path)
    raw_url = to_file_url(raw_dir)

    print(f"\n  Folder : {abs_folder}")

    set_status(record_id, "Processing", {
        "started_at": now_iso(), "output_folder": abs_folder,
        "ProjectURL": folder_url, "ProjectURLCSV": csv_url, "output_csv": csv_path,
    })

    all_reviews = []
    try:
        cid = google_search_cid(query, tag=tag)
        if not cid:
            set_status(record_id, "Error", {"error": f"CID not found: {query}", "ProjectURL": folder_url})
            return

        place_id_hex, place_slug = cid_to_place_id(cid, tag=tag)
        if not place_id_hex:
            set_status(record_id, "Error", {"error": f"place_id not resolved: {cid}", "ProjectURL": folder_url})
            return

        place = fetch_place_details(place_id_hex, tag=tag)
        all_reviews = fetch_all_reviews_paged(place_id_hex, place_slug, project_folder, tag=tag)

        if not all_reviews:
            set_status(record_id, "Error", {"error": "No reviews found", "ProjectURL": folder_url})
            return

        lat = place.get("coordinates", {}).get("latitude")
        lng = place.get("coordinates", {}).get("longitude")

        enriched_csv = [{**r, "project_name": pname, "project_url": purl,
                         "project_address": paddr, "locality": locality,
                         "taluka": taluka, "district": district,
                         "pincode": pincode, "state": state, "status": "Done",
                         "latitude": lat, "longitude": lng}
                        for r in all_reviews]

        save_csv(enriched_csv, csv_path)
        summary = save_summary(all_reviews, place, project_folder, query,
                               pname, locality, taluka, district, pincode, state)
        save_reviews_to_mongo(all_reviews, place, place_id_hex,
                              pname, purl, paddr, locality, taluka, district, pincode, state)

        pages_done = summary.get("total_pages_scraped", 0)
        set_status(record_id, "Done", {
            "completed_at": now_iso(),
            "scraped_review_count": summary.get("total_scraped", 0),
            "total_pages": pages_done,
            "average_rating": summary.get("average_rating"),
            "place_name_found": summary.get("place_name"),
            "latitude": lat,
            "longitude": lng,
            "output_folder": abs_folder, "output_csv": csv_path,
            "ProjectURL": folder_url, "ProjectURLCSV": csv_url,
            "ProjectURLSummary": summary_url, "ProjectURLRaw": raw_url,
        })
        print(f"\n  DONE: {pname}")
        print(f"  Reviews: {len(all_reviews)} | Pages: {pages_done} | Rating: {summary.get('average_rating', 'N/A')}*")
        print(f"  Lat: {lat} | Lng: {lng}")
        print(f"  {abs_folder}")

    except CookieExpiredError as e:
        print(f"\n  COOKIE EXPIRED mid-run: {pname}")
        set_status(record_id, "CookieExpired", {"error": str(e), "ProjectURL": folder_url})
        _save_partial(all_reviews, project_folder, purl, pname, paddr,
                      locality, taluka, district, pincode, state, "CookieExpired")

    except Exception as e:
        print(f"\n  ERROR: {pname} -> {e}")
        import traceback;
        traceback.print_exc()
        set_status(record_id, "Error", {"error": str(e), "ProjectURL": folder_url})
        _save_partial(all_reviews, project_folder, purl, pname, paddr,
                      locality, taluka, district, pincode, state, "Error")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("=" * 70)
    print("  GOOGLE MAPS SCRAPER v2 — GetLocalBoqProxy Endpoint")
    print(f"  DB      : {MONGO_DB_NAME}.{GUJRERA_COLL}")
    print(f"  Output  : {os.path.abspath(OUTPUT_ROOT)}/")
    print(f"  Threads : {BATCH_SIZE}")
    print("=" * 70)

    validate_cookies()
    reset_cookie_expired_to_pending()
    os.makedirs(OUTPUT_ROOT, exist_ok=True)

    client = get_mongo_client();
    db = client[MONGO_DB_NAME];
    col = db[GUJRERA_COLL]
    total_pending = col.count_documents({"status": "Pending"})
    print(f"\n  Pending records : {total_pending}")
    client.close()

    if total_pending == 0:
        print("  Nothing to process. Exiting.");
        return

    processed = 0

    while True:
        if _COOKIE_EXPIRED.is_set():
            print("\n" + "!" * 70)
            print("  COOKIE EXPIRED -- Script halted.")
            print("  To resume:")
            print("    1. Chrome -> google.com/maps (logged in)")
            print("    2. F12 -> Network -> any GetLocalBoqProxy request")
            print("    3. Right-click -> Copy -> Copy as cURL -> extract cookies")
            print("    4. Update the COOKIES dict at the top of this file")
            print("    5. Re-run -- CookieExpired records auto-reset to Pending")
            print("!" * 70)
            break

        client = get_mongo_client();
        db = client[MONGO_DB_NAME];
        col = db[GUJRERA_COLL]
        records = list(col.find({"status": "Pending"}).limit(BATCH_SIZE))
        client.close()

        if not records: print("\n  All records processed."); break

        client = get_mongo_client();
        db = client[MONGO_DB_NAME];
        col = db[GUJRERA_COLL]
        col.update_many({"_id": {"$in": [r["_id"] for r in records]}},
                        {"$set": {"status": "Processing", "updated_at": now_iso()}})
        client.close()

        print(f"\n  Batch: {len(records)} project(s)...")
        threads = [threading.Thread(target=process_project, args=(r,), daemon=True) for r in records]
        for t in threads: t.start()
        for t in threads: t.join()

        processed += len(records)

        client = get_mongo_client();
        db = client[MONGO_DB_NAME];
        col = db[GUJRERA_COLL]
        print(f"\n  -- Progress --")
        print(f"  Done          : {col.count_documents({'status': 'Done'})}")
        print(f"  Error         : {col.count_documents({'status': 'Error'})}")
        print(f"  CookieExpired : {col.count_documents({'status': 'CookieExpired'})}")
        print(f"  Pending       : {col.count_documents({'status': 'Pending'})}")
        client.close()

    print(f"\n{'=' * 70}")
    print(f"  FINISHED -- {processed} projects processed")
    print(f"  Output  : {os.path.abspath(OUTPUT_ROOT)}/")
    print(f"{'=' * 70}")


if __name__ == "__main__":
    main()
