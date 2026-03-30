// ============================================================
// OFFLINE WRITE QUEUE — Yellina Seeds Operations Platform
// Stores pending DB writes in localStorage when offline.
// Auto-syncs all queued operations when connectivity returns.
// ============================================================
'use strict';

const QUEUE_KEY = 'yellina_offline_queue';

const OfflineQueue = {

  // ── Get full queue from localStorage ──
  get() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); }
    catch { return []; }
  },

  // ── Save queue to localStorage ──
  _save(queue) {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); }
    catch(e) { console.warn('OfflineQueue: localStorage write failed', e); }
  },

  // ── Add an operation to the queue ──
  enqueue(type, payload) {
    const queue = this.get();
    // Bin updates: deduplicate by bin ID (last write wins — no point sending stale values)
    if (type === 'UPDATE_BIN') {
      const idx = queue.findIndex(op => op.type === 'UPDATE_BIN' && op.payload.id === payload.id);
      if (idx !== -1) {
        queue[idx].payload  = payload;
        queue[idx].timestamp = Date.now();
      } else {
        queue.push(this._op(type, payload));
      }
    } else {
      queue.push(this._op(type, payload));
    }
    this._save(queue);
    this.updateBadge();
    console.log(`OfflineQueue: queued ${type} (total ${queue.length})`);
  },

  _op(type, payload) {
    return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, payload, timestamp: Date.now(), retries: 0 };
  },

  // ── Count pending operations ──
  count() { return this.get().length; },

  // ── Update offline bar + sync badge in the UI ──
  updateBadge() {
    const count   = this.count();
    const badge   = document.getElementById('sync-badge');
    const bar     = document.getElementById('offline-bar');
    const barText = document.getElementById('offline-bar-text');

    if (bar) {
      bar.classList.toggle('visible', !navigator.onLine);
    }
    if (barText) {
      barText.textContent = count > 0
        ? `You're offline — ${count} change${count !== 1 ? 's' : ''} queued, will sync when connected`
        : `You're offline — viewing cached data`;
    }
    if (badge) {
      if (count > 0) {
        badge.innerHTML = `
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-3.7"/>
          </svg>
          ${count} pending — tap to sync`;
        badge.classList.add('visible');
        badge.onclick = () => OfflineQueue.sync();
      } else {
        badge.classList.remove('visible');
        badge.onclick = null;
      }
    }
  },

  // ── Sync all queued operations to Supabase ──
  async sync() {
    const queue = this.get();
    if (!queue.length) { this.updateBadge(); return; }
    if (!navigator.onLine) { if (typeof showToast === 'function') showToast('Still offline — will sync automatically when connected', 'info'); return; }

    const badge = document.getElementById('sync-badge');
    if (badge) badge.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.7"/></svg> Syncing…`;

    if (typeof showToast === 'function') showToast(`Syncing ${queue.length} offline change${queue.length !== 1 ? 's' : ''}…`, 'info');

    const failed = [];
    let synced = 0;

    for (const op of queue) {
      try {
        let ok = false;
        switch (op.type) {
          case 'UPDATE_BIN':
            ok = await _directUpdateBin(op.payload.id, op.payload.updates);
            break;
          case 'INSERT_INTAKE':
            ok = await _directInsertIntake(op.payload.intake, op.payload.allocations || []);
            break;
          case 'UPDATE_INTAKE':
            ok = await _directUpdateIntake(op.payload.intakeId, op.payload.updates, op.payload.allocations || []);
            break;
          case 'INSERT_DISPATCH':
            ok = await _directInsertDispatch(op.payload);
            break;
          case 'INSERT_MAINTENANCE':
            ok = !!(await _directInsertMaintenance(op.payload));
            break;
          case 'INSERT_LABOR':
            ok = !!(await _directInsertLabor(op.payload));
            break;
          case 'INSERT_BIN_HISTORY':
            ok = await _directInsertBinHistory(op.payload);
            break;
          case 'LOG_ACTIVITY':
            ok = await _directLogActivity(op.payload.action_type, op.payload.description);
            break;
          default:
            console.warn('OfflineQueue: unknown op type', op.type);
            ok = true; // discard unknown ops
        }
        if (ok) {
          synced++;
        } else {
          op.retries = (op.retries || 0) + 1;
          if (op.retries < 4) failed.push(op); // give up after 4 attempts
        }
      } catch(e) {
        console.error('OfflineQueue sync error:', op.type, e);
        op.retries = (op.retries || 0) + 1;
        if (op.retries < 4) failed.push(op);
      }
    }

    this._save(failed);
    this.updateBadge();

    if (synced > 0) {
      if (typeof showToast === 'function') showToast(`✓ ${synced} change${synced !== 1 ? 's' : ''} synced to database`, 'success');
      // Reload app data so UI reflects what's now in the DB
      if (typeof bootApp === 'function') setTimeout(() => bootApp(), 800);
    }
    if (failed.length > 0 && typeof showToast === 'function') {
      showToast(`${failed.length} operation${failed.length !== 1 ? 's' : ''} failed to sync — will retry`, 'error');
    }
  }
};

window.OfflineQueue = OfflineQueue;
