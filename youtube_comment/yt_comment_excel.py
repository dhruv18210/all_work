from pymongo import MongoClient
from openpyxl import Workbook
import json

client = MongoClient("mongodb://localhost:27017/")
db = client["youtube_scraper"]
collection = db["comments"]

wb = Workbook()
ws = wb.active
documents = list(collection.find({}, {"_id": 0}))
if documents:
    headers = list(documents[0].keys())
    ws.append(headers)
    for doc in documents:
        row = []
        for h in headers:
            value = doc.get(h, "")
            if isinstance(value, (list, dict)):
                value = json.dumps(value, ensure_ascii=False)
            row.append(value)
        ws.append(row)
wb.save("yt_comment_data.xlsx")
print("Done")




'''
from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from urllib.parse import urlparse, parse_qs
import re
from datetime import datetime
from dateutil.relativedelta import relativedelta
import random
import time

client = MongoClient("mongodb://localhost:27017/")
db = client["youtube"]
collection = db["comments_&_replies_2"]
KEYWORD = input("Enter Keywords: ")
BASE_URL = "https://youtube.com"


def human_delay(a=2000, b=6000):
    import time
    time.sleep(random.uniform(a / 1000, b / 1000))


def youtube_data():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            channel="chrome",
            headless=False,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-infobars",
            ]
        )
        # open YouTube and search user input keywords
        context = browser.new_context(viewport={"width": 1080, "height": 720})
        page = context.new_page()
        page.goto("https://youtube.com", wait_until="domcontentloaded")
        search_box = page.locator("input[name='search_query']")
        search_box.wait_for(state="visible", timeout=15000)
        search_box.click()
        search_box.fill(KEYWORD)
        search_box.press("Enter")
        time.sleep(3)
        # open 1st video and generate new url
        page.wait_for_selector("#video-title", timeout=15000)
        videos = page.locator("ytd-video-renderer #video-title").all()
        for video in videos:
            url = video.get_attribute("href")
            title = video.get_attribute("title")
            if url and "watch" in url:
                video_link = "https://www.youtube.com" + url if url.startswith("/watch") else url
                video_title = title
                print(video_title)
                page.goto(video_link, wait_until="domcontentloaded")
                time.sleep(3)
                page.evaluate("window.scrollTo(0,700)")
                time.sleep(2)
                break
        # scrolldown all comments and replies
        page.wait_for_selector("h2#count yt-formatted-string", timeout=30000)
        all_count = page.locator("//h2[@id='count']//yt-formatted-string").inner_text()
        print(f"Total comments : {all_count}")
        print("Loading all comments...")
        last_count = 0
        unchanged = 0
        while True:
            page.mouse.wheel(0, 3500)
            page.wait_for_timeout(1000)
            page.evaluate("""window.scrollTo(0, document.documentElement.scrollHeight)""")
            page.wait_for_timeout(1500)
            while True:
                buttons = page.locator(
                    "ytd-button-renderer#more-replies button, "
                    "ytd-button-renderer#more-replies-sub-thread button"
                )
                if buttons.count() == 0:
                    break
                clicked = False
                for i in range(buttons.count()):
                    try:
                        btn = buttons.nth(i)
                        if not btn.is_visible():
                            continue
                        btn.scroll_into_view_if_needed()
                        page.wait_for_timeout(500)
                        btn.click(force=True, timeout=2500)
                        page.wait_for_timeout(1000)
                        clicked = True
                        break
                    except:
                        continue
                if not clicked:
                    break

            while True:
                more_buttons = page.locator("span.more-button")
                if more_buttons.count() == 0:
                    break
                clicked = False
                for i in range(more_buttons.count()):
                    try:
                        btn = more_buttons.nth(i)
                        if not btn.is_visible():
                            continue
                        btn.scroll_into_view_if_needed()
                        page.wait_for_timeout(300)
                        btn.click(force=True)
                        page.wait_for_timeout(500)
                        clicked = True
                    except:
                        continue
                if not clicked:
                    break

            new_count = page.locator("ytd-comment-thread-renderer").count()
            # print(f"Loaded Comments : {new_count} / {all_count}")
            if new_count == last_count:
                unchanged += 1
            else:
                unchanged = 0
            if unchanged >= 5:
                print("Reached end of comments.")
                break
            last_count = new_count
        print(f"total comments loaded: {last_count} out of {all_count}")
        # scrape comments details
        threads = page.locator("ytd-comment-thread-renderer")
        print(f"Scraping {threads.count()} comments...")
        for i in range(threads.count()):
            try:
                thread = threads.nth(i)
                is_reply = thread.evaluate(
                    "(el) => !!el.closest('#replies')"
                )
                if is_reply:
                    continue
                comment_writer = thread.locator("#author-text span").first.inner_text().strip()
                comment = thread.locator("#content-text").first.inner_text().strip()
                comment_likes = thread.locator("#vote-count-middle").first.inner_text().strip()
                comment_time = thread.locator("#published-time-text a").first.inner_text().strip()
                match = re.search(r"(\d+)\s+(\w+)", comment_time.lower())
                comment_date = ""
                if match:
                    value = int(match.group(1))
                    unit = match.group(2).rstrip("s")
                    comment_date = (
                            datetime.now() - relativedelta(**{unit + "s": value})
                    ).strftime("%Y-%m-%d")
                href = thread.locator("#published-time-text a").first.get_attribute("href")
                comment_id = ""
                if href:
                    comment_id = parse_qs(urlparse(href).query).get("lc", [""])[0]
                if not comment_id:
                    comment_id = f"comment_{i}"
            except Exception as e:
                print(f"Comment {i} Error :", e)
                continue
            # scrape replies detail is available
            # reply_container = thread.locator("#replies")
            # try:
            #     reply_container.wait_for(state="visible", timeout=3000)
            # except:
            #     pass
            reply_threads = thread.locator("#replies ytd-comment-view-model")
            # print(f"Comment {i} -> Replies Found: {reply_threads.count()}")

            replies = []
            for j in range(reply_threads.count()):
                reply = reply_threads.nth(j)
                try:
                    reply_writer = reply.locator("#author-text span").first.inner_text().strip()
                    reply_text = reply.locator("#content-text").first.inner_text().strip()
                    reply_likes = reply.locator("#vote-count-middle").first.inner_text().strip()
                    reply_time = reply.locator("#published-time-text a").first.inner_text().strip()
                    match = re.search(r"(\d+)\s+(\w+)", reply_time.lower())
                    reply_date = ""
                    if match:
                        value = int(match.group(1))
                        unit = match.group(2).rstrip("s")
                        reply_date = (
                                datetime.now() - relativedelta(**{unit + "s": value})
                        ).strftime("%Y-%m-%d")
                    href = reply.locator("#published-time-text a").first.get_attribute("href")
                    reply_id = ""
                    if href:
                        reply_id = parse_qs(urlparse(href).query).get("lc", [""])[0]
                    if not reply_id:
                        reply_id = f"{comment_id}_reply_{j}"
                    # append replies into document
                    replies.append({
                        "reply_id": reply_id,
                        "reply_writer": reply_writer,
                        "reply": reply_text,
                        "reply_time": reply_time,
                        "reply_date": reply_date,
                        "reply_likes": reply_likes
                    })
                except Exception as e:
                    print("Reply Error:", e)
            # store comments data with replies
            comment_data = {
                "video_link": video_link,
                "video_title": video_title,
                "comment_id": comment_id,
                "comment_writer": comment_writer,
                "comment": comment,
                "comment_time": comment_time,
                "comment_date": comment_date,
                "comment_likes": comment_likes,
                "replies": replies
            }
            collection.insert_one(comment_data)
        print("Comments saved successfully.")


youtube_data()

'''