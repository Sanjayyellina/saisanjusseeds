// ============================================================
// SEED DATA — REAL CHALLANS
// Yellina Seeds Private Limited — Operations Platform
// ============================================================

// ================================================================
// SEED DATA (from your real challans)
// ================================================================
function seedData(){
  const ago=(d)=>{const dt=new Date();dt.setDate(dt.getDate()-d);return dt;};
  const fmt=(d)=>d.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const fmtD=(d)=>d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});

  state.intakes=[
    {id:'INT-001',date:fmt(ago(5)),dateTS:ago(5),challan:'169',vehicle:'TS08UD5119',location:'Thatisubbanapudem (Vi)',company:'Yellina',hybrid:'DS-255 — Peddagawndla Srinu',lot:'255202',qty:11.775,pkts:339,entryMoisture:36.5,bin:3,lr:'68',status:'drying'},
    {id:'INT-002',date:fmt(ago(5)),dateTS:ago(5),challan:'221',vehicle:'AP16TS4727',location:'Chinnampet (Vi), Eluru (Dt)',company:'Yellina',hybrid:'513 — Yerra Chinnababu',lot:'CCBEH0048',qty:7.56,pkts:216,entryMoisture:34.2,bin:4,lr:'120',status:'drying'},
    {id:'INT-003',date:fmt(ago(4)),dateTS:ago(4),challan:'178',vehicle:'AP39WF7419',location:'Kukunoor (V), Khammam',company:'Yellina',hybrid:'YS-07 (DS-25)',lot:'025042',qty:3.86,pkts:92,entryMoisture:36.6,bin:10,lr:'',status:'drying'},
    {id:'INT-004',date:fmt(ago(4)),dateTS:ago(4),challan:'222',vehicle:'TG04T0845',location:'Chinnampet (Vi), Eluru (Dt)',company:'Yellina',hybrid:'513 — Pakalapati Satya Narayana',lot:'CCBEH0060',qty:13.94,pkts:405,entryMoisture:35.1,bin:5,lr:'122',status:'ready'},
    {id:'INT-005',date:fmt(ago(3)),dateTS:ago(3),challan:'220',vehicle:'AP16TS4727',location:'Chinnampet (Vi)',company:'Yellina',hybrid:'513 — Kalikina Venkati Swarao',lot:'CCBEH0026A',qty:1.115,pkts:31,entryMoisture:33.8,bin:6,lr:'',status:'drying'},
    {id:'INT-006',date:fmt(ago(3)),dateTS:ago(3),challan:'219',vehicle:'AP16TS4727',location:'Chinnampet (Vi)',company:'Yellina',hybrid:'513 — Danne Vinod',lot:'CCBEH0028',qty:6.8,pkts:194,entryMoisture:34.5,bin:7,lr:'',status:'drying'},
  ];

  const binMap = {
    3:{hybrid:'DS-255 — Peddagawndla Srinu',qty:11.775,pkts:339,entryMoisture:36.5,currentMoisture:22.4,status:'drying',airflow:'down'},
    4:{hybrid:'513 — Yerra Chinnababu',qty:7.56,pkts:216,entryMoisture:34.2,currentMoisture:18.1,status:'drying',airflow:'up'},
    5:{hybrid:'513 — Pakalapati Satya Narayana',qty:13.94,pkts:405,entryMoisture:35.1,currentMoisture:10.3,status:'ready',airflow:'down'},
    6:{hybrid:'513 — Kalikina Venkati Swarao',qty:1.115,pkts:31,entryMoisture:33.8,currentMoisture:28.2,status:'drying',airflow:'up'},
    7:{hybrid:'513 — Danne Vinod',qty:6.8,pkts:194,entryMoisture:34.5,currentMoisture:25.7,status:'drying',airflow:'up'},
    10:{hybrid:'YS-07 (DS-25)',qty:3.86,pkts:92,entryMoisture:36.6,currentMoisture:31.5,status:'intake',airflow:'up'},
  };
  state.intakes.forEach(i=>{
    const bm=binMap[i.bin];
    if(!bm)return;
    const b=state.bins[i.bin-1];
    Object.assign(b,bm);b.company=i.company;b.lot=i.lot;
    b.intakeDate=i.date;b.intakeDateTS=i.dateTS;b.intakeRef=i.id;
  });

  const d0=ago(5);
  state.dispatches=[{
    receiptId:'YDS-2026-001001',dateTS:d0,
    date:fmtD(d0),
    party:'Sai Sanjus Seeds',
    address:'Bayannagudem (Vi), Penubally (Md), Khammam (Dt), T.S.',
    vehicle:'TS08UD5119',lr:'68',
    hybrid:'DS-255 — Peddagawndla Srinu',
    lot:'255202',bin:3,bags:339,qty:11775,
    moisture:10.3,amount:230000,remarks:'',
    hash:'',signature:''
  }];
  state.dispatches[0].hash=generateHash(state.dispatches[0]);
  state.dispatches[0].signature=generateSignature(state.dispatches[0]);
  state.receiptCounter=1002;
}
