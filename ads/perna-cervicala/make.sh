#!/usr/bin/env bash
# Descarca b-roll-ul si vocea din Knight Media si monteaza reclama finala.
set -euo pipefail
cd "$(dirname "$0")"
BASE=https://knightvision.tech/static
mkdir -p media
curl -sSfL -o media/vo.mp3 "$BASE/generated_voiceovers/vo_3316_fed510db.mp3"
i=1
for id in kv-9979c9ff kv-3076b7dc kv-8e2c71ad kv-47ce2db2; do
  curl -sSfL -o "media/c$i.mp4" "$BASE/generated_videos/$id.mp4"
  i=$((i + 1))
done
python3 music.py --out media/music.wav --seconds 20
python3 render.py --vo media/vo.mp3 --music media/music.wav --clips media/c1.mp4 media/c2.mp4 media/c3.mp4 media/c4.mp4 \
  --out perna-cervicala-20s.mp4
