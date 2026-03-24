// ============================================================
// CRYPTO — HASH & VERIFY
"use strict";
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// CRYPTO
// ================================================================
function djb2(str){
  let h=5381;for(let i=0;i<str.length;i++)h=((h<<5)+h)^str.charCodeAt(i);
  return (h>>>0).toString(16).padStart(8,'0');
}
function fnv1a(str){
  let h=0x811c9dc5;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=(h*0x01000193)>>>0;}
  return h.toString(16).padStart(8,'0');
}
function murmur(str,seed=0){
  let h=seed;for(let i=0;i<str.length;i++){let k=str.charCodeAt(i);k*=0xcc9e2d51;k=(k<<15)|(k>>>17);k*=0x1b873593;h^=k;h=(h<<13)|(h>>>19);h=h*5+0xe6546b64;}
  h^=str.length;h^=h>>>16;h*=0x85ebca6b;h^=h>>>13;h*=0xc2b2ae35;h^=h>>>16;
  return (h>>>0).toString(16).padStart(8,'0');
}
function generateHash(d){
  const canon=[d.receiptId,d.date,d.party.toUpperCase().trim(),d.vehicle.toUpperCase().trim(),
    d.hybrid.toUpperCase().trim(),d.lot,String(d.bags),String(d.qty),String(d.amount),
    'YELLINA-SEEDS-SATHUPALLY-2026'].join('||');
  const rounds=[];
  let seed=canon;
  for(let i=0;i<4;i++){seed=djb2(seed+i)+fnv1a(seed+i)+murmur(seed+i,i*31337);}
  for(let i=0;i<8;i++)rounds.push(djb2(seed+i)+fnv1a(murmur(seed,i)));
  return rounds.join('').toUpperCase();
}
function generateSignature(d){
  const ts=new Date(d.dateTS||new Date()).getTime();
  const p1=djb2(d.receiptId+ts+d.amount+'YELLINA');
  const p2=fnv1a(d.party+d.bags+'SEC2026');
  const p3=murmur(d.hash+'LOCK',0xDEADBEEF);
  const p4=djb2(p1+p2+p3);
  return [p1,p2,p3,p4].join('').toUpperCase();
}
function verifyHash(d){return generateHash(d)===d.hash;}
