import re
import json
from datetime import datetime, timezone
import requests


def listing():
    all_data = coll.find({"status":None})
    for data in all_data:
        username = data['profile_url'].replace('https://www.instagram.com/','')
        userid = data['userid']
        get_userdata(username, userid)

def get_userdata(username, userid):
    cookies = {
        'sessionid': '24306443686%3AdEmrgAQlUEKREc%3A17%3AAYnQpaTcs08KQV-FUPTHEo9jbfLOsWuEX_q9oByE1w',
    }
    headers = {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://www.instagram.com',
        'priority': 'u=1, i',
        'sec-ch-prefers-color-scheme': 'light',
        'sec-ch-ua': '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
        'sec-ch-ua-full-version-list': '"Chromium";v="154.0.8037.93", "Google Chrome";v="154.0.8037.93", "Not A(Brand";v="99.0.0.0"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-model': '""',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua-platform-version': '"19.0.0"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',

    }
    data = {
        'fb_dtsg': 'NAfwJn_PbXXD1zx54abTYMpsI1_8sT3LTNkp5acvpJ_aqN4lXUooGgg:17864329786054772:1791786239',
        'variables': '{"enable_integrity_filters":true,"id":"'+userid+'","__relay_internal__pv__PolarisCannesGuardianExperienceEnabledrelayprovider":true,"__relay_internal__pv__PolarisCASB976ProfileEnabledrelayprovider":false,"__relay_internal__pv__PolarisWebSchoolsEnabledrelayprovider":false,"__relay_internal__pv__PolarisRepostsConsumptionEnabledrelayprovider":true,"__relay_internal__pv__PolarisShortDramaEnabledrelayprovider":true}',
        'doc_id': '28036671149327607',
    }
    response = requests.post('https://www.instagram.com/api/graphql', cookies=cookies, headers=headers, data=data)
    json_data = json.loads(response.text)
    profile = json_data['data']['user']
    biography = profile.get("biography") or ""
    public_phone = profile.get("contact_phone_number")
    public_email = profile.get("public_email")

    bio_links = [
        {
            "title": link.get("title"),
            "url": link.get("url"),
            "link_type": link.get("link_type"),
        }
        for link in profile.get("bio_links", [])
    ]
    result = {
        "user_id": profile.get("pk") or profile.get("id"),
        "username": profile.get("username"),
        "full_name": profile.get("full_name"),
        "biography": biography,
        "category": profile.get("category"),
        "account_type": profile.get("account_type"),
        "is_business": profile.get("is_business"),
        "is_verified": profile.get("is_verified"),
        "is_private": profile.get("is_private"),
        "is_professional_account":profile.get("is_professional_account"),
        "profile_pic_url": profile.get("profile_pic_url"),
        "hd_profile_pic_url": (profile.get("hd_profile_pic_url_info") or {}).get("url"),
        "bio_links": bio_links,
        "address_street": profile.get("address_street"),
        "city_name": profile.get("city_name"),
        "zip": profile.get("zip"),
        "account_badges": profile.get("account_badges", []),
        "emails": ' | '.join(extract_emails(biography, public_email or "")),
        "phone_numbers": ' | '.join(extract_phone_numbers(biography, public_phone or "")),
        "public_email": public_email,
        "public_phone": public_phone,
        "followers_count": profile.get("follower_count"),
        "following_count": profile.get("following_count"),
        "media_count": profile.get("media_count"),
    }
    try:
        user_coll.insert_one(result)
        print("inserted successfully == >")
        coll.update_one({"userid": userid}, {"$set": {'status':'done'}})
    except Exception as e:
        print(e)


def extract_emails(*texts):
    """Extract email addresses from available public text."""
    pattern = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"
    emails = set()

    for text in texts:
        if isinstance(text, str):
            emails.update(re.findall(pattern, text))

    return sorted(emails)


def extract_phone_numbers(*texts):
    """Find possible phone numbers in public profile text."""
    pattern = r"(?<!\w)(?:\+?\d[\d\s().-]{7,}\d)(?!\w)"
    numbers = set()

    for text in texts:
        if isinstance(text, str):
            for number in re.findall(pattern, text):
                digits = re.sub(r"\D", "", number)

                # Avoid treating short numeric IDs as phone numbers
                if 10 <= len(digits) <= 15:
                    numbers.add(number.strip())

    return sorted(numbers)

if __name__ == '__main__':
    from pymongo import MongoClient
    client = MongoClient('mongodb://localhost:27017/')
    db = client['instagram_db']
    coll = db['instagram_listing']
    user_coll = db['instagram_user_data']
    user_coll.create_index('username', unique=True)
    listing()



