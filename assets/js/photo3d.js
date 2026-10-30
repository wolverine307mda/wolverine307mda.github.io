// Fotografía en 3D: una cámara de líneas que apunta a las fotos y dispara el flash, dos focos de estudio
// con su haz de luz que barre la escena y un carrete que gira. Vive detrás de las fotos que vuelan (scenes.js "fly").
// Lee --p (0-1) de la sección para disparar el flash cuando aterrizan las últimas fotos.
// Script clásico, igual que hero3d.js, para que funcione también abriendo el archivo sin servidor.
(() => {
const THREE = window.THREE;
const section = document.querySelector('#fotografia');
const stage = section?.querySelector('.photos__stage');
if (!THREE || !stage) return;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.createElement('canvas');
canvas.className = 'photos__canvas';
canvas.setAttribute('aria-hidden', 'true');
const flashEl = document.createElement('div');
flashEl.className = 'photos__flash';
flashEl.setAttribute('aria-hidden', 'true');
stage.prepend(canvas);
stage.append(flashEl);

let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true }); } catch { canvas.remove(); return; }

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
camera.position.z = 9;
let halfW = 3, halfH = 2;
const small = () => window.innerWidth < 768;

// ---- Materiales: líneas en el color de marca y luz blanca ----
const lineMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.95 });
const softLine = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.45 });
const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
const lines = (g, m = lineMat) => new THREE.LineSegments(new THREE.EdgesGeometry(g, 20), m);
const paint = () => {
  const brand = getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#ff7a1f';
  lineMat.color.set(brand); softLine.color.set(brand);
  beams.forEach((b) => b.material.color.set(brand));
};

// ---- Cámara de fotos: cuerpo, empuñadura, visor, objetivo con anillos, disparador y flash ----
const cam = new THREE.Group();
const body = lines(new THREE.BoxGeometry(1.5, 0.95, 0.55));
const grip = lines(new THREE.BoxGeometry(0.34, 0.95, 0.72)); grip.position.set(-0.62, 0, 0.08);
const hump = lines(new THREE.CylinderGeometry(0.22, 0.4, 0.32, 4, 1)); hump.position.set(0.05, 0.62, 0); hump.rotation.y = Math.PI / 4;
const button = lines(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 12)); button.position.set(-0.55, 0.52, 0.12);
const dial = lines(new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16)); dial.position.set(0.5, 0.52, 0);
const lens = new THREE.Group();
lens.add(lines(new THREE.CylinderGeometry(0.42, 0.46, 0.7, 28, 1, true)));
[0.14, -0.1].forEach((y) => { const r = lines(new THREE.TorusGeometry(0.44, 0.03, 6, 32)); r.rotation.x = Math.PI / 2; r.position.y = y; lens.add(r); });
const glass = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), new THREE.MeshBasicMaterial({ color: 0x0b1318, transparent: true, opacity: 0.9 }));
glass.rotation.x = -Math.PI / 2; glass.position.y = 0.351; lens.add(glass);
const iris = lines(new THREE.CircleGeometry(0.2, 6), softLine); iris.rotation.x = -Math.PI / 2; iris.position.y = 0.352; lens.add(iris);
lens.rotation.x = Math.PI / 2; lens.position.set(0.1, -0.02, 0.62);
// flash encima: caja con la cara que se enciende
const flashUnit = new THREE.Group();
flashUnit.add(lines(new THREE.BoxGeometry(0.55, 0.28, 0.4)));
const flashFace = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.22), glowMat);
flashFace.position.z = 0.205; flashUnit.add(flashFace);
flashUnit.position.set(0.05, 1.0, 0.05);
cam.add(body, grip, hump, button, dial, lens, flashUnit);
// destello: un anillo que se abre desde el flash
const burst = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }));
burst.position.set(0.05, 1.0, 0.3); cam.add(burst);
scene.add(cam);

// ---- Focos de estudio: pie, cabeza y un haz de luz transparente que barre ----
const beams = [];
const makeSpot = () => {
  const g = new THREE.Group();
  const stand = lines(new THREE.CylinderGeometry(0.03, 0.03, 2.4, 6), softLine); stand.position.y = -1.2;
  const legs = lines(new THREE.ConeGeometry(0.55, 0.35, 3, 1, true), softLine); legs.position.y = -2.4;
  const head = new THREE.Group();
  head.add(lines(new THREE.CylinderGeometry(0.42, 0.26, 0.6, 16, 1, true)));
  const lamp = lines(new THREE.TorusGeometry(0.42, 0.02, 6, 24)); lamp.rotation.x = Math.PI / 2; lamp.position.y = 0.3; head.add(lamp);
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 0.4, 7, 32, 1, true),   // estrecho en la lámpara, ancho al final
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  );
  beam.position.y = 3.8; head.add(beam); beams.push(beam);
  g.add(stand, legs, head);
  g.userData.head = head;
  return g;
};
const spotL = makeSpot(), spotR = makeSpot();
scene.add(spotL, spotR);

// ---- Carrete de película que gira ----
const reel = new THREE.Group();
reel.add(lines(new THREE.CylinderGeometry(0.6, 0.6, 0.16, 32, 1)));
for (let i = 0; i < 6; i++) {
  const hole = lines(new THREE.CircleGeometry(0.13, 12), softLine);
  const a = (i / 6) * Math.PI * 2; hole.position.set(Math.cos(a) * 0.34, 0.09, Math.sin(a) * 0.34); hole.rotation.x = -Math.PI / 2;
  reel.add(hole);
}
reel.add(lines(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 12)));
reel.rotation.x = Math.PI / 2;
scene.add(reel);

// ---- Colocación según el tamaño de pantalla ----
const layout = () => {
  const s = small() ? 0.55 : 1;
  cam.scale.setScalar(s * 0.9);
  cam.position.set(-halfW * (small() ? 0.48 : 0.62), -halfH * (small() ? 0.62 : 0.48), 0.6);
  [spotL, spotR].forEach((sp, i) => {
    sp.scale.setScalar(s * 0.9);
    sp.position.set((i ? 1 : -1) * halfW * (small() ? 0.8 : 0.9), halfH * (small() ? 0.62 : 0.5), -1.6);
  });
  reel.scale.setScalar(s);
  reel.position.set(halfW * (small() ? 0.55 : 0.66), -halfH * (small() ? 0.68 : 0.58), 0);
};
const resize = () => {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
  halfW = halfH * camera.aspect;
  layout();
};

// ---- Flash: el de la cámara se enciende, se abre un anillo y la pantalla destella (suave) ----
let flashAt = -10, lastP = 0, nextAuto = 2.2;
const LANDINGS = [0.5, 0.56, 0.62, 0.68, 0.98];
const fire = (t) => {
  flashAt = t;
  if (reduced) return;
  flashEl.classList.remove('is-on'); void flashEl.offsetWidth; flashEl.classList.add('is-on');
};

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
}, { passive: true });

const render = (time) => {
  const t = time * 0.001;
  mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
  const p = parseFloat(section.style.getPropertyValue('--p')) || 0;
  if (!reduced) {
    LANDINGS.forEach((l) => { if (lastP < l && p >= l) fire(t); });
    if (t > nextAuto && section.classList.contains('is-live')) { fire(t); nextAuto = t + 3.4 + Math.random() * 1.6; }
  }
  lastP = p;

  // la cámara flota, apunta un poco al ratón y retrocede al disparar
  const since = t - flashAt;
  const kick = since < 0.4 ? Math.sin((since / 0.4) * Math.PI) * 0.12 : 0;
  cam.rotation.y = 0.55 + Math.sin(t * 0.5) * 0.12 + mouse.x * 0.25;
  cam.rotation.x = -0.15 + Math.sin(t * 0.7) * 0.05 - mouse.y * 0.15;
  cam.rotation.z = Math.sin(t * 0.4) * 0.04;
  cam.position.z = 0.6 - kick;
  iris.rotation.z = t * 0.6; // el diafragma gira despacio
  const glow = since < 0.5 ? Math.max(0, 1 - since / 0.5) : 0;
  glowMat.opacity = reduced ? 0.6 : glow;
  burst.material.opacity = glow * 0.9;
  burst.scale.setScalar(1 + (1 - glow) * 6);

  // el haz respira y se aviva con el flash
  // los focos apuntan hacia abajo y al centro, y barren despacio
  spotL.userData.head.rotation.z = -2.35 + Math.sin(t * 0.45) * 0.22;
  spotR.userData.head.rotation.z = 2.35 + Math.sin(t * 0.45 + 2) * 0.22;
  [spotL, spotR].forEach((sp) => { sp.userData.head.rotation.x = Math.sin(t * 0.3) * 0.15; });
  beams.forEach((b, i) => { b.material.opacity = 0.05 + Math.sin(t * 1.3 + i) * 0.02 + glow * 0.12; });

  reel.rotation.z = t * 0.8;
  reel.position.y += Math.sin(t * 1.1) * 0.0015;
  scene.rotation.y = mouse.x * 0.05;
  renderer.render(scene, camera);
};

// ---- Bucle: solo con la sección en pantalla y la pestaña activa ----
let running = false, visible = false;
const loop = (time) => { if (!running) return; render(time); requestAnimationFrame(loop); };
const update = () => {
  const should = visible && !document.hidden && !reduced;
  if (should && !running) { running = true; requestAnimationFrame(loop); }
  if (!should) running = false;
};
new IntersectionObserver(([e]) => { visible = e.isIntersecting; update(); if (reduced && visible) render(1200); }).observe(section);
document.addEventListener('visibilitychange', update);
new ResizeObserver(() => { resize(); if (reduced) render(1200); }).observe(canvas);
new MutationObserver(() => { paint(); if (reduced) render(1200); })
  .observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-color'] });
paint();
resize();
})();
