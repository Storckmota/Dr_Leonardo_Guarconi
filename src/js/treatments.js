/* Tratamentos: lista tipográfica + palco de placas com contador, linha de
   progresso e troca automática pausável (para ao primeiro toque do usuário).
   Sem motion: troca instantânea via atributos; conteúdo sempre acessível. */

import { gsap, ScrollTrigger, motionOK } from './context.js';

const AUTO_SECONDS = 5.5;

export function initTreatments() {
  const root = document.querySelector('[data-tx]');
  if (!root) return;

  const items = gsap.utils.toArray('[data-tx-item]');
  const buttons = gsap.utils.toArray('[data-tx-btn]');
  const bodies = gsap.utils.toArray('[data-tx-body]');
  const plates = gsap.utils.toArray('[data-tx-plate]');
  const stage = document.querySelector('[data-tx-stage]');
  const counter = document.querySelector('[data-tx-current]');
  const progress = document.querySelector('[data-tx-progress]');
  const pauseBtn = document.querySelector('[data-tx-pause]');

  let active = 0;
  let autoTimer = null;
  let progressTween = null;
  let autoStopped = !motionOK;
  let inView = false;

  items[0].classList.add('is-active');

  const pad = (n) => String(n + 1).padStart(2, '0');

  function setBody(i, show) {
    const body = bodies[i];
    if (show) {
      body.hidden = false;
      if (motionOK) {
        gsap.fromTo(
          body,
          { height: 0, autoAlpha: 0 },
          {
            height: 'auto',
            autoAlpha: 1,
            duration: 0.55,
            ease: 'power3.out',
            onComplete: () => gsap.set(body, { height: 'auto' }),
          }
        );
      }
    } else if (!body.hidden) {
      if (motionOK) {
        gsap.to(body, {
          height: 0,
          autoAlpha: 0,
          duration: 0.4,
          ease: 'power3.in',
          onComplete: () => {
            body.hidden = true;
            gsap.set(body, { clearProps: 'height,opacity,visibility' });
          },
        });
      } else {
        body.hidden = true;
      }
    }
  }

  function swapPlate(prev, next) {
    plates.forEach((p, i) => {
      if (i === next) p.setAttribute('data-active', '');
      else p.removeAttribute('data-active');
    });
    if (!motionOK) return;
    const out = plates[prev];
    const inn = plates[next];
    gsap.to(out, { autoAlpha: 0, scale: 1.025, duration: 0.45, ease: 'power2.in' });
    gsap.fromTo(inn, { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power3.out' });
    const word = inn.querySelector('.plate-word');
    const num = inn.querySelector('.plate-num');
    if (word) gsap.fromTo(word, { xPercent: 5 }, { xPercent: 0, duration: 0.9, ease: 'power3.out' });
    if (num) gsap.fromTo(num, { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
  }

  function select(i, { user = false } = {}) {
    if (i === active) {
      if (user) stopAuto();
      return;
    }
    const prev = active;
    active = i;
    items.forEach((el, k) => el.classList.toggle('is-active', k === i));
    buttons.forEach((b, k) => b.setAttribute('aria-expanded', String(k === i)));
    setBody(prev, false);
    setBody(i, true);
    swapPlate(prev, i);
    if (counter) counter.textContent = pad(i);
    if (user) stopAuto();
    else scheduleAuto();
  }

  /* --- troca automática ----------------------------------------------------- */

  function clearAuto() {
    if (autoTimer) { autoTimer.kill(); autoTimer = null; }
    if (progressTween) { progressTween.kill(); progressTween = null; }
  }

  function scheduleAuto() {
    clearAuto();
    if (autoStopped || !inView || document.hidden) {
      if (progress) gsap.set(progress, { scaleX: 1 });
      return;
    }
    if (progress) {
      progressTween = gsap.fromTo(progress, { scaleX: 0 }, { scaleX: 1, duration: AUTO_SECONDS, ease: 'none' });
    }
    autoTimer = gsap.delayedCall(AUTO_SECONDS, () => select((active + 1) % items.length));
  }

  function stopAuto() {
    autoStopped = true;
    clearAuto();
    if (progress) gsap.set(progress, { scaleX: 1 });
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', 'true');
      pauseBtn.setAttribute('aria-label', 'Retomar troca automática');
    }
  }

  function resumeAuto() {
    autoStopped = false;
    if (pauseBtn) {
      pauseBtn.setAttribute('aria-pressed', 'false');
      pauseBtn.setAttribute('aria-label', 'Pausar troca automática');
    }
    scheduleAuto();
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => (autoStopped ? resumeAuto() : stopAuto()));
    if (!motionOK) {
      pauseBtn.setAttribute('aria-pressed', 'true');
      pauseBtn.setAttribute('aria-label', 'Retomar troca automática');
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearAuto();
    else scheduleAuto();
  });

  ScrollTrigger.create({
    trigger: root,
    start: 'top 85%',
    end: 'bottom 10%',
    onToggle: (self) => {
      inView = self.isActive;
      if (inView) scheduleAuto();
      else clearAuto();
    },
  });

  /* --- interação ---------------------------------------------------------------- */

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => select(i, { user: true }));
    btn.addEventListener('keydown', (e) => {
      let t = null;
      if (e.key === 'ArrowDown') t = (i + 1) % buttons.length;
      else if (e.key === 'ArrowUp') t = (i - 1 + buttons.length) % buttons.length;
      else if (e.key === 'Home') t = 0;
      else if (e.key === 'End') t = buttons.length - 1;
      if (t !== null) {
        e.preventDefault();
        buttons[t].focus();
        select(t, { user: true });
      }
    });
    /* hover apenas antecipa a placa no desktop; clique continua o gesto oficial */
  });

  /* Entrada dos itens da lista em cascata */
  if (motionOK && items.length) {
    gsap.set(items, { autoAlpha: 0, y: 20 });
    ScrollTrigger.create({
      trigger: '[data-tx-list]',
      start: 'top 84%',
      once: true,
      onEnter: () =>
        gsap.to(items, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.055 }),
    });
  }

  /* Entrada do palco */
  if (motionOK && stage) {
    gsap.set(stage, { clipPath: 'inset(0 0 100% 0)' });
    ScrollTrigger.create({
      trigger: stage,
      start: 'top 88%',
      once: true,
      onEnter: () => gsap.to(stage, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power4.out' }),
    });
  }
}
