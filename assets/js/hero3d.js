// Portada en 3D: una nube de partículas que es una esfera en reposo y, al bajar, se convierte
// en mi nombre, lo que hago y un símbolo de código. scenes.js mueve window.Hero3D.progress de 0 a 3.
// Script clásico (no módulo) para que funcione también abriendo el archivo sin servidor.
(() => {
const THREE = window.THREE;
const canvas = document.querySelector('[data-hero3d]');
const hero = canvas?.closest('.hero');
const state = (window.Hero3D = window.Hero3D || { progress: 0 });
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const WORDS = ['MARIO', 'DESARROLLADOR|WEB', '</>'];

let renderer;
try {
  if (!THREE || !canvas) throw new Error('sin three.js');
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
} catch {
  hero?.classList.add('no-webgl');
}

if (renderer) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = 6;
  const group = new THREE.Group();
  scene.add(group);

  const small = () => window.innerWidth < 768;
  const N = small() ? 3200 : 6500;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const delay = new Float32Array(N);
  const phase = new Float32Array(N);
  const mix = new Float32Array(N);
  for (let i = 0; i < N; i++) { delay[i] = Math.random(); phase[i] = Math.random() * Math.PI * 2; mix[i] = Math.random(); }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  // Punto redondo dibujado en un canvas, para no cargar ninguna textura
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const dc = dot.getContext('2d');
  dc.beginPath(); dc.arc(32, 32, 30, 0, Math.PI * 2); dc.fillStyle = '#fff'; dc.fill();
  const mat = new THREE.PointsMaterial({
    size: small() ? 0.05 : 0.048, map: new THREE.CanvasTexture(dot), vertexColors: true,
    transparent: true, alphaTest: 0.4, depthWrite: false, sizeAttenuation: true,
  });
  group.add(new THREE.Points(geo, mat));

  // ---- Formas de destino ----
  let targets = [];
  let halfW = 3, halfH = 2;

  const sphere = (r) => {
    const t = new Float32Array(N * 3), golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = golden * i;
      const k = r * (0.92 + Math.random() * 0.16);
      t.set([Math.cos(th) * rad * k, y * k, Math.sin(th) * rad * k], i * 3);
    }
    return t;
  };

  // Una palabra (o varias líneas separadas por "|"): se pinta en un canvas oculto y se toman sus píxeles como puntos
  const word = (text, width) => {
    const lines = text.split('|');
    const c = document.createElement('canvas'), W = 1200, H = 360 * lines.length;
    c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    let size = 300;
    x.font = `700 ${size}px Panchang, "Arial Black", sans-serif`;
    const widest = Math.max(...lines.map((l) => x.measureText(l).width));
    size = Math.min(300, (size * (W * 0.92)) / widest);
    x.font = `700 ${size}px Panchang, "Arial Black", sans-serif`;
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#fff';
    const lh = size * 1.15;
    lines.forEach((l, i) => x.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * lh));
    const data = x.getImageData(0, 0, W, H).data, pts = [];
    for (let py = 0; py < H; py += 3) for (let px = 0; px < W; px += 3) if (data[(py * W + px) * 4 + 3] > 128) pts.push(px, py);
    const scale = width / W, t = new Float32Array(N * 3), count = pts.length / 2;
    for (let i = 0; i < N; i++) {
      const j = Math.floor(Math.random() * count) * 2;
      t.set([(pts[j] - W / 2) * scale, -(pts[j + 1] - H / 2) * scale, (Math.random() - 0.5) * 0.35], i * 3);
    }
    return t;
  };

  const build = () => {
    const r = Math.min(halfW, halfH) * (small() ? 0.74 : 0.7);
    targets = [sphere(r), ...WORDS.map((w) => word(w, halfW * (small() ? 1.75 : 1.5)))];
  };

  // ---- Color: las dos tintas del tema activo ----
  const paint = () => {
    const cs = getComputedStyle(document.documentElement);
    const a = new THREE.Color(cs.getPropertyValue('--on-hot').trim() || '#050f16');
    const b = new THREE.Color(cs.getPropertyValue('--hot-alt').trim() || '#ffffff');
    const c = new THREE.Color();
    for (let i = 0; i < N; i++) { c.copy(a).lerp(b, mix[i] > 0.62 ? 1 : mix[i] * 0.4); col.set([c.r, c.g, c.b], i * 3); }
    geo.attributes.color.needsUpdate = true;
  };
  new MutationObserver(() => requestAnimationFrame(() => { paint(); if (reduced) render(0); }))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-color'] });

  // ---- Tamaño ----
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    halfW = halfH * camera.aspect;
    build();
  };

  // ---- Ratón: inclina la escena y aparta las partículas cercanas ----
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, on: false };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    mouse.on = e.pointerType === 'mouse';
  }, { passive: true });

  const smooth = (t) => t * t * (3 - 2 * t);
  let shown = 0;
  const render = (time) => {
    if (!targets.length) return;
    shown += (state.progress - shown) * 0.12;
    const p = Math.max(0, Math.min(WORDS.length, shown));
    const i0 = Math.min(Math.floor(p), WORDS.length - 1);
    const f = p - i0;
    const A = targets[i0], B = targets[Math.min(i0 + 1, WORDS.length)];
    const t = time * 0.001;
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const mx = mouse.x * halfW, my = mouse.y * halfH;

    for (let i = 0; i < N; i++) {
      const k = i * 3;
      const e = smooth(Math.max(0, Math.min(1, f * 1.6 - delay[i] * 0.6)));
      let x = A[k] + (B[k] - A[k]) * e;
      let y = A[k + 1] + (B[k + 1] - A[k + 1]) * e;
      const z = A[k + 2] + (B[k + 2] - A[k + 2]) * e;
      // respiración: cada punto oscila un poco a su ritmo
      x += Math.sin(t * 1.3 + phase[i]) * 0.012;
      y += Math.cos(t * 1.1 + phase[i]) * 0.012;
      if (mouse.on && !reduced) {
        const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy;
        if (d2 < 0.45) { const push = (0.45 - d2) * 0.9; x += dx * push; y += dy * push; }
      }
      pos[k] = x; pos[k + 1] = y; pos[k + 2] = z;
    }
    geo.attributes.position.needsUpdate = true;

    // la esfera gira; las palabras miran al frente y solo se inclinan con el ratón
    const spin = Math.max(0, 1 - p);
    // en reposo la esfera deja sitio al texto: a la derecha en escritorio, arriba en el teléfono
    const wide = halfW > halfH * 1.1;
    group.position.x = wide ? halfW * 0.16 * spin : 0;
    group.position.y = wide ? 0 : halfH * 0.16 * spin;
    group.rotation.y = (reduced ? 0 : t * 0.25 * spin) + mouse.x * 0.35;
    group.rotation.x = mouse.y * -0.2 + Math.sin(t * 0.4) * 0.05 * spin;
    renderer.render(scene, camera);

    const step = Math.round(p);
    if (step !== render.step) {
      render.step = step;
      hero.querySelectorAll('[data-step]').forEach((li) => li.classList.toggle('is-on', Number(li.dataset.step) === step));
    }
  };

  // ---- Bucle: solo mientras la portada se ve y la pestaña está activa ----
  let running = false, visible = true;
  const loop = (time) => { if (!running) return; render(time); requestAnimationFrame(loop); };
  const update = () => {
    const should = visible && !document.hidden && !reduced;
    if (should && !running) { running = true; requestAnimationFrame(loop); }
    if (!should) running = false;
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); }).observe(hero);
  document.addEventListener('visibilitychange', update);

  const start = () => {
    resize(); paint();
    if (reduced) { shown = state.progress; render(0); } else update();
    hero.classList.add('has-3d');
  };
  new ResizeObserver(() => { resize(); if (reduced) render(0); }).observe(canvas);
  (document.fonts ? document.fonts.load('700 100px Panchang') : Promise.resolve()).then(start, start);
}
})();
