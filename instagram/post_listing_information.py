import json
import requests


def get_listing():
    next_page = None
    page_num = 1
    while True:
        print(f"Page number == > {page_num}")
        page_num += 1
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
        if next_page is None:
            data = {
                'fb_dtsg': 'NAfy9no-eFAwmXPVKDk8WpqkF_GXuuvfEEckvD8HbZ14FtG2e8FA3OQ:17864329786054772:1791786239',
                'variables': '{"query":"restaurants in Notting Hill london","search_session_id":"1b284040-d62d-4c1a-91c0-fe73076ffcdc","serp_session_id":"1b284040-d62d-4c1a-91c0-fe73076ffcdc"}',
                'doc_id': '37324993597144881',
            }
        else:
            data = {
                'fb_dtsg': 'NAfxX2caPO6vkyLv60R-z795vPu1-fxejN_q-8Kj0iAdbxdh5gdCClg:17864329786054772:1791786239',
                'variables': '{"after":"'+next_page+'","first":24,"query":"restaurants in Notting Hill london","search_session_id":"1b284040-d62d-4c1a-91c0-fe73076ffcdc","serp_session_id":"1b284040-d62d-4c1a-91c0-fe73076ffcdc"}',
                'doc_id': '28656899673911396',
            }

        response = requests.post('https://www.instagram.com/api/graphql', cookies=cookies, headers=headers, data=data)
        json_data = json.loads(response.text)
        edges = json_data['data']['xdt_fbsearch__top_serp_graphql']['edges']
        for edge in edges:
            node = edge.get("node") or {}
            items = node.get("items") or []
            for datas in items:
                data_dic = {}
                data_dic['profile_url'] = "https://www.instagram.com/" + datas.get('user').get("username") or {}
                data_dic['profile_image'] = datas.get('user').get("profile_pic_url") or {}
                data_dic['name'] = datas.get('user').get("full_name") or {}
                data_dic['userid'] = datas.get('user').get("pk") or {}
                data_dic['is_private'] = datas.get('user').get("is_private") or {}
                data_dic['is_verified'] = datas.get('user').get("is_verified") or {}
                data_dic['post_url'] = "https://www.instagram.com/p/" + datas.get("code") or {}
                data_dic['post_like'] = datas.get("like_count") or {}
                data_dic['post_comment'] = datas.get("comment_count") or {}
                try:
                    data_dic['caption'] = datas.get('caption').get('text') or {}
                except:
                    data_dic['caption'] = ""
                try:
                    coll.insert_one(data_dic)
                    print("inserted = = =>")
                except Exception as e:
                    print(e)
            
        pagination= json_data['data']['xdt_fbsearch__top_serp_graphql']['page_info']['has_next_page']
        if pagination:
            next_page = json_data['data']['xdt_fbsearch__top_serp_graphql']['page_info']['end_cursor']
        else:break


if __name__ == '__main__':
    from pymongo import MongoClient
    client = MongoClient('mongodb://localhost:27017/')
    db = client['instagram_db']
    coll = db['instagram_listing']
    coll.create_index('profile_url', unique=True)
    get_listing()