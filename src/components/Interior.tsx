'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import copy from '@/lib/konsadem-copy.json';
import { media, serviceMedia, type Photo } from '@/lib/media';
import { CmsLanding, usePublished } from './CmsPublic';
import SiteShell from './site/SiteShell';
import Pic from './site/Pic';
import { TeamCards } from './Home';
import { ScrollTrigger } from './site/motion';
import { between, clients, offices, phones, projectParts, pullQuote, reasons, slugify, story, values } from './site/content';

const sub = (lines: string[]) => (lines.find((l) => l.startsWith('Sub-headline:')) || '').replace('Sub-headline: ', '');

/* ── Shared blocks ────────────────────────────────────────────────────── */
function PageHero({ kicker, title, accent, subtitle, photo }: { kicker: string; title: string; accent?: string; subtitle?: string; photo: Photo }) {
  return (
    <section className="k-phero" data-theme="dark">
      <div className="k-phero-media"><div className="k-phero-pic" data-intro-media><Pic photo={photo} eager w={2400} decorative /></div><div className="k-hero-shade" /></div>
      <div className="k-wrap k-phero-content">
        <p className="k-eyebrow" data-intro-fade><span className="k-dot" />Konsadem · {kicker}</p>
        <h1 className="k-phero-title" data-intro-split>{title}{accent && <> <i>{accent}</i></>}</h1>
        {subtitle && <p className="k-phero-sub" data-intro-fade>{subtitle}</p>}
      </div>
    </section>
  );
}

function Head({ label, title, accent, children, light }: { label: string; title: string; accent?: string; children?: React.ReactNode; light?: boolean }) {
  return (
    <header className="k-head">
      <p className={`k-label ${light ? 'k-label-light' : ''}`} data-fade>{label}</p>
      <h2 className="k-h2" data-split>{title}{accent && <> <i>{accent}</i></>}</h2>
      {children}
    </header>
  );
}

/* ── Pages ────────────────────────────────────────────────────────────── */
function About() {
  const who = between(copy.about, 'Who we are', 'Our story');
  const mission = between(copy.about, 'Mission', 'Vision (draft for approval)')[0];
  const tools = between(copy.about, 'Tools and technology')[0];
  return (
    <>
      <PageHero kicker="About" title="Built in Ibadan." accent="Trusted across Nigeria." subtitle={sub(copy.about)} photo={media.pageAbout} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-split">
          <Head label="01 / Who we are" title="A multidisciplinary firm of" accent="engineers and consultants." />
          <div className="k-prose">
            <p className="k-lead" data-fill>{who[0]}</p>
            {who.slice(1).map((p) => <p className="k-body" key={p} data-fade>{p}</p>)}
            <Link href="/why-konsadem" className="k-textlink" data-fade>Why Konsadem <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <section className="k-section k-dark" data-theme="dark">
        <div className="k-wrap">
          <Head light label="02 / Our story" title="From a three-person practice to" accent="a national firm." />
          <ol className="k-timeline">
            {story.map(([when, what]) => (
              <li key={when} data-fade><i className="k-rule" data-line /><span className="k-timeline-when">{when}</span><p>{what}</p></li>
            ))}
          </ol>
        </div>
      </section>
      <section className="k-section k-mission" data-theme="light">
        <div className="k-wrap">
          <p className="k-label" data-fade>03 / Our mission</p>
          <p className="k-statement" data-fill>{mission}</p>
        </div>
      </section>
      <section className="k-section k-tint" data-theme="light">
        <div className="k-wrap">
          <Head label="04 / Our values" title="Nine commitments behind every drawing" accent="we sign." />
          <div className="k-cards k-cards-3" data-stagger>
            {values.map(([name, text], i) => (
              <article className="k-card" key={name}><span className="k-card-no">{String(i + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{text}</p></article>
            ))}
          </div>
        </div>
      </section>
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-split">
          <Head label="05 / Tools and technology" title="Modern tools, used by people" accent="who know the ground." />
          <div className="k-prose">
            <p className="k-body" data-fade>{tools}</p>
            <ul className="k-tags k-tags-dark" data-stagger>
              {['AutoCAD', 'CivilCAD', 'WaterCAD', 'HEC-HMS', 'SWAT', 'MIKE HYDRO', 'WEAP', 'GPS', 'Total stations', 'Borehole CCTV'].map((t) => <li key={t}>{t}</li>)}
            </ul>
            <Link href="/team" className="k-textlink" data-fade>Meet our leadership <ArrowUpRight aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Services() {
  return (
    <>
      <PageHero kicker="Services" title="Every discipline your project needs," accent="under one roof." subtitle="From the first feasibility question to the last inspection on site, Konsadem covers the full range of civil, water, environmental and building engineering." photo={media.pageServices} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap">
          <nav className="k-jump" aria-label="Services on this page" data-stagger>
            {copy.services.map((s, i) => <a key={s.title} href={'#' + slugify(s.title)}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</a>)}
          </nav>
          {copy.services.map((s, i) => {
            const deliver = s.body.find((l) => l.startsWith('What we deliver:'));
            const proof = s.body.find((l) => l.startsWith('Proof:'));
            const prose = s.body.filter((l) => l !== deliver && l !== proof);
            return (
              <article className="k-service" id={slugify(s.title)} key={s.title}>
                <i className="k-rule" data-line />
                <div className="k-service-head">
                  <span className="k-service-no">{String(i + 1).padStart(2, '0')}</span>
                  <h2 className="k-h3" data-split>{s.title}</h2>
                  <p className="k-service-tag" data-fade>{s.tagline}</p>
                </div>
                <div className="k-service-body">
                  <div className="k-frame k-frame-wide" data-clip><Pic photo={serviceMedia[i]} className="k-par" w={1600} sizes="(max-width: 900px) 100vw, 60vw" decorative /></div>
                  {prose.map((p) => <p className="k-body" key={p} data-fade>{p}</p>)}
                  {deliver && (
                    <div data-fade>
                      <p className="k-label">What we deliver</p>
                      <ul className="k-tags k-tags-dark">
                        {deliver.replace('What we deliver: ', '').replace(/\.$/, '').split(/,\s+(?:and\s+)?/).map((d) => <li key={d}>{d.replace(/^and\s+/, '')}</li>)}
                      </ul>
                    </div>
                  )}
                  {proof && <p className="k-proof" data-fade><span className="k-label">Proof</span>{proof.replace('Proof: ', '')}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

const archivePhotos: Record<number, string> = { 2: '068', 5: '083', 8: '146', 13: '163' };
const projectImages: Record<string, Photo[]> = {
  'Water and sanitation': [media.pageContact, media.projLagosWater, media.svcWater],
  'Dams, irrigation and hydropower': [media.svcDams, media.heroDam, media.pageWhy],
  'Roads, drainage and erosion control': [media.projChannel, media.svcMechanical, media.pageProjects],
  'Structures and buildings': [media.svcStructures, media.culture, media.heroCity],
  'Environment and solid waste': [media.projWaste, media.svcEnvironment, media.svcStudies],
};

function Projects() {
  const [filter, setFilter] = useState('All');
  const published = usePublished('projects');
  const archive = copy.projects.map((p, i) => {
    const { meta, description } = projectParts(p.detail);
    const image = archivePhotos[i];
    const options = projectImages[p.category] ?? [media.pageProject];
    return { title:p.title, category:p.category, description:description || meta[0],
      href:'/projects/' + i, photo:image ? { src:`/images/field/field-${image}.jpg`, alt:p.title } : options[i % options.length],
      illustrative:!image };
  });
  const rows = [...archive, ...published.filter(p => p.slug && p.title).map(p => ({
    title:p.title!, category:p.category || 'Other projects', description:p.summary || p.location || '',
    href:'/work/' + p.slug, photo:p.image_url ? {src:p.image_url,alt:p.title!} : media.pageProject, illustrative:!p.image_url,
  }))];
  const categories = ['All', ...new Set(rows.map(p => p.category))];
  useEffect(() => { ScrollTrigger.refresh(); }, [filter, rows.length]);
  return (
    <section className="k-portfolio" data-theme="light">
      <div className="k-wrap">
        <header className="k-portfolio-head">
          <h1>Projects</h1>
          <p>A selection from more than 60 assignments for federal and state governments, development partners, universities and private clients.</p>
        </header>
        <div className="k-portfolio-filters" role="group" aria-label="Filter projects by sector">
          {categories.map(c => <button key={c} type="button" aria-pressed={filter === c} onClick={() => setFilter(c)}>{c}</button>)}
        </div>
        <div className="k-portfolio-grid">
          {rows.filter(p => filter === 'All' || p.category === filter).map(p => (
            <Link key={p.href} href={p.href} prefetch={false} className="k-portfolio-card">
              <span className="k-portfolio-media">
                <Pic photo={p.photo} decorative sizes="(max-width: 680px) 100vw, 50vw" />
                {p.illustrative && <small>Illustrative image</small>}
                <span className="k-portfolio-arrow"><ArrowUpRight aria-hidden="true" size={18} /></span>
              </span>
              <h2>{p.title}</h2>
              {p.description && <p>{p.description}</p>}
              <span className="k-portfolio-tag">{p.category}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectDetail({ id }: { id: number }) {
  const p = copy.projects[id];
  const { meta, description } = projectParts(p.detail);
  const archive = archivePhotos[id];
  const next = (id + 1) % copy.projects.length;
  const labels = ['Client', 'Location', 'Period', 'Note'];
  return (
    <>
      <PageHero kicker={p.category} title={p.title} photo={media.pageProject} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-split">
          <dl className="k-facts" data-stagger>
            <div><dt>Sector</dt><dd>{p.category}</dd></div>
            {meta.map((m, i) => <div key={m}><dt>{labels[i] || 'Note'}</dt><dd>{m}</dd></div>)}
          </dl>
          <div className="k-prose">
            <p className="k-lead" data-fill>{description || p.detail}</p>
            {archive && (
              <figure className="k-archive" data-fade>
                <img src={`/images/field/field-${archive}.jpg`} alt={`${p.title}: photograph from the Konsadem project archive`} loading="lazy" />
                <figcaption>From the Konsadem project archive</figcaption>
              </figure>
            )}
            <p className="k-note" data-fade>The header photograph on this page is illustrative and does not show this project.</p>
            <Link href="/projects" className="k-textlink" data-fade><ArrowLeft aria-hidden="true" /> All projects</Link>
          </div>
        </div>
      </section>
      <Link href={'/projects/' + next} className="k-nextproj" data-theme="dark" data-cursor="Next">
        <div className="k-wrap">
          <p className="k-label k-label-light">Next project</p>
          <p className="k-h2">{copy.projects[next].title} <ArrowUpRight aria-hidden="true" /></p>
        </div>
      </Link>
    </>
  );
}

function Team() {
  return (
    <>
      <PageHero kicker="Our people" title="The minds behind" accent="the milestones." subtitle="Meet the directors guiding KONSADEM Associates Ltd." photo={media.pageTeam} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap">
          <Head label="Leadership / Our people" title="Board of directors." />
          <TeamCards />
        </div>
      </section>
    </>
  );
}

function Why() {
  return (
    <>
      <PageHero kicker="Why Konsadem" title="The firm other firms" accent="partner with." subtitle={sub(copy.why)} photo={media.pageWhy} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap">
          <Head label="Six reasons" title="Why clients and international consultancies" accent="keep coming back." />
          <div className="k-reasons">
            {reasons.map(([title, text], i) => (
              <article key={title} data-fade>
                <i className="k-rule" data-line />
                <span className="k-reason-no">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p className="k-body">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="k-section k-dark" data-theme="dark">
        <div className="k-wrap">
          <Head light label="Who we work for" title="Clients who" accent="expect a lot." />
          <div className="k-cards k-cards-3 k-cards-dark" data-stagger>
            {clients.map(([group, list]) => <article className="k-card" key={group}><h3>{group}</h3><p>{list}</p></article>)}
          </div>
        </div>
      </section>
      <section className="k-section k-mission" data-theme="light">
        <div className="k-wrap"><p className="k-statement" data-fill>“{pullQuote}”</p></div>
      </section>
    </>
  );
}

function Careers() {
  return (
    <>
      <PageHero kicker="Careers" title="Build your career on work" accent="that matters." subtitle="Water, roads and the infrastructure communities depend on." photo={media.pageCareers} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-split">
          <Head label="Careers" title="Talk to" accent="our team." />
          <div className="k-prose"><p className="k-lead" data-fade>For career enquiries, email <a href="mailto:info@konsadem.com">info@konsadem.com</a>.</p></div>
        </div>
      </section>
      <section className="k-section k-career-openings" id="open-roles" data-theme="light" aria-labelledby="open-roles-title">
        <div className="k-wrap">
          <header className="k-career-openings-head">
            <div><p className="k-label">Opportunities</p><h2 className="k-h2" id="open-roles-title">Explore open roles.</h2></div>
            <p>Illustrative openings only. These roles are not currently advertised as vacancies.</p>
          </header>
          <ul className="k-career-roles">
            {[
              ['Engineering', 'Civil Engineer', 'Lagos / Hybrid'],
              ['Project Delivery', 'Project Coordinator', 'Abuja / On-site'],
              ['Commercial', 'Quantity Surveyor', 'Ibadan / On-site'],
            ].map(([area, role, location]) => (
              <li key={role}>
                <div><p className="k-label">{area} / Sample role</p><h3>{role}</h3><p>{location}</p></div>
                <a href={`mailto:info@konsadem.com?subject=${encodeURIComponent('Careers enquiry: ' + role)}`} aria-label={`Enquire about ${role}`}>Enquire <ArrowUpRight aria-hidden="true" size={18} /></a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

function Insights() {
  return (
    <>
      <PageHero kicker="Insights" title="Notes from" accent="practice." subtitle="Perspectives on water, infrastructure and the built environment." photo={media.pageInsights} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-split">
          <Head label="Insights" title="Explore" accent="our work." />
          <div className="k-prose"><Link href="/projects" className="k-textlink" data-fade>View the project portfolio <ArrowUpRight aria-hidden="true" /></Link></div>
        </div>
      </section>
    </>
  );
}

function Contact() {
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body = Array.from(new FormData(e.currentTarget), ([k, v]) => `${k}: ${v}`).join('\n');
    window.location.href = 'mailto:info@konsadem.com?subject=' + encodeURIComponent('Website project enquiry') + '&body=' + encodeURIComponent(body);
  };
  return (
    <>
      <PageHero kicker="Contact" title="Let’s talk about" accent="your project." subtitle={sub(copy.contact)} photo={media.pageContact} />
      <section className="k-section" data-theme="light">
        <div className="k-wrap k-contact">
          <div>
            <Head label="Start a conversation" title="Tell us where you are and" accent="what you need." />
            <div className="k-contact-lines" data-stagger>
              <a href="mailto:info@konsadem.com" className="k-contact-mail">info@konsadem.com <ArrowUpRight aria-hidden="true" /></a>
              {phones.map((phone) => <a key={phone} href={'tel:' + phone.replaceAll(' ', '')}>{phone}</a>)}
            </div>
          </div>
          <form className="k-form" onSubmit={submit} data-fade>
            <div className="k-form-row">
              <label>Full name<input name="Full name" autoComplete="name" required /></label>
              <label>Organisation<input name="Organisation" autoComplete="organization" /></label>
            </div>
            <div className="k-form-row">
              <label>Email<input name="Email" type="email" autoComplete="email" required /></label>
              <label>Phone<input name="Phone" type="tel" autoComplete="tel" /></label>
            </div>
            <div className="k-form-row">
              <label>Service of interest
                <select name="Service of interest" defaultValue=""><option value="">Select a service</option>{copy.services.map((s) => <option key={s.title}>{s.title}</option>)}</select>
              </label>
              <label>Project location<input name="Project location" /></label>
            </div>
            <label>Tell us about your project<textarea name="Project details" required rows={5} /></label>
            <button type="submit" className="k-btn k-btn-dark">Open email draft <ArrowUpRight aria-hidden="true" /></button>
            <p className="k-note">This opens your email app so you can send the enquiry.</p>
          </form>
        </div>
      </section>
      <section className="k-section k-tint" data-theme="light">
        <div className="k-wrap">
          <Head label="Locations" title="Four offices," accent="two countries." />
          <div className="k-cards k-cards-4" data-stagger>
            {offices.map((o, i) => <article className="k-card" key={o.name}><span className="k-card-no">{String(i + 1).padStart(2, '0')}</span><h3>{o.name}</h3><p>{o.address}</p></article>)}
          </div>
        </div>
      </section>
    </>
  );
}

const pages: Record<string, () => React.ReactNode> = { about: About, services: Services, projects: Projects, team: Team, careers: Careers, insights: Insights, contact: Contact, 'why-konsadem': Why };

export default function Interior({ page, projectId }: { page: string; projectId?: number }) {
  const Page = pages[page] || About;
  return (
    <SiteShell routeKey={`${page}-${projectId ?? 'index'}`} tone={page === 'projects' ? 'light' : 'dark'} cta={page !== 'contact'}>
      {projectId !== undefined ? <ProjectDetail id={projectId} /> : (page === 'team' || page === 'projects') ? <Page /> : <CmsLanding page={page} fallback={<Page />} />}
    </SiteShell>
  );
}
