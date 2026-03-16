import React, { useState, useRef, useEffect } from 'react';
import { parseAnyDate, parseBulkText, formatShort } from '../utils/dateParser';
import { calcBizMinutes, calcCalendarMinutes, fmtDuration, slaStatus, exportToCSV, getTemplateCSV, parseCSVFile } from '../utils/calculations';
import { getSavedRows, saveRows } from '../utils/teamStore';

const ACCENT_MTTD = '#a78bfa';
const ACCENT_MTTR = '#38bdf8';

function computeRow(row, isMTTD) {
  if (!row.t1 || !row.t2 || isNaN(row.t1) || isNaN(row.t2)) return { ...row, result: null, sla: null, error: (!row.t1 || !row.t2) ? null : 'Invalid date' };
  if (row.t2 <= row.t1) return { ...row, result: null, sla: null, error: 'End before start' };
  const mins = isMTTD ? calcCalendarMinutes(row.t1, row.t2) : calcBizMinutes(row.t1, row.t2);
  const result = fmtDuration(mins, !isMTTD);
  const sla = slaStatus(mins, 240);
  return { ...row, result, sla, error: null };
}

export default function BulkCalc({ mode }) {
  const isMTTD = mode === 'mttd';
  const accent = isMTTD ? ACCENT_MTTD : ACCENT_MTTR;
  const fileRef = useRef();
  const wsRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [rows, setRows] = useState(() => getSavedRows(mode));
  const [tab, setTab] = useState('table'); // table | paste

  const computed = rows.map(r => computeRow(r, isMTTD));

  useEffect(() => { saveRows(mode, rows); }, [rows, mode]);

  const setRowField = (id, field, val) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: val };
      if (field === 't1Raw') updated.t1 = parseAnyDate(val);
      if (field === 't2Raw') updated.t2 = parseAnyDate(val);
      return updated;
    }));
  };

  const addRow = () => setRows(prev => [...prev, {
    id: Date.now(), label: `Ticket-${String(prev.length+1).padStart(3,'0')}`,
    t1Raw: '', t2Raw: '', t1: null, t2: null
  }]);

  const delRow = id => setRows(prev => prev.filter(r => r.id !== id));
  const clearAll = () => setRows([]);

  const handleCSV = (text) => {
    const parsed = parseCSVFile(text, mode);
    if (parsed.length) setRows(prev => [...prev, ...parsed]);
  };

  const handleFile = (file) => {
    if (!file) return;
    new FileReader().onload = e => handleCSV(e.target.result);
    const fr = new FileReader();
    fr.onload = e => handleCSV(e.target.result);
    fr.readAsText(file);
  };

  const handleBulkPaste = () => {
    const parsed = parseBulkText(pasteText);
    if (!parsed.length) return;
    const newRows = parsed.map((p, i) => ({
      id: Date.now() + i,
      label: p.label || `Ticket-${String(rows.length + i + 1).padStart(3,'0')}`,
      t1Raw: p.raw1, t2Raw: p.raw2, t1: p.date1, t2: p.date2
    }));
    setRows(prev => [...prev, ...newRows]);
    setPasteText('');
    setPasteOpen(false);
    setTab('table');
  };

  const dlTemplate = () => {
    const csv = getTemplateCSV(mode);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${mode.toUpperCase()}_template.csv`;
    a.click();
  };

  const valid = computed.filter(r => r.result);
  const avgMins = valid.length ? Math.round(valid.reduce((a,r) => a + r.result.total, 0) / valid.length) : 0;
  const avg = valid.length ? fmtDuration(avgMins, !isMTTD) : null;
  const maxRow = valid.length ? valid.reduce((a,r) => r.result.total > a.result.total ? r : a, valid[0]) : null;
  const minRow = valid.length ? valid.reduce((a,r) => r.result.total < a.result.total ? r : a, valid[0]) : null;

  const inputStyle = {
    width: '100%', background: 'transparent', border: 'none',
    color: '#dde6f5', fontFamily: "'DM Mono', monospace",
    fontSize: 11, outline: 'none', padding: 0, minWidth: 0
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button onClick={() => fileRef.current.click()} style={tbtn(accent)}>⬆ Import CSV</button>
        <button onClick={dlTemplate} style={tbtn('#1a1f35', '#4a5578')}>⬇ Template CSV</button>
        <button onClick={() => exportToCSV(computed, mode)} disabled={!valid.length} style={tbtn('#1a1f35', valid.length ? '#4a5578' : '#2a3050')}>📤 Export Results</button>
        <button onClick={() => { setPasteOpen(p => !p); setTab('paste'); }} style={tbtn(pasteOpen ? accent : '#1a1f35', pasteOpen ? '#fff' : '#4a5578')}>📋 Paste Bulk Data</button>
        <button onClick={addRow} style={tbtn(`${accent}20`, accent)}>+ Add Row</button>
        {rows.length > 0 && <button onClick={clearAll} style={tbtn('#1c0505', '#ef4444')}>🗑 Clear All</button>}
        <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragOver ? accent : '#1a1f35'}`, borderRadius: 10,
          padding: '16px', textAlign: 'center', cursor: 'pointer',
          background: dragOver ? `${accent}08` : 'transparent',
          marginBottom: 14, transition: 'all 0.2s', fontSize: 12, color: '#3a4566'
        }}
        onClick={() => fileRef.current.click()}
      >
        <div style={{ fontSize: 20, marginBottom: 4 }}>📂</div>
        Drag & drop CSV here · Supports any date/time format including Excel default
      </div>

      {/* Bulk Paste Panel */}
      {pasteOpen && (
        <div style={{ background: '#0b0e1c', border: `1px solid ${accent}30`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#4a5578', marginBottom: 8, letterSpacing: '0.06em' }}>
            📋 PASTE BULK DATA — One row per line. Columns: Detection/Sent time, Ack/Response time (tab, comma, or pipe separated)
          </div>
          <div style={{ fontSize: 10, color: '#2a3050', marginBottom: 8 }}>
            Accepts any format: "3/6/2026 4:21:26 PM", "06-03-2026 16:21", ISO, 24h, 12h, etc.
          </div>
          <textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder={`Examples:\n3/6/2026 4:21:26 PM\t3/6/2026 5:45:00 PM\nTicket-002,3/7/2026 9:00 AM,3/7/2026 2:30 PM\n2026-03-09T09:00|2026-03-09T17:30`}
            rows={6}
            style={{
              width: '100%', background: '#060912', border: '1px solid #1a1f35',
              borderRadius: 7, padding: '10px 12px', color: '#dde6f5',
              fontSize: 11, fontFamily: "'DM Mono', monospace", outline: 'none', resize: 'vertical'
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handleBulkPaste} disabled={!pasteText.trim()} style={tbtn(accent, '#fff')}>✓ Parse & Add Rows</button>
            <button onClick={() => { setPasteOpen(false); setPasteText(''); }} style={tbtn('#1a1f35', '#4a5578')}>Cancel</button>
            {pasteText && <span style={{ fontSize: 10, color: '#4a5578' }}>{parseBulkText(pasteText).length} rows detected</span>}
          </div>
        </div>
      )}

      {/* Table */}
      {rows.length > 0 ? (
        <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #1a1f35' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#0b0e1c', borderBottom: '1px solid #1a1f35' }}>
                {['#', 'Label', isMTTD ? 'Detection Time' : 'Mail Sent', isMTTD ? 'Ack Time' : 'Response Time', 'Parsed T1', 'Parsed T2', 'Result', 'SLA', ''].map((h,i) => (
                  <th key={i} style={{ padding: '9px 10px', textAlign: 'left', fontSize: 9, color: '#2a3455', letterSpacing: '0.1em', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computed.map((row, idx) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #0f1222', background: idx % 2 === 0 ? '#08090f' : '#060912' }}>
                  <td style={td}><span style={{ color: '#2a3455' }}>{idx+1}</span></td>
                  <td style={td}><input value={row.label} onChange={e => setRowField(row.id, 'label', e.target.value)} style={{ ...inputStyle, width: 100 }} /></td>
                  <td style={td}><input value={row.t1Raw} onChange={e => setRowField(row.id, 't1Raw', e.target.value)} placeholder="paste any format" style={{ ...inputStyle, color: row.t1 ? '#dde6f5' : '#4a5578', width: 160 }} /></td>
                  <td style={td}><input value={row.t2Raw} onChange={e => setRowField(row.id, 't2Raw', e.target.value)} placeholder="paste any format" style={{ ...inputStyle, color: row.t2 ? '#dde6f5' : '#4a5578', width: 160 }} /></td>
                  <td style={td}><span style={{ color: row.t1 ? '#22c55e' : '#2a3455', fontSize: 10 }}>{row.t1 ? formatShort(row.t1) : '—'}</span></td>
                  <td style={td}><span style={{ color: row.t2 ? '#22c55e' : '#2a3455', fontSize: 10 }}>{row.t2 ? formatShort(row.t2) : '—'}</span></td>
                  <td style={td}>
                    {row.result
                      ? <span style={{ color: accent, fontWeight: 600 }}>{row.result.text}</span>
                      : row.error
                      ? <span style={{ color: '#ef4444', fontSize: 10 }}>{row.error}</span>
                      : <span style={{ color: '#2a3455' }}>—</span>}
                  </td>
                  <td style={td}>
                    {row.sla && <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 10, background: row.sla.bg, color: row.sla.color, border: `1px solid ${row.sla.color}30` }}>{row.sla.label}</span>}
                  </td>
                  <td style={{ ...td, width: 30 }}>
                    <button onClick={() => delRow(row.id)} style={{ background: 'none', border: 'none', color: '#2a3455', cursor: 'pointer', fontSize: 14, padding: '0 4px', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color='#ef4444'} onMouseLeave={e => e.target.style.color='#2a3455'}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ border: '1px dashed #1a1f35', borderRadius: 10, padding: 32, textAlign: 'center', color: '#2a3455', fontSize: 12 }}>
          No rows yet — import a CSV, paste bulk data, or add rows manually
        </div>
      )}

      {/* Summary Stats */}
      {avg && valid.length > 0 && (
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: `AVG ${isMTTD ? 'MTTD' : 'MTTR'}`, val: avg.text, sub: `${valid.length} tickets`, c: accent },
            { label: 'FASTEST', val: minRow?.result?.text || '—', sub: minRow?.label, c: '#22c55e' },
            { label: 'SLOWEST', val: maxRow?.result?.text || '—', sub: maxRow?.label, c: '#f59e0b' },
          ].map(({ label, val, sub, c }) => (
            <div key={label} style={{ background: `${c}0a`, border: `1px solid ${c}18`, borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: '#3a4566', letterSpacing: '0.12em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: c }}>{val}</div>
              <div style={{ fontSize: 10, color: '#2a3455', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const td = { padding: '7px 10px', verticalAlign: 'middle' };
const tbtn = (bg, col) => ({
  background: bg, border: `1px solid ${col}40`, color: col,
  padding: '7px 13px', borderRadius: 6, cursor: 'pointer',
  fontSize: 11, letterSpacing: '0.04em', transition: 'all 0.15s',
  fontFamily: "'DM Mono', monospace"
});
