import json, re, glob, os, sys
root = sys.argv[1]
problems = []
def check_settings(where, settings):
    ids = set()
    for s in settings or []:
        t = s.get('type'); sid = s.get('id')
        if sid:
            if sid in ids: problems.append(f"{where}: id duplicat {sid}")
            ids.add(sid)
        if t == 'range':
            mn, mx, st, d = s['min'], s['max'], s['step'], s.get('default')
            if (mx - mn) / st > 101: problems.append(f"{where}.{sid}: prea mulți pași ({(mx-mn)/st})")
            if d is None or d < mn or d > mx: problems.append(f"{where}.{sid}: default {d} în afara [{mn},{mx}]")
            elif abs(((d - mn) / st) - round((d - mn) / st)) > 1e-6: problems.append(f"{where}.{sid}: default {d} nu e pe pas")
            if len(s.get('unit', '')) > 3: problems.append(f"{where}.{sid}: unitate prea lungă '{s['unit']}'")
        if t in ('select', 'radio'):
            vals = [o['value'] for o in s['options']]
            if 'default' in s and s['default'] not in vals: problems.append(f"{where}.{sid}: default {s['default']} nu e opțiune")
            if len(vals) != len(set(vals)): problems.append(f"{where}.{sid}: opțiuni duplicate")
        if t in ('text', 'textarea', 'inline_richtext', 'richtext', 'html', 'url') and 'default' in s and s['default'] == '':
            problems.append(f"{where}.{sid}: default gol")
        if t == 'richtext' and s.get('default') and not re.match(r'^<(p|ul|ol|h[1-6])', s['default']):
            problems.append(f"{where}.{sid}: richtext default trebuie să înceapă cu <p>")
        if t == 'inline_richtext' and s.get('default') and re.search(r'<(p|div|ul|br)', s['default']):
            problems.append(f"{where}.{sid}: inline_richtext cu tag de bloc")
        if t == 'url' and s.get('default') and not s['default'].startswith(('/collections', 'shopify://', '/')):
            problems.append(f"{where}.{sid}: url default invalid {s['default']}")
        if t == 'number' and 'default' in s and not isinstance(s['default'], (int, float)):
            problems.append(f"{where}.{sid}: number default nu e număr")
        if t == 'color' and s.get('default') and not re.match(r'^#[0-9A-Fa-f]{6}$', s['default']):
            problems.append(f"{where}.{sid}: culoare invalidă")
        if 'label' not in s and t not in ('header', 'paragraph'): problems.append(f"{where}.{sid}: fără label")
for p in sorted(glob.glob(os.path.join(root, 'sections', '*.liquid'))):
    t = open(p, encoding='utf-8').read()
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema', t, re.S)
    if not m: continue
    name = os.path.basename(p)
    try: sc = json.loads(m.group(1))
    except Exception as e: problems.append(f"{name}: JSON invalid {e}"); continue
    if len(sc.get('name', '')) > 25: problems.append(f"{name}: nume secțiune prea lung ({len(sc['name'])})")
    check_settings(name, sc.get('settings'))
    types = [b['type'] for b in sc.get('blocks', [])]
    if len(types) != len(set(types)): problems.append(f"{name}: tipuri de bloc duplicate")
    for b in sc.get('blocks', []):
        if b['type'].startswith('@'): continue
        if len(b.get('name', '')) > 25: problems.append(f"{name}/{b['type']}: nume bloc prea lung")
        check_settings(f"{name}/{b['type']}", b.get('settings'))
    for pr in sc.get('presets', []):
        if len(pr.get('name', '')) > 25: problems.append(f"{name}: nume preset prea lung")
        for b in pr.get('blocks', []):
            if b['type'] not in types and not b['type'].startswith('@'): problems.append(f"{name}: preset cu tip de bloc inexistent {b['type']}")
            bdef = next((x for x in sc.get('blocks', []) if x['type'] == b['type']), {})
            valid = {s['id'] for s in bdef.get('settings', []) if 'id' in s}
            for k in (b.get('settings') or {}):
                if k not in valid: problems.append(f"{name}: preset setează {k} inexistent în {b['type']}")
gs = json.load(open(os.path.join(root, 'config/settings_schema.json'), encoding='utf-8'))
for g in gs[1:]:
    check_settings('settings_schema/' + g['name'], g.get('settings'))
print('\n'.join(problems) if problems else 'Scheme valide')
print(len(problems), 'probleme')
