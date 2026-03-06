import toolsData from './tools-config.js';
import CryptoUtils from './crypto-utils.js';
import Auth from './auth.js';
import { translations, Translations, t } from './translations.js';

// =============================================
// Aegis Board - Main Application Logic
// =============================================

const App = {
  // Configuration
  config: {
    storageVersion: "v1",
    currentLanguage: localStorage.getItem("osintLanguage") || "es",
    currentTheme: localStorage.getItem("osintTheme") || "dark",
  },

  // Data storage
  state: {
    tools: [],
    favorites: CryptoUtils.decrypt(localStorage.getItem("osintFavorites")) || [],
    searchHistory: CryptoUtils.decrypt(localStorage.getItem("osintHistory")) || [],
    searches: JSON.parse(localStorage.getItem("osintSearches")) || 0,
    lastSearchQuery: "", // Track last search query for auto-fill
    activeRightPanel: "history", // "history" or "favorites"
  },

  // Initialize the application
  init: function () {
    // Verificar autenticación
    if (!Auth.requireAuth()) return;

    this.loadTools();
    this.loadCustomTools(); // Load custom tools
    this.validateFavorites(); // Sincronizar favoritos
    this.setupEventListeners();
    this.setupTheme();
    this.setupLanguage();
    // Show all tools on initial load
    this.renderTools();
    this.updateStats();
    this.updateUserProfile(); // Actualizar menú de usuario
  },

  // Load tools from embedded data
  loadTools: function () {
    this.state.tools = toolsData; // From tools-config.js
  },

  // Validate and clean favorites (remove IDs that don't exist in tools)
  validateFavorites: function () {
    const validToolIds = this.state.tools.map((t) => t.id);
    this.state.favorites = this.state.favorites.filter((fav) =>
      validToolIds.includes(fav)
    );
    localStorage.setItem(
      "osintFavorites",
      CryptoUtils.encrypt(this.state.favorites)
    );
  },

  // Setup all event listeners
  setupEventListeners: function () {
    // Search form
    document
      .querySelector(".search-form")
      ?.addEventListener("submit", (e) => this.handleSearch(e));

    // Filter input
    document.getElementById("filter-input")?.addEventListener("input", (e) =>
      this.filterTools(e.target.value)
    );

    // Theme toggle
    document.getElementById("theme-toggle")?.addEventListener("click", () =>
      this.toggleTheme()
    );

    // Language toggle
    document.getElementById("language-toggle")?.addEventListener("click", () =>
      this.toggleLanguage()
    );

    // View tabs
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.switchView(e.target));
    });

    // Setup categories
    this.setupCategories();

    // Setup scroll handlers (back-to-top button and sticky behaviors)
    this.setupScrollHandlers();
  },

  // Setup scroll handlers: show/hide back-to-top button
  setupScrollHandlers: function () {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const onScroll = () => {
      try {
        const y = window.scrollY || window.pageYOffset;
        if (y > 300) {
          btn.classList.add('visible');
        } else {
          btn.classList.remove('visible');
        }
      } catch (e) {
        // ignore
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.scrollToTop();
    });
  },

  // Smooth scroll to top
  scrollToTop: function () {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      // fallback
      window.scrollTo(0, 0);
    }
  },

  // Setup categories dropdown and sidebar
  setupCategories: function () {
    const lang = this.config.currentLanguage;

    // Get unique categories
    const allCategories = [...new Set(this.state.tools.map((t) => t.category))];
    const categories = allCategories.sort();

    // Fill dropdown menu
    const dropdown = document.getElementById("categories-dropdown");
    if (dropdown) {
      let html = `<a class="dropdown-item" onclick="App.filterByCategory(null)">${t("ALL_CATEGORIES", lang)}</a>`;
      categories.forEach((cat) => {
        html += `<a class="dropdown-item" onclick="App.filterByCategory('${cat}')">${t(cat, lang) || cat}</a>`;
      });
      dropdown.innerHTML = html;
    }

    // Fill sidebar categories
    const sidebar = document.getElementById("categories-sidebar");
    if (sidebar) {
      let html = `<a class="category-item active" onclick="App.filterByCategory(null)">${t("ALL", lang)}</a>`;
      categories.forEach((cat) => {
        const count = this.state.tools.filter((t) => t.category === cat).length;
        html += `<a class="category-item" onclick="App.filterByCategory('${cat}')">${t(cat, lang) || cat} <span class="category-count">${count}</span></a>`;
      });
      sidebar.innerHTML = html;
    }
  },

  // Filter tools by category
  filterByCategory: function (category) {
    // Update active state
    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.remove("active");
    });

    if (category === null) {
      document.querySelector(".category-item")?.classList.add("active");
      this.renderTools();
    } else {
      event.target.classList.add("active");
      const filtered = this.state.tools.filter((t) => t.category === category);
      this.renderTools(filtered);
    }
  },

  // Handle search form submission
  handleSearch: function (e) {
    e.preventDefault();
    const query = document.getElementById("search-input")?.value.trim();

    if (!query) {
      this.showError(t("NO_SEARCH_TERM", this.config.currentLanguage));
      return;
    }

    // Store last search query for auto-fill in tools
    this.state.lastSearchQuery = query;

    // Add to history
    this.addToHistory(query);

    // Process search with tools
    this.processSearch(query);

    // Show results view
    this.switchView(document.querySelector('[data-view="results"]'));
  },

  // Process search and generate results
  processSearch: function (query) {
    const resultsContainer = document.getElementById("results-container");

    // Detect query type
    const queryType = this.detectQueryType(query);

    // Get relevant tools
    const relevantTools = this.state.tools.filter((tool) =>
      this.isToolRelevant(tool, queryType)
    );

    // Generate result links
    const detectedTypeLabel = translations[this.config.currentLanguage]?.DETECTED_TYPE || 'Tipo detectado:';
    const queryTypeUpper = queryType.toUpperCase();
    const typeTranslation = translations[this.config.currentLanguage]?.[queryTypeUpper] || queryType;

    let resultsHTML = `
      <div class="row g-3">
        <div class="col-12">
          <div class="alert alert-info py-2 d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="20" height="20" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
              <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
              <path d="M12 9h.01"></path>
              <path d="M11 12h1v4h1"></path>
            </svg>
            <div>
              <strong>${detectedTypeLabel}</strong> <span class="badge bg-primary-lt ms-1">${typeTranslation}</span>
            </div>
          </div>
        </div>
        
        <div class="col-12">
          <div class="card">
            <div class="table-responsive">
              <table class="table table-vcenter">
                <tbody>`;

    relevantTools.forEach((tool) => {
      const url = this.buildToolUrl(tool, query);
      const isFavorite = this.state.favorites.includes(tool.id);
      const description = t('DESC_' + tool.id, this.config.currentLanguage);

      resultsHTML += `
                  <tr title="${description}">
                    <td width="80%">
                      <div class="text-heading font-weight-bold">${tool.name}</div>
                      <div class="text-muted small">${description}</div>
                    </td>
                    <td class="text-end">
                      <div class="d-flex align-items-center justify-content-end gap-2">
                        <a href="${url}" target="_blank" rel="noopener" class="btn-action-pill btn-edit text-decoration-none" style="font-size: 0.8rem; font-weight: 700;">
                          ${t("GO", this.config.currentLanguage)}
                        </a>
                        <button class="btn-action-pill ${isFavorite ? "btn-warning-pill" : "btn-ghost-pill"}" onclick="App.toggleFavorite('${tool.id}')" title="Favorito">
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon ${isFavorite ? "fill-current" : ""}" width="18" height="18" viewBox="0 0 24 24" fill="${isFavorite ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                            <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>`;
    });

    resultsHTML += `
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
    resultsContainer.innerHTML = resultsHTML;
  },

  // Detect query type (IP, domain, hash, email)
  detectQueryType: function (query) {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(query)) return "ip";
    if (/^[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/.test(query))
      return "domain";
    if (/^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/.test(query))
      return "hash";
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(query)) return "email";
    return "general";
  },

  // Check if tool is relevant to query type
  isToolRelevant: function (tool, queryType) {
    const relevantCategories = {
      "ip": ["IP_INFO", "THREAT_INTELLIGENCE", "SEARCH_TOOLS", "DNS_TOOLS"],
      "domain": ["SEARCH_TOOLS", "WEBSITE_SECURITY", "THREAT_INTELLIGENCE", "DNS_TOOLS", "CERTIFICATE_SSL"],
      "hash": ["MALWARE_ANALYSIS", "THREAT_INTELLIGENCE", "HASH_LOOKUP", "MALWARE_FEEDS"],
      "email": ["EMAIL", "PEOPLE_SEARCH"],
      "general": [],
    };

    if (queryType === "general") return true;
    return relevantCategories[queryType]?.includes(tool.category);
  },

  // Build URL for tool with query
  buildToolUrl: function (tool, query) {
    if (tool.template) {
      return tool.template.replace("{{query}}", encodeURIComponent(query));
    }
    return tool.url + encodeURIComponent(query);
  },

  // Open tool with search input (for favorites view)
  openToolSearch: function (toolId) {
    const tool = this.state.tools.find((t) => t.id === toolId);
    if (!tool) return;

    // Store tool ID for later use
    this.pendingToolId = toolId;

    // Check if there's a recent search query
    if (this.state.lastSearchQuery) {
      // Auto-execute with last search query
      this.executeToolSearch(this.state.lastSearchQuery);
      return;
    }

    // Show modal for search term
    const modal = new bootstrap.Modal(document.getElementById("searchModal"));
    modal.show();

    // Focus input field
    setTimeout(() => {
      document.getElementById("searchModalInput").focus();
    }, 100);
  },

  // Execute search from modal
  executeToolSearch: function (autoQuery = null) {
    const query = autoQuery || document.getElementById("searchModalInput").value.trim();

    if (!query) {
      this.showError(t("NO_SEARCH_TERM", this.config.currentLanguage));
      return;
    }

    const toolId = this.pendingToolId;
    const tool = this.state.tools.find((t) => t.id === toolId);
    if (!tool) return;

    const url = this.buildToolUrl(tool, query);
    window.open(url, "_blank");

    // Add to history
    this.addToHistory(query);

    // Clear input and close modal (only if not auto-executed)
    if (!autoQuery) {
      document.getElementById("searchModalInput").value = "";
      bootstrap.Modal.getInstance(document.getElementById("searchModal")).hide();
    }
  },

  // Add search to history
  addToHistory: function (query) {
    const now = new Date().toLocaleString();
    this.state.searchHistory.unshift({ query, date: now });

    // Keep only last 50 searches
    this.state.searchHistory = this.state.searchHistory.slice(0, 50);
    localStorage.setItem(
      "osintHistory",
      CryptoUtils.encrypt(this.state.searchHistory)
    );

    // Update search count
    this.state.searches = (this.state.searches || 0) + 1;
    localStorage.setItem("osintSearches", JSON.stringify(this.state.searches));

    // Actualizar UI de estadísticas
    this.updateStats();
  },

  // Filter tools by name/description
  filterTools: function (query) {
    const filtered = this.state.tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        t('DESC_' + tool.id).toLowerCase().includes(query.toLowerCase())
    );

    this.renderTools(filtered);
  },

  // Render tools grid
  renderTools: function (tools = this.state.tools) {
    const content = document.getElementById("content");
    if (!content) return;

    // Group by category
    const grouped = {};
    tools.forEach((tool) => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push(tool);
    });

    let html = "";
    Object.entries(grouped).forEach(([category, items]) => {
      html += `
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">${t(category)}</h3>
            </div>
            <div class="table-responsive">
              <table class="table table-vcenter">
                <tbody>`;

      items.forEach((tool) => {
        const isFavorite = this.state.favorites.includes(tool.id);
        const description = t('DESC_' + tool.id, this.config.currentLanguage);
        html += `
                  <tr title="${description}">
                    <td width="80%">
                      <div class="text-heading font-weight-bold">${tool.name}</div>
                      <div class="text-muted small">${description}</div>
                    </td>
                    <td class="text-end">
                      <div class="d-flex align-items-center justify-content-end gap-2">
                        <button class="btn-action-pill btn-edit" onclick="App.openToolSearch('${tool.id}')" style="font-size: 0.8rem; font-weight: 700;">
                          ${t("GO", this.config.currentLanguage)}
                        </button>
                        <button class="btn-action-pill ${isFavorite ? "btn-warning-pill" : "btn-ghost-pill"}" onclick="App.toggleFavorite('${tool.id}')" title="Favorito">
                          <svg xmlns="http://www.w3.org/2000/svg" class="icon ${isFavorite ? "fill-current" : ""}" width="18" height="18" viewBox="0 0 24 24" fill="${isFavorite ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                            <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>`;
      });

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    });

    content.innerHTML = html;
  },

  // Toggle favorite
  toggleFavorite: function (toolId) {
    const index = this.state.favorites.indexOf(toolId);
    if (index > -1) {
      this.state.favorites.splice(index, 1);
    } else {
      this.state.favorites.push(toolId);
    }

    // Guardar en localStorage
    localStorage.setItem(
      "osintFavorites",
      CryptoUtils.encrypt(this.state.favorites)
    );

    // Actualizar UI de estadísticas
    this.updateStats();

    // Actualizar el badge con el contador correcto
    const badge = document.getElementById("favorites-count");
    if (badge) {
      badge.textContent = this.state.favorites.length;
    }

    // Re-renderizar tools y favoritos
    this.renderTools();

    // Si la vista de favoritos está activa, actualizar también
    const favView = document.getElementById("favorites-view");
    if (favView && favView.classList.contains("active")) {
      this.renderFavoritesView();
    }

    // Actualizar el panel lateral si está activo
    const panel = document.getElementById("right-panel");
    if (panel && panel.classList.contains("active") && this.state.activeRightPanel === "favorites") {
      this.renderFavoritesPanel();
    }
  },

  // Add to favorites
  addFavorite: function (toolId) {
    if (!this.state.favorites.includes(toolId)) {
      this.state.favorites.push(toolId);
      localStorage.setItem(
        "osintFavorites",
        JSON.stringify(this.state.favorites)
      );
      this.updateStats();
      this.showSuccess(t("SUCCESS", this.config.currentLanguage));

      // Re-renderizar si es necesario
      this.renderTools();

      // Actualizar el panel lateral si está activo
      const panel = document.getElementById("right-panel");
      if (panel && panel.classList.contains("active") && this.state.activeRightPanel === "favorites") {
        this.renderFavoritesPanel();
      }
    }
  },

  // Switch view
  switchView: function (tab) {
    // Remove active from all tabs
    document.querySelectorAll(".tab-btn").forEach((t) => {
      t.classList.remove("active");
    });

    // Hide all views
    document.querySelectorAll(".view-content").forEach((v) => {
      v.classList.remove("active");
    });

    // Add active to clicked tab
    tab.classList.add("active");

    // Show corresponding view
    const viewId = tab.getAttribute("data-view") + "-view";
    const view = document.getElementById(viewId);
    if (view) {
      view.classList.add("active");

      // Load specific view content if needed
      if (viewId === "history-view") {
        this.renderHistory();
      } else if (viewId === "favorites-view") {
        this.renderFavoritesView();
      }
    }
  },

  // Render search history
  renderHistory: function () {
    const container = document.getElementById("history-container");
    if (!container) return;

    if (this.state.searchHistory.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <path d="M12 3c-4.97 0 -9 4.03 -9 9s4.03 9 9 9s9 -4.03 9 -9s-4.03 -9 -9 -9m0 2v6l5.25 3.15"></path>
          </svg>
          <h5>${t("NO_HISTORY", this.config.currentLanguage)}</h5>
          <p class="text-muted">${t("NO_HISTORY_DESC", this.config.currentLanguage)}</p>
        </div>`;
      return;
    }

    let html = '<div class="list-group">';
    this.state.searchHistory.forEach((item, index) => {
      html += `
        <a href="#" class="list-group-item list-group-item-action" onclick="App.repeatSearch('${item.query}'); return false;">
          <div class="text-truncate">
            <strong>${item.query}</strong>
            <span class="text-muted ms-2">${item.date}</span>
          </div>
        </a>`;
    });
    html += "</div>";

    container.innerHTML = html;
  },

  // Render history in right panel
  renderHistoryPanel: function () {
    const container = document.getElementById("panel-list");
    const lang = this.config.currentLanguage;
    if (!container) return;

    if (this.state.searchHistory.length === 0) {
      container.innerHTML =
        `<p class="text-muted">${t("NO_HISTORY_SEARCHES", lang)}</p>`;
      return;
    }

    let html = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <strong>${t("RECENT_SEARCHES", lang)}</strong>
        <button class="btn btn-sm btn-outline-danger" onclick="App.clearHistory()" title="${t("DELETE_HISTORY", lang)}">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none">
            <path d="M4 7l16 0"></path>
            <path d="M10 11l0 6"></path>
            <path d="M14 11l0 6"></path>
            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"></path>
            <path d="M9 7v-1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v1"></path>
          </svg>
          ${t("CLEAN", lang)}
        </button>
      </div>
      <div class="list-group">`;

    this.state.searchHistory.forEach((item, index) => {
      html += `
        <a href="#" class="list-group-item list-group-item-action text-start" onclick="App.repeatSearch('${item.query}'); return false;">
          <div class="text-truncate">
            <strong>${item.query}</strong>
          </div>
          <small class="text-muted">${item.date}</small>
        </a>`;
    });
    html += "</div>";

    container.innerHTML = html;
  },

  // Clear search history
  clearHistory: function () {
    const lang = this.config.currentLanguage;
    Swal.fire({
      title: lang === 'en' ? 'Are you sure?' : '¿Estás seguro?',
      text: t("CONFIRM_DELETE_HISTORY", lang),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t("CLEAN", lang),
      cancelButtonText: t("CANCEL", lang) || 'Cancelar',
      background: 'var(--modal-bg)',
      color: 'var(--text)',
      showClass: {
        popup: 'premium-swal-show'
      },
      hideClass: {
        popup: 'premium-swal-hide'
      },
      customClass: {
        popup: 'premium-swal-popup',
        title: 'premium-swal-title'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.state.searchHistory = [];
        this.state.searches = 0;
        localStorage.setItem("osintHistory", JSON.stringify(this.state.searchHistory));
        localStorage.setItem("osintSearches", JSON.stringify(this.state.searches));
        this.updateStats();
        this.renderHistoryPanel();
        this.renderHistory();

        Swal.fire({
          icon: 'success',
          title: lang === 'en' ? 'History Cleared' : 'Historial Borrado',
          text: t("CLEAN_SUCCESS", lang) || (lang === 'en' ? "History cleared successfully" : "Historial borrado con éxito"),
          confirmButtonText: 'OK',
          background: 'rgba(15, 23, 42, 0.9)',
          color: '#fff',
          showClass: {
            popup: 'premium-swal-show'
          },
          hideClass: {
            popup: 'premium-swal-hide'
          },
          customClass: {
            popup: 'premium-swal-popup',
            title: 'premium-swal-title'
          }
        });
      }
    });
  },

  // Render favorites view with all favorite tools
  renderFavoritesView: function () {
    const container = document.getElementById("favorites-container");
    if (!container) return;

    if (this.state.favorites.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"></path>
          </svg>
          <h5>${t("NO_FAVORITES", this.config.currentLanguage)}</h5>
          <p class="text-muted">${t("NO_FAVORITES_DESC", this.config.currentLanguage)}</p>
        </div>`;
      return;
    }

    // Get favorite tools
    const favoriteTools = this.state.tools.filter((t) =>
      this.state.favorites.includes(t.id)
    );

    // Group by category
    const grouped = {};
    favoriteTools.forEach((tool) => {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push(tool);
    });

    // Render tools by category
    let html = "";
    Object.entries(grouped).forEach(([category, items]) => {
      html += `
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">${t(category)}</h3>
            </div>
            <div class="table-responsive">
              <table class="table table-vcenter">
                <tbody>`;

      items.forEach((tool) => {
        const isFavorite = this.state.favorites.includes(tool.id);
        const description = t('DESC_' + tool.id, this.config.currentLanguage);
        html += `
                  <tr title="${description}">
                    <td width="80%">
                      <div class="text-heading font-weight-bold">${tool.name}</div>
                      <div class="text-muted small">${description}</div>
                    </td>
                    <td class="text-end">
                    <div class="d-flex align-items-center justify-content-end gap-2">
                      <button class="btn-action-pill btn-edit" onclick="App.openToolSearch('${tool.id}')" style="font-size: 0.8rem; font-weight: 700;">
                        ${t("GO", this.config.currentLanguage)}
                      </button>
                      <button class="btn-action-pill ${isFavorite ? "btn-warning-pill" : "btn-ghost-pill"}" onclick="App.toggleFavorite('${tool.id}')" title="Favorito">
                        <svg xmlns="http://www.w3.org/2000/svg" class="icon ${isFavorite ? "fill-current" : ""}" width="18" height="18" viewBox="0 0 24 24" fill="${isFavorite ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                          <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                  </tr>`;
      });

      html += `
                </tbody>
              </table>
            </div>
          </div>
        </div>`;
    });

    container.innerHTML = `<div class="row g-3">${html}</div>`;
  },

  // Repeat a search
  repeatSearch: function (query) {
    document.getElementById("search-input").value = query;
    this.handleSearch(new Event("submit"));
  },

  // Toggle theme
  toggleTheme: function () {
    const currentTheme = document.documentElement.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    this.config.currentTheme = newTheme;
    localStorage.setItem("osintTheme", newTheme);
    this.updateThemeIcons();

    // Update logos
    const footerLogo = document.getElementById('footer-logo');
    if (footerLogo) {
      footerLogo.src = newTheme === 'dark' ? 'logos/Aegisboard-B.png' : 'logos/Aegisboard-N.png';
    }
  },

  // Setup theme on load
  setupTheme: function () {
    document.documentElement.setAttribute("data-bs-theme", this.config.currentTheme);
    this.updateThemeIcons();

    // Initialize logos
    const footerLogo = document.getElementById('footer-logo');
    if (footerLogo) {
      footerLogo.src = this.config.currentTheme === 'dark' ? 'logos/Aegisboard-B.png' : 'logos/Aegisboard-N.png';
    }
  },

  // Update theme icons
  updateThemeIcons: function () {
    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    if (this.config.currentTheme === 'dark') {
      if (moonIcon) moonIcon.style.display = 'none';
      if (sunIcon) sunIcon.style.display = 'block';
    } else {
      if (moonIcon) moonIcon.style.display = 'block';
      if (sunIcon) sunIcon.style.display = 'none';
    }
  },

  // Toggle language
  toggleLanguage: function () {
    this.config.currentLanguage =
      this.config.currentLanguage === "es" ? "en" : "es";

    // The button shows the language that will be switched TO.
    document.getElementById("current-lang").textContent =
      this.config.currentLanguage === "es" ? "EN" : "ES";

    localStorage.setItem("osintLanguage", this.config.currentLanguage);
    this.applyLanguage();
  },

  // Setup language
  setupLanguage: function () {
    // The button shows the language that will be switched TO.
    document.getElementById("current-lang").textContent =
      this.config.currentLanguage === "es" ? "EN" : "ES";
    this.applyLanguage();
  },

  // Apply language
  applyLanguage: function () {
    const lang = this.config.currentLanguage;

    // Update navbar labels
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.innerHTML = t(key, lang);
    });

    // Update placeholders with data-i18n-placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.placeholder = t(key, lang);
    });

    // Update titles with data-i18n-title
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      el.title = t(key, lang);
    });

    // Update placeholders
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.placeholder = t("ENTER_PLACEHOLDER", lang);

    const filterInput = document.getElementById("filter-input");
    if (filterInput) filterInput.placeholder = t("FILTER_PLACEHOLDER", lang);

    const searchModalInput = document.getElementById("searchModalInput");
    if (searchModalInput) searchModalInput.placeholder = t("SEARCH_PLACEHOLDER", lang);

    const favSearchInput = document.getElementById("favorite-search-input");
    if (favSearchInput) favSearchInput.placeholder = t("FAVORITE_PLACEHOLDER", lang);

    // Update modal titles and buttons
    const searchModalTitle = document.querySelector("#searchModal .modal-title");
    if (searchModalTitle) searchModalTitle.textContent = t("ENTER_SEARCH_TERM", lang);

    // Update all buttons with data-i18n
    document.querySelectorAll("button[data-i18n]").forEach((btn) => {
      const key = btn.getAttribute("data-i18n");
      btn.textContent = t(key, lang);
    });

    // Update footer
    const footerInfo = document.getElementById("footer-info");
    if (footerInfo) footerInfo.innerHTML = t("PRIVACY_NOTICE", lang);

    // Re-render current views
    this.renderTools();
    this.renderFavoritesView();
    this.renderHistory();
    this.setupCategories();

    // Update right panel title if open
    const panel = document.getElementById("right-panel");
    if (panel && panel.classList.contains("active")) {
      const title = document.getElementById("panel-title");
      if (title) {
        const key = this.state.activeRightPanel === "favorites" ? "FAVORITES" : "HISTORY";
        title.textContent = t(key, lang);
      }
      // Refresh panel content
      if (this.state.activeRightPanel === "favorites") {
        this.renderFavoritesPanel();
      } else {
        this.renderHistoryPanel();
      }
    }

    // Update sidebar header
    const sidebarHeader = document.querySelector(".sidebar-header h5");
    if (sidebarHeader) sidebarHeader.textContent = t("TOOLS", lang);

    // Update stats labels
    const statsLabels = document.querySelectorAll(".sidebar-footer small");
    if (statsLabels.length >= 2) {
      statsLabels[0].textContent = t("STATISTICS", lang);
    }

    const statsSmall = document.querySelectorAll(".stats-mini small");
    if (statsSmall.length >= 2) {
      statsSmall[0].textContent = t("TOOLS_COUNT", lang);
      statsSmall[1].textContent = t("SEARCHES_COUNT", lang);
    }

    // Update Downdetector button tooltip
    const downdetectorBtn = document.getElementById("downdetector-btn");
    if (downdetectorBtn) downdetectorBtn.title = t("DOWNDETECTOR_TOOLTIP", lang);

    // Update tab buttons
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabLabels = ["TOOLS", "FAVORITES", "RESULTS", "HISTORY"];
    tabButtons.forEach((btn, index) => {
      const label = btn.querySelector("svg + *") || btn;
      if (label && index < tabLabels.length) {
        const text = label.textContent.split(/\n|\s{2,}/)[0]; // Get first text node
        label.textContent = t(tabLabels[index], lang);
      }
    });

    // Update main content headers for empty states
    this.updateEmptyStatesLanguage(lang);
  },

  // Update empty state messages language
  updateEmptyStatesLanguage: function (lang) {
    document.querySelectorAll(".empty-state").forEach((state) => {
      const h5 = state.querySelector("h5");
      const p = state.querySelector("p");
      if (!h5 || !p) return;

      const viewId = state.closest(".view-content")?.id;
      if (viewId === "favorites-view") {
        h5.textContent = t("NO_FAVORITES", lang);
        p.textContent = t("NO_FAVORITES_DESC", lang);
      } else if (viewId === "results-view") {
        h5.textContent = t("NO_RESULTS", lang);
        p.textContent = t("NO_RESULTS_DESC", lang);
      } else if (viewId === "history-view") {
        h5.textContent = t("NO_HISTORY", lang);
        p.textContent = t("NO_HISTORY_DESC", lang);
      }
    });
  },

  // Update user profile UI
  updateUserProfile: function () {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const displayName = document.getElementById("user-display-name");
    const userEmail = document.getElementById("user-email");
    const adminLink = document.getElementById("admin-link");
    const incidentsLink = document.getElementById("incidents-link");
    const adminDivider = document.getElementById("admin-divider");
    const lang = this.config.currentLanguage;

    if (displayName) {
      if (user.name) {
        displayName.textContent = user.name;
        displayName.removeAttribute("data-i18n");
      } else {
        displayName.setAttribute("data-i18n", "USER_DEFAULT_NAME");
        displayName.textContent = t("USER_DEFAULT_NAME", lang);
      }
    }

    if (userEmail) userEmail.textContent = user.email;

    // Show admin elements if applicable
    if (user.role === 'admin') {
      if (adminLink) {
        adminLink.style.display = 'flex';
        const label = adminLink.querySelector("span");
        if (label) label.textContent = t("ADMIN_PANEL", lang);
      }
      if (incidentsLink) {
        incidentsLink.style.display = 'flex';
        const label = incidentsLink.querySelector("span");
        if (label) label.textContent = t("INCIDENT_MANAGEMENT", lang);
      }
      if (adminDivider) adminDivider.style.display = 'block';
    }
  },

  // Update statistics
  updateStats: function () {
    const totalToolsEl = document.getElementById("total-tools");
    const totalSearchesEl = document.getElementById("total-searches");
    const favCountEl = document.getElementById("favorites-count");

    if (totalToolsEl) totalToolsEl.textContent = this.state.tools.length;
    if (totalSearchesEl) totalSearchesEl.textContent = this.state.searches || 0;
    if (favCountEl) favCountEl.textContent = this.state.favorites.length;
  },

  // Show success modal
  showSuccess: function (message) {
    const lang = this.config.currentLanguage;
    Swal.fire({
      icon: 'success',
      title: message,
      confirmButtonText: t("OK", lang) || 'Entendido',
      background: 'var(--modal-bg)',
      color: 'var(--text)',
      showClass: {
        popup: 'premium-swal-show'
      },
      hideClass: {
        popup: 'premium-swal-hide'
      },
      customClass: {
        popup: 'premium-swal-popup',
        title: 'premium-swal-title'
      }
    });
  },

  // Show error modal
  showError: function (message) {
    const lang = this.config.currentLanguage;
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      confirmButtonText: t("OK", lang) || 'Entendido',
      background: 'var(--modal-bg)',
      color: 'var(--text)',
      showClass: {
        popup: 'premium-swal-show'
      },
      hideClass: {
        popup: 'premium-swal-hide'
      },
      customClass: {
        popup: 'premium-swal-popup',
        title: 'premium-swal-title'
      }
    });
  },

  // CUSTOM TOOLS LOGIC

  // Load custom tools from localStorage
  loadCustomTools: function () {
    const customTools = JSON.parse(localStorage.getItem("osintCustomTools")) || [];
    this.state.tools = [...this.state.tools, ...customTools];
  },

  // Open add tool modal
  openAddToolModal: function () {
    document.getElementById("addToolForm").reset();
    document.getElementById("templateField").style.display = "none";
    new bootstrap.Modal(document.getElementById("addToolModal")).show();
  },

  // Toggle template field based on checkbox
  toggleTemplateField: function () {
    const useTemplate = document.getElementById("toolUsesTemplate").checked;
    document.getElementById("templateField").style.display = useTemplate ? "block" : "none";
  },

  // Save custom tool
  saveCustomTool: function () {
    const name = document.getElementById("toolName").value.trim();
    const id = document.getElementById("toolId").value.trim();
    const url = document.getElementById("toolUrl").value.trim();
    const description = document.getElementById("toolDescription").value.trim();
    const category = document.getElementById("toolCategory").value;
    const useTemplate = document.getElementById("toolUsesTemplate").checked;
    const template = document.getElementById("toolTemplate").value.trim();

    if (!name || !id || !url || !category) {
      this.showError("Por favor completa todos los campos requeridos");
      return;
    }

    if (useTemplate && !template.includes("{{query}}")) {
      this.showError("El template debe incluir {{query}}");
      return;
    }

    const newTool = {
      id,
      name,
      url,
      template: useTemplate ? template : null,
      category,
      description,
      isCustom: true
    };

    // Save to state
    this.state.tools.push(newTool);

    // Save to localStorage
    const customTools = JSON.parse(localStorage.getItem("osintCustomTools")) || [];
    customTools.push(newTool);
    localStorage.setItem("osintCustomTools", JSON.stringify(customTools));

    // UI Feedback
    bootstrap.Modal.getInstance(document.getElementById("addToolModal")).hide();
    this.showSuccess("Herramienta agregada correctamente");

    // Re-render
    this.renderTools();
    this.updateStats();
    this.setupCategories();
  }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Export for modular and global use
export default App;
window.App = App;

// Expose functions for HTML event handlers
window.handleLogout = (e) => {
  e.preventDefault();
  const lang = App.config.currentLanguage;
  const theme = App.config.currentTheme;

  Swal.fire({
    title: lang === 'en' ? 'Are you sure?' : '¿Estás seguro?',
    text: lang === 'en' ? 'Do you want to logout?' : '¿Deseas cerrar sesión?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: lang === 'en' ? 'Yes, logout' : 'Sí, cerrar sesión',
    cancelButtonText: lang === 'en' ? 'Cancel' : 'Cancelar',
    background: 'var(--modal-bg)',
    color: 'var(--text)',
    customClass: {
      popup: 'premium-swal-popup',
      title: 'premium-swal-title'
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Auth.logout();
    }
  });
};

window.toggleSidebar = () => {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.querySelector(".main-content");
  if (sidebar && mainContent) {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");

    // Update tooltip dynamically
    const btn = document.getElementById("toggle-sidebar-btn");
    if (btn) {
      const isCollapsed = sidebar.classList.contains("collapsed");
      const key = isCollapsed ? "EXPAND_SIDEBAR" : "CLOSE_SIDEBAR";
      btn.setAttribute("data-i18n-title", key);
      btn.title = t(key, App.config.currentLanguage);
    }
  }
};

window.toggleHistoryPanel = () => {
  const panel = document.getElementById("right-panel");
  const title = document.getElementById("panel-title");
  if (panel && title) {
    const isOpening = !panel.classList.contains("active");
    App.state.activeRightPanel = "history";
    title.textContent = t("HISTORY", App.config.currentLanguage);
    App.renderHistoryPanel();
    panel.classList.toggle("active");

    // Sincronizar clase de layout
    if (isOpening) {
      document.body.classList.add("panel-open");
    } else {
      document.body.classList.remove("panel-open");
    }
  }
};

window.toggleFavoritesPanel = () => {
  const panel = document.getElementById("right-panel");
  const title = document.getElementById("panel-title");
  if (panel && title) {
    const isOpening = !panel.classList.contains("active");
    App.state.activeRightPanel = "favorites";
    title.textContent = t("FAVORITES", App.config.currentLanguage);
    App.renderFavoritesPanel();
    panel.classList.toggle("active");

    // Sincronizar clase de layout
    if (isOpening) {
      document.body.classList.add("panel-open");
    } else {
      document.body.classList.remove("panel-open");
    }
  }
};

window.closeRightPanel = () => {
  document.getElementById("right-panel")?.classList.remove("active");
  document.body.classList.remove("panel-open");
};

// Implement renderFavoritesPanel
App.renderFavoritesPanel = function () {
  const container = document.getElementById("panel-list");
  if (!container) return;

  if (this.state.favorites.length === 0) {
    container.innerHTML = `<p class="text-muted">${t("NO_FAVORITES_YET", this.config.currentLanguage) || "No tienes favoritos aún"}</p>`;
    return;
  }

  const favTools = this.state.tools.filter(t => this.state.favorites.includes(t.id));
  let html = '<div class="list-group">';
  favTools.forEach(tool => {
    html += `
            <a href="#" class="list-group-item list-group-item-action text-start" onclick="App.openToolSearch('${tool.id}'); return false;">
                <strong>${tool.name}</strong>
            </a>`;
  });
  html += '</div>';
  container.innerHTML = html;
};
