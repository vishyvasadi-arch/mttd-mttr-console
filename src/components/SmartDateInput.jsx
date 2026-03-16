import React, { useState, useEffect } from 'react';
import { parseAnyDate, formatDisplay, toInputVal } from '../utils/dateParser';
import { isWeekend, DAY_NAMES } from '../utils/calculations';

export default function SmartDateInput({ label, icon, value, onChange, accent = '#6366f1' }) {
  const [mode, setMode] = useState('paste'); // 'paste' | 'picker'
  const [raw, setRaw] = useState('');
  const [pickerVal, setPickerVal] = useState('');
  const parsed = parseAnyDate(raw);
  const isValid = !!parsed;
  const isError = raw.trim() && !isValid;

  useEffect(() => {
    if (value) {
      setRaw(value.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
      setPickerVal(toInputVal(value));
    }
  }, []);

  const handlePasteChange = (v) => {
    setRaw(v);
    const d = parseAnyDate(v);
    onChange(d || null);
    if (d) setPickerVal(toInputVal(d));
  };

  const handlePickerChange = (v) => {
    setPickerVal(v);
    const d = v ? new Date(v) : null;
    onChange(d);
    if (d) setRaw(d.toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }));
  };

  const weekend = isValid && isWeekend(parsed);

  return (
    <div style={{ background: '#0b0e1c', border: `1px solid ${isError ? '#ef444440' : isValid ? accent+'30' : '#1a1f35'}`, borderRadius: 10, padding: '14px 16px', transition: 'border-color 0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#4a5578', letterSpacing: '0.1em', fontWeight: 500 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          {label}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['paste','picker'].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
              background: mode === m ? accent : '#12172a',
              color: mode === m ? '#fff' : '#4a5578',
              fontSize: 10, letterSpacing: '0.06em', fontWeight: mode === m ? 600 : 400,
              transition: 'all 0.15s'
            }}>
              {m === 'paste' ? '✏ PASTE' : '📅 PICKER'}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      {mode === 'paste' ? (
        <input
          type="text"
          value={raw}
          onChange={e => handlePasteChange(e.target.value)}
          placeholder='Paste any format: 3/6/2026 4:21:26 PM, 06-03-2026 16:21, ISO...'
          style={{
            width: '100%', background: '#060912', border: `1px solid ${isError ? '#ef444440' : '#1a1f35'}`,
            borderRadius: 7, padding: '9px 12px', color: '#dde6f5',
            fontSize: 12, outline: 'none', transition: 'border-color 0.2s'
          }}
        />
      ) : (
        <input
          type="datetime-local"
          value={pickerVal}
          onChange={e => handlePickerChange(e.target.value)}
          style={{
            width: '100%', background: '#060912', border: '1px solid #1a1f35',
            borderRadius: 7, padding: '9px 12px', color: '#dde6f5',
            fontSize: 12, outline: 'none', colorScheme: 'dark'
          }}
        />
      )}

      {/* Status row */}
      <div style={{ marginTop: 7, minHeight: 18, fontSize: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
        {isError && (
          <span style={{ color: '#ef4444' }}>⚠ Cannot parse — try another format</span>
        )}
        {isValid && (
          <>
            <span style={{ color: weekend ? '#f59e0b' : '#22c55e' }}>
              {weekend ? '⚠' : '✓'} {DAY_NAMES[parsed.getDay()]} {weekend ? '(Weekend)' : '(Weekday)'}
            </span>
            <span style={{ color: '#2a3050' }}>·</span>
            <span style={{ color: '#3a4566', fontSize: 10 }}>{formatDisplay(parsed)}</span>
          </>
        )}
      </div>
    </div>
  );
}
