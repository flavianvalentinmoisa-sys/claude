# Verifică tipurile și valorile tuturor setărilor din șabloane, grupuri și settings_data (secțiuni statice).
import json, re, glob, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
schemes = list(json.load(open(f'{root}/config/settings_data.json'))['presets']['Default']['color_schemes'])
def schema(t):
    s = open(f'{root}/sections/{t}.liquid').read()
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema', s, re.S)
    return json.loads(m.group(1)) if m else {}
def chk(where, defs, vals):
    n = 0
    for k, v in vals.items():
        d = defs.get(k)
        if not d: print(where, 'necunoscut', k); n += 1; continue
        t = d['type']
        bad = (t == 'range' and (not isinstance(v, (int, float)) or v < d['min'] or v > d['max'] or round((v - d['min']) / d['step'], 6) % 1)) \
            or (t == 'select' and v not in [o['value'] for o in d['options']]) \
            or (t == 'checkbox' and not isinstance(v, bool)) \
            or (t == 'color' and v and not re.fullmatch(r'#[0-9A-Fa-f]{6}', v)) \
            or (t == 'richtext' and v and not v.startswith(('<p', '<h', '<ul', '<ol'))) \
            or (t == 'color_scheme' and v not in schemes)
        if bad: print(where, k, repr(v), t); n += 1
    return n
def sec_check(where, sec):
    sc = schema(sec['type']); n = chk(where, {x['id']: x for x in sc.get('settings', []) if 'id' in x}, sec.get('settings') or {})
    blocks = sec.get('blocks') or {}
    if len(blocks) > sc.get('max_blocks', 50): print(where, 'prea multe blocuri'); n += 1
    for bid, b in blocks.items():
        if b['type'].startswith('@'): continue
        bd = [x for x in sc.get('blocks', []) if x['type'] == b['type']]
        if not bd: print(where, 'bloc lipsă', b['type']); n += 1; continue
        n += chk(f'{where}:{bid}', {x['id']: x for x in bd[0].get('settings', []) if 'id' in x}, b.get('settings') or {})
        lim = bd[0].get('limit')
        if lim and sum(1 for x in blocks.values() if x['type'] == b['type']) > lim: print(where, b['type'], 'peste limită'); n += 1
    return n
n = 0
for sid, sec in json.load(open(f'{root}/config/settings_data.json'))['presets']['Default'].get('sections', {}).items():
    n += sec_check('settings_data:' + sid, sec)
for p in sorted(glob.glob(f'{root}/templates/*.json') + glob.glob(f'{root}/sections/*-group.json')):
    d = json.loads(re.sub(r'^/\*.*?\*/', '', open(p).read(), flags=re.S))
    for sid, sec in d['sections'].items(): n += sec_check(f'{p.split("/")[-1]}:{sid}', sec)
    if len(d['sections']) > 25: print(p, 'peste 25 de secțiuni'); n += 1
    if 'order' in d and set(d['order']) != set(d['sections']): print(p, 'order nepotrivit'); n += 1
print('probleme valori:', n)
