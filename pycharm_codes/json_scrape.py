import json

INPUT_FILE = "kala_json.txt"
OUTPUT_FILE = "kkshyam.json"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    txt = f.read().strip()

# Remove BOM
txt = txt.lstrip("\ufeff")

# If the content is an escaped JSON string, decode it
try:
    txt = json.loads(f'"{txt}"')
except Exception:
    pass

# Remove invalid surrogate characters
txt = txt.encode("utf-8", "surrogatepass").decode("utf-8", "ignore")

# Parse first valid JSON object
decoder = json.JSONDecoder()
obj, end = decoder.raw_decode(txt)

# Recursively clean all strings
def clean(value):
    if isinstance(value, dict):
        return {clean(k): clean(v) for k, v in value.items()}
    elif isinstance(value, list):
        return [clean(v) for v in value]
    elif isinstance(value, str):
        return value.encode("utf-8", "ignore").decode("utf-8")
    return value

obj = clean(obj)

# Save JSON
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(obj, f, indent=4, ensure_ascii=False)

print(f"✅ Clean JSON saved as {OUTPUT_FILE}")