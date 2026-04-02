// ============================================================
// RENDER PAGES
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// RENDER PAGES
// ================================================================
const esc = escapeHtml; // shorthand for XSS-safe HTML insertion
const _PAGE_SIZE = 20;
window._intakePage = window._intakePage || 0;
window._dispatchPage = window._dispatchPage || 0;

window.goIntakePage = function(dir) { window._intakePage = Math.max(0, window._intakePage + dir); renderIntakePage(); };
window.goDispatchPage = function(dir) { window._dispatchPage = Math.max(0, window._dispatchPage + dir); renderDispatchPage(); };

// ── Notification Bell ─────────────────────────────────────────
function _buildAlerts() {
  const alerts = [];
  (state.bins || []).forEach(b => {
    if (b.status === 'empty') return;
    const hours = b.intakeDateTS ? Math.floor((Date.now() - b.intakeDateTS) / 3600000) : 0;
    const lbl = `BIN-${b.binLabel || b.id}`;
    if (hours > Config.TARGET_HRS)
      alerts.push({lv:'red', icon:'🔴', msg:`${lbl} overdue`, sub:`${hours}h in dryer (target ${Config.TARGET_HRS}h)`, id:b.id});
    else if ((b.currentMoisture||99) <= Config.TARGET_MOISTURE)
      alerts.push({lv:'green', icon:'✅', msg:`${lbl} ready to dispatch`, sub:`${b.currentMoisture}% moisture — target reached`, id:b.id});
    else if ((b.currentMoisture||0) >= Config.MOISTURE_HIGH)
      alerts.push({lv:'amber', icon:'🟡', msg:`${lbl} very high moisture`, sub:`${b.currentMoisture}% — needs monitoring`, id:b.id});
  });
  return alerts;
}

function _updateNotifBell() {
  const alerts = _buildAlerts();
  const overdue = alerts.filter(a => a.lv === 'red');
  const btn  = document.getElementById('notif-btn');
  const badge = document.getElementById('notif-badge');
  if (!btn || !badge) return;
  if (alerts.length > 0) {
    badge.textContent = alerts.length;
    badge.style.display = 'block';
    btn.classList.toggle('has-alerts', overdue.length > 0);
  } else {
    badge.style.display = 'none';
    btn.classList.remove('has-alerts');
  }
  // Update document title
  document.title = overdue.length > 0 ? `(${overdue.length}) Yellina Seeds` : 'Yellina Seeds';
  // Populate panel body
  const body = document.getElementById('notif-panel-body');
  if (body) {
    body.innerHTML = alerts.length
      ? alerts.map(a => `<div class="notif-item" onclick="openBinModal(${a.id});toggleNotifPanel()">
          <div class="notif-item-icon">${a.icon}</div>
          <div><div class="notif-item-text">${a.msg}</div><div class="notif-item-sub">${a.sub}</div></div>
        </div>`).join('')
      : `<div class="notif-empty">✅ All bins normal — no alerts</div>`;
  }
}

window.toggleNotifPanel = function() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
};

// Close notif panel when clicking outside
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('notif-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const panel = document.getElementById('notif-panel');
    if (panel) panel.style.display = 'none';
  }
});

function _renderPagination(elId, currentPage, total, gofn) {
  const el = document.getElementById(elId);
  if (!el) return;
  const totalPages = Math.ceil(total / _PAGE_SIZE);
  if (total <= _PAGE_SIZE) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = `
    <span style="font-size:12px;color:var(--ink-4);">Page <strong>${currentPage+1}</strong> of ${totalPages} &nbsp;·&nbsp; ${total} records</span>
    <div style="display:flex;gap:6px;">
      <button class="btn btn-ghost btn-sm" onclick="${gofn}(-1)" ${currentPage===0?'disabled style="opacity:.4;"':''}>← Prev</button>
      <button class="btn btn-ghost btn-sm" onclick="${gofn}(1)" ${currentPage>=totalPages-1?'disabled style="opacity:.4;"':''}>Next →</button>
    </div>`;
}

function renderPage(name){
  const map={dashboard:renderDashboard,intake:renderIntakePage,bins:renderBinsPage,
    moisture:null,dispatch:renderDispatchPage,receipts:renderReceiptsPage,
    analytics:renderAnalytics, manager: renderManagerPage, maintenance: renderMaintenancePage, labor: renderLaborPage,
    'entry-trucks': renderEntryTrucksPage, backyard: renderBackyardPage};
  if(map[name])map[name]();
}

function renderDashboard(){
  document.getElementById('dash-date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const active=state.bins.filter(b=>b.status!=='empty');
  const drying=state.bins.filter(b=>b.status==='drying'||b.status==='intake');
  const totalQty=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const avgM=active.length?(active.reduce((s,b)=>s+(b.currentMoisture||0),0)/active.length).toFixed(1):'—';

  // Today's stats for delta labels
  const todayStr=new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
  const todayIntakeQty=state.intakes.filter(i=>i.date===todayStr).reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const todayDispatches=state.dispatches.filter(d=>d.date===todayStr);
  const todayRev=todayDispatches.reduce((s,d)=>s+parseInt(d.amount||0),0);

  // Ready to dispatch = bins at or below target moisture
  const readyBins=active.filter(b=>(b.currentMoisture||99)<=Config.TARGET_MOISTURE);

  document.getElementById('kpi-intake').textContent=totalQty.toFixed(1);
  const kpiIntakeD=document.getElementById('kpi-intake-d');
  if(kpiIntakeD)kpiIntakeD.textContent=todayIntakeQty>0?`↑ ${todayIntakeQty.toFixed(0)} Kg today`:'↑ Today';

  document.getElementById('kpi-drying').textContent=drying.length;
  document.getElementById('kpi-dispatched').textContent=state.dispatches.length;
  const kpiDispD=document.querySelector('#kpi-dispatched+.kpi-label+.kpi-delta')||document.querySelectorAll('#kpi-grid .kpi-delta')[2];
  if(kpiDispD&&todayRev>0)kpiDispD.textContent='₹'+todayRev.toLocaleString('en-IN')+' today';

  document.getElementById('kpi-moisture').textContent=avgM+(avgM!=='—'?'%':'');
  const md=avgM!=='—'?parseFloat(avgM):null;
  if(md){
    const dm=document.getElementById('kpi-moisture-d');
    dm.textContent=md<15?t('dash.onTarget'):md<25?t('dash.progressing'):t('dash.high');
    dm.className='kpi-delta '+(md<15?'delta-up':md<25?'delta-flat':'delta-down');
  }

  const kpiReady=document.getElementById('kpi-ready');
  if(kpiReady)kpiReady.textContent=readyBins.length;
  const kpiReadyD=document.getElementById('kpi-ready-d');
  if(kpiReadyD)kpiReadyD.textContent=readyBins.length>0?readyBins.map(b=>`BIN-${b.binLabel||b.id}`).join(', '):'Bins at target';

  // ── Notification Bell ────────────────────────────────────────
  _updateNotifBell();

  document.getElementById('dash-bins').innerHTML=state.bins.map(b=>renderBinTile(b)).join('');

  // ── Live Alerts ──────────────────────────────────────────────
  const alertsEl=document.getElementById('dash-alerts');
  if(alertsEl){
    const alerts=[];
    state.bins.forEach(b=>{
      if(b.status==='empty')return;
      const hours=b.intakeDateTS?Math.floor((Date.now()-b.intakeDateTS)/3600000):0;
      const lbl=`BIN-${b.binLabel||b.id}`;
      if(hours>Config.TARGET_HRS)alerts.push({lv:'red',msg:`${lbl} overdue — ${hours}h (target ${Config.TARGET_HRS}h)`,id:b.id});
      else if((b.currentMoisture||0)>=Config.MOISTURE_HIGH)alerts.push({lv:'amber',msg:`${lbl} very high moisture: ${b.currentMoisture}%`,id:b.id});
    });
    const BG={red:'rgba(239,68,68,.08)',amber:'rgba(245,158,11,.08)'};
    const BD={red:'rgba(239,68,68,.25)',amber:'rgba(245,158,11,.25)'};
    const TC={red:'#dc2626',amber:'#b45309'};
    const IC={red:'🔴',amber:'🟡'};
    alertsEl.innerHTML=alerts.length
      ?`<div style="display:flex;flex-wrap:wrap;gap:8px;">`+alerts.map(a=>`<div style="padding:7px 14px;background:${BG[a.lv]};border:1px solid ${BD[a.lv]};border-radius:var(--radius);font-size:12px;color:${TC[a.lv]};font-weight:600;cursor:pointer;" onclick="openBinModal(${a.id})">${IC[a.lv]} ${a.msg}</div>`).join('')+`</div>`
      :`<div style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(16,185,129,.07);border:1px solid rgba(16,185,129,.2);border-radius:var(--radius);font-size:12px;color:#059669;font-weight:600;">✅ All bins within normal operating parameters</div>`;
  }

  // ── FIFO Dispatch Queue ──────────────────────────────────────
  const fifoEl=document.getElementById('dash-fifo');
  if(fifoEl){
    const activeBins=state.bins.filter(b=>b.status!=='empty'&&b.intakeDateTS).sort((a,b)=>a.intakeDateTS-b.intakeDateTS);
    if(!activeBins.length){
      fifoEl.innerHTML=`<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-title">No active bins</div></div>`;
    }else{
      fifoEl.innerHTML=activeBins.slice(0,6).map((b,i)=>{
        const days=Math.floor((Date.now()-b.intakeDateTS)/86400000);
        const ready=(b.currentMoisture||99)<=Config.TARGET_MOISTURE;
        const lbl=`BIN-${b.binLabel||b.id}`;
        return`<div style="display:grid;grid-template-columns:26px 1fr auto;gap:10px;align-items:center;padding:8px 12px;background:${ready?'rgba(16,185,129,.06)':'var(--surface-2)'};border-radius:var(--radius);margin-bottom:5px;${ready?'border:1px solid rgba(16,185,129,.2);':''}cursor:pointer;" onclick="openBinModal(${b.id})">
          <div style="width:24px;height:24px;background:${i===0?'var(--gold)':'var(--surface-3)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:${i===0?'#fff':'var(--ink-4)'};">${i+1}</div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--ink);">${esc(lbl)} <span style="font-size:11px;color:var(--ink-4);font-weight:400;">· ${esc(b.hybrid||'—')}</span></div>
            <div style="font-size:11px;color:var(--ink-5);">Day ${days} · ${parseInt(b.qty||0).toLocaleString('en-IN')} Kg</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:13px;font-weight:800;color:${ready?'#059669':getMoistureColor(b.currentMoisture)};">${b.currentMoisture||'—'}%</div>
            <div style="font-size:10px;color:${ready?'#059669':'var(--ink-5)'};">${ready?'✓ Ready':'Drying'}</div>
          </div>
        </div>`;
      }).join('');
    }
  }

  const recent=[...state.intakes].reverse().slice(0,6);
  document.getElementById('recent-tbody').innerHTML=recent.length?recent.map(i=>{
    const binIds=getBinIds(i);
    const binStatus=binIds.length?((state.bins.find(b=>b.id===binIds[0])||{}).status||'drying'):'drying';
    const effectiveStatus=binStatus==='intake'?'drying':binStatus;
    const statusChipClass={drying:'chip-green',shelling:'chip-purple',empty:'chip-grey'}[effectiveStatus]||'chip-green';
    const statusLabel=effectiveStatus.charAt(0).toUpperCase()+effectiveStatus.slice(1);
    return`<tr>
      <td class="text-muted fs12">${i.date}</td>
      <td><span class="mono fw700 text-gold">${i.challan}</span></td>
      <td class="mono fs12">${i.vehicle}</td>
      <td class="fw700 truncate" style="max-width:160px;">${i.hybrid}</td>
      <td><span class="fw700 text-gold">${i.qty} Kg</span></td>
      <td>${binIds.map(b=>`<span class="chip chip-blue">BIN-${getBinLabel(b)}</span>`).join(' ')||'—'}</td>
      <td><span class="chip ${statusChipClass}">${statusLabel}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="openEditIntakeModal('${i.id}')" title="Edit">✏️ Edit</button></td>
    </tr>`;}).join('')
    :`<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-title">${t('dash.noIntakes')}</div></div></td></tr>`;

  document.getElementById('recent-dispatch-tbody').innerHTML=state.dispatches.length?[...state.dispatches].reverse().slice(0,5).map(d=>`
    <tr>
      <td><span class="mono fs12 text-gold">${esc(d.receiptId)}</span></td>
      <td class="fw700">${esc(d.party)}</td>
      <td class="mono">${esc(d.bags)}</td>
      <td class="fw700 text-green">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
    </tr>`).join('')
    :`<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">${t('dash.noDispatches')}</div></div></td></tr>`;
}

function renderIntakePage(){
  const total=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  document.getElementById('intake-total-weight').textContent=total.toFixed(2);
  const totalPages=Math.ceil(state.intakes.length/_PAGE_SIZE);
  window._intakePage=Math.min(window._intakePage,Math.max(0,totalPages-1));
  const pageItems=state.intakes.slice(window._intakePage*_PAGE_SIZE,(window._intakePage+1)*_PAGE_SIZE);
  const pageOffset=window._intakePage*_PAGE_SIZE;
  document.getElementById('intake-full-tbody').innerHTML=pageItems.length?pageItems.map((i,idx)=>{
  const _idx=pageOffset+idx;
    const binIds=getBinIds(i);
    const binStatus=binIds.length?((state.bins.find(b=>b.id===binIds[0])||{}).status||'drying'):'drying';
    const effectiveStatus=binStatus==='intake'?'drying':binStatus;
    const statusChipClass={drying:'chip-green',shelling:'chip-purple',empty:'chip-grey'}[effectiveStatus]||'chip-green';
    const statusLabel=effectiveStatus.charAt(0).toUpperCase()+effectiveStatus.slice(1);
    const hlStyle=window._highlightIntakeId===i.id?'background:rgba(245,166,35,.18);transition:background 2s;':'';
    return`<tr style="${hlStyle}" id="irow-${i.id}">
      <td class="mono text-muted fs12">${_idx+1}</td>
      <td class="fs12 text-muted">${esc(i.date)}</td>
      <td><span class="mono fw700 text-gold">${esc(i.challan)}</span></td>
      <td class="mono">${esc(i.vehicle)}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${esc(i.location||'—')}</td>
      <td class="fw700">${esc(i.hybrid)}</td>
      <td class="mono fs12 text-muted">${esc(i.lot||'—')}</td>
      <td><span class="fw700 text-gold">${esc(i.qty)} Kg</span></td>
      <td class="mono fs12">${esc(i.vehicleWeight||'—')}</td>
      <td class="mono fs12">${esc(i.grossWeight||'—')}</td>
      <td class="mono fw700" style="color:var(--blue);">${esc(i.netWeight||'—')}</td>
      <td><span class="mono fw700" style="color:${getMoistureColor(i.entryMoisture)};">${esc(i.entryMoisture)}%</span></td>
      <td>${binIds.map(b=>`<span class="chip chip-blue">BIN-${getBinLabel(b)}</span>`).join(' ')||'—'}</td>
      <td><span class="chip ${statusChipClass}">${statusLabel}</span></td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-sm" onclick="openEditIntakeModal('${esc(i.id)}')" title="Edit">✏️</button>${i.bin?` <button class="btn btn-ghost btn-sm" onclick="openBinModal(${parseInt(i.bin)||0})">${t('actions.view')} Bin</button>`:''}
      </td>
    </tr>`;}).join('')
    :`<tr><td colspan="15"><div class="empty-state"><div class="empty-icon">🚛</div><div class="empty-title">${t('dash.noIntakes')}</div><div class="empty-sub">Start by logging a new truck intake above</div></div></td></tr>`;
  _renderPagination('intake-pagination', window._intakePage, state.intakes.length, 'goIntakePage');
  // Scroll to highlighted row
  if (window._highlightIntakeId) {
    setTimeout(() => {
      const el = document.getElementById('irow-'+window._highlightIntakeId);
      if (el) { el.scrollIntoView({behavior:'smooth',block:'center'}); }
      setTimeout(() => { window._highlightIntakeId = null; renderIntakePage(); }, 2500);
    }, 100);
  }
}

function renderBinsPage(){
  document.getElementById('bins-full-grid').innerHTML=state.bins.map(b=>renderBinTile(b, false)).join('');
}


function renderManagerPage(){
  const active=state.bins.filter(b=>b.status!=='empty');
  
  let html = `<div style="margin-bottom: 24px;">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">`;
  html += `<h2 style="font-size:18px;margin:0;">${t('manager.control')}</h2>`;
  html += `</div>`;
  html += `<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;">`;
  html += state.bins.map(b=>renderBinTile(b, true)).join('');
  html += `</div></div>`;

  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">`;
  html += `<h2 style="font-size:18px;margin:0;">${t('manager.moistureUpdater')}</h2>`;
  html += `<button class="btn btn-solid btn-sm" onclick="saveAllMoisture()">${t('actions.saveAll')}</button>`;
  html += `</div>`;
  html += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;">`;
  html += active.length?active.map(bin=>`
    <div class="m-card" style="border: 2px solid var(--gold);">
      <div class="m-bin-badge">BIN<br>${bin.binLabel||bin.id}</div>
      <div class="m-info">
        <div class="m-hybrid">${esc(bin.hybrid)}</div>
        <div class="m-meta">${esc(bin.qty)} Kg · ${t('bins.entry')}: <span class="mono fw700">${esc(bin.entryMoisture)}%</span> · ${t('bins.status.intake')}: ${bin.intakeDate?esc(bin.intakeDate.split(',')[0]):''} · ${t('bins.day')} ${dateDiff(bin.intakeDateTS)}</div>
        <div style="margin-top:6px;">
          <div class="moisture-track" style="max-width:200px;"><div class="moisture-bar" style="width:${getMoisturePct(bin.currentMoisture)}%;background:${getMoistureBarColor(bin.currentMoisture)};"></div></div>
        </div>
      </div>
      <div class="m-controls">
        <div>
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-5);text-align:center;margin-bottom:4px;">${t('intake.table.moisture')}</div>
          <input type="number" step="0.1" value="${(bin.currentMoisture||0).toFixed(1)}" class="m-input"
            onchange="(state.bins.find(b=>b.id===${bin.id})||{}).currentMoisture=parseFloat(this.value)||0" id="mi-${bin.id}">
        </div>
        <div>
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-5);text-align:center;margin-bottom:4px;">Airflow</div>
          <div class="air-toggle">
            <button class="air-btn ${bin.airflow==='up'?'active-up':''}" id="air-up-${bin.id}"
              onclick="setAir(${bin.id},'up')">${t('bins.airflow.up')}</button>
            <button class="air-btn ${bin.airflow==='down'?'active-down':''}" id="air-dn-${bin.id}"
              onclick="setAir(${bin.id},'down')">${t('bins.airflow.down')}</button>
          </div>
        </div>
        <div>
          <div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--ink-5);text-align:center;margin-bottom:4px;">${t('dash.status')}</div>
          <select class="m-status-sel" onchange="(state.bins.find(b=>b.id===${bin.id})||{}).status=this.value">
            <option value="drying" ${bin.status!=='shelling'&&bin.status!=='empty'?'selected':''}>${t('bins.status.drying')}</option>
            <option value="shelling" ${bin.status==='shelling'?'selected':''}>${t('bins.status.shelling')}</option>
          </select>
        </div>
      </div>
    </div>`).join('')
    :`<div class="empty-state" style="grid-column: 1/-1;"><div class="empty-icon">💧</div><div class="empty-title">${t('bins.emptyState')}</div></div>`;
  html += `</div>`;
  
  // Intake records — editable
  html += `<div style="margin-top:32px;">`;
  html += `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">`;
  html += `<h2 style="font-size:18px;margin:0;">Intake Records</h2>`;
  html += `<button class="btn btn-gold btn-sm" onclick="openIntakeModal()">+ New Intake</button>`;
  html += `</div>`;
  html += `<div class="panel"><table class="data-table"><thead><tr>`;
  html += `<th>#</th><th>Date</th><th>DR No</th><th>Vehicle</th><th>Hybrid</th><th>Qty</th><th>Bins</th><th>Actions</th>`;
  html += `</tr></thead><tbody>`;
  if (state.intakes.length) {
    html += state.intakes.map((i, idx) => `<tr>
      <td class="mono text-muted fs12">${idx+1}</td>
      <td class="fs12 text-muted">${esc(i.date)}</td>
      <td><span class="mono fw700 text-gold">${esc(i.challan)}</span></td>
      <td class="mono">${esc(i.vehicle)}</td>
      <td class="fw700">${esc(i.hybrid)}</td>
      <td><span class="fw700 text-gold">${esc(i.qty)} Kg</span></td>
      <td>${getBinIds(i).map(b=>'<span class="chip chip-blue">BIN-'+getBinLabel(b)+'</span>').join(' ')||'—'}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openEditIntakeModal('${esc(i.id)}')" title="Edit Intake">✏️ Edit</button></td>
    </tr>`).join('');
  } else {
    html += `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🚛</div><div class="empty-title">No intakes yet</div></div></td></tr>`;
  }
  html += `</tbody></table></div></div>`;

  document.getElementById('manager-content-area').innerHTML = html;
}

function renderDispatchPage(){
  const sorted=[...state.dispatches].reverse();
  const totalPages=Math.ceil(sorted.length/_PAGE_SIZE);
  window._dispatchPage=Math.min(window._dispatchPage,Math.max(0,totalPages-1));
  const pageItems=sorted.slice(window._dispatchPage*_PAGE_SIZE,(window._dispatchPage+1)*_PAGE_SIZE);
  document.getElementById('dispatch-full-tbody').innerHTML=pageItems.length?pageItems.map(d=>`
    <tr>
      <td><span class="mono text-gold fw700 fs12">${esc(d.receiptId)}</span></td>
      <td class="fs12 text-muted">${esc(d.date)}</td>
      <td class="fw700">${esc(d.party)}</td>
      <td class="truncate" style="max-width:160px;">${esc(d.hybrid)}</td>
      <td class="mono">${esc(d.bags)}</td>
      <td class="mono fw700">${parseInt(d.qty).toLocaleString('en-IN')} Kg</td>
      <td><span class="mono" style="color:var(--green);font-weight:700;">${esc(d.moisture||'—')}%</span></td>
      <td class="fw700 text-green">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
      <td class="mono fs12">${esc(d.vehicle)}</td>
      <td><span class="chip chip-green">✓ ${t('actions.view') || 'Signed'}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="viewReceipt('${esc(d.receiptId)}')">${t('actions.view')}</button></td>
    </tr>`).join('')
    :`<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">${t('dash.noDispatches')}</div><div class="empty-sub">Create a dispatch to generate a signed receipt</div></div></td></tr>`;
  _renderPagination('dispatch-pagination', window._dispatchPage, state.dispatches.length, 'goDispatchPage');
}

function renderReceiptsPage(){
  document.getElementById('receipts-grid').innerHTML=state.dispatches.length?[...state.dispatches].reverse().map(d=>`
    <div onclick="viewReceipt('${esc(d.receiptId)}')" style="background:var(--surface);border:1px solid var(--surface-4);border-radius:var(--radius-lg);padding:20px;cursor:pointer;transition:all var(--transition);box-shadow:var(--shadow-xs);" onmouseover="this.style.boxShadow='var(--shadow)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='var(--shadow-xs)';this.style.transform=''">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <span class="mono fw700 text-gold fs12">${esc(d.receiptId)}</span>
        <span class="chip chip-green">${t('receipts.verified')}</span>
      </div>
      <div class="fw700" style="margin-bottom:4px;">${esc(d.party)}</div>
      <div class="fs12 text-muted">${esc(d.hybrid)}</div>
      <div class="fs12 text-muted" style="margin-top:2px;">${esc(d.bags)} ${t('dash.bags')} · ${parseInt(d.qty).toLocaleString('en-IN')} Kg · ${esc(d.date)}</div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--surface-3);display:flex;justify-content:space-between;align-items:center;">
        <span class="fw700 text-green">₹${parseInt(d.amount).toLocaleString('en-IN')}</span>
        <span class="mono" style="font-size:9px;color:var(--ink-5);">${d.hash.substring(0,16)}…</span>
      </div>
    </div>`).join('')
    :`<div class="empty-state" style="grid-column:1/-1;"><div class="empty-icon">🧾</div><div class="empty-title">${t('dash.noDispatches')}</div></div>`;
}

function renderAnalytics(){
  // ── Compute all real metrics from state ──
  const total=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const rev=state.dispatches.reduce((s,d)=>s+parseInt(d.amount||0),0);
  const totalDispQty=state.dispatches.reduce((s,d)=>s+parseFloat(d.qty||0),0);
  const avgDryDays=(()=>{
    const active=state.bins.filter(b=>b.status!=='empty'&&b.intakeDateTS);
    if(!active.length)return 0;
    return(active.reduce((s,b)=>s+Math.floor((Date.now()-new Date(b.intakeDateTS).getTime())/Config.MS_PER_DAY),0)/active.length).toFixed(1);
  })();
  const avgMoistureDrop=(()=>{
    const active=state.bins.filter(b=>b.status!=='empty'&&b.entryMoisture&&b.currentMoisture);
    if(!active.length)return 0;
    return(active.reduce((s,b)=>s+(b.entryMoisture-b.currentMoisture),0)/active.length).toFixed(1);
  })();

  document.getElementById('a-total').textContent=total.toLocaleString('en-IN');
  document.getElementById('a-disp').textContent=state.dispatches.length;
  const aRev=document.getElementById('a-rev');
  if(aRev) aRev.textContent='₹'+rev.toLocaleString('en-IN');
  const aMdrop=document.getElementById('a-mdrop');
  if(aMdrop) aMdrop.textContent=avgMoistureDrop>0?avgMoistureDrop+'%':'—';
  const aDays=document.getElementById('a-days');
  if(aDays) aDays.textContent=avgDryDays>0?avgDryDays+'d':'—';

  // ── Bar chart: daily intake from real intakes grouped by date ──
  const dayNames=[t('analytics.sun'),t('analytics.mon'),t('analytics.tue'),t('analytics.wed'),t('analytics.thu'),t('analytics.fri'),t('analytics.sat')];
  const today=new Date();
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date(today);d.setDate(d.getDate()-(6-i));return d;
  });
  const dailyQty=last7.map(day=>{
    const dayStr=day.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
    return state.intakes.filter(i=>{
      const iDate=new Date(i.dateTS).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
      return iDate===dayStr;
    }).reduce((s,i)=>s+parseFloat(i.qty||0),0);
  });
  const chartMax=Math.max(...dailyQty,0.1);
  const barColors=['#93C5FD','#86EFAC','#FCD34D','#C4B5FD','#FCA5A5','#6EE7B7','#0F1923'];
  document.getElementById('intake-bar-chart').innerHTML=last7.map((d,i)=>`
    <div class="bar-wrap">
      <div class="bar-col" data-tip="${dailyQty[i].toFixed(1)} Kg" style="background:${barColors[i]};height:${dailyQty[i]>0?(dailyQty[i]/chartMax)*100:2}%;${i===6?'opacity:1;':'opacity:0.8;'}"></div>
      <span class="bar-x-label">${i===6?t('analytics.today'):dayNames[d.getDay()]}</span>
    </div>`).join('');

  // ── Donut: built from real intake hybrid data ──
  const PALETTE=['#F5A623','#10B981','#3B82F6','#8B5CF6','#EF4444','#F59E0B','#06B6D4','#EC4899'];
  const hybridMap={};
  state.intakes.forEach(i=>{
    const key=(i.hybrid||t('analytics.unknown')).split('—')[0].split('-')[0].trim().split(' ')[0];
    hybridMap[key]=(hybridMap[key]||0)+parseFloat(i.qty||0);
  });
  const hybridTotal=Object.values(hybridMap).reduce((s,v)=>s+v,0)||1;
  const hybridEntries=Object.entries(hybridMap).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const hybrids=hybridEntries.map(([lbl,qty],i)=>[lbl,PALETTE[i],Math.round((qty/hybridTotal)*100)]);
  if(hybrids.length===0)hybrids.push(['No Data','#E5E7EB',100]);
  const canvas=document.createElement('canvas');canvas.width=130;canvas.height=130;canvas.className='donut-canvas';
  const ctx=canvas.getContext('2d');let start=-Math.PI/2;
  hybrids.forEach(([,col,pct])=>{
    const a=(pct/100)*2*Math.PI;ctx.beginPath();ctx.moveTo(65,65);ctx.arc(65,65,60,start,start+a);
    ctx.closePath();ctx.fillStyle=col;ctx.fill();start+=a;
  });
  ctx.beginPath();ctx.arc(65,65,35,0,2*Math.PI);ctx.fillStyle='#fff';ctx.fill();
  ctx.font='bold 13px sans-serif';ctx.fillStyle='#0F1923';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(state.intakes.length+' loads',65,65);
  const hw=document.getElementById('hybrid-donut');hw.innerHTML='';
  const dr=document.createElement('div');dr.className='donut-wrap';
  dr.appendChild(canvas);
  const leg=document.createElement('div');leg.className='donut-legend';
  hybrids.forEach(([lbl,col,pct])=>{leg.innerHTML+=`<div class="legend-item"><div class="legend-dot" style="background:${col};"></div><span>${lbl}</span><span class="legend-pct">${pct}%</span></div>`;});
  dr.appendChild(leg);hw.appendChild(dr);

  // ── Moisture curve: real bins sorted by days in bin ──
  const mc=document.getElementById('moisture-curve');
  const activeBins=state.bins.filter(b=>b.status!=='empty'&&b.entryMoisture).sort((a,b)=>
    (new Date(a.intakeDateTS)||0)-(new Date(b.intakeDateTS)||0)
  );
  if(activeBins.length>0){
    const maxEntry=Math.max(...activeBins.map(b=>b.entryMoisture),1);
    mc.innerHTML=activeBins.slice(0,8).map(b=>{
      const days=Math.floor((Date.now()-new Date(b.intakeDateTS).getTime())/Config.MS_PER_DAY);
      const drop=((b.entryMoisture-b.currentMoisture)/b.entryMoisture*100).toFixed(0);
      const pct=(b.currentMoisture/maxEntry)*100;
      return`<div class="progress-item">
        <div class="progress-hdr">
          <span class="progress-label">BIN-${b.binLabel||b.id} · Day ${days}</span>
          <span class="progress-val">${b.currentMoisture.toFixed(1)}% <span style="font-size:10px;color:var(--green);">↓${drop}%</span></span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%;background:${getMoistureBarColor(b.currentMoisture)};"></div></div>
      </div>`;
    }).join('');
  } else {
    mc.innerHTML='<div style="color:var(--ink-5);text-align:center;padding:16px;font-size:12px;">No active bins</div>';
  }

  // ── Dispatch performance: real computed metrics ──
  const totalDispKg=state.dispatches.reduce((s,d)=>s+parseFloat(d.qty||0),0);
  const totalBags=state.dispatches.reduce((s,d)=>s+parseInt(d.bags||0),0);
  const avgMoistureFinal=state.dispatches.filter(d=>d.moisture>0).length>0
    ?(state.dispatches.filter(d=>d.moisture>0).reduce((s,d)=>s+d.moisture,0)/state.dispatches.filter(d=>d.moisture>0).length).toFixed(1)
    :'—';
  const intakeTotalKg=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const yieldPct=intakeTotalKg>0?((totalDispKg/intakeTotalKg)*100).toFixed(1):'—';
  document.getElementById('dispatch-perf').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${[['Receipts Issued',state.dispatches.length,''],['Total Dispatched',parseInt(totalDispKg).toLocaleString('en-IN')+' Kg','text-gold'],['Total Bags',totalBags.toLocaleString('en-IN'),''],['Avg Final Moisture',avgMoistureFinal+(avgMoistureFinal!=='—'?'%':''),'text-green'],['Yield %',yieldPct+(yieldPct!=='—'?'%':''),'']].map(([k,v,cls])=>`
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface-2);border-radius:var(--radius);">
        <span class="fs12 text-muted">${k}</span><span class="fw700 ${cls} mono" style="font-size:12px;">${v}</span>
      </div>`).join('')}
    </div>`;

  // ── Bin utilization: real status breakdown ──
  const binGroups={empty:0,drying:0,shelling:0};
  state.bins.forEach(b=>{ const s=b.status==='intake'?'drying':b.status; binGroups[s]=(binGroups[s]||0)+1; });
  const totalBinCount = state.bins.length || 1;
  const used = totalBinCount - (binGroups.empty||0);
  const pct  = Math.round((used / totalBinCount) * 100);
  const totalQtyInBins=state.bins.filter(b=>b.status!=='empty').reduce((s,b)=>s+parseFloat(b.qty||0),0);
  document.getElementById('bin-util-chart').innerHTML=`
    <div style="font-family:'Playfair Display',serif;font-size:52px;font-weight:800;color:var(--ink);line-height:1;">${used}<span style="font-size:24px;color:var(--ink-5);">/${totalBinCount}</span></div>
    <div class="text-muted fs12" style="margin:4px 0 8px;">Bins Active · ${parseInt(totalQtyInBins).toLocaleString('en-IN')} Kg total</div>
    <div style="height:8px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin-bottom:10px;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--gold),var(--gold-dark));border-radius:99px;transition:width .6s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-5);margin-bottom:10px;">
      <span>${used} Active</span><span>${pct}%</span><span>${binGroups.empty||0} Free</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;">
      ${Object.entries({'🟠 Drying':binGroups.drying||0,'🟣 Shelling':binGroups.shelling||0}).map(([lbl,cnt])=>cnt>0?`
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 8px;background:var(--surface-2);border-radius:6px;">
          <span>${lbl}</span><span class="fw700 mono">${cnt} bin${cnt!==1?'s':''}</span>
        </div>`:'').join('')}
    </div>`;

  // ── Cycle Analytics ──────────────────────────────────────────
  const history = state.binHistory || [];

  // Completed cycles per bin_id from bin_history
  const completedPerBin = {};
  history.forEach(h => {
    completedPerBin[h.bin_id] = (completedPerBin[h.bin_id] || 0) + 1;
  });

  // In-progress = bins currently drying or shelling
  const inProgressBins = state.bins.filter(b => b.status === 'drying' || b.status === 'shelling');
  const inProgressIds = new Set(inProgressBins.map(b => b.id));

  // Total completed BIN cycles (sum of all individual bin cycle counts)
  const totalBinCyclesCompleted = Object.values(completedPerBin).reduce((s, v) => s + v, 0);
  const totalInProgress = inProgressBins.length;

  // DRYER CYCLE = one full round of the entire dryer
  // = floor(total completed bin cycles / total number of bins)
  // e.g. 24 bins × 3 rounds = 72 completed bin cycles → 3 dryer cycles
  const allBinsCount = state.bins.length || 1;
  const dryerCycles = Math.floor(totalBinCyclesCompleted / allBinsCount);

  // Bin with most completed cycles
  let topBinId = null, topBinCycles = 0;
  Object.entries(completedPerBin).forEach(([id, cnt]) => { if (cnt > topBinCycles) { topBinCycles = cnt; topBinId = parseInt(id); } });

  // Avg days per completed cycle
  const validDays = history.filter(h => h.days_in_bin > 0).map(h => h.days_in_bin);
  const avgDaysPerCycle = validDays.length ? (validDays.reduce((s, v) => s + v, 0) / validDays.length).toFixed(1) : '—';

  // Render KPI cards
  const cycleKpis = document.getElementById('cycle-kpis');
  if (cycleKpis) {
    cycleKpis.innerHTML = `
      <div class="kpi-card kpi-blue"><div class="kpi-icon">🏭</div><div class="kpi-val">${dryerCycles}</div><div class="kpi-label">Dryer Cycles<div style="font-size:10px;font-weight:400;color:var(--ink-5);margin-top:2px;">full rounds of all ${allBinsCount} bins</div></div></div>
      <div class="kpi-card kpi-green"><div class="kpi-icon">✅</div><div class="kpi-val">${totalBinCyclesCompleted}</div><div class="kpi-label">Total Bin Cycles<div style="font-size:10px;font-weight:400;color:var(--ink-5);margin-top:2px;">completed across all bins</div></div></div>
      <div class="kpi-card kpi-amber"><div class="kpi-icon">⚡</div><div class="kpi-val">${totalInProgress}</div><div class="kpi-label">In Progress<div style="font-size:10px;font-weight:400;color:var(--ink-5);margin-top:2px;">bins currently active</div></div></div>
      <div class="kpi-card kpi-purple"><div class="kpi-icon">⏱️</div><div class="kpi-val">${avgDaysPerCycle}${avgDaysPerCycle !== '—' ? 'd' : ''}</div><div class="kpi-label">Avg Days / Bin Cycle<div style="font-size:10px;font-weight:400;color:var(--ink-5);margin-top:2px;">fill → empty</div></div></div>
    `;
  }

  // Render cycles-per-bin bar chart
  const cpbEl = document.getElementById('cycle-per-bin');
  if (cpbEl) {
    const allBins = [...state.bins].sort((a, b) => (a.sortOrder || a.id) - (b.sortOrder || b.id));
    const maxC = Math.max(...allBins.map(b => (completedPerBin[b.id] || 0) + (inProgressIds.has(b.id) ? 1 : 0)), 1);
    cpbEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;">` +
      allBins.map(b => {
        const completed = completedPerBin[b.id] || 0;
        const inProg = inProgressIds.has(b.id) ? 1 : 0;
        const total = completed + inProg;
        if (total === 0) return '';
        const pct = Math.round((total / maxC) * 100);
        const label = `BIN-${b.binLabel || b.id}`;
        return `<div style="display:grid;grid-template-columns:56px 1fr 32px;gap:8px;align-items:center;">
          <span style="font-size:11px;font-weight:600;color:var(--ink-4);">${label}</span>
          <div style="height:14px;background:var(--surface-3);border-radius:99px;overflow:hidden;position:relative;">
            <div style="height:100%;width:${Math.round((completed/maxC)*100)}%;background:var(--green);border-radius:99px;transition:width .5s;display:inline-block;"></div>${inProg ? `<div style="height:100%;width:${Math.round((inProg/maxC)*100)}%;background:var(--amber);border-radius:99px;display:inline-block;margin-left:-1px;"></div>` : ''}
          </div>
          <span style="font-size:11px;font-weight:700;color:var(--ink);text-align:right;">${total}</span>
        </div>`;
      }).filter(Boolean).join('') +
      `</div>
      <div style="display:flex;gap:12px;margin-top:10px;font-size:10px;color:var(--ink-5);">
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;margin-right:4px;"></span>Completed</span>
        <span><span style="display:inline-block;width:10px;height:10px;background:var(--amber);border-radius:2px;margin-right:4px;"></span>In Progress</span>
      </div>`;
    if (!allBins.some(b => (completedPerBin[b.id] || 0) + (inProgressIds.has(b.id) ? 1 : 0) > 0)) {
      cpbEl.innerHTML = '<div style="color:var(--ink-5);text-align:center;padding:20px;font-size:12px;">No cycles recorded yet this season</div>';
    }
  }

  // Render cycle history log (last 10)
  const logEl = document.getElementById('cycle-history-log');
  if (logEl) {
    const recent = history.slice(0, 10);
    if (recent.length === 0) {
      logEl.innerHTML = '<div style="color:var(--ink-5);text-align:center;padding:20px;font-size:12px;">No completed cycles yet</div>';
    } else {
      logEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;">` +
        recent.map(h => {
          const label = `BIN-${getBinLabel(h.bin_id)}`;
          const days = h.days_in_bin != null ? `${h.days_in_bin}d` : '—';
          const moisture = (h.entry_moisture && h.final_moisture) ? `${h.entry_moisture}%→${h.final_moisture}%` : '—';
          const date = h.emptied_at ? new Date(h.emptied_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short'}) : '—';
          return `<div style="display:grid;grid-template-columns:52px 1fr auto auto;gap:8px;align-items:center;padding:7px 10px;background:var(--surface-2);border-radius:var(--radius);">
            <span style="font-size:11px;font-weight:700;color:var(--ink);">${label}</span>
            <span style="font-size:11px;color:var(--ink-4);">${h.hybrid || '—'}</span>
            <span style="font-size:10px;color:var(--green);font-weight:600;">${moisture}</span>
            <span style="font-size:10px;color:var(--ink-5);">${days} · ${date}</span>
          </div>`;
        }).join('') +
        `</div>`;
    }
  }

  renderAdvancedAnalytics();
}

// ============================================================
// ADVANCED ANALYTICS
// ============================================================
function renderAdvancedAnalytics() {
  const history   = state.binHistory  || [];
  const intakes   = state.intakes     || [];
  const dispatches= state.dispatches  || [];
  const bins      = state.bins        || [];

  // ── helpers ──────────────────────────────────────────────
  function statRow(label, value, cls='') {
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 12px;background:var(--surface-2);border-radius:var(--radius);margin-bottom:5px;">
      <span style="font-size:12px;color:var(--ink-4);">${label}</span>
      <span style="font-size:12px;font-weight:700;${cls}">${value}</span></div>`;
  }
  function emptyMsg(msg) {
    return `<div style="color:var(--ink-5);text-align:center;padding:20px;font-size:12px;">${msg}</div>`;
  }

  // ── 1. STOCK FLOW ─────────────────────────────────────────
  const totalIntakeKg   = intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const totalInDryerKg  = bins.filter(b=>b.status!=='empty').reduce((s,b)=>s+parseFloat(b.qty||0),0);
  const totalDispKg     = dispatches.reduce((s,d)=>s+parseFloat(d.qty||0),0);
  const pendingKg       = Math.max(0, totalIntakeKg - totalDispKg);
  const flowEl = document.getElementById('adv-stock-flow');
  if (flowEl) {
    const flowMax = Math.max(totalIntakeKg, 0.1);
    function flowBar(kg, color, label) {
      const pct = Math.round((kg / flowMax) * 100);
      return `<div style="margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
          <span style="color:var(--ink-4);font-weight:600;">${label}</span>
          <span style="font-weight:700;color:var(--ink);">${parseInt(kg).toLocaleString('en-IN')} Kg</span>
        </div>
        <div style="height:16px;background:var(--surface-3);border-radius:99px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:99px;transition:width .7s;"></div>
        </div></div>`;
    }
    flowEl.innerHTML =
      flowBar(totalIntakeKg, 'var(--gold)', '📥 Total Received') +
      flowBar(totalInDryerKg, 'var(--amber)', '🔥 Currently in Dryer') +
      flowBar(totalDispKg, 'var(--green)', '📤 Dispatched') +
      `<div style="display:flex;gap:8px;margin-top:4px;font-size:11px;color:var(--ink-5);">
        <span>⏳ Pending dispatch: <strong style="color:var(--ink);">${parseInt(pendingKg).toLocaleString('en-IN')} Kg</strong></span>
      </div>`;
  }

  // ── 2. SEASON EFFICIENCY ──────────────────────────────────
  const effEl = document.getElementById('adv-season-eff');
  if (effEl) {
    const yieldNum      = totalIntakeKg > 0 ? (totalDispKg / totalIntakeKg)*100 : null;
    const yieldPct      = yieldNum !== null ? yieldNum.toFixed(1) : '—';
    const totalBags     = dispatches.reduce((s,d)=>s+parseInt(d.bags||0),0);
    const avgKgBag      = totalBags > 0 ? (totalDispKg / totalBags).toFixed(1) : '—';
    const completedH    = history.filter(h=>h.days_in_bin>0);
    const avgDays       = completedH.length ? (completedH.reduce((s,h)=>s+h.days_in_bin,0)/completedH.length).toFixed(1) : '—';
    const moistDrops    = history.filter(h=>h.entry_moisture&&h.final_moisture);
    const avgDrop       = moistDrops.length ? (moistDrops.reduce((s,h)=>s+(parseFloat(h.entry_moisture)-parseFloat(h.final_moisture)),0)/moistDrops.length).toFixed(1) : '—';
    const binUtil       = bins.length > 0 ? Math.round((bins.filter(b=>b.status!=='empty').length/bins.length)*100) : 0;
    const totalLoads    = intakes.length;
    const avgLoadKg     = totalLoads > 0 ? (totalIntakeKg / totalLoads).toFixed(0) : '—';
    effEl.innerHTML =
      statRow('📦 Yield Retention',     yieldPct !== '—' ? yieldPct+'%' : '—',   yieldNum !== null && yieldNum >= 90 ? 'color:var(--green)' : yieldNum !== null ? 'color:var(--amber)' : '') +
      statRow('💧 Avg Moisture Reduced', avgDrop  !== '—' ? avgDrop+'%' : '—',    'color:var(--blue)') +
      statRow('⏱️ Avg Days to Dry',      avgDays  !== '—' ? avgDays+'d' : '—',    '') +
      statRow('🏭 Dryer Utilisation',   binUtil+'%',                               binUtil >= 70 ? 'color:var(--green)' : '') +
      statRow('🚛 Avg Load Size',        avgLoadKg !== '—' ? avgLoadKg+' Kg' : '—', '') +
      statRow('🎒 Avg Kg / Bag',         avgKgBag  !== '—' ? avgKgBag+' Kg' : '—', '');
  }

  // ── 3. DRYING VELOCITY & ETA ──────────────────────────────
  const velEl = document.getElementById('adv-drying-velocity');
  if (velEl) {
    const TARGET = 10;
    const activeBins = bins.filter(b => b.status === 'drying' || b.status === 'shelling')
      .filter(b => b.intakeDateTS && b.entryMoisture > 0 && b.currentMoisture > 0);
    if (!activeBins.length) {
      velEl.innerHTML = emptyMsg('No active bins with moisture data');
    } else {
      const rows = activeBins.map(b => {
        const daysIn      = Math.max(1, Math.floor((Date.now() - b.intakeDateTS) / 86400000));
        const dropped     = b.entryMoisture - b.currentMoisture;
        const rateNum     = dropped > 0 ? dropped / daysIn : 0;          // number, not string
        const rateDisplay = rateNum > 0 ? rateNum.toFixed(2) : '0.00';
        const remaining   = b.currentMoisture - TARGET;
        const etaDays     = rateNum > 0 && remaining > 0 ? Math.ceil(remaining / rateNum) : null;
        const totalRange  = b.entryMoisture - TARGET;
        const pctDone     = totalRange > 0 ? Math.min(100, Math.max(0, Math.round((dropped / totalRange) * 100))) : (b.currentMoisture <= TARGET ? 100 : 0);
        const speed       = rateNum >= 0.8 ? {label:'Fast',bg:'#d1fae5',col:'#059669'} : rateNum >= 0.4 ? {label:'Normal',bg:'#fef3c7',col:'#d97706'} : {label:'Slow',bg:'#fee2e2',col:'#dc2626'};
        const etaStr      = etaDays !== null ? `~${etaDays}d left` : remaining <= 0 ? 'Ready ✓' : '—';
        const label       = `BIN-${b.binLabel || b.id}`;
        return `<div style="padding:10px 14px;background:var(--surface-2);border-radius:var(--radius);margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;font-weight:700;color:var(--ink);">${label}</span>
              <span style="font-size:11px;color:var(--ink-4);">${b.hybrid||'—'}</span>
              <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:99px;background:${speed.bg};color:${speed.col};">${speed.label}</span>
            </div>
            <div style="display:flex;align-items:center;gap:14px;font-size:11px;">
              <span style="color:var(--ink-5);">${rateDisplay}%/day</span>
              <span style="font-weight:700;color:${remaining<=0?'#059669':'var(--ink)'};">${etaStr}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:10px;color:var(--ink-5);width:36px;">${b.entryMoisture}%</span>
            <div style="flex:1;height:8px;background:var(--surface-3);border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${pctDone}%;background:linear-gradient(90deg,#F59E0B,#10B981);border-radius:99px;transition:width .6s;"></div>
            </div>
            <span style="font-size:10px;color:var(--ink);width:36px;text-align:right;">${b.currentMoisture}%</span>
          </div>
          <div style="font-size:10px;color:var(--ink-5);margin-top:3px;">Day ${daysIn} · ${parseInt(b.qty||0).toLocaleString('en-IN')} Kg · ${pctDone}% of drying complete · target 10%</div>
        </div>`;
      });
      velEl.innerHTML = rows.join('');
    }
  }

  // ── 4. HYBRID LEADERBOARD ─────────────────────────────────
  const hybridEl = document.getElementById('adv-hybrid-leader');
  if (hybridEl) {
    if (!history.length) {
      hybridEl.innerHTML = emptyMsg('No completed cycles yet');
    } else {
      const hmap = {};
      history.forEach(h => {
        const key = (h.hybrid||'Unknown').trim();
        if (!hmap[key]) hmap[key] = { cycles:0, totalQty:0, totalDrop:0, totalDays:0, dropCount:0, daysCount:0 };
        hmap[key].cycles++;
        hmap[key].totalQty += parseFloat(h.qty||0);
        const em = parseFloat(h.entry_moisture)||0, fm = parseFloat(h.final_moisture)||0;
        if (em > 0 && fm > 0 && em > fm) { hmap[key].totalDrop += (em - fm); hmap[key].dropCount++; }
        const dib = parseInt(h.days_in_bin)||0;
        if (dib > 0) { hmap[key].totalDays += dib; hmap[key].daysCount++; }
      });
      const entries = Object.entries(hmap).map(([name, d]) => ({
        name,
        cycles:   d.cycles,
        totalQty: d.totalQty,
        avgDrop:  d.dropCount ? (d.totalDrop / d.dropCount).toFixed(1) : null,
        avgDays:  d.daysCount ? (d.totalDays / d.daysCount).toFixed(1) : null,
        rateNum:  (d.dropCount && d.daysCount) ? (d.totalDrop / d.totalDays) : 0,  // keep as number
        rate:     (d.dropCount && d.daysCount) ? (d.totalDrop / d.totalDays).toFixed(2) : '0'
      })).sort((a,b) => b.rateNum - a.rateNum);

      hybridEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px;">
        <div style="display:grid;grid-template-columns:1fr 50px 55px 55px 50px;gap:6px;padding:4px 10px;font-size:10px;color:var(--ink-5);font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
          <span>Hybrid</span><span style="text-align:center;">Cycles</span><span style="text-align:center;">Avg Drop</span><span style="text-align:center;">Avg Days</span><span style="text-align:right;">%/Day</span>
        </div>` +
        entries.slice(0,8).map((e,i) => {
          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
          return `<div style="display:grid;grid-template-columns:1fr 50px 55px 55px 50px;gap:6px;align-items:center;padding:7px 10px;background:${i===0?'var(--green-bg)':'var(--surface-2)'};border-radius:var(--radius);">
            <span style="font-size:11px;font-weight:700;color:var(--ink);">${medal} ${e.name}</span>
            <span style="font-size:11px;text-align:center;color:var(--ink-4);">${e.cycles}</span>
            <span style="font-size:11px;text-align:center;color:var(--blue);font-weight:600;">${e.avgDrop !== null ? e.avgDrop+'%' : '—'}</span>
            <span style="font-size:11px;text-align:center;color:var(--ink-4);">${e.avgDays !== null ? e.avgDays+'d' : '—'}</span>
            <span style="font-size:11px;text-align:right;font-weight:700;color:${e.rateNum>=0.8?'var(--green)':e.rateNum>=0.4?'var(--amber)':'var(--ink-4)'};">${e.rateNum > 0 ? e.rate : '—'}</span>
          </div>`;
        }).join('') +
        `<div style="font-size:10px;color:var(--ink-5);padding:4px 10px;">%/Day = moisture reduction speed (higher = dries faster)</div>
      </div>`;
    }
  }

  // ── 5. COMPANY VOLUME ─────────────────────────────────────
  const compEl = document.getElementById('adv-company-vol');
  if (compEl) {
    if (!intakes.length) {
      compEl.innerHTML = emptyMsg('No intake data yet');
    } else {
      const cmap = {};
      intakes.forEach(i => {
        const key = (i.company||'Unknown').trim() || 'Unknown';
        if (!cmap[key]) cmap[key] = { loads:0, qty:0 };
        cmap[key].loads++;
        cmap[key].qty += parseFloat(i.qty||0);
      });
      const sorted = Object.entries(cmap).sort((a,b)=>b[1].qty-a[1].qty);
      const maxQty = sorted[0]?.[1].qty || 1;
      const COLS = ['#F5A623','#10B981','#3B82F6','#8B5CF6','#EF4444','#F59E0B','#06B6D4','#EC4899'];
      compEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;">` +
        sorted.slice(0,8).map(([name, d], i) => {
          const pct = Math.round((d.qty / maxQty) * 100);
          return `<div>
            <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
              <span style="font-weight:600;color:var(--ink);">${name}</span>
              <span style="color:var(--ink-4);">${parseInt(d.qty).toLocaleString('en-IN')} Kg · ${d.loads} loads</span>
            </div>
            <div style="height:10px;background:var(--surface-3);border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${COLS[i%COLS.length]};border-radius:99px;transition:width .6s;opacity:0.85;"></div>
            </div></div>`;
        }).join('') +
        `</div>`;
    }
  }

  // ── 6. CUMULATIVE INTAKE TREND (last 14 days) ─────────────
  const trendEl = document.getElementById('adv-intake-trend');
  if (trendEl) {
    const today = new Date(); today.setHours(23,59,59,999);
    const days14 = Array.from({length:14},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-(13-i)); return d; });
    const daily14 = days14.map(day => {
      const ds = day.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
      return intakes.filter(i => new Date(i.dateTS).toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'})===ds)
        .reduce((s,i)=>s+parseFloat(i.qty||0),0);
    });
    const chartMax = Math.max(...daily14, 0.1);
    const dayLabels = days14.map((d,i) => i===13?'Today':d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}));
    trendEl.innerHTML = `<div style="display:flex;gap:3px;align-items:flex-end;height:80px;">` +
      daily14.map((v, i) => {
        const h = Math.max(4, Math.round((v/chartMax)*72));
        const isToday = i===13;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
          <div title="${parseInt(v).toLocaleString('en-IN')} Kg" style="width:100%;height:${h}px;background:${isToday?'var(--gold)':'var(--blue)'};border-radius:3px 3px 0 0;opacity:${isToday?1:0.65};cursor:default;transition:height .4s;"></div>
          <span style="font-size:9px;color:var(--ink-5);writing-mode:vertical-lr;text-orientation:mixed;transform:rotate(180deg);height:36px;overflow:hidden;">${dayLabels[i]}</span>
        </div>`;
      }).join('') +
      `</div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-5);margin-top:6px;padding:0 2px;">
        <span>Total 14d: <strong style="color:var(--ink);">${parseInt(daily14.reduce((s,v)=>s+v,0)).toLocaleString('en-IN')} Kg</strong></span>
        <span>Peak day: <strong style="color:var(--gold);">${parseInt(chartMax).toLocaleString('en-IN')} Kg</strong></span>
        <span>Active days: <strong style="color:var(--ink);">${daily14.filter(v=>v>0).length}</strong></span>
      </div>`;
  }

  renderFaangAnalytics();
}

// ============================================================
// INTELLIGENCE CENTRE — FAANG-LEVEL ANALYTICS
// ============================================================
function renderFaangAnalytics() {
  const history   = state.binHistory  || [];
  const intakes   = state.intakes     || [];
  const dispatches= state.dispatches  || [];
  const bins      = state.bins        || [];
  const TARGET_MOISTURE = Config.TARGET_MOISTURE;

  // ── A. OPERATIONAL HEALTH SCORE ───────────────────────────
  const healthEl = document.getElementById('faang-health');
  if (healthEl) {
    // Component 1: Dryer Utilisation (30 pts)
    const totalBins = bins.length || 1;
    const activeBinCount = bins.filter(b => b.status !== 'empty').length;
    const utilScore = Math.min(30, Math.round((activeBinCount / totalBins) * 30));

    // Component 2: Moisture Efficiency (25 pts) — avg final moisture vs target
    const completedWithMoisture = history.filter(h => parseFloat(h.final_moisture) > 0);
    let moistScore = 0;
    if (completedWithMoisture.length > 0) {
      const avgFinal = completedWithMoisture.reduce((s,h) => s + parseFloat(h.final_moisture), 0) / completedWithMoisture.length;
      // Perfect = <=10%, worst = >=20%
      moistScore = Math.min(25, Math.max(0, Math.round(((20 - avgFinal) / 10) * 25)));
    }

    // Component 3: Cycle Throughput (20 pts) — cycles completed this season
    const totalCyclesCompleted = history.length;
    // Scale: 0 cycles=0, 20+ cycles=20 pts
    const cycleScore = Math.min(20, totalCyclesCompleted);

    // Component 4: Yield Retention (15 pts) — dispatched/intake ratio
    const totalIntakeKg  = intakes.reduce((s,i) => s + parseFloat(i.qty||0), 0);
    const totalDispKg    = dispatches.reduce((s,d) => s + parseFloat(d.qty||0), 0);
    let yieldScore = 0;
    if (totalIntakeKg > 0) {
      const yieldRatio = totalDispKg / totalIntakeKg;
      yieldScore = Math.min(15, Math.round(yieldRatio * 15));
    }

    // Component 5: Dispatch Activity (10 pts) — has recent dispatches
    const recentDispatch = dispatches.filter(d => (Date.now() - d.dateTS) < 7 * Config.MS_PER_DAY).length;
    const dispScore = Math.min(10, recentDispatch * 2);

    const totalScore = utilScore + moistScore + cycleScore + yieldScore + dispScore;
    const scoreColor = totalScore >= 75 ? '#10B981' : totalScore >= 50 ? '#F59E0B' : '#EF4444';
    const scoreLabel = totalScore >= 75 ? 'Excellent' : totalScore >= 50 ? 'Good' : totalScore >= 25 ? 'Fair' : 'Low Activity';

    // SVG arc gauge
    const R = 54, CX = 64, CY = 64;
    const startAngle = -210, sweepMax = 240; // degrees
    const sweepAngle = (totalScore / 100) * sweepMax;
    function polarToXY(cx, cy, r, angleDeg) {
      const rad = (angleDeg - 90) * Math.PI / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }
    function describeArc(cx, cy, r, startDeg, endDeg) {
      const s = polarToXY(cx, cy, r, startDeg);
      const e = polarToXY(cx, cy, r, endDeg);
      const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;
      return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
    }
    const bgArc    = describeArc(CX, CY, R, startAngle, startAngle + sweepMax);
    const fillArc  = totalScore > 0 ? describeArc(CX, CY, R, startAngle, startAngle + sweepAngle) : '';

    const gaugeHTML = `<svg width="128" height="128" viewBox="0 0 128 128" style="flex-shrink:0;">
      <path d="${bgArc}" fill="none" stroke="#E5E7EB" stroke-width="10" stroke-linecap="round"/>
      ${fillArc ? `<path d="${fillArc}" fill="none" stroke="${scoreColor}" stroke-width="10" stroke-linecap="round" style="transition:stroke-dasharray .8s;"/>` : ''}
      <text x="${CX}" y="${CY - 6}" text-anchor="middle" font-size="26" font-weight="800" fill="${scoreColor}" font-family="DM Mono,monospace">${totalScore}</text>
      <text x="${CX}" y="${CY + 12}" text-anchor="middle" font-size="9" fill="#6B7280" font-family="sans-serif">out of 100</text>
      <text x="${CX}" y="${CY + 26}" text-anchor="middle" font-size="10" font-weight="700" fill="${scoreColor}" font-family="sans-serif">${scoreLabel}</text>
    </svg>`;

    const components = [
      ['Dryer Utilisation', utilScore, 30, '#F5A623'],
      ['Moisture Efficiency', moistScore, 25, '#10B981'],
      ['Cycle Throughput', cycleScore, 20, '#3B82F6'],
      ['Yield Retention', yieldScore, 15, '#8B5CF6'],
      ['Dispatch Activity', dispScore, 10, '#F59E0B'],
    ];
    const compHTML = `<div style="flex:1;display:flex;flex-direction:column;gap:8px;">` +
      components.map(([label, score, max, col]) => {
        const pct = Math.round((score/max)*100);
        return `<div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px;">
            <span style="color:var(--ink-4);">${label}</span>
            <span style="font-weight:700;color:var(--ink);">${score}<span style="color:var(--ink-5);font-weight:400;">/${max}</span></span>
          </div>
          <div style="height:6px;background:var(--surface-3);border-radius:99px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${col};border-radius:99px;transition:width .6s;"></div>
          </div></div>`;
      }).join('') + `</div>`;

    healthEl.innerHTML = gaugeHTML + compHTML;
  }

  // ── B. LIVE RISK & ALERTS ──────────────────────────────────
  const alertsEl = document.getElementById('faang-alerts');
  if (alertsEl) {
    const alerts = [];
    const now = Date.now();

    bins.forEach(b => {
      if (b.status === 'empty') return;
      const label = `BIN-${b.binLabel || b.id}`;
      const hoursIn = b.intakeDateTS ? Math.floor((now - b.intakeDateTS) / Config.MS_PER_HOUR) : 0;

      // Critical: > 120h in dryer
      if (hoursIn > 120) {
        alerts.push({ sev: 'red', icon: '🔴', msg: `${label} — ${hoursIn}h in dryer (>${120}h threshold)`, sub: `${b.hybrid||'?'} · ${parseInt(b.qty||0).toLocaleString('en-IN')} Kg` });
      }
      // Warning: slow moisture drop
      if (b.intakeDateTS && b.entryMoisture > 0 && b.currentMoisture > 0) {
        const daysIn = Math.max(1, Math.floor((now - b.intakeDateTS) / 86400000));
        const rate = (b.entryMoisture - b.currentMoisture) / daysIn;
        if (rate < 0.3 && daysIn >= 2) {
          alerts.push({ sev: 'amber', icon: '🟡', msg: `${label} — slow drying rate (${rate.toFixed(2)}%/day)`, sub: `${b.currentMoisture}% moisture · check airflow` });
        }
        // Info: near target
        if (b.currentMoisture > TARGET_MOISTURE && b.currentMoisture <= TARGET_MOISTURE + 1.5) {
          alerts.push({ sev: 'green', icon: '🟢', msg: `${label} — approaching target (${b.currentMoisture}%)`, sub: `Ready for shelling soon` });
        }
        // Info: at or below target
        if (b.currentMoisture <= TARGET_MOISTURE) {
          alerts.push({ sev: 'green', icon: '✅', msg: `${label} — at target moisture (${b.currentMoisture}%)`, sub: `Ready to dispatch / shell` });
        }
      }
    });

    // Capacity warning
    const freeCount = bins.filter(b => b.status === 'empty').length;
    if (freeCount <= 3) {
      alerts.push({ sev: 'amber', icon: '⚡', msg: `Only ${freeCount} bin${freeCount!==1?'s':''} available — dryer near capacity`, sub: 'Schedule dispatches to free up space' });
    }

    if (alerts.length === 0) {
      alertsEl.innerHTML = `<div style="display:flex;align-items:center;gap:12px;padding:16px;background:#ECFDF5;border-radius:var(--radius);">
        <span style="font-size:24px;">✅</span>
        <div><div style="font-weight:700;color:#065F46;font-size:13px;">All systems nominal</div>
        <div style="font-size:11px;color:#047857;">No issues detected across all active bins</div></div></div>`;
    } else {
      const order = { red: 0, amber: 1, green: 2 };
      const bgMap = { red:'#FEF2F2', amber:'#FFFBEB', green:'#ECFDF5' };
      const clrMap = { red:'#B91C1C', amber:'#92400E', green:'#065F46' };
      alertsEl.innerHTML = alerts.sort((a,b) => order[a.sev]-order[b.sev]).map(a => `
        <div style="padding:8px 12px;background:${bgMap[a.sev]};border-radius:var(--radius);margin-bottom:6px;">
          <div style="font-size:12px;font-weight:600;color:${clrMap[a.sev]};">${a.icon} ${a.msg}</div>
          <div style="font-size:10px;color:${clrMap[a.sev]};opacity:.75;margin-top:1px;">${a.sub}</div>
        </div>`).join('');
    }
  }

  // ── C. SEASON HEATMAP ─────────────────────────────────────
  const heatEl = document.getElementById('faang-heatmap');
  if (heatEl) {
    // Build 84-day window (12 weeks) ending today
    const today = new Date(); today.setHours(23,59,59,999);
    const WEEKS = 12, DAYS = WEEKS * 7;
    const startDate = new Date(today); startDate.setDate(startDate.getDate() - (DAYS - 1)); startDate.setHours(0,0,0,0);

    // Map dateStr -> total Kg
    const dayMap = {};
    intakes.forEach(i => {
      const d = new Date(i.dateTS);
      const key = d.toISOString().slice(0,10);
      dayMap[key] = (dayMap[key]||0) + parseFloat(i.qty||0);
    });

    const maxKg = Math.max(...Object.values(dayMap), 1);
    const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build day cells grouped by week columns
    const weeks = [];
    for (let w = 0; w < WEEKS; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + w*7 + d);
        week.push(date);
      }
      weeks.push(week);
    }

    // Color function: 5 intensity levels
    function heatColor(kg) {
      if (kg === 0) return '#F3F4F6';
      const pct = kg / maxKg;
      if (pct < 0.2) return '#FEF3C7';
      if (pct < 0.4) return '#FDE68A';
      if (pct < 0.6) return '#F59E0B';
      if (pct < 0.8) return '#D97706';
      return '#92400E';
    }

    const cellSize = 13, gap = 2;

    heatEl.innerHTML = `<div style="display:flex;gap:4px;align-items:flex-start;">
      <div style="display:flex;flex-direction:column;gap:${gap}px;margin-top:16px;margin-right:4px;">
        ${dayNames.map((d,i) => `<div style="height:${cellSize}px;font-size:9px;color:var(--ink-5);line-height:${cellSize}px;text-align:right;">${i%2===1?d:''}</div>`).join('')}
      </div>
      <div style="overflow-x:auto;">
        <div style="display:flex;gap:${gap}px;margin-bottom:4px;">
          ${weeks.map((week, wi) => {
            const m = week[1].getMonth();
            const showMonth = wi===0 || week[1].getDate() <= 7;
            return `<div style="width:${cellSize}px;font-size:9px;color:var(--ink-5);text-align:center;overflow:visible;white-space:nowrap;">${showMonth ? monthNames[m] : ''}</div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:${gap}px;">
          ${weeks.map(week => `<div style="display:flex;flex-direction:column;gap:${gap}px;">
            ${week.map(date => {
              const key = date.toISOString().slice(0,10);
              const kg = dayMap[key] || 0;
              const isToday = key === today.toISOString().slice(0,10);
              const isFuture = date > today;
              const col = isFuture ? 'transparent' : heatColor(kg);
              const tip = isFuture ? '' : `${date.toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}: ${kg>0?parseInt(kg).toLocaleString('en-IN')+' Kg':'No intake'}`;
              return `<div title="${tip}" style="width:${cellSize}px;height:${cellSize}px;background:${col};border-radius:2px;${isToday?'outline:2px solid var(--gold);outline-offset:1px;':''}"></div>`;
            }).join('')}
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:10px;font-size:10px;color:var(--ink-5);">
      <span>Less</span>
      ${['#F3F4F6','#FEF3C7','#FDE68A','#F59E0B','#D97706','#92400E'].map(c=>`<div style="width:12px;height:12px;background:${c};border-radius:2px;"></div>`).join('')}
      <span>More</span>
      <span style="margin-left:12px;">Max single day: <strong style="color:var(--ink);">${parseInt(maxKg).toLocaleString('en-IN')} Kg</strong></span>
      <span>· Total active days: <strong style="color:var(--ink);">${Object.values(dayMap).filter(v=>v>0).length}</strong></span>
    </div>`;
  }

  // ── D. BIN PERFORMANCE RANKING ────────────────────────────
  const binRankEl = document.getElementById('faang-bin-rank');
  if (binRankEl) {
    if (!history.length) {
      binRankEl.innerHTML = '<div style="color:var(--ink-5);text-align:center;padding:20px;font-size:12px;">No completed cycles to rank yet</div>';
    } else {
      // Group by bin_id
      const binStats = {};
      history.forEach(h => {
        const id = h.bin_id;
        if (!binStats[id]) binStats[id] = { cycles:0, totalDays:0, daysCount:0, totalDrop:0, dropCount:0, totalQty:0 };
        binStats[id].cycles++;
        binStats[id].totalQty += parseFloat(h.qty||0);
        const dib = parseInt(h.days_in_bin)||0;
        if (dib > 0) { binStats[id].totalDays += dib; binStats[id].daysCount++; }
        const em = parseFloat(h.entry_moisture)||0, fm = parseFloat(h.final_moisture)||0;
        if (em > 0 && fm > 0 && em > fm) { binStats[id].totalDrop += (em-fm); binStats[id].dropCount++; }
      });

      const ranked = Object.entries(binStats).map(([id, s]) => ({
        id: parseInt(id),
        label: `BIN-${getBinLabel(parseInt(id))}`,
        cycles: s.cycles,
        avgDays: s.daysCount ? (s.totalDays / s.daysCount) : null,
        avgDrop: s.dropCount ? (s.totalDrop / s.dropCount) : null,
        totalQty: s.totalQty,
      })).sort((a, b) => {
        // Sort: most cycles first, then fastest avg days
        if (b.cycles !== a.cycles) return b.cycles - a.cycles;
        if (a.avgDays !== null && b.avgDays !== null) return a.avgDays - b.avgDays;
        return 0;
      });

      binRankEl.innerHTML = `<div style="display:flex;flex-direction:column;gap:5px;">
        <div style="display:grid;grid-template-columns:40px 1fr 48px 56px 56px;gap:6px;padding:3px 10px;font-size:10px;color:var(--ink-5);font-weight:600;text-transform:uppercase;letter-spacing:.04em;">
          <span>#</span><span>Bin</span><span style="text-align:center;">Cycles</span><span style="text-align:center;">Avg Days</span><span style="text-align:right;">Avg Drop</span>
        </div>` +
        ranked.slice(0,10).map((b,i) => {
          const medal = i===0?'🥇':i===1?'🥈':i===2?'🥉':'';
          const perf = b.avgDays !== null && b.avgDays <= 5 ? {col:'#059669',bg:'#ECFDF5'} : b.avgDays !== null && b.avgDays <= 8 ? {col:'#D97706',bg:'#FFFBEB'} : {col:'#6B7280',bg:'var(--surface-2)'};
          return `<div style="display:grid;grid-template-columns:40px 1fr 48px 56px 56px;gap:6px;align-items:center;padding:7px 10px;background:${perf.bg};border-radius:var(--radius);">
            <span style="font-size:11px;color:var(--ink-5);">${medal||('#'+(i+1))}</span>
            <span style="font-size:12px;font-weight:700;color:${perf.col};">${b.label}</span>
            <span style="font-size:11px;text-align:center;font-weight:700;color:var(--ink);">${b.cycles}</span>
            <span style="font-size:11px;text-align:center;color:var(--ink-4);">${b.avgDays!==null?b.avgDays.toFixed(1)+'d':'—'}</span>
            <span style="font-size:11px;text-align:right;color:var(--blue);font-weight:600;">${b.avgDrop!==null?b.avgDrop.toFixed(1)+'%':'—'}</span>
          </div>`;
        }).join('') +
        `</div>`;
    }
  }

  // ── E. TRUCK ARRIVAL PATTERN ──────────────────────────────
  const arrivalEl = document.getElementById('faang-arrival');
  if (arrivalEl) {
    if (!intakes.length) {
      arrivalEl.innerHTML = '<div style="color:var(--ink-5);text-align:center;padding:20px;font-size:12px;">No intake data yet</div>';
    } else {
      // Day of week breakdown
      const dowCounts = [0,0,0,0,0,0,0]; // Sun=0 to Sat=6
      const dowKg     = [0,0,0,0,0,0,0];
      const hourCounts = new Array(24).fill(0);
      intakes.forEach(i => {
        const d = new Date(i.dateTS);
        dowCounts[d.getDay()]++;
        dowKg[d.getDay()] += parseFloat(i.qty||0);
        hourCounts[d.getHours()]++;
      });
      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const maxDow = Math.max(...dowCounts, 1);
      const maxHour = Math.max(...hourCounts, 1);

      const dowHTML = `<div style="margin-bottom:20px;">
        <div style="font-size:12px;font-weight:700;color:var(--forest-mid);margin-bottom:10px;letter-spacing:.2px;">Loads by Day of Week</div>
        <div style="display:flex;gap:6px;align-items:flex-end;height:120px;border-bottom:2px solid var(--surface-3);padding-bottom:2px;">
          ${dayNames.map((d,i) => {
            const h = dowCounts[i] > 0 ? Math.max(14, Math.round((dowCounts[i]/maxDow)*96)) : 4;
            const isWeekend = i===0||i===6;
            const barColor = isWeekend ? '#94A3B8' : 'var(--gold)';
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;justify-content:flex-end;">
              ${dowCounts[i] > 0 ? `<span style="font-size:10px;font-weight:700;color:var(--ink-2);">${dowCounts[i]}</span>` : '<span style="font-size:10px;">&nbsp;</span>'}
              <div title="${dowCounts[i]} loads · ${parseInt(dowKg[i]).toLocaleString('en-IN')} Kg"
                   style="width:100%;height:${h}px;background:${barColor};border-radius:4px 4px 0 0;"></div>
              <span style="font-size:10px;font-weight:600;color:var(--ink-3);margin-top:5px;">${d}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

      // Peak arrival hours (group into 4-hour blocks for readability)
      const blocks = ['12am','4am','8am','12pm','4pm','8pm'];
      const blockCounts = [0,0,0,0,0,0];
      hourCounts.forEach((c,h) => { blockCounts[Math.floor(h/4)] += c; });
      const maxBlock = Math.max(...blockCounts, 1);
      const peakBlockIdx = blockCounts.indexOf(Math.max(...blockCounts));

      const hourHTML = `<div>
        <div style="font-size:12px;font-weight:700;color:var(--forest-mid);margin-bottom:10px;">Peak Arrival Hours · <span style="color:var(--gold-dark);">${blocks[peakBlockIdx]}–${blocks[(peakBlockIdx+1)%6]||'12am'}</span></div>
        <div style="display:flex;gap:6px;align-items:flex-end;height:96px;border-bottom:2px solid var(--surface-3);padding-bottom:2px;">
          ${blocks.map((lbl,i) => {
            const h = blockCounts[i] > 0 ? Math.max(12, Math.round((blockCounts[i]/maxBlock)*76)) : 4;
            const isPeak = i === peakBlockIdx;
            return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;justify-content:flex-end;">
              ${blockCounts[i] > 0 ? `<span style="font-size:10px;font-weight:700;color:${isPeak?'var(--blue)':'var(--ink-3)'};">${blockCounts[i]}</span>` : '<span style="font-size:10px;">&nbsp;</span>'}
              <div title="${blockCounts[i]} loads"
                   style="width:100%;height:${h}px;background:${isPeak?'var(--blue)':'#BFDBFE'};border-radius:4px 4px 0 0;"></div>
              <span style="font-size:10px;font-weight:600;color:var(--ink-3);margin-top:5px;">${lbl}</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

      arrivalEl.innerHTML = dowHTML + hourHTML;
    }
  }

  // ── 7. YIELD RECONCILIATION ───────────────────────────────────
  const yieldEl = document.getElementById('adv-yield-recon');
  if (yieldEl) {
    // Build per-hybrid intake totals
    const intakeByH = {};
    intakes.forEach(i => {
      const k = (i.hybrid || 'Unknown').trim();
      intakeByH[k] = (intakeByH[k] || 0) + parseFloat(i.qty || 0);
    });
    // Build per-hybrid dispatch totals
    const dispByH = {};
    dispatches.forEach(d => {
      const k = (d.hybrid || 'Unknown').trim();
      dispByH[k] = (dispByH[k] || 0) + parseFloat(d.qty || 0);
    });
    const allKeys = [...new Set([...Object.keys(intakeByH), ...Object.keys(dispByH)])].sort();
    if (!allKeys.length) {
      yieldEl.innerHTML = emptyMsg('No data yet for reconciliation');
    } else {
      // Totals row
      const totIn  = allKeys.reduce((s,k) => s + (intakeByH[k]||0), 0);
      const totDis = allKeys.reduce((s,k) => s + (dispByH[k]||0), 0);
      const totPen = Math.max(0, totIn - totDis);
      const totYld = totIn > 0 ? ((totDis / totIn) * 100).toFixed(1) : '—';
      yieldEl.innerHTML = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead><tr style="background:var(--surface-2);">
          <th style="padding:9px 12px;text-align:left;font-weight:700;color:var(--ink-5);text-transform:uppercase;font-size:10px;letter-spacing:.04em;">Hybrid</th>
          <th style="padding:9px 12px;text-align:right;font-weight:700;color:var(--ink-5);text-transform:uppercase;font-size:10px;">Intake (Kg)</th>
          <th style="padding:9px 12px;text-align:right;font-weight:700;color:var(--ink-5);text-transform:uppercase;font-size:10px;">Dispatched (Kg)</th>
          <th style="padding:9px 12px;text-align:right;font-weight:700;color:var(--ink-5);text-transform:uppercase;font-size:10px;">Pending (Kg)</th>
          <th style="padding:9px 12px;text-align:right;font-weight:700;color:var(--ink-5);text-transform:uppercase;font-size:10px;">Yield %</th>
        </tr></thead><tbody>` +
        allKeys.map((key, i) => {
          const intake     = intakeByH[key] || 0;
          const dispatched = dispByH[key]   || 0;
          const pending    = Math.max(0, intake - dispatched);
          const yieldNum   = intake > 0 ? (dispatched / intake) * 100 : null;
          const yieldStr   = yieldNum !== null ? yieldNum.toFixed(1) + '%' : '—';
          const yieldCol   = yieldNum === null ? 'var(--ink-5)' : yieldNum >= 90 ? '#059669' : yieldNum >= 75 ? '#d97706' : '#dc2626';
          return `<tr style="border-bottom:1px solid var(--surface-3);">
            <td style="padding:8px 12px;font-weight:700;color:var(--ink);">${esc(key)}</td>
            <td style="padding:8px 12px;text-align:right;font-family:'DM Mono',monospace;color:var(--gold-dark);">${parseInt(intake).toLocaleString('en-IN')}</td>
            <td style="padding:8px 12px;text-align:right;font-family:'DM Mono',monospace;color:#059669;">${parseInt(dispatched).toLocaleString('en-IN')}</td>
            <td style="padding:8px 12px;text-align:right;font-family:'DM Mono',monospace;color:${pending>0?'#d97706':'var(--ink-5)'};">${parseInt(pending).toLocaleString('en-IN')}</td>
            <td style="padding:8px 12px;text-align:right;font-weight:800;font-size:13px;color:${yieldCol};">${yieldStr}</td>
          </tr>`;
        }).join('') +
        `<tr style="background:var(--surface-2);border-top:2px solid var(--surface-4);">
          <td style="padding:9px 12px;font-weight:800;color:var(--ink);">TOTAL</td>
          <td style="padding:9px 12px;text-align:right;font-family:'DM Mono',monospace;font-weight:800;color:var(--gold-dark);">${parseInt(totIn).toLocaleString('en-IN')}</td>
          <td style="padding:9px 12px;text-align:right;font-family:'DM Mono',monospace;font-weight:800;color:#059669;">${parseInt(totDis).toLocaleString('en-IN')}</td>
          <td style="padding:9px 12px;text-align:right;font-family:'DM Mono',monospace;font-weight:800;color:${totPen>0?'#d97706':'var(--ink-5)'};">${parseInt(totPen).toLocaleString('en-IN')}</td>
          <td style="padding:9px 12px;text-align:right;font-weight:800;font-size:14px;color:${totYld!=='—'&&parseFloat(totYld)>=90?'#059669':totYld!=='—'?'#d97706':'var(--ink-5)'};">${totYld}</td>
        </tr>
        </tbody></table></div>`;
    }
  }
}

function renderMaintenancePage() {
  document.getElementById('maintenance-tbody').innerHTML = state.maintenance.length ? state.maintenance.map(m => {
    const imgs = Array.isArray(m.image_urls) ? m.image_urls : [];
    const thumbs = imgs.slice(0, 3).map((url, i) =>
      `<img src="${url}" onclick="openMaintImageViewer(${JSON.stringify(imgs)},${i})"
        style="width:36px;height:36px;object-fit:cover;border-radius:6px;cursor:pointer;border:1.5px solid var(--surface-4);transition:transform .15s;"
        onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform=''"
        onerror="this.style.display='none'">`
    ).join('');
    const extra = imgs.length > 3 ? `<span style="font-size:11px;color:var(--ink-5);align-self:center;">+${imgs.length-3}</span>` : '';
    return `<tr>
      <td class="fs12 text-muted">${new Date(m.date).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'})}</td>
      <td class="fw700">${esc(m.reported_by || '—')}</td>
      <td class="fw700">${esc(m.work_done)}</td>
      <td class="mono">${esc(m.equipment_name)}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${esc(m.issue_description || '—')}</td>
      <td class="mono fs12">${esc(m.checked_by || '—')}</td>
      <td class="fs12 truncate" style="max-width:140px;">${esc(m.items_bought || '—')}</td>
      <td><span class="fw700 text-gold">₹${parseInt(m.cost_amount).toLocaleString('en-IN')}</span></td>
      <td><div style="display:flex;gap:4px;align-items:center;">${thumbs || '<span style="color:var(--ink-5);font-size:11px;">—</span>'}${extra}</div></td>
    </tr>`;
  }).join('')
    : `<tr><td colspan="9"><div class="empty-state"><div class="empty-icon">🔧</div><div class="empty-title">No Maintenance Logs found</div></div></td></tr>`;
}

function renderLaborPage() {
  // Groups bar
  const groupsBar = document.getElementById('labor-groups-bar');
  if (groupsBar) {
    const groups = window.getLaborGroups ? window.getLaborGroups() : [];
    if (groups.length) {
      groupsBar.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
        <span style="font-size:11px;font-weight:700;color:var(--ink-5);text-transform:uppercase;letter-spacing:.06em;">Groups:</span>
        ${groups.map(g => `<div style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;background:var(--surface-2);border:1px solid var(--surface-4);border-radius:99px;font-size:12px;cursor:pointer;" onclick="editGroup('${g.id}');openGroupsModal()"><span style="font-weight:700;color:var(--ink);">&#128101; ${esc(g.name)}</span><span style="color:var(--ink-5);">${g.members.length}</span></div>`).join('')}
        <button class="btn btn-ghost btn-sm" onclick="openGroupsModal()">+ Add Group</button>
      </div>`;
    } else {
      groupsBar.innerHTML = '';
    }
  }

  // Table
  document.getElementById('labor-tbody').innerHTML = state.labor.length ? state.labor.map(l => `
    <tr>
      <td class="fs12 text-muted">${new Date(l.date).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'})}</td>
      <td class="fw700">${esc(l.role || '—')}</td>
      <td class="mono fs12 text-gold">${esc(l.shift || '—')}</td>
      <td><span class="chip chip-blue mono fw700">${esc(l.headcount)}</span></td>
      <td class="fs12 truncate" style="max-width:200px;" title="${esc(l.people_names || '')}">${esc(l.people_names || '—')}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${esc(l.notes || '—')}</td>
    </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">&#128119;</div><div class="empty-title">No shift logs yet</div><div class="empty-sub">Set up your groups first, then log shifts</div></div></td></tr>`;
}

function renderEntryTrucksPage() {
  // KPIs
  const trucks = state.entryTrucks || [];
  const waiting = trucks.filter(t => t.status === 'waiting');
  const inIntake = trucks.filter(t => t.status === 'intake');
  const completed = trucks.filter(t => t.status === 'completed');
  const totalNet = trucks.reduce((s, t) => s + (t.netWeight || 0), 0);

  const kpis = document.getElementById('truck-kpis');
  if (kpis) kpis.innerHTML = `
    <div class="kpi-card kpi-gold"><div class="kpi-icon">🚛</div><div class="kpi-val">${trucks.length}</div><div class="kpi-label">Total Trucks</div></div>
    <div class="kpi-card kpi-amber"><div class="kpi-icon">⏳</div><div class="kpi-val">${waiting.length}</div><div class="kpi-label">Waiting</div></div>
    <div class="kpi-card kpi-green"><div class="kpi-icon">✅</div><div class="kpi-val">${inIntake.length}</div><div class="kpi-label">In Intake</div></div>
    <div class="kpi-card kpi-blue"><div class="kpi-icon">⚖️</div><div class="kpi-val">${(totalNet/1000).toFixed(1)}T</div><div class="kpi-label">Total Net Weight</div></div>
  `;

  // Active filter
  const activeFilter = document.querySelector('#truck-filter-tabs [data-filter].btn-solid');
  const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
  const filtered = filter === 'all' ? trucks : trucks.filter(t => t.status === filter);

  const grid = document.getElementById('truck-cards-grid');
  if (!grid) return;

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">🚛</div><div class="empty-title">No trucks ${filter !== 'all' ? `with status "${filter}"` : 'registered yet'}</div><div class="empty-sub">Click "Register Truck" to add a truck when one arrives at the facility</div></div>`;
    return;
  }

  const statusColors = { waiting: 'amber', intake: 'green', completed: 'gray', dispatching: 'blue' };
  const statusLabels = { waiting: '⏳ Waiting', intake: '✅ In Intake', completed: '☑️ Completed', dispatching: '🚚 Dispatching' };

  grid.innerHTML = filtered.map(t => {
    const color = statusColors[t.status] || 'gray';
    const label = statusLabels[t.status] || t.status;
    const netDisplay = t.netWeight > 0 ? `${t.netWeight.toLocaleString('en-IN')} Kg` : '—';
    const grossDisplay = t.grossWeight > 0 ? `${t.grossWeight.toLocaleString('en-IN')} Kg` : '—';
    const tareDisplay = t.tareWeight > 0 ? `${t.tareWeight.toLocaleString('en-IN')} Kg` : '—';

    return `<div style="background:var(--surface);border:1.5px solid var(--surface-4);border-radius:var(--radius-lg);padding:18px;box-shadow:var(--shadow-xs);transition:all var(--transition);" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow)'" onmouseleave="this.style.transform='';this.style.boxShadow='var(--shadow-xs)'">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div style="font-family:'DM Mono',monospace;font-size:16px;font-weight:700;color:var(--ink);letter-spacing:.5px;">${t.vehicleNo}</div>
        <span class="chip chip-${color}">${label}</span>
      </div>
      ${t.company ? `<div style="font-size:12px;font-weight:600;color:var(--ink-3);margin-bottom:4px;">🏭 ${t.company}</div>` : ''}
      ${t.fromLocation ? `<div style="font-size:11px;color:var(--ink-5);margin-bottom:8px;">📍 ${t.fromLocation}</div>` : ''}
      ${t.driverName ? `<div style="font-size:12px;color:var(--ink-4);margin-bottom:4px;">👤 ${t.driverName}${t.driverPhone ? ` · ${t.driverPhone}` : ''}</div>` : ''}
      <div style="margin:12px 0;padding:10px;background:var(--gold-pale);border:1px solid var(--gold-border);border-radius:var(--radius);">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center;">
          <div><div style="font-size:9px;font-weight:700;letter-spacing:.8px;color:var(--ink-5);text-transform:uppercase;">Gross</div><div style="font-size:12px;font-weight:600;color:var(--ink);font-family:'DM Mono',monospace;">${grossDisplay}</div></div>
          <div><div style="font-size:9px;font-weight:700;letter-spacing:.8px;color:var(--ink-5);text-transform:uppercase;">Tare</div><div style="font-size:12px;font-weight:600;color:var(--ink);font-family:'DM Mono',monospace;">${tareDisplay}</div></div>
          <div><div style="font-size:9px;font-weight:700;letter-spacing:.8px;color:var(--gold-dark);text-transform:uppercase;">Net ✓</div><div style="font-size:14px;font-weight:800;color:var(--gold-dark);font-family:'DM Mono',monospace;">${netDisplay}</div></div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--ink-5);margin-bottom:12px;">🕐 Arrived: ${t.arrivalDisplay}</div>
      ${t.notes ? `<div style="font-size:11px;color:var(--ink-4);margin-bottom:10px;padding:6px 8px;background:var(--surface-2);border-radius:var(--radius-sm);">📝 ${t.notes}</div>` : ''}
      <div style="display:flex;gap:6px;margin-top:4px;">
        ${t.status === 'waiting' ? `<button class="btn btn-sm btn-gold" onclick="markTruckIntake('${t.id}')" style="flex:1;">Assign to Intake</button>` : ''}
        ${t.status === 'intake' ? `<button class="btn btn-sm btn-ghost" onclick="markTruckCompleted('${t.id}')" style="flex:1;">Mark Completed</button>` : ''}
        <button class="btn btn-sm btn-ghost" onclick="editTruck('${t.id}')">Edit</button>
      </div>
    </div>`;
  }).join('');
}

function renderBackyardPage() {
  const removals = state.backyardRemovals || [];

  // KPIs
  const totalKg = removals.reduce((s, r) => s + r.qtyRemoved, 0);
  const totalBags = removals.reduce((s, r) => s + r.bagsRemoved, 0);
  const kpis = document.getElementById('backyard-kpis');
  if (kpis) kpis.innerHTML = `
    <div class="kpi-card kpi-red"><div class="kpi-icon">⚖️</div><div class="kpi-val">${totalKg.toLocaleString('en-IN')}</div><div class="kpi-label">Total Kg Removed</div></div>
    <div class="kpi-card kpi-amber"><div class="kpi-icon">🗑️</div><div class="kpi-val">${totalBags}</div><div class="kpi-label">Bags Removed</div></div>
    <div class="kpi-card kpi-blue"><div class="kpi-icon">📋</div><div class="kpi-val">${removals.length}</div><div class="kpi-label">Total Records</div></div>
  `;

  const tbody = document.getElementById('backyard-tbody');
  if (!tbody) return;

  if (!removals.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-state" style="text-align:center;padding:40px;color:var(--ink-5);">No stock removals recorded yet</td></tr>`;
    return;
  }

  const reasonLabels = { damaged:'Damaged', quality:'Quality Issues', pest:'Pest/Infestation', excess:'Excess', moisture:'High Moisture', other:'Other' };
  const reasonColors = { damaged:'chip-red', quality:'chip-amber', pest:'chip-red', excess:'chip-gray', moisture:'chip-blue', other:'chip-gray' };

  tbody.innerHTML = removals.map(r => {
    const intake = r.intakeId ? (state.intakes.find(i => i.id === r.intakeId) || null) : null;
    const bin = r.binId ? (state.bins.find(b => b.id === r.binId) || null) : null;
    return `<tr>
      <td class="text-muted fs12">${r.removedAtDisplay}</td>
      <td>${intake ? `<span class="mono fw700 text-gold">${intake.challan}</span>` : r.intakeId ? `<span class="mono fs12">${r.intakeId.slice(0,8)}…</span>` : '<span class="text-muted">—</span>'}</td>
      <td>${bin ? `<span class="chip chip-blue">BIN-${bin.binLabel || bin.id}</span>` : '<span class="text-muted">—</span>'}</td>
      <td class="fw700">${r.hybrid || '—'}</td>
      <td class="mono fs12">${r.vehicleNo || '—'}</td>
      <td><span class="fw700 text-red">${r.qtyRemoved.toLocaleString('en-IN')} Kg</span></td>
      <td class="mono">${r.bagsRemoved || '—'}</td>
      <td><span class="chip ${reasonColors[r.reason] || 'chip-gray'}">${reasonLabels[r.reason] || r.reason}</span></td>
      <td>${r.removedBy || '—'}</td>
      <td style="max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink-4);">${r.notes || '—'}</td>
    </tr>`;
  }).join('');
}

// Predictable state management subscription
if (window.Store) {
  window.Store.subscribe((newState) => {
    if (newState.currentPage) {
       // Disable re-rendering if user is in an active form to prevent jumping or lost inputs
       // For a simple app, we can just call renderPage. If issues arise, we can check focus.
       renderPage(newState.currentPage);
    }
  });
}
