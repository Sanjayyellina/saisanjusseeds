// ============================================================
// RECEIPT, DISPATCH & VERIFY
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// RECEIPT
// ================================================================
let _currentReceiptId=null;
function viewReceipt(receiptId){
  const d=state.dispatches.find(x=>x.receiptId===receiptId);
  if(!d)return;
  _currentReceiptId=receiptId;
  state.activeReceiptHash=d.hash;
  document.getElementById('receipt-modal-body').innerHTML=buildReceipt(d);
  setTimeout(()=>{
    const qrDiv=document.getElementById('r-qr-'+receiptId.replace(/\W/g,''));
    if(qrDiv&&window.QRCode)new QRCode(qrDiv,{
      text:`YELLINA|${d.receiptId}|${d.date}|${d.hash}`,
      width:96,height:96,colorDark:'#0F1923',colorLight:'#fff'
    });
  },120);
  openModal('receipt-modal');
}
function buildReceipt(d){
  const qrId='r-qr-'+d.receiptId.replace(/\W/g,'');
  return`<div id="print-receipt">
  <div class="receipt">
    <div class="receipt-masthead">
      <img src="${LOGO}" class="receipt-logo" style="background:#fff;border-radius:6px;padding:2px;" onerror="this.style.display='none'">
      <div class="receipt-company">
        <div class="receipt-co-name">Yellina Seeds Private Limited</div>
        <div class="receipt-co-sub">SATHUPALLY, KHAMMAM DIST – 507303 · GSTIN: 36AABCY8231F1ZB</div>
        <div class="receipt-co-sub">Cell: 9949484078 · yellinamurali@gmail.com</div>
      </div>
    </div>
    <div class="receipt-id-bar">
      <div>
        <div class="receipt-id-label">Dispatch Receipt</div>
        <div class="receipt-id-val">${d.receiptId}</div>
      </div>
      <div style="text-align:right;">
        <div class="receipt-id-label">Date</div>
        <div style="font-weight:700;font-size:14px;color:#111;">${d.date}</div>
      </div>
    </div>
    <div class="receipt-body">
      <div class="receipt-section-title">Receiver</div>
      <div class="receipt-row"><span class="receipt-key">Party</span><span class="receipt-val">${d.party}</span></div>
      ${d.address?`<div class="receipt-row"><span class="receipt-key">Address</span><span class="receipt-val" style="max-width:220px;text-align:right;font-size:10px;">${d.address}</span></div>`:''}

      <div class="receipt-section-title">Transport</div>
      <div class="receipt-row"><span class="receipt-key">Vehicle No.</span><span class="receipt-val">${d.vehicle}</span></div>
      ${d.lr?`<div class="receipt-row"><span class="receipt-key">LR Number</span><span class="receipt-val">${d.lr}</span></div>`:''}

      <div class="receipt-section-title">Seed Details</div>
      <div class="receipt-row"><span class="receipt-key">Hybrid / Variety</span><span class="receipt-val">${d.hybrid}</span></div>
      ${d.lot?`<div class="receipt-row"><span class="receipt-key">Lot Number</span><span class="receipt-val">${d.lot}</span></div>`:''}
      <div class="receipt-row"><span class="receipt-key">No. of Bags</span><span class="receipt-val">${d.bags.toLocaleString('en-IN')}</span></div>
      <div class="receipt-row"><span class="receipt-key">Quantity (Kg)</span><span class="receipt-val">${d.qty.toLocaleString('en-IN')}</span></div>
      ${d.moisture?`<div class="receipt-row"><span class="receipt-key">Final Moisture %</span><span class="receipt-val" style="color:var(--green);font-weight:700;">${d.moisture}%</span></div>`:''}

      <div class="receipt-total-bar">
        <span class="receipt-total-label">Total Amount</span>
        <span class="receipt-total-val">₹${parseInt(d.amount).toLocaleString('en-IN')}</span>
      </div>

      <div style="display:flex;gap:12px;align-items:flex-start;">
        <div style="flex:1;">
          <div class="receipt-security">
            <div class="receipt-security-title">
              <span>🔐</span> Cryptographic Signature
            </div>
            <div style="font-size:9px;color:#999;margin-bottom:5px;font-style:italic;">SHA-256 equivalent hash — any modification invalidates this receipt</div>
            <div class="receipt-hash-val">${d.hash.match(/.{1,16}/g).join(' ')}</div>
            <div style="margin-top:6px;padding-top:6px;border-top:1px solid #E5E7EB;">
              <div style="font-size:9px;color:#bbb;margin-bottom:3px;text-transform:uppercase;letter-spacing:.5px;">Signature</div>
              <div class="receipt-hash-val" style="font-size:8px;">${d.signature}</div>
            </div>
          </div>
          <div style="margin-top:10px;text-align:center;">
            <span class="receipt-verified-badge">✓ Yellina Seeds — Digitally Verified</span>
          </div>
        </div>
        <div>
          <div class="receipt-qr-row"><div id="${qrId}"></div></div>
          <div style="font-size:9px;color:#aaa;text-align:center;margin-top:4px;">Scan to Verify</div>
        </div>
      </div>
    </div>
    <div class="receipt-footer">
      <div><strong>Stock is not for sale — For Transfer Only</strong></div>
      <div>To verify authenticity: Go to Yellina Operations Platform → Verify Receipt → Enter ID <strong>${d.receiptId}</strong></div>
      <div style="margin-top:4px;">Any alteration to this document will cause hash mismatch and invalidate this receipt.</div>
    </div>
  </div>
  </div>`;
}

function copyReceiptHash(){
  if(state.activeReceiptHash){
    navigator.clipboard.writeText(state.activeReceiptHash).catch(()=>{});
    toast('Hash copied to clipboard','info');
  }
}
function printReceipt(){
  const el=document.getElementById('print-receipt');
  if(!el)return;
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
  *{box-sizing:border-box;margin:0;padding:0;}body{font-family:'DM Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:20px;}
  .receipt{max-width:500px;margin:0 auto;border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;}
  .receipt-masthead{background:#0F1923;padding:20px 24px;display:flex;align-items:center;gap:14px;}
  .receipt-co-name{font-family:'Playfair Display',serif;font-size:17px;font-weight:800;color:#fff;}
  .receipt-co-sub{font-size:10px;color:rgba(255,255,255,.5);margin-top:2px;}
  .receipt-id-bar{background:#FFF8EC;border-bottom:1px solid #FDEBC8;padding:11px 24px;display:flex;justify-content:space-between;align-items:center;}
  .receipt-id-label{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A9BAD;}
  .receipt-id-val{font-family:'DM Mono',monospace;font-size:15px;font-weight:700;color:#C8821A;}
  .receipt-body{padding:18px 24px;}
  .receipt-section-title{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8A9BAD;padding-bottom:5px;border-bottom:1px solid #F0F0F0;margin-bottom:7px;margin-top:13px;}
  .receipt-row{display:flex;justify-content:space-between;align-items:baseline;padding:3px 0;font-size:12px;}
  .receipt-key{color:#666;}.receipt-val{font-weight:600;color:#111;font-family:'DM Mono',monospace;font-size:10px;}
  .receipt-total-bar{background:#0F1923;color:#F5A623;padding:12px 14px;border-radius:8px;display:flex;justify-content:space-between;margin:14px 0;}
  .receipt-total-label{font-size:12px;font-weight:700;}.receipt-total-val{font-family:'DM Mono',monospace;font-size:19px;font-weight:700;}
  .receipt-security{background:#F8F9FB;border:1px solid #E5E7EB;border-radius:8px;padding:11px 13px;margin-top:12px;}
  .receipt-security-title{font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:#888;margin-bottom:6px;}
  .receipt-hash-val{font-family:'DM Mono',monospace;font-size:8.5px;color:#888;word-break:break-all;line-height:1.7;background:#F0F0F0;padding:7px 9px;border-radius:5px;}
  .receipt-verified-badge{display:inline-flex;align-items:center;gap:4px;background:#ECFDF5;color:#10B981;border:1px solid #A7F3D0;border-radius:99px;padding:3px 10px;font-size:10px;font-weight:700;}
  .receipt-footer{text-align:center;padding:12px 24px 18px;font-size:10px;color:#aaa;line-height:1.7;border-top:1px solid #F0F0F0;}
  </style></head><body>${el.innerHTML}</body></html>`);
  w.document.close();setTimeout(()=>w.print(),300);
}

function verifyReceipt(){
  const input=document.getElementById('verify-input').value.trim();
  const res=document.getElementById('verify-result');
  if(!input){res.innerHTML='';return;}
  const d=state.dispatches.find(x=>x.receiptId===input||x.hash===input||x.hash.startsWith(input.toUpperCase()));
  if(!d){
    res.innerHTML=`<div class="verify-result verify-fail">
      <div class="verify-status" style="color:var(--red);">✕ Receipt Not Found</div>
      <div class="fs12 text-muted">No record matches this ID or hash. This document may be fraudulent, altered, or from a different system.</div>
    </div>`;
    return;
  }
  const valid=verifyHash(d);
  res.innerHTML=`<div class="verify-result ${valid?'verify-ok':'verify-fail'}">
    <div class="verify-status" style="color:${valid?'var(--green)':'var(--red)'};">
      ${valid?'✓ Authentic — Hash Verified':'✕ TAMPERED — Hash Mismatch'}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px;margin-bottom:14px;">
      ${[['Receipt ID',d.receiptId,'mono text-gold'],['Date',d.date,''],['Party',d.party,'fw700'],['Hybrid',d.hybrid,'fw700'],['Bags',d.bags,'mono'],['Qty',d.qty+' Kg','mono'],['Amount','₹'+parseInt(d.amount).toLocaleString('en-IN'),'fw700 text-green'],['Vehicle',d.vehicle,'mono']].map(([k,v,cls])=>`
        <div style="background:rgba(255,255,255,.5);border-radius:var(--radius);padding:8px 10px;">
          <div style="font-size:9px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--ink-5);margin-bottom:2px;">${k}</div>
          <div class="${cls}" style="font-size:12px;">${v}</div>
        </div>`).join('')}
    </div>
    <div style="background:rgba(255,255,255,.4);border-radius:var(--radius);padding:10px 12px;margin-bottom:12px;">
      <div class="form-label" style="margin-bottom:5px;">Hash</div>
      <div class="mono" style="font-size:9px;color:var(--ink-4);word-break:break-all;line-height:1.7;">${d.hash}</div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="viewReceipt('${d.receiptId}')">View Full Receipt</button>
  </div>`;
}

function globalSearch(q){
  if(!q.trim())return;
  const lq=q.toLowerCase();
  const intake=state.intakes.find(i=>i.challan.includes(q)||i.vehicle.toLowerCase().includes(lq)||i.hybrid.toLowerCase().includes(lq));
  const disp=state.dispatches.find(d=>d.receiptId.toLowerCase().includes(lq)||d.party.toLowerCase().includes(lq));
  if(disp){viewReceipt(disp.receiptId);return;}
}
