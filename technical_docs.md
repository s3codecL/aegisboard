# 📚 Documentación Técnica - Aegis Dashboard

> ⚠️ **Importante:** No publiques ni compartas claves privadas, tokens o secretos (como los de Google reCAPTCHA) en la documentación, ejemplos, capturas ni foros públicos. Usa variables de entorno o archivos ignorados por git.

## Estructura de Carpetas

```
aegisboard/
├── index.html                 # Página principal (Dashboard)
├── login.html                 # Página de autenticación
├── admin.html                 # Panel de administración
├── incidents.html             # Gestión de incidencias (v2.0.0)
├── quickstart.html            # Guía rápida
├── style.css                  # Estilos legado (reemplazado por src/css)
├── README.md                  # Documentación principal
├── changelog.md               # Registro de cambios
├── technical_docs.md          # Este archivo
├── src/                       # 📁 Source code principal
│   ├── css/                  # Estilos CSS modulares
│   └── js/                   # Módulos JavaScript (ES6)
│       ├── app.js            # Punto de entrada y lógica principal
│       ├── auth.js           # Sistema de autenticación
│       ├── taxonomy-cs.js    # Taxonomía de incidencias
│       ├── incidents.js      # Lógica de incidencias
│       ├── tools-config.js   # Configuración de herramientas
│       ├── translations.js   # Diccionarios de traducción
│       └── usage_examples.js # Ejemplos de uso
├── plugins/                  # Extensiones para navegadores
│   └── favorites - Chrome/
│       ├── background.js
│       ├── content.js
│       └── manifest.json
```

---

## 🏛️ Arquitectura Modular (v2.0.0)

A partir de la versión 2.0.0, el proyecto ha migrado a una estructura altamente modular para separar responsabilidades y facilitar el crecimiento del sistema:

- **Lógica Central (`src/js/`)**: Contiene todos los módulos ES6 que gestionan la autenticación, gestión de incidentes y lógica de la aplicación.
- **Estilos Sistematizados (`src/css/`)**: Los estilos se han dividido en archivos específicos (main, themes, layout, forms) para evitar colisiones y facilitar la personalización de temas.
- **Activos Estáticos (`public/`)**: Organización clara de iconos y recursos compartidos.

---

## Arquitectura de la Aplicación

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────┐
│         Aegis Dashboard - Arquitectura          │
└─────────────────────────────────────────────────┘

    HTML (index.html)
         ↓
    ┌────────────────────────────┐
    │   CSS (src/css/main.css)   │
    │  - Variables CSS           │
    │  - Estilos Modulares       │
    │  - Temas (Light/Dark)      │
    └────────────────────────────┘
         ↓
    ┌──────────────────────────────────────────────────┐
    │   Carpeta src/js/ - Módulos ES6                  │
    │  ┌────────────────────────────────────────────┐  │
    │  │  app.js (Type: module)                     │  │
    │  │  - Punto de entrada principal               │  │
    │  │  - Manejo de Eventos y DOM                 │  │
    │  │  - Integración de Módulos                  │  │
    │  └────────────────────────────────────────────┘  │
    │  ┌────────────────────────────────────────────┐  │
    │  │  auth.js / translations.js / tools-config.js│  │
    │  │  - Servicios y Configuración               │  │
    │  │  - Exportaciones ES6                       │  │
    │  └────────────────────────────────────────────┘  │
    │  ┌────────────────────────────────────────────┐  │
    │  │  incidents.js / taxonomy-cs.js             │  │
    │  │  - Módulos de gestión de incidentes        │  │
    │  └────────────────────────────────────────────┘  │
    └──────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. **App Object** (js/app.js)

El objeto principal que gestiona toda la lógica de la aplicación.

#### Propiedades:
```javascript
App.config = {
  storageVersion: "v1",
  currentLanguage: "es|en",
  currentTheme: "dark|light"
}

App.state = {
  tools: [],           // Array de 78 herramientas
  favorites: [],       // IDs de favoritos
  searchHistory: [],   // Historial de búsquedas
  searches: 0,         // Contador de búsquedas
  lastSearchQuery: "" // Último término de búsqueda (v1.4.0)
}
```

#### Categorías de Herramientas (v1.6.0):
```javascript
// 13 Categorías organizadas temáticamente
Categorías = {
  WEBSITE_SECURITY: 15,      // Seguridad Web
  SEARCH_TOOLS: 12,          // Herramientas de Búsqueda
  IP_INFO: 9,                // Información de IP
  MALWARE_ANALYSIS: 8,       // Análisis de Malware
  THREAT_INTELLIGENCE: 8,    // Inteligencia de Amenazas
  DNS_TOOLS: 7,              // Herramientas DNS
  CERTIFICATE_SSL: 3,        // Certificados SSL (Nueva v1.6.0)
  CODE_SEARCH: 3,            // Búsqueda de Código
  EMAIL: 3,                  // Correo Electrónico
  HASH_LOOKUP: 3,            // Búsqueda de Hash
  PEOPLE_SEARCH: 3,          // Búsqueda de Personas
  MALWARE_FEEDS: 2,          // Fuentes de Malware
  REAL_TIME_THREAT_MAPS: 2   // Mapas de Amenazas
}
```

#### Categorías Renombradas (v1.6.0):
- `FILE_MALWARE_ANALYSIS` → `MALWARE_ANALYSIS`
- `USERNAME_PEOPLE_OSINT` → `PEOPLE_SEARCH`
- `WEBSITE_OSINT_TOOLS` → `WEBSITE_SECURITY
```

#### Métodos Principales:
- `init()` - Inicializa la aplicación
- `loadTools()` - Carga herramientas desde config
- `handleSearch(e)` - Procesa búsquedas y guarda en `lastSearchQuery` (v1.4.0)
- `openToolSearch(toolId)` - Abre herramienta, auto-ejecuta con última búsqueda si existe (v1.4.0)
- `executeToolSearch(autoQuery)` - Ejecuta búsqueda desde modal o automáticamente (v1.4.0)
- `detectQueryType(query)` - Detecta tipo de búsqueda (IP, domain, hash, email)
- `filterTools(query)` - Filtra herramientas por nombre/descripción
- `renderTools()` - Renderiza la cuadrícula de herramientas con botones (v1.4.0)
- `toggleFavorite()` - Alterna estado de favorito
- `toggleTheme()` - Cambia tema oscuro/claro
- `toggleLanguage()` - Cambia idioma
- `switchView()` - Cambia entre vistas (Tools, Results, History)

### 2. **Detección de Tipos de Búsqueda**

```javascript
detectQueryType(query) {
  // Regex para detección:
  // IP: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/
  // Domain: /^[a-zA-Z0-9-]{1,63}(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/
  // Hash: /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/
  // Email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
}
```

### 3. **Datos Persistentes (LocalStorage)**

La aplicación usa localStorage para guardar:

```javascript
// Formato de almacenamiento:
{
  "aegisFavorites": "[\"vt\", \"shodan\"]",
  "aegisHistory": "[{query: \"8.8.8.8\", date: \"2024-01-01\"}]",
  "aegisSearches": "42",
  "osintLanguage": "es",
  "osintTheme": "dark",
  "aegisIncidents": "[{...}] // v2.0.0",
  "toolConfigVersion": "v1"
}
```

### 4. **Persistencia de Búsqueda (v1.4.0)**

#### Flujo de Trabajo:

```
1. Usuario realiza búsqueda
   ↓
2. handleSearch() guarda query en state.lastSearchQuery
   ↓
3. Usuario cambia a otra pestaña (Herramientas/Favoritos)
   ↓
4. Usuario hace clic en una herramienta
   ↓
5. openToolSearch() detecta lastSearchQuery existe
   ↓
6. Auto-ejecuta executeToolSearch(lastSearchQuery)
   ↓
7. Herramienta se abre con término de búsqueda anterior
```

#### Implementación:

```javascript
// Guardar búsqueda
handleSearch: function(e) {
  const query = document.getElementById("search-input").value.trim();
  this.state.lastSearchQuery = query; // Persistir
  // ... resto del código
}

// Auto-usar búsqueda guardada
openToolSearch: function(toolId) {
  this.pendingToolId = toolId;
  
  if (this.state.lastSearchQuery) {
    // Auto-ejecutar sin mostrar modal
    this.executeToolSearch(this.state.lastSearchQuery);
    return;
  }
  
  // Mostrar modal solo si no hay búsqueda previa
  // ...
}

// Ejecutar con query automática o manual
executeToolSearch: function(autoQuery = null) {
  const query = autoQuery || document.getElementById("searchModalInput").value.trim();
  // ... ejecutar búsqueda
}
```

#### Beneficios:
- Reduce clics repetitivos
- Workflow optimizado para investigaciones multi-herramienta
- Experiencia fluida entre pestañas
- No interrumpe el flujo de trabajo del investigador

## Estructura HTML

### Componentes Principales:

1. **Navbar**
   - Logo y branding
   - Barra de búsqueda
   - Filtro de herramientas
   - Dropdown de categorías
   - Controles (tema, idioma, historial, favoritos)

2. **Main Container**
   - Sidebar izquierdo (categorías y estadísticas)
   - Contenido principal (vistas)
   - Panel lateral derecho (historial/favoritos)

3. **Vistas**
   - Tools View: Cuadrícula de herramientas
   - Results View: Resultados de búsqueda
   - History View: Historial de búsquedas

4. **Modales**
   - Error Modal
   - Success Modal

## Estilos CSS

### Variables CSS Principales:

```css
:root {
  --color-primary: #3b82f6;      /* Azul */
  --color-success: #10b981;       /* Verde */
  --color-warning: #f59e0b;       /* Ámbar */
  --color-danger: #ef4444;        /* Rojo */
  
  --spacing-md: 1rem;
  --radius-lg: 0.75rem;
  --transition: all 0.3s cubic-bezier(...);
  --shadow-md: 0 4px 6px -1px rgba(...);
}
```

### Temas:

**Dark Theme (por defecto):**
```css
[data-bs-theme="dark"] {
  --bg-primary: #0f172a;          /* Fondo oscuro */
  --bg-secondary: #1e293b;        /* Fondo secundario */
  --text: #f1f5f9;                /* Texto claro */
  --text-muted: #cbd5e1;          /* Texto tenue */
  --border: #334155;              /* Bordes */
}
```

**Light Theme:**
```css
[data-bs-theme="light"] {
  --bg-primary: #f8fafc;          /* Fondo claro */
  --bg-secondary: #f1f5f9;        /* Fondo secundario */
  --text: #1e293b;                /* Texto oscuro */
  --text-muted: #64748b;          /* Texto tenue */
  --border: #e2e8f0;              /* Bordes */
}
```

### Sistema de Temas v1.7.1

#### Aplicación de Tema
El tema debe aplicarse tanto a `document.documentElement` como a `document.body`:

```javascript
// CORRECTO - Aplicar únicamente a document.documentElement para coherencia CSS
document.documentElement.setAttribute('data-bs-theme', theme);

// El uso de document.body.setAttribute está depreciado para evitar conflictos de contraste.
```

#### Selectores CSS
Usar selectores sin prefijo `body` para mayor compatibilidad:

```css
/* ✅ Correcto */
[data-bs-theme="light"] .card { ... }
[data-bs-theme="dark"] .navbar { ... }

/* ❌ Incorrecto - puede no funcionar */
body[data-bs-theme="light"] .card { ... }
```

#### Estilos de Tarjetas con Hover
```css
/* Light mode */
[data-bs-theme="light"] .card {
    background: #ffffff;
    border: 1px solid rgba(59, 130, 246, 0.2);
    transition: all 0.3s ease;
}

[data-bs-theme="light"] .card:hover {
    box-shadow: 0 20px 40px rgba(59, 130, 246, 0.25), 
                0 10px 20px rgba(59, 130, 246, 0.15),
                0 0 0 1px rgba(59, 130, 246, 0.4);
    transform: translateY(-8px) scale(1.01);
}

/* Dark mode */
[data-bs-theme="dark"] .card {
    background: rgba(15, 20, 51, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.2);
}
```

#### LocalStorage Keys
- `osintTheme`: "dark" | "light"
- `osintLanguage`: "es" | "en"

### Responsive Breakpoints:

- **Mobile**: < 480px
- **Tablet**: 480px - 768px
- **Laptop**: 768px - 1024px
- **Desktop**: > 1024px

## Flujo de Búsqueda

```
Usuario ingresa búsqueda
    ↓
handleSearch() valida entrada
    ↓
addToHistory() guarda en historial
    ↓
detectQueryType() identifica tipo
    ↓
filterRelevantTools() obtiene herramientas
    ↓
buildToolUrl() construye URLs con query
    ↓
renderResults() muestra resultados
    ↓
Usuario hace clic en herramienta
    ↓
Abre URL en nueva ventana
```

## LocalStorage API

### Funciones de Almacenamiento:

```javascript
// Guardar favoritos
localStorage.setItem(
  "aegisFavorites",
  JSON.stringify(App.state.favorites)
);

// Cargar favoritos
App.state.favorites = JSON.parse(
  localStorage.getItem("aegisFavorites")
) || [];

// Similar para historial, búsquedas, tema e idioma
```

## Extensiones de Navegador

La carpeta `PLUGINS/` contiene extensiones para:
- **Chrome**: Integración con context menu
- **Edge**: Compatibilidad con Chromium Edge
- **AEGIS Favorites**: Acceso rápido a favoritos

### Manifest v3 (Chrome/Edge):
```json
{
  "manifest_version": 3,
  "name": "AEGIS Dashboard",
  "permissions": ["contextMenus"],
  "background": { "service_worker": "background.js" }
}
```

## Seguridad

### Consideraciones:

1. **CORS**: La aplicación respeta políticas de mismo origen
2. **localStorage**: Datos locales del navegador, sin sincronización
3. **URLs externas**: Se abren en ventanas nuevas
4. **Validación**: Todas las entradas se validan

### Best Practices Implementadas:

- ✅ No se ejecuta código remoto
- ✅ Sin referencias a datos de usuario
- ✅ Métodos seguros de URL construction
- ✅ Sanitización de entrada (URL encoding)

## Performance

### Optimizaciones:

1. **CSS Variables**: Cambios de tema sin repintado completo
2. **Event Delegation**: Fewer event listeners
3. **LocalStorage Caching**: Datos sin llamadas a servidor
4. **Lazy Rendering**: Las vistas se renderizen solo cuando se necesitan
5. **DOM Minimization**: Manipulación eficiente del DOM

### Métricas:

- Tiempo de carga: < 1s
- Tamaño total: < 500KB (sin dependencias externas)
- FCP (First Contentful Paint): < 800ms
- LCP (Largest Contentful Paint): < 1.5s

## Internacionalización (i18n)

### Sistema de Traducción:

```javascript
// js/translations.js
const translations = {
  "es": {
    "YOUR_FAVORITES": "TUS FAVORITOS",
    "SEARCH_TOOLS": "HERRAMIENTAS DE BÚSQUEDA",
    // ... más traducciones
  },
  "en": {
    "YOUR_FAVORITES": "YOUR FAVORITES",
    "SEARCH_TOOLS": "SEARCH TOOLS",
    // ... más traducciones
  }
}
```

### Proceso de Cambio de Idioma:

```
Usuario hace clic en botón idioma
    ↓
App.toggleLanguage() actualiza config
    ↓
localStorage se actualiza
    ↓
applyLanguage() actualiza UI
    ↓
Tooltips se actualizan automáticamente
```

## Sistema de Tooltips (v1.2.0)

### Implementación de Tooltips Bilingües

Los tooltips proporcionan información detallada sobre cada herramienta al pasar el cursor.

#### Estructura:

```javascript
// En renderTools(), renderFavoritesView(), etc.
const description = t('DESC_' + tool.id, this.config.currentLanguage);

html += `
  <tr title="${description}">
    <td>${tool.name}</td>
    <td>${description}</td>
  </tr>
`;
```

#### Traducciones de Tooltips:

```javascript
// js/translations.js
const translations = {
  "es": {
    "DESC_vt": "Analiza archivos sospechosos, dominios, IPs y URLs",
    "DESC_shodan": "Motor de búsqueda para el Internet de las cosas",
    "DESC_urlscan": "Busca dominios, IPs, nombres de archivo, hashes, ASNs"
  },
  "en": {
    "DESC_vt": "Analyze suspicious files, domains, IPs & URLs",
    "DESC_shodan": "Search Engine for the Internet of Everything",
    "DESC_urlscan": "Search for domains, IPs, filenames, hashes, ASNs"
  }
}
```

#### Ubicaciones de Tooltips:

1. **Pestaña Herramientas**: Todas las herramientas listadas por categoría
2. **Resultados de Búsqueda**: Herramientas relevantes para la consulta
3. **Panel de Favoritos**: Herramientas marcadas como favoritas
4. **Vista de Favoritos**: Vista detallada de favoritos

#### CSS para Tooltips:

```css
/* Mejora visual de tooltips */
[title] {
  cursor: help;
  position: relative;
}

.result-item[title]:hover {
  background: rgba(59, 130, 246, 0.05);
  border-radius: var(--radius-lg);
  transition: var(--transition);
}

tr[title]:hover {
  background: rgba(59, 130, 246, 0.05) !important;
}
```

#### Cambio Automático de Idioma:

Cuando el usuario cambia de idioma (ES ↔ EN):
1. `toggleLanguage()` actualiza `this.config.currentLanguage`
2. `applyLanguage()` ejecuta `renderTools()`, `renderFavoritesView()`, etc.
3. Cada función usa `t('DESC_' + tool.id, this.config.currentLanguage)`
4. Los tooltips se regeneran con el idioma correcto

### Ventajas del Sistema:

- ✅ **Bilingüe**: Soporte completo ES/EN
- ✅ **Automático**: Cambio instantáneo al cambiar idioma
- ✅ **Consistente**: Mismo sistema en todas las vistas
- ✅ **Extensible**: Fácil agregar más idiomas
- ✅ **Accesible**: Mejora la comprensión de herramientas

## Botones de Acceso Rápido (v1.3.0)

### Implementación de Downdetector

El botón de Downdetector proporciona acceso directo a la verificación de caídas de sitios web sin necesidad de buscarlo en el listado.

#### Estructura HTML:

```html
<!-- Downdetector Button -->
<a href="https://downdetector.cl/" target="_blank" rel="noopener noreferrer" 
   class="btn btn-outline-danger" 
   id="downdetector-btn"
   aria-label="Downdetector">
  <svg><!-- Icono de advertencia --></svg>
</a>
```

#### Ubicación:
- **Posición**: Entre botón de idioma (EN) e historial
- **Navbar**: Barra superior junto a controles principales
- **Orden**: Categorías → Tema → Idioma → **Downdetector** → Historial → Favoritos

#### CSS Personalizado:

```css
#downdetector-btn {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

#downdetector-btn:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
```

#### Traducción del Tooltip:

```javascript
// js/translations.js
const translations = {
  "es": {
    "DOWNDETECTOR_TOOLTIP": "Verifica si los sitios web están caídos o tienen problemas"
  },
  "en": {
    "DOWNDETECTOR_TOOLTIP": "Check if websites are down or having issues"
  }
}

// js/app.js - applyLanguage()
const downdetectorBtn = document.getElementById("downdetector-btn");
if (downdetectorBtn) downdetectorBtn.title = t("DOWNDETECTOR_TOOLTIP", lang);
```

#### Características:
- ✅ **Solo icono**: Diseño compacto
- ✅ **Color rojo**: Esquema danger (#ef4444)
- ✅ **Tooltip bilingüe**: Actualización automática
- ✅ **Nueva pestaña**: Opens in new tab
- ✅ **Accesible**: aria-label incluido
- ✅ **Responsive**: Compatible con todos los tamaños

#### Ventajas:
- Acceso más rápido a función frecuente
- Reducción de búsquedas en el listado
- Mejor organización: herramientas vs accesos directos
- Mejora la experiencia del usuario

## Sistema de Autenticación (v1.7.0+)

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   Flujo de Autenticación                     │
└─────────────────────────────────────────────────────────────┘

    quickstart.html
         ↓
    login.html ─────────────────────┐
    (Login/Registro)                │
    + reCAPTCHA v2 (v1.7.2)         │
         ↓                          │
    ┌────────────────────┐    ┌─────────────────┐
    │   index.html       │    │   admin.html    │
    │   (Dashboard)      │    │   (Solo Admin)  │
    │   Requiere Auth    │    │   Requiere Admin│
    └────────────────────┘    └─────────────────┘
```

### Protección reCAPTCHA v2 (v1.7.2)

#### Configuración

**Claves de Google reCAPTCHA:**
```javascript
// Site Key (pública)
YOUR_RECAPTCHA_SITE_KEY

// Secret Key (privada - NO compartir)
YOUR_RECAPTCHA_SECRET_KEY

// Dominios autorizados
localhost
127.0.0.1
```

#### Implementación en login.html

**Carga Dinámica con Idioma:**
```html
<!-- Script dinámico según idioma guardado -->
<script>
    (function() {
        const lang = localStorage.getItem('osintLanguage') || 'es';
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?hl=${lang}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    })();
</script>
```

**Widget en Formulario:**
```html
<!-- Login form -->
<div class="g-recaptcha" 
     data-sitekey="YOUR_RECAPTCHA_SITE_KEY">
</div>

<!-- Register form -->
<div class="g-recaptcha" 
     data-sitekey="YOUR_RECAPTCHA_SITE_KEY">
</div>
```

#### Validación en js/auth.js

**Login:**
```javascript
handleLogin: async function (e) {
    e.preventDefault();
    
    // Validar reCAPTCHA
    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
        const lang = localStorage.getItem('osintLanguage') || 'es';
        const message = t('RECAPTCHA_ERROR', lang);
        this.showAlert(message, 'danger');
        return;
    }
    
    // ... resto de validación
}
```

**Registro:**
```javascript
handleRegister: async function (e) {
    // Validar reCAPTCHA (widget #1)
    const recaptchaResponse = grecaptcha.getResponse(1);
    if (!recaptchaResponse) {
        this.showAlert(t('RECAPTCHA_ERROR', lang), 'danger');
        return;
    }
    // ... resto
}
```

**Reset en Error:**
```javascript
// Login - widget 0 (por defecto)
grecaptcha.reset();

// Registro - widget 1
grecaptcha.reset(1);
```

#### Traducción Dinámica

**Función de Recarga:**
```javascript
function reloadRecaptchaWithLanguage(lang) {
    // Remover scripts anteriores
    const oldScripts = document.querySelectorAll('script[src*="recaptcha"]');
    oldScripts.forEach(script => script.remove());
    
    // Limpiar widgets
    const recaptchaElements = document.querySelectorAll('.g-recaptcha > div');
    recaptchaElements.forEach(el => el.innerHTML = '');
    
    // Recargar página con nuevo idioma
    setTimeout(() => window.location.reload(), 100);
}
```

**Textos del Widget:**
- **Español (ES)**: "No soy un robot"
- **Inglés (EN)**: "I'm not a robot"

#### CSS Responsive

```css
.g-recaptcha {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.g-recaptcha > div {
    transform: scale(0.95);
    transform-origin: center;
}

@media (max-width: 480px) {
    .g-recaptcha > div {
        transform: scale(0.85);
    }
}
```

#### Validación Backend (Recomendado)

**Nota**: La implementación actual solo valida en frontend. Para producción, se recomienda:

```javascript
// Backend (Node.js ejemplo)
const axios = require('axios');

async function verifyRecaptcha(token) {
    const secretKey = 'YOUR_RECAPTCHA_SECRET_KEY';
    const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
            params: {
                secret: secretKey,
                response: token
            }
        }
    );
    return response.data.success;
}
```

### Archivos del Sistema

| Archivo | Descripción |
|---------|-------------|
| `login.html` | Página de login/registro con toggles tema/idioma |
| `admin.html` | Panel de administración de usuarios |
| `js/auth.js` | Lógica de autenticación, sesiones, guards |
| `js/translations.js` | Traducciones incluyendo placeholders |

### LocalStorage Keys

```javascript
// Autenticación
"aegisSession"   // Sesión actual del usuario
"aegisUsers"     // Base de datos de usuarios

// Preferencias
"osintTheme"     // "dark" | "light"
"osintLanguage"  // "es" | "en"
```

### Credenciales por Defecto

- **Email**: `[Registro o OAuth]`
- **Password**: `[TU_CONTRASEÑA]`
- **Rol**: `admin`

### Funciones Principales (auth.js)

```javascript
// Autenticación
Auth.login(email, password)      // Inicia sesión
Auth.register(name, email, pass) // Registra usuario
Auth.logout()                    // Cierra sesión
Auth.isAuthenticated()           // Verifica sesión
Auth.isAdmin()                   // Verifica rol admin

// Gestión de usuarios
Auth.getUsers()                  // Lista usuarios
Auth.updateUser(id, data)        // Actualiza usuario
Auth.deleteUser(id)              // Elimina usuario

// Traducciones
initTranslations()               // Aplica traducciones a data-i18n
loadTranslations()               // Recarga traducciones
```

### Toggle de Tema (v1.7.1)

```javascript
// Aplicar tema correctamente
function applyTheme(theme) {
    // Aplicar a AMBOS elementos
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.setAttribute('data-bs-theme', theme);
    localStorage.setItem('osintTheme', theme);
    updateThemeIcon();
}

// Actualizar icono
function updateThemeIcon() {
    const theme = localStorage.getItem('osintTheme') || 'dark';
    const moonIcon = document.querySelector('.icon-moon');
    const sunIcon = document.querySelector('.icon-sun');
    
    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}
```

### Placeholders Traducibles (v1.7.1)

```html
<!-- HTML -->
<input type="email" data-placeholder="PLACEHOLDER_EMAIL">
```

```javascript
// En initTranslations()
document.querySelectorAll('[data-placeholder]').forEach(el => {
    const key = el.getAttribute('data-placeholder');
    if (translations[lang][key]) {
        el.placeholder = translations[lang][key];
    }
});
```

## Mantenimiento y Extensión

### Agregar Nueva Herramienta:

1. Edita `js/tools-config.js`
2. Agrega nuevo objeto con estructura correcta
3. Categoriza según categoría existente

### Agregar Nueva Categoría:

1. Crea herramientas con nueva categoría
2. Agrega traducción en `js/translations.js`
3. La UI se actualiza automáticamente

### Actualizar Temas de Color:

1. Edita variables CSS en `:root`
2. Los cambios se aplican globalmente

## Troubleshooting de Desarrollo

### Consola JavaScript Errors:

```javascript
// Error común: tools no cargadas
// Solución: Verifica que js/tools-config.js se carga antes de js/app.js

// Error: localStorage quote exceeded
// Solución: Implementa limpieza periódica de historial antiguo

// Error: Urls inválidas
// Solución: Valida templates en js/tools-config.js
```

### Checklist de Debugging:

- [ ] ¿Se carga index.html?
- [ ] ¿Se cargan todos los scripts?
- [ ] ¿localStorage está habilitado?
- [ ] ¿Las URLs son válidas?
- [ ] ¿Los templates usan `{{query}}`?

## Próximas Mejoras Sugeridas

1. **Backend Sync**: Sincronizar favoritos con servidor
2. **API Integration**: Resultados de API en lugar de URLs
3. **Analytics**: Tracking de herramientas más usadas
4. **Dark Mode Timer**: Cambio automático según hora
5. **Custom Categories**: Crear categorías personalizadas
6. **Export/Import**: Exportar e importar configuración
7. **Keyboard Shortcuts**: Accesos rápidos de teclado
8. **Progressive Web App (PWA)**: Instalable como app
9. **Tooltips Avanzados**: Tooltips con información adicional (última actualización, popularidad)
10. **Más Idiomas**: FR, DE, PT, IT para tooltips y UI
11. **Más Botones de Acceso Rápido**: Identificar y agregar más funciones frecuentes
12. **Configuración de Accesos**: Permitir al usuario personalizar botones de acceso rápido

## Sistema de Gestión de Incidencias de Ciberseguridad (v2.0.0)

### Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│          Flujo de Gestión de Incidencias                     │
└─────────────────────────────────────────────────────────────┘

    admin.html
         ↓ (Menú dropdown)
    incidents.html ───────────────────────┐
    (Solo Administradores)                │
         ↓                                │
    ┌────────────────────┐    ┌──────────────────────┐
    │  Panel Principal   │    │  Modal de Formulario │
    │  - Estadísticas    │───→│  - 7 Secciones       │
    │  - Filtros         │    │  - Accordion UI      │
    │  - Tabla Incidentes│←───│  - Crear/Editar      │
    └────────────────────┘    └──────────────────────┘
         ↓                                ↓
    ┌────────────────────────────────────────────┐
    │           localStorage                     │
    │  Clave: aegisIncidents                     │
    │  Array de objetos JSON                     │
    └────────────────────────────────────────────┘
```

### js/taxonomy-cs.js (317 líneas)

Módulo centralizado con toda la taxonomía técnica para clasificación de incidentes.

#### Estructura del Objeto CSTaxonomy:

```javascript
const CSTaxonomy = {
    // 14 Tipos de Incidentes
    incidentTypes: {
        PHISH: { code: 'PHISH', nameES: 'Phishing', nameEN: 'Phishing' },
        MALW: { code: 'MALW', nameES: 'Malware', nameEN: 'Malware' },
        RANS: { code: 'RANS', nameES: 'Ransomware', nameEN: 'Ransomware' },
        DLEAK: { code: 'DLEAK', nameES: 'Fuga de Datos', nameEN: 'Data Leakage' },
        UNAUTH: { code: 'UNAUTH', nameES: 'Acceso No Autorizado', nameEN: 'Unauthorized Access' },
        ATO: { code: 'ATO', nameES: 'Compromiso de Cuenta', nameEN: 'Account Takeover' },
        DDOS: { code: 'DDOS', nameES: 'Ataque DDoS', nameEN: 'DDoS Attack' },
        VULN: { code: 'VULN', nameES: 'Explotación de Vulnerabilidad', nameEN: 'Vulnerability Exploitation' },
        SOCENG: { code: 'SOCENG', nameES: 'Ingeniería Social', nameEN: 'Social Engineering' },
        MISCONF: { code: 'MISCONF', nameES: 'Configuración Errónea', nameEN: 'Misconfiguration' },
        PHYSEC: { code: 'PHYSEC', nameES: 'Seguridad Física', nameEN: 'Physical Security' },
        INTRUD: { code: 'INTRUD', nameES: 'Intrusión', nameEN: 'Intrusion' },
        ZERO: { code: 'ZERO', nameES: 'Zero-Day', nameEN: 'Zero-Day' },
        NETANOM: { code: 'NETANOM', nameES: 'Anomalía de Red', nameEN: 'Network Anomaly' }
    },
    
    // 8 Áreas Organizacionales
    areas: {
        CS: { code: 'CS', nameES: 'CyberSecurity', nameEN: 'CyberSecurity' },
        SOC: { code: 'SOC', nameES: 'SOC', nameEN: 'SOC' },
        IT: { code: 'IT', nameES: 'Tecnología', nameEN: 'Technology' },
        NET: { code: 'NET', nameES: 'Redes', nameEN: 'Networks' },
        CLOUD: { code: 'CLOUD', nameES: 'Cloud', nameEN: 'Cloud' },
        APP: { code: 'APP', nameES: 'Aplicaciones', nameEN: 'Applications' },
        DATA: { code: 'DATA', nameES: 'Base de Datos', nameEN: 'Database' },
        OPS: { code: 'OPS', nameES: 'Operaciones', nameEN: 'Operations' }
    },
    
    // 11 Canales de Detección
    detectionChannels: {
        SIEM: { code: 'SIEM', nameES: 'SIEM', nameEN: 'SIEM' },
        EDR_XDR: { code: 'EDR_XDR', nameES: 'EDR/XDR', nameEN: 'EDR/XDR' },
        FIREWALL: { code: 'FIREWALL', nameES: 'Firewall', nameEN: 'Firewall' },
        IDS_IPS: { code: 'IDS_IPS', nameES: 'IDS/IPS', nameEN: 'IDS/IPS' },
        ANTIVIRUS: { code: 'ANTIVIRUS', nameES: 'Antivirus', nameEN: 'Antivirus' },
        USER_REPORT: { code: 'USER_REPORT', nameES: 'Reporte Usuario', nameEN: 'User Report' },
        THREAT_INTEL: { code: 'THREAT_INTEL', nameES: 'Threat Intelligence', nameEN: 'Threat Intelligence' },
        EMAIL_GATEWAY: { code: 'EMAIL_GATEWAY', nameES: 'Email Gateway', nameEN: 'Email Gateway' },
        DLP: { code: 'DLP', nameES: 'DLP', nameEN: 'DLP' },
        CLOUD_MONITOR: { code: 'CLOUD_MONITOR', nameES: 'Monitoreo Cloud', nameEN: 'Cloud Monitor' },
        AUDIT: { code: 'AUDIT', nameES: 'Auditoría', nameEN: 'Audit' }
    },
    
    // 4 Niveles de Criticidad
    criticality: {
        LOW: { code: 'LOW', nameES: 'Baja', nameEN: 'Low', color: '#28a745' },
        MEDIUM: { code: 'MEDIUM', nameES: 'Media', nameEN: 'Medium', color: '#ffc107' },
        HIGH: { code: 'HIGH', nameES: 'Alta', nameEN: 'High', color: '#fd7e14' },
        CRITICAL: { code: 'CRITICAL', nameES: 'Crítica', nameEN: 'Critical', color: '#dc3545' }
    },
    
    // 5 Estados del Ciclo de Vida
    statuses: {
        OPEN: { code: 'OPEN', nameES: 'Abierta', nameEN: 'Open', icon: '🔵' },
        INVESTIGATING: { code: 'INVESTIGATING', nameES: 'Investigando', nameEN: 'Investigating', icon: '🔍' },
        CONTAINED: { code: 'CONTAINED', nameES: 'Contenida', nameEN: 'Contained', icon: '🛡️' },
        RESOLVED: { code: 'RESOLVED', nameES: 'Resuelta', nameEN: 'Resolved', icon: '✅' },
        CLOSED: { code: 'CLOSED', nameES: 'Cerrada', nameEN: 'Closed', icon: '⚫' }
    },
    
    // 7 Categorías SGSI (ISO/IEC 27035)
    sgsiCategories: {
        AVAILABILITY: { 
            code: 'AVAILABILITY', 
            nameES: 'Disponibilidad', 
            nameEN: 'Availability',
            subcategories: ['Service Down', 'Data Unavailable', 'System Outage']
        },
        INTEGRITY: { 
            code: 'INTEGRITY', 
            nameES: 'Integridad', 
            nameEN: 'Integrity',
            subcategories: ['Data Modification', 'Unauthorized Changes', 'Data Corruption']
        },
        CONFIDENTIALITY: { 
            code: 'CONFIDENTIALITY', 
            nameES: 'Confidencialidad', 
            nameEN: 'Confidentiality',
            subcategories: ['Data Exposure', 'Unauthorized Access', 'Information Leak']
        },
        COMPLIANCE: { 
            code: 'COMPLIANCE', 
            nameES: 'Cumplimiento', 
            nameEN: 'Compliance',
            subcategories: ['Regulation Violation', 'Policy Breach', 'Audit Failure']
        },
        REPUTATION: { 
            code: 'REPUTATION', 
            nameES: 'Reputación', 
            nameEN: 'Reputation',
            subcategories: ['Brand Damage', 'Public Exposure', 'Media Attention']
        },
        FINANCIAL: { 
            code: 'FINANCIAL', 
            nameES: 'Financiero', 
            nameEN: 'Financial',
            subcategories: ['Monetary Loss', 'Fraud', 'Ransom Payment']
        },
        OPERATIONS: { 
            code: 'OPERATIONS', 
            nameES: 'Operaciones', 
            nameEN: 'Operations',
            subcategories: ['Process Disruption', 'Productivity Loss', 'Resource Impact']
        }
    },
    
    // 6 Fases NIST 800-61 rev2
    nistPhases: {
        PREPARATION: { code: 'PREPARATION', nameES: 'Preparación', nameEN: 'Preparation' },
        DETECTION: { code: 'DETECTION', nameES: 'Detección y Análisis', nameEN: 'Detection & Analysis' },
        CONTAINMENT: { code: 'CONTAINMENT', nameES: 'Contención', nameEN: 'Containment' },
        ERADICATION: { code: 'ERADICATION', nameES: 'Erradicación', nameEN: 'Eradication' },
        RECOVERY: { code: 'RECOVERY', nameES: 'Recuperación', nameEN: 'Recovery' },
        POST_MORTEM: { code: 'POST_MORTEM', nameES: 'Post-Mortem', nameEN: 'Post-Mortem' }
    },
    
    // 11 Tácticas MITRE ATT&CK
    mitreAttack: {
        INITIAL_ACCESS: { code: 'TA0001', nameES: 'Acceso Inicial', nameEN: 'Initial Access', techniques: ['T1189', 'T1190', 'T1566'] },
        EXECUTION: { code: 'TA0002', nameES: 'Ejecución', nameEN: 'Execution', techniques: ['T1059', 'T1203', 'T1204'] },
        PERSISTENCE: { code: 'TA0003', nameES: 'Persistencia', nameEN: 'Persistence', techniques: ['T1053', 'T1543', 'T1547'] },
        PRIVILEGE_ESCALATION: { code: 'TA0004', nameES: 'Escalada de Privilegios', nameEN: 'Privilege Escalation', techniques: ['T1068', 'T1134', 'T1548'] },
        DEFENSE_EVASION: { code: 'TA0005', nameES: 'Evasión de Defensas', nameEN: 'Defense Evasion', techniques: ['T1027', 'T1055', 'T1070'] },
        CREDENTIAL_ACCESS: { code: 'TA0006', nameES: 'Acceso a Credenciales', nameEN: 'Credential Access', techniques: ['T1003', 'T1110', 'T1552'] },
        DISCOVERY: { code: 'TA0007', nameES: 'Descubrimiento', nameEN: 'Discovery', techniques: ['T1046', 'T1082', 'T1087'] },
        LATERAL_MOVEMENT: { code: 'TA0008', nameES: 'Movimiento Lateral', nameEN: 'Lateral Movement', techniques: ['T1021', 'T1091', 'T1550'] },
        COLLECTION: { code: 'TA0009', nameES: 'Recopilación', nameEN: 'Collection', techniques: ['T1005', 'T1039', 'T1113'] },
        EXFILTRATION: { code: 'TA0010', nameES: 'Exfiltración', nameEN: 'Exfiltration', techniques: ['T1020', 'T1048', 'T1567'] },
        IMPACT: { code: 'TA0040', nameES: 'Impacto', nameEN: 'Impact', techniques: ['T1485', 'T1486', 'T1490'] }
    },
    
    // Función: Generar Código Único de Incidente
    generateIncidentCode: function(type, area) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const mmdd = month + day;
        
        // Obtener incidentes existentes del mismo tipo y área
        const existingIncidents = JSON.parse(localStorage.getItem('aegisIncidents') || '[]');
        const sameTypeArea = existingIncidents.filter(inc => 
            inc.code && inc.code.startsWith(`INC-${type}-${area}-${year}-${mmdd}`)
        );
        const sequence = String(sameTypeArea.length + 1).padStart(4, '0');
        
        return `INC-${type}-${area}-${year}-${mmdd}-${sequence}`;
    },
    
    // Función: Calcular Prioridad SGSI (Matriz 4x4)
    getPriority: function(impact, urgency) {
        // Matriz Impact x Urgency → Priority
        const matrix = {
            'CRITICAL-CRITICAL': 'CRITICAL',
            'CRITICAL-HIGH': 'CRITICAL',
            'CRITICAL-MEDIUM': 'HIGH',
            'CRITICAL-LOW': 'HIGH',
            'HIGH-CRITICAL': 'CRITICAL',
            'HIGH-HIGH': 'HIGH',
            'HIGH-MEDIUM': 'HIGH',
            'HIGH-LOW': 'MEDIUM',
            'MEDIUM-CRITICAL': 'HIGH',
            'MEDIUM-HIGH': 'HIGH',
            'MEDIUM-MEDIUM': 'MEDIUM',
            'MEDIUM-LOW': 'MEDIUM',
            'LOW-CRITICAL': 'HIGH',
            'LOW-HIGH': 'MEDIUM',
            'LOW-MEDIUM': 'MEDIUM',
            'LOW-LOW': 'LOW'
        };
        
        const key = `${impact}-${urgency}`;
        return matrix[key] || 'MEDIUM';
    }
};
```

### js/incidents.js (500+ líneas)

Módulo de lógica de negocio para CRUD completo de incidencias.

#### Estructura del Objeto IncidentManager:

```javascript
const IncidentManager = {
    incidents: [],
    storageKey: 'aegisIncidents',
    currentIncident: null,
    filters: {
        status: '',
        criticality: '',
        type: '',
        search: ''
    },
    
    // Inicializar sistema
    init: function() {
        this.loadIncidents();
        this.bindEvents();
        this.populateFormSelects();
        this.renderIncidents();
        this.updateStats();
    },
    
    // Cargar desde localStorage
    loadIncidents: function() {
        const stored = localStorage.getItem(this.storageKey);
        this.incidents = stored ? JSON.parse(stored) : [];
    },
    
    // Guardar en localStorage
    saveToStorage: function() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.incidents));
    },
    
    // Crear nueva incidencia
    createIncident: function(data) {
        const newIncident = {
            id: Date.now().toString(),
            code: CSTaxonomy.generateIncidentCode(data.type, data.area),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: Auth.getCurrentUser().username,
            priority: CSTaxonomy.getPriority(data.impact, data.urgency),
            ...data,
            actions: [],
            iocs: {
                maliciousIPs: data.maliciousIPs || [],
                fileHashes: data.fileHashes || [],
                suspiciousDomains: data.suspiciousDomains || [],
                artifacts: data.artifacts || []
            }
        };
        
        this.incidents.unshift(newIncident);
        this.saveToStorage();
        this.renderIncidents();
        this.updateStats();
        
        return newIncident;
    },
    
    // Actualizar incidencia existente
    updateIncident: function(id, updates) {
        const index = this.incidents.findIndex(inc => inc.id === id);
        if (index !== -1) {
            // Recalcular prioridad si cambió impacto/urgencia
            if (updates.impact || updates.urgency) {
                const impact = updates.impact || this.incidents[index].impact;
                const urgency = updates.urgency || this.incidents[index].urgency;
                updates.priority = CSTaxonomy.getPriority(impact, urgency);
            }
            
            this.incidents[index] = {
                ...this.incidents[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            this.saveToStorage();
            this.renderIncidents();
            this.updateStats();
            return true;
        }
        return false;
    },
    
    // Eliminar incidencia
    deleteIncident: function(id) {
        const lang = localStorage.getItem('osintLanguage') || 'es';
        const confirmMsg = Translations.translations[lang].CONFIRM_DELETE_INCIDENT;
        
        if (confirm(confirmMsg)) {
            this.incidents = this.incidents.filter(inc => inc.id !== id);
            this.saveToStorage();
            this.renderIncidents();
            this.updateStats();
            return true;
        }
        return false;
    },
    
    // Obtener incidencias filtradas
    getFilteredIncidents: function() {
        let filtered = this.incidents;
        
        // Filtro por estado
        if (this.filters.status) {
            filtered = filtered.filter(inc => inc.status === this.filters.status);
        }
        
        // Filtro por criticidad
        if (this.filters.criticality) {
            filtered = filtered.filter(inc => inc.priority === this.filters.criticality);
        }
        
        // Filtro por tipo
        if (this.filters.type) {
            filtered = filtered.filter(inc => inc.type === this.filters.type);
        }
        
        // Búsqueda global
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            filtered = filtered.filter(inc => 
                inc.code.toLowerCase().includes(search) ||
                inc.description.toLowerCase().includes(search) ||
                (inc.affectedIP && inc.affectedIP.toLowerCase().includes(search)) ||
                (inc.affectedHostname && inc.affectedHostname.toLowerCase().includes(search)) ||
                inc.reporter.toLowerCase().includes(search)
            );
        }
        
        return filtered;
    },
    
    // Renderizar tabla de incidencias
    renderIncidents: function() {
        const tbody = document.getElementById('incidentsTableBody');
        const filtered = this.getFilteredIncidents();
        const lang = localStorage.getItem('osintLanguage') || 'es';
        
        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        ${Translations.t('NO_INCIDENTS', lang)}
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = filtered.map(inc => {
            const statusObj = CSTaxonomy.statuses[inc.status];
            const criticalityObj = CSTaxonomy.criticality[inc.priority];
            const typeObj = CSTaxonomy.incidentTypes[inc.type];
            
            return `
                <tr>
                    <td><strong>${inc.code}</strong></td>
                    <td>
                        <span class="status-badge">
                            ${statusObj.icon} ${statusObj['name' + (lang === 'es' ? 'ES' : 'EN')]}
                        </span>
                    </td>
                    <td>
                        <span class="badge badge-${inc.priority.toLowerCase()}">${criticalityObj['name' + (lang === 'es' ? 'ES' : 'EN')]}</span>
                    </td>
                    <td>${typeObj['name' + (lang === 'es' ? 'ES' : 'EN')]}</td>
                    <td>${inc.description.substring(0, 50)}${inc.description.length > 50 ? '...' : ''}</td>
                    <td>${inc.affectedIP || '-'}</td>
                    <td>${inc.reporter}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="IncidentManager.editIncident('${inc.id}')">
                            ${Translations.t('EDIT', lang)}
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="IncidentManager.deleteIncident('${inc.id}')">
                            ${Translations.t('DELETE', lang)}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },
    
    // Actualizar estadísticas
    updateStats: function() {
        const total = this.incidents.length;
        const open = this.incidents.filter(inc => inc.status === 'OPEN').length;
        const investigating = this.incidents.filter(inc => inc.status === 'INVESTIGATING').length;
        const critical = this.incidents.filter(inc => inc.priority === 'CRITICAL').length;
        
        document.getElementById('totalIncidents').textContent = total;
        document.getElementById('openIncidents').textContent = open;
        document.getElementById('investigatingIncidents').textContent = investigating;
        document.getElementById('criticalIncidents').textContent = critical;
    },
    
    // Más funciones: populateFormSelects(), saveIncidentFromForm(), editIncident(), etc.
};
```

### incidents.html (Interfaz)

**Componentes Principales:**

1. **Panel de Estadísticas (4 Cards)**
   - Total de Incidencias
   - Incidencias Abiertas
   - En Investigación
   - Críticas

2. **Sección de Filtros**
   - Select: Filtro por Estado
   - Select: Filtro por Criticidad
   - Select: Filtro por Tipo
   - Input: Búsqueda global

3. **Tabla de Incidencias (8 Columnas)**
   - Código único (`INC-PHISH-CS-2025-1210-0001`)
   - Estado con icono (🔵 Abierta, 🔍 Investigando, etc.)
   - Criticidad con badge de color
   - Tipo de incidente
   - Descripción (truncada a 50 caracteres)
   - IP Afectada
   - Reportado por
   - Acciones (Editar/Eliminar)

4. **Modal de Formulario (7 Secciones Acordeón)**
   - **Sección 1: Información Básica**
     - Descripción (textarea, requerido)
     - Reportado por (input, requerido)
     - IP Afectada (input, opcional)
     - Hostname Afectado (input, opcional)
   
   - **Sección 2: Información de Detección**
     - Canal de Detección (select, requerido)
     - Nivel de Confianza (select: Alto/Medio/Bajo)
   
   - **Sección 3: Clasificación Técnica**
     - Tipo de Incidente (select 14 tipos, requerido)
     - Área Organizacional (select 8 áreas, requerido)
     - Fase NIST 800-61 (select 6 fases)
     - Táctica MITRE ATT&CK (select 11 tácticas)
   
   - **Sección 4: Clasificación SGSI (ISO 27035)**
     - Impacto (select: Bajo/Medio/Alto/Crítico, requerido)
     - Urgencia (select: Baja/Media/Alta/Crítica, requerido)
     - Categoría SGSI (select 7 categorías)
     - Alerta de Prioridad Calculada (info box)
   
   - **Sección 5: Asignación y Seguimiento**
     - Estado (select 5 estados, requerido)
     - Asignado a (input)
     - SLA en horas (number input)
     - Resolución Estimada (datetime-local)
   
   - **Sección 6: Evidencias e IoCs**
     - IPs Maliciosas (textarea)
     - Hashes de Archivos (textarea)
     - Dominios Sospechosos (textarea)
     - Artefactos Adicionales (textarea)
   
   - **Sección 7: Línea de Tiempo de Acciones**
     - Contención (textarea)
     - Análisis (textarea)
     - Remediación (textarea)
     - Lecciones Aprendidas (textarea)

### Almacenamiento

**localStorage:**
```javascript
// Clave
aegisIncidents

// Formato
[
  {
    id: "1702463542123",
    code: "INC-PHISH-CS-2025-1210-0001",
    createdAt: "2025-12-10T14:32:22.123Z",
    updatedAt: "2025-12-10T15:45:00.000Z",
    createdBy: "admin",
    type: "PHISH",
    area: "CS",
    status: "INVESTIGATING",
    priority: "HIGH",
    impact: "HIGH",
    urgency: "HIGH",
    description: "Campaña de phishing detectada en correos corporativos",
    reporter: "Juan Pérez",
    affectedIP: "192.168.1.50",
    affectedHostname: "PC-USER-01",
    detectionChannel: "EMAIL_GATEWAY",
    confidence: "HIGH",
    nistPhase: "DETECTION",
    mitreTactic: "INITIAL_ACCESS",
    sgsiCategory: "CONFIDENTIALITY",
    assignedTo: "Analista SOC",
    sla: 24,
    estimatedResolution: "2025-12-11T14:00:00.000Z",
    iocs: {
      maliciousIPs: ["203.0.113.50", "198.51.100.42"],
      fileHashes: ["abc123def456..."],
      suspiciousDomains: ["fake-banking-site.com"],
      artifacts: ["URL: https://malicious-link.com/login"]
    },
    actions: [],
    containment: "Bloqueados dominios en firewall y email gateway",
    analysis: "Análisis de headers revela campaña coordinada",
    remediation: "Usuarios afectados notificados, contraseñas reseteadas",
    lessons: "Implementar autenticación multifactor en correo"
  }
]
```

### Flujo de Trabajo

```
Usuario Admin → admin.html → Click "Gestión de Incidencias"
                    ↓
              incidents.html
                    ↓
    ┌───────────────┴───────────────┐
    │                               │
Ver Dashboard          Crear Nueva Incidencia
    │                               │
Filtros/Búsqueda           Modal de Formulario
    │                      (7 Secciones)
Editar/Eliminar                    │
    │                      Guardar (validación)
    └──────────┬───────────────────┘
               ↓
        localStorage.setItem()
               ↓
        Renderizar Tabla
               ↓
        Actualizar Stats
```

### Traducciones (100+ Claves)

**Ejemplos de claves agregadas en js/translations.js:**

```javascript
// Inglés
"INCIDENTS": "Incidents",
"INCIDENT_MANAGEMENT": "Incident Management",
"NEW_INCIDENT": "New Incident",
"BASIC_INFO": "Basic Information",
"DETECTION_INFO": "Detection Information",
"TECHNICAL_CLASSIFICATION": "Technical Classification",
"SGSI_CLASSIFICATION": "SGSI Classification (ISO 27035)",
"ASSIGNMENT_TRACKING": "Assignment & Tracking",
"EVIDENCE_IOCS": "Evidence & Indicators of Compromise (IoCs)",
"ACTIONS_TIMELINE": "Actions Timeline",
"MALICIOUS_IPS": "Malicious IPs",
"FILE_HASHES": "File Hashes",
"SUSPICIOUS_DOMAINS": "Suspicious Domains",
"FILTER_BY_STATUS": "Filter by Status",
"TOTAL_INCIDENTS": "Total Incidents",
"CRITICAL_INCIDENTS": "Critical Incidents",
"STATUS_OPEN": "Open",
"STATUS_INVESTIGATING": "Investigating",
"INCIDENT_CREATED": "Incident created successfully",

// Español
"INCIDENTS": "Incidencias",
"INCIDENT_MANAGEMENT": "Gestión de Incidencias",
"NEW_INCIDENT": "Nueva Incidencia",
"BASIC_INFO": "Información Básica",
// ... etc.
```

### Próximas Mejoras (v2.0.0)

- [ ] **Exportar a PDF/CSV**: Reportes de incidencias
- [ ] **Timeline Visual**: Gráfico de acciones con fechas
- [ ] **Upload de Evidencias**: Archivos adjuntos con base64
- [ ] **Selector MITRE Completo**: Búsqueda de técnicas
- [ ] **Notificaciones**: Alertas en tiempo real
- [ ] **Backend Integration**: API REST para persistencia centralizada
- [ ] **Dashboard Analytics**: Gráficos con Chart.js (incidencias por tipo, por mes, MTTR)
- [ ] **Comentarios Colaborativos**: Sistema de chat por incidente
- [ ] **Tags Personalizados**: Etiquetas adicionales para categorización

---

**Última actualización**: Diciembre 2025 (v2.0.0)
