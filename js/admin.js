/**
 * RentEase - Admin Management & Analytics Module
 * Handles inventory CRUD, booking workflows, analytics, and stats
 */

(function (window) {
  'use strict';

  const Admin = {
    /**
     * Calculate summary metrics from dynamic LocalStorage data
     */
    getDashboardStats() {
      const equipment = window.RentEaseStorage.getEquipment();
      const bookings = window.RentEaseStorage.getBookings();

      const totalEquipment = equipment.length;
      const totalBookings = bookings.length;
      
      const activeRentals = bookings.filter((b) => b.status === 'Active').length;
      const pendingRequests = bookings.filter((b) => b.status === 'Pending').length;
      const overdueRentals = bookings.filter((b) => b.status === 'Overdue').length;

      // Calculate total revenue from approved, active, returned, and overdue rentals
      const revenueStatuses = ['Approved', 'Active', 'Returned', 'Overdue'];
      const totalRevenue = bookings
        .filter((b) => revenueStatuses.includes(b.status))
        .reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);

      return {
        totalEquipment,
        totalBookings,
        activeRentals,
        pendingRequests,
        overdueRentals,
        totalRevenue
      };
    },

    /**
     * Equipment CRUD
     */
    saveEquipmentForm(formData, isEdit = false) {
      if (!formData.name || !formData.name.trim()) {
        return { success: false, error: 'Equipment name is required.' };
      }
      if (!formData.pricePerDay || Number(formData.pricePerDay) <= 0) {
        return { success: false, error: 'Daily price must be a positive number.' };
      }

      const features = typeof formData.features === 'string'
        ? formData.features.split(',').map((f) => f.trim()).filter(Boolean)
        : (formData.features || []);

      const equipmentData = {
        name: formData.name.trim(),
        category: formData.category || 'Other',
        pricePerDay: Number(formData.pricePerDay),
        securityDeposit: Number(formData.securityDeposit) || 0,
        description: formData.description ? formData.description.trim() : '',
        features: features.length > 0 ? features : ['Standard equipment package'],
        image: formData.image || './assets/images/equipment_sony_alpha_1790661608803.jpg',
        quantity: Number(formData.quantity) || 1,
        status: formData.status || 'Available'
      };

      if (isEdit && formData.id) {
        equipmentData.id = formData.id;
        const updated = window.RentEaseStorage.updateEquipment(equipmentData);
        return { success: true, equipment: updated, message: 'Equipment updated successfully.' };
      } else {
        const added = window.RentEaseStorage.addEquipment(equipmentData);
        return { success: true, equipment: added, message: 'New equipment added to catalog.' };
      }
    },

    deleteEquipment(id) {
      // Check if there are active or approved bookings for this equipment
      const bookings = window.RentEaseStorage.getEquipmentBookings(id);
      const activeBookings = bookings.filter((b) => ['Active', 'Approved', 'Pending', 'Overdue'].includes(b.status));

      if (activeBookings.length > 0) {
        return {
          success: false,
          error: `Cannot delete equipment. There are ${activeBookings.length} active/pending booking(s) associated with it.`
        };
      }

      window.RentEaseStorage.deleteEquipment(id);
      return { success: true, message: 'Equipment deleted successfully.' };
    },

    /**
     * Booking status workflow triggers
     */
    updateBookingStatus(bookingId, targetStatus) {
      const result = window.RentEaseStorage.updateBookingStatus(bookingId, targetStatus);
      if (result.success) {
        window.RentEaseUtils.showToast(`Booking ${bookingId} status updated to ${targetStatus}`, 'success');
      } else {
        window.RentEaseUtils.showToast(result.error, 'error');
      }
      return result;
    },

    /**
     * Export data for administrative reports
     */
    exportData(format = 'json') {
      const data = {
        equipment: window.RentEaseStorage.getEquipment(),
        bookings: window.RentEaseStorage.getBookings(),
        exportedAt: new Date().toISOString()
      };

      if (format === 'json') {
        const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonStr);
        downloadAnchor.setAttribute('download', `rentease_backup_${window.RentEaseUtils.getTodayISO()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        window.RentEaseUtils.showToast('Data exported successfully as JSON', 'success');
      }
    }
  };

  window.RentEaseAdmin = Admin;
})(window);
