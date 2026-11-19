'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FlowField from './FlowField';
import { Brand } from './SiteHeader';
import Pic from './Pic';
import { media } from '@/lib/media';

const offices = [
  ['Ibadan · Head office', 'No. 30, Onireke Layout, P.M.B. 5478, Ibadan, Oyo State'],
  ['Abuja', 'House 124, Road 2, 4th Avenue, Adenco Estate, Galadimawa'],
  ['Lagos · Project office', '2A, Isiaka Street, off Immanuel Street, Old Oko-Oba, Agege'],
  ['Kigali · Rwanda', 'Kisimenti, KG1, 50, Kibisogi, Nyarugenge'],
];

function LocalTime() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const format = () => setTime(new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }).format(new Date()));
    format();
    const id = window.setInterval(format, 20000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="k-clock" suppressHydrationWarning>{time ? `${time} WAT` : 'WAT'}</span>;
}

/** Closing call to action. Sits directly above the footer on every public page. */
export function CallToAction({ heading = 'Have a project in mind?', body = 'Tell us what you need to build, fix or understand. Our engineers will take it from there.', button = 'Talk to our team' }:
  { heading?: string; body?: string; button?: string }) {
  const words = heading.split(' ');
  const tail = words.splice(-2).join(' ');
  return (
    <section className="k-cta" data-theme="dark" id="contact">
      <div className="k-cta-photo"><Pic photo={media.cta} className="k-par" decorative /></div>
      <FlowField />
      <div className="k-wrap k-cta-in">
        <p className="k-label k-label-light" data-fade>Let’s work together</p>
        <h2 className="k-cta-title" data-split>{words.join(' ')} <i>{tail}</i></h2>
        <div className="k-cta-row">
          <p data-fade>{body}</p>
          <Link href="/contact" className="k-orb" data-magnetic="0.35" data-cursor="hide" data-fade>
            <span>{button}</span><ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function SiteFooter() {
  return (
    <footer className="k-footer" data-theme="dark">
      <div className="k-wrap">
        <div className="k-footer-top">
          <div className="k-footer-brand">
            <Brand />
            <p>Engineers and consultants since 1972. Water, infrastructure and environmental engineering for governments, development partners and private clients across Nigeria and beyond.</p>
            <a className="k-footer-mail" href="mailto:info@konsadem.com" data-cursor="hide">info@konsadem.com <ArrowUpRight aria-hidden="true" /></a>
          </div>
          <nav className="k-footer-col" aria-label="Footer">
            <p className="k-label k-label-light">Explore</p>
            <Link href="/about">About</Link>
            <Link href="/services">Services</Link>
            <Link href="/projects">Projects</Link>
            <Link href="/why-konsadem">Why Konsadem</Link>
            <Link href="/team">Our people</Link>
          </nav>
          <div className="k-footer-col">
            <p className="k-label k-label-light">Connect</p>
            <Link href="/contact">Contact</Link>
            <Link href="/careers">Careers</Link>
            <Link href="/insights">Insights</Link>
            <a href="/brand/konsadem-brochure.pdf" target="_blank" rel="noopener">View company brochure (PDF)</a>
            <a href="/brand/konsadem-brochure.pdf" download="Konsadem_Company_Profile_2026.pdf">Download brochure (PDF)</a>
            <a href="tel:+2348033261692">+234 803 326 1692</a>
          </div>
        </div>
        <div className="k-footer-offices" data-stagger>
          {offices.map(([name, address]) => (
            <div key={name}><p className="k-label k-label-light">{name}</p><p>{address}</p></div>
          ))}
        </div>
        <div className="k-wordmark-clip"><p className="k-wordmark" aria-hidden="true">KONSADEM</p></div>
        <div className="k-footer-base">
          <span>© 2026 Konsadem Associates Limited. RC 106297. All rights reserved.</span>
          <span>Innovation · Quality · Safety · Integrity · Accountability</span>
          <span>Ibadan <LocalTime /></span>
        </div>
      </div>
    </footer>
  );
}
