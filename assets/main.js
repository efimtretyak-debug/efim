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

  // Новости: подгружаются из бота (Cloudflare Worker). Нет новостей / ошибка — блок остаётся скрытым.
  document.querySelectorAll('[data-news]').forEach(function (box) {
    var api = box.getAttribute('data-news'), limit = +box.getAttribute('data-limit') || 3;
    var full = box.classList.contains('full'), lang = box.getAttribute('data-lang') || 'ru';
    var locale = { ru: 'ru-RU', kk: 'kk-KZ', de: 'de-DE' }[lang] || 'ru-RU';
    var escH = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var linkify = function (x) { return x.replace(/https?:\/\/[^\s<]+/g, function (u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + u + '</a>'; }); };
    var fmt = function (sec) { try { return new Date(sec * 1000).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return new Date(sec * 1000).toLocaleDateString(); } };
    var showEmpty = function () { if (full) box.innerHTML = '<p class="news-empty">' + escH(box.getAttribute('data-empty')) + '</p>'; };
    fetch(api + '/news').then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (list) {
      list = (list || []).slice(0, limit);
      if (!list.length) return showEmpty();
      box.innerHTML = list.map(function (n) {
        var lines = String(n.text || '').split('\n');
        var title = lines.shift().trim(), body = lines.join('\n').trim();
        var long = body.length > 220;
        return '<article class="news-card">' +
          (n.photo ? '<img src="' + api + '/news/photo/' + n.id + '" alt="" loading="lazy">' : '<div class="nph" aria-hidden="true"></div>') +
          '<div class="nb"><time>' + fmt(n.date) + '</time>' +
          (title ? '<h3>' + linkify(escH(title)) + '</h3>' : '') +
          (body ? '<p class="nt' + (long ? ' clip' : '') + '">' + linkify(escH(body)).replace(/\n/g, '<br>') + '</p>' : '') +
          (long ? '<button type="button" class="more">' + escH(box.getAttribute('data-more')) + '</button>' : '') +
          '</div></article>';
      }).join('');
      box.querySelectorAll('.more').forEach(function (b) {
        b.addEventListener('click', function () {
          var p = b.previousElementSibling, open = p.classList.toggle('clip');
          b.textContent = box.getAttribute(open ? 'data-more' : 'data-less');
        });
      });
      var sec = box.closest('section[hidden]');
      if (sec) sec.hidden = false;
    }).catch(showEmpty);
  });

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
