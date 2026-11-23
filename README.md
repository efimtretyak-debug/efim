# EFIM Farm Technologies — сайт

Статический сайт на трёх языках: русский (корень), казахский (`/kk/`), немецкий (`/de/`).
Публикуется через GitHub Pages из ветки `main`.

## Как менять тексты
1. Тексты всех языков — в `tools/content.py` (политика конфиденциальности — `tools/privacy_ru.html`).
2. Пересобрать страницы: `python3 tools/build.py`
3. Стили — `assets/style.css`, скрипт — `assets/main.js`, фото — `assets/img/`.

Старые ссылки вида `?page_id=8570` автоматически ведут на новые страницы.

## Заявки в Telegram
См. `telegram-worker/README.md`. После настройки впишите адрес воркера в `LEAD_ENDPOINT` в `assets/main.js`.
Пока адрес пустой, форма открывает WhatsApp.

## Свой домен
Когда будете переводить efimfarmtechnologies.kz: замените `SITE` в `tools/build.py` и пересоберите.
