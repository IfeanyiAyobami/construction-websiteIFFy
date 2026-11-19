import Link from 'next/link';
import { notFound } from 'next/navigation';
import { X } from 'lucide-react';
import LeaderProfile from '@/components/site/LeaderProfile';
import { leaders } from '@/components/site/leaders';

export function generateStaticParams() { return leaders.map(({ slug }) => ({ slug })); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  return {title:`${leaders.find(l=>l.slug===slug)?.name ?? 'Leadership'} | KONSADEM Associates Ltd`};
}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const index=leaders.findIndex(l=>l.slug===slug);
  const member=leaders[index];
  if(!member) notFound();
  return <main className="k-profile-screen">
    <LeaderProfile member={member} index={index} titleId="profile-name"
      close={<Link href="/team" className="k-profile-close" aria-label="Close profile and return to leadership"><X size={22} /></Link>} />
  </main>;
}
