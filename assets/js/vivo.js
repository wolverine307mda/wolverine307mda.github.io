// Píldora «equipo de casa» de la sección Área privada: en línea / apagado y, si lo activo en mi zona privada, la carga del equipo.
// Sin datos (equipo apagado o desactivado) la píldora no aparece. Con la pestaña oculta se cierra la conexión.
(() => {
  const caja = document.querySelector('[data-vivo]');
  if (!caja || !window.Privada) return;
  const estado = caja.querySelector('[data-vivo-estado]');
  const datos = caja.querySelector('[data-vivo-datos]');
  const cpu = caja.querySelector('[data-vivo-cpu]');
  const ram = caja.querySelector('[data-vivo-ram]');
  const up = caja.querySelector('[data-vivo-up]');
  const linea = caja.querySelector('[data-vivo-linea]');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tiempo = (min) => {
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60);
    return d > 0 ? `${d} d ${h} h` : h > 0 ? `${h} h ${min % 60} min` : `${min} min`;
  };
  const pintar = (d) => {
    caja.hidden = false;
    caja.dataset.vivo = 'en-linea';
    estado.textContent = 'equipo de casa · en línea';
    const hay = typeof d.cpu === 'number';
    datos.hidden = !hay;
    if (!hay) return;
    cpu.textContent = `${d.cpu} %`;
    ram.textContent = `${d.ram} %`;
    up.textContent = tiempo(d.encendidoMinutos ?? 0);
    const s = d.serie?.length ? d.serie : [d.cpu];
    const paso = 120 / Math.max(1, s.length - 1);
    linea.setAttribute('points', s.map((v, i) => `${(i * paso).toFixed(1)},${(30 - (Math.min(100, v) / 100) * 28).toFixed(1)}`).join(' '));
    if (reducido) caja.dataset.quieto = '';
  };
  const apagar = () => { caja.hidden = true; caja.dataset.vivo = 'apagado'; };

  let cerrar = null;
  const abrir = () => { if (!cerrar) cerrar = window.Privada.vivo(pintar, apagar); };
  const parar = () => { cerrar?.(); cerrar = null; };
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : abrir()));
  // solo cuando la sección está cerca de la pantalla: no se abre una conexión para quien no baja hasta aquí
  new IntersectionObserver((es, o) => { if (es.some((e) => e.isIntersecting)) { o.disconnect(); if (!document.hidden) abrir(); } }, { rootMargin: '600px' })
    .observe(document.getElementById('area-privada'));
})();
