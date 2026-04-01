// ============================================================
// RENDER PAGES
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// RENDER PAGES
// ================================================================
function renderPage(name){
  const map={dashboard:renderDashboard,intake:renderIntakePage,bins:renderBinsPage,
    moisture:null,dispatch:renderDispatchPage,receipts:renderReceiptsPage,
    analytics:renderAnalytics, manager: renderManagerPage, maintenance: renderMaintenancePage, labor: renderLaborPage};
  if(map[name])map[name]();
}

function renderDashboard(){
  document.getElementById('dash-date').textContent=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const active=state.bins.filter(b=>b.status!=='empty');
  const drying=state.bins.filter(b=>b.status==='drying'||b.status==='intake');
  const totalQty=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  const avgM=active.length?(active.reduce((s,b)=>s+(b.currentMoisture||0),0)/active.length).toFixed(1):'—';

  document.getElementById('kpi-intake').textContent=totalQty.toFixed(1);
  document.getElementById('kpi-drying').textContent=drying.length;
  document.getElementById('kpi-dispatched').textContent=state.dispatches.length;
  document.getElementById('kpi-moisture').textContent=avgM+(avgM!=='—'?'%':'');
  const md=avgM!=='—'?parseFloat(avgM):null;
  if(md){
    const dm=document.getElementById('kpi-moisture-d');
    dm.textContent=md<15?t('dash.onTarget'):md<25?t('dash.progressing'):t('dash.high');
    dm.className='kpi-delta '+(md<15?'delta-up':md<25?'delta-flat':'delta-down');
  }

  document.getElementById('dash-bins').innerHTML=state.bins.map(b=>renderBinTile(b)).join('');

  const recent=[...state.intakes].reverse().slice(0,6);
  document.getElementById('recent-tbody').innerHTML=recent.length?recent.map(i=>{
    const binIds=(i.bins&&i.bins.length?i.bins:[i.bin]).filter(Boolean);
    const binStatus=binIds.length?((state.bins.find(b=>b.id===binIds[0])||{}).status||'drying'):'drying';
    const effectiveStatus=binStatus==='intake'?'drying':binStatus;
    const statusChipClass={drying:'chip-amber',shelling:'chip-purple',empty:'chip-grey'}[effectiveStatus]||'chip-amber';
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
      <td><span class="mono fs12 text-gold">${d.receiptId}</span></td>
      <td class="fw700">${d.party}</td>
      <td class="mono">${d.bags}</td>
      <td class="fw700 text-green">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
    </tr>`).join('')
    :`<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">${t('dash.noDispatches')}</div></div></td></tr>`;
}

function renderIntakePage(){
  const total=state.intakes.reduce((s,i)=>s+parseFloat(i.qty||0),0);
  document.getElementById('intake-total-weight').textContent=total.toFixed(2);
  document.getElementById('intake-full-tbody').innerHTML=state.intakes.length?state.intakes.map((i,idx)=>{
    const binIds=(i.bins&&i.bins.length?i.bins:[i.bin]).filter(Boolean);
    const binStatus=binIds.length?((state.bins.find(b=>b.id===binIds[0])||{}).status||'drying'):'drying';
    const effectiveStatus=binStatus==='intake'?'drying':binStatus;
    const statusChipClass={drying:'chip-amber',shelling:'chip-purple',empty:'chip-grey'}[effectiveStatus]||'chip-amber';
    const statusLabel=effectiveStatus.charAt(0).toUpperCase()+effectiveStatus.slice(1);
    return`<tr>
      <td class="mono text-muted fs12">${idx+1}</td>
      <td class="fs12 text-muted">${i.date}</td>
      <td><span class="mono fw700 text-gold">${i.challan}</span></td>
      <td class="mono">${i.vehicle}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${i.location||'—'}</td>
      <td class="fw700">${i.hybrid}</td>
      <td class="mono fs12 text-muted">${i.lot||'—'}</td>
      <td><span class="fw700 text-gold">${i.qty} Kg</span></td>
      <td class="mono fs12">${i.vehicleWeight||'—'}</td>
      <td class="mono fs12">${i.grossWeight||'—'}</td>
      <td class="mono fw700" style="color:var(--blue);">${i.netWeight||'—'}</td>
      <td><span class="mono fw700" style="color:${getMoistureColor(i.entryMoisture)};">${i.entryMoisture}%</span></td>
      <td>${binIds.map(b=>`<span class="chip chip-blue">BIN-${getBinLabel(b)}</span>`).join(' ')||'—'}</td>
      <td><span class="chip ${statusChipClass}">${statusLabel}</span></td>
      <td style="white-space:nowrap;">
        <button class="btn btn-ghost btn-sm" onclick="openEditIntakeModal('${i.id}')" title="Edit">✏️</button>${i.bin?` <button class="btn btn-ghost btn-sm" onclick="openBinModal(${i.bin})">${t('actions.view')} Bin</button>`:''}
      </td>
    </tr>`;}).join('')
    :`<tr><td colspan="15"><div class="empty-state"><div class="empty-icon">🚛</div><div class="empty-title">${t('dash.noIntakes')}</div><div class="empty-sub">Start by logging a new truck intake above</div></div></td></tr>`;
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
        <div class="m-hybrid">${bin.hybrid}</div>
        <div class="m-meta">${bin.qty} Kg · ${t('bins.entry')}: <span class="mono fw700">${bin.entryMoisture}%</span> · ${t('bins.status.intake')}: ${bin.intakeDate?bin.intakeDate.split(',')[0]:''} · ${t('bins.day')} ${dateDiff(bin.intakeDateTS)}</div>
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
      <td class="fs12 text-muted">${i.date}</td>
      <td><span class="mono fw700 text-gold">${i.challan}</span></td>
      <td class="mono">${i.vehicle}</td>
      <td class="fw700">${i.hybrid}</td>
      <td><span class="fw700 text-gold">${i.qty} Kg</span></td>
      <td>${(i.bins&&i.bins.length?i.bins:[i.bin]).filter(Boolean).map(b=>'<span class="chip chip-blue">BIN-'+getBinLabel(b)+'</span>').join(' ')||'—'}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="openEditIntakeModal('${i.id}')" title="Edit Intake">✏️ Edit</button></td>
    </tr>`).join('');
  } else {
    html += `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🚛</div><div class="empty-title">No intakes yet</div></div></td></tr>`;
  }
  html += `</tbody></table></div></div>`;

  document.getElementById('manager-content-area').innerHTML = html;
}

function renderDispatchPage(){
  document.getElementById('dispatch-full-tbody').innerHTML=state.dispatches.length?[...state.dispatches].reverse().map(d=>`
    <tr>
      <td><span class="mono text-gold fw700 fs12">${d.receiptId}</span></td>
      <td class="fs12 text-muted">${d.date}</td>
      <td class="fw700">${d.party}</td>
      <td class="truncate" style="max-width:160px;">${d.hybrid}</td>
      <td class="mono">${d.bags}</td>
      <td class="mono fw700">${parseInt(d.qty).toLocaleString('en-IN')} Kg</td>
      <td><span class="mono" style="color:var(--green);font-weight:700;">${d.moisture||'—'}%</span></td>
      <td class="fw700 text-green">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
      <td class="mono fs12">${d.vehicle}</td>
      <td><span class="chip chip-green">✓ ${t('actions.view') || 'Signed'}</span></td>
      <td><button class="btn btn-ghost btn-sm" onclick="viewReceipt('${d.receiptId}')">${t('actions.view')}</button></td>
    </tr>`).join('')
    :`<tr><td colspan="11"><div class="empty-state"><div class="empty-icon">📦</div><div class="empty-title">${t('dash.noDispatches')}</div><div class="empty-sub">Create a dispatch to generate a signed receipt</div></div></td></tr>`;
}

function renderReceiptsPage(){
  document.getElementById('receipts-grid').innerHTML=state.dispatches.length?[...state.dispatches].reverse().map(d=>`
    <div onclick="viewReceipt('${d.receiptId}')" style="background:var(--surface);border:1px solid var(--surface-4);border-radius:var(--radius-lg);padding:20px;cursor:pointer;transition:all var(--transition);box-shadow:var(--shadow-xs);" onmouseover="this.style.boxShadow='var(--shadow)';this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='var(--shadow-xs)';this.style.transform=''">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <span class="mono fw700 text-gold fs12">${d.receiptId}</span>
        <span class="chip chip-green">${t('receipts.verified')}</span>
      </div>
      <div class="fw700" style="margin-bottom:4px;">${d.party}</div>
      <div class="fs12 text-muted">${d.hybrid}</div>
      <div class="fs12 text-muted" style="margin-top:2px;">${d.bags} ${t('dash.bags')} · ${parseInt(d.qty).toLocaleString('en-IN')} Kg · ${d.date}</div>
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
    return(active.reduce((s,b)=>s+Math.floor((Date.now()-new Date(b.intakeDateTS).getTime())/86400000),0)/active.length).toFixed(1);
  })();
  const avgMoistureDrop=(()=>{
    const active=state.bins.filter(b=>b.status!=='empty'&&b.entryMoisture&&b.currentMoisture);
    if(!active.length)return 0;
    return(active.reduce((s,b)=>s+(b.entryMoisture-b.currentMoisture),0)/active.length).toFixed(1);
  })();

  document.getElementById('a-total').textContent=total.toFixed(1);
  document.getElementById('a-disp').textContent=state.dispatches.length;

  // ── Update KPI cards with real data ──
  const akpis=document.getElementById('analytics-kpis');
  if(akpis){
    const cards=akpis.querySelectorAll('.kpi-val');
    if(cards[2])cards[2].textContent=avgMoistureDrop+'%';
    if(cards[3])cards[3].textContent=avgDryDays+'d';
  }

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
      const days=Math.floor((Date.now()-new Date(b.intakeDateTS).getTime())/86400000);
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
  const binGroups={empty:0,intake:0,drying:0,shelling:0};
  state.bins.forEach(b=>binGroups[b.status]=(binGroups[b.status]||0)+1);
  const used=20-binGroups.empty;
  const pct=Math.round((used/20)*100);
  const totalQtyInBins=state.bins.filter(b=>b.status!=='empty').reduce((s,b)=>s+parseFloat(b.qty||0),0);
  document.getElementById('bin-util-chart').innerHTML=`
    <div style="font-family:'Playfair Display',serif;font-size:52px;font-weight:800;color:var(--ink);line-height:1;">${used}<span style="font-size:24px;color:var(--ink-5);">/20</span></div>
    <div class="text-muted fs12" style="margin:4px 0 8px;">Bins Active · ${parseInt(totalQtyInBins).toLocaleString('en-IN')} Kg total</div>
    <div style="height:8px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin-bottom:10px;">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--gold),var(--gold-dark));border-radius:99px;transition:width .6s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--ink-5);margin-bottom:10px;">
      <span>${used} Active</span><span>${pct}%</span><span>${20-binGroups.empty===0?20:binGroups.empty} Free</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:5px;">
      ${Object.entries({'🟡 Intake':binGroups.intake,'🟠 Drying':binGroups.drying,'🟣 Shelling':binGroups.shelling}).map(([lbl,cnt])=>cnt>0?`
        <div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 8px;background:var(--surface-2);border-radius:6px;">
          <span>${lbl}</span><span class="fw700 mono">${cnt} bin${cnt!==1?'s':''}</span>
        </div>`:'').join('')}
    </div>`;
}

function renderMaintenancePage() {
  document.getElementById('maintenance-tbody').innerHTML = state.maintenance.length ? state.maintenance.map(m => `
    <tr>
      <td class="fs12 text-muted">${new Date(m.date).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'})}</td>
      <td class="fw700">${m.reported_by || '—'}</td>
      <td class="fw700">${m.work_done}</td>
      <td class="mono">${m.equipment_name}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${m.issue_description || '—'}</td>
      <td class="mono fs12">${m.checked_by || '—'}</td>
      <td class="fs12 truncate" style="max-width:140px;">${m.items_bought || '—'}</td>
      <td><span class="fw700 text-gold">₹${parseInt(m.cost_amount).toLocaleString('en-IN')}</span></td>
    </tr>`).join('')
    : `<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🔧</div><div class="empty-title">No Maintenance Logs found</div></div></td></tr>`;
}

function renderLaborPage() {
  document.getElementById('labor-tbody').innerHTML = state.labor.length ? state.labor.map(l => `
    <tr>
      <td class="fs12 text-muted">${new Date(l.date).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'})}</td>
      <td class="mono fs12 text-gold">${l.shift}</td>
      <td class="fw700">${l.role}</td>
      <td><span class="mono fw700 text-gold">${l.headcount}</span></td>
      <td class="fs12 truncate" style="max-width:200px;" title="${l.people_names || ''}">${l.people_names || '—'}</td>
      <td class="fs12 text-muted truncate" style="max-width:140px;">${l.notes || '—'}</td>
    </tr>`).join('')
    : `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">👷</div><div class="empty-title">No Labor Logs found</div></div></td></tr>`;
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
