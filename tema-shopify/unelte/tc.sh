#!/bin/bash
# Rulează Theme Check și afișează un rezumat compact (fișier, severitate, regulă, mesaj, linie)
cd /home/user/claude/carpatica
SHOPIFY_CLI_NO_ANALYTICS=1 timeout 300 /tmp/claude-0/-home-user-claude/c8e6a913-f77b-5f9f-93a2-3ff084acd4e6/scratchpad/cli/node_modules/.bin/shopify theme check --output json 2>/dev/null > /tmp/claude-0/-home-user-claude/c8e6a913-f77b-5f9f-93a2-3ff084acd4e6/scratchpad/tc.json
python3 -I - <<'PY'
import json
d=json.load(open('/tmp/claude-0/-home-user-claude/c8e6a913-f77b-5f9f-93a2-3ff084acd4e6/scratchpad/tc.json'))
n=0
for f in d:
    for o in f['offenses']:
        sev={0:'ERR',1:'WARN',2:'INFO'}.get(o['severity'],o['severity'])
        if o['check'] in ('OrphanedSnippet',) : continue
        n+=1
        print(f"{sev} {f['path'].split('carpatica/')[-1]}:{o['start_row']+1} {o['check']}: {o['message'][:200]}")
print('total', n)
PY
