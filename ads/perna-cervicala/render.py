#!/usr/bin/env python3
"""Monteaza reclama 9:16: b-roll + voiceover + subtitrari arse + banner COD.

Utilizare:
  python3 render.py --vo vo.mp3 --clips c1.mp4 c2.mp4 c3.mp4 c4.mp4 --out final.mp4

Fiecare clip acopera o propozitie din voiceover (in ordine). Granitele
propozitiilor se detecteaza din pauzele vocii; daca nu se gasesc, se impart
proportional cu lungimea textului.
"""
import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

SENTENCES = [
    "Te trezești în fiecare dimineață cu gâtul înțepenit?",
    "Perna greșită îți forțează coloana toată noaptea.",
    "Perna cervicală ergonomică îți susține gâtul în poziția corectă, "
    "ca să te trezești odihnit și fără dureri.",
    "Comandă acum și plătești la livrare!",
]
BANNER = "PLATA LA LIVRARE"
FONT = "DejaVu Sans"
FONT_FILE = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
W, H, FPS = 1080, 1920, 30
WORDS_PER_CHUNK = 3
TAIL = 0.6  # secunde de imagine dupa ce se termina vocea
SILENT_BOUNDS = [(0, 4), (4, 8), (8, 15), (15, 20)]  # timpii din script.md


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def duration(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "json", str(path)]).stdout
    return float(json.loads(out)["format"]["duration"])


def sentence_bounds(vo, total):
    """Intoarce [(start, end)] pentru fiecare propozitie."""
    log = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(vo), "-af",
         "silencedetect=noise=-35dB:d=0.2", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    # pauzele din interiorul vocii (nu cea de la inceput / sfarsit)
    gaps = [(s, e) for s, e in zip(starts, ends) if s > 0.3 and e < total - 0.3]
    n = len(SENTENCES)
    if len(gaps) >= n - 1:
        # pastram cele mai lungi n-1 pauze, in ordine cronologica
        gaps = sorted(sorted(gaps, key=lambda g: g[1] - g[0])[-(n - 1):])
        cuts = [(s + e) / 2 for s, e in gaps]
    else:
        lens = [len(s) for s in SENTENCES]
        acc, cuts = 0, []
        for ln in lens[:-1]:
            acc += ln
            cuts.append(total * acc / sum(lens))
    edges = [0.0] + cuts + [total]
    return list(zip(edges[:-1], edges[1:]))


def ass_time(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def build_ass(bounds, path):
    lines = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Sub,{FONT},84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,"
        "100,100,0,0,1,6,2,2,60,60,640,1",
        f"Style: Hot,{FONT},84,&H0000E5FF,&H0000E5FF,&H00000000,&H80000000,-1,0,0,0,"
        "100,100,0,0,1,6,2,2,60,60,640,1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    for (start, end), sentence in zip(bounds, SENTENCES):
        words = sentence.split()
        chunks = [" ".join(words[i:i + WORDS_PER_CHUNK])
                  for i in range(0, len(words), WORDS_PER_CHUNK)]
        weights = [len(c) for c in chunks]
        t = start
        for chunk, wgt in zip(chunks, weights):
            d = (end - start) * wgt / sum(weights)
            style = "Hot" if any(k in chunk.lower() for k in ("livrare", "gâtul", "cervicală")) else "Sub"
            lines.append(f"Dialogue: 0,{ass_time(t)},{ass_time(t + d)},{style},,0,0,0,,"
                         f"{{\\fad(60,0)}}{chunk.upper()}")
            t += d
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vo", help="voiceover; fara el se folosesc timpii din script, fara voce")
    ap.add_argument("--clips", nargs=len(SENTENCES), required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    if args.vo:
        vo_len = duration(args.vo)
        bounds = sentence_bounds(args.vo, vo_len)
        bounds[-1] = (bounds[-1][0], vo_len + TAIL)
    else:
        bounds = list(SILENT_BOUNDS)
    total = bounds[-1][1]

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        ass = tmp / "subs.ass"
        build_ass(bounds, ass)

        # Fiecare clip: crop 9:16, intins/taiat exact pe durata propozitiei.
        parts = []
        for i, (clip, (s, e)) in enumerate(zip(args.clips, bounds)):
            seg = e - s
            factor = max(seg / duration(clip), 1.0)  # incetinim doar daca e prea scurt
            part = tmp / f"p{i}.mp4"
            run(["ffmpeg", "-y", "-i", clip, "-an", "-vf",
                 f"setpts={factor:.4f}*PTS,scale={W}:{H}:force_original_aspect_ratio=increase,"
                 f"crop={W}:{H},fps={FPS},format=yuv420p",
                 "-t", f"{seg:.3f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                 str(part)])
            parts.append(part)

        concat = tmp / "list.txt"
        concat.write_text("".join(f"file '{p}'\n" for p in parts))
        broll = tmp / "broll.mp4"
        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
             "-c", "copy", str(broll)])

        cta_start = bounds[-1][0]
        vf = (
            f"ass={ass},"
            # banner COD sus, tot clipul
            f"drawbox=x=0:y=290:w=iw:h=130:color=0xE53935@0.92:t=fill,"
            f"drawtext=fontfile={FONT_FILE}:text='{BANNER}':fontcolor=white:fontsize=72:"
            f"x=(w-tw)/2:y=290+(130-th)/2,"
            # CTA mare la final
            f"drawtext=fontfile={FONT_FILE}:text='COMANDĂ ACUM':fontcolor=black:fontsize=96:"
            f"box=1:boxcolor=0xFFE500:boxborderw=30:x=(w-tw)/2:y=h*0.42:"
            f"enable='gte(t,{cta_start:.2f})'"
        )
        audio_in = (["-i", args.vo] if args.vo else
                    ["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo"])
        afilter = "loudnorm=I=-14:TP=-1.5:LRA=11,apad" if args.vo else "anull"
        run(["ffmpeg", "-y", "-i", str(broll), *audio_in,
             "-filter_complex",
             f"[0:v]{vf}[v];[1:a]{afilter}[a]",
             "-map", "[v]", "-map", "[a]", "-t", f"{total:.3f}",
             "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "19",
             "-pix_fmt", "yuv420p", "-r", str(FPS),
             "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
             "-movflags", "+faststart", "-map_metadata", "-1", args.out])
    print(f"OK {args.out} ({total:.1f}s)")
    for (s, e), txt in zip(bounds, SENTENCES):
        print(f"  {s:5.2f}-{e:5.2f}  {txt}")


if __name__ == "__main__":
    main()
