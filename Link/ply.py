import random
import time

import requests
from parsel import Selector
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock

INPUT_FILE = "savitara_prod.projects.json"
OUTPUT_FILE = "savitara_prod.projects_with_links.json"
MAX_WORKERS = 1
MAX_RETRIES = 10
BASE_DELAY = 3
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'referer': 'https://www.google.com/',
    'rtt': '300',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
    'sec-ch-ua-arch': '"x86"',
    'sec-ch-ua-bitness': '"64"',
    'sec-ch-ua-form-factors': '"Desktop"',
    'sec-ch-ua-full-version': '"154.0.8037.58"',
    'sec-ch-ua-full-version-list': '"Chromium";v="154.0.8037.58", "Google Chrome";v="154.0.8037.58", "Not A(Brand";v="99.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"19.0.0"',
    'sec-ch-ua-wow64': '?0',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    'cookie': 'SEARCH_SAMESITE=CgQI2qEB; SID=g.a000CQnnWLIzI4jy8xTiS9Fk35EjytsYzyBFCnLRZBlcTNbAIR-qFs9ghuvZ0nVuOgO5Iw5DXAACgYKASYSARASFQHGX2Mi1AyhPPRmDhhzexbg5erhzBoVAUF8yKrBcC25GyYemXnfC7idZRXa0076; __Secure-1PSID=g.a000CQnnWLIzI4jy8xTiS9Fk35EjytsYzyBFCnLRZBlcTNbAIR-qMjFDp3e17q3pRtaJ0uVOcQACgYKAdwSARASFQHGX2Mig8V7BfLdWhBqDtXUeKBdyBoVAUF8yKpLb7pJcsEbc4hcZoqtCkUa0076; __Secure-3PSID=g.a000CQnnWLIzI4jy8xTiS9Fk35EjytsYzyBFCnLRZBlcTNbAIR-qwiGjaBEIHNytBNMm1ppYcQACgYKAXMSARASFQHGX2Mi4KqvHC-7_-bxErdbFGQnoRoVAUF8yKr5UD6kFzys0foIP8DGaolh0076; HSID=Ai7Va5BxWSca04xfV; SSID=AF5KCy1YMtETBMd_O; APISID=oHSeFhmjHYpom94n/Ah0j47h3pStoWi3QW; SAPISID=od6XWc95KiDS-xzd/Aik_l5OzXkCR45DlE; __Secure-1PAPISID=od6XWc95KiDS-xzd/Aik_l5OzXkCR45DlE; __Secure-3PAPISID=od6XWc95KiDS-xzd/Aik_l5OzXkCR45DlE; AEC=Aaa9EJrwBVV915apqU_SosXwN-royjRlRQX1ZH83w7yrd6uLMN6fvj0pLQ; GOOGLE_ABUSE_EXEMPTION=ID=335ded8bbd7cb8c4:TM=1790852649:C=r:IP=2a0f:2746:6002:6d2b:b8d5:f365:136b:ef84-:S=komTBtHVH_2R-KwAOuoO5Y8; NID=Cu0CCAESnwIBOxGDSLeBBDYBtAVezJr9GOqL51J-OpmXy94P4tjVe5E43vKBeBY5qTpIDwL4T7TAsqZe8gaS-fpVBSK4bh8s87A5muqUnFcRWmQKPDH0W3nuvFu41ksQTxYHUMhN9eaHK2cBgpA3pDYimfKOZFty2dHNQ2RT2KLqQ_hZIDudTlyQcVssxeGP8QETSTnznl54Lr7ZSrq0eet-q8MMy6CAlP5PC86sxrMNIfe2jENoJpAAiDBqsHrHw2j8HkdDfjuj3Ur47kSCXmeQApnfg_oYRmlYdkBL822lloF0rG7GlGb9WMj4GriDtIxN0NGMnHTnCFFo21pxxMV1zvgCefKCCMUKOkX2oSOeNBXOJp_LoLPDAwqOd2ClyciLfTZLdigBMkUB0qwHz4jTgkl0MG2FSqp4tHAjKV2v7t0scZ7XLgwjJrxfJBwhcViSM2bZpIQ6RV6PaEjjIXLiBn_Mdc9k-fsT-j0Q4gc; __Secure-1PSIDTS=sidts-CjcBkldj_wgOJ8csbCUxzAgC3jaxgSKub-E1-9zwuLDOe8q78pSqLkChDVbmia2aEAet7f9-8ynOEAA; __Secure-1PSIDRTS=sidts-CjcBkldj_wgOJ8csbCUxzAgC3jaxgSKub-E1-9zwuLDOe8q78pSqLkChDVbmia2aEAet7f9-8ynOEAA; __Secure-3PSIDTS=sidts-CjcBkldj_wgOJ8csbCUxzAgC3jaxgSKub-E1-9zwuLDOe8q78pSqLkChDVbmia2aEAet7f9-8ynOEAA; __Secure-3PSIDRTS=sidts-CjcBkldj_wgOJ8csbCUxzAgC3jaxgSKub-E1-9zwuLDOe8q78pSqLkChDVbmia2aEAet7f9-8ynOEAA; __Secure-STRP=ABNhA6h35y-Iz5darrLh5r_h11h6LtPmVzSE5XF4d_htS9azwhron__9A-6utOcR_pd1ECxV4yUvGmR_r6jBSfF4pOpf4WZd1q54; DV=w21eTV3rYqwvwddk69DJyhUf6DhyD5oVA3Zq8TQFNgAAAAAifm2YC1-ePQAAALDxvkO948-MHAAAAB7d8Xg8VY-nDwAAgHDg_kzJEK2DBAAAoN-h26FyUEAbcwoAePqLQpQ_GFIlnQIAE9gf_wXnwApJpwAAw8iIXJ_dLyTUKQAweZPqmcW6fB51CgBIky0uAEZolEydAgAHeuDuIcOwAxZAB0BddbuWp-SpVQbQARBY3CpeACv-9gF0APRCwvFLr6pOhgAdANOYCzeDgzi7IkAHwNe0ejeCfstMCdABAA; __Secure-ENID=CuYCCAISmAIBAQxeRaWuBXvPgboqgdgLu064fFngx4fRKX2wKaDpMC-Jhcbf1yHKVQb_3_c9QBdmXQCIxvp-K9KPej7P3OXEp2jCBKSRfyDxVOAPvQfVxcTz92VNKFaa2-1bQDgUtheToghLGQVL6fZKOGigM6HrXJNKnY73ycHBcmC_lQUsEwld5YZAE_hkRT_uqtfEMP_jEJVFV6qGiFFQMBt6V1TzwnF9LUck2Y3sJBVzsKH9Iucfs69qc6JzQQ6ljEHBuWmD-ngzkQDm8j73gEXpbAxVoYzD598v5mF3e215MS74QyKoEzGDHohHRbTuG2Ebq9MBBkAwspCyNTpa90TYVJtuGKsb8kVVRhXnJUh7RyXhkDo-FBp0EnR6KAIyRQF9bMSqz_Lt8LzD2oxB3wy8jRaEEqBu-R6zexAw8bkS1gOulM7HsJW24vqgrMb17sYcX0qgDXViFRB4cKJA0-aGrKvQAg; SIDCC=AKEyXzUP9zGmaUiFFugVesCF1m_gWb7y0vSFtWxvhdo1Y4Yr4exIUIDvk-e0y2C-BVUwyhGNTQ; __Secure-1PSIDCC=AKEyXzWpUCEDTlqvDtvDLxdUwaTl7w_znN_iU_s5eSdMIjjb7C6W6It5BKM-lC57VWvdhcjytw; __Secure-3PSIDCC=AKEyXzXXcUYe0OpzEh7EXtKXrdoIX3fRMWUZ1XQH-2XgLUuCbfSfDHTVmXphDAJ_USuhrK0aUaE',
}

print_lock = Lock()


def extract_link(index, project):
    name = project.get("name", "")
    location = project.get("address", "")

    params = {
        "q": f"{name}, {location}, 99acres.com"
    }

    for attempt in range(MAX_RETRIES + 1):
        try:
            response = requests.get(
                "https://www.google.com/search",
                params=params,
                headers=headers,
                timeout=30
            )

            # Handle rate limiting
            if response.status_code == 429:
                headers['cookie'] = input("please enter cookie: ")
                if attempt == MAX_RETRIES:
                    with print_lock:
                        print(f"[{index + 1}] Max retries reached (429): {name}")
                    return index, ""

                retry_after = response.headers.get("Retry-After")
                try:
                    delay = float(retry_after) if retry_after else (
                        BASE_DELAY * (2 ** attempt) + random.uniform(0, 2)
                    )
                except ValueError:
                    delay = BASE_DELAY * (2 ** attempt) + random.uniform(0, 2)

                with print_lock:
                    print(
                        f"[{index + 1}] HTTP 429 | "
                        f"Retry {attempt + 1}/{MAX_RETRIES} "
                        f"in {delay:.1f}s: {name}"
                    )

                time.sleep(delay)
                continue

            response.raise_for_status()

            dom = Selector(text=response.text)

            links = dom.xpath(
                '//div[@id="rso"]//a[@href]/@href'
            ).getall()

            link = next(
                (
                    url for url in links
                    if url.startswith("https://www.99acres.com/")
                ),
                ""
            )

            with print_lock:
                if link:
                    print(f"[{index + 1}] Link Extracted: {name} -> {link}")
                else:
                    print(f"[{index + 1}] Link Not Found: {name}")

            return index, link

        except requests.RequestException as e:
            if attempt == MAX_RETRIES:
                with print_lock:
                    print(f"[{index + 1}] Failed: {name} | {e}")
                return index, ""

            delay = BASE_DELAY * (2 ** attempt) + random.uniform(0, 2)

            with print_lock:
                print(
                    f"[{index + 1}] Request error, "
                    f"retry {attempt + 1}/{MAX_RETRIES} "
                    f"in {delay:.1f}s: {e}"
                )

            time.sleep(delay)

    return index, ""


# Run 20 concurrent threads
with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
    futures = {
        executor.submit(extract_link, index, project): index
        for index, project in enumerate(data)
    }

    for future in as_completed(futures):
        index, link = future.result()
        data[index]["Link"] = link

# Save results to a new JSON file
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

# Summary
total = len(data)
extracted = sum(bool(project.get("Link")) for project in data)

print("\n========== COMPLETED ==========")
print(f"Total Projects: {total}")
print(f"Links Extracted: {extracted}")
print(f"Links Not Found: {total - extracted}")
print(f"Output File: {OUTPUT_FILE}")