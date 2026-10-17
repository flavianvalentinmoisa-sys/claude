import json, re, glob, os
root = '/home/user/claude/carpatica'
def schema(t):
    s = open(f'{root}/sections/{t}.liquid').read()
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema', s, re.S)
    return json.loads(m.group(1)) if m else {}
def load_json(p):
    t = open(p).read()
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    return json.loads(t)
n = 0
for p in sorted(glob.glob(root + '/templates/*.json') + glob.glob(root + '/sections/*-group.json')):
    d = load_json(p)
    for sid, sec in d['sections'].items():
        sc = schema(sec['type'])
        defs = {x['id']: x for x in sc.get('settings', []) if 'id' in x}
        for k, v in sec.get('settings', {}).items():
            if k not in defs: print(os.path.basename(p), sid, 'setare inexistentă', k); n += 1
            elif defs[k]['type'] == 'select' and v not in [o['value'] for o in defs[k]['options']]: print(os.path.basename(p), sid, k, 'valoare invalidă', v); n += 1
        for bid, b in (sec.get('blocks') or {}).items():
            if b['type'].startswith('@'): continue
            bd = [x for x in sc.get('blocks', []) if x['type'] == b['type']]
            if not bd: print(os.path.basename(p), sid, 'bloc inexistent', b['type']); n += 1; continue
            bdefs = {x['id']: x for x in bd[0].get('settings', []) if 'id' in x}
            for k, v in (b.get('settings') or {}).items():
                if k not in bdefs: print(os.path.basename(p), sid, b['type'], 'setare inexistentă', k); n += 1
                elif bdefs[k]['type'] == 'select' and v not in [o['value'] for o in bdefs[k]['options']]: print(os.path.basename(p), sid, b['type'], k, 'valoare invalidă', v); n += 1
print('probleme șabloane:', n)
