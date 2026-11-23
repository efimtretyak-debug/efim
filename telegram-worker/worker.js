// Cloudflare Worker: принимает заявку с сайта и отправляет её в Telegram.
// Секреты задаются в Cloudflare (Settings → Variables and Secrets), а НЕ в этом файле:
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — куда слать заявки (ваш id, id группы или канала)

const ALLOWED_ORIGINS = [
  'https://efimtretyak-debug.github.io',
  'https://efimfarmtechnologies.kz',
  'https://www.efimfarmtechnologies.kz',
];

const LIMITS = { name: 100, phone: 40, need: 300, comment: 2000 };

function cors(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function esc(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.includes(origin)) return new Response('Forbidden', { status: 403 });
    const headers = cors(origin);

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return new Response('Method not allowed', { status: 405, headers });

    let data;
    try { data = await request.json(); } catch { return new Response('Bad request', { status: 400, headers }); }

    // Ловушка для спам-ботов: настоящий посетитель это поле не видит и не заполняет.
    if (data.website) return new Response('OK', { status: 200, headers });

    const f = {};
    for (const [k, max] of Object.entries(LIMITS)) f[k] = String(data[k] || '').trim().slice(0, max);
    if (!f.name || !f.phone) return new Response('Name and phone required', { status: 400, headers });

    const lang = { ru: 'русский', kk: 'қазақша', de: 'Deutsch' }[data.lang] || '—';
    const text = [
      '<b>Новая заявка с сайта</b>',
      `<b>Имя:</b> ${esc(f.name)}`,
      `<b>Телефон:</b> ${esc(f.phone)}`,
      f.need && `<b>Что нужно:</b> ${esc(f.need)}`,
      f.comment && `<b>Комментарий:</b> ${esc(f.comment)}`,
      `<b>Язык сайта:</b> ${lang}`,
    ].filter(Boolean).join('\n');

    const tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
    });

    if (!tg.ok) return new Response('Telegram error', { status: 502, headers });
    return new Response('OK', { status: 200, headers });
  },
};
