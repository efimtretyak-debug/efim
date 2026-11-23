# EFIM Farm Technologies — сайт

Статический сайт на трёх языках: русский (корень), казахский (`/kk/`), немецкий (`/de/`).
Публикуется через GitHub Pages из ветки `main`.

## Как менять тексты
1. Тексты всех языков — в `tools/content.py` (политика конфиденциальности — `tools/privacy_ru.html`).
2. Пересобрать страницы: `python3 tools/build.py`
3. Стили — `assets/style.css`, скрипт — `assets/main.js`, фото — `assets/img/`.

Старые ссылки вида `?page_id=8570` автоматически ведут на новые страницы.

## Заявки и Telegram-бот
Форма на сайте отправляет заявки в Cloudflare Worker `efim-leads` (адрес в `LEAD_ENDPOINT`, `assets/main.js`),
он же работает как Telegram-бот. Подробности — `telegram-bot/README.md`.

## Свой домен
Когда будете переводить efimfarmtechnologies.kz: замените `SITE` в `tools/build.py` и пересоберите.
