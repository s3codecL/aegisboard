# Security Policy

> ⚠️ **Nunca publiques ni compartas claves privadas, tokens o secretos (como los de Google reCAPTCHA) en la documentación, ejemplos, capturas ni foros públicos.**

## 🔒 Supported Versions

Actualmente estamos dando soporte de seguridad a las siguientes versiones:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## 🛡️ Reporting a Vulnerability

La seguridad de Aegis Dashboard es una prioridad. Si descubres una vulnerabilidad de seguridad, por favor ayúdanos a proteger a nuestros usuarios siguiendo estos pasos:

### ⚠️ NO hacer

- **NO** abras un issue público sobre la vulnerabilidad
- **NO** publiques la vulnerabilidad en redes sociales
- **NO** explotes la vulnerabilidad

### ✅ SÍ hacer

1. **Reporta privadamente** la vulnerabilidad:
   - Envía un email a: [security@aegis-dashboard.com] (o crea un issue de tipo Security Advisory en GitHub)
   - Incluye una descripción detallada del problema
   - Proporciona pasos para reproducir la vulnerabilidad
   - Si es posible, sugiere una solución

2. **Información a incluir**:
   ```
   - Tipo de vulnerabilidad (XSS, CSRF, injection, etc.)
   - Ubicación del código vulnerable (archivo y línea si es posible)
   - Impacto potencial
   - Pasos para reproducir
   - Versión afectada
   - Screenshots o videos si aplica
   ```

3. **Espera nuestra respuesta**:
   - Recibirás confirmación en **48 horas**
   - Te mantendremos informado del progreso
   - Te daremos crédito en el fix (si lo deseas)

## 🔍 Scope de Seguridad

### En el alcance

Vulnerabilidades relacionadas con:
- Cross-Site Scripting (XSS)
- Inyección de código
- Exposición de datos sensibles en localStorage
- Problemas de autenticación/autorización (si aplica)
- Vulnerabilidades en dependencias externas

### Fuera del alcance

- Problemas de las herramientas OSINT externas (no controlamos sus sitios)
- Problemas de rendimiento que no sean de seguridad
- Bugs de UI/UX sin implicaciones de seguridad
- Ingeniería social

## 🏆 Hall of Fame

Reconocemos a los investigadores de seguridad que nos ayudan:

<!-- Formato:
- [Nombre/Usuario] - [Tipo de vulnerabilidad] - [Fecha]
-->

*Aún no hay reportes. ¡Sé el primero!*

## 🔐 Mejores Prácticas para Usuarios

1. **Mantén tu navegador actualizado**
2. **No compartas tu historial de búsquedas** si contiene información sensible
3. **Limpia localStorage regularmente** si usas computadoras compartidas
4. **Verifica las URLs** de las herramientas OSINT antes de usarlas
5. **No confíes automáticamente** en los resultados de las herramientas

## 📅 Proceso de Actualización

Cuando se reporta y confirma una vulnerabilidad:

1. **Día 0**: Confirmación de recepción
2. **Día 1-7**: Investigación y desarrollo del fix
3. **Día 7-14**: Testing del fix
4. **Día 14**: Release del patch
5. **Día 30**: Divulgación pública (si es apropiado)

## 🔄 Actualizaciones de Seguridad

Las actualizaciones de seguridad se publican en:
- GitHub Releases
- `CHANGELOG.md`
- README.md (para vulnerabilidades críticas)

## 📚 Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE - Common Weakness Enumeration](https://cwe.mitre.org/)
- [GitHub Security Advisories](https://github.com/s3codecL/aegisboard/security/advisories)

## 💬 Contacto

Para reportes de seguridad:
- Email: [TU_EMAIL_DE_SEGURIDAD]
- GitHub Security Advisory: [Link al formulario]

Para otras consultas:
- Issues regulares: [GitHub Issues](../../issues)
- Contribuciones: Ver [CONTRIBUTING.md](CONTRIBUTING.md)

---

**Gracias por ayudar a mantener seguro a Aegis Board** 🛡️
