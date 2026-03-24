"use strict";

/**
 * Global Error Boundary
 * Catches unhandled exceptions and promise rejections to prevent silent failures
 * and provide user-friendly feedback.
 */

window.addEventListener('error', function(event) {
    console.error('[Global Error Boundary] Caught exception:', event.error || event.message);
    
    // Show a user-friendly toast message
    if (typeof showToast === 'function') {
        showToast('An unexpected error occurred. Please refresh the page.', 'error');
    }
    
    // In a real FAANG app, you might send this to Sentry, Datadog, etc.
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('[Global Error Boundary] Unhandled Promise Rejection:', event.reason);
    
    // Often caused by failed network requests or Supabase issues
    if (typeof showToast === 'function') {
        const message = event.reason?.message || 'A network or database action failed.';
        showToast(`Action failed: ${message}`, 'error');
    }
});
