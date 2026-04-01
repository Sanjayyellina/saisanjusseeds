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
      <div class="bin-empty-body">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5">
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
  const hoursPct = Math.min(100, Math.round((hours / Config.TARGET_HRS) * 100));
  const hoursColor = hours >= Config.TARGET_HRS ? 'var(--red)' : hours >= Config.TARGET_HRS * 0.8 ? 'var(--amber)' : 'var(--leaf)';

  // SVG circular gauge — larger for vertical full-width layout
  const RADIUS = 26;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const moisturePct = Math.min(100, Math.max(2, (m / 42) * 100));
  const dashFill = (moisturePct / 100) * CIRCUM;
  const dashOffset = CIRCUM * 0.25;
  const gaugeColor = m > Config.MOISTURE_HIGH ? '#3B82F6' : m > Config.MOISTURE_MID ? '#34D399' : '#16A34A';

  const gaugeSvg = `<svg width="90" height="90" viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="${RADIUS}" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="5"/>
    <circle cx="32" cy="32" r="${RADIUS}" fill="none" stroke="${gaugeColor}" stroke-width="5.5"
      stroke-dasharray="${dashFill.toFixed(1)} ${CIRCUM.toFixed(1)}"
      stroke-dashoffset="${dashOffset.toFixed(1)}"
      stroke-linecap="round"/>
    <text x="32" y="29" text-anchor="middle" dominant-baseline="middle"
      font-size="12" font-weight="800" fill="${gaugeColor}"
      font-family="DM Mono,monospace">${m.toFixed(1)}%</text>
    <text x="32" y="41" text-anchor="middle" dominant-baseline="middle"
      font-size="7.5" fill="rgba(15,25,35,0.35)"
      font-family="DM Sans,sans-serif">&#x2192;${Config.TARGET_MOISTURE}%</text>
  </svg>`;

  const statusDotClass = `dot-${bin.status}`;
  const metaPkts = bin.pkts ? ` <span class="bm-sep">&middot;</span> <span class="bm-bags">${bin.pkts.toLocaleString('en-IN')} Bags</span>` : '';
  const metaDay  = days ? ` <span class="bm-sep">&middot;</span> <span class="bm-day">Day ${days}</span>` : '';

  return `<div class="bin-tile ${sc}" ${clickAction}>

    <div class="bin-tile-top">
      <span class="bin-num-label">BIN-${lbl}</span>
      <div class="status-dot ${statusDotClass}"></div>
    </div>

    <div class="bin-hybrid-name" title="${bin.hybrid}">${bin.hybrid}</div>

    <div class="bin-gauge-center">${gaugeSvg}</div>

    <div class="bin-meta-row">
      <span class="bm-kg">${(bin.qty||0).toLocaleString('en-IN')} Kg</span>${metaPkts}${metaDay}
    </div>

    <div class="bin-tile-divider"></div>

    <div class="bin-hours-wrap">
      <div class="bin-hours-label">
        <span class="bin-hours-lbl-text">&#x23F1; ${hours}h / ${Config.TARGET_HRS}h</span>
        <span class="air-tag ${bin.airflow === 'up' ? 'air-up' : 'air-down'}">${bin.airflow === 'up' ? '&#x2191; Top' : '&#x2193; Bot'}</span>
      </div>
      <div class="bin-hours-track">
        <div class="bin-hours-fill" style="width:${hoursPct}%;background:${hoursColor};"></div>
      </div>
    </div>

  </div>`;
}
