<div align="center">
  <img src="src/img/logos/Aegisboard-P.png" alt="Aegisboard Logo" width="300">
</div>

# 🛡️ Aegis Board - Herramienta de Investigación

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/s3codecL/aegisboard.svg)](https://github.com/s3codecL/aegisboard/releases)
[![Version](https://img.shields.io/badge/version-2.0.0--rc.1-blue.svg)](changelog.md)
[![GitHub issues](https://img.shields.io/github/issues/s3codecL/aegisboard.svg)](https://github.com/s3codecL/aegisboard/issues)
[![GitHub stars](https://img.shields.io/github/stars/s3codecL/aegisboard.svg)](https://github.com/s3codecL/aegisboard/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/s3codecL/aegisboard/graphs/commit-activity)

Una herramienta moderna y funcional de **Open Source Intelligence (OSINT)** diseñada para investigadores de seguridad, analistas de amenazas y profesionales de ciberseguridad. Accesible de forma global en **[aegisboard.dev](https://aegisboard.dev)**.

## 🚀 Novedades v2.0.0-rc.1 (Release Candidate)

- **Distribución Oficial Cloud**: Lanzamiento del dominio `aegisboard.dev` centralizado, eliminando la necesidad de instalaciones locales e instanciaciones por línea de comandos.
- **Flujo de Traducciones Completo**: Corrección sistemática con +130 nuevas claves bilingües y persistencia estable en todos los módulos, incluyendo Dashboard, Admin, e Incidentes.
- **Persistencia de Temas (Dark/Light)**: Solucionado el conflicto de estilos modulares que reseteaban la interfaz. Interfaz visual unificada con modo claro premium (glassmorphism).
- **Estabilidad SemVer**: Adaptación de release candidate para la fase de pruebas abierta de la nueva arquitectura de Incident Management.
- **Persistencia de Datos**: Corrección en el mapeo de áreas (`OP` standardized) e integridad de formularios al editar.
- **Arquitectura Modular**: Organización limpia de archivos separando lógica (`src/js`) y estilos (`src/css`) para mayor escalabilidad.

🛡️ **Gestión de Incidencias de Ciberseguridad**
- Sistema completo de gestión de incidentes de seguridad
- Clasificación automática según NIST 800-61, ISO/IEC 27035 y MITRE ATT&CK
- Generación automática de códigos únicos por incidente
- Cálculo de prioridad mediante matriz SGSI (Impacto x Urgencia)
- 14 tipos de incidentes con taxonomía técnica completa
- Panel de estadísticas en tiempo real (Total, Abiertas, Críticas)
- Sistema de filtrado avanzado (Estado, Criticidad, Tipo, Búsqueda)
- Gestión de IoCs (IPs, hashes, dominios, artefactos)
- Línea de tiempo de acciones (Contención, Análisis, Remediación)
- 100+ claves de traducción ES/EN para módulo de incidencias
- Acceso desde panel admin (solo administradores)

🔒 **Protección reCAPTCHA v2 (v1.7.2)**
- reCAPTCHA v2 integrado en login y registro
- Protección contra bots y ataques automatizados
- Traducción dinámica ES/EN del widget reCAPTCHA
- Reset automático en caso de error
- Validación frontend con mensajes traducibles
- Diseño responsive adaptado a móviles

🎨 **Mejoras de UI/UX en Sistema de Autenticación (v1.7.1)**
- Modo claro/oscuro completamente funcional en todas las páginas
- Toggle de tema e idioma consistente en login.html y admin.html
- Estilos de tarjetas con hover y glow azul (igual que dashboard)
- Placeholders de inputs traducibles (ES/EN)

🔐 **Sistema de Autenticación (v1.7.0)**
- Login con email/password
- Panel de administración de usuarios
- Roles de usuario (User/Admin)
- Gestión de sesiones con tokens
- OAuth preparado (Google, GitHub)

[Ver todas las novedades en CHANGELOG.md](changelog.md)

## 🎯 Inicio Rápido

| Para Empezar | Para Aprender | Para Administrar | Para Incidencias |
|--------------|---------------|------------------|------------------|
| [Acceder al Dashboard](#-autenticación) (`login.html`) | [Ver Guía Interactiva](#-archivos-principales) (`quickstart.html`) | [Panel Admin](#-panel-de-administración) (`admin.html`) | [Gestión de Incidencias](#-gestión-de-incidencias-de-ciberseguridad-v180) (`incidents.html`) |

> **¿Primera vez?** 👉 Abre `quickstart.html` para tutorial completo, luego `login.html` para acceder  
> **Acceso Flexible** 👉 Regístrate para crear tu cuenta personal, o usa Google/GitHub para entrar al instante.
> **¿Listo para trabajar?** 👉 Login → Dashboard para tus investigaciones OSINT

## 🔐 Autenticación

### Métodos de Acceso
1. **Google / GitHub**: La forma recomendada y más rápida. Sin contraseñas extra económicamente seguras.
2. **Registro**: Crea tu propia cuenta personal con email y contraseña.

### Flujo de Autenticación
```
quickstart.html (Público)
  ↓
login.html ──→ [Registro] ──→
  ↓             ↓
[Recuperar Contraseña]   ↓
  ↓             ↓
   index.html (Dashboard, requiere login)
  ↓
 ┌───────────────┬───────────────┐
 |               |               |
admin.html   incidents.html   (Solo Admin)
```

### Características de Seguridad
- ✅ Validación de email y contraseña
- ✅ Hash de contraseñas
- ✅ Tokens de sesión con expiración (24h)
- ✅ Roles de usuario (user/admin)
- ✅ Protección de rutas
- ✅ Panel de administración completo
- ✅ **reCAPTCHA v2**: Protección contra bots en login/registro
- ✅ **Traducción dinámica**: reCAPTCHA cambia idioma ES/EN automáticamente

📖 **Documentación completa**: [AUTH_GUIDE.md](AUTH_GUIDE.md)

## 📸 Screenshots

<div align="center">

> **📌 Nota**: Las capturas de pantalla se agregarán próximamente. Por ahora, puedes ver la herramienta en acción abriendo `index.html` o `quickstart.html` en tu navegador.

Para contribuir con screenshots, consulta [.github/images/README.md](.github/images/README.md)

</div>

## ✨ Características Principales

### 🔐 Gestión de Usuarios
- **Sistema de autenticación completo**: Login, registro, logout
- **Protección reCAPTCHA v2**: Anti-bots en formularios de acceso
- **Panel de administración**: CRUD de usuarios, estadísticas
- **Roles y permisos**: Usuario regular vs Administrador
- **Sesiones persistentes**: "Recordarme" con tokens
- **OAuth**: Google y GitHub completamente funcionales

### 🛡️ Gestión de Incidencias de Ciberseguridad (v2.0.0)
- **Sistema completo de incident response**:
  - Registro estructurado en 7 secciones (Básica, Detección, Clasificación Técnica, SGSI, Asignación, Evidencias, Timeline)
  - Generación automática de código: `INC-[TIPO]-[ÁREA]-[AÑO]-[MMDD]-[SECUENCIA]`
  - Cálculo automático de prioridad con matriz SGSI 4x4 (Impacto x Urgencia)

- **Taxonomía técnica completa**:
  - 14 tipos de incidentes: Phishing, Malware, Ransomware, Data Leakage, Acceso No Autorizado, etc.
  - 8 áreas organizacionales: CyberSecurity, SOC, IT, Redes, Cloud, Apps, Data, Ops
  - 11 canales de detección: SIEM, EDR/XDR, Firewall, IDS/IPS, Antivirus, User Report, etc.
  - 4 niveles de criticidad con colores (Verde/Amarillo/Naranja/Rojo)
  - 5 estados de ciclo de vida (Abierta, Investigando, Contenida, Resuelta, Cerrada)

- **Frameworks internacionales**:
  - **NIST 800-61**: 6 fases (Preparation, Detection, Containment, Eradication, Recovery, Post-mortem)
  - **ISO/IEC 27035**: Clasificación SGSI con 7 categorías y subcategorías
  - **MITRE ATT&CK**: 11 tácticas con técnicas específicas

- **Gestión de evidencias e IoCs**:
  - IPs maliciosas, hashes de archivos (MD5/SHA1/SHA256)
  - Dominios sospechosos, artefactos técnicos (URLs, procesos, rutas)
  - Línea de tiempo de acciones: Contención, Análisis, Remediación, Lecciones Aprendidas

- **Panel de control**:
  - 4 tarjetas de estadísticas (Total, Abiertas, En Investigación, Críticas)
  - Tabla responsive con 8 columnas
  - Filtros avanzados: Estado, Criticidad, Tipo, Búsqueda global
  - Modal de formulario con acordeón para fácil navegación

- **Persistencia**: localStorage con clave `aegisIncidents` (preparado para backend)

### 🎯 Interfaz Moderna
- **Diseño limpio y responsivo**: Optimizado para desktop, tablet y móvil
- **Tema oscuro/claro**: Toggle para cambiar entre temas
- **Barra lateral colapsable**: Mejor aprovechamiento del espacio
- **Panel lateral dinámico**: Para historial y favoritos

### 🔍 Funcionalidades OSINT
- **Detección automática de tipos de búsqueda**:
  - Direcciones IP
  - Dominios y URLs
  - Hashes (MD5, SHA1, SHA256)
  - Direcciones de email
  - Búsquedas generales

- **Persistencia de búsqueda inteligente**:
  - Auto-uso del último término buscado al cambiar entre pestañas
  - Sin necesidad de reingresar la búsqueda en cada herramienta
  - Workflow optimizado para investigaciones multi-herramienta

- **78 herramientas OSINT integradas**:
  - VirusTotal
  - Shodan
  - URLScan
  - Hybrid Analysis
  - DNS Checker
  - Live IP Map
  - Y muchas más...

### 🚨 Accesos Rápidos
- **Botón Downdetector**: Acceso directo en navbar para verificar caídas de sitios web
- **Tooltips informativos**: Descripciones completas en español e inglés
- **Accesos directos**: Funciones frecuentes disponibles con un clic

### 💾 Gestión de Datos
- **Historial de búsquedas**: Almacenado localmente
- **Favoritos personalizados**: Marca tus herramientas favoritas
- **Sincronización con localStorage**: Tus datos se guardan automáticamente
- **Estadísticas en tiempo real**: Seguimiento de búsquedas realizadas
- **Herramientas personalizadas**: Agrega tus propias herramientas OSINT al dashboard

### 🌐 Herramientas Organizadas por Categoría (13 Categorías)
- **Seguridad Web** (15 herramientas) - Análisis y monitoreo de sitios
- **Herramientas de Búsqueda** (12 herramientas) - Motores OSINT generales
- **Información de IP** (9 herramientas) - Geolocalización y análisis de IPs
- **Análisis de Malware** (8 herramientas) - Sandboxes y análisis de amenazas
- **Inteligencia de Amenazas** (8 herramientas) - IOCs y threat intelligence
- **Herramientas DNS** (7 herramientas) - Análisis y propagación DNS
- **Certificados SSL** (3 herramientas) - Transparencia y análisis SSL/TLS
- **Búsqueda de Código** (3 herramientas) - Repositorios y exploits
- **Correo Electrónico** (3 herramientas) - Verificación y análisis de emails
- **Búsqueda de Hash** (3 herramientas) - Reversión de hashes
- **Búsqueda de Personas** (3 herramientas) - OSINT de usuarios y redes sociales
- **Fuentes de Malware** (2 herramientas) - Feeds y bases de datos
- **Mapas de Amenazas** (2 herramientas) - Visualización en tiempo real

### 🌎 Sistema de Traducción Completo (v1.7.1)
- **Soporte multiidioma**: Español (ES) e Inglés (EN)
- **100+ claves de traducción**: Todas las interfaces completamente traducidas
- **Traducción dinámica**: Contenido generado dinámicamente (tablas, badges)
- **Bloques de código traducibles**: Incluso snippets de instalación
- **Toggle de idioma**: Cambio instantáneo en todas las páginas
- **Persistencia**: Preferencia guardada en localStorage
- **Archivos traducidos**:
  - ✅ `index.html` - Dashboard (navbar, footer, tooltips)
  - ✅ `quickstart.html` - Guía completa (hero, pasos, FAQ, casos de uso)
  - ✅ `admin.html` - Panel admin (tabla, roles, estadísticas)
  - ✅ `login.html` - Autenticación (formularios, placeholders)

### 🎨 Experiencia de Usuario Mejorada
- Búsqueda rápida con sugerencias por tipo
- **Persistencia de búsqueda**: No reingresar términos al cambiar entre pestañas
- Filtrado en tiempo real de herramientas
- Interfaz intuitiva y accesible
- Animaciones suaves
- Soporte multiidioma (ES/EN)
- **Tooltips informativos**: Descripciones completas al pasar el cursor sobre cada herramienta
- **Tooltips bilingües**: Cambian automáticamente entre español e inglés
- **Workflow optimizado**: Buscar una vez, usar en múltiples herramientas

## 🚀 Inicio Rápido

## 🚀 Inicio Rápido

### Acceso a la Plataforma Web
Aegis Board está alojado globalmente y puedes acceder directamente sin instalaciones previas:

1. Ingresa a **[aegisboard.dev](https://aegisboard.dev)** desde tu navegador (Chrome, Firefox, Safari, Edge).
2. Lee la guía **Quickstart** para familiarizarte con el panel.
3. Regístrate en la plataforma y accede a tu propio Dashboard OSINT.

### Requisitos Mínimos
- Conexión a internet estable.
- Navegador actualizado con soporte para LocalStorage.

### 📄 Archivos Principales

El proyecto incluye cuatro interfaces principales interconectadas:

#### 🔐 `login.html` - Página de Autenticación (NUEVO en v1.7.0)
**Cuándo usar**: Primera página para acceder al dashboard
- Login con email/password
- Registro de nuevos usuarios
- OAuth con Google/GitHub funcional
- Recuperación de contraseña
- "Recordarme" para sesión persistente
- **Traducción**: Soporte completo ES/EN con toggle de idioma
- **Acceso**: Punto de entrada obligatorio al dashboard
- **Acceso**: Punto de entrada obligatorio al dashboard. Regístrate o usa OAuth.

#### 🏠 `index.html` - Dashboard Principal
**Cuándo usar**: Para trabajo diario de investigación OSINT (requiere autenticación)
- Interfaz completa con todas las 78 herramientas OSINT
- Panel de búsqueda inteligente con detección automática
- Gestión de favoritos y historial
- Filtrado avanzado por categorías
- Estadísticas en tiempo real
- Menú de usuario con logout
- **Traducción**: Soporte completo ES/EN (navbar, tooltips, footer)
- **Acceso**: Requiere login previo

#### 👥 `admin.html` - Panel de Administración (NUEVO en v1.7.0)
**Cuándo usar**: Gestión de usuarios (solo administradores)
- CRUD completo de usuarios
- Estadísticas de usuarios (total, admins, activos, nuevos)
- Cambio de roles (user ↔ admin)
- Visualización de último acceso
- **Traducción**: Soporte completo ES/EN (tabla dinámica, badges de roles)
- **Acceso**: Solo usuarios con rol "admin"

#### 🛡️ `incidents.html` - Gestión de Incidencias de Ciberseguridad (v2.0.0)
**Cuándo usar**: Registrar, clasificar y gestionar incidentes de seguridad
- Registro estructurado de incidentes en 7 secciones (Básica, Detección, Clasificación Técnica, SGSI, Asignación, Evidencias, Timeline)
- Clasificación automática según NIST 800-61, ISO/IEC 27035 y MITRE ATT&CK
- Generación automática de códigos únicos por incidente
- Cálculo de prioridad mediante matriz SGSI (Impacto x Urgencia)
- Panel de estadísticas en tiempo real (Total, Abiertas, Críticas)
- Filtros avanzados: Estado, Criticidad, Tipo, Búsqueda
- Gestión de IoCs (IPs, hashes, dominios, artefactos)
- Línea de tiempo de acciones: Contención, Análisis, Remediación
- 100+ claves de traducción ES/EN para módulo de incidencias
- Acceso desde panel admin (solo administradores)
- **Traducción**: Soporte completo ES/EN
- **Acceso**: Solo usuarios con rol "admin"

#### 🚀 `quickstart.html` - Guía Interactiva (v1.7.1)
**Cuándo usar**: Primera vez usando la herramienta o necesitas referencia rápida
- Tutorial paso a paso con ejemplos prácticos
- Casos de uso comunes
- Explicación de todas las funcionalidades
- Demostraciones visuales
- Tips y mejores prácticas
- **Traducción**: Soporte completo ES/EN (100+ claves, incluyendo bloques de código)
- **Acceso**: Pública, no requiere autenticación

> **💡 Tip**: Comienza con `quickstart.html` para familiarizarte → `login.html` para acceder → `index.html` para trabajar → `admin.html` (si eres admin) para gestionar usuarios.

### 👥 Panel de Administración

#### Acceso al Panel Admin
1. Inicia sesión con cuenta de administrador
2. Click en tu nombre en el navbar
3. Selecciona "Panel Admin"

#### Funcionalidades Administrativas
- **Crear usuarios**: Añadir manualmente nuevos usuarios
- **Editar usuarios**: Modificar nombre, email, rol
- **Eliminar usuarios**: Remover cuentas (excepto la propia)
- **Cambiar roles**: Promover usuarios a admin o degradar a user
- **Ver estadísticas**:
  - Total de usuarios registrados
  - Cantidad de administradores
  - Usuarios que han iniciado sesión
  - Nuevos usuarios (últimos 7 días)

📖 **Guía completa de administración**: [AUTH_GUIDE.md](AUTH_GUIDE.md)

## 📖 Guía de Uso

### Primera Vez - Autenticación
1. Abre `login.html` en tu navegador.
2. Haz clic en el botón de **Google** o **GitHub** para acceso instantáneo (Recomendado).
3. O crea una cuenta nueva en la pestaña **"Registrarse"** para tener tu propio acceso personal.
4. Serás redirigido automáticamente al dashboard.

### Búsqueda Básica
1. Ingresa tu término de búsqueda en la barra de búsqueda
2. La herramienta detectará automáticamente el tipo (IP, dominio, hash, email)
3. Se mostrarán las herramientas relevantes en la pestaña "Resultados"
4. Haz clic en "Ir" para acceder a cada herramienta con tu búsqueda
5. **Nuevo**: Cambia entre pestañas (Herramientas, Favoritos) - el término se mantiene
6. Selecciona cualquier herramienta y se abrirá automáticamente con tu búsqueda anterior

### Gestionar Favoritos
- Haz clic en el botón de estrella para agregar/quitar favoritos
- Accede rápidamente desde el panel lateral
- Los favoritos se guardan automáticamente

### Ver Historial
- Haz clic en el botón de historial en la navbar
- Ve el historial de todas tus búsquedas
- Haz clic en una búsqueda anterior para repetirla

### Personalizar la Interfaz
- **Cambiar tema**: Haz clic en el botón luna/sol
- **Cambiar idioma**: Haz clic en el botón de idioma (ES/EN)
- **Colapsar sidebar**: Haz clic en el botón X del sidebar

### Agregar Herramientas Personalizadas
1. Haz clic en el botón "Agregar Herramienta" en el sidebar
2. Completa el formulario con la información de tu herramienta:
   - **Nombre**: Nombre descriptivo de la herramienta
   - **ID único**: Identificador sin espacios (ej: mi-herramienta)
   - **URL**: Dirección web de la herramienta
   - **Descripción**: Breve explicación de qué hace
   - **Categoría**: Selecciona la categoría apropiada
   - **Template** (opcional): Usa `{{query}}` para búsquedas dinámicas
3. Haz clic en "Guardar Herramienta"
4. Tu herramienta aparecerá en la categoría seleccionada

> **💡 Nota**: Las herramientas personalizadas se guardan en localStorage y solo estarán disponibles en este navegador.

## 🎓 Flujo de Trabajo Recomendado

### Para Nuevos Usuarios

1. **📖 Empieza con la Guía Rápida**
   - Abre `quickstart.html` en tu navegador
   - Revisa la sección "Primeros Pasos"
   - Prueba los ejemplos interactivos
   - Familiarízate con las categorías de herramientas

2. **🔍 Prueba el Dashboard Principal**
   - Abre `index.html` 
   - Realiza tu primera búsqueda de prueba
   - Explora las diferentes categorías
   - Marca algunas herramientas como favoritas

3. **⚡ Optimiza tu Espacio de Trabajo**
   - Configura tu tema preferido (oscuro/claro)
   - Selecciona tu idioma (ES/EN)
   - Organiza tus herramientas favoritas
   - Revisa el historial para entender el seguimiento

### Para Usuarios Experimentados

1. **🚀 Acceso Directo al Dashboard**
   - Abre directamente `index.html`
   - Usa atajos de teclado para búsquedas rápidas
   - Filtra herramientas por categoría
   - Consulta el historial para investigaciones recurrentes

2. **📚 Consulta Rápida**
   - Usa `quickstart.html` como referencia
   - Busca casos de uso específicos
   - Revisa las mejores prácticas
   - Descubre nuevas herramientas

3. **🔧 Personalización Avanzada**
   - Consulta `technical_docs.md` para detalles técnicos
   - Modifica `js/tools-config.js` para agregar herramientas personalizadas
   - Revisa `changelog.md` para nuevas características
  - Gestiona incidencias avanzadas en `incidents.html` (clasificación, timeline, IoCs)
  - Administra usuarios y roles desde `admin.html` (estadísticas, permisos, auditoría)

## 📁 Estructura de Archivos

```
aegisboard/
├── index.html             # 🏠 Dashboard principal - Tu herramienta de trabajo diaria
├── quickstart.html        # 🚀 Guía interactiva - Tutorial completo y casos de uso
├── admin.html             # 👥 Panel de administración de usuarios
├── incidents.html         # 🛡️ Gestión de incidencias de ciberseguridad
├── login.html             # 🔐 Página de autenticación de usuarios
├── README.md              # Este archivo - Documentación del proyecto
├── src/                   # 📁 Archivos de origen (Modernizados)
│   ├── css/               # Estilos CSS modulares y utilidades
│   ├── img/               # 📁 Imágenes estáticas
│   │   └── logos/         # Logos de branding (Aegisboard-P, -N, -B)
│   └── js/                # Módulos JavaScript (ES6)
│       ├── app.js            # Lógica principal y punto de entrada
│       ├── auth.js           # Módulo de autenticación y sesiones
│       ├── incidents.js      # Gestión de incidentes
│       ├── taxonomy-cs.js    # Taxonomía técnica
│       ├── tools-config.js   # Configuración de herramientas
│       ├── translations.js   # Internacionalización (ES/EN)
│       └── usage_examples.js # Ejemplos de uso
└── plugins/               # Extensiones del navegador y configs experimentales
```

### 📝 Descripción de Archivos Clave

| Archivo | Propósito | Cuándo Usar |
|---------|-----------|-------------|
| `index.html` | Dashboard principal con todas las funcionalidades | Uso diario, investigaciones OSINT |
| `quickstart.html` | Guía interactiva y tutorial | Primera vez, aprendizaje, referencia |
| `admin.html` | Panel de administración de usuarios | Gestión de usuarios, roles y estadísticas |
| `incidents.html` | Gestión de incidencias de ciberseguridad | Registrar, clasificar y gestionar incidentes |
| `style.css` | Estilos y temas (oscuro/claro) | Personalización visual |
| `js/app.js` | Lógica de búsqueda y gestión de datos | Desarrollo y mantenimiento |
| `js/tools-config.js` | Base de datos de herramientas OSINT | Agregar/modificar herramientas |
| `js/translations.js` | Textos en español e inglés | Agregar nuevos idiomas |

## 🛠️ Tecnologías Utilizadas

- **Vite**: Entorno de desarrollo ultrarrápido y bundler.
- **HTML5 & CSS3**: Estructura semántica y diseño moderno (Glassmorphism, CSS Variables).
- **JavaScript Vanilla (ES6)**: Módulos puros sin dependencias pesadas (React/Angular/Vue).
- **Bootstrap 5**: (CDN) para sistema de grillas, componentes ui y modales.
- **LocalStorage API**: Persistencia de datos client-side sin backend.
- **Git/GitHub Actions**: CI/CD para el despliegue automático en dominio principal.

## 🎨 Paleta de Colores

- **Principal**: `#3b82f6` (Azul)
- **Éxito**: `#10b981` (Verde)
- **Advertencia**: `#f59e0b` (Ámbar)
- **Peligro**: `#ef4444` (Rojo)
- **Info**: `#0ea5e9` (Cian)

## 📱 Responsividad

La herramienta se adapta perfectamente a:
- 📱 Móviles (< 480px)
- 📱 Tablets (480px - 768px)
- 💻 Laptops (768px - 1024px)
- 🖥️ Desktops (> 1024px)

## 🔐 Privacidad y Seguridad

- **Totalmente local**: Todos los datos se guardan en tu navegador
- **Sin servidor**: No se envían datos a servidores externos
- **Herramientas externas**: Los enlaces abren en ventanas nuevas
- **Código abierto**: Revisa el código fuente cuando lo necesites

## 🤝 Contribuciones

Las contribuciones son bienvenidas y apreciadas. Para contribuir al proyecto:

1. Lee nuestra [Guía de Contribución](CONTRIBUTING.md)
2. Revisa el [Código de Conducta](CODE_OF_CONDUCT.md)
3. Consulta los [Issues abiertos](../../issues)
4. Fork el proyecto
5. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
6. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
7. Push a la rama (`git push origin feature/AmazingFeature`)
8. Abre un Pull Request

### 🌟 Tipos de Contribuciones Bienvenidas

- 🐛 Reportar bugs
- 💡 Sugerir nuevas funcionalidades
- 🔧 Agregar nuevas herramientas OSINT
- 📝 Mejorar la documentación
- 🌐 Agregar traducciones
- 🎨 Mejorar el diseño UI/UX
- ⚡ Optimización de rendimiento

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para más detalles.

## 📝 Notas de Desarrollo

### Agregar Nuevas Herramientas

Edita `tools-config.js` y agrega un nuevo objeto:

```javascript
{
  id: "unique-id",
  name: "Nombre de la Herramienta",
  url: "https://www.example.com/search?q=",
  category: "CATEGORY_NAME",
  description: "Descripción breve de la herramienta"
}
```

O con template:

```javascript
{
  id: "unique-id",
  name: "Nombre de la Herramienta",
  template: "https://www.example.com/search?q={{query}}",
  category: "CATEGORY_NAME",
  description: "Descripción breve"
}
```

### Agregar Nuevas Categorías

1. Edita `tools-config.js` para agregar herramientas con la nueva categoría
2. Edita `translations.js` para traducir el nombre de la categoría
3. La interfaz se actualizará automáticamente

### Cambiar Colores

Edita las variables CSS en `style.css`:

```css
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  /* ... más variables ... */
}
```

## 🐛 Solución de Problemas

### Las herramientas no cargan
- Asegúrate de tener conexión a internet
- Verifica que los URLs en `tools-config.js` sean correctos
- Abre la consola (F12) para ver mensajes de error

### Los favoritos no se guardan
- Verifica que localStorage esté habilitado en tu navegador
- Prueba con otro navegador
- Limpia el caché del navegador

### Problemas de idioma
- Recarga la página después de cambiar idioma
- Verifica que `translations.js` esté cargado correctamente

## 📞 Soporte y Contacto

### 💬 Obtener Ayuda

- 📖 [Documentación](README.md)
- 🚀 [Guía Rápida](quickstart.html)
- 📋 [Issues](../../issues) - Para reportar bugs o solicitar features
- 💡 [Discussions](../../discussions) - Para preguntas y discusiones generales

### 🔒 Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, consulta nuestra [Política de Seguridad](SECURITY.md).

### 📧 Contacto

- GitHub: [@s3codecL](https://github.com/s3codecL)
- Issues: [Reportar un problema](../../issues/new)

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

Copyright (c) 2025 s3codecL - Todos los derechos reservados bajo los términos de la licencia MIT.

## 🙏 Agradecimientos

- Desarrolladores de [Tabler UI](https://tabler.io/)
- Comunidad OSINT global
- Todos los [contribuidores](../../graphs/contributors) que hacen posible este proyecto
- Proveedores de herramientas OSINT integradas

## 📊 Estadísticas del Proyecto

![GitHub repo size](https://img.shields.io/github/repo-size/s3codecL/aegisboard)
![GitHub contributors](https://img.shields.io/github/contributors/s3codecL/aegisboard)
![GitHub last commit](https://img.shields.io/github/last-commit/s3codecL/aegisboard)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/s3codecL/aegisboard)

## 🗺️ Roadmap


🗺️ Roadmap
✅ Completado

## [2.1.0-beta.1] - Próximamente (Release Final RC)
- [x] **Dominio Establecido (`aegisboard.dev`)**: Distribución nativa mediante entorno escalable.
- [x] **Branding Oficial**: Inclusión de logotipo profesional en la documentación y web app.
- [x] **Traducciones Masivas y Persistencia**: Errores corregidos en el manejo de persistencia e inconsistencias modulares.

## [2.0.0] - Mayor Release (Marzo 2026)

### 🛡️ OAuth & Security Major Release
- [x] **Autenticación OAuth 2.0**: Integración segura con Google y GitHub (flujo implícito).
- [x] **Manifest V3**: Extensión de navegador migrada a MV3 con nueva UI Glassmorphism.
- [x] **Limpieza de Seguridad**: Eliminación de credenciales hardcoded y secretos (vulnerability scrub).
- [x] **Estandarización**: Repositorio renombrado a `aegisboard` con documentación estandarizada.

### 🛡️ Sistema de Gestión de Incidencias (v2.0.0)
- [x] Registro y clasificación automática de incidentes (NIST, ISO, MITRE).
- [x] Panel de estadísticas en tiempo real y gestión de IoCs.
- [x] Unificación de Temas (v1.8.0 Stable) y estandarización global.

v1.7.2 (2025-12-10)
🔒 Protección reCAPTCHA v2
 - [x] Integración en login y registro
 - [x] Validación y mensajes traducibles
 - [x] Traducción dinámica del widget
 - [x] Diseño responsive y seguro

v1.7.1 (2025-12-10)
🌎 Sistema de Traducciones Completo
 - [x] Traducción total en quickstart, admin, index
 - [x] 100+ claves nuevas ES/EN
 - [x] Mejoras visuales y de usabilidad

v1.7.0 (2025-12-10)
🔐 Sistema de Autenticación Completo
 - [x] Login y registro de usuarios
 - [x] Panel de administración y roles
 - [x] Seguridad y validaciones

Versiones anteriores
 - [x] Herramientas OSINT personalizadas
 - [x] Soporte dark/light mode
 - [x] Interfaz multiidioma inicial
 - [x] Tooltips bilingües y verificación de sitios

🚧 En Desarrollo
 - [ ] **Base de datos PostgreSQL**: Integración con Supabase para persistencia centralizada.
 - [ ] Validación backend de reCAPTCHA - Verificación server-side con Google API.
 - [ ] Integración con APIs de herramientas OSINT - Consultas automatizadas.
 - [ ] Exportación de resultados - PDF, JSON, CSV con plantillas.
 - [ ] Plantillas de investigación - Workflows predefinidos personalizables.

📋 Planificado (v2.1.0+)
 - [ ] Modo de trabajo colaborativo - Compartir investigaciones en equipo.
 - [ ] Modo offline con cache (PWA) - Funcionalidad sin conexión.
 - [ ] Análisis de grafos de relaciones - Visualización de conexiones.
 - [ ] Más idiomas - FR, DE, PT, IT, RU.

Ver [issues](../../issues) para el roadmap completo.

---

**Hecho con ❤️ para la comunidad de seguridad**

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-s3codecL-181717?style=for-the-badge&logo=github)](https://github.com/s3codecL)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**⭐ Si te resulta útil, dale una estrella al proyecto ⭐**

</div>
