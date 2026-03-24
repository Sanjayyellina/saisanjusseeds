// ============================================================
// UTILITIES — DATE, FORMAT, TOAST
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ============================================================

// ================================================================
// UTILS
// ================================================================
function getMoistureColor(m){
  if(m>28)return 'var(--blue)';if(m>15)return 'var(--amber)';return 'var(--green)';
}
function getMoistureBarColor(m){
  if(m>28)return'linear-gradient(90deg,#3B82F6,#60A5FA)';
  if(m>15)return'linear-gradient(90deg,#F59E0B,#FCD34D)';
  return'linear-gradient(90deg,#10B981,#34D399)';
}
function getMoisturePct(m){return Math.min(100,Math.max(3,(m/42)*100));}
function dateDiff(d){
  if(!d)return 0;
  return Math.floor((Date.now()-new Date(d).getTime())/86400000);
}
function hoursDiff(d){
  if(!d)return 0;
  return Math.floor((Date.now()-new Date(d).getTime())/3600000);
}
function showPage(name,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
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
  const q=document.getElementById(inputId).value.toLowerCase();
  document.querySelectorAll('#'+tbodyId+' tr').forEach(r=>{
    r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';
  });
}
