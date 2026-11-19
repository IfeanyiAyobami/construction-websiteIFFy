'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import copy from '@/lib/konsadem-copy.json';
import { media, serviceMedia, type Photo } from '@/lib/media';
import { prefersReducedMotion } from './motion';
import { slugify } from './content';
import Pic from './Pic';

type Item = { label: string; href: string; note: string; photo: Photo };
const count = (category: string) => copy.projects.filter((p) => p.category === category).length;
const sectorPhotos: Photo[] = [media.projSewerage, media.projIrrigation, media.projChannel, media.svcStructures, media.projWaste];

const groups: { label: string; href: string; items: Item[] }[] = [
  {
    label: 'Services', href: '/services',
    items: [0, 1, 2, 3, 4, 6].map((i) => ({ label: copy.services[i].title, href: '/services#' + slugify(copy.services[i].title), note: copy.services[i].tagline, photo: serviceMedia[i] })),
  },
  {
    label: 'Projects', href: '/projects',
    items: Array.from(new Set(copy.projects.map((p) => p.category))).map((c, i) => ({ label: c, href: '/projects', note: `${count(c)} assignments in the portfolio`, photo: sectorPhotos[i % sectorPhotos.length] })),
  },
  {
    label: 'Company', href: '/about',
    items: [
      { label: 'About us', href: '/about', note: 'Built in Ibadan. Trusted across Nigeria.', photo: media.pageAbout },
      { label: 'Our people', href: '/team', note: 'Led by engineers who have done the work.', photo: media.field },
      { label: 'Why Konsadem', href: '/why-konsadem', note: 'The firm other firms partner with.', photo: media.pageWhy },
      { label: 'Careers', href: '/careers', note: 'Work with us.', photo: media.pageCareers },
      { label: 'Insights', href: '/insights', note: 'Notes from practice.', photo: media.pageInsights },
    ],
  },
];

export function Mark({ size = 30 }: { size?: number }) {
  return <img className="k-mark" src="/brand/ka-monogram-white.svg" width={size} height={size} alt="" />;
}

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="k-brand" aria-label="Konsadem Associates, home" onClick={onClick}>
      <img className="k-brand-symbol" src="/brand/ka-monogram-white.svg" width={930} height={725} alt="" />
    </Link>
  );
}

export default function SiteHeader({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const [group, setGroup] = useState<number | null>(null);
  const [item, setItem] = useState(0);
  const [mobile, setMobile] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => { setGroup(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setGroup(null); setMobile(false); } };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  // Mobile full-screen menu
  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    el.closest('.k-site')?.classList.toggle('menu-open', mobile);
    const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
    if (mobile) lenis?.stop(); else lenis?.start();
    document.documentElement.style.overflow = mobile ? 'hidden' : '';
    if (first.current) { first.current = false; return; }
    if (prefersReducedMotion()) { gsap.set(el, { autoAlpha: mobile ? 1 : 0, clipPath: 'none' }); return; }
    const rows = el.querySelectorAll('.k-menu-row > *');
    gsap.killTweensOf([el, rows]);
    if (mobile) {
      gsap.set(el, { autoAlpha: 1 });
      gsap.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'k-inout' });
      gsap.fromTo(rows, { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.04, delay: 0.25, ease: 'k-out' });
    } else {
      gsap.to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'k-inout', onComplete: () => { gsap.set(el, { autoAlpha: 0 }); } });
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [mobile]);

  const close = () => { setGroup(null); setMobile(false); };
  const open = (i: number) => { setGroup(i); setItem(0); };
  const active = group !== null ? groups[group] : null;
  const mobileLinks: [string, string][] = [['Home', '/'], ['About', '/about'], ['Services', '/services'], ['Projects', '/projects'], ['Our people', '/team'], ['Why Konsadem', '/why-konsadem'], ['Insights', '/insights'], ['Careers', '/careers'], ['Contact', '/contact']];

  return (
    <>
      <header className="k-header" data-theme={tone} onMouseLeave={() => setGroup(null)}>
        <div className="k-bar">
          <Brand onClick={close} />
          <nav className="k-nav" aria-label="Primary">
            {groups.map((g, i) => (
              <button key={g.label} type="button" className={`k-nav-btn ${group === i ? 'is-open' : ''}`} aria-expanded={group === i} aria-controls="k-mega"
                onMouseEnter={() => open(i)} onFocus={() => open(i)} onClick={() => (group === i ? setGroup(null) : open(i))}>
                {g.label}<ChevronDown aria-hidden="true" />
              </button>
            ))}
            <Link href="/contact" className="k-nav-btn" onMouseEnter={() => setGroup(null)}>Contact</Link>
          </nav>
          <div className="k-header-end">
            <Link href="/contact" className="k-pill" onClick={close}>Start a project<span className="k-round"><ArrowUpRight aria-hidden="true" /></span></Link>
            <button className="k-burger" type="button" aria-expanded={mobile} aria-controls="k-menu" aria-label={mobile ? 'Close menu' : 'Open menu'} onClick={() => setMobile((v) => !v)}>
              <span className="k-burger-icon" aria-hidden="true"><i /><i /></span>
            </button>
          </div>
        </div>

        <div className={`k-mega ${active ? 'is-open' : ''}`} id="k-mega" inert={!active}>
          {active && (
            <div className="k-mega-in" key={active.label}>
              <div className="k-mega-list">
                <p className="k-label k-label-light">{active.label}</p>
                {active.items.map((it, i) => (
                  <Link key={it.label} href={it.href} onClick={close} className={item === i ? 'is-active' : ''} onMouseEnter={() => setItem(i)} onFocus={() => setItem(i)}>
                    <span aria-hidden="true">{item === i ? '→' : ''}</span>{it.label}
                  </Link>
                ))}
                <Link href={active.href} onClick={close} className="k-mega-all">Explore {active.label.toLowerCase()} <span className="k-round"><ArrowUpRight aria-hidden="true" /></span></Link>
              </div>
              <Link href={active.items[item].href} onClick={close} className="k-mega-preview">
                {active.items.map((it, i) => (
                  <span key={it.label} className={`k-mega-pic ${item === i ? 'is-active' : ''}`}><Pic photo={it.photo} w={1200} sizes="560px" decorative /></span>
                ))}
                <span className="k-mega-copy">
                  <strong>{active.items[item].label}</strong>
                  <small>{active.items[item].note}</small>
                  <em>Explore <ArrowUpRight aria-hidden="true" /></em>
                </span>
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="k-menu" id="k-menu" ref={panel} aria-hidden={!mobile} inert={!mobile}>
        <div className="k-menu-in">
          <nav className="k-menu-list" aria-label="All pages">
            {mobileLinks.map(([label, href], i) => (
              <Link key={href} href={href} onClick={close} className="k-menu-row" aria-current={(href === '/' ? pathname === '/' : pathname.startsWith(href)) ? 'page' : undefined}>
                <span className="k-menu-item"><em>{String(i + 1).padStart(2, '0')}</em><strong>{label}</strong><ArrowUpRight aria-hidden="true" /></span>
              </Link>
            ))}
          </nav>
          <p className="k-menu-foot"><a href="mailto:info@konsadem.com">info@konsadem.com</a><a href="tel:+2348033261692">+234 803 326 1692</a></p>
        </div>
      </div>
    </>
  );
}
