(function () {
  // Старые ссылки WordPress (?page_id=...) ведут на новые страницы
  var old = { '7666': 'about.html', '8354': 'index.html#production', '8226': 'faresin.html', '8275': 'eisele.html',
    '8457': 'urban.html', '8570': 'privacy.html', '8396': 'index.html#brands', '8488': 'index.html#brands' };
  var m = location.search.match(/[?&]page_id=(\d+)/);
  if (m && old[m[1]]) { location.replace(old[m[1]]); return; }

  var tog = document.querySelector('.tog'), nav = document.getElementById('nav');
  if (tog && nav) {
    var set = function (o) { nav.classList.toggle('open', o); tog.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    tog.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var form = document.getElementById('lead');
  if (form) form.addEventListener('submit', function (e) {
    e.preventDefault();
    var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var txt = 'Здравствуйте! Меня зовут ' + v('n') + ', телефон ' + v('p') + '.' +
      (v('q') ? ' Интересует: ' + v('q') + '.' : '') + (v('m') ? ' ' + v('m') : '');
    window.open('https://wa.me/77775440651?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });
})();
