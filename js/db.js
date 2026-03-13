// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================

const SUPABASE_URL = 'https://gnujlntvcdwtwdnsgobj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWpsbnR2Y2R3dHdkbnNnb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ4MTQsImV4cCI6MjA4ODg3MDgxNH0.34RcfWe6HknwHr_nTXjSPaHflqKanW-2JmckixlR06c';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Fetch Functions ---

async function dbFetchBins() {
  const { data, error } = await supabase.from('bins').select('*').order('id', { ascending: true });
  if (error) { console.error('Error fetching bins:', error); return null; }
  return data;
}

async function dbFetchIntakes() {
  const { data, error } = await supabase.from('intakes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching intakes:', error); return null; }
  return data;
}

async function dbFetchDispatches() {
  const { data, error } = await supabase.from('dispatches').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching dispatches:', error); return null; }
  return data;
}

async function dbFetchMaintenance() {
  const { data, error } = await supabase.from('maintenance_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching maintenance:', error); return null; }
  return data;
}

async function dbFetchLabor() {
  const { data, error } = await supabase.from('labor_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching labor:', error); return null; }
  return data;
}

// --- Mutation Functions ---

async function dbUpdateBin(id, updates) {
  const { error } = await supabase.from('bins').update(updates).eq('id', id);
  if (error) { console.error(`Error updating bin ${id}:`, error); return false; }
  return true;
}

async function dbInsertIntake(intake, allocations = []) {
  // Insert intake record
  const { error: intakeError } = await supabase.from('intakes').insert([intake]);
  if (intakeError) { console.error('Error inserting intake:', intakeError); return false; }
  
  // Insert allocations if any
  if (allocations && allocations.length > 0) {
    const { error: allocError } = await supabase.from('intake_allocations').insert(allocations);
    if (allocError) { console.error('Error inserting allocations:', allocError); return false; }
  }
  
  return true;
}

async function dbInsertDispatch(dispatch) {
  const { error } = await supabase.from('dispatches').insert([dispatch]);
  if (error) { console.error('Error inserting dispatch:', error); return false; }
  return true;
}

async function dbInsertMaintenance(record) {
  const { error } = await supabase.from('maintenance_logs').insert([record]);
  if (error) { console.error('Error inserting maintenance record:', error); return false; }
  return true;
}

async function dbInsertLabor(record) {
  const { error } = await supabase.from('labor_logs').insert([record]);
  if (error) { console.error('Error inserting labor record:', error); return false; }
  return true;
}

// Helper to log activities (for Analytics / Export)
async function dbLogActivity(action_type, description) {
  const { error } = await supabase.from('activity_logs').insert([{ action_type, description }]);
  if (error) { console.error('Error logging activity:', error); return false; }
  return true;
}
