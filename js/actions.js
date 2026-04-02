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
  const truckSel = document.getElementById('i-truck-select');
  if (truckSel) truckSel.value = '';
  const truckHidden = document.getElementById('i-truck-id');
  if (truckHidden) truckHidden.value = '';
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
    options += `<option value="${b.id}">BIN-${b.binLabel||b.id} — ${b.hybrid||'?'} (${parseInt(b.qty||0).toLocaleString('en-IN')} Kg)</option>`;
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

  const selectedTruckId = document.getElementById('i-truck-id')?.value || null;

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
      net_weight: 0,
      ...(selectedTruckId ? { truck_id: selectedTruckId } : {})
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
        dbLogActivity('INTAKE_UPDATED', `Intake ${intakeId} updated — ${qty} ${qtyUnit} of ${hybrid} (DR: ${challan})`, 'intake', intakeId);
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
        dbLogActivity('INTAKE_CREATED', `Intake ${intakeId} created for ${qty} ${qtyUnit} of ${hybrid} (DR: ${challan})`, 'intake', intakeId);
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

      // Link the selected truck back to this intake (new intakes only)
      if (!isEdit && selectedTruckId) {
        dbUpdateTruck(selectedTruckId, { intake_id: intakeId, status: 'intake' });
        const t = (state.entryTrucks || []).find(t => t.id === selectedTruckId);
        if (t) { t.intakeId = intakeId; t.status = 'intake'; }
      }

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
  const editReceiptId = document.getElementById('dispatch-edit-id')?.value || '';
  const isEdit = !!editReceiptId;

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
  const driverName = document.getElementById('d-driver-name')?.value.trim() || '';
  const driverPhone = document.getElementById('d-driver-phone')?.value.trim() || '';

  const btn = document.getElementById('dispatch-save-btn') || document.querySelector('#dispatch-modal .btn-gold');
  const ogText = btn.innerHTML;
  btn.innerHTML = isEdit ? 'Saving...' : 'Generating...';
  btn.disabled = true;

  if (isEdit) {
    // Edit mode — update existing dispatch, keep existing receiptId, date, hash
    const existing = (state.dispatches || []).find(x => x.receiptId === editReceiptId);
    const updatedD = {
      ...(existing || {}),
      party, address: document.getElementById('d-address').value,
      vehicle, lr: document.getElementById('d-lr').value,
      hybrid, lot: [...document.querySelectorAll('.d-lot-input')].map(el=>el.value.trim()).filter(Boolean).join(', '),
      bin: binAllocations.length ? binAllocations[0].binId : null,
      bins: binAllocations,
      bags, qty,
      moisture: parseFloat(document.getElementById('d-moisture').value) || 0,
      amount, remarks: document.getElementById('d-remarks').value,
      driverName, driverPhone
    };
    updatedD.hash = generateHash(updatedD);
    updatedD.signature = generateSignature(updatedD);

    const dispatchRecord = {
      party: updatedD.party,
      address: updatedD.address,
      vehicle: updatedD.vehicle,
      lr: updatedD.lr,
      hybrid: updatedD.hybrid,
      lot: updatedD.lot,
      bin_id: updatedD.bin,
      bins: binAllocations,
      bags: updatedD.bags,
      qty: updatedD.qty,
      moisture: updatedD.moisture,
      amount: updatedD.amount,
      remarks: updatedD.remarks,
      driver_name: driverName || null,
      driver_phone: driverPhone || null,
      hash: updatedD.hash,
      signature: updatedD.signature
    };

    const saved = await dbUpdateDispatch(editReceiptId, dispatchRecord);
    if (saved) {
      const idx = (state.dispatches || []).findIndex(x => x.receiptId === editReceiptId);
      if (idx !== -1) state.dispatches[idx] = updatedD;
      // Reset edit state
      const editIdEl = document.getElementById('dispatch-edit-id'); if (editIdEl) editIdEl.value = '';
      const titleEl = document.getElementById('dispatch-modal-title'); if (titleEl) titleEl.textContent = 'New Dispatch';
      const saveSpan = btn.querySelector('span'); if (saveSpan) saveSpan.textContent = 'Generate Receipt';
      closeModal('dispatch-modal');
      toast(`Dispatch ${editReceiptId} updated`, 'success');
      dbLogActivity('DISPATCH_UPDATED', `Receipt ${editReceiptId} updated for ${party} (${qty} Kg / ₹${amount})`, 'dispatch', editReceiptId);
      if (window.Store) window.Store.emitChange();
    } else {
      toast('Failed to update dispatch', 'error');
    }
    btn.innerHTML = ogText;
    btn.disabled = false;
    return;
  }

  // Create mode — generate new receipt
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
    driverName, driverPhone,
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
      driver_name: driverName || null,
      driver_phone: driverPhone || null,
      hash: d.hash,
      signature: d.signature,
      created_at: now.toISOString()
  };

  const success = await dbInsertDispatch(dispatchRecord);

  if (success) {
      state.dispatches.unshift(d);
      const binLabels = binAllocations.length ? binAllocations.map(a=>`BIN-${getBinLabel(a.binId)}`).join(', ') : 'N/A';
      dbLogActivity('DISPATCH_CREATED', `Receipt ${d.receiptId} generated for ${d.party} (${d.qty} Kg / ₹${d.amount}) from ${binLabels}`, 'dispatch', d.receiptId);
      // Deduct inventory from all selected bins
      binAllocations.forEach(a => {
          const b = state.bins.find(x => x.id === a.binId);
          if (b) {
              b.qty = Math.max(0, (b.qty || 0) - (a.qty));
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
  const target=bin.targetMoisture||10;
  const cap=bin.capacityKg||0;

  // Moisture trend chart from recent readings
  const readings=(state.moistureReadings||[]).filter(r=>r.bin_id===binId).slice(0,10).reverse();
  let chartHtml='';
  if(readings.length>=2){
    const vals=readings.map(r=>parseFloat(r.moisture));
    const minV=Math.min(...vals,target)-1, maxV=Math.max(...vals,bin.entryMoisture||0)+1;
    const range=maxV-minV||1;
    const W=260,H=70,pad=6;
    const pts=vals.map((v,i)=>{
      const x=pad+(i/(vals.length-1))*(W-pad*2);
      const y=H-pad-((v-minV)/range)*(H-pad*2);
      return `${x},${y}`;
    }).join(' ');
    const targetY=H-pad-((target-minV)/range)*(H-pad*2);
    chartHtml=`<div style="margin-top:12px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-5);margin-bottom:4px;">Moisture Trend</div>
      <svg width="${W}" height="${H}" style="background:var(--surface-2);border-radius:var(--radius);display:block;">
        <line x1="${pad}" y1="${targetY}" x2="${W-pad}" y2="${targetY}" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,3" opacity=".6"/>
        <polyline points="${pts}" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linejoin="round"/>
        ${vals.map((v,i)=>{const x=pad+(i/(vals.length-1))*(W-pad*2);const y=H-pad-((v-minV)/range)*(H-pad*2);return `<circle cx="${x}" cy="${y}" r="3" fill="var(--gold)"/><title>${v}%</title>`;}).join('')}
        <text x="${W-pad}" y="${targetY-3}" text-anchor="end" font-size="9" fill="#22c55e">Target ${target}%</text>
      </svg>
    </div>`;
  }

  document.getElementById('bin-modal-body').innerHTML=`
    <div class="grid2 mb16" id="bm-details-container" style="${bin.status==='empty'?'display:none;':''}">
      <div class="form-group"><label class="form-label">Hybrid</label><input class="form-input fw700" id="bm-hybrid" value="${bin.hybrid||''}"></div>
      <div style="display:flex;gap:8px;">
        <div class="form-group" style="flex:1;"><label class="form-label">Qty (KG)</label><input class="form-input fw700 text-gold" type="number" step="1" id="bm-qty" value="${bin.qty||''}"></div>
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
        <label class="form-label">Target Moisture %</label>
        <input class="form-input" type="number" step="0.1" id="bm-target-m" value="${target}"
          style="font-family:'DM Mono',monospace;font-size:16px;font-weight:600;text-align:center;color:var(--green);">
      </div>
    </div>
    <div class="form-row cols2">
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" id="bm-s" onchange="document.getElementById('bm-details-container').style.display=this.value==='empty'?'none':'grid';document.getElementById('bm-details-divider').style.display=this.value==='empty'?'none':'block';">
          <option value="drying" ${bin.status!=='shelling'&&bin.status!=='empty'?'selected':''}>Drying</option>
          <option value="shelling" ${bin.status==='shelling'?'selected':''}>Shelling</option>
          <option value="empty" ${bin.status==='empty'?'selected':''}>Empty (Clear Bin)</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Capacity (Kg)</label>
        <input class="form-input" type="number" step="100" id="bm-capacity" value="${cap||''}" placeholder="e.g. 50000">
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
    ${chartHtml}
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
  const oldMoisture = b.currentMoisture;
  const snapshotBefore = { ...b }; // capture state before changes for history

  const newMoisture = parseFloat(document.getElementById('bm-m').value)||b.currentMoisture;
  b.currentMoisture = newMoisture;
  b.status=document.getElementById('bm-s').value;
  b.airflow=window._bAir||b.airflow;
  b.targetMoisture = parseFloat(document.getElementById('bm-target-m')?.value) || b.targetMoisture || 10;
  b.capacityKg = parseFloat(document.getElementById('bm-capacity')?.value) || b.capacityKg || 0;

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
      airflow: b.airflow,
      target_moisture: b.targetMoisture,
      capacity_kg: b.capacityKg
  };
  
  const success = await dbUpdateBin(b.id, updates);
  if (success) {
      // Log moisture reading if it changed (and bin is not empty)
      if (b.status !== 'empty' && newMoisture !== oldMoisture && b.hybrid) {
          const reading = { bin_id: b.id, moisture: newMoisture, recorded_by: null };
          dbInsertMoistureReading(reading).then(ok => {
              if (ok) state.moistureReadings.unshift({ ...reading, recorded_at: new Date().toISOString() });
          });
      }
      if (oldStatus !== b.status) {
          dbLogActivity('BIN_STATUS_CHANGED', `BIN-${b.binLabel||b.id} changed to ${b.status}`, 'bin', String(b.id));
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

async function verifyPinAndAccess() {
  const pin = document.getElementById('manager-pin-input').value;
  if (!pin) return;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  const hex = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  // Fetch hash from Supabase (falls back to local default if fetch fails)
  const storedHash = await dbFetchPinHash() || '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  if (hex === storedHash) {
    window.isManagerMode = true;
    toast('Manager Access Granted', 'success');
    closeModal('pin-modal');
    showPage('manager', managerAccessBtn);
  } else {
    toast('Invalid PIN. Access Denied.', 'error');
  }
}

window.changeManagerPin = async function() {
  const oldPin = document.getElementById('pin-old')?.value;
  const newPin = document.getElementById('pin-new')?.value;
  const confirmPin = document.getElementById('pin-confirm')?.value;
  if (!oldPin || !newPin || !confirmPin) { toast('Fill all PIN fields', 'error'); return; }
  if (newPin !== confirmPin) { toast('New PINs do not match', 'error'); return; }
  if (newPin.length < 4) { toast('PIN must be at least 4 digits', 'error'); return; }
  const oldBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(oldPin));
  const oldHex = Array.from(new Uint8Array(oldBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
  const storedHash = await dbFetchPinHash() || '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
  if (oldHex !== storedHash) { toast('Current PIN is incorrect', 'error'); return; }
  const newBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(newPin));
  const newHex = Array.from(new Uint8Array(newBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
  const ok = await dbSetPinHash(newHex);
  if (ok) {
    toast('Manager PIN updated successfully', 'success');
    closeModal('change-pin-modal');
    dbLogActivity('MANAGER_PIN_CHANGED', 'Manager PIN was changed');
  } else {
    toast('Failed to update PIN', 'error');
  }
};

window.updateMaintStatus = async function(id, newStatus) {
  const log = state.maintenance.find(m => m.id === id);
  if (!log) return;
  const ok = await dbUpdateMaintenanceStatus(id, newStatus);
  if (ok) {
    log.status = newStatus;
    if (window.Store) window.Store.emitChange();
  } else {
    toast('Failed to update status', 'error');
  }
};

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
          QtyKg: b.qty,
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
          QtyKg: i.qty,
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
            QtyKg: d.qty,
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
            QtyKg: h.qty,
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

// ── Maintenance image helpers ─────────────────────────────────
window.previewMaintImages = function(files) {
  const wrap = document.getElementById('maint-img-preview');
  if (!wrap) return;
  wrap.innerHTML = '';
  Array.from(files).forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;display:inline-block;';
      div.innerHTML = `<img src="${e.target.result}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1.5px solid var(--surface-4);">
        <button onclick="removeMaintPreview(${i})" style="position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#dc2626;color:#fff;border:none;cursor:pointer;font-size:11px;line-height:18px;text-align:center;padding:0;">✕</button>`;
      div.dataset.idx = i;
      wrap.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
};

window.removeMaintPreview = function(idx) {
  const input = document.getElementById('maint-images');
  const dt = new DataTransfer();
  Array.from(input.files).forEach((f, i) => { if (i !== idx) dt.items.add(f); });
  input.files = dt.files;
  previewMaintImages(input.files);
};

window.handleMaintImageDrop = function(e) {
  const input = document.getElementById('maint-images');
  const dt = new DataTransfer();
  // Merge existing + dropped
  Array.from(input.files).forEach(f => dt.items.add(f));
  Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(f => dt.items.add(f));
  input.files = dt.files;
  previewMaintImages(input.files);
};

async function _uploadMaintImages(files) {
  if (!files.length) return [];
  const urls = [];
  for (const file of files) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `maint/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await dbClient.storage.from('maint-images').upload(path, file, { upsert: false, contentType: file.type });
    if (!error) {
      const { data } = dbClient.storage.from('maint-images').getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);
    } else {
      console.warn('Image upload failed:', error.message);
    }
  }
  return urls;
}

// Lightbox viewer for maintenance images
window.openMaintImageViewer = function(urls, startIdx) {
  if (!urls.length) return;
  let cur = startIdx || 0;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;';
  const render = () => {
    overlay.innerHTML = `
      <div style="position:relative;max-width:90vw;max-height:80vh;">
        <img src="${urls[cur]}" style="max-width:90vw;max-height:78vh;object-fit:contain;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.6);">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="position:absolute;top:-12px;right:-12px;width:28px;height:28px;border-radius:50%;background:#fff;border:none;cursor:pointer;font-size:14px;font-weight:700;">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        ${cur > 0 ? `<button onclick="window._maintViewerNav(-1)" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;padding:8px 16px;border-radius:8px;cursor:pointer;">‹</button>` : '<span style="width:52px;"></span>'}
        <span style="color:rgba(255,255,255,.7);font-size:13px;">${cur+1} / ${urls.length}</span>
        ${cur < urls.length-1 ? `<button onclick="window._maintViewerNav(1)" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;padding:8px 16px;border-radius:8px;cursor:pointer;">›</button>` : '<span style="width:52px;"></span>'}
      </div>`;
  };
  window._maintViewerNav = d => { cur = Math.max(0, Math.min(urls.length-1, cur+d)); render(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  render();
  document.body.appendChild(overlay);
};

async function saveMaintenance() {
  const editIdRaw = document.getElementById('maint-edit-id')?.value;
  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const isEdit = !!editId;

  const date = document.getElementById('maint-date').value;
  const reportedBy = document.getElementById('maint-reported').value.trim();
  const equipment = document.getElementById('maint-equipment').value.trim();
  const issue = document.getElementById('maint-issue').value.trim();
  const work = document.getElementById('maint-work').value.trim();
  const checker = document.getElementById('maint-checker').value.trim();
  const items = document.getElementById('maint-items').value.trim();
  const cost = parseFloat(document.getElementById('maint-cost').value) || 0;
  const status = document.getElementById('maint-status')?.value || 'open';
  const priority = document.getElementById('maint-priority')?.value || 'medium';

  if (!date || !work) {
    toast('Date and Work Done are required', 'error');
    return;
  }

  const btn = document.getElementById('maint-save-btn') || document.querySelector('#maintenance-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    // Upload images first
    const imgFiles = Array.from(document.getElementById('maint-images')?.files || []);
    const imageUrls = await _uploadMaintImages(imgFiles);

    // If editing, merge new uploads with existing saved images
    const existingUrls = isEdit ? (((state.maintenance || []).find(x => x.id === editId) || {}).image_urls || []) : [];
    const allImageUrls = [...existingUrls, ...imageUrls];

    const log = {
      date: date,
      reported_by: reportedBy,
      equipment_name: equipment,
      issue_description: issue,
      work_done: work,
      checked_by: checker,
      items_bought: items,
      cost_amount: cost,
      image_urls: isEdit ? allImageUrls : imageUrls,
      status: status,
      priority: priority
    };

    if (isEdit) {
      const saved = await dbUpdateMaintenance(editId, log);
      if (saved) {
        const idx = (state.maintenance || []).findIndex(x => x.id === editId);
        if (idx !== -1) state.maintenance[idx] = saved;
        if (window.Store) window.Store.emitChange();
        closeModal('maintenance-modal');

        // Reset modal to create mode
        const editIdEl = document.getElementById('maint-edit-id'); if (editIdEl) editIdEl.value = '';
        const titleEl = document.getElementById('maint-modal-title'); if (titleEl) titleEl.textContent = 'New Maintenance Log';
        const saveBtnEl = document.getElementById('maint-save-btn'); if (saveBtnEl) saveBtnEl.textContent = 'Save Log';

        // Clear Inputs
        document.getElementById('maint-date').value = '';
        document.getElementById('maint-reported').value = '';
        document.getElementById('maint-equipment').value = '';
        document.getElementById('maint-issue').value = '';
        document.getElementById('maint-work').value = '';
        document.getElementById('maint-checker').value = '';
        document.getElementById('maint-items').value = '';
        document.getElementById('maint-cost').value = '';
        document.getElementById('maint-images').value = '';
        document.getElementById('maint-img-preview').innerHTML = '';
        if (document.getElementById('maint-status'))   document.getElementById('maint-status').value = 'open';
        if (document.getElementById('maint-priority')) document.getElementById('maint-priority').value = 'medium';

        toast('Maintenance log updated', 'success');
        dbLogActivity('MAINTENANCE_UPDATED', `Maintenance updated for ${equipment || 'Plant'}: ${work}`, 'maintenance', null, { equipment, priority, status });
      } else {
        toast('Failed to update log', 'error');
      }
    } else {
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
        document.getElementById('maint-images').value = '';
        document.getElementById('maint-img-preview').innerHTML = '';
        if (document.getElementById('maint-status'))   document.getElementById('maint-status').value = 'open';
        if (document.getElementById('maint-priority')) document.getElementById('maint-priority').value = 'medium';

        toast(imageUrls.length ? `Maintenance logged with ${imageUrls.length} photo${imageUrls.length>1?'s':''}` : 'Maintenance logged successfully', 'success');
        dbLogActivity('MAINTENANCE_LOGGED', `Maintenance for ${equipment || 'Plant'}: ${work}`, 'maintenance', null, { equipment, priority, status });
      } else {
        toast('Failed to save log', 'error');
      }
    }
  } catch (err) {
    console.error("Save maintenance error:", err);
    toast('Server error', 'error');
  } finally {
    btn.innerHTML = ogText;
    btn.disabled = false;
  }
}

// ── Labor image upload helpers ────────────────────────────────
window.previewLaborImages = function(files) {
  const wrap = document.getElementById('labor-img-preview');
  if (!wrap) return;
  wrap.innerHTML = '';
  Array.from(files).forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = e => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;display:inline-block;';
      div.innerHTML = `<img src="${e.target.result}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1.5px solid var(--surface-4);">
        <button onclick="removeLaborPreview(${i})" style="position:absolute;top:-5px;right:-5px;width:18px;height:18px;border-radius:50%;background:#dc2626;color:#fff;border:none;cursor:pointer;font-size:11px;line-height:18px;text-align:center;padding:0;">✕</button>`;
      div.dataset.idx = i;
      wrap.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
};

window.removeLaborPreview = function(idx) {
  const input = document.getElementById('labor-images');
  const dt = new DataTransfer();
  Array.from(input.files).forEach((f, i) => { if (i !== idx) dt.items.add(f); });
  input.files = dt.files;
  previewLaborImages(input.files);
};

window.handleLaborImageDrop = function(e) {
  const input = document.getElementById('labor-images');
  const dt = new DataTransfer();
  Array.from(input.files).forEach(f => dt.items.add(f));
  Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')).forEach(f => dt.items.add(f));
  input.files = dt.files;
  previewLaborImages(input.files);
};

async function _uploadLaborImages(files) {
  if (!files.length) return [];
  const urls = [];
  for (const file of files) {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `labor/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await dbClient.storage.from('maint-images').upload(path, file, { upsert: false, contentType: file.type });
    if (!error) {
      const { data } = dbClient.storage.from('maint-images').getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);
    } else {
      console.warn('Labor image upload failed:', error.message);
    }
  }
  return urls;
}

// Lightbox viewer for labor images
window.openLaborImageViewer = function(laborId, startIdx) {
  const log = (state.labor || []).find(l => l.id === laborId);
  const urls = (log && Array.isArray(log.image_urls)) ? log.image_urls : [];
  if (!urls.length) return;
  let cur = startIdx || 0;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;';
  const render = () => {
    overlay.innerHTML = `
      <div style="position:relative;max-width:90vw;max-height:80vh;">
        <img src="${urls[cur]}" style="max-width:90vw;max-height:78vh;object-fit:contain;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,.6);">
        <button onclick="this.closest('div').parentElement.parentElement.remove()" style="position:absolute;top:-12px;right:-12px;width:28px;height:28px;border-radius:50%;background:#fff;border:none;cursor:pointer;font-size:14px;font-weight:700;">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        ${cur > 0 ? `<button onclick="window._laborViewerNav(-1)" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;padding:8px 16px;border-radius:8px;cursor:pointer;">‹</button>` : '<span style="width:52px;"></span>'}
        <span style="color:rgba(255,255,255,.7);font-size:13px;">${cur+1} / ${urls.length}</span>
        ${cur < urls.length-1 ? `<button onclick="window._laborViewerNav(1)" style="background:rgba(255,255,255,.2);border:none;color:#fff;font-size:22px;padding:8px 16px;border-radius:8px;cursor:pointer;">›</button>` : '<span style="width:52px;"></span>'}
      </div>`;
  };
  window._laborViewerNav = d => { cur = Math.max(0, Math.min(urls.length-1, cur+d)); render(); };
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  render();
  document.body.appendChild(overlay);
};

window.openEditLaborModal = function(laborId) {
  const log = (state.labor || []).find(l => l.id === laborId);
  if (!log) { toast('Log not found', 'error'); return; }

  populateLaborGroupSelect();

  document.getElementById('labor-edit-id').value = laborId;
  document.getElementById('labor-modal-title').textContent = 'Edit Shift Log';
  document.getElementById('labor-save-btn').textContent = 'Save Changes';

  document.getElementById('labor-date').value = log.date ? log.date.slice(0, 10) : '';
  document.getElementById('labor-shift').value = log.shift || '';
  document.getElementById('labor-headcount').value = log.headcount || '';
  document.getElementById('labor-people').value = log.people_names || '';
  document.getElementById('labor-remarks').value = log.notes || '';
  if (document.getElementById('labor-wage')) document.getElementById('labor-wage').value = log.wage_per_day || '';

  // Restore group select — match by labor_group_id
  const grpSel = document.getElementById('labor-group');
  if (grpSel && log.labor_group_id) grpSel.value = log.labor_group_id;

  // Restore work area from role string (after the " · " separator)
  const workAreaSel = document.getElementById('labor-role');
  if (workAreaSel) {
    const parts = (log.role || '').split(' · ');
    const area = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const opt = [...workAreaSel.options].find(o => o.value === area);
    if (opt) workAreaSel.value = area;
  }

  // Show existing images
  const preview = document.getElementById('labor-img-preview');
  if (preview) {
    preview.innerHTML = '';
    if (Array.isArray(log.image_urls) && log.image_urls.length) {
      log.image_urls.forEach((url, i) => {
        const div = document.createElement('div');
        div.style.cssText = 'position:relative;display:inline-block;';
        div.innerHTML = `<img src="${esc(url)}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1.5px solid var(--surface-4);" title="Existing photo">
          <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.5);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">saved</span>`;
        preview.appendChild(div);
      });
    }
  }

  // Clear new file picker
  const fileInput = document.getElementById('labor-images');
  if (fileInput) fileInput.value = '';

  openModal('labor-modal');
};

async function saveLabor() {
  const editId = document.getElementById('labor-edit-id')?.value;
  const isEdit = !!editId;

  const date = document.getElementById('labor-date').value;
  const shift = document.getElementById('labor-shift').value.trim();
  const groupId = document.getElementById('labor-group').value;
  const groupObj = groupId ? getLaborGroups().find(g => g.id == groupId) : null;
  const groupName = groupObj ? groupObj.name : '';
  const workArea = document.getElementById('labor-role').value;
  const role = groupName ? `${groupName}${workArea ? ' · ' + workArea : ''}` : workArea;
  const headcount = parseInt(document.getElementById('labor-headcount').value) || 0;
  const people = document.getElementById('labor-people').value.trim();
  const remarks = document.getElementById('labor-remarks').value.trim();
  const wagePerDay = parseFloat(document.getElementById('labor-wage')?.value) || 0;

  if (!date || headcount <= 0) {
    toast('Date and valid headcount are required', 'error');
    return;
  }

  const btn = document.getElementById('labor-save-btn') || document.querySelector('#labor-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  try {
    // Upload any new images
    const imgFiles = Array.from(document.getElementById('labor-images')?.files || []);
    let newImageUrls = [];
    if (imgFiles.length) {
      toast('Uploading photos…', 'info');
      newImageUrls = await _uploadLaborImages(imgFiles);
    }

    const log = {
      date,
      shift,
      role,
      headcount,
      people_names: people,
      notes: remarks,
      wage_per_day: wagePerDay,
      labor_group_id: groupId ? parseInt(groupId) : null
    };

    if (isEdit) {
      // Merge new images with existing ones
      const existing = (state.labor || []).find(l => l.id == editId);
      const existingUrls = (existing && Array.isArray(existing.image_urls)) ? existing.image_urls : [];
      log.image_urls = [...existingUrls, ...newImageUrls];

      const updated = await dbUpdateLabor(parseInt(editId), log);
      if (updated) {
        const idx = state.labor.findIndex(l => l.id == editId);
        if (idx >= 0) state.labor[idx] = updated;
        if (window.Store) window.Store.emitChange();
        closeModal('labor-modal');
        toast('Shift log updated', 'success');
        dbLogActivity('LABOR_UPDATED', `Shift log ${editId} updated (${role})`, 'labor');
      } else {
        toast('Failed to update log', 'error');
      }
    } else {
      if (newImageUrls.length) log.image_urls = newImageUrls;
      const saved = await dbInsertLabor(log);
      if (saved) {
        state.labor.unshift(saved);
        if (window.Store) window.Store.emitChange();
        closeModal('labor-modal');
        toast(newImageUrls.length ? `Shift logged with ${newImageUrls.length} photo${newImageUrls.length>1?'s':''}` : 'Labor shift logged', 'success');
        dbLogActivity('LABOR_LOGGED', `${headcount} people added for ${shift} shift (${role})`, 'labor');
      } else {
        toast('Failed to save log', 'error');
      }
    }

    // Reset modal state
    document.getElementById('labor-edit-id').value = '';
    document.getElementById('labor-modal-title').textContent = 'New Shift Log';
    document.getElementById('labor-save-btn').textContent = 'Save Log';
    document.getElementById('labor-date').value = '';
    document.getElementById('labor-shift').value = '';
    document.getElementById('labor-group').value = '';
    document.getElementById('labor-role').value = 'Shelling';
    document.getElementById('labor-headcount').value = '';
    document.getElementById('labor-people').value = '';
    document.getElementById('labor-remarks').value = '';
    if (document.getElementById('labor-wage')) document.getElementById('labor-wage').value = '';
    if (document.getElementById('labor-images')) document.getElementById('labor-images').value = '';
    const preview = document.getElementById('labor-img-preview');
    if (preview) preview.innerHTML = '';

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
// ── Boiler Status (dual temp + pressure) ─────────────────────
window.toggleBoilerEdit = function() {
  const popup = document.getElementById('boiler-popup');
  if (!popup) return;
  const isOpen = popup.style.display !== 'none';
  popup.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) {
    const b1 = document.getElementById('boiler-1-display')?.textContent;
    const b2 = document.getElementById('boiler-2-display')?.textContent;
    const pr = document.getElementById('boiler-pressure-display')?.textContent;
    const pu = document.getElementById('boiler-pressure-unit-display')?.textContent;
    const i1 = document.getElementById('boiler-1-input');
    const i2 = document.getElementById('boiler-2-input');
    const ip = document.getElementById('boiler-pressure-input');
    const iu = document.getElementById('boiler-pressure-unit');
    if (i1) i1.value = b1 !== '—' ? b1 : '';
    if (i2) i2.value = b2 !== '—' ? b2 : '';
    if (ip) ip.value = pr !== '—' ? pr : '';
    if (iu && pu) iu.value = pu;
    setTimeout(() => document.getElementById('boiler-1-input')?.focus(), 50);
  }
};

window.saveBoilerStatus = async function() {
  const b1  = document.getElementById('boiler-1-input')?.value?.trim();
  const b2  = document.getElementById('boiler-2-input')?.value?.trim();
  const pr  = document.getElementById('boiler-pressure-input')?.value?.trim();
  const pu  = document.getElementById('boiler-pressure-unit')?.value || 'kg/cm²';

  if (!b1 && !b2 && !pr) { toast('Enter at least one reading', 'warn'); return; }

  const saves = [];
  if (b1) saves.push(dbSetBoilerTemp(b1, 'boiler_1_temp'));
  if (b2) saves.push(dbSetBoilerTemp(b2, 'boiler_2_temp'));
  if (pr) {
    saves.push(dbSetBoilerTemp(pr, 'boiler_pressure'));
    saves.push(dbSetBoilerTemp(pu, 'boiler_pressure_unit'));
  }
  await Promise.all(saves);

  if (b1) { state.boiler1Temp = b1; const el = document.getElementById('boiler-1-display'); if (el) el.textContent = b1; }
  if (b2) { state.boiler2Temp = b2; const el = document.getElementById('boiler-2-display'); if (el) el.textContent = b2; }
  if (pr) {
    state.boilerPressure = pr; state.boilerPressureUnit = pu;
    const ep = document.getElementById('boiler-pressure-display'); if (ep) ep.textContent = pr;
    const eu = document.getElementById('boiler-pressure-unit-display'); if (eu) eu.textContent = pu;
  }
  toggleBoilerEdit();
  toast(`Boiler updated${b1?' B1:'+b1+'°C':''}${b2?' B2:'+b2+'°C':''}${pr?' P:'+pr+pu:''}`, 'success');
};

// Legacy single-temp save (kept for backward compat)
window.saveBoilerTemp = window.saveBoilerStatus;

// Close boiler popup when clicking outside
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('boiler-wrap');
  const popup = document.getElementById('boiler-popup');
  if (popup && popup.style.display !== 'none' && wrap && !wrap.contains(e.target)) {
    popup.style.display = 'none';
  }
});

function calcTruckNetWeight() {
  const gross = parseFloat(document.getElementById('t-gross').value) || 0;
  const tare = parseFloat(document.getElementById('t-tare').value) || 0;
  const net = gross - tare;
  const el = document.getElementById('t-net-display');
  if (el) el.textContent = net > 0 ? net.toLocaleString('en-IN') + ' Kg' : '—';
}

let _editingTruckId = null;

// ── Lot number helpers ────────────────────────────────────────
function _renderTruckLots(lots) {
  const container = document.getElementById('t-lots-container');
  if (!container) return;
  container.innerHTML = (lots || []).map((lot, i) => `
    <div style="display:flex;gap:8px;align-items:center;">
      <input class="form-input" style="flex:1;" placeholder="e.g. LOT-2026-001" value="${escapeHtml(lot)}"
        oninput="_updateTruckLot(${i}, this.value)">
      <button type="button" class="btn btn-ghost btn-sm" style="flex-shrink:0;color:var(--red);" onclick="_removeTruckLot(${i})">✕</button>
    </div>`).join('');
}

window._updateTruckLot = function(i, val) {
  const inputs = document.querySelectorAll('#t-lots-container .form-input');
  // live update is handled on save by reading all inputs
};

window._removeTruckLot = function(i) {
  const inputs = [...document.querySelectorAll('#t-lots-container .form-input')];
  const lots = inputs.map(el => el.value.trim()).filter((_, idx) => idx !== i);
  _renderTruckLots(lots);
};

window.addTruckLot = function() {
  const inputs = [...document.querySelectorAll('#t-lots-container .form-input')];
  const lots = inputs.map(el => el.value.trim());
  lots.push('');
  _renderTruckLots(lots);
  // Focus the new input
  const newInputs = document.querySelectorAll('#t-lots-container .form-input');
  if (newInputs.length) newInputs[newInputs.length - 1].focus();
};

function _collectTruckLots() {
  return [...document.querySelectorAll('#t-lots-container .form-input')]
    .map(el => el.value.trim()).filter(Boolean);
}

function openTruckModal() {
  _editingTruckId = null;
  ['t-vehicle','t-company','t-location','t-driver','t-phone','t-notes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  ['t-gross','t-tare'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('t-net-display').textContent = '—';
  document.getElementById('t-status').value = 'waiting';
  document.getElementById('t-arrival').value = new Date().toISOString().slice(0,16);
  document.getElementById('truck-modal-title').textContent = 'Register Truck';
  _renderTruckLots([]);
  // Reset slip scan state
  const slipPhoto = document.getElementById('t-slip-photo');
  const slipStatus = document.getElementById('t-slip-status');
  const slipPreview = document.getElementById('t-slip-preview');
  if (slipPhoto)   slipPhoto.value = '';
  if (slipStatus)  { slipStatus.style.display = 'none'; slipStatus.textContent = ''; }
  if (slipPreview) { slipPreview.style.display = 'none'; slipPreview.src = ''; }
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
  _renderTruckLots(truck.lotNumbers || []);
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
    arrival_time: document.getElementById('t-arrival').value ? new Date(document.getElementById('t-arrival').value).toISOString() : new Date().toISOString(),
    lot_numbers: _collectTruckLots()
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
  // Auto-fill weights (match actual input classes in addVehicleRow)
  const gwInputs = document.querySelectorAll('.i-gross-weight-input');
  const vwInputs = document.querySelectorAll('.i-veh-weight-input');
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

window.openEditMaintenanceModal = function(id) {
  const m = (state.maintenance || []).find(x => x.id === id);
  if (!m) { toast('Record not found', 'error'); return; }
  document.getElementById('maint-edit-id').value = id;
  document.getElementById('maint-modal-title').textContent = 'Edit Maintenance Log';
  document.getElementById('maint-save-btn').textContent = 'Save Changes';
  document.getElementById('maint-date').value = m.date ? m.date.slice(0,10) : '';
  document.getElementById('maint-reported').value = m.reported_by || '';
  document.getElementById('maint-equipment').value = m.equipment_name || '';
  document.getElementById('maint-issue').value = m.issue_description || '';
  document.getElementById('maint-work').value = m.work_done || '';
  document.getElementById('maint-checker').value = m.checked_by || '';
  document.getElementById('maint-items').value = m.items_bought || '';
  document.getElementById('maint-cost').value = m.cost_amount || '';
  if (document.getElementById('maint-status'))  document.getElementById('maint-status').value  = m.status  || 'open';
  if (document.getElementById('maint-priority')) document.getElementById('maint-priority').value = m.priority || 'medium';
  // Show existing images
  const preview = document.getElementById('maint-img-preview');
  if (preview) {
    preview.innerHTML = '';
    const imgs = Array.isArray(m.image_urls) ? m.image_urls : [];
    imgs.forEach((url, i) => {
      const div = document.createElement('div');
      div.style.cssText = 'position:relative;display:inline-block;';
      div.innerHTML = `<img src="${escapeHtml(url)}" style="width:72px;height:72px;object-fit:cover;border-radius:8px;border:1.5px solid var(--surface-4);" title="Existing photo">
        <span style="position:absolute;bottom:2px;left:2px;background:rgba(0,0,0,.5);color:#fff;font-size:9px;padding:1px 4px;border-radius:3px;">saved</span>`;
      preview.appendChild(div);
    });
  }
  const fi = document.getElementById('maint-images'); if (fi) fi.value = '';
  openModal('maintenance-modal');
};

window.openEditBackyardModal = function(id) {
  const r = (state.backyardRemovals || []).find(x => x.id === id);
  if (!r) { toast('Record not found', 'error'); return; }
  // Populate dropdowns first
  openBackyardModal();
  // Then override with edit values
  document.getElementById('backyard-edit-id').value = id;
  document.getElementById('backyard-modal-title').textContent = 'Edit Stock Removal';
  document.getElementById('backyard-save-btn').textContent = 'Save Changes';
  if (r.intakeId) document.getElementById('by-intake').value = r.intakeId;
  if (r.binId)    document.getElementById('by-bin').value    = r.binId;
  document.getElementById('by-vehicle').value    = r.vehicleNo  || '';
  document.getElementById('by-hybrid').value     = r.hybrid     || '';
  document.getElementById('by-qty').value        = r.qtyRemoved || '';
  document.getElementById('by-bags').value       = r.bagsRemoved || '';
  document.getElementById('by-reason').value     = r.reason     || 'damaged';
  document.getElementById('by-removed-by').value = r.removedBy  || '';
  document.getElementById('by-notes').value      = r.notes      || '';
};

window.openEditDispatchModal = function(receiptId) {
  const d = (state.dispatches || []).find(x => x.receiptId === receiptId);
  if (!d) { toast('Dispatch not found', 'error'); return; }
  document.getElementById('dispatch-edit-id').value = receiptId;
  document.getElementById('dispatch-modal-title').textContent = 'Edit Dispatch — ' + receiptId;
  const saveSpan = document.getElementById('dispatch-save-btn') && document.getElementById('dispatch-save-btn').querySelector('span');
  if (saveSpan) saveSpan.textContent = 'Save Changes';
  document.getElementById('d-party').value   = d.party   || '';
  document.getElementById('d-address').value = d.address || '';
  document.getElementById('d-vehicle').value = d.vehicle || '';
  document.getElementById('d-lr').value      = d.lr      || '';
  document.getElementById('d-hybrid').value  = d.hybrid  || '';
  document.getElementById('d-bags').value    = d.bags    || '';
  document.getElementById('d-qty').value     = d.qty     || '';
  document.getElementById('d-amount').value  = d.amount  || '';
  document.getElementById('d-moisture').value= d.moisture|| '';
  document.getElementById('d-remarks').value = d.remarks || '';
  const driverName  = document.getElementById('d-driver-name');
  const driverPhone = document.getElementById('d-driver-phone');
  if (driverName)  driverName.value  = d.driverName  || '';
  if (driverPhone) driverPhone.value = d.driverPhone || '';
  // Lots
  const lotInputs = document.querySelectorAll('.d-lot-input');
  const lots = (d.lot || '').split(',').map(l => l.trim()).filter(Boolean);
  if (lotInputs.length > 0 && lots.length > 0) lotInputs[0].value = lots[0];
  openModal('dispatch-modal');
};

async function saveBackyardRemoval() {
  const qty = parseFloat(document.getElementById('by-qty').value);
  if (!qty || qty <= 0) { toast('Quantity removed is required', 'error'); return; }

  const editIdRaw = document.getElementById('backyard-edit-id')?.value;
  const editId = editIdRaw ? parseInt(editIdRaw) : null;
  const isEdit = !!editId;

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

  if (isEdit) {
    const saved = await dbUpdateBackyardRemoval(editId, record);
    if (saved) {
      const idx = (state.backyardRemovals || []).findIndex(x => x.id === editId);
      if (idx !== -1) {
        // Merge updated DB row with existing display fields
        state.backyardRemovals[idx] = { ...state.backyardRemovals[idx], ...saved,
          intakeId: saved.intake_id, binId: saved.bin_id, vehicleNo: saved.vehicle_no,
          qtyRemoved: saved.qty_removed, bagsRemoved: saved.bags_removed,
          removedBy: saved.removed_by, hybrid: saved.hybrid, reason: saved.reason, notes: saved.notes
        };
      }
      // Reset modal state
      const editIdEl = document.getElementById('backyard-edit-id'); if (editIdEl) editIdEl.value = '';
      const titleEl = document.getElementById('backyard-modal-title'); if (titleEl) titleEl.textContent = 'Log Stock Removal';
      const saveBtnEl = document.getElementById('backyard-save-btn'); if (saveBtnEl) saveBtnEl.textContent = 'Log Removal';
      toast('Stock removal updated', 'success');
      closeModal('backyard-modal');
      if (window.Store) window.Store.emitChange();
    } else {
      toast('Failed to update removal', 'error');
    }
  } else {
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
  const todayLabor = (state.labor || []).filter(l => {
    const lDate = l.date ? new Date(l.date).toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '';
    return lDate === todayStr;
  });

  const totalIntakeQty = todayIntakes.reduce((s,i) => s + parseFloat(i.qty||0), 0);
  const totalDispQty = todayDispatches.reduce((s,d) => s + parseFloat(d.qty||0), 0);
  const totalRev = todayDispatches.reduce((s,d) => s + parseInt(d.amount||0), 0);
  const totalHeadcount = todayLabor.reduce((s,l) => s + parseInt(l.headcount||0), 0);

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
      m.equipment_name||'—', m.issue_description||'—', m.work_done||'—', m.checked_by||'—',
      m.cost_amount ? '₹'+parseInt(m.cost_amount).toLocaleString('en-IN') : '—'
    ])).join('')}</tbody>
  </table>` : '<p style="color:#999;font-size:12px;font-style:italic;">No maintenance logged today.</p>';

  const laborTable = todayLabor.length ? `<table style="width:100%;border-collapse:collapse;">
    <thead>${th(['Group / Role','Shift','Headcount','Members','Remarks'])}</thead>
    <tbody>${todayLabor.map(l => {
      const parts = (l.role||'').split('·');
      const group = parts[0]?.trim() || '—';
      const area  = parts[1]?.trim() || '';
      return row([
        area ? `<strong>${group}</strong><br><span style="font-size:11px;color:#888;">${area}</span>` : `<strong>${group}</strong>`,
        l.shift||'—',
        `<strong>${l.headcount||0}</strong>`,
        l.people_names ? `<span style="font-size:11px;">${l.people_names}</span>` : '—',
        l.notes||'—'
      ]);
    }).join('')}</tbody>
  </table>
  <div style="margin-top:8px;font-size:12px;color:#555;">Total workers today: <strong>${totalHeadcount} across ${todayLabor.length} shift${todayLabor.length!==1?'s':''}</strong></div>`
  : '<p style="color:#999;font-size:12px;font-style:italic;">No labor shifts logged today.</p>';

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
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-bottom:28px;">
    ${[
      ['📥 Intake Today', todayIntakes.length + ' loads · ' + totalIntakeQty.toLocaleString('en-IN') + ' Kg', '#F5A623'],
      ['📤 Dispatched Today', todayDispatches.length + ' dispatches · ' + totalDispQty.toLocaleString('en-IN') + ' Kg', '#10B981'],
      ['💰 Revenue Today', '₹' + totalRev.toLocaleString('en-IN'), '#8B5CF6'],
      ['👷 Labor Today', totalHeadcount + ' workers · ' + todayLabor.length + ' shift' + (todayLabor.length!==1?'s':''), '#0EA5E9'],
    ].map(([lbl,val,col]) => `<div style="background:#F8F9FA;border-left:4px solid ${col};padding:14px 16px;border-radius:6px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#666;margin-bottom:4px;">${lbl}</div>
      <div style="font-size:16px;font-weight:800;color:#0F1923;">${val}</div>
    </div>`).join('')}
  </div>
  ${section('📥 Intake Register', intakeTable)}
  ${section('📤 Dispatches', dispatchTable)}
  ${section('🏭 Active Bin Status', binsTable)}
  ${section('🔧 Maintenance', maintTable)}
  ${section('👷 Labor & Shifts', laborTable)}
  <div style="margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:10px;color:#aaa;text-align:center;">
    Yellina Seeds Pvt. Ltd. — Sathupally | Auto-generated by Operations Platform | ${new Date().toLocaleString('en-IN')}
  </div>
  <script>window.onload=function(){window.print();};<\/script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=1000,height=700');
  if (w) { w.document.write(html); w.document.close(); }
  else { toast('Please allow pop-ups to generate the report', 'info'); }
};

// ================================================================
// RATE CALCULATOR — dispatch modal
// ================================================================
window.calcDispatchRate = function() {
  const bags   = parseInt(document.getElementById('d-bags')?.value)        || 0;
  const rate   = parseFloat(document.getElementById('d-rate-per-bag')?.value) || 0;
  if (bags > 0 && rate > 0) {
    const amtEl = document.getElementById('d-amount');
    if (amtEl) { amtEl.value = Math.round(bags * rate); }
  }
};

// ================================================================
// LABOR GROUPS — Supabase DB
// ================================================================
window.getLaborGroups = function() {
  return (window.state && state.laborGroups) ? state.laborGroups : [];
};

window.openGroupsModal = function() {
  renderGroupsList();
  populateLaborGroupSelect();
  openModal('labor-groups-modal');
};

function renderGroupsList() {
  const groups = getLaborGroups();
  const el = document.getElementById('groups-list');
  if (!el) return;
  if (!groups.length) {
    el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--ink-5);font-size:13px;">No groups yet — add your first group above.</div>`;
    return;
  }
  el.innerHTML = groups.map(g => `
    <div style="background:var(--surface);border:1px solid var(--surface-4);border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px;">&#128101; ${escapeHtml(g.name)}</div>
          <div style="font-size:12px;color:var(--ink-4);">${g.members.length} member${g.members.length !== 1 ? 's' : ''}:</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px;">
            ${g.members.map(m => `<span style="background:var(--surface-3);border-radius:99px;padding:2px 10px;font-size:11px;color:var(--ink-3);">${escapeHtml(m)}</span>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-shrink:0;margin-left:12px;">
          <button class="btn btn-ghost btn-sm" onclick="editGroup(${g.id})">&#9999;&#65039; Edit</button>
          <button class="btn btn-ghost btn-sm" style="color:var(--red);" onclick="deleteGroup(${g.id})">&#128465;&#65039;</button>
        </div>
      </div>
    </div>`).join('');
}

window.saveGroup = async function() {
  const name = document.getElementById('grp-name').value.trim();
  const rawMembers = document.getElementById('grp-members').value.trim();
  const editId = document.getElementById('grp-edit-id').value;

  if (!name) { toast('Group name is required', 'error'); return; }

  const members = rawMembers.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  const btn = document.querySelector('#labor-groups-modal .btn-solid');
  if (btn) { btn.textContent = 'Saving…'; btn.disabled = true; }

  try {
    if (editId) {
      const updated = await dbUpdateLaborGroup(parseInt(editId), { name, members });
      if (updated) {
        const idx = state.laborGroups.findIndex(g => g.id == editId);
        const mapped = { id: updated.id, name: updated.name, members: updated.members || [], sortOrder: updated.sort_order || 0 };
        if (idx >= 0) state.laborGroups[idx] = mapped;
        else state.laborGroups.push(mapped);
      }
      toast('Group updated', 'success');
    } else {
      const inserted = await dbInsertLaborGroup({ name, members });
      if (inserted) {
        state.laborGroups.push({ id: inserted.id, name: inserted.name, members: inserted.members || [], sortOrder: inserted.sort_order || 0 });
      }
      toast('Group added', 'success');
    }
    resetGroupForm();
    renderGroupsList();
    populateLaborGroupSelect();
    if (window.Store) window.Store.emitChange();
  } catch (err) {
    console.error('saveGroup error:', err);
    toast('Failed to save group', 'error');
  } finally {
    if (btn) { btn.textContent = 'Save Group'; btn.disabled = false; }
  }
};

window.editGroup = function(id) {
  const g = getLaborGroups().find(x => x.id == id);
  if (!g) return;
  document.getElementById('grp-edit-id').value = g.id;
  document.getElementById('grp-name').value = g.name;
  document.getElementById('grp-members').value = g.members.join('\n');
  document.getElementById('grp-form-title').textContent = '\u270F\uFE0F Edit Group';
  document.getElementById('grp-cancel-btn').style.display = 'inline-flex';
  document.getElementById('grp-name').focus();
};

window.deleteGroup = async function(id) {
  if (!confirm(`Delete this group? This won't affect existing shift logs.`)) return;
  try {
    await dbDeleteLaborGroup(parseInt(id));
    state.laborGroups = state.laborGroups.filter(g => g.id != id);
    renderGroupsList();
    populateLaborGroupSelect();
    if (window.Store) window.Store.emitChange();
    toast('Group deleted', 'info');
  } catch (err) {
    console.error('deleteGroup error:', err);
    toast('Failed to delete group', 'error');
  }
};

window.resetGroupForm = function() {
  document.getElementById('grp-edit-id').value = '';
  document.getElementById('grp-name').value = '';
  document.getElementById('grp-members').value = '';
  document.getElementById('grp-form-title').textContent = '\u2795 Add New Group';
  document.getElementById('grp-cancel-btn').style.display = 'none';
};

window.populateLaborGroupSelect = function() {
  const sel = document.getElementById('labor-group');
  if (!sel) return;
  const groups = getLaborGroups();
  const cur = sel.value;
  sel.innerHTML = '<option value="">— Select Group —</option>' +
    groups.map(g => `<option value="${g.id}">${escapeHtml(g.name)} (${g.members.length})</option>`).join('');
  if (cur) sel.value = cur;
};

// ── Field Updates ─────────────────────────────────────────────

// Show/hide fields depending on selected update type
window.onUpdTypeChange = function() {
  const type = document.getElementById('upd-type')?.value || 'general';
  const binGroup      = document.getElementById('upd-bin-group');
  const moistureGroup = document.getElementById('upd-moisture-group');
  const tempGroup     = document.getElementById('upd-temp-group');
  const intakeGroup   = document.getElementById('upd-intake-group');

  // defaults
  if (binGroup)      binGroup.style.display      = 'none';
  if (moistureGroup) moistureGroup.style.display  = 'none';
  if (tempGroup)     tempGroup.style.display      = 'none';
  if (intakeGroup)   intakeGroup.style.display    = 'none';

  const weighGroup = document.getElementById('upd-weigh-group');
  if (weighGroup) weighGroup.style.display = 'none';

  if (type === 'moisture_photo') {
    if (binGroup)      binGroup.style.display      = 'block';
    if (moistureGroup) moistureGroup.style.display  = 'block';
  } else if (type === 'boiler_temp') {
    if (tempGroup) tempGroup.style.display = 'block';
  } else if (type === 'intake_photo') {
    if (binGroup)    binGroup.style.display    = 'block';
    if (intakeGroup) intakeGroup.style.display = 'flex';
  } else if (type === 'bin_note') {
    if (binGroup) binGroup.style.display = 'block';
  } else if (type === 'weigh_slip') {
    if (weighGroup) weighGroup.style.display = 'block';
  }
};

window.openUpdateModal = function() {
  ['upd-type','upd-bin','upd-notes','upd-ocr-text','upd-moisture','upd-temp','upd-temp2','upd-pressure',
   'upd-hybrid','upd-qty','upd-ticket-no','upd-vehicle-no','upd-company-name','upd-weigh-hybrid',
   'upd-bags-count','upd-tare-wt','upd-gross-wt','upd-net-wt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const preview = document.getElementById('upd-photo-preview');
  if (preview) { preview.src = ''; preview.style.display = 'none'; }
  const ocrWrap = document.getElementById('upd-ocr-wrap');
  if (ocrWrap) ocrWrap.style.display = 'none';
  const photoEl = document.getElementById('upd-photo');
  if (photoEl) photoEl.value = '';
  const typeEl = document.getElementById('upd-type');
  if (typeEl) typeEl.value = 'general';
  ['upd-moisture-detected','upd-temp-detected','upd-weigh-detected'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  onUpdTypeChange();
  openModal('update-modal');
};

window.saveFieldUpdate = async function() {
  const type         = document.getElementById('upd-type')?.value || 'general';
  const binId        = (() => { const v = document.getElementById('upd-bin')?.value; return v ? parseInt(v) : null; })();
  const notes        = document.getElementById('upd-notes')?.value?.trim() || '';
  const ocrText      = document.getElementById('upd-ocr-text')?.value?.trim() || '';
  const moistureVal  = parseFloat(document.getElementById('upd-moisture')?.value) || null;
  const tempVal      = parseFloat(document.getElementById('upd-temp')?.value) || null;
  const temp2Val     = parseFloat(document.getElementById('upd-temp2')?.value) || null;
  const pressureVal  = parseFloat(document.getElementById('upd-pressure')?.value) || null;
  const pressureUnit = document.getElementById('upd-pressure-unit')?.value || 'kg/cm²';
  const hybrid       = document.getElementById('upd-hybrid')?.value?.trim() || null;
  const qty          = parseFloat(document.getElementById('upd-qty')?.value) || null;
  const file         = document.getElementById('upd-photo')?.files?.[0] || null;
  const btn          = document.getElementById('upd-save-btn');

  // Weigh slip fields
  const materialDir  = document.getElementById('upd-material-dir')?.value || 'INWARD';
  const ticketNo     = document.getElementById('upd-ticket-no')?.value?.trim() || null;
  const vehicleNo    = document.getElementById('upd-vehicle-no')?.value?.trim().toUpperCase() || null;
  const companyName  = document.getElementById('upd-company-name')?.value?.trim() || null;
  const weighHybrid  = document.getElementById('upd-weigh-hybrid')?.value?.trim() || null;
  const bagsCount    = parseInt(document.getElementById('upd-bags-count')?.value) || null;
  const tareWt       = parseFloat(document.getElementById('upd-tare-wt')?.value) || null;
  const grossWt      = parseFloat(document.getElementById('upd-gross-wt')?.value) || null;
  const netWt        = parseFloat(document.getElementById('upd-net-wt')?.value) || (grossWt && tareWt ? grossWt - tareWt : null);

  // Validation
  if (type === 'moisture_photo' && !moistureVal) { toast('Enter the moisture % reading.', 'warn'); return; }
  if (type === 'boiler_temp' && !tempVal && !temp2Val && !pressureVal) { toast('Enter at least one boiler reading.', 'warn'); return; }
  if (type === 'weigh_slip' && !vehicleNo && !ticketNo) { toast('Enter at least the Vehicle No or Ticket No.', 'warn'); return; }
  if (!notes && !file && !moistureVal && !tempVal && !temp2Val && !pressureVal && type !== 'weigh_slip') { toast('Add a photo, reading, or note before saving.', 'warn'); return; }

  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  try {
    // 1. Upload photo
    let photoUrl = null;
    if (file) {
      toast('Uploading photo…', 'info');
      photoUrl = await dbUploadFieldUpdateImage(file);
    }

    // 2. Get submitter
    let submittedBy = '';
    try { const { data: { user } } = await dbClient.auth.getUser(); submittedBy = user?.email || ''; } catch(e) {}

    // 3. Insert field_update record
    const record = {
      update_type:       type,
      notes:             notes || null,
      ocr_text:          ocrText || null,
      photo_url:         photoUrl,
      bin_id:            binId,
      submitted_by:      submittedBy,
      moisture_value:    moistureVal,
      temperature_value: tempVal,
      boiler_temp_1:     tempVal,
      boiler_temp_2:     temp2Val,
      pressure_value:    pressureVal,
      pressure_unit:     pressureVal ? pressureUnit : null,
      hybrid:            hybrid || weighHybrid,
      qty_bags:          qty || bagsCount,
      ticket_no:         ticketNo,
      material_direction:type === 'weigh_slip' ? materialDir : null,
      vehicle_no:        vehicleNo,
      company_name:      companyName,
      tare_weight:       tareWt,
      gross_weight_slip: grossWt,
      net_weight_slip:   netWt,
      bags_count:        bagsCount
    };
    const saved = await dbInsertFieldUpdate(record);
    if (!saved) throw new Error('Insert failed');

    // 4. Cross-table side-effects
    if (type === 'moisture_photo' && binId && moistureVal) {
      // Update bin moisture live
      const { error: binErr } = await dbClient.from('bins')
        .update({ current_moisture: moistureVal, updated_by: submittedBy, updated_at: new Date().toISOString() })
        .eq('id', binId);
      if (!binErr) {
        const b = state.bins?.find(b => b.id === binId);
        if (b) { b.currentMoisture = moistureVal; b.updatedBy = submittedBy; }
      }
      // Log moisture reading
      await dbInsertMoistureReading({ bin_id: binId, moisture: moistureVal, recorded_by: submittedBy });
      state.moistureReadings = state.moistureReadings || [];
      state.moistureReadings.unshift({ bin_id: binId, moisture: moistureVal, recorded_at: new Date().toISOString() });
      toast(`Bin moisture updated to ${moistureVal}%`, 'success');
    }

    if (type === 'boiler_temp') {
      const saves = [];
      if (tempVal)     saves.push(dbSetBoilerTemp(tempVal,  'boiler_1_temp'));
      if (temp2Val)    saves.push(dbSetBoilerTemp(temp2Val, 'boiler_2_temp'));
      if (pressureVal) { saves.push(dbSetBoilerTemp(pressureVal, 'boiler_pressure')); saves.push(dbSetBoilerTemp(pressureUnit, 'boiler_pressure_unit')); }
      await Promise.all(saves);
      const setTxt = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      if (tempVal)     { state.boiler1Temp = String(tempVal);  setTxt('boiler-1-display', tempVal); setTxt('boiler-temp-display', tempVal); }
      if (temp2Val)    { state.boiler2Temp = String(temp2Val); setTxt('boiler-2-display', temp2Val); }
      if (pressureVal) { state.boilerPressure = String(pressureVal); state.boilerPressureUnit = pressureUnit; setTxt('boiler-pressure-display', pressureVal); setTxt('boiler-pressure-unit-display', pressureUnit); }
      toast(`Boiler updated${tempVal?' B1:'+tempVal+'°C':''}${temp2Val?' B2:'+temp2Val+'°C':''}${pressureVal?' P:'+pressureVal+pressureUnit:''}`, 'success');
    }

    // 5. Update local state
    state.fieldUpdates = state.fieldUpdates || [];
    state.fieldUpdates.unshift({
      id: saved.id, updateType: saved.update_type, binId: saved.bin_id || null,
      notes: saved.notes || '', ocrText: saved.ocr_text || '', photoUrl: saved.photo_url || null,
      submittedBy: saved.submitted_by || '',
      moistureValue:    saved.moisture_value    != null ? parseFloat(saved.moisture_value)    : null,
      temperatureValue: saved.temperature_value != null ? parseFloat(saved.temperature_value) : null,
      boilerTemp1:      saved.boiler_temp_1     != null ? parseFloat(saved.boiler_temp_1)     : null,
      boilerTemp2:      saved.boiler_temp_2     != null ? parseFloat(saved.boiler_temp_2)     : null,
      pressureValue:    saved.pressure_value    != null ? parseFloat(saved.pressure_value)    : null,
      pressureUnit:     saved.pressure_unit     || 'kg/cm²',
      hybrid: saved.hybrid || '', qtyBags: saved.qty_bags != null ? parseFloat(saved.qty_bags) : null,
      ticketNo: saved.ticket_no || null, materialDirection: saved.material_direction || null,
      vehicleNo: saved.vehicle_no || null, companyName: saved.company_name || null,
      tareWeight: saved.tare_weight != null ? parseFloat(saved.tare_weight) : null,
      grossWeightSlip: saved.gross_weight_slip != null ? parseFloat(saved.gross_weight_slip) : null,
      netWeightSlip: saved.net_weight_slip != null ? parseFloat(saved.net_weight_slip) : null,
      bagsCount: saved.bags_count != null ? parseInt(saved.bags_count) : null,
      createdAt: saved.created_at,
      createdAtDisplay: new Date(saved.created_at).toLocaleString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
    });

    // 5a. Weigh slip cross-table writes
    if (type === 'weigh_slip') {
      if (materialDir === 'INWARD') {
        // ── INWARD: create or update entry_trucks ──────────────
        const existing = (state.entryTrucks || []).find(t =>
          vehicleNo && t.vehicleNo?.toUpperCase() === vehicleNo.toUpperCase());
        const truckPayload = {
          ...(tareWt  != null && { tare_weight:  tareWt }),
          ...(grossWt != null && { gross_weight: grossWt }),
          ...(netWt   != null && { net_weight:   netWt }),
          ...(companyName     && { company:       companyName }),
          status:    'weighed',
          updated_at: new Date().toISOString()
        };
        if (existing) {
          await dbClient.from('entry_trucks').update(truckPayload).eq('id', existing.id);
          Object.assign(existing, {
            tareWeight:  tareWt  ?? existing.tareWeight,
            grossWeight: grossWt ?? existing.grossWeight,
            netWeight:   netWt   ?? existing.netWeight,
            company:     companyName || existing.company,
            status:      'weighed'
          });
          toast(`✅ Entry truck ${vehicleNo} — weights updated`, 'success');
        } else {
          // No existing truck — create one from the slip
          const { data: newTruck } = await dbClient.from('entry_trucks').insert([{
            vehicle_no:   vehicleNo || 'UNKNOWN',
            tare_weight:  tareWt,
            gross_weight: grossWt,
            net_weight:   netWt,
            company:      companyName,
            status:       'weighed',
            arrival_time: new Date().toISOString()
          }]).select().single();
          if (newTruck) {
            const ts = new Date(newTruck.arrival_time);
            (state.entryTrucks = state.entryTrucks||[]).unshift({
              id: newTruck.id, vehicleNo: vehicleNo||'UNKNOWN',
              tareWeight: tareWt||0, grossWeight: grossWt||0, netWeight: netWt||0,
              company: companyName||'', status: 'weighed',
              arrivalTime: newTruck.arrival_time,
              arrivalDisplay: ts.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}),
              driverName:'', driverPhone:'', notes:'', lotNumbers:[], intakeId:null
            });
          }
          toast(`✅ New entry truck ${vehicleNo||'?'} created from weigh slip`, 'success');
        }

      } else if (materialDir === 'OUTWARD') {
        // ── OUTWARD: update existing dispatch, or create draft ─
        const disp = (state.dispatches || []).find(d =>
          vehicleNo && (d.vehicle||'').toUpperCase() === vehicleNo.toUpperCase());
        if (disp) {
          const upd = {};
          if (bagsCount) upd.bags = bagsCount;
          if (netWt)     upd.qty  = netWt;
          if (Object.keys(upd).length) {
            await dbClient.from('dispatches').update(upd).eq('receipt_id', disp.receiptId);
            Object.assign(disp, upd);
          }
          toast(`✅ Dispatch ${disp.receiptId} updated from weigh slip`, 'success');
        } else {
          // No existing dispatch — create a draft dispatch from the slip
          state.receiptCounter = state.receiptCounter || 1001;
          const receiptId = `YDS-${new Date().getFullYear()}-${String(state.receiptCounter++).padStart(6,'0')}`;
          const now = new Date();
          const { buildHash, buildSignature } = window;
          const draftDispatch = {
            receipt_id:  receiptId,
            party:       companyName || 'From Weigh Slip',
            address:     '',
            vehicle:     vehicleNo || '',
            hybrid:      weighHybrid || '',
            lot:         ticketNo   || '',
            bags:        bagsCount  || 0,
            qty:         netWt      || 0,
            amount:      0,
            moisture:    0,
            remarks:     `Auto-created from weigh slip. Ticket: ${ticketNo||'—'}`,
            bins:        [],
            season_year: now.getFullYear()
          };
          // Generate hash for receipt integrity
          if (typeof buildHash === 'function') {
            draftDispatch.hash = buildHash(draftDispatch);
            draftDispatch.signature = typeof buildSignature === 'function' ? buildSignature(draftDispatch.hash) : '';
          }
          const { data: newDisp } = await dbClient.from('dispatches').insert([draftDispatch]).select().single();
          if (newDisp) {
            const stateDisp = {
              receiptId, party: draftDispatch.party, address: '', vehicle: vehicleNo||'',
              hybrid: weighHybrid||'', lot: ticketNo||'', bins:[], bags: bagsCount||0,
              qty: netWt||0, amount:0, moisture:0, remarks: draftDispatch.remarks,
              hash: draftDispatch.hash||'', signature: draftDispatch.signature||'',
              dateTS: now.getTime(),
              date: now.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}),
              season_year: now.getFullYear()
            };
            (state.dispatches = state.dispatches||[]).unshift(stateDisp);
          }
          toast(`✅ Draft dispatch ${receiptId} created from weigh slip — complete it in Dispatch tab`, 'success');
        }
      }
    }

    closeModal('update-modal');
    if (type !== 'moisture_photo' && type !== 'boiler_temp' && type !== 'weigh_slip') toast('Update saved!', 'success');
    if (typeof renderUpdatesPage    === 'function') renderUpdatesPage();
    if (typeof renderDashboard      === 'function' && (type === 'moisture_photo' || type === 'boiler_temp')) renderDashboard();
    if (typeof renderBinsPage       === 'function' && type === 'moisture_photo') renderBinsPage();
    if (typeof renderEntryTrucksPage=== 'function' && type === 'weigh_slip' && materialDir === 'INWARD')  renderEntryTrucksPage();
    if (typeof renderDispatchPage   === 'function' && type === 'weigh_slip' && materialDir === 'OUTWARD') renderDispatchPage();
    _directLogActivity('field_update_added', `${type} by ${submittedBy}${moistureVal ? ' — ' + moistureVal + '%' : ''}${tempVal ? ' — ' + tempVal + '°C' : ''}`, 'field_update', saved.id);
  } catch(e) {
    console.error('saveFieldUpdate:', e);
    toast('Failed to save update.', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save & Update'; }
  }
};

// Tesseract OCR — run when a photo is selected, then smart-parse values
window.runOcrOnPhoto = async function(input) {
  const file = input?.files?.[0];
  if (!file) return;
  const ocrEl    = document.getElementById('upd-ocr-text');
  const ocrWrap  = document.getElementById('upd-ocr-wrap');
  const preview  = document.getElementById('upd-photo-preview');
  const statusEl = document.getElementById('upd-ocr-status');

  if (preview) { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
  if (typeof Tesseract === 'undefined') { if (ocrWrap) ocrWrap.style.display = 'none'; return; }

  if (ocrWrap) ocrWrap.style.display = 'block';
  if (statusEl) statusEl.textContent = 'Reading text from photo…';
  if (ocrEl) ocrEl.value = '';

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (statusEl && m.status === 'recognizing text')
          statusEl.textContent = `Reading… ${Math.round((m.progress||0)*100)}%`;
      }
    });
    const text = result?.data?.text?.trim() || '';
    if (ocrEl) ocrEl.value = text;
    if (statusEl) statusEl.textContent = text ? '✓ Text extracted' : 'No text found';

    // ── Smart parse: weighment slip ──────────────────────────────
    if (text.match(/weighment\s*slip|weigh\s*slip|1st\s*weight|2nd\s*weight|net\.?\s*weight/i)) {
      const typeEl = document.getElementById('upd-type');
      if (typeEl) { typeEl.value = 'weigh_slip'; onUpdTypeChange(); }

      const g = id => document.getElementById(id);
      const setVal = (id, v) => { if (g(id) && v != null) g(id).value = v; };

      // Material direction
      const matM = text.match(/material\s*[:\s]+(INWARD|OUTWARD)/i);
      if (matM) setVal('upd-material-dir', matM[1].toUpperCase());

      // Ticket No
      const tickM = text.match(/ticket\s*no\.?\s*[:\s]+(\d+)/i);
      if (tickM) setVal('upd-ticket-no', tickM[1]);

      // Vehicle No
      const vehM = text.match(/vehicle\s*no\.?\s*[:\s]+([A-Z0-9]{6,12})/i);
      if (vehM) setVal('upd-vehicle-no', vehM[1].toUpperCase());

      // Company
      const cmpM = text.match(/company\s*[:\s]+(.{2,30}?)[\r\n]/i);
      if (cmpM) setVal('upd-company-name', cmpM[1].trim());

      // Hybrid
      const hybM = text.match(/hybrid\s*[:\s]+(.{2,20}?)[\r\n]/i);
      if (hybM) setVal('upd-weigh-hybrid', hybM[1].trim());

      // Weights
      const w1M = text.match(/1st\s*weight\s*[:\s]+(\d+)/i);
      const w2M = text.match(/2nd\s*weight\s*[:\s]+(\d+)/i);
      const nwM = text.match(/net\.?\s*weight\s*[:\s]+(\d+)/i);
      if (w1M) setVal('upd-tare-wt',  w1M[1]);
      if (w2M) setVal('upd-gross-wt', w2M[1]);
      if (nwM) setVal('upd-net-wt',   nwM[1]);
      else if (w1M && w2M) setVal('upd-net-wt', parseInt(w2M[1]) - parseInt(w1M[1]));

      // Bags
      const bagM = text.match(/no\.?\s*of\s*bags\s*[:\s]+(\d+)/i);
      if (bagM) setVal('upd-bags-count', bagM[1]);

      const detected = document.getElementById('upd-weigh-detected');
      const parts = [];
      if (tickM) parts.push(`Ticket ${tickM[1]}`);
      if (vehM) parts.push(vehM[1]);
      if (matM) parts.push(matM[1]);
      if (nwM || (w1M && w2M)) parts.push(`Net ${nwM ? nwM[1] : parseInt(w2M[1])-parseInt(w1M[1])} kg`);
      if (detected) detected.textContent = parts.length ? `✓ ${parts.join(' · ')}` : '';
    }

    // ── Smart parse: moisture % ────────────────────────────────
    const moistureMatch = text.match(/(\d{1,2}[.,]\d)\s*%/);
    if (moistureMatch) {
      const val = parseFloat(moistureMatch[1].replace(',', '.'));
      const mEl = document.getElementById('upd-moisture');
      const mDet = document.getElementById('upd-moisture-detected');
      if (mEl) mEl.value = val;
      if (mDet) mDet.textContent = `✓ Auto-detected: ${val}%`;
      // Also switch type to moisture_photo if not set
      const typeEl = document.getElementById('upd-type');
      if (typeEl && typeEl.value === 'general') { typeEl.value = 'moisture_photo'; onUpdTypeChange(); if (mEl) mEl.value = val; }
    }

    // ── Smart parse: temperatures (may find B1 and B2) ────────
    const tempMatches = [...text.matchAll(/(\d{2,3}[.,]\d)\s*°?C?/gi)]
      .map(m => parseFloat(m[1].replace(',','.')))
      .filter(v => v > 20 && v < 300); // realistic dryer temp range
    if (tempMatches.length > 0) {
      const t1El  = document.getElementById('upd-temp');
      const t2El  = document.getElementById('upd-temp2');
      const tDet  = document.getElementById('upd-temp-detected');
      const typeEl = document.getElementById('upd-type');
      if (t1El) t1El.value = tempMatches[0];
      if (t2El && tempMatches[1]) t2El.value = tempMatches[1];
      if (tDet) tDet.textContent = `✓ B1:${tempMatches[0]}°C${tempMatches[1]?' B2:'+tempMatches[1]+'°C':''}`;
      if (typeEl && typeEl.value === 'general') { typeEl.value = 'boiler_temp'; onUpdTypeChange(); if (t1El) t1El.value = tempMatches[0]; if (t2El && tempMatches[1]) t2El.value = tempMatches[1]; }
    }
  } catch(e) {
    console.error('OCR error:', e);
    if (statusEl) statusEl.textContent = 'Could not read text — enter values manually';
  }
};

// ── Truck modal: scan weighing slip ───────────────────────────
window.runTruckSlipOcr = async function(input) {
  const file = input?.files?.[0];
  if (!file) return;

  const preview  = document.getElementById('t-slip-preview');
  const statusEl = document.getElementById('t-slip-status');

  if (preview)  { preview.src = URL.createObjectURL(file); preview.style.display = 'block'; }
  if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = '🔍 Reading slip…'; }

  if (typeof Tesseract === 'undefined') {
    if (statusEl) statusEl.textContent = '⚠️ OCR not available — enter weights manually';
    return;
  }

  try {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (statusEl && m.status === 'recognizing text')
          statusEl.textContent = `🔍 Reading… ${Math.round((m.progress||0)*100)}%`;
      }
    });
    const text = result?.data?.text || '';
    const filled = [];

    const setField = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) { el.value = val; return true; }
      return false;
    };

    // Vehicle Number
    const vehM = text.match(/vehicle\s*no\.?\s*[:\s]+([A-Z0-9]{6,12})/i);
    if (vehM && setField('t-vehicle', vehM[1].toUpperCase())) filled.push(`Vehicle: ${vehM[1].toUpperCase()}`);

    // NOTE: We intentionally skip filling t-company from the weighbridge slip.
    // The weighbridge "Company" field is the material/cargo owner, not the transport company.
    // The truck modal's company field is for the carrier/transporter — let the user fill it.

    // Gross weight (2nd Weight = loaded truck)
    const w2M = text.match(/2nd\s*weight\s*[:\s]+(\d{3,6})/i);
    if (w2M && setField('t-gross', w2M[1])) filled.push(`Gross: ${w2M[1]} kg`);

    // Tare weight (1st Weight = empty truck)
    const w1M = text.match(/1st\s*weight\s*[:\s]+(\d{3,6})/i);
    if (w1M && setField('t-tare', w1M[1])) filled.push(`Tare: ${w1M[1]} kg`);

    // Fallback: if direct gross/tare labels used
    if (!w2M) { const gM = text.match(/gross\s*weight\s*[:\s]+(\d{3,6})/i); if (gM) { setField('t-gross', gM[1]); filled.push(`Gross: ${gM[1]} kg`); } }
    if (!w1M) { const tM = text.match(/tare\s*weight\s*[:\s]+(\d{3,6})/i);  if (tM) { setField('t-tare',  tM[1]); filled.push(`Tare: ${tM[1]} kg`); } }

    // Recalculate net weight display
    calcTruckNetWeight();

    // Net weight from slip (for verification)
    const nwM = text.match(/net\.?\s*weight\s*[:\s]+(\d{3,6})/i);
    if (nwM) filled.push(`Net: ${nwM[1]} kg ✓`);

    if (statusEl) {
      if (filled.length > 0) {
        statusEl.textContent = `✅ Auto-filled — ${filled.join(' · ')}`;
        statusEl.style.background = 'var(--green-pale,#f0fdf4)';
        statusEl.style.color = 'var(--green)';
      } else {
        statusEl.textContent = '⚠️ Could not read slip — enter values manually';
        statusEl.style.background = '#fffbeb';
        statusEl.style.color = 'var(--amber)';
      }
    }
  } catch(e) {
    console.error('Truck slip OCR error:', e);
    if (statusEl) { statusEl.textContent = '⚠️ OCR failed — enter weights manually'; statusEl.style.background = '#fffbeb'; statusEl.style.color = 'var(--amber)'; }
  }
};

// Auto-calculate net weight when gross changes
window.calcNetWeight = function() {
  const tare  = parseFloat(document.getElementById('upd-tare-wt')?.value) || 0;
  const gross = parseFloat(document.getElementById('upd-gross-wt')?.value) || 0;
  const netEl = document.getElementById('upd-net-wt');
  if (netEl && tare > 0 && gross > 0) netEl.value = gross - tare;
};

window.onLaborGroupChange = function() {
  const id = document.getElementById('labor-group').value;
  const g = getLaborGroups().find(x => x.id == id);
  if (g) {
    document.getElementById('labor-headcount').value = g.members.length;
    document.getElementById('labor-people').value = g.members.join(', ');
  }
};
