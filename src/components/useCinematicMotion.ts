"use client";
import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Accessible, scoped animation system shared by all demo pages. */
export function useCinematicMotion(root: RefObject<HTMLDivElement | null>, routeKey: string) {
  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const host = root.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const context = gsap.context(() => {
      // Visibility-safe reveals: never hide content before a trigger starts.
      // This prevents blank/blurred sections in full-page captures, restored tabs,
      // fast scrolling and routes mounted below the fold.
      const reveal = gsap.utils.toArray<HTMLElement>('.reveal, .anim');
      reveal.forEach((el) => {
        gsap.fromTo(el, { y: 28 }, {
          y: 0, duration: 0.72, ease: 'power2.out',
          clearProps: 'transform,filter,opacity,visibility',
          immediateRender: false,
          scrollTrigger: {
            trigger: el, start: 'top 98%', once: true,
            onEnter: () => { el.style.opacity = '1'; el.style.visibility = 'visible'; },
          },
        });
      });
      const hero = host.querySelector('.inter-hero');
      if (hero) {
        gsap.fromTo('.inter-hero-content > *', { y: 24 }, {
          y: 0, duration: 0.8,
          stagger: 0.14, ease: 'power3.out', clearProps: 'all', delay: 0.12
        });
      }
      const mm = gsap.matchMedia();
      mm.add('(min-width: 800px) and (prefers-reduced-motion: no-preference)', () => {
        const heroImage = host.querySelector('.inter-hero-img, .hero-visual');
        const heroSection = host.querySelector('.inter-hero, .hero');
        if (heroImage && heroSection) {
          gsap.to(heroImage, { yPercent: 12, ease: 'none', scrollTrigger: {
            trigger: heroSection, start: 'top top', end: 'bottom top', scrub: 1.2
          }});
        }
        host.querySelectorAll<HTMLElement>('.inter-photo img, .about-image > img, .people-image > img, .inter-case-photo').forEach(el => {
          gsap.fromTo(el, { scale: 1.13 }, { scale: 1, ease: 'none', scrollTrigger: {
            trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 1.1
          }});
        });
      });
      // Staggered cards, without permanently hiding filtered / dynamically added content.
      host.querySelectorAll<HTMLElement>('.inter-service-grid, .inter-team-grid, .inter-value-grid, .inter-steps, .values-grid').forEach(group => {
        const cards = Array.from(group.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
        if (cards.length < 2) return;
        gsap.fromTo(cards, { y: 24 }, { y: 0, duration: 0.9, stagger: 0.085, ease: 'power2.out',
          scrollTrigger: { trigger: group, start: 'top 86%', once: true } });
      });
      // Animated demonstration metrics; retains +, ₦, bn and other suffixes.
      host.querySelectorAll<HTMLElement>('.stat strong').forEach(el => {
        const raw = el.textContent || '';
        const match = raw.match(/^(.*?)([\d,.]+)(.*)$/);
        if (!match) return;
        const prefix = match[1], suffix = match[3];
        const number = Number(match[2].replace(/,/g, ''));
        if (!Number.isFinite(number)) return;
        const counter = { value: 0 };
        gsap.to(counter, { value: number, duration: 2, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => { el.textContent = prefix + (Number.isInteger(number) ? Math.round(counter.value).toLocaleString('en-NG') : counter.value.toFixed(1)) + suffix; },
          onComplete: () => { el.textContent = raw; }
        });
      });
      // Magnetic-feel hover affordance, fine-pointer only.
      const hoverCleanup: Array<() => void> = [];
      if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        host.querySelectorAll<HTMLElement>('.btn, .inter-btn, .inter-cta > a, .inter-quote').forEach(el => {
          const enter = () => gsap.to(el, { y: -4, scale: 1.025, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          const leave = () => gsap.to(el, { y: 0, scale: 1, duration: 0.45, ease: 'elastic.out(1,.65)', overwrite: 'auto' });
          el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave);
          hoverCleanup.push(() => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); });
        });
      }
      // Scoped cleanup for pointer handlers and matchMedia contexts.
      return () => { hoverCleanup.forEach(fn => fn()); mm.revert(); };
    }, host);
    const refresh = () => { ScrollTrigger.refresh(); host.querySelectorAll<HTMLElement>('.reveal, .anim').forEach(el => { el.style.opacity = '1'; el.style.visibility = 'visible'; el.style.filter = 'none'; }); };
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 450);
    return () => { window.clearTimeout(timer); window.removeEventListener('load', refresh); context.revert(); };
  }, [root, routeKey]);
}
