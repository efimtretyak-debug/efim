"""Сборка сайта на трёх языках.  Запуск из корня репозитория:  python3 tools/build.py
Тексты — в tools/content.py, политика конфиденциальности — в tools/privacy_ru.html."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from content import T

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANGS = ["ru", "kk", "de"]
RU_ONLY = {"privacy.html", "404.html"}
SITE = "https://efimtretyak-debug.github.io/efim/"   # поменяйте на https://efimfarmtechnologies.kz/ после переезда домена
WA = "https://wa.me/77775440651"
PHONE, PHONE_TXT, EMAIL = "+77775440651", "+7 777 544 06 51", "efim@efimfarmtechnologies.kz"
MAP = "https://maps.google.com/maps?q=%D0%A2%D0%BE%D0%B1%D1%8B%D0%BB%2C%20%D0%A2%D3%99%D1%83%D0%B5%D0%BB%D1%81%D1%96%D0%B7%D0%B4%D1%96%D0%BA%2069%2F1"

SOC = [
 ("Facebook", "https://www.facebook.com/share/1Csv8hzAcr/", '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8z"/>'),
 ("YouTube", "https://youtube.com/@agralfarm4406", '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>'),
 ("Instagram", "https://www.instagram.com/agral_farm", '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'),
 ("TikTok", "https://www.tiktok.com/@timka2406", '<path d="M14 3v11a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.5 3 2.5 5 5.5 5"/>'),
 ("WhatsApp", WA, '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>'),
]
WA_ICON = SOC[-1][2]
TG_ICON = '<path d="M21 4L3 11l6 2 2 6 3-4 5 4z"/><path d="M9 13l8-6"/>'
ICONS = [
 '<path d="M3 21V8M9 21V8M15 21V8M21 21V8M2 8h20M2 14h20"/>',
 '<rect x="3" y="6" width="18" height="14" rx="1"/><path d="M3 11h18M8 6v14M16 6v14"/>',
 '<path d="M3 18h18"/><path d="M6 18l3-8h6l3 8"/><path d="M12 10V4"/>',
 '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M12 4v16M3 12h18"/>',
 '<path d="M5 21V5h14v16"/><path d="M5 9h14M9 5v16M15 5v16"/><path d="M3 21h18"/>',
 '<path d="M2 12l10-8 10 8"/><path d="M5 10v10h14V10"/><path d="M9 7l3-2.4L15 7"/>',
 '<path d="M4 4v16M20 4v16M4 8h16M4 16h16"/><path d="M9 8l2 8M15 8l-2 8"/>',
 '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
]
# имя, логотип, ссылка на страницу бренда
BRANDS = [("Faresin", None, "faresin.html"), ("Dairymaster", None, None), ("Kraiburg", "brand-kraiburg.jpg", None),
          ("Eisele", "brand-eisele.png", "eisele.html"), ("Dinamica Generale", "brand-dinamica.png", None),
          ("Urban", "brand-urban.jpg", "urban.html"), ("MWS", "brand-mws.png", None)]
STRIP = ["work-welding.jpg", "work-grinding.jpg", "work-press.jpg", "work-laser.jpg", "work-warehouse.jpg", "work-assembly.jpg"]
GALLERY = ["work-cnc.jpg", "work-welding.jpg", "work-grinding.jpg", "work-press.jpg", "work-laser.jpg", "work-warehouse.jpg", "work-assembly.jpg", "logistics-forklift.jpg", "work-office.jpg"]
BRAND_PAGES = {
 "faresin": dict(name="Faresin", official="https://www.faresin.com/ru/", contain=False,
    imgs=["faresin-leader.jpg", "faresin-trailed.jpg", "faresin-sheep.jpg", "faresin-stationary-1.jpg", "faresin-stationary-2.jpg", "faresin-stationary-3.jpg"]),
 "eisele": dict(name="Eisele", official=None, contain=False,
    imgs=["eisele-submersible.jpg", "eisele-vertical.jpg", "eisele-cutaway.jpg", "eisele-mixer.jpg", "eisele-lagoon.jpg", "eisele-pump-1.jpg"]),
 "urban": dict(name="Urban", official=None, contain=True, imgs=["urban-alma-pro.jpg", "urban-mobile.jpg", "brand-urban.jpg"]),
}


def svg(p, w=2):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{p}</svg>'


class Page:
    def __init__(self, lang, fname):
        self.lang, self.fname, self.t = lang, fname, T[lang]
        self.up = "" if lang == "ru" else "../"          # путь к корню сайта

    def a(self, path):          # ссылка на общий файл (картинки, стили, политика)
        return self.up + path

    def img(self, src, alt, lazy=True, cls="", w=None, h=None):
        c = f' class="{cls}"' if cls else ""
        s = f' width="{w}" height="{h}"' if w else ""
        return f'<img src="{self.a("assets/img/" + src)}" alt="{alt}"{c}{s}{" loading=lazy" if lazy else ""} decoding="async">'

    def lang_url(self, lang, fname=None):   # адрес этой же страницы на другом языке
        f = fname or self.fname
        if f in RU_ONLY and lang != "ru":
            f = "index.html"
        return self.up + ("" if lang == "ru" else lang + "/") + f

    def head(self, title, desc, cur=""):
        t = self.t
        links = ["index.html#production", "index.html#brands", "about.html", "index.html#contact"]
        nav = "".join(f'<li><a href="{h}"{" aria-current=page" if h == cur else ""}>{n}</a></li>' for h, n in zip(links, t["nav"]))
        sw = "".join(f'<a href="{self.lang_url(l)}" hreflang="{T[l]["html_lang"]}" lang="{T[l]["html_lang"]}"{" aria-current=true" if l == self.lang else ""}>{T[l]["lang_name"]}</a>' for l in LANGS)
        alt = "" if self.fname in RU_ONLY else "".join(f'<link rel="alternate" hreflang="{T[l]["html_lang"]}" href="{SITE}{"" if l == "ru" else l + "/"}{self.fname}">\n' for l in LANGS)
        if alt:
            alt += f'<link rel="alternate" hreflang="x-default" href="{SITE}{self.fname}">\n'
        return f'''<!doctype html>
<html lang="{t["html_lang"]}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:locale" content="{t["og_locale"]}">
<meta property="og:image" content="{SITE}assets/img/work-cnc.jpg">
<meta name="theme-color" content="#163A27">
<link rel="canonical" href="{SITE}{"" if self.lang == "ru" else self.lang + "/"}{self.fname}">
{alt}
<link rel="icon" href="{self.a("assets/img/favicon.png")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700&family=Unbounded:wght@600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{self.a("assets/style.css")}">
</head>
<body>
<a class="skip" href="#main">{t["skip"]}</a>
<header class="top">
<div class="wrap bar">
<a class="logo" href="index.html"><img src="{self.a("assets/img/logo.png")}" alt="" width="46" height="46"><span><b>EFIM</b><small>{t["tagline"]}</small></span></a>
<button class="tog" aria-expanded="false" aria-controls="nav">{t["menu"]}</button>
<nav class="nav" id="nav" aria-label="{t["menu"]}"><ul>{nav}</ul></nav>
<div class="langs" role="group" aria-label="Язык / Тіл / Sprache">{sw}</div>
<a class="btn sm hdr-cta" href="index.html#contact">{t["cta_short"]}</a>
</div>
</header>
<main id="main">
'''

    def foot(self):
        t = self.t
        soc = "".join(f'<a href="{u}" target="_blank" rel="noopener" aria-label="{n}">{svg(p)}</a>' for n, u, p in SOC)
        nav_links = ["index.html", "about.html", "index.html#production", "index.html#brands", "index.html#contact"]
        eq_links = ["index.html#brands", "faresin.html", "eisele.html", "index.html#brands", "index.html#departments", "urban.html"]
        nav = "".join(f'<li><a href="{h}">{n}</a></li>' for h, n in zip(nav_links, t["f_nav_items"]))
        eq = "".join(f'<li><a href="{h}">{n}</a></li>' for h, n in zip(eq_links, t["f_eq_items"]))
        return f'''</main>
<footer class="foot">
<div class="wrap">
<div class="fgrid">
<div>
<a class="logo" href="index.html"><img src="{self.a("assets/img/logo.png")}" alt="" width="46" height="46"><span><b>EFIM</b><small>{t["tagline"]}</small></span></a>
<p style="margin-top:16px">{t["foot_about"]}</p>
<div class="social">{soc}</div>
</div>
<div><h4>{t["f_nav"]}</h4><ul>{nav}</ul></div>
<div><h4>{t["f_eq"]}</h4><ul>{eq}</ul></div>
<div><h4>{t["f_cl"]}</h4><ul>
<li><a href="index.html#contact">{t["f_cl_quote"]}</a></li>
<li><a href="tel:{PHONE}">{PHONE_TXT}</a></li>
<li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
<li><a href="{self.a("privacy.html")}">{t["f_privacy"]}</a></li></ul></div>
</div>
<div class="copy"><span>© <span id="year">2026</span> Efim Farm Technologies</span><span>{t["address"]} · {t["country"]}</span></div>
</div>
</footer>
<a class="wa-float" href="{WA}" target="_blank" rel="noopener" aria-label="{t["wa_float"]}">{svg(WA_ICON)}</a>
<script src="{self.a("assets/main.js")}"></script>
</body>
</html>
'''

    def cta(self, h=None, p=None):
        t = self.t
        return f'''<section class="sec"><div class="wrap"><div class="cta"><div><h2>{h or t["cta_h"]}</h2><p>{p or t["cta_p"]}</p></div>
<a class="btn" href="index.html#contact">{t["cta_btn"]}</a></div></div></section>
'''

    def stats(self):
        return "".join(f'<div class="stat"><b>{a}</b><span>{b}</span></div>' for a, b in self.t["stats"])


def home(P):
    t = P.t
    prods = "".join(f'<article class="prod"><div class="ic">{svg(ICONS[i], 1.8)}</div><h3>{n}</h3><p>{d}</p><a href="#contact">{t["price_link"]}</a></article>'
                    for i, (n, d) in enumerate(t["products"]))
    brands = ""
    for (name, logo, link), (kind, text) in zip(BRANDS, t["brands"]):
        lg = f'<div class="lg">{P.img(logo, name)}</div>' if logo else f'<div class="lg txt">{name.upper()}</div>'
        more = f'<a class="more" href="{link}">{t["more"]}</a>' if link else f'<a class="more" href="#contact">{t["ask_offer"]}</a>'
        brands += f'<article class="brand">{lg}<div><small>{kind}</small><h3>{name}</h3><p>{text}</p>{more}</div></article>'
    depts = "".join(f'<div class="dept"><b>0{n + 1}</b><h3>{a}</h3><p>{b}</p></div>' for n, (a, b) in enumerate(t["depts"]))
    strip = "".join(P.img(s, a) for s, a in zip(STRIP, t["strip_alts"]))
    checks = "".join(f"<li>{c}</li>" for c in t["ab_checks"])
    ha = t["hero_alts"]
    return P.head(t["home_title"], t["home_desc"]) + f'''
<section class="hero"><div class="wrap hero-grid">
<div>
<span class="kicker">{t["kicker"]}</span>
<h1>{t["h1"]}</h1>
<p class="lead">{t["lead"]}</p>
<div class="acts"><a class="btn" href="#contact">{t["btn_quote"]}</a><a class="btn ghost" href="about.html">{t["btn_about"]}</a></div>
{P.img("made-in-kz.jpg", t["made_in_kz"], lazy=False, cls="badge-kz", w=170, h=38)}
</div>
<div class="collage">
{P.img("work-cnc.jpg", ha[0], lazy=False)}
{P.img("work-welding.jpg", ha[1], lazy=False)}
{P.img("faresin-sheep.jpg", ha[2], lazy=False)}
</div>
</div>
</section>
<div class="wrap"><div class="stats">{P.stats()}</div></div>

<section class="sec" id="production"><div class="wrap">
<div class="head"><div><span class="eyebrow">{t["prod_eyebrow"]}</span><h2>{t["prod_h2"]}</h2><p>{t["prod_p"]}</p></div></div>
<div class="products">{prods}</div>
<div class="strip">{strip}</div>
</div></section>

<section class="sec alt" id="brands"><div class="wrap">
<div class="head"><div><span class="eyebrow">{t["brands_eyebrow"]}</span><h2>{t["brands_h2"]}</h2><p>{t["brands_p"]}</p></div></div>
<div class="brands">{brands}</div>
</div></section>

<section class="sec dark" id="departments"><div class="wrap">
<div class="head"><div><span class="eyebrow">{t["dept_eyebrow"]}</span><h2>{t["dept_h2"]}</h2><p>{t["dept_p"]}</p></div></div>
<div class="depts">{depts}</div>
</div></section>

<section class="sec"><div class="wrap split">
{P.img("work-office.jpg", t["ab_img_alt"])}
<div><span class="eyebrow">{t["ab_eyebrow"]}</span><h2>{t["ab_h2"]}</h2>
<ul class="checks">{checks}</ul>
<a class="btn" href="about.html">{t["ab_btn"]}</a></div>
</div></section>

<section class="sec alt" id="contact"><div class="wrap contact">
<div><span class="eyebrow">{t["ct_eyebrow"]}</span><h2>{t["ct_h2"]}</h2>
<p style="color:var(--muted)">{t["ct_p"]}</p>
<div class="cards">
<a class="ccard" href="tel:{PHONE}"><span class="ic">{svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>')}</span><span><span>{t["ct_phone"]}</span><b>{PHONE_TXT}</b></span></a>
<a class="ccard" href="mailto:{EMAIL}"><span class="ic">{svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>')}</span><span><span>{t["ct_email"]}</span><b>{EMAIL}</b></span></a>
<a class="ccard" href="{MAP}" target="_blank" rel="noopener"><span class="ic">{svg('<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>')}</span><span><span>{t["ct_addr"]}</span><b>{t["address"]}</b></span></a>
</div></div>
<div class="panel"><h3>{t["form_h"]}</h3>
<form id="lead" novalidate>
<div class="f"><label for="n">{t["f_name"]}</label><input id="n" name="name" required maxlength="100" autocomplete="name"></div>
<div class="f"><label for="p">{t["f_phone"]}</label><input id="p" name="phone" type="tel" required maxlength="40" autocomplete="tel" placeholder="+7"></div>
<div class="f"><label for="q">{t["f_need"]}</label><input id="q" name="need" maxlength="300" placeholder="{t["f_need_ph"]}"></div>
<div class="f"><label for="m">{t["f_comment"]}</label><textarea id="m" name="comment" maxlength="2000"></textarea></div>
<div class="hp" aria-hidden="true"><label for="w">Website</label><input id="w" name="website" tabindex="-1" autocomplete="off"></div>
<button class="btn" type="submit">{svg(TG_ICON)} {t["f_send"]}</button>
<a class="btn ghost wa-btn" href="{WA}" target="_blank" rel="noopener">{svg(WA_ICON)} {t["f_wa"]}</a>
<p class="status" role="status" aria-live="polite"></p>
<p class="note">{t["f_note"].format(privacy=P.a("privacy.html"))}</p>
</form></div>
</div></section>
''' + P.foot()


def about(P):
    t = P.t
    body = "".join((f"<h2>{h}</h2>" if h else "") + f"<p>{p}</p>" for h, p in t["about_body"])
    gal = "".join(P.img(s, a) for s, a in zip(GALLERY, t["gal_alts"]))
    return P.head(t["about_title"], t["about_desc"], "about.html") + f'''
<section class="phero"><div class="wrap">
<div class="crumbs"><a href="index.html">{t["home"]}</a> / {t["nav"][2]}</div>
<h1>{t["about_h1"]}</h1>
<p>{t["about_lead"]}</p>
</div></section>
<div class="wrap"><div class="stats">{P.stats()}</div></div>
<section class="sec"><div class="wrap prose">{body}</div></section>
<section class="sec alt"><div class="wrap">
<div class="head"><div><span class="eyebrow">{t["about_gal_eyebrow"]}</span><h2>{t["about_gal_h2"]}</h2></div></div>
<div class="gallery">{gal}</div>
</div></section>
''' + P.cta() + P.foot()


def brand(P, key):
    t, b, c = P.t, BRAND_PAGES[key], P.t[key]
    chips = "".join(f'<span class="chip">{x}</span>' for x in c["chips"])
    body = "".join(f"<p>{x}</p>" for x in c["body"])
    off = f'<p style="margin-top:20px"><a class="btn ghost" href="{b["official"]}" target="_blank" rel="noopener">{t["official"]}</a></p>' if b["official"] else ""
    gal = "".join(P.img(s, a) for s, a in zip(b["imgs"], c["alts"]))
    return P.head(c["title"], c["desc"]) + f'''
<section class="phero"><div class="wrap">
<div class="crumbs"><a href="index.html">{t["home"]}</a> / <a href="index.html#brands">{t["brands_crumb"]}</a> / {b["name"]}</div>
<h1>{c["h1"]}</h1><p>{c["lead"]}</p>
<div class="chips">{chips}</div>
</div></section>
<section class="sec"><div class="wrap prose">{body}{off}</div></section>
<section class="sec alt"><div class="wrap"><div class="gallery{" contain" if b["contain"] else ""}">{gal}</div></div></section>
''' + P.cta(t["brand_cta_h"].format(b=b["name"]), t["brand_cta_p"]) + P.foot()


def privacy(P):
    src = open(os.path.join(os.path.dirname(__file__), "privacy_ru.html"), encoding="utf-8").read()
    return P.head("Политика конфиденциальности EFIM · Команда", "Политика конфиденциальности мобильного приложения «EFIM · Команда».") + f'''
<section class="phero"><div class="wrap">
<div class="crumbs"><a href="index.html">Главная</a> / Политика конфиденциальности</div>
<h1>Политика конфиденциальности приложения «EFIM · Команда»</h1><p>Дата обновления: 25 октября 2026 года.</p>
</div></section>
<section class="sec"><div class="wrap prose">{src}</div></section>
''' + P.foot()


def notfound(P):
    t = P.t
    return P.head(t["nf_title"] + " — EFIM Farm Technologies", t["nf_title"]) + f'''
<section class="phero"><div class="wrap"><h1>{t["nf_title"]}</h1><p>{t["nf_p"]}</p>
<p style="margin-top:24px"><a class="btn" href="index.html">{t["nf_btn"]}</a></p></div></section>
''' + P.foot()


def write(lang, fname, html):
    d = ROOT if lang == "ru" else os.path.join(ROOT, lang)
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, fname), "w", encoding="utf-8") as f:
        f.write(html)


for lang in LANGS:
    write(lang, "index.html", home(Page(lang, "index.html")))
    write(lang, "about.html", about(Page(lang, "about.html")))
    for k in BRAND_PAGES:
        write(lang, k + ".html", brand(Page(lang, k + ".html"), k))
# только по-русски
P = Page("ru", "privacy.html")
write("ru", "privacy.html", privacy(P))
write("ru", "404.html", notfound(Page("ru", "404.html")))
print("Готово:", ", ".join(LANGS))
