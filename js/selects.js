// ============================================================
// POPULATE MODAL SELECTS
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// POPULATE SELECTS
// ================================================================
function populateModalSelects(){
  const emptyBins=state.bins.filter(b=>b.status==='empty');
  const activeBins=state.bins.filter(b=>b.status!=='empty');
  
  // Update single ID-based selects if any exist
  const sel=document.getElementById('i-bin');
  if(sel){sel.innerHTML='<option value="">— Select available bin —</option>'+emptyBins.map(b=>`<option value="${b.id}">BIN-${b.binLabel||b.id}</option>`).join('');}

  const dSelects = document.querySelectorAll('.d-bin-select');
  if (dSelects.length > 0) {
    dSelects.forEach(dsel => {
      const currentVal = dsel.value;
      let opts = '<option value="">— Select bin —</option>';
      activeBins.forEach(b => { opts += `<option value="${b.id}">BIN-${b.binLabel||b.id} — ${b.hybrid||'?'} (${b.qty||0}T)</option>`; });
      dsel.innerHTML = opts;
      if (currentVal) dsel.value = currentVal;
    });
  }

  // Update all dynamically appended intake bin selects
  const intakeSelects = document.querySelectorAll('.i-bin-select');
  intakeSelects.forEach(selectEl => {
      // Remember current value so we can restore it after re-populating if possible
      const currentVal = selectEl.value;
      let options = '<option value="">— Select bin —</option>';
      state.bins.forEach(b => {
          options += `<option value="${b.id}">BIN-${b.binLabel||b.id} (${b.status})</option>`;
      });
      selectEl.innerHTML = options;
      if (currentVal) selectEl.value = currentVal;
  });
}
