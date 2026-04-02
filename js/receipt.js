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
  const hashDisplay = d.hash.match(/.{1,16}/g).join(' ');

  // GST calculations
  const gstRate   = parseFloat(d.gstRate || 0);
  const taxableAmt = parseInt(d.amount);
  const cgstAmt   = gstRate > 0 ? Math.round(taxableAmt * (gstRate / 2) / 100) : 0;
  const sgstAmt   = gstRate > 0 ? Math.round(taxableAmt * (gstRate / 2) / 100) : 0;
  const totalAmt  = taxableAmt + cgstAmt + sgstAmt;
  const invoiceType = gstRate > 0 ? 'TAX INVOICE' : 'BILL OF SUPPLY';
  const words = amountInWords(totalAmt);

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
        <div class="inv-title">${invoiceType}</div>
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
        ${d.buyerGstin ? `<div class="inv-party-addr" style="font-family:'DM Mono',monospace;font-size:10px;margin-top:4px;">GSTIN: ${d.buyerGstin}</div>` : ''}
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
          <th class="col-hsn">HSN</th>
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
          <td class="col-hsn center mono">${d.hsnCode || '1005 10 90'}</td>
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
          <td colspan="5"></td>
          <td class="label right" colspan="3">Taxable Value</td>
          <td class="right mono">₹${taxableAmt.toLocaleString('en-IN')}</td>
        </tr>
        ${cgstAmt > 0 ? `
        <tr class="subtotal-row">
          <td colspan="5"></td>
          <td class="label right" colspan="3">CGST @ ${gstRate/2}%</td>
          <td class="right mono">₹${cgstAmt.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="subtotal-row">
          <td colspan="5"></td>
          <td class="label right" colspan="3">SGST @ ${gstRate/2}%</td>
          <td class="right mono">₹${sgstAmt.toLocaleString('en-IN')}</td>
        </tr>` : `
        <tr class="subtotal-row">
          <td colspan="5"></td>
          <td class="label right" colspan="3" style="font-size:9px;color:#9ca3af;">GST Exempt / Nil Rated</td>
          <td class="right mono" style="color:#9ca3af;">—</td>
        </tr>`}
        <tr class="total-row">
          <td colspan="5" class="words-cell">
            <span class="words-label">Amount in Words:</span><br>
            <span class="words-val">${words}</span>
          </td>
          <td class="label right" colspan="3">TOTAL</td>
          <td class="right total-amount">₹${totalAmt.toLocaleString('en-IN')}</td>
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

window.shareReceiptWhatsApp = function() {
  const d = _currentReceiptId ? state.dispatches.find(x => x.receiptId === _currentReceiptId) : null;
  if (!d) return;
  const msg = [
    '🌾 *Yellina Seeds — Dispatch Invoice*',
    '',
    `*Invoice:* ${d.receiptId}`,
    `*To:* ${d.party}`,
    `*Hybrid:* ${d.hybrid}`,
    `*Bags:* ${d.bags.toLocaleString('en-IN')} | *Qty:* ${parseInt(d.qty).toLocaleString('en-IN')} Kg`,
    `*Final Moisture:* ${d.moisture ? d.moisture + '%' : '—'}`,
    `*Amount:* ₹${parseInt(d.amount).toLocaleString('en-IN')}`,
    `*Date:* ${d.date}`,
    '',
    `Verify at: https://yellinaseeds.com → Receipts → ${d.receiptId}`
  ].join('\n');
  window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
};

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
      html += `<div class="sd-item" onclick="navigateToIntake('${i.id}');closeSearchDropdown()">
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

// Navigate to a specific intake record and highlight it
window.navigateToIntake = function(intakeId) {
  const idx = state.intakes.findIndex(i => i.id == intakeId);
  if (idx >= 0) {
    window._intakePage = Math.floor(idx / (window._PAGE_SIZE || 20));
    window._highlightIntakeId = intakeId;
  }
  showPage('intake');
};

// Close dropdown when clicking outside the search bar
document.addEventListener('click', function(e) {
  const wrap = document.getElementById('search-bar-wrap');
  if (wrap && !wrap.contains(e.target)) {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
  }
});

// ================================================================
// DRIVER SLIP — printable gate-pass handed to truck driver
// Prints 2 copies on one page (top + bottom, with cut-line)
// ================================================================
window.printDriverSlip = function(receiptId) {
  const rid = receiptId || _currentReceiptId;
  const d = rid ? state.dispatches.find(x => x.receiptId === rid) : null;
  if (!d) { toast('Dispatch record not found', 'error'); return; }

  const date = d.date || new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const slipNo = d.receiptId;
  const hybrid = d.hybrid || '—';
  const lots = d.lot || '—';
  const bags = (d.bags || 0).toLocaleString('en-IN');
  const qty = (d.qty || 0).toLocaleString('en-IN');
  const moisture = d.moisture ? d.moisture + '%' : '—';
  const party = d.party || '—';
  const address = d.address || '';
  const vehicle = d.vehicle || '—';
  const driverName = d.driverName || '—';
  const remarks = d.remarks || '';

  const slipHtml = `
    <div class="slip-box">
      <div class="slip-header">
        <div class="slip-logo-wrap">
          <img src="${LOGO}" class="slip-logo" onerror="this.style.display='none'">
          <div>
            <div class="slip-company">Yellina Seeds Pvt. Ltd.</div>
            <div class="slip-addr">Sathupally, Khammam Dist – 507303, Telangana</div>
            <div class="slip-addr">Cell: +91 99494 84078</div>
          </div>
        </div>
        <div class="slip-title-block">
          <div class="slip-title">DRIVER SLIP</div>
          <div class="slip-sub">Gate Pass / Delivery Copy</div>
          <table class="slip-meta">
            <tr><td class="sk">Slip No.</td><td class="sv">${slipNo}</td></tr>
            <tr><td class="sk">Date</td><td class="sv">${date}</td></tr>
          </table>
        </div>
      </div>

      <div class="slip-body">
        <div class="slip-row2">
          <div class="slip-field">
            <div class="sf-label">To (Party / Buyer)</div>
            <div class="sf-val bold">${party}</div>
            ${address ? `<div class="sf-sub">${address}</div>` : ''}
          </div>
          <div class="slip-field">
            <div class="sf-label">Vehicle No.</div>
            <div class="sf-val bold mono">${vehicle}</div>
            <div class="sf-label" style="margin-top:6px;">Driver Name</div>
            <div class="sf-val">${driverName}</div>
          </div>
        </div>

        <div class="slip-divider"></div>

        <table class="slip-table">
          <thead>
            <tr>
              <th>Hybrid / Material</th>
              <th>Lot Nos</th>
              <th>Bags</th>
              <th>Net Weight (Kg)</th>
              <th>Moisture %</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="bold">${hybrid}<br><span class="sub">Dried Corn Seed</span></td>
              <td class="mono center">${lots}</td>
              <td class="mono center bold">${bags}</td>
              <td class="mono center bold">${qty}</td>
              <td class="center">${moisture}</td>
            </tr>
          </tbody>
        </table>

        ${remarks ? `<div class="slip-remarks"><span class="sk">Remarks:</span> ${remarks}</div>` : ''}

        <div class="slip-footer-row">
          <div class="sign-block">
            <div class="sign-line"></div>
            <div class="sign-label">Driver Signature</div>
          </div>
          <div class="slip-stamp">
            <div class="stamp-circle">
              <div class="stamp-text">YELLINA SEEDS</div>
              <div class="stamp-text2">SATHUPALLY</div>
            </div>
          </div>
          <div class="sign-block">
            <div class="sign-line"></div>
            <div class="sign-label">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>`;

  const html = `<!DOCTYPE html><html><head><title>Driver Slip — ${slipNo}</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
  *{box-sizing:border-box;margin:0;padding:0;}
  @page{size:A4 portrait;margin:10mm 12mm;}
  body{font-family:'DM Sans',sans-serif;font-size:11px;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact;}

  .slip-box{border:2px solid #1b3a2d;border-radius:6px;overflow:hidden;margin-bottom:0;}
  .slip-copy-label{text-align:center;font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#888;padding:5px 0;}
  .cut-line{border:none;border-top:1.5px dashed #bbb;margin:8px 0;position:relative;}
  .cut-line::before{content:'✂';position:absolute;left:50%;top:-9px;transform:translateX(-50%);background:#fff;padding:0 6px;font-size:12px;color:#aaa;}

  /* Header */
  .slip-header{display:flex;justify-content:space-between;align-items:flex-start;background:#1b3a2d;padding:12px 16px;color:#fff;gap:10px;}
  .slip-logo-wrap{display:flex;align-items:flex-start;gap:10px;}
  .slip-logo{width:40px;height:40px;object-fit:contain;background:#fff;border-radius:5px;padding:2px;flex-shrink:0;}
  .slip-company{font-size:14px;font-weight:700;color:#fff;letter-spacing:-.1px;}
  .slip-addr{font-size:8.5px;color:rgba(255,255,255,.65);line-height:1.7;}
  .slip-title-block{text-align:right;flex-shrink:0;}
  .slip-title{font-size:20px;font-weight:800;color:#f5c842;letter-spacing:1px;}
  .slip-sub{font-size:8.5px;color:rgba(255,255,255,.6);letter-spacing:.5px;text-transform:uppercase;margin-bottom:6px;}
  .slip-meta{border-collapse:collapse;}
  .slip-meta td{font-size:9.5px;padding:1px 0;}
  .sk{color:rgba(255,255,255,.5);padding-right:8px;text-align:right;}
  .sv{font-weight:700;font-family:'DM Mono',monospace;color:#fff;}

  /* Body */
  .slip-body{padding:12px 16px;}
  .slip-row2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px;}
  .slip-field{background:#f8f9fa;border-radius:4px;padding:8px 10px;}
  .sf-label{font-size:8px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#6b7280;margin-bottom:3px;}
  .sf-val{font-size:12px;font-weight:600;color:#111;}
  .sf-sub{font-size:9px;color:#666;margin-top:2px;}
  .bold{font-weight:700;}
  .mono{font-family:'DM Mono',monospace;}
  .center{text-align:center;}
  .sub{font-size:8.5px;color:#888;font-weight:400;}

  .slip-divider{border:none;border-top:1px solid #e5e7eb;margin:10px 0;}

  .slip-table{width:100%;border-collapse:collapse;font-size:10.5px;margin-bottom:10px;}
  .slip-table thead tr{background:#1b3a2d;}
  .slip-table th{padding:6px 8px;font-size:8.5px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:#f5c842;text-align:left;}
  .slip-table td{padding:8px 8px;border-bottom:1px solid #f0f0f0;vertical-align:top;}
  .slip-table tbody tr{background:#fff;}

  .slip-remarks{font-size:9.5px;color:#555;background:#fffbeb;border-left:3px solid #f5a623;padding:5px 8px;border-radius:0 4px 4px 0;margin-bottom:10px;}

  .slip-footer-row{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;margin-top:14px;padding-top:10px;border-top:1px solid #e5e7eb;}
  .sign-block{flex:1;text-align:center;}
  .sign-line{border-top:1.5px solid #1b3a2d;margin-bottom:4px;margin-top:40px;}
  .sign-label{font-size:9px;font-weight:600;color:#374151;}

  .slip-stamp{flex-shrink:0;display:flex;justify-content:center;}
  .stamp-circle{width:80px;height:80px;border:2.5px solid #1b3a2d;border-radius:50%;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:2px;}
  .stamp-text{font-size:7.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#1b3a2d;text-align:center;}
  .stamp-text2{font-size:7px;color:#5a8a6a;text-align:center;letter-spacing:.3px;}
  </style></head><body>
  <div class="slip-copy-label">Company Copy</div>
  ${slipHtml}
  <hr class="cut-line">
  <div class="slip-copy-label">Driver Copy</div>
  ${slipHtml}
  <script>window.onload=function(){window.print();};<\/script>
  </body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (w) { w.document.write(html); w.document.close(); }
  else { toast('Please allow pop-ups to print the driver slip', 'info'); }
};
