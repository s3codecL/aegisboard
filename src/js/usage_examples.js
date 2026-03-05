// =============================================
// EJEMPLOS DE USO - Aegis Board
// =============================================

/* 
  Este archivo contiene ejemplos prácticos de cómo usar
  el Aegis Board y cómo extenderlo.
*/

// =============================================
// 1. EJEMPLOS BÁSICOS DE BÚSQUEDA
// =============================================

// Ejemplo 1: Buscar una dirección IP
// Input: "8.8.8.8"
// Resultado: Se abrirán herramientas de IP info como:
// - Shodan
// - IPInfo
// - Abuse IPDB
// - Etc.

// Ejemplo 2: Buscar un dominio
// Input: "google.com"
// Resultado: Se abrirán herramientas de búsqueda como:
// - Security Trails
// - crt.sh
// - DNS Dumpster
// - URLScan
// - Etc.

// Ejemplo 3: Buscar un hash
// Input: "5d41402abc4b2a76b9719d911017c592"
// Resultado: Se abrirán herramientas de hash lookup:
// - VirusTotal
// - Hybrid Analysis
// - ANY.RUN
// - Etc.

// Ejemplo 4: Buscar un email
// Input: "user@example.com"
// Resultado: Se abrirán herramientas de email OSINT:
// - Have I Been Pwned
// - EmailRep
// - Etc.

// =============================================
// 2. ACCESO A DATOS DESDE LA CONSOLA
// =============================================

// Ver estado actual de la aplicación
console.log(App.state);

// Ver herramientas cargadas
console.log(App.state.tools);

// Ver favoritos guardados
console.log(App.state.favorites);

// Ver historial de búsquedas
console.log(App.state.searchHistory);

// Ver idioma actual
console.log(App.config.currentLanguage);

// Ver tema actual
console.log(App.config.currentTheme);

// =============================================
// 3. OPERACIONES PROGRAMÁTICAS
// =============================================

// Realizar una búsqueda programáticamente
const search = async (query) => {
  document.getElementById("search-input").value = query;
  const form = document.querySelector(".search-form");
  const event = new Event("submit");
  form.dispatchEvent(event);
};

// Uso:
// search("8.8.8.8");

// Agregar a favoritos programáticamente
const addToFav = (toolId) => {
  App.addFavorite(toolId);
};

// Uso:
// addToFav("vt"); // VirusTotal

// Cambiar tema programáticamente
const switchTheme = (theme) => {
  if (theme === "light" || theme === "dark") {
    document.body.setAttribute("data-bs-theme", theme);
    App.config.currentTheme = theme;
    localStorage.setItem("aegisTheme", theme);
  }
};

// Uso:
// switchTheme("light");

// Cambiar idioma programáticamente
App.config.currentLanguage = "en";
localStorage.setItem("aegisLanguage", "en");
App.applyLanguage();

// =============================================
// 4. EXTENSIÓN: AGREGAR NUEVAS HERRAMIENTAS
// =============================================

// Agregar una nueva herramienta dinámicamente
const addNewTool = (tool) => {
  App.state.tools.push(tool);
  App.renderTools();
};

// Uso:
/*
addNewTool({
  id: "custom-tool",
  name: "Mi Herramienta Personalizada",
  url: "https://example.com/search?q=",
  category: "SEARCH_TOOLS",
  description: "Una herramienta personalizada"
});
*/

// =============================================
// 5. EXTENSIÓN: CREAR CATEGORÍA PERSONALIZADA
// =============================================

// Crear herramientas con categoría personalizada
const createCustomCategory = (toolsArray) => {
  App.state.tools.push(...toolsArray);
  App.renderTools();
};

// Uso:
/*
const customTools = [
  {
    id: "my-tool-1",
    name: "Herramienta 1",
    url: "https://...",
    category: "MI_CATEGORÍA_CUSTOM",
    description: "Descripción"
  },
  {
    id: "my-tool-2",
    name: "Herramienta 2",
    url: "https://...",
    category: "MI_CATEGORÍA_CUSTOM",
    description: "Descripción"
  }
];

createCustomCategory(customTools);
*/

// =============================================
// 6. MONITOREO Y ANALYTICS
// =============================================

// Función para rastrear búsquedas más frecuentes
const getTopSearches = () => {
  const searches = App.state.searchHistory;
  const frequency = {};

  searches.forEach((item) => {
    frequency[item.query] = (frequency[item.query] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
};

// Uso:
// console.table(getTopSearches());

// Función para generar reporte de uso
const generateUsageReport = () => {
  const report = {
    totalSearches: App.state.searches,
    totalFavorites: App.state.favorites.length,
    totalHistory: App.state.searchHistory.length,
    topSearches: getTopSearches(),
    averageSearchesPerDay: (
      App.state.searches /
      (Date.now() - localStorage.getTime) / (1000 * 60 * 60 * 24)
    ).toFixed(2),
  };

  return report;
};

// Uso:
// console.table(generateUsageReport());

// =============================================
// 7. EXPORTAR DATOS
// =============================================

// Exportar favoritos como JSON
const exportFavorites = () => {
  const data = {
    favorites: App.state.favorites,
    tools: App.state.tools.filter((t) =>
      App.state.favorites.includes(t.id)
    ),
    exportDate: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aegis-favorites-${Date.now()}.json`;
  a.click();
};

// Uso:
// exportFavorites();

// Exportar historial como CSV
const exportHistoryAsCSV = () => {
  let csv = "Query,Date\n";

  App.state.searchHistory.forEach((item) => {
    csv += `"${item.query}","${item.date}"\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aegis-history-${Date.now()}.csv`;
  a.click();
};

// Uso:
// exportHistoryAsCSV();

// =============================================
// 8. IMPORTAR DATOS
// =============================================

// Importar favoritos desde JSON
const importFavorites = (jsonFile) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      App.state.favorites = data.favorites;
      localStorage.setItem(
        "aegisFavorites",
        JSON.stringify(App.state.favorites)
      );
      App.renderTools();
      alert("Favoritos importados exitosamente");
    } catch (error) {
      alert("Error al importar: " + error.message);
    }
  };

  reader.readAsText(jsonFile);
};

// Uso:
// HTML: <input type="file" id="import-file" onchange="importFavorites(this.files[0])" />

// =============================================
// 9. BÚSQUEDAS AVANZADAS
// =============================================

// Función para búsqueda múltiple
const multiSearch = (queries) => {
  queries.forEach((query) => {
    setTimeout(() => {
      search(query);
    }, 1000); // 1 segundo de espera entre búsquedas
  });
};

// Uso:
// multiSearch(["8.8.8.8", "google.com", "github.com"]);

// Función para buscar en categoría específica
const searchInCategory = (query, category) => {
  const relevantTools = App.state.tools.filter(
    (t) => t.category === category
  );

  const results = relevantTools.map((tool) => ({
    name: tool.name,
    url: App.buildToolUrl(tool, query),
  }));

  return results;
};

// Uso:
// console.table(searchInCategory("8.8.8.8", "SEARCH_TOOLS"));

// =============================================
// 10. PERSONALIZACIÓN AVANZADA
// =============================================

// Cambiar colores de tema
const customizeTheme = (colors) => {
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  });
};

// Uso:
/*
customizeTheme({
  primary: "#ff0000",
  success: "#00ff00",
  warning: "#ffff00",
  danger: "#0000ff"
});
*/

// =============================================
// 11. LIMPIAR DATOS
// =============================================

// Limpiar historial antiguo (más de X días)
const cleanOldHistory = (daysOld) => {
  const now = Date.now();
  const maxAge = daysOld * 24 * 60 * 60 * 1000;

  App.state.searchHistory = App.state.searchHistory.filter((item) => {
    const itemDate = new Date(item.date).getTime();
    return now - itemDate < maxAge;
  });

  localStorage.setItem(
    "aegisHistory",
    JSON.stringify(App.state.searchHistory)
  );
};

// Uso:
// cleanOldHistory(30); // Limpiar búsquedas más antiguas de 30 días

// Limpiar todos los datos
const clearAllData = () => {
  if (
    confirm(
      "¿Estás seguro? Esto eliminará todos tus datos guardados."
    )
  ) {
    localStorage.removeItem("aegisFavorites");
    localStorage.removeItem("aegisHistory");
    localStorage.removeItem("aegisSearches");
    localStorage.removeItem("aegisLanguage");
    localStorage.removeItem("aegisTheme");
    localStorage.removeItem("toolConfigVersion");

    App.state = {
      tools: [],
      favorites: [],
      searchHistory: [],
      searches: 0,
    };

    App.renderTools();
    alert("Todos los datos han sido eliminados");
  }
};

// Uso:
// clearAllData();

// =============================================
// 12. CASOS DE USO PRÁCTICOS
// =============================================

// Caso 1: Investigación de IP sospechosa
const investigateIP = async (ip) => {
  console.log(`Investigando IP: ${ip}`);
  const tools = App.state.tools.filter((t) =>
    ["IP_INFO", "THREAT_INTELLIGENCE", "SEARCH_TOOLS"].includes(t.category)
  );

  const results = tools.map((tool) => ({
    tool: tool.name,
    url: App.buildToolUrl(tool, ip),
    category: tool.category,
  }));

  console.table(results);
  return results;
};

// Caso 2: Verificar si email fue comprometido
const checkEmailBreach = async (email) => {
  console.log(`Verificando email: ${email}`);
  const tools = App.state.tools.filter((t) =>
    ["EMAIL", "EMAIL_HEADER_ANALYSIS"].includes(t.category)
  );

  const results = tools.map((tool) => ({
    tool: tool.name,
    url: App.buildToolUrl(tool, email),
  }));

  console.table(results);
  return results;
};

// Caso 3: Análisis de malware rápido
const quickMalwareAnalysis = async (hash) => {
  console.log(`Analizando hash: ${hash}`);
  const tools = App.state.tools.filter((t) =>
    ["FILE_MALWARE_ANALYSIS", "HASH_LOOKUP"].includes(t.category)
  );

  const results = tools.map((tool) => ({
    tool: tool.name,
    url: App.buildToolUrl(tool, hash),
  }));

  console.table(results);
  return results;
};

// Caso 4: Reconocimiento de dominio
const reconDomain = async (domain) => {
  console.log(`Reconocimiento: ${domain}`);
  const tools = App.state.tools.filter((t) =>
    [
      "SEARCH_TOOLS",
      "WEBSITE_Aegis_TOOLS",
      "THREAT_INTELLIGENCE",
    ].includes(t.category)
  );

  const results = tools.map((tool) => ({
    tool: tool.name,
    url: App.buildToolUrl(tool, domain),
    category: tool.category,
  }));

  console.table(results);
  return results;
};

// =============================================
// NOTAS IMPORTANTES
// =============================================

/*
  1. Estos ejemplos son para uso en la consola del navegador
  2. Algunos requieren que el Aegis Board esté completamente cargado
  3. Para seguridad, algunos datos se guardan localmente
  4. Los URLs externos se abren en ventanas nuevas
  5. Considera las limitaciones de CORS cuando uses APIs
  6. Siempre revisa los términos de servicio de las herramientas
  7. Usa responsablemente estas herramientas de OSINT
*/

// =============================================
// COMANDO RÁPIDO DE PRUEBA
// =============================================

/*
  Copia y pega esto en la consola para hacer una prueba rápida:

  console.log("=== Aegis Board Información ===");
  console.log("Herramientas cargadas:", App.state.tools.length);
  console.log("Favoritos:", App.state.favorites.length);
  console.log("Búsquedas realizadas:", App.state.searches);
  console.log("Idioma:", App.config.currentLanguage);
  console.log("Tema:", App.config.currentTheme);
  console.table(App.state.tools.slice(0, 5));
*/
