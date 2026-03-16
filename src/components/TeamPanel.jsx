import React, { useState } from 'react';
import { getWorkspace, setWorkspace, exportWorkspace, importWorkspace } from '../utils/teamStore';

export default function TeamPanel({ onClose }) {
  const [ws, setWs] = useState(getWorkspace());
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState('');
  const fileRef = React.useRef();

  const save = () => {
    setWorkspace(ws);
    setMsg('✓ Workspace settings saved');
    setTimeout(() => setMsg(''), 2000);
  };

  const handleImportFile = (file) => {
    const fr = new FileReader();
    fr.onload = e => {
      const ok = importWorkspace(e.target.result);
      setMsg(ok ? '✓ Workspace imported — refresh to see data' : '✗ Invalid workspace file');
      setTimeout(() => setMsg(''), 3000);
    };
    fr.readAsText(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#060912cc', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0b0e1c', border: '1px solid #1a1f35', borderRadius: 14, padding: '28px', width: 480, maxWidth: '95vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700 }}>Team Workspace</div>
            <div style={{ fontSize: 10, color: '#3a4566', marginTop: 2, letterSpacing: '0.08em' }}>LOCAL STORAGE · SHARE VIA JSON EXPORT</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a5578', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 10, color: '#3a4566', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>TEAM / PROJECT NAME</label>
            <input value={ws.name} onChange={e => setWs(p => ({ ...p, name: e.target.value }))}
              style={inp} placeholder="e.g. Ops Team · Q1 2026" />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#3a4566', letterSpacing: '0.1em', display: 'block', marginBottom: 6 }}>YOUR NAME / MEMBER ID</label>
            <input value={ws.member} onChange={e => setWs(p => ({ ...p, member: e.target.value }))}
              style={inp} placeholder="e.g. Priya · Analyst" />
          </div>

          <button onClick={save} style={{ ...abtn('#6366f120', '#6366f1'), marginTop: 4 }}>💾 Save Settings</button>

          <div style={{ borderTop: '1px solid #1a1f35', paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 11, color: '#3a4566', marginBottom: 10, letterSpacing: '0.06em' }}>SHARE WORKSPACE DATA</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={exportWorkspace} style={abtn('#0f172a', '#38bdf8')}>⬆ Export Workspace JSON</button>
              <button onClick={() => fileRef.current.click()} style={abtn('#0f172a', '#a78bfa')}>⬇ Import Workspace JSON</button>
              <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={e => handleImportFile(e.target.files[0])} />
            </div>
            <div style={{ fontSize: 10, color: '#2a3455', marginTop: 10 }}>
              💡 To share with teammates: Export JSON → Send file → They import it. All calculation data is preserved.
            </div>
          </div>

          {msg && <div style={{ padding: '8px 12px', background: msg.startsWith('✓') ? '#052e16' : '#1c0505', border: `1px solid ${msg.startsWith('✓') ? '#22c55e30' : '#ef444430'}`, borderRadius: 7, fontSize: 12, color: msg.startsWith('✓') ? '#22c55e' : '#ef4444' }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}

const inp = {
  width: '100%', background: '#060912', border: '1px solid #1a1f35',
  borderRadius: 7, padding: '9px 12px', color: '#dde6f5',
  fontFamily: "'DM Mono', monospace", fontSize: 12, outline: 'none'
};

const abtn = (bg, col) => ({
  background: bg, border: `1px solid ${col}40`, color: col,
  padding: '8px 14px', borderRadius: 7, cursor: 'pointer',
  fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '0.04em',
  transition: 'all 0.15s', flex: 1
});
