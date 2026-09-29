/**
 * RentEase - Main Application Controller
 * Handles SPA routing, view rendering, modals, filters, and event wiring
 */

(function (window) {
  'use strict';

  const App = {
    currentView: 'home',
    calendarInstance: null,
    adminCalendarInstance: null,
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'popular',
    filterAvailability: 'all',
    maxPrice: 3000,

    init() {
      // Ensure storage is initialized
      window.RentEaseStorage.init();

      // Render top bar & auth status
      this.updateNavbarUser();

      // Setup global event listeners
      this.bindNavigation();
      this.bindModals();
      this.bindAuthSwitcher();

      // Check URL hash for initial view
      const hash = window.location.hash.replace('#', '') || 'home';
      this.navigate(hash);
    },

    /**
     * SPA Navigation router
     */
    navigate(viewName) {
      this.currentView = viewName;
      window.location.hash = viewName;

      // Update active nav links
      document.querySelectorAll('.nav-link').forEach((link) => {
        const target = link.getAttribute('data-view');
        if (target === viewName) {
          link.classList.add('nav-link-active');
        } else {
          link.classList.remove('nav-link-active');
        }
      });

      // Update mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }

      // Render the requested view
      const mainContainer = document.getElementById('main-content');
      if (!mainContainer) return;

      switch (viewName) {
        case 'home':
          this.renderHome(mainContainer);
          break;
        case 'equipment':
          this.renderEquipmentCatalog(mainContainer);
          break;
        case 'my-rentals':
          this.renderMyRentals(mainContainer);
          break;
        case 'calendar':
          this.renderCalendarView(mainContainer);
          break;
        case 'about':
          this.renderAboutView(mainContainer);
          break;
        case 'admin-dashboard':
          this.renderAdminDashboard(mainContainer);
          break;
        case 'admin-equipment':
          this.renderAdminEquipment(mainContainer);
          break;
        case 'admin-bookings':
          this.renderAdminBookings(mainContainer);
          break;
        case 'admin-reports':
          this.renderAdminReports(mainContainer);
          break;
        case 'admin-settings':
          this.renderAdminSettings(mainContainer);
          break;
        default:
          this.renderHome(mainContainer);
      }

      // Re-initialize Lucide icons in newly rendered DOM
      if (window.lucide) {
        window.lucide.createIcons();
      }

      // Scroll to top of content
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /**
     * Top Navbar Auth state
     */
    updateNavbarUser() {
      const user = window.RentEaseStorage.getCurrentUser();
      const userBadge = document.getElementById('nav-user-badge');
      const adminNavGroup = document.getElementById('nav-admin-group');

      if (userBadge) {
        userBadge.innerHTML = `
          <div class="user-pill ${user.role === 'admin' ? 'user-pill-admin' : ''}">
            <i data-lucide="${user.role === 'admin' ? 'shield-check' : 'user'}"></i>
            <span class="user-pill-name">${window.RentEaseUtils.escapeHTML(user.name)}</span>
            <span class="user-pill-role">${user.role === 'admin' ? 'Admin' : 'Customer'}</span>
          </div>
        `;
      }

      if (adminNavGroup) {
        if (user.role === 'admin') {
          adminNavGroup.classList.remove('hidden');
        } else {
          adminNavGroup.classList.add('hidden');
        }
      }

      if (window.lucide) {
        window.lucide.createIcons();
      }
    },

    // ==========================================
    // VIEW 1: HOME PAGE
    // ==========================================
    renderHome(container) {
      const popularItems = window.RentEaseStorage.getEquipment().slice(0, 4);

      container.innerHTML = `
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-container">
            <div class="hero-content">
              <div class="hero-kicker">
                <span class="hero-kicker-dot"></span>
                <span>Zero Double-Bookings Guarantee</span>
              </div>
              <h1 class="hero-heading">
                Rent the Right Equipment.<br />
                <span class="hero-heading-gradient">At the Right Time.</span>
              </h1>
              <p class="hero-subheading">
                Book professional cameras, projectors, audio systems, and power tools without worrying about availability conflicts. Powered by mathematical date overlap detection.
              </p>
              <div class="hero-actions">
                <button class="btn btn-primary" onclick="window.RentEaseApp.navigate('equipment')">
                  <i data-lucide="package-search"></i>
                  <span>Browse Equipment</span>
                </button>
                <button class="btn btn-secondary" onclick="document.getElementById('conflict-sandbox').scrollIntoView({behavior: 'smooth'})">
                  <i data-lucide="sparkles"></i>
                  <span>Try Conflict Demo</span>
                </button>
              </div>

              <!-- Quick stats strip -->
              <div class="hero-stats-strip">
                <div class="hero-stat-item">
                  <span class="hero-stat-number tabular-nums">8+</span>
                  <span class="hero-stat-label">Gear Categories</span>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-item">
                  <span class="hero-stat-number">100%</span>
                  <span class="hero-stat-label">Conflict Prevention</span>
                </div>
                <div class="hero-stat-divider"></div>
                <div class="hero-stat-item">
                  <span class="hero-stat-number">Instant</span>
                  <span class="hero-stat-label">Booking Confirmation</span>
                </div>
              </div>
            </div>

            <div class="hero-visual">
              <div class="hero-card-preview">
                <img 
                  src="./assets/images/hero_equipment_showcase_1790661594343.jpg" 
                  alt="Professional production equipment" 
                  class="hero-img"
                  referrerpolicy="no-referrer"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                />
                <div class="img-fallback hero-fallback" style="display: none;">
                  <i data-lucide="camera" class="w-12 h-12 text-slate-400"></i>
                  <span>Professional Production Gear</span>
                </div>
                <div class="hero-card-overlay">
                  <div class="overlay-badge">
                    <span class="status-indicator-dot"></span>
                    <span>Real-Time LocalStorage Engine</span>
                  </div>
                  <h4 class="overlay-title">Sony Alpha & Studio Cinema Kits</h4>
                  <p class="overlay-desc">Multi-day conflict detection checking existing reservations before confirmation.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- LIVE HACKATHON CONFLICT DETECTION SANDBOX -->
        <section class="section section-sandbox" id="conflict-sandbox">
          <div class="container-narrow">
            <div class="section-header text-center">
              <div class="section-kicker">Core Feature Demonstration</div>
              <h2 class="section-title">Smart Conflict Detection Engine</h2>
              <p class="section-subtitle">
                Equipment rental businesses lose reputation and revenue when double bookings happen. 
                Test our mathematical date overlap formula live:
                <code class="formula-code">newStart &lt;= existingEnd &amp;&amp; newEnd &gt;= existingStart</code>
              </p>
            </div>

            <div class="sandbox-card">
              <div class="sandbox-header">
                <div class="sandbox-info">
                  <div class="sandbox-target-gear">
                    <img src="./assets/images/equipment_sony_alpha_1790661608803.jpg" alt="Sony Alpha" class="sandbox-thumb" />
                    <div>
                      <h4 class="sandbox-gear-title">Sony Alpha Camera</h4>
                      <p class="sandbox-existing-note">
                        <span class="font-medium text-slate-700">Existing Approved Booking:</span> 
                        <span class="text-blue-600 font-semibold">10 Oct 2026 – 12 Oct 2026</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="sandbox-quick-tests">
                  <span class="quick-test-label">Instant Demo Scenarios:</span>
                  <button class="btn-demo-test test-conflict" onclick="window.RentEaseApp.runSandboxScenario('conflict')">
                    <i data-lucide="alert-triangle"></i>
                    <span>Test Conflict (11 Oct – 13 Oct)</span>
                  </button>
                  <button class="btn-demo-test test-available" onclick="window.RentEaseApp.runSandboxScenario('available')">
                    <i data-lucide="check"></i>
                    <span>Test Available (13 Oct – 15 Oct)</span>
                  </button>
                </div>
              </div>

              <div class="sandbox-body">
                <div class="sandbox-inputs-grid">
                  <div class="form-group">
                    <label class="form-label" for="sandbox-start-date">Proposed Start Date</label>
                    <input type="date" id="sandbox-start-date" class="form-input" value="2026-10-11" />
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="sandbox-end-date">Proposed End Date</label>
                    <input type="date" id="sandbox-end-date" class="form-input" value="2026-10-13" />
                  </div>
                  <div class="form-group flex items-end">
                    <button class="btn btn-primary w-full" id="sandbox-check-btn" onclick="window.RentEaseApp.checkSandbox()">
                      <i data-lucide="shield-check"></i>
                      <span>Run Overlap Detection</span>
                    </button>
                  </div>
                </div>

                <!-- Result Display Area -->
                <div id="sandbox-result" class="sandbox-result-box sandbox-result-conflict">
                  <div class="result-header">
                    <i data-lucide="alert-triangle" class="result-icon text-red-600"></i>
                    <div>
                      <h4 class="result-title text-red-900">❌ CONFLICT DETECTED</h4>
                      <p class="result-desc text-red-700">
                        This equipment is already booked during the selected dates.
                      </p>
                    </div>
                  </div>
                  <div class="result-details">
                    <div class="result-detail-row">
                      <span class="detail-label">Conflicting Range:</span>
                      <span class="detail-val font-semibold text-red-800">10 Oct 2026 – 12 Oct 2026</span>
                    </div>
                    <div class="result-detail-row">
                      <span class="detail-label">Mathematical Condition Met:</span>
                      <span class="detail-val font-mono text-xs text-red-700">2026-10-11 &lt;= 2026-10-12 AND 2026-10-13 &gt;= 2026-10-10 (TRUE)</span>
                    </div>
                    <div class="result-detail-row">
                      <span class="detail-label">Safety Action:</span>
                      <span class="detail-val text-red-800 font-medium">Booking form submission blocked. Database remains pristine.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Popular Equipment Section -->
        <section class="section section-catalog">
          <div class="container">
            <div class="section-header-row">
              <div>
                <div class="section-kicker">Ready To Reserve</div>
                <h2 class="section-title">Popular Equipment</h2>
              </div>
              <button class="btn btn-ghost" onclick="window.RentEaseApp.navigate('equipment')">
                <span>View Full Catalog</span>
                <i data-lucide="arrow-right"></i>
              </button>
            </div>

            <div class="equipment-grid">
              ${popularItems.map((item) => this.renderEquipmentCard(item)).join('')}
            </div>
          </div>
        </section>

        <!-- How It Works Section -->
        <section class="section section-workflow">
          <div class="container">
            <div class="section-header text-center">
              <div class="section-kicker">Simple 4-Step Process</div>
              <h2 class="section-title">How RentEase Works</h2>
              <p class="section-subtitle">A seamless rental workflow designed for precision and reliability.</p>
            </div>

            <div class="workflow-grid">
              <div class="workflow-card">
                <div class="workflow-step-num">01</div>
                <div class="workflow-icon-wrap">
                  <i data-lucide="search"></i>
                </div>
                <h3 class="workflow-title">Browse Equipment</h3>
                <p class="workflow-desc">Explore verified cameras, projectors, sound gear, and power tools with live inventory availability.</p>
              </div>

              <div class="workflow-card">
                <div class="workflow-step-num">02</div>
                <div class="workflow-icon-wrap">
                  <i data-lucide="calendar"></i>
                </div>
                <h3 class="workflow-title">Select Dates</h3>
                <p class="workflow-desc">Choose your exact rental duration. Inclusive daily rates and security deposits calculate dynamically in real-time.</p>
              </div>

              <div class="workflow-card">
                <div class="workflow-step-num">03</div>
                <div class="workflow-icon-wrap">
                  <i data-lucide="shield-check"></i>
                </div>
                <h3 class="workflow-title">Smart Availability Check</h3>
                <p class="workflow-desc">Our mathematical engine cross-examines existing approved and active bookings to guarantee zero conflicts.</p>
              </div>

              <div class="workflow-card">
                <div class="workflow-step-num">04</div>
                <div class="workflow-icon-wrap">
                  <i data-lucide="check-circle-2"></i>
                </div>
                <h3 class="workflow-title">Confirm Rental</h3>
                <p class="workflow-desc">Instantly receive a unique RENT ID, monitor status transitions, and manage active gear return dates.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Customer Testimonials -->
        <section class="section section-testimonials">
          <div class="container">
            <div class="section-header text-center">
              <div class="section-kicker">Hackathon & Production Verified</div>
              <h2 class="section-title">Trusted By Campus Creators</h2>
            </div>

            <div class="testimonials-grid">
              <div class="testimonial-card">
                <p class="testimonial-quote">
                  "RentEase solved the constant double-booking chaos we had during annual media fests. The mathematical conflict check rejected two overlapping booking attempts instantly."
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">RV</div>
                  <div>
                    <h5 class="author-name">Rahul Verma</h5>
                    <p class="author-role">Media Society Coordinator, Tech Fest</p>
                  </div>
                </div>
              </div>

              <div class="testimonial-card">
                <p class="testimonial-quote">
                  "The overdue detection feature is brilliant. As soon as the end date passes without a return, it flags the gear in orange with exact overdue days. Total transparency."
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">PS</div>
                  <div>
                    <h5 class="author-name">Priya Sharma</h5>
                    <p class="author-role">Campus Studio Manager</p>
                  </div>
                </div>
              </div>

              <div class="testimonial-card">
                <p class="testimonial-quote">
                  "The visual calendar view is clean and responsive. We can inspect any day in October to see which camera kit is with which team. Zero clunky spreadsheets."
                </p>
                <div class="testimonial-author">
                  <div class="author-avatar">AM</div>
                  <div>
                    <h5 class="author-name">Arjun Mehta</h5>
                    <p class="author-role">Filmmaking Lead, Design Dept</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bottom CTA -->
        <section class="section section-cta">
          <div class="container-narrow text-center">
            <h2 class="cta-heading">Ready To Reserve Your Equipment?</h2>
            <p class="cta-subheading">Experience frictionless rentals with verified equipment availability today.</p>
            <div class="cta-actions">
              <button class="btn btn-primary" onclick="window.RentEaseApp.navigate('equipment')">
                <i data-lucide="package-search"></i>
                <span>Explore Catalog</span>
              </button>
              <button class="btn btn-outline" onclick="window.RentEaseApp.openAuthModal()">
                <i data-lucide="shield"></i>
                <span>Switch To Admin Mode</span>
              </button>
            </div>
          </div>
        </section>
      `;

      // Trigger initial sandbox check for visual verification
      this.checkSandbox();
    },

    /**
     * Conflict sandbox interactive handler
     */
    runSandboxScenario(type) {
      const startInput = document.getElementById('sandbox-start-date');
      const endInput = document.getElementById('sandbox-end-date');
      if (!startInput || !endInput) return;

      if (type === 'conflict') {
        startInput.value = '2026-10-11';
        endInput.value = '2026-10-13';
      } else {
        startInput.value = '2026-10-13';
        endInput.value = '2026-10-15';
      }
      this.checkSandbox();
    },

    checkSandbox() {
      const startInput = document.getElementById('sandbox-start-date');
      const endInput = document.getElementById('sandbox-end-date');
      const resultBox = document.getElementById('sandbox-result');
      if (!startInput || !endInput || !resultBox) return;

      const startDate = startInput.value;
      const endDate = endInput.value;

      const availability = window.RentEaseBooking.checkAvailability('eq-sony-alpha', startDate, endDate);

      if (!availability.isAvailable) {
        resultBox.className = 'sandbox-result-box sandbox-result-conflict';
        resultBox.innerHTML = `
          <div class="result-header">
            <i data-lucide="alert-triangle" class="result-icon text-red-600"></i>
            <div>
              <h4 class="result-title text-red-900">❌ CONFLICT DETECTED</h4>
              <p class="result-desc text-red-700">
                Unfortunately, this equipment is already booked during the selected dates.
              </p>
            </div>
          </div>
          <div class="result-details">
            <div class="result-detail-row">
              <span class="detail-label">Unavailable dates:</span>
              <span class="detail-val font-semibold text-red-800">${availability.conflictRange || '10 Oct – 12 Oct 2026'}</span>
            </div>
            <div class="result-detail-row">
              <span class="detail-label">Overlap Condition:</span>
              <span class="detail-val font-mono text-xs text-red-700">(${startDate} &lt;= 2026-10-12) &amp;&amp; (${endDate} &gt;= 2026-10-10) === TRUE</span>
            </div>
            <div class="result-detail-row">
              <span class="detail-label">Recommendation:</span>
              <span class="detail-val text-red-800 font-medium">Please choose another date range or equipment.</span>
            </div>
          </div>
        `;
      } else {
        const days = window.RentEaseUtils.calculateRentalDays(startDate, endDate);
        const cost = days * 1500;
        resultBox.className = 'sandbox-result-box sandbox-result-available';
        resultBox.innerHTML = `
          <div class="result-header">
            <i data-lucide="check-circle-2" class="result-icon text-emerald-600"></i>
            <div>
              <h4 class="result-title text-emerald-900">✓ EQUIPMENT AVAILABLE</h4>
              <p class="result-desc text-emerald-700">
                No overlapping bookings found for ${window.RentEaseUtils.formatDate(startDate)} to ${window.RentEaseUtils.formatDate(endDate)}.
              </p>
            </div>
          </div>
          <div class="result-details">
            <div class="result-detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-val font-semibold text-emerald-800">${days} day(s)</span>
            </div>
            <div class="result-detail-row">
              <span class="detail-label">Estimated Total:</span>
              <span class="detail-val font-bold text-emerald-900">${window.RentEaseUtils.formatCurrency(cost)} (₹1,500/day)</span>
            </div>
            <div class="result-detail-row">
              <span class="detail-label">Action:</span>
              <button class="btn btn-sm btn-primary mt-1" onclick="window.RentEaseApp.openBookingModal('eq-sony-alpha', '${startDate}', '${endDate}')">
                <span>Book This Slot Now</span>
                <i data-lucide="arrow-right"></i>
              </button>
            </div>
          </div>
        `;
      }

      if (window.lucide) {
        window.lucide.createIcons({ root: resultBox });
      }
    },

    // ==========================================
    // VIEW 2: EQUIPMENT CATALOG
    // ==========================================
    renderEquipmentCatalog(container) {
      const allEquipment = window.RentEaseStorage.getEquipment();
      const categories = window.RentEaseData.categories;

      container.innerHTML = `
        <div class="container catalog-page">
          <div class="catalog-header">
            <div>
              <h1 class="page-title">Equipment Catalog</h1>
              <p class="page-subtitle">Browse and check availability for high-end production and technical gear</p>
            </div>
          </div>

          <!-- Search & Filter Controls -->
          <div class="catalog-filters-card">
            <div class="filters-search-row">
              <div class="search-input-wrap">
                <i data-lucide="search" class="search-icon"></i>
                <input 
                  type="text" 
                  id="catalog-search-input" 
                  class="search-input" 
                  placeholder="Search by equipment name, category, or features..."
                  value="${window.RentEaseUtils.escapeHTML(this.searchQuery)}"
                />
                ${this.searchQuery ? `<button class="search-clear" id="catalog-search-clear">&times;</button>` : ''}
              </div>

              <div class="sort-select-wrap">
                <label for="catalog-sort-select" class="sort-label">Sort By:</label>
                <select id="catalog-sort-select" class="form-select">
                  <option value="popular" ${this.sortBy === 'popular' ? 'selected' : ''}>Most Popular</option>
                  <option value="price-asc" ${this.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                  <option value="price-desc" ${this.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                  <option value="name-asc" ${this.sortBy === 'name-asc' ? 'selected' : ''}>Name A-Z</option>
                  <option value="rating-desc" ${this.sortBy === 'rating-desc' ? 'selected' : ''}>Highest Rated</option>
                </select>
              </div>
            </div>

            <!-- Category Pills & Availability -->
            <div class="filters-category-row">
              <div class="category-tabs" id="catalog-category-tabs">
                ${categories.map((cat) => `
                  <button 
                    class="category-tab ${this.selectedCategory === cat ? 'category-tab-active' : ''}" 
                    data-category="${cat}">
                    ${cat}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Filtered Catalog Grid -->
          <div id="catalog-grid-container">
            ${this.renderFilteredEquipmentGrid(allEquipment)}
          </div>
        </div>
      `;

      // Wire up catalog events
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase();
          this.updateCatalogGrid();
        });
      }

      const searchClear = document.getElementById('catalog-search-clear');
      if (searchClear) {
        searchClear.addEventListener('click', () => {
          this.searchQuery = '';
          this.updateCatalogGrid();
        });
      }

      const sortSelect = document.getElementById('catalog-sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
          this.sortBy = e.target.value;
          this.updateCatalogGrid();
        });
      }

      const catTabs = document.querySelectorAll('.category-tab');
      catTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          catTabs.forEach((t) => t.classList.remove('category-tab-active'));
          tab.classList.add('category-tab-active');
          this.selectedCategory = tab.getAttribute('data-category');
          this.updateCatalogGrid();
        });
      });
    },

    updateCatalogGrid() {
      const container = document.getElementById('catalog-grid-container');
      if (!container) return;
      const allEquipment = window.RentEaseStorage.getEquipment();
      container.innerHTML = this.renderFilteredEquipmentGrid(allEquipment);
      if (window.lucide) {
        window.lucide.createIcons({ root: container });
      }
    },

    renderFilteredEquipmentGrid(equipmentList) {
      let filtered = equipmentList.filter((item) => {
        // Category filter
        if (this.selectedCategory !== 'All' && item.category !== this.selectedCategory) {
          return false;
        }

        // Search query
        if (this.searchQuery) {
          const nameMatch = item.name.toLowerCase().includes(this.searchQuery);
          const catMatch = item.category.toLowerCase().includes(this.searchQuery);
          const descMatch = (item.description || '').toLowerCase().includes(this.searchQuery);
          const featMatch = (item.features || []).some((f) => f.toLowerCase().includes(this.searchQuery));
          if (!nameMatch && !catMatch && !descMatch && !featMatch) return false;
        }

        return true;
      });

      // Sorting
      filtered.sort((a, b) => {
        if (this.sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (this.sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
        if (this.sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (this.sortBy === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return (b.totalBookings || 0) - (a.totalBookings || 0);
      });

      if (filtered.length === 0) {
        return `
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <i data-lucide="package-x"></i>
            </div>
            <h3 class="empty-title">No equipment found</h3>
            <p class="empty-desc">We couldn't find any gear matching "${window.RentEaseUtils.escapeHTML(this.searchQuery || this.selectedCategory)}".</p>
            <button class="btn btn-secondary mt-3" onclick="window.RentEaseApp.resetCatalogFilters()">
              <i data-lucide="rotate-ccw"></i>
              <span>Reset Filters</span>
            </button>
          </div>
        `;
      }

      return `
        <div class="equipment-grid">
          ${filtered.map((item) => this.renderEquipmentCard(item)).join('')}
        </div>
      `;
    },

    resetCatalogFilters() {
      this.searchQuery = '';
      this.selectedCategory = 'All';
      this.sortBy = 'popular';
      const searchInput = document.getElementById('catalog-search-input');
      if (searchInput) searchInput.value = '';
      this.renderEquipmentCatalog(document.getElementById('main-content'));
    },

    renderEquipmentCard(item) {
      return `
        <div class="equipment-card">
          <div class="card-img-wrap">
            <img 
              src="${item.image}" 
              alt="${window.RentEaseUtils.escapeHTML(item.name)}" 
              class="card-img" 
              referrerpolicy="no-referrer"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="img-fallback card-fallback" style="display: none;">
              <i data-lucide="camera" class="w-8 h-8 text-slate-400"></i>
              <span>${window.RentEaseUtils.escapeHTML(item.name)}</span>
            </div>
            <div class="card-category-tag">${window.RentEaseUtils.escapeHTML(item.category)}</div>
            <div class="card-status-tag status-${item.status.toLowerCase()}">${item.status}</div>
          </div>

          <div class="card-body">
            <div class="card-header-row">
              <h3 class="card-title">${window.RentEaseUtils.escapeHTML(item.name)}</h3>
              <div class="card-rating">
                <i data-lucide="star" class="star-icon"></i>
                <span class="rating-num tabular-nums">${item.rating || 5.0}</span>
              </div>
            </div>

            <p class="card-desc">${window.RentEaseUtils.escapeHTML(item.description)}</p>

            <div class="card-meta">
              <div class="card-price-wrap">
                <span class="price-amount tabular-nums">${window.RentEaseUtils.formatCurrency(item.pricePerDay)}</span>
                <span class="price-period">/ day</span>
              </div>
              <div class="card-deposit-wrap">
                <span class="deposit-label">Deposit:</span>
                <span class="deposit-val tabular-nums">${window.RentEaseUtils.formatCurrency(item.securityDeposit)}</span>
              </div>
            </div>

            <div class="card-actions">
              <button class="btn btn-outline btn-sm" onclick="window.RentEaseApp.openDetailsModal('${item.id}')">
                <i data-lucide="eye"></i>
                <span>View Details</span>
              </button>
              <button class="btn btn-primary btn-sm" onclick="window.RentEaseApp.openBookingModal('${item.id}')">
                <i data-lucide="calendar-plus"></i>
                <span>Book Now</span>
              </button>
            </div>
          </div>
        </div>
      `;
    },

    // ==========================================
    // VIEW 3: MY RENTALS (CUSTOMER DASHBOARD)
    // ==========================================
    renderMyRentals(container) {
      const user = window.RentEaseStorage.getCurrentUser();
      const allBookings = window.RentEaseStorage.getBookings();

      // In demo mode, show bookings associated with current user email or demo set
      const userBookings = allBookings.filter((b) => {
        if (user.role === 'admin') return true; // admin sees all
        return b.customerEmail.toLowerCase() === user.email.toLowerCase() || b.customerEmail.includes('rentease.com');
      });

      container.innerHTML = `
        <div class="container my-rentals-page">
          <div class="rentals-header">
            <div>
              <h1 class="page-title">My Rentals</h1>
              <p class="page-subtitle">Track your equipment reservations, rental schedules, and return statuses</p>
            </div>
            <button class="btn btn-primary" onclick="window.RentEaseApp.navigate('equipment')">
              <i data-lucide="plus"></i>
              <span>Book New Equipment</span>
            </button>
          </div>

          <!-- Status Filter Tabs -->
          <div class="rental-filter-tabs" id="rental-status-tabs">
            <button class="rental-tab rental-tab-active" data-status="all">All Bookings (${userBookings.length})</button>
            <button class="rental-tab" data-status="Pending">Pending (${userBookings.filter((b) => b.status === 'Pending').length})</button>
            <button class="rental-tab" data-status="Approved">Approved (${userBookings.filter((b) => b.status === 'Approved').length})</button>
            <button class="rental-tab" data-status="Active">Active (${userBookings.filter((b) => b.status === 'Active').length})</button>
            <button class="rental-tab" data-status="Overdue">Overdue (${userBookings.filter((b) => b.status === 'Overdue').length})</button>
            <button class="rental-tab" data-status="Returned">Returned (${userBookings.filter((b) => b.status === 'Returned').length})</button>
          </div>

          <!-- Rentals List / Table -->
          <div id="rental-items-container">
            ${this.renderRentalCardsList(userBookings, 'all')}
          </div>
        </div>
      `;

      // Filter tabs listener
      const tabs = container.querySelectorAll('.rental-tab');
      tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          tabs.forEach((t) => t.classList.remove('rental-tab-active'));
          tab.classList.add('rental-tab-active');
          const status = tab.getAttribute('data-status');
          const listContainer = document.getElementById('rental-items-container');
          listContainer.innerHTML = this.renderRentalCardsList(userBookings, status);
          if (window.lucide) {
            window.lucide.createIcons({ root: listContainer });
          }
        });
      });
    },

    renderRentalCardsList(bookings, filterStatus) {
      const filtered = filterStatus === 'all'
        ? bookings
        : bookings.filter((b) => b.status === filterStatus);

      if (filtered.length === 0) {
        return `
          <div class="empty-state">
            <div class="empty-icon-wrap">
              <i data-lucide="calendar-x"></i>
            </div>
            <h3 class="empty-title">No rentals found</h3>
            <p class="empty-desc">You don't have any bookings matching this status category.</p>
            <button class="btn btn-primary mt-3" onclick="window.RentEaseApp.navigate('equipment')">
              <i data-lucide="package-search"></i>
              <span>Browse Equipment</span>
            </button>
          </div>
        `;
      }

      return `
        <div class="rentals-list">
          ${filtered.map((b) => {
            const isOverdue = b.status === 'Overdue' || (['Approved', 'Active'].includes(b.status) && window.RentEaseUtils.isPastEndDate(b.endDate));
            const overdueDays = isOverdue ? window.RentEaseUtils.getOverdueDays(b.endDate) : 0;

            return `
              <div class="rental-card ${isOverdue ? 'rental-card-overdue' : ''}">
                <div class="rental-card-thumb-wrap">
                  <img 
                    src="${b.equipmentImage}" 
                    alt="${window.RentEaseUtils.escapeHTML(b.equipmentName)}" 
                    class="rental-card-thumb" 
                    referrerpolicy="no-referrer"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="img-fallback thumb-fallback" style="display: none;">
                    <i data-lucide="camera" class="w-6 h-6 text-slate-400"></i>
                  </div>
                </div>

                <div class="rental-card-main">
                  <div class="rental-card-header">
                    <div>
                      <span class="rental-id font-mono tabular-nums">${b.id}</span>
                      <h3 class="rental-title">${window.RentEaseUtils.escapeHTML(b.equipmentName)}</h3>
                    </div>
                    <div class="rental-status-badge badge-${b.status.toLowerCase()}">
                      ${b.status}
                    </div>
                  </div>

                  <div class="rental-card-grid">
                    <div class="rental-grid-item">
                      <span class="grid-label">Rental Duration</span>
                      <span class="grid-value">${window.RentEaseUtils.formatDate(b.startDate, false)} – ${window.RentEaseUtils.formatDate(b.endDate, true)}</span>
                    </div>
                    <div class="rental-grid-item">
                      <span class="grid-label">Days</span>
                      <span class="grid-value tabular-nums">${b.rentalDays} day(s)</span>
                    </div>
                    <div class="rental-grid-item">
                      <span class="grid-label">Daily Rate</span>
                      <span class="grid-value tabular-nums">${window.RentEaseUtils.formatCurrency(b.pricePerDay)}/day</span>
                    </div>
                    <div class="rental-grid-item">
                      <span class="grid-label">Total Amount</span>
                      <span class="grid-value font-bold tabular-nums text-slate-900">${window.RentEaseUtils.formatCurrency(b.totalAmount)}</span>
                    </div>
                  </div>

                  ${isOverdue ? `
                    <div class="overdue-banner">
                      <i data-lucide="alert-circle" class="w-4 h-4 text-orange-600"></i>
                      <span>OVERDUE: Expected return was ${window.RentEaseUtils.formatDate(b.endDate)} (${overdueDays} day${overdueDays === 1 ? '' : 's'} past deadline). Please return equipment to campus store.</span>
                    </div>
                  ` : ''}

                  <div class="rental-card-footer">
                    <span class="rental-booked-on">Booked for ${window.RentEaseUtils.escapeHTML(b.customerName)}</span>
                    <div class="rental-actions">
                      <button class="btn btn-sm btn-outline" onclick="window.RentEaseApp.openDetailsModal('${b.equipmentId}')">
                        <i data-lucide="info"></i>
                        <span>Equipment Specs</span>
                      </button>
                      ${b.status === 'Pending' ? `
                        <button class="btn btn-sm btn-danger-outline" onclick="window.RentEaseApp.cancelPendingBooking('${b.id}')">
                          <i data-lucide="x"></i>
                          <span>Cancel Request</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    cancelPendingBooking(bookingId) {
      if (confirm(`Are you sure you want to cancel booking request ${bookingId}?`)) {
        const bookings = window.RentEaseStorage.getBookings().filter((b) => b.id !== bookingId);
        window.RentEaseStorage.saveBookings(bookings);
        window.RentEaseUtils.showToast(`Booking request ${bookingId} has been cancelled.`, 'info');
        this.renderMyRentals(document.getElementById('main-content'));
      }
    },

    // ==========================================
    // VIEW 4: CALENDAR PAGE
    // ==========================================
    renderCalendarView(container) {
      const equipmentList = window.RentEaseStorage.getEquipment();

      container.innerHTML = `
        <div class="container calendar-page">
          <div class="calendar-page-header">
            <div>
              <h1 class="page-title">Booking & Availability Calendar</h1>
              <p class="page-subtitle">Interactive schedule showing reserved and available dates for all inventory</p>
            </div>

            <!-- Calendar Filters -->
            <div class="calendar-filter-bar">
              <div class="filter-item">
                <label for="cal-equipment-select" class="form-label-inline">Equipment:</label>
                <select id="cal-equipment-select" class="form-select form-select-sm">
                  <option value="all">All Equipment</option>
                  ${equipmentList.map((e) => `<option value="${e.id}">${window.RentEaseUtils.escapeHTML(e.name)}</option>`).join('')}
                </select>
              </div>

              <div class="filter-item">
                <label for="cal-status-select" class="form-label-inline">Status:</label>
                <select id="cal-status-select" class="form-select form-select-sm">
                  <option value="all">All Statuses</option>
                  <option value="Approved">Approved</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Returned">Returned</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Calendar Render Target -->
          <div id="calendar-target"></div>
        </div>
      `;

      // Mount Calendar
      this.calendarInstance = new window.RentEaseCalendar('calendar-target', {
        initialYear: 2026,
        initialMonth: 9 // October (0-indexed: 9 = October)
      });
      this.calendarInstance.render();

      // Listen for filter changes
      const eqSelect = document.getElementById('cal-equipment-select');
      const stSelect = document.getElementById('cal-status-select');

      if (eqSelect) {
        eqSelect.addEventListener('change', (e) => {
          this.calendarInstance.setEquipment(e.target.value);
        });
      }

      if (stSelect) {
        stSelect.addEventListener('change', (e) => {
          this.calendarInstance.setStatus(e.target.value);
        });
      }
    },

    // ==========================================
    // VIEW 5: ABOUT PAGE
    // ==========================================
    renderAboutView(container) {
      container.innerHTML = `
        <div class="container-narrow about-page">
          <div class="about-hero text-center">
            <span class="hero-kicker-dot"></span>
            <h1 class="page-title">RentEase Platform</h1>
            <p class="page-subtitle">Built for college hackathon with mathematical date-conflict detection</p>
          </div>

          <div class="about-section-card">
            <h3 class="about-card-title">The Double-Booking Problem</h3>
            <p class="about-card-p">
              College media societies, robotics clubs, and hackathon participants frequently share high-value equipment such as cinema cameras, 4K projectors, sound consoles, and power tools. Traditional manual coordination using chat groups or spreadsheets leads to overlapping reservations, missing inventory, and project delays.
            </p>
          </div>

          <div class="about-section-card">
            <h3 class="about-card-title">Mathematical Overlap Algorithm</h3>
            <p class="about-card-p">
              RentEase eliminates human scheduling errors with strict client-side date collision verification. Before any reservation is persisted to LocalStorage, it evaluates:
            </p>
            <div class="code-block">
              <code>newStart &lt;= existingEnd &amp;&amp; newEnd &gt;= existingStart</code>
            </div>
            <p class="about-card-p">
              If this conditional returns true for any active, pending, or approved reservation, the request is immediately rejected and the conflicting date span is displayed to the user.
            </p>
          </div>

          <div class="about-section-card">
            <h3 class="about-card-title">Status Transition Life Cycle</h3>
            <div class="status-lifecycle-flow">
              <span class="lifecycle-step step-pending">Pending</span>
              <i data-lucide="arrow-right" class="lifecycle-arrow"></i>
              <span class="lifecycle-step step-approved">Approved</span>
              <i data-lucide="arrow-right" class="lifecycle-arrow"></i>
              <span class="lifecycle-step step-active">Active</span>
              <i data-lucide="arrow-right" class="lifecycle-arrow"></i>
              <span class="lifecycle-step step-returned">Returned</span>
            </div>
            <p class="about-card-p mt-3">
              Bookings can be rejected directly from Pending or Approved. If an active or approved rental exceeds its return date, RentEase automatically flags it as <strong class="text-orange-700">Overdue</strong> and counts the elapsed days.
            </p>
          </div>

          <div class="about-section-card">
            <h3 class="about-card-title">Architecture & Tech Stack</h3>
            <div class="tech-stack-grid">
              <div class="tech-item">
                <i data-lucide="file-code" class="tech-icon"></i>
                <span class="tech-name">HTML5 & CSS3</span>
                <span class="tech-desc">Semantic, responsive SaaS UI</span>
              </div>
              <div class="tech-item">
                <i data-lucide="code" class="tech-icon"></i>
                <span class="tech-name">Vanilla JavaScript</span>
                <span class="tech-desc">Zero backend dependency</span>
              </div>
              <div class="tech-item">
                <i data-lucide="database" class="tech-icon"></i>
                <span class="tech-name">LocalStorage</span>
                <span class="tech-desc">Client dynamic persistence</span>
              </div>
              <div class="tech-item">
                <i data-lucide="pie-chart" class="tech-icon"></i>
                <span class="tech-name">Lucide Icons & Chart.js</span>
                <span class="tech-desc">Professional iconography & metrics</span>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // ==========================================
    // VIEW 6: ADMIN DASHBOARD
    // ==========================================
    renderAdminDashboard(container) {
      const stats = window.RentEaseAdmin.getDashboardStats();
      const bookings = window.RentEaseStorage.getBookings();
      const pendingBookings = bookings.filter((b) => b.status === 'Pending').slice(0, 5);
      const overdueBookings = bookings.filter((b) => b.status === 'Overdue');

      container.innerHTML = `
        <div class="container admin-page">
          <div class="admin-header">
            <div>
              <div class="section-kicker">Owner & Operations Portal</div>
              <h1 class="page-title">Admin Dashboard</h1>
              <p class="page-subtitle">Monitor live equipment inventory, rental revenue, and date collision statuses</p>
            </div>
            <div class="admin-quick-actions">
              <button class="btn btn-outline" onclick="window.RentEaseApp.openAddEquipmentModal()">
                <i data-lucide="plus"></i>
                <span>Add Equipment</span>
              </button>
              <button class="btn btn-primary" onclick="window.RentEaseApp.navigate('admin-bookings')">
                <i data-lucide="calendar-check"></i>
                <span>Manage Bookings</span>
              </button>
            </div>
          </div>

          <!-- Overdue Alert if any -->
          ${overdueBookings.length > 0 ? `
            <div class="admin-alert-banner alert-warning">
              <i data-lucide="alert-triangle" class="alert-icon"></i>
              <div class="alert-content">
                <h4 class="alert-title">${overdueBookings.length} Overdue Equipment Rental(s) Detected</h4>
                <p class="alert-desc">The following equipment items have passed their scheduled return date: ${overdueBookings.map((b) => `${b.equipmentName} (${window.RentEaseUtils.getOverdueDays(b.endDate)} days overdue)`).join(', ')}</p>
              </div>
              <button class="btn btn-sm btn-outline-warning" onclick="window.RentEaseApp.navigate('admin-bookings')">
                View Overdue
              </button>
            </div>
          ` : ''}

          <!-- Statistics Grid -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon-wrap icon-blue">
                <i data-lucide="package"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Equipment</span>
                <span class="stat-value tabular-nums">${stats.totalEquipment}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap icon-purple">
                <i data-lucide="calendar"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Bookings</span>
                <span class="stat-value tabular-nums">${stats.totalBookings}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap icon-green">
                <i data-lucide="check-circle-2"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Active Rentals</span>
                <span class="stat-value tabular-nums">${stats.activeRentals}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap icon-amber">
                <i data-lucide="clock"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Pending Requests</span>
                <span class="stat-value tabular-nums">${stats.pendingRequests}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap icon-red">
                <i data-lucide="alert-circle"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Overdue Rentals</span>
                <span class="stat-value tabular-nums text-red-600">${stats.overdueRentals}</span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon-wrap icon-emerald">
                <i data-lucide="indian-rupee"></i>
              </div>
              <div class="stat-info">
                <span class="stat-label">Total Revenue</span>
                <span class="stat-value tabular-nums text-emerald-700">${window.RentEaseUtils.formatCurrency(stats.totalRevenue)}</span>
              </div>
            </div>
          </div>

          <!-- Pending Requests Queue -->
          <div class="admin-section-card mt-6">
            <div class="card-section-header">
              <div>
                <h3 class="card-section-title">Pending Booking Approvals</h3>
                <p class="card-section-subtitle">Review new customer equipment reservation requests</p>
              </div>
              <button class="btn btn-ghost btn-sm" onclick="window.RentEaseApp.navigate('admin-bookings')">
                <span>View All (${bookings.length})</span>
                <i data-lucide="arrow-right"></i>
              </button>
            </div>

            ${pendingBookings.length === 0 ? `
              <div class="empty-state-sm">
                <i data-lucide="check-circle" class="w-8 h-8 text-emerald-500 mb-1"></i>
                <p class="text-sm text-slate-500">All booking requests have been reviewed!</p>
              </div>
            ` : `
              <div class="table-responsive">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Booking ID</th>
                      <th>Customer</th>
                      <th>Equipment</th>
                      <th>Dates</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pendingBookings.map((b) => `
                      <tr>
                        <td class="font-mono text-xs tabular-nums">${b.id}</td>
                        <td>
                          <div class="font-medium text-slate-900">${window.RentEaseUtils.escapeHTML(b.customerName)}</div>
                          <div class="text-xs text-slate-500">${window.RentEaseUtils.escapeHTML(b.customerPhone)}</div>
                        </td>
                        <td>${window.RentEaseUtils.escapeHTML(b.equipmentName)}</td>
                        <td>
                          <div class="text-xs">${window.RentEaseUtils.formatDate(b.startDate, false)} – ${window.RentEaseUtils.formatDate(b.endDate, true)}</div>
                          <div class="text-xs text-slate-400 tabular-nums">${b.rentalDays} days</div>
                        </td>
                        <td class="font-semibold tabular-nums">${window.RentEaseUtils.formatCurrency(b.totalAmount)}</td>
                        <td>
                          <div class="flex items-center gap-1">
                            <button class="btn btn-xs btn-success" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Approved')">
                              <i data-lucide="check"></i>
                              <span>Approve</span>
                            </button>
                            <button class="btn btn-xs btn-danger-outline" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Rejected')">
                              <i data-lucide="x"></i>
                              <span>Reject</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>
        </div>
      `;
    },

    // ==========================================
    // VIEW 7: ADMIN EQUIPMENT MANAGEMENT
    // ==========================================
    renderAdminEquipment(container) {
      const equipmentList = window.RentEaseStorage.getEquipment();

      container.innerHTML = `
        <div class="container admin-page">
          <div class="admin-header">
            <div>
              <h1 class="page-title">Equipment Inventory Management</h1>
              <p class="page-subtitle">Add, edit, manage stock, and track rental bookings per equipment item</p>
            </div>
            <button class="btn btn-primary" onclick="window.RentEaseApp.openAddEquipmentModal()">
              <i data-lucide="plus"></i>
              <span>Add Equipment</span>
            </button>
          </div>

          <div class="admin-card">
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Category</th>
                    <th>Daily Rate</th>
                    <th>Security Deposit</th>
                    <th>Units</th>
                    <th>Status</th>
                    <th>Total Bookings</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${equipmentList.map((item) => `
                    <tr>
                      <td>
                        <div class="flex items-center gap-3">
                          <img src="${item.image}" alt="${window.RentEaseUtils.escapeHTML(item.name)}" class="w-10 h-10 rounded-md object-cover border border-slate-200" />
                          <div>
                            <div class="font-semibold text-slate-900">${window.RentEaseUtils.escapeHTML(item.name)}</div>
                            <div class="text-xs text-slate-500">${item.features ? item.features.slice(0, 2).join(' · ') : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="text-xs text-slate-700 font-medium">${window.RentEaseUtils.escapeHTML(item.category)}</span>
                      </td>
                      <td class="font-semibold tabular-nums">${window.RentEaseUtils.formatCurrency(item.pricePerDay)}</td>
                      <td class="tabular-nums text-slate-600">${window.RentEaseUtils.formatCurrency(item.securityDeposit)}</td>
                      <td class="tabular-nums">${item.quantity || 1}</td>
                      <td>
                        <span class="badge-${item.status.toLowerCase()} text-xs px-2 py-0.5 rounded">${item.status}</span>
                      </td>
                      <td class="tabular-nums">${item.totalBookings || 0}</td>
                      <td>
                        <div class="flex items-center gap-1">
                          <button class="btn btn-xs btn-outline" onclick="window.RentEaseApp.openDetailsModal('${item.id}')" title="View">
                            <i data-lucide="eye"></i>
                          </button>
                          <button class="btn btn-xs btn-secondary" onclick="window.RentEaseApp.openEditEquipmentModal('${item.id}')" title="Edit">
                            <i data-lucide="edit-2"></i>
                          </button>
                          <button class="btn btn-xs btn-danger-outline" onclick="window.RentEaseApp.confirmDeleteEquipment('${item.id}', '${window.RentEaseUtils.escapeHTML(item.name)}')" title="Delete">
                            <i data-lucide="trash-2"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    // ==========================================
    // VIEW 8: ADMIN BOOKING MANAGEMENT
    // ==========================================
    renderAdminBookings(container) {
      const allBookings = window.RentEaseStorage.getBookings();

      container.innerHTML = `
        <div class="container admin-page">
          <div class="admin-header">
            <div>
              <h1 class="page-title">Bookings & Reservations</h1>
              <p class="page-subtitle">Approve, reject, hand over active equipment, and confirm returns</p>
            </div>
            <div class="flex items-center gap-2">
              <select id="admin-booking-filter-status" class="form-select form-select-sm">
                <option value="all">All Statuses (${allBookings.length})</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Active">Active</option>
                <option value="Overdue">Overdue</option>
                <option value="Returned">Returned</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div class="admin-card">
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Customer</th>
                    <th>Equipment</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Workflow Actions</th>
                  </tr>
                </thead>
                <tbody id="admin-bookings-tbody">
                  ${this.renderAdminBookingRows(allBookings, 'all')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;

      const filterSelect = document.getElementById('admin-booking-filter-status');
      if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
          const tbody = document.getElementById('admin-bookings-tbody');
          tbody.innerHTML = this.renderAdminBookingRows(allBookings, e.target.value);
          if (window.lucide) {
            window.lucide.createIcons({ root: tbody });
          }
        });
      }
    },

    renderAdminBookingRows(bookings, statusFilter) {
      const filtered = statusFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === statusFilter);

      if (filtered.length === 0) {
        return `
          <tr>
            <td colspan="8" class="text-center py-8 text-slate-500">
              No bookings found in this status category.
            </td>
          </tr>
        `;
      }

      return filtered.map((b) => {
        let actionButtons = '';

        if (b.status === 'Pending') {
          actionButtons = `
            <button class="btn btn-xs btn-success" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Approved')">Approve</button>
            <button class="btn btn-xs btn-danger-outline" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Rejected')">Reject</button>
          `;
        } else if (b.status === 'Approved') {
          actionButtons = `
            <button class="btn btn-xs btn-primary" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Active')">Mark Active (Hand Over)</button>
            <button class="btn btn-xs btn-danger-outline" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Rejected')">Reject</button>
          `;
        } else if (b.status === 'Active' || b.status === 'Overdue') {
          actionButtons = `
            <button class="btn btn-xs btn-success" onclick="window.RentEaseApp.handleBookingAction('${b.id}', 'Returned')">Mark Returned</button>
          `;
        } else {
          actionButtons = `<span class="text-xs text-slate-400">Completed</span>`;
        }

        const isOverdue = b.status === 'Overdue' || (['Approved', 'Active'].includes(b.status) && window.RentEaseUtils.isPastEndDate(b.endDate));
        const overdueDays = isOverdue ? window.RentEaseUtils.getOverdueDays(b.endDate) : 0;

        return `
          <tr class="${isOverdue ? 'bg-orange-50/50' : ''}">
            <td class="font-mono text-xs tabular-nums font-semibold">${b.id}</td>
            <td>
              <div class="font-medium text-slate-900">${window.RentEaseUtils.escapeHTML(b.customerName)}</div>
              <div class="text-xs text-slate-500">${window.RentEaseUtils.escapeHTML(b.customerEmail)}</div>
              <div class="text-xs text-slate-400">${window.RentEaseUtils.escapeHTML(b.customerPhone)}</div>
            </td>
            <td>
              <div class="font-medium text-slate-900">${window.RentEaseUtils.escapeHTML(b.equipmentName)}</div>
            </td>
            <td>
              <div class="text-xs font-medium">${window.RentEaseUtils.formatDate(b.startDate, false)} – ${window.RentEaseUtils.formatDate(b.endDate, true)}</div>
            </td>
            <td class="tabular-nums text-xs">${b.rentalDays}</td>
            <td class="font-bold tabular-nums text-slate-900">${window.RentEaseUtils.formatCurrency(b.totalAmount)}</td>
            <td>
              <span class="badge-${b.status.toLowerCase()} text-xs px-2 py-0.5 rounded font-medium">${b.status}</span>
              ${isOverdue ? `<div class="text-xs text-orange-700 font-medium mt-0.5">${overdueDays}d overdue</div>` : ''}
            </td>
            <td>
              <div class="flex items-center gap-1">
                ${actionButtons}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    },

    handleBookingAction(bookingId, targetStatus) {
      window.RentEaseAdmin.updateBookingStatus(bookingId, targetStatus);
      // Re-render whichever view is active
      if (this.currentView === 'admin-bookings') {
        this.renderAdminBookings(document.getElementById('main-content'));
      } else if (this.currentView === 'admin-dashboard') {
        this.renderAdminDashboard(document.getElementById('main-content'));
      }
    },

    // ==========================================
    // VIEW 9: ADMIN REPORTS
    // ==========================================
    renderAdminReports(container) {
      const stats = window.RentEaseAdmin.getDashboardStats();
      const equipment = window.RentEaseStorage.getEquipment();
      const bookings = window.RentEaseStorage.getBookings();

      // Category breakdown
      const categoryRevenue = {};
      bookings.forEach((b) => {
        const eq = equipment.find((e) => e.id === b.equipmentId);
        const cat = eq ? eq.category : 'Other';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (Number(b.totalAmount) || 0);
      });

      container.innerHTML = `
        <div class="container admin-page">
          <div class="admin-header">
            <div>
              <h1 class="page-title">Analytics & Reports</h1>
              <p class="page-subtitle">Inventory utilization, rental revenue trends, and operational data</p>
            </div>
            <button class="btn btn-outline" onclick="window.RentEaseAdmin.exportData('json')">
              <i data-lucide="download"></i>
              <span>Export JSON Backup</span>
            </button>
          </div>

          <div class="reports-grid">
            <div class="report-card">
              <h3 class="report-title">Revenue by Equipment Category</h3>
              <div class="category-bars mt-4">
                ${Object.entries(categoryRevenue).map(([cat, amt]) => {
                  const percent = stats.totalRevenue > 0 ? Math.round((amt / stats.totalRevenue) * 100) : 0;
                  return `
                    <div class="category-bar-row">
                      <div class="bar-label-wrap">
                        <span class="bar-cat-name">${cat}</span>
                        <span class="bar-cat-amt tabular-nums font-semibold">${window.RentEaseUtils.formatCurrency(amt)} (${percent}%)</span>
                      </div>
                      <div class="bar-track">
                        <div class="bar-fill" style="width: ${percent}%;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="report-card">
              <h3 class="report-title">Top Rented Equipment</h3>
              <div class="top-gear-list mt-4">
                ${equipment
                  .slice()
                  .sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0))
                  .slice(0, 5)
                  .map((item, idx) => `
                    <div class="top-gear-item">
                      <span class="top-gear-rank">#${idx + 1}</span>
                      <div class="top-gear-info">
                        <h5 class="top-gear-name">${window.RentEaseUtils.escapeHTML(item.name)}</h5>
                        <span class="top-gear-rate tabular-nums">${window.RentEaseUtils.formatCurrency(item.pricePerDay)}/day</span>
                      </div>
                      <span class="top-gear-count tabular-nums font-semibold">${item.totalBookings || 0} rentals</span>
                    </div>
                  `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // ==========================================
    // VIEW 10: ADMIN SETTINGS
    // ==========================================
    renderAdminSettings(container) {
      container.innerHTML = `
        <div class="container-narrow admin-page">
          <div class="admin-header">
            <div>
              <h1 class="page-title">Platform Settings</h1>
              <p class="page-subtitle">Configure business rules, currency, and LocalStorage resets</p>
            </div>
          </div>

          <div class="admin-card">
            <h3 class="card-section-title">Rental Conflict Rule Engine</h3>
            <p class="text-sm text-slate-600 mb-4">
              Mathematical overlap formula: <code>newStart &lt;= existingEnd &amp;&amp; newEnd &gt;= existingStart</code>.
              Currently enforces blocking reservations for: <strong>Approved, Active, Pending, Overdue</strong>.
            </p>

            <div class="settings-divider"></div>

            <h3 class="card-section-title">Hackathon Demo Controls</h3>
            <p class="text-sm text-slate-600 mb-4">
              Reset all inventory, test bookings, and users to original clean hackathon seed state.
            </p>
            <button class="btn btn-danger" onclick="window.RentEaseApp.resetDatabase()">
              <i data-lucide="rotate-ccw"></i>
              <span>Reset Database to Default Demo State</span>
            </button>
          </div>
        </div>
      `;
    },

    resetDatabase() {
      if (confirm('Are you sure you want to reset all LocalStorage data to original sample demo values? Any new equipment or bookings you added will be refreshed.')) {
        window.RentEaseStorage.resetToDemoData();
        window.RentEaseUtils.showToast('Database reset to original demo state successfully!', 'success');
        this.navigate('home');
      }
    },

    // ==========================================
    // MODALS: DETAILS, BOOKING, ADD/EDIT, AUTH
    // ==========================================

    openDetailsModal(equipmentId) {
      const item = window.RentEaseStorage.getEquipmentById(equipmentId);
      if (!item) return;

      const modal = document.getElementById('details-modal');
      const body = document.getElementById('details-modal-body');
      if (!modal || !body) return;

      const bookings = window.RentEaseStorage.getEquipmentBookings(equipmentId);
      const activeBookings = bookings.filter((b) => ['Approved', 'Active', 'Pending', 'Overdue'].includes(b.status));

      body.innerHTML = `
        <div class="details-modal-grid">
          <div class="details-modal-image-wrap">
            <img 
              src="${item.image}" 
              alt="${window.RentEaseUtils.escapeHTML(item.name)}" 
              class="details-modal-img" 
              referrerpolicy="no-referrer"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            />
            <div class="img-fallback details-fallback" style="display: none;">
              <i data-lucide="camera" class="w-12 h-12 text-slate-400"></i>
              <span>${window.RentEaseUtils.escapeHTML(item.name)}</span>
            </div>
            <div class="details-status-badge badge-${item.status.toLowerCase()}">${item.status}</div>
          </div>

          <div class="details-modal-info">
            <div class="details-kicker">${window.RentEaseUtils.escapeHTML(item.category)}</div>
            <h2 class="details-title">${window.RentEaseUtils.escapeHTML(item.name)}</h2>
            
            <div class="details-rating-row">
              <div class="flex items-center gap-1 text-amber-500">
                <i data-lucide="star" class="w-4 h-4 fill-amber-400"></i>
                <span class="font-semibold text-slate-800 tabular-nums">${item.rating || 5.0}</span>
              </div>
              <span class="text-slate-300">·</span>
              <span class="text-xs text-slate-500 tabular-nums">${item.totalBookings || 0} completed rentals</span>
              <span class="text-slate-300">·</span>
              <span class="text-xs text-slate-500 tabular-nums">${item.quantity || 1} units available</span>
            </div>

            <p class="details-desc">${window.RentEaseUtils.escapeHTML(item.description)}</p>

            <div class="details-features-box">
              <h4 class="features-box-title">Key Specifications & Accessories Included:</h4>
              <ul class="features-list">
                ${(item.features || []).map((f) => `
                  <li class="feature-item">
                    <i data-lucide="check" class="feature-check"></i>
                    <span>${window.RentEaseUtils.escapeHTML(f)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="details-pricing-strip">
              <div>
                <span class="price-title">Daily Rental Rate:</span>
                <span class="price-val font-bold tabular-nums text-slate-900">${window.RentEaseUtils.formatCurrency(item.pricePerDay)}</span>
                <span class="text-xs text-slate-500">/ day</span>
              </div>
              <div class="text-right">
                <span class="price-title">Security Deposit:</span>
                <span class="price-val font-semibold tabular-nums text-slate-700">${window.RentEaseUtils.formatCurrency(item.securityDeposit)}</span>
                <span class="text-xs text-slate-400 block">(Refundable)</span>
              </div>
            </div>

            <!-- Active Reservations alert -->
            ${activeBookings.length > 0 ? `
              <div class="details-booked-dates">
                <h5 class="booked-dates-title">
                  <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                  <span>Current Reserved Spans:</span>
                </h5>
                <div class="booked-spans-list">
                  ${activeBookings.map((b) => `
                    <span class="booked-span-chip">
                      ${window.RentEaseUtils.formatDate(b.startDate, false)} to ${window.RentEaseUtils.formatDate(b.endDate, true)} (${b.status})
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="details-modal-footer">
              <button class="btn btn-outline" onclick="window.RentEaseApp.closeModal('details-modal')">Close</button>
              <button class="btn btn-primary" onclick="window.RentEaseApp.closeModal('details-modal'); window.RentEaseApp.openBookingModal('${item.id}');">
                <i data-lucide="calendar-plus"></i>
                <span>Proceed To Book</span>
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      if (window.lucide) {
        window.lucide.createIcons({ root: body });
      }
    },

    openBookingModal(equipmentId, initialStart = '', initialEnd = '') {
      const item = window.RentEaseStorage.getEquipmentById(equipmentId);
      if (!item) return;

      const user = window.RentEaseStorage.getCurrentUser();
      const modal = document.getElementById('booking-modal');
      const body = document.getElementById('booking-modal-body');
      if (!modal || !body) return;

      // Default dates if not specified: tomorrow to day after
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date();
      dayAfter.setDate(dayAfter.getDate() + 3);

      const defaultStart = initialStart || window.RentEaseUtils.formatDateISO(tomorrow);
      const defaultEnd = initialEnd || window.RentEaseUtils.formatDateISO(dayAfter);

      body.innerHTML = `
        <div class="booking-modal-content">
          <div class="booking-gear-summary">
            <img src="${item.image}" alt="${window.RentEaseUtils.escapeHTML(item.name)}" class="booking-gear-thumb" />
            <div>
              <div class="text-xs text-slate-500 font-medium">${window.RentEaseUtils.escapeHTML(item.category)}</div>
              <h3 class="booking-gear-name">${window.RentEaseUtils.escapeHTML(item.name)}</h3>
              <div class="booking-gear-rate tabular-nums font-semibold text-blue-700">
                ${window.RentEaseUtils.formatCurrency(item.pricePerDay)} / day
              </div>
            </div>
          </div>

          <form id="booking-form" class="booking-form mt-4">
            <input type="hidden" id="book-eq-id" value="${item.id}" />

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="book-cust-name">Customer Name *</label>
                <input type="text" id="book-cust-name" class="form-input" required value="${window.RentEaseUtils.escapeHTML(user.name)}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="book-cust-phone">Phone Number *</label>
                <input type="tel" id="book-cust-phone" class="form-input" required placeholder="+91 98765 43210" value="${window.RentEaseUtils.escapeHTML(user.phone || '+91 98765 43210')}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="book-cust-email">Email Address *</label>
              <input type="email" id="book-cust-email" class="form-input" required value="${window.RentEaseUtils.escapeHTML(user.email)}" />
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="book-start-date">Start Date *</label>
                <input type="date" id="book-start-date" class="form-input" required value="${defaultStart}" />
              </div>
              <div class="form-group">
                <label class="form-label" for="book-end-date">End Date *</label>
                <input type="date" id="book-end-date" class="form-input" required value="${defaultEnd}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="book-notes">Project Purpose / Notes (Optional)</label>
              <input type="text" id="book-notes" class="form-input" placeholder="e.g. Hackathon demo shoot in lab" />
            </div>

            <!-- Dynamic Cost Calculation Box -->
            <div class="cost-summary-box">
              <div class="cost-row">
                <span class="cost-label">Rental Duration:</span>
                <span class="cost-val tabular-nums" id="book-calc-days">0 days</span>
              </div>
              <div class="cost-row">
                <span class="cost-label">Daily Rental Rate:</span>
                <span class="cost-val tabular-nums">${window.RentEaseUtils.formatCurrency(item.pricePerDay)}</span>
              </div>
              <div class="cost-row">
                <span class="cost-label">Security Deposit (Refundable):</span>
                <span class="cost-val tabular-nums">${window.RentEaseUtils.formatCurrency(item.securityDeposit)}</span>
              </div>
              <div class="cost-divider"></div>
              <div class="cost-row cost-total-row">
                <span class="cost-label font-bold text-slate-900">Total Rental Amount:</span>
                <span class="cost-val font-bold tabular-nums text-blue-700 text-lg" id="book-calc-total">₹0</span>
              </div>
            </div>

            <!-- Live Availability Warning / Conflict Box -->
            <div id="booking-conflict-alert" class="hidden"></div>

            <div class="booking-modal-actions mt-4">
              <button type="button" class="btn btn-outline" id="book-check-btn">
                <i data-lucide="shield-check"></i>
                <span>Check Availability</span>
              </button>
              <button type="submit" class="btn btn-primary" id="book-submit-btn">
                <i data-lucide="check"></i>
                <span>Confirm Booking</span>
              </button>
            </div>
          </form>
        </div>
      `;

      modal.classList.remove('hidden');

      // Wire cost calculator and conflict check
      const startInput = document.getElementById('book-start-date');
      const endInput = document.getElementById('book-end-date');
      const daysSpan = document.getElementById('book-calc-days');
      const totalSpan = document.getElementById('book-calc-total');
      const checkBtn = document.getElementById('book-check-btn');
      const conflictBox = document.getElementById('booking-conflict-alert');
      const form = document.getElementById('booking-form');

      const updateCalculation = () => {
        const start = startInput.value;
        const end = endInput.value;
        const days = window.RentEaseUtils.calculateRentalDays(start, end);
        const total = days * item.pricePerDay;

        daysSpan.textContent = `${days} day${days === 1 ? '' : 's'}`;
        totalSpan.textContent = window.RentEaseUtils.formatCurrency(total);

        // Run live check
        if (start && end) {
          const check = window.RentEaseBooking.checkAvailability(item.id, start, end);
          if (!check.isAvailable) {
            conflictBox.className = 'booking-conflict-box';
            conflictBox.innerHTML = `
              <div class="flex items-start gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600 shrink-0 mt-0.5"></i>
                <div>
                  <h4 class="font-bold text-red-900 text-sm">Booking Conflict Detected</h4>
                  <p class="text-xs text-red-700 mt-0.5">Unfortunately, this equipment is already booked during the selected dates.</p>
                  <p class="text-xs font-semibold text-red-800 mt-1">Unavailable dates: ${check.conflictRange || 'Existing reservation'}</p>
                  <p class="text-xs text-red-600 mt-0.5">Please choose another date range.</p>
                </div>
              </div>
            `;
            conflictBox.classList.remove('hidden');
          } else {
            conflictBox.className = 'booking-available-box';
            conflictBox.innerHTML = `
              <div class="flex items-center gap-2">
                <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span class="text-xs font-medium text-emerald-800">Equipment is free and available for these dates!</span>
              </div>
            `;
            conflictBox.classList.remove('hidden');
          }
          if (window.lucide) {
            window.lucide.createIcons({ root: conflictBox });
          }
        } else {
          conflictBox.classList.add('hidden');
        }
      };

      startInput.addEventListener('change', updateCalculation);
      endInput.addEventListener('change', updateCalculation);
      checkBtn.addEventListener('click', updateCalculation);

      // Run initial calculation
      updateCalculation();

      // Handle form submission
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const bookingData = {
          equipmentId: item.id,
          customerName: document.getElementById('book-cust-name').value,
          customerEmail: document.getElementById('book-cust-email').value,
          customerPhone: document.getElementById('book-cust-phone').value,
          startDate: startInput.value,
          endDate: endInput.value,
          notes: document.getElementById('book-notes').value
        };

        const result = window.RentEaseBooking.submitBooking(bookingData);

        if (!result.success) {
          if (result.isConflict) {
            window.RentEaseUtils.showToast(`Booking Conflict: ${result.error}`, 'error', 5000);
            updateCalculation();
          } else {
            window.RentEaseUtils.showToast(result.error, 'error');
          }
          return;
        }

        // Success!
        window.RentEaseUtils.showToast(`Booking ${result.booking.id} created successfully!`, 'success');
        this.closeModal('booking-modal');
        this.openConfirmationModal(result.booking);
      });

      if (window.lucide) {
        window.lucide.createIcons({ root: body });
      }
    },

    openConfirmationModal(booking) {
      const modal = document.getElementById('confirmation-modal');
      const body = document.getElementById('confirmation-modal-body');
      if (!modal || !body) return;

      body.innerHTML = `
        <div class="confirmation-modal-wrap text-center">
          <div class="confirmation-icon-wrap">
            <i data-lucide="check" class="w-8 h-8 text-emerald-600"></i>
          </div>
          <h2 class="confirmation-title">Booking Request Submitted Successfully!</h2>
          <p class="confirmation-desc">Your reservation request has been registered in the system with zero conflicts.</p>

          <div class="confirmation-summary-card">
            <div class="confirm-row">
              <span class="confirm-label">Booking ID:</span>
              <span class="confirm-val font-mono font-bold tabular-nums text-blue-700">${booking.id}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Equipment:</span>
              <span class="confirm-val font-semibold">${window.RentEaseUtils.escapeHTML(booking.equipmentName)}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Customer:</span>
              <span class="confirm-val">${window.RentEaseUtils.escapeHTML(booking.customerName)}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Rental Duration:</span>
              <span class="confirm-val font-medium">${window.RentEaseUtils.formatDate(booking.startDate, false)} to ${window.RentEaseUtils.formatDate(booking.endDate, true)}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Days:</span>
              <span class="confirm-val tabular-nums">${booking.rentalDays} days</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Total Amount:</span>
              <span class="confirm-val font-bold tabular-nums text-slate-900">${window.RentEaseUtils.formatCurrency(booking.totalAmount)}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Initial Status:</span>
              <span class="confirm-val badge-pending px-2 py-0.5 rounded text-xs">${booking.status}</span>
            </div>
          </div>

          <div class="confirmation-actions mt-4">
            <button class="btn btn-outline" onclick="window.RentEaseApp.closeModal('confirmation-modal')">Close</button>
            <button class="btn btn-primary" onclick="window.RentEaseApp.closeModal('confirmation-modal'); window.RentEaseApp.navigate('my-rentals');">
              <i data-lucide="calendar"></i>
              <span>View My Rentals</span>
            </button>
          </div>
        </div>
      `;

      modal.classList.remove('hidden');
      if (window.lucide) {
        window.lucide.createIcons({ root: body });
      }
    },

    openAddEquipmentModal() {
      const modal = document.getElementById('add-edit-modal');
      const body = document.getElementById('add-edit-modal-body');
      const title = document.getElementById('add-edit-modal-title');
      if (!modal || !body || !title) return;

      title.textContent = 'Add New Equipment';
      const categories = window.RentEaseData.categories.filter((c) => c !== 'All');

      body.innerHTML = `
        <form id="equipment-form" class="space-y-4">
          <input type="hidden" id="eq-edit-id" value="" />

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="form-eq-name">Equipment Name *</label>
              <input type="text" id="form-eq-name" class="form-input" required placeholder="e.g. Sony FX3 Cinema Camera" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-category">Category *</label>
              <select id="form-eq-category" class="form-select">
                ${categories.map((c) => `<option value="${c}">${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="form-eq-price">Daily Price (₹) *</label>
              <input type="number" id="form-eq-price" class="form-input" required min="100" step="50" placeholder="1500" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-deposit">Security Deposit (₹)</label>
              <input type="number" id="form-eq-deposit" class="form-input" min="0" step="100" placeholder="5000" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-quantity">Quantity *</label>
              <input type="number" id="form-eq-quantity" class="form-input" required min="1" value="1" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-image">Image URL / Preset</label>
            <div class="flex gap-2">
              <input type="text" id="form-eq-image" class="form-input" value="./assets/images/equipment_sony_alpha_1790661608803.jpg" />
              <select class="form-select w-44" onchange="document.getElementById('form-eq-image').value = this.value">
                <option value="./assets/images/equipment_sony_alpha_1790661608803.jpg">Preset: Sony Camera</option>
                <option value="./assets/images/equipment_canon_eos_1790661620350.jpg">Preset: Canon EOS</option>
                <option value="./assets/images/equipment_epson_projector_1790661631491.jpg">Preset: Projector</option>
                <option value="./assets/images/equipment_jbl_speaker_1790661643998.jpg">Preset: Speaker</option>
                <option value="./assets/images/hero_equipment_showcase_1790661594343.jpg">Preset: Studio Kit</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-desc">Description</label>
            <textarea id="form-eq-desc" class="form-textarea" rows="3" placeholder="Detailed description of item specs, condition, and usage..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-features">Features & Included Accessories (Comma separated)</label>
            <input type="text" id="form-eq-features" class="form-input" placeholder="4K Video, Dual Battery, Tripod, Carrying Case" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-status">Availability Status</label>
            <select id="form-eq-status" class="form-select">
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div class="modal-footer-actions">
            <button type="button" class="btn btn-outline" onclick="window.RentEaseApp.closeModal('add-edit-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Equipment</button>
          </div>
        </form>
      `;

      modal.classList.remove('hidden');

      const form = document.getElementById('equipment-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('form-eq-name').value,
          category: document.getElementById('form-eq-category').value,
          pricePerDay: document.getElementById('form-eq-price').value,
          securityDeposit: document.getElementById('form-eq-deposit').value,
          quantity: document.getElementById('form-eq-quantity').value,
          image: document.getElementById('form-eq-image').value,
          description: document.getElementById('form-eq-desc').value,
          features: document.getElementById('form-eq-features').value,
          status: document.getElementById('form-eq-status').value
        };

        const result = window.RentEaseAdmin.saveEquipmentForm(data, false);
        if (result.success) {
          window.RentEaseUtils.showToast(result.message, 'success');
          this.closeModal('add-edit-modal');
          if (this.currentView === 'admin-equipment') {
            this.renderAdminEquipment(document.getElementById('main-content'));
          } else {
            this.navigate('admin-equipment');
          }
        } else {
          window.RentEaseUtils.showToast(result.error, 'error');
        }
      });
    },

    openEditEquipmentModal(equipmentId) {
      const item = window.RentEaseStorage.getEquipmentById(equipmentId);
      if (!item) return;

      const modal = document.getElementById('add-edit-modal');
      const body = document.getElementById('add-edit-modal-body');
      const title = document.getElementById('add-edit-modal-title');
      if (!modal || !body || !title) return;

      title.textContent = `Edit Equipment: ${item.name}`;
      const categories = window.RentEaseData.categories.filter((c) => c !== 'All');

      body.innerHTML = `
        <form id="equipment-edit-form" class="space-y-4">
          <input type="hidden" id="form-eq-id" value="${item.id}" />

          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label" for="form-eq-name">Equipment Name *</label>
              <input type="text" id="form-eq-name" class="form-input" required value="${window.RentEaseUtils.escapeHTML(item.name)}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-category">Category *</label>
              <select id="form-eq-category" class="form-select">
                ${categories.map((c) => `<option value="${c}" ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label" for="form-eq-price">Daily Price (₹) *</label>
              <input type="number" id="form-eq-price" class="form-input" required min="100" step="50" value="${item.pricePerDay}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-deposit">Security Deposit (₹)</label>
              <input type="number" id="form-eq-deposit" class="form-input" min="0" step="100" value="${item.securityDeposit}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="form-eq-quantity">Quantity *</label>
              <input type="number" id="form-eq-quantity" class="form-input" required min="1" value="${item.quantity || 1}" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-image">Image URL</label>
            <input type="text" id="form-eq-image" class="form-input" value="${item.image}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-desc">Description</label>
            <textarea id="form-eq-desc" class="form-textarea" rows="3">${window.RentEaseUtils.escapeHTML(item.description || '')}</textarea>
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-features">Features (Comma separated)</label>
            <input type="text" id="form-eq-features" class="form-input" value="${window.RentEaseUtils.escapeHTML((item.features || []).join(', '))}" />
          </div>

          <div class="form-group">
            <label class="form-label" for="form-eq-status">Availability Status</label>
            <select id="form-eq-status" class="form-select">
              <option value="Available" ${item.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Maintenance" ${item.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
              <option value="Retired" ${item.status === 'Retired' ? 'selected' : ''}>Retired</option>
            </select>
          </div>

          <div class="modal-footer-actions">
            <button type="button" class="btn btn-outline" onclick="window.RentEaseApp.closeModal('add-edit-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      `;

      modal.classList.remove('hidden');

      const form = document.getElementById('equipment-edit-form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          id: document.getElementById('form-eq-id').value,
          name: document.getElementById('form-eq-name').value,
          category: document.getElementById('form-eq-category').value,
          pricePerDay: document.getElementById('form-eq-price').value,
          securityDeposit: document.getElementById('form-eq-deposit').value,
          quantity: document.getElementById('form-eq-quantity').value,
          image: document.getElementById('form-eq-image').value,
          description: document.getElementById('form-eq-desc').value,
          features: document.getElementById('form-eq-features').value,
          status: document.getElementById('form-eq-status').value
        };

        const result = window.RentEaseAdmin.saveEquipmentForm(data, true);
        if (result.success) {
          window.RentEaseUtils.showToast(result.message, 'success');
          this.closeModal('add-edit-modal');
          this.renderAdminEquipment(document.getElementById('main-content'));
        } else {
          window.RentEaseUtils.showToast(result.error, 'error');
        }
      });
    },

    confirmDeleteEquipment(equipmentId, equipmentName) {
      if (confirm(`Are you sure you want to delete "${equipmentName}"? This action cannot be undone.`)) {
        const result = window.RentEaseAdmin.deleteEquipment(equipmentId);
        if (result.success) {
          window.RentEaseUtils.showToast(result.message, 'success');
          this.renderAdminEquipment(document.getElementById('main-content'));
        } else {
          window.RentEaseUtils.showToast(result.error, 'error', 4500);
        }
      }
    },

    openAuthModal() {
      const modal = document.getElementById('auth-modal');
      if (modal) modal.classList.remove('hidden');
    },

    closeModal(modalId) {
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('hidden');
    },

    // ==========================================
    // GLOBAL BINDINGS
    // ==========================================
    bindNavigation() {
      document.querySelectorAll('[data-view]').forEach((el) => {
        el.addEventListener('click', (e) => {
          e.preventDefault();
          const target = el.getAttribute('data-view');
          if (target) this.navigate(target);
        });
      });

      // Mobile menu toggle
      const mobileToggle = document.getElementById('mobile-menu-toggle');
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
        });
      }
    },

    bindModals() {
      // Close on backdrop or .modal-close button click
      document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            overlay.classList.add('hidden');
          }
        });
      });

      document.querySelectorAll('.modal-close-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const modal = btn.closest('.modal-overlay');
          if (modal) modal.classList.add('hidden');
        });
      });
    },

    bindAuthSwitcher() {
      const loginForm = document.getElementById('demo-login-form');
      const quickCustBtn = document.getElementById('quick-login-customer');
      const quickAdminBtn = document.getElementById('quick-login-admin');

      if (quickCustBtn) {
        quickCustBtn.addEventListener('click', () => {
          const cust = window.RentEaseData.defaultUsers[0];
          window.RentEaseStorage.setCurrentUser(cust);
          this.updateNavbarUser();
          this.closeModal('auth-modal');
          window.RentEaseUtils.showToast(`Logged in as Customer: ${cust.name}`, 'info');
          this.navigate('home');
        });
      }

      if (quickAdminBtn) {
        quickAdminBtn.addEventListener('click', () => {
          const admin = window.RentEaseData.defaultUsers[1];
          window.RentEaseStorage.setCurrentUser(admin);
          this.updateNavbarUser();
          this.closeModal('auth-modal');
          window.RentEaseUtils.showToast(`Logged in as Administrator`, 'success');
          this.navigate('admin-dashboard');
        });
      }

      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const email = document.getElementById('login-email').value;
          const pass = document.getElementById('login-password').value;

          const res = window.RentEaseStorage.login(email, pass);
          if (res.success) {
            this.updateNavbarUser();
            this.closeModal('auth-modal');
            window.RentEaseUtils.showToast(`Welcome back, ${res.user.name}!`, 'success');
            if (res.user.role === 'admin') {
              this.navigate('admin-dashboard');
            } else {
              this.navigate('my-rentals');
            }
          } else {
            window.RentEaseUtils.showToast(res.error, 'error');
          }
        });
      }
    }
  };

  // Expose to window and bootstrap upon DOM load
  window.RentEaseApp = App;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})(window);
