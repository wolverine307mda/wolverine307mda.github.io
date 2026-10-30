// Área privada: un candado 3D de líneas con anillos de partículas en órbita, sobre una rejilla
// que avanza hacia el horizonte. El formulario no envía nada: la app todavía no existe,
// así que al intentarlo el candado tira del arco, no abre y lo cuenta.
(() => {
const html = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const form = document.querySelector('[data-login]');
const msg = form.querySelector('[data-msg]');
const go = form.querySelector('.login__go');

/* ---------- Formulario: mostrar contraseña e intento de entrar ---------- */
const pass = form.querySelector('[data-pass]');
const eye = form.querySelector('[data-eye]');
eye.addEventListener('click', () => {
  const show = pass.type === 'password';
  pass.type = show ? 'text' : 'password';
  eye.setAttribute('aria-pressed', String(show));
  eye.setAttribute('aria-label', show ? 'Ocultar la contraseña' : 'Mostrar la contraseña');
});

let tryAt = -10;
form.addEventListener('submit', (e) => {
  e.preventDefault();  // nada sale de esta página
  if (!form.usuario.value.trim() || !form.clave.value) {
    msg.textContent = 'Escribe usuario y contraseña.';
    msg.classList.add('is-error');
    (form.usuario.value.trim() ? form.clave : form.usuario).focus();
    return;
  }
  go.classList.add('is-busy');
  msg.textContent = 'Comprobando la llave';
  msg.classList.remove('is-error');
  tryAt = performance.now() * 0.001;
  setTimeout(() => {
    go.classList.remove('is-busy');
    msg.textContent = 'El candado sigue cerrado: la app aún está en construcción. ¡Pronto!';
    msg.classList.add('is-error');
    form.classList.remove('is-shake'); void form.offsetWidth; form.classList.add('is-shake');
    form.clave.value = '';
  }, 1100);
});

/* ---------- Escena 3D ---------- */
const THREE = window.THREE;
const canvas = document.querySelector('[data-login3d]');
let renderer;
try { if (!THREE) throw 0; renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch { canvas.remove(); return; }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
camera.position.set(0, 1.2, 9);
const small = () => window.innerWidth < 860;

const lineMat = new THREE.LineBasicMaterial({ transparent: true });
const softMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.5 });
const fillMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55 });
const lines = (g, m = lineMat) => new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), m);

// rejilla que avanza (estilo horizonte)
const grid = new THREE.GridHelper(80, 64);
grid.material.transparent = true; grid.material.opacity = 0.35;
grid.position.y = -2.6;
scene.add(grid);

// candado: cuerpo, arco, ojo de la cerradura y tornillos
const lock = new THREE.Group();
const bodyGeo = new THREE.BoxGeometry(2.2, 1.8, 0.8);
const bodyFill = new THREE.Mesh(bodyGeo, fillMat);
lock.add(bodyFill, lines(bodyGeo));
const inner = lines(new THREE.BoxGeometry(1.9, 1.5, 0.82), softMat); lock.add(inner);
const shackle = new THREE.Group();
const arc = lines(new THREE.TorusGeometry(0.72, 0.13, 10, 28, Math.PI));
arc.position.y = 0.95;
const legL = lines(new THREE.CylinderGeometry(0.13, 0.13, 0.7, 10)); legL.position.set(-0.72, 0.6, 0);
const legR = lines(new THREE.CylinderGeometry(0.13, 0.13, 0.7, 10)); legR.position.set(0.72, 0.6, 0);
shackle.add(arc, legL, legR);
shackle.position.y = 0.55;
lock.add(shackle);
const hole = new THREE.Group();
hole.add(lines(new THREE.CircleGeometry(0.2, 20)));
const slot = lines(new THREE.PlaneGeometry(0.14, 0.42)); slot.position.y = -0.25; hole.add(slot);
hole.position.set(0, -0.05, 0.41);
lock.add(hole);
[[-0.85, 0.65], [0.85, 0.65], [-0.85, -0.65], [0.85, -0.65]].forEach(([x, y]) => {
  const s = lines(new THREE.CircleGeometry(0.06, 8), softMat); s.position.set(x, y, 0.41); lock.add(s);
});
scene.add(lock);

// anillos de partículas en órbita alrededor del candado
const dot = document.createElement('canvas'); dot.width = dot.height = 32;
const dc = dot.getContext('2d'); dc.beginPath(); dc.arc(16, 16, 14, 0, Math.PI * 2); dc.fillStyle = '#fff'; dc.fill();
const dotTex = new THREE.CanvasTexture(dot);
const rings = [];
[[2.3, 0.4, 0.2], [2.8, -0.6, 0.9], [3.3, 1.1, -0.5]].forEach(([r, tx, tz], k) => {
  const n = 220, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, j = (Math.random() - 0.5) * 0.12;
    pos.set([Math.cos(a) * (r + j), (Math.random() - 0.5) * 0.08, Math.sin(a) * (r + j)], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ size: 0.05, map: dotTex, transparent: true, alphaTest: 0.3, opacity: k ? 0.7 : 1 });
  const ring = new THREE.Points(g, m);
  ring.rotation.set(tx, 0, tz);
  ring.userData.speed = 0.2 + k * 0.08;
  lock.add(ring); rings.push(ring);
});

// polvo de estrellas al fondo
const starN = small() ? 500 : 1100, starPos = new Float32Array(starN * 3);
for (let i = 0; i < starN; i++) starPos.set([(Math.random() - 0.5) * 60, Math.random() * 18 - 2, -Math.random() * 40 - 4], i * 3);
const starGeo = new THREE.BufferGeometry(); starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.06, map: dotTex, transparent: true, alphaTest: 0.3, opacity: 0.8 }));
scene.add(stars);

/* ---------- Color: tinta de marca sobre el fondo oscuro del tema ---------- */
const paint = () => {
  const cs = getComputedStyle(html);
  const brand = new THREE.Color(cs.getPropertyValue('--brand').trim() || '#ff7a1f');
  const dark = new THREE.Color(cs.getPropertyValue('--dark').trim() || '#03080b');
  const light = new THREE.Color(cs.getPropertyValue('--on-dark').trim() || '#ffffff');
  renderer.setClearColor(dark, 1);
  scene.fog = new THREE.Fog(dark, 10, 34);
  lineMat.color.copy(brand); softMat.color.copy(brand);
  fillMat.color.copy(dark).lerp(brand, 0.08);
  grid.material.color.copy(brand);
  rings.forEach((r, i) => r.material.color.copy(i ? brand : light));
  stars.material.color.copy(light);
};
new MutationObserver(paint).observe(html, { attributes: true, attributeFilter: ['data-mode', 'data-color'] });

/* ---------- Tamaño y posición del candado ---------- */
const resize = () => {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const s = small() ? 0.6 : 1;
  lock.scale.setScalar(s);
  lock.position.set(small() ? 0 : -2.2, small() ? 1.45 : 0.6, 0);
};
addEventListener('resize', resize);

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / innerHeight) * 2 - 1);
}, { passive: true });

const render = (time) => {
  const t = time * 0.001;
  mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
  // la rejilla avanza hacia la cámara sin fin
  grid.position.z = (t * 1.2) % (80 / 64);
  // el candado flota y gira hacia el ratón
  lock.rotation.y = Math.sin(t * 0.5) * 0.35 + mouse.x * 0.5;
  lock.rotation.x = -0.1 + mouse.y * -0.25;
  lock.position.y += Math.sin(t * 1.2) * 0.002;
  rings.forEach((r) => { r.rotation.y = t * r.userData.speed; });
  stars.rotation.y = t * 0.01;
  // intento de entrar: el arco sube, no abre, vuelve y el candado tiembla
  const k = t - tryAt;
  if (k >= 0 && k < 1.6) {
    const up = k < 0.6 ? Math.sin((k / 0.6) * Math.PI / 2) * 0.35 : Math.max(0, 0.35 - (k - 0.6) * 0.9);
    shackle.position.y = 0.55 + up;
    lock.rotation.z = k > 1 && k < 1.5 ? Math.sin(k * 60) * 0.06 * (1.5 - k) * 2 : 0;
    rings.forEach((r) => { r.rotation.y += k * 0.6; });
  } else { shackle.position.y = 0.55; lock.rotation.z = 0; }
  camera.position.x = mouse.x * 0.4;
  camera.lookAt(0, 0.6, 0);
  renderer.render(scene, camera);
};

let running = false;
const loop = (time) => { if (!running) return; render(time); requestAnimationFrame(loop); };
const update = () => {
  const should = !document.hidden && !reduced;
  if (should && !running) { running = true; requestAnimationFrame(loop); }
  if (!should) running = false;
};
document.addEventListener('visibilitychange', update);
paint(); resize();
if (reduced) render(4000); else update();
})();
