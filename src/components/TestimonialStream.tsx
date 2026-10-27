'use client';
import {useEffect,useRef,useState} from 'react';
import gsap from 'gsap';
import {usePublished} from './CmsPublic';

type Review={id:string;name?:string;role?:string;quote?:string;image_url?:string};
const samples:Review[]=[
 {id:'sample-1',name:'Chinedu Obi',role:'Commercial development client',image_url:'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'Their approach to planning, communication and technical detail gave us confidence at every stage.'},
 {id:'sample-2',name:'Adaeze Nwosu',role:'Property development partner',image_url:'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'What impressed us most was how the team translated a complicated brief into a clear, practical delivery plan.'},
 {id:'sample-3',name:'Tobi Adebayo',role:'Infrastructure stakeholder',image_url:'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'A collaborative team with a genuine commitment to doing the work carefully and getting the details right.'},
 {id:'sample-4',name:'Amara Okafor',role:'Residential project client',image_url:'https://images.pexels.com/photos/3760854/pexels-photo-3760854.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'Every conversation was clear and considered. We always understood the next step and the thinking behind it.'},
 {id:'sample-5',name:'Femi Adeyemi',role:'Project delivery partner',image_url:'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'The team brought together practical expertise and careful coordination throughout the project.'},
 {id:'sample-6',name:'Nneka Eze',role:'Development consultant',image_url:'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=160',quote:'A professional, responsive team that listened closely and paid attention to the details that mattered.'}
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
     <span className="voice-stars" aria-label="Five stars">★★★★★</span>
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
 return <section className="voice-section" aria-labelledby="voice-title">
  <div className="container voice-heading">
   <span className="kicker">07 / CLIENT VOICES</span>
   <h2 id="voice-title">Built on trust.<br/><em>Remembered for<br/> results.</em></h2>
   <div className="voice-intro">
    <p>{published.length?'What our clients and collaborators say about working with us.':'Illustrative client feedback showing how real testimonials could appear on the finished website. Names and quotations are fictional.'}</p>
    <button className="motion-toggle" onClick={()=>setPaused(v=>!v)} aria-pressed={paused}>{paused?'Play testimonials':'Pause testimonials'} <span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>
   </div>
  </div>
  <div className="voice-rows">
   <Track reviews={top} reverse={false} paused={paused}/>
   {bottom.length>0&&<Track reviews={bottom} reverse paused={paused} startIndex={split}/>}
  </div>
 </section>;
}
