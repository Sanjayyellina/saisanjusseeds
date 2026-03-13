// ============================================================
// POPULATE MODAL SELECTS
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// POPULATE SELECTS
// ================================================================
function populateModalSelects(){
  const emptyBins=state.bins.filter(b=>b.status==='empty');
  const sel=document.getElementById('i-bin');
  if(sel){sel.innerHTML='<option value="">— Select available bin —</option>'+emptyBins.map(b=>`<option value="${b.id}">BIN-${b.id}</option>`).join('');}
  const dsel=document.getElementById('d-bin');
  const activeBins=state.bins.filter(b=>b.status!=='empty');
  if(dsel){dsel.innerHTML='<option value="">— Select bin —</option>'+activeBins.map(b=>`<option value="${b.id}">BIN-${b.id} — ${b.hybrid||'?'}</option>`).join('');}
}
