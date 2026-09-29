/**
 * RentEase - Initial Mock Data
 * Default sample equipment, categories, demo users, and demo bookings
 */

(function (window) {
  'use strict';

  const defaultEquipment = [
    {
      id: 'eq-sony-alpha',
      name: 'Sony Alpha Camera',
      category: 'Cameras',
      pricePerDay: 1500,
      securityDeposit: 5000,
      description: 'Professional full-frame mirrorless camera for 4K video recording, high-resolution photography, and event coverage.',
      features: ['4K Video 60fps', 'Full-Frame 33MP Sensor', 'Wireless File Transfer', 'Dual SD Card Slots', 'Weather-Sealed Body', 'Carrying Case Included'],
      image: './assets/images/equipment_sony_alpha_1790661608803.jpg',
      rating: 4.9,
      totalBookings: 28,
      quantity: 3,
      status: 'Available'
    },
    {
      id: 'eq-canon-eos',
      name: 'Canon EOS Camera',
      category: 'Cameras',
      pricePerDay: 1200,
      securityDeposit: 4000,
      description: 'Versatile digital SLR cinema and photo camera with rapid dual-pixel autofocus and crisp color science.',
      features: ['Dual Pixel AF', '24.2 MP CMOS Sensor', 'Full HD & 4K Recording', 'Vari-angle Touchscreen', 'EF Lens Mount', 'Spare Battery Pack'],
      image: './assets/images/equipment_canon_eos_1790661620350.jpg',
      rating: 4.8,
      totalBookings: 19,
      quantity: 2,
      status: 'Available'
    },
    {
      id: 'eq-epson-projector',
      name: 'Epson High-Lumen Projector',
      category: 'Projectors',
      pricePerDay: 1000,
      securityDeposit: 3500,
      description: 'Ultra-bright 4,200 lumens 1080p conference & auditorium projector with HDMI, USB-C, and wireless casting.',
      features: ['4,200 ANSI Lumens', 'Full HD 1080p', 'HDMI & Type-C Ports', 'Keystone Auto-Correction', 'Built-in 16W Speaker', 'Remote & Cable Kit'],
      image: './assets/images/equipment_epson_projector_1790661631491.jpg',
      rating: 4.7,
      totalBookings: 14,
      quantity: 4,
      status: 'Available'
    },
    {
      id: 'eq-jbl-speaker',
      name: 'JBL Professional Sound System',
      category: 'Audio Equipment',
      pricePerDay: 800,
      securityDeposit: 2500,
      description: 'High-output powered 12-inch PA speaker with Bluetooth 5.0 streaming, DSP presets, and dual XLR combo inputs.',
      features: ['1300W Peak Power', 'Bluetooth 5.0 Streaming', 'Integrated 2-Channel Mixer', 'Acoustic Feedback Suppression', 'Rugged Enclosure', 'Tripod Stand Included'],
      image: './assets/images/equipment_jbl_speaker_1790661643998.jpg',
      rating: 4.9,
      totalBookings: 32,
      quantity: 5,
      status: 'Available'
    },
    {
      id: 'eq-led-light',
      name: 'LED Studio Light Kit',
      category: 'Lighting',
      pricePerDay: 600,
      securityDeposit: 2000,
      description: 'Bi-color professional LED panel with diffusion softbox, honeycomb grid, and wireless app dimming control.',
      features: ['Bi-Color 3200K - 5600K', 'CRI 97+ High Color Fidelity', 'Bowens Mount Softbox', 'Heavy Duty Light Stand', 'Wireless App Control', 'AC/DC Battery Compatible'],
      image: './assets/images/hero_equipment_showcase_1790661594343.jpg',
      rating: 4.6,
      totalBookings: 11,
      quantity: 6,
      status: 'Available'
    },
    {
      id: 'eq-bosch-drill',
      name: 'Bosch Power Drill Set',
      category: 'Power Tools',
      pricePerDay: 500,
      securityDeposit: 1500,
      description: 'Heavy-duty cordless hammer drill and driver kit with brushless motor and comprehensive 32-piece bit set.',
      features: ['18V Brushless Motor', 'Hammer & Drill Dual Mode', '2x 4.0Ah Li-ion Batteries', 'Quick Charger (45 min)', '32-Piece Carbide Bit Set', 'Heavy Duty Tool Box'],
      image: './assets/images/hero_equipment_showcase_1790661594343.jpg',
      rating: 4.8,
      totalBookings: 22,
      quantity: 4,
      status: 'Available'
    },
    {
      id: 'eq-macbook-pro',
      name: 'Apple MacBook Pro M3',
      category: 'Laptops',
      pricePerDay: 2000,
      securityDeposit: 10000,
      description: '16-inch high-performance laptop workstation loaded with creative suite tools for on-site video editing and production.',
      features: ['Apple M3 Pro Chip', '36GB Unified Memory', '1TB High-Speed SSD', 'Liquid Retina XDR Display', 'Final Cut Pro & Premiere Ready', 'MagSafe Charger & Sleeve'],
      image: './assets/images/hero_equipment_showcase_1790661594343.jpg',
      rating: 5.0,
      totalBookings: 36,
      quantity: 2,
      status: 'Available'
    },
    {
      id: 'eq-dji-gimbal',
      name: 'DJI Ronin Camera Gimbal',
      category: 'Camera Accessories',
      pricePerDay: 900,
      securityDeposit: 3000,
      description: '3-axis motorized camera stabilizer supporting up to 3kg payloads with automated axis locks and focus motor.',
      features: ['3-Axis Stabilization', 'Automated Axis Locks', 'OLED Touchscreen', 'Fine-Tuning Balancing Knob', '12h Battery Runtime', 'Focus Motor & Follow Focus'],
      image: './assets/images/equipment_sony_alpha_1790661608803.jpg',
      rating: 4.8,
      totalBookings: 17,
      quantity: 3,
      status: 'Available'
    }
  ];

  // Default demo bookings
  // Note: Current date is Sept 28, 2026.
  // The prompt specifies a critical demonstration scenario:
  // "Sony Alpha Camera: 10 Oct -> 12 Oct (Approved).
  // If user tries 11 Oct -> 13 Oct: MUST reject conflict!
  // If user tries 13 Oct -> 15 Oct: MUST allow!"
  // We also configure active and overdue bookings for rich demonstration.
  const defaultBookings = [
    {
      id: 'RENT-2026-001',
      equipmentId: 'eq-sony-alpha',
      equipmentName: 'Sony Alpha Camera',
      equipmentImage: './assets/images/equipment_sony_alpha_1790661608803.jpg',
      customerName: 'Rahul Verma',
      customerEmail: 'rahul.verma@example.com',
      customerPhone: '+91 98765 43210',
      startDate: '2026-10-10',
      endDate: '2026-10-12',
      rentalDays: 3,
      pricePerDay: 1500,
      totalAmount: 4500,
      securityDeposit: 5000,
      status: 'Approved',
      createdAt: '2026-09-25T10:30:00Z',
      notes: 'Hackathon filming project on campus'
    },
    {
      id: 'RENT-2026-002',
      equipmentId: 'eq-epson-projector',
      equipmentName: 'Epson High-Lumen Projector',
      equipmentImage: './assets/images/equipment_epson_projector_1790661631491.jpg',
      customerName: 'Priya Sharma',
      customerEmail: 'priya.sharma@example.com',
      customerPhone: '+91 98111 22334',
      startDate: '2026-09-27',
      endDate: '2026-09-30',
      rentalDays: 4,
      pricePerDay: 1000,
      totalAmount: 4000,
      securityDeposit: 3500,
      status: 'Active',
      createdAt: '2026-09-26T14:15:00Z',
      notes: 'Auditorium symposium presentation'
    },
    {
      id: 'RENT-2026-003',
      equipmentId: 'eq-jbl-speaker',
      equipmentName: 'JBL Professional Sound System',
      equipmentImage: './assets/images/equipment_jbl_speaker_1790661643998.jpg',
      customerName: 'Aman Gupta',
      customerEmail: 'customer@rentease.com',
      customerPhone: '+91 97654 32109',
      startDate: '2026-09-20',
      endDate: '2026-09-24',
      rentalDays: 5,
      pricePerDay: 800,
      totalAmount: 4000,
      securityDeposit: 2500,
      status: 'Approved', // End date is 24 Sept and today is 28 Sept -> Will trigger Overdue calculation automatically!
      createdAt: '2026-09-18T09:00:00Z',
      notes: 'College cultural fest rehearsal - Overdue check test'
    },
    {
      id: 'RENT-2026-004',
      equipmentId: 'eq-canon-eos',
      equipmentName: 'Canon EOS Camera',
      equipmentImage: './assets/images/equipment_canon_eos_1790661620350.jpg',
      customerName: 'Arjun Mehta',
      customerEmail: 'customer@rentease.com',
      customerPhone: '+91 99887 76655',
      startDate: '2026-10-05',
      endDate: '2026-10-07',
      rentalDays: 3,
      pricePerDay: 1200,
      totalAmount: 3600,
      securityDeposit: 4000,
      status: 'Pending',
      createdAt: '2026-09-28T08:00:00Z',
      notes: 'Documentary shoot in studio'
    },
    {
      id: 'RENT-2026-005',
      equipmentId: 'eq-macbook-pro',
      equipmentName: 'Apple MacBook Pro M3',
      equipmentImage: './assets/images/hero_equipment_showcase_1790661594343.jpg',
      customerName: 'Sneha Patel',
      customerEmail: 'customer@rentease.com',
      customerPhone: '+91 91234 56789',
      startDate: '2026-09-10',
      endDate: '2026-09-14',
      rentalDays: 5,
      pricePerDay: 2000,
      totalAmount: 10000,
      securityDeposit: 10000,
      status: 'Returned',
      createdAt: '2026-09-08T11:20:00Z',
      notes: 'Hackathon video editing workshop - Successfully returned on time'
    }
  ];

  const defaultUsers = [
    {
      id: 'user-customer',
      name: 'Aman Gupta',
      email: 'customer@rentease.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91 97654 32109'
    },
    {
      id: 'user-admin',
      name: 'Administrator',
      email: 'admin@rentease.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98000 11223'
    }
  ];

  const categories = [
    'All',
    'Cameras',
    'Projectors',
    'Audio Equipment',
    'Lighting',
    'Power Tools',
    'Laptops',
    'Camera Accessories'
  ];

  window.RentEaseData = {
    defaultEquipment,
    defaultBookings,
    defaultUsers,
    categories
  };
})(window);
