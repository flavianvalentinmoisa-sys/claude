# Verifică valorile din config/settings_data.json față de settings_schema.json (interval, pas, opțiuni).
# O singură valoare invalidă poate face Shopify să ignore tot fișierul (inclusiv schemele de culori).
import json, sys
root = sys.argv[1] if len(sys.argv) > 1 else '.'
schema = json.load(open(f'{root}/config/settings_schema.json'))
defs = {s['id']: s for g in schema for s in g.get('settings', []) if 'id' in s}
data = json.load(open(f'{root}/config/settings_data.json'))
preset = data['presets'][data['current']] if isinstance(data['current'], str) else data['current']
n = 0
for k, v in preset.items():
    if k in ('sections', 'color_schemes'): continue
    d = defs.get(k)
    if not d: print('setare necunoscută', k); n += 1; continue
    if d['type'] == 'range' and (v < d['min'] or v > d['max'] or (v - d['min']) % d['step']):
        print('valoare invalidă', k, v); n += 1
    if d['type'] == 'select' and v not in [o['value'] for o in d['options']]:
        print('opțiune invalidă', k, v); n += 1
print('probleme:', n)
