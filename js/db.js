// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================

const DEFAULT_SUPABASE_URL = 'https://gnujlntvcdwtwdnsgobj.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWpsbnR2Y2R3dHdkbnNnb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ4MTQsImV4cCI6MjA4ODg3MDgxNH0.34RcfWe6HknwHr_nTXjSPaHflqKanW-2JmckixlR06c';
const SUPABASE_CONFIG_STORAGE_KEY = 'yellina_supabase_config';

function readSavedSupabaseConfig() {
  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.url && parsed?.key) return parsed;
  } catch (error) {
    console.warn('Unable to read saved Supabase config:', error);
  }

  return null;
}

function saveSupabaseConfig(config) {
  if (!config?.url || !config?.key) return;
  localStorage.setItem(SUPABASE_CONFIG_STORAGE_KEY, JSON.stringify({
    url: config.url,
    key: config.key
  }));
}

function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_CONFIG_STORAGE_KEY);
}

function createSupabaseClient(url, key) {
  return window.supabase.createClient(url, key);
}

function getSupabaseClient() {
  if (window._supabase) return window._supabase;

  const savedConfig = readSavedSupabaseConfig();
  const activeConfig = savedConfig || { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_KEY };
  window._supabase = createSupabaseClient(activeConfig.url, activeConfig.key);
  return window._supabase;
}

function configureSupabaseClient(url, key, persist = true) {
  window._supabase = createSupabaseClient(url, key);
  if (persist) saveSupabaseConfig({ url, key });
  return window._supabase;
}

function resetSupabaseClient() {
  window._supabase = null;
  clearSupabaseConfig();
}

// --- Fetch Functions ---

async function dbFetchBins() {
  const { data, error } = await getSupabaseClient().from('bins').select('*').order('id', { ascending: true });
  if (error) { console.error('Error fetching bins:', error); return null; }
  return data;
}

async function dbFetchIntakes() {
  const { data, error } = await getSupabaseClient().from('intakes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching intakes:', error); return null; }
  return data;
}

async function dbFetchDispatches() {
  const { data, error } = await getSupabaseClient().from('dispatches').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching dispatches:', error); return null; }
  return data;
}

async function dbFetchMaintenance() {
  const { data, error } = await getSupabaseClient().from('maintenance_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching maintenance:', error); return null; }
  return data;
}

async function dbFetchLabor() {
  const { data, error } = await getSupabaseClient().from('labor_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching labor:', error); return null; }
  return data;
}

// --- Mutation Functions ---

async function dbUpdateBin(id, updates) {
  const { error } = await getSupabaseClient().from('bins').update(updates).eq('id', id);
  if (error) { console.error(`Error updating bin ${id}:`, error); return false; }
  return true;
}

async function dbInsertIntake(intake, allocations = []) {
  const client = getSupabaseClient();

  const { error: intakeError } = await client.from('intakes').insert([intake]);
  if (intakeError) { console.error('Error inserting intake:', intakeError); return false; }
  
  if (allocations && allocations.length > 0) {
    const { error: allocError } = await client.from('intake_allocations').insert(allocations);
    if (allocError) { console.error('Error inserting allocations:', allocError); return false; }
  }
  
  return true;
}

async function dbInsertDispatch(dispatch) {
  const { error } = await getSupabaseClient().from('dispatches').insert([dispatch]);
  if (error) { console.error('Error inserting dispatch:', error); return false; }
  return true;
}

async function dbInsertMaintenance(record) {
  const { error } = await getSupabaseClient().from('maintenance_logs').insert([record]);
  if (error) { console.error('Error inserting maintenance record:', error); return false; }
  return true;
}

async function dbInsertLabor(record) {
  const { error } = await getSupabaseClient().from('labor_logs').insert([record]);
  if (error) { console.error('Error inserting labor record:', error); return false; }
  return true;
}

// Helper to log activities (for Analytics / Export)
async function dbLogActivity(action_type, description) {
  const { error } = await getSupabaseClient().from('activity_logs').insert([{ action_type, description }]);
  if (error) { console.error('Error logging activity:', error); return false; }
  return true;
}
