// ============================================================
// INITIALISATION & BOOT
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// Always sign out on page load so login is required every visit
async function initApp() {
  await dbClient.auth.signOut();
  const loginScreen = document.getElementById('login-screen');
  const appShell = document.getElementById('app-shell');
  if (loginScreen) loginScreen.style.display = 'flex';
  if (appShell) appShell.style.display = 'none';
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

// Called after successful login to load data and show the app
async function bootApp() {
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

  document.getElementById('dash-date').textContent = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Fetch all data in parallel for faster boot
  const [bins, intakes, dispatches, maint, labor, binHistory] = await Promise.all([
    dbFetchBins(),
    dbFetchIntakes(),
    dbFetchDispatches(),
    dbFetchMaintenance(),
    dbFetchLabor(),
    dbFetchBinHistory()
  ]);

  if (bins && bins.length > 0) {
    state.bins = bins.map(b => ({
      id: b.id,
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
      intakeDate: b.intake_date_ts ? new Date(parseInt(b.intake_date_ts)).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''
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
        pkts: parseInt(i.pkts) || 0,
        entryMoisture: parseFloat(i.entry_moisture) || 0,
        lr: i.lr || '',
        remarks: i.remarks || '',
        vehicleWeight: parseFloat(i.vehicle_weight) || 0,
        grossWeight: parseFloat(i.gross_weight) || 0,
        netWeight: parseFloat(i.net_weight) || 0,
        bin: binIds[0] || null,
        bins: binIds,
        allocations: allocs.map(a => ({ binId: a.bin_id, qty: parseFloat(a.qty) || 0, pkts: parseInt(a.pkts) || 0 })),
        dateTS: new Date(i.created_at).getTime(),
        date: new Date(i.created_at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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
      date: new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }));
    if (state.dispatches.length > 0) {
      const maxReceipt = Math.max(...state.dispatches.map(d => parseInt(d.receipt_id.split('-')[2]) || 0));
      state.receiptCounter = Math.max(1001, maxReceipt + 1);
    }
  }

  if (maint) state.maintenance = maint;
  if (labor) state.labor = labor;
  if (binHistory) state.binHistory = binHistory;

  if (window.Store) window.Store.emitChange();

  // Show pending badge if there are queued writes from a previous offline session
  if (window.OfflineQueue) {
    OfflineQueue.updateBadge();
    // If we're back online and have pending items, sync them now
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
    // Small delay to let connection stabilise before syncing
    setTimeout(() => OfflineQueue.sync(), 1500);
  }
});

window.addEventListener('offline', () => {
  console.log('Connection lost — writes will be queued locally');
  if (window.OfflineQueue) OfflineQueue.updateBadge();
  if (typeof showToast === 'function') showToast('You\'re offline — entries will be saved locally and synced when connected', 'info');
});

initApp();
