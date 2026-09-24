import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Bell, ChevronDown, ContactRound, LogOut, Menu, MessageCircleMore, Send, Settings, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const nav = [
 {to:'/sms',label:'Messages',icon:MessageCircleMore}, {to:'/contacts',label:'Contacts',icon:ContactRound},
 {to:'/bulk-sms',label:'Bulk SMS',icon:Send}, {to:'/users',label:'Users & roles',icon:UsersRound},
 {to:'/settings',label:'Settings',icon:Settings}, {to:'/profile',label:'My profile',icon:UserRound},
] as const;
const titles:Record<string,[string,string]> = { '/sms':['Messages','Manage patient conversations'], '/contacts':['Contacts','Organize people and communication details'], '/bulk-sms':['Bulk SMS','Create and schedule audience campaigns'], '/users':['Users & roles','Control team access and responsibilities'], '/settings':['Settings','Configure your messaging workspace'], '/profile':['My profile','Manage your personal information'] };

export function AppShell({children}:{children:ReactNode}){
 const path=useRouterState({select:s=>s.location.pathname}); const navigate=useNavigate(); const [open,setOpen]=useState(false); const page=titles[path]??['Workspace',''];
 useEffect(()=>{ if(typeof window!=='undefined' && sessionStorage.getItem('p3care-demo')!=='yes') navigate({to:'/'}); },[navigate]);
 const logout=()=>{sessionStorage.removeItem('p3care-demo'); navigate({to:'/'});};
 return <div className="min-h-screen bg-background lg:flex">
  {open&&<button aria-label="Close navigation" onClick={()=>setOpen(false)} className="fixed inset-0 z-30 bg-overlay lg:hidden"/>}
  <aside className={cn('sidebar-gradient fixed inset-y-0 left-0 z-40 flex w-68 flex-col p-4 transition-transform duration-300 lg:translate-x-0',open?'translate-x-0':'-translate-x-full')}>
   <div className="flex h-16 items-center justify-between px-3"><Link to="/sms" className="flex items-center gap-3" onClick={()=>setOpen(false)}><span className="brand-mark"><MessageCircleMore size={22}/></span><span><strong className="block font-display text-lg text-sidebar-primary-foreground">P3 Care</strong><small className="block text-sidebar-muted">Communications</small></span></Link><Button variant="sidebarGhost" size="icon" className="lg:hidden" onClick={()=>setOpen(false)} aria-label="Close menu"><X/></Button></div>
   <div className="sidebar-divider my-4"/><p className="px-3 pb-2 text-xs font-semibold uppercase text-sidebar-muted">Workspace</p>
   <nav className="space-y-1">{nav.map(item=><Link key={item.to} to={item.to} onClick={()=>setOpen(false)} activeProps={{className:'sidebar-link-active'}} className="sidebar-link"><item.icon/><span>{item.label}</span></Link>)}</nav>
   <div className="mt-auto"><div className="sidebar-divider my-4"/><div className="mb-3 flex items-center gap-3 rounded-lg bg-sidebar-glass p-3"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">IS</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-sidebar-primary-foreground">Imran Shabbir</p><p className="text-xs text-sidebar-muted">Administrator</p></div><ShieldCheck className="text-sidebar-muted" size={17}/></div><Button variant="sidebarGhost" className="w-full justify-start" onClick={logout}><LogOut/> Sign out</Button></div>
  </aside>
  <div className="min-w-0 flex-1 lg:ml-68"><header className="sticky top-0 z-20 flex h-18 items-center gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur-xl sm:px-6"><Button variant="ghost" size="icon" className="lg:hidden" onClick={()=>setOpen(true)} aria-label="Open menu"><Menu/></Button><div><h1 className="font-display text-xl font-semibold text-foreground">{page[0]}</h1><p className="hidden text-xs text-muted-foreground sm:block">{page[1]}</p></div><div className="ml-auto flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Notifications"><Bell/></Button><Button variant="outline" className="hidden sm:flex"><span className="status-dot"/> P3 Care Admin <ChevronDown/></Button></div></header><main>{children}</main></div>
 </div>
}
