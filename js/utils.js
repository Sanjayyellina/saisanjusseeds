// ============================================================
// UTILITIES — DATE, FORMAT, TOAST
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// UTILS
// ================================================================
function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function getMoistureColor(m){
  if(m>Config.MOISTURE_HIGH)return 'var(--blue)';
  if(m>Config.MOISTURE_MID)return 'var(--amber)';
  return 'var(--green)';
}
function getMoistureBarColor(m){
  if(m>Config.MOISTURE_HIGH)return'linear-gradient(90deg,#3B82F6,#60A5FA)';
  if(m>Config.MOISTURE_MID)return'linear-gradient(90deg,#F59E0B,#FCD34D)';
  return'linear-gradient(90deg,#10B981,#34D399)';
}
function getMoisturePct(m){return Math.min(100,Math.max(3,(m/42)*100));}
function dateDiff(d){
  if(!d)return 0;
  return Math.floor((Date.now()-new Date(d).getTime())/Config.MS_PER_DAY);
}
function hoursDiff(d){
  if(!d)return 0;
  return Math.floor((Date.now()-new Date(d).getTime())/Config.MS_PER_HOUR);
}
function showPage(name,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.body.dataset.page = name;
  if(el){const ni=el.closest('.nav-item');if(ni)ni.classList.add('active');}
  else{document.querySelectorAll('.nav-item').forEach(n=>{if(n.getAttribute('onclick')&&n.getAttribute('onclick').includes("'"+name+"'"))n.classList.add('active');});}
  renderPage(name);
}
function openModal(id){document.getElementById(id).classList.add('open');populateModalSelects();}
function closeModal(id){document.getElementById(id).classList.remove('open');}
function toast(msg,type='success'){
  const c=document.getElementById('toasts');
  const t=document.createElement('div');
  const icons={success:'✓',error:'✕',info:'ℹ'};
  t.className='toast t-'+type;
  t.innerHTML=`<span style="font-size:14px;font-weight:700;">${icons[type]||'·'}</span><span>${msg}</span>`;
  c.appendChild(t);requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{t.classList.remove('show');setTimeout(()=>t.remove(),400);},3500);
}
function filterTable(inputId,tbodyId){
  const inp=document.getElementById(inputId);
  const tbody=document.getElementById(tbodyId);
  if(!inp||!tbody)return;
  const q=inp.value.toLowerCase();
  tbody.querySelectorAll('tr').forEach(r=>{
    r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';
  });
}
// Alias so db.js and error-boundary.js can call showToast consistently
window.showToast = function(msg, type){ toast(msg, type); };

// Normalise bin IDs from either intake.bins[] or legacy intake.bin
function getBinIds(intake){
  return (intake.bins && intake.bins.length ? intake.bins : [intake.bin]).filter(Boolean);
}

// Return display label for a bin ID (e.g. 1→"1A", 10→"10A", 21→"1B")
function getBinLabel(id){
  const b = state.bins.find(b => b.id === id || b.id === parseInt(id));
  return b && b.binLabel ? b.binLabel : String(id);
}
