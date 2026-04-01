// ============================================================
// RECEIPT, DISPATCH & VERIFY
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// AMOUNT IN WORDS (Indian numbering)
// ================================================================
function amountInWords(n) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function words(num) {
    if (num === 0) return '';
    if (num < 20) return ones[num] + ' ';
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? ' ' + ones[num%10] : '') + ' ';
    if (num < 1000) return ones[Math.floor(num/100)] + ' Hundred ' + words(num%100);
    if (num < 100000) return words(Math.floor(num/1000)) + 'Thousand ' + words(num%1000);
    if (num < 10000000) return words(Math.floor(num/100000)) + 'Lakh ' + words(num%100000);
    return words(Math.floor(num/10000000)) + 'Crore ' + words(num%10000000);
  }
  const amt = Math.round(n);
  if (amt === 0) return 'Zero Rupees Only';
  return words(amt).trim() + ' Rupees Only';
}

// ================================================================
// RECEIPT
// ================================================================
let _currentReceiptId = null;

function viewReceipt(receiptId) {
  const d = state.dispatches.find(x => x.receiptId === receiptId);
  if (!d) return;
  _currentReceiptId = receiptId;
  state.activeReceiptHash = d.hash;
  document.getElementById('receipt-modal-body').innerHTML = buildReceipt(d);
  setTimeout(() => {
    const qrDiv = document.getElementById('r-qr-' + receiptId.replace(/\W/g, ''));
    if (qrDiv && window.QRCode) new QRCode(qrDiv, {
      text: `YELLINA|${d.receiptId}|${d.date}|${d.hash}`,
      width: 80, height: 80, colorDark: '#0F1923', colorLight: '#fff'
    });
  }, 120);
  openModal('receipt-modal');
}

function buildReceipt(d) {
  const qrId = 'r-qr-' + d.receiptId.replace(/\W/g, '');
  const ratePerKg = d.qty > 0 ? (d.amount / d.qty).toFixed(2) : '—';
  const words = amountInWords(d.amount);
  const hashDisplay = d.hash.match(/.{1,16}/g).join(' ');

  return `<div id="print-receipt">
  <div class="invoice-wrap">

    <!-- HEADER -->
    <div class="inv-header">
      <div class="inv-company-block">
        <img src="${LOGO}" class="inv-logo" onerror="this.style.display='none'">
        <div>
          <div class="inv-company-name">Yellina Seeds Private Limited</div>
          <div class="inv-company-detail">Sathupally, Khammam District – 507303, Telangana</div>
          <div class="inv-company-detail">GSTIN: 36AABCY8231F1ZB &nbsp;|&nbsp; Cell: +91 99494 84078</div>
          <div class="inv-company-detail">Email: yellinamurali@gmail.com</div>
        </div>
      </div>
      <div class="inv-title-block">
        <div class="inv-title">DISPATCH INVOICE</div>
        <table class="inv-meta-table">
          <tr><td class="inv-meta-key">Invoice No.</td><td class="inv-meta-val">${d.receiptId}</td></tr>
          <tr><td class="inv-meta-key">Date</td><td class="inv-meta-val">${d.date}</td></tr>
          ${d.vehicle ? `<tr><td class="inv-meta-key">Vehicle</td><td class="inv-meta-val">${d.vehicle}</td></tr>` : ''}
          ${d.lr ? `<tr><td class="inv-meta-key">LR No.</td><td class="inv-meta-val">${d.lr}</td></tr>` : ''}
        </table>
      </div>
    </div>

    <div class="inv-divider"></div>

    <!-- BILL TO -->
    <div class="inv-parties">
      <div class="inv-party-box">
        <div class="inv-box-title">Bill To / Consignee</div>
        <div class="inv-party-name">${d.party}</div>
        ${d.address ? `<div class="inv-party-addr">${d.address}</div>` : ''}
      </div>
      <div class="inv-party-box">
        <div class="inv-box-title">Dispatch From</div>
        <div class="inv-party-name">Yellina Seeds Pvt. Ltd.</div>
        <div class="inv-party-addr">Sathupally, Khammam Dist – 507303</div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="inv-table">
      <thead>
        <tr>
          <th class="col-sno">#</th>
          <th class="col-desc">Description / Hybrid</th>
          <th class="col-lot">Lot No.</th>
          <th class="col-moisture">Moisture</th>
          <th class="col-bags">Bags</th>
          <th class="col-qty">Qty (Kg)</th>
          <th class="col-rate">Rate/Kg (₹)</th>
          <th class="col-amt">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-sno center">1</td>
          <td class="col-desc"><strong>${d.hybrid}</strong><br><span class="item-sub">Dried Corn Seed</span></td>
          <td class="col-lot center mono">${d.lot || '—'}</td>
          <td class="col-moisture center">${d.moisture ? d.moisture + '%' : '—'}</td>
          <td class="col-bags center mono">${d.bags.toLocaleString('en-IN')}</td>
          <td class="col-qty right mono">${d.qty.toLocaleString('en-IN')}</td>
          <td class="col-rate right mono">${ratePerKg}</td>
          <td class="col-amt right mono fw700">${parseInt(d.amount).toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="subtotal-row">
          <td colspan="4"></td>
          <td class="label right" colspan="3">Sub Total</td>
          <td class="right mono">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
        </tr>
        <tr class="total-row">
          <td colspan="4" class="words-cell">
            <span class="words-label">Amount in Words:</span><br>
            <span class="words-val">${words}</span>
          </td>
          <td class="label right" colspan="3">TOTAL</td>
          <td class="right total-amount">₹${parseInt(d.amount).toLocaleString('en-IN')}</td>
        </tr>
      </tfoot>
    </table>

    <!-- BOTTOM: VERIFY + SIGNATURE -->
    <div class="inv-bottom">
      <div class="inv-verify-block">
        <div class="inv-box-title">Digital Verification</div>
        <div class="inv-qr-row">
          <div id="${qrId}" class="inv-qr"></div>
          <div class="inv-hash-block">
            <div class="inv-hash-label">Document Hash</div>
            <div class="inv-hash-val">${hashDisplay}</div>
            <div class="inv-verified-badge">✓ Digitally Verified — Yellina Seeds</div>
          </div>
        </div>
        <div class="inv-verify-hint">Scan QR or visit yellinaseeds.com → Verify Receipt → Enter ID <strong>${d.receiptId}</strong></div>
      </div>

      <div class="inv-sign-block">
        <div class="inv-box-title">For Yellina Seeds Private Limited</div>
        <div class="inv-sign-space"></div>
        <div class="inv-sign-line"></div>
        <div class="inv-sign-label">Authorised Signatory</div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="inv-footer">
      <strong>Terms:</strong> Goods once dispatched will not be taken back. Subject to Khammam jurisdiction. &nbsp;|&nbsp;
      This is a computer-generated invoice. &nbsp;|&nbsp; Any alteration invalidates this document.
    </div>

  </div>
  </div>`;
}

function copyReceiptHash() {
  if (state.activeReceiptHash) {
    navigator.clipboard.writeText(state.activeReceiptHash).catch(() => {});
    toast('Hash copied to clipboard', 'info');
  }
}

function printReceipt() {
  const el = document.getElementById('print-receipt');
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Invoice — ${_currentReceiptId || ''}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
  *{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 portrait;margin:12mm 14mm;}
  body{font-family:'DM Sans',sans-serif;font-size:12px;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact;}

  /* Wrapper */
  .invoice-wrap{max-width:760px;margin:0 auto;border:1.5px solid #d0d7de;border-radius:8px;overflow:hidden;}

  /* Header */
  .inv-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;background:#1b3a2d;padding:18px 22px;color:#fff;}
  .inv-company-block{display:flex;align-items:flex-start;gap:12px;}
  .inv-logo{width:48px;height:48px;object-fit:contain;background:#fff;border-radius:6px;padding:3px;flex-shrink:0;}
  .inv-company-name{font-size:16px;font-weight:700;color:#fff;letter-spacing:-.2px;margin-bottom:4px;}
  .inv-company-detail{font-size:9.5px;color:rgba(255,255,255,.65);line-height:1.7;}
  .inv-title-block{text-align:right;flex-shrink:0;}
  .inv-title{font-size:22px;font-weight:700;color:#f5c842;letter-spacing:1px;margin-bottom:8px;}
  .inv-meta-table{border-collapse:collapse;margin-left:auto;}
  .inv-meta-table td{padding:1.5px 0;font-size:10px;color:rgba(255,255,255,.85);}
  .inv-meta-key{padding-right:10px;color:rgba(255,255,255,.5);text-align:right;}
  .inv-meta-val{font-weight:600;font-family:'DM Mono',monospace;font-size:10px;}

  .inv-divider{height:3px;background:linear-gradient(90deg,#f5c842,#1b3a2d);}

  /* Parties */
  .inv-parties{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e5e7eb;}
  .inv-party-box{padding:12px 20px;}
  .inv-party-box:first-child{border-right:1px solid #e5e7eb;}
  .inv-box-title{font-size:8.5px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#6b7280;margin-bottom:5px;}
  .inv-party-name{font-size:13px;font-weight:700;color:#111;margin-bottom:2px;}
  .inv-party-addr{font-size:10px;color:#555;line-height:1.6;}

  /* Items table */
  .inv-table{width:100%;border-collapse:collapse;font-size:11px;}
  .inv-table thead tr{background:#f3f4f6;border-top:1px solid #e5e7eb;border-bottom:2px solid #d1d5db;}
  .inv-table th{padding:7px 10px;font-size:9px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:#374151;white-space:nowrap;}
  .inv-table td{padding:9px 10px;border-bottom:1px solid #f3f4f6;vertical-align:top;}
  .inv-table tbody tr:last-child td{border-bottom:2px solid #d1d5db;}
  .item-sub{font-size:9px;color:#888;font-style:italic;}
  .mono{font-family:'DM Mono',monospace;}
  .fw700{font-weight:700;}
  .center{text-align:center;}
  .right{text-align:right;}
  .col-sno{width:28px;}
  .col-lot{width:70px;}
  .col-moisture{width:62px;}
  .col-bags{width:55px;}
  .col-qty{width:80px;}
  .col-rate{width:75px;}
  .col-amt{width:90px;}

  /* Totals */
  .subtotal-row td{padding:6px 10px;background:#fafafa;}
  .subtotal-row .label{font-weight:600;color:#555;font-size:10.5px;}
  .total-row td{padding:8px 10px;background:#1b3a2d;}
  .total-row .label{font-weight:700;font-size:13px;color:#f5c842;}
  .total-amount{font-family:'DM Mono',monospace;font-size:16px;font-weight:700;color:#f5c842;text-align:right;}
  .words-cell{color:#fff;font-size:10px;}
  .words-label{font-size:8.5px;text-transform:uppercase;letter-spacing:.6px;opacity:.6;}
  .words-val{font-weight:600;font-size:11px;}

  /* Bottom */
  .inv-bottom{display:grid;grid-template-columns:1fr auto;gap:0;border-top:1px solid #e5e7eb;}
  .inv-verify-block{padding:12px 20px;border-right:1px solid #e5e7eb;}
  .inv-qr-row{display:flex;gap:12px;align-items:flex-start;margin:7px 0;}
  .inv-qr{width:80px;height:80px;flex-shrink:0;}
  .inv-hash-block{flex:1;}
  .inv-hash-label{font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#6b7280;margin-bottom:4px;}
  .inv-hash-val{font-family:'DM Mono',monospace;font-size:7.5px;color:#555;word-break:break-all;line-height:1.8;background:#f3f4f6;padding:5px 7px;border-radius:4px;}
  .inv-verified-badge{display:inline-block;margin-top:5px;background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;border-radius:99px;padding:2px 9px;font-size:8.5px;font-weight:700;}
  .inv-verify-hint{font-size:8.5px;color:#9ca3af;margin-top:5px;}
  .inv-sign-block{padding:12px 24px;min-width:200px;display:flex;flex-direction:column;}
  .inv-sign-space{flex:1;min-height:50px;}
  .inv-sign-line{border-top:1.5px solid #1b3a2d;margin-bottom:4px;}
  .inv-sign-label{font-size:10px;font-weight:600;color:#374151;text-align:center;}

  /* Footer */
  .inv-footer{background:#f9fafb;border-top:1px solid #e5e7eb;padding:8px 20px;font-size:8.5px;color:#9ca3af;text-align:center;line-height:1.7;}
  </style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 400);
}

function verifyReceipt() {
  const input = document.getElementById('verify-input').value.trim();
  const res = document.getElementById('verify-result');
  if (!input) { res.innerHTML = ''; return; }
  const d = state.dispatches.find(x => x.receiptId === input || x.hash === input || x.hash.startsWith(input.toUpperCase()));
  if (!d) {
    res.innerHTML = `<div class="verify-result verify-fail">
      <div class="verify-status" style="color:var(--red);">✕ Receipt Not Found</div>
      <div class="fs12 text-muted">No record matches this ID or hash. This document may be fraudulent, altered, or from a different system.</div>
    </div>`;
    return;
  }
  const valid = verifyHash(d);
  res.innerHTML = `<div class="verify-result ${valid ? 'verify-ok' : 'verify-fail'}">
    <div class="verify-status" style="color:${valid ? 'var(--green)' : 'var(--red)'};">
      ${valid ? '✓ Authentic — Hash Verified' : '✕ TAMPERED — Hash Mismatch'}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:14px;">
      ${[['Invoice No.',d.receiptId,'mono text-gold'],['Date',d.date,''],['Party',d.party,'fw700'],['Hybrid',d.hybrid,'fw700'],['Bags',d.bags,'mono'],['Qty',d.qty+' Kg','mono'],['Amount','₹'+parseInt(d.amount).toLocaleString('en-IN'),'fw700 text-green'],['Vehicle',d.vehicle,'mono']].map(([k,v,cls])=>`
        <div style="background:rgba(255,255,255,.5);border-radius:var(--radius);padding:8px 10px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--ink-5);margin-bottom:2px;">${k}</div>
          <div class="${cls}" style="font-size:12px;">${v}</div>
        </div>`).join('')}
    </div>
    <div style="background:rgba(255,255,255,.4);border-radius:var(--radius);padding:10px 12px;margin-bottom:12px;">
      <div class="form-label" style="margin-bottom:5px;">Hash</div>
      <div class="mono" style="font-size:9px;color:var(--ink-4);word-break:break-all;line-height:1.7;">${d.hash}</div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="viewReceipt('${d.receiptId}')">View Full Invoice</button>
  </div>`;
}

function globalSearch(q) {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;
  if (!q.trim()) { dropdown.style.display = 'none'; return; }
  const lq = q.toLowerCase();

  const dispatches = state.dispatches.filter(d =>
    (d.receiptId || '').toLowerCase().includes(lq) ||
    (d.party || '').toLowerCase().includes(lq) ||
    (d.hybrid || '').toLowerCase().includes(lq) ||
    (d.vehicle || '').toLowerCase().includes(lq)
  ).slice(0, 5);

  const intakes = state.intakes.filter(i =>
    (i.challan || '').toLowerCase().includes(lq) ||
    (i.vehicle || '').toLowerCase().includes(lq) ||
    (i.hybrid || '').toLowerCase().includes(lq) ||
    (i.location || '').toLowerCase().includes(lq)
  ).slice(0, 5);

  if (!dispatches.length && !intakes.length) {
    dropdown.innerHTML = '<div class="sd-empty">No results for "' + q + '"</div>';
    dropdown.style.display = 'block';
    return;
  }

  let html = '';
  if (dispatches.length) {
    html += '<div class="sd-group-title">Receipts / Dispatches</div>';
    dispatches.forEach(d => {
      html += `<div class="sd-item" onclick="viewReceipt('${d.receiptId}');closeSearchDropdown()">
        <div class="sd-item-icon">📦</div>
        <div>
          <div class="sd-item-main">${d.receiptId} &mdash; ${d.party}</div>
          <div class="sd-item-sub">${d.hybrid} &middot; ${d.bags} bags &middot; ₹${parseInt(d.amount).toLocaleString('en-IN')} &middot; ${d.date}</div>
        </div>
      </div>`;
    });
  }
  if (intakes.length) {
    html += '<div class="sd-group-title">Intake Records</div>';
    intakes.forEach(i => {
      const binIds = getBinIds(i);
      const binStr = binIds.map(b => 'BIN-' + getBinLabel(b)).join(', ') || '—';
      html += `<div class="sd-item" onclick="showPage('intake');closeSearchDropdown()">
        <div class="sd-item-icon">🚛</div>
        <div>
          <div class="sd-item-main">${i.challan} &mdash; ${i.hybrid}</div>
          <div class="sd-item-sub">${i.vehicle} &middot; ${i.qty} Kg &middot; ${binStr} &middot; ${i.date}</div>
        </div>
      </div>`;
    });
  }

  dropdown.innerHTML = html;
  dropdown.style.display = 'block';
}

function closeSearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  const input = document.getElementById('global-search');
  if (input) input.value = '';
}

// Close dropdown when clicking outside the search bar
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('search-bar-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});
