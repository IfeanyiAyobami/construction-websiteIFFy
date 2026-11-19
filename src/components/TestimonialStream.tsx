'use client';
import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {usePublished} from './CmsPublic';

type Review={id:string;name?:string;role?:string;quote?:string;image_url?:string};

const samples:Review[]=[
 {id:'sample-1',name:'Illustrative quote 01',role:'Water infrastructure',quote:'The team made the technical options clear and kept us informed through each stage.'},
 {id:'sample-2',name:'Illustrative quote 02',role:'Project supervision',quote:'We always knew what had been completed, what needed attention and what came next.'},
 {id:'sample-3',name:'Illustrative quote 03',role:'Environmental assessment',quote:'The recommendations were practical and grounded in what we saw on site.'},
 {id:'sample-4',name:'Illustrative quote 04',role:'Engineering design',quote:'The drawings and supporting notes gave the delivery team a clear starting point.'},
 {id:'sample-5',name:'Illustrative quote 05',role:'Infrastructure advisory',quote:'They helped us understand the trade-offs before committing to a direction.'},
 {id:'sample-6',name:'Illustrative quote 06',role:'Construction coordination',quote:'Questions from the field were handled clearly, with decisions recorded for the whole team.'},
];

function Track({reviews,reverse,paused,startIndex=0}:{reviews:Review[];reverse:boolean;paused:boolean;startIndex?:number}){
 const viewport=useRef<HTMLDivElement>(null),track=useRef<HTMLDivElement>(null),group=useRef<HTMLDivElement>(null);
 const animation=useRef<gsap.core.Tween|null>(null);
 const [interaction,setInteraction]=useState(false);
 const pausedRef=useRef(paused),interactionRef=useRef(interaction);pausedRef.current=paused;interactionRef.current=interaction;
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let ctx:gsap.Context|undefined;
  const setup=()=>{
   ctx?.revert();animation.current=null;
   if(motion.matches||!viewport.current||!track.current||!group.current)return;
   ctx=gsap.context(()=>{
    const distance=group.current!.getBoundingClientRect().width;
    if(!distance)return;
    gsap.set(track.current,{x:reverse?-distance:0});
    animation.current=gsap.to(track.current,{x:reverse?0:-distance,duration:Math.max(24,distance/35),ease:'none',repeat:-1,paused:pausedRef.current||interactionRef.current});
   },viewport);
  };
  setup();
  const observer=new ResizeObserver(setup);if(group.current)observer.observe(group.current);
  motion.addEventListener('change',setup);
  return()=>{observer.disconnect();motion.removeEventListener('change',setup);ctx?.revert();animation.current=null};
 },[reviews,reverse]);
 useEffect(()=>{if(paused||interaction)animation.current?.pause();else animation.current?.resume()},[paused,interaction]);
 return <div className="voice-viewport" ref={viewport} tabIndex={0} aria-label={'Testimonials '+(reverse?'moving right':'moving left')} onMouseEnter={()=>setInteraction(true)} onMouseLeave={()=>setInteraction(false)} onFocus={()=>setInteraction(true)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setInteraction(false)}}>
  <div className="voice-track" ref={track}>
   {[0,1,2,3,4,5].map(copy=><div className="voice-group" key={copy} ref={copy===0?group:undefined} aria-hidden={copy!==0}>
    {reviews.map((r,i)=><article className="voice-card" key={r.id}>
     <span className="voice-stars" aria-hidden="true">❝</span>
     <blockquote>“{r.quote}”</blockquote>
     <div className="voice-person">
      {r.image_url?<img className="voice-portrait" src={r.image_url} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/>:null}
      <p><strong>{r.name}</strong><small>{r.role}</small></p>
      <span className="voice-number">{String(i+1+startIndex).padStart(2,'0')}</span>
     </div>
    </article>)}
   </div>)}
  </div>
 </div>
}
export default function TestimonialStream(){
 const records=usePublished('testimonials');
 const published=records.filter(r=>r.quote&&r.name);
 const reviews:Review[]=published.length?published:samples;
 const split=Math.ceil(reviews.length/2),top=reviews.slice(0,split),bottom=reviews.slice(split);
 const [paused,setPaused]=useState(false);
 if(!reviews.length)return null;
 return <section className="voice-section" aria-labelledby="voice-title">
  <div className="container voice-heading">
   <span className="kicker">07 / CLIENT VOICES</span>
   <h2 id="voice-title">Built on trust.<br/><em>Remembered for<br/> results.</em></h2>
   <div className="voice-intro">
    <p>{published.length ? "What our clients and collaborators say about working with us." : "Sample testimonials for design review. These quotes are illustrative and are not client endorsements."}</p>
    <button className="motion-toggle" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'Play testimonials':'Pause testimonials'} <span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>
   </div>
  </div>
  <div className="voice-rows">
   <Track reviews={top} reverse={false} paused={paused}/>
   {bottom.length>0&&<Track reviews={bottom} reverse paused={paused} startIndex={split}/>}
  </div>
 </section>;
}
