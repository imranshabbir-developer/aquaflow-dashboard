import { Ban, Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { initialUsers, type WorkspaceUser } from '@/data/demo';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type SearchCol = 'all' | 'name' | 'nick' | 'email' | 'phone';
type UserDraft = Omit<WorkspaceUser, 'id' | 'userType' | 'enabled'>;
const networks = ['infobip', 'telnyx', 'didww'] as const;
const emptyDraft = (): UserDraft => ({ name: '', nick: '', email: '', phone: '', network: '', bulkSms: false, password: '' });

const makePassword = () => {
  const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="contact-field">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

export function UsersPage() {
  const [items, setItems] = useState(initialUsers);
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchCol>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserDraft>(emptyDraft());
  const [formError, setFormError] = useState('');

  const active = items.find((x) => x.id === activeId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => {
      const map = { name: x.name, nick: x.nick, email: x.email, phone: x.phone };
      if (searchBy !== 'all') return map[searchBy].toLowerCase().includes(q);
      return Object.values(map).some((v) => v.toLowerCase().includes(q));
    });
  }, [items, query, searchBy]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pages);
  const start = (safePage - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (user: WorkspaceUser) => {
    setEditingId(user.id);
    setActiveId(user.id);
    setDraft({
      name: user.name,
      nick: user.nick,
      email: user.email,
      phone: user.phone,
      network: user.network,
      bulkSms: user.bulkSms,
      password: user.password,
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError('');
  };

  const saveUser = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.email.trim() || !draft.name.trim() || !draft.phone.trim()) {
      setFormError('Enter email, full name, and phone number.');
      return;
    }
    if (!editingId && !draft.password.trim()) {
      setFormError('Enter or generate a password.');
      return;
    }
    if (editingId) {
      setItems((v) => v.map((x) => (x.id === editingId ? { ...x, ...draft, password: draft.password.trim() || x.password } : x)));
    } else {
      setItems((v) => [{ id: crypto.randomUUID(), userType: 'user', enabled: true, ...draft }, ...v]);
      setPage(1);
    }
    closeForm();
  };

  const clearFilter = () => {
    setQuery('');
    setSearchBy('all');
    setPage(1);
  };

  return (
    <div className="page-pad">
      <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-primary">Directory</p>
          <h2 className="font-display text-lg font-semibold">Workspace users</h2>
        </div>
        <Button className="w-full rounded-full sm:w-auto" onClick={openNew}><Plus /> Add New User</Button>
      </div>

      <div className="users-toolbar">
        <div className="flex min-w-0 w-full items-center gap-2 sm:w-auto">
          <span className="hidden text-sm font-medium sm:inline">Search</span>
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search" className="h-10 w-full max-w-full min-w-0 rounded-full bg-muted/50 sm:h-9 sm:w-[28rem]" />
        </div>
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
          <Select value={searchBy} onValueChange={(v) => { setSearchBy(v as SearchCol); setPage(1); }}>
            <SelectTrigger className="h-10 w-full rounded-full bg-muted/50 sm:h-9 sm:w-[13.5rem]" aria-label="Search column"><SelectValue placeholder="Select Column to Search" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Select Column to Search</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="nick">Nick Name</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Assigned Phone Numbers</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto" onClick={clearFilter}>Clear Filter</Button>
        </div>
      </div>

      <div className="table-scroll overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Pseudo Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Assigned Phone Number</th>
              <th>Network</th>
              <th>Bulk SMS</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((user) => (
              <tr key={user.id} className={user.enabled ? undefined : 'opacity-60'}>
                <td>{user.name}</td>
                <td>{user.nick}</td>
                <td>{user.email}</td>
                <td>{user.userType}</td>
                <td>{user.phone}</td>
                <td>{user.network}</td>
                <td>{user.bulkSms ? 'Enabled' : 'Disabled'}</td>
                <td>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`}>
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setActiveId(user.id); setViewOpen(true); }}>
                        <Eye /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(user)}>
                        <Pencil /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setActiveId(user.id); setDeleteOpen(true); }}>
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setItems((v) => v.map((x) => (x.id === user.id ? { ...x, enabled: !x.enabled } : x)))}>
                        <Ban /> {user.enabled ? 'Disable' : 'Enable'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8} className="py-10 text-center text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm font-medium">
          Show
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-9 w-20 rounded-full bg-muted/50" aria-label="Entries per page"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
            </SelectContent>
          </Select>
          entries
        </label>
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <p className="text-sm text-muted-foreground">
            Results {filtered.length ? start + 1 : 0}-{Math.min(start + pageSize, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="min-w-0 flex-1 rounded-full sm:flex-none" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button type="button" variant="outline" className="min-w-0 flex-1 rounded-full sm:flex-none" disabled={safePage >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => { if (open) setFormOpen(true); else closeForm(); }}>
        <DialogContent className="user-modal">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update this user’s access and assigned number.' : 'Create a workspace user and assign a sending number.'}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={saveUser}>
            <label className="field-label block">Email Address
              <Input type="email" value={draft.email} onChange={(e) => setDraft((v) => ({ ...v, email: e.target.value }))} className="contact-input mt-1.5" />
            </label>
            <label className="field-label block">Password
              <Input type="text" value={draft.password} onChange={(e) => setDraft((v) => ({ ...v, password: e.target.value }))} className="contact-input mt-1.5" placeholder={editingId ? 'Leave blank to keep current' : ''} />
              <button type="button" className="users-edit-link mt-1.5" onClick={() => setDraft((v) => ({ ...v, password: makePassword() }))}>
                Generate password
              </button>
            </label>
            <label className="field-label block">Full Name
              <Input value={draft.name} onChange={(e) => setDraft((v) => ({ ...v, name: e.target.value }))} className="contact-input mt-1.5" />
            </label>
            <label className="field-label block">Pseudo Name
              <Input value={draft.nick} onChange={(e) => setDraft((v) => ({ ...v, nick: e.target.value }))} className="contact-input mt-1.5" />
            </label>
            <label className="field-label block">Assign Phone Number
              <Input value={draft.phone} onChange={(e) => setDraft((v) => ({ ...v, phone: e.target.value }))} className="contact-input mt-1.5" />
            </label>
            <label className="field-label block">Phone Number Network
              <Select value={draft.network || '__none__'} onValueChange={(v) => setDraft((x) => ({ ...x, network: v === '__none__' ? '' : v }))}>
                <SelectTrigger className="contact-input mt-1.5"><SelectValue placeholder="Select Network" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Select Network</SelectItem>
                  {networks.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </label>
            <label className="flex items-center gap-3 pt-1 text-sm font-semibold">
              <Switch checked={draft.bulkSms} onCheckedChange={(on) => setDraft((v) => ({ ...v, bulkSms: on }))} />
              Enable Bulk SMS
            </label>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter>
              <Button type="button" variant="secondary" className="rounded-full" onClick={closeForm}>Close</Button>
              <Button type="submit" className="rounded-full">Save User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="user-modal">
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
            <DialogDescription>Read-only view of this workspace user.</DialogDescription>
          </DialogHeader>
          {active && (
            <div>
              <Field label="Full Name" value={active.name} />
              <Field label="Pseudo Name" value={active.nick} />
              <Field label="Email" value={active.email} />
              <Field label="User Type" value={active.userType} />
              <Field label="Phone Number" value={active.phone} />
              <Field label="Network" value={active.network} />
              <Field label="Bulk SMS" value={active.bulkSms ? 'Enabled' : 'Disabled'} />
              <Field label="Status" value={active.enabled ? 'Enabled' : 'Disabled'} />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="secondary" className="rounded-full" onClick={() => setViewOpen(false)}>Close</Button>
            {active && <Button type="button" className="rounded-full" onClick={() => { setViewOpen(false); openEdit(active); }}>Edit</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this user?"
        description={active ? `${active.name} will be removed from the workspace. This cannot be undone.` : 'This user will be removed from the workspace.'}
        confirmLabel="Delete User"
        onConfirm={() => {
          if (!active) return;
          setItems((v) => v.filter((x) => x.id !== active.id));
          setActiveId(null);
        }}
      />
    </div>
  );
}
