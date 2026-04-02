// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================
"use strict";

const SUPABASE_URL = 'https://gnujlntvcdwtwdnsgobj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWpsbnR2Y2R3dHdkbnNnb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ4MTQsImV4cCI6MjA4ODg3MDgxNH0.34RcfWe6HknwHr_nTXjSPaHflqKanW-2JmckixlR06c';

// Initialize Supabase client
const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// READ FUNCTIONS (always try network, fall back to cache)
// ============================================================

async function dbFetchBins() {
  try {
    const { data, error } = await dbClient.from('bins').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching bins:', err);
    if (typeof showToast === 'function') showToast('Failed to fetch bins from database.', 'error');
    return null;
  }
}

async function dbFetchIntakes() {
  try {
    const { data, error } = await dbClient
      .from('intakes')
      .select('*, intake_allocations(bin_id, qty, pkts)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching intakes:', err);
    return null;
  }
}

async function dbFetchDispatches() {
  try {
    const { data, error } = await dbClient.from('dispatches').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching dispatches:', err);
    return null;
  }
}

async function dbFetchMaintenance() {
  try {
    const { data, error } = await dbClient.from('maintenance_logs').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching maintenance:', err);
    return null;
  }
}

async function dbFetchLabor() {
  try {
    const { data, error } = await dbClient.from('labor_logs').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching labor:', err);
    return null;
  }
}

// ── Labor Groups CRUD ─────────────────────────────────────────
async function dbFetchLaborGroups() {
  try {
    const { data, error } = await dbClient.from('labor_groups').select('*').order('sort_order').order('id');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching labor groups:', err);
    return [];
  }
}

async function dbInsertLaborGroup(record) {
  try {
    const { data, error } = await dbClient.from('labor_groups').insert([record]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('dbInsertLaborGroup:', err);
    throw err;
  }
}

async function dbUpdateLaborGroup(id, updates) {
  try {
    const { data, error } = await dbClient.from('labor_groups').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('dbUpdateLaborGroup:', err);
    throw err;
  }
}

async function dbDeleteLaborGroup(id) {
  try {
    const { error } = await dbClient.from('labor_groups').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('dbDeleteLaborGroup:', err);
    throw err;
  }
}

async function dbFetchBinHistory() {
  try {
    const { data, error } = await dbClient.from('bin_history').select('*').order('emptied_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching bin history:', err);
    return null;
  }
}

async function dbFetchEntryTrucks() {
  try {
    const { data, error } = await dbClient.from('entry_trucks').select('*').order('arrival_time', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching entry trucks:', err);
    return null;
  }
}

async function dbFetchBackyardRemovals() {
  try {
    const { data, error } = await dbClient.from('backyard_removals').select('*').order('removed_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching backyard removals:', err);
    return null;
  }
}

async function _directInsertTruck(truck) {
  try {
    const { error } = await dbClient.from('entry_trucks').insert([truck]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directInsertTruck:', err);
    return false;
  }
}

async function _directUpdateTruck(id, updates) {
  try {
    const { error } = await dbClient.from('entry_trucks').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directUpdateTruck:', err);
    return false;
  }
}

async function _directInsertBackyardRemoval(record) {
  try {
    const { error } = await dbClient.from('backyard_removals').insert([record]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directInsertBackyardRemoval:', err);
    return false;
  }
}

async function dbInsertTruck(truck) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_TRUCK', truck);
    if (typeof showToast === 'function') showToast('Truck saved locally — will sync when online', 'info');
    return true;
  }
  return _directInsertTruck(truck);
}

async function dbUpdateTruck(id, updates) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('UPDATE_TRUCK', { id, updates });
    return true;
  }
  return _directUpdateTruck(id, updates);
}

async function dbInsertBackyardRemoval(record) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_BACKYARD', record);
    if (typeof showToast === 'function') showToast('Removal saved locally — will sync when online', 'info');
    return true;
  }
  return _directInsertBackyardRemoval(record);
}

// ============================================================
// DIRECT WRITE FUNCTIONS (used by OfflineQueue.sync and when online)
// These go straight to Supabase — no queue check.
// ============================================================

async function _directUpdateBin(id, updates) {
  try {
    const { error } = await dbClient.from('bins').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`_directUpdateBin ${id}:`, err);
    return false;
  }
}

async function _directUpdateIntake(intakeId, updates, allocations = []) {
  try {
    const { error: upErr } = await dbClient.from('intakes').update(updates).eq('id', intakeId);
    if (upErr) throw upErr;
    // Delete old allocations and insert new ones
    const { error: delErr } = await dbClient.from('intake_allocations').delete().eq('intake_id', intakeId);
    if (delErr) throw delErr;
    if (allocations && allocations.length > 0) {
      const { error: allocErr } = await dbClient.from('intake_allocations').insert(allocations);
      if (allocErr) throw allocErr;
    }
    return true;
  } catch (err) {
    console.error('_directUpdateIntake:', err);
    return false;
  }
}

async function _directInsertIntake(intake, allocations = []) {
  try {
    const { error: intakeError } = await dbClient.from('intakes').insert([intake]);
    if (intakeError) throw intakeError;
    if (allocations && allocations.length > 0) {
      const { error: allocError } = await dbClient.from('intake_allocations').insert(allocations);
      if (allocError) throw allocError;
    }
    return true;
  } catch (err) {
    console.error('_directInsertIntake:', err);
    return false;
  }
}

async function _directInsertDispatch(dispatch) {
  try {
    const { error } = await dbClient.from('dispatches').insert([dispatch]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directInsertDispatch:', err);
    return false;
  }
}

async function _directInsertMaintenance(record) {
  try {
    const { data, error } = await dbClient.from('maintenance_logs').insert([record]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('_directInsertMaintenance:', err);
    return null;
  }
}

async function _directInsertLabor(record) {
  try {
    const { data, error } = await dbClient.from('labor_logs').insert([record]).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('_directInsertLabor:', err);
    return null;
  }
}

async function _directInsertBinHistory(record) {
  try {
    const { error } = await dbClient.from('bin_history').insert([record]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directInsertBinHistory:', err);
    return false;
  }
}

async function _directLogActivity(action_type, description) {
  try {
    const { error } = await dbClient.from('activity_logs').insert([{ action_type, description }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('_directLogActivity:', err);
    return false;
  }
}

// ============================================================
// PUBLIC WRITE FUNCTIONS
// Check navigator.onLine — if offline, queue the write and
// return true immediately (optimistic update) so the UI stays
// responsive. The queue auto-syncs when connectivity returns.
// ============================================================

async function dbUpdateBin(id, updates) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('UPDATE_BIN', { id, updates });
    if (typeof showToast === 'function') showToast('Saved locally — will sync when online', 'info');
    return true;
  }
  const ok = await _directUpdateBin(id, updates);
  if (!ok && typeof showToast === 'function') showToast(`Failed to update bin: check connection`, 'error');
  return ok;
}

async function dbInsertIntake(intake, allocations = []) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_INTAKE', { intake, allocations });
    if (typeof showToast === 'function') showToast('Intake saved locally — will sync when online', 'info');
    return true;
  }
  const ok = await _directInsertIntake(intake, allocations);
  if (!ok && typeof showToast === 'function') showToast(`Failed to save intake: check connection`, 'error');
  return ok;
}

async function dbUpdateIntake(intakeId, updates, allocations = []) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('UPDATE_INTAKE', { intakeId, updates, allocations });
    if (typeof showToast === 'function') showToast('Intake update saved locally — will sync when online', 'info');
    return true;
  }
  const ok = await _directUpdateIntake(intakeId, updates, allocations);
  if (!ok && typeof showToast === 'function') showToast('Failed to update intake: check connection', 'error');
  return ok;
}

async function dbInsertDispatch(dispatch) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_DISPATCH', dispatch);
    if (typeof showToast === 'function') showToast('Dispatch saved locally — will sync when online', 'info');
    return true;
  }
  const ok = await _directInsertDispatch(dispatch);
  if (!ok && typeof showToast === 'function') showToast(`Failed to save dispatch: check connection`, 'error');
  return ok;
}

async function dbInsertMaintenance(record) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_MAINTENANCE', record);
    if (typeof showToast === 'function') showToast('Log saved locally — will sync when online', 'info');
    // Return a fake record so the app can add it to local state immediately
    return { ...record, id: `LOCAL-${Date.now()}` };
  }
  const result = await _directInsertMaintenance(record);
  if (!result && typeof showToast === 'function') showToast(`Failed to save maintenance log`, 'error');
  return result;
}

async function dbInsertLabor(record) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_LABOR', record);
    if (typeof showToast === 'function') showToast('Log saved locally — will sync when online', 'info');
    return { ...record, id: `LOCAL-${Date.now()}` };
  }
  const result = await _directInsertLabor(record);
  if (!result && typeof showToast === 'function') showToast(`Failed to save labor log`, 'error');
  return result;
}

async function dbInsertBinHistory(record) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('INSERT_BIN_HISTORY', record);
    return true;
  }
  return _directInsertBinHistory(record);
}

async function dbLogActivity(action_type, description) {
  if (!navigator.onLine) {
    OfflineQueue.enqueue('LOG_ACTIVITY', { action_type, description });
    return true;
  }
  return _directLogActivity(action_type, description);
}

// ============================================================
// AUTHENTICATION FUNCTIONS
// ============================================================

async function dbLogin(email, password) {
  try {
    const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  } catch(err) {
    console.error('Login error:', err);
    if(typeof toast === 'function') toast(err.message, 'error');
    const errEl = document.getElementById('login-error');
    if(errEl) { errEl.textContent = err.message; errEl.style.display = 'block'; }
    return false;
  }
}

async function dbLogout() {
  try {
    const { error } = await dbClient.auth.signOut();
    if(error) throw error;
    if(window.Store) window.Store.reset();
    window.location.reload();
  } catch(err) {
    console.error('Logout error:', err);
    if(typeof toast === 'function') toast('Failed to log out.', 'error');
  }
}

// Global functions for the HTML buttons
window.doLogin = async function() {
  const email = document.getElementById('login-email').value;
  const pass  = document.getElementById('login-password').value;
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  if(errEl) errEl.style.display = 'none';
  if(!email || !pass) {
    if(errEl) { errEl.textContent = 'Please enter both email and password.'; errEl.style.display = 'block'; }
    return;
  }
  if(btn) { btn.innerText = 'Signing in...'; btn.disabled = true; }

  const success = await dbLogin(email, pass);
  if (success) {
    if(typeof bootApp === 'function') bootApp();
  } else {
    if(btn) { btn.innerText = 'Sign In'; btn.disabled = false; }
  }
};

window.doLogout = function() { dbLogout(); };
