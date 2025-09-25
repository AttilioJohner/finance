// Sistema de Login
// Constantes locais (temporário até implementar módulos)
const STORAGE_KEYS = {
    USER_SESSION: 'financial_user_session',
    THEME: 'financial_theme'
};

// Funções utilitárias locais
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.checkExistingSession();
    }

    setupEventListeners() {
        // Form submission
        const loginForm = document.getElementById('loginForm');
        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));

        // Password visibility toggle
        const togglePassword = document.getElementById('togglePassword');
        togglePassword?.addEventListener('click', () => this.togglePasswordVisibility());

        // Demo login
        const demoLogin = document.getElementById('demoLogin');
        demoLogin?.addEventListener('click', () => this.fillDemoData());

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        themeToggle?.addEventListener('click', () => this.toggleTheme());

        // Navigation links
        const registerLink = document.getElementById('registerLink');
        registerLink?.addEventListener('click', (e) => this.handleRegisterClick(e));

        const forgotPassword = document.getElementById('forgotPassword');
        forgotPassword?.addEventListener('click', (e) => this.handleForgotPassword(e));
    }

    async handleLogin(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');
        const rememberMe = formData.get('remember-me');

        // Validate inputs
        if (!this.validateInputs(email, password)) {
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Check credentials
            if (this.authenticateUser(email, password)) {
                const session = {
                    id: generateId(),
                    email: email,
                    loginTime: new Date().toISOString(),
                    rememberMe: !!rememberMe
                };

                // Save session
                localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));

                this.showSuccess('Login realizado com sucesso!');

                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'pages/dashboard.html';
                }, 1500);
            } else {
                this.showError('Email ou senha incorretos');
            }
        } catch (error) {
            this.showError('Erro ao fazer login. Tente novamente.');
            console.error('Login error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    validateInputs(email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearErrors();

        // Validate email
        if (!email || !validateEmail(email)) {
            this.showFieldError('email', 'Email inválido');
            isValid = false;
        }

        // Validate password
        if (!password || !validatePassword(password)) {
            this.showFieldError('password', 'Senha deve ter pelo menos 6 caracteres');
            isValid = false;
        }

        return isValid;
    }

    authenticateUser(email, password) {
        // Demo user
        if (email === 'demo@financeiro.com' && password === '123456') {
            return true;
        }

        // Check if user exists in localStorage (for registered users)
        const users = JSON.parse(localStorage.getItem('financial_users') || '[]');
        return users.some(user => user.email === email && user.password === password);
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
            `;
        } else {
            passwordInput.type = 'password';
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            `;
        }
    }

    fillDemoData() {
        document.getElementById('email').value = 'demo@financeiro.com';
        document.getElementById('password').value = '123456';

        // Add a subtle animation
        const form = document.getElementById('loginForm');
        form.classList.add('animate-pulse');
        setTimeout(() => form.classList.remove('animate-pulse'), 500);
    }

    setupTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
        }

        this.updateThemeIcon();
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        const isDark = document.documentElement.classList.contains('dark');

        if (isDark) {
            themeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            `;
        } else {
            themeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            `;
        }
    }

    checkExistingSession() {
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SESSION) || 'null');

        if (session && session.rememberMe) {
            // Auto redirect if valid session
            window.location.href = 'pages/dashboard.html';
        }
    }

    handleRegisterClick(event) {
        event.preventDefault();
        // Future: Navigate to register page
        this.showInfo('Funcionalidade de cadastro será implementada em breve!');
    }

    handleForgotPassword(event) {
        event.preventDefault();
        // Future: Navigate to password recovery
        this.showInfo('Funcionalidade de recuperação de senha será implementada em breve!');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.toggle('hidden', !show);
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type) {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const colors = {
            error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400',
            success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400',
            info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
        };

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-3 border rounded-lg ${colors[type]} animate-slide-up z-50`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        field.classList.add('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');

        // Remove existing error message
        const existingError = field.parentNode.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-red-500 text-sm mt-1';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearErrors() {
        // Clear field errors
        document.querySelectorAll('.border-red-500').forEach(field => {
            field.classList.remove('border-red-500', 'focus:border-red-500', 'focus:ring-red-500');
        });

        // Remove error messages
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
});