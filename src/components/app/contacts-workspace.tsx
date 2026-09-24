import { ChevronLeft, Pencil, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { initialContacts, type Contact } from '@/data/demo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { avatarStyle, cn } from '@/lib/utils';

type SearchField = 'firstName' | 'lastName' | 'company' | 'phone';
type ContactDraft = Omit<Contact, 'id'>;
const PAGE = 7;
const emptyDraft = (): ContactDraft => ({ firstName: '', lastName: '', company: '', title: '', phone: '' });
const digits = (value: string) => value.replace(/\D/g, '');
const displayName = (c: Pick<Contact, 'firstName' | 'lastName' | 'company' | 'phone'>) =>
  [c.firstName, c.lastName].filter(Boolean).join(' ') || c.company || c.phone;
const initials = (c: Pick<Contact, 'firstName' | 'lastName' | 'company'>) => {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
  if (name) return name.split(' ').map((x) => x[0]).join('').slice(0, 2).toUpperCase();
  return (c.company || 'C').slice(0, 3).toUpperCase();
};

const SAMPLE_XLS = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Contacts">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">First Name</Data></Cell>
    <Cell><Data ss:Type="String">Last Name</Data></Cell>
    <Cell><Data ss:Type="String">Company Name</Data></Cell>
    <Cell><Data ss:Type="String">Title</Data></Cell>
    <Cell><Data ss:Type="String">Phone Number</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">Jane</Data></Cell>
    <Cell><Data ss:Type="String">Doe</Data></Cell>
    <Cell><Data ss:Type="String">IPS</Data></Cell>
    <Cell><Data ss:Type="String">Coordinator</Data></Cell>
    <Cell><Data ss:Type="String">18885550123</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

const headerKey = (value: string): keyof ContactDraft | undefined => {
  const key = value.toLowerCase().replace(/[^a-z]/g, '');
  if (['firstname', 'first'].includes(key)) return 'firstName';
  if (['lastname', 'last'].includes(key)) return 'lastName';
  if (['companyname', 'company'].includes(key)) return 'company';
  if (key === 'title') return 'title';
  if (['phonenumber', 'phone', 'mobile'].includes(key)) return 'phone';
  return undefined;
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function rowsFromCsv(text: string) {
  return text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => {
      const cells: string[] = [];
      let cur = '';
      let quoted = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (quoted && line[i + 1] === '"') {
            cur += '"';
            i++;
          } else quoted = !quoted;
        } else if ((ch === ',' || ch === '\t') && !quoted) {
          cells.push(cur.trim());
          cur = '';
        } else cur += ch;
      }
      cells.push(cur.trim());
      return cells;
    })
    .filter((row) => row.some((cell) => cell));
}

function rowsFromXml(text: string) {
  return [...text.matchAll(/<Row\b[^>]*>([\s\S]*?)<\/Row>/gi)].map((row) =>
    [...(row[1] ?? '').matchAll(/<Data\b[^>]*>([\s\S]*?)<\/Data>/gi)].map((cell) => decodeXml(cell[1] ?? '')),
  );
}

function draftsFromRows(rows: string[][]): ContactDraft[] {
  const headerRow = rows[0];
  if (!headerRow) return [];
  const mapped = headerRow.map(headerKey);
  const hasHeaders = mapped.some(Boolean);
  const data = hasHeaders ? rows.slice(1) : rows;
  const keys = hasHeaders ? mapped : (['firstName', 'lastName', 'company', 'title', 'phone'] as const);
  return data
    .map((row) => {
      const draft = emptyDraft();
      keys.forEach((key, i) => {
        if (key && row[i]) draft[key] = row[i];
      });
      return draft;
    })
    .filter((row) => digits(row.phone) || displayName(row));
}

async function parseImportFile(file: File) {
  const text = await file.text();
  if (text.startsWith('PK')) throw new Error('xlsx');
  const rows = /<Workbook[\s>]|<Row[\s>]/.test(text) ? rowsFromXml(text) : rowsFromCsv(text);
  return draftsFromRows(rows);
}

function downloadSample() {
  const blob = new Blob([SAMPLE_XLS], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'contacts_sample.xls';
  a.click();
  URL.revokeObjectURL(url);
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="contact-field">
      <span>{label}</span>
      <strong>{value || '—'}</strong>
    </div>
  );
}

export function ContactsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Contact[]>(initialContacts);
  const [selected, setSelected] = useState(initialContacts[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [searchBy, setSearchBy] = useState<SearchField>('firstName');
  const [visible, setVisible] = useState(PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft());
  const [formError, setFormError] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState('');
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = digits(query);
    if (!q) return items;
    return items.filter((c) => {
      if (searchBy === 'phone') return qDigits ? digits(c.phone).includes(qDigits) : c.phone.toLowerCase().includes(q);
      return c[searchBy].toLowerCase().includes(q);
    });
  }, [items, query, searchBy]);

  const shown = filtered.slice(0, visible);
  const active = items.find((x) => x.id === selected);

  const openNew = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = () => {
    if (!active) return;
    setEditingId(active.id);
    setDraft({
      firstName: active.firstName,
      lastName: active.lastName,
      company: active.company,
      title: active.title,
      phone: active.phone,
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

  const saveContact = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.phone.trim()) {
      setFormError('Enter a phone number to continue.');
      return;
    }
    if (editingId) {
      setItems((v) => v.map((x) => (x.id === editingId ? { ...x, ...draft } : x)));
    } else {
      const next: Contact = { id: crypto.randomUUID(), ...draft };
      setItems((v) => [next, ...v]);
      setSelected(next.id);
    }
    closeForm();
  };

  const removeContact = () => {
    if (!active) return;
    const next = items.filter((x) => x.id !== active.id);
    setItems(next);
    setSelected(next[0]?.id ?? '');
  };

  const clearSearch = () => {
    setQuery('');
    setVisible(PAGE);
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportFile(null);
    setImportError('');
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    setImportFile(e.target.files?.[0] ?? null);
    setImportError('');
  };

  const importContacts = async () => {
    if (!importFile) {
      setImportError('Choose a file to import.');
      return;
    }
    setImporting(true);
    try {
      const rows = await parseImportFile(importFile);
      if (!rows.length) {
        setImportError('No contacts found in that file.');
        return;
      }
      setItems((current) => {
        const next = [...current];
        rows.forEach((row) => {
          const phone = digits(row.phone);
          const match = phone ? next.findIndex((x) => digits(x.phone) === phone) : -1;
          const existing = match >= 0 ? next[match] : undefined;
          if (existing) next[match] = { ...existing, ...row };
          else next.unshift({ id: crypto.randomUUID(), ...row });
        });
        return next;
      });
      closeImport();
    } catch {
      setImportError('That file could not be read. Use the sample file format.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-workspace">
      <div className="contacts-toolbar">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <Input
            aria-label={`Search by ${searchBy === 'firstName' ? 'first name' : searchBy === 'lastName' ? 'last name' : searchBy === 'company' ? 'company name' : 'phone number'}`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE);
            }}
            placeholder="Search"
            className="h-9 min-w-[8rem] flex-1 rounded-full bg-muted/50"
            onKeyDown={(e) => {
              if (e.key === 'Enter') setVisible(PAGE);
            }}
          />
          <Select value={searchBy} onValueChange={(v) => setSearchBy(v as SearchField)}>
            <SelectTrigger className="h-9 w-[9.75rem] shrink-0 rounded-full bg-muted/50" aria-label="Search contacts by">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="firstName">First Name</SelectItem>
              <SelectItem value="lastName">Last Name</SelectItem>
              <SelectItem value="company">Company Name</SelectItem>
              <SelectItem value="phone">Phone Number</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" size="icon" variant="ghost" aria-label="Search contacts">
            <Search size={16} />
          </Button>
          <Button type="button" size="icon" variant="ghost" aria-label="Clear search" onClick={clearSearch}>
            <Trash2 size={16} />
          </Button>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" size="icon" variant="outline" className="rounded-full" aria-label="Import contacts" onClick={() => { setImportError(''); setImportOpen(true); }}>
            <UserPlus />
          </Button>
          <Button type="button" className="rounded-full" onClick={openNew}>
            <Plus /> New Contact
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
        <section className={cn('flex min-h-0 min-w-0 flex-col border-border bg-surface md:border-r', active ? 'hidden md:flex' : 'flex')}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {shown.length ? shown.map((c) => (
              <button
                key={c.id}
                type="button"
                className={cn('contact-row', c.id === selected && 'contact-row-active')}
                onClick={() => setSelected(c.id)}
              >
                <span className="contact-avatar" style={avatarStyle(displayName(c) + c.phone)}>{initials(c)}</span>
                <span className="min-w-0 flex-1 text-left">
                  <strong className="block truncate text-sm">{displayName(c)}</strong>
                  <small className="block truncate text-xs text-muted-foreground">{c.phone}</small>
                </span>
              </button>
            )) : (
              <div className="grid h-48 place-items-center px-4 text-center">
                <div>
                  <Search className="mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">No contacts found</p>
                  <p className="text-xs text-muted-foreground">Try another name, company, or phone number.</p>
                </div>
              </div>
            )}
          </div>
          {visible < filtered.length && (
            <button type="button" className="contacts-more" onClick={() => setVisible((n) => n + PAGE)}>
              Load More
            </button>
          )}
        </section>

        {active ? (
          <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-workspace">
            <div className="contact-detail">
              <div className="mb-5 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelected('')} aria-label="Back to contacts">
                  <ChevronLeft />
                </Button>
                <span className="contact-avatar contact-avatar-lg" style={avatarStyle(displayName(active) + active.phone)}>{initials(active)}</span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold">Contact Information</h3>
                  <p className="truncate text-xs text-muted-foreground">{displayName(active)}</p>
                </div>
              </div>
              <Field label="First Name" value={active.firstName} />
              <Field label="Last Name" value={active.lastName} />
              <Field label="Company Name" value={active.company} />
              <Field label="Title" value={active.title} />
              <Field label="Phone Number" value={active.phone} />
              <div className="mt-6 flex flex-wrap gap-2">
                <Button type="button" className="rounded-full" onClick={openEdit}>
                  <Pencil /> Edit Contact Info
                </Button>
                <Button type="button" variant="destructive" className="rounded-full" onClick={removeContact}>
                  <Trash2 /> Delete Contact
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section className="hidden place-items-center bg-workspace md:grid">
            <div className="text-center">
              <div className="contact-avatar contact-avatar-lg mx-auto mb-3" style={avatarStyle('Contacts')}>C</div>
              <h3 className="font-display text-lg font-semibold">Select a contact</h3>
              <p className="mt-1 text-sm text-muted-foreground">Choose a number to view and edit details.</p>
            </div>
          </section>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => { if (open) setFormOpen(true); else closeForm(); }}>
        <DialogContent className="contact-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="contact-modal-icon"><UserPlus size={16} /></span>
              {editingId ? 'Edit Contact' : 'New Contact'}
            </DialogTitle>
            <DialogDescription>
              {editingId ? 'Update the existing contact details and save.' : 'Add a person to your workspace directory.'}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={saveContact}>
            <Input placeholder="First Name" value={draft.firstName} onChange={(e) => setDraft((v) => ({ ...v, firstName: e.target.value }))} className="contact-input" />
            <Input placeholder="Last Name" value={draft.lastName} onChange={(e) => setDraft((v) => ({ ...v, lastName: e.target.value }))} className="contact-input" />
            <Input placeholder="Company Name" value={draft.company} onChange={(e) => setDraft((v) => ({ ...v, company: e.target.value }))} className="contact-input" />
            <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft((v) => ({ ...v, title: e.target.value }))} className="contact-input" />
            <Input placeholder="Phone Number" value={draft.phone} onChange={(e) => setDraft((v) => ({ ...v, phone: e.target.value }))} className="contact-input" />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <DialogFooter className="pt-1">
              <Button type="button" variant="secondary" className="rounded-full" onClick={closeForm}>Close</Button>
              <Button type="submit" className="rounded-full">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={importOpen} onOpenChange={(open) => { if (open) setImportOpen(true); else closeImport(); }}>
        <DialogContent className="contact-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="contact-modal-icon"><UserPlus size={16} /></span>
              Import Contacts
            </DialogTitle>
            <DialogDescription>Upload a spreadsheet, or download the sample file first.</DialogDescription>
          </DialogHeader>
          <label className="contact-file">
            <input ref={fileRef} type="file" accept=".xls,.xlsx,.csv,.txt" onChange={pickFile} />
          </label>
          {importFile && <p className="truncate text-xs text-muted-foreground">{importFile.name}</p>}
          {importError && <p className="text-sm text-destructive">{importError}</p>}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="button" variant="secondary" className="rounded-full" onClick={closeImport}>Close</Button>
            <Button type="button" className="rounded-full" onClick={importContacts} disabled={importing}>
              {importing ? 'Importing…' : 'Import Contact'}
            </Button>
            <Button type="button" variant="outline" className="rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background" onClick={downloadSample}>
              Download Sample File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
