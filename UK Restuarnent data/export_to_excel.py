import os
from datetime import datetime
from pymongo import MongoClient
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "UK_Restaurant_Data"
COLLECTION_NAME = "Restaurant_details"
OUTPUT_FILE = "UK_Restaurant_Details.xlsx"

def export_restaurant_details():
    print(f"Connecting to MongoDB database '{DB_NAME}'...")
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    coll = db[COLLECTION_NAME]

    docs = list(coll.find())
    total_docs = len(docs)
    print(f"Found {total_docs} documents in '{COLLECTION_NAME}'. Processing rows...")

    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    rows = []
    for doc in docs:
        hours_dict = doc.get("opening_hours") or {}
        
        # Formatted string for all opening hours
        hours_summary_parts = []
        for day in days_of_week:
            val = hours_dict.get(day)
            if val:
                hours_summary_parts.append(f"{day}: {val}")
        hours_summary = " | ".join(hours_summary_parts) if hours_summary_parts else ""

        row = {
            "Restaurant Name": doc.get("restaurant_name", ""),
            "Categories": doc.get("categories", ""),
            "Rating": doc.get("rating"),
            "Reviews Count": doc.get("reviews_count"),
            "Phone Number": doc.get("phone_number", ""),
            "Website": doc.get("website", ""),
            "Full Address": doc.get("full_address", ""),
            "Street Address": doc.get("street_address", ""),
            "Latitude": doc.get("latitude"),
            "Longitude": doc.get("longitude"),
            "Opening Hours (Summary)": hours_summary,
            "Monday": hours_dict.get("Monday", ""),
            "Tuesday": hours_dict.get("Tuesday", ""),
            "Wednesday": hours_dict.get("Wednesday", ""),
            "Thursday": hours_dict.get("Thursday", ""),
            "Friday": hours_dict.get("Friday", ""),
            "Saturday": hours_dict.get("Saturday", ""),
            "Sunday": hours_dict.get("Sunday", ""),
            "Google Maps URL": doc.get("google_maps_url", ""),
            "Google CID": doc.get("google_cid", ""),
            "Google ID": doc.get("google_id", ""),
            "Place ID Hex": doc.get("place_id_hex", ""),
            "Search Keyword": doc.get("search_keyword", ""),
            "Original Link": doc.get("original_restaurant_link", ""),
            "Scraped At": doc.get("scraped_at", ""),
        }
        rows.append(row)

    df = pd.DataFrame(rows)
    print(f"Created DataFrame with {len(df)} rows and {len(df.columns)} columns.")

    # Save to Excel
    print(f"Writing to Excel file: '{OUTPUT_FILE}'...")
    with pd.ExcelWriter(OUTPUT_FILE, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="UK_Restaurants", index=False)

    # Style Excel sheet with openpyxl
    wb = openpyxl.load_workbook(OUTPUT_FILE)
    ws = wb["UK_Restaurants"]

    # Header styling
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    center_align = Alignment(horizontal="center", vertical="center", wrap_text=False)
    left_align = Alignment(horizontal="left", vertical="center", wrap_text=False)
    thin_border = Border(
        left=Side(style="thin", color="D9D9D9"),
        right=Side(style="thin", color="D9D9D9"),
        top=Side(style="thin", color="D9D9D9"),
        bottom=Side(style="thin", color="D9D9D9"),
    )

    # Apply header style
    for col_idx in range(1, len(df.columns) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = center_align

    # Auto-adjust column widths
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            val_str = str(cell.value or "")
            if len(val_str) > max_len:
                max_len = len(val_str)
        # Cap between 12 and 45
        adjusted_width = max(min(max_len + 3, 45), 12)
        ws.column_dimensions[col_letter].width = adjusted_width

    # Enable Excel AutoFilter
    ws.auto_filter.ref = ws.dimensions

    wb.save(OUTPUT_FILE)
    file_size_kb = os.path.getsize(OUTPUT_FILE) / 1024
    print(f"Successfully exported {len(rows)} records to '{OUTPUT_FILE}' ({file_size_kb:.1f} KB)!")

if __name__ == "__main__":
    export_restaurant_details()
