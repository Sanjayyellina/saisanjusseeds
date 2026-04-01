// ============================================================
// RENDER BIN TILE
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

function renderBinTile(bin, isManager = false){
  const sc = `s-${bin.status}`;
  const lbl = bin.binLabel || bin.id;
  const clickAction = isManager ? `onclick="openBinModal(${bin.id})"` : '';

  if (bin.status === 'empty') {
    return `<div class="bin-tile ${sc}" ${clickAction}>
      <div class="bin-tile-top">
        <span class="bin-num-label">BIN-${lbl}</span>
        <div class="status-dot dot-empty"></div>
      </div>
      <div class="bin-empty-label">Available</div>
    </div>`;
  }

  const m = bin.currentMoisture || 0;
  const hours = hoursDiff(bin.intakeDateTS);
  const days = dateDiff(bin.intakeDateTS);
  const hoursPct = Math.min(100, Math.round((hours / Config.TARGET_HRS) * 100));
  const hoursColor = hours >= Config.TARGET_HRS ? 'var(--red)' : hours >= Config.TARGET_HRS * 0.8 ? 'var(--amber)' : 'var(--leaf)';

  // SVG circular gauge (stroke-dashoffset to start arc at top)
  const RADIUS = 26;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const moisturePct = Math.min(100, Math.max(2, (m / 42) * 100));
  const dashFill = (moisturePct / 100) * CIRCUM;
  const dashOffset = CIRCUM * 0.25; // start at top (quarter turn)
  const gaugeColor = m > Config.MOISTURE_HIGH ? '#3B82F6' : m > Config.MOISTURE_MID ? '#34D399' : '#16A34A';

  const gaugeSvg = `<svg width="68" height="68" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${RADIUS}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="5"/>
    <circle cx="32" cy="32" r="${RADIUS}" fill="none" stroke="${gaugeColor}" stroke-width="5.5"
      stroke-dasharray="${dashFill.toFixed(1)} ${CIRCUM.toFixed(1)}"
      stroke-dashoffset="${dashOffset.toFixed(1)}"
      stroke-linecap="round"/>
    <text x="32" y="30" text-anchor="middle" dominant-baseline="middle"
      font-size="11" font-weight="800" fill="${gaugeColor}"
      font-family="DM Mono,monospace">${m.toFixed(1)}%</text>
    <text x="32" y="41" text-anchor="middle" dominant-baseline="middle"
      font-size="7.5" fill="rgba(15,25,35,0.4)"
      font-family="DM Sans,sans-serif">&#x2192;10%</text>
  </svg>`;

  const statusDotClass = `dot-${bin.status}`;

  return `<div class="bin-tile ${sc}" ${clickAction}>
    <div class="bin-tile-top">
      <span class="bin-num-label">BIN-${lbl}</span>
      <div class="status-dot ${statusDotClass}"></div>
    </div>
    <div class="bin-body">
      <div class="bin-gauge-wrap">${gaugeSvg}</div>
      <div class="bin-info">
        <div class="bin-hybrid-name" title="${bin.hybrid}">${bin.hybrid}</div>
        <div class="bin-meta-row">${(bin.qty||0).toLocaleString('en-IN')} Kg${bin.pkts ? ' &middot; ' + bin.pkts.toLocaleString('en-IN') + ' Bags' : ''}${days ? ' &middot; Day ' + days : ''}</div>
        <div class="bin-hours-wrap">
          <div class="bin-hours-label">
            <span style="font-size:10px;font-weight:600;color:var(--ink-3);">&#x23F1; In bin</span>
            <span class="bin-hours-val" style="color:${hoursColor};">${hours}h <span class="bin-hours-total">/ ${Config.TARGET_HRS}h</span></span>
          </div>
          <div class="bin-hours-track">
            <div class="bin-hours-fill" style="width:${hoursPct}%;background:${hoursColor};"></div>
          </div>
        </div>
        <span class="air-tag ${bin.airflow === 'up' ? 'air-up' : 'air-down'}">${bin.airflow === 'up' ? '&#x2191; Top' : '&#x2193; Bottom'}</span>
      </div>
    </div>
  </div>`;
}
