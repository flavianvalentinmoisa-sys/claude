#!/usr/bin/env python3
"""Genereaza o muzica de fundal lenta si calma (pad + arpegiu de pian), fara drepturi de autor.

Utilizare: python3 music.py --out music.wav --seconds 20
"""
import argparse
import wave

import numpy as np

SR = 48000
# Cmaj7 - Am7 - Fmaj7 - G6, cate un acord pe scena (frecvente MIDI)
CHORDS = [[48, 55, 64, 71], [45, 52, 60, 67], [41, 48, 57, 64], [43, 50, 59, 64]]


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def lowpass(x, cutoff):
    a = np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = (1 - a) * v + a * acc
        y[i] = acc
    return y


def pad(chord, dur):
    t = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(t)
    for n in chord:
        for detune in (-0.12, 0.0, 0.12):  # cor usor
            out += np.sin(2 * np.pi * hz(n) * (1 + detune / 100) * t)
    env = np.minimum(1, t / 1.5) * np.minimum(1, (dur - t) / 1.5)
    return out * env / (len(chord) * 3)


def note(midi, dur):
    t = np.arange(int(dur * SR)) / SR
    f = hz(midi)
    tone = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)
            + 0.1 * np.sin(6 * np.pi * f * t))
    env = np.exp(-t * 2.2) * np.minimum(1, t / 0.01)
    return tone * env


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--seconds", type=float, default=20)
    args = ap.parse_args()

    total = int(args.seconds * SR)
    mix = np.zeros(total + SR * 3)
    seg = args.seconds / len(CHORDS)
    beat = seg / 6  # arpegiu rar: 6 note pe acord
    for ci, chord in enumerate(CHORDS):
        start = int(ci * seg * SR)
        p = pad(chord, seg + 1.0)
        mix[start:start + len(p)] += 0.55 * p
        pattern = [chord[1] + 12, chord[2] + 12, chord[3] + 12, chord[2] + 12, chord[1] + 12, chord[3]]
        for k, m in enumerate(pattern):
            s = start + int(k * beat * SR)
            n = note(m, 2.5)
            mix[s:s + len(n)] += 0.22 * n
    mix = lowpass(mix, 2500)[:total]
    fade = int(1.5 * SR)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix = mix / np.max(np.abs(mix)) * 0.8
    pcm = (np.stack([mix, mix], axis=1) * 32767).astype("<i2")
    with wave.open(args.out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    main()
