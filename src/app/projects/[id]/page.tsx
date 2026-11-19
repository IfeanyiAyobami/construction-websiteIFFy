import Interior from '@/components/Interior';
import {notFound} from 'next/navigation';
import copy from '@/lib/konsadem-copy.json';
export function generateStaticParams(){return copy.projects.map((_, id) => ({id:String(id)}));}
export default async function Page({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 if(!/^\d+$/.test(id)||!copy.projects[Number(id)])notFound();
 return <Interior page="project" projectId={Number(id)}/>;
}
