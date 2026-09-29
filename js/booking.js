/**
 * RentEase - Date Conflict Detection & Booking Engine
 * Mathematical overlap algorithm preventing double bookings
 */

(function (window) {
  'use strict';

  const BookingEngine = {
    /**
     * CORE MATHEMATICAL CONFLICT DETECTION
     * Check if a proposed date range overlaps with any active booking for an equipment item.
     *
     * Overlap Condition:
     * (newStart <= existingEnd) AND (newEnd >= existingStart)
     *
     * Status rules:
     * - Blocking statuses: 'Approved', 'Active', 'Pending', 'Overdue'
     * - Non-blocking statuses: 'Returned', 'Rejected'
     *
     * @param {string} equipmentId
     * @param {string} newStartDateStr - YYYY-MM-DD
     * @param {string} newEndDateStr - YYYY-MM-DD
     * @param {string|null} excludeBookingId - optional ID to ignore (when editing existing booking)
     * @returns {Object} { isAvailable: boolean, conflictingBookings: Array, message: string }
     */
    checkAvailability(equipmentId, newStartDateStr, newEndDateStr, excludeBookingId = null) {
      if (!equipmentId || !newStartDateStr || !newEndDateStr) {
        return {
          isAvailable: false,
          conflictingBookings: [],
          message: 'Equipment, start date, and end date are required.'
        };
      }

      const newStart = window.RentEaseUtils.parseDate(newStartDateStr);
      const newEnd = window.RentEaseUtils.parseDate(newEndDateStr);

      if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
        return {
          isAvailable: false,
          conflictingBookings: [],
          message: 'Invalid date format.'
        };
      }

      if (newEnd < newStart) {
        return {
          isAvailable: false,
          conflictingBookings: [],
          message: 'End date cannot be earlier than start date.'
        };
      }

      // Fetch all bookings for this equipment
      const allBookings = window.RentEaseStorage.getEquipmentBookings(equipmentId);

      // Filter to relevant blocking bookings
      const blockingStatuses = ['Approved', 'Active', 'Pending', 'Overdue'];
      const activeBookings = allBookings.filter((b) => {
        if (excludeBookingId && b.id === excludeBookingId) return false;
        return blockingStatuses.includes(b.status);
      });

      const conflictingBookings = [];

      for (const booking of activeBookings) {
        const existingStart = window.RentEaseUtils.parseDate(booking.startDate);
        const existingEnd = window.RentEaseUtils.parseDate(booking.endDate);

        // Strict mathematical date overlap check:
        // newStart <= existingEnd && newEnd >= existingStart
        if (newStart <= existingEnd && newEnd >= existingStart) {
          conflictingBookings.push(booking);
        }
      }

      if (conflictingBookings.length > 0) {
        const firstConflict = conflictingBookings[0];
        const conflictRange = `${window.RentEaseUtils.formatDate(firstConflict.startDate, false)} – ${window.RentEaseUtils.formatDate(firstConflict.endDate, true)}`;
        return {
          isAvailable: false,
          conflictingBookings,
          conflictRange,
          message: `Equipment is unavailable for the selected dates. Conflict with existing ${firstConflict.status.toLowerCase()} booking (${conflictRange}).`
        };
      }

      return {
        isAvailable: true,
        conflictingBookings: [],
        conflictRange: null,
        message: 'Equipment is available for the selected dates.'
      };
    },

    /**
     * Shorthand boolean check as required by prompt
     */
    isEquipmentAvailable(equipmentId, newStart, newEnd) {
      const result = this.checkAvailability(equipmentId, newStart, newEnd);
      return result.isAvailable;
    },

    /**
     * Date validation rules
     */
    validateDates(startDateStr, endDateStr) {
      if (!startDateStr) {
        return { valid: false, error: 'Start date is required.' };
      }
      if (!endDateStr) {
        return { valid: false, error: 'End date is required.' };
      }

      const start = window.RentEaseUtils.parseDate(startDateStr);
      const end = window.RentEaseUtils.parseDate(endDateStr);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { valid: false, error: 'Please enter valid calendar dates.' };
      }

      // Check if start date is strictly before today
      if (window.RentEaseUtils.isDateBeforeToday(startDateStr)) {
        return { valid: false, error: 'Start date cannot be in the past.' };
      }

      // Check if end date is before start date
      if (end < start) {
        return { valid: false, error: 'End date cannot be before start date.' };
      }

      const rentalDays = window.RentEaseUtils.calculateRentalDays(startDateStr, endDateStr);
      if (rentalDays <= 0) {
        return { valid: false, error: 'Rental duration must be at least 1 day.' };
      }

      return { valid: true, rentalDays };
    },

    /**
     * Process and validate a new booking request
     */
    submitBooking(bookingData) {
      // 1. Validate customer information
      if (!bookingData.customerName || !bookingData.customerName.trim()) {
        return { success: false, error: 'Customer name is required.' };
      }
      if (!bookingData.customerEmail || !bookingData.customerEmail.includes('@')) {
        return { success: false, error: 'A valid email address is required.' };
      }
      if (!bookingData.customerPhone || bookingData.customerPhone.trim().length < 6) {
        return { success: false, error: 'A valid contact phone number is required.' };
      }

      // 2. Validate dates
      const dateValidation = this.validateDates(bookingData.startDate, bookingData.endDate);
      if (!dateValidation.valid) {
        return { success: false, error: dateValidation.error };
      }

      // 3. Verify equipment existence
      const equipment = window.RentEaseStorage.getEquipmentById(bookingData.equipmentId);
      if (!equipment) {
        return { success: false, error: 'Selected equipment does not exist.' };
      }

      // 4. CRITICAL: Date conflict detection
      const availability = this.checkAvailability(
        bookingData.equipmentId,
        bookingData.startDate,
        bookingData.endDate
      );

      if (!availability.isAvailable) {
        return {
          success: false,
          isConflict: true,
          conflictRange: availability.conflictRange,
          conflictingBookings: availability.conflictingBookings,
          error: availability.message
        };
      }

      // 5. Cost calculation
      const rentalDays = dateValidation.rentalDays;
      const totalAmount = window.RentEaseUtils.calculateTotalCost(
        equipment.pricePerDay,
        bookingData.startDate,
        bookingData.endDate
      );

      // 6. Save booking
      const newBookingRecord = {
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        equipmentImage: equipment.image,
        customerName: bookingData.customerName.trim(),
        customerEmail: bookingData.customerEmail.trim(),
        customerPhone: bookingData.customerPhone.trim(),
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        rentalDays: rentalDays,
        pricePerDay: equipment.pricePerDay,
        totalAmount: totalAmount,
        securityDeposit: equipment.securityDeposit || 0,
        status: 'Pending',
        notes: bookingData.notes ? bookingData.notes.trim() : ''
      };

      const saved = window.RentEaseStorage.addBooking(newBookingRecord);

      return {
        success: true,
        booking: saved,
        message: 'Booking Request Submitted Successfully!'
      };
    }
  };

  window.RentEaseBooking = BookingEngine;
})(window);
