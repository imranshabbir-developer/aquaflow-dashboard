import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Bell, ChevronDown, ContactRound, KeyRound, LogOut, Menu, MessageCircleMore, PanelLeftClose, PanelLeftOpen, Send, Settings, UserRound, UsersRound, X } from 'lucide-react';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { avatarStyle, cn } from '@/lib/utils';

const nav = [
  { to: '/sms', label: 'Messages', icon: MessageCircleMore },
  { to: '/contacts', label: 'Contacts', icon: ContactRound },
  { to: '/bulk-sms', label: 'Bulk SMS', icon: Send },
  { to: '/users', label: 'Add / Edit User', icon: UsersRound },
] as const;

const titles: Record<string, [string, string]> = {
  '/sms': ['Messages', 'Manage patient conversations'],
  '/contacts': ['Contacts', 'Organize people and communication details'],
  '/bulk-sms': ['Bulk SMS', 'Create and schedule audience campaigns'],
  '/users': ['Add / Edit User', 'Create and manage workspace users'],
  '/settings': ['Settings', 'Configure your messaging workspace'],
  '/profile': ['My profile', 'Manage your personal information'],
};

const floatIcons = [
  { Icon: MessageCircleMore, left: '16%', delay: '0s', duration: '7s' },
  { Icon: Send, left: '62%', delay: '1.8s', duration: '8.2s' },
  { Icon: MessageCircleMore, left: '38%', delay: '3.6s', duration: '6.8s' },
  { Icon: Send, left: '74%', delay: '5s', duration: '9s' },
  { Icon: MessageCircleMore, left: '24%', delay: '2.8s', duration: '7.6s' },
];

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [nextPw, setNextPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError] = useState('');
  const page = titles[path] ?? ['Workspace', ''];
  const isMobile = useIsMobile();
  const slim = collapsed && !isMobile;

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('p3care-demo') !== 'yes') {
      navigate({ to: '/' });
    }
  }, [navigate]);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  const logout = () => {
    sessionStorage.removeItem('p3care-demo');
    navigate({ to: '/' });
  };

  const resetPasswordForm = () => {
    setCurrentPw('');
    setNextPw('');
    setConfirmPw('');
    setPwError('');
  };

  const savePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPw.trim() || !nextPw.trim() || !confirmPw.trim()) {
      setPwError('Fill in all password fields.');
      return;
    }
    if (nextPw !== confirmPw) {
      setPwError('New password and confirmation do not match.');
      return;
    }
    resetPasswordForm();
    setPwOpen(false);
  };

  return (
    <div className="h-svh overflow-hidden overscroll-none bg-background lg:flex">
      {open && (
        <button aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-overlay lg:hidden" />
      )}
      <aside
        className={cn(
          'sidebar-gradient fixed inset-y-0 left-0 z-40 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] transition-[width,transform,padding] duration-300 lg:translate-x-0',
          'w-[min(18.5rem,88vw)] p-3',
          slim ? 'lg:w-16 lg:p-2' : 'lg:w-56',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className={cn('flex items-center', slim ? 'flex-col gap-1' : 'h-12 justify-between gap-1 px-1')}>
          <Link to="/sms" className="flex min-w-0 items-center gap-2" onClick={() => setOpen(false)}>
            <span className={cn('brand-mark', slim && 'h-9 w-9')}>
              <MessageCircleMore size={slim ? 18 : 22} />
            </span>
            {!slim && (
              <span>
                <strong className="block font-display text-base text-white">P3 Care</strong>
                <small className="block text-sidebar-muted">Communications</small>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="sidebar-toggle hidden lg:grid"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={slim ? 'Expand sidebar' : 'Collapse sidebar'}
            title={slim ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {slim ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
          </button>
          {!slim && (
            <Button variant="sidebarGhost" size="icon" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </Button>
          )}
        </div>
        <div className="sidebar-divider mt-1.5 mb-2" />
        {!slim && <p className="mt-8 px-2 pb-2 text-xs font-semibold uppercase text-sidebar-muted">Workspace</p>}
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              title={item.label}
              onClick={() => setOpen(false)}
              activeProps={{ className: 'sidebar-link-active' }}
              className={cn('sidebar-link', slim && 'sidebar-link-slim')}
            >
              <item.icon />
              {!slim && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-float hidden lg:block" aria-hidden>
          {floatIcons.map((item, i) => (
            <span
              key={i}
              className="sidebar-float-icon"
              style={{ left: item.left, animationDelay: item.delay, animationDuration: item.duration }}
            >
              <item.Icon size={16} />
            </span>
          ))}
        </div>
        <div className="mt-auto">
          <div className="sidebar-divider my-2" />
          <button type="button" className="sidebar-signout" onClick={logout} aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
            {!slim && <span>Sign out</span>}
          </button>
        </div>
      </aside>
      <div
        className={cn(
          'flex h-full min-w-0 flex-1 flex-col transition-[margin] duration-300',
          slim ? 'lg:ml-16' : 'lg:ml-56',
        )}
      >
        <header className="sticky top-0 z-20 flex min-h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/90 px-3 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:min-h-18 sm:gap-4 sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <div className={cn('min-w-0', (path === '/sms' || path === '/contacts') && 'max-md:hidden')}>
            <h1 className="truncate font-display text-lg font-semibold text-foreground sm:text-xl">{page[0]}</h1>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">{page[1]}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 rounded-full px-1.5 sm:pr-3" aria-label="Account menu">
                  <span className="avatar-sm" style={avatarStyle('Imran Shabbir')}>IS</span>
                  <span className="hidden text-left sm:block">
                    <strong className="block text-sm font-semibold leading-none">Imran Shabbir</strong>
                    <small className="mt-1 block text-[0.7rem] text-muted-foreground">Administrator</small>
                  </span>
                  <ChevronDown size={16} className="text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="profile-menu w-56 p-1.5 data-[state=open]:slide-in-from-top-4 data-[state=open]:duration-300">
                <DropdownMenuLabel className="profile-menu-user">
                  <span className="avatar-sm" style={avatarStyle('Imran Shabbir')}>IS</span>
                  <span>
                    <strong>Imran Shabbir</strong>
                    <small>Administrator</small>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="profile-menu-line" />
                <DropdownMenuItem onClick={() => navigate({ to: '/settings' })}>
                  <Settings /> Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/profile' })}>
                  <UserRound /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="profile-menu-line" />
                <DropdownMenuItem onClick={() => { resetPasswordForm(); setPwOpen(true); }}>
                  <KeyRound /> Change Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-auto overscroll-contain">{children}</main>
      </div>
      <Dialog
        open={pwOpen}
        onOpenChange={(next) => {
          setPwOpen(next);
          if (!next) resetPasswordForm();
        }}
      >
        <DialogContent className="password-modal max-w-sm gap-4 p-5">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>Keep your workspace access current.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={savePassword}>
            <label className="field-label block">
              Current password
              <Input type="password" className="mt-1.5 h-9" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password" />
            </label>
            <label className="field-label block">
              New password
              <Input type="password" className="mt-1.5 h-9" value={nextPw} onChange={(e) => setNextPw(e.target.value)} autoComplete="new-password" />
            </label>
            <label className="field-label block">
              Confirm password
              <Input type="password" className="mt-1.5 h-9" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password" />
            </label>
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
            <DialogFooter className="pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setPwOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Update password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
