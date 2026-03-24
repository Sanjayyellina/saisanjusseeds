// ============================================================
// SUPABASE CLIENT & DB FUNCTIONS
// ============================================================

const SUPABASE_URL = 'https://gnujlntvcdwtwdnsgobj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudWpsbnR2Y2R3dHdkbnNnb2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyOTQ4MTQsImV4cCI6MjA4ODg3MDgxNH0.34RcfWe6HknwHr_nTXjSPaHflqKanW-2JmckixlR06c';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getSupabaseClient() {
  return window._supabase || supabase;
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

  const intakePayloadVariants = [
    intake,
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
      net_weight: intake.net_weight,
      created_at: intake.created_at,
      updated_at: intake.updated_at
    },
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
  ];

  let lastError = null;
  let insertedIntakeId = intake.id;

  for (const payload of intakePayloadVariants) {
    const { data, error } = await client.from('intakes').insert([payload]).select('id').maybeSingle();
    if (!error) {
      insertedIntakeId = data && data.id ? data.id : insertedIntakeId;
      lastError = null;
      break;
    }

    // Some projects allow insert but block select on the inserted row.
    const { error: plainInsertError } = await client.from('intakes').insert([payload]);
    if (!plainInsertError) {
      lastError = null;
      break;
    }

    lastError = error;
    console.warn('Intake insert attempt failed, retrying with fallback payload:', error);
  }

  if (lastError) {
    console.error('Error inserting intake:', lastError);
    return false;
  }

  if (allocations && allocations.length > 0) {
    const allocationRows = allocations.map(a => ({
      intake_id: insertedIntakeId,
      bin_id: a.bin_id,
      qty: a.qty,
      pkts: a.pkts
    }));

    const { error: allocError } = await client.from('intake_allocations').insert(allocationRows);
    if (allocError) {
      console.warn('Intake saved, but allocations were not saved:', allocError);
    }
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
