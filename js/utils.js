/**
 * RentEase - Utility Functions
 * Date manipulation, currency formatting, toast notifications, and helpers
 */

(function (window) {
  'use strict';

  const Utils = {
    /**
     * Format number as Indian Rupee (e.g. ₹1,500, ₹12,000)
     */
    formatCurrency(amount) {
      if (typeof amount !== 'number') {
        amount = Number(amount) || 0;
      }
      return '₹' + amount.toLocaleString('en-IN');
    },

    /**
     * Parse YYYY-MM-DD into a local midnight Date object
     * This avoids UTC timezone offsets shifting dates by -1 day
     */
    parseDate(dateStr) {
      if (!dateStr) return null;
      if (dateStr instanceof Date) {
        return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
      }
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      }
      const d = new Date(dateStr);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    },

    /**
     * Convert Date object to YYYY-MM-DD string
     */
    formatDateISO(date) {
      if (!date) return '';
      const d = this.parseDate(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    /**
     * Format date string to readable format (e.g., '10 Oct 2026' or '10 Oct')
     */
    formatDate(dateStr, includeYear = true) {
      const d = this.parseDate(dateStr);
      if (!d || isNaN(d.getTime())) return dateStr || '—';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
    },

    /**
     * Calculate inclusive rental days: difference between dates + 1
     * Example: 10 Oct to 13 Oct = 4 days
     */
    calculateRentalDays(startDate, endDate) {
      if (!startDate || !endDate) return 0;
      const start = this.parseDate(startDate);
      const end = this.parseDate(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
      if (end < start) return 0;
      
      const oneDay = 1000 * 60 * 60 * 24;
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.round(diffTime / oneDay);
      return diffDays + 1;
    },

    /**
     * Calculate total cost based on daily rate and dates
     */
    calculateTotalCost(pricePerDay, startDate, endDate) {
      const days = this.calculateRentalDays(startDate, endDate);
      const rate = Number(pricePerDay) || 0;
      return days * rate;
    },

    /**
     * Get today's date in YYYY-MM-DD string
     */
    getTodayISO() {
      return this.formatDateISO(new Date());
    },

    /**
     * Check if a given date string is strictly before today
     */
    isDateBeforeToday(dateStr) {
      const target = this.parseDate(dateStr);
      const today = this.parseDate(new Date());
      return target < today;
    },

    /**
     * Check if today is past the end date
     */
    isPastEndDate(endDateStr) {
      const end = this.parseDate(endDateStr);
      const today = this.parseDate(new Date());
      return today > end;
    },

    /**
     * Calculate days overdue: if today > end date
     */
    getOverdueDays(endDateStr) {
      const end = this.parseDate(endDateStr);
      const today = this.parseDate(new Date());
      if (today <= end) return 0;
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.round((today.getTime() - end.getTime()) / oneDay);
    },

    /**
     * Sanitize string for HTML injection safety
     */
    escapeHTML(str) {
      if (str === null || str === undefined) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },

    /**
     * Generate unique booking ID (RENT-2026-001, RENT-2026-002, ...)
     */
    generateBookingId(existingBookings = []) {
      const currentYear = new Date().getFullYear();
      let maxNumber = 0;
      const pattern = new RegExp(`RENT-${currentYear}-(\\d+)`);

      existingBookings.forEach((b) => {
        if (b.id) {
          const match = b.id.match(pattern);
          if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > maxNumber) maxNumber = num;
          }
        }
      });

      const nextNum = String(maxNumber + 1).padStart(3, '0');
      return `RENT-${currentYear}-${nextNum}`;
    },

    /**
     * Toast notification system
     */
    showToast(message, type = 'info', duration = 3500) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast-item toast-${type}`;

      const iconMap = {
        success: 'check-circle-2',
        error: 'alert-triangle',
        warning: 'alert-circle',
        info: 'info'
      };

      const iconName = iconMap[type] || 'info';

      toast.innerHTML = `
        <div class="toast-content">
          <i data-lucide="${iconName}" class="toast-icon"></i>
          <span class="toast-message">${this.escapeHTML(message)}</span>
        </div>
        <button class="toast-close" aria-label="Close notification">&times;</button>
      `;

      container.appendChild(toast);

      if (window.lucide) {
        window.lucide.createIcons({ root: toast });
      }

      const removeToast = () => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 250);
      };

      toast.querySelector('.toast-close').addEventListener('click', removeToast);

      if (duration > 0) {
        setTimeout(removeToast, duration);
      }
    }
  };

  window.RentEaseUtils = Utils;
})(window);
