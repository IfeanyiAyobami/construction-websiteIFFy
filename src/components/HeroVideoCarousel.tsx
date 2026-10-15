'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, MoveDownRight, Pause, Play } from 'lucide-react';
import gsap from 'gsap';

const slides = [
  { eyebrow:'BUILT ON EXPERTISE. GROUNDED IN TRUST.',title:'ENGINEERING THE FUTURE.',description:'We turn ambitious ideas into structures and spaces that shape the way we live, work and connect.',video:'/videos/hero/building-construction.mp4',poster:'/images/hero/building-poster.jpg',label:'BUILDING CONSTRUCTION'},
  { eyebrow:'CONNECTING PEOPLE AND PLACES',title:'INFRASTRUCTURE THAT INSPIRES.',description:'Infrastructure designed to connect communities and move the future forward.',video:'/videos/hero/infrastructure.mp4',poster:'/images/hero/infrastructure-poster.jpg',label:'CIVIL INFRASTRUCTURE'},
  { eyebrow:'PRECISION IN EVERY DETAIL',title:'EXCELLENCE IN EVERY STRUCTURE.',description:'Engineering insight and thoughtful execution at every stage of a project.',video:'/videos/hero/engineering.mp4',poster:'/images/hero/engineering-poster.jpg',label:'ENGINEERING EXPERTISE'},
  { eyebrow:'BUILT WITH PURPOSE',title:'SHAPING WHAT COMES NEXT.',description:'Building enduring spaces that support the way people live and work.',video:'/videos/hero/completed-projects.mp4',poster:'/images/hero/completed-poster.jpg',label:'PROJECT DELIVERY'},
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
 useEffect(()=>{const video=videos.current[active];videos.current.forEach((v,i)=>{if(i!==active&&v){v.pause();v.currentTime=0;}});if(video&&!paused&&visible&&!reduceMotion&&!failed[active]){video.play().catch(()=>setFailed(p=>({...p,[active]:true})));}else video?.pause();},[active,paused,visible,reduceMotion,failed]);
 useEffect(()=>{if(!copy.current)return;const ctx=gsap.context(()=>{gsap.fromTo(copy.current!.children,{opacity:0,y:24},{opacity:1,y:0,stagger:.09,duration:.7,ease:'power2.out',clearProps:'transform'});},copy);return()=>ctx.revert()},[active]);
 useEffect(()=>{let raf=0;const tick=(t:number)=>{if(previousTime.current!==null&&!pausedRef.current&&visibleRef.current&&!reduceRef.current){elapsed.current+=Math.min(t-previousTime.current,100);const value=Math.min(elapsed.current/SLIDE_MS,1);setProgress(value);if(value>=1)go(activeRef.current+1);}previousTime.current=t;raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);previousTime.current=null}},[go]);
 return <section className="hero hero-carousel" aria-label="Featured engineering stories">
  <div className="hero-video-stack" aria-hidden="true">{slides.map((s,i)=><div className={'hero-video-layer '+(active===i?'is-active':'')} key={s.video} style={{backgroundImage:`url(${s.poster})`}}><video ref={el=>{videos.current[i]=el}} muted playsInline loop preload={i===active?'auto':'none'} poster={s.poster} onCanPlay={()=>setVideoReady(p=>({...p,[i]:true}))} onError={()=>setFailed(p=>({...p,[i]:true}))} className={failed[i]||!videoReady[i]?'video-hidden':''}><source src={s.video} type="video/mp4"/></video></div>)}</div>
  <div className="hero-shade"/>
  <div className="container hero-content"><div className="hero-carousel-copy" ref={copy} key={active}><div className="eyebrow"><span className="dot"/> {slides[active].eyebrow}</div><h1>{slides[active].title}</h1><p>{slides[active].description}</p><div className="hero-actions"><a className="btn btn-lime" href="#projects">Explore Our Work <ArrowUpRight size={17}/></a><a className="btn btn-outline" href="#services">Our Expertise <ArrowRight size={17}/></a></div></div>
  <div className="hero-carousel-controls"><div className="hero-carousel-label"><span>0{active+1} / 0{slides.length}</span><strong>{slides[active].label}</strong></div><div className="hero-carousel-buttons"><button type="button" onClick={()=>go(active-1)} aria-label="Previous slide"><ArrowLeft size={18}/></button><button type="button" onClick={()=>setPaused(v=>!v)} aria-label={paused?'Resume carousel':'Pause carousel'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button><button type="button" onClick={()=>go(active+1)} aria-label="Next slide"><ArrowRight size={18}/></button></div></div>
  <div className="hero-carousel-dots" aria-label="Select a hero slide">{slides.map((s,i)=><button key={s.label} type="button" onClick={()=>go(i)} aria-label={`Show slide ${i+1}: ${s.label}`} aria-current={active===i?'true':undefined}><span style={{transform:`scaleX(${active===i?progress:0})`}}/></button>)}</div>
  <div className="hero-bottom"><span>MONUMENT CONSTRUCTION — CONCEPT SHOWCASE</span><a href="#about">SCROLL TO EXPLORE <MoveDownRight size={17}/></a></div></div>
  <span className="hero-vertical">PRECISION IN EVERY DETAIL</span>
 </section>
}
