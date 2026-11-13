# Caiet

Aplicație personală de notițe în Markdown, inspirată de Obsidian. Rulează în browser, nu are nevoie de server propriu sau de cont, și nu trimite nimic pe internet.

## Pornire

```bash
./serve.sh
```

Apoi deschide <http://localhost:8080> în **Chrome** sau **Edge**. Poți instala aplicația din bara de adrese („Instalează aplicația”) ca să se deschidă într-o fereastră proprie și să meargă offline.

> Merge și cu dublu-clic pe `index.html`, dar așa nu ai mod offline / instalare.

## Unde stau notele

Din butonul ⚙ (stânga jos):

- **Dosar de pe disc**: alegi un dosar, iar notele sunt fișiere `.md` obișnuite. Poți deschide și un seif Obsidian existent (folderele ascunse, cum ar fi `.obsidian`, sunt ignorate). Merge doar în Chrome/Edge.
- **Stocare în browser** (implicit): notele stau în IndexedDB. Fă din când în când **Exportă (.json)** ca backup.

## Funcții

| | |
|---|---|
| Legături | `[[Notă]]`, `[[Notă\|alias]]`, `[[Notă#Titlu]]`, cu autocompletare la `[[` |
| Încorporare | `![[Notă]]`, `![[Notă#Secțiune]]`, `![[imagine.png]]` |
| Legături înapoi | panoul din dreapta, plus mențiuni fără legătură (le legi cu un clic) |
| Redenumire | legăturile din toate notele se actualizează automat (inclusiv la mutarea dosarelor) |
| Graf | `Ctrl+G`: global sau local, cu etichete, drag, zoom |
| Etichete | `#etichetă`, `#proiect/subetichetă`, `tags:` în front matter |
| Căutare | `Ctrl+Shift+F`, cu `tag:#x`, `path:dosar`, `"frază"`, `-exclus` |
| Deschidere rapidă / comenzi | `Ctrl+O` / `Ctrl+P` |
| Nota zilei | `Alt+D` (folosește șablonul `Șabloane/Zilnic` dacă există) |
| Șabloane | comanda „Inserează șablon…”, cu `{{date}}`, `{{time}}`, `{{title}}` |
| Markdown | GFM: tabele, sarcini bifabile, `==evidențiere==`, callout-uri `> [!tip]`, comentarii `%% %%`, front matter |
| Imagini | lipești sau tragi o imagine în editor și se salvează în `atașamente/` |
| Altele | previzualizare la hover (`Ctrl` + mouse), istoric înapoi/înainte, temă deschisă/închisă, drag & drop în arbore, aspect pentru mobil |

## Structură

```
index.html          interfața
style.css           temă și aspect
app.js              toată logica (seif, index de legături, editor, graf, căutare)
sw.js               cache offline
vendor/marked.min.js  parser Markdown (MIT)
```
