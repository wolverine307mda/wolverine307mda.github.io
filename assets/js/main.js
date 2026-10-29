(() => {
  const html = document.documentElement;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Escenas de scroll y desplazamiento con peso ---------- */
  if (window.Stage) { Stage.smooth(); Stage.init(); }

  /* ---------- Cabecera: su tinta sigue al fondo de cada capítulo ---------- */
  const top = document.querySelector('.top');
  if (window.ScrollTrigger) {
    document.querySelectorAll('[data-tone]').forEach((el) => {
      const cls = el.dataset.tone === 'paper' ? 'is-paper' : 'is-light';
      ScrollTrigger.create({
        trigger: el,
        start: el.dataset.toneStart || 'top 40px',
        end: 'bottom 40px',
        onToggle: (self) => top.classList.toggle(cls, self.isActive),
      });
    });
  }

  /* ---------- Código que fluye: filas sin fin con empuje del scroll ---------- */
  document.querySelectorAll('.code__row').forEach((row) => {
    const copy = row.firstElementChild.cloneNode(true);
    row.append(copy);
    if (window.gsap && !reduced()) {
      const speed = Number(row.dataset.speed) || 1;
      gsap.fromTo(row, { x: 0 }, {
        x: () => -speed * window.innerWidth * 0.25,
        ease: 'none',
        scrollTrigger: { trigger: '.code', start: 'top bottom', end: 'bottom top', scrub: 0.4, invalidateOnRefresh: true },
      });
    }
  });

  /* ---------- Inclinación 3D: tarjetas que siguen al ratón ---------- */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced()) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const max = Number(el.dataset.tilt) || 8;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  /* ---------- Entradas al hacer scroll (una vez) ---------- */
  const pending = new Set();
  const show = (el) => { el.classList.add('is-in'); pending.delete(el); io.unobserve(el); };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) show(e.target);
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  const reveal = { observe: (el) => { pending.add(el); io.observe(el); } };
  // Un salto (ancla, recorrido) puede dejar elementos por encima sin cruzar la pantalla: se muestran igual
  let sweeping = false;
  const sweep = () => {
    sweeping = false;
    for (const el of pending) if (el.getBoundingClientRect().top < window.innerHeight * 0.9) show(el);
  };
  window.addEventListener('scroll', () => { if (!sweeping && pending.size) { sweeping = true; requestAnimationFrame(sweep); } }, { passive: true });
  document.querySelectorAll('[data-reveal]').forEach((el) => reveal.observe(el));

  /* ---------- Stack: cartel que entra palabra a palabra ---------- */
  const hint = document.querySelector('[data-stack-hint]');
  const techs = [...document.querySelectorAll('.lineup button')];
  document.querySelectorAll('.lineup').forEach((list) => {
    list.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));
    reveal.observe(list);
  });
  const pick = (btn) => {
    techs.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    hint.textContent = `${btn.textContent}: lo uso en ${btn.dataset.used}.`;
  };
  techs.forEach((btn) => {
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => pick(btn));
    btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(btn); });
  });

  /* ---------- Tema: modo día/noche/sistema y color ---------- */
  const store = {
    get: (k, d) => { try { return localStorage.getItem(k) || d; } catch { return d; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  };
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  let mode = store.get('mode', 'system');
  let color = store.get('color', 'naranja');

  const render = () => {
    const dark = mode === 'dark' || (mode === 'system' && systemDark.matches);
    html.dataset.mode = dark ? 'dark' : 'light';
    html.dataset.color = color;
    document.querySelectorAll('[data-mode-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.modeSet === mode)));
    document.querySelectorAll('[data-color-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.colorSet === color)));
    metaTheme.content = getComputedStyle(document.body).backgroundColor;
  };

  // El nuevo tema se abre en círculo desde el botón pulsado
  const applyTheme = (change, origin) => {
    if (origin) {
      const r = origin.getBoundingClientRect();
      html.style.setProperty('--vt-x', `${r.left + r.width / 2}px`);
      html.style.setProperty('--vt-y', `${r.top + r.height / 2}px`);
    }
    const run = () => { change(); render(); };
    if (document.startViewTransition && !reduced()) {
      document.startViewTransition(run);
    } else {
      html.classList.add('is-theming');
      run();
      setTimeout(() => html.classList.remove('is-theming'), 600);
    }
  };

  document.querySelectorAll('[data-mode-set]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(() => { mode = btn.dataset.modeSet; store.set('mode', mode); }, btn));
  });
  document.querySelectorAll('[data-color-set]').forEach((btn) => {
    btn.addEventListener('click', () => applyTheme(() => { color = btn.dataset.colorSet; store.set('color', color); }, btn));
  });
  systemDark.addEventListener('change', () => { if (mode === 'system') render(); });
  render();

  /* ---------- Paneles de la cabecera: pincel (tema) y persona (acceso) ---------- */
  const panels = [...document.querySelectorAll('[data-palette-toggle], [data-account-toggle]')].map((btn) => ({
    btn, el: document.getElementById(btn.getAttribute('aria-controls')),
  }));
  const setPanel = (panel, open) => {
    panel.el.hidden = !open;
    panel.el.classList.toggle('is-open', open);
    panel.btn.setAttribute('aria-expanded', String(open));
    if (open) panel.el.querySelector('[aria-pressed="true"], a, button')?.focus({ preventScroll: true });
  };
  const anyOpen = () => panels.some((p) => !p.el.hidden);
  panels.forEach((panel) => panel.btn.addEventListener('click', () => {
    const open = panel.el.hidden;
    panels.forEach((p) => setPanel(p, p === panel && open));
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = panels.find((p) => !p.el.hidden);
    if (open) { setPanel(open, false); open.btn.focus(); }
  });
  document.addEventListener('pointerdown', (e) => {
    panels.forEach((p) => { if (!p.el.hidden && !p.el.contains(e.target) && !p.btn.contains(e.target)) setPanel(p, false); });
  });

  // Acceso: mientras la app no tenga dirección, el botón no lleva a ningún sitio
  const appLink = document.querySelector('[data-app-url]');
  appLink.addEventListener('click', (e) => { if (appLink.getAttribute('aria-disabled') === 'true') e.preventDefault(); });

  /* ---------- Recorrido automático: baja despacio por toda la web ---------- */
  const tour = document.querySelector('[data-tour]');
  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const scrollToY = (y) => (window.Stage?.lenis ? Stage.lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y));
  let touring = false, pos = 0, last = 0;

  const step = (t) => {
    if (!touring) return;
    const dt = Math.min(64, t - (last || t)) / 1000;
    last = t;
    pos = Math.min(maxScroll(), pos + window.innerHeight * 0.17 * dt);
    scrollToY(pos);
    if (pos >= maxScroll()) { stopTour(); return; }
    requestAnimationFrame(step);
  };
  const startTour = () => {
    if (window.scrollY >= maxScroll() - 2) scrollToY(0);
    touring = true; pos = window.scrollY; last = 0;
    tour.setAttribute('aria-pressed', 'true');
    tour.setAttribute('aria-label', 'Pausar el recorrido');
    requestAnimationFrame(step);
  };
  function stopTour() {
    touring = false;
    tour.setAttribute('aria-pressed', 'false');
    tour.setAttribute('aria-label', 'Recorrer la web automáticamente');
  }
  tour.addEventListener('click', () => (touring ? stopTour() : startTour()));
  // La mano del visitante manda: cualquier gesto propio para el recorrido
  ['wheel', 'touchstart'].forEach((ev) => window.addEventListener(ev, () => { if (touring) stopTour(); }, { passive: true }));
  window.addEventListener('keydown', (e) => { if (touring && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key) && e.target !== tour) stopTour(); });

  const updateProgress = () => tour.style.setProperty('--progress', (window.scrollY / Math.max(1, maxScroll())).toFixed(4));
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- La cabecera se aparta al bajar y vuelve al subir ---------- */
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (Math.abs(y - lastY) < 6) return;
    top.classList.toggle('is-hidden', y > lastY && y > 120 && !anyOpen());
    lastY = y;
  }, { passive: true });

  /* ---------- Hora de Madrid en el contacto ---------- */
  const clocks = document.querySelectorAll('[data-clock]');
  const fmt = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
  const tickClock = () => { const t = fmt.format(new Date()); clocks.forEach((c) => { c.textContent = t; }); };
  tickClock();
  setInterval(tickClock, 30000);

  /* ---------- "¿Hablamos?" sube desde su línea ---------- */
  reveal.observe(document.querySelector('.contact__title'));

  /* ---------- Copiar email ---------- */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const out = btn.querySelector('[data-copy-label]') || btn;
    const label = out.textContent;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        out.textContent = 'Copiado';
      } catch {
        location.href = `mailto:${btn.dataset.copy}`;
      }
      setTimeout(() => { out.textContent = label; }, 2000);
    });
  });

  /* ---------- Año ---------- */
  document.querySelector('[data-year]').textContent = new Date().getFullYear();
})();
