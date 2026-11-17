// Conexión con mi zona privada (el equipo de casa, por un túnel de Cloudflare en app.wolvem.dev).
// Una sola copia de la dirección y de las preguntas que le hace esta web:
//  · salud(): ¿está encendido? (GET /api/salud)
//  · tema(): el tema por defecto de la web (GET /api/publico/tema → { modo, color }); null si no responde.
//  · galeria(): las fotos que he publicado (GET /api/publico/galeria); null si el equipo está apagado o la galería está oculta.
// Si el equipo no responde, la web sigue igual: nada depende de él, solo aparecen secciones de más cuando está encendido.
(() => {
  const base = (document.querySelector('meta[name="privada"]')?.content || 'https://app.wolvem.dev').replace(/\/$/, '');
  const pedir = async (ruta, ms) => {
    // la galería ya viene con «max-age=60»: se deja que el navegador la reutilice; lo demás (salud, estado) siempre se revalida
    const r = await fetch(base + ruta, { cache: ruta.includes('/galeria') ? 'default' : 'no-cache', signal: AbortSignal.timeout(ms) });
    if (!r.ok) throw new Error(String(r.status));
    return r;
  };
  window.Privada = {
    base,
    async salud(ms = 7000) {
      try { await pedir('/api/salud', ms); return true; } catch { return false; }
    },
    // Tema por defecto de la web, el mismo para todos. Se guarda la última respuesta para pintarla al instante
    // la próxima vez (aunque el equipo esté apagado). Solo se aceptan valores conocidos.
    async tema(ms = 4000) {
      try {
        const t = await (await pedir('/api/publico/tema', ms)).json();
        const ok = ['light', 'dark', 'system'].includes(t.modo) && ['naranja', 'lima', 'cobalto', 'rosa', 'rojo'].includes(t.color);
        if (!ok) return null;
        const tema = { modo: t.modo, color: t.color };
        try { localStorage.setItem('tema-web', JSON.stringify(tema)); } catch { /* sin almacenamiento: no pasa nada */ }
        return tema;
      } catch { return null; }
    },
    async galeria(ms = 4000) {
      try {
        const fotos = (await (await pedir('/api/publico/galeria', ms)).json()).fotos ?? [];
        try { localStorage.setItem('galeria-privada', JSON.stringify(fotos)); } catch { /* sin almacenamiento: no pasa nada */ }
        return fotos;
      } catch { try { localStorage.removeItem('galeria-privada'); } catch { /* idem */ } return null; }
    },
    // la última lista que llegó: se pinta al instante mientras se confirma con el equipo (si no responde, la sección se retira)
    galeriaGuardada() {
      try { const f = JSON.parse(localStorage.getItem('galeria-privada') || 'null'); return Array.isArray(f) ? f : null; } catch { return null; }
    },
    // Estado en directo (Server-Sent Events). alRecibir(datos) con cada lectura; alCaer() si no hay datos (equipo apagado o desactivado).
    // Si la conexión en directo no sirve, se pregunta cada 30 s. Devuelve una función para cerrarlo.
    vivo(alRecibir, alCaer) {
      let es = null, sondeo = null, cerrado = false;
      const sondear = async () => {
        if (cerrado) return;
        try { alRecibir(await (await pedir('/api/publico/estado', 5000)).json()); abrir(); return; } catch { alCaer(); }
        sondeo = setTimeout(sondear, 30000);
      };
      const abrir = () => {
        if (cerrado || es) return;
        es = new EventSource(base + '/api/publico/estado/vivo');
        es.onmessage = (e) => { try { alRecibir(JSON.parse(e.data)); } catch { /* lectura rota: se ignora */ } };
        es.onerror = () => {
          // CLOSED = la API contestó que no (apagado o desactivado) o no hay red: se avisa y se sondea con calma.
          // CONNECTING = se cortó el directo (cada 10 min lo cierra el servidor) y el navegador reconecta solo.
          if (es.readyState === 2) { es = null; alCaer(); clearTimeout(sondeo); sondeo = setTimeout(sondear, 30000); }
        };
      };
      abrir();
      return () => { cerrado = true; es?.close(); es = null; clearTimeout(sondeo); };
    },
  };
})();
