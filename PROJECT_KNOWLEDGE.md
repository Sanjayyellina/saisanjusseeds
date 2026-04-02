# Yellina Seeds Operations Platform — Complete Project Knowledge Base
> **For humans and LLMs.** This file is the single source of truth for the entire project.
> Last updated: 2 April 2026 | App: https://www.yellinaseeds.com | Repo: https://github.com/Sanjayyellina/saisanjusseeds.git

---

## TABLE OF CONTENTS
1. [Business Context](#1-business-context)
2. [What the App Does](#2-what-the-app-does)
3. [Tech Stack](#3-tech-stack)
4. [File Structure](#4-file-structure)
5. [Database Schema — Every Table, Every Column](#5-database-schema)
6. [Feature Inventory — Every Page, Every Function](#6-feature-inventory)
7. [Complete Change History](#7-complete-change-history)
8. [Key Patterns and Conventions](#8-key-patterns-and-conventions)
9. [Known Bugs and Limitations](#9-known-bugs-and-limitations)
10. [Configuration Constants](#10-configuration-constants)
11. [Deployment & Versioning](#11-deployment--versioning)
12. [Planned Upgrades Roadmap](#12-planned-upgrades-roadmap)

---

## 1. BUSINESS CONTEXT

**Company:** Yellina Seeds Pvt. Ltd.
**Location:** Sathupally, Khammam District – 507303, Telangana, India
**GSTIN:** 36AABCY8231F1ZB
**Phone:** +91 99494 84078
**Email:** yellinamurali@gmail.com

**What they do:** Yellina Seeds is a **corn seed drying and processing facility**. Farmers bring in freshly harvested corn (maize) loaded in trucks. The corn is dried in large drying chambers (called "bins") using hot air from boilers. Once moisture drops to ~10%, the dried seed is shelled, bagged, and dispatched to seed companies (customers).

**The physical facility:**
- 20 drying bins/chambers (some have A/B sub-chambers — bins 1, 10, 11, 20)
- 2 boilers (each with a Honeywell temperature controller display)
- 1 pressure gauge
- Weighbridge on-site (trucks weighed on arrival and departure)
- Backyard storage area for rejected/damaged stock

**The business flow:**
```
Farmer/Supplier truck arrives
  → Weighed at weighbridge (1st weight = tare/empty)
  → Corn loaded into bins
  → Bins dry corn over ~109 hours at ~42°C
  → Workers take moisture meter samples daily
  → When moisture ≤ 10%, bin is moved to Shelling
  → Shelled seeds bagged
  → Customer truck arrives → Weighed (2nd weight = gross/loaded)
  → Dispatch receipt/invoice generated → seeds leave
```

**Key people:**
- **Sanjay Yellina** — owner/developer, built the platform himself with Claude's help
- Field workers — log intake photos, moisture readings, boiler temps via WhatsApp (now via the app's Field Updates tab)
- Managers — use the full dashboard and dispatch functionality

---

## 2. WHAT THE APP DOES

A **single-page Progressive Web App (PWA)** that replaces paper logs and WhatsApp-based operations updates.

### Pages / Tabs

| Page | Route key | Purpose |
|---|---|---|
| Dashboard | `dashboard` | Live overview — bin statuses, KPI cards, FIFO dispatch queue, alerts, recent intakes |
| Intake Register | `intake` | Log incoming corn loads: vehicle, weight, DR number, bins allocated, hybrid, lot, moisture |
| Bin Monitor | `bins` | All 20 bins as visual tiles — moisture, status, airflow, hybrid, days in dryer |
| Entry Trucks | `entry-trucks` | Register arriving trucks, track status (waiting → intake → completed) |
| Backyard | `backyard` | Log damaged/rejected stock removed from bins |
| Dispatch & Finance | `dispatch` | Create dispatch records, generate cryptographically signed receipts |
| Receipts | `receipts` | View/search/verify all past dispatch receipts (QR code + hash verification) |
| Analytics | `analytics` | Charts: daily intake bar, hybrid donut, moisture curves, bin cycle tracker, intelligence centre |
| Maintenance Log | `maintenance` | Log equipment maintenance, assign priority/status, attach photos |
| Labor & Shifts | `labor` | Log daily labor shifts with headcount, wages, photos; manage labor groups |
| Field Updates | `updates` | Employees submit: moisture meter photos, boiler temp photos, intake photos, weigh slips — all with Tesseract.js OCR |
| Verify Receipt | receipts page | Public-facing receipt verification by ID or hash |
| Manager Access | `manager` | PIN-protected admin: bulk moisture entry, airflow controls, season summary, PIN management |

---

## 3. TECH STACK

| Layer | Technology | Notes |
|---|---|---|
| Frontend | **Vanilla JS (ES6+)** | No React/Vue/Angular. Intentional choice for simplicity + offline reliability |
| Database | **Supabase (PostgreSQL)** | Project ID: `gnujlntvcdwtwdnsgobj`, Region: `us-east-1` |
| Auth | **Supabase Auth** | Email/password. 8-hour inactivity timeout. Force re-login on each visit was removed — now session persists until inactivity timeout |
| Hosting | **Vercel** | Auto-deploy from GitHub `main` branch. Live at yellinaseeds.com in ~90 seconds |
| Offline | **Service Worker** | Cache-first strategy. `CACHE_VERSION` currently `v98`. `ignoreSearch: true` for `?v=N` cache busting |
| OCR | **Tesseract.js v4** | Browser-based, no server needed. Used for moisture meter displays, boiler controllers, weighbridge slips |
| Storage | **Supabase Storage** | Buckets: `field-updates` (field update photos), `maint-images` (maintenance + labor photos under `labor/` prefix) |
| PDF/Print | **window.print()** | Dispatch invoice and Driver Slip open in a new window with embedded print CSS |
| Excel Export | **SheetJS (xlsx)** | All tables exportable to .xlsx |
| QR Codes | **QRCodeJS** | On dispatch receipts for verification |
| CSS | **Custom Properties** | Design tokens in `variables.css`. Brand color: `#F5A623` (gold). No Tailwind, no Bootstrap |
| Security | **SHA-256** (Web Crypto API) | Manager PIN hashed before storage. Receipt hash uses DJB2+FNV1a (NOT cryptographic — display only) |

### Infrastructure topology
```
Browser (PWA)
  ↕ HTTPS
Vercel CDN (static files: HTML, CSS, JS, assets)
  ↕ Supabase JS SDK (REST + WebSocket)
Supabase (PostgreSQL + Auth + Storage + RLS)
```

---

## 4. FILE STRUCTURE

```
/
├── index.html                  ← ENTIRE app UI. Single HTML file. All modals, pages, nav inline.
├── manifest.json               ← PWA manifest. Name, icons, theme #F5A623
├── service-worker.js           ← Cache-first SW. CACHE_VERSION = 'v98'. Caches all static assets.
├── assets/
│   ├── logo.jpg                ← Yellina Seeds two-leaf logo (used in topbar, receipts, driver slips)
│   ├── icon.jpg                ← App icon (192x512 same file — known issue)
│   ├── wallpaper3.jpg          ← Crystal leaf background image (861KB JPEG, compressed from 6.7MB PNG)
│   └── favicon.png             ← Browser tab favicon
├── css/
│   ├── variables.css  (v22)    ← Design tokens. ALL CSS custom properties defined here.
│   ├── layout.css     (v10)    ← Topbar, sidebar, avatar, user menu, offline bar, sync badge
│   └── components.css (v10)    ← Cards, buttons, modals, tables, chips, forms, bin tiles
├── js/
│   ├── config.js      (v1)     ← App constants (TARGET_HRS:109, TARGET_MOISTURE:10, etc.)
│   ├── state.js       (v3)     ← window.state global object + Store pub/sub wrapper
│   ├── db.js          (v15)    ← ALL Supabase queries + auth + storage functions
│   ├── init.js        (v20)    ← initApp(), bootApp(), SW registration, session management
│   ├── render.js      (v34)    ← renderPage() dispatcher + all page render functions
│   ├── actions.js     (v38)    ← All form handlers, modal open/close, OCR, save functions
│   ├── receipt.js     (v8)     ← Receipt building, printing, driver slip, global search, verify
│   ├── selects.js     (v4)     ← Dropdown population helpers (bins, trucks, intakes)
│   ├── binTile.js     (v19)    ← Bin card HTML generator (used in bin monitor + dashboard)
│   ├── i18n.js        (v7)     ← Translations: en/hi/te. changeLanguage() function.
│   ├── utils.js       (v5)     ← toast(), debounce(), formatters, escapeHtml()
│   ├── clock.js       (v2)     ← Live HH:MM:SS clock in topbar
│   ├── crypto.js               ← Receipt hash/signature (DJB2+FNV1a — NOT real crypto)
│   ├── error-boundary.js       ← Global window.onerror + unhandledrejection handler
│   ├── offline-queue.js (v2)   ← Full offline write queue using localStorage. Auto-syncs on reconnect.
│   └── seed.js                 ← Dead code. Demo seed data. Not used.
└── pages/                      ← Dead code. Old modular HTML fragments. NOT used.
```

---

## 5. DATABASE SCHEMA

**Supabase project:** `gnujlntvcdwtwdnsgobj` (YellinaSeeds, us-east-1)
**RLS:** ON for all tables. All tables require authenticated user.

---

### Table: `bins`
The 20 physical drying chambers.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | 1–24 (bins 1, 10, 11, 20 have A/B sub-bins → 24 rows total) |
| bin_label | text | Display label e.g. "1A", "10B", "7" |
| status | text | `empty` \| `drying` \| `shelling` |
| hybrid | text | Corn hybrid variety e.g. "YS-07" |
| company | text | Company that owns the load |
| lot | text | Lot number |
| qty | numeric | Quantity in Kg |
| pkts | integer | Number of bags/packets |
| entry_moisture | numeric | Moisture % when intake was done |
| current_moisture | numeric | Latest moisture reading |
| target_moisture | numeric | Target discharge moisture (default 10) |
| airflow | text | `up` (top→bottom) or `down` (bottom→top) |
| intake_date_ts | text | Unix ms timestamp stored as STRING (known legacy issue) |
| intake_ref | text | References an intake record |
| capacity_kg | numeric | Max bin capacity in Kg |
| sort_order | integer | Display sort order |
| updated_by | text | Email of last updater |
| updated_at | timestamptz | When last updated |

---

### Table: `intakes`
Incoming corn delivery records.

| Column | Type | Notes |
|---|---|---|
| id | text PK | Format: `INT-{timestamp}` |
| challan | text | DR (Delivery Receipt) number from supplier |
| date | text | Display date (DD/MM/YYYY) |
| date_ts | bigint | Unix ms timestamp for sorting |
| vehicle | text | Comma-separated vehicle numbers |
| vehicle_weight | text | Comma-separated tare weights |
| gross_weight | text | Comma-separated gross weights |
| hybrid | text | Corn hybrid variety |
| company | text | Supplier company name (free text) |
| lot | text | Comma-separated lot numbers |
| qty | numeric | Total quantity in Kg |
| pkts | integer | Total bags |
| entry_moisture | numeric | Moisture % at intake |
| lr | text | LR (Lorry Receipt) numbers |
| location | text | Origin location |
| remarks | text | Free text notes |
| truck_id | bigint | FK → entry_trucks.id (optional) |
| created_at | timestamptz | |

---

### Table: `intake_allocations`
Junction table — which bins an intake was split across.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| intake_id | text | FK → intakes.id |
| bin_id | bigint | FK → bins.id (indexed) |
| qty | numeric | Kg allocated to this bin |
| pkts | integer | Bags allocated to this bin |

---

### Table: `dispatches`
Outbound shipment records + signed receipts.

| Column | Type | Notes |
|---|---|---|
| receipt_id | text PK | Format: `YDS-{YEAR}-{6-digit counter}` e.g. `YDS-2026-001001` |
| party | text | Buyer/customer company name |
| address | text | Buyer address |
| vehicle | text | Truck vehicle number |
| lr | text | LR number |
| hybrid | text | Seed hybrid dispatched |
| lot | text | Lot numbers |
| bin_id | bigint | First bin (legacy, for backward compat) |
| bins | **jsonb** | Array of `{binId, bags, qty}` — DO NOT use JSON.stringify |
| bags | integer | Number of bags dispatched |
| qty | numeric | Quantity in Kg |
| moisture | numeric | Final moisture % |
| amount | numeric | Invoice amount in ₹ |
| driver_name | text | Truck driver name |
| driver_phone | text | Driver phone number |
| remarks | text | Notes |
| hash | text | DJB2/FNV1a receipt integrity hash |
| signature | text | Receipt signature string |
| season_year | integer | Year of the season |
| created_at | timestamptz | |

---

### Table: `maintenance_logs`
Equipment maintenance records.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| date | date | Date of maintenance |
| reported_by | text | Worker who reported |
| equipment_name | text | Machine/equipment |
| issue_description | text | What was wrong |
| work_done | text | What was fixed |
| checked_by | text | Who verified |
| items_bought | text | Parts/materials purchased |
| cost_amount | numeric | Cost in ₹ |
| status | text | `open` \| `in_progress` \| `closed` |
| priority | text | `low` \| `medium` \| `high` |
| image_urls | jsonb | Array of Supabase Storage URLs |
| created_at | timestamptz | |
| updated_at | timestamptz | |

---

### Table: `labor_logs`
Daily shift records.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| date | date | Shift date |
| shift | text | Shift timing description e.g. "Morning 6–2" |
| role | text | Format: `{GroupName} · {WorkArea}` e.g. "Team A · Shelling" |
| headcount | integer | Number of workers |
| people_names | text | Comma/newline list of worker names |
| notes | text | Remarks |
| wage_per_day | numeric | Per-person wage in ₹ |
| total_wages | numeric | Calculated total wages |
| labor_group_id | bigint | FK → labor_groups.id |
| image_urls | **jsonb** | Array of photo URLs (added Apr 2026) |
| created_at | timestamptz | |

---

### Table: `labor_groups`
Named teams of workers.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | text | Group name e.g. "Team A", "Shelling Crew" |
| members | jsonb | Array of member name strings |
| sort_order | integer | Display sort order |
| created_at | timestamptz | |

---

### Table: `entry_trucks`
Trucks that arrive at the facility (for intake).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| vehicle_no | text | Vehicle number (uppercase) |
| company | text | Carrier/transport company (NOT the cargo company) |
| from_location | text | Origin location |
| driver_name | text | Driver name |
| driver_phone | text | Driver phone |
| gross_weight | numeric | Loaded weight in Kg |
| tare_weight | numeric | Empty weight in Kg |
| net_weight | numeric | Gross − Tare |
| status | text | `waiting` \| `weighed` \| `intake` \| `completed` |
| arrival_time | timestamptz | When truck arrived |
| lot_numbers | jsonb | Array of lot number strings |
| notes | text | |
| intake_id | text | FK → intakes.id (set after intake is done) |
| created_at | timestamptz | |

---

### Table: `backyard_removals`
Stock removed from bins/backyard (damaged, quality issues, etc.)

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| intake_id | text | FK → intakes.id (optional) |
| bin_id | bigint | FK → bins.id (optional) |
| vehicle_no | text | |
| hybrid | text | |
| qty_removed | numeric | Kg removed |
| bags_removed | integer | |
| reason | text | `damaged` \| `quality` \| `pest` \| `excess` \| `moisture` \| `other` |
| removed_by | text | Worker name |
| notes | text | |
| created_at | timestamptz | |

---

### Table: `bin_history`
Snapshot of a bin's cycle when it's cleared (status → empty).

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| bin_id | bigint | FK → bins.id |
| hybrid | text | |
| company | text | |
| lot | text | |
| qty | numeric | Kg at emptying |
| pkts | integer | Bags |
| entry_moisture | numeric | % on intake |
| final_moisture | numeric | % when emptied |
| days_in_bin | integer | Days from fill to empty |
| intake_ref | text | FK → intakes.id |
| filled_at | timestamptz | When intake was done |
| emptied_at | timestamptz | When bin was cleared |

---

### Table: `moisture_readings`
Time-series moisture log for each bin.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| bin_id | bigint | FK → bins.id (indexed) |
| moisture | numeric | % reading |
| recorded_by | text | Who recorded it |
| recorded_at | timestamptz | |

---

### Table: `field_updates`
All employee updates (photos, readings, slips) submitted via the Field Updates tab.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| update_type | text | `moisture_photo` \| `boiler_temp` \| `intake_photo` \| `bin_note` \| `weigh_slip` \| `backyard` \| `general` |
| bin_id | bigint | FK → bins.id (optional) |
| photo_url | text | Supabase Storage URL (field-updates bucket) |
| ocr_text | text | Raw text extracted by Tesseract.js |
| notes | text | Manual notes |
| submitted_by | text | User email |
| moisture_value | numeric | Parsed moisture % |
| temperature_value | numeric | Boiler temp 1 (°C) |
| boiler_temp_1 | numeric | Boiler B1 temp (°C) |
| boiler_temp_2 | numeric | Boiler B2 temp (°C) |
| pressure_value | numeric | Boiler pressure reading |
| pressure_unit | text | `kg/cm²` \| `PSI` etc. |
| hybrid | text | Seed variety referenced |
| qty_bags | numeric | Bags count |
| ticket_no | text | Weighbridge ticket number |
| material_direction | text | `INWARD` \| `OUTWARD` |
| vehicle_no | text | Vehicle number |
| company_name | text | Material owner company (NOT transport company) |
| tare_weight | numeric | 1st weight (empty truck) in Kg |
| gross_weight_slip | numeric | 2nd weight (loaded truck) in Kg |
| net_weight_slip | numeric | Calculated net weight |
| bags_count | integer | Number of bags on slip |
| weigh_date | date | Date on weighbridge slip |
| created_at | timestamptz | |

---

### Table: `plant_settings`
Key-value store for facility-level settings.

| Column | Type | Notes |
|---|---|---|
| key | text PK | Setting name |
| value | text | Setting value |

**Current keys:**
- `boiler_1_temp` — Boiler B1 temperature (°C)
- `boiler_2_temp` — Boiler B2 temperature (°C)
- `boiler_temp` — Legacy single boiler temp
- `boiler_pressure` — Pressure reading
- `boiler_pressure_unit` — Unit string (default: `kg/cm²`)
- `manager_pin_hash` — SHA-256 hash of manager PIN

---

### Table: `activity_log`
Audit trail of all actions.

| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| action_type | text | e.g. `INTAKE_CREATED`, `BIN_STATUS_CHANGED`, `DISPATCH_CREATED` |
| description | text | Human-readable log message |
| entity_type | text | `bin`, `intake`, `dispatch`, `maintenance`, `labor`, `field_update` |
| entity_id | text | ID of the affected record |
| metadata | jsonb | Extra context data |
| user_email | text | Who performed the action |
| created_at | timestamptz | |

---

## 6. FEATURE INVENTORY

### Auth & Session
- Supabase email/password login
- 8-hour inactivity timeout (tracked via `localStorage._yla` last-activity timestamp)
- Session persists across page refreshes (removed force-logout in v7b07f54)
- Avatar shows user's first initial from email
- Sign out via avatar dropdown menu

### Dashboard
- 4 KPI cards: Total Intake (Kg), Active Bins (count), Dispatches (revenue), Avg Moisture (%)
  - Each KPI has a "delta" showing today's change
- Alert pills (solid colored): overdue bins (red), high moisture (amber), all-clear (green)
- Ready to Dispatch card: bins at target moisture or in shelling
- FIFO Dispatch Queue: top 6 oldest active bins sorted by intake date
- Recent Intakes table: last 6 intakes with edit buttons
- Bin tiles grid: all 20+ bins as visual cards (clickable → bin modal)

### Intake Register
- Multi-vehicle support (add/remove rows): vehicle no + tare weight + gross weight per truck
- Multiple LR numbers
- Multiple lot numbers with per-lot qty and bags
- Bin allocation: choose which bins and how many Kg/bags per bin
- Auto-status: bins set to `drying` on save
- DR Number (Delivery Receipt) field, company, hybrid, moisture, date, remarks
- Edit any intake after creation (`openEditIntakeModal`)
- Pagination (20 per page)
- Links to entry trucks — selecting a registered truck auto-fills vehicle + weights

### Bin Monitor
- 20 bins displayed as visual tiles (A/B sub-bins for bins 1, 10, 11, 20)
- Each tile shows: BIN label, hybrid, Kg, moisture %, hours in dryer, airflow direction arrow, status badge
- Colour coding: empty = light gray, drying = light green, shelling = gold
- Click any bin → bin modal: edit moisture, status, hybrid, qty, bags, lot, airflow, target moisture, capacity
- Moisture trend chart inside bin modal (sparkline SVG, last 10 readings)
- Clearing a bin (status → empty) auto-saves a snapshot to `bin_history`

### Entry Trucks
- Register arriving trucks: vehicle no, carrier company, driver, phone, lot numbers, weights
- Status workflow: `waiting` → `weighed` → `intake` → `completed`
- "Scan Slip" button: OCR on weighbridge slip photo → auto-fills vehicle no, gross weight, tare weight (does NOT fill company — weighbridge company ≠ transport company)
- KPI row: total trucks, waiting, in intake, total net weight
- Filter tabs: All / Waiting / Intake / Completed
- Cards layout with weight breakdown

### Backyard
- Log stock removed: link to intake and/or bin
- Fields: vehicle, hybrid, qty (Kg), bags, reason, removed by, notes
- Reason types: Damaged, Quality Issues, Pest, Excess, High Moisture, Other
- KPI: total Kg removed, bags removed, records count
- Edit any record (added Apr 2026)

### Dispatch & Finance
- Create dispatch: party, address, vehicle, LR, hybrid, lot(s), bins allocation (multi-bin), bags, qty, moisture, amount, driver name, driver phone, remarks
- Rate calculator: enter price per bag → auto-calculates total amount
- Receipt ID auto-generated: `YDS-{YEAR}-{6-digit counter}`
- Cryptographic hash + signature on every receipt (DJB2/FNV1a, display-only)
- Edit any dispatch (added Apr 2026)
- **Driver Slip**: prints a clean A4 gate-pass with 2 copies (Company + Driver) separated by cut line
- **Print Invoice**: full A4 dispatch invoice with company header, line items, QR code, hash
- WhatsApp share: pre-formatted message with receipt details
- Pagination (20 per page)

### Receipts
- Card grid of all dispatch receipts
- Click any → receipt modal with full invoice
- Verify Receipt tab: enter receipt ID or hash → confirms authentic / tampered
- Global search bar in topbar searches receipts + intakes live

### Analytics
- **KPI strip**: total intake Kg, dispatches, revenue, avg moisture drop, avg drying days, yield %
- **Daily Intake Bar Chart**: 7-day rolling SVG bar chart
- **Hybrid Donut Chart**: canvas-based top-5 hybrids by volume
- **Moisture Curve Cards**: top 8 active bins, moisture progress bars with entry→current drop
- **Dispatch Performance**: receipts issued, total dispatched Kg, bags, avg moisture, yield %
- **Bin Cycle Tracker**: avg days per cycle, avg moisture drop, best/worst performing bins
- **Intelligence Centre**: health score, risk alerts, season heatmap, bin ranking, arrival pattern chart

### Maintenance Log
- Log entries: date, reported by, equipment, issue, work done, checked by, items bought, cost
- Status management: Open / In Progress / Closed (inline select in table)
- Priority: Low / Medium / High
- Photo attachments: multiple images per log, thumbnail grid, lightbox viewer
- Edit any log (added Apr 2026)

### Labor & Shifts
- **Labor Groups**: named teams with member lists (stored in Supabase `labor_groups`)
- Shift log: date, group (auto-fills headcount + members), shift timing, work area, headcount, wage/person, members present, remarks
- Photo attachments: multiple photos per shift (stored in `maint-images` bucket under `labor/` prefix)
- Lightbox viewer for photos
- **Payroll Summary**: monthly wages total, headcount, shift days, avg wages/day
- Edit any shift log (added Apr 2026)

### Field Updates
- 7 update types:
  1. **Moisture Photo** — photo of moisture meter → OCR extracts % → updates bin moisture live + logs to moisture_readings
  2. **Boiler Temp** — photo of controller → OCR extracts 2 temps + pressure → updates plant_settings
  3. **Intake Photo** — photo of intake activity linked to bin
  4. **Bin Note** — text note linked to a bin
  5. **Weigh Slip** — photo of weighbridge slip → OCR extracts all 8 fields → cross-table writes:
     - INWARD: updates/creates entry_truck record
     - OUTWARD: updates/creates dispatch record
  6. **Backyard** — backyard stock photo
  7. **General** — any other update
- **OCR engine**: Tesseract.js v4 (browser-based, no server, no AI/LLM)
- Smart parsing: regex patterns detect document type and extract values automatically
- Feed view with filter buttons by type
- All updates saved to `field_updates` table

### Manager Access (PIN-protected)
- PIN: SHA-256 hashed, stored in `plant_settings` table
- Bulk moisture entry for all active bins at once
- Airflow controls per bin
- Intake table view
- Season summary
- Change manager PIN

### Boiler Status (topbar pill)
- Live display: `B1: 42.6°C | B2: 42.2°C | 5 kg/cm²`
- Click → popup to update any/all readings
- Saved to `plant_settings` table
- Also updatable via Field Updates tab (boiler_temp type)

### PWA & Offline
- Service Worker: cache-first for all static assets
- Offline write queue (`js/offline-queue.js`): all writes (intake, dispatch, bin update, maintenance, labor, bin history, activity log) queued in localStorage when offline
- Bin updates deduplicated (last write wins)
- Auto-syncs on `window online` event
- Retries up to 4 times, then discards
- Calls `bootApp()` after sync to refresh UI
- Offline bar (amber banner) at top when no internet
- Sync badge (bottom-right): shows pending count + tap-to-sync

### Exports & Reports
- **Excel export**: all tables (bins, intakes, dispatches, maintenance, labor, bin history) → .xlsx
- **Daily Operations Report**: prints full HTML report in new window with all today's data

### Multi-language (i18n)
- English, Hindi (हिंदी), Telugu (తెలుగు)
- `js/i18n.js`: translations dictionary + `changeLanguage()` function
- Note: many newer UI strings are NOT yet translated (hardcoded English)

---

## 7. COMPLETE CHANGE HISTORY

### Phase 0 — Foundation (March 13, 2026)
- **Initial commit**: Basic Yellina Platform structure
- **Mobile responsive**: Fixed mobile menu layout, initial cache versioning

### Phase 1 — Core Platform Hardening (March 24–26, 2026)
- **FAANG-level upgrades**: Supabase Auth, RLS enabled on all 8 tables, state management (`window.state` + `Store`), error boundary (`window.onerror`), strict mode
- **Logo**: Added official Yellina Seeds logo to login + sidebar
- **Live hours-in-bin**: Bin monitor tiles show elapsed hours vs 109h target
- **Multi-bin dispatch**: New Dispatch modal supports allocating from multiple bins at once
- **Company field**: Changed from dropdown to free-text input
- **Date/time fields**: Added optional datetime to intake and dispatch modals
- **Bug fixes**: Duplicate key error (timestamp-based IDs), RLS was OFF → enabled, missing tables seeded, `dispatches.bins` migrated from text to jsonb, `BIN-undefined` bug fixed, moisture display fixed

### Phase 2 — Auth & Session Redesign (March 26, 2026)
- Force re-login on every page load (security for facility tablets) — LATER REVERSED
- FAANG-level UI redesign + CSS Grid responsive layouts — LATER REVERTED to stable version
- Final stable: login persists session, force re-login removed

### Phase 3 — Intake Form Overhaul (March 30, 2026)
- **Multiple vehicles**: Add/remove rows for each truck in an intake
- **Multiple LR numbers**: Dynamic add/remove rows
- **Multiple lot numbers**: Per-lot qty and bags allocation
- **DR Number**: Renamed "Challan" → "DR Number" throughout
- **Kg only**: Removed Kg/Tons unit selector — standardized to Kg everywhere
- **Edit intake**: Full edit support for any intake record
- **Intake table in Manager**: Dedicated table view with edit
- **Dynamic status chip**: Intake table shows actual current bin status

### Phase 4 — Sub-bins, Invoice, Analytics (April 1, 2026)
- **A/B sub-bins**: Bins 1, 10, 11, 20 split into A and B sub-chambers
- **New logo**: Updated branding
- **A4 dispatch invoice**: Redesigned receipt as proper company invoice (green header, line items, QR, hash)
- **Global search**: Live search dropdown in topbar (receipts + intakes)
- **Bin Cycle Tracker**: Analytics section tracking dryer cycle performance
- **Advanced Analytics**: Revenue trends, yield, profitability metrics
- **Intelligence Centre**: Health score, risk alerts, season heatmap, bin ranking, truck arrival patterns

### Phase 5 — Entry Trucks & Backyard (April 1, 2026)
- **Entry Trucks module**: Full CRUD for truck registration and status tracking
- **Backyard module**: Full CRUD for stock removal logging
- **Dispatch lots**: Multiple lot numbers in dispatch

### Phase 6 — Premium UI (April 1, 2026)
- Crystal leaf wallpaper background (only inside app, not login)
- Frosted glass overlay on main content (rgba semi-transparent)
- Bin tile redesign: gauge-style with color-coded numbers, airflow badge, status indicators
- Maintenance log: photo attachments with lightbox viewer
- Labor: payroll summary KPI cards

### Phase 7 — Reliability & Polish (April 1, 2026)
- **Boot spinner**: Loading animation during data fetch
- **Offline write queue**: Full offline-first writes for all entities
- **Input validation**: Required field checks, range validation
- **Rate calculator**: Price-per-bag → auto-calculate dispatch total
- **Notification bell**: Alert count badge + dropdown
- **FIFO queue**: Dashboard dispatch queue sorted by oldest intake
- **WhatsApp share**: Receipt summary via wa.me link
- **Daily print report**: Full ops summary printable report
- **Labor Groups**: Team management migrated from localStorage → Supabase
- **Favicon + SEO**: favicon.png, Open Graph meta, JSON-LD schema
- **8-hour inactivity timeout**: Secure auto-logout after idle

### Phase 8 — Advanced Features Batch (April 2, 2026)
- **Moisture history chart**: Per-bin reading history in bin modal (sparkline SVG)
- **Stock reconciliation view**
- **PIN management**: Change manager PIN via settings
- **Season compare**: Year-over-year analytics

### Phase 9 — Field Updates + OCR (April 2, 2026)
- **Field Updates tab**: New section for employee operational photo updates
- **Tesseract.js OCR**: Browser-based text extraction — no server, no AI
- **Smart OCR parsing**: Auto-detects document type, fills fields with regex
- **Dual boiler temps**: B1 + B2 + pressure in topbar pill
- **Cross-table writes on save**:
  - Moisture photo → updates `bins.current_moisture` + `moisture_readings`
  - Boiler temp → updates `plant_settings`
  - Weigh slip → updates `entry_trucks` (INWARD) or `dispatches` (OUTWARD)
  - Draft creation: if no matching record exists, creates new truck/dispatch automatically
- **Crystal leaf wallpaper**: New Gemini-generated background image (wallpaper3.jpg)

### Phase 10 — Driver Slip + OCR Fix (April 2, 2026)
- **Driver Slip**: Printable A4 gate-pass (2 copies: Company + Driver with cut line)
  - Accessible from receipt modal AND directly from dispatch table row
- **OCR company bug fixed**: `runTruckSlipOcr()` no longer fills `t-company` from weighbridge slip (weighbridge company = material owner ≠ transport company)
- **Scan Slip in truck modal**: OCR button fills vehicle no, weights from slip photo

### Phase 11 — Full Edit Support (April 2, 2026)
- **Labor & Shifts edit**: ✏️ Edit button on every row, image upload added
- **Maintenance edit**: ✏️ Edit button on every row, full field edit
- **Dispatch edit**: ✏️ Edit button in dispatch table
- **Backyard edit**: ✏️ Edit button on every row
- **DB update functions added**: `dbUpdateLabor`, `dbUpdateMaintenance`, `dbUpdateDispatch`, `dbUpdateBackyardRemoval`
- `labor_logs.image_urls` jsonb column added via Supabase migration

---

## 8. KEY PATTERNS AND CONVENTIONS

### State Management
```js
window.state          // global mutable state object (all data lives here)
window.Store          // pub/sub wrapper: Store.emitChange() triggers re-render
                      // BUG: Store.reset() doesn't update window.state ref
```

### Boot / Data Load
```js
bootApp()             // Parallel fetch of all 11 DB tables via Promise.all
                      // Populates window.state with mapped objects
                      // Called at login and after offline sync
```

### ID Formats
- Intakes: `INT-{timestamp}` e.g. `INT-1711234567890`
- Dispatches (receipts): `YDS-{YEAR}-{6-digit counter}` e.g. `YDS-2026-001001`
- Entry trucks: auto-increment bigint
- All others: auto-increment bigint

### Bin Access Pattern
```js
// CORRECT (find by ID):
state.bins.find(b => b.id === binId)

// WRONG (fragile index — some legacy code still does this):
state.bins[bin.id - 1]
```

### Dispatch `bins` field
```js
// CORRECT — bins is jsonb, pass array directly:
bins: [{binId: 1, bags: 100, qty: 5000}]

// WRONG — do NOT stringify:
bins: JSON.stringify([...])  // ← this was a bug, now fixed
```

### Toast Notifications
```js
toast('message')           // info (default)
toast('message', 'success')
toast('message', 'error')
toast('message', 'warn')
```

### Modal Open/Close
```js
openModal('modal-id')      // shows overlay
closeModal('modal-id')     // hides overlay
```

### DB Conventions
- All `dbFetch*` functions return mapped JS objects (camelCase) from snake_case DB columns
- All `dbInsert*` functions return the inserted record (with id) or null
- All `dbUpdate*` functions return the updated record or null
- Offline queue wraps writes: `OfflineQueue.enqueue('INSERT_INTAKE', record)`

### OCR Pattern (Tesseract.js)
```js
const result = await Tesseract.recognize(file, 'eng', { logger: ... });
const text = result?.data?.text?.trim() || '';
// Then regex parse:
const m = text.match(/moisture\s*:\s*(\d+\.?\d*)\s*%/i);
```

### CSS Variables (do NOT use these — they don't exist)
```css
/* WRONG: */
color: var(--text);
color: var(--text-secondary);

/* CORRECT: */
color: var(--ink);
color: var(--ink-4);
```

### Version Bumping (ALWAYS do this when changing a file)
- CSS files: bump `?v=N` in index.html `<link>` tags
- JS files: bump `?v=N` in index.html `<script>` tags
- service-worker.js: bump `CACHE_VERSION` string

---

## 9. KNOWN BUGS AND LIMITATIONS

| Priority | Bug | Location | Status |
|---|---|---|---|
| 🔴 | `state.bins[id-1]` fragile index access | binTile.js, some render.js | Not fixed |
| 🔴 | `Store.reset()` doesn't update `window.state` ref | state.js | Not fixed |
| 🟡 | No loading spinner during individual operations (only bootApp) | actions.js | Not fixed |
| 🟡 | Manager PIN still visible in DevTools (SHA-256 only, client-side) | actions.js | By design |
| 🟡 | `globalSearch()` finds intakes but scroll/highlight only works partially | receipt.js | Partial |
| 🟡 | No debounce on search inputs | index.html | Not fixed |
| 🟡 | Receipt hash uses non-crypto functions (DJB2/FNV1a) — misleading to call it "cryptographic" | crypto.js | By design |
| 🟡 | Many UI strings not translated (hardcoded English) | render.js | Ongoing |
| 🟢 | Bin count hardcoded as 20 in several places (actual is 24 with A/B sub-bins) | render.js, config.js | Not fixed |
| 🟢 | Manifest icons: same file for 192 & 512, maskable not separate | manifest.json | Not fixed |
| 🟢 | No `<noscript>` fallback | index.html | Not fixed |
| 🟢 | `pages/` folder is dead code | pages/ | Not removed |
| 🟢 | `seed.js` is dead code | js/seed.js | Not removed |
| 🟢 | `intake_date_ts` stored as string (text) not integer | bins table | Legacy, not migrated |

---

## 10. CONFIGURATION CONSTANTS

```js
// js/config.js
Config.TARGET_HRS      = 109    // hours before bin is "overdue"
Config.TARGET_MOISTURE = 10     // % target for dispatch-ready
Config.MOISTURE_MID    = 15     // % above which = amber warning
Config.MOISTURE_HIGH   = 28     // % above which = blue high-humidity
Config.BIN_COUNT       = 20     // legacy constant (actual: 24 with A/B)
Config.MS_PER_DAY      = 86400000
Config.MS_PER_HOUR     = 3600000
```

---

## 11. DEPLOYMENT & VERSIONING

### Current Version Numbers (as of Apr 2, 2026)
```
service-worker.js      CACHE_VERSION = 'v98'
css/variables.css      ?v=22
css/layout.css         ?v=10
css/components.css     ?v=10
js/config.js           ?v=1
js/state.js            ?v=3
js/db.js               ?v=15
js/init.js             ?v=20
js/render.js           ?v=34
js/actions.js          ?v=38
js/receipt.js          ?v=8
js/selects.js          ?v=4
js/binTile.js          ?v=19
js/i18n.js             ?v=7
js/utils.js            ?v=5
js/clock.js            ?v=2
js/offline-queue.js    ?v=2
```

### Deploy Process
1. Edit files locally
2. Bump `?v=N` on changed JS/CSS files in `index.html`
3. Bump `CACHE_VERSION` in `service-worker.js`
4. `git add -A && git commit -m "message" && git push origin main`
5. Vercel auto-deploys in ~90 seconds → live at yellinaseeds.com

### Supabase Projects
- **YellinaSeeds** (production): `gnujlntvcdwtwdnsgobj` | Region: us-east-1 | Status: ACTIVE
- **DryTrack** (separate US product): `thymnewdoajzsfygyehf` | Status: INACTIVE

---

## 12. PLANNED UPGRADES ROADMAP

### 🔴 Priority 1 — Critical (implement next)
1. **Supabase Realtime**: Subscribe to all table changes → auto-refresh state on all connected devices. Multi-user operations floor needs this.
2. **GST-Compliant Invoice**: Add GSTIN of buyer, HSN code for corn seed, CGST/SGST/IGST line items to dispatch invoice. Current invoice not legally valid as tax invoice.
3. **Predictive Drying Timer**: On each bin tile, show "Ready in ~3 days" based on entry moisture, current moisture, days elapsed, target moisture (linear extrapolation).
4. **Proper RBAC / Roles**: `user_roles` table + Supabase RLS per role. Roles: Super Admin, Manager, Operator, Viewer.

### 🟡 Priority 2 — Major Upgrades
5. **Push Notifications (PWA)**: Web Push API — alert manager when bin ready, new intake, boiler not updated.
6. **Advanced Charts**: Time-series moisture drop curves per bin, seasonal comparison, revenue trends. Use Chart.js or lightweight SVG.
7. **Automated Daily Email Report**: Supabase Edge Function cron → send end-of-day ops summary via Resend API.
8. **Cost & Margin Tracking**: Procurement cost on intakes, drying cost per day, profit per dispatch.

### 🟢 Priority 3 — Polish & Scale
9. **Audit Trail UI**: Visualize `activity_log` table as a timeline with filters.
10. **Barcode / QR Scanner**: jsQR library with camera — scan bin QR codes, vehicle plates.
11. **Weather Widget**: Open-Meteo API (free, no key) for Sathupally humidity → warn if >80% outdoor humidity.
12. **Keyboard Shortcuts + Command Palette**: `Cmd+K` → search/navigate instantly.
13. **WhatsApp Business API**: Auto-send dispatch receipts + daily summaries via Twilio or Meta API.
14. **Tally ERP Export**: Export dispatches as Tally-compatible XML for accounting.
15. **Multi-Facility / Multi-Season**: Add `facility_id` + `season_year` dimensions.

---

*This document is auto-maintained. Update it whenever significant features are added, bugs are fixed, or architecture changes.*
