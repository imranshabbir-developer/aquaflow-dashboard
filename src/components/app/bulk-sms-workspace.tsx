import { Download, Upload } from 'lucide-react';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SmsStatus = 'success' | 'failed' | 'pending' | 'network';
type BulkRow = { id: string; phone: string; message: string; status: SmsStatus; reason: string };
type Tab = 'all' | SmsStatus;

const reminder = (name: string, time: string) =>
  `Dear ${name}, we hope you are doing great. This is a gentle reminder regarding your appointment today, Thursday, 09/24/2026 with Dr. Radha Syed at ${time} EST. If you want to reschedule your appointment, please call us at 718-351-1350. We look forward to seeing you! Regards, Practice Admin Dr. Radha Syed.`;

const initialRows: BulkRow[] = [
  { id: 'b1', phone: '13476456983', message: reminder('Barbara', '12:00 PM'), status: 'success', reason: '—' },
  { id: 'b2', phone: '19178290301', message: reminder('Jenna', '4:30 PM'), status: 'success', reason: '—' },
  { id: 'b3', phone: '17187966074', message: reminder('Sao', '12:30 PM'), status: 'success', reason: '—' },
  { id: 'b4', phone: '18477726136', message: reminder('Saima', '12:30 PM'), status: 'success', reason: '—' },
  { id: 'b5', phone: '12033610223', message: reminder('Diya', '12:00 PM'), status: 'success', reason: '—' },
  { id: 'b6', phone: '18184292763', message: reminder('Macy', '3:00 PM'), status: 'pending', reason: '—' },
  { id: 'b7', phone: '19096710123', message: reminder('Aaron', '2:15 PM'), status: 'failed', reason: 'Carrier rejected the message.' },
  { id: 'b8', phone: '18886984554', message: reminder('Nora', '1:00 PM'), status: 'network', reason: 'Network timeout from the provider.' },
];

const SAMPLE_XLS = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Bulk SMS">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Mobile Number</Data></Cell>
    <Cell><Data ss:Type="String">Message Body</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">13476456983</Data></Cell>
    <Cell><Data ss:Type="String">Dear Barbara, we hope you are doing great. This is a gentle reminder regarding your appointment today.</Data></Cell>
   </Row>
   <Row>
    <Cell><Data ss:Type="String">19178290301</Data></Cell>
    <Cell><Data ss:Type="String">Dear Jenna, we hope you are doing great. This is a gentle reminder regarding your appointment today.</Data></Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

const digits = (value: string) => value.replace(/\D/g, '');

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
}

function rowsFromCsv(text: string) {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => {
    const cells: string[] = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
        else quoted = !quoted;
      } else if ((ch === ',' || ch === '\t') && !quoted) { cells.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cells.push(cur.trim());
    return cells;
  }).filter((row) => row.some((cell) => cell));
}

function rowsFromXml(text: string) {
  return [...text.matchAll(/<Row\b[^>]*>([\s\S]*?)<\/Row>/gi)].map((row) =>
    [...(row[1] ?? '').matchAll(/<Data\b[^>]*>([\s\S]*?)<\/Data>/gi)].map((cell) => decodeXml(cell[1] ?? '')),
  );
}

function classify(phone: string, message: string): BulkRow {
  const number = digits(phone);
  if (!number || !message.trim()) return { id: crypto.randomUUID(), phone: number || phone, message, status: 'failed', reason: 'Mobile Number and Message Body are required.' };
  if (number.length !== 11) return { id: crypto.randomUUID(), phone: number, message, status: 'failed', reason: 'Number must contain exactly 11 digits after removing + and spaces.' };
  if (number.startsWith('199')) return { id: crypto.randomUUID(), phone: number, message, status: 'network', reason: 'Network error from the SMS provider.' };
  return { id: crypto.randomUUID(), phone: number, message, status: 'success', reason: '—' };
}

async function parseUpload(file: File) {
  const text = await file.text();
  if (text.startsWith('PK')) throw new Error('xlsx');
  const table = /<Workbook[\s>]|<Row[\s>]/.test(text) ? rowsFromXml(text) : rowsFromCsv(text);
  const header = table[0] ?? [];
  const keys = header.map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  const phoneIdx = Math.max(0, keys.findIndex((k) => ['mobilenumber', 'phone', 'phonenumber', 'mobile'].includes(k)));
  const msgIdx = keys.findIndex((k) => ['messagebody', 'message', 'body'].includes(k));
  const data = table.slice(header.some(Boolean) ? 1 : 0);
  return data.map((row) => classify(row[phoneIdx] ?? '', row[msgIdx >= 0 ? msgIdx : 1] ?? '')).filter((row) => row.phone || row.message);
}

function downloadSample() {
  const blob = new Blob([SAMPLE_XLS], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'bulk_sms_sample.xls';
  a.click();
  URL.revokeObjectURL(url);
}

const statusLabel: Record<SmsStatus, string> = {
  success: 'Success',
  failed: 'Failed',
  pending: 'Pending',
  network: 'Network Error',
};

const tabColors: Record<Tab, { idle: { background: string; color: string }; on: { background: string; color: string } }> = {
  all: {
    idle: { background: '#dbeafe', color: '#1d4ed8' },
    on: { background: 'linear-gradient(165deg, #2563eb, #0ea5e9)', color: '#fff' },
  },
  success: {
    idle: { background: '#d1fae5', color: '#047857' },
    on: { background: 'linear-gradient(165deg, #10b981, #059669)', color: '#fff' },
  },
  failed: {
    idle: { background: '#fee2e2', color: '#b91c1c' },
    on: { background: 'linear-gradient(165deg, #ef4444, #dc2626)', color: '#fff' },
  },
  pending: {
    idle: { background: '#fef3c7', color: '#b45309' },
    on: { background: 'linear-gradient(165deg, #f59e0b, #d97706)', color: '#fff' },
  },
  network: {
    idle: { background: '#ede9fe', color: '#6d28d9' },
    on: { background: 'linear-gradient(165deg, #8b5cf6, #6d28d9)', color: '#fff' },
  },
};

function StatusPill({ status }: { status: SmsStatus }) {
  return <span className={cn('bulk-status', `bulk-status-${status}`)}>{statusLabel[status]}</span>;
}

function StatusCard({ label, value, note, tone }: { label: string; value: number; note: string; tone: string }) {
  return (
    <div className={cn('bulk-stat', tone)}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-2xl font-semibold sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs opacity-80">{note}</p>
    </div>
  );
}

export function BulkSmsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [latest, setLatest] = useState('SMS-Upload-09-23-2026 - 09-29-2026.xlsx');
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<Tab>('all');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const counts = useMemo(() => ({
    all: rows.length,
    success: rows.filter((r) => r.status === 'success').length,
    failed: rows.filter((r) => r.status === 'failed').length,
    pending: rows.filter((r) => r.status === 'pending').length,
    network: rows.filter((r) => r.status === 'network').length,
  }), [rows]);

  const shown = tab === 'all' ? rows : rows.filter((r) => r.status === tab);

  const pickFile = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setError('');
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Choose an Excel file to upload.');
      return;
    }
    setUploading(true);
    try {
      const next = await parseUpload(file);
      if (!next.length) {
        setError('No Mobile Number / Message Body rows were found.');
        return;
      }
      setRows(next);
      setLatest(file.name);
      setTab('all');
      setError('');
    } catch {
      setError('That file could not be read. Download the sample file and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-pad space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatusCard label="All" value={counts.all} note="Messages in this upload" tone="bulk-stat-all" />
        <StatusCard label="Success" value={counts.success} note="Delivered to the carrier" tone="bulk-stat-success" />
        <StatusCard label="Failed" value={counts.failed} note="Rejected or invalid" tone="bulk-stat-failed" />
        <StatusCard label="Pending" value={counts.pending} note="Waiting for delivery" tone="bulk-stat-pending" />
        <StatusCard label="Network Error" value={counts.network} note="Provider or connectivity" tone="bulk-stat-network" />
      </div>

      <section className="bulk-hero">
        <h2 className="font-display text-xl font-semibold">Bulk SMS Excel Upload</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Use the columns <strong>Mobile Number</strong> and <strong>Message Body</strong>. Each number must contain exactly 11 digits after removing + and spaces.
        </p>
        <label className="contact-file mt-5 max-w-xl">
          <input ref={fileRef} type="file" accept=".xls,.xlsx,.csv,.txt" onChange={pickFile} />
        </label>
        {file && <p className="mt-2 break-all text-xs text-muted-foreground">{file.name}</p>}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button className="w-full rounded-full sm:w-auto" onClick={uploadFile} disabled={uploading}>
            <Upload /> {uploading ? 'Uploading…' : 'Upload File'}
          </Button>
          <Button type="button" variant="outline" className="w-full rounded-full sm:w-auto" onClick={downloadSample}>
            <Download /> Download Sample File
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card shadow-soft">
        <div className="flex flex-col items-stretch justify-between gap-3 border-b border-border px-3 py-4 sm:flex-row sm:items-center sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Latest Upload</p>
            <h3 className="font-display text-base font-semibold break-all sm:truncate">{latest}</h3>
          </div>
          <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible">
            {([
              ['all', 'All', counts.all],
              ['success', 'Success', counts.success],
              ['failed', 'Failed', counts.failed],
              ['pending', 'Pending', counts.pending],
              ['network', 'Network Error', counts.network],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                className="bulk-tab shrink-0"
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  ...(tab === key ? tabColors[key].on : tabColors[key].idle),
                }}
                onClick={() => setTab(key)}
              >
                {label} · {count}
              </button>
            ))}
          </div>
        </div>
        <div className="table-scroll overflow-x-auto">
          <table className="users-table">
            <thead>
              <tr>
                <th>Mobile Number</th>
                <th>Message Body</th>
                <th>Status</th>
                <th>Failure Reason</th>
              </tr>
            </thead>
            <tbody>
              {shown.length ? shown.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap font-semibold">{row.phone}</td>
                  <td className="min-w-[16rem] max-w-[20rem] whitespace-normal sm:max-w-xl">{row.message}</td>
                  <td><StatusPill status={row.status} /></td>
                  <td>{row.reason}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">No messages in this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
