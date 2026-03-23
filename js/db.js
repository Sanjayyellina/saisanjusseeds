// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================

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

function hasSupabaseConfig() {
  return !!readSavedSupabaseConfig();
}

function createSupabaseClient(url, key) {
  return window.supabase.createClient(url, key);
}

function getSupabaseClient() {
  if (window._supabase) return window._supabase;

  const savedConfig = readSavedSupabaseConfig();
  if (!savedConfig) {
    throw new Error('Supabase is not configured yet. Please connect your database first.');
  }

  window._supabase = createSupabaseClient(savedConfig.url, savedConfig.key);
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

async function validateSupabaseConnection(client = getSupabaseClient()) {
  const { error } = await client.from('bins').select('id', { head: true, count: 'exact' }).limit(1);
  if (error) throw error;
  return true;
}

function explainDbError(error, fallback = 'Database request failed.') {
  if (!error) return fallback;

  return error.message || error.details || error.hint || fallback;
}

function isSchemaMismatchError(error) {
  if (!error) return false;
  const text = `${error.code || ''} ${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return [
    'could not find',
    'schema cache',
    'column',
    'unknown',
    'invalid input syntax',
    'does not exist',
    'uuid',
    'bigint',
    'integer'
  ].some(token => text.includes(token));
}

async function insertRecord(table, record, fallbackRecords = []) {
  const client = getSupabaseClient();
  const attempts = [record, ...fallbackRecords];
  let lastError = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const payload = attempts[index];
    const { error } = await client.from(table).insert([payload]);
    if (!error) return payload;

    lastError = error;
    if (!isSchemaMismatchError(error) || index === attempts.length - 1) break;
    console.warn(`Retrying ${table} insert with fallback payload`, error);
  }

  throw lastError;
}

// --- Fetch Functions ---

async function dbFetchBins() {
  const { data, error } = await getSupabaseClient().from('bins').select('*').order('id', { ascending: true });
  if (error) { console.error('Error fetching bins:', error); throw error; }
  return data;
}

async function dbFetchIntakes() {
  const { data, error } = await getSupabaseClient().from('intakes').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching intakes:', error); return []; }
  return data;
}

async function dbFetchDispatches() {
  const { data, error } = await getSupabaseClient().from('dispatches').select('*').order('created_at', { ascending: false });
  if (error) { console.error('Error fetching dispatches:', error); return []; }
  return data;
}

async function dbFetchMaintenance() {
  const { data, error } = await getSupabaseClient().from('maintenance_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching maintenance:', error); return []; }
  return data;
}

async function dbFetchLabor() {
  const { data, error } = await getSupabaseClient().from('labor_logs').select('*').order('date', { ascending: false });
  if (error) { console.error('Error fetching labor:', error); return []; }
  return data;
}

// --- Mutation Functions ---

async function dbUpdateBin(id, updates) {
  const { error } = await getSupabaseClient().from('bins').update(updates).eq('id', id);
  if (error) throw error;
  return true;
}

async function dbInsertIntake(intake, allocations = []) {
  const savedIntake = await insertRecord('intakes', intake, [
    {
      challan: intake.challan,
      vehicle: intake.vehicle,
      location: intake.location,
      company: intake.company,
      hybrid: intake.hybrid,
      lot: intake.lot,
      qty: intake.qty,
      pkts: intake.pkts,
      entry_moisture: intake.entry_moisture,
      lr: intake.lr,
      remarks: intake.remarks,
      vehicle_weight: intake.vehicle_weight,
      gross_weight: intake.gross_weight,
      net_weight: intake.net_weight
    }
  ]);

  if (allocations && allocations.length > 0) {
    const intakeId = savedIntake?.id || intake.id;
    if (intakeId) {
      const allocationPayloads = allocations.map(allocation => ({
        intake_id: intakeId,
        bin_id: allocation.bin_id,
        qty: allocation.qty,
        pkts: allocation.pkts
      }));

      const { error: allocError } = await getSupabaseClient().from('intake_allocations').insert(allocationPayloads);
      if (allocError) {
        console.warn('Intake saved, but allocations could not be saved:', allocError);
      }
    }
  }

  return savedIntake;
}

async function dbInsertDispatch(dispatch) {
  return insertRecord('dispatches', dispatch, [{
    receipt_id: dispatch.receipt_id,
    party: dispatch.party,
    address: dispatch.address,
    vehicle: dispatch.vehicle,
    lr: dispatch.lr,
    hybrid: dispatch.hybrid,
    lot: dispatch.lot,
    bin_id: dispatch.bin_id,
    bags: dispatch.bags,
    qty: dispatch.qty,
    moisture: dispatch.moisture,
    amount: dispatch.amount,
    remarks: dispatch.remarks,
    hash: dispatch.hash,
    signature: dispatch.signature
  }]);
}

async function dbInsertMaintenance(record) {
  return insertRecord('maintenance_logs', record);
}

async function dbInsertLabor(record) {
  return insertRecord('labor_logs', record);
}

// Helper to log activities (for Analytics / Export)
async function dbLogActivity(action_type, description) {
  try {
    await getSupabaseClient().from('activity_logs').insert([{ action_type, description }]);
  } catch (error) {
    console.warn('Activity log insert skipped:', error);
  }
  return true;
}
