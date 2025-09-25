// PWA Service - Gerenciamento de instalação e funcionalidades offline
class PWAService {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.swRegistration = null;
        this.init();
    }

    async init() {
        // Verificar suporte a PWA
        if (!('serviceWorker' in navigator)) {
            console.warn('PWA: Service Worker não suportado');
            return;
        }

        // Registrar Service Worker
        await this.registerServiceWorker();

        // Setup listeners
        this.setupEventListeners();

        // Verificar se já está instalado
        this.checkInstallStatus();

        // Mostrar prompt de instalação se apropriado
        this.setupInstallPrompt();

        console.log('PWA Service initialized successfully');
    }

    async registerServiceWorker() {
        try {
            this.swRegistration = await navigator.serviceWorker.register('/src/sw.js', {
                scope: '/src/'
            });

            console.log('PWA: Service Worker registered successfully');

            // Listener para atualizações
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // Nova versão disponível
                            this.showUpdateNotification();
                        }
                    }
                });
            });

        } catch (error) {
            console.error('PWA: Failed to register service worker:', error);
        }
    }

    setupEventListeners() {
        // Listener para prompt de instalação
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Listener para instalação bem-sucedida
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showNotification('App instalado com sucesso!', 'success');
        });

        // Listeners para status online/offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Conexão restaurada', 'success');
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Modo offline ativado', 'info');
        });

        // Listener para mudanças na instalação
        window.addEventListener('load', () => {
            this.checkInstallStatus();
        });
    }

    showInstallButton() {
        // Criar botão de instalação se não existir
        if (!document.getElementById('pwa-install-btn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'pwa-install-btn';
            installBtn.className = 'fixed bottom-4 right-4 bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center space-x-2 z-50';
            installBtn.innerHTML = `
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <span>Instalar App</span>
            `;

            installBtn.addEventListener('click', () => this.installApp());
            document.body.appendChild(installBtn);

            // Animate in
            setTimeout(() => {
                installBtn.style.transform = 'translateY(0)';
                installBtn.style.opacity = '1';
            }, 100);
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) {
            installBtn.style.transform = 'translateY(100px)';
            installBtn.style.opacity = '0';
            setTimeout(() => installBtn.remove(), 300);
        }
    }

    async installApp() {
        if (!this.deferredPrompt) {
            this.showNotification('Instalação não disponível neste momento', 'error');
            return;
        }

        try {
            // Mostrar prompt de instalação
            this.deferredPrompt.prompt();

            // Aguardar escolha do usuário
            const { outcome } = await this.deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA: User accepted installation');
            } else {
                console.log('PWA: User dismissed installation');
            }

            this.deferredPrompt = null;
            this.hideInstallButton();

        } catch (error) {
            console.error('PWA: Installation failed:', error);
            this.showNotification('Erro na instalação do app', 'error');
        }
    }

    checkInstallStatus() {
        // Verificar se está em modo standalone (instalado)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
            console.log('PWA: App is running in standalone mode');
        }

        // Verificar se está instalado no iOS
        if (window.navigator.standalone === true) {
            this.isInstalled = true;
            console.log('PWA: App is running on iOS standalone');
        }

        // Update UI based on install status
        this.updateInstallUI();
    }

    updateInstallUI() {
        // Adicionar classes CSS baseadas no status
        document.body.classList.toggle('pwa-installed', this.isInstalled);
        document.body.classList.toggle('pwa-online', this.isOnline);
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-4';
        notification.innerHTML = `
            <div>
                <p class="font-medium">Nova versão disponível!</p>
                <p class="text-sm opacity-90">Recarregue para atualizar</p>
            </div>
            <button class="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100" onclick="location.reload()">
                Atualizar
            </button>
            <button class="text-white/80 hover:text-white" onclick="this.parentElement.remove()">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('PWA: Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    async sendNotification(title, options = {}) {
        const hasPermission = await this.requestNotificationPermission();

        if (!hasPermission) {
            console.warn('PWA: Notification permission denied');
            return;
        }

        const defaultOptions = {
            body: options.body || '',
            icon: '/src/assets/icons/icon-192x192.png',
            badge: '/src/assets/icons/icon-96x96.png',
            vibrate: [200, 100, 200],
            data: {
                timestamp: Date.now(),
                url: options.url || '/src/pages/dashboard.html'
            }
        };

        const notification = new Notification(title, { ...defaultOptions, ...options });

        notification.onclick = () => {
            window.focus();
            if (options.url) {
                window.location.href = options.url;
            }
            notification.close();
        };

        return notification;
    }

    async syncOfflineData() {
        if (!this.swRegistration || !this.isOnline) return;

        try {
            // Registrar background sync
            await this.swRegistration.sync.register('background-quotes-sync');
            await this.swRegistration.sync.register('offline-transactions-sync');

            console.log('PWA: Background sync registered');
        } catch (error) {
            console.error('PWA: Failed to register background sync:', error);
        }
    }

    async getCacheSize() {
        if (!this.swRegistration) return 0;

        return new Promise((resolve) => {
            const channel = new MessageChannel();

            channel.port1.onmessage = (event) => {
                resolve(event.data.size || 0);
            };

            this.swRegistration.active.postMessage(
                { type: 'GET_CACHE_SIZE' },
                [channel.port2]
            );
        });
    }

    async clearCache() {
        if (!this.swRegistration) return;

        this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
        this.showNotification('Cache limpo com sucesso', 'success');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async getAppInfo() {
        const cacheSize = await this.getCacheSize();

        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            hasServiceWorker: !!this.swRegistration,
            cacheSize: this.formatBytes(cacheSize),
            notificationPermission: Notification.permission,
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform
        };
    }

    showNotification(message, type = 'info') {
        // Implementation similar to other components
        const colors = {
            error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400',
            success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400',
            info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-4 py-3 border rounded-lg ${colors[type]} animate-slide-up z-50 max-w-sm`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Create global instance
window.pwaService = new PWAService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAService;
}