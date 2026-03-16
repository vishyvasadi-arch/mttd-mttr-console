/* eslint-disable */
// ─── Business Hours Constants ─────────────────────────────────────────────────
export const BIZ_START = 8;   // 8:00 AM
export const BIZ_END   = 20;  // 8:00 PM
export const BIZ_HRS_PER_DAY = BIZ_END - BIZ_START; // 12

export const isWeekend = d => d.getDay() === 0 || d.getDay() === 6;

export const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function nextBizDayStart(date) {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(BIZ_START, 0, 0, 0);
  while (isWeekend(d)) d.setDate(d.getDate() + 1);
  return d;
}

// MTTR: business-hours-only minutes between two dates
export function calcBizMinutes(start, end) {
  if (!start || !end || isNaN(start) || isNaN(end) || end <= start) return 0;
  let cur = new Date(start);
  let total = 0;

  // Advance past weekends
  while (isWeekend(cur)) cur = nextBizDayStart(cur);

  // Clamp start to business window
  const startH = cur.getHours() + cur.getMinutes() / 60;
  if (startH < BIZ_START) cur.setHours(BIZ_START, 0, 0, 0);
  else if (startH >= BIZ_END) { cur = nextBizDayStart(cur); }

  for (let guard = 0; guard < 10000; guard++) {
    if (isWeekend(cur)) { cur = nextBizDayStart(cur); continue; }
    if (cur >= end) break;

    const sameDay = cur.toDateString() === end.toDateString();
    if (sameDay) {
      const sH = cur.getHours() + cur.getMinutes() / 60 + cur.getSeconds() / 3600;
      const eH = Math.min(end.getHours() + end.getMinutes() / 60 + end.getSeconds() / 3600, BIZ_END);
      total += Math.max(0, eH - sH) * 60;
      break;
    } else {
      const sH = cur.getHours() + cur.getMinutes() / 60 + cur.getSeconds() / 3600;
      total += Math.max(0, BIZ_END - sH) * 60;
      cur = nextBizDayStart(cur);
    }
  }
  return Math.round(total);
}

// MTTD: raw calendar minutes between two dates
export function calcCalendarMinutes(start, end) {
  if (!start || !end || isNaN(start) || isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / 60000);
}

// Format minutes into readable duration
export function fmtDuration(mins, bizOnly = false) {
  if (mins <= 0) return { text: '0m', d: 0, h: 0, m: 0, total: 0 };
  const hpd = bizOnly ? BIZ_HRS_PER_DAY : 24;
  const d = Math.floor(mins / (hpd * 60));
  const rem = mins % (hpd * 60);
  const h = Math.floor(rem / 60);
  const m = rem % 60;
  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0 || parts.length === 0) parts.push(`${m}m`);
  return { text: parts.join(' '), d, h, m, total: mins };
}

// SLA status badge
export function slaStatus(mins, thresholdMins = 240) {
  if (mins <= 0) return null;
  const pct = mins / thresholdMins;
  if (pct <= 0.5) return { label: 'WITHIN SLA', color: '#22c55e', bg: '#052e16' };
  if (pct <= 1.0) return { label: 'AT RISK', color: '#f59e0b', bg: '#1c1002' };
  return { label: 'SLA BREACH', color: '#ef4444', bg: '#1c0505' };
}

// ─── CSV Utilities ────────────────────────────────────────────────────────────
export function exportToCSV(rows, mode) {
  const isMTTD = mode === 'mttd';
  const metric = isMTTD ? 'MTTD' : 'MTTR';
  const h1 = isMTTD ? 'Detection Time' : 'Mail Sent Time';
  const h2 = isMTTD ? 'Acknowledgement Time' : 'Mail Response Time';

  const headers = ['#', 'Label', h1, h2, metric, 'Business Minutes', 'SLA Status'];
  const lines = rows
    .filter(r => r.result)
    .map((r, i) => [
      i + 1,
      r.label || `Row ${i+1}`,
      r.t1 ? r.t1.toLocaleString('en-IN') : '—',
      r.t2 ? r.t2.toLocaleString('en-IN') : '—',
      r.result.text,
      r.result.total,
      r.sla ? r.sla.label : ''
    ].map(v => `"${v}"`).join(','));

  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${metric}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

export function getTemplateCSV(mode) {
  const isMTTD = mode === 'mttd';
  const h1 = isMTTD ? 'Detection Time' : 'Mail Sent Time';
  const h2 = isMTTD ? 'Acknowledgement Time' : 'Mail Response Time';
  const rows = [
    `Label,${h1},${h2}`,
    `Ticket-001,3/6/2026 4:21:26 PM,3/6/2026 5:45:00 PM`,
    `Ticket-002,3/7/2026 9:00:00 AM,3/7/2026 2:30:00 PM`,
    `Ticket-003,06-03-2026 08:15:00,06-03-2026 11:45:00`,
    `Ticket-004,2026-03-09T09:00:00,2026-03-09T17:30:00`,
  ].join('\n');
  return rows;
}

export function parseCSVFile(text, mode) {
  const isMTTD = mode === 'mttd';
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g,''));
  const findCol = (...keys) => {
    for (const k of keys) {
      const i = headers.findIndex(h => h.includes(k));
      if (i >= 0) return i;
    }
    return -1;
  };

  const t1i = isMTTD ? findCol('detect','detection','start','t1') : findCol('sent','mail sent','start','t1');
  const t2i = isMTTD ? findCol('ack','acknowledge','response','end','t2') : findCol('resp','response','end','t2');
  const li  = findCol('label','ticket','id','name','ref','#');

  // Auto-detect columns if headers not found
  const col1 = t1i >= 0 ? t1i : 1;
  const col2 = t2i >= 0 ? t2i : 2;
  const colL = li  >= 0 ? li  : 0;

  const { parseAnyDate } = require('./dateParser');
  return lines.slice(1).map((line, i) => {
    const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g,''));
    if (cols.every(c => !c)) return null;
    return {
      id: Date.now() + i,
      label: cols[colL] || `Row ${i+1}`,
      t1Raw: cols[col1] || '',
      t2Raw: cols[col2] || '',
      t1: parseAnyDate(cols[col1]),
      t2: parseAnyDate(cols[col2]),
    };
  }).filter(Boolean);
}
