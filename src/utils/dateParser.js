/* eslint-disable */
// ─── Universal Date Parser ────────────────────────────────────────────────────
// Handles virtually any date/time format automatically:
//   3/6/2026 4:21:26 PM       (Excel US format)
//   3/6/2026 13:39            (Excel 24h)
//   06-03-2026 16:21:26       (DD-MM-YYYY)
//   2026-03-06T13:39:00       (ISO)
//   06/03/2026 04:21 PM       (DD/MM/YYYY 12h)
//   March 6, 2026 4:21 PM     (Long form)
//   06 Mar 2026 16:21         (Short month name)
//   and many more...

const MONTHS = {
  jan:0, january:0, feb:1, february:1, mar:2, march:2,
  apr:3, april:3, may:4, jun:5, june:5, jul:6, july:6,
  aug:7, august:7, sep:8, september:8, oct:9, october:9,
  nov:10, november:10, dec:11, december:11
};

function applyAMPM(hr, ap) {
  if (!ap) return hr;
  const upper = ap.toUpperCase();
  if (upper === 'PM' && hr < 12) return hr + 12;
  if (upper === 'AM' && hr === 12) return 0;
  return hr;
}

function tryParsers(str) {
  const s = str.trim();
  if (!s) return null;

  // 1. Native JS (ISO, RFC, etc.)
  const native = new Date(s);
  if (!isNaN(native) && native.getFullYear() > 1970) return native;

  // 2. M/D/YYYY or D/M/YYYY with time (handles Excel default)
  //    3/6/2026 4:21:26 PM  |  03/06/2026 16:21  |  3-6-2026 4:21 PM
  const rx1 = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i;
  const m1 = s.match(rx1);
  if (m1) {
    let [,p1,p2,yr,hr,mn,sc='0',ap] = m1;
    // Heuristic: if p1 > 12 it's day-first; otherwise assume month-first (US Excel default)
    let mo, dy;
    if (parseInt(p1) > 12) { dy = parseInt(p1); mo = parseInt(p2) - 1; }
    else { mo = parseInt(p1) - 1; dy = parseInt(p2); }
    const h = applyAMPM(parseInt(hr), ap);
    const d = new Date(parseInt(yr), mo, dy, h, parseInt(mn), parseInt(sc));
    if (!isNaN(d)) return d;
  }

  // 3. M/D/YYYY or D/M/YYYY date only
  const rx2 = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
  const m2 = s.match(rx2);
  if (m2) {
    let [,p1,p2,yr] = m2;
    let mo, dy;
    if (parseInt(p1) > 12) { dy = parseInt(p1); mo = parseInt(p2) - 1; }
    else { mo = parseInt(p1) - 1; dy = parseInt(p2); }
    const d = new Date(parseInt(yr), mo, dy, 0, 0, 0);
    if (!isNaN(d)) return d;
  }

  // 4. YYYY/MM/DD or YYYY-MM-DD with optional time (ISO-like)
  const rx3 = /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
  const m3 = s.match(rx3);
  if (m3) {
    let [,yr,mo,dy,hr='0',mn='0',sc='0',ap] = m3;
    const h = applyAMPM(parseInt(hr), ap);
    const d = new Date(parseInt(yr), parseInt(mo)-1, parseInt(dy), h, parseInt(mn), parseInt(sc));
    if (!isNaN(d)) return d;
  }

  // 5. DD MMM YYYY or MMM DD YYYY with optional time
  //    06 Mar 2026 16:21  |  March 6 2026 4:21 PM  |  6 March 2026
  const rx4 = /^(\d{1,2})\s+([a-z]+)\s+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
  const m4 = s.match(rx4);
  if (m4) {
    let [,dy,mon,yr,hr='0',mn='0',sc='0',ap] = m4;
    const mo = MONTHS[mon.toLowerCase()];
    if (mo !== undefined) {
      const h = applyAMPM(parseInt(hr), ap);
      const d = new Date(parseInt(yr), mo, parseInt(dy), h, parseInt(mn), parseInt(sc));
      if (!isNaN(d)) return d;
    }
  }

  // 6. MMM DD YYYY or Month DD, YYYY
  const rx5 = /^([a-z]+)\s+(\d{1,2})[,\s]+(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?)?$/i;
  const m5 = s.match(rx5);
  if (m5) {
    let [,mon,dy,yr,hr='0',mn='0',sc='0',ap] = m5;
    const mo = MONTHS[mon.toLowerCase()];
    if (mo !== undefined) {
      const h = applyAMPM(parseInt(hr), ap);
      const d = new Date(parseInt(yr), mo, parseInt(dy), h, parseInt(mn), parseInt(sc));
      if (!isNaN(d)) return d;
    }
  }

  // 7. Unix timestamp (milliseconds or seconds)
  if (/^\d{10}$/.test(s)) return new Date(parseInt(s) * 1000);
  if (/^\d{13}$/.test(s)) return new Date(parseInt(s));

  return null;
}

export function parseAnyDate(str) {
  if (!str || typeof str !== 'string') return null;
  const result = tryParsers(str.trim());
  return result && !isNaN(result) ? result : null;
}

export function formatDisplay(date) {
  if (!date || isNaN(date)) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  }) + ' IST';
}

export function formatShort(date) {
  if (!date || isNaN(date)) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

export function toInputVal(date) {
  if (!date || isNaN(date)) return '';
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Parse a freeform block of text that may contain multiple date pairs (tab/comma/newline separated)
// Returns array of { raw1, raw2, date1, date2 }
export function parseBulkText(text) {
  if (!text.trim()) return [];
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  const results = [];

  for (const line of lines) {
    // Split by tab, comma, pipe, or semicolon
    const parts = line.split(/\t|,|\|;/).map(p => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const d1 = parseAnyDate(parts[0]);
      const d2 = parseAnyDate(parts[1]);
      const label = parts[2] || '';
      results.push({ raw1: parts[0], raw2: parts[1], label, date1: d1, date2: d2 });
    } else if (parts.length === 1) {
      // Maybe a single column — try to find two date-like tokens
      const tokens = parts[0].split(/\s{2,}/);
      if (tokens.length >= 2) {
        const d1 = parseAnyDate(tokens[0]);
        const d2 = parseAnyDate(tokens[1]);
        results.push({ raw1: tokens[0], raw2: tokens[1], label: '', date1: d1, date2: d2 });
      }
    }
  }
  return results;
}
