// ============================================================
// ACTIONS & EVENT HANDLERS
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// ACTIONS
// ================================================================
function openIntakeModal() {
  document.getElementById('i-bin-rows').innerHTML = '';
  addIntakeBinRow();
  ['i-challan','i-vehicle','i-location','i-hybrid','i-lot','i-qty','i-pkts','i-moisture','i-lr','i-remarks','i-veh-weight','i-gross-weight'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  openModal('intake-modal');
}

function addIntakeBinRow() {
  const container = document.getElementById('i-bin-rows');
  const row = document.createElement('div');
  row.className = 'form-row cols3 i-bin-row mt8';
  row.style.alignItems = 'flex-end';
  row.style.marginTop = '8px';
  
  let options = '<option value="">— Select bin —</option>';
  state.bins.forEach(b => {
    options += `<option value="${b.id}">BIN-${b.id} (${b.status})</option>`;
  });

  row.innerHTML = `
    <div class="form-group"><label class="form-label">Assign to Bin *</label><select class="form-select i-bin-select">${options}</select></div>
    <div class="form-group"><label class="form-label">Allocated Qty (Tons) *</label><input class="form-input i-bin-qty" type="number" step="0.1" placeholder="e.g. 10.5"></div>
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

async function saveIntake(){
  const challan=document.getElementById('i-challan').value.trim();
  const vehicle=document.getElementById('i-vehicle').value.trim().toUpperCase();
  const hybrid=document.getElementById('i-hybrid').value.trim();
  const qtyInput=document.getElementById('i-qty').value;
  const qty=parseFloat(qtyInput);
  
  if(!challan||!vehicle||!hybrid||!qtyInput){toast('Please fill all required Intake fields (*)','error');return;}
  
  // gather bin allocations
  const rows = document.querySelectorAll('.i-bin-row');
  let allocations = [];
  let totalAllocated = 0;
  let allocError = false;
  
  rows.forEach(r => {
    const bId = r.querySelector('.i-bin-select').value;
    const bQty = parseFloat(r.querySelector('.i-bin-qty').value);
    const bPkts = parseInt(r.querySelector('.i-bin-pkts').value) || 0;
    
    if (bId && !isNaN(bQty)) {
      allocations.push({ binId: parseInt(bId), qty: bQty, pkts: bPkts });
      totalAllocated += bQty;
    } else if (bId || !isNaN(bQty)) {
        allocError = true;
    }
  });
  
  if (allocError) { toast('Please complete all Bin Assignment rows','error'); return; }
  if (allocations.length === 0) { toast('Please assign at least one bin','error'); return; }
  if (Math.abs(totalAllocated - qty) > 0.01) { toast(`Allocated tons (${totalAllocated}) does not match Intake qty (${qty})`, 'error'); return; }

  const now=new Date();
  const dateStr=now.toISOString();
  const intakeId='INT-'+String(state.intakes.length+1).padStart(3,'0');
  
  const intakeRecord = {
      id: intakeId,
      challan, 
      vehicle,
      location: document.getElementById('i-location').value,
      company: document.getElementById('i-company').value,
      hybrid,
      lot: document.getElementById('i-lot').value,
      qty,
      pkts: parseInt(document.getElementById('i-pkts').value)||0,
      entry_moisture: parseFloat(document.getElementById('i-moisture').value)||0,
      lr: document.getElementById('i-lr').value,
      remarks: document.getElementById('i-remarks').value,
      vehicle_weight: parseFloat(document.getElementById('i-veh-weight').value)||0,
      gross_weight: parseFloat(document.getElementById('i-gross-weight').value)||0,
      net_weight: 0,
      created_at: dateStr,
      updated_at: dateStr
  };
  
  intakeRecord.net_weight = intakeRecord.gross_weight && intakeRecord.vehicle_weight ? intakeRecord.gross_weight - intakeRecord.vehicle_weight : 0;
  
  const dbAllocations = allocations.map(a => ({
      intake_id: intakeId,
      bin_id: a.binId,
      qty: a.qty,
      pkts: a.pkts
  }));

  const btn = document.querySelector('#intake-modal .btn-solid');
  const ogText = btn.innerHTML;
  btn.innerHTML = 'Saving...';
  btn.disabled = true;

  const success = await dbInsertIntake(intakeRecord, dbAllocations);
  
  if (success) {
      const entry = {
        ...intakeRecord,
        entryMoisture: intakeRecord.entry_moisture,
        vehicleWeight: intakeRecord.vehicle_weight,
        grossWeight: intakeRecord.gross_weight,
        netWeight: intakeRecord.net_weight,
        dateTS: now.getTime(),
        date: now.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})
      };
      state.intakes.unshift(entry);
      
      dbLogActivity('INTAKE_CREATED', `Intake ${intakeId} created for ${qty} Tons of ${hybrid} (Challan: ${challan})`);
      
      allocations.forEach(a => {
         const b = state.bins[a.binId - 1];
         b.status='intake';b.hybrid=hybrid;b.company=intakeRecord.company;b.lot=intakeRecord.lot;
         b.qty=(b.qty || 0) + a.qty;b.pkts=(b.pkts || 0) + a.pkts;b.entryMoisture=intakeRecord.entry_moisture;
         b.currentMoisture=intakeRecord.entry_moisture;b.intakeDate=entry.date;
         b.intakeDateTS=now.getTime();b.intakeRef=entry.id;b.airflow='up';
         
         dbUpdateBin(b.id, {
             status: 'intake', hybrid: b.hybrid, company: b.company, lot: b.lot,
             qty: b.qty, pkts: b.pkts, entry_moisture: b.entryMoisture,
             current_moisture: b.currentMoisture, intake_date_ts: b.intakeDateTS.toString(), 
             airflow: 'up'
         });
      });
      
      closeModal('intake-modal');
      toast(`Intake saved — Challan ${challan}`);
      renderDashboard();
  } else {
      toast('Failed to save to database', 'error');
  }
  
  btn.innerHTML = ogText;
  btn.disabled = false;
}

async function saveDispatch(){
  const party=document.getElementById('d-party').value.trim();
  const vehicle=document.getElementById('d-vehicle').value.trim().toUpperCase();
  const hybrid=document.getElementById('d-hybrid').value.trim();
  const bags=parseInt(document.getElementById('d-bags').value);
  const qty=parseFloat(document.getElementById('d-qty').value);
  const amount=parseFloat(document.getElementById('d-amount').value);
  if(!party||!vehicle||!hybrid||!bags||!qty||!amount){toast('Fill all required fields (*)','error');return;}
  const now=new Date();
  const receiptId=`YDS-2026-${String(state.receiptCounter++).padStart(6,'0')}`;
  const d={
    receiptId,dateTS:now.getTime(),
    date:now.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}),
    party,address:document.getElementById('d-address').value,
    vehicle,lr:document.getElementById('d-lr').value,
    hybrid,lot:document.getElementById('d-lot').value,
    bin:parseInt(document.getElementById('d-bin').value)||null,
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
      dbLogActivity('DISPATCH_CREATED', `Receipt ${d.receiptId} generated for ${d.party} (${d.qty} Tons / ${d.amount} INR)`);
      if (d.bin) {
          const b = state.bins[d.bin - 1];
          if (b.qty) {
              b.qty = Math.max(0, b.qty - d.qty);
              b.pkts = Math.max(0, b.pkts - d.bags);
              dbUpdateBin(b.id, { qty: b.qty, pkts: b.pkts });
          }
      }
      closeModal('dispatch-modal');
      toast(`Receipt ${receiptId} generated & signed`,'success');
      setTimeout(()=>viewReceipt(receiptId),350);
      renderDispatchPage();
  } else {
      toast('Failed to save dispatch to database', 'error');
  }
  btn.innerHTML = ogText;
  btn.disabled = false;
}

function openBinModal(binId){
  const bin=state.bins[binId-1];
  document.getElementById('bin-modal-title').textContent=`BIN-${bin.id} — ${bin.status==='empty'?'Empty':'Update'}`;
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
          <option value="intake" ${bin.status==='intake'?'selected':''}>Intake</option>
          <option value="drying" ${bin.status==='drying'?'selected':''}>Drying</option>
          <option value="ready" ${bin.status==='ready'?'selected':''}>Ready</option>
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
  const b=state.bins[binId-1];
  const oldStatus = b.status;
  
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
      intake_date_ts: b.intakeDateTS ? b.intakeDateTS.toString() : null,
      airflow: b.airflow
  };
  
  const success = await dbUpdateBin(b.id, updates);
  if (success) {
      if (oldStatus !== b.status) {
          dbLogActivity('BIN_STATUS_CHANGED', `BIN-${b.id} changed to ${b.status}`);
      }
      closeModal('bin-modal');
      toast(`BIN-${binId} updated successfully`);
      const ap=document.querySelector('.page.active');
      if(ap)renderPage(ap.id.replace('page-',''));
  } else {
      toast('Failed to update bin in database', 'error');
  }
  btn.innerHTML = ogText;
  btn.disabled = false;
}
function setAir(id,dir){
  state.bins[id-1].airflow=dir;
  const u=document.getElementById('air-up-'+id),d=document.getElementById('air-dn-'+id);
  if(u&&d){u.classList.toggle('active-up',dir==='up');d.classList.toggle('active-down',dir==='down');}
}
async function saveAllMoisture(){
  const promises = [];
  state.bins.filter(b=>b.status!=='empty').forEach(b=>{
    const el=document.getElementById('mi-'+b.id);
    if(el) {
        const newVal = parseFloat(el.value);
        if (!isNaN(newVal) && newVal !== b.currentMoisture) {
            b.currentMoisture=newVal;
            promises.push(dbUpdateBin(b.id, { current_moisture: newVal }));
        }
    }
  });
  
  if (promises.length > 0) {
      await Promise.all(promises);
      dbLogActivity('MOISTURE_LOGGED', `Recorded ${promises.length} new moisture readings`);
  }
  toast('All moisture readings saved');
  renderMoisturePage();
}

let managerAccessBtn = null;
function showManagerAccess(btnElement) {
  managerAccessBtn = btnElement;
  document.getElementById('manager-pin-input').value = '';
  openModal('pin-modal');
  setTimeout(()=>document.getElementById('manager-pin-input').focus(), 100);
}

function verifyPinAndAccess() {
  const pin = document.getElementById('manager-pin-input').value;
  if (pin === "1234") {
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
          Challan: i.challan,
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
      renderMaintenancePage();
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
      renderLaborPage();
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
