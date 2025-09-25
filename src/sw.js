// Service Worker para Financial Control PWA
const CACHE_NAME = 'financial-control-v1.4.0';
const STATIC_CACHE_NAME = 'financial-static-v1.4.0';
const DYNAMIC_CACHE_NAME = 'financial-dynamic-v1.4.0';

// Detectar ambiente e definir base path
const isGitHubPages = self.location.hostname.includes('github.io');
const BASE_PATH = isGitHubPages ? '/finance' : '';

// Arquivos essenciais para cache estático
const STATIC_FILES = [
    BASE_PATH + '/src/',
    BASE_PATH + '/src/index.html',
    BASE_PATH + '/src/pages/dashboard.html',
    BASE_PATH + '/src/styles/output.css',
    BASE_PATH + '/src/js/components/dashboard/dashboard.js',
    BASE_PATH + '/src/js/components/dashboard/portfolio.js',
    BASE_PATH + '/src/js/components/dashboard/operations.js',
    BASE_PATH + '/src/js/components/dashboard/transactions.js',
    BASE_PATH + '/src/js/components/dashboard/reports.js',
    BASE_PATH + '/src/js/components/dashboard/technicalAnalysis.js',
    BASE_PATH + '/src/js/components/auth/login.js',
    BASE_PATH + '/src/js/services/quotesService.js',
    BASE_PATH + '/src/js/services/alertsService.js',
    BASE_PATH + '/src/js/services/technicalAnalysisService.js',
    BASE_PATH + '/src/js/services/performanceService.js',
    BASE_PATH + '/src/js/services/pwaService.js',
    BASE_PATH + '/src/js/utils/constants.js',
    BASE_PATH + '/src/js/utils/helpers.js',
    BASE_PATH + '/src/manifest.json',
    // Chart.js CDN
    'https://cdn.jsdelivr.net/npm/chart.js',
    // Google Fonts
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// URLs das APIs que devem ser cacheadas dinamicamente
const API_CACHE_PATTERNS = [
    /^https:\/\/brapi\.dev\/api\/quote/,
    /^https:\/\/api\.coingecko\.com\/api\/v3/,
    /^https:\/\/api\.exchangerate-api\.com/,
    /^https:\/\/query1\.finance\.yahoo\.com/
];

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker');

    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .catch(err => {
                console.error('[SW] Failed to cache static files:', err);
            })
    );

    // Ativar imediatamente
    self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
    );

    // Assumir controle imediatamente
    self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorar requisições não-HTTP
    if (!request.url.startsWith('http')) {
        return;
    }

    // Strategy: Cache First para recursos estáticos
    if (isStaticResource(request.url)) {
        event.respondWith(cacheFirst(request));
    }
    // Strategy: Network First para APIs
    else if (isApiRequest(request.url)) {
        event.respondWith(networkFirst(request));
    }
    // Strategy: Stale While Revalidate para outros recursos
    else {
        event.respondWith(staleWhileRevalidate(request));
    }
});

// Cache First Strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        const cache = await caches.open(STATIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());

        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First failed:', error);
        return new Response('Offline - Resource not available', { status: 503 });
    }
}

// Network First Strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.warn('[SW] Network failed, trying cache:', error);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Fallback para dados offline
        return new Response(JSON.stringify({
            error: 'Offline',
            message: 'Dados não disponíveis offline',
            timestamp: new Date().toISOString()
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('[SW] Network failed:', error);
        return cachedResponse;
    });

    return cachedResponse || fetchPromise;
}

// Verificar se é recurso estático
function isStaticResource(url) {
    return STATIC_FILES.some(staticFile => url.includes(staticFile)) ||
           url.includes('.css') ||
           url.includes('.js') ||
           url.includes('.png') ||
           url.includes('.jpg') ||
           url.includes('.ico') ||
           url.includes('fonts.googleapis.com');
}

// Verificar se é requisição de API
function isApiRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

// Listener para mensagens do cliente
self.addEventListener('message', event => {
    const { type, data } = event.data;

    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'CACHE_QUOTES':
            cacheQuotesData(data);
            break;

        case 'CLEAR_CACHE':
            clearAllCaches();
            break;

        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                event.ports[0].postMessage({ size });
            });
            break;
    }
});

// Cache específico para cotações
async function cacheQuotesData(quotesData) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = new Response(JSON.stringify(quotesData), {
            headers: { 'Content-Type': 'application/json' }
        });

        await cache.put('/api/quotes/cached', response);
        console.log('[SW] Quotes data cached successfully');
    } catch (error) {
        console.error('[SW] Failed to cache quotes:', error);
    }
}

// Limpar todos os caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Failed to clear caches:', error);
    }
}

// Calcular tamanho do cache
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const requests = await cache.keys();

            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }

        return totalSize;
    } catch (error) {
        console.error('[SW] Failed to calculate cache size:', error);
        return 0;
    }
}

// Background Sync para operações offline
self.addEventListener('sync', event => {
    console.log('[SW] Background Sync:', event.tag);

    switch (event.tag) {
        case 'background-quotes-sync':
            event.waitUntil(backgroundQuotesSync());
            break;

        case 'offline-transactions-sync':
            event.waitUntil(syncOfflineTransactions());
            break;
    }
});

// Sincronizar cotações em background
async function backgroundQuotesSync() {
    try {
        console.log('[SW] Syncing quotes in background');

        // Buscar cotações atualizadas
        const response = await fetch('/api/quotes/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const quotesData = await response.json();
            await cacheQuotesData(quotesData);

            // Notificar clientes sobre atualização
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({
                    type: 'QUOTES_UPDATED',
                    data: quotesData
                });
            });
        }
    } catch (error) {
        console.error('[SW] Background sync failed:', error);
    }
}

// Sincronizar transações offline
async function syncOfflineTransactions() {
    try {
        console.log('[SW] Syncing offline transactions');

        // Implementar lógica de sincronização de transações
        // que foram criadas offline

    } catch (error) {
        console.error('[SW] Failed to sync offline transactions:', error);
    }
}

// Push notifications
self.addEventListener('push', event => {
    console.log('[SW] Push received:', event);

    const options = {
        body: event.data ? event.data.text() : 'Notificação do Financial Control',
        icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect width='192' height='192' fill='%233b82f6' rx='24'/><text y='120' font-size='100' x='96' text-anchor='middle' fill='white'>💰</text></svg>",
        badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect width='96' height='96' fill='%233b82f6' rx='12'/><text y='60' font-size='48' x='48' text-anchor='middle' fill='white'>💰</text></svg>",
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Dashboard',
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect width='96' height='96' fill='%233b82f6' rx='12'/><text y='60' font-size='48' x='48' text-anchor='middle' fill='white'>📊</text></svg>"
            },
            {
                action: 'close',
                title: 'Fechar',
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect width='96' height='96' fill='%23ef4444' rx='12'/><text y='60' font-size='48' x='48' text-anchor='middle' fill='white'>❌</text></svg>"
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Financial Control', options)
    );
});

// Clique em notificação
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/src/pages/dashboard.html')
        );
    }
});

console.log('[SW] Service Worker loaded successfully');