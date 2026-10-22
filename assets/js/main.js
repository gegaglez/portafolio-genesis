// Portafolio Génesis — interacciones
(function () {
  const header = document.querySelector('.header');
  const overlay = document.querySelector('.menu-overlay');
  const toggle = document.querySelector('.menu-toggle');

  // Header que se compacta al hacer scroll
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  const setMenu = (open) => {
    header.classList.toggle('is-open', open);
    overlay.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
  overlay.addEventListener('click', () => setMenu(false));
  document.querySelectorAll('.mobile-menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // Animaciones de aparición
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealIO.observe(el));

  // Contadores animados
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = Number(el.dataset.count);
      const start = performance.now();
      const dur = 1600;
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      // Garantiza el valor final aunque el navegador pause requestAnimationFrame
      setTimeout(() => { el.textContent = target; }, dur + 100);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  // Carrusel del proceso
  document.querySelectorAll('.slider').forEach((slider) => {
    const track = slider.querySelector('.slider__track');
    const items = [...track.children];
    const prev = slider.querySelector('.slider__btn--prev');
    const next = slider.querySelector('.slider__btn--next');
    let index = 0;
    const perView = () => {
      const w = slider.querySelector('.slider__viewport').clientWidth;
      return Math.max(1, Math.round(w / (items[0].getBoundingClientRect().width + 28)));
    };
    const update = () => {
      const max = Math.max(0, items.length - perView());
      index = Math.min(Math.max(index, 0), max);
      const step = items[0].getBoundingClientRect().width + 28;
      track.style.transform = `translateX(${-index * step}px)`;
      prev.disabled = index === 0;
      next.disabled = index >= max;
    };
    prev.addEventListener('click', () => { index--; update(); });
    next.addEventListener('click', () => { index++; update(); });
    window.addEventListener('resize', update);

    // Deslizar con el dedo
    let x0 = null;
    track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { index += dx < 0 ? 1 : -1; update(); }
      x0 = null;
    });
    update();
  });

  // Formulario de contacto: envía el mensaje directo al correo mediante FormSubmit
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const note = form.querySelector('.form__note');
      const submit = form.querySelector('button[type="submit"] .btn__front');
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      if (data.get('_honey')) return; // campo trampa para bots

      submit.textContent = 'Enviando…';
      note.textContent = '';
      try {
        const res = await fetch('https://formsubmit.co/ajax/genesisgaglez@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            Nombre: data.get('nombre'),
            Correo: data.get('correo'),
            Mensaje: data.get('mensaje'),
            _replyto: data.get('correo'),
            _subject: `Nuevo mensaje del portafolio — ${data.get('nombre')}`,
            _template: 'table',
            _captcha: 'false',
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) === 'false') throw new Error(json.message);
        note.textContent = '¡Gracias! Tu mensaje se envió correctamente. Te responderé pronto.';
        form.reset();
      } catch (err) {
        note.textContent = 'No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme a genesisgaglez@gmail.com.';
      } finally {
        submit.textContent = 'Enviar';
      }
    });
  }
})();
