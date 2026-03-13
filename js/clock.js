// ============================================================
// LIVE CLOCK
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// CLOCK
// ================================================================
setInterval(()=>{
  document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-IN',{hour12:false});
},1000);
