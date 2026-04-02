'use strict';
// ============================================================
// NOTIFICATIONS — Yellina Seeds Operations Platform
// Browser Notification API (foreground + background-tab)
// ============================================================

window._notifiedBins    = window._notifiedBins    || new Set();
window._notifiedIntakes = window._notifiedIntakes || new Set();

async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  updateNotifPermBtn();
}

function _fireNotif(title, body, icon, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    // Use service worker registration if available for background support
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, {
          body,
          icon: icon || '/assets/favicon.png',
          badge: '/assets/favicon.png',
          tag: tag || 'yellina-notif',
          renotify: false,
          data: { url: '/' }
        });
      }).catch(() => {
        new Notification(title, { body, icon: icon || '/assets/favicon.png', tag });
      });
    } else {
      new Notification(title, { body, icon: icon || '/assets/favicon.png', tag });
    }
  } catch(e) { console.warn('Notification failed:', e); }
}

function checkAndFireNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const bins     = window.state?.bins     || [];
  const TARGET   = window.Config?.TARGET_MOISTURE || 10;
  const TARGET_HRS = window.Config?.TARGET_HRS || 96;

  bins.forEach(b => {
    if (b.status === 'empty') return;
    const label = `BIN-${b.binLabel || b.id}`;

    // Bin reached target moisture
    if ((b.currentMoisture || 99) <= TARGET && !window._notifiedBins.has(`ready-${b.id}`)) {
      window._notifiedBins.add(`ready-${b.id}`);
      _fireNotif(
        `${label} Ready to Dispatch`,
        `${b.hybrid || 'Corn'} reached ${b.currentMoisture}% moisture — target achieved`,
        '/assets/favicon.png',
        `bin-ready-${b.id}`
      );
    }

    // Bin overdue
    const hoursIn = b.intakeDateTS ? Math.floor((Date.now() - b.intakeDateTS) / 3600000) : 0;
    if (hoursIn > TARGET_HRS && !window._notifiedBins.has(`overdue-${b.id}`)) {
      window._notifiedBins.add(`overdue-${b.id}`);
      _fireNotif(
        `${label} Overdue`,
        `${b.hybrid || 'Corn'} has been in the dryer for ${hoursIn}h (target: ${TARGET_HRS}h)`,
        '/assets/favicon.png',
        `bin-overdue-${b.id}`
      );
    }
  });

  // Reset "ready" notification if bin gets emptied (so next fill can re-notify)
  window._notifiedBins.forEach(key => {
    if (key.startsWith('ready-')) {
      const id = parseInt(key.replace('ready-', ''));
      const bin = bins.find(b => b.id === id);
      if (!bin || bin.status === 'empty') window._notifiedBins.delete(key);
    }
  });
}

function updateNotifPermBtn() {
  const btn = document.getElementById('notif-perm-btn');
  if (!btn) return;
  if (!('Notification' in window)) { btn.style.display = 'none'; return; }
  btn.style.display = Notification.permission === 'default' ? 'flex' : 'none';
}

window.checkAndFireNotifications = checkAndFireNotifications;
window.requestNotifPermission    = requestNotifPermission;
window.updateNotifPermBtn        = updateNotifPermBtn;

// Call once DOM is ready
document.addEventListener('DOMContentLoaded', updateNotifPermBtn);
