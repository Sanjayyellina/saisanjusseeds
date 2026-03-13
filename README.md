# Yellina Seeds — Operations Platform

**Yellina Seeds Private Limited**  
Sathupally, Khammam Dist – 507303  
GSTIN: 36AABCY8231F1ZB

A corn dryer operations management platform for tracking intake, bin moisture, shelling, and dispatch with tamper-proof receipt generation.

---

## Quick Start

1. Unzip the project folder
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox)
3. No server or internet required for core functionality (fonts load from Google if online)

> **Note:** To use the live database (PocketBase/Supabase), a backend URL must be configured — see the *Database* section below.

---

## Project Structure

```
yellina-project/
│
├── index.html              ← Main entry point — open this in browser
│
├── css/
│   ├── variables.css       ← Design tokens, CSS variables, reset styles
│   ├── layout.css          ← Topbar, sidebar, main content shell
│   └── components.css      ← All UI components (cards, tables, modals, forms…)
│
├── js/
│   ├── state.js            ← Application state (bins, intakes, dispatches)
│   ├── seed.js             ← Demo/seed data based on real challans
│   ├── crypto.js           ← Receipt hash generation & tamper verification
│   ├── utils.js            ← Date helpers, toast notifications, formatters
│   ├── selects.js          ← Populate dropdown selects in modals
│   ├── binTile.js          ← Render a single bin tile (used by multiple pages)
│   ├── render.js           ← Render all page views (dashboard, intake, bins…)
│   ├── actions.js          ← Event handlers (save intake, update bin, moisture…)
│   ├── receipt.js          ← Dispatch receipt generation & verify page
│   ├── clock.js            ← Live clock in topbar
│   └── init.js             ← Boot sequence, DOMContentLoaded
│
├── pages/                  ← HTML fragments (for reference / future server-side use)
│   ├── topbar.html
│   ├── sidebar.html
│   ├── dashboard.html
│   ├── intake.html
│   ├── bins.html
│   ├── moisture.html
│   ├── dispatch.html
│   ├── receipts.html
│   ├── verify.html
│   ├── analytics.html
│   ├── modals.html
│   ├── config.html
│   ├── login.html
│   └── toast.html
│
└── assets/                 ← Place images, icons, logos here
```

---

## Pages & Features

| Page | Description |
|------|-------------|
| **Dashboard** | KPI overview — total intake, ready bins, drying bins, dispatches |
| **Intake Register** | Log incoming corn deliveries with challan, vehicle, lot, moisture |
| **Bin Monitor** | Visual grid of all 20 bins with status and moisture colour coding |
| **Moisture Log** | Update daily moisture readings and airflow direction per bin |
| **Dispatch** | Issue a new dispatch, generate a tamper-proof receipt with QR code |
| **Receipts Archive** | Browse all issued receipts with cryptographic hash |
| **Verify Receipt** | Paste a Receipt ID or hash to confirm authentic / tampered |
| **Analytics** | Charts for moisture trends, intake volumes, status breakdown |

---

## Dryer Process Flow

```
Truck arrives
    → Weighed on platform scale
    → Challan recorded in Intake Register
    → Corn loaded into a Bin (1–20)
    → Entry moisture recorded (typically 30–40%)
    → Hot air circulated (airflow Up/Down toggled daily)
    → Moisture logged daily in Moisture Log
    → Target: 9–11% (typically 5–7 days)
    → When ready → Dispatch page → Receipt issued to driver
```

---

## Bin Status Colours

| Colour | Status | Meaning |
|--------|--------|---------|
| 🔵 Blue | Intake | Corn just loaded, drying not started |
| 🟡 Amber | Drying | Active drying in progress |
| 🟢 Green | Ready | Moisture at target, ready to dispatch |
| 🟣 Purple | Shelling | Currently on the sheller/conveyor |
| ⬜ Grey | Empty | Bin is available |

---

## Receipt Security

Each dispatch receipt is cryptographically signed using three chained hash algorithms (DJB2, FNV-1a, Murmur3). Receipt IDs follow the format `YDS-2026-XXXXXX`.

- Receipts cannot be altered without invalidating the hash
- QR code encodes `YELLINA|receiptId|date|hash`
- Use the **Verify Receipt** page to check any receipt instantly

---

## Database (Optional — Go Live)

By default the app runs with in-memory demo data. To persist data across sessions:

### Option A — PocketBase (Recommended, ~₹500/month on Railway)
1. Deploy PocketBase on [Railway](https://railway.app)
2. In `js/state.js`, find `const PB_URL` and replace `'YOUR_RAILWAY_URL'` with your actual URL
3. Create collections in PocketBase admin (`/_/`): `bins`, `intakes`, `dispatches`, `moisture_logs`
4. See `SETUP_GUIDE.md` (in original delivery) for step-by-step instructions

### Option B — Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. When you open the app, a config screen will appear — enter your Project URL and Anon Key
3. Schema is in `yellina-schema.sql` (in original delivery)

---

## Customisation

### Change PIN (if PIN features are added)
Edit the constant in `js/actions.js`:
```js
const MANAGER_PIN = '1234'; // change this
```

### Add a new Bin Status
1. Add the status option in `js/render.js` → `renderMoisturePage()` select
2. Add colour mapping in `js/binTile.js`
3. Add chip/badge in `css/components.css`

### Change Company Details
Edit the sidebar footer in `index.html` — search for `Yellina Seeds Pvt. Ltd.`

### Add a New Page
1. Create `pages/yourpage.html` with `<div id="page-yourpage" class="page">…</div>`
2. Add a `<div id="include-yourpage"></div>` in `index.html`
3. Add nav item in `index.html` sidebar: `onclick="showPage('yourpage',this)"`
4. Add render function in `js/render.js`
5. Register it in the `renderPage` map in `js/render.js`

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Edge 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Mobile Chrome | ✅ Works (sidebar collapses) |

---

## Technology Stack

- **Vanilla HTML/CSS/JavaScript** — no build tools, no npm, no frameworks
- **QRCode.js** — QR code generation for receipts
- **Supabase JS SDK** — optional live database
- **Google Fonts** — Playfair Display, DM Sans, DM Mono
- **PocketBase** — recommended backend (optional)

---

## File Sizes

| File | Size | Purpose |
|------|------|---------|
| `index.html` | ~180 KB | Main app (HTML pages inline) |
| `js/state.js` | ~72 KB | App state + base64 logo |
| `js/render.js` | ~19 KB | All page rendering |
| `css/components.css` | ~23 KB | UI components |
| `css/layout.css` | ~7 KB | Layout shell |
| `css/variables.css` | ~2 KB | Design tokens |

---

## Contact & Support

Yellina Seeds Private Limited  
Sathupally, Khammam Dist – 507303, Telangana  
GSTIN: 36AABCY8231F1ZB

---

*Platform built for internal operations use. All receipt hashes are for internal verification only and have no legal standing.*
