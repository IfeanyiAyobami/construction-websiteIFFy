'use client';
import {useEffect,useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import DocumentWorkspace from './DocumentWorkspace';
import {workspaceRequest} from './useLiveWorkspace';
export default function Workspace({initialSection='Overview'}:{initialSection?:string}){
 const [session,setSession]=useState<{authenticated:boolean}|null>(null),[login,setLogin]=useState({email:'',password:''}),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 useEffect(()=>{workspaceRequest('/api/workspace/session').then(setSession).catch(e=>{setNotice(e.message);setSession({authenticated:false})})},[]);
 async function signIn(e:React.FormEvent){e.preventDefault();setBusy(true);setNotice('');try{await workspaceRequest('/api/workspace/session',login);setLogin({email:'',password:''});setSession({authenticated:true})}catch(e){setNotice((e as Error).message)}finally{setBusy(false)}}
 if(!session)return <div className="ws-loading">Opening your workspace…</div>;
if(!session.authenticated)return <div className="ws-login"><aside><a href="/" className="ws-brand"><img src="/brand/k-symbol.svg" alt=""/><span>KONSADEM<small>ASSOCIATES LTD</small></span></a><div className="ws-login-heading"><span>DOCUMENT WORKSPACE</span><span>STAFF ACCESS ↗</span></div><span className="ws-login-kicker">THE PRIVATE WORKSPACE</span><h1>One place.<br/>Every detail.<br/><em>All connected.</em></h1><p>Your projects, documents and decisions.<br/>Purposefully brought together.</p><small>ENGINEERED FOR COLLABORATION.</small></aside><main><form onSubmit={signIn}><span className="ws-eyebrow">DOCUMENT WORKSPACE</span><h2>Welcome back.</h2><p>Sign in with your authorised staff account.</p><label>Email address<input required type="email" autoComplete="username" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})}/></label><label>Password<input required type="password" autoComplete="current-password" value={login.password} onChange={e=>setLogin({...login,password:e.target.value})}/></label><button disabled={busy} className="ws-primary">{busy?'Signing in…':'Enter workspace'} <ArrowUpRight size={18}/></button>{notice&&<div className="ws-notice" role="alert">{notice}</div>}<p className="ws-help">Access is granted separately from the website CMS. Contact your administrator if you need an account.</p><a href="/">← Return to website</a></form></main></div>;
return <DocumentWorkspace initialSection={initialSection}/>;
}
