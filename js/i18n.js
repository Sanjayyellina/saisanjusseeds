// ================================================================
// MULTI-LANGUAGE SUPPORT (i18n)
// Yellina Seeds Private Limited — Operations Platform
"use strict";
// ================================================================

let currentLang = localStorage.getItem('yellina_lang') || 'en';

const translations = {
  en: {
    nav: {
      overview: 'OVERVIEW',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      operations: 'OPERATIONS',
      plantOperations: 'PLANT OPERATIONS',
      intake: 'Intake',
      binMonitor: 'Bin Monitor',
      moistureLog: 'Moisture Log',
      logistics: 'DISPATCH & FINANCE',
      dispatch: 'Dispatch',
      receipts: 'Receipts',
      security: 'SECURITY',
      verifyReceipt: 'Verify Receipt',
      managerAccess: 'Manager Access',
      maintenance: 'Maintenance Log',
      labor: 'Labor & Shifts'
    },
    dash: {
      avgDryingTime: 'Avg Drying Time',
      totalIntake: 'Total Intake (T)',
      binsReady: 'Bins Ready',
      drying: 'Drying',
      dispatches: 'Dispatches',
      avgDryingMs: 'Avg Moisture',
      recentIntakes: 'Recent Intakes',
      recentDispatches: 'Recent Dispatches',
      noIntakes: 'No intakes yet',
      noDispatches: 'No dispatches yet',
      onTarget: '✓ On target',
      progressing: 'Progressing',
      high: 'High',
      date: 'Date',
      challan: 'Challan',
      vehicle: 'Vehicle',
      hybrid: 'Hybrid',
      qty: 'Qty',
      bin: 'Bin',
      status: 'Status',
      bags: 'Bags',
      amount: 'Amount',
      receipt: 'Receipt'
    },
    bins: {
      active: 'Active Bins',
      all: 'All Bins',
      emptyState: 'No active bins',
      status: {
        empty: 'Empty',
        intake: 'Intake',
        drying: 'Drying',
        ready: 'Ready',
        shelling: 'Shelling'
      },
      airflow: {
        up: '↑ Top',
        down: '↓ Bottom'
      },
      entry: 'Entry',
      day: 'Day',
      of: 'of'
    },
    intake: {
      title: 'Intake Register',
      subtitle: 'All incoming corn loads',
      newIntake: 'New Intake',
      table: {
        location: 'From',
        lot: 'Lot No',
        vehWt: 'Veh. Wt (Kg)',
        grossWt: 'Gross Wt (Kg)',
        netWt: 'Net Wt (Kg)',
        moisture: 'Moisture %'
      },
      modal: {
        title: 'New Intake Entry',
        truck: 'Truck & Transport',
        seed: 'Seed Details',
        alloc: 'Bin Assignments',
        company: 'Company',
        addBin: '+ Add Bin',
        assignBin: 'Assign to Bin',
        allocQty: 'Allocated Qty (Tons)',
        lr: 'LR Number',
        remarks: 'Remarks',
        save: 'Save Intake'
      }
    },
    dispatch: {
      title: 'Dispatch Register',
      subtitle: 'Outgoing loads and receipts',
      newDispatch: '+ New Dispatch',
      modal: {
        title: 'New Dispatch',
        receiver: 'Receiver',
        party: 'Party / Firm Name',
        address: 'Address / Location',
        fromBin: 'From Bin',
        totalQty: 'Total Qty (Kg)',
        moisture: 'Final Moisture %',
        finances: 'Finances',
        rate: 'Rate per Kg (₹)',
        adv: 'Advance Paid (₹)',
        save: 'Generate Receipt'
      }
    },
    receipts: {
      title: 'Digital Receipts',
      subtitle: 'Cryptographically signed dispatch records',
      verify: 'Verify Receipt Authenticity',
      verifySub: 'Paste a receipt hash to verify origin',
      hashInput: 'Paste 64-character hash...',
      checkBtn: 'Verify',
      verified: '✓ Verified',
      bags: 'bags'
    },
    actions: {
      cancel: 'Cancel',
      close: 'Close',
      print: 'Print',
      copyHash: 'Copy Hash',
      view: 'View',
      saveAll: 'Save All Changes',
      save: 'Save Log',
      unlock: 'Unlock',
      export: 'Export to Excel'
    },
    export: {
      title: 'Export Data to Excel',
      subtitle: 'Select the datasets you wish to include in the downloaded spreadsheet:',
      optBins: 'Bins State',
      optIntake: 'Intake Logs',
      optDispatch: 'Dispatch Receipts',
      optMaintenance: 'Maintenance Logs',
      optLabor: 'Labor Logs',
      downloadBtn: 'Download .xlsx'
    },
    manager: {
      title: 'Manager Access',
      enterPin: 'Enter PIN',
      control: 'Manager Bin Control',
      moistureUpdater: 'Manager Moisture Updater'
    },
    analytics: {
      dailyIntake: 'Daily Intake Volume (Tons)',
      thisWeek: 'this week',
      hybridMix: 'Hybrid Mix',
      moistureCurve: 'Moisture Reduction Curve',
      dispatchPerf: 'Dispatch Performance',
      binUtil: 'Bin Utilization',
      today: 'Today',
      sun: 'Sun',
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      unknown: 'Unknown'
    },
    maint: {
      subtitle: 'Record and track equipment maintenance and purchases.',
      newLog: 'New Log',
      date: 'Date',
      reportedBy: 'Reported By',
      equipment: 'Equipment',
      issue: 'Issue Description',
      workDone: 'Work Done',
      checkedBy: 'Checked By',
      cost: 'Payment/Cost (₹)',
      items: 'Items Bought'
    },
    labor: {
      subtitle: 'Track daily labor distribution and headcounts.',
      newLog: 'New Labor Log',
      shift: 'Shift Timings',
      role: 'Role/Area',
      roleOther: 'Describe Role',
      headcount: 'Headcount',
      people: 'People (Names)',
      remarks: 'Remarks'
    }
  },
  hi: {
    nav: {
      overview: 'अवलोकन',
      dashboard: 'डैशबोर्ड',
      analytics: 'एनालिटिक्स',
      operations: 'संचालन',
      plantOperations: 'संयंत्र संचालन',
      intake: 'आवक (Intake)',
      binMonitor: 'बिन मॉनिटर',
      moistureLog: 'नमी लॉग',
      logistics: 'डिस्पैच और वित्त',
      dispatch: 'डिस्पैच',
      receipts: 'रसीदें',
      security: 'सुरक्षा',
      verifyReceipt: 'रसीद सत्यापित करें',
      managerAccess: 'प्रबंधक पहुंच',
      maintenance: 'रखरखाव लॉग',
      labor: 'श्रम और शिफ्ट'
    },
    dash: {
      avgDryingTime: 'औसत सुखाने का समय',
      totalIntake: 'कुल आवक (T)',
      binsReady: 'बिन तैयार',
      drying: 'सूख रहा है',
      dispatches: 'डिस्पैच',
      avgDryingMs: 'औसत नमी',
      recentIntakes: 'हाल की आवक',
      recentDispatches: 'हाल के डिस्पैच',
      noIntakes: 'कोई आवक नहीं',
      noDispatches: 'कोई डिस्पैच नहीं',
      onTarget: '✓ लक्ष्य पर',
      progressing: 'प्रगति पर',
      high: 'उच्च',
      date: 'तारीख',
      challan: 'चालान',
      vehicle: 'वाहन',
      hybrid: 'हाइब्रिड',
      qty: 'मात्रा',
      bin: 'बिन',
      status: 'स्थिति',
      bags: 'बैग',
      amount: 'राशि',
      receipt: 'रसीद'
    },
    bins: {
      active: 'सक्रिय बिन',
      all: 'सभी बिन',
      emptyState: 'कोई सक्रिय बिन नहीं',
      status: {
        empty: 'खाली',
        intake: 'आवक',
        drying: 'सूख रहा है',
        ready: 'तैयार',
        shelling: 'शेलिंग'
      },
      airflow: {
        up: '↑ ऊपर',
        down: '↓ नीचे'
      },
      entry: 'प्रवेश',
      day: 'दिन',
      of: 'का'
    },
    intake: {
      title: 'आवक रजिस्टर',
      subtitle: 'सभी आने वाले मक्के के लोड',
      newIntake: 'नई आवक',
      table: {
        location: 'स्थान से',
        lot: 'लॉट नंबर',
        vehWt: 'वाहन वजन (Kg)',
        grossWt: 'सकल वजन (Kg)',
        netWt: 'शुद्ध वजन (Kg)',
        moisture: 'नमी %'
      },
      modal: {
        title: 'नई आवक प्रविष्टि',
        truck: 'ट्रक और परिवहन',
        seed: 'बीज विवरण',
        alloc: 'बिन आवंटन',
        company: 'कंपनी',
        addBin: '+ बिन जोड़ें',
        assignBin: 'बिन को सौंपें',
        allocQty: 'आवंटित मात्रा (टन)',
        lr: 'LR नंबर',
        remarks: 'टिप्पणियाँ',
        save: 'आवक सेव करें'
      }
    },
    dispatch: {
      title: 'डिस्पैच रजिस्टर',
      subtitle: 'जाने वाले लोड और रसीदें',
      newDispatch: '+ नया डिस्पैच',
      modal: {
        title: 'नया डिस्पैच',
        receiver: 'प्राप्तकर्ता',
        party: 'पार्टी / फर्म का नाम',
        address: 'पता / स्थान',
        fromBin: 'बिन से',
        totalQty: 'कुल मात्रा (Kg)',
        moisture: 'अंतिम नमी %',
        finances: 'वित्त',
        rate: 'दर प्रति किग्रा (₹)',
        adv: 'अग्रिम भुगतान (₹)',
        save: 'रसीद जनरेट करें'
      }
    },
    receipts: {
      title: 'डिजिटल रसीदें',
      subtitle: 'क्रिप्टोग्राफिक रूप से हस्ताक्षरित डिस्पैच रिकॉर्ड',
      verify: 'रसीद की प्रामाणिकता सत्यापित करें',
      verifySub: 'मूल सत्यापित करने के लिए रसीद हैश पेस्ट करें',
      hashInput: '64-कैरेक्टर हैश पेस्ट करें...',
      checkBtn: 'सत्यापित करें',
      verified: '✓ सत्यापित',
      bags: 'बैग'
    },
    actions: {
      cancel: 'रद्द करें',
      close: 'बंद करें',
      print: 'प्रिंट',
      copyHash: 'हैश कॉपी करें',
      view: 'देखें',
      saveAll: 'सभी परिवर्तन सहेजें',
      save: 'लॉग सहेजें',
      unlock: 'अनलॉक करें',
      export: 'Excel में निर्यात करें'
    },
    export: {
      title: 'Excel में डेटा निर्यात करें',
      subtitle: 'डाउनलोड की गई स्प्रेडशीट में शामिल करने के लिए डेटासेट चुनें:',
      optBins: 'बिन स्थिति',
      optIntake: 'आवक लॉग',
      optDispatch: 'डिस्पैच रसीदें',
      optMaintenance: 'रखरखाव लॉग',
      optLabor: 'श्रम लॉग',
      downloadBtn: '.xlsx डाउनलोड करें'
    },
    manager: {
      title: 'प्रबंधक पहुंच',
      enterPin: 'पिन दर्ज करें',
      control: 'प्रबंधक बिन नियंत्रण',
      moistureUpdater: 'प्रबंधक नमी अद्यतनकर्ता'
    },
    analytics: {
      dailyIntake: 'दैनिक आवक मात्रा (टन)',
      thisWeek: 'इस सप्ताह',
      hybridMix: 'हाइब्रिड मिश्रण',
      moistureCurve: 'नमी कम करने का वक्र',
      dispatchPerf: 'डिस्पैच प्रदर्शन',
      binUtil: 'बिन उपयोग',
      today: 'आज',
      sun: 'रवि',
      mon: 'सोम',
      tue: 'मंगल',
      wed: 'बुध',
      thu: 'गुरु',
      fri: 'शुक्र',
      sat: 'शनि',
      unknown: 'अज्ञात'
    },
    maint: {
      subtitle: 'उपकरण रखरखाव और खरीद को रिकॉर्ड और ट्रैक करें।',
      newLog: 'नया लॉग',
      date: 'तारीख',
      reportedBy: 'रिपोर्ट करने वाला',
      equipment: 'उपकरण',
      issue: 'समस्या का विवरण',
      workDone: 'काम पूरा हुआ',
      checkedBy: 'द्वारा जांचा गया',
      cost: 'भुगतान/लागत (₹)',
      items: 'खरीदे गए सामान'
    },
    labor: {
      subtitle: 'दैनिक श्रम वितरण और कुल संख्या को ट्रैक करें।',
      newLog: 'नया श्रम लॉग',
      shift: 'शिफ्ट का समय',
      role: 'भूमिका/क्षेत्र',
      roleOther: 'भूमिका का वर्णन करें',
      headcount: 'कुल संख्या',
      people: 'लोग (नाम)',
      remarks: 'टिप्पणियाँ'
    }
  },
  te: {
    nav: {
      overview: 'అవలోకనం',
      dashboard: 'డాష్‌బోర్డ్',
      analytics: 'విశ్లేషణలు',
      operations: 'కార్యకలాపాలు',
      plantOperations: 'ప్లాంట్ ఆపరేషన్స్',
      intake: 'దిగుమతి (Intake)',
      binMonitor: 'బిన్ మానిటర్',
      moistureLog: 'తేమ లాగ్',
      logistics: 'డిస్పాచ్ & ఫైనాన్స్',
      dispatch: 'డిస్పాచ్',
      receipts: 'రసీదులు',
      security: 'భద్రత',
      verifyReceipt: 'రసీదును ధృవీకరించండి',
      managerAccess: 'మేనేజర్ యాక్సెస్',
      maintenance: 'నిర్వహణ లాగ్',
      labor: 'కార్మికులు & షిఫ్ట్‌లు'
    },
    dash: {
      avgDryingTime: 'సగటు ఆరబెట్టే సమయం',
      totalIntake: 'మొత్తం దిగుమతి (T)',
      binsReady: 'సిద్ధంగా ఉన్న బిన్స్',
      drying: 'ఎండబెట్టడం',
      dispatches: 'డిస్పాచ్‌లు',
      avgDryingMs: 'సగటు తేమ',
      recentIntakes: 'ఇటీవలి దిగుమతులు',
      recentDispatches: 'ఇటీవలి డిస్పాచ్‌లు',
      noIntakes: 'దిగుమతులు లేవు',
      noDispatches: 'డిస్పాచ్‌లు లేవు',
      onTarget: '✓ లక్ష్యంలో ఉంది',
      progressing: 'నిర్వహణలో ఉంది',
      high: 'ఎక్కువగా',
      date: 'తేదీ',
      challan: 'చలాన్',
      vehicle: 'వాహనం',
      hybrid: 'హైబ్రిడ్',
      qty: 'పరిమాణం',
      bin: 'బిన్',
      status: 'స్థితి',
      bags: 'బ్యాగులు',
      amount: 'మొత్తం',
      receipt: 'రసీదు'
    },
    bins: {
      active: 'సక్రియ బిన్స్',
      all: 'అన్ని బిన్స్',
      emptyState: 'సక్రియ బిన్స్ లేవు',
      status: {
        empty: 'ఖాళీ',
        intake: 'దిగుమతి',
        drying: 'ఎండబెట్టడం',
        ready: 'సిద్ధంగా ఉంది',
        shelling: 'షెల్లింగ్'
      },
      airflow: {
        up: '↑ పైన',
        down: '↓ కింద'
      },
      entry: 'ప్రవేశం',
      day: 'రోజు',
      of: 'యొక్క'
    },
    intake: {
      title: 'దిగుమతి రిజిస్టర్',
      subtitle: 'అన్ని మొక్కజొన్న లోడ్లు',
      newIntake: 'కొత్త దిగుమతి',
      table: {
        location: 'నుండి',
        lot: 'లాట్ నం',
        vehWt: 'వాహనం బరువు (Kg)',
        grossWt: 'స్థూల బరువు (Kg)',
        netWt: 'నికర బరువు (Kg)',
        moisture: 'తేమ %'
      },
      modal: {
        title: 'కొత్త దిగుమతి నమోదు',
        truck: 'ట్రక్ & రవాణా',
        seed: 'విత్తన వివరాలు',
        alloc: 'బిన్ కేటాయింపులు',
        company: 'కంపెనీ',
        addBin: '+ బిన్ జోడించండి',
        assignBin: 'బిన్‌కు కేటాయించండి',
        allocQty: 'కేటాయించిన పరిమితి (టన్నులు)',
        lr: 'LR నంబర్',
        remarks: 'వ్యాఖ్యలు',
        save: 'సేవ్ చేయండి'
      }
    },
    dispatch: {
      title: 'డిస్పాచ్ రిజిస్టర్',
      subtitle: 'బయటికి వెళ్లే లోడ్లు',
      newDispatch: '+ కొత్త డిస్పాచ్',
      modal: {
        title: 'కొత్త డిస్పాచ్',
        receiver: 'స్వీకర్త',
        party: 'పార్టీ / సంస్థ పేరు',
        address: 'చిరునామా / ప్రాంతం',
        fromBin: 'ఏ బిన్ నుండి',
        totalQty: 'మొత్తం పరిమాణం (Kg)',
        moisture: 'తుది తేమ %',
        finances: 'ఫైనాన్స్',
        rate: 'కిలోకు రేటు (₹)',
        adv: 'అడ్వాన్స్ చెల్లింపు (₹)',
        save: 'రసీదు సృష్టించండి'
      }
    },
    receipts: {
      title: 'డిజిటల్ రసీదులు',
      subtitle: 'క్రిప్టోగ్రాఫిక్ సంతకం చేసిన రికార్డులు',
      verify: 'రసీదును ధృవీకరించండి',
      verifySub: 'ధృవీకరించడానికి రసీదు హాష్‌ను పేస్ట్ చేయండి',
      hashInput: '64-అక్షరాల హాష్ పేస్ట్ చేయండి...',
      checkBtn: 'ధృవీకరించండి',
      verified: '✓ ధృవీకరించబడింది',
      bags: 'బ్యాగులు'
    },
    actions: {
      cancel: 'రద్దు చేయండి',
      close: 'మూసివేయండి',
      print: 'ప్రింట్',
      copyHash: 'హాష్ కాపీ చేయండి',
      view: 'చూడండి',
      saveAll: 'మార్పులను సేవ్ చేయండి',
      save: 'లాగ్ సేవ్ చేయండి',
      unlock: 'అన్లాక్ చేయండి',
      export: 'Excelకు ఎగుమతి చేయండి'
    },
    export: {
      title: 'Excelకు డేటాను ఎగుమతి చేయండి',
      subtitle: 'స్ప్రెడ్‌షీట్‌లో చేర్చవలసిన డేటాసెట్‌లను ఎంచుకోండి:',
      optBins: 'బిన్ స్థితి',
      optIntake: 'దిగుమతి లాగ్‌లు',
      optDispatch: 'డిస్పాచ్ రసీదులు',
      optMaintenance: 'నిర్వహణ లాగ్‌లు',
      optLabor: 'కార్మికుల లాగ్‌లు',
      downloadBtn: '.xlsx డౌన్‌లోడ్ చేయండి'
    },
    manager: {
      title: 'మేనేజర్ యాక్సెస్',
      enterPin: 'పిన్ నమోదు చేయండి',
      control: 'మేనేజర్ బిన్ నియంత్రణ',
      moistureUpdater: 'మేనేజర్ తేమ అప్‌డేటర్'
    },
    analytics: {
      dailyIntake: 'రోజువారీ దిగుమతి పరిమాణం (టన్నులు)',
      thisWeek: 'ఈ వారం',
      hybridMix: 'హైబ్రిడ్ మిశ్రమం',
      moistureCurve: 'తేమ తగ్గింపు రేఖ',
      dispatchPerf: 'డిస్పాచ్ పనితీరు',
      binUtil: 'బిన్ వినియోగం',
      today: 'ఈ రోజు',
      sun: 'ఆది',
      mon: 'సోమ',
      tue: 'మంగళ',
      wed: 'బుధ',
      thu: 'గురు',
      fri: 'శుక్ర',
      sat: 'శని',
      unknown: 'తెలియలేదు'
    },
    maint: {
      subtitle: 'పరికరాల నిర్వహణ మరియు కొనుగోళ్లను రికార్డ్ చేయండి.',
      newLog: 'కొత్త లాగ్',
      date: 'తేదీ',
      reportedBy: 'నివేదించిన వారు',
      equipment: 'సామగ్రి',
      issue: 'సమస్య వివరణ',
      workDone: 'చేసిన పని',
      checkedBy: 'తనిఖీ చేసినవారు',
      cost: 'చెల్లింపు/ఖర్చు (₹)',
      items: 'కొన్న వస్తువులు'
    },
    labor: {
      subtitle: 'రోజువారీ కార్మికుల పంపిణీ మరియు సంఖ్యను రేఖాగణితంగా ట్రాక్ చేయండి.',
      newLog: 'కొత్త కార్మికుల లాగ్',
      shift: 'షిఫ్ట్ సమయాలు',
      role: 'పాత్ర/ప్రాంతం',
      roleOther: 'పాత్రను వివరించండి',
      headcount: 'మొత్తం సంఖ్య',
      people: 'వ్యక్తులు (పేర్లు)',
      remarks: 'వ్యాఖ్యలు'
    }
  }
};

function t(keyPath) {
  const keys = keyPath.split('.');
  let val = translations[currentLang];
  for (let k of keys) {
    if (val && val[k] !== undefined) {
      val = val[k];
    } else {
      return keyPath; // fallback to key
    }
  }
  return val || keyPath;
}

function changeLanguage(langCode) {
  if (!translations[langCode]) return;
  currentLang = langCode;
  localStorage.setItem('yellina_lang', langCode);
  
  // Update static elements that have data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translatedText = t(key);
    
    // Some elements might have inner HTML we want to preserve (like icons)
    // For simplicity, if it contains an SVG, we just change child text nodes
    // but the safest approach for mixed content is specific handling or span wrappers.
    // Assuming mostly pure text for now:
    
    // Check if element has child elements
    if (el.children.length === 0) {
      el.textContent = translatedText;
    } else {
      // Find the text node and replace its content
      for (let node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
          node.nodeValue = " " + translatedText + " ";
          break;
        }
      }
    }
  });

  // Re-render dynamic content by triggering the page re-render
  if (typeof renderPage === 'function' && typeof state !== 'undefined') {
    renderPage(state.currentPage || 'dashboard');
    // Also re-render top stats if on dashboard
    if(state.currentPage === 'dashboard') {
        renderPage('dashboard');
    }
  }
}

// Initial translation run after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  changeLanguage(currentLang);
});
