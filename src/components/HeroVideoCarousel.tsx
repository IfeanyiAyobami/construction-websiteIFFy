'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, MoveDownRight, Pause, Play } from 'lucide-react';
import gsap from 'gsap';

const damHero = { desktop:'/videos/hero/dam-hero-desktop.mp4', mobile:'/videos/hero/dam-hero-mobile.mp4' };
const slides = [
  { eyebrow:'ENGINEERS & CONSULTANTS. SINCE 1972.',title:'Engineering Excellence',description:'Five decades designing, supervising and managing complex infrastructure, from feasibility study to final handover.',video:damHero.desktop,poster:'/videos/hero/dam-hero-desktop.jpg',label:'FIVE DECADES OF PRACTICE'},
  { eyebrow:'WATER SUPPLY AND SANITATION',title:'Environmental Stewardship',description:'Treatment plants, reticulation networks, sewerage and WASH facilities, studied, designed and supervised.',video:'/videos/hero/infrastructure.mp4',poster:'/videos/hero/infrastructure.jpg',label:'WATER & SANITATION'},
  { eyebrow:'ROADS, BRIDGES AND DRAINAGE',title:'Sustainable Development',description:'Highways, bridges, drainage channels and flood works that stand up to Nigerian conditions.',video:'/videos/hero/engineering.mp4',poster:'/videos/hero/engineering.jpg',label:'ROADS & DRAINAGE'},
  { eyebrow:'THE FIRM OTHER FIRMS PARTNER WITH',title:'Sustainable Development',description:'Trusted on projects funded by the World Bank, the European Union, AFD, AfDB and USAID.',video:'/videos/hero/completed-projects.mp4',poster:'/videos/hero/completed-projects.jpg',label:'PARTNERSHIPS'},
];
const SLIDE_MS = 10000;
export default function HeroVideoCarousel(){
 const [active,setActive]=useState(0);
 const [paused,setPaused]=useState(false);
 const [visible,setVisible]=useState(true);
 const [reduceMotion,setReduceMotion]=useState(false);
 const [failed,setFailed]=useState<Record<number,boolean>>({});
 const [videoReady,setVideoReady]=useState<Record<number,boolean>>({});
 const [progress,setProgress]=useState(0);
 const videos=useRef<(HTMLVideoElement|null)[]>([]);
 const copy=useRef<HTMLDivElement>(null);
 const elapsed=useRef(0);
 const previousTime=useRef<number|null>(null);
 const activeRef=useRef(active);
 const pausedRef=useRef(paused);
 const visibleRef=useRef(visible);
 const reduceRef=useRef(reduceMotion);
 activeRef.current=active;pausedRef.current=paused;visibleRef.current=visible;reduceRef.current=reduceMotion;
 const go=useCallback((n:number)=>{setActive((n+slides.length)%slides.length);elapsed.current=0;setProgress(0);},[]);
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const sync=()=>setReduceMotion(media.matches);sync();media.addEventListener('change',sync);const visibility=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',visibility);return()=>{media.removeEventListener('change',sync);document.removeEventListener('visibilitychange',visibility)}},[]);
 useEffect(()=>{const video=videos.current[active];videos.current.forEach((v,i)=>{if(i!==active&&v){v.pause();v.currentTime=0;}});if(video&&!paused&&visible&&!reduceMotion&&!failed[active]){video.play().catch((error:DOMException)=>{if(error.name!=='AbortError')setFailed(p=>({...p,[active]:true}));});}else video?.pause();},[active,paused,visible,reduceMotion,failed]);
 useEffect(()=>{if(!copy.current)return;const ctx=gsap.context(()=>{gsap.fromTo(copy.current!.children,{opacity:0,y:24},{opacity:1,y:0,stagger:.09,duration:.7,ease:'power2.out',clearProps:'transform'});},copy);return()=>ctx.revert()},[active]);
 useEffect(()=>{let raf=0;const tick=(t:number)=>{if(previousTime.current!==null&&!pausedRef.current&&visibleRef.current&&!reduceRef.current){elapsed.current+=Math.min(t-previousTime.current,100);const value=Math.min(elapsed.current/(activeRef.current===0?12000:SLIDE_MS),1);setProgress(value);if(value>=1)go(activeRef.current+1);}previousTime.current=t;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);previousTime.current=null}},[go]);
 return <section className="hero hero-carousel" aria-label="Featured engineering stories">
  <div className="hero-video-stack" aria-hidden="true">{slides.map((s,i)=><div className={'hero-video-layer '+(i===0?'hero-video-layer-dam ':'')+(active===i?'is-active':'')} key={s.video} style={i===0?undefined:{backgroundImage:`url(${s.poster})`}}><video ref={el=>{videos.current[i]=el}} muted playsInline loop preload={i===active?'auto':'none'} poster={i===0?undefined:s.poster} onCanPlay={()=>setVideoReady(p=>({...p,[i]:true}))} onError={()=>setFailed(p=>({...p,[i]:true}))} className={failed[i]||!videoReady[i]?'video-hidden':''}>{i===0&&<source src={damHero.mobile} type="video/mp4" media="(max-width: 760px)"/>}<source src={s.video} type="video/mp4"/></video></div>)}</div>
  <div className="hero-shade"/>
  <div className="container hero-content"><div className="hero-carousel-copy" ref={copy} key={active}><div className="eyebrow"><span className="dot"/> {slides[active].eyebrow}</div><h1>{slides[active].title}</h1><p>{slides[active].description}</p><div className="hero-actions"><a className="btn btn-lime" href="#projects">Explore Our Work <ArrowUpRight size={17}/></a><a className="btn btn-outline" href="#services">Our Expertise <ArrowRight size={17}/></a></div></div>
  <div className="hero-carousel-controls"><div className="hero-carousel-label"><span>0{active+1} / 0{slides.length}</span><strong>{slides[active].label}</strong></div><div className="hero-carousel-buttons"><button type="button" onClick={()=>go(active-1)} aria-label="Previous slide"><ArrowLeft size={18}/></button><button type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume carousel':'Pause carousel'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button><button type="button" onClick={()=>go(active+1)} aria-label="Next slide"><ArrowRight size={18}/></button></div></div>
  <div className="hero-carousel-dots" aria-label="Select a hero slide">{slides.map((s,i)=><button key={s.label} type="button" onClick={()=>go(i)} aria-label={`Show slide ${i+1}: ${s.label}`} aria-current={active===i?'true':undefined}><span style={{transform:`scaleX(${active===i?progress:0})`}}/></button>)}</div>
  <div className="hero-bottom"><span>KONSADEM ASSOCIATES / ENGINEERS & CONSULTANTS</span><a href="#about">SCROLL TO EXPLORE <MoveDownRight size={17}/></a></div></div>
  <span className="hero-vertical">FROM FEASIBILITY TO HANDOVER</span>
 </section>
}
