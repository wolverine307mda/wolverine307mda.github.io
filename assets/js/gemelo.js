// Gemelo 3D de mi servidor: una torre hecha con formas sencillas (sin modelos externos) que reacciona a los datos en directo
// de mi equipo de casa: los ventiladores giran más rápido con la CPU, la tira de LEDs es la memoria, los discos parpadean con la
// carga, los cables llevan paquetes y la luz de la habitación es la de día o de noche de donde vive. Sin datos, se queda dormido.
// Window.Gemelo.crear(caja) -> { actualizar(datos), dormir(), destruir() } | null (sin WebGL)
(() => {
  window.Gemelo = {
    crear(caja) {
      const THREE = window.THREE;
      if (!THREE) return null;
      const lienzo = caja.querySelector('canvas');
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true }); } catch { return null; }
      const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const escena = new THREE.Scene();
      const camara = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
      camara.position.set(2.9, 1.6, 4.6);
      camara.lookAt(0, 0.75, 0);

      const color = new THREE.Color();
      const rojo = new THREE.Color('#ff3b30');
      const ambiente = new THREE.AmbientLight(0xffffff, 0.35);
      const sol = new THREE.DirectionalLight(0xffffff, 1.1);
      sol.position.set(3, 5, 4);
      const brillo = new THREE.PointLight(0xff7a1f, 1.2, 6);
      brillo.position.set(0, 1.0, 1.4);
      escena.add(ambiente, sol, brillo);

      // suelo con rejilla
      const suelo = new THREE.GridHelper(8, 16, 0x444444, 0x2a2a2a);
      suelo.position.y = -0.005;
      escena.add(suelo);

      // la torre
      const torre = new THREE.Group();
      escena.add(torre);
      const carcasa = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.9, 1.0), new THREE.MeshStandardMaterial({ color: 0x14181d, metalness: 0.5, roughness: 0.45 }));
      carcasa.position.y = 0.95;
      torre.add(carcasa);
      const frente = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 1.78), new THREE.MeshStandardMaterial({ color: 0x0a0d10, metalness: 0.2, roughness: 0.2, transparent: true, opacity: 0.9 }));
      frente.position.set(0, 0.95, 0.505);
      torre.add(frente);

      // ventiladores: aro, buje y siete palas
      const matAspa = new THREE.MeshStandardMaterial({ color: 0x2b323a, metalness: 0.4, roughness: 0.5 });
      const matAro = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff7a1f, emissiveIntensity: 0.8 });
      const ventiladores = [1.45, 0.75].map((y) => {
        const g = new THREE.Group();
        g.position.set(-0.1, y, 0.52);
        const aro = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.022, 10, 40), matAro);
        g.add(aro);
        for (let i = 0; i < 7; i++) {
          const pala = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.085, 0.012), matAspa);
          pala.position.set(0.17 * Math.cos((i * 2 * Math.PI) / 7), 0.17 * Math.sin((i * 2 * Math.PI) / 7), 0);
          pala.rotation.z = (i * 2 * Math.PI) / 7;
          pala.rotation.x = 0.35;
          g.add(pala);
        }
        const buje = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16), matAspa);
        buje.rotation.x = Math.PI / 2;
        g.add(buje);
        torre.add(g);
        return g;
      });

      // memoria: ocho LED en vertical
      const ram = Array.from({ length: 8 }, (_, i) => {
        const m = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x000000 });
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.02), m);
        led.position.set(0.42, 0.45 + i * 0.16, 0.52);
        torre.add(led);
        return m;
      });
      // discos: tres LED abajo
      const discos = [0, 1, 2].map((i) => {
        const m = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x000000 });
        const led = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.02), m);
        led.position.set(-0.3 + i * 0.16, 0.2, 0.52);
        torre.add(led);
        return m;
      });

      // router y cable con paquetes
      const router = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.3), new THREE.MeshStandardMaterial({ color: 0x1b2128, metalness: 0.4, roughness: 0.5 }));
      router.position.set(1.7, 0.05, 0.4);
      escena.add(router);
      const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(0.55, 0.3, -0.2), new THREE.Vector3(0.9, 0.02, 0.2), new THREE.Vector3(1.3, 0.02, 0.4), new THREE.Vector3(1.55, 0.1, 0.4)]);
      escena.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 30, 0.012, 6), new THREE.MeshStandardMaterial({ color: 0x333a42 })));
      const matPaquete = new THREE.MeshBasicMaterial();
      const paquetes = Array.from({ length: 6 }, (_, i) => {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), matPaquete);
        p.userData.t = i / 6;
        escena.add(p);
        return p;
      });

      // ventana: el cielo de fuera
      const cielo = new THREE.MeshBasicMaterial({ color: 0x0b1530 });
      const ventana = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), cielo);
      ventana.position.set(-2.1, 1.3, -1.2);
      escena.add(ventana);
      const marco = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.64, 1.24)), new THREE.LineBasicMaterial({ color: 0x555b63 }));
      marco.position.copy(ventana.position);
      escena.add(marco);

      let cpu = 0, memoria = 0, dormido = true, dia = false;
      const pintar = () => {
        const cs = getComputedStyle(document.documentElement);
        color.set(cs.getPropertyValue('--brand').trim() || '#ff7a1f');
        matAro.emissive.copy(color); matPaquete.color.copy(color);
      };
      pintar();
      const tema = new MutationObserver(() => { pintar(); pedir(); });
      tema.observe(document.documentElement, { attributes: true, attributeFilter: ['data-color', 'data-mode'] });

      const api = {
        actualizar(d) {
          dormido = false;
          cpu = typeof d.cpu === 'number' ? d.cpu : 8;
          memoria = typeof d.ram === 'number' ? d.ram : 30;
          dia = d.dia === true;
          pedir();
        },
        dormir() { dormido = true; pedir(); },
        destruir() { cancelAnimationFrame(raf); io.disconnect(); ro.disconnect(); tema.disconnect(); document.removeEventListener('visibilitychange', pedir); renderer.dispose(); },
      };

      // pequeño paralaje con el puntero
      let px = 0, py = 0;
      addEventListener('pointermove', (e) => { px = (e.clientX / innerWidth - 0.5); py = (e.clientY / innerHeight - 0.5); pedir(); }, { passive: true });

      let visible = false, raf = 0, antes = 0, giro = 0, tPaq = 0, parpadeo = 0;
      const medir = () => {
        const w = caja.clientWidth, h = Math.max(260, Math.min(caja.clientHeight || 420, 560));
        renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
        renderer.setSize(w, h, false);
        camara.aspect = w / h; camara.updateProjectionMatrix();
        pedir();
      };
      const ro = new ResizeObserver(medir);
      ro.observe(caja);
      const pedir = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(bucle); };
      const bucle = (t) => {
        raf = 0;
        // 30 fotogramas por segundo como mucho: es un adorno, no un juego
        if (t - antes < 33) { raf = requestAnimationFrame(bucle); return; }
        const dt = Math.min(0.1, (t - (antes || t)) / 1000); antes = t;

        const carga = dormido ? 0 : cpu / 100;
        const velocidad = dormido ? 0 : 1.2 + carga * 16; // rad/s
        if (!reducido) giro += dt * velocidad;
        ventiladores.forEach((v, i) => { v.rotation.z = i ? -giro : giro; });

        // memoria: tantos LED como toque, de color marca a rojo si está muy llena
        const encendidos = dormido ? 0 : Math.round((memoria / 100) * 8);
        ram.forEach((m, i) => {
          const on = i < encendidos;
          m.emissive.copy(on ? color.clone().lerp(rojo, Math.max(0, (memoria - 70) / 30) * (i / 7)) : new THREE.Color(0x000000));
          m.emissiveIntensity = on ? 1.4 : 0;
        });
        parpadeo += dt;
        discos.forEach((m, i) => {
          const on = !dormido && Math.sin(parpadeo * (6 + i * 3.1) + i) > 1 - 0.25 - carga * 1.4;
          m.emissive.set(on ? 0x39ff88 : 0x000000);
          m.emissiveIntensity = on ? 1.6 : 0;
        });

        // cable: paquetes más rápidos y juntos cuanto más trabaja
        tPaq += dt * (dormido ? 0 : 0.12 + carga * 0.6);
        paquetes.forEach((p, i) => {
          p.visible = !dormido;
          p.position.copy(curva.getPoint((p.userData.t + tPaq) % 1));
        });

        // luz: la carga calienta el brillo de la torre hacia el rojo; de día entra más luz y el cielo es claro
        brillo.color.copy(color).lerp(rojo, dormido ? 0 : Math.max(0, carga - 0.55) / 0.45);
        brillo.intensity = dormido ? 0.15 : 0.9 + carga * 1.8;
        sol.intensity = dormido ? 0.15 : dia ? 1.5 : 0.45;
        ambiente.intensity = dormido ? 0.12 : dia ? 0.6 : 0.25;
        cielo.color.set(dormido ? 0x07090c : dia ? 0x8ec5ff : 0x0b1530);
        matAro.emissiveIntensity = dormido ? 0.05 : 0.5 + carga;

        // la cámara se mueve un poco con el puntero (y no se mueve con movimiento reducido)
        if (!reducido) { camara.position.x += (2.9 + px * 1.2 - camara.position.x) * 0.06; camara.position.y += (1.6 - py * 0.8 - camara.position.y) * 0.06; camara.lookAt(0, 0.75, 0); }
        renderer.render(escena, camara);
        if (visible && !document.hidden && (!reducido || !dormido)) raf = requestAnimationFrame(bucle);
      };
      const io = new IntersectionObserver((es) => { visible = es.some((e) => e.isIntersecting); if (visible) pedir(); }, { rootMargin: '100px' });
      io.observe(caja);
      document.addEventListener('visibilitychange', pedir);
      medir();
      return api;
    },
  };
})();

// Se crea cuando llegan los primeros datos de carga (hay que haber activado «enseñar la carga» en mi zona privada)
(() => {
  const caja = document.querySelector('[data-gemelo]');
  if (!caja) return;
  let modelo = null;
  addEventListener('privada:estado', (e) => {
    const d = e.detail;
    if (typeof d.cpu !== 'number') { caja.hidden = true; return; }
    caja.hidden = false;
    modelo ??= window.Gemelo.crear(caja);
    if (!modelo) { caja.hidden = true; return; }
    caja.dataset.luz = d.dia ? 'dia' : 'noche';
    modelo.actualizar(d);
  });
  addEventListener('privada:apagado', () => { modelo?.dormir(); caja.hidden = true; });
})();
