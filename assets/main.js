(function () {
  // Адрес Cloudflare Worker, который пересылает заявки в Telegram (см. telegram-worker/README.md).
  // Пока пусто — заявка открывается в WhatsApp.
  var LEAD_ENDPOINT = 'https://efim-leads.efimfarm.workers.dev';
  var WA = 'https://wa.me/77775440651';

  // Старые ссылки WordPress (?page_id=...) ведут на новые страницы
  var old = { '7666': 'about.html', '8354': 'index.html#production', '8226': 'faresin.html', '8275': 'eisele.html',
    '8457': 'urban.html', '8570': 'privacy.html', '8396': 'index.html#brands', '8488': 'index.html#brands' };
  var m = location.search.match(/[?&]page_id=(\d+)/);
  if (m && old[m[1]]) { location.replace(old[m[1]]); return; }

  var lang = (document.documentElement.lang || 'ru').slice(0, 2);
  var L = {
    ru: { hello: 'Здравствуйте! Меня зовут ', phone: ', телефон ', need: ' Интересует: ', sending: 'Отправляем…',
          ok: 'Спасибо! Заявка отправлена — мы скоро свяжемся с вами.', err: 'Не удалось отправить. Напишите нам в WhatsApp или позвоните: +7 777 544 06 51.',
          req: 'Укажите имя и телефон.' },
    kk: { hello: 'Сәлеметсіз бе! Менің атым ', phone: ', телефон ', need: ' Қызықтырады: ', sending: 'Жіберілуде…',
          ok: 'Рахмет! Өтінім жіберілді — жақын арада хабарласамыз.', err: 'Жіберу мүмкін болмады. WhatsApp-қа жазыңыз немесе қоңырау шалыңыз: +7 777 544 06 51.',
          req: 'Атыңыз бен телефоныңызды көрсетіңіз.' },
    de: { hello: 'Guten Tag! Mein Name ist ', phone: ', Telefon ', need: ' Bedarf: ', sending: 'Wird gesendet…',
          ok: 'Danke! Ihre Anfrage wurde gesendet — wir melden uns in Kürze.', err: 'Senden fehlgeschlagen. Schreiben Sie uns per WhatsApp oder rufen Sie an: +7 777 544 06 51.',
          req: 'Bitte Name und Telefon angeben.' }
  }[lang] || null;
  if (!L) L = { hello: 'Здравствуйте! Меня зовут ', phone: ', телефон ', need: ' Интересует: ', sending: '…', ok: 'OK', err: 'Error', req: '!' };

  var tog = document.querySelector('.tog'), nav = document.getElementById('nav');
  if (tog && nav) {
    var set = function (o) { nav.classList.toggle('open', o); tog.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    tog.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var form = document.getElementById('lead');
  if (!form) return;
  var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
  var status = form.querySelector('.status');
  var btn = form.querySelector('button[type=submit]');
  var waBtn = form.querySelector('.wa-btn');
  var text = function () {
    return L.hello + v('n') + L.phone + v('p') + '.' + (v('q') ? L.need + v('q') + '.' : '') + (v('m') ? ' ' + v('m') : '');
  };
  var show = function (msg, cls) { status.textContent = msg; status.className = 'status ' + (cls || ''); };

  if (waBtn) waBtn.addEventListener('click', function () {
    if (v('n') || v('p')) waBtn.href = WA + '?text=' + encodeURIComponent(text());
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!v('n') || !v('p')) { show(L.req, 'err'); return; }
    if (!LEAD_ENDPOINT) { window.open(WA + '?text=' + encodeURIComponent(text()), '_blank', 'noopener'); return; }
    btn.disabled = true; show(L.sending);
    fetch(LEAD_ENDPOINT, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: v('n'), phone: v('p'), need: v('q'), comment: v('m'), website: v('w'),
        lang: lang, page: location.pathname })
    }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      show(L.ok, 'ok'); form.reset();
    }).catch(function () { show(L.err, 'err'); })
      .then(function () { btn.disabled = false; });
  });
})();
