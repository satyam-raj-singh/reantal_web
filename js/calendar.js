/**
 * RentEase - Availability Calendar Engine
 * Interactive calendar renderer showing booked/available spans and status tooltips
 */

(function (window) {
  'use strict';

  class RentEaseCalendar {
    constructor(containerElement, options = {}) {
      this.container = typeof containerElement === 'string' ? document.getElementById(containerElement) : containerElement;
      this.options = {
        selectedEquipmentId: options.selectedEquipmentId || 'all',
        selectedStatus: options.selectedStatus || 'all',
        onDateSelect: options.onDateSelect || null,
        mode: options.mode || 'overview', // 'overview' or 'single-equipment'
        ...options
      };

      const now = new Date();
      this.currentYear = options.initialYear || now.getFullYear();
      this.currentMonth = options.initialMonth !== undefined ? options.initialMonth : now.getMonth();
    }

    setEquipment(equipmentId) {
      this.options.selectedEquipmentId = equipmentId;
      this.render();
    }

    setStatus(status) {
      this.options.selectedStatus = status;
      this.render();
    }

    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.render();
    }

    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.render();
    }

    today() {
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      this.render();
    }

    render() {
      if (!this.container) return;

      const bookings = window.RentEaseStorage.getBookings();
      const equipmentList = window.RentEaseStorage.getEquipment();

      // Filter bookings according to options
      const filteredBookings = bookings.filter((b) => {
        if (this.options.selectedEquipmentId && this.options.selectedEquipmentId !== 'all') {
          if (b.equipmentId !== this.options.selectedEquipmentId) return false;
        }
        if (this.options.selectedStatus && this.options.selectedStatus !== 'all') {
          if (b.status !== this.options.selectedStatus) return false;
        }
        return true;
      });

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      // First day of current month
      const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
      // Total days in current month
      const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
      // Total days in previous month
      const prevMonthTotalDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

      const today = new Date();
      const todayISO = window.RentEaseUtils.getTodayISO();

      let html = `
        <div class="calendar-wrapper">
          <div class="calendar-header">
            <div class="calendar-title-wrap">
              <h3 class="calendar-title">${monthNames[this.currentMonth]} ${this.currentYear}</h3>
              <span class="calendar-subtitle">Live equipment availability matrix</span>
            </div>
            <div class="calendar-controls">
              <button class="cal-btn" id="cal-prev-btn" title="Previous Month">
                <i data-lucide="chevron-left"></i>
              </button>
              <button class="cal-btn cal-btn-today" id="cal-today-btn">Today</button>
              <button class="cal-btn" id="cal-next-btn" title="Next Month">
                <i data-lucide="chevron-right"></i>
              </button>
            </div>
          </div>

          <div class="calendar-legend">
            <span class="legend-item"><span class="legend-dot status-available"></span> Available</span>
            <span class="legend-item"><span class="legend-dot status-pending"></span> Pending</span>
            <span class="legend-item"><span class="legend-dot status-approved"></span> Approved</span>
            <span class="legend-item"><span class="legend-dot status-active"></span> Active Rental</span>
            <span class="legend-item"><span class="legend-dot status-overdue"></span> Overdue</span>
            <span class="legend-item"><span class="legend-dot status-returned"></span> Returned</span>
          </div>

          <div class="calendar-grid">
            <div class="calendar-weekdays">
              ${daysOfWeek.map((d) => `<div class="cal-weekday">${d}</div>`).join('')}
            </div>
            <div class="calendar-days">
      `;

      // Previous month filler days
      for (let i = firstDay - 1; i >= 0; i--) {
        const dayNum = prevMonthTotalDays - i;
        html += `<div class="cal-day cal-day-outside"><span class="cal-day-num">${dayNum}</span></div>`;
      }

      // Current month days
      for (let day = 1; day <= totalDays; day++) {
        const monthStr = String(this.currentMonth + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateISO = `${this.currentYear}-${monthStr}-${dayStr}`;
        const isToday = dateISO === todayISO;
        const dayDate = window.RentEaseUtils.parseDate(dateISO);

        // Find bookings active on this date
        const dayBookings = filteredBookings.filter((b) => {
          const start = window.RentEaseUtils.parseDate(b.startDate);
          const end = window.RentEaseUtils.parseDate(b.endDate);
          return dayDate >= start && dayDate <= end;
        });

        // Determine dominant status
        let statusClass = 'day-available';
        let statusBadge = '';
        let conflictTooltip = '';

        if (dayBookings.length > 0) {
          const first = dayBookings[0];
          const statusLower = first.status.toLowerCase();
          statusClass = `day-${statusLower}`;

          conflictTooltip = `${first.equipmentName} (${first.status}): ${window.RentEaseUtils.formatDate(first.startDate, false)} to ${window.RentEaseUtils.formatDate(first.endDate, true)}`;
          
          statusBadge = `
            <div class="cal-day-badge badge-${statusLower}" title="${window.RentEaseUtils.escapeHTML(conflictTooltip)}">
              <span class="cal-badge-text truncate">${window.RentEaseUtils.escapeHTML(first.equipmentName)}</span>
            </div>
          `;

          if (dayBookings.length > 1) {
            statusBadge += `<div class="cal-more-indicator">+${dayBookings.length - 1} more</div>`;
          }
        }

        html += `
          <div class="cal-day ${statusClass} ${isToday ? 'cal-day-today' : ''}" 
               data-date="${dateISO}" 
               data-bookings-count="${dayBookings.length}">
            <div class="cal-day-header">
              <span class="cal-day-num">${day}</span>
              ${isToday ? '<span class="today-marker">Today</span>' : ''}
            </div>
            <div class="cal-day-content">
              ${statusBadge}
            </div>
          </div>
        `;
      }

      // Next month filler days to complete grid
      const totalCells = firstDay + totalDays;
      const remainingCells = (7 - (totalCells % 7)) % 7;
      for (let i = 1; i <= remainingCells; i++) {
        html += `<div class="cal-day cal-day-outside"><span class="cal-day-num">${i}</span></div>`;
      }

      html += `
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = html;

      // Attach control event listeners
      const prevBtn = this.container.querySelector('#cal-prev-btn');
      const nextBtn = this.container.querySelector('#cal-next-btn');
      const todayBtn = this.container.querySelector('#cal-today-btn');

      if (prevBtn) prevBtn.addEventListener('click', () => this.prevMonth());
      if (nextBtn) nextBtn.addEventListener('click', () => this.nextMonth());
      if (todayBtn) todayBtn.addEventListener('click', () => this.today());

      // Attach day click listener
      const dayElements = this.container.querySelectorAll('.cal-day[data-date]');
      dayElements.forEach((el) => {
        el.addEventListener('click', () => {
          const date = el.getAttribute('data-date');
          this.handleDayClick(date);
        });
      });

      if (window.lucide) {
        window.lucide.createIcons({ root: this.container });
      }
    }

    handleDayClick(dateStr) {
      const bookings = window.RentEaseStorage.getBookings();
      const dateBookings = bookings.filter((b) => {
        const start = window.RentEaseUtils.parseDate(b.startDate);
        const end = window.RentEaseUtils.parseDate(b.endDate);
        const current = window.RentEaseUtils.parseDate(dateStr);
        return current >= start && current <= end;
      });

      if (dateBookings.length > 0) {
        const details = dateBookings
          .map((b) => `• ${b.equipmentName}: [${b.status}] ${window.RentEaseUtils.formatDate(b.startDate, false)} to ${window.RentEaseUtils.formatDate(b.endDate, true)} (Customer: ${b.customerName})`)
          .join('\n');
        window.RentEaseUtils.showToast(`${window.RentEaseUtils.formatDate(dateStr)} has ${dateBookings.length} booking(s):\n${details}`, 'info', 4500);
      } else {
        window.RentEaseUtils.showToast(`${window.RentEaseUtils.formatDate(dateStr)} is completely free and available for booking!`, 'success', 3000);
      }

      if (typeof this.options.onDateSelect === 'function') {
        this.options.onDateSelect(dateStr, dateBookings);
      }
    }
  }

  window.RentEaseCalendar = RentEaseCalendar;
})(window);
