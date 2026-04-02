// ============================================================
// INITIALISATION & BOOT
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ── Boot spinner helpers ──────────────────────────────────────
function _showBootSpinner() {
  let el = document.getElementById('boot-spinner');
  if (!el) {
    el = document.createElement('div');
    el.id = 'boot-spinner';
    el.innerHTML = `
      <div class="bsp-card">
        <div class="bsp-ring-wrap">
          <div class="bsp-ring"></div>
          <img src="/assets/logo.jpg" class="bsp-logo" alt="Yellina Seeds">
        </div>
        <div class="bsp-label">Loading operations data…</div>
        <div class="bsp-sub">Yellina Seeds Pvt. Ltd. — Sathupally</div>
      </div>`;
    document.body.appendChild(el);
  }
  el.classList.remove('bsp-hidden');
}

function _hideBootSpinner() {
  const el = document.getElementById('boot-spinner');
  if (el) {
    el.classList.add('bsp-hidden');
    setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }
}

function _showBootError() {
  const el = document.getElementById('boot-spinner');
  if (!el) return;
  el.innerHTML = `
    <div class="bsp-card">
      <div style="font-size:44px;margin-bottom:4px">⚠️</div>
      <div class="bsp-label" style="color:var(--red)">Failed to load data</div>
      <div class="bsp-sub" style="margin-bottom:20px;max-width:260px;">
        Could not connect to the database.<br>Check your internet connection and try again.
      </div>
      <button class="btn btn-gold" style="height:40px;font-size:13px;" onclick="bootApp()">↺ &nbsp;Retry</button>
    </div>`;
}

// ── Session timeout: 8 hours of inactivity forces re-login ──
const _SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
const _ACTIVITY_KEY = 'yellina_last_active';

function _touchActivity() {
  localStorage.setItem(_ACTIVITY_KEY, Date.now().toString());
}

function _sessionExpired() {
  const last = parseInt(localStorage.getItem(_ACTIVITY_KEY) || '0');
  if (!last) return true; // no record = treat as expired
  return (Date.now() - last) > _SESSION_TIMEOUT_MS;
}

// Keep activity timestamp fresh while the user is on the page
document.addEventListener('click', _touchActivity, { passive: true });
document.addEventListener('keydown', _touchActivity, { passive: true });

async function initApp() {
  const loginScreen = document.getElementById('login-screen');
  const appShell    = document.getElementById('app-shell');
  try {
    const { data: { session } } = await dbClient.auth.getSession();
    if (session && !_sessionExpired()) {
      // Valid session + active within 8 hours → skip login
      _touchActivity();
      if (loginScreen) loginScreen.style.display = 'none';
      bootApp();
      return;
    }
    // Session exists but timed out — sign out cleanly
    if (session) await dbClient.auth.signOut();
  } catch(e) { /* fall through to login */ }
  localStorage.removeItem(_ACTIVITY_KEY);
  if (loginScreen) loginScreen.style.display = 'flex';
  if (appShell)    appShell.style.display    = 'none';
}

// Toggle the user dropdown menu
window.toggleUserMenu = function() {
  const menu = document.getElementById('user-menu');
  if (menu) menu.classList.toggle('open');
};
// Close menu when clicking outside
document.addEventListener('click', function(e) {
  const menu = document.getElementById('user-menu');
  const avatar = document.getElementById('user-avatar');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && e.target !== avatar) {
    menu.classList.remove('open');
  }
});

// ── Called after successful login to load data and show the app ──
async function bootApp() {
  // Show/update spinner immediately
  _showBootSpinner();

  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app-shell');
  if (loginScreen) loginScreen.style.display = 'none';
  if (appShell) appShell.style.display = 'block';

  // Set avatar initial from logged-in user's email
  try {
    const { data: { user } } = await dbClient.auth.getUser();
    if (user && user.email) {
      const initial = user.email.charAt(0).toUpperCase();
      const avatarEl = document.getElementById('user-avatar');
      if (avatarEl) { avatarEl.textContent = initial; avatarEl.title = user.email; }
      const emailEl = document.getElementById('user-menu-email');
      if (emailEl) emailEl.textContent = user.email;
    }
  } catch(e) { /* silent */ }

  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Fetch all data in parallel for faster boot
  let bins, intakes, dispatches, maint, labor, binHistory, entryTrucks, backyardRemovals, laborGroups, moistureReadings, fieldUpdates;
  try {
    [bins, intakes, dispatches, maint, labor, binHistory, entryTrucks, backyardRemovals, laborGroups, moistureReadings, fieldUpdates] = await Promise.all([
      dbFetchBins(),
      dbFetchIntakes(),
      dbFetchDispatches(),
      dbFetchMaintenance(),
      dbFetchLabor(),
      dbFetchBinHistory(),
      dbFetchEntryTrucks(),
      dbFetchBackyardRemovals(),
      dbFetchLaborGroups(),
      dbFetchMoistureReadings(),
      dbFetchFieldUpdates()
    ]);
  } catch (err) {
    console.error('bootApp: fetch error', err);
    _showBootError();
    return;
  }

  // Critical check: bins must load for app to function
  if (!bins) {
    _showBootError();
    return;
  }

  if (bins && bins.length > 0) {
    state.bins = bins.map(b => ({
      id: b.id,
      binLabel: b.bin_label || null,
      sortOrder: b.sort_order || b.id,
      status: b.status,
      hybrid: b.hybrid || '',
      company: b.company || '',
      lot: b.lot || '',
      qty: parseFloat(b.qty) || 0,
      pkts: parseInt(b.pkts) || 0,
      entryMoisture: parseFloat(b.entry_moisture) || 0,
      currentMoisture: parseFloat(b.current_moisture) || 0,
      airflow: b.airflow || 'up',
      intakeDateTS: b.intake_date_ts ? parseInt(b.intake_date_ts) : null,
      intakeDate: b.intake_date_ts ? new Date(parseInt(b.intake_date_ts)).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
      targetMoisture: parseFloat(b.target_moisture) || 10,
      capacityKg: parseFloat(b.capacity_kg) || 0,
      notes: b.notes || '',
      updatedBy: b.updated_by || ''
    }));
  }

  if (intakes) {
    state.intakes = intakes.map(i => {
      const allocs = (i.intake_allocations || []);
      const binIds = allocs.map(a => a.bin_id);
      return {
        id: i.id,
        challan: i.challan,
        vehicle: i.vehicle,
        location: i.location || '',
        company: i.company || '',
        hybrid: i.hybrid,
        lot: i.lot || '',
        qty: parseFloat(i.qty) || 0,
        qty_unit: i.qty_unit || 'kg',
        pkts: parseInt(i.pkts) || 0,
        entryMoisture: parseFloat(i.entry_moisture) || 0,
        lr: i.lr || '',
        remarks: i.remarks || '',
        vehicleWeight: i.vehicle_weight || '',
        grossWeight: i.gross_weight || '',
        netWeight: parseFloat(i.net_weight) || 0,
        bin: binIds[0] || null,
        bins: binIds,
        allocations: allocs.map(a => ({ binId: a.bin_id, qty: parseFloat(a.qty) || 0, pkts: parseInt(a.pkts) || 0 })),
        dateTS: new Date(i.created_at).getTime(),
        date: new Date(i.created_at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        season_year: i.season_year || new Date(i.created_at).getFullYear()
      };
    });
  }

  if (dispatches) {
    state.dispatches = dispatches.map(d => ({
      receiptId: d.receipt_id,
      party: d.party,
      address: d.address || '',
      vehicle: d.vehicle,
      lr: d.lr || '',
      hybrid: d.hybrid,
      lot: d.lot || '',
      bin: d.bin_id,
      bins: Array.isArray(d.bins) ? d.bins : [],
      bags: parseInt(d.bags) || 0,
      qty: parseFloat(d.qty) || 0,
      amount: parseFloat(d.amount) || 0,
      moisture: parseFloat(d.moisture) || 0,
      remarks: d.remarks || '',
      hash: d.hash || '',
      signature: d.signature || '',
      dateTS: new Date(d.created_at).getTime(),
      date: new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      season_year: d.season_year || new Date(d.created_at).getFullYear()
    }));
    if (state.dispatches.length > 0) {
      const maxReceipt = Math.max(...state.dispatches.map(d => parseInt(d.receiptId.split('-')[2]) || 0));
      state.receiptCounter = Math.max(1001, maxReceipt + 1);
    }
  }

  if (maint) state.maintenance = maint;
  if (labor) state.labor = labor;
  if (binHistory) state.binHistory = binHistory;
  state.moistureReadings = moistureReadings || [];
  state.fieldUpdates = (fieldUpdates || []).map(u => ({
    id: u.id,
    updateType: u.update_type,
    binId: u.bin_id || null,
    intakeId: u.intake_id || null,
    notes: u.notes || '',
    ocrText: u.ocr_text || '',
    photoUrl: u.photo_url || null,
    submittedBy: u.submitted_by || '',
    createdAt: u.created_at,
    createdAtDisplay: new Date(u.created_at).toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }));
  state.laborGroups = (laborGroups || []).map(g => ({
    id: g.id,
    name: g.name,
    members: Array.isArray(g.members) ? g.members : [],
    sortOrder: g.sort_order || 0
  }));

  if (entryTrucks) {
    state.entryTrucks = entryTrucks.map(t => ({
      id: t.id,
      vehicleNo: t.vehicle_no,
      driverName: t.driver_name || '',
      driverPhone: t.driver_phone || '',
      company: t.company || '',
      fromLocation: t.from_location || '',
      grossWeight: parseFloat(t.gross_weight) || 0,
      tareWeight: parseFloat(t.tare_weight) || 0,
      netWeight: parseFloat(t.net_weight) || 0,
      arrivalTime: t.arrival_time,
      arrivalDisplay: new Date(t.arrival_time).toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }),
      status: t.status,
      intakeId: t.intake_id || null,
      notes: t.notes || '',
      lotNumbers: Array.isArray(t.lot_numbers) ? t.lot_numbers : []
    }));
  }

  if (backyardRemovals) {
    state.backyardRemovals = backyardRemovals.map(r => ({
      id: r.id,
      intakeId: r.intake_id || null,
      binId: r.bin_id || null,
      vehicleNo: r.vehicle_no || '',
      hybrid: r.hybrid || '',
      qtyRemoved: parseFloat(r.qty_removed) || 0,
      bagsRemoved: parseInt(r.bags_removed) || 0,
      reason: r.reason,
      notes: r.notes || '',
      removedBy: r.removed_by || '',
      removedAt: r.removed_at,
      removedAtDisplay: new Date(r.removed_at).toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    }));
  }

  // Fetch boiler temp (non-blocking)
  dbFetchBoilerTemp().then(temp => {
    state.boilerTemp = temp;
    const el = document.getElementById('boiler-temp-display');
    if (el) el.textContent = temp !== '—' ? temp : '—';
  });

  // Record activity so inactivity timer resets on successful boot
  _touchActivity();

  // Hide spinner BEFORE emitting change so first render is visible
  _hideBootSpinner();

  if (window.Store) window.Store.emitChange();

  // Re-apply language translations now that content is rendered
  if (typeof changeLanguage === 'function') changeLanguage(currentLang);

  // Show pending badge if there are queued writes from a previous offline session
  if (window.OfflineQueue) {
    OfflineQueue.updateBadge();
    if (navigator.onLine && OfflineQueue.count() > 0) {
      setTimeout(() => OfflineQueue.sync(), 2000);
    }
  }
}

// Forgot password — simple prompt for now
window.showForgotPassword = function() {
  if (typeof toast === 'function') {
    toast('Please contact your administrator to reset your password.', 'info');
  } else {
    alert('Please contact your administrator to reset your password.');
  }
};

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

// Online/offline event handlers
window.addEventListener('online', () => {
  console.log('Connection restored — syncing offline queue…');
  if (window.OfflineQueue) {
    OfflineQueue.updateBadge();
    setTimeout(() => OfflineQueue.sync(), 1500);
  }
});

window.addEventListener('offline', () => {
  console.log('Connection lost — writes will be queued locally');
  if (window.OfflineQueue) OfflineQueue.updateBadge();
  if (typeof toast === 'function') toast('You\'re offline — entries will be saved locally and synced when connected', 'info');
});

initApp();
