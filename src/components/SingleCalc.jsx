/* eslint-disable */
import React, { useState } from 'react';
import SmartDateInput from './SmartDateInput';
import { calcBizMinutes, calcCalendarMinutes, fmtDuration, slaStatus, BIZ_HRS_PER_DAY } from '../utils/calculations';

function ResultCard({ result, label, accent, sub, sla }) {
  if (!result) return null;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}0d 0%, #060912 80%)`,
      border: `1px solid ${accent}25`, borderRadius: 12,
      padding: '22px 26px', textAlign: 'center', marginTop: 16
    }}>
      {sla && (
        <div style={{ display: 'inline-block', background: sla.bg, border: `1px solid ${sla.color}40`, borderRadius: 20, padding: '3px 12px', fontSize: 10, color: sla.color, letterSpacing: '0.1em', marginBottom: 10 }}>
          {sla.label}
        </div>
      )}
      <div style={{ fontSize: 10, color: '#3a4566', letterSpacing: '0.15em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 50, fontWeight: 800, color: accent, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {result.text}
      </div>
      <div style={{ fontSize: 11, color: '#2a3050', marginTop: 8 }}>{result.total} total minutes · {sub}</div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
        {result.d > 0 && <Chip v={result.d} u={`day${result.d > 1 ? 's' : ''}`} c={accent} />}
        {result.h > 0 && <Chip v={result.h} u={`hr${result.h > 1 ? 's' : ''}`} c={accent} />}
        {result.m > 0 && <Chip v={result.m} u="min" c={accent} />}
      </div>
    </div>
  );
}

function Chip({ v, u, c }) {
  return (
    <div style={{ background: `${c}12`, border: `1px solid ${c}22`, borderRadius: 6, padding: '5px 12px', fontSize: 12 }}>
      <span style={{ color: c, fontWeight: 700 }}>{v}</span>
      <span style={{ color: '#3a4566' }}> {u}</span>
    </div>
  );
}

export default function SingleCalc({ mode }) {
  const isMTTD = mode === 'mttd';
  const accent = isMTTD ? '#a78bfa' : '#38bdf8';
  const [t1, setT1] = useState(null);
  const [t2, setT2] = useState(null);
  const [slaThr, setSlaThr] = useState(240);

  const valid = t1 && t2 && !isNaN(t1) && !isNaN(t2) && t2 > t1;
  const mins = valid ? (isMTTD ? calcCalendarMinutes(t1, t2) : calcBizMinutes(t1, t2)) : 0;
  const result = valid ? fmtDuration(mins, !isMTTD) : null;
  const sla = result ? slaStatus(mins, slaThr) : null;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <SmartDateInput
          label={isMTTD ? 'DETECTION TIME (IST)' : 'MAIL SENT TIME (IST)'}
          icon={isMTTD ? '🔍' : '📤'}
          value={t1}
          onChange={setT1}
          accent={accent}
        />
        <SmartDateInput
          label={isMTTD ? 'ACKNOWLEDGEMENT TIME (IST)' : 'MAIL RESPONSE TIME (IST)'}
          icon={isMTTD ? '✅' : '📥'}
          value={t2}
          onChange={setT2}
          accent={accent}
        />
      </div>

      {/* SLA threshold */}
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: '#3a4566' }}>
        <span>SLA threshold:</span>
        <input
          type="number"
          value={slaThr}
          onChange={e => setSlaThr(parseInt(e.target.value) || 240)}
          style={{ width: 80, background: '#0b0e1c', border: '1px solid #1a1f35', borderRadius: 5, padding: '4px 8px', color: accent, fontSize: 11, outline: 'none' }}
        />
        <span>minutes</span>
      </div>

      {t2 && t1 && t2 <= t1 && (
        <div style={{ marginTop: 10, padding: '8px 12px', background: '#1c0505', border: '1px solid #ef444430', borderRadius: 7, fontSize: 11, color: '#ef4444' }}>
          ⚠ End time must be after start time
        </div>
      )}

      <ResultCard
        result={result}
        label={`${isMTTD ? 'MTTD' : 'MTTR'} — ${isMTTD ? 'CALENDAR TIME' : 'BUSINESS HOURS ONLY'}`}
        accent={accent}
        sub={isMTTD ? 'includes nights & weekends' : `Mon–Fri ${8}:00–${20}:00 only`}
        sla={sla}
      />
    </div>
  );
}
