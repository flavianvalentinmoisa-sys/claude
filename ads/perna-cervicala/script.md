# Perna cervicală – reclamă 20s (9:16)

Produs: perna cervicală (PRODUCT RESEARCH #186, Validat)
Voce: Bella (Knight Media, eleven_v4_turbo)

| Timp     | Voiceover                                                                                   | B-roll                                              | Text pe ecran            |
|----------|---------------------------------------------------------------------------------------------|-----------------------------------------------------|--------------------------|
| 0–4s     | Te trezești în fiecare dimineață cu gâtul înțepenit?                                         | Femeie care se freacă la gâtul înțepenit, dimineața | subtitrare               |
| 4–8s     | Perna greșită îți forțează coloana toată noaptea.                                            | Bărbat care se zvârcolește pe o pernă plată          | subtitrare               |
| 8–15s    | Perna cervicală ergonomică îți susține gâtul în poziția corectă, ca să te trezești odihnit și fără dureri. | Close-up pernă memory foam apăsată cu mâna          | subtitrare               |
| 15–20s   | Comandă acum și plătești la livrare!                                                         | Femeie care se trezește odihnită și se întinde      | PLATA LA LIVRARE (banner) |

## Montaj

Clipurile b-roll (Knight Media, kling-v3, 5s, 9:16): `kv-9979c9ff`, `kv-3076b7dc`, `kv-8e2c71ad`, `kv-47ce2db2` (în ordinea scenelor).

```bash
python3 render.py --vo vo.mp3 --clips c1.mp4 c2.mp4 c3.mp4 c4.mp4 --out perna-cervicala-20s.mp4
```

Rezultat: MP4 1080×1920, 30fps, H.264 + AAC, audio normalizat la -14 LUFS, subtitrări arse, banner „PLATA LA LIVRARE”, CTA „COMANDĂ ACUM” pe ultima scenă.
