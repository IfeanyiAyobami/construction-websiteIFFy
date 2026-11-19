import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

/**
 * KONSADEM motion system.
 *
 * Markup opts in with data attributes, so pages stay declarative:
 *   data-split            heading revealed line by line from behind a mask
 *   data-fill             paragraph whose words "ink in" as it scrolls through the viewport
 *   data-fade             block rises and fades in            (data-delay="0.2" optional)
 *   data-stagger          children rise in one after another
 *   data-clip             image frame wipes open, picture settles from a slight zoom
 *   data-parallax="10"    picture drifts by ±10% while its frame crosses the viewport
 *   data-count="60"       number counts up                    (data-from="0" optional)
 *   data-line             hairline draws from the left
 *   data-magnetic         element leans toward the pointer
 *   data-marquee          endless band whose speed and direction follow the scroll
 *   data-theme="dark"     section tells the fixed header which colours to use
 *
 * Everything is created inside one gsap.context so a route change tears it all down.
 */

let registered = false;
export function registerMotion() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);
  CustomEase.create('k-out', '0.16,1,0.3,1');
  CustomEase.create('k-inout', '0.76,0,0.24,1');
  gsap.defaults({ ease: 'k-out' });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Entrance for anything above the fold. Runs once the preloader starts to lift. */
export function playIntro(host: HTMLElement) {
  host.querySelectorAll<HTMLElement>('[data-intro-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'k-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, { yPercent: 118, duration: 1.35, stagger: 0.09, delay: 0.15 }),
    });
  });
  const tl = gsap.timeline();
  const fades = host.querySelectorAll('[data-intro-fade]');
  if (fades.length) tl.from(fades, { y: 26, autoAlpha: 0, duration: 1.1, stagger: 0.07 }, 0.55);
  const mediaEl = host.querySelectorAll('[data-intro-media]');
  if (mediaEl.length) tl.from(mediaEl, { scale: 1.22, duration: 2.4, ease: 'power3.out' }, 0);
  return tl;
}

export function initScrollMotion(host: HTMLElement) {
  const q = <T extends HTMLElement = HTMLElement>(sel: string) => gsap.utils.toArray<T>(host.querySelectorAll<T>(sel));
  const cleanups: Array<() => void> = [];
  const mm = gsap.matchMedia();

  // ── Text ────────────────────────────────────────────────────────────────
  q('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'k-line', autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 118, duration: 1.2, stagger: 0.085,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      }),
    });
  });

  q('[data-fill]').forEach((el) => {
    SplitText.create(el, {
      type: 'words', wordsClass: 'k-word', autoSplit: true,
      onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.16 }, {
        opacity: 1, ease: 'none', stagger: 0.06,
        scrollTrigger: { trigger: el, start: 'top 84%', end: 'bottom 58%', scrub: 0.4 },
      }),
    });
  });

  // ── Blocks ──────────────────────────────────────────────────────────────
  q('[data-fade]').forEach((el) => {
    gsap.from(el, {
      y: 38, autoAlpha: 0, duration: 1.1, delay: Number(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 93%', once: true },
    });
  });

  q('[data-stagger]').forEach((group) => {
    const items = Array.from(group.children);
    if (!items.length) return;
    gsap.from(items, {
      y: 44, autoAlpha: 0, duration: 1, stagger: 0.075,
      scrollTrigger: { trigger: group, start: 'top 88%', once: true },
    });
  });

  q('[data-line]').forEach((el) => {
    gsap.from(el, {
      scaleX: 0, transformOrigin: 'left center', duration: 1.5, ease: 'k-inout',
      scrollTrigger: { trigger: el, start: 'top 94%', once: true },
    });
  });

  // ── Pictures ────────────────────────────────────────────────────────────
  q('[data-clip]').forEach((frame) => {
    const from = frame.dataset.clip === 'left' ? 'inset(0% 100% 0% 0%)' : 'inset(100% 0% 0% 0%)';
    const tl = gsap.timeline({ scrollTrigger: { trigger: frame, start: 'top 86%', once: true } });
    tl.fromTo(frame, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'k-inout', clearProps: 'clipPath' });
    const inner = frame.querySelector('img, video');
    if (inner) tl.from(inner, { scale: 1.32, duration: 2, ease: 'power3.out' }, 0);
  });

  q('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax) || 10;
    gsap.fromTo(el, { yPercent: -amount }, {
      yPercent: amount, ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // ── Numbers ─────────────────────────────────────────────────────────────
  q('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    const state = { v: Number(el.dataset.from || 0) };
    el.textContent = String(Math.round(state.v));
    gsap.to(state, {
      v: target, duration: 2.2, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: () => { el.textContent = String(Math.round(state.v)); },
    });
  });

  // ── Numbered steps light up one after another as the row crosses the screen ──
  q('[data-steps]').forEach((list) => {
    const items = Array.from(list.children);
    list.classList.add('is-live');
    ScrollTrigger.create({
      trigger: list, start: 'top 78%', end: 'bottom 62%',
      onUpdate: (self) => { const reach = Math.floor(self.progress * items.length * 1.001); items.forEach((el, i) => el.classList.toggle('is-on', i <= reach)); },
    });
    items[0]?.classList.add('is-on');
    cleanups.push(() => { list.classList.remove('is-live'); items.forEach((el) => el.classList.remove('is-on')); });
  });

  // ── Marquees: speed and direction follow the scroll ─────────────────────
  q('[data-marquee]').forEach((band) => {
    const track = band.firstElementChild as HTMLElement | null;
    if (!track) return;
    const base = Number(band.dataset.marquee) || 1;
    const sign = base < 0 ? -1 : 1;
    const loop = gsap.to(track, { xPercent: -50, duration: 38 / Math.abs(base), ease: 'none', repeat: -1 });
    loop.totalTime(loop.duration() * 400).timeScale(sign); // room to run backwards
    let dir = sign;
    ScrollTrigger.create({
      trigger: band, start: 'top bottom', end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity();
        if (Math.abs(v) < 5) return;
        dir = (v > 0 ? 1 : -1) * sign;
        gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 500, 5)), duration: 0.25, overwrite: true, ease: 'power2.out' });
        gsap.to(loop, { timeScale: dir, duration: 1.1, delay: 0.25, ease: 'power2.out' });
      },
      onToggle: (self) => { if (self.isActive) loop.resume(); else loop.pause(); },
    });
  });

  // ── Header: hides on the way down, returns on the way up, recolours per section ──
  const header = host.querySelector<HTMLElement>('.k-header');
  if (header) {
    ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        header.classList.toggle('is-scrolled', y > 60);
        header.classList.toggle('is-hidden', self.direction === 1 && y > 420 && !host.classList.contains('menu-open'));
      },
    });
    q('[data-theme]').forEach((section) => {
      ScrollTrigger.create({
        trigger: section, start: 'top 44px', end: 'bottom 44px',
        onToggle: (self) => { if (self.isActive) header.dataset.theme = section.dataset.theme; },
      });
    });
  }

  // ── Hero: picture sinks and tightens into a frame as the page takes over ──
  const hero = host.querySelector<HTMLElement>('.k-hero, .k-phero');
  if (hero) {
    const stage = hero.querySelector('.k-hero-stage, .k-phero-media');
    const content = hero.querySelector('.k-hero-content, .k-phero-content');
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    if (stage) tl.to(stage, { yPercent: 14, scale: 1.06, ease: 'none' }, 0);
    if (content) tl.to(content, { yPercent: -16, autoAlpha: 0, ease: 'none' }, 0);
  }

  // ── Lifecycle: the page pins and the project runs sideways, pipeline drawing as it goes ──
  const life = host.querySelector<HTMLElement>('.k-life');
  if (life) {
    const track = life.querySelector<HTMLElement>('.k-life-track');
    const pipe = life.querySelector<SVGPathElement>('.k-life-pipe path.is-flow');
    const count = life.querySelector<HTMLElement>('.k-life-count b');
    const panels = gsap.utils.toArray<HTMLElement>(life.querySelectorAll('.k-life-panel'));
    mm.add('(min-width: 1000px)', () => {
      if (!track) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const slide = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: {
          trigger: life, start: 'top top', end: () => '+=' + distance(), pin: true, scrub: 0.7,
          anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (count) count.textContent = String(Math.min(panels.length, Math.floor(self.progress * panels.length * 0.999) + 1)).padStart(2, '0');
          },
        },
      });
      if (pipe) gsap.fromTo(pipe, { drawSVG: '0%' }, {
        drawSVG: '100%', ease: 'none',
        scrollTrigger: { trigger: life, start: 'top 60%', end: () => '+=' + (distance() + window.innerHeight * 0.4), scrub: 0.7, invalidateOnRefresh: true },
      });
      panels.forEach((panel, i) => {
        if (i === 0) return;
        gsap.from(panel.querySelectorAll('.k-life-in'), {
          y: 46, autoAlpha: 0, duration: 0.9, stagger: 0.08,
          scrollTrigger: { trigger: panel, containerAnimation: slide, start: 'left 78%', toggleActions: 'play none none reverse' },
        });
      });
    });
    mm.add('(max-width: 999px)', () => {
      panels.forEach((panel) => {
        gsap.from(panel.querySelectorAll('.k-life-in'), {
          y: 34, autoAlpha: 0, duration: 0.9, stagger: 0.07,
          scrollTrigger: { trigger: panel, start: 'top 86%', once: true },
        });
      });
    });
  }

  // ── Projects: each card sticks, the next one slides over it, the one beneath recedes ──
  const cards = q('.k-proj');
  cards.forEach((card, i) => {
    const next = cards[i + 1];
    const body = card.querySelector('.k-proj-card');
    const veil = card.querySelector('.k-proj-veil');
    if (!next || !body) return;
    const st = { trigger: next, start: 'top bottom', end: 'top 12%', scrub: true };
    gsap.to(body, { scale: 0.93, transformOrigin: 'center top', ease: 'none', scrollTrigger: st });
    if (veil) gsap.to(veil, { opacity: 0.55, ease: 'none', scrollTrigger: st });
  });

  // ── Footer wordmark rises letter by letter ──────────────────────────────
  q('.k-wordmark').forEach((el) => {
    SplitText.create(el, {
      type: 'chars', mask: 'chars', autoSplit: true,
      onSplit: (self) => gsap.from(self.chars, {
        yPercent: 105, duration: 1.3, stagger: 0.045,
        scrollTrigger: { trigger: el, start: 'top 96%', once: true },
      }),
    });
  });

  // ── Magnetic controls (mouse only) ──────────────────────────────────────
  if (finePointer()) {
    q('[data-magnetic]').forEach((el) => {
      const strength = Number(el.dataset.magnetic) || 0.3;
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
      const move = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        xTo((e.clientX - (b.left + b.width / 2)) * strength);
        yTo((e.clientY - (b.top + b.height / 2)) * strength);
      };
      const leave = () => { gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1,0.45)', overwrite: true }); };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
    });
  }

  return () => { cleanups.forEach((fn) => fn()); mm.revert(); };
}

export { gsap, ScrollTrigger, SplitText };
