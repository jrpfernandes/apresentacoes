/* Modo Apresentação — Celebrity Global Realty
 * Mostra a apresentação um slide por vez, em tela cheia, ajustando cada slide à tela.
 * Funciona em todas as apresentações do site (e no portal Blue3, que carrega a mesma página).
 * Abrir: botão "Apresentar" (canto superior direito), tecla P ou ?apresentar na URL.
 * Navegar: setas, espaço, Page Up/Down, roda do mouse, deslizar no celular. Sair: Esc. */
(function () {
  if (window.__modoApresentacao) return;
  window.__modoApresentacao = true;

  var CSS = [
    '#mp-go{position:fixed;top:16px;right:16px;z-index:2147483000;display:flex;align-items:center;gap:8px;padding:9px 16px 9px 13px;border:0;border-radius:999px;background:rgba(29,39,66,.88);color:#fff;font:500 12px/1 Jost,system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.18);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);transition:background .2s,opacity .2s}',
    '#mp-go:hover{background:#1D2742}#mp-go svg{width:14px;height:14px;fill:#D9B48A}',
    '@media(max-width:600px){#mp-go{top:10px;right:10px;padding:8px 11px}#mp-go span{display:none}}',
    'html.mp-on #mp-go{display:none}',
    'html.mp-on,html.mp-on body{overflow:hidden!important;scroll-behavior:auto!important}',
    'html.mp-on body{min-height:100vh;margin:0}',
    'html.mp-on.mp-tall,html.mp-on.mp-tall body{overflow-y:auto!important}',
    'html.mp-on .mp-hide{display:none!important}',
    'html.mp-on .mp-fx{visibility:hidden!important;pointer-events:none!important}',
    'html.mp-on .mp-cur{box-sizing:border-box}',
    'html.mp-on .mp-cur.mp-flex{display:flex!important;flex-direction:column;justify-content:center}',
    'html.mp-on.mp-idle,html.mp-on.mp-idle *{cursor:none!important}',
    '#mp-ui{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:2147483001;display:none;align-items:center;gap:4px;padding:6px;border-radius:999px;background:rgba(20,26,45,.9);color:#fff;font:400 13px/1 Jost,system-ui,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.3);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);transition:opacity .35s}',
    'html.mp-on #mp-ui{display:flex}html.mp-idle #mp-ui{opacity:0;pointer-events:none}',
    '#mp-ui button{all:unset;cursor:pointer;width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#fff;font-size:18px;line-height:1}',
    '#mp-ui button:hover{background:rgba(255,255,255,.14)}#mp-ui button:disabled{opacity:.3;cursor:default;background:none}',
    '#mp-ui svg{width:17px;height:17px;fill:currentColor}',
    '#mp-ui .mp-n{min-width:64px;text-align:center;letter-spacing:.1em;font-variant-numeric:tabular-nums;color:#E8D3B5}',
    '#mp-ui .mp-sep{width:1px;height:22px;background:rgba(255,255,255,.2);margin:0 4px}',
    '#mp-bar{position:fixed;left:0;top:0;height:3px;width:0;background:#B8743F;z-index:2147483001;display:none;transition:width .3s}',
    'html.mp-on #mp-bar{display:block}',
    '#mp-tip{position:fixed;left:50%;top:22px;transform:translateX(-50%);z-index:2147483001;padding:10px 16px;border-radius:8px;background:rgba(20,26,45,.92);color:#fff;font:400 13px/1.4 Jost,system-ui,sans-serif;display:none;max-width:90vw;text-align:center}',
    'html.mp-on #mp-tip.on{display:block}'
  ].join('\n');

  var ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
  var ICON_FS = '<svg viewBox="0 0 24 24"><path d="M4 9V4h5v2H6v3zm11-5h5v5h-2V6h-3zM4 15h2v3h3v2H4zm14 3v-3h2v5h-5v-2z"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24"><path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z"/></svg>';

  var slides = [], i = 0, on = false, usouFs = false, hidden = [], fixos = [], idleT = 0, wheelT = 0, ui, n, bar, tip, prev, next;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html) e.innerHTML = html;
    return e;
  }

  function coletar() {
    var sel = 'body > header, body > section, body > footer, body > main > header, body > main > section, body > main > footer, body > article';
    return Array.prototype.filter.call(document.querySelectorAll(sel), function (s) {
      var cs = getComputedStyle(s);
      return cs.display !== 'none' && cs.position !== 'fixed' && s.offsetHeight > 60;
    });
  }

  function ajustar() {
    var s = slides[i]; if (!s) return;
    var vh = window.innerHeight;
    s.style.zoom = ''; s.style.minHeight = ''; s.classList.remove('mp-flex');
    var h = s.scrollHeight;
    var z = Math.min(1, vh / h);
    if (z < 0.5) z = 0.5;
    if (z < 1) s.style.zoom = z;
    s.style.minHeight = (vh / z) + 'px';
    if (getComputedStyle(s).display === 'block') s.classList.add('mp-flex');
    document.documentElement.classList.toggle('mp-tall', h * z > vh + 2);
  }

  function mostrar(k) {
    if (!slides.length) return;
    i = Math.max(0, Math.min(slides.length - 1, k));
    slides.forEach(function (s, j) {
      s.classList.toggle('mp-hide', j !== i);
      s.classList.toggle('mp-cur', j === i);
      if (j !== i) { s.style.zoom = ''; s.style.minHeight = ''; s.classList.remove('mp-flex'); }
    });
    ajustar();
    window.scrollTo(0, 0);
    n.textContent = (i + 1) + ' / ' + slides.length;
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    try { history.replaceState(null, '', location.pathname + location.search + '#slide-' + (i + 1)); } catch (e) {}
    // mapas e componentes que dependem do tamanho da tela
    setTimeout(function () { window.dispatchEvent(new Event('resize')); ajustar(); }, 60);
    acordar();
  }

  function atual() {
    var y = window.innerHeight * 0.35, best = 0;
    slides.forEach(function (s, j) { if (s.getBoundingClientRect().top <= y) best = j; });
    return best;
  }

  function entrar(semTelaCheia) {
    if (on) return;
    slides = coletar(); if (!slides.length) return;
    var k = atual();
    var m = /#slide-(\d+)/.exec(location.hash); if (m) k = +m[1] - 1;
    // esconde os botões e barras fixos da página (WhatsApp, navegação, cabeçalho fixo)
    fixos = [];
    Array.prototype.forEach.call(document.body.querySelectorAll('*'), function (e) {
      if (e.id && e.id.indexOf('mp-') === 0) return;
      var cs = getComputedStyle(e);
      if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden') return;
      var r = e.getBoundingClientRect();
      if (r.width * r.height > window.innerWidth * window.innerHeight * 0.4) return; // overlays (lightbox) ficam
      e.classList.add('mp-fx'); fixos.push(e);
    });
    on = true;
    document.documentElement.classList.add('mp-on');
    usouFs = false;
    if (!semTelaCheia) telaCheia(true);
    mostrar(k);
  }

  function sair() {
    if (!on) return;
    on = false;
    var s = slides[i];
    slides.forEach(function (x) { x.classList.remove('mp-hide', 'mp-cur', 'mp-flex'); x.style.zoom = ''; x.style.minHeight = ''; });
    fixos.forEach(function (e) { e.classList.remove('mp-fx'); });
    document.documentElement.classList.remove('mp-on', 'mp-idle', 'mp-tall');
    tip.classList.remove('on');
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function () {});
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (s) s.scrollIntoView({ block: 'start' });
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 60);
  }

  function telaCheia(entrarFs) {
    var d = document.documentElement;
    if (entrarFs && !document.fullscreenElement && d.requestFullscreen) {
      d.requestFullscreen().then(function () { usouFs = true; }).catch(function () {});
    } else if (!entrarFs && document.fullscreenElement) {
      document.exitFullscreen().catch(function () {});
    }
  }

  function acordar() {
    document.documentElement.classList.remove('mp-idle');
    clearTimeout(idleT);
    idleT = setTimeout(function () { if (on) document.documentElement.classList.add('mp-idle'); }, 2600);
  }

  function digitando(t) {
    return t && (/^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName) || t.isContentEditable);
  }

  function lightboxAberto() {
    var lb = document.getElementById('lb') || document.getElementById('pmodal');
    if (!lb) return false;
    var cs = getComputedStyle(lb);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }

  function onKey(e) {
    if (digitando(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (!on) {
      if (k === 'p' || k === 'P') { e.preventDefault(); entrar(); }
      return;
    }
    if (lightboxAberto()) return;
    var mv = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, Enter: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1, Backspace: -1 }[k];
    if (mv) {
      // em slide mais alto que a tela, ↑ ↓ rolam o slide antes de trocar
      var se = document.scrollingElement, alto = document.documentElement.classList.contains('mp-tall');
      if (alto && (k === 'ArrowDown' || k === 'ArrowUp')) {
        var fim = se.scrollTop + window.innerHeight >= se.scrollHeight - 4, ini = se.scrollTop <= 2;
        if ((k === 'ArrowDown' && !fim) || (k === 'ArrowUp' && !ini)) return;
      }
      e.preventDefault(); e.stopImmediatePropagation(); mostrar(i + mv);
    } else if (k === 'Home') { e.preventDefault(); e.stopImmediatePropagation(); mostrar(0); }
    else if (k === 'End') { e.preventDefault(); e.stopImmediatePropagation(); mostrar(slides.length - 1); }
    else if (k === 'Escape') { e.preventDefault(); sair(); }
    else if (k === 'f' || k === 'F') { e.preventDefault(); telaCheia(!document.fullscreenElement); }
    else if (k === 'p' || k === 'P') { e.preventDefault(); sair(); }
  }

  function onWheel(e) {
    if (!on || lightboxAberto()) return;
    var se = document.scrollingElement;
    if (document.documentElement.classList.contains('mp-tall')) {
      var fim = se.scrollTop + window.innerHeight >= se.scrollHeight - 4, ini = se.scrollTop <= 2;
      if ((e.deltaY > 0 && !fim) || (e.deltaY < 0 && !ini)) return;
    }
    e.preventDefault();
    if (Math.abs(e.deltaY) < 8 || Date.now() - wheelT < 650) return;
    wheelT = Date.now();
    mostrar(i + (e.deltaY > 0 ? 1 : -1));
  }

  var tx = 0, ty = 0;
  function onTouchStart(e) { if (on && e.touches.length === 1) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; } }
  function onTouchEnd(e) {
    if (!on || lightboxAberto() || !e.changedTouches.length) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) mostrar(i + (dx < 0 ? 1 : -1));
    acordar();
  }

  function init() {
    var st = el('style', { id: 'mp-css' }); st.textContent = CSS; document.head.appendChild(st);
    var go = el('button', { id: 'mp-go', type: 'button', title: 'Modo apresentação (tecla P)', 'aria-label': 'Modo apresentação' }, ICON_PLAY + '<span>Apresentar</span>');
    go.addEventListener('click', function () { entrar(); });
    ui = el('div', { id: 'mp-ui', role: 'toolbar', 'aria-label': 'Controles da apresentação' });
    prev = el('button', { type: 'button', title: 'Anterior (←)', 'aria-label': 'Slide anterior' }, '‹');
    n = el('span', { 'class': 'mp-n' });
    next = el('button', { type: 'button', title: 'Próximo (→)', 'aria-label': 'Próximo slide' }, '›');
    var fs = el('button', { type: 'button', title: 'Tela cheia (F)', 'aria-label': 'Tela cheia' }, ICON_FS);
    var x = el('button', { type: 'button', title: 'Sair (Esc)', 'aria-label': 'Sair do modo apresentação' }, ICON_X);
    prev.addEventListener('click', function () { mostrar(i - 1); });
    next.addEventListener('click', function () { mostrar(i + 1); });
    fs.addEventListener('click', function () { telaCheia(!document.fullscreenElement); });
    x.addEventListener('click', sair);
    ui.appendChild(prev); ui.appendChild(n); ui.appendChild(next);
    ui.appendChild(el('span', { 'class': 'mp-sep' })); ui.appendChild(fs); ui.appendChild(x);
    bar = el('div', { id: 'mp-bar' });
    tip = el('div', { id: 'mp-tip' }, 'Use as setas ← → para avançar · F tela cheia · Esc sair');
    document.body.appendChild(go); document.body.appendChild(ui); document.body.appendChild(bar); document.body.appendChild(tip);
    if (!document.fullscreenEnabled) fs.style.display = 'none';

    window.addEventListener('keydown', onKey, true);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('mousemove', function () { if (on) acordar(); });
    window.addEventListener('resize', function () { if (on) ajustar(); });
    document.addEventListener('fullscreenchange', function () {
      // Esc na tela cheia: o navegador sai da tela cheia; o modo apresentação sai junto
      if (on && usouFs && !document.fullscreenElement) sair();
      else if (document.fullscreenElement) usouFs = true;
    });

    if (/[?&]apresentar\b/.test(location.search)) {
      setTimeout(function () {
        entrar(true);
        tip.classList.add('on');
        setTimeout(function () { tip.classList.remove('on'); }, 4500);
      }, 400);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
