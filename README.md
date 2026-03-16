# ⚡ SLA Console — MTTD & MTTR Automation

A free, production-grade SaaS console to automate SLA response time calculations.
No backend required. Deploys free on Vercel.

## Features

- **MTTD** — Mean Time To Detect: raw calendar time (Detection → Acknowledgement)
- **MTTR** — Mean Time To Respond: business hours only (Mail Sent → Response, Mon–Fri 08:00–20:00 IST)
- **Universal date parser** — accepts any format automatically (Excel, ISO, 12h, 24h, DD-MM-YYYY, etc.)
- **Single entry** — with date picker or paste-any-format input
- **Bulk calculation** — table with inline paste, CSV import/export
- **SLA status** — WITHIN / AT RISK / BREACH badges
- **Team workspace** — export/import JSON to share data between teammates
- **Fully frontend** — runs in the browser, no server needed

## Supported Date Formats

The app automatically detects and converts any of these:
```
3/6/2026 4:21:26 PM          ← Excel US default
3/6/2026 13:39               ← Excel 24h
06-03-2026 16:21:26          ← DD-MM-YYYY
2026-03-06T13:39:00          ← ISO 8601
06/03/2026 04:21 PM          ← DD/MM/YYYY 12h
March 6, 2026 4:21 PM        ← Long month name
06 Mar 2026 16:21            ← Short month name
1741872086                   ← Unix timestamp
```

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Run locally
npm start
# Opens http://localhost:3000
```

## Deploy Free on Vercel (5 minutes)

### Option A — Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd mttd-mttr-console
vercel

# Follow prompts → your app is live at https://your-app.vercel.app
```

### Option B — Via GitHub (recommended)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project
3. Import your GitHub repo
4. Click Deploy — done!

## CSV Template Format

```csv
Label,Detection Time,Acknowledgement Time
Ticket-001,3/6/2026 4:21:26 PM,3/6/2026 5:45:00 PM
Ticket-002,3/7/2026 9:00:00 AM,3/7/2026 2:30:00 PM
```

For MTTR:
```csv
Label,Mail Sent Time,Mail Response Time
Ticket-001,3/6/2026 4:21:26 PM,3/6/2026 5:45:00 PM
```

## Bulk Paste Format

Paste directly into the "Paste Bulk Data" textarea.
Columns separated by: tab, comma, or pipe `|`

```
3/6/2026 4:21:26 PM    3/6/2026 5:45:00 PM
Ticket-002,3/7/2026 9:00 AM,3/7/2026 2:30 PM
2026-03-09T09:00|2026-03-09T17:30
```

## Team / Multi-user

Since this is a pure frontend app:
1. One person enters/imports data
2. Click **👥 Team** → **Export Workspace JSON**
3. Share the JSON file with teammates
4. Teammates click **Import Workspace JSON**
5. All calculation data is preserved

## Project Structure

```
src/
├── App.jsx                    ← Main layout & navigation
├── components/
│   ├── SmartDateInput.jsx     ← Universal date input (paste any format)
│   ├── SingleCalc.jsx         ← Single MTTD/MTTR calculator
│   ├── BulkCalc.jsx           ← Bulk table + CSV import/export
│   └── TeamPanel.jsx          ← Team workspace manager
└── utils/
    ├── dateParser.js          ← Universal date format detector & converter
    ├── calculations.js        ← MTTD/MTTR logic + CSV utilities
    └── teamStore.js           ← localStorage workspace persistence
```

## Business Rules

| Rule | Value |
|------|-------|
| Business days | Monday – Friday |
| Business hours | 08:00 – 20:00 (12h/day) |
| Weekend | Saturday & Sunday — excluded from MTTR |
| MTTD | Raw calendar time (no exclusions) |
| MTTR | Business hours only |
| Timezone | IST (Indian Standard Time) |
