import json,re,glob,sys,os
from jsonschema import Draft7Validator
from referencing import Registry, Resource
base=sys.argv[1]; theme=sys.argv[2]
reg=Registry()
docs={}
for f in glob.glob(base+'/theme/*.json'):
    d=json.load(open(f)); docs[os.path.basename(f)]=d
    for uri in [os.path.basename(f), './'+os.path.basename(f), d.get('$id','x'+f)]:
        reg=reg.with_resource(uri, Resource.from_contents(d, default_specification=__import__('referencing.jsonschema').jsonschema.DRAFT7))
V=Draft7Validator(docs['section.json'], registry=reg)
n=0
for p in sorted(glob.glob(theme+'/sections/*.liquid')):
    s=open(p).read(); m=re.search(r'{%-?\s*schema\s*-?%}(.*?){%-?\s*endschema',s,re.S)
    if not m: continue
    for e in V.iter_errors(json.loads(m.group(1))):
        n+=1; print(os.path.basename(p), list(e.absolute_path), e.message[:200])
VS=Draft7Validator(docs['theme_settings.json'], registry=reg)
for e in VS.iter_errors(json.load(open(theme+'/config/settings_schema.json'))):
    n+=1; print('settings_schema', list(e.absolute_path), e.message[:200])
print('erori', n)
