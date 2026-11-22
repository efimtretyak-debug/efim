(function () {
  var b = document.querySelector('.nav-toggle'), n = document.querySelector('.site-nav');
  if (!b || !n) return;
  function set(open) { n.classList.toggle('open', open); b.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  b.addEventListener('click', function () { set(!n.classList.contains('open')); });
  n.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
})();
