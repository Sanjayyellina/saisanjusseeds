// ============================================================
// CONFIG — Application-wide constants for Yellina Seeds Platform
// Change values here; they propagate everywhere automatically.
// v2
// ============================================================
'use strict';

const Config = Object.freeze({
  // Drying target hours before a bin is considered complete
  TARGET_HRS: 109,

  // Moisture thresholds (%)
  TARGET_MOISTURE: 10,   // ideal dispatch moisture
  MOISTURE_MID:    15,   // above this → amber warning zone
  MOISTURE_HIGH:   28,   // above this → blue high-humidity zone

  // Facility
  BIN_COUNT: 20,

  // Time helpers (ms)
  MS_PER_DAY:  86400000,
  MS_PER_HOUR: 3600000,

  // Cost & Margin
  DRYING_COST_PER_KG: 1.5,  // Rs per Kg — estimated electricity + labor
});
