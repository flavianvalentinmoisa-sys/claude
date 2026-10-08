# TikTok Burner — research automat de produse

Un cont TikTok „burner” antrenat să-ți arate doar produse. Scriptul face scroll pe For You ca un cumpărător,
caută pe cuvinte cheie și hashtag-uri, citește comentariile („link?”, „where to buy”), iar Claude
punctează fiecare produs după 4 criterii:

| Criteriu | Cum e măsurat |
|---|---|
| **Rezolvă o problemă reală** | Claude, scor 1-10 |
| **Wow factor în reclamă** | Claude (din copertă + descriere) + rata de share-uri |
| **Valoare percepută mare** | Claude, scor 1-10 + rata de save-uri |
| **COGS între $5 și $20** | Claude estimează costul AliExpress; filtru strict + markup minim 2.5x |

Apoi fiecare produs WINNER/TEST e verificat automat în **TikTok Ad Library** și **Meta Ad Library**:
câte reclame active are, de câte zile rulează cea mai veche, câți advertiseri și de câte ori e
duplicată aceeași reclamă (semn că cineva scalează). Dacă o reclamă rulează de 30+ zile, înseamnă că
aduce profit, altfel ar fi fost oprită. Scorul „Ads” (0-10) intră în scorul final cu 20%, iar peste 3000 de
reclame Meta active produsul e marcat „posibil saturat”.

La final primești `data/reports/AAAA-LL-ZZ.html` (carduri cu verdict WINNER / TEST, link TikTok + link
AliExpress, idee de hook) și un `.csv` pentru Notion/Sheets.

## Instalare (pe PC-ul tău, nu pe server)

TikTok blochează IP-urile de datacenter, așa că rulează pe calculatorul tău, de pe IP-ul de acasă.

```bash
cd research/tiktok-burner
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
export ANTHROPIC_API_KEY=sk-ant-...                     # Windows: set ANTHROPIC_API_KEY=...
```

## Pași

1. **Creează contul burner**: email nou, fără numele tău, țara = piața pe care vânezi (ex. SUA/UK).
2. **Login o singură dată**: `python burner.py login` → te loghezi în fereastra care se deschide → Enter.
   Sesiunea rămâne în `./profile`.
3. **Antrenament 3-5 zile**: `python burner.py train --minutes 20` o dată-de două ori pe zi.
   Scriptul sare repede peste clipurile fără produs și se uită până la capăt, dă like și save la cele cu produs,
   iar algoritmul începe să-ți servească doar produse.
4. **Research zilnic**: `python burner.py run` → FYP + search + hashtag-uri + comentarii + analiză +
   verificare Ad Library + raport.

Alte comenzi: `python burner.py analyze` (doar analiza), `python burner.py validate` (doar Ad Library),
`python burner.py report --all` (include și SKIP).

## Personalizare — `config.json`

- `search_keywords`, `hashtags` — nișele tale (poți pune și cuvinte în germană, suedeză etc.).
- `criteria.cogs_min_usd` / `cogs_max_usd` / `min_markup` — filtrul de cost.
- `prefilter` — praguri minime înainte să plătești analiza cu Claude (views, vechime, rată share/save).
- `analyze_top_n` — câți candidați analizează Claude pe rulare (~40 ≈ câțiva cenți până la ~1$).
- `ad_library` — `meta_country` (`ALL`, `US`, `DE`, `RO`…), `tiktok_days` (cât de departe în urmă caută),
  `saturated_meta_ads` (pragul de saturație), `recheck_days` (la câte zile reverifică un produs), `enabled`.
- `claude.model` — implicit `claude-opus-5-5`.

## Rulare automată zilnică

- **Windows**: Task Scheduler → Action: `C:\...\.venv\Scripts\python.exe burner.py run`, Start in: folderul proiectului.
- **macOS/Linux**: `crontab -e` → `30 9 * * * cd /cale/research/tiktok-burner && .venv/bin/python burner.py run`

Lasă PC-ul pornit și nelogat de pe alt cont; fereastra browserului se deschide singură.

## Cum funcționează

- `collector.py` — Chromium real cu profil salvat; datele vin din răspunsurile JSON ale TikTok (views,
  share, save, reclamă plătită, link TikTok Shop), nu din HTML, deci se strică mai rar.
  Dacă apare captcha, scriptul se oprește și te așteaptă să-l rezolvi.
- `signals.py` — prefiltru ieftin + scor de viralitate (share = wow, save + „link?” = intenție de cumpărare).
- `analyze.py` — Claude primește coperta + cifrele + comentariile și returnează JSON structurat.
- `adlibrary.py` — caută cuvântul cheie dat de Claude (`ad_search_keyword`) în ambele biblioteci de reclame.
  La TikTok citește datele JSON ale paginii, la Meta citește textul paginii („~1.2K results”,
  „Started running on…”, „12 ads use this creative”).
- `report.py` — raport HTML + CSV. `data/burner.db` ține minte tot, deci nu analizează de două ori același clip.

## Limite de știut

- Automatizarea scroll-ului e împotriva termenilor TikTok: folosește **doar** contul burner, ritm uman
  (deja setat în `human_pacing`), maxim 1-2 rulări pe zi.
- COGS-ul e o **estimare** a lui Claude — verifică prețul real pe linkul AliExpress din raport înainte să comanzi.
- TikTok Ad Library arată doar reclame difuzate în UE (Europa + UK), deci pentru SUA contează mai mult Meta.
- Numărul de reclame depinde de cuvântul cheie: dacă un produs pare să aibă 0 reclame, verifică manual
  cu linkurile „Meta Ads” / „TikTok Ads” din raport, poate are alt nume în reclame.
- Dacă TikTok schimbă interfața, like/save din antrenament pot înceta să meargă; colectarea datelor continuă.
