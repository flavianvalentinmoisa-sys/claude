import json,re,sys,os
root=sys.argv[1]
def schema(p):
    t=open(p,encoding='utf-8').read()
    m=re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema',t,re.S)
    if not m: return None
    try: return json.loads(m.group(1))
    except Exception as e: return {'_err':str(e)}
en=json.load(open(os.path.join(root,'locales/en.default.schema.json'),encoding='utf-8'))
def tr(s):
    if isinstance(s,str) and s.startswith('t:'):
        cur=en
        for k in s[2:].split('.'):
            cur=cur.get(k,{}) if isinstance(cur,dict) else {}
        return cur if isinstance(cur,str) else s
    return s
def sets(lst):
    out=[]
    for x in lst or []:
        if x.get('type') in ('header',):
            out.append('## '+str(tr(x.get('content'))))
        elif x.get('type')=='paragraph': continue
        else: out.append(f"{x.get('id')}[{x['type']}]: {tr(x.get('label'))}")
    return out
mode=sys.argv[2]
if mode=='global':
    for g in json.load(open(os.path.join(root,'config/settings_schema.json'))):
        print('### '+str(tr(g.get('name'))))
        for s in sets(g.get('settings')): print('  '+s)
else:
    for f in sorted(os.listdir(os.path.join(root,'sections'))):
        if not f.endswith('.liquid'): continue
        sc=schema(os.path.join(root,'sections',f))
        if not sc: print('# '+f+' (no schema)'); continue
        print(f"# {f} — {tr(sc.get('name'))}  settings={len(sc.get('settings',[]))}")
        if mode=='full':
            for s in sets(sc.get('settings')): print('    '+s)
        for b in sc.get('blocks',[]):
            print(f"   - block {b.get('type')}: {tr(b.get('name'))} ({len(b.get('settings',[]))} setări)" + (f" limit={b['limit']}" if 'limit' in b else ''))
            if mode=='full':
                for s in sets(b.get('settings')): print('        '+s)
