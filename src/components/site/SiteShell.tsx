'use client';
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import SiteHeader, { Mark } from './SiteHeader';
import SiteFooter, { CallToAction } from './SiteFooter';
import { gsap, ScrollTrigger, initScrollMotion, playIntro, prefersReducedMotion, registerMotion } from './motion';

const SEEN = 'konsadem:intro-seen';

/**
 * Wraps every public page: smooth scrolling, the opening curtain, the pointer follower,
 * the shared header and footer, and the scroll-driven motion system.
 */
export default function SiteShell({ children, routeKey, cta = true, tone = 'dark' }: { children: React.ReactNode; routeKey: string; cta?: boolean; tone?: 'dark' | 'light' }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = root.current;
    if (!host) return;
    registerMotion();
    const reduced = prefersReducedMotion();
    const pre = host.querySelector<HTMLElement>('.k-pre');

    if (reduced) {
      if (pre) pre.style.display = 'none';
      host.classList.add('is-ready');
      return;
    }

    // Smooth scroll, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), anchors: true });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let disposeScroll: (() => void) | undefined;
    const ctx = gsap.context(() => {
      disposeScroll = initScrollMotion(host);

      // Opening: a counted preloader on the first visit, a quick curtain afterwards.
      let firstVisit = true;
      try { firstVisit = !sessionStorage.getItem(SEEN); sessionStorage.setItem(SEEN, '1'); } catch { /* private mode */ }
      const tl = gsap.timeline({ onComplete: () => { host.classList.add('is-ready'); if (pre) pre.style.display = 'none'; } });
      if (pre) {
        const num = pre.querySelector<HTMLElement>('.k-pre-num');
        const bar = pre.querySelector<HTMLElement>('.k-pre-bar i');
        const state = { v: 0 };
        if (firstVisit) {
          lenis.stop();
          tl.from(pre.querySelectorAll('.k-pre-rise'), { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0)
            .to(state, { v: 100, duration: 1.9, ease: 'power2.inOut', onUpdate: () => { if (num) num.textContent = String(Math.round(state.v)).padStart(3, '0'); } }, 0.1)
            .to(bar, { scaleX: 1, duration: 1.9, ease: 'power2.inOut' }, 0.1)
            .to(pre.querySelectorAll('.k-pre-rise'), { yPercent: -110, duration: 0.7, stagger: 0.04, ease: 'k-inout' }, '+=0.15');
        } else {
          if (num) num.textContent = '100';
          gsap.set(bar, { scaleX: 1 });
          tl.to({}, { duration: 0.12 });
        }
        tl.addLabel('lift')
          .to(pre, { clipPath: 'inset(0% 0% 100% 0%)', duration: firstVisit ? 1.15 : 0.85, ease: 'k-inout' }, 'lift')
          .add(() => { lenis.start(); playIntro(host); }, 'lift');
      } else {
        playIntro(host);
      }
    }, host);

    // Pointer follower (mouse only).
    const cursor = host.querySelector<HTMLElement>('.k-cursor');
    let over: ((e: PointerEvent) => void) | undefined, moveCursor: ((e: PointerEvent) => void) | undefined;
    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const label = cursor.querySelector<HTMLElement>('span');
      gsap.set(cursor, { xPercent: -50, yPercent: -50 });
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
      moveCursor = (e) => { xTo(e.clientX); yTo(e.clientY); cursor.classList.add('is-on'); };
      over = (e) => {
        const el = e.target instanceof Element ? e.target : null;
        const tagged = el?.closest<HTMLElement>('[data-cursor]');
        const text = tagged?.dataset.cursor || '';
        cursor.classList.toggle('is-label', !!text && text !== 'hide');
        cursor.classList.toggle('is-hide', text === 'hide');
        cursor.classList.toggle('is-link', !tagged && !!el?.closest('a, button, [role="button"], summary, input, select, textarea'));
        if (label && text && text !== 'hide') label.textContent = text;
      };
      window.addEventListener('pointermove', moveCursor, { passive: true });
      document.addEventListener('pointerover', over, { passive: true });
    }

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      if (moveCursor) window.removeEventListener('pointermove', moveCursor);
      if (over) document.removeEventListener('pointerover', over);
      disposeScroll?.();
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, [routeKey]);

  return (
    <div ref={root} className="k-site">
      <div className="k-pre" aria-hidden="true">
        <div className="k-pre-top">
          <span className="k-pre-mask"><span className="k-pre-rise"><Mark size={26} /></span></span>
          <span className="k-pre-mask"><span className="k-pre-rise">Konsadem Associates Ltd</span></span>
          <span className="k-pre-mask"><span className="k-pre-rise">Est. 1972 · Ibadan</span></span>
        </div>
        <div className="k-pre-bottom">
          <span className="k-pre-mask"><span className="k-pre-rise">Engineers &amp; Consultants</span></span>
          <span className="k-pre-mask k-pre-nummask"><span className="k-pre-rise k-pre-num">000</span></span>
        </div>
        <div className="k-pre-bar"><i /></div>
      </div>
      <div className="k-cursor" aria-hidden="true"><span /></div>
      <SiteHeader tone={tone} />
      <main>{children}</main>
      {cta && <CallToAction />}
      <SiteFooter />
    </div>
  );
}
