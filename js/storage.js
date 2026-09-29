/**
 * RentEase - LocalStorage Data Layer
 * Handles persistent storage, CRUD operations, and overdue status updating
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    EQUIPMENT: 'rentease_equipment',
    BOOKINGS: 'rentease_bookings',
    USERS: 'rentease_users',
    CURRENT_USER: 'rentease_current_user'
  };

  const Storage = {
    /**
     * Initialize LocalStorage with default data if empty
     */
    init() {
      if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(window.RentEaseData.defaultEquipment));
      }
      if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(window.RentEaseData.defaultBookings));
      }
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(window.RentEaseData.defaultUsers));
      }
      if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        // Default to demo customer
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(window.RentEaseData.defaultUsers[0]));
      }
    },

    /**
     * Reset all data back to original default demo state
     */
    resetToDemoData() {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(window.RentEaseData.defaultEquipment));
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(window.RentEaseData.defaultBookings));
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(window.RentEaseData.defaultUsers));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(window.RentEaseData.defaultUsers[0]));
    },

    // ==========================================
    // EQUIPMENT OPERATIONS
    // ==========================================

    getEquipment() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
        if (!raw) {
          this.init();
          return [...window.RentEaseData.defaultEquipment];
        }
        return JSON.parse(raw);
      } catch (e) {
        console.error('Error reading equipment from localStorage', e);
        return [...window.RentEaseData.defaultEquipment];
      }
    },

    saveEquipment(equipmentList) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipmentList));
    },

    getEquipmentById(id) {
      const all = this.getEquipment();
      return all.find((item) => item.id === id) || null;
    },

    addEquipment(item) {
      const all = this.getEquipment();
      const newId = 'eq-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
      const newItem = {
        ...item,
        id: newId,
        rating: item.rating || 5.0,
        totalBookings: 0,
        status: item.status || 'Available'
      };
      all.push(newItem);
      this.saveEquipment(all);
      return newItem;
    },

    updateEquipment(updatedItem) {
      const all = this.getEquipment();
      const index = all.findIndex((i) => i.id === updatedItem.id);
      if (index !== -1) {
        all[index] = { ...all[index], ...updatedItem };
        this.saveEquipment(all);
        return all[index];
      }
      return null;
    },

    deleteEquipment(id) {
      const all = this.getEquipment();
      const filtered = all.filter((i) => i.id !== id);
      this.saveEquipment(filtered);
      return true;
    },

    // ==========================================
    // BOOKING OPERATIONS
    // ==========================================

    getBookings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        let bookings = raw ? JSON.parse(raw) : [...window.RentEaseData.defaultBookings];
        // Automatically check and flag overdue bookings dynamically
        bookings = this.updateOverdueStatuses(bookings);
        return bookings;
      } catch (e) {
        console.error('Error reading bookings from localStorage', e);
        return [...window.RentEaseData.defaultBookings];
      }
    },

    saveBookings(bookingsList) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookingsList));
    },

    getBookingById(id) {
      const all = this.getBookings();
      return all.find((b) => b.id === id) || null;
    },

    getEquipmentBookings(equipmentId) {
      const all = this.getBookings();
      return all.filter((b) => b.equipmentId === equipmentId);
    },

    /**
     * Automatic Overdue Detection
     * If Today > End Date AND status is Approved or Active -> Overdue
     */
    updateOverdueStatuses(bookings) {
      let modified = false;
      const updated = bookings.map((b) => {
        // Only active or approved bookings can become overdue
        if (b.status === 'Approved' || b.status === 'Active' || b.status === 'Overdue') {
          if (window.RentEaseUtils.isPastEndDate(b.endDate)) {
            if (b.status !== 'Overdue') {
              modified = true;
              return { ...b, status: 'Overdue', wasStatus: b.status };
            }
          }
        }
        return b;
      });

      if (modified) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
      }
      return updated;
    },

    /**
     * Save new booking
     */
    addBooking(bookingData) {
      const all = this.getBookings();
      const newId = window.RentEaseUtils.generateBookingId(all);
      const newBooking = {
        ...bookingData,
        id: newId,
        status: bookingData.status || 'Pending',
        createdAt: new Date().toISOString()
      };

      all.unshift(newBooking);
      this.saveBookings(all);

      // Increment equipment totalBookings count
      const eq = this.getEquipmentById(newBooking.equipmentId);
      if (eq) {
        eq.totalBookings = (eq.totalBookings || 0) + 1;
        this.updateEquipment(eq);
      }

      return newBooking;
    },

    /**
     * Update booking status with workflow validation
     */
    updateBookingStatus(id, newStatus) {
      const all = this.getBookings();
      const index = all.findIndex((b) => b.id === id);
      if (index === -1) return { success: false, error: 'Booking not found' };

      const current = all[index];
      const validTransitions = {
        Pending: ['Approved', 'Rejected'],
        Approved: ['Active', 'Rejected', 'Overdue'],
        Active: ['Returned', 'Overdue'],
        Overdue: ['Returned'],
        Returned: [],
        Rejected: []
      };

      const allowed = validTransitions[current.status] || [];
      if (!allowed.includes(newStatus)) {
        return {
          success: false,
          error: `Cannot transition status from ${current.status} to ${newStatus}. Allowed transitions: ${allowed.join(', ') || 'None'}`
        };
      }

      all[index].status = newStatus;
      all[index].updatedAt = new Date().toISOString();
      this.saveBookings(all);
      return { success: true, booking: all[index] };
    },

    // ==========================================
    // USER / AUTH OPERATIONS (Demo auth)
    // ==========================================

    getUsers() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.USERS);
        return raw ? JSON.parse(raw) : [...window.RentEaseData.defaultUsers];
      } catch (e) {
        return [...window.RentEaseData.defaultUsers];
      }
    },

    getCurrentUser() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (!raw) {
          const defaultCust = window.RentEaseData.defaultUsers[0];
          this.setCurrentUser(defaultCust);
          return defaultCust;
        }
        return JSON.parse(raw);
      } catch (e) {
        return window.RentEaseData.defaultUsers[0];
      }
    },

    setCurrentUser(user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    login(email, password) {
      const users = this.getUsers();
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (user) {
        this.setCurrentUser(user);
        return { success: true, user };
      }
      return { success: false, error: 'Invalid email or password' };
    }
  };

  // Initialize storage upon script execution
  Storage.init();
  window.RentEaseStorage = Storage;
})(window);
