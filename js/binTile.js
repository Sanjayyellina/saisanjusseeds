// ============================================================
// RENDER BIN TILE
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// RENDER BIN TILE
// ================================================================
function renderBinTile(bin, isManager = false){
  const sc=`s-${bin.status}`;
  const dc=`dot-${bin.status}`;
  const days=dateDiff(bin.intakeDateTS);
  const hours=hoursDiff(bin.intakeDateTS);
  const TARGET_HRS=109;
  const hoursPct=Math.min(100,Math.round((hours/TARGET_HRS)*100));
  const hoursColor=hours>=TARGET_HRS?'var(--red)':hours>=TARGET_HRS*0.8?'var(--amber)':'var(--green)';
  const clickAction = isManager ? `onclick="openBinModal(${bin.id})"` : '';
  
  const lbl = bin.binLabel || bin.id;
  if(bin.status==='empty'){
    return`<div class="bin-tile ${sc}" ${clickAction}>
      <div class="bin-tile-top"><span class="bin-num-label">BIN-${lbl}</span><div class="status-dot ${dc}"></div></div>
      <div class="bin-empty-label">${t('bins.status.empty')}</div>
    </div>`;
  }
  const m=bin.currentMoisture||0;
  return`<div class="bin-tile ${sc}" ${clickAction}>
    <div class="bin-tile-top"><span class="bin-num-label">BIN-${lbl}</span><div class="status-dot ${dc}"></div></div>
    <div class="bin-hybrid-name" title="${bin.hybrid}">${bin.hybrid}</div>
    <div class="bin-meta-row">${bin.qty} Kg${bin.pkts?' · '+bin.pkts+' '+t('dash.bags'):''}${days?' · '+t('bins.day')+' '+days:''}</div>
    <div class="bin-hours-row" style="display:flex;align-items:center;gap:6px;margin:4px 0 2px;">
      <span style="font-size:11px;opacity:0.6;white-space:nowrap;">⏱ Hrs in bin</span>
      <span style="font-size:13px;font-weight:700;font-family:'DM Mono',monospace;color:${hoursColor};">${hours}h</span>
      <span style="font-size:10px;opacity:0.45;">/ ${TARGET_HRS}h</span>
    </div>
    <div style="height:3px;border-radius:2px;background:rgba(255,255,255,0.1);overflow:hidden;margin-bottom:4px;">
      <div style="height:100%;width:${hoursPct}%;background:${hoursColor};border-radius:2px;transition:width 0.4s;"></div>
    </div>
    <div class="moisture-track"><div class="moisture-bar" style="width:${getMoisturePct(m)}%;background:${getMoistureBarColor(m)};"></div></div>
    <div class="moisture-row"><span class="m-current" style="color:${getMoistureColor(m)};font-family:'DM Mono',monospace;">${m.toFixed(1)}%</span><span class="m-target">→10%</span></div>
    <span class="air-tag ${bin.airflow==='up'?'air-up':'air-down'}">${bin.airflow==='up'?t('bins.airflow.up'):t('bins.airflow.down')}</span>
  </div>`;
}

