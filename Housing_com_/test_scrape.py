import json
import re

with open('json_parse.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Try to extract the __INITIAL_STATE__ JSON
m = re.search(r'window\.__INITIAL_STATE__\s*=\s*(\{.*?\});', text, re.DOTALL)
if m:
    state_str = m.group(1)
    try:
        state = json.loads(state_str)
    except Exception as e:
        print("Failed to parse JSON:", e)
        # Try a more forgiving approach
        import ast
        try:
            state = json.loads(state_str.replace('undefined', 'null'))
        except:
            print("Still failed")
            state = {}
else:
    print("Could not find window.__INITIAL_STATE__")
    state = {}

if not state:
    try:
        state = json.loads(text)
    except:
        pass

def find_key(obj, key):
    if isinstance(obj, dict):
        if key in obj: return obj[key]
        for v in obj.values():
            res = find_key(v, key)
            if res is not None: return res
    elif isinstance(obj, list):
        for item in obj:
            res = find_key(item, key)
            if res is not None: return res
    return None

carpet_area = ""
build_up_area = ""
if state:
    area_config = find_key(state, 'areaConfig')
    if area_config and isinstance(area_config, list):
        for ac in area_config:
            if not isinstance(ac, dict):
                continue
            name = ac.get('name', '')
            area_info = ac.get('areaInfo')
            val = area_info.get('value', '') if isinstance(area_info, dict) else ''
            name_lower = name.lower()
            if 'carpet' in name_lower:
                carpet_area = str(val)
            elif 'builtup' in name_lower or 'built-up' in name_lower or 'built up' in name_lower:
                build_up_area = str(val)

print("Carpet Area:", carpet_area)
print("Built-up Area:", build_up_area)
