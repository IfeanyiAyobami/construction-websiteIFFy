import Interior from "@/components/Interior";
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Interior page="project" projectId={Number(id)}/>;}
