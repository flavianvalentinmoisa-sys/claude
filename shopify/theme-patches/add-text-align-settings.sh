cat > /tmp/ta.json <<'JEOF'
[{"type":"header","content":"Aliniere text"},
{"type":"select","id":"text_align","label":"Aliniere text pe desktop","default":"default","options":[{"value":"default","label":"Implicit (ca acum)"},{"value":"left","label":"Stânga"},{"value":"center","label":"Centru"},{"value":"right","label":"Dreapta"}]},
{"type":"select","id":"text_align_mobile","label":"Aliniere text pe mobil","default":"same","options":[{"value":"same","label":"La fel ca pe desktop"},{"value":"default","label":"Implicit (ca acum)"},{"value":"left","label":"Stânga"},{"value":"center","label":"Centru"},{"value":"right","label":"Dreapta"}]}]
JEOF
for f in $(grep -l "render 'c-section-style'" sections/*.liquid)
do
  if grep -q '"id": "text_align"' "$f"
  then
    continue
  fi
  awk '/\{%-? *schema *-?%\}/{print; exit} {print}' "$f" > /tmp/pre.txt
  awk 'f && /\{%-? *endschema *-?%\}/{exit} f{print} /\{%-? *schema *-?%\}/{f=1}' "$f" > /tmp/schema.json
  awk 'f{print} /\{%-? *endschema *-?%\}/{f=1; print}' "$f" > /tmp/post.txt
  jq --slurpfile n /tmp/ta.json '(.settings | map(.id) | index("visibility")) as $i | .settings = .settings[:$i] + $n[0] + .settings[$i:]' /tmp/schema.json > /tmp/schema2.json && cat /tmp/pre.txt /tmp/schema2.json /tmp/post.txt > "$f" && echo "ok $f"
done
