// ============================================================
// INITIALISATION & BOOT
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

async function initApp() {
  document.getElementById('dash-date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

  if (!hasSupabaseConfig()) {
    document.getElementById('config-banner').style.display = 'flex';
    return;
  }

  try {
    const bins = await dbFetchBins();
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
        intakeDate: b.intake_date_ts ? new Date(parseInt(b.intake_date_ts)).toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}) : ''
      }));
    }

    const intakes = await dbFetchIntakes();
    if (intakes) {
      state.intakes = intakes.map(i => ({
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
        dateTS: new Date(i.created_at).getTime(),
        date: new Date(i.created_at).toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
      }));
    }

    const dispatches = await dbFetchDispatches();
    if (dispatches) {
      state.dispatches = dispatches.map(d => ({
        receiptId: d.receipt_id,
        party: d.party,
        address: d.address || '',
        vehicle: d.vehicle,
        lr: d.lr || '',
        hybrid: d.hybrid,
        lot: d.lot || '',
        binId: d.bin_id,
        bags: parseInt(d.bags) || 0,
        qty: parseFloat(d.qty) || 0,
        amount: parseFloat(d.amount) || 0,
        remarks: d.remarks || '',
        hash: d.hash || '',
        signature: d.signature || '',
        dateTS: new Date(d.created_at).getTime(),
        date: new Date(d.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'})
      }));
      if (state.dispatches.length > 0) {
        const maxReceipt = Math.max(...state.dispatches.map(d => parseInt(d.receipt_id.split('-')[2]) || 0));
        state.receiptCounter = Math.max(1001, maxReceipt + 1);
      }
    }

    const maint = await dbFetchMaintenance();
    if (maint) {
      state.maintenance = maint;
    }

    const labor = await dbFetchLabor();
    if (labor) {
      state.labor = labor;
    }

    renderDashboard();
  } catch (error) {
    console.error('App initialization failed:', error);
    document.getElementById('config-banner').style.display = 'flex';
    toast(explainDbError(error, 'Unable to load data from Supabase. Please reconnect your database.'), 'error');
  }
}

initApp();
