// Умный помощник: отвечает на вопросы клиентов своими словами по каталогу EFIM.
// Работает через Claude API (официальный SDK). Ключ — секрет ANTHROPIC_API_KEY в Cloudflare.
// Если помощник не знает ответа или клиент просит цену / КП, он передаёт вопрос менеджерам.

import Anthropic from '@anthropic-ai/sdk';
import { OWN, PARTNERS, PICK, REC, T, WHATSAPP } from './texts.js';

export const AI_MODEL = 'claude-opus-5-5';
export const AI_HISTORY = 10;          // сколько последних реплик помнить
export const AI_DAILY_LIMIT = 30;      // ответов в сутки на одного клиента (защита от расходов)

// Справка о компании для помощника — собирается из тех же текстов, что и меню бота.
function knowledge() {
  const own = Object.values(OWN).map((x) => `- ${x.ru[0]}: ${x.ru[1]}`).join('\n');
  const par = Object.values(PARTNERS).map((x) => `- ${x.ru[0]}: ${x.ru[1]}`).join('\n');
  const rec = Object.entries(REC).map(([task, list]) =>
    `- ${PICK.ru.task[task]}: ${list.map(([k, key]) => (k === 'own' ? OWN : PARTNERS)[key].ru[0]).join(', ')}`).join('\n');
  const strip = (s) => s.replace(/<[^>]+>/g, '');
  return `# О компании
${strip(T.ru.about)}
ТОО «EFIM FARM TECHNOLOGIES», работает с 2017 года в Казахстане: собственное производство (более 3000 м²), 40 специалистов,
более 100 наименований продукции, более 200 оснащённых молочно-товарных ферм во всех областях Казахстана.
Есть программа локализации производства оборудования Faresin, Eisele и Dairymaster (около 30%).
Гарантийное и постгарантийное обслуживание, запчасти в наличии, свой сервис и логистика.

# Собственное производство
${own}
Световентиляционный конёк делаем индивидуально под каждое здание. Изготавливаем оборудование по заказу клиента.

# Официальный дилер
${par}

# Что подходит под задачу
${rec}

# Отделы
${strip(T.ru.dept)}

# Контакты
WhatsApp и телефон: +7 777 544 06 51, ${WHATSAPP}
Почта: efim@efimfarmtechnologies.kz
Адрес: Тобыл, Тәуелсіздік 69/1
Сайт: https://efimtretyak-debug.github.io/efim/`;
}

const SYSTEM = `Ты — помощник компании EFIM FARM TECHNOLOGIES в Telegram-боте. Компания производит и продаёт оборудование
для молочных и животноводческих ферм в Казахстане и является официальным дилером европейских брендов.
Тебе пишут фермеры и руководители хозяйств.

Как отвечать:
- Отвечай на языке клиента (русский, казахский или немецкий). Коротко и по делу: 2–6 предложений, без markdown и без списков из звёздочек.
- Опирайся только на справку ниже. Если чего-то в ней нет (цены, сроки поставки, наличие конкретной модели, точные размеры,
  скидки, условия оплаты и лизинга), не выдумывай: скажи, что это уточнит менеджер, и поставь handoff = true.
- Цену и коммерческое предложение называет только менеджер. Если клиент спрашивает цену или хочет купить — предложи
  оставить заявку на КП (suggest_quote = true); можешь уточнить поголовье и тип фермы, чтобы КП было точнее.
- Помогай подобрать оборудование: спроси про тип фермы, поголовье и задачу, назови подходящие позиции из справки.
- На вопросы не про фермы и не про компанию вежливо отвечай, что помогаешь только с оборудованием EFIM.
- Не обещай того, чего нет в справке, и не говори о конкурентах.
- handoff = true также если клиент просит связаться с человеком, жалуется, или у него проблема с уже купленным оборудованием.

${knowledge()}`;

const SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'Ответ клиенту на его языке, простой текст' },
    handoff: { type: 'boolean', description: 'Нужно передать вопрос менеджеру' },
    suggest_quote: { type: 'boolean', description: 'Предложить кнопку заявки на КП' },
  },
  required: ['reply', 'handoff', 'suggest_quote'],
  additionalProperties: false,
};

// history: [{role:'user'|'assistant', content:string}], последняя реплика — вопрос клиента.
// Возвращает {reply, handoff, suggest_quote} или {error}.
export async function askAssistant(apiKey, history) {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 45_000 });
  try {
    const response = await client.beta.messages.create({
      model: AI_MODEL,
      max_tokens: 2000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      messages: history,
    });
    if (response.stop_reason === 'refusal') return { error: 'refusal' };
    if (response.stop_reason === 'max_tokens') return { error: 'max_tokens' };
    const text = response.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const out = JSON.parse(text);
    if (typeof out.reply !== 'string' || !out.reply.trim()) return { error: 'empty' };
    return { reply: out.reply.trim(), handoff: !!out.handoff, suggest_quote: !!out.suggest_quote };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) return { error: 'auth' };
    if (e instanceof Anthropic.RateLimitError) return { error: 'rate_limit' };
    if (e instanceof Anthropic.APIError) return { error: `api ${e.status}` };
    if (e instanceof SyntaxError) return { error: 'bad_json' };
    return { error: String(e) };
  }
}
