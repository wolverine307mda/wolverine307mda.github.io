// Conexión con mi zona privada (el equipo de casa, por Tailscale Funnel).
// Una sola copia de la dirección y de las preguntas que le hace esta web:
//  · salud(): ¿está encendido? (GET /api/salud)
//  · galeria(): las fotos que he publicado (GET /api/publico/galeria); null si el equipo está apagado o la galería está oculta.
// Si el equipo no responde, la web sigue igual: nada depende de él, solo aparecen secciones de más cuando está encendido.
(() => {
  const base = (document.querySelector('meta[name="privada"]')?.content || 'https://equipo-de-casa.tail77819b.ts.net').replace(/\/$/, '');
  const pedir = async (ruta, ms) => {
    const r = await fetch(base + ruta, { cache: 'no-cache', signal: AbortSignal.timeout(ms) });
    if (!r.ok) throw new Error(String(r.status));
    return r;
  };
  window.Privada = {
    base,
    async salud(ms = 7000) {
      try { await pedir('/api/salud', ms); return true; } catch { return false; }
    },
    async galeria(ms = 4000) {
      try { return (await (await pedir('/api/publico/galeria', ms)).json()).fotos ?? []; } catch { return null; }
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
