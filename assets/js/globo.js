// Globo 3D de mis fotos: puntos de tierra dibujados a partir de una máscara de 1 bit (Natural Earth, dominio público; sin mapas
// ni servicios externos) y un pin por sitio. Arrastrar para girar, tocar un pin para ver sus fotos. Con movimiento reducido no gira solo.
// Window.Globo.crear(contenedor, sitios, alElegir) -> { destruir } | null (sin WebGL)
(() => {
  const MASCARA = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//gAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//////Hf///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/////////////AAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAAAAAAAAAAAAAAB/////////////wAAAAX/8AAP8AAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAOB////g////////AAAAD//wAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAeP3vv/7////////+AAAAB//AAAAAAAAAAAAf8AAAAAAAAAAAAAAAAAAAAAA8+AL4f/g////////+AAAAAfvgAAAAAAAAAAAF+AAAAAAAAAAAAAAAAAAAAAH/3R////gP////////AAAAAHAAAAAAAf4AAAHP//AAAA8AAAAAAAAAAAAAAACP/5///8AAAf/////+AAAAAAAAAAAAf+AAAH////gAAD//gAAAAAAAAAAAAAf4+AN//+AAAP/////+AAAAAAAAAAAAeAAAAP///4AAAA/nAAAAAAAAAAAAAAf/B8///3wAAH/////8AAAAAAAAAAAB4AEAP//////H4AfAAAAAAAAAAAAAAA//+5/9//4AAD/////wAAAAAAAAAAAHwAHt////////8Af/AAAAA4AABgAAAA///8f8///AAD/////wAAAAAAAiAAAHwA//////////8///gQAADwAA//+gAOYf//1+///+AB/////4AAAAAAH/wAAB8A/v/////////////8AIDAAD///+P/////v/j///AB////+AAAAAAAf//gAAA+/////////////////P+4Af//////////H/z4f/AAf///4AAAAAAD///4eB//////////////////////AH/////////////45/wA///8AAAAAAAP////e///////////////////////4f/////////////gD/+A///wAycAAAAf//////////////////////////////////////////7g/+4Af//AB/+AAAA/+f+f///////////////////////jwf/////////////9//oAf/wAA/8AAAD/8//////////////////////////APH////////////PcB/wAP/gAAfgAAAP/3/////////////////////////+ACP////////////A///gAD/AAAAAAAB//H//////////////////////////AAf///////////wAG/5AAD/AAAAAAAD//H/////////////////////////gAA////////////wAA/4QAB+AAAAAAAB//n//////////////////////D/+AAAb/zwn///////wAA/44AAAAAAAAAAB//D//////////////////////D6IAAAAv4AA///////4AB//8AAAAAAAAA4B5/B///////////////////4AYPgAAAAAH8AAD///////AAf/8AAAAAAAAA+AP+H///////////////////gAA/wAAAAAfQAAB///////wAf/+AAAAAAAAB8AO8H///////////////////AAB/wAAAAD8AAAA////////x///gAAAAAAAD8AP4H//////////////////+AAB/AAAAAGAAAAD////////z///4AAAAAAAH/AP////////////////////+yAB/gAAAAAAAAADP///////x///+AAAAAAAPfj//////////////////////+AB+AAAAAAAAAABv///////5///+AAAAAAAPfz///////////////////////AA4AAAAAAAAAAAD///////////+AAAAAAAM/////////////////////////AA4AAAAAAAAAAAH///////////MAAAAAAAA////////////////////////7AAAAAAAAAAAAAAH//////////+fgAAAAAAAj///////////////////////7AAAAAAAAAAAAAAA//////////w/wAAAAAAAf///////////////////////+gAAAAAAAAAAAAAAf/////////x/wAAAAAAAf///////////////////////yAAAAAAAAAAAAAAAf/////////9DgAAAAAAAD////////7//////////////nAAAAAAAAAAAAAAAP//////////gAAAAAAAAD/////P//n/////////////+GAAAAAAAAAAAAAAAf/////////4AAAAAAAAAD/////Hf+P/////////////8HQAAAAAAAAAAAAAAf////////5gAAAAAAAAP//3z/+AH/H/////////////8PwAAAAAAAAAAAAAAf////////wAAAAAAAAAH/4P5/8HB/D/////////////wfgAAAAAAAAAAAAAAf////////4AAAAAAAAAP/8M+f//n/y////////////8AdAAAAAAAAAAAAAAAf////////gAAAAAAAAAH/gMP/////7////////////8AcAAAAAAAAAAAAAAAP///////8AAAAAAAAAAP/AMH/P///x///////////fwAMAAAAAAAAAAAAAAAP///////8AAAAAAAAAAP/gI/Pv///h//////////+T4AYAAAAAAAAAAAAAAAH///////4AAAAAAAAAAH/A3+Hn///5///////////78C4AAAAAAAAAAAAAAAD///////4AAAAAAAAAAH8//MHH///////////////48D4AAAAAAAAAAAAAAAB///////4AAAAAAAAAAB//+AB4P//////////////A8/4AAAAAAAAAAAAAAAB///////wAAAAAAAAAAB//+AAgP//////////////g7/gAAAAAAAAAAAAAAAAf//////AAAAAAAAAAAH///AAAB//////////////gH8AAAAAAAAAAAAAAAAAP/////8AAAAAAAAAAAP///8PAD//////////////wHwAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAP///+f/7//////////////wDAAAAAAAAAAAAAAAAAAH/////4AAAAAAAAAAAP/////////////////////wAAAAAAAAAAAAAAAAAAAD////i8AAAAAAAAAAAf/////////////////////4AAAAAAAAAAAAAAAAAAAB///gAcAAAAAAAAAAB//////////v///////////wAAAAAAAAAAAAAAAAAAAD//+AAcgAAAAAAAAAD//////////3///////////gAAAAAAAAAAAAAAAAAAAA7/+AAdwAAAAAAAAAH///////+//9///////////AAAAAAAAAAAAAAAAAAAAAf/+AANgAAAAAAAAAH///////+//8f//////////QAAAAAAAAAAAAAAAAAAAAc/+AABgAAAAAAAAAP///////+f//4Af///////+wAAAAAAAAAAAAAAAAAAAAGf+AAcgAAAAAAAAAf////////P//+Af///////8wAAAAAAAAAAAAIAAAAAAAGf+AB/gAAAAAAAAAf////////n///AH///////wwAAAAAAAAAAAAPAAAAAAAAP+A9H4AAAAAAAAA/////////3///AD///v//8AgAAAAAAAAAAAABgAAAAAAAP+B8B8AAAAAAAAA/////////n//+AD//8P/+YAAAAAAAAAAAAAABwAAAAAAAP/B4A/4AAAAAAAAf////////z//8AA//wH/88AAAAAAAAAAAAAAAgAAAAAAAD//4B3/gAAAAAAAf////////x//8AAf/AD/+4A4AAAAAAAAAAAAAAAAAAAAAB//wAwjgAAAAAAAf////////5//4AAf/AD/+AA4AAAAAAAAAAAAAAAAAAAAAAP/0AAAAAAAAAAAf////////4//gAAf+AD//gB4AAAAAAAAAAAAAAAAAAAAAADP/gAAAAAAAAAAf////////8/+AAAf4ADf/gBwAAAAAAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAA///////////wAAAP4AAf/gA4AAAAAAAAAAAAAAAAAAAAAAAD/gAAAAAAAAAAf//////////gAAAP4AAP/wA8AAAAAAAAAAAAAAAAAAAAAAAAPgAoAAAAAAAAf/////////8MAAAPwAAP/wAzAAAAAAAAAAAAAAAAAAAAAAAAHgH8AAAAAAAAf/////////x8AAAHwAAMfwBfAAAAAAAAAAAAAAAAAAAAAAAADgP//AAAAAAAH//////////8AAADwAAMfADfAAAAAAAAAAAAAAAAAAAAAAAAD/f//AAAAAAAH//////////4AAAD4AAMOAGNgAAAAAAAAAAAAAAAAAAAAAAAA////gAAAAAAD//////////4AAAD8AAOEAEPgAAAAAAAAAAAAAAAAAAAAAAAAN///wAAAAAAB//////////wAAABcAAOAAAfgAAAAAAAAAAAAAAAAAAAAAAAAA///6AAAAAAA//////////wAAAAcAAHgAMPgAAAAAAAAAAAAAAAAAAAAAAAAA////wAAAAAAP/x///////gAAAAIABzgAfBAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAPuB///////AAAAAAAB7wA+AAAAAAAAAAAAAAAAAAAAAAAAAAA////4AAAAAAAAAP/////+AAAAAAAA/wD8AAAAAAAAAAAAAAAAAAAAAAAAAAB////4AAAAAAAAAH/////+AAAAAAAAfwX+AQAAAAAAAAAAAAAAAAAAAAAAAAB////+AAAAAAAAAH/////4AAAAAAAAP4f8xYAAAAAAAAAAAAAAAAAAAAAAAAH////8AAAAAAAAAH/////wAAAAAAAAHw//+YAAAAAAAAAAAAAAAAAAAAAAAAH/////wAAAAAAAAP/////gAAAAAAAADwf98bwAAAAAAAAAAAAAAAAAAAAAAAH/////8AAAAAAAAP/////AAAAAAAAAD4f58D5gAAAAAAAAAAAAAAAAAAAAAAH//////4AAAAAAAH////+AAAAAAAAAD8P7wN78AwAAAAAAAAAAAAAAAAAAAAH//////8AAAAAAAB////+AAAAAAAAAA+H55+//gcAAAAAAAAAAAAAAAAAAAAP//////+AAAAAAAB////8AAAAAAAAAA8Ap8A3/wcAAAAAAAAAAAAAAAAAAAAH///////gAAAAAAB////4AAAAAAAAAAfABsAJ/zzAAAAAAAAAAAAAAAAAAAAP///////wAAAAAAA////8AAAAAAAAAAH+AAAI//hgAAAAAAAAAAAAAAAAAAAD///////wAAAAAAA////8AAAAAAAAAAD/gAAA/8A4AAAAAAAAAAAAAAAAAAAD///////gAAAAAAA////8AAAAAAAAAAAP37wB/OAGAAAAAAAAAAAAAAAAAAAB///////gAAAAAAA////8AAAAAAAAAAAAPnAAGHgHAAAAAAAAAAAAAAAAAAAB///////AAAAAAAAf///+AAAAAAAAAAAAAmAACHgBgAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAf///+AAAAAAAAAAAAAAB+HAAAAAAAAAAAAAAAAAAAAAAA//////+AAAAAAAAf///+AwAAAAAAAAAAAAD+HAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAA////+B4AAAAAAAAAAAA3+HAAAAAAAAAAAAAAAAAAAAAAAf/////8AAAAAAAA////+B4AAAAAAAAAAAB/8HwAADAAAAAAAAAAAAAAAAAAAP/////8AAAAAAAB////+H4AAAAAAAAAAAD//HwAADAAgAAAAAAAAAAAAAAAAD/////4AAAAAAAB////+P4AAAAAAAAAAAH//nwAABADAAAAAAAAAAAAAAAAAA/////4AAAAAAAB////4fwAAAAAAAAAAAP///4AAAAGAAAAAAAAAAAAAAAAAAf////4AAAAAAAB////gPwAAAAAAAAAAAf///4AAAAGAAAAAAAAAAAAAAAAAAf////4AAAAAAAA////APwAAAAAAAAAAB////+AAAAAAAAAAAAAAAAAAAAAAAf////wAAAAAAAAf//+AfgAAAAAAAAAAP////+AAMAAAAAAAAAAAAAAAAAAAAf////wAAAAAAAAf///AfAAAAAAAAAAA//////AAOAAAAAAAAAAAAAAAAAAAAf////gAAAAAAAAP///AfAAAAAAAAAAB//////gADAAAAAAAAAAAAAAAAAAAAf///8AAAAAAAAAP///AfAAAAAAAAAAB//////gAAAAAAAAAAAAAAAAAAAAAAf///wAAAAAAAAAP///AfAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAP//8AOAAAAAAAAAAB//////4AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAP//4AAAAAAAAAAAAB//////8AAAAAAAAAAAAAAAAAAAAAAf///AAAAAAAAAAH//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA////AAAAAAAAAAD//4AAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///+AAAAAAAAAAB//wAAAAAAAAAAAAAf/////8AAAAAAAAAAAAAAAAAAAAAA///8AAAAAAAAAAB//gAAAAAAAAAAAAA//////8AAAAAAAAAAAAAAAAAAAAAA///4AAAAAAAAAAA//gAAAAAAAAAAAAAf/////4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAB/+AAAAAAAAAAAAAAf/w///4AAAAAAAAAAAAAAAAAAAAAA///wAAAAAAAAAAA/8AAAAAAAAAAAAAAf+AP//wAAAAAAAAAAAAAAAAAAAAAA///gAAAAAAAAAAA8AAAAAAAAAAAAAAAfIAH//wAADAAAAAAAAAAAAAAAAAAB//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAD//gAABgAAAAAAAAAAAAAAAAAB//8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/gAABwAAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/AAAA+AAAAAAAAAAAAAAAAAD//4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAA+AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAB8AAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA2AAADYAAAAAAAAAAAAAAAAAH/sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+AAAH4AAAAAAAAAAAAAAAAAH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAAAHAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAA/AAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8D4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH8BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAB4AAAAAAA4BAAAEAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAAAAAAAAAAAP8AAAAGAD//8f///wAAAAAAAAAAAAAAAAAAAAAAADwAAAAAAAAAAAAAAAAAH//34AP//////////4AAAAAAAAAAAAAAAAAAAAAAAT4AAAAAAAAAAAAAAAGD////8A/////////////AAAAAAAAAAAAAAAAAAAAAA/8AAAAAAAAAAAQRwA//////8f/////////////8AAAAAAAAAAAAAAAAAAAAA/+AAAAAAAABAH//////////8f///////////////gAAAAAAAAAAAAAB9AAAP/+AAAAAAAA/////////////5////////////////8AAAAAAAAAAAAAD/AgAH/+AAAAAAAH//////////////////////////////8AAAAAAAAAD3wgD///////AAAAAAAf//////////////////////////////wAAAAAAAB/////H//////+AAAAAAAf//////////////////////////////AAAAAAAH/////////////wAAAAAAP//////////////////////////////4AAAAAGAf////////////8AAAAAAf///////////////////////////////wAAAAAH/////////////+AAAAQAP////////////////////////////////4AAAAD3/////////////8AAAD+A/////////////////////////////////+AAAAB4/////////////wADAP+A/////////////////////////////////wAAAAAAAP////////////h/h/+Af///////////////////////////////+AAAAAAB///////////////5AH9//////////////////////////////////AAAAAAAP////////////////////////////////////////////////////8AAACAAP/////////////////////////////////////////////////////wA//8AB///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////';
  const ancho = 360, fila = 45;
  const bytes = Uint8Array.from(atob(MASCARA), (c) => c.charCodeAt(0));
  const tierra = (lat, lon) => {
    const x = Math.min(ancho - 1, Math.max(0, Math.floor(lon + 180))), y = Math.min(179, Math.max(0, Math.floor(90 - lat)));
    return (bytes[y * fila + (x >> 3)] >> (7 - (x & 7))) & 1;
  };
  const rad = Math.PI / 180;
  const aXYZ = (lat, lon, r = 1) => [r * Math.cos(lat * rad) * Math.sin(lon * rad), r * Math.sin(lat * rad), r * Math.cos(lat * rad) * Math.cos(lon * rad)];

  window.Globo = {
    crear(caja, sitios, alElegir) {
      const THREE = window.THREE;
      if (!THREE) return null;
      const lienzo = caja.querySelector('canvas');
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true }); } catch { return null; }
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camara.position.z = 4.1;
      const globo = new THREE.Group();
      escena.add(globo);

      // la esfera oscura y los puntos de tierra (Fibonacci: reparto uniforme)
      const base = new THREE.Mesh(new THREE.SphereGeometry(0.985, 48, 32), new THREE.MeshBasicMaterial({ color: 0x070d12 }));
      globo.add(base);
      const puntos = [];
      const N = 9000;
      for (let i = 0; i < N; i++) {
        const lat = Math.asin(1 - (2 * (i + 0.5)) / N) / rad, lon = ((i * 137.50776405) % 360) - 180;
        if (tierra(lat, lon)) puntos.push(...aXYZ(lat, lon, 1.001));
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(puntos, 3));
      const matPuntos = new THREE.PointsMaterial({ size: 0.03, sizeAttenuation: true, transparent: true, opacity: 1 });
      globo.add(new THREE.Points(geo, matPuntos));
      const halo = new THREE.Mesh(new THREE.SphereGeometry(1.06, 48, 32), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.07, side: THREE.BackSide }));
      escena.add(halo);

      // un pin por sitio
      const matPin = new THREE.MeshBasicMaterial();
      const pines = sitios.map((s) => {
        const pin = new THREE.Group();
        const bola = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), matPin);
        const aro = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.036, 32), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
        const toque = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        const p = aXYZ(s.lat, s.lon, 1.01);
        pin.position.set(...p);
        aro.lookAt(pin.position.clone().multiplyScalar(2));
        pin.add(bola, aro, toque);
        pin.userData = { sitio: s, aro, toque };
        globo.add(pin);
        return pin;
      });

      const color = new THREE.Color();
      const pintar = () => {
        const cs = getComputedStyle(document.documentElement);
        color.set(cs.getPropertyValue('--brand').trim() || '#ff7a1f');
        matPuntos.color.copy(color); matPin.color.copy(color); halo.material.color.copy(color);
        pines.forEach((p) => p.userData.aro.material.color.copy(color));
      };
      pintar();
      const tema = new MutationObserver(() => { pintar(); pedir(); });
      tema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color', 'data-mode'] });

      // girar: arrastre con inercia; si no se toca, gira despacio
      // arranca mirando al centro de tus sitios
      const centro = sitios.length ? { lat: sitios.reduce((a, s) => a + s.lat, 0) / sitios.length, lon: sitios.reduce((a, s) => a + s.lon, 0) / sitios.length } : { lat: 20, lon: 0 };
      let rotY = -centro.lon * rad, rotX = Math.max(-1, Math.min(1, centro.lat * rad)), velY = 0, velX = 0, objetivo = null, arrastrando = false, ultimo = null, mov = 0, sinTocar = 0;
      const aplicar = () => { globo.rotation.y = rotY; globo.rotation.x = rotX; halo.rotation.copy(globo.rotation); };
      const irA = (s) => { objetivo = { y: -s.lon * rad, x: Math.max(-1, Math.min(1, s.lat * rad)), t: performance.now() }; objetivo.y0 = rotY; objetivo.x0 = rotX; };
      const rayo = new THREE.Raycaster(), p2 = new THREE.Vector2();
      lienzo.addEventListener('pointerdown', (e) => { arrastrando = true; ultimo = [e.clientX, e.clientY]; mov = 0; objetivo = null; try { lienzo.setPointerCapture(e.pointerId); } catch { /* sin puntero real (pruebas) */ } });
      lienzo.addEventListener('pointermove', (e) => {
        if (!arrastrando) return;
        const dx = e.clientX - ultimo[0], dy = e.clientY - ultimo[1];
        ultimo = [e.clientX, e.clientY]; mov += Math.abs(dx) + Math.abs(dy);
        velY = dx * 0.0055; velX = dy * 0.0055;
        rotY += velY; rotX = Math.max(-1.2, Math.min(1.2, rotX + velX));
        sinTocar = 0; pedir();
      });
      lienzo.addEventListener('pointerup', (e) => {
        arrastrando = false;
        if (mov < 6) {
          const r = lienzo.getBoundingClientRect();
          p2.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
          rayo.setFromCamera(p2, camara);
          const hit = rayo.intersectObjects(pines.map((p) => p.userData.toque), false)[0];
          if (hit) {
            const pin = pines.find((p) => p.userData.toque === hit.object);
            // solo los pines de la cara visible (la esfera tapa los de atrás)
            const mundo = pin.getWorldPosition(new THREE.Vector3());
            if (mundo.z > 0) { irA(pin.userData.sitio); alElegir(pin.userData.sitio, e); }
          }
        }
        pedir();
      });

      const medir = () => {
        const w = caja.clientWidth, h = Math.max(260, Math.min(caja.clientHeight || 520, 720));
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(w, h, false);
        camara.aspect = w / h; camara.updateProjectionMatrix();
        camara.position.z = w < 520 ? 4.9 : 4.1;
        pedir();
      };
      const ro = new ResizeObserver(medir);
      ro.observe(caja);

      let visible = false, quiere = true, raf = 0, antes = 0;
      const pedir = () => { quiere = true; if (!raf && visible && !document.hidden) raf = requestAnimationFrame(bucle); };
      const bucle = (t) => {
        raf = 0;
        const dt = Math.min(0.05, (t - (antes || t)) / 1000); antes = t;
        if (objetivo) {
          const k = Math.min(1, (performance.now() - objetivo.t) / 900), e = 1 - Math.pow(1 - k, 3);
          let dy = objetivo.y - objetivo.y0; dy = ((dy + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
          rotY = objetivo.y0 + dy * e; rotX = objetivo.x0 + (objetivo.x - objetivo.x0) * e;
          if (k >= 1) objetivo = null;
        } else if (!arrastrando) {
          sinTocar += dt;
          rotY += velY; velY *= 0.94; rotX += velX; velX *= 0.94;
          if (!reducido && sinTocar > 2.5) rotY += dt * 0.12;
        }
        const pulso = 1 + 0.35 * Math.sin(t / 420);
        pines.forEach((p) => { p.userData.aro.scale.setScalar(reducido ? 1 : pulso); });
        aplicar();
        renderer.render(escena, camara);
        const sigue = !reducido || arrastrando || objetivo || Math.abs(velY) + Math.abs(velX) > 0.0005;
        if (visible && !document.hidden && sigue) raf = requestAnimationFrame(bucle);
      };
      const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) pedir(); }, { rootMargin: '100px' });
      io.observe(caja);
      document.addEventListener('visibilitychange', pedir);
      medir(); aplicar();

      return {
        irA,
        destruir() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); tema.disconnect(); document.removeEventListener('visibilitychange', pedir); renderer.dispose(); },
      };
    },
  };
})();
