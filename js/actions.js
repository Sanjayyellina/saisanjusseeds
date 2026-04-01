// ============================================================
// ACTIONS & EVENT HANDLERS
"use strict";
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// ACTIONS
// ================================================================

function toggleSidebar() {
  if (window.innerWidth <= 992) {
    // Mobile: off-canvas slide-in
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  } else {
    // Desktop: collapse sidebar + shift main content
    document.body.classList.toggle('sidebar-collapsed');
  }
}

let _editingIntakeId = null;

function openIntakeModal() {
  _editingIntakeId = null;
  document.getElementById('i-bin-rows').innerHTML = '';
  addIntakeBinRow();
  document.getElementById('i-vehicle-rows').innerHTML = '';
  addVehicleRow();
  document.getElementById('i-lr-rows').innerHTML = '';
  addLRRow();
  document.getElementById('i-lot-rows').innerHTML = '';
  addLotRow();
  ['i-challan','i-location','i-hybrid','i-moisture','i-remarks','i-datetime'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('i-company').value = '';
  document.querySelector('#intake-modal .modal-title').textContent = 'New Intake Entry';
  document.querySelector('#intake-modal .btn-solid span').textContent = 'Save Intake';
  openModal('intake-modal');
}

function openEditIntakeModal(intakeId) {
  const intake = state.intakes.find(i => i.id === intakeId);
  if (!intake) { toast('Intake not found', 'error'); return; }
  _editingIntakeId = intakeId;

  // Fill form fields
  document.getElementById('i-challan').value = intake.challan || '';
  document.getElementById('i-location').value = intake.location || '';
  document.getElementById('i-company').value = intake.company || '';
  document.getElementById('i-hybrid').value = intake.hybrid || '';
  document.getElementById('i-moisture').value = intake.entryMoisture || '';
  document.getElementById('i-remarks').value = intake.remarks || '';
  document.getElementById('i-datetime').value = '';

  // Populate vehicle rows with units
  document.getElementById('i-vehicle-rows').innerHTML = '';
  const vehicles = (intake.vehicle || '').split(',').map(v => v.trim()).filter(Boolean);
  const vehWeightParts = (String(intake.vehicleWeight || '')).split(',').map(v => v.trim());
  const grossWeightParts = (String(intake.grossWeight || '')).split(',').map(v => v.trim());
  if (vehicles.length === 0) vehicles.push('');
  vehicles.forEach((v, idx) => {
    addVehicleRow();
    const allVRows = document.querySelectorAll('.i-vehicle-row');
    const lastRow = allVRows[allVRows.length - 1];
    lastRow.querySelector('.i-vehicle-input').value = v;
    // Parse weight and unit (e.g. "39470 kg" or just "39470")
    const vwVal = (vehWeightParts[idx] || '').replace(/[^\d.]/g, '');
    lastRow.querySelector('.i-veh-weight-input').value = vwVal;
    const gwVal = (grossWeightParts[idx] || '').replace(/[^\d.]/g, '');
    lastRow.querySelector('.i-gross-weight-input').value = gwVal;
  });

  // Populate LR rows
  document.getElementById('i-lr-rows').innerHTML = '';
  const lrs = (intake.lr || '').split(',').map(l => l.trim()).filter(Boolean);
  if (lrs.length === 0) lrs.push('');
  lrs.forEach(lr => {
    addLRRow();
    const allLRRows = document.querySelectorAll('.i-lr-row');
    const lastRow = allLRRows[allLRRows.length - 1];
    lastRow.querySelector('.i-lr-input').value = lr;
  });

  // Populate lot rows with qty and bags
  document.getElementById('i-lot-rows').innerHTML = '';
  const lotsArr = intake.lots && Array.isArray(intake.lots) ? intake.lots : [];
  if (lotsArr.length === 0) {
    // Fallback for old data: single lot field
    const oldLots = (intake.lot || '').split(',').map(l => l.trim()).filter(Boolean);
    if (oldLots.length > 0) {
      oldLots.forEach((l, idx) => {
        addLotRow();
        const allLotRows = document.querySelectorAll('.i-lot-row');
        const lastRow = allLotRows[allLotRows.length - 1];
        lastRow.querySelector('.i-lot-input').value = l;
        if (idx === 0) {
          lastRow.querySelector('.i-lot-qty').value = intake.qty || '';
          lastRow.querySelector('.i-lot-bags').value = intake.pkts || '';
        }
      });
    } else {
      addLotRow();
    }
  } else {
    lotsArr.forEach(l => {
      addLotRow();
      const allLotRows = document.querySelectorAll('.i-lot-row');
      const lastRow = allLotRows[allLotRows.length - 1];
      lastRow.querySelector('.i-lot-input').value = l.lot || '';
      lastRow.querySelector('.i-lot-qty').value = l.qty || '';
      lastRow.querySelector('.i-lot-bags').value = l.bags || '';
    });
  }

  // Populate bin allocation rows with units
  document.getElementById('i-bin-rows').innerHTML = '';
  const allocs = intake.allocations && intake.allocations.length ? intake.allocations : intake.bins.map(b => ({ binId: b, qty: intake.qty, pkts: intake.pkts }));
  allocs.forEach(a => {
    addIntakeBinRow();
    const allBinRows = document.querySelectorAll('.i-bin-row');
    const lastRow = allBinRows[allBinRows.length - 1];
    lastRow.querySelector('.i-bin-select').value = a.binId;
    lastRow.querySelector('.i-bin-qty').value = a.qty || '';
    lastRow.querySelector('.i-bin-pkts').value = a.pkts || '';
  });

  document.querySelector('#intake-modal .modal-title').textContent = 'Edit Intake';
  document.querySelector('#intake-modal .btn-solid span').textContent = 'Update Intake';
  openModal('intake-modal');
}

function openDispatchModal() {
  document.getElementById('d-bin-rows').innerHTML = '';
  addDispatchBinRow();
  document.getElementById('d-lot-rows').innerHTML = '';
  addDispatchLotRow();
  ['d-party','d-address','d-vehicle','d-hybrid','d-bags','d-qty','d-moisture','d-amount','d-lr','d-remarks','d-datetime'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  openModal('dispatch-modal');
}

function addDispatchLotRow() {
  const container = document.getElementById('d-lot-rows');
  if (!container) return;
  const row = document.createElement('div');
  row.className = 'form-row cols1 d-lot-row';
  row.style.cssText = 'align-items:flex-end;margin-bottom:6px;';
  row.innerHTML = `
    <div class="form-group" style="position:relative;">
      <div style="display:flex;gap:8px;">
        <input class="form-input d-lot-input" placeholder="e.g. 255202" style="flex:1;">
        <button class="btn btn-ghost" style="padding:0 10px;flex-shrink:0;" onclick="this.closest('.d-lot-row').remove()" title="Remove">✕</button>
      </div>
    </div>`;
  container.appendChild(row);
}

function addDispatchBinRow() {
  const container = document.getElementById('d-bin-rows');
  const row = document.createElement('div');
  row.className = 'form-row cols3 d-bin-row mt8';
  row.style.alignItems = 'flex-end';
  row.style.marginTop = '8px';

  const activeBins = state.bins.filter(b => b.status !== 'empty');
  let options = '<option value="">— Select bin —</option>';
  activeBins.forEach(b => {
    options += `<option value="${b.id}">BIN-${b.binLabel||b.id} — ${b.hybrid||'?'} (${b.qty||0}T)</option>`;
  });

  row.innerHTML = `
    <div class="form-group"><label class="form-label">From Bin *</label><select class="form-select d-bin-select">${options}</select></div>
    <div class="form-group"><label class="form-label">Bags from this Bin *</label><input class="form-input d-bin-bags" type="number" placeholder="e.g. 100"></div>
    <div class="form-group" style="position:relative;">
      <label class="form-label">Qty from this Bin (Kg)</label>
      <div style="display:flex; gap:8px;">
        <input class="form-input d-bin-qty" type="number" placeholder="e.g. 3500" style="flex:1;">
        <button class="btn btn-ghost" style="padding:0 8px;" onclick="this.closest('.d-bin-row').remove()">✕</button>
      </div>
    </div>
  `;
  container.appendChild(row);
}

function addVehicleRow() {
  const container = document.getElementById('i-vehicle-rows');
  const row = document.createElement('div');
  row.className = 'i-vehicle-row';
  row.style.marginTop = '8px';
  row.style.padding = '10px';
  row.style.border = '1px solid var(--surface-3)';
  row.style.borderRadius = 'var(--radius)';
  row.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-size:12px;color:var(--ink-4);font-weight:600;">Vehicle</span>
      <button class="btn btn-ghost" style="padding:2px 6px;height:auto;min-height:0;color:var(--red);font-size:12px;" onclick="this.closest('.i-vehicle-row').remove()">✕ Remove</button>
    </div>
    <div class="form-row cols3" style="align-items:flex-end;">
      <div class="form-group"><label class="form-label">Vehicle Number *</label><input class="form-input i-vehicle-input" placeholder="e.g. AP39WF7419" style="text-transform:uppercase;"></div>
      <div class="form-group">
        <label class="form-label">Vehicle Weight (Kg)</label>
        <input class="form-input i-veh-weight-input" type="number" placeholder="e.g. 8500">
      </div>
      <div class="form-group">
        <label class="form-label">Gross Weight (Kg)</label>
        <input class="form-input i-gross-weight-input" type="number" placeholder="e.g. 44500">
      </div>
    </div>`;
  container.appendChild(row);
}

function addLRRow() {
  const container = document.getElementById('i-lr-rows');
  const row = document.createElement('div');
  row.className = 'form-row cols1 i-lr-row';
  row.style.alignItems = 'flex-end';
  row.style.marginTop = '8px';
  row.innerHTML = `
    <div class="form-group" style="position:relative;">
      <label class="form-label">LR Number</label>
      <div style="display:flex; gap:8px;">
        <input class="form-input i-lr-input" placeholder="LR No." style="flex:1;">
        <button class="btn btn-ghost" style="padding:0 8px;" onclick="this.closest('.i-lr-row').remove()">✕</button>
      </div>
    </div>`;
  container.appendChild(row);
}

function addLotRow() {
  const container = document.getElementById('i-lot-rows');
  const row = document.createElement('div');
  row.className = 'i-lot-row';
  row.style.marginTop = '8px';
  row.style.padding = '10px';
  row.style.border = '1px solid var(--surface-3)';
  row.style.borderRadius = 'var(--radius)';
  row.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
      <span style="font-size:12px;color:var(--ink-4);font-weight:600;">Lot</span>
      <button type="button" class="btn btn-ghost" style="padding:2px 6px;height:auto;min-height:0;color:var(--red);font-size:12px;" onclick="removeLotRow(this)">✕ Remove</button>
    </div>
    <div class="form-row cols3" style="align-items:flex-end;">
      <div class="form-group"><label class="form-label">Lot No</label><input class="form-input i-lot-input" placeholder="e.g. 025042"></div>
      <div class="form-group">
        <label class="form-label">Quantity (Kg) *</label>
        <input class="form-input i-lot-qty" type="number" step="0.1" placeholder="e.g. 35500">
      </div>
      <div class="form-group"><label class="form-label">No. of Bags</label><input class="form-input i-lot-bags" type="number" placeholder="e.g. 92"></div>
    </div>`;
  container.appendChild(row);
}

function removeLotRow(btn) {
  const row = btn.closest('.i-lot-row');
  const container = document.getElementById('i-lot-rows');
  if (container.querySelectorAll('.i-lot-row').length > 1) {
    row.remove();
  } else {
    row.querySelector('.i-lot-input').value = '';
    row.querySelector('.i-lot-qty').value = '';
    row.querySelector('.i-lot-bags').value = '';
  }
}

function addIntakeBinRow() {
  const container = document.getElementById('i-bin-rows');
  const row = document.createElement('div');
  row.className = 'form-row cols3 i-bin-row mt8';
  row.style.alignItems = 'flex-end';
  row.style.marginTop = '8px';
  
  let options = '<option value="">— Select bin —</option>';
  state.bins.forEach(b => {
    options += `<option value="${b.id}">BIN-${b.binLabel||b.id} (${b.status})</option>`;
  });

  row.innerHTML = `
    <div class="form-group"><label class="form-label">Assign to Bin *</label><select class="form-select i-bin-select">${options}</select></div>
    <div class="form-group">
      <label class="form-label">Allocated Qty (Kg) *</label>
      <input class="form-input i-bin-qty" type="number" step="0.1" placeholder="e.g. 10500">
    </div>
    <div class="form-group" style="position:relative;">
      <label class="form-label">Bags</label>
      <div style="display:flex; gap:8px;">
        <input class="form-input i-bin-pkts" type="number" placeholder="e.g. 20" style="flex:1;">
        <button class="btn btn-ghost" style="padding:0 8px;" onclick="this.closest('.i-bin-row').remove()">✕</button>
      </div>
    </div>
  `;
  container.appendChild(row);
}

/**
 * Reads form data from the Intake modal, constructs intake records and allocations,
 * and inserts them into the database while updating the relevant bin states.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the transaction and state updates are complete.
 */
async function saveIntake(){
  const challan=document.getElementById('i-challan').value.trim();
  const hybrid=document.getElementById('i-hybrid').value.trim();

  // Gather multiple vehicles (all in Kg)
  const vehicleRows = document.querySelectorAll('.i-vehicle-row');
  let vehicleNums = [], vehWeights = [], grossWeights = [];
  vehicleRows.forEach(r => {
    const v = (r.querySelector('.i-vehicle-input').value || '').trim().toUpperCase();
    if (v) {
      vehicleNums.push(v);
      vehWeights.push(parseFloat(r.querySelector('.i-veh-weight-input').value) || 0);
      grossWeights.push(parseFloat(r.querySelector('.i-gross-weight-input').value) || 0);
    }
  });
  const vehicle = vehicleNums.join(', ');

  // Gather multiple LR numbers
  const lrRows = document.querySelectorAll('.i-lr-row');
  let lrNums = [];
  lrRows.forEach(r => {
    const l = (r.querySelector('.i-lr-input').value || '').trim();
    if (l) lrNums.push(l);
  });
  const lr = lrNums.join(', ');

  // Gather multiple Lots with qty (Kg) and bags
  const lotRows = document.querySelectorAll('.i-lot-row');
  let lotsData = [];
  let totalQty = 0;
  let totalBags = 0;
  lotRows.forEach(r => {
    const lotNo = (r.querySelector('.i-lot-input').value || '').trim();
    const lotQty = parseFloat(r.querySelector('.i-lot-qty').value) || 0;
    const lotBags = parseInt(r.querySelector('.i-lot-bags').value) || 0;
    if (lotNo || lotQty) {
      lotsData.push({ lot: lotNo, qty: lotQty, unit: 'kg', bags: lotBags });
      totalQty += lotQty;
      totalBags += lotBags;
    }
  });
  const lot = lotsData.map(l => l.lot).filter(Boolean).join(', ');
  const qty = totalQty;
  const qtyUnit = 'kg';

  if(!challan||!vehicle||!hybrid||!qty){toast('Please fill all required fields — DR No, Vehicle, Hybrid, and at least one Lot with Qty','error');return;}
  if(qty<=0){toast('Total quantity must be greater than 0','error');return;}
  const moistureVal=parseFloat(document.getElementById('i-moisture').value);
  if(document.getElementById('i-moisture').value&&(moistureVal<0||moistureVal>60)){toast('Entry moisture must be between 0% and 60%','error');return;}

  // gather bin allocations (all in Kg)
  const rows = document.querySelectorAll('.i-bin-row');
  let allocations = [];
  let totalAllocated = 0;
  let allocError = false;

  rows.forEach(r => {
    const bId = r.querySelector('.i-bin-select').value;
    const bQty = parseFloat(r.querySelector('.i-bin-qty').value);
    const bPkts = parseInt(r.querySelector('.i-bin-pkts').value) || 0;

    if (bId && !isNaN(bQty)) {
      allocations.push({ binId: parseInt(bId), qty: bQty, unit: 'kg', pkts: bPkts });
      totalAllocated += bQty;
    } else if (bId || !isNaN(bQty)) {
        allocError = true;
    }
  });

  if (allocError) { toast('Please complete all Bin Assignment rows','error'); return; }
  if (allocations.length === 0) { toast('Please assign at least one bin','error'); return; }

  const isEdit = !!_editingIntakeId;
  const intakeId = isEdit ? _editingIntakeId : 'INT-'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();

  const dtInput=document.getElementById('i-datetime')?.value;
  const now=dtInput ? new Date(dtInput) : new Date();
  const dateStr=now.toISOString();

  const totalVehWeight = vehWeights.reduce((s, w) => s + w, 0);
  const totalGrossWeight = grossWeights.reduce((s, w) => s + w, 0);

  const intakeFields = {
      challan,
      vehicle,
      location: document.getElementById('i-location').value,
      company: document.getElementById('i-company').value,
      hybrid,
      lot,
      lots: lotsData,
      qty,
      qty_unit: qtyUnit,
      pkts: totalBags,
      entry_moisture: parseFloat(document.getElementById('i-moisture').value)||0,
      lr,
      remarks: document.getElementById('i-remarks').value,
      vehicle_weight: vehWeights.join(', '),
      gross_weight: grossWeights.join(', '),
      net_weight: 0
  };

  intakeFields.net_weight = totalGrossWeight && totalVehWeight ? totalGrossWeight - totalVehWeight : 0;

  const dbAllocations = allocations.map(a => ({
      intake_id: intakeId,
      bin_id: a.binId,
      qty: a.qty,
      qty_unit: a.unit || 'kg',
      pkts: a.pkts
  }));

  const btn = document.querySelector('#intake-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = isEdit ? 'Updating...' : 'Saving...';
  btn.disabled = true;

  let success;
  if (isEdit) {
    success = await dbUpdateIntake(intakeId, intakeFields, dbAllocations);
  } else {
    const intakeRecord = { id: intakeId, ...intakeFields, created_at: dateStr };
    success = await dbInsertIntake(intakeRecord, dbAllocations);
  }

  if (success) {
      const binIds = allocations.map(a => a.binId);

      if (isEdit) {
        // Revert old bins that were removed from this intake
        const oldIntake = state.intakes.find(i => i.id === intakeId);
        if (oldIntake) {
          const oldAllocs = oldIntake.allocations || [];
          oldAllocs.forEach(oa => {
            if (!allocations.find(na => na.binId === oa.binId)) {
              const ob = state.bins.find(x => x.id === oa.binId);
              if (ob) {
                ob.qty = Math.max(0, (ob.qty || 0) - oa.qty);
                ob.pkts = Math.max(0, (ob.pkts || 0) - oa.pkts);
                if (ob.qty === 0) { ob.status = 'empty'; ob.hybrid = ''; ob.company = ''; ob.lot = ''; }
                dbUpdateBin(ob.id, { status: ob.status, hybrid: ob.hybrid, company: ob.company, lot: ob.lot, qty: ob.qty, pkts: ob.pkts });
              }
            }
          });
        }

        // Update state entry in-place
        const idx = state.intakes.findIndex(i => i.id === intakeId);
        if (idx !== -1) {
          const existing = state.intakes[idx];
          state.intakes[idx] = {
            ...existing,
            ...intakeFields,
            entryMoisture: intakeFields.entry_moisture,
            vehicleWeight: intakeFields.vehicle_weight,
            grossWeight: intakeFields.gross_weight,
            netWeight: intakeFields.net_weight,
            bin: binIds[0] || null,
            bins: binIds,
            allocations: allocations.map(a => ({ binId: a.binId, qty: a.qty, unit: a.unit||'kg', pkts: a.pkts }))
          };
        }
        dbLogActivity('INTAKE_UPDATED', `Intake ${intakeId} updated — ${qty} ${qtyUnit} of ${hybrid} (DR: ${challan})`);
      } else {
        const intakeRecord = { id: intakeId, ...intakeFields, created_at: dateStr };
        const entry = {
          ...intakeRecord,
          entryMoisture: intakeRecord.entry_moisture,
          vehicleWeight: intakeRecord.vehicle_weight,
          grossWeight: intakeRecord.gross_weight,
          netWeight: intakeRecord.net_weight,
          bin: binIds[0] || null,
          bins: binIds,
          allocations: allocations.map(a => ({ binId: a.binId, qty: a.qty, unit: a.unit||'kg', pkts: a.pkts })),
          dateTS: now.getTime(),
          date: now.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
        };
        state.intakes.unshift(entry);
        dbLogActivity('INTAKE_CREATED', `Intake ${intakeId} created for ${qty} ${qtyUnit} of ${hybrid} (DR: ${challan})`);
      }

      allocations.forEach(a => {
         const b = state.bins.find(x => x.id === a.binId);
         if (!b) { console.warn(`Bin ${a.binId} not found in state`); return; }
         b.status='drying';b.hybrid=hybrid;b.company=intakeFields.company;b.lot=intakeFields.lot;
         b.qty=a.qty;b.pkts=a.pkts;b.entryMoisture=intakeFields.entry_moisture;
         b.currentMoisture=intakeFields.entry_moisture;
         b.intakeRef=intakeId;b.airflow='up';
         if (!isEdit) { b.intakeDate=now.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});b.intakeDateTS=now.getTime(); }

         dbUpdateBin(b.id, {
             status: 'drying', hybrid: b.hybrid, company: b.company, lot: b.lot,
             qty: b.qty, pkts: b.pkts, entry_moisture: b.entryMoisture,
             current_moisture: b.currentMoisture, intake_date_ts: b.intakeDateTS,
             airflow: 'up'
         });
      });

      _editingIntakeId = null;
      closeModal('intake-modal');
      toast(isEdit ? `Intake updated — DR ${challan}` : `Intake saved — DR ${challan}`);
      if(window.Store) window.Store.emitChange();
  } else {
      toast(isEdit ? 'Failed to update intake' : 'Failed to save to database', 'error');
  }

  btn.innerHTML = ogText;
  btn.disabled = false;
}

/**
 * Reads form data from the Dispatch modal, constructs a new dispatch/receipt record,
 * generates a secure hash & signature for the receipt, and inserts the data into the database.
 * 
 * @async
 * @returns {Promise<void>} Resolves when the dispatch record is successfully generated and stored.
 */
async function saveDispatch(){
  const party=document.getElementById('d-party').value.trim();
  const vehicle=document.getElementById('d-vehicle').value.trim().toUpperCase();
  const hybrid=document.getElementById('d-hybrid').value.trim();
  const bags=parseInt(document.getElementById('d-bags').value);
  const qty=parseFloat(document.getElementById('d-qty').value);
  const amount=parseFloat(document.getElementById('d-amount').value);
  if(!party||!vehicle||!hybrid||!bags||!qty||!amount){toast('Fill all required fields (*)','error');return;}
  if(bags<=0||qty<=0||amount<=0){toast('Bags, Qty, and Amount must all be greater than 0','error');return;}
  const dMoisture=parseFloat(document.getElementById('d-moisture').value);
  if(document.getElementById('d-moisture').value&&(dMoisture<0||dMoisture>60)){toast('Moisture must be between 0% and 60%','error');return;}

  // Gather bin allocations
  const binRows = document.querySelectorAll('.d-bin-row');
  const binAllocations = [];
  let binError = false;
  binRows.forEach(row => {
    const binId = row.querySelector('.d-bin-select').value;
    const binBags = parseInt(row.querySelector('.d-bin-bags').value) || 0;
    const binQty = parseFloat(row.querySelector('.d-bin-qty').value) || 0;
    if (binId) {
      binAllocations.push({ binId: parseInt(binId), bags: binBags, qty: binQty });
    } else if (binBags || binQty) {
      binError = true;
    }
  });
  if (binError) { toast('Please select a bin for every row or remove empty rows', 'error'); return; }
  // binAllocations is optional — dispatch can have no bins selected

  const dtInput=document.getElementById('d-datetime')?.value;
  const now=dtInput ? new Date(dtInput) : new Date();
  const receiptId=`YDS-${new Date().getFullYear()}-${String(state.receiptCounter++).padStart(6,'0')}`;
  // For backward-compat store first bin id (or null) in d.bin; full list in d.bins
  const d={
    receiptId,dateTS:now.getTime(),
    date:now.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}),
    party,address:document.getElementById('d-address').value,
    vehicle,lr:document.getElementById('d-lr').value,
    hybrid,lot:[...document.querySelectorAll('.d-lot-input')].map(el=>el.value.trim()).filter(Boolean).join(', '),
    bin: binAllocations.length ? binAllocations[0].binId : null,
    bins: binAllocations,
    bags,qty,
    moisture:parseFloat(document.getElementById('d-moisture').value)||0,
    amount,remarks:document.getElementById('d-remarks').value,
    hash:'',signature:''
  };
  d.hash=generateHash(d);
  d.signature=generateSignature(d);
  
  const dispatchRecord = {
      receipt_id: d.receiptId,
      party: d.party,
      address: d.address,
      vehicle: d.vehicle,
      lr: d.lr,
      hybrid: d.hybrid,
      lot: d.lot,
      bin_id: d.bin,
      bins: binAllocations,
      bags: d.bags,
      qty: d.qty,
      moisture: d.moisture,
      amount: d.amount,
      remarks: d.remarks,
      hash: d.hash,
      signature: d.signature,
      created_at: now.toISOString()
  };

  const btn = document.querySelector('#dispatch-modal .btn-gold');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Generating...';
  btn.disabled = true;

  const success = await dbInsertDispatch(dispatchRecord);
  
  if (success) {
      state.dispatches.unshift(d);
      const binLabels = binAllocations.length ? binAllocations.map(a=>`BIN-${getBinLabel(a.binId)}`).join(', ') : 'N/A';
      dbLogActivity('DISPATCH_CREATED', `Receipt ${d.receiptId} generated for ${d.party} (${d.qty} Kg / ₹${d.amount}) from ${binLabels}`);
      // Deduct inventory from all selected bins
      binAllocations.forEach(a => {
          const b = state.bins.find(x => x.id === a.binId);
          if (b) {
              b.qty = Math.max(0, (b.qty || 0) - (a.qty / 1000)); // convert kg to tons
              b.pkts = Math.max(0, (b.pkts || 0) - a.bags);
              dbUpdateBin(b.id, { qty: b.qty, pkts: b.pkts });
          }
      });
      closeModal('dispatch-modal');
      toast(`Receipt ${receiptId} generated & signed`,'success');
      setTimeout(()=>viewReceipt(receiptId),350);
      if(window.Store) window.Store.emitChange();
  } else {
      toast('Failed to save dispatch to database', 'error');
  }
  btn.innerHTML = ogText;
  btn.disabled = false;
}

function openBinModal(binId){
  const bin=state.bins.find(b => b.id === binId);
  document.getElementById('bin-modal-title').textContent=`BIN-${bin.binLabel||bin.id} — ${bin.status==='empty'?'Empty':'Update'}`;
  const m=bin.currentMoisture||0;
  const days=dateDiff(bin.intakeDateTS);
  document.getElementById('bin-modal-body').innerHTML=`
    <div class="grid2 mb16" id="bm-details-container" style="${bin.status==='empty'?'display:none;':''}">
      <div class="form-group"><label class="form-label">Hybrid</label><input class="form-input fw700" id="bm-hybrid" value="${bin.hybrid||''}"></div>
      <div style="display:flex;gap:8px;">
        <div class="form-group" style="flex:1;"><label class="form-label">Qty (Tons)</label><input class="form-input fw700 text-gold" type="number" step="0.1" id="bm-qty" value="${bin.qty||''}"></div>
        <div class="form-group" style="flex:1;"><label class="form-label">Bags</label><input class="form-input fw700 text-gold" type="number" id="bm-pkts" value="${bin.pkts||''}"></div>
      </div>
      <div class="form-group"><label class="form-label">Entry Moisture %</label><input class="form-input fw700" type="number" step="0.1" id="bm-entry-m" value="${bin.entryMoisture||''}"></div>
      <div class="form-group"><label class="form-label">Days in Bin</label><input class="form-input fw700" value="${days}d" disabled style="background:var(--surface-2);color:var(--ink-4);"></div>
      <div class="form-group"><label class="form-label">Lot No</label><input class="form-input fw700" id="bm-lot" value="${bin.lot||''}"></div>
      <div class="form-group"><label class="form-label">Company</label><input class="form-input fw700" id="bm-company" value="${bin.company||''}"></div>
    </div>
    <div class="divider" id="bm-details-divider" style="${bin.status==='empty'?'display:none;':''}"></div>
    <div class="form-row cols2">
      <div class="form-group">
        <label class="form-label">Current Moisture %</label>
        <input class="form-input" type="number" step="0.1" id="bm-m" value="${m.toFixed(1)}"
          style="font-family:'DM Mono',monospace;font-size:18px;font-weight:700;text-align:center;">
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="bm-s" onchange="document.getElementById('bm-details-container').style.display=this.value==='empty'?'none':'grid';document.getElementById('bm-details-divider').style.display=this.value==='empty'?'none':'block';">
          <option value="drying" ${bin.status!=='shelling'&&bin.status!=='empty'?'selected':''}>Drying</option>
          <option value="shelling" ${bin.status==='shelling'?'selected':''}>Shelling</option>
          <option value="empty" ${bin.status==='empty'?'selected':''}>Empty (Clear Bin)</option>
        </select>
      </div>
    </div>
    <div class="form-group mt16">
      <label class="form-label">Airflow Direction</label>
      <div class="air-toggle mt16" style="gap:8px;">
        <button class="air-btn ${bin.airflow==='up'?'active-up':''}" style="flex:1;justify-content:center;height:40px;"
          id="bm-air-up" onclick="document.getElementById('bm-air-dn').classList.remove('active-down');this.classList.add('active-up');window._bAir='up';">
          ↑ Top → Bottom (Standard)
        </button>
        <button class="air-btn ${bin.airflow==='down'?'active-down':''}" style="flex:1;justify-content:center;height:40px;"
          id="bm-air-dn" onclick="document.getElementById('bm-air-up').classList.remove('active-up');this.classList.add('active-down');window._bAir='down';">
          ↓ Bottom → Top (Reverse)
        </button>
      </div>
    </div>
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:20px;">
      <button class="btn btn-ghost" onclick="closeModal('bin-modal')">Cancel</button>
      <button class="btn btn-solid" onclick="saveBinModal(${binId})">Save Update</button>
    </div>`;
  window._bAir=bin.airflow;
  openModal('bin-modal');
}
async function saveBinModal(binId){
  const b=state.bins.find(x => x.id === binId);
  if (!b) { toast(`BIN-${getBinLabel(binId)} not found`, 'error'); return; }
  const oldStatus = b.status;
  const snapshotBefore = { ...b }; // capture state before changes for history

  b.currentMoisture=parseFloat(document.getElementById('bm-m').value)||b.currentMoisture;
  b.status=document.getElementById('bm-s').value;
  b.airflow=window._bAir||b.airflow;

  if(b.status !== 'empty') {
    b.hybrid = document.getElementById('bm-hybrid') ? document.getElementById('bm-hybrid').value : b.hybrid;
    b.qty = document.getElementById('bm-qty') ? parseFloat(document.getElementById('bm-qty').value) || 0 : b.qty;
    b.pkts = document.getElementById('bm-pkts') ? parseInt(document.getElementById('bm-pkts').value) || 0 : b.pkts;
    b.entryMoisture = document.getElementById('bm-entry-m') ? parseFloat(document.getElementById('bm-entry-m').value) || 0 : b.entryMoisture;
    b.lot = document.getElementById('bm-lot') ? document.getElementById('bm-lot').value : b.lot;
    b.company = document.getElementById('bm-company') ? document.getElementById('bm-company').value : b.company;
    if (!b.intakeDateTS) {
        b.intakeDateTS = Date.now();
        b.intakeDate = new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
    }
  } else {
    b.hybrid='';b.qty=0;b.pkts=0;b.lot='';b.company='';b.entryMoisture=0;b.intakeDateTS=null;b.intakeDate='';
  }
  
  const btn = document.querySelector('#bin-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;
  
  const updates = {
      status: b.status,
      hybrid: b.hybrid,
      company: b.company,
      lot: b.lot,
      qty: b.qty,
      pkts: b.pkts,
      entry_moisture: b.entryMoisture,
      current_moisture: b.currentMoisture,
      intake_date_ts: b.intakeDateTS || null,
      airflow: b.airflow
  };
  
  const success = await dbUpdateBin(b.id, updates);
  if (success) {
      if (oldStatus !== b.status) {
          dbLogActivity('BIN_STATUS_CHANGED', `BIN-${b.binLabel||b.id} changed to ${b.status}`);
          // Snapshot bin cycle history when bin is cleared
          if (b.status === 'empty' && snapshotBefore.hybrid) {
              const daysInBin = snapshotBefore.intakeDateTS
                  ? Math.floor((Date.now() - snapshotBefore.intakeDateTS) / Config.MS_PER_DAY)
                  : null;
              const historyRecord = {
                  bin_id: b.id,
                  hybrid: snapshotBefore.hybrid,
                  company: snapshotBefore.company || null,
                  lot: snapshotBefore.lot || null,
                  qty: snapshotBefore.qty || 0,
                  pkts: snapshotBefore.pkts || 0,
                  entry_moisture: snapshotBefore.entryMoisture || 0,
                  final_moisture: snapshotBefore.currentMoisture || 0,
                  days_in_bin: daysInBin,
                  intake_ref: snapshotBefore.intakeRef || null,
                  filled_at: snapshotBefore.intakeDateTS ? new Date(snapshotBefore.intakeDateTS).toISOString() : null,
                  emptied_at: new Date().toISOString()
              };
              dbInsertBinHistory(historyRecord).then(ok => {
                  if (ok) state.binHistory.unshift(historyRecord);
              });
          }
      }
      closeModal('bin-modal');
      toast(`BIN-${getBinLabel(binId)} updated successfully`);
      const ap=document.querySelector('.page.active');
      if(ap && window.Store) window.Store.emitChange();
  } else {
      toast('Failed to update bin in database', 'error');
  }
  btn.innerHTML = ogText;
  btn.disabled = false;
}


// ================================================================
// MANAGER PAGE — AIRFLOW & BULK MOISTURE SAVE
// ================================================================
function setAir(binId, direction) {
  const b = state.bins.find(x => x.id === binId);
  if (!b) return;
  b.airflow = direction;
  const upBtn = document.getElementById(`air-up-${binId}`);
  const dnBtn = document.getElementById(`air-dn-${binId}`);
  if (upBtn) { upBtn.classList.toggle('active-up', direction === 'up'); upBtn.classList.remove(direction === 'up' ? '' : 'active-up'); }
  if (dnBtn) { dnBtn.classList.toggle('active-down', direction === 'down'); }
}

async function saveAllMoisture() {
  const active = state.bins.filter(b => b.status !== 'empty');
  if (!active.length) { toast('No active bins to save', 'info'); return; }

  const btn = document.querySelector('[onclick="saveAllMoisture()"]');
  const ogText = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = 'Saving...'; btn.disabled = true; }

  // Read all input values first, then save in parallel
  active.forEach(b => {
    const mInput = document.getElementById(`mi-${b.id}`);
    if (mInput) b.currentMoisture = parseFloat(mInput.value) || b.currentMoisture;
  });

  const results = await Promise.all(active.map(b =>
    dbUpdateBin(b.id, {
      current_moisture: b.currentMoisture,
      status: b.status,
      airflow: b.airflow
    })
  ));
  const saved = results.filter(Boolean).length;

  if (btn) { btn.innerHTML = ogText; btn.disabled = false; }
  toast(`${saved} bin${saved !== 1 ? 's' : ''} saved`, saved > 0 ? 'success' : 'error');
  if (window.Store) window.Store.emitChange();
}

let managerAccessBtn = null;
function showManagerAccess(btnElement) {
  managerAccessBtn = btnElement;
  document.getElementById('manager-pin-input').value = '';
  openModal('pin-modal');
  setTimeout(()=>document.getElementById('manager-pin-input').focus(), 100);
}

// SHA-256 hash of the manager PIN — change this hash to change the PIN.
// To generate a new hash: crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourPIN'))
//   then convert to hex. Current PIN: ask your manager.
const MANAGER_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

async function verifyPinAndAccess() {
  const pin = document.getElementById('manager-pin-input').value;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  if (hex === MANAGER_PIN_HASH) {
    window.isManagerMode = true;
    toast('Manager Access Granted', 'success');
    closeModal('pin-modal');
    showPage('manager', managerAccessBtn);
  } else {
    toast('Invalid PIN. Access Denied.', 'error');
  }
}

// ================================================================
// EXPORTS
// ================================================================
function executeExport() {
  if (typeof XLSX === 'undefined') {
      toast('Excel exporter not loaded yet. Please wait.', 'error');
      return;
  }
  
  const incBins = document.getElementById('export-chk-bins').checked;
  const incIntakes = document.getElementById('export-chk-intakes').checked;
  const incDispatches = document.getElementById('export-chk-dispatches').checked;
  const incMaintenance = document.getElementById('export-chk-maintenance').checked;
  const incLabor = document.getElementById('export-chk-labor').checked;
  
  if (!incBins && !incIntakes && !incDispatches && !incMaintenance && !incLabor) {
      toast('Nothing selected to export');
      return;
  }
  
  const btn = document.querySelector('#export-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Generating...';
  btn.disabled = true;
  
  setTimeout(() => {
    try {
      const wb = XLSX.utils.book_new();
  
  if (incBins) {
      const binsSheet = XLSX.utils.json_to_sheet(state.bins.map(b => ({
          BinID: b.id,
          Status: b.status,
          Hybrid: b.hybrid,
          Company: b.company,
          LotNo: b.lot,
          Tons: b.qty,
          Bags: b.pkts,
          EntryMoisture: b.entryMoisture,
          CurrentMoisture: b.currentMoisture,
          Airflow: b.airflow,
          IntakeDate: b.intakeDate
      })));
      XLSX.utils.book_append_sheet(wb, binsSheet, "Bins State");
  }

  if (incIntakes) {
      const intakesSheet = XLSX.utils.json_to_sheet(state.intakes.map(i => ({
          IntakeID: i.id,
          Date: i.date,
          DRNo: i.challan,
          Hybrid: i.hybrid,
          QtyTons: i.qty,
          Bags: i.pkts,
          Company: i.company,
          LotNo: i.lot,
          Moisture: i.entryMoisture,
          Vehicle: i.vehicle,
          GrossWeight: i.grossWeight,
          VehicleWeight: i.vehicleWeight,
          NetWeight: i.netWeight,
          LR: i.lr,
          Remarks: i.remarks
      })));
      XLSX.utils.book_append_sheet(wb, intakesSheet, "Intake Logs");
  }
  
    if (incDispatches) {
        const dispatchesSheet = XLSX.utils.json_to_sheet(state.dispatches.map(d => ({
            ReceiptID: d.receiptId,
            Date: d.date,
            Party: d.party,
            Hybrid: d.hybrid,
            Bags: d.bags,
            Tons: d.qty,
            Amount: d.amount,
            Vehicle: d.vehicle,
            LR: d.lr,
            BinId: d.bin,
            Moisture: d.moisture,
            Address: d.address,
            Remarks: d.remarks,
            Hash: d.hash
        })));
        XLSX.utils.book_append_sheet(wb, dispatchesSheet, "Dispatch Receipts");
    }

    if (incMaintenance) {
        const maintSheet = XLSX.utils.json_to_sheet(state.maintenance.map(m => ({
            Date: m.date,
            ReportedBy: m.reported_by,
            Equipment: m.equipment_name,
            Issue: m.issue_description,
            WorkDone: m.work_done,
            CheckedBy: m.checked_by,
            ItemsBought: m.items_bought,
            CostAmount: m.cost_amount
        })));
        XLSX.utils.book_append_sheet(wb, maintSheet, "Maintenance Logs");
    }

    if (incLabor) {
        const laborSheet = XLSX.utils.json_to_sheet(state.labor.map(l => ({
            Date: l.date,
            Shift: l.shift,
            Role: l.role,
            Headcount: l.headcount,
            PeopleNames: l.people_names,
            Remarks: l.notes
        })));
        XLSX.utils.book_append_sheet(wb, laborSheet, "Labor Logs");
    }

    // Always include Bin History sheet if there is data
    if (state.binHistory && state.binHistory.length > 0) {
        const histSheet = XLSX.utils.json_to_sheet(state.binHistory.map(h => ({
            BinID: `BIN-${getBinLabel(h.bin_id)}`,
            Hybrid: h.hybrid,
            Company: h.company || '—',
            LotNo: h.lot || '—',
            QtyTons: h.qty,
            Bags: h.pkts,
            EntryMoisture: h.entry_moisture,
            FinalMoisture: h.final_moisture,
            DaysInBin: h.days_in_bin,
            FilledOn: h.filled_at ? new Date(h.filled_at).toLocaleDateString('en-IN') : '—',
            EmptiedOn: h.emptied_at ? new Date(h.emptied_at).toLocaleDateString('en-IN') : '—',
            IntakeRef: h.intake_ref || '—'
        })));
        XLSX.utils.book_append_sheet(wb, histSheet, "Bin History");
    }

    XLSX.writeFile(wb, `Yellina_Report_${new Date().toISOString().slice(0,10)}.xlsx`);
    toast('Excel report downloaded successfully', 'success');
    dbLogActivity('DATA_EXPORTED', 'Excel report downloaded');
    closeModal('export-modal');
    
    } catch(err) {
        console.error("Export error:", err);
        toast('Failed to generate Excel file.', 'error');
    }
    
    btn.innerHTML = ogText;
    btn.disabled = false;
  }, 100);
}

// ============================================================
// MAINTENANCE & LABOR ACTIONS
// ============================================================

async function saveMaintenance() {
  const date = document.getElementById('maint-date').value;
  const reportedBy = document.getElementById('maint-reported').value.trim();
  const equipment = document.getElementById('maint-equipment').value.trim();
  const issue = document.getElementById('maint-issue').value.trim();
  const work = document.getElementById('maint-work').value.trim();
  const checker = document.getElementById('maint-checker').value.trim();
  const items = document.getElementById('maint-items').value.trim();
  const cost = parseFloat(document.getElementById('maint-cost').value) || 0;

  if (!date || !work) {
    toast('Date and Work Done are required', 'error');
    return;
  }

  const log = {
    date: date,
    reported_by: reportedBy,
    equipment_name: equipment,
    issue_description: issue,
    work_done: work,
    checked_by: checker,
    items_bought: items,
    cost_amount: cost
  };

  const btn = document.querySelector('#maintenance-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const saved = await dbInsertMaintenance(log);
    if (saved) {
      state.maintenance.unshift(saved);
      if(window.Store) window.Store.emitChange();
      closeModal('maintenance-modal');
      
      // Clear Inputs
      document.getElementById('maint-date').value = '';
      document.getElementById('maint-reported').value = '';
      document.getElementById('maint-equipment').value = '';
      document.getElementById('maint-issue').value = '';
      document.getElementById('maint-work').value = '';
      document.getElementById('maint-checker').value = '';
      document.getElementById('maint-items').value = '';
      document.getElementById('maint-cost').value = '';
      
      toast('Maintenance logged successfully', 'success');
      dbLogActivity('MAINTENANCE_LOGGED', `Maintenance for ${equipment || 'Plant'}: ${work}`);
    } else {
      toast('Failed to save log', 'error');
    }
  } catch (err) {
    console.error("Save maintenance error:", err);
    toast('Server error', 'error');
  } finally {
    btn.innerHTML = ogText;
    btn.disabled = false;
  }
}

async function saveLabor() {
  const date = document.getElementById('labor-date').value;
  const shift = document.getElementById('labor-shift').value.trim();
  let role = document.getElementById('labor-role').value;
  if(role === 'Other') {
    role = document.getElementById('labor-role-other').value.trim();
  }
  const headcount = parseInt(document.getElementById('labor-headcount').value) || 0;
  const people = document.getElementById('labor-people').value.trim();
  const remarks = document.getElementById('labor-remarks').value.trim();

  if (!date || headcount <= 0) {
    toast('Date and valid headcount are required', 'error');
    return;
  }

  const log = {
    date: date,
    shift: shift,
    role: role,
    headcount: headcount,
    people_names: people,
    notes: remarks
  };

  const btn = document.querySelector('#labor-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    const saved = await dbInsertLabor(log);
    if (saved) {
      state.labor.unshift(saved);
      if(window.Store) window.Store.emitChange();
      closeModal('labor-modal');
      
      // Clear Inputs
      document.getElementById('labor-date').value = '';
      document.getElementById('labor-shift').value = '';
      document.getElementById('labor-role').value = 'Sheller Area';
      document.getElementById('labor-role-other').value = '';
      document.getElementById('labor-role-other-wrap').style.display = 'none';
      document.getElementById('labor-headcount').value = '';
      document.getElementById('labor-people').value = '';
      document.getElementById('labor-remarks').value = '';
      
      toast('Labor shift logged', 'success');
      dbLogActivity('LABOR_LOGGED', `${headcount} people added for ${shift} shift (${role})`);
    } else {
      toast('Failed to save log', 'error');
    }
  } catch (err) {
    console.error("Save labor error:", err);
    toast('Server error', 'error');
  } finally {
    btn.innerHTML = ogText;
    btn.disabled = false;
  }
}

// ================================================================
// ENTRY TRUCKS
// ================================================================
function calcTruckNetWeight() {
  const gross = parseFloat(document.getElementById('t-gross').value) || 0;
  const tare = parseFloat(document.getElementById('t-tare').value) || 0;
  const net = gross - tare;
  const el = document.getElementById('t-net-display');
  if (el) el.textContent = net > 0 ? net.toLocaleString('en-IN') + ' Kg' : '—';
}

let _editingTruckId = null;

function openTruckModal() {
  _editingTruckId = null;
  ['t-vehicle','t-company','t-location','t-driver','t-phone','t-notes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['t-gross','t-tare'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('t-net-display').textContent = '—';
  document.getElementById('t-status').value = 'waiting';
  document.getElementById('t-arrival').value = new Date().toISOString().slice(0,16);
  document.getElementById('truck-modal-title').textContent = 'Register Truck';
  openModal('truck-modal');
}

function editTruck(id) {
  const truck = (state.entryTrucks || []).find(t => t.id === id);
  if (!truck) return;
  _editingTruckId = id;
  document.getElementById('t-vehicle').value = truck.vehicleNo;
  document.getElementById('t-company').value = truck.company;
  document.getElementById('t-location').value = truck.fromLocation;
  document.getElementById('t-driver').value = truck.driverName;
  document.getElementById('t-phone').value = truck.driverPhone;
  document.getElementById('t-gross').value = truck.grossWeight || '';
  document.getElementById('t-tare').value = truck.tareWeight || '';
  document.getElementById('t-status').value = truck.status;
  document.getElementById('t-notes').value = truck.notes;
  document.getElementById('t-arrival').value = truck.arrivalTime ? truck.arrivalTime.slice(0,16) : '';
  calcTruckNetWeight();
  document.getElementById('truck-modal-title').textContent = 'Edit Truck';
  openModal('truck-modal');
}

async function saveTruck() {
  const vehicleNo = (document.getElementById('t-vehicle').value || '').toUpperCase().trim();
  if (!vehicleNo) { toast('Vehicle number is required', 'error'); return; }

  const record = {
    vehicle_no: vehicleNo,
    company: document.getElementById('t-company').value.trim() || null,
    from_location: document.getElementById('t-location').value.trim() || null,
    driver_name: document.getElementById('t-driver').value.trim() || null,
    driver_phone: document.getElementById('t-phone').value.trim() || null,
    gross_weight: parseFloat(document.getElementById('t-gross').value) || 0,
    tare_weight: parseFloat(document.getElementById('t-tare').value) || 0,
    status: document.getElementById('t-status').value,
    notes: document.getElementById('t-notes').value.trim() || null,
    arrival_time: document.getElementById('t-arrival').value ? new Date(document.getElementById('t-arrival').value).toISOString() : new Date().toISOString()
  };

  let ok;
  if (_editingTruckId) {
    ok = await dbUpdateTruck(_editingTruckId, record);
  } else {
    ok = await dbInsertTruck(record);
  }

  if (ok) {
    toast(_editingTruckId ? 'Truck updated' : 'Truck registered', 'success');
    closeModal('truck-modal');
    await bootApp();
    showPage('entry-trucks');
  } else {
    toast('Failed to save truck', 'error');
  }
}

async function markTruckIntake(id) {
  const ok = await dbUpdateTruck(id, { status: 'intake' });
  if (ok) {
    toast('Truck marked as In Intake', 'success');
    await bootApp();
    showPage('entry-trucks');
  }
}

async function markTruckCompleted(id) {
  const ok = await dbUpdateTruck(id, { status: 'completed' });
  if (ok) {
    toast('Truck marked as Completed', 'success');
    await bootApp();
    showPage('entry-trucks');
  }
}

function filterTrucks(filter, btn) {
  document.querySelectorAll('#truck-filter-tabs button').forEach(b => {
    b.classList.remove('btn-solid');
    b.classList.add('btn-ghost');
  });
  btn.classList.remove('btn-ghost');
  btn.classList.add('btn-solid');
  renderEntryTrucksPage();
}

// Called when a truck is selected in the intake modal
function onTruckSelected(truckId) {
  const hiddenInput = document.getElementById('i-truck-id');
  if (hiddenInput) hiddenInput.value = truckId;
  if (!truckId) return;
  const truck = (state.entryTrucks || []).find(t => t.id === truckId);
  if (!truck) return;
  // Auto-fill vehicle rows
  const vehicleInputs = document.querySelectorAll('.i-vehicle-input');
  if (vehicleInputs.length > 0) vehicleInputs[0].value = truck.vehicleNo;
  // Auto-fill weights if present
  const gwInputs = document.querySelectorAll('.i-gross-input');
  const vwInputs = document.querySelectorAll('.i-tare-input');
  if (gwInputs.length > 0 && truck.grossWeight) gwInputs[0].value = truck.grossWeight;
  if (vwInputs.length > 0 && truck.tareWeight) vwInputs[0].value = truck.tareWeight;
  toast(`Truck ${truck.vehicleNo} selected — details pre-filled`, 'info');
}

// ================================================================
// BACKYARD REMOVALS
// ================================================================
function openBackyardModal() {
  // Populate intake dropdown — all intakes
  const byIntake = document.getElementById('by-intake');
  if (byIntake) {
    const intakes = state.intakes || [];
    byIntake.innerHTML = '<option value="">— Select Intake (optional) —</option>' +
      intakes.map(i => `<option value="${i.id}">${i.challan} — ${i.hybrid} (${i.date})</option>`).join('');
  }
  // Populate bin dropdown — ALL bins so you can log from any bin regardless of status
  const byBin = document.getElementById('by-bin');
  if (byBin) {
    const bins = state.bins || [];
    byBin.innerHTML = '<option value="">— Select Bin (optional) —</option>' +
      bins.map(b => {
        const label = b.binLabel || b.id;
        const statusTag = b.status !== 'empty' ? ` [${b.status}]` : ' [empty]';
        return `<option value="${b.id}">BIN-${label}${b.hybrid ? ' — ' + b.hybrid : ''}${statusTag}</option>`;
      }).join('');
  }
  ['by-vehicle','by-hybrid','by-removed-by','by-notes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['by-qty','by-bags'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const reasonEl = document.getElementById('by-reason');
  if (reasonEl) reasonEl.value = 'damaged';
  openModal('backyard-modal');
}

async function saveBackyardRemoval() {
  const qty = parseFloat(document.getElementById('by-qty').value);
  if (!qty || qty <= 0) { toast('Quantity removed is required', 'error'); return; }

  const record = {
    intake_id: document.getElementById('by-intake').value || null,
    bin_id: document.getElementById('by-bin').value ? parseInt(document.getElementById('by-bin').value) : null,
    vehicle_no: document.getElementById('by-vehicle').value.trim() || null,
    hybrid: document.getElementById('by-hybrid').value.trim() || null,
    qty_removed: qty,
    bags_removed: parseInt(document.getElementById('by-bags').value) || 0,
    reason: document.getElementById('by-reason').value,
    removed_by: document.getElementById('by-removed-by').value.trim() || null,
    notes: document.getElementById('by-notes').value.trim() || null
  };

  const ok = await dbInsertBackyardRemoval(record);
  if (ok) {
    toast('Stock removal logged', 'success');
    closeModal('backyard-modal');
    await bootApp();
    showPage('backyard');
  } else {
    toast('Failed to log removal', 'error');
  }
}

// ================================================================
// DAILY PRODUCTION REPORT
// ================================================================
window.openDailyReport = function() {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dateHeader = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const todayIntakes = state.intakes.filter(i => {
    return new Date(i.dateTS).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) === todayStr;
  });
  const todayDispatches = state.dispatches.filter(d => d.date === todayStr);
  const activeBins = state.bins.filter(b => b.status !== 'empty');
  const todayMaint = (state.maintenance || []).filter(m => {
    const mDate = m.date ? new Date(m.date).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';
    return mDate === todayStr;
  });

  const totalIntakeQty = todayIntakes.reduce((s,i) => s + parseFloat(i.qty||0), 0);
  const totalDispQty = todayDispatches.reduce((s,d) => s + parseFloat(d.qty||0), 0);
  const totalRev = todayDispatches.reduce((s,d) => s + parseInt(d.amount||0), 0);

  const row = (cells) => `<tr>${cells.map(c => `<td style="padding:7px 10px;border-bottom:1px solid #eee;font-size:12px;">${c}</td>`).join('')}</tr>`;
  const th = (cells) => `<tr>${cells.map(c => `<th style="padding:7px 10px;background:#F5F5F0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;border-bottom:2px solid #ddd;text-align:left;">${c}</th>`).join('')}</tr>`;
  const section = (title, content) => `
    <div style="margin-bottom:28px;">
      <div style="font-size:13px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#1A3D28;border-bottom:2px solid #1A3D28;padding-bottom:6px;margin-bottom:12px;">${title}</div>
      ${content}
    </div>`;

  const intakeTable = todayIntakes.length ? `<table style="width:100%;border-collapse:collapse;">
    <thead>${th(['DR No','Vehicle','Hybrid','Lot','Qty (Kg)','Bins','Moisture'])}</thead>
    <tbody>${todayIntakes.map(i => row([
      `<strong>${i.challan}</strong>`,
      i.vehicle, i.hybrid, i.lot||'—',
      parseInt(i.qty).toLocaleString('en-IN'),
      getBinIds(i).map(b=>'BIN-'+getBinLabel(b)).join(', ')||'—',
      i.entryMoisture ? i.entryMoisture+'%' : '—'
    ])).join('')}</tbody>
  </table>
  <div style="margin-top:8px;font-size:12px;color:#555;">Total: <strong>${totalIntakeQty.toLocaleString('en-IN')} Kg</strong> across ${todayIntakes.length} load${todayIntakes.length!==1?'s':''}</div>`
  : '<p style="color:#999;font-size:12px;font-style:italic;">No intakes recorded today.</p>';

  const dispatchTable = todayDispatches.length ? `<table style="width:100%;border-collapse:collapse;">
    <thead>${th(['Receipt ID','Party','Hybrid','Bags','Qty (Kg)','Moisture','Amount (₹)'])}</thead>
    <tbody>${todayDispatches.map(d => row([
      `<strong>${d.receiptId}</strong>`,
      d.party, d.hybrid,
      d.bags.toLocaleString('en-IN'),
      parseInt(d.qty).toLocaleString('en-IN'),
      d.moisture ? d.moisture+'%' : '—',
      `<strong>₹${parseInt(d.amount).toLocaleString('en-IN')}</strong>`
    ])).join('')}</tbody>
  </table>
  <div style="margin-top:8px;font-size:12px;color:#555;">Total dispatched: <strong>${totalDispQty.toLocaleString('en-IN')} Kg</strong> &nbsp;|&nbsp; Revenue: <strong>₹${totalRev.toLocaleString('en-IN')}</strong></div>`
  : '<p style="color:#999;font-size:12px;font-style:italic;">No dispatches today.</p>';

  const binsTable = activeBins.length ? `<table style="width:100%;border-collapse:collapse;">
    <thead>${th(['Bin','Hybrid','Entry M%','Current M%','Days','Airflow','Status'])}</thead>
    <tbody>${activeBins.map(b => {
      const days = b.intakeDateTS ? Math.floor((Date.now()-b.intakeDateTS)/86400000) : '—';
      return row([
        `<strong>BIN-${b.binLabel||b.id}</strong>`,
        b.hybrid||'—',
        b.entryMoisture ? b.entryMoisture+'%' : '—',
        b.currentMoisture ? `<strong>${b.currentMoisture}%</strong>` : '—',
        days,
        b.airflow === 'up' ? '↑ Top' : '↓ Bottom',
        b.status.charAt(0).toUpperCase()+b.status.slice(1)
      ]);
    }).join('')}</tbody>
  </table>`
  : '<p style="color:#999;font-size:12px;font-style:italic;">No active bins.</p>';

  const maintTable = todayMaint.length ? `<table style="width:100%;border-collapse:collapse;">
    <thead>${th(['Equipment','Issue','Work Done','Checked By','Cost (₹)'])}</thead>
    <tbody>${todayMaint.map(m => row([
      m.equipment||'—', m.issue||'—', m.work_completed||'—', m.checked_by||'—',
      m.cost ? '₹'+parseInt(m.cost).toLocaleString('en-IN') : '—'
    ])).join('')}</tbody>
  </table>` : '<p style="color:#999;font-size:12px;font-style:italic;">No maintenance logged today.</p>';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Daily Report — ${todayStr}</title>
  <style>
    body { font-family: 'Arial', sans-serif; margin: 0; padding: 32px; color: #0F1923; background: #fff; }
    @media print { body { padding: 16px; } }
  </style>
  </head><body>
  <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1A3D28;padding-bottom:16px;margin-bottom:28px;">
    <div>
      <div style="font-size:22px;font-weight:800;color:#1A3D28;">Yellina Seeds Pvt. Ltd.</div>
      <div style="font-size:13px;color:#666;margin-top:2px;">Daily Operations Report — ${dateHeader}</div>
    </div>
    <div style="text-align:right;font-size:11px;color:#999;">
      <div>Sathupally, Telangana</div>
      <div>Generated: ${new Date().toLocaleTimeString('en-IN')}</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:28px;">
    ${[
      ['📥 Intake Today', todayIntakes.length + ' loads · ' + totalIntakeQty.toLocaleString('en-IN') + ' Kg', '#F5A623'],
      ['📤 Dispatched Today', todayDispatches.length + ' dispatches · ' + totalDispQty.toLocaleString('en-IN') + ' Kg', '#10B981'],
      ['💰 Revenue Today', '₹' + totalRev.toLocaleString('en-IN'), '#8B5CF6'],
    ].map(([lbl,val,col]) => `<div style="background:#F8F9FA;border-left:4px solid ${col};padding:14px 16px;border-radius:6px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:4px;">${lbl}</div>
      <div style="font-size:16px;font-weight:800;color:#0F1923;">${val}</div>
    </div>`).join('')}
  </div>
  ${section('📥 Intake Register', intakeTable)}
  ${section('📤 Dispatches', dispatchTable)}
  ${section('🏭 Active Bin Status', binsTable)}
  ${section('🔧 Maintenance', maintTable)}
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center;">
    Yellina Seeds Pvt. Ltd. — Sathupally | Auto-generated by Operations Platform | ${new Date().toLocaleString('en-IN')}
  </div>
  <script>window.onload=function(){window.print();};<\/script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1000,height=700');
  if (w) { w.document.write(html); w.document.close(); }
  else { toast('Please allow pop-ups to generate the report', 'info'); }
};
