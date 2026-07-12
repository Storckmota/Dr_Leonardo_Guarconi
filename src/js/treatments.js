/* Tratamentos.
   Desktop/tablet (>=768px): palco de placas com contador, linha de progresso
   e troca automática pausável (comportamento aprovado, inalterado).
   Mobile (<=767.98px): sem palco — a lista vira um accordion vertical
   (um item aberto por vez, todos fechados no início).
   Ambos os modos ficam isolados por gsap.matchMedia() com cleanup automático.
   Sem motion: troca/abertura instantânea; conteúdo sempre acessível. */

import { gsap, ScrollTrigger, motionOK } from './context.js';

const AUTO_SECONDS = 5.5;
const pad = (n) => String(n + 1).padStart(2, '0');

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

  const mm = gsap.matchMedia();

  /* ======================================================================
     DESKTOP / TABLET — palco + lista + autoplay (aprovado)
     ====================================================================== */
  mm.add('(min-width: 768px)', () => {
    const ac = new AbortController();
    const { signal } = ac;

    let active = 0;
    let autoTimer = null;
    let progressTween = null;
    let autoStopped = !motionOK;
    let inView = false;

    /* estado inicial explícito (pode vir do modo mobile ao redimensionar) */
    items.forEach((el, k) => el.classList.toggle('is-active', k === 0));
    buttons.forEach((b, k) => b.setAttribute('aria-expanded', String(k === 0)));
    bodies.forEach((b, k) => { b.hidden = k !== 0; });
    plates.forEach((p, k) => (k === 0 ? p.setAttribute('data-active', '') : p.removeAttribute('data-active')));
    if (counter) counter.textContent = pad(0);

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
      const copy = inn.querySelectorAll('.plate-name, .plate-note, .plate-field, .plate-thread');
      if (word) gsap.fromTo(word, { xPercent: 5 }, { xPercent: 0, duration: 0.9, ease: 'power3.out' });
      if (num) gsap.fromTo(num, { yPercent: 18, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' });
      if (copy.length) {
        gsap.fromTo(
          copy,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.68, ease: 'power3.out', stagger: 0.05 }
        );
      }
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
      pauseBtn.addEventListener('click', () => (autoStopped ? resumeAuto() : stopAuto()), { signal });
      if (!motionOK) {
        pauseBtn.setAttribute('aria-pressed', 'true');
        pauseBtn.setAttribute('aria-label', 'Retomar troca automática');
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clearAuto();
      else scheduleAuto();
    }, { signal });

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

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => select(i, { user: true }), { signal });
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
      }, { signal });
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

    return () => {
      ac.abort();
      clearAuto();
    };
  });

  /* ======================================================================
     MOBILE — accordion vertical (sem palco)
     ====================================================================== */
  mm.add('(max-width: 767.98px)', () => {
    const ac = new AbortController();
    const { signal } = ac;
    let openIndex = -1;

    /* começa totalmente fechado; a lista dos nove itens fica visível */
    items.forEach((el) => el.classList.remove('is-active'));
    buttons.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    bodies.forEach((b) => {
      b.hidden = true;
      gsap.set(b, { clearProps: 'height,opacity,visibility' });
    });

    function openBody(i) {
      const body = bodies[i];
      body.hidden = false;
      if (!motionOK) return;
      gsap.fromTo(
        body,
        { height: 0, autoAlpha: 0 },
        {
          height: 'auto',
          autoAlpha: 1,
          duration: 0.42,
          ease: 'power3.out',
          onComplete: () => gsap.set(body, { height: 'auto' }),
        }
      );
      const desc = body.querySelector('.tx-desc');
      if (desc) gsap.fromTo(desc, { y: 8 }, { y: 0, duration: 0.42, ease: 'power3.out' });
    }

    function closeBody(i, instant) {
      const body = bodies[i];
      if (instant || !motionOK) {
        body.hidden = true;
        gsap.set(body, { clearProps: 'height,opacity,visibility' });
        return;
      }
      gsap.to(body, {
        height: 0,
        autoAlpha: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          body.hidden = true;
          gsap.set(body, { clearProps: 'height,opacity,visibility' });
        },
      });
    }

    function setState(i, open) {
      items[i].classList.toggle('is-active', open);
      buttons[i].setAttribute('aria-expanded', String(open));
    }

    function toggle(i) {
      if (openIndex === i) {
        closeBody(i);
        setState(i, false);
        openIndex = -1;
        return;
      }
      if (openIndex !== -1) {
        closeBody(openIndex);
        setState(openIndex, false);
      }
      openBody(i);
      setState(i, true);
      openIndex = i;
    }

    /* <button> nativo: Enter/Espaço já disparam o clique (teclado ok) */
    buttons.forEach((btn, i) => btn.addEventListener('click', () => toggle(i), { signal }));

    return () => {
      ac.abort();
      bodies.forEach((b) => gsap.set(b, { clearProps: 'height,opacity,visibility' }));
    };
  });
}
