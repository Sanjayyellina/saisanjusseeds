// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================
"use strict";

const SUPABASE_URL = 'https://gnujlntvcdwtwdnsgobj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWpsbnR2Y2R3dHdkbnNnb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ4MTQsImV4cCI6MjA4ODg3MDgxNH0.34RcfWe6HknwHr_nTXjSPaHflqKanW-2JmckixlR06c';

// Initialize Supabase client
const dbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Fetch Functions ---

/**
 * Fetches all bins from the 'bins' table, ordered by ID.
 * @returns {Promise<Array<Object>|null>} Array of bin objects or null on error.
 */
async function dbFetchBins() {
  try {
    const { data, error } = await dbClient.from('bins').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching bins:', err);
    if (typeof showToast === 'function') showToast('Failed to fetch bins from database.', 'error');
    return null;
  }
}

/**
 * Fetches all intake records from the 'intakes' table, ordered by creation date descending.
 * @returns {Promise<Array<Object>|null>} Array of intake objects or null on error.
 */
async function dbFetchIntakes() {
  try {
    const { data, error } = await dbClient.from('intakes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching intakes:', err);
    return null;
  }
}

/**
 * Fetches all dispatch records from the 'dispatches' table, ordered by creation date descending.
 * @returns {Promise<Array<Object>|null>} Array of dispatch objects or null on error.
 */
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

/**
 * Fetches all maintenance logs from the 'maintenance_logs' table, ordered by date descending.
 * @returns {Promise<Array<Object>|null>} Array of maintenance log objects or null on error.
 */
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

/**
 * Fetches all labor logs from the 'labor_logs' table, ordered by date descending.
 * @returns {Promise<Array<Object>|null>} Array of labor log objects or null on error.
 */
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

// --- Mutation Functions ---

async function dbUpdateBin(id, updates) {
  try {
    const { error } = await dbClient.from('bins').update(updates).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error(`Error updating bin ${id}:`, err);
    if (typeof showToast === 'function') showToast(`Failed to update bin: ${err.message}`, 'error');
    return false;
  }
}

async function dbInsertIntake(intake, allocations = []) {
  try {
    // Insert intake record
    const { error: intakeError } = await dbClient.from('intakes').insert([intake]);
    if (intakeError) throw intakeError;
    
    // Insert allocations if any
    if (allocations && allocations.length > 0) {
      const { error: allocError } = await dbClient.from('intake_allocations').insert(allocations);
      if (allocError) throw allocError;
    }
    
    return true;
  } catch (err) {
    console.error('Error inserting intake:', err);
    if (typeof showToast === 'function') showToast(`DB Error: ${err.message}`, 'error');
    return false;
  }
}

async function dbInsertDispatch(dispatch) {
  try {
    const { error } = await dbClient.from('dispatches').insert([dispatch]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error inserting dispatch:', err);
    if (typeof showToast === 'function') showToast(`Failed to save dispatch: ${err.message}`, 'error');
    return false;
  }
}

async function dbInsertMaintenance(record) {
  try {
    const { error } = await dbClient.from('maintenance_logs').insert([record]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error inserting maintenance record:', err);
    if (typeof showToast === 'function') showToast(`Failed to save maintenance: ${err.message}`, 'error');
    return false;
  }
}

async function dbInsertLabor(record) {
  try {
    const { error } = await dbClient.from('labor_logs').insert([record]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error inserting labor record:', err);
    if (typeof showToast === 'function') showToast(`Failed to save labor: ${err.message}`, 'error');
    return false;
  }
}

// Helper to log activities (for Analytics / Export)
async function dbLogActivity(action_type, description) {
  try {
    const { error } = await dbClient.from('activity_logs').insert([{ action_type, description }]);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error logging activity:', err);
    return false;
  }
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
  const pass = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');
  
  if(errEl) errEl.style.display = 'none';
  if(!email || !pass) {
    if(errEl) { errEl.textContent = 'Please enter both email and password.'; errEl.style.display = 'block'; }
    return;
  }
  
  if(btn) {
    btn.innerText = 'Signing in...';
    btn.disabled = true;
  }
  
  const success = await dbLogin(email, pass);
  if (success) {
    document.getElementById('login-screen').style.display = 'none';
    if(typeof initApp === 'function') initApp(); 
  } else {
    if(btn) {
      btn.innerText = 'Sign In';
      btn.disabled = false;
    }
  }
}

window.doLogout = function() {
  dbLogout();
}
