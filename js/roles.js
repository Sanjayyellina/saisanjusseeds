'use strict';
// ============================================================
// ROLE-BASED ACCESS CONTROL — Yellina Seeds
// Roles: super_admin > manager > operator > viewer
// ============================================================

const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', icon: '🔑', color: '#F5A623', bg: '#FEF3C7' },
  manager:     { label: 'Manager',     icon: '👔', color: '#3B82F6', bg: '#EFF6FF' },
  operator:    { label: 'Operator',    icon: '⚙️', color: '#10B981', bg: '#ECFDF5' },
  viewer:      { label: 'Viewer',      icon: '👁️', color: '#6B7280', bg: '#F9FAFB' },
};

// What each role CAN do (permissions accumulate upward)
const ROLE_PERMS = {
  viewer:      ['read'],
  operator:    ['read', 'create_intake', 'update_bin', 'create_field_update', 'create_labor', 'create_maintenance', 'register_truck'],
  manager:     ['read', 'create_intake', 'update_bin', 'create_field_update', 'create_labor', 'create_maintenance', 'register_truck', 'create_dispatch', 'edit_intake', 'edit_dispatch', 'edit_maintenance', 'edit_labor', 'backyard_removal', 'manager_access'],
  super_admin: ['read', 'create_intake', 'update_bin', 'create_field_update', 'create_labor', 'create_maintenance', 'register_truck', 'create_dispatch', 'edit_intake', 'edit_dispatch', 'edit_maintenance', 'edit_labor', 'backyard_removal', 'manager_access', 'user_management'],
};

function canDo(perm) {
  const role = window.state?.userRole || 'manager';
  return (ROLE_PERMS[role] || ROLE_PERMS.manager).includes(perm);
}

// Apply role gates to the DOM — hide elements the user can't access
function applyRoleGates() {
  const role = window.state?.userRole || 'manager';

  // Update role badge in topbar
  updateRoleBadge(role);

  // Elements with data-requires-perm attribute: hide if user lacks permission
  document.querySelectorAll('[data-requires-perm]').forEach(el => {
    const perm = el.getAttribute('data-requires-perm');
    el.style.display = canDo(perm) ? '' : 'none';
  });

  // Viewer: disable all form inputs and buttons inside tab-content (read-only mode)
  if (role === 'viewer') {
    document.querySelectorAll('.tab-content button:not(.view-only-ok), .tab-content input, .tab-content select, .tab-content textarea').forEach(el => {
      el.disabled = true;
      el.style.opacity = '0.5';
      el.style.cursor = 'not-allowed';
    });
  }
}

function updateRoleBadge(role) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.manager;
  const badge = document.getElementById('role-badge');
  if (!badge) return;
  badge.innerHTML = `<span style="font-size:12px;">${cfg.icon}</span><span style="font-size:11px;font-weight:700;color:${cfg.color};">${cfg.label}</span>`;
  badge.style.background = cfg.bg;
  badge.style.borderColor = cfg.color + '40';
}

window.canDo = canDo;
window.applyRoleGates = applyRoleGates;
window.ROLE_CONFIG = ROLE_CONFIG;
