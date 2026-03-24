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
  const clickAction = isManager ? `onclick="openBinModal(${bin.id})"` : '';
  
  if(bin.status==='empty'){
    return`<div class="bin-tile ${sc}" ${clickAction}>
      <div class="bin-tile-top"><span class="bin-num-label">BIN-${bin.id}</span><div class="status-dot ${dc}"></div></div>
      <div class="bin-empty-label">${t('bins.status.empty')}</div>
    </div>`;
  }
  const m=bin.currentMoisture||0;
  return`<div class="bin-tile ${sc}" ${clickAction}>
    <div class="bin-tile-top"><span class="bin-num-label">BIN-${bin.id}</span><div class="status-dot ${dc}"></div></div>
    <div class="bin-hybrid-name" title="${bin.hybrid}">${bin.hybrid}</div>
    <div class="bin-meta-row">${bin.qty}T${bin.pkts?' · '+bin.pkts+' '+t('dash.bags'):''}${days?' · '+t('bins.day')+' '+days:''}</div>
    <div class="moisture-track"><div class="moisture-bar" style="width:${getMoisturePct(m)}%;background:${getMoistureBarColor(m)};"></div></div>
    <div class="moisture-row"><span class="m-current" style="color:${getMoistureColor(m)};font-family:'DM Mono',monospace;">${m.toFixed(1)}%</span><span class="m-target">→9–11%</span></div>
    <span class="air-tag ${bin.airflow==='up'?'air-up':'air-down'}">${bin.airflow==='up'?t('bins.airflow.up'):t('bins.airflow.down')}</span>
  </div>`;
}

