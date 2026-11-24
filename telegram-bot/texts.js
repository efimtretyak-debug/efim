// Тексты бота на трёх языках (перенесено из texts.py бота v4.3).
// Меняйте тексты здесь, затем загрузите воркер заново (см. README.md).

export const SITE = "https://efimtretyak-debug.github.io/efim/";
// Страницы сайта для кнопки «Открыть на сайте» (раньше — старый сайт на WordPress)
export const PAGES = { about: SITE + 'about.html', prod: SITE + 'index.html#production', proj: SITE };

// Картинки: приветствие и фото товаров. Ключ = ключ товара. Нет ключа — бот покажет только текст.
// Чтобы добавить фото: положите файл в assets/img/ на сайте и впишите сюда адрес.
export const PHOTOS = {
  welcome: "https://efimtretyak-debug.github.io/efim/assets/img/logo.png",
  faresin: "https://efimtretyak-debug.github.io/efim/assets/img/faresin-leader.jpg",
  eisele: "https://efimtretyak-debug.github.io/efim/assets/img/eisele-submersible.jpg",
  urban: "https://efimtretyak-debug.github.io/efim/assets/img/urban-alma-pro.jpg",
  kraiburg: "https://efimtretyak-debug.github.io/efim/assets/img/brand-kraiburg.jpg",
};

export const LANGS = {
  "ru": "🇷🇺 Русский",
  "kk": "🇰🇿 Қазақша",
  "de": "🇩🇪 Deutsch"
};

export const PICK_LANG = "🇷🇺 Выберите язык\n🇰🇿 Тілді таңдаңыз\n🇩🇪 Sprache wählen";

export const WHATSAPP = "https://wa.me/77775440651";

export const SOCIALS = {
  "Instagram": "https://www.instagram.com/agral_farm",
  "YouTube": "https://youtube.com/@agralfarm4406",
  "Facebook": "https://www.facebook.com/share/1Csv8hzAcr/",
  "TikTok": "https://www.tiktok.com/@timka2406"
};

export const MAP_QUERY = "тобыл тауелсыздык 69/1";

export const T = {
  "ru": {
    "menu": "👋 Добро пожаловать в <b>EFIM FARM TECHNOLOGIES</b>!\n\nМы реально производим. Производство и продажа оборудования для животноводства.\n\nВыберите раздел:",
    "b_catalog": "📦 Каталог",
    "b_about": "ℹ️ О компании",
    "b_prod": "🏭 Производство",
    "b_proj": "🏗 Проекты",
    "b_dept": "👥 Отделы",
    "b_contacts": "📞 Контакты",
    "b_quote": "📝 Запросить КП",
    "b_lang": "🌐 Язык",
    "b_back": "⬅️ Назад",
    "b_site": "🌐 Открыть на сайте",
    "b_wa": "💬 Написать в WhatsApp",
    "b_map": "📍 Мы на карте",
    "catalog": "📦 <b>Каталог</b>\n\nВыберите раздел:",
    "cat_own": "🏭 Наше производство",
    "cat_partners": "🤝 Официальные дилеры",
    "own_title": "🏭 <b>Продукция собственного производства</b>",
    "par_title": "🤝 <b>Мы официальные дилеры мировых производителей</b>",
    "ask_quote": "Хочу такое — запросить КП",
    "about": "<b>EFIM FARM TECHNOLOGIES</b> — мы реально производим.\n\nПроизводим и продаём оборудование для животноводства, а также являемся официальным дилером мировых брендов. Помогаем подобрать, поставить, смонтировать и обслужить оборудование для молочных и животноводческих ферм.",
    "prod": "🏭 <b>Наше производство</b>\n\nСтойловое оборудование, клетки для телят, скреперные системы, групповые боксы, ветеринарные станки, хэдлоки и групповые поилки с подогревом. Световентиляционный конёк делаем индивидуально под каждое здание.",
    "proj": "🏗 <b>Наши проекты</b>\n\nРеализованные проекты и фото смотрите на сайте.",
    "dept": "👥 <b>Отделы компании</b>\n\n💼 <b>Отдел продаж</b> — подбор и внедрение оборудования\n📦 <b>Отдел снабжения</b> — поставка оборудования, комплектующих и материалов\n🚚 <b>Отдел логистики</b> — доставка, сроки, маршруты\n🔧 <b>Сервисный отдел</b> — монтаж, обслуживание, поддержка\n\nСвязаться можно в WhatsApp или оставить заявку на КП.",
    "contacts": "📞 <b>Контакты</b>\n\nWhatsApp: +7 777 544 06 51\nСайт: efimfarmtechnologies.kz\n\nСоцсети — по кнопкам ниже.",
    "q_name": "📝 Как вас зовут?",
    "q_need": "Что вас интересует? Опишите оборудование, тип фермы, поголовье.",
    "q_phone": "Оставьте номер телефона для связи:",
    "q_done": "✅ Спасибо! Заявка отправлена, с вами свяжутся в ближайшее время.",
    "q_cancel": "Отмена",
    "q_cancelled": "Заявка отменена.",
    "q_file": "📎 Можете прикрепить фото фермы, чертёж или документ. Или нажмите «Пропустить».",
    "b_skip": "Пропустить ➡️"
  },
  "kk": {
    "menu": "👋 <b>EFIM FARM TECHNOLOGIES</b> компаниясына қош келдіңіз!\n\nБіз шынымен өндіреміз. Мал шаруашылығына арналған жабдықтарды өндіру және сату.\n\nБөлімді таңдаңыз:",
    "b_catalog": "📦 Каталог",
    "b_about": "ℹ️ Компания туралы",
    "b_prod": "🏭 Өндіріс",
    "b_proj": "🏗 Жобалар",
    "b_dept": "👥 Бөлімдер",
    "b_contacts": "📞 Байланыс",
    "b_quote": "📝 Ұсыныс сұрау",
    "b_lang": "🌐 Тіл",
    "b_back": "⬅️ Артқа",
    "b_site": "🌐 Сайтта ашу",
    "b_wa": "💬 WhatsApp-қа жазу",
    "b_map": "📍 Картада",
    "catalog": "📦 <b>Каталог</b>\n\nБөлімді таңдаңыз:",
    "cat_own": "🏭 Біздің өндіріс",
    "cat_partners": "🤝 Ресми дилерлік брендтер",
    "own_title": "🏭 <b>Өз өндірісіміздің өнімдері</b>",
    "par_title": "🤝 <b>Біз әлемдік өндірушілердің ресми дилеріміз</b>",
    "ask_quote": "Осыны қалаймын — ұсыныс сұрау",
    "about": "<b>EFIM FARM TECHNOLOGIES</b> — біз шынымен өндіреміз.\n\nМал шаруашылығына арналған жабдықтарды өндіріп, сатамыз, сондай-ақ әлемдік брендтердің ресми дилеріміз. Сүт және мал фермалары үшін жабдықты таңдауға, жеткізуге, орнатуға және қызмет көрсетуге көмектесеміз.",
    "prod": "🏭 <b>Біздің өндіріс</b>\n\nҚора жабдықтары, бұзау торлары, скреперлік жүйелер, топтық боксылар, ветеринарлық станоктар, хедлоктар және жылытылатын топтық суаттар. Жарық-желдеткіш қырды әр ғимаратқа жеке жасаймыз.",
    "proj": "🏗 <b>Біздің жобалар</b>\n\nОрындалған жобалар мен фотоларды сайттан көріңіз.",
    "dept": "👥 <b>Компания бөлімдері</b>\n\n💼 <b>Сату бөлімі</b> — жабдықты таңдау және енгізу\n📦 <b>Жабдықтау бөлімі</b> — жабдық, құрамдас бөлшектер мен материалдар жеткізу\n🚚 <b>Логистика бөлімі</b> — жеткізу, мерзім, бағыт\n🔧 <b>Сервис бөлімі</b> — монтаж, қызмет көрсету, қолдау\n\nWhatsApp арқылы байланысуға немесе ұсынысқа өтінім қалдыруға болады.",
    "contacts": "📞 <b>Байланыс</b>\n\nWhatsApp: +7 777 544 06 51\nСайт: efimfarmtechnologies.kz\n\nӘлеуметтік желілер — төмендегі батырмалар арқылы.",
    "q_name": "📝 Атыңыз кім?",
    "q_need": "Сізді не қызықтырады? Жабдықты, ферма түрін, мал санын сипаттаңыз.",
    "q_phone": "Байланыс үшін телефон нөміріңізді қалдырыңыз:",
    "q_done": "✅ Рақмет! Өтінім жіберілді, жақын арада сізбен байланысамыз.",
    "q_cancel": "Бас тарту",
    "q_cancelled": "Өтінім тоқтатылды.",
    "q_file": "📎 Ферманың фотосын, сызбасын немесе құжатты тіркей аласыз. Немесе «Өткізіп жіберу» түймесін басыңыз.",
    "b_skip": "Өткізіп жіберу ➡️"
  },
  "de": {
    "menu": "👋 Willkommen bei <b>EFIM FARM TECHNOLOGIES</b>!\n\nWir produzieren wirklich selbst. Herstellung und Vertrieb von Ausrüstung für die Tierhaltung.\n\nBitte wählen Sie einen Bereich:",
    "b_catalog": "📦 Katalog",
    "b_about": "ℹ️ Über uns",
    "b_prod": "🏭 Produktion",
    "b_proj": "🏗 Projekte",
    "b_dept": "👥 Abteilungen",
    "b_contacts": "📞 Kontakt",
    "b_quote": "📝 Angebot anfragen",
    "b_lang": "🌐 Sprache",
    "b_back": "⬅️ Zurück",
    "b_site": "🌐 Auf der Website öffnen",
    "b_wa": "💬 WhatsApp schreiben",
    "b_map": "📍 Auf der Karte",
    "catalog": "📦 <b>Katalog</b>\n\nBitte wählen Sie einen Bereich:",
    "cat_own": "🏭 Eigene Produktion",
    "cat_partners": "🤝 Offizieller Händler",
    "own_title": "🏭 <b>Produkte aus eigener Fertigung</b>",
    "par_title": "🤝 <b>Wir sind offizieller Händler weltweiter Hersteller</b>",
    "ask_quote": "Interessiert mich — Angebot anfragen",
    "about": "<b>EFIM FARM TECHNOLOGIES</b> — wir produzieren wirklich selbst.\n\nWir fertigen und verkaufen Ausrüstung für die Tierhaltung und sind offizieller Händler weltweiter Marken. Wir helfen bei Auswahl, Lieferung, Montage und Wartung für Milch- und Tierhaltungsbetriebe.",
    "prod": "🏭 <b>Unsere Produktion</b>\n\nStalleinrichtung, Kälberboxen, Schieberentmistung, Gruppenboxen, Behandlungsstände, Selbstfangfressgitter (Headlocks) und beheizte Gruppentränken. Den Licht-Lüftungsfirst fertigen wir individuell für jedes Gebäude.",
    "proj": "🏗 <b>Unsere Projekte</b>\n\nRealisierte Projekte und Fotos finden Sie auf der Website.",
    "dept": "👥 <b>Abteilungen</b>\n\n💼 <b>Vertrieb</b> — Auswahl und Einführung der Ausrüstung\n📦 <b>Einkauf</b> — Lieferung von Ausrüstung, Komponenten und Material\n🚚 <b>Logistik</b> — Lieferung, Termine, Routen\n🔧 <b>Service</b> — Montage, Wartung, Support\n\nKontakt per WhatsApp oder über die Angebotsanfrage.",
    "contacts": "📞 <b>Kontakt</b>\n\nWhatsApp: +7 777 544 06 51\nWebsite: efimfarmtechnologies.kz\n\nSoziale Netzwerke — über die Buttons unten.",
    "q_name": "📝 Wie heißen Sie?",
    "q_need": "Wofür interessieren Sie sich? Beschreiben Sie Ausrüstung, Betriebsart und Tierzahl.",
    "q_phone": "Bitte hinterlassen Sie Ihre Telefonnummer:",
    "q_done": "✅ Danke! Ihre Anfrage wurde gesendet, wir melden uns in Kürze.",
    "q_cancel": "Abbrechen",
    "q_cancelled": "Anfrage abgebrochen.",
    "q_file": "📎 Sie können ein Foto des Betriebs, eine Zeichnung oder ein Dokument anhängen. Oder tippen Sie auf „Überspringen“.",
    "b_skip": "Überspringen ➡️"
  }
};

export const OWN = {
  "stall": {
    "ru": [
      "Стойловое оборудование",
      "Комфортные ограждения, перегородки, калитки и т.д."
    ],
    "kk": [
      "Қора жабдықтары",
      "Ыңғайлы қоршаулар, бөгеттер, қақпалар және т.б."
    ],
    "de": [
      "Stalleinrichtung",
      "Komfortable Abgrenzungen, Trennwände, Tore usw."
    ]
  },
  "calf": {
    "ru": [
      "Клетки для телят",
      "Индивидуальные клетки для телят собственного производства."
    ],
    "kk": [
      "Бұзау торлары",
      "Өз өндірісіміздің бұзауларға арналған жеке торлары."
    ],
    "de": [
      "Kälberboxen",
      "Einzelboxen für Kälber aus eigener Fertigung."
    ]
  },
  "scraper": {
    "ru": [
      "Скреперные системы",
      "Системы для навозоудаления."
    ],
    "kk": [
      "Скреперлік жүйелер",
      "Көңді шығаруға арналған жүйелер."
    ],
    "de": [
      "Schieberentmistung",
      "Systeme zur Entmistung."
    ]
  },
  "boxes": {
    "ru": [
      "Групповые боксы",
      "Для молодняка и родильного отделения."
    ],
    "kk": [
      "Топтық боксылар",
      "Жас мал мен төлдету бөліміне арналған."
    ],
    "de": [
      "Gruppenboxen",
      "Für Jungvieh und Abkalbebereich."
    ]
  },
  "vet": {
    "ru": [
      "Ветеринарные станки",
      "Разные модификации станков."
    ],
    "kk": [
      "Ветеринарлық станоктар",
      "Станоктың әртүрлі модификациялары."
    ],
    "de": [
      "Behandlungsstände",
      "Verschiedene Ausführungen von Behandlungsständen."
    ]
  },
  "ridge": {
    "ru": [
      "Световентиляционный конёк",
      "Изготавливаем индивидуально под каждое здание."
    ],
    "kk": [
      "Жарық-желдеткіш қыр",
      "Әр ғимаратқа жеке дайындаймыз."
    ],
    "de": [
      "Licht-Lüftungsfirst",
      "Individuell für jedes Gebäude gefertigt."
    ]
  },
  "headlock": {
    "ru": [
      "Хэдлоки",
      "Самофиксирующая кормовая решётка для КРС."
    ],
    "kk": [
      "Хедлоктар",
      "ІҚМ-ға арналған өздігінен бекітілетін жем торы."
    ],
    "de": [
      "Headlocks",
      "Selbstfangfressgitter für Rinder."
    ]
  },
  "drinkers": {
    "ru": [
      "Групповые поилки",
      "Групповые поилки с подогревом."
    ],
    "kk": [
      "Топтық суаттар",
      "Жылытылатын топтық суаттар."
    ],
    "de": [
      "Gruppentränken",
      "Beheizte Gruppentränken."
    ]
  }
};

export const PARTNERS = {
  "faresin": {
    "ru": [
      "Faresin",
      "Смесители-кормораздатчики: самоходные и прицепные, под любые задачи и площади фермы."
    ],
    "kk": [
      "Faresin",
      "Жем араластырғыш-таратқыштар: өздігінен жүретін және тіркемелі, ферманың кез келген қажеттілігіне."
    ],
    "de": [
      "Faresin",
      "Futtermischwagen: selbstfahrend und gezogen, für alle Anforderungen und Platzverhältnisse."
    ]
  },
  "dairymaster": {
    "ru": [
      "Dairymaster",
      "Доильные залы и высокотехнологичное оборудование для молочных ферм: доение, кормление, скреперы, охлаждение молока, мониторинг здоровья и фертильности."
    ],
    "kk": [
      "Dairymaster",
      "Сүт фермаларына арналған сауын залдары мен жоғары технологиялық жабдық: сауын, азықтандыру, скреперлер, сүт салқындату, денсаулық пен ұрпақ беру мониторингі."
    ],
    "de": [
      "Dairymaster",
      "Melkstände und Hightech-Ausrüstung für Milchviehbetriebe: Melken, Fütterung, Schieber, Milchkühlung, Gesundheits- und Fruchtbarkeitsmonitoring."
    ]
  },
  "kraiburg": {
    "ru": [
      "KRAIBURG",
      "Резиновые маты — инновационные решения для благополучия животных."
    ],
    "kk": [
      "KRAIBURG",
      "Резеңке төсеніштер — жануарлардың әл-ауқатына арналған инновациялық шешімдер."
    ],
    "de": [
      "KRAIBURG",
      "Gummimatten — innovative Lösungen für mehr Tierwohl."
    ]
  },
  "eisele": {
    "ru": [
      "EISELE",
      "Насосы и оборудование для удаления и сепарации навоза, для сельского хозяйства и биогазовых установок."
    ],
    "kk": [
      "EISELE",
      "Ауыл шаруашылығы мен биогаз қондырғыларына арналған көңді шығару және бөлу сорғылары мен жабдығы."
    ],
    "de": [
      "EISELE",
      "Pumpen und Technik zur Gülleförderung und -separation für Landwirtschaft und Biogasanlagen."
    ]
  },
  "dinamica": {
    "ru": [
      "Dinamica Generale",
      "Контроль и анализ кормов: датчики взвешивания, NIR-анализаторы, трекеры данных и ПО."
    ],
    "kk": [
      "Dinamica Generale",
      "Жемді бақылау және талдау: өлшеу датчиктері, NIR-анализаторлар, дерек трекерлері және БЖ."
    ],
    "de": [
      "Dinamica Generale",
      "Futtermanagement: Wiegesensoren, NIR-Analysatoren, Datentracker und Software."
    ]
  },
  "urban": {
    "ru": [
      "URBAN",
      "Автоматизированное кормление телят и ягнят, поилка Alma Pro."
    ],
    "kk": [
      "URBAN",
      "Бұзау мен қозыларды автоматты азықтандыру, Alma Pro суарғышы."
    ],
    "de": [
      "URBAN",
      "Automatische Tränke für Kälber und Lämmer, Tränkeautomat Alma Pro."
    ]
  },
  "mws": {
    "ru": [
      "MWS",
      "Режущие ножи на кормосмесители SILOKING, KUHN, BVL, FARESIN, TRIOLET, АКМ, КИС и др. Всегда в наличии."
    ],
    "kk": [
      "MWS",
      "SILOKING, KUHN, BVL, FARESIN, TRIOLET, АКМ, КИС және т.б. жем араластырғыштарға арналған кескіш пышақтар. Әрдайым қолда бар."
    ],
    "de": [
      "MWS",
      "Schneidmesser für Futtermischer SILOKING, KUHN, BVL, FARESIN, TRIOLET, AKM, KIS u. a. Stets auf Lager."
    ]
  }
};

export const PICK = {
  "ru": {
    "btn": "🎯 Подбор оборудования",
    "start": "🎯 <b>Подбор оборудования</b>\n\nКакая у вас ферма?",
    "farm": {
      "dairy": "🐄 Молочная",
      "beef": "🥩 Мясная",
      "calves": "🐮 Телята, молодняк",
      "sheep": "🐑 Овцы, ягнята"
    },
    "q2": "Что нужно оснастить?",
    "task": {
      "feed": "🌾 Кормление",
      "milk": "🥛 Доение",
      "manure": "🧹 Уборка навоза",
      "comfort": "🛏 Комфорт и содержание",
      "calf": "🍼 Выпойка телят"
    },
    "res": "✅ <b>Что может подойти:</b>",
    "none": "Для этой задачи на выбранной ферме готового варианта в каталоге нет, но специалисты подскажут. Оставьте заявку, и с вами свяжутся.",
    "note": "Точную комплектацию подберут специалисты, оставьте заявку.",
    "b_quote": "📝 Запросить КП",
    "b_again": "🔁 Начать заново"
  },
  "kk": {
    "btn": "🎯 Жабдықты таңдау",
    "start": "🎯 <b>Жабдықты таңдау</b>\n\nСіздің фермаңыз қандай?",
    "farm": {
      "dairy": "🐄 Сүт фермасы",
      "beef": "🥩 Ет фермасы",
      "calves": "🐮 Бұзау, жас мал",
      "sheep": "🐑 Қой, қозы"
    },
    "q2": "Нені жабдықтау керек?",
    "task": {
      "feed": "🌾 Азықтандыру",
      "milk": "🥛 Сауын",
      "manure": "🧹 Көңді тазалау",
      "comfort": "🛏 Жайлылық және ұстау",
      "calf": "🍼 Бұзауды суару"
    },
    "res": "✅ <b>Мыналар сәйкес келуі мүмкін:</b>",
    "none": "Таңдалған ферма мен міндет үшін каталогта дайын нұсқа жоқ, бірақ мамандар кеңес береді. Өтінім қалдырыңыз, сізбен байланысамыз.",
    "note": "Нақты жиынтықты мамандар таңдайды, өтінім қалдырыңыз.",
    "b_quote": "📝 Ұсыныс сұрау",
    "b_again": "🔁 Қайта бастау"
  },
  "de": {
    "btn": "🎯 Ausrüstung finden",
    "start": "🎯 <b>Ausrüstung finden</b>\n\nWelchen Betrieb haben Sie?",
    "farm": {
      "dairy": "🐄 Milchvieh",
      "beef": "🥩 Fleischrinder",
      "calves": "🐮 Kälber, Jungvieh",
      "sheep": "🐑 Schafe, Lämmer"
    },
    "q2": "Was soll ausgestattet werden?",
    "task": {
      "feed": "🌾 Fütterung",
      "milk": "🥛 Melken",
      "manure": "🧹 Entmistung",
      "comfort": "🛏 Komfort und Haltung",
      "calf": "🍼 Kälbertränke"
    },
    "res": "✅ <b>Das könnte passen:</b>",
    "none": "Für diese Aufgabe gibt es im Katalog keine fertige Lösung, aber unsere Fachleute beraten Sie gern. Hinterlassen Sie eine Anfrage, wir melden uns.",
    "note": "Die genaue Ausstattung stimmen unsere Fachleute mit Ihnen ab, bitte Anfrage senden.",
    "b_quote": "📝 Angebot anfragen",
    "b_again": "🔁 Neu starten"
  }
};

export const REC = {
  "feed": [
    [
      "par",
      "faresin"
    ],
    [
      "par",
      "dinamica"
    ],
    [
      "par",
      "mws"
    ]
  ],
  "milk": [
    [
      "par",
      "dairymaster"
    ]
  ],
  "manure": [
    [
      "own",
      "scraper"
    ],
    [
      "par",
      "eisele"
    ],
    [
      "par",
      "dairymaster"
    ]
  ],
  "comfort": [
    [
      "own",
      "stall"
    ],
    [
      "own",
      "headlock"
    ],
    [
      "own",
      "drinkers"
    ],
    [
      "par",
      "kraiburg"
    ],
    [
      "own",
      "ridge"
    ]
  ],
  "calf": [
    [
      "par",
      "urban"
    ],
    [
      "own",
      "calf"
    ],
    [
      "own",
      "boxes"
    ]
  ]
};
