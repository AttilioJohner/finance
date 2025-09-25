class PerformanceService {
    constructor() {
        this.observers = new Map();
        this.lazyLoadQueue = [];
        this.isInitialized = false;
        this.performanceMetrics = {
            loadTime: 0,
            renderTime: 0,
            memoryUsage: 0,
            cacheHitRate: 0
        };
        this.init();
    }

    async init() {
        if (this.isInitialized) return;

        await this.measureInitialLoad();
        this.setupLazyLoading();
        this.setupIntersectionObserver();
        this.setupPerformanceObserver();
        this.optimizeImages();
        this.preloadCriticalResources();
        this.debounceFrequentOperations();

        this.isInitialized = true;
        console.log('Performance Service initialized');
    }

    async measureInitialLoad() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.performanceMetrics.loadTime = navigation.loadEventEnd - navigation.navigationStart;
                this.performanceMetrics.renderTime = navigation.domComplete - navigation.domLoading;
            }
        }
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, falling back to eager loading');
            return;
        }

        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;

                    if (src) {
                        img.src = src;
                        img.classList.remove('lazy-load');
                        img.classList.add('lazy-loaded');
                        observer.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.observers.set('lazy-images', lazyImageObserver);
    }

    setupIntersectionObserver() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    const componentType = component.dataset.lazyComponent;

                    if (componentType && !component.dataset.loaded) {
                        this.loadComponent(componentType, component);
                        component.dataset.loaded = 'true';
                    }
                }
            });
        }, {
            rootMargin: '100px'
        });

        this.observers.set('components', componentObserver);

        document.querySelectorAll('[data-lazy-component]').forEach(el => {
            componentObserver.observe(el);
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'measure') {
                            console.log(`Performance: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
                        }
                    });
                });

                observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
                this.observers.set('performance', observer);
            } catch (e) {
                console.warn('PerformanceObserver setup failed:', e);
            }
        }
    }

    async loadComponent(componentType, element) {
        performance.mark(`${componentType}-load-start`);

        try {
            switch (componentType) {
                case 'chart':
                    await this.loadChartComponent(element);
                    break;
                case 'portfolio-table':
                    await this.loadPortfolioTable(element);
                    break;
                case 'transaction-history':
                    await this.loadTransactionHistory(element);
                    break;
                default:
                    console.warn('Unknown component type:', componentType);
            }

            performance.mark(`${componentType}-load-end`);
            performance.measure(
                `${componentType}-load-duration`,
                `${componentType}-load-start`,
                `${componentType}-load-end`
            );
        } catch (error) {
            console.error(`Failed to load component ${componentType}:`, error);
        }
    }

    async loadChartComponent(element) {
        const loadingHTML = `
            <div class="flex items-center justify-center h-64">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span class="ml-2 text-gray-600 dark:text-gray-400">Carregando gráfico...</span>
            </div>
        `;

        element.innerHTML = loadingHTML;

        await new Promise(resolve => setTimeout(resolve, 500));

        const chartType = element.dataset.chartType;
        if (chartType && window[`create${chartType}Chart`]) {
            window[`create${chartType}Chart`](element);
        }
    }

    async loadPortfolioTable(element) {
        const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');

        if (portfolio.length === 0) {
            element.innerHTML = `
                <div class="text-center py-8 text-gray-600 dark:text-gray-400">
                    Nenhum ativo encontrado no portfólio
                </div>
            `;
            return;
        }

        const chunks = this.chunkArray(portfolio, 10);
        let currentChunk = 0;

        const loadNextChunk = () => {
            if (currentChunk < chunks.length) {
                const chunk = chunks[currentChunk];
                const tableRows = chunk.map(asset => this.createAssetRow(asset)).join('');

                if (currentChunk === 0) {
                    element.innerHTML = `<table class="min-w-full"><tbody>${tableRows}</tbody></table>`;
                } else {
                    const tbody = element.querySelector('tbody');
                    tbody.insertAdjacentHTML('beforeend', tableRows);
                }

                currentChunk++;
                setTimeout(loadNextChunk, 50);
            }
        };

        loadNextChunk();
    }

    async loadTransactionHistory(element) {
        const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const recentTransactions = transactions.slice(-20);

        if (recentTransactions.length === 0) {
            element.innerHTML = `
                <div class="text-center py-8 text-gray-600 dark:text-gray-400">
                    Nenhuma transação encontrada
                </div>
            `;
            return;
        }

        const transactionList = recentTransactions
            .map(transaction => this.createTransactionItem(transaction))
            .join('');

        element.innerHTML = `<div class="space-y-2">${transactionList}</div>`;
    }

    createAssetRow(asset) {
        return `
            <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="py-2 px-4">${asset.symbol}</td>
                <td class="py-2 px-4">${asset.name}</td>
                <td class="py-2 px-4">${asset.quantity}</td>
                <td class="py-2 px-4">R$ ${asset.totalValue?.toFixed(2) || '0.00'}</td>
            </tr>
        `;
    }

    createTransactionItem(transaction) {
        const typeColor = transaction.type === 'buy' ? 'text-green-600' : 'text-red-600';
        const typeIcon = transaction.type === 'buy' ? '📈' : '📉';

        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center space-x-3">
                    <span class="text-xl">${typeIcon}</span>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">${transaction.symbol}</div>
                        <div class="text-sm ${typeColor}">${transaction.type.toUpperCase()}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-medium text-gray-900 dark:text-white">R$ ${transaction.total?.toFixed(2)}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${new Date(transaction.date).toLocaleDateString()}</div>
                </div>
            </div>
        `;
    }

    optimizeImages() {
        document.querySelectorAll('img:not([data-optimized])').forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
            img.dataset.optimized = 'true';

            if (!img.src && img.dataset.src) {
                img.classList.add('lazy-load');
                if (this.observers.has('lazy-images')) {
                    this.observers.get('lazy-images').observe(img);
                }
            }
        });
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/src/styles/output.css',
            'https://cdn.jsdelivr.net/npm/chart.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    debounceFrequentOperations() {
        const debouncedOperations = new Map();

        ['scroll', 'resize', 'input'].forEach(eventType => {
            const handler = this.debounce((event) => {
                this.handleDebouncedEvent(eventType, event);
            }, eventType === 'scroll' ? 16 : 250);

            document.addEventListener(eventType, handler, { passive: true });
            debouncedOperations.set(eventType, handler);
        });
    }

    handleDebouncedEvent(type, event) {
        switch (type) {
            case 'scroll':
                this.updateVisibilityBasedFeatures();
                break;
            case 'resize':
                this.handleResize();
                break;
            case 'input':
                this.optimizeInputHandling(event);
                break;
        }
    }

    updateVisibilityBasedFeatures() {
        document.querySelectorAll('.chart-container').forEach(container => {
            const rect = container.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible && !container.dataset.animationStarted) {
                container.dataset.animationStarted = 'true';
                this.startChartAnimation(container);
            }
        });
    }

    handleResize() {
        if (window.Chart) {
            Object.values(Chart.instances).forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        }
    }

    optimizeInputHandling(event) {
        const input = event.target;
        if (input.dataset.optimized) return;

        input.dataset.optimized = 'true';

        if (input.type === 'search' || input.dataset.search) {
            this.setupVirtualizedSearch(input);
        }
    }

    setupVirtualizedSearch(input) {
        let searchTimeout;

        input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performOptimizedSearch(e.target.value, input);
            }, 300);
        });
    }

    performOptimizedSearch(query, input) {
        const resultsContainer = document.getElementById(input.dataset.resultsContainer);
        if (!resultsContainer) return;

        performance.mark('search-start');

        const searchData = this.getSearchData(input.dataset.searchType);
        const results = this.fuzzySearch(query, searchData, 50);

        this.renderVirtualizedResults(results, resultsContainer);

        performance.mark('search-end');
        performance.measure('search-duration', 'search-start', 'search-end');
    }

    getSearchData(searchType) {
        switch (searchType) {
            case 'assets':
                return JSON.parse(localStorage.getItem('portfolio') || '[]');
            case 'transactions':
                return JSON.parse(localStorage.getItem('transactions') || '[]');
            default:
                return [];
        }
    }

    fuzzySearch(query, data, limit = 10) {
        if (!query || query.length < 2) return data.slice(0, limit);

        const normalizedQuery = query.toLowerCase();

        return data
            .map(item => {
                const searchableText = (item.name || item.symbol || '').toLowerCase();
                const distance = this.levenshteinDistance(normalizedQuery, searchableText);
                return { item, score: distance };
            })
            .filter(result => result.score <= 3)
            .sort((a, b) => a.score - b.score)
            .slice(0, limit)
            .map(result => result.item);
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    renderVirtualizedResults(results, container) {
        const ITEM_HEIGHT = 60;
        const VISIBLE_ITEMS = Math.ceil(container.clientHeight / ITEM_HEIGHT);
        const BUFFER_SIZE = 5;

        let scrollTop = container.scrollTop || 0;
        let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
        let endIndex = Math.min(startIndex + VISIBLE_ITEMS + BUFFER_SIZE, results.length);

        startIndex = Math.max(0, startIndex - BUFFER_SIZE);

        const visibleResults = results.slice(startIndex, endIndex);
        const offsetY = startIndex * ITEM_HEIGHT;

        container.innerHTML = `
            <div style="height: ${results.length * ITEM_HEIGHT}px; position: relative;">
                <div style="transform: translateY(${offsetY}px);">
                    ${visibleResults.map(this.createSearchResultItem).join('')}
                </div>
            </div>
        `;
    }

    createSearchResultItem(item) {
        return `
            <div class="h-15 flex items-center px-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                <div class="flex-1">
                    <div class="font-medium text-gray-900 dark:text-white">${item.name || item.symbol}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${item.symbol || item.type}</div>
                </div>
            </div>
        `;
    }

    startChartAnimation(container) {
        const canvas = container.querySelector('canvas');
        if (canvas && window.Chart) {
            const chart = Chart.getChart(canvas);
            if (chart) {
                chart.update('active');
            }
        }
    }

    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(null, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    measureMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            this.performanceMetrics.memoryUsage = {
                used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
            };
        }
    }

    async measureCacheHitRate() {
        if (!navigator.serviceWorker) return;

        try {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration && registration.active) {
                const channel = new MessageChannel();

                channel.port1.onmessage = (event) => {
                    if (event.data.type === 'CACHE_STATS') {
                        const { hits, misses } = event.data;
                        this.performanceMetrics.cacheHitRate = Math.round((hits / (hits + misses)) * 100);
                    }
                };

                registration.active.postMessage(
                    { type: 'GET_CACHE_STATS' },
                    [channel.port2]
                );
            }
        } catch (error) {
            console.warn('Could not measure cache hit rate:', error);
        }
    }

    getPerformanceReport() {
        this.measureMemoryUsage();

        return {
            ...this.performanceMetrics,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null
        };
    }

    cleanup() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

window.performanceService = new PerformanceService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceService;
}