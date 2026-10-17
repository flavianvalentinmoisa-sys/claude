from schemalib import *
TIMER = [("none", "Fără timer"), ("evergreen", "Timer per vizitator (repornește)"), ("daily", "Până la miezul nopții"), ("fixed", "Până la o dată fixă")]
schema = {
  "name": "Bară de anunțuri",
  "max_blocks": 12,
  "class": "announcement-bar-section",
  "enabled_on": {"groups": ["header"]},
  "settings": [
    sel("mode", "Mod afișare", [("slider", "Slider (un anunț pe rând)"), ("marquee", "Bandă derulantă")], "slider"),
    chk("auto_rotate", "Rotește automat anunțurile", True),
    rng("change_slides_speed", "Schimbă la fiecare", 3, 10, 1, 5, "s"),
    chk("show_arrows", "Afișează săgețile", True),
    rng("marquee_speed", "Viteză bandă derulantă", 10, 80, 2, 30, "s", "Durata unei ture complete. Valori mai mici = mai rapid."),
    text("marquee_separator", "Separator bandă", "•"),
    hdr("Stil"),
    scheme(default="scheme-4"),
    rng("text_size", "Mărime text", 11, 18, 1, 13, "px"),
    chk("uppercase", "Majuscule", False),
    chk("show_line_separator", "Linie de separare", False),
    hdr("Utilitare"),
    par("Apar doar pe ecrane mari"),
    chk("show_social", "Iconițe rețele sociale", False, "[Gestionează conturile sociale](/editor?context=theme&category=social%20media)"),
    chk("enable_country_selector", "Selector țară/regiune", False, "[Gestionează țările/regiunile](/admin/settings/markets)"),
    chk("enable_language_selector", "Selector limbă", False, "[Gestionează limbile](/admin/settings/languages)"),
  ],
  "blocks": [
    block("announcement", "Anunț", [
      inline("text", "Text", "Livrare <strong>gratuită</strong> la comenzile peste 200 lei"),
      url("link", "Link"),
      *icon(default="truck"),
      hdr("Timer"),
      sel("timer_mode", "Tip timer", TIMER, "none"),
      rng("timer_minutes", "Durată timer per vizitator", 5, 240, 5, 30, "min"),
      text("timer_end", "Dată finală", info="Doar pentru „Până la o dată fixă”. Format: 2026-12-31T23:59"),
    ]),
    block("discount", "Cod de reducere", [
      inline("text", "Text", "Folosește codul pentru 10% reducere:"),
      text("code", "Cod", "BINE10"),
      text("copy_label", "Text după cod", "Click pentru copiere", "Lasă gol pentru a ascunde."),
      *icon(default="percent"),
    ]),
  ],
  "presets": [{"name": "Bară de anunțuri", "blocks": [{"type": "announcement"}]}],
}
write_schema(PATH + "/sections/announcement-bar.liquid", schema)
