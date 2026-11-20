import requests
import pandas as pd


def localityID():
    headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json; charset=UTF-8',
        'origin': 'https://www.sbirealty.in',
        'priority': 'u=1, i',
        'referer': 'https://www.sbirealty.in/realty-check/gandhi-nagar-property-rates-and-trends',
        'sec-ch-ua': '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest',
    }
    json_data = {
        'searchStr': '',
        'cityId': '127',
    }
    response = requests.post(
        'https://www.sbirealty.in/property/SBIAjaxSrv.asmx/GetColonyList',
        headers=headers,
        json=json_data,
    )
    json_datas = response.json().get('d')
    City_ID = "127"
    City_Name = "Gandhinagar"
    locality_data = []
    for data in json_datas:
        try:
            locality_data.append({
                "City_ID": City_ID,
                "City_Name": City_Name,
                "Locality_Name": data.get('ColonyDesc'),
                "Locality_ID": data.get('ColonyId'),
                "parse_Locality_ID": data.get('ColonyId').split(':')[0],
                "Latitude": data.get('Latitude'),
                "Longitude": data.get('Longitude')
            })
        except:
            pass
    else:
        return locality_data


def PriceTrend():
    locality = localityID()
    headers = {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json; charset=UTF-8',
        'origin': 'https://www.sbirealty.in',
        'priority': 'u=1, i',
        'referer': 'https://www.sbirealty.in/realty-check/gandhi-nagar-property-rates-and-trends',
        'sec-ch-ua': '"Chromium";v="152", "Not?A_Brand";v="24", "Google Chrome";v="152"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest',
    }
    price_data = []
    for localities in locality:
        json_data = {
            'objTrendFilter': {
                'LocationId': localities['City_ID'],
                'ProjectType': 'R',
                'ProjectSubType': 'AC,IV,IF',
                'ColonyId': localities['parse_Locality_ID'],
                'FromDate': '01-Aug-2024',
                'ToDate': '01-Jul-2026',
                'MonthType': 'Quarterly',
                'ReportType': 'ColonyWise',
                'SearchType': '',
                'RegionId': '',
            },
        }
        response = requests.post(
            'https://www.sbirealty.in/property/SBIAjaxSrv.asmx/GetLocationTrend',
            headers=headers,
            json=json_data,
        )
        response = response.json().get("d")
        for local in response.get("LocationTrend", []):
            for price in local.get("Trend", []):
                price_data.append({
                    "City_ID": localities['City_ID'],
                    "City_Name": localities['City_Name'],
                    "Locality_ID": localities['parse_Locality_ID'],
                    "Locality_Name": localities['Locality_Name'],
                    "Latitude": localities['Latitude'],
                    "Longitude": localities['Longitude'],
                    "Period": price.get("Key"),
                    "Builtup_Price": price.get("BuiltupPrice"),
                    "Carpet_Price": price.get("CarpetPrice")
                })
            print("Done:", localities['Locality_Name'])
    df = pd.DataFrame(price_data)
    df.to_excel("Gandhinagar_Price_Trend.xlsx", index=False)
    print("\nExcel created successfully!")
    print("Total records:", len(df))


if __name__ == '__main__':
    PriceTrend()
