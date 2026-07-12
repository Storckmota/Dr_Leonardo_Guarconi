import { gsap, motionOK } from './context.js';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

const wrapIndex = (index, length) => ((index % length) + length) % length;

export function initPhilosophySlider() {
  const root = document.querySelector('[data-filosofia-slider]');
  if (!root) return;

  const viewport = root.querySelector('[data-filosofia-viewport]');
  const track = root.querySelector('[data-filosofia-track]');
  const cards = gsap.utils.toArray('[data-filosofia-card]', root);
  const prev = root.querySelector('[data-filosofia-prev]');
  const next = root.querySelector('[data-filosofia-next]');
  const dots = gsap.utils.toArray('[data-filosofia-dot]', root);
  const live = root.querySelector('[data-filosofia-live]');
  if (!viewport || !track || cards.length < 2) return;

  root.classList.add('is-ready');

  let active = 0;
  let step = 1;
  let centerOffset = 0;
  let dragger = null;
  const reduce = !motionOK;
  const labels = cards.map((card, i) => {
    const title = card.querySelector('.filosofia-card-title')?.textContent?.replace(/\s+/g, ' ').trim();
    return title || `Princípio ${i + 1}`;
  });

  function measure() {
    if (cards.length > 1) {
      step = Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft);
    } else {
      step = Math.max(1, cards[0].getBoundingClientRect().width);
    }
    const cardWidth = cards[0].getBoundingClientRect().width;
    centerOffset = Math.max(0, (viewport.clientWidth - cardWidth) / 2);
    gsap.set(track, { x: centerOffset - active * step });
    updateVisuals(centerOffset - active * step);
  }

  function updateA11y(index) {
    cards.forEach((card, i) => {
      const isActive = i === index;
      card.classList.toggle('is-active', isActive);
      card.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) card.setAttribute('aria-current', 'true');
      else card.removeAttribute('aria-current');
    });

    dots.forEach((dot, i) => {
      const isActive = i === index;
      dot.classList.toggle('is-active', isActive);
      if (isActive) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    if (live) live.textContent = `Princípio ${index + 1} de ${cards.length}: ${labels[index]}.`;
  }

  function updateVisuals(x) {
    cards.forEach((card, i) => {
      const distance = Math.min(1.6, Math.abs(i * step + x - centerOffset) / step);
      const near = Math.max(0, 1 - distance);
      card.style.setProperty('--card-focus', near.toFixed(3));
      if (reduce) {
        gsap.set(card, { clearProps: 'scale,y,opacity' });
      } else {
        gsap.set(card, {
          scale: 0.92 + near * 0.08,
          y: (1 - near) * 16,
          opacity: 0.64 + near * 0.36,
        });
      }
    });
  }

  function goTo(index, { focus = false, immediate = false } = {}) {
    active = wrapIndex(index, cards.length);
    updateA11y(active);
    const x = centerOffset - active * step;
    if (reduce || immediate) {
      gsap.set(track, { x });
      updateVisuals(x);
    } else {
      gsap.to(track, {
        x,
        duration: 0.58,
        ease: 'power3.out',
        overwrite: true,
        onUpdate: () => updateVisuals(gsap.getProperty(track, 'x')),
      });
    }
    if (dragger) dragger.update();
    if (focus) cards[active].focus({ preventScroll: true });
  }

  function nearestFromX(x) {
    return Math.round((centerOffset - x) / step);
  }

  /* Recalcula geometria e reposiciona o card ativo sem animar. As medidas
     dependem da largura final dos cards (flex-basis + fontes carregadas),
     por isso remedimos após fonts.ready e ao entrar em vista: no init a
     página pode ainda não ter aplicado o layout final (visível sobretudo
     com prefers-reduced-motion, onde não há preloader que adie a leitura). */
  function remeasure() {
    measure();
    goTo(active, { immediate: true });
  }

  measure();
  updateA11y(active);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(remeasure));
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          remeasure();
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    io.observe(root);
  }

  dragger = Draggable.create(track, {
    type: 'x',
    trigger: viewport,
    inertia: false,
    dragResistance: 0.08,
    edgeResistance: 0.78,
    allowNativeTouchScrolling: true,
    minimumMovement: 10,
    onPress() {
      gsap.killTweensOf(track);
      root.classList.add('is-dragging');
    },
    onDrag() {
      updateVisuals(this.x);
    },
    onRelease() {
      root.classList.remove('is-dragging');
    },
    onDragEnd() {
      goTo(nearestFromX(this.x));
    },
  })[0];

  prev?.addEventListener('click', () => goTo(active - 1, { focus: true }));
  next?.addEventListener('click', () => goTo(active + 1, { focus: true }));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i, { focus: true })));

  root.addEventListener('keydown', (event) => {
    let target = null;
    if (event.key === 'ArrowRight') target = active + 1;
    else if (event.key === 'ArrowLeft') target = active - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = cards.length - 1;
    if (target !== null) {
      event.preventDefault();
      goTo(target, { focus: true });
    }
  });

  window.addEventListener('resize', () => {
    measure();
    goTo(active, { immediate: true });
  }, { passive: true });
}
