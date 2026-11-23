// Cloudflare Worker «efim-leads»: заявки с сайта + Telegram-бот EFIM Farm Technologies.
//
// Секреты (Cloudflare → efim-leads → Settings → Variables and Secrets), в этом файле их нет:
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — куда присылать заявки (менеджер или группа)
//   TG_WEBHOOK_SECRET  — секрет, которым Telegram подписывает обновления
//   SETUP_KEY          — ключ для /setup (регистрация вебхука, команд и описания бота)
// Хранилище: KV-namespace, привязанное как BOT (язык пользователя, шаг заявки, связь ответов).
//
// Адреса:
//   POST /         — заявка с сайта (только с разрешённых доменов)
//   POST /tg       — обновления от Telegram (вебхук)
//   GET  /setup?key=SETUP_KEY — настроить бота (вызывается один раз после изменений)

const ALLOWED_ORIGINS = [
  'https://efimtretyak-debug.github.io',
  'https://efimfarmtechnologies.kz',
  'https://www.efimfarmtechnologies.kz',
];
const SITE = 'https://efimtretyak-debug.github.io/efim/';
const PHONE = '+7 777 544 06 51';
const WA = 'https://wa.me/77775440651';
const EMAIL = 'efim@efimfarmtechnologies.kz';
const LIMITS = { name: 100, phone: 40, need: 300, comment: 2000 };
const DAY = 86400;

// ---------- тексты бота ----------
const L = {
  ru: {
    name: 'EFIM Farm Technologies',
    short: 'Оборудование для молочно-товарных ферм. Производство в Казахстане с 2017 года. Заявки, цены, сервис.',
    about: 'EFIM Farm Technologies — местный производитель оборудования для молочно-товарных ферм с 2017 года.\n\n• Стойловое оборудование, хэдлоки, скреперы, поилки\n• Официальный дилер Faresin, Dairymaster, Kraiburg, Eisele, Dinamica Generale, Urban, MWS\n• Поставка, монтаж и сервис по всему Казахстану\n\nНажмите «Старт», чтобы оставить заявку или узнать больше.',
    cmds: { start: 'Главное меню', lead: 'Оставить заявку', equipment: 'Наше производство', brands: 'Бренды-партнёры', contacts: 'Контакты', language: 'Сменить язык' },
    hello: (n) => `Здравствуйте${n ? ', ' + n : ''}! 👋\n\nЭто бот <b>EFIM Farm Technologies</b> — местного производителя оборудования для молочно-товарных ферм.\n\nЧем можем помочь?`,
    b_equip: '🏭 Наше производство', b_brands: '🤝 Бренды', b_lead: '📝 Оставить заявку', b_contacts: '📞 Контакты', b_site: '🌐 Сайт', b_lang: '🌍 Язык', b_menu: '⬅️ Меню', b_cancel: '✖️ Отмена', b_share: '📱 Отправить мой номер', b_skip: 'Пропустить',
    equip: '<b>Производим сами — качественно и в срок</b>\n\n• Стойловое оборудование\n• Индивидуальные клетки для телят\n• Скреперные системы\n• Групповые боксы\n• Ветеринарные станки\n• Световентиляционный конёк\n• Хэдлоки (самофиксирующая кормовая решётка)\n• Групповые поилки с подогревом\n\nБолее 100 наименований. Изготовим по вашему заказу.',
    brands: '<b>Официальный дилер мировых производителей</b>\n\n• <b>Faresin</b> — смесители-кормораздатчики\n• <b>Dairymaster</b> — доильные залы\n• <b>Kraiburg</b> — резиновые маты\n• <b>Eisele</b> — насосы и сепарация навоза\n• <b>Dinamica Generale</b> — контроль и анализ кормов\n• <b>Urban</b> — выпойка телят и ягнят\n• <b>MWS</b> — ножи для кормосмесителей, всегда в наличии',
    contacts: `<b>Контакты</b>\n\n📞 ${PHONE} (телефон и WhatsApp)\n✉️ ${EMAIL}\n📍 Тобыл, Тәуелсіздік 69/1`,
    ask_name: '📝 <b>Заявка</b>\n\nКак вас зовут?',
    ask_phone: 'Ваш номер телефона? Нажмите кнопку ниже или напишите номер.',
    ask_need: 'Что нужно для фермы? Например: «хэдлоки на 200 голов».',
    bad_phone: 'Похоже, это не номер. Напишите номер телефона, например +7 777 123 45 67.',
    done: '✅ Спасибо! Заявка принята. Менеджер свяжется с вами в ближайшее время.',
    cancelled: 'Заявка отменена.',
    forwarded: 'Спасибо! Передали ваше сообщение менеджеру — ответим здесь же.',
    pick_lang: 'Выберите язык / Тілді таңдаңыз / Sprache wählen:',
    lang_set: 'Язык: русский 🇷🇺',
  },
  kk: {
    name: 'EFIM Farm Technologies',
    short: 'Сүт-тауар фермаларына арналған жабдық. 2017 жылдан бері Қазақстанда өндіреміз. Өтінім, баға, сервис.',
    about: 'EFIM Farm Technologies — 2017 жылдан бері сүт-тауар фермаларына арналған жабдықтың отандық өндірушісі.\n\n• Қора жабдықтары, хэдлоктар, скреперлер, суаттар\n• Faresin, Dairymaster, Kraiburg, Eisele, Dinamica Generale, Urban, MWS ресми дилері\n• Бүкіл Қазақстан бойынша жеткізу, монтаж және сервис\n\nӨтінім қалдыру немесе толығырақ білу үшін «Бастау» батырмасын басыңыз.',
    cmds: { start: 'Басты мәзір', lead: 'Өтінім қалдыру', equipment: 'Біздің өндіріс', brands: 'Серіктес брендтер', contacts: 'Байланыс', language: 'Тілді ауыстыру' },
    hello: (n) => `Сәлеметсіз бе${n ? ', ' + n : ''}! 👋\n\nБұл — сүт-тауар фермаларына арналған жабдықтың отандық өндірушісі <b>EFIM Farm Technologies</b> боты.\n\nҚалай көмектесе аламыз?`,
    b_equip: '🏭 Біздің өндіріс', b_brands: '🤝 Брендтер', b_lead: '📝 Өтінім қалдыру', b_contacts: '📞 Байланыс', b_site: '🌐 Сайт', b_lang: '🌍 Тіл', b_menu: '⬅️ Мәзір', b_cancel: '✖️ Болдырмау', b_share: '📱 Нөмірімді жіберу', b_skip: 'Өткізу',
    equip: '<b>Өзіміз өндіреміз — сапалы әрі уақытында</b>\n\n• Қора жабдықтары\n• Бұзауларға арналған жеке торлар\n• Скреперлік жүйелер\n• Топтық бокстар\n• Ветеринарлық станоктар\n• Жарық-желдеткіш жотасы\n• Хэдлоктар (өздігінен бекітілетін азық торы)\n• Жылытылатын топтық суаттар\n\n100-ден астам өнім атауы. Тапсырысыңыз бойынша жасаймыз.',
    brands: '<b>Әлемдік өндірушілердің ресми дилері</b>\n\n• <b>Faresin</b> — азық араластырғыш-таратқыштар\n• <b>Dairymaster</b> — сауу залдары\n• <b>Kraiburg</b> — резеңке төсеніштер\n• <b>Eisele</b> — сорғылар және көң сепарациясы\n• <b>Dinamica Generale</b> — азықты бақылау және талдау\n• <b>Urban</b> — бұзаулар мен қозыларды суару\n• <b>MWS</b> — азық араластырғыштарға пышақтар, әрқашан бар',
    contacts: `<b>Байланыс</b>\n\n📞 ${PHONE} (телефон және WhatsApp)\n✉️ ${EMAIL}\n📍 Тобыл, Тәуелсіздік 69/1`,
    ask_name: '📝 <b>Өтінім</b>\n\nАтыңыз кім?',
    ask_phone: 'Телефон нөміріңіз? Төмендегі батырманы басыңыз немесе нөмірді жазыңыз.',
    ask_need: 'Фермаға не қажет? Мысалы: «200 басқа хэдлоктар».',
    bad_phone: 'Бұл нөмірге ұқсамайды. Телефон нөмірін жазыңыз, мысалы +7 777 123 45 67.',
    done: '✅ Рахмет! Өтінім қабылданды. Менеджер жақын арада хабарласады.',
    cancelled: 'Өтінім болдырылмады.',
    forwarded: 'Рахмет! Хабарламаңызды менеджерге жібердік — осында жауап береміз.',
    pick_lang: 'Выберите язык / Тілді таңдаңыз / Sprache wählen:',
    lang_set: 'Тіл: қазақша 🇰🇿',
  },
  de: {
    name: 'EFIM Farm Technologies',
    short: 'Stalltechnik für Milchviehbetriebe. Produktion in Kasachstan seit 2017. Anfragen, Preise, Service.',
    about: 'EFIM Farm Technologies — Hersteller von Ausrüstung für Milchviehbetriebe in Kasachstan seit 2017.\n\n• Stalleinrichtung, Fressgitter, Schieberanlagen, Tränken\n• Offizieller Händler von Faresin, Dairymaster, Kraiburg, Eisele, Dinamica Generale, Urban, MWS\n• Lieferung, Montage und Service in ganz Kasachstan\n\nTippen Sie auf „Start“, um eine Anfrage zu senden oder mehr zu erfahren.',
    cmds: { start: 'Hauptmenü', lead: 'Anfrage senden', equipment: 'Eigene Produktion', brands: 'Partnermarken', contacts: 'Kontakt', language: 'Sprache ändern' },
    hello: (n) => `Guten Tag${n ? ', ' + n : ''}! 👋\n\nDies ist der Bot von <b>EFIM Farm Technologies</b> — Hersteller von Ausrüstung für Milchviehbetriebe in Kasachstan.\n\nWie können wir helfen?`,
    b_equip: '🏭 Produktion', b_brands: '🤝 Marken', b_lead: '📝 Anfrage senden', b_contacts: '📞 Kontakt', b_site: '🌐 Website', b_lang: '🌍 Sprache', b_menu: '⬅️ Menü', b_cancel: '✖️ Abbrechen', b_share: '📱 Meine Nummer senden', b_skip: 'Überspringen',
    equip: '<b>Selbst gefertigt — in Qualität und termingerecht</b>\n\n• Stalleinrichtung\n• Kälber-Einzelboxen\n• Schieberanlagen\n• Gruppenboxen\n• Behandlungsstände\n• Lichtfirst\n• Fressgitter (selbstfangend)\n• Beheizte Gruppentränken\n\nÜber 100 Produkte. Fertigung nach Ihren Anforderungen.',
    brands: '<b>Offizieller Händler internationaler Hersteller</b>\n\n• <b>Faresin</b> — Futtermischwagen\n• <b>Dairymaster</b> — Melkstände\n• <b>Kraiburg</b> — Gummimatten\n• <b>Eisele</b> — Pumpen und Gülleseparation\n• <b>Dinamica Generale</b> — Futterkontrolle und -analyse\n• <b>Urban</b> — Kälber- und Lämmertränken\n• <b>MWS</b> — Messer für Futtermischwagen, immer auf Lager',
    contacts: `<b>Kontakt</b>\n\n📞 ${PHONE} (Telefon und WhatsApp)\n✉️ ${EMAIL}\n📍 Tobyl, Täuelsisdik 69/1, Kasachstan`,
    ask_name: '📝 <b>Anfrage</b>\n\nWie heißen Sie?',
    ask_phone: 'Ihre Telefonnummer? Tippen Sie auf den Knopf unten oder schreiben Sie die Nummer.',
    ask_need: 'Was braucht Ihr Betrieb? Zum Beispiel: „Fressgitter für 200 Tiere“.',
    bad_phone: 'Das sieht nicht wie eine Nummer aus. Bitte Telefonnummer angeben, z. B. +49 170 1234567.',
    done: '✅ Danke! Ihre Anfrage ist eingegangen. Ein Manager meldet sich in Kürze.',
    cancelled: 'Anfrage abgebrochen.',
    forwarded: 'Danke! Ihre Nachricht ist beim Manager — wir antworten hier.',
    pick_lang: 'Выберите язык / Тілді таңдаңыз / Sprache wählen:',
    lang_set: 'Sprache: Deutsch 🇩🇪',
  },
};
const LANG_NAMES = { ru: 'русский', kk: 'қазақша', de: 'Deutsch' };

// ---------- общие помощники ----------
const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const json = (o, status = 200, headers = {}) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json', ...headers } });

async function tg(env, method, body) {
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return r.json().catch(() => ({ ok: false }));
}

function cors(origin) {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' };
}

// ---------- заявка с сайта ----------
async function siteLead(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 });
  const headers = cors(origin);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

  let data;
  try { data = await request.json(); } catch { return new Response('Bad request', { status: 400, headers }); }
  if (data.website) return new Response('OK', { status: 200, headers });   // ловушка для спам-ботов

  const f = {};
  for (const [k, max] of Object.entries(LIMITS)) f[k] = String(data[k] || '').trim().slice(0, max);
  if (!f.name || !f.phone) return new Response('Name and phone required', { status: 400, headers });

  const text = [
    '<b>🌐 Новая заявка с сайта</b>',
    `<b>Имя:</b> ${esc(f.name)}`,
    `<b>Телефон:</b> ${esc(f.phone)}`,
    f.need && `<b>Что нужно:</b> ${esc(f.need)}`,
    f.comment && `<b>Комментарий:</b> ${esc(f.comment)}`,
    `<b>Язык сайта:</b> ${LANG_NAMES[data.lang] || '—'}`,
  ].filter(Boolean).join('\n');

  const r = await tg(env, 'sendMessage', { chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });
  if (!r.ok) return new Response('Telegram error: ' + (r.description || ''), { status: 502, headers });
  return new Response('OK', { status: 200, headers });
}

// ---------- бот ----------
const kv = {
  get: async (env, k) => (env.BOT ? env.BOT.get(k, 'json') : null),
  put: async (env, k, v, ttl) => env.BOT && env.BOT.put(k, JSON.stringify(v), ttl ? { expirationTtl: ttl } : undefined),
  del: async (env, k) => env.BOT && env.BOT.delete(k),
};

function guessLang(code) {
  code = (code || '').slice(0, 2);
  return code === 'kk' || code === 'de' ? code : 'ru';
}
async function userLang(env, from) {
  const saved = await kv.get(env, `lang:${from.id}`);
  return saved || guessLang(from.language_code);
}

function menu(t, lang) {
  const site = SITE + (lang === 'ru' ? '' : lang + '/');
  return { inline_keyboard: [
    [{ text: t.b_lead, callback_data: 'lead' }],
    [{ text: t.b_equip, callback_data: 'equip' }, { text: t.b_brands, callback_data: 'brands' }],
    [{ text: t.b_contacts, callback_data: 'contacts' }, { text: t.b_site, url: site }],
    [{ text: t.b_lang, callback_data: 'lang' }],
  ] };
}
const backKb = (t) => ({ inline_keyboard: [[{ text: t.b_lead, callback_data: 'lead' }], [{ text: t.b_menu, callback_data: 'menu' }]] });
const contactsKb = (t) => ({ inline_keyboard: [[{ text: 'WhatsApp', url: WA }], [{ text: t.b_lead, callback_data: 'lead' }], [{ text: t.b_menu, callback_data: 'menu' }]] });
const langKb = { inline_keyboard: [[
  { text: '🇷🇺 Рус', callback_data: 'set:ru' }, { text: '🇰🇿 Қаз', callback_data: 'set:kk' }, { text: '🇩🇪 Deu', callback_data: 'set:de' }]] };
const cancelKb = (t) => ({ inline_keyboard: [[{ text: t.b_cancel, callback_data: 'cancel' }]] });
const phoneKb = (t) => ({ keyboard: [[{ text: t.b_share, request_contact: true }], [{ text: t.b_cancel }]], resize_keyboard: true, one_time_keyboard: true });
const removeKb = { remove_keyboard: true };

async function send(env, chat, text, reply_markup) {
  return tg(env, 'sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup });
}

async function showSection(env, chat, lang, key) {
  const t = L[lang];
  if (key === 'menu') return send(env, chat, t.hello(''), menu(t, lang));
  if (key === 'equip') return send(env, chat, t.equip, backKb(t));
  if (key === 'brands') return send(env, chat, t.brands, backKb(t));
  if (key === 'contacts') return send(env, chat, t.contacts, contactsKb(t));
  if (key === 'lang') return send(env, chat, t.pick_lang, langKb);
}

async function startLead(env, chat, lang) {
  await kv.put(env, `st:${chat}`, { step: 'name' }, DAY);
  return send(env, chat, L[lang].ask_name, cancelKb(L[lang]));
}

async function finishLead(env, msg, st, lang) {
  const from = msg.from;
  const user = from.username ? '@' + from.username : `id ${from.id}`;
  const text = [
    '<b>🤖 Новая заявка из Telegram-бота</b>',
    `<b>Имя:</b> ${esc(st.name)}`,
    `<b>Телефон:</b> ${esc(st.phone)}`,
    st.need && `<b>Что нужно:</b> ${esc(st.need)}`,
    `<b>Telegram:</b> ${esc(user)} (<a href="tg://user?id=${from.id}">написать</a>)`,
    `<b>Язык:</b> ${LANG_NAMES[lang]}`,
    '',
    '<i>Ответьте на это сообщение — бот перешлёт ответ клиенту.</i>',
  ].filter((x) => x !== null && x !== undefined && x !== false).join('\n');
  const r = await tg(env, 'sendMessage', { chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });
  if (r.ok) await kv.put(env, `fw:${r.result.message_id}`, msg.chat.id, 30 * DAY);
  await kv.del(env, `st:${msg.chat.id}`);
  await send(env, msg.chat.id, L[lang].done, removeKb);
  return send(env, msg.chat.id, L[lang].hello(''), menu(L[lang], lang));
}

async function onMessage(env, msg) {
  const chat = msg.chat.id;
  if (msg.chat.type !== 'private') {
    // Группа менеджеров: ответ на пересланное сообщение уходит клиенту.
    if (String(chat) === String(env.TELEGRAM_CHAT_ID)) await adminReply(env, msg);
    return;
  }
  // Личный чат менеджера: ответ (reply) на заявку уходит клиенту.
  if (String(chat) === String(env.TELEGRAM_CHAT_ID) && msg.reply_to_message && await adminReply(env, msg)) return;

  const lang = await userLang(env, msg.from);
  const t = L[lang];
  const text = (msg.text || '').trim();
  const cmd = text.startsWith('/') ? text.split(/[\s@]/)[0].slice(1).toLowerCase() : null;

  if (cmd === 'start' || cmd === 'menu') {
    await kv.del(env, `st:${chat}`);
    return send(env, chat, t.hello(esc(msg.from.first_name || '')), menu(t, lang));
  }
  if (cmd === 'cancel' || text === t.b_cancel) {
    await kv.del(env, `st:${chat}`);
    await send(env, chat, t.cancelled, removeKb);
    return showSection(env, chat, lang, 'menu');
  }
  if (cmd === 'lead') return startLead(env, chat, lang);
  if (cmd === 'equipment') return showSection(env, chat, lang, 'equip');
  if (cmd === 'brands') return showSection(env, chat, lang, 'brands');
  if (cmd === 'contacts') return showSection(env, chat, lang, 'contacts');
  if (cmd === 'language') return showSection(env, chat, lang, 'lang');

  const st = await kv.get(env, `st:${chat}`);
  if (st && st.step === 'name') {
    if (!text) return send(env, chat, t.ask_name, cancelKb(t));
    st.name = text.slice(0, LIMITS.name); st.step = 'phone';
    await kv.put(env, `st:${chat}`, st, DAY);
    return send(env, chat, t.ask_phone, phoneKb(t));
  }
  if (st && st.step === 'phone') {
    const phone = msg.contact ? msg.contact.phone_number : text;
    if (!phone || (phone.match(/\d/g) || []).length < 6) return send(env, chat, t.bad_phone, phoneKb(t));
    st.phone = String(phone).slice(0, LIMITS.phone); st.step = 'need';
    await kv.put(env, `st:${chat}`, st, DAY);
    return send(env, chat, t.ask_need, { keyboard: [[{ text: t.b_skip }], [{ text: t.b_cancel }]], resize_keyboard: true, one_time_keyboard: true });
  }
  if (st && st.step === 'need') {
    st.need = text === t.b_skip ? '' : text.slice(0, LIMITS.need);
    return finishLead(env, msg, st, lang);
  }

  // Свободное сообщение — пересылаем менеджеру.
  if (cmd) return showSection(env, chat, lang, 'menu');
  const from = msg.from;
  const who = `${esc([from.first_name, from.last_name].filter(Boolean).join(' '))}${from.username ? ' (@' + esc(from.username) + ')' : ''}`;
  const body = msg.text ? esc(msg.text.slice(0, 3000)) : '<i>(вложение — см. ниже)</i>';
  const r = await tg(env, 'sendMessage', { chat_id: env.TELEGRAM_CHAT_ID, parse_mode: 'HTML',
    text: `<b>💬 Сообщение в боте</b>\n<b>От:</b> ${who}, язык: ${LANG_NAMES[lang]}\n\n${body}\n\n<i>Ответьте на это сообщение — бот перешлёт ответ клиенту.</i>` });
  if (r.ok) await kv.put(env, `fw:${r.result.message_id}`, chat, 30 * DAY);
  if (!msg.text) {
    const c = await tg(env, 'copyMessage', { chat_id: env.TELEGRAM_CHAT_ID, from_chat_id: chat, message_id: msg.message_id });
    if (c.ok) await kv.put(env, `fw:${c.result.message_id}`, chat, 30 * DAY);
  }
  return send(env, chat, t.forwarded, menu(t, lang));
}

async function adminReply(env, msg) {
  const reply = msg.reply_to_message;
  if (!reply) return false;
  const client = await kv.get(env, `fw:${reply.message_id}`);
  if (!client) return false;
  const r = await tg(env, 'copyMessage', { chat_id: client, from_chat_id: msg.chat.id, message_id: msg.message_id });
  await tg(env, 'setMessageReaction', { chat_id: msg.chat.id, message_id: msg.message_id, reaction: [{ type: 'emoji', emoji: r.ok ? '👍' : '👎' }] });
  if (r.ok) await kv.put(env, `fw:${msg.message_id}`, client, 30 * DAY);
  return true;
}

async function onCallback(env, cq) {
  await tg(env, 'answerCallbackQuery', { callback_query_id: cq.id });
  const chat = cq.message.chat.id;
  let lang = await userLang(env, cq.from);
  const d = cq.data || '';
  if (d.startsWith('set:')) {
    lang = guessLang(d.slice(4));
    await kv.put(env, `lang:${cq.from.id}`, lang);
    await send(env, chat, L[lang].lang_set);
    return showSection(env, chat, lang, 'menu');
  }
  if (d === 'lead') return startLead(env, chat, lang);
  if (d === 'cancel') {
    await kv.del(env, `st:${chat}`);
    await send(env, chat, L[lang].cancelled, removeKb);
    return showSection(env, chat, lang, 'menu');
  }
  return showSection(env, chat, lang, d);
}

async function webhook(request, env) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  if (!env.TG_WEBHOOK_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TG_WEBHOOK_SECRET)
    return new Response('Forbidden', { status: 403 });
  const u = await request.json().catch(() => null);
  try {
    if (u && u.message) await onMessage(env, u.message);
    else if (u && u.callback_query) await onCallback(env, u.callback_query);
  } catch (e) {
    console.error(e);   // всегда 200, иначе Telegram будет повторять обновление
  }
  return new Response('OK');
}

// ---------- однократная настройка бота ----------
async function setup(request, env) {
  const url = new URL(request.url);
  if (!env.SETUP_KEY || url.searchParams.get('key') !== env.SETUP_KEY) return new Response('Forbidden', { status: 403 });
  const out = {};
  out.webhook = await tg(env, 'setWebhook', { url: `${url.origin}/tg`, secret_token: env.TG_WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'], drop_pending_updates: true });
  for (const lang of ['ru', 'kk', 'de']) {
    const t = L[lang];
    const codes = lang === 'ru' ? [undefined, 'ru'] : [lang];
    for (const language_code of codes) {
      const k = language_code || 'default';
      out[`cmd_${k}`] = await tg(env, 'setMyCommands', { language_code,
        commands: Object.entries(t.cmds).map(([command, description]) => ({ command, description })) });
      out[`desc_${k}`] = await tg(env, 'setMyDescription', { language_code, description: t.about });
      out[`short_${k}`] = await tg(env, 'setMyShortDescription', { language_code, short_description: t.short });
      out[`name_${k}`] = await tg(env, 'setMyName', { language_code, name: t.name });
    }
  }
  out.me = await tg(env, 'getMe', {});
  return json(out);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/tg') return webhook(request, env);
    if (path === '/setup') return setup(request, env);
    return siteLead(request, env);
  },
};
