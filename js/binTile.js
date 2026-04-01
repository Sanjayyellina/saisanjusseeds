// ============================================================
// RENDER BIN TILE  —  Premium card design
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

function renderBinTile(bin, isManager = false){
  const sc = `s-${bin.status}`;
  const lbl = bin.binLabel || bin.id;
  const clickAction = isManager ? `onclick="openBinModal(${bin.id})"` : '';

  if (bin.status === 'empty') {
    return `<div class="bin-tile ${sc}" ${clickAction}>
      <div class="bin-tile-head">
        <span class="bin-num-label">BIN-${lbl}</span>
        <span class="bin-status-badge bst-empty">Empty</span>
      </div>
      <div class="bin-empty-body">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.13)" stroke-width="1.4">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M12 8v8M8 12h8"/>
        </svg>
        <div class="bin-empty-label">Available</div>
      </div>
    </div>`;
  }

  const m = bin.currentMoisture || 0;
  const hours = hoursDiff(bin.intakeDateTS);
  const days = dateDiff(bin.intakeDateTS);
  const intakeDateFmt = bin.intakeDateTS
    ? new Date(+bin.intakeDateTS).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'2-digit'})
    : null;
  const hoursPct = Math.min(100, Math.round((hours / Config.TARGET_HRS) * 100));
  const hoursColor = hours >= Config.TARGET_HRS ? 'var(--red)' : hours >= Config.TARGET_HRS * 0.8 ? 'var(--amber)' : 'var(--leaf)';

  const RADIUS = 28;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const moisturePct = Math.min(100, Math.max(2, (m / 42) * 100));
  const dashFill = (moisturePct / 100) * CIRCUM;
  const dashOffset = CIRCUM * 0.25;
  const gaugeColor = m > Config.MOISTURE_HIGH ? '#3B82F6' : m > Config.MOISTURE_MID ? '#F59E0B' : '#16A34A';

  const gaugeSvg = `<svg width="108" height="108" viewBox="0 0 72 72">
    <circle cx="36" cy="36" r="${RADIUS}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="5.5"/>
    <circle cx="36" cy="36" r="${RADIUS}" fill="none" stroke="${gaugeColor}" stroke-width="6"
      stroke-dasharray="${dashFill.toFixed(1)} ${CIRCUM.toFixed(1)}"
      stroke-dashoffset="${dashOffset.toFixed(1)}"
      stroke-linecap="round"/>
    <text x="36" y="33" text-anchor="middle" dominant-baseline="middle"
      font-size="13" font-weight="800" fill="${gaugeColor}"
      font-family="DM Mono,monospace">${m.toFixed(1)}%</text>
    <text x="36" y="46" text-anchor="middle" dominant-baseline="middle"
      font-size="8" fill="rgba(15,25,35,0.35)"
      font-family="DM Sans,sans-serif">&#x2192; ${Config.TARGET_MOISTURE}%</text>
  </svg>`;

  const statusLabel = bin.status.charAt(0).toUpperCase() + bin.status.slice(1);
  const statusDotClass = `dot-${bin.status}`;

  return `<div class="bin-tile ${sc}" ${clickAction}>

    <div class="bin-tile-head">
      <span class="bin-num-label">BIN-${lbl}</span>
      <span class="bin-status-badge bst-${bin.status}">${statusLabel}</span>
    </div>

    <div class="bin-hybrid-name" title="${bin.hybrid}">${bin.hybrid}</div>
    ${intakeDateFmt ? `<div class="bin-intake-date">&#x1F4C5; Since ${intakeDateFmt}</div>` : ''}

    <div class="bin-gauge-center">${gaugeSvg}</div>

    <div class="bin-stats-row">
      <div class="bin-stat">
        <span class="bin-stat-key">Quantity</span>
        <span class="bin-stat-val bm-kg">${(bin.qty||0).toLocaleString('en-IN')}</span>
        <span class="bin-stat-unit">Kg</span>
      </div>
      <div class="bin-stat-div"></div>
      <div class="bin-stat">
        <span class="bin-stat-key">Bags</span>
        <span class="bin-stat-val bm-bags">${bin.pkts ? bin.pkts.toLocaleString('en-IN') : '—'}</span>
      </div>
      <div class="bin-stat-div"></div>
      <div class="bin-stat">
        <span class="bin-stat-key">Day</span>
        <span class="bin-stat-val bm-day">${days || '0'}</span>
      </div>
    </div>

    <div class="bin-hours-wrap">
      <div class="bin-hours-track">
        <div class="bin-hours-fill" style="width:${hoursPct}%;background:${hoursColor};"></div>
      </div>
      <div class="bin-hours-meta">
        <span class="bin-hours-lbl-text">&#x23F1; ${hours}h / ${Config.TARGET_HRS}h</span>
        <span class="air-tag ${bin.airflow === 'up' ? 'air-up' : 'air-down'}">${bin.airflow === 'up' ? '&#x2191; Top' : '&#x2193; Bot'}</span>
      </div>
    </div>

  </div>`;
}
