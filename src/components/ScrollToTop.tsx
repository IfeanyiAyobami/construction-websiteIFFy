'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
export default function ScrollToTop(){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{const update=()=>setVisible(window.scrollY>480);update();window.addEventListener('scroll',update,{passive:true});return()=>window.removeEventListener('scroll',update)},[]);
 return <button type="button" className={`scroll-to-top ${visible?'is-visible':''}`} aria-label="Scroll to top" title="Back to top" tabIndex={visible?0:-1} onClick={()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}><ArrowUp size={21} strokeWidth={2.2}/><span className="scroll-to-top-label">TOP</span></button>;
}
