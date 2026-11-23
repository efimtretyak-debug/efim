// EFIM FARM TECHNOLOGIES — Telegram-бот (RU / KK / DE) в Cloudflare Workers.
// Перенос бота v4.3 (Python/aiogram) — работает круглосуточно, без компьютера.
// Плюс: заявки с сайта попадают в бота как обычные заявки (с кнопками «Беру в работу» / «Закрыть»).
//
// Секреты (Cloudflare → Worker → Settings → Variables and Secrets):
//   TELEGRAM_BOT_TOKEN — токен бота
//   TG_WEBHOOK_SECRET  — секрет, которым Telegram подписывает обновления
//   SETUP_KEY          — ключ для /setup и /teardown
// Обычные переменные:
//   ADMIN_IDS        — админы (папа), id через запятую
//   ADMIN_USERNAMES  — админы по юзернейму (запоминаются после /start)
//   STAFF_IDS        — сотрудники, id через запятую
//   REMIND_MINUTES   — через сколько минут напоминать о заявке без ответа (по умолчанию 60)
//
// Все данные (пользователи, сотрудники, заявки) хранятся в Durable Object «BotState».

import { buildXlsx } from './xlsx.js';
import { LANGS, MAP_QUERY, OWN, PAGES, PARTNERS, PHOTOS, PICK, PICK_LANG, REC, SOCIALS, T, WHATSAPP } from './texts.js';

const BOT_VERSION = '5.0-cloudflare';
const ALLOWED_ORIGINS = [
  'https://efimtretyak-debug.github.io',
  'https://efimfarmtechnologies.kz',
  'https://www.efimfarmtechnologies.kz',
];
const STATUS = { new: '🆕 Новая', taken: '🛠 В работе', kp: '📄 КП отправлено', won: '✅ Сделка', lost: '❌ Отказ', closed: '✅ Закрыта' };
const PLAIN = { new: 'Новая', taken: 'В работе', kp: 'КП отправлено', won: 'Сделка', lost: 'Отказ', closed: 'Закрыта' };
const CLOSED = new Set(['won', 'lost', 'closed']);
// Шаг «Беру в работу». Пока выключен: из новой заявки сразу «Отправить КП» / «Отказ». Вернуть — true.
const TAKE_STEP = false;
// Сообщения клиенту (на его языке)
const KP_HEAD = {
  ru: (id) => `📄 <b>Коммерческое предложение</b> по вашей заявке #${id} от EFIM FARM TECHNOLOGIES.\n\nЕсли есть вопросы — напишите их прямо здесь, менеджер ответит.`,
  kk: (id) => `📄 #${id} өтініміңіз бойынша EFIM FARM TECHNOLOGIES компаниясының <b>коммерциялық ұсынысы</b>.\n\nСұрақтарыңыз болса — осында жазыңыз, менеджер жауап береді.`,
  de: (id) => `📄 <b>Angebot</b> von EFIM FARM TECHNOLOGIES zu Ihrer Anfrage #${id}.\n\nBei Fragen schreiben Sie einfach hier — ein Manager antwortet.`,
};
const CLIENT_FWD = {
  ru: '✅ Передали ваше сообщение менеджеру, ответ придёт сюда.',
  kk: '✅ Хабарламаңызды менеджерге жібердік, жауап осында келеді.',
  de: '✅ Ihre Nachricht ist beim Manager, die Antwort kommt hier.',
};
const MGR_PREFIX = { ru: '💬 Менеджер EFIM:', kk: '💬 EFIM менеджері:', de: '💬 EFIM-Manager:' };
// Время Казахстана (UTC+5): «23.11.2026 17:05»
const kzTime = (sec) => {
  if (!sec) return '';
  const d = new Date((sec + 5 * 3600) * 1000).toISOString();
  return `${d.slice(8, 10)}.${d.slice(5, 7)}.${d.slice(0, 4)} ${d.slice(11, 16)}`;
};
// Ссылка WhatsApp по номеру клиента (8 777… → 7777…)
const waLink = (phone) => {
  let d = String(phone || '').replace(/\D/g, '');
  if (d.length === 11 && d[0] === '8') d = '7' + d.slice(1);
  if (d.length === 10 && d[0] === '7') d = '7' + d;
  return d.length >= 10 && d.length <= 15 ? `https://wa.me/${d}` : null;
};
const MAX_REMINDS = 3;
const BROADCAST_BATCH = 40;          // сообщений за один запуск расписания (лимит Cloudflare — 50 запросов)
const LANG_NAMES = { ru: 'русский', kk: 'қазақша', de: 'Deutsch' };

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const ids = (s) => String(s || '').split(/[\s,;]+/).filter((x) => /^-?\d+$/.test(x)).map(Number);

// ---------- клавиатуры (аналог InlineKeyboardBuilder.adjust) ----------
class KB {
  constructor() { this.btns = []; }
  button(text, data) { this.btns.push(typeof data === 'object' ? { text, ...data } : { text, callback_data: data }); return this; }
  url(text, url) { this.btns.push({ text, url }); return this; }
  adjust(...sizes) {
    const rows = []; let i = 0, k = 0;
    while (i < this.btns.length) {
      const n = sizes[Math.min(k, sizes.length - 1)] || 1;
      rows.push(this.btns.slice(i, i + n)); i += n; k++;
    }
    return { inline_keyboard: rows };
  }
}

// =====================================================================
// Durable Object: одно хранилище и один «мозг» бота на всех
// =====================================================================
export class BotState {
  constructor(state, env) {
    this.state = state;
    this.s = state.storage;
    this.env = env;
  }

  // ---------- хранилище ----------
  async get(key, def) { const v = await this.s.get(key); return v === undefined ? def : v; }
  async put(key, v) { await this.s.put(key, v); }
  // Чтение-изменение-запись без внешних запросов посередине (атомарно внутри объекта)
  async update(key, def, fn) { const v = await this.get(key, def); const r = fn(v); await this.put(key, v); return r; }

  async users() { return this.get('users', {}); }
  async leads() { return this.get('leads', {}); }
  async savedAdmins() { return this.get('admins', []); }
  async savedStaff() { return this.get('staff', {}); }
  async allAdmins() { return new Set([...ids(this.env.ADMIN_IDS), ...(await this.savedAdmins())]); }
  async allStaff() {
    const s = await this.allAdmins();
    for (const x of ids(this.env.STAFF_IDS)) s.add(x);
    for (const x of Object.keys(await this.savedStaff())) s.add(Number(x));
    return s;
  }
  async isStaff(uid) { return (await this.allStaff()).has(Number(uid)); }
  async isAdmin(uid) { return (await this.allAdmins()).has(Number(uid)); }
  async getLang(uid) { return (await this.users())[String(uid)] || 'ru'; }
  async setLang(uid, l) { await this.update('users', {}, (u) => { u[String(uid)] = l; }); }
  async getState(uid) { return this.get(`st:${uid}`, null); }
  async setState(uid, st) { if (st) await this.put(`st:${uid}`, st); else await this.s.delete(`st:${uid}`); }

  // ---------- Telegram API ----------
  async tg(method, body) {
    try {
      const r = await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/${method}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!j.ok) console.log(`tg ${method} failed: ${j.description}`);
      return j;
    } catch (e) {
      console.log(`tg ${method} error: ${e}`);
      return { ok: false, description: String(e) };
    }
  }
  // Отправка файла (multipart)
  async tgFile(method, field, chat, bytes, filename, caption) {
    const fd = new FormData();
    fd.append('chat_id', String(chat));
    if (caption) { fd.append('caption', caption); fd.append('parse_mode', 'HTML'); }
    fd.append(field, new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), filename);
    try {
      const r = await fetch(`https://api.telegram.org/bot${this.env.TELEGRAM_BOT_TOKEN}/${method}`, { method: 'POST', body: fd });
      const j = await r.json();
      if (!j.ok) console.log(`tg ${method} failed: ${j.description}`);
      return j;
    } catch (e) { return { ok: false, description: String(e) }; }
  }
  send(chat, text, kb, extra = {}) {
    return this.tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', disable_web_page_preview: true, reply_markup: kb, ...extra });
  }
  answer(cb, text, alert = false) {
    return this.tg('answerCallbackQuery', { callback_query_id: cb.id, text, show_alert: alert });
  }
  // Показать раздел: отредактировать сообщение, а если нельзя (фото) — прислать новое
  async show(cb, text, kb) {
    const m = cb.message;
    const r = await this.tg('editMessageText', { chat_id: m.chat.id, message_id: m.message_id, text, parse_mode: 'HTML',
      disable_web_page_preview: true, reply_markup: kb });
    if (!r.ok) {
      if (m.photo) await this.tg('deleteMessage', { chat_id: m.chat.id, message_id: m.message_id });
      await this.send(m.chat.id, text, kb);
    }
    await this.answer(cb);
  }

  // ---------- маршрутизация запросов ----------
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/tg') {
      const u = await request.json().catch(() => null);
      if (u) {
        try { await this.onUpdate(u); } catch (e) { console.log('update error', e && e.stack || e); }
      }
      return new Response('OK');
    }
    if (url.pathname === '/site-lead') return this.siteLead(await request.json());
    if (url.pathname === '/cron') { await this.cron(); return new Response('OK'); }
    if (url.pathname === '/setup') return Response.json(await this.setup(request.headers.get('X-Origin') || url.origin));
    if (url.pathname === '/teardown') return Response.json(await this.teardown());
    if (url.pathname === '/export') return Response.json(await this.exportData());
    if (url.pathname === '/import') return Response.json(await this.importData(await request.json()));
    return new Response('Not found', { status: 404 });
  }

  async onUpdate(u) {
    const user = (u.message && u.message.from) || (u.callback_query && u.callback_query.from);
    if (user) await this.registerAdmin(user);
    if (u.message) return this.onMessage(u.message);
    if (u.callback_query) return this.onCallback(u.callback_query);
  }

  // Если пишет человек из ADMIN_USERNAMES — запоминаем его chat id
  async registerAdmin(user) {
    const names = new Set(String(this.env.ADMIN_USERNAMES || '').split(',').map((x) => x.trim().replace(/^@/, '').toLowerCase()).filter(Boolean));
    if (!user.username || !names.has(user.username.toLowerCase())) return;
    const added = await this.update('admins', [], (a) => { if (a.includes(user.id)) return false; a.push(user.id); return true; });
    if (added) { console.log(`admin @${user.username} registered (${user.id})`); await this.setStaffCommands(user.id); }
  }

  // =====================================================================
  // Сообщения
  // =====================================================================
  async onMessage(m) {
    if (m.chat.type !== 'private') return;
    const uid = m.from.id;
    const text = m.text || '';
    const [cmdRaw, ...rest] = text.startsWith('/') ? text.split(/\s+/) : [null];
    const cmd = cmdRaw ? cmdRaw.slice(1).split('@')[0].toLowerCase() : null;
    const args = text.startsWith('/') ? text.slice(cmdRaw.length).trim() : '';

    if (cmd === 'start') return this.start(m, args);
    if (cmd === 'menu') {
      await this.setState(uid, null);
      if (await this.isStaff(uid)) return this.send(uid, await this.staffMenuText(), await this.kbStaffMenu(uid));
      const l = await this.getLang(uid);
      return this.send(uid, T[l].menu, await this.kbMenu(l));
    }
    if (cmd === 'id') return this.send(m.chat.id, `Your chat ID: <code>${m.chat.id}</code>`);
    if (cmd === 'leads') { if (await this.isStaff(uid)) return this.send(uid, await this.leadsText()); return; }
    if (cmd === 'stats') { if (await this.isStaff(uid)) return this.send(uid, await this.statsText()); return; }
    if (cmd === 'broadcast') return this.cmdBroadcast(m, args);
    if (cmd === 'cancel') { await this.setState(uid, null); return this.send(uid, 'Отменено.'); }
    if (cmd === 'excel') { if (await this.isAdmin(uid)) return this.sendExcel(uid); return; }
    if (cmd === 'invite') { if (await this.isAdmin(uid)) return this.send(uid, `Перешли эту ссылку сотруднику. Она одноразовая: он нажимает, жмёт «Запустить», и он в команде.\n\n${await this.newInvite()}`); return; }
    if (cmd === 'staff') { if (await this.isAdmin(uid)) return this.send(uid, await this.teamText()); return; }
    if (cmd === 'addstaff') return this.cmdAddStaff(m, args);
    if (cmd === 'removestaff') return this.cmdRemoveStaff(m, args);

    const st = await this.getState(uid);
    // Сотрудник отправляет КП клиенту
    if (st && st.step === 'kp') return this.staffSendKp(m, st);
    // Сотрудник ответил (reply) на сообщение клиента — пересылаем клиенту
    if (m.reply_to_message && await this.isStaff(uid)) {
      const client = await this.get(`fw:${uid}:${m.reply_to_message.message_id}`, null);
      if (client) return this.replyToClient(m, client);
    }
    // Свободное сообщение клиента — менеджеру по его заявке
    if (!st) {
      if (!cmd && !(await this.isStaff(uid))) return this.clientMessage(m);
      return;
    }
    // Шаги заявки на КП
    const l = await this.getLang(uid);
    const t = T[l];
    if (st.step === 'name' && m.text) {
      st.name = m.text;
      if (st.need) { st.step = 'phone'; await this.setState(uid, st); return this.send(uid, t.q_phone); }
      st.step = 'need'; await this.setState(uid, st); return this.send(uid, t.q_need);
    }
    if (st.step === 'need' && m.text) { st.need = m.text; st.step = 'phone'; await this.setState(uid, st); return this.send(uid, t.q_phone); }
    if (st.step === 'phone' && m.text) {
      st.phone = m.text; st.step = 'file'; await this.setState(uid, st);
      return this.send(uid, t.q_file, new KB().button(t.b_skip, 'q_skip').adjust(1));
    }
    if (st.step === 'file') {
      if (m.photo) return this.finishQuote(m.from, { type: 'photo', id: m.photo[m.photo.length - 1].file_id });
      if (m.document) return this.finishQuote(m.from, { type: 'document', id: m.document.file_id });
      return this.send(uid, t.q_file);
    }
  }

  async start(m, arg) {
    const uid = m.from.id;
    await this.setState(uid, null);
    if (arg.startsWith('staff_')) {
      const code = arg.slice(6);
      const ok = await this.update('invites', [], (inv) => { const i = inv.indexOf(code); if (i < 0) return false; inv.splice(i, 1); return true; });
      if (!ok) return this.send(uid, 'Эта ссылка уже использована или недействительна. Попроси новую.');
      const name = [m.from.first_name, m.from.last_name].filter(Boolean).join(' ');
      await this.update('staff', {}, (s) => { s[String(uid)] = name; });
      await this.setStaffCommands(uid);
      await this.send(uid, '✅ Ты добавлен как сотрудник. Теперь заявки клиентов будут приходить тебе. Команды: /leads, /stats');
      for (const a of await this.allAdmins()) await this.send(a, `👥 Новый сотрудник: ${esc(name)} (id ${uid})`);
      return;
    }
    if (await this.isStaff(uid)) return this.send(uid, await this.staffMenuText(), await this.kbStaffMenu(uid));
    const r = await this.tg('sendPhoto', { chat_id: uid, photo: PHOTOS.welcome, caption: PICK_LANG, reply_markup: this.kbLang() });
    if (!r.ok) await this.send(uid, PICK_LANG, this.kbLang());
  }

  // =====================================================================
  // Кнопки
  // =====================================================================
  async onCallback(cb) {
    const uid = cb.from.id;
    const d = cb.data || '';
    const l = await this.getLang(uid);
    const t = T[l];

    if (d === 'setlang') return this.show(cb, PICK_LANG, this.kbLang());
    if (d.startsWith('lang:')) {
      const nl = d.split(':')[1] in T ? d.split(':')[1] : 'ru';
      await this.setLang(uid, nl);
      return this.show(cb, T[nl].menu, await this.kbMenu(nl, uid));
    }
    if (d === 'menu') { await this.setState(uid, null); return this.show(cb, t.menu, await this.kbMenu(l, uid)); }
    if (d === 'about') return this.show(cb, t.about, this.kbBack(l, { site: PAGES.about }));
    if (d === 'prod') return this.show(cb, t.prod, this.kbBack(l, { site: PAGES.prod, quote: true }));
    if (d === 'proj') return this.show(cb, t.proj, this.kbBack(l, { site: PAGES.proj }));
    if (d === 'dept') return this.show(cb, t.dept, this.kbBack(l, { quote: true, extra: [[t.b_wa, WHATSAPP]] }));
    if (d === 'contacts') {
      const maps = 'https://maps.google.com/maps?q=' + encodeURIComponent(MAP_QUERY);
      const extra = [[t.b_wa, WHATSAPP], [t.b_map, maps], ...Object.entries(SOCIALS)];
      return this.show(cb, t.contacts, this.kbBack(l, { extra }));
    }
    // каталог
    if (d === 'catalog') return this.show(cb, t.catalog, new KB().button(t.cat_own, 'own').button(t.cat_partners, 'par').button(t.b_back, 'menu').adjust(1));
    if (d === 'own') return this.show(cb, t.own_title, this.kbItems(l, OWN, 'own', 'catalog'));
    if (d === 'par') return this.show(cb, t.par_title, this.kbItems(l, PARTNERS, 'par', 'catalog'));
    if (/^(own|par):/.test(d)) {
      const [kind, key] = d.split(':');
      const item = (kind === 'own' ? OWN : PARTNERS)[key];
      if (!item) return this.answer(cb);
      const [name, desc] = item[l];
      const text = `<b>${name}</b>\n\n${desc}`;
      const kb = this.kbBack(l, { to: kind, quote: true });
      if (PHOTOS[key]) {
        const r = await this.tg('sendPhoto', { chat_id: cb.message.chat.id, photo: PHOTOS[key], caption: text, parse_mode: 'HTML', reply_markup: kb });
        if (r.ok) return this.answer(cb);
      }
      return this.show(cb, text, kb);
    }
    // подбор оборудования
    if (d === 'pick') {
      const b = new KB();
      for (const [k, title] of Object.entries(PICK[l].farm)) b.button(title, `pf:${k}`);
      b.button(t.b_back, 'menu');
      return this.show(cb, PICK[l].start, b.adjust(2, 2, 1));
    }
    if (d.startsWith('pf:')) {
      const farm = d.split(':')[1];
      if (!PICK[l].farm[farm]) return this.answer(cb);
      const b = new KB();
      for (const [k, title] of Object.entries(PICK[l].task)) b.button(title, `pt:${farm}:${k}`);
      b.button(t.b_back, 'pick');
      return this.show(cb, `${PICK[l].farm[farm]}\n\n${PICK[l].q2}`, b.adjust(2, 2, 1, 1));
    }
    if (d.startsWith('pt:')) {
      const [, farm, task] = d.split(':');
      const p = PICK[l];
      if (!p.farm[farm] || !p.task[task]) return this.answer(cb);
      const recs = task === 'milk' && farm !== 'dairy' ? [] : (REC[task] || []);
      const b = new KB();
      let text;
      if (recs.length) {
        text = `${p.farm[farm]} → ${p.task[task]}\n\n${p.res}\n\n${p.note}`;
        for (const [kind, key] of recs) b.button((kind === 'own' ? OWN : PARTNERS)[key][l][0], `${kind}:${key}`);
      } else {
        text = `${p.farm[farm]} → ${p.task[task]}\n\n${p.none}`;
      }
      b.button(p.b_quote, `qpick:${farm}:${task}`);
      b.button(p.b_again, 'pick');
      return this.show(cb, text, b.adjust(...Array(Math.floor((recs.length + 1) / 2)).fill(2), 1, 1));
    }
    if (d.startsWith('qpick:')) {
      const [, farm, task] = d.split(':');
      const ru = PICK.ru;  // сотрудники читают заявку по-русски
      await this.setState(uid, { step: 'name', need: `[Подбор оборудования] Ферма: ${ru.farm[farm]}. Задача: ${ru.task[task]}.` });
      await this.send(cb.message.chat.id, t.q_name, new KB().button(t.q_cancel, 'menu').adjust(1));
      return this.answer(cb);
    }
    if (d === 'quote') {
      await this.setState(uid, { step: 'name' });
      await this.send(cb.message.chat.id, t.q_name, new KB().button(t.q_cancel, 'menu').adjust(1));
      return this.answer(cb);
    }
    if (d === 'q_skip') {
      await this.answer(cb);
      const st = await this.getState(uid);
      if (st && st.step === 'file') return this.finishQuote(cb.from, null);
      return;
    }
    if (d.startsWith('staff:')) return this.staffButtons(cb);
    if (d.startsWith('lead:')) return this.leadAction(cb);
    return this.answer(cb);
  }

  kbLang() {
    const b = new KB();
    for (const [code, title] of Object.entries(LANGS)) b.button(title, `lang:${code}`);
    return b.adjust(1);
  }
  async kbMenu(l, uid) {
    const t = T[l];
    const b = new KB().button(t.b_catalog, 'catalog').button(t.b_about, 'about').button(t.b_prod, 'prod')
      .button(t.b_proj, 'proj').button(t.b_dept, 'dept').button(t.b_contacts, 'contacts')
      .button(PICK[l].btn, 'pick').button(t.b_quote, 'quote').button(t.b_lang, 'setlang');
    if (uid !== undefined && await this.isStaff(uid)) b.button('👷 Меню сотрудника', 'staff:menu');
    return b.adjust(2, 2, 2, 1, 1, 1, 1);
  }
  kbBack(l, { to = 'menu', site, quote = false, extra = [] } = {}) {
    const t = T[l];
    const b = new KB();
    for (const [text, url] of extra) b.url(text, url);
    if (site) b.url(t.b_site, site);
    if (quote) b.button(t.ask_quote, 'quote');
    b.button(t.b_back, to);
    return b.adjust(1);
  }
  kbItems(l, data, prefix, back) {
    const b = new KB();
    for (const [key, names] of Object.entries(data)) b.button(names[l][0], `${prefix}:${key}`);
    b.button(T[l].b_back, back);
    return b.adjust(2);
  }

  // =====================================================================
  // Заявки
  // =====================================================================
  leadText(x) {
    const status = (STATUS[x.status] || x.status) + (x.by ? ` (${esc(x.by)})` : '');
    const src = x.source === 'site'
      ? `🌐 С сайта, язык: ${x.lang}`
      : `Telegram: ${x.tg} (id ${x.uid}), язык: ${x.lang}`;
    const kp = x.kp_at ? `\n📄 КП отправлено: ${kzTime(x.kp_at)}, ${esc(x.kp_by)}${x.kp_count > 1 ? ` (всего ${x.kp_count})` : ''}` : '';
    return `📝 <b>Заявка #${x.id}</b> — ${status}\n\n` +
      `👤 Имя: ${esc(x.name)}\n📞 Телефон: ${esc(x.phone)}\n🔧 Запрос: ${esc(x.need)}${kp}\n\n${src}`;
  }
  leadKb(x) {
    if (CLOSED.has(x.status)) return undefined;
    const b = new KB();
    const site = !x.uid;   // у заявки с сайта нет Telegram клиента
    if (x.status === 'new' && TAKE_STEP) b.button('✅ Беру в работу', `lead:take:${x.id}`);
    const working = x.status === 'taken' || (x.status === 'new' && !TAKE_STEP);
    if (working) b.button(site ? '📄 КП отправлено (вручную)' : '📄 Отправить КП', `lead:${site ? 'kpdone' : 'kp'}:${x.id}`);
    if (x.status === 'kp') {
      if (!site) b.button('📄 Отправить ещё КП', `lead:kp:${x.id}`);
      b.button('✅ Сделка', `lead:won:${x.id}`);
    }
    if (working || x.status === 'kp') b.button('❌ Отказ', `lead:lost:${x.id}`);
    const wa = waLink(x.phone);
    if (wa) b.url('💬 WhatsApp клиенту', wa);
    return b.adjust(1);
  }
  async refreshLead(x) {
    for (const [sid, mid] of Object.entries(x.msgs || {})) {
      await this.tg('editMessageText', { chat_id: Number(sid), message_id: mid, text: this.leadText(x), parse_mode: 'HTML', reply_markup: this.leadKb(x) });
    }
  }

  async createLead(fields) {
    // id и запись — атомарно
    const lead = await this.update('leads', {}, (leads) => {
      const id = Math.max(0, ...Object.keys(leads).map(Number)) + 1;
      const x = { id, status: 'new', by: '', msgs: {}, created: Date.now() / 1000, reminds: 0, ...fields };
      leads[String(id)] = x;
      return x;
    });
    const staff = [...await this.allStaff()];
    if (!staff.length) console.log('Нет ни одного сотрудника: заявку некому отправить!');
    const msgs = {};
    for (const sid of staff) {
      const sent = await this.send(sid, this.leadText(lead), this.leadKb(lead));
      if (sent.ok) {
        msgs[String(sid)] = sent.result.message_id;
        if (lead.file) {
          const cap = `📎 К заявке #${lead.id}`;
          if (lead.file.type === 'photo') await this.tg('sendPhoto', { chat_id: sid, photo: lead.file.id, caption: cap });
          else await this.tg('sendDocument', { chat_id: sid, document: lead.file.id, caption: cap });
        }
      }
    }
    await this.update('leads', {}, (leads) => { if (leads[String(lead.id)]) Object.assign(leads[String(lead.id)].msgs, msgs); });
    return { lead, delivered: Object.keys(msgs).length };
  }

  async finishQuote(u, file) {
    const l = await this.getLang(u.id);
    const st = (await this.getState(u.id)) || {};
    await this.setState(u.id, null);
    await this.createLead({ name: st.name || '', phone: st.phone || '', need: st.need || '',
      tg: u.username ? '@' + u.username : '—', uid: u.id, lang: l, file: file || null, source: 'bot' });
    return this.send(u.id, T[l].q_done, await this.kbMenu(l, u.id));
  }

  async siteLead(d) {
    const cut = (v, n) => String(v || '').trim().slice(0, n);
    const need = [cut(d.need, 300), cut(d.comment, 2000)].filter(Boolean).join('\n') || '—';
    const { delivered } = await this.createLead({ name: cut(d.name, 100), phone: cut(d.phone, 40), need,
      tg: '—', uid: null, lang: d.lang in T ? d.lang : 'ru', file: null, source: 'site' });
    return delivered ? new Response('OK') : new Response('Не удалось доставить заявку', { status: 502 });
  }

  async leadAction(cb) {
    if (!(await this.isStaff(cb.from.id))) return this.answer(cb, 'Нет доступа', true);
    const [, action, lid] = cb.data.split(':');
    const who = [cb.from.first_name, cb.from.last_name].filter(Boolean).join(' ');
    const work = (st) => st === 'taken' || st === 'kp' || (st === 'new' && !TAKE_STEP);
    if (action === 'kp') {    // дальше сотрудник присылает файл или текст КП
      const x = (await this.leads())[lid];
      if (!x) return this.answer(cb, 'Заявка не найдена', true);
      if (!work(x.status) || !x.uid) return this.answer(cb, 'Уже обработано');
      await this.setState(cb.from.id, { step: 'kp', lead: lid });
      await this.send(cb.from.id, `📄 <b>КП для заявки #${x.id}</b> (${esc(x.name)})\n\nПришлите файл (PDF, Excel, Word), фото или текст — бот перешлёт его клиенту от имени компании.\n\nОтмена: /cancel`);
      return this.answer(cb);
    }
    const now = Date.now() / 1000;
    const res = await this.update('leads', {}, (leads) => {
      const x = leads[lid];
      if (!x) return 'missing';
      if (action === 'take' && x.status === 'new') Object.assign(x, { status: 'taken', by: who, by_id: cb.from.id });
      else if (action === 'kpdone' && work(x.status)) Object.assign(x, { status: 'kp', kp_at: now, kp_by: who, kp_count: (x.kp_count || 0) + 1 }, x.by_id ? {} : { by: who, by_id: cb.from.id });
      else if (action === 'won' && x.status === 'kp') Object.assign(x, { status: 'won', closed_at: now });
      else if (action === 'lost' && work(x.status)) Object.assign(x, { status: 'lost', closed_at: now }, x.by_id ? {} : { by: who, by_id: cb.from.id });
      else if (action === 'close' && x.status === 'taken') x.status = 'closed';
      else return 'done';
      return { ...x };
    });
    if (res === 'missing') return this.answer(cb, 'Заявка не найдена', true);
    if (res === 'done') return this.answer(cb, 'Уже обработано');
    await this.refreshLead(res);
    return this.answer(cb, 'Готово');
  }

  // Сотрудник прислал КП (файл / фото / текст) — пересылаем клиенту
  async staffSendKp(m, st) {
    const uid = m.from.id;
    const x = (await this.leads())[st.lead];
    if (!x || !x.uid || CLOSED.has(x.status)) { await this.setState(uid, null); return this.send(uid, 'Заявка уже закрыта или не найдена.'); }
    if (!m.document && !m.photo && !m.text) return this.send(uid, 'Пришлите файл, фото или текст КП. Отмена: /cancel');
    const lang = x.lang in KP_HEAD ? x.lang : 'ru';
    const head = await this.send(x.uid, KP_HEAD[lang](x.id));
    if (!head.ok) {
      await this.setState(uid, null);
      return this.send(uid, `❗️ Не удалось отправить клиенту: ${esc(head.description || '')}\nВозможно, он заблокировал бота — свяжитесь по телефону или WhatsApp.`);
    }
    const copy = await this.tg('copyMessage', { chat_id: x.uid, from_chat_id: m.chat.id, message_id: m.message_id });
    await this.setState(uid, null);
    if (!copy.ok) return this.send(uid, `❗️ Клиенту ушло только сообщение-шапка, сам КП не отправился: ${esc(copy.description || '')}`);
    const who = [m.from.first_name, m.from.last_name].filter(Boolean).join(' ');
    const res = await this.update('leads', {}, (leads) => {
      const y = leads[st.lead];
      Object.assign(y, { status: 'kp', kp_at: Date.now() / 1000, kp_by: who, kp_count: (y.kp_count || 0) + 1 });
      if (!y.by_id) Object.assign(y, { by: who, by_id: uid });
      return { ...y };
    });
    await this.refreshLead(res);
    return this.send(uid, `✅ КП отправлено клиенту ${esc(x.name)} (заявка #${x.id}). Если клиент ответит, его сообщение придёт сюда.`);
  }

  // Клиент написал боту вне заявки — передаём менеджеру его последней открытой заявки
  async clientMessage(m) {
    const uid = m.from.id;
    const l = await this.getLang(uid);
    const open = Object.values(await this.leads()).filter((x) => x.uid === uid && !CLOSED.has(x.status)).sort((a, b) => b.id - a.id)[0];
    if (!open) return this.send(uid, T[l].menu, await this.kbMenu(l, uid));
    const to = open.by_id ? [open.by_id] : [...await this.allStaff()];
    for (const sid of to) {
      const h = await this.send(sid, `💬 <b>Клиент ${esc(open.name)}</b> по заявке #${open.id} (${STATUS[open.status]}):\n<i>Ответьте на сообщение (свайп → «Ответить») — бот передаст ответ клиенту.</i>`);
      if (h.ok) await this.put(`fw:${sid}:${h.result.message_id}`, uid);
      const c = await this.tg('copyMessage', { chat_id: sid, from_chat_id: uid, message_id: m.message_id });
      if (c.ok) await this.put(`fw:${sid}:${c.result.message_id}`, uid);
    }
    return this.send(uid, CLIENT_FWD[l] || CLIENT_FWD.ru);
  }

  // Ответ сотрудника клиенту
  async replyToClient(m, client) {
    const l = await this.getLang(client);
    await this.send(client, MGR_PREFIX[l] || MGR_PREFIX.ru);
    const c = await this.tg('copyMessage', { chat_id: client, from_chat_id: m.chat.id, message_id: m.message_id });
    await this.tg('setMessageReaction', { chat_id: m.chat.id, message_id: m.message_id, reaction: [{ type: 'emoji', emoji: c.ok ? '👍' : '👎' }] });
    if (!c.ok) return this.send(m.chat.id, `❗️ Не доставлено: ${esc(c.description || '')}`);
  }

  // =====================================================================
  // Режим сотрудников
  // =====================================================================
  async leadsText() {
    const open = Object.values(await this.leads()).filter((x) => !CLOSED.has(x.status)).sort((a, b) => a.id - b.id).slice(-10);
    if (!open.length) return 'Открытых заявок нет 👍';
    return '<b>Открытые заявки:</b>\n' + open.map((x) => `#${x.id} ${STATUS[x.status]} — ${esc(x.name)}, ${esc(x.phone)}`).join('\n');
  }
  async statsText() {
    const users = Object.values(await this.users());
    const leads = Object.values(await this.leads());
    const c = (arr, f) => arr.filter(f).length;
    return '<b>Статистика</b>\n' +
      `Пользователей: ${users.length} (🇷🇺 ${c(users, (v) => v === 'ru')}, 🇰🇿 ${c(users, (v) => v === 'kk')}, 🇩🇪 ${c(users, (v) => v === 'de')})\n` +
      `Заявок: ${leads.length}\n` +
      `🆕 новых ${c(leads, (x) => x.status === 'new')}, 🛠 в работе ${c(leads, (x) => x.status === 'taken')}, 📄 КП отправлено ${c(leads, (x) => x.status === 'kp')}\n` +
      `✅ сделок ${c(leads, (x) => x.status === 'won' || x.status === 'closed')}, ❌ отказов ${c(leads, (x) => x.status === 'lost')}`;
  }
  async teamText() {
    const staff = await this.savedStaff();
    const lines = Object.entries(staff).map(([i, n]) => `• ${esc(n)} — <code>${i}</code>  (убрать: /removestaff ${i})`);
    const base = [...await this.allAdmins()].sort().map((a) => `• админ <code>${a}</code>`);
    for (const s of ids(this.env.STAFF_IDS)) if (!staff[String(s)]) base.push(`• сотрудник <code>${s}</code> (из настроек)`);
    const all = base.concat(lines);
    return '<b>Команда</b>\n' + (all.length ? all.join('\n') : 'пока пусто') + '\n\nДобавить: кнопка «Пригласить» или /addstaff ID';
  }
  async staffMenuText() {
    const leads = Object.values(await this.leads());
    return '👷 <b>Меню сотрудника</b>\n\n' +
      `🆕 Новых заявок: ${leads.filter((x) => x.status === 'new').length}\n🛠 В работе: ${leads.filter((x) => x.status === 'taken').length}\n` +
      `📄 Ждут ответа на КП: ${leads.filter((x) => x.status === 'kp').length}`;
  }
  async kbStaffMenu(uid) {
    const b = new KB().button('📋 Открытые заявки', 'staff:leads').button('🛠 Мои заявки', 'staff:mine')
      .button('📊 Статистика', 'staff:stats').button('📦 Каталог', 'catalog')
      .button('👤 Клиентское меню', 'menu').button('🆔 Мой ID', 'staff:id');
    const admin = await this.isAdmin(uid);
    if (admin) b.button('➕ Пригласить сотрудника', 'staff:invite').button('👥 Команда', 'staff:team').button('📣 Рассылка', 'staff:bc')
      .button('📥 Заявки в Excel', 'staff:excel');
    return b.adjust(...[2, 2, 2].concat(admin ? [1, 2, 1] : []));
  }
  kbStaffBack() { return new KB().button('⬅️ Меню сотрудника', 'staff:menu').adjust(1); }

  async newInvite() {
    const code = [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 11);
    await this.update('invites', [], (inv) => { inv.push(code); });
    const me = await this.tg('getMe', {});
    return `https://t.me/${me.ok ? me.result.username : 'EFIMFARMTECHNOLOGIES_bot'}?start=staff_${code}`;
  }

  async staffButtons(cb) {
    const uid = cb.from.id;
    if (!(await this.isStaff(uid))) return this.answer(cb, 'Нет доступа', true);
    const action = cb.data.split(':')[1];
    if (['invite', 'team', 'bc', 'excel'].includes(action) && !(await this.isAdmin(uid))) return this.answer(cb, 'Только для админа', true);
    if (action === 'menu') return this.show(cb, await this.staffMenuText(), await this.kbStaffMenu(uid));
    if (action === 'leads') return this.show(cb, await this.leadsText(), this.kbStaffBack());
    if (action === 'mine') {
      const mine = Object.values(await this.leads()).filter((x) => (x.status === 'taken' || x.status === 'kp') && x.by_id === uid);
      const text = mine.length ? '<b>Мои заявки в работе:</b>\n' + mine.map((x) => `#${x.id} ${STATUS[x.status]} — ${esc(x.name)}, ${esc(x.phone)}`).join('\n')
        : 'У тебя нет заявок в работе.';
      return this.show(cb, text, this.kbStaffBack());
    }
    if (action === 'stats') return this.show(cb, await this.statsText(), this.kbStaffBack());
    if (action === 'id') return this.show(cb, `Твой Telegram ID: <code>${uid}</code>`, this.kbStaffBack());
    if (action === 'team') return this.show(cb, await this.teamText(), this.kbStaffBack());
    if (action === 'invite') return this.show(cb, `Перешли эту ссылку сотруднику (одноразовая):\n\n${await this.newInvite()}`, this.kbStaffBack());
    if (action === 'excel') { await this.answer(cb, 'Готовлю файл…'); return this.sendExcel(uid); }
    if (action === 'bc') return this.show(cb, '📣 Чтобы разослать сообщение всем пользователям бота, напиши:\n\n<code>/broadcast текст сообщения</code>', this.kbStaffBack());
    return this.answer(cb);
  }

  async cmdAddStaff(m, args) {
    if (!(await this.isAdmin(m.from.id))) return;
    const sid = args.trim();
    if (!/^\d+$/.test(sid)) return this.send(m.from.id, 'Напиши так: /addstaff 123456789 (числовой ID сотрудника). Проще: /invite');
    await this.update('staff', {}, (s) => { s[sid] = s[sid] || `id ${sid}`; });
    await this.setStaffCommands(Number(sid));
    return this.send(m.from.id, `Добавлен ${sid}. Пусть он один раз нажмёт /start у бота.`);
  }
  async cmdRemoveStaff(m, args) {
    if (!(await this.isAdmin(m.from.id))) return;
    const sid = args.trim();
    const ok = await this.update('staff', {}, (s) => { if (!(sid in s)) return false; delete s[sid]; return true; });
    if (!ok) return this.send(m.from.id, 'Такого сотрудника нет в списке. Смотри /staff');
    await this.tg('deleteMyCommands', { scope: { type: 'chat', chat_id: Number(sid) } });
    return this.send(m.from.id, `Сотрудник ${sid} удалён, заявки ему больше не приходят.`);
  }

  // ---------- выгрузка заявок в Excel ----------
  async sendExcel(chat) {
    const leads = Object.values(await this.leads()).sort((a, b) => a.id - b.id);
    if (!leads.length) return this.send(chat, 'Заявок пока нет — выгружать нечего.');
    const dt = kzTime;
    const columns = [
      { title: '№', width: 6 }, { title: 'Дата (Алматы)', width: 17 }, { title: 'Статус', width: 11 },
      { title: 'Взял в работу', width: 18 }, { title: 'Имя', width: 20 }, { title: 'Телефон', width: 18 },
      { title: 'Запрос', width: 50 }, { title: 'Источник', width: 10 }, { title: 'Telegram', width: 16 },
      { title: 'Язык', width: 9 }, { title: 'Вложение', width: 10 }, { title: 'КП отправлено', width: 17 },
      { title: 'КП отправил', width: 18 }, { title: 'КП, раз', width: 8 }, { title: 'Закрыта', width: 17 }, { title: 'Напоминаний', width: 12 },
    ];
    const rows = leads.map((x) => [x.id, dt(x.created), PLAIN[x.status] || x.status, x.by || '', x.name, x.phone, x.need,
      x.source === 'site' ? 'Сайт' : 'Бот', x.tg && x.tg !== '—' ? x.tg : '', LANG_NAMES[x.lang] || x.lang || '',
      x.file ? (x.file.type === 'photo' ? 'фото' : 'файл') : '', dt(x.kp_at), x.kp_by || '', x.kp_count || 0, dt(x.closed_at), x.reminds || 0]);
    const bytes = buildXlsx({ sheet: 'Заявки', columns, rows });
    const today = dt(Date.now() / 1000).slice(0, 10).split('.').reverse().join('-');
    const c = (st) => leads.filter((x) => x.status === st).length;
    const caption = `📥 <b>Заявки EFIM</b> на ${dt(Date.now() / 1000)}\nВсего: ${leads.length} (новых ${c('new')}, в работе ${c('taken')}, КП ${c('kp')}, сделок ${c('won') + c('closed')}, отказов ${c('lost')})`;
    const r = await this.tgFile('sendDocument', 'document', chat, bytes, `Заявки_EFIM_${today}.xlsx`, caption);
    if (!r.ok) return this.send(chat, 'Не получилось отправить файл: ' + esc(r.description || ''));
  }

  // Рассылка идёт порциями по расписанию (лимит Cloudflare на число запросов за раз)
  async cmdBroadcast(m, args) {
    if (!(await this.isAdmin(m.from.id))) return;
    if (!args) return this.send(m.from.id, 'Напиши так: /broadcast текст сообщения');
    const queue = Object.keys(await this.users());
    await this.put('broadcast', { text: args, queue, total: queue.length, ok: 0, by: m.from.id });
    await this.send(m.from.id, `📣 Рассылка запущена: ${queue.length} получателей. Отправляю порциями по ${BROADCAST_BATCH} в минуту, по окончании пришлю итог.`);
    return this.broadcastStep();
  }
  async broadcastStep() {
    const job = await this.get('broadcast', null);
    if (!job) return;
    const batch = job.queue.splice(0, BROADCAST_BATCH);
    await this.put('broadcast', job);                     // сразу сохраняем, чтобы порция не ушла дважды
    let ok = 0;
    for (const uid of batch) { const r = await this.send(Number(uid), esc(job.text)); if (r.ok) ok++; }
    job.ok += ok;
    if (job.queue.length) { await this.put('broadcast', job); return; }
    await this.s.delete('broadcast');
    await this.send(job.by, `Отправлено: ${job.ok} из ${job.total}`);
  }

  // ---------- напоминания и рассылка (каждую минуту) ----------
  async cron() {
    await this.broadcastStep();
    const remind = Number(this.env.REMIND_MINUTES || 60);
    const now = Date.now() / 1000;
    const due = await this.update('leads', {}, (leads) => {
      const out = [];
      for (const x of Object.values(leads)) {
        const n = x.reminds || 0;
        if (x.status !== 'new' || !x.created || n >= MAX_REMINDS) continue;
        if (now - x.created < remind * 60 * (n + 1)) continue;
        x.reminds = n + 1;
        out.push({ ...x });
      }
      return out;
    });
    if (!due.length) return;
    const staff = [...await this.allStaff()];
    for (const x of due) {
      const text = `⏰ Заявка #${x.id} без ответа уже ${Math.floor((now - x.created) / 60)} мин.\n\n` + this.leadText(x);
      for (const sid of staff) await this.send(sid, text, this.leadKb(x));
    }
  }

  // ---------- меню команд (кнопка «Меню» слева от поля ввода) ----------
  static CLIENT_COMMANDS = {
    ru: [['start', 'Начать / выбрать язык'], ['menu', 'Главное меню']],
    kk: [['start', 'Бастау / тілді таңдау'], ['menu', 'Басты мәзір']],
    de: [['start', 'Start / Sprache wählen'], ['menu', 'Hauptmenü']],
  };
  static STAFF_COMMANDS = [['leads', 'Открытые заявки'], ['stats', 'Статистика'], ['id', 'Мой Telegram ID']];
  static ADMIN_COMMANDS = [['invite', 'Ссылка-приглашение для сотрудника'], ['staff', 'Список сотрудников'], ['broadcast', 'Рассылка: /broadcast текст'], ['excel', 'Все заявки в Excel']];

  async setStaffCommands(chatId) {
    let pairs = BotState.CLIENT_COMMANDS.ru.concat(BotState.STAFF_COMMANDS);
    if (await this.isAdmin(chatId)) pairs = pairs.concat(BotState.ADMIN_COMMANDS);
    return this.tg('setMyCommands', { commands: pairs.map(([command, description]) => ({ command, description })), scope: { type: 'chat', chat_id: chatId } });
  }

  async setup(origin) {
    const out = {};
    out.webhook = await this.tg('setWebhook', { url: `${origin}/tg`, secret_token: this.env.TG_WEBHOOK_SECRET,
      allowed_updates: ['message', 'callback_query'], drop_pending_updates: false });
    const cmds = (pairs) => pairs.map(([command, description]) => ({ command, description }));
    out.cmd_default = await this.tg('setMyCommands', { commands: cmds(BotState.CLIENT_COMMANDS.ru) });
    for (const [lang, pairs] of Object.entries(BotState.CLIENT_COMMANDS)) out[`cmd_${lang}`] = await this.tg('setMyCommands', { commands: cmds(pairs), language_code: lang });
    for (const sid of await this.allStaff()) out[`staff_${sid}`] = await this.setStaffCommands(sid);
    out.version = BOT_VERSION;
    return out;
  }
  async teardown() {
    return { webhook: await this.tg('deleteWebhook', { drop_pending_updates: false }) };
  }

  // ---------- выгрузка / загрузка данных (перенос с компьютера и резервная копия) ----------
  async exportData() {
    const o = {};
    for (const k of ['users', 'admins', 'staff', 'invites', 'leads']) o[k] = await this.get(k, null);
    return o;
  }
  async importData(d) {
    const done = [];
    for (const k of ['users', 'admins', 'staff', 'invites', 'leads']) if (d[k] !== undefined && d[k] !== null) { await this.put(k, d[k]); done.push(k); }
    return { imported: done };
  }
}

// =====================================================================
// Точка входа Worker: проверки доступа и передача в BotState
// =====================================================================
const stub = (env) => env.STATE.get(env.STATE.idFromName('main'));
const cors = (origin) => ({ 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', 'Vary': 'Origin' });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/tg') {
      if (request.method !== 'POST' || !env.TG_WEBHOOK_SECRET ||
        request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TG_WEBHOOK_SECRET) return new Response('Forbidden', { status: 403 });
      return stub(env).fetch('https://bot/tg', { method: 'POST', body: await request.text() });
    }

    if (['/setup', '/teardown', '/export', '/import'].includes(path)) {
      if (!env.SETUP_KEY || url.searchParams.get('key') !== env.SETUP_KEY) return new Response('Forbidden', { status: 403 });
      return stub(env).fetch(`https://bot${path}`, { method: request.method === 'POST' ? 'POST' : 'GET',
        body: request.method === 'POST' ? await request.text() : undefined, headers: { 'X-Origin': url.origin } });
    }

    // Заявка с сайта
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 });
    const headers = cors(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });
    let data;
    try { data = await request.json(); } catch { return new Response('Bad request', { status: 400, headers }); }
    if (data.website) return new Response('OK', { status: 200, headers });          // ловушка для спам-ботов
    if (!String(data.name || '').trim() || !String(data.phone || '').trim()) return new Response('Name and phone required', { status: 400, headers });
    const r = await stub(env).fetch('https://bot/site-lead', { method: 'POST', body: JSON.stringify(data) });
    return new Response(await r.text(), { status: r.status, headers });
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(stub(env).fetch('https://bot/cron'));
  },
};
