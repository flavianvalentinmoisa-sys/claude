import json, re
PAT = re.compile(r'({%-?\s*schema\s*-?%})(.*?)({%-?\s*endschema\s*-?%})', re.S)
def load(path):
    t = open(path, encoding='utf-8').read()
    m = PAT.search(t)
    return t, m, json.loads(m.group(2))
def save(path, t, m, schema):
    js = json.dumps(schema, ensure_ascii=False, indent=2)
    t = t[:m.start()] + m.group(1) + '\n' + js + '\n' + m.group(3) + t[m.end():]
    open(path, 'w', encoding='utf-8').write(t)
def insert_after(settings, after_id, new):
    i = [s.get('id') for s in settings].index(after_id)
    settings[i+1:i+1] = new
def find_block(schema, type_):
    return [b for b in schema['blocks'] if b['type'] == type_][0]
