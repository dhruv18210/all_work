import re
with open('json_parse.txt', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

configs = re.findall(r'"areaConfig"\s*:\s*\[(.*?)\]', text, re.DOTALL)
if configs:
    for c in configs:
        names = re.findall(r'"name"\s*:\s*"([^"]+)"', c)
        print('Names:', names)
