# Заявки с сайта в Telegram

Токен бота нельзя хранить на сайте — сайт открыт всем, и токен украдут.
Поэтому заявки идут через бесплатный Cloudflare Worker, где токен хранится в секрете.

Сайт → Cloudflare Worker (хранит токен) → Telegram-бот → вам в чат

## 1. Узнать chat_id
- Напишите своему боту любое сообщение (нажмите «Start»).
- Для личного чата: напишите @userinfobot — он пришлёт ваш **Id** (число).
- Для группы: добавьте бота в группу, напишите там сообщение, затем откройте в браузере
  `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найдите `"chat":{"id":-100...}`.

## 2. Создать воркер
1. Зарегистрируйтесь на https://dash.cloudflare.com (бесплатно).
2. **Workers & Pages → Create → Create Worker** (Hello World), имя например `efim-leads` → **Deploy**.
3. **Edit code** → удалите всё, вставьте содержимое `worker.js` → **Deploy**.
4. **Settings → Variables and Secrets → Add**, тип **Secret**:
   - `TELEGRAM_BOT_TOKEN` — токен от @BotFather
   - `TELEGRAM_CHAT_ID` — число из шага 1
5. Скопируйте адрес воркера, вида `https://efim-leads.<ваше-имя>.workers.dev`.

## 3. Подключить к сайту
Уже подключено: воркер `efim-leads`, адрес `https://efim-leads.efimfarm.workers.dev` (в `assets/main.js`, `LEAD_ENDPOINT`).

Воркер принимает заявки только с адресов из `ALLOWED_ORIGINS` в `worker.js`.
