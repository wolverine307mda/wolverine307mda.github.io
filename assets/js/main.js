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

  // Acceso: al abrir el panel se mira si el equipo de casa está encendido (GET /api/salud)
  // y el botón lleva directo a su inicio de sesión; si está apagado, lo dice en vez de llevar a una página caída
  const appLink = document.querySelector('[data-app-url]');
  const appEstado = document.querySelector('[data-app-estado]');
  let comprobado = 0;
  const comprobarApp = async () => {
    if (Date.now() - comprobado < 15000) return;
    comprobado = Date.now();
    appEstado.dataset.appEstado = 'comprobando';
    appEstado.querySelector('em').textContent = 'comprobando el equipo de casa…';
    if (await window.Privada.salud()) {
      appEstado.dataset.appEstado = 'en-linea';
      appEstado.querySelector('em').textContent = 'equipo de casa · en línea';
    } else {
      appEstado.dataset.appEstado = 'apagado';
      appEstado.querySelector('em').textContent = 'equipo de casa · apagado ahora mismo';
      comprobado = 0;
    }
  };
  document.querySelector('[data-account-toggle]').addEventListener('click', comprobarApp);
  appLink.addEventListener('click', (e) => {
    if (appEstado.dataset.appEstado !== 'apagado') return;
    e.preventDefault();
    comprobarApp();
  });

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

  /* ---------- Galería: sale de mi zona privada y solo existe mientras el equipo de casa está encendido ---------- */
  const gallerySection = document.getElementById('galeria');
  const galleryGrid = gallerySection.querySelector('[data-gallery]');
  const filtersBox = gallerySection.querySelector('[data-filters]');
  const galleryCount = gallerySection.querySelector('[data-gallery-count]');
  const galleryWrap = gallerySection.querySelector('[data-gallery-wrap]');
  const galleryToggle = gallerySection.querySelector('[data-gallery-toggle]');
  const galleryLinks = document.querySelectorAll('[data-needs-gallery]');
  const viewer = document.querySelector('[data-viewer]');
  const vImg = viewer.querySelector('[data-viewer-img]');
  const vText = viewer.querySelector('[data-viewer-text]');
  const tabs = gallerySection.querySelector('[data-tabs]');
  const globoCaja = gallerySection.querySelector('[data-globo]');
  const globoTarjeta = gallerySection.querySelector('[data-globo-card]');
  let globo = null, sitios = [], vista = 'cuadricula';
  let shots = [];
  let current = 0;
  let galleryKey = '';
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // plegar y desplegar la galería; al plegar, se vuelve al principio de la sección
  galleryToggle.addEventListener('click', () => {
    const open = galleryWrap.classList.toggle('is-collapsed') === false;
    galleryToggle.setAttribute('aria-expanded', String(open));
    galleryToggle.querySelector('[data-gallery-label]').textContent = open ? 'Ver menos' : 'Ver todas las fotos';
    if (open) shots.forEach((li) => li.classList.add('is-in'));
    else {
      const y = gallerySection.getBoundingClientRect().top + scrollY;
      window.Stage?.lenis ? window.Stage.lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    }
    window.ScrollTrigger?.refresh();
  });
  // si con el filtro caben todas, no hace falta el botón
  function fitToggle() {
    const fits = galleryGrid.scrollHeight <= parseFloat(getComputedStyle(galleryWrap).maxHeight || '0') + 1;
    galleryToggle.parentElement.hidden = galleryWrap.classList.contains('is-collapsed') && fits;
    galleryWrap.classList.toggle('is-short', fits);
  }
  addEventListener('resize', () => { if (!gallerySection.hidden) fitToggle(); });

  const visibleShots = () => shots.filter((li) => !li.hidden);
  const showShot = (li) => {
    const list = visibleShots();
    current = list.indexOf(li);
    vImg.src = window.Privada.base + li.dataset.grande;
    vImg.alt = li.dataset.alt;
    vText.textContent = li.dataset.descripcion ? `${li.dataset.titulo} · ${li.dataset.descripcion}` : li.dataset.titulo;
  };
  const stepShot = (d) => { const list = visibleShots(); showShot(list[(current + d + list.length) % list.length]); };

  const setFilter = (cat) => {
    filtersBox.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    shots.forEach((li) => {
      li.hidden = cat !== 'todas' && li.dataset.cat !== cat;
      if (!li.hidden) li.classList.add('is-in');
    });
    fitToggle();
    window.ScrollTrigger?.refresh();
  };
  filtersBox.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (b) setFilter(b.dataset.filter); });
  galleryGrid.addEventListener('click', (e) => {
    const li = e.target.closest('.shot');
    if (li && e.target.closest('[data-shot]')) { showShot(li); viewer.showModal(); }
  });

  // Mapa: los sitios (agrupados) con foto y posición pública; el globo se crea la primera vez que se abre la pestaña
  const mostrarSitio = (s) => {
    globoTarjeta.replaceChildren();
    const h = document.createElement('p'); h.className = 'globo__sitio'; h.textContent = `${s.nombre || 'Sin nombre'} · ${s.indices.length} ${s.indices.length === 1 ? 'foto' : 'fotos'}`;
    const fila = document.createElement('div'); fila.className = 'globo__fotos';
    s.indices.forEach((i) => {
      const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', shots[i].dataset.titulo || 'Ver foto');
      const im = document.createElement('img'); im.src = shots[i].querySelector('img').src; im.alt = ''; im.width = 72; im.height = 72; im.loading = 'lazy';
      b.append(im);
      b.addEventListener('click', () => { setFilter('todas'); showShot(shots[i]); viewer.showModal(); });
      fila.append(b);
    });
    globoTarjeta.append(h, fila); globoTarjeta.hidden = false;
  };
  const abrirGlobo = () => {
    if (globo || !sitios.length || !window.Globo) return;
    globo = window.Globo.crear(globoCaja, sitios, mostrarSitio);
    if (!globo) { tabs.hidden = true; ponerVista('cuadricula'); }
  };
  const ponerVista = (v) => {
    vista = v;
    tabs.querySelectorAll('[data-vista]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.vista === v)));
    const mapa = v === 'mapa';
    globoCaja.hidden = !mapa;
    galleryWrap.hidden = mapa; filtersBox.hidden = mapa || filtersBox.childElementCount < 3; galleryToggle.parentElement.hidden = mapa || galleryToggle.parentElement.hidden;
    if (mapa) { globoTarjeta.hidden = true; abrirGlobo(); } else fitToggle();
    window.ScrollTrigger?.refresh();
  };
  tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-vista]'); if (b) ponerVista(b.dataset.vista); });

  // pinta las fotos que manda la privada (todo con textContent: lo que llegue de fuera nunca se interpreta como HTML)
  const renderGallery = (fotos) => {
    const hay = Array.isArray(fotos) && fotos.length > 0;
    const key = hay ? fotos.map((f) => `${f.id}${f.mini}${f.titulo}${f.descripcion}${f.categoria}`).join('|') : '';
    gallerySection.hidden = !hay;
    galleryLinks.forEach((el) => { el.hidden = !hay; });
    if (!hay) {
      if (viewer.open) viewer.close();
      galleryGrid.replaceChildren(); shots = []; galleryKey = ''; globo?.destruir(); globo = null; sitios = [];
      window.ScrollTrigger?.refresh();
      return;
    }
    if (key === galleryKey) return;
    galleryKey = key;
    const cats = [...new Set(fotos.map((f) => f.categoria).filter(Boolean))];
    filtersBox.replaceChildren(...['todas', ...cats].map((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.filter = c; b.setAttribute('aria-pressed', String(c === 'todas')); b.textContent = c === 'todas' ? 'Todas' : cap(c);
      return b;
    }));
    filtersBox.hidden = cats.length < 2;
    galleryCount.textContent = `// ${fotos.length} ${fotos.length === 1 ? 'foto' : 'fotos'} · desde mi zona privada`;
    shots = fotos.map((f, i) => {
      const li = document.createElement('li');
      li.className = 'shot'; li.dataset.cat = f.categoria || ''; li.dataset.reveal = ''; li.style.setProperty('--i', String(i % 4));
      li.dataset.grande = f.grande; li.dataset.titulo = f.titulo || ''; li.dataset.descripcion = f.descripcion || ''; li.dataset.alt = f.alt || f.titulo || '';
      const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.shot = '';
      const img = document.createElement('img');
      img.src = window.Privada.base + f.mini; img.width = f.ancho; img.height = f.alto; img.alt = f.alt || f.titulo || '';
      img.loading = 'lazy'; img.decoding = 'async'; img.style.background = /^#[0-9a-f]{6}$/i.test(f.tono) ? f.tono : '';
      btn.append(img); li.append(btn);
      return li;
    });
    galleryGrid.replaceChildren(...shots);
    shots.forEach((li) => reveal.observe(li));
    setFilter('todas');
    // sitios del mapa: una pin por lugar (las fotos del mismo sitio van juntas)
    const porSitio = new Map();
    fotos.forEach((f, i) => {
      if (!f.lugar || typeof f.lugar.lat !== 'number' || typeof f.lugar.lon !== 'number') return;
      const k = `${f.lugar.lat},${f.lugar.lon}`;
      if (!porSitio.has(k)) porSitio.set(k, { lat: f.lugar.lat, lon: f.lugar.lon, nombre: f.lugar.nombre, indices: [] });
      porSitio.get(k).indices.push(i);
    });
    sitios = [...porSitio.values()];
    globo?.destruir(); globo = null;
    tabs.hidden = sitios.length === 0;
    if (!sitios.length) ponerVista('cuadricula'); else if (vista === 'mapa') ponerVista('mapa');
  };

  // Al cargar la web se pregunta a mi equipo de casa; si responde y tengo la galería activa, aparece la sección.
  // Se vuelve a mirar cada 90 s con la pestaña a la vista: si el equipo se apaga, la sección desaparece sola.
  let galleryAt = 0;
  const syncGallery = async () => {
    if (document.hidden || Date.now() - galleryAt < 20000) return;
    galleryAt = Date.now();
    renderGallery(await window.Privada.galeria());
  };
  if (window.requestIdleCallback) requestIdleCallback(syncGallery, { timeout: 1500 }); else setTimeout(syncGallery, 400);
  setInterval(syncGallery, 90000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncGallery(); });

  viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-viewer-prev]').addEventListener('click', () => stepShot(-1));
  viewer.querySelector('[data-viewer-next]').addEventListener('click', () => stepShot(1));
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
  viewer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') stepShot(-1);
    if (e.key === 'ArrowRight') stepShot(1);
  });
  // en el teléfono, deslizar para pasar de foto
  let touchX = null;
  viewer.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  viewer.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) stepShot(dx < 0 ? 1 : -1);
    touchX = null;
  });

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
