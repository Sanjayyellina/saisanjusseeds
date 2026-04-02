'use strict';
// ============================================================
// COMMAND PALETTE — ⌘K / Ctrl+K
// Yellina Seeds Operations Platform
// ============================================================

(function() {
  let _open = false;
  let _activeIdx = 0;
  let _filtered = [];

  function _getCommands() {
    const cmds = [
      // Navigation
      { icon: '📊', label: 'Dashboard', sub: 'Go to Dashboard', group: 'Navigate', action: () => navigate('dashboard') },
      { icon: '🌾', label: 'Intake Register', sub: 'Log incoming loads', group: 'Navigate', action: () => navigate('intake') },
      { icon: '🏠', label: 'Bin Monitor', sub: 'Track drying chambers', group: 'Navigate', action: () => navigate('bins') },
      { icon: '🚚', label: 'Dispatch', sub: 'Create dispatch receipts', group: 'Navigate', action: () => navigate('dispatch') },
      { icon: '📋', label: 'Receipts', sub: 'View & verify receipts', group: 'Navigate', action: () => navigate('receipts') },
      { icon: '📈', label: 'Analytics', sub: 'Yield & moisture analytics', group: 'Navigate', action: () => navigate('analytics') },
      { icon: '🔧', label: 'Maintenance', sub: 'Facility maintenance logs', group: 'Navigate', action: () => navigate('maintenance') },
      { icon: '👷', label: 'Labor & Shifts', sub: 'Labor & payroll tracking', group: 'Navigate', action: () => navigate('labor') },
      { icon: '🚛', label: 'Entry Trucks', sub: 'Truck registration & tracking', group: 'Navigate', action: () => navigate('trucks') },
      { icon: '📱', label: 'Field Updates', sub: 'Photos & field readings', group: 'Navigate', action: () => navigate('updates') },
      { icon: '🏗️', label: 'Backyard', sub: 'Stock removal records', group: 'Navigate', action: () => navigate('backyard') },
      { icon: '🔐', label: 'Manager Access', sub: 'Admin controls', group: 'Navigate', action: () => navigate('manager') },
      { icon: '📜', label: 'Audit Log', sub: 'Activity timeline', group: 'Navigate', action: () => navigate('audit') },
      // Quick Actions
      { icon: '➕', label: 'New Intake', sub: 'Log a new corn load', group: 'Actions', action: () => { navigate('intake'); setTimeout(() => document.getElementById('new-intake-btn') && document.getElementById('new-intake-btn').click(), 100); } },
      { icon: '🚚', label: 'New Dispatch', sub: 'Create a dispatch', group: 'Actions', action: () => { navigate('dispatch'); setTimeout(() => document.getElementById('open-dispatch-modal') && document.getElementById('open-dispatch-modal').click(), 100); } },
      { icon: '📱', label: 'New Field Update', sub: 'Post a photo or reading', group: 'Actions', action: () => { navigate('updates'); setTimeout(() => document.getElementById('new-update-btn') && document.getElementById('new-update-btn').click(), 100); } },
      { icon: '🚛', label: 'Register Truck', sub: 'Add a new truck entry', group: 'Actions', action: () => { navigate('trucks'); setTimeout(() => document.getElementById('register-truck-btn') && document.getElementById('register-truck-btn').click(), 100); } },
      { icon: '🔧', label: 'New Maintenance Log', sub: 'Log a maintenance issue', group: 'Actions', action: () => { navigate('maintenance'); setTimeout(() => document.getElementById('new-maint-btn') && document.getElementById('new-maint-btn').click(), 100); } },
    ];

    // Dynamic: bins
    (window.state && window.state.bins || []).forEach(b => {
      if (b.status === 'empty') return;
      const statusEmoji = b.status === 'drying' ? '🔥' : b.status === 'shelling' ? '⚙️' : '✅';
      cmds.push({
        icon: statusEmoji,
        label: 'BIN-' + (b.binLabel || b.id),
        sub: (b.hybrid || '?') + ' \u00b7 ' + (b.currentMoisture || '?') + '% \u00b7 ' + parseInt(b.qty || 0).toLocaleString('en-IN') + ' Kg',
        group: 'Bins',
        action: () => { navigate('bins'); setTimeout(() => window.openBinModal && window.openBinModal(b.id), 200); }
      });
    });

    // Dynamic: recent intakes (last 10)
    (window.state && window.state.intakes || []).slice(0, 10).forEach(i => {
      cmds.push({
        icon: '🌾',
        label: i.challan || String(i.id),
        sub: (i.company || '?') + ' \u00b7 ' + parseInt(i.qty || 0).toLocaleString('en-IN') + ' Kg' + (i.hybrid ? ' \u00b7 ' + i.hybrid : ''),
        group: 'Intakes',
        action: () => { navigate('intake'); }
      });
    });

    // Dynamic: recent dispatches (last 10)
    (window.state && window.state.dispatches || []).slice(0, 10).forEach(d => {
      cmds.push({
        icon: '📄',
        label: d.receiptId || String(d.id),
        sub: (d.party || '?') + ' \u00b7 ' + parseInt(d.qty || 0).toLocaleString('en-IN') + ' Kg',
        group: 'Dispatches',
        action: () => { navigate('dispatch'); setTimeout(() => window.viewReceipt && window.viewReceipt(d.receiptId), 200); }
      });
    });

    return cmds;
  }

  function navigate(page) {
    if (typeof window.showPage === 'function') {
      // find matching nav item
      const navItems = document.querySelectorAll('.nav-item');
      let matched = null;
      navItems.forEach(el => {
        const onclick = el.getAttribute('onclick') || '';
        if (onclick.includes("'" + page + "'") || onclick.includes('"' + page + '"')) {
          matched = el;
        }
      });
      window.showPage(page, matched);
    }
  }

  function _filter(query) {
    const cmds = _getCommands();
    if (!query.trim()) return cmds;
    const q = query.toLowerCase();
    return cmds.filter(c =>
      c.label.toLowerCase().includes(q) ||
      (c.sub || '').toLowerCase().includes(q) ||
      (c.group || '').toLowerCase().includes(q)
    );
  }

  function _renderList() {
    const listEl = document.getElementById('cmd-list');
    if (!listEl) return;
    if (!_filtered.length) {
      listEl.innerHTML = '<div style="padding:32px;text-align:center;color:var(--ink-5);font-size:13px;">No results</div>';
      return;
    }
    let lastGroup = null;
    let html = '';
    _filtered.forEach((cmd, idx) => {
      if (cmd.group !== lastGroup) {
        html += '<div style="padding:6px 16px 4px;font-size:10px;font-weight:700;color:var(--ink-5);text-transform:uppercase;letter-spacing:.08em;">' + cmd.group + '</div>';
        lastGroup = cmd.group;
      }
      const active = idx === _activeIdx;
      html += '<div class="cmd-item' + (active ? ' cmd-active' : '') + '" data-idx="' + idx + '" onclick="window._cmdPalette.execute(' + idx + ')" onmouseenter="window._cmdPalette.setActive(' + idx + ')">' +
        '<span class="cmd-icon">' + cmd.icon + '</span>' +
        '<div class="cmd-text">' +
          '<div class="cmd-label">' + cmd.label + '</div>' +
          (cmd.sub ? '<div class="cmd-sub">' + cmd.sub + '</div>' : '') +
        '</div>' +
        (active ? '<span class="cmd-enter">\u21b5</span>' : '') +
      '</div>';
    });
    listEl.innerHTML = html;
    // Scroll active into view
    const activeEl = listEl.querySelector('.cmd-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function open() {
    if (_open) return;
    _open = true;
    _activeIdx = 0;
    const overlay = document.getElementById('cmd-overlay');
    if (!overlay) return;
    _filtered = _filter('');
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      const modal = overlay.querySelector('.cmd-modal');
      if (modal) modal.style.transform = 'scale(1) translateY(0)';
    });
    const input = document.getElementById('cmd-input');
    if (input) { input.value = ''; input.focus(); }
    _renderList();
  }

  function close() {
    if (!_open) return;
    _open = false;
    const overlay = document.getElementById('cmd-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    const modal = overlay.querySelector('.cmd-modal');
    if (modal) modal.style.transform = 'scale(0.97) translateY(-8px)';
    setTimeout(() => { if (!_open) overlay.style.display = 'none'; }, 180);
  }

  function execute(idx) {
    const cmd = _filtered[idx];
    if (!cmd) return;
    close();
    setTimeout(() => cmd.action(), 50);
  }

  function setActive(idx) {
    _activeIdx = idx;
    _renderList();
  }

  // Keyboard handler
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      _open ? close() : open();
      return;
    }
    if (!_open) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _activeIdx = Math.min(_activeIdx + 1, _filtered.length - 1);
      _renderList();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _activeIdx = Math.max(_activeIdx - 1, 0);
      _renderList();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(_activeIdx);
    }
  });

  // Input handler
  document.addEventListener('input', function(e) {
    if (e.target.id !== 'cmd-input') return;
    _activeIdx = 0;
    _filtered = _filter(e.target.value);
    _renderList();
  });

  // Click outside to close
  document.addEventListener('click', function(e) {
    const overlay = document.getElementById('cmd-overlay');
    if (!overlay || !_open) return;
    const modal = overlay.querySelector('.cmd-modal');
    if (modal && !modal.contains(e.target) && e.target !== overlay && overlay.contains(e.target)) {
      close();
    }
    if (e.target === overlay) close();
  });

  // Expose globally
  window._cmdPalette = { open, close, execute, setActive };
})();
