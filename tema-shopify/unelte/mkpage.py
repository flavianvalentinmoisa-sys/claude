# Generează o pagină de test pentru simulator cu presetările secțiunilor date
import json, re, sys, os
theme, out, names = sys.argv[1], sys.argv[2], sys.argv[3:]
sections, order = {}, []
for n in names:
    t = open(os.path.join(theme, 'sections', n + '.liquid'), encoding='utf-8').read()
    m = re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema', t, re.S)
    sc = json.loads(m.group(1))
    pr = (sc.get('presets') or [{}])[0]
    blocks, bo = {}, []
    for i, b in enumerate(pr.get('blocks', [])):
        bid = f"{n}-b{i}"; blocks[bid] = {"type": b["type"], "settings": b.get("settings", {})}; bo.append(bid)
    sid = n.replace('-', '_')
    sections[sid] = {"type": n, "settings": pr.get("settings", {}), "blocks": blocks, "block_order": bo}
    order.append(sid)
json.dump({"sections": sections, "order": order}, open(out, 'w'), ensure_ascii=False, indent=1)
print('pagina', out, len(order), 'secțiuni')
