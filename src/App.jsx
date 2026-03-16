import React, { useState } from 'react';
import SingleCalc from './components/SingleCalc';
import BulkCalc from './components/BulkCalc';
import TeamPanel from './components/TeamPanel';
import { getWorkspace } from './utils/teamStore';

const TABS = [
  { key: 'single-mttd', metric: 'mttd', mode: 'single', label: 'MTTD · Single',   icon: '🔍', accent: '#a78bfa' },
  { key: 'bulk-mttd',   metric: 'mttd', mode: 'bulk',   label: 'MTTD · Bulk',     icon: '📊', accent: '#a78bfa' },
  { key: 'single-mttr', metric: 'mttr', mode: 'single', label: 'MTTR · Single',   icon: '📤', accent: '#38bdf8' },
  { key: 'bulk-mttr',   metric: 'mttr', mode: 'bulk',   label: 'MTTR · Bulk',     icon: '📈', accent: '#38bdf8' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('single-mttd');
  const [showTeam, setShowTeam] = useState(false);
  const ws = getWorkspace();
  const tab = TABS.find(t => t.key === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: '#060912', display: 'flex', flexDirection: 'column' }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header style={{ background: '#08091a', borderBottom: '1px solid #111628', padding: '0 28px', display: 'flex', alignItems: 'center', height: 56, gap: 20, position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #a78bfa 0%, #38bdf8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1 }}>SLA Console</div>
            <div style={{ fontSize: 9, color: '#2a3455', letterSpacing: '0.1em', marginTop: 1 }}>MTTD & MTTR AUTOMATION</div>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '6px 14px', border: 'none', borderRadius: 6, cursor: 'pointer',
              background: activeTab === t.key ? `${t.accent}18` : 'transparent',
              color: activeTab === t.key ? t.accent : '#3a4566',
              fontSize: 11, letterSpacing: '0.04em', fontFamily: "'DM Mono', monospace",
              fontWeight: activeTab === t.key ? 600 : 400,
              borderBottom: activeTab === t.key ? `2px solid ${t.accent}` : '2px solid transparent',
              borderRadius: 0, whiteSpace: 'nowrap', transition: 'all 0.15s'
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: '#2a3455', textAlign: 'right' }}>
            <div style={{ color: '#4a5578' }}>{ws.member}</div>
            <div>{ws.name}</div>
          </div>
          <button onClick={() => setShowTeam(true)} style={{
            padding: '6px 12px', background: '#111628', border: '1px solid #1a1f35',
            borderRadius: 6, color: '#4a5578', fontSize: 11, cursor: 'pointer',
            fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em'
          }}>👥 Team</button>
        </div>
      </header>

      {/* ── Info Banner ──────────────────────────────────────────────────── */}
      <div style={{ background: '#08091a', borderBottom: '1px solid #0f1222', padding: '6px 28px', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'MTTD', desc: 'Calendar time · Detection → Acknowledgement · Includes all hours & weekends', c: '#a78bfa' },
          { label: 'MTTR', desc: 'Business hours only · Mail Sent → Response · Mon–Fri 08:00–20:00 IST', c: '#38bdf8' },
          { label: 'DATE FORMATS', desc: 'Accepts any format: Excel, ISO, DD-MM-YYYY, 12h/24h, Month names, Unix timestamps', c: '#34d399' },
        ].map(({ label, desc, c }) => (
          <div key={label} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 10 }}>
            <span style={{ color: c, fontWeight: 600 }}>{label}</span>
            <span style={{ color: '#2a3455' }}>·</span>
            <span style={{ color: '#2a3455' }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '24px 28px', maxWidth: 1100, width: '100%', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 3, height: 28, background: `linear-gradient(180deg, ${tab.accent}, ${tab.accent}40)`, borderRadius: 2 }} />
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: tab.accent }}>{tab.label}</div>
            <div style={{ fontSize: 10, color: '#2a3455', marginTop: 2, letterSpacing: '0.08em' }}>
              {tab.metric === 'mttd' ? 'Mean Time To Detect · Calendar time measurement' : 'Mean Time To Respond · Business hours only (08:00–20:00, Mon–Fri)'}
            </div>
          </div>
        </div>

        {/* Panel */}
        <div style={{ background: '#0a0c18', border: '1px solid #111628', borderRadius: 14, padding: '22px' }}>
          {tab.mode === 'single'
            ? <SingleCalc mode={tab.metric} key={tab.key} />
            : <BulkCalc mode={tab.metric} key={tab.key} />}
        </div>

        {/* Format Reference */}
        <div style={{ marginTop: 16, background: '#08091a', border: '1px solid #0f1222', borderRadius: 10, padding: '14px 18px' }}>
          <div style={{ fontSize: 9, color: '#2a3455', letterSpacing: '0.12em', marginBottom: 8 }}>SUPPORTED DATE/TIME FORMATS</div>
          <div style={{ display: 'flex', gap: '6px 20px', flexWrap: 'wrap' }}>
            {[
              '3/6/2026 4:21:26 PM',
              '3/6/2026 13:39',
              '06-03-2026 16:21:26',
              '2026-03-06T13:39:00',
              '06/03/2026 04:21 PM',
              'March 6, 2026 4:21 PM',
              '06 Mar 2026 16:21',
              '1741872086 (unix)',
            ].map(f => (
              <code key={f} style={{ fontSize: 10, color: '#34d39980', background: '#05120d', border: '1px solid #052e1640', borderRadius: 4, padding: '2px 7px' }}>{f}</code>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #0f1222', padding: '10px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, color: '#1a2035' }}>
        <span>SLA Console · MTTD & MTTR Automation · IST Timezone</span>
        <span>Business Hours: Mon–Fri 08:00–20:00 · Weekends excluded from MTTR</span>
      </footer>

      {showTeam && <TeamPanel onClose={() => setShowTeam(false)} />}
    </div>
  );
}
