/**
 * UTILITY HELPERS
 * Online Event Management System
 */

const Utils = {
    /**
     * Format currency in Indian Rupees (₹)
     */
    formatCurrency: function(amount) {
        if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    },

    /**
     * Format date e.g. "15 Nov 2026"
     */
    formatDate: function(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    /**
     * Format time e.g. "06:30 PM"
     */
    formatTime: function(timeStr) {
        if (!timeStr) return '';
        if (timeStr.includes('T')) {
            const d = new Date(timeStr);
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        // Assuming HH:mm format
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        const strHours = hours < 10 ? '0' + hours : hours;
        return `${strHours}:${minutes} ${ampm}`;
    },

    /**
     * Format relative time e.g. "5 mins ago", "2 hours ago"
     */
    formatRelativeTime: function(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return this.formatDate(dateStr);
    },

    /**
     * Escape HTML string to prevent XSS
     */
    escapeHtml: function(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    /**
     * Generate HTML status badge snippet
     */
    getStatusBadgeHtml: function(status) {
        if (!status) return '';
        const s = status.toUpperCase();
        let cssClass = 'badge-status-secondary';
        if (['PENDING'].includes(s)) cssClass = 'badge-status-pending';
        else if (['APPROVED', 'ACTIVE', 'SUCCESS'].includes(s)) cssClass = 'badge-status-approved';
        else if (['REJECTED', 'BLOCKED', 'FAILED'].includes(s)) cssClass = 'badge-status-rejected';
        else if (['CANCELLED', 'INACTIVE'].includes(s)) cssClass = 'badge-status-cancelled';
        else if (['COMPLETED', 'INFO'].includes(s)) cssClass = 'badge-status-completed';

        return `<span class="badge-status ${cssClass}">${this.escapeHtml(s)}</span>`;
    },

    /**
     * URL search params helper
     */
    getParam: function(paramName) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(paramName);
    },

    /**
     * Simple Email Validator
     */
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
};
