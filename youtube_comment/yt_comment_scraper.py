from playwright.sync_api import sync_playwright
from pymongo import MongoClient
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from dateutil.relativedelta import relativedelta
import re
import random
import time

client = MongoClient("mongodb://localhost:27017/")
db = client["youtube_scraper"]
collection = db["comments"]
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
            page.evaluate("window.scrollBy(0, document.documentElement.scrollHeight)")
            page.wait_for_timeout(50)
            while True:
                buttons = page.locator(
                    "ytd-button-renderer#more-replies button, "
                    "ytd-button-renderer#more-replies-sub-thread button, "
                    "span.more-button"
                    # "button:has(span.more-button)"
                )
                if buttons.count() == 0:
                    break
                clicked = False
                count = buttons.count()
                for i in range(count):
                    try:
                        btn = buttons.nth(i)
                        if not btn.is_visible():
                            continue
                        btn.scroll_into_view_if_needed()
                        page.wait_for_timeout(50)
                        btn.click(force=True, timeout=400)
                        page.wait_for_timeout(50)
                        clicked = True
                    except:
                        continue
                if not clicked:
                    break

            new_count = page.locator("ytd-comment-thread-renderer").count()
            print(f"Loaded Comments : {new_count} / {all_count}")
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
        count1 = threads.count()
        for i in range(count1):
            try:
                thread = threads.nth(i)
                is_reply = thread.evaluate("(el) => !!el.closest('#replies')")
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
            count2 = reply_threads.count()
            for j in range(count2):
                reply = reply_threads.nth(j)
                try:
                    reply_writer = reply.locator("#author-text span").first.inner_text().strip()
                    reply_text = reply.locator("#content-text").first.inner_text().strip()
                    reply_likes = reply.locator("#vote-count-middle").first.inner_text().strip()
                    reply_time = reply.locator("#published-time-text a").first.inner_text().strip()
                    re_match = re.search(r"(\d+)\s+(\w+)", reply_time.lower())
                    reply_date = ""
                    if re_match:
                        value = int(re_match.group(1))
                        unit = re_match.group(2).rstrip("s")
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
