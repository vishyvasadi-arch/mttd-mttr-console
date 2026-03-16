/* eslint-disable */
// ─── Team / Workspace Store ───────────────────────────────────────────────────
// Pure frontend multi-user support via named workspaces stored in localStorage.
// Each team member chooses a workspace name. Data is shared via CSV export/import.

const STORAGE_KEY = 'sla_console_data';
const TEAM_KEY    = 'sla_console_team';

export function getWorkspace() {
  try { return JSON.parse(localStorage.getItem(TEAM_KEY)) || { name: 'Default Team', member: 'Me' }; }
  catch { return { name: 'Default Team', member: 'Me' }; }
}

export function setWorkspace(ws) {
  localStorage.setItem(TEAM_KEY, JSON.stringify(ws));
}

export function getSavedRows(mode) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return (all[mode] || []).map(r => ({
      ...r,
      t1: r.t1 ? new Date(r.t1) : null,
      t2: r.t2 ? new Date(r.t2) : null,
    }));
  } catch { return []; }
}

export function saveRows(mode, rows) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    all[mode] = rows.map(r => ({
      ...r,
      t1: r.t1 ? r.t1.toISOString() : null,
      t2: r.t2 ? r.t2.toISOString() : null,
      result: undefined,
      sla: undefined,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function clearRows(mode) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    all[mode] = [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {}
}

export function exportWorkspace() {
  const data = localStorage.getItem(STORAGE_KEY) || '{}';
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `sla_workspace_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

export function importWorkspace(jsonText) {
  try {
    JSON.parse(jsonText); // validate
    localStorage.setItem(STORAGE_KEY, jsonText);
    return true;
  } catch { return false; }
}
