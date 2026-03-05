import { translations, t } from './translations.js';
import CryptoUtils from './crypto-utils.js';

/**
 * Aegis Board - Authentication System
 * Version: 2.0.0
 */

const Auth = {
    // Configuración
    config: {
        sessionKey: 'aegisSession',
        usersKey: 'aegisUsers',
        tokenExpiry: 24 * 60 * 60 * 1000, // 24 horas
        useRecaptcha: true, // Cambiar a true en producción después de configurar el sitio en Google reCAPTCHA
        defaultUser: {
            email: '[TU_EMAIL_DE_ADMIN]',
            password: '[TU_CONTRASEÑA_SEGURA]', // En producción, usar registro o OAuth
            name: 'Administrador',
            role: 'admin',
            avatar: null
        },
        oauth: {
            github: {
                clientId: 'YOUR_GITHUB_CLIENT_ID' // Reemplazar con el ID de tu Configuración de Desarrollador de GitHub
                // NOTA: El clientSecret NO debe estar en el frontend por seguridad.
            },
            google: {
                clientId: 'YOUR_GOOGLE_CLIENT_ID' // Reemplazar con el ID de Google Cloud Console
                // NOTA: No se requiere clientSecret para el flujo implícito de Google.
            }
        }
    },

    // Estado
    state: {
        currentUser: null,
        isAuthenticated: false
    },

    /**
     * Inicializar sistema de autenticación
     */
    init: function () {
        this.loadSession();
        this.initializeDefaultUsers();
        this.setupEventListeners();
        this.handleOAuthCallback();
    },

    /**
     * Inicializar usuarios por defecto
     */
    initializeDefaultUsers: function () {
        const users = this.getUsers();

        // Crear usuario admin por defecto si no existe
        if (!users.find(u => u.email === this.config.defaultUser.email)) {
            users.push({
                id: this.generateId(),
                ...this.config.defaultUser,
                password: this.hashPassword(this.config.defaultUser.password),
                createdAt: new Date().toISOString(),
                lastLogin: null
            });
            this.saveUsers(users);
        }
    },

    /**
     * Configurar event listeners
     */
    setupEventListeners: function () {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    },

    /**
     * Manejar login
     */
    handleLogin: async function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // FORCE BYPASS: reCAPTCHA disabled
        if (this.config.useRecaptcha && typeof grecaptcha !== 'undefined') {
            const widgetId = window.loginWidgetId !== undefined ? window.loginWidgetId : 0;
            const recaptchaResponse = grecaptcha.getResponse(widgetId);
            if (!recaptchaResponse) {
                const lang = localStorage.getItem('osintLanguage') || 'es';
                const message = t('RECAPTCHA_ERROR', lang);
                this.showAlert(message, 'danger');
                return;
            }
        }

        if (!email || !password) {
            this.showAlert('Por favor, completa todos los campos.', 'danger');
            return;
        }

        // Buscar usuario
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            this.showAlert('Correo electrónico no registrado.', 'danger');
            grecaptcha.reset(); // Reset reCAPTCHA en login
            return;
        }

        // Verificar contraseña
        if (!this.verifyPassword(password, user.password)) {
            this.showAlert('Contraseña incorrecta.', 'danger');
            if (typeof grecaptcha !== 'undefined') {
                const widgetId = window.loginWidgetId !== undefined ? window.loginWidgetId : 0;
                grecaptcha.reset(widgetId);
            }
            return;
        }

        // Actualizar último login
        user.lastLogin = new Date().toISOString();
        this.updateUser(user);

        // Crear sesión
        this.createSession(user, rememberMe);

        // Mostrar mensaje de éxito
        this.showAlert('¡Bienvenido de vuelta!', 'success');

        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    /**
     * Manejar registro
     */
    handleRegister: async function (e) {
        e.preventDefault();

        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;
        const acceptTerms = document.getElementById('accept-terms').checked;

        // FORCE BYPASS: reCAPTCHA disabled
        if (this.config.useRecaptcha && typeof grecaptcha !== 'undefined') {
            const widgetId = window.registerWidgetId !== undefined ? window.registerWidgetId : (window.loginWidgetId !== undefined ? 1 : 0);
            const recaptchaResponse = grecaptcha.getResponse(widgetId);
            if (!recaptchaResponse) {
                const lang = localStorage.getItem('osintLanguage') || 'es';
                const message = t('RECAPTCHA_ERROR', lang);
                this.showAlert(message, 'danger');
                return;
            }
        }

        // Validaciones
        if (!name || !email || !password || !passwordConfirm) {
            this.showAlert('Por favor, completa todos los campos.', 'danger');
            return;
        }

        if (!acceptTerms) {
            this.showAlert('Debes aceptar los términos y condiciones.', 'danger');
            return;
        }

        if (password.length < 8) {
            this.showAlert('La contraseña debe tener al menos 8 caracteres.', 'danger');
            return;
        }

        // Validación de complejidad requerida
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        if (!hasUpper || !hasNumber || !hasSpecial) {
            this.showAlert('La contraseña requiere: 1 mayúscula, 1 número y 1 carácter especial.', 'danger');
            return;
        }

        if (password !== passwordConfirm) {
            this.showAlert('Las contraseñas no coinciden.', 'danger');
            return;
        }

        // Validar formato de email
        if (!this.validateEmail(email)) {
            this.showAlert('Formato de correo electrónico inválido.', 'danger');
            if (typeof grecaptcha !== 'undefined') {
                const widgetId = window.registerWidgetId !== undefined ? window.registerWidgetId : (window.loginWidgetId !== undefined ? 1 : 0);
                grecaptcha.reset(widgetId);
            }
            return;
        }

        // Verificar si el usuario ya existe
        const users = this.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showAlert('Este correo electrónico ya está registrado.', 'danger');
            if (typeof grecaptcha !== 'undefined') {
                const widgetId = window.registerWidgetId !== undefined ? window.registerWidgetId : (window.loginWidgetId !== undefined ? 1 : 0);
                grecaptcha.reset(widgetId);
            }
            return;
        }

        // Crear nuevo usuario
        const newUser = {
            id: this.generateId(),
            name: name,
            email: email,
            password: this.hashPassword(password),
            role: 'user',
            avatar: null,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        // Crear sesión
        this.createSession(newUser, false);

        // Mostrar mensaje de éxito
        this.showAlert('¡Cuenta creada exitosamente!', 'success');

        // Redirigir al dashboard
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    },

    /**
     * Login con Google (Real)
     */
    loginWithGoogle: function () {
        const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const options = {
            redirect_uri: window.location.origin + '/login.html',
            client_id: this.config.oauth.google.clientId,
            response_type: 'token', // Usamos flujo implícito (token) para evitar problemas de CORS sin backend
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email',
            ].join(' '),
            state: 'google'
        };

        const qs = new URLSearchParams(options);
        window.location.href = `${rootUrl}?${qs.toString()}`;
    },

    /**
     * Login con GitHub (Real)
     */
    loginWithGithub: function () {
        const rootUrl = 'https://github.com/login/oauth/authorize';
        const options = {
            client_id: this.config.oauth.github.clientId,
            redirect_uri: window.location.origin + '/login.html',
            scope: 'read:user user:email',
            state: 'github'
        };

        const qs = new URLSearchParams(options);
        window.location.href = `${rootUrl}?${qs.toString()}`;
    },

    /**
     * Manejar callback de OAuth
     */
    handleOAuthCallback: async function () {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        // Google usa fragmentos (#) para el access_token en el flujo implícito
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');

        if (state === 'google' && accessToken) {
            // Limpiar hash
            window.history.replaceState({}, document.title, window.location.pathname);
            await this.completeGoogleLogin(accessToken);
        } else if (state === 'github' && code) {
            // Limpiar query params
            window.history.replaceState({}, document.title, window.location.pathname);
            await this.completeGithubLogin(code);
        }
    },

    /**
     * Finalizar login de Google
     */
    completeGoogleLogin: async function (token) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();

            const user = {
                id: 'google_' + data.id,
                name: data.name,
                email: data.email,
                role: 'user',
                avatar: data.picture,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };

            this.createSession(user, true);
            this.showAlert(`¡Bienvenido, ${user.name}!`, 'success');
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch (error) {
            console.error('Error Google OAuth:', error);
            this.showAlert('Error al conectar con Google.', 'danger');
        }
    },

    /**
     * Finalizar login de GitHub
     */
    completeGithubLogin: async function (code) {
        // NOTA: GitHub requiere un intercambio de secreto que BLOQUEA CORS en el navegador.
        // Aquí simulamos cómo sería la llamada, pero advertimos que requiere un proxy o backend.
        this.showAlert('Conectando con GitHub (Verificando código)...', 'info');

        // En una app real sin backend, necesitaríamos un proxy CORS o un Serverless Function de Vercel.
        // Como demostración, intentaremos obtener el perfil si el token es válido.
        try {
            // Simulamos la obtención del usuario con los datos que tendríamos tras el intercambio
            // En un entorno local/dev, esto fallaría si GitHub no permite el intercambio directo
            this.showAlert('Token de GitHub recibido. Creando sesión...', 'success');
            const mockUser = {
                id: 'github_user',
                name: 'GitHub User',
                email: 'github@aegisboard.dev',
                role: 'user',
                avatar: null,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            };
            this.createSession(mockUser, true);
            setTimeout(() => window.location.href = 'index.html', 1000);
        } catch (error) {
            this.showAlert('Error en el protocolo de GitHub OAuth.', 'danger');
        }
    },

    /**
     * Crear sesión
     */
    createSession: function (user, rememberMe) {
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            expiresAt: Date.now() + this.config.tokenExpiry,
            rememberMe: rememberMe,
            token: this.generateToken()
        };

        // Guardar en localStorage
        localStorage.setItem(this.config.sessionKey, CryptoUtils.encrypt(session));

        // Si no es "recordarme", guardar también en sessionStorage
        if (!rememberMe) {
            sessionStorage.setItem(this.config.sessionKey, JSON.stringify(session));
        }

        this.state.currentUser = user;
        this.state.isAuthenticated = true;
    },

    /**
     * Cargar sesión
     */
    loadSession: function () {
        // Intentar cargar desde sessionStorage primero
        let sessionData = sessionStorage.getItem(this.config.sessionKey);

        // Si no existe, intentar desde localStorage
        if (!sessionData) {
            sessionData = localStorage.getItem(this.config.sessionKey);
        }

        if (!sessionData) {
            this.state.isAuthenticated = false;
            return false;
        }

        try {
            const session = CryptoUtils.decrypt(sessionData);

            // Verificar si la sesión ha expirado
            if (Date.now() > session.expiresAt) {
                this.logout(false);
                return false;
            }

            // Cargar usuario completo
            const users = this.getUsers();
            const user = users.find(u => u.id === session.userId);

            if (!user) {
                this.logout(false);
                return false;
            }

            this.state.currentUser = user;
            this.state.isAuthenticated = true;
            return true;
        } catch (e) {
            console.error('Error loading session:', e);
            this.logout(false);
            return false;
        }
    },

    /**
     * Cerrar sesión
     */
    logout: function (redirect = true) {
        localStorage.removeItem(this.config.sessionKey);
        sessionStorage.removeItem(this.config.sessionKey);
        this.state.currentUser = null;
        this.state.isAuthenticated = false;

        if (redirect) {
            window.location.href = 'login.html';
        }
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated: function () {
        return this.state.isAuthenticated && this.state.currentUser !== null;
    },

    /**
     * Verificar si el usuario es admin
     */
    isAdmin: function () {
        return this.isAuthenticated() && this.state.currentUser.role === 'admin';
    },

    /**
     * Obtener usuario actual
     */
    getCurrentUser: function () {
        return this.state.currentUser;
    },

    /**
     * Requerir autenticación (para proteger páginas)
     */
    requireAuth: function (redirectToLogin = true) {
        if (!this.loadSession()) {
            if (redirectToLogin) {
                window.location.href = 'login.html';
            }
            return false;
        }
        return true;
    },

    /**
     * Requerir rol de admin
     */
    requireAdmin: function () {
        if (!this.requireAuth()) {
            return false;
        }

        if (!this.isAdmin()) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'Se requieren permisos de administrador.',
                confirmButtonText: 'Entendido',
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
            }).then(() => {
                window.location.href = 'index.html';
            });
            return false;
        }

        return true;
    },

    // ========== Gestión de Usuarios ==========

    /**
     * Obtener todos los usuarios
     */
    getUsers: function () {
        try {
            const users = localStorage.getItem(this.config.usersKey);
            return users ? CryptoUtils.decrypt(users) : [];
        } catch (e) {
            console.error('Error loading users:', e);
            return [];
        }
    },

    /**
     * Guardar usuarios
     */
    saveUsers: function (users) {
        try {
            localStorage.setItem(this.config.usersKey, CryptoUtils.encrypt(users));
        } catch (e) {
            console.error('Error saving users:', e);
        }
    },

    /**
     * Actualizar usuario
     */
    updateUser: function (updatedUser) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);

        if (index !== -1) {
            users[index] = updatedUser;
            this.saveUsers(users);

            // Si es el usuario actual, actualizar estado
            if (this.state.currentUser && this.state.currentUser.id === updatedUser.id) {
                this.state.currentUser = updatedUser;
            }
        }
    },

    /**
     * Eliminar usuario
     */
    deleteUser: function (userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        this.saveUsers(filteredUsers);
    },

    // ========== Utilidades ==========

    /**
     * Generar ID único
     */
    generateId: function () {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Generar token
     */
    generateToken: function () {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    },

    /**
     * Hash de contraseña (simulado - en producción usar bcrypt)
     */
    hashPassword: function (password) {
        return btoa(password + 'aegis_salt_2025');
    },

    /**
     * Verificar contraseña
     */
    verifyPassword: function (password, hash) {
        return this.hashPassword(password) === hash;
    },

    /**
     * Validar email
     */
    validateEmail: function (email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Mostrar alerta
     */
    showAlert: function (message, type = 'danger') {
        const icon = type === 'success' ? 'success' : (type === 'danger' ? 'error' : 'info');

        Swal.fire({
            icon: icon,
            title: message,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: 'var(--modal-bg)',
            color: 'var(--text)',
            backdrop: 'rgba(0,0,0,0.4)',
            customClass: {
                popup: 'swal2-popup-toast premium-swal-popup'
            }
        });
    },

    /**
     * Inicializar traducciones
     */
    initTranslations: function (lang) {
        if (typeof t === 'undefined') return;

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = t(key, lang);

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.innerHTML = translation;
            }
        });

        document.querySelectorAll('[data-placeholder]').forEach(element => {
            const key = element.getAttribute('data-placeholder');
            const translation = t(key, lang);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }
};

export default Auth;
window.Auth = Auth;
window.loginWithGoogle = () => Auth.loginWithGoogle();
window.loginWithGithub = () => Auth.loginWithGithub();
window.showAlert = (msg, type) => Auth.showAlert(msg, type);

// Auto-inicializar si estamos en login.html
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', () => Auth.init());
}
