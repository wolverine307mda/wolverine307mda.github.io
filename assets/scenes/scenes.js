// Escenas de scroll de esta web, construidas sobre stage.js (Stage.scene).
// Cada una tiene su composición final en CSS: es lo que ven el movimiento reducido,
// un fallo del CDN y, en "track", el teléfono.
window.Scenes = window.Scenes || {};

// 1. El nombre se abre y la ventana del editor crece hasta ocupar la pantalla.
//    Marcado: .hero__name > .line ×2, .hero__window > .hero__code, .hero__foot, .hero__statement
Scenes['hero-open'] = (root, opts = {}) => Stage.scene(root, {
  hold: opts.hold ?? 1.6,
  scrub: 0.6,
  build(tl, { q }) {
    const [l1, l2] = q('.hero__name .line');
    tl.to(l1, { xPercent: -45, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(l2, { xPercent: 45, autoAlpha: 0, duration: 0.5, ease: 'power2.in' }, 0)
      .to(q('.hero__foot'), { y: 60, autoAlpha: 0, duration: 0.25 }, 0)
      .to(q('.hero__window'), { '--o': 1, duration: 0.6, ease: 'power2.inOut' }, 0.05)
      .to(q('.hero__code'), { scale: 1.6, autoAlpha: 0.22, duration: 0.6, ease: 'power2.inOut' }, 0.1)
      .fromTo(q('.hero__statement'), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.62);
  },
});

// 2. La pista de proyectos se desplaza en horizontal mientras se baja.
//    Marcado: .work__track con el título gigante y los paneles. En el teléfono, lista vertical.
Scenes['track'] = (root, opts = {}) => Stage.scene(root, {
  hold: opts.hold ?? 3,
  scrub: true,
  phone: 'rest',
  build(tl, { q }) {
    const track = q('.work__track')[0];
    tl.to(track, { x: () => -(track.scrollWidth - window.innerWidth), duration: 1 }, 0)
      .fromTo(q('.panel__media img'), { xPercent: 6 }, { xPercent: -6, duration: 1 }, 0)
      .fromTo(q('.work__title'), { yPercent: 0 }, { yPercent: -18, duration: 0.3 }, 0);
  },
});

// 3. La cámara vuela entre las fotos: cada una llega desde el fondo y pasa por delante.
//    Marcado: .photos__title, .photos__field > img (con --x/--y), .photos__note
Scenes['fly'] = (root, opts = {}) => Stage.scene(root, {
  hold: opts.hold ?? 3,
  scrub: true,
  build(tl, { q }) {
    const imgs = q('.photos__field img');
    const landing = 4;                       // las últimas cuatro se quedan alrededor del título
    const fly = imgs.length - landing;
    imgs.forEach((img, i) => {
      if (i < fly) {
        const at = i * 0.07;
        tl.fromTo(img, { z: -2400 }, { z: 760, duration: 0.45, ease: 'none' }, at)
          .fromTo(img, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1, ease: 'none' }, at)
          .to(img, { autoAlpha: 0, duration: 0.06, ease: 'none' }, at + 0.39);
      } else {
        const at = 0.42 + (i - fly) * 0.06;
        tl.fromTo(img, { z: -2400, autoAlpha: 0 }, { z: 0, duration: 0.4, ease: 'power2.out' }, at)
          .to(img, { autoAlpha: 1, duration: 0.12, ease: 'none' }, at);
      }
    });
    tl.fromTo(q('.photos__title'), { scale: 0.72 }, { scale: 1, duration: 1 }, 0)
      .fromTo(q('.photos__note'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.1 }, 0.88);
  },
});
