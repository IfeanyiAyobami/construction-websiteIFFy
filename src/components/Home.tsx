'use client';
import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, X } from 'lucide-react';
import copy from '@/lib/konsadem-copy.json';
import { gallery, media, serviceMedia, type Photo } from '@/lib/media';
import { CmsFeatured } from './CmsPublic';
import TestimonialStream from './TestimonialStream';
import HeroVideoCarousel from './HeroVideoCarousel';
import SiteShell from './site/SiteShell';
import Pic from './site/Pic';
import LeaderProfile from './site/LeaderProfile';
import { leaders } from './site/leaders';
import { projectParts, slugify } from './site/content';

const funders = ['World Bank', 'European Union', 'AFD', 'AfDB', 'USAID', 'Federal Government of Nigeria'];

const stats = [
  { value: 1972, from: 1940, suffix: '', label: 'Year our practice began' },
  { value: 60, from: 0, suffix: '+', label: 'Major assignments delivered' },
  { value: 16, from: 0, suffix: '', unit: 'states + FCT', label: 'Where we have worked in Nigeria' },
  { value: 70, from: 0, suffix: '', label: 'Staff, some 50 of them professional and technical' },
];

const workflow = [
  { step: 'Study', text: 'Feasibility and viability studies, economic evaluation, surveys and hydrological investigation. We establish what is worth building before anyone commits to building it.', tags: ['Feasibility', 'ESIA', 'Hydrology'] },
  { step: 'Design', text: 'Detailed engineering design, hydraulic modelling, working drawings and specifications, produced with AutoCAD, CivilCAD, WaterCAD and HEC-HMS.', tags: ['Engineering design', 'Modelling', 'Drawings'] },
  { step: 'Procure', text: 'Tender documents, bills of engineering measurement, procurement and contract management to the standards funders expect.', tags: ['Tender documents', 'BEME', 'Contracts'] },
  { step: 'Supervise', text: 'Construction supervision, financial control, monitoring and evaluation, so that what was designed is what gets built.', tags: ['Supervision', 'Cost control', 'M&E'] },
  { step: 'Hand over', text: 'Maintenance and management of completed works, with capacity building and training for the people who will run them.', tags: ['Management', 'Training', 'Capacity building'] },
];

const featured: { id: number; photo: Photo }[] = [
  { id: 0, photo: media.projLagosWater },
  { id: 2, photo: media.projSewerage },
  { id: 10, photo: media.projIrrigation },
  { id: 16, photo: media.projChannel },
  { id: 30, photo: media.projWaste },
];

const partners = [
  ['Haskoning', 'Netherlands'], ['Nihon Suido', 'Japan'], ['SAFEGE', 'Belgium'],
  ['Reid Crowther', 'Canada'], ['SCS Engineers', 'United States'], ['ENTAG', 'Egypt'],
];

const faqs = [
  ['What services does Konsadem offer?', 'We work across water supply, sanitation, dams, irrigation, roads, drainage, structures and waste management.'],
  ['Can you support a project from concept through completion?', 'Yes. We provide feasibility studies, engineering design, procurement, construction supervision and project management.'],
  ['Where are your offices?', 'We have offices in Ibadan, Abuja, Lagos and Kigali. See the Contact page for addresses.'],
  ['How do I discuss a project?', 'Share your project location, scope and the services you need by emailing info@konsadem.com.'],
];

const fitQuestions = [
  'Is it water, sanitation, roads, drainage, structures or waste infrastructure?',
  'Is the site in Nigeria or elsewhere in Africa?',
  'Is it funded by government or a development partner?',
  'Do you need one team from feasibility study to handover?',
  'Are you an international firm looking for a local partner?',
];

/* ── Capabilities: four lead disciplines as a bento, the other five as links ── */
function Capabilities() {
  const lead = [0, 2, 1, 3];
  const tones = ['accent', 'photo', 'dark', 'light'];
  return (
    <section className="k-section k-cap" data-theme="light" id="services">
      <div className="k-wrap">
        <div className="k-cap-top">
          <header className="k-head">
            <p className="k-label" data-fade>02 / What we do</p>
            <h2 className="k-h2" data-split>Every discipline your project needs, <i>under one roof.</i></h2>
            <p className="k-body" data-fade>From the first feasibility question to the last inspection on site, Konsadem covers the full range of civil, water, environmental and building engineering.</p>
            <Link href="/services" className="k-btn k-btn-dark" data-fade>All nine services <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <div className="k-frame k-cap-pic" data-clip><Pic photo={media.heroRoads} className="k-par" sizes="(max-width: 900px) 100vw, 50vw" /></div>
        </div>
        <div className="k-bento">
          {lead.map((index, n) => {
            const s = copy.services[index];
            return (
              <Link key={s.title} href={'/services#' + slugify(s.title)} className={`k-bento-card is-${tones[n]}`}>
                {tones[n] === 'photo' && <span className="k-bento-pic"><Pic photo={serviceMedia[index]} w={1200} sizes="(max-width: 900px) 100vw, 55vw" decorative /></span>}
                <span className="k-bento-top"><span>{String(index + 1).padStart(2, '0')} / {s.tagline}</span><span className="k-round"><ArrowUpRight aria-hidden="true" /></span></span>
                <h3>{s.title}</h3>
                <p>{s.body[0]}</p>
              </Link>
            );
          })}
        </div>
        <ul className="k-cap-more" aria-label="More services">
          {copy.services.map((s, i) => (lead.includes(i) ? null : (
            <li key={s.title}><Link href={'/services#' + slugify(s.title)}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}<ArrowUpRight aria-hidden="true" /></Link></li>
          )))}
        </ul>
      </div>
    </section>
  );
}

/* ── Projects showcase: one project at a time, picture beside its facts ── */
function Showcase() {
  const [active, setActive] = useState(0);
  const total = featured.length;
  const go = (step: number) => setActive((v) => (v + step + total) % total);
  const current = copy.projects[featured[active].id];
  const { meta, description } = projectParts(current.detail);
  return (
    <section className="k-section k-show" data-theme="light" id="projects">
      <div className="k-wrap">
        <header className="k-head k-head-split">
          <div>
            <p className="k-label" data-fade>04 / Selected work</p>
            <h2 className="k-h2" data-split>Work that speaks <i>for itself.</i></h2>
          </div>
          <Link href="/projects" className="k-btn k-btn-outline" data-fade>See all projects <ArrowRight aria-hidden="true" /></Link>
        </header>
        <div className="k-show-grid" data-fade>
          <div className="k-show-media">
            {featured.map(({ id, photo }, i) => (
              <div key={id} className={`k-show-pic ${active === i ? 'is-active' : ''}`}><Pic photo={photo} w={1600} sizes="(max-width: 900px) 100vw, 55vw" decorative={active !== i} /></div>
            ))}
            <span className="k-chip">Illustrative image</span>
          </div>
          <div className="k-show-side">
            <article className="k-show-card" key={active} aria-live="polite">
              <p className="k-label">{String(active + 1).padStart(2, '0')} / {current.category}</p>
              <h3>{current.title}</h3>
              <p className="k-show-desc">{description}</p>
              <dl className="k-proj-meta">
                {meta.slice(0, 3).map((m, j) => <div key={j}><dt>{['Client', 'Location', 'Period'][j]}</dt><dd>{m}</dd></div>)}
              </dl>
              <Link href={'/projects/' + featured[active].id} className="k-btn k-btn-outline">Read more <ArrowRight aria-hidden="true" /></Link>
            </article>
            <div className="k-show-nav">
              <div className="k-show-bar" aria-hidden="true"><i style={{ width: `${100 / total}%`, transform: `translateX(${active * 100}%)` }} /></div>
              <button type="button" aria-label="Previous project" onClick={() => go(-1)}><ArrowLeft /></button>
              <button type="button" aria-label="Next project" onClick={() => go(1)}><ArrowRight /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Fit check: five yes/no questions and an honest answer ───────────── */
function FitCheck() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(fitQuestions.map(() => null));
  const [shown, setShown] = useState(false);
  const answered = answers.filter((a) => a !== null).length;
  const yes = answers.filter(Boolean).length;
  const verdict = yes >= 4 ? ['Strong fit.', 'Let’s talk early.', 'This is the work we have done for five decades. Bring us in at the study stage and nothing gets lost in handover between consultants.']
    : yes >= 2 ? ['Good fit.', 'Tell us more.', 'Parts of this sit squarely in our practice. Send us the scope and we will tell you where we add the most.']
    : ['Possibly.', 'Send us the brief.', 'It may sit outside our usual work. We give clients the honest answer, including when it is not the easy one.'];
  const set = (i: number, value: boolean) => { setAnswers((a) => a.map((v, j) => (j === i ? value : v))); setShown(false); };
  return (
    <section className="k-fit" data-theme="light" id="fit">
      <div className="k-wrap k-fit-in">
        <header>
          <p className="k-label" data-fade>06 / Fit check</p>
          <h2 className="k-h2" data-split>Is Konsadem the right firm <u>for it?</u></h2>
          <p data-fade>Five quick questions. The more of them you answer yes to, the more we will bring to the table.</p>
        </header>
        <div className="k-fit-panel" data-fade>
          {shown ? (
            <div className="k-fit-result" role="status">
              <p className="k-label k-label-light">Your result · {yes} of {fitQuestions.length} yes</p>
              <h3>{verdict[0]} <i>{verdict[1]}</i></h3>
              <p>{verdict[2]}</p>
              <div className="k-fit-actions">
                <Link href="/contact" className="k-btn k-btn-lime">Talk to our team <ArrowUpRight aria-hidden="true" /></Link>
                <button type="button" className="k-btn k-btn-ghost" onClick={() => { setAnswers(fitQuestions.map(() => null)); setShown(false); }}>Start again</button>
              </div>
            </div>
          ) : (
            <>
              <ol className="k-fit-list">
                {fitQuestions.map((q, i) => (
                  <li key={q} className={answers[i] !== null ? 'is-answered' : ''}>
                    <span className="k-fit-no">{i + 1}</span>
                    <span className="k-fit-q" id={`fit-q-${i}`}>{q}</span>
                    <span className="k-fit-toggle" role="group" aria-labelledby={`fit-q-${i}`}>
                      <button type="button" aria-pressed={answers[i] === true} onClick={() => set(i, true)}>Yes</button>
                      <button type="button" aria-pressed={answers[i] === false} onClick={() => set(i, false)}>No</button>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="k-fit-foot">
                <div className="k-fit-progress" aria-hidden="true"><i style={{ transform: `scaleX(${answered / fitQuestions.length})` }} /></div>
                <span>{answered} of {fitQuestions.length} answered</span>
                <button type="button" className="k-btn k-btn-dark" disabled={answered < fitQuestions.length} onClick={() => setShown(true)}>See the result <ArrowRight aria-hidden="true" /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function TeamCards({overlay=false}:{overlay?:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const trigger=useRef<HTMLElement|null>(null);
  const titleId=useId();
  const [selected,setSelected]=useState<number|null>(null);
  function open(index:number, source:HTMLElement) {
    trigger.current=source;
    setSelected(index);
    dialog.current?.showModal();
  }
  return <>
    <div className="k-team" data-stagger>
      {leaders.map((l, i) => (
        <Link href={'/team/' + l.slug} prefetch={false} className="k-team-card" key={l.name}
          aria-haspopup={overlay?'dialog':undefined}
          onClick={overlay ? e=>{
            if(e.button!==0||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
            e.preventDefault();open(i,e.currentTarget);
          } : undefined}>
          <span className="k-team-photo">
            {l.photo ? <img src={l.photo} alt="" loading="lazy" /> : <b aria-hidden="true">{l.initials}</b>}
            <span className="k-team-arrow"><ArrowUpRight aria-hidden="true" /></span>
          </span>
          <span className="k-team-no">{String(i + 1).padStart(2, '0')} / Leadership</span>
          <h3>{l.name}</h3>
          <span className="k-team-role">{l.role}</span>
          <span className="k-team-link">View profile ↗</span>
        </Link>
      ))}
    </div>
    {overlay && <dialog ref={dialog} className="k-leader-dialog" aria-labelledby={selected!==null?titleId:undefined}
      onClose={()=>{setSelected(null);trigger.current?.focus({preventScroll:true});}}
      onClick={e=>{if(e.target===e.currentTarget)dialog.current?.close();}} data-lenis-prevent>
      {selected!==null && <LeaderProfile member={leaders[selected]} index={selected} titleId={titleId} overlay
        close={<button type="button" className="k-profile-close" autoFocus aria-label="Close profile" onClick={()=>dialog.current?.close()}><X size={22}/></button>}/>}
    </dialog>}
  </>;
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="k-section k-faq" data-theme="light" id="faq">
      <div className="k-wrap k-faq-grid">
        <header>
          <p className="k-label" data-fade>09 / Questions</p>
          <h2 className="k-h2" data-split>Good questions. <i>Clear answers.</i></h2>
          <p className="k-body" data-fade>A few things you might want to know before starting your next project.</p>
        </header>
        <div className="k-faq-list" data-stagger>
          {faqs.map(([question, answer], i) => (
            <article className={`k-faq-item ${open === i ? 'is-open' : ''}`} key={question}>
              <button type="button" aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? null : i)}>
                <span className="k-faq-no">{String(i + 1).padStart(2, '0')}</span>
                <strong>{question}</strong>
                <span className="k-faq-icon" aria-hidden="true"><Plus /></span>
              </button>
              <div className="k-faq-panel" id={`faq-${i}`} role="region"><div><p>{answer}</p></div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <SiteShell routeKey="home">
      <HeroVideoCarousel />

      <section className="k-band" data-theme="dark" aria-label="Project funders">
        <p className="k-band-note">Trusted on projects funded by</p>
        <div className="k-marquee" data-marquee="1">
          <div className="k-marquee-track">
            {[0, 1].map((n) => (
              <ul key={n} aria-hidden={n === 1}>
                {funders.map((f) => <li key={f}>{f}<span aria-hidden="true">✦</span></li>)}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="k-section k-manifesto" data-theme="light" id="about">
        <div className="k-wrap k-manifesto-grid">
          <p className="k-label" data-fade>01 / Who we are</p>
          <div>
            <h2 className="k-h1" data-split>Five decades of getting difficult projects <i>built.</i></h2>
            <div className="k-manifesto-body">
              <p className="k-lead" data-fill>Konsadem Associates Limited is one of Nigeria’s leading indigenous engineering consultancies. We began in Ibadan in 1972 and have spent every year since on the work that keeps cities and farms running: water supply, sanitation, dams, irrigation, roads, drainage, structures and waste management.</p>
              <div className="k-manifesto-aside">
                <p className="k-body" data-fade>Our engineers have assessed Lagos’s water distribution network, designed sewerage for whole university campuses, supervised irrigation schemes for the Federal Government and channelised the Ogunpa River through the heart of Ibadan. We bring the same discipline to a private estate as to a World Bank programme.</p>
                <Link href="/about" className="k-textlink" data-fade>About Konsadem <ArrowUpRight aria-hidden="true" /></Link>
              </div>
            </div>
            <div className="k-manifesto-pics">
              <div className="k-frame" data-clip><Pic photo={media.heroDam} className="k-par" sizes="(max-width: 900px) 100vw, 50vw" /></div>
              <div className="k-frame" data-clip><Pic photo={media.field} className="k-par" sizes="(max-width: 900px) 100vw, 36vw" /></div>
            </div>
          </div>
        </div>
      </section>

      <Capabilities />

      {/* Numbers */}
      <section className="k-numbers" data-theme="light" aria-label="Konsadem in numbers">
        <div className="k-numbers-panel">
          <header>
            <p className="k-label k-label-light" data-fade>03 / Konsadem by the numbers</p>
            <h2 className="k-h2" data-split>Experience <i>in numbers.</i></h2>
          </header>
          <div className="k-stats-grid">
            {stats.map((s) => (
              <article className="k-stat" key={s.label}>
                <i className="k-rule" data-line />
                <p className="k-stat-num"><span data-count={s.value} data-from={s.from}>{s.value}</span>{s.suffix}{s.unit && <small>{s.unit}</small>}</p>
                <p className="k-stat-label" data-fade>{s.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="k-gallery" data-theme="light" aria-label="Pictures from the field">
        <div className="k-marquee" data-marquee="0.55">
          <div className="k-marquee-track">
            {[0, 1].map((n) => (
              <div className="k-gallery-set" key={n} aria-hidden={n === 1}>
                {gallery.map((p, i) => <figure className="k-gallery-item" key={i}><Pic photo={p} w={900} sizes="30vw" decorative={n === 1} /></figure>)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Showcase />

      {/* How we work: the page pins and the project runs sideways, pipeline drawing as it goes */}
      <section className="k-life" data-theme="dark" id="approach">
        <div className="k-life-track">
          <div className="k-life-panel k-life-intro">
            <p className="k-label k-label-light" data-fade>05 / How we work</p>
            <h2 className="k-h2" data-split>One firm. The full life of <i>your project.</i></h2>
            <p className="k-body" data-fade>Studies, design, procurement, supervision and institutional support sit in one firm. Nothing is lost in handover between consultants.</p>
            <p className="k-life-hint" aria-hidden="true">Keep scrolling <span>→</span></p>
          </div>
          {workflow.map((l, i) => (
            <article className="k-life-panel" key={l.step}>
              <span className="k-life-node" aria-hidden="true" />
              <p className="k-life-no k-life-in">{String(i + 1).padStart(2, '0')}<span> / 05</span></p>
              <h3 className="k-life-step k-life-in">{l.step}</h3>
              <p className="k-life-text k-life-in">{l.text}</p>
              <ul className="k-tags k-life-in">{l.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            </article>
          ))}
          <div className="k-life-pipe" aria-hidden="true"><svg viewBox="0 0 100 2" preserveAspectRatio="none"><path className="is-bed" d="M0 1H100" /><path className="is-flow" d="M0 1H100" /></svg></div>
        </div>
        <p className="k-life-count" aria-hidden="true"><b>01</b> / 05</p>
      </section>

      <FitCheck />

      {/* Partners */}
      <section className="k-section k-partners" data-theme="light">
        <div className="k-wrap k-partners-grid">
          <header>
            <p className="k-label" data-fade>07 / Partners</p>
            <h2 className="k-h2" data-split>Local knowledge. <i>International standards.</i></h2>
            <p className="k-body" data-fade>Our partners rely on us for what cannot be imported: deep knowledge of Nigerian terrain, institutions and communities.</p>
            <Link href="/why-konsadem" className="k-textlink" data-fade>Why Konsadem <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <ul className="k-partner-list" data-stagger aria-label="International firms we have worked alongside">
            {partners.map(([name, country]) => <li key={name}><strong>{name}</strong><span>{country}</span></li>)}
          </ul>
        </div>
      </section>

      {/* People */}
      <section className="k-section k-people" data-theme="light" id="people">
        <div className="k-wrap">
          <header className="k-head k-head-split">
            <div>
              <p className="k-label" data-fade>08 / Our people</p>
              <h2 className="k-h2" data-split>Led by engineers <i>who have done the work.</i></h2>
            </div>
            <Link href="/team" className="k-btn k-btn-dark" data-fade data-magnetic="0.2">Meet our leadership <ArrowUpRight aria-hidden="true" /></Link>
          </header>
          <TeamCards overlay />
        </div>
      </section>

      <TestimonialStream />
      <CmsFeatured />
      <Faq />
    </SiteShell>
  );
}
