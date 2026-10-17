import sys; sys.path.insert(0, sys.argv[2])
from patchlib import *; from schemalib import *
p = sys.argv[1] + '/sections/footer.liquid'
t, m, s = load(p)
s['blocks'] += [
  block("contact", "Date de contact", [
    inline("heading", "Titlu", "Contact"),
    text("phone", "Telefon", "0700 000 000"),
    text("email", "Email", "contact@magazin.ro"),
    inline("hours", "Program", "Luni – Vineri, 09:00 – 17:00"),
    inline("address", "Adresă"),
    inline("company", "Date firmă", info="Ex: SC Exemplu SRL, CUI RO12345678, Nr. Reg. Com. J40/1234/2024"),
  ]),
  block("featured_product", "Produs recomandat", [
    inline("heading", "Titlu", "Cel mai vândut"),
    product("product", "Produs"),
    text("button_label", "Text buton", "Vezi produsul", "Lasă gol pentru a ascunde."),
  ]),
  block("anpc", "Badge-uri ANPC (SAL / SOL)", [
    inline("heading", "Titlu"),
    par("Legislația din România cere afișarea pictogramei SAL (ANPC) pe site-urile care vând online, cu link către anpc.ro."),
    chk("show_sal", "Afișează SAL (ANPC)", True),
    image("sal_image", "Imagine SAL oficială (opțional)", "Poți încărca pictograma oficială descărcată de pe anpc.ro."),
    chk("show_sol", "Afișează SOL", False, "Platforma europeană SOL a fost închisă în iulie 2025. Activează doar dacă îți este cerut."),
    url("sol_link", "Link SOL"),
    image("sol_image", "Imagine SOL oficială (opțional)"),
  ], limit=1),
]
save(p, t, m, s)
print('ok')
