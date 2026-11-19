import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CircleCheck } from 'lucide-react';
import type { leaders } from './leaders';

export default function LeaderProfile({member,index,titleId,close,overlay=false}:{
  member:(typeof leaders)[number]; index:number; titleId:string; close:ReactNode; overlay?:boolean;
}) {
  const Heading=overlay?'h2':'h1';
  return (
    <article className="k-profile-panel" aria-labelledby={titleId}>
      <div className="k-profile-portrait">
        {member.photo ? <img src={member.photo} alt={member.name} /> : <span aria-hidden="true">{member.initials}</span>}
      </div>
      <div className="k-profile-content">
        {close}
        <p className="k-profile-kicker">Meet the leadership / Profile {String(index+1).padStart(2,'0')}</p>
        <Heading id={titleId}>{member.name}</Heading>
        <p className="k-profile-role">{member.role}</p>
        <p className="k-profile-credentials">{member.credentials}</p>
        <p className="k-profile-bio">{member.bio}</p>
        <h3>Areas of focus</h3>
        <ul>{member.focus.map(area=><li key={area}><CircleCheck size={16} aria-hidden="true" />{area}</li>)}</ul>
        <Link href="/contact" className="k-profile-contact">Connect with our team <ArrowUpRight size={17} aria-hidden="true" /></Link>
      </div>
    </article>
  );
}
