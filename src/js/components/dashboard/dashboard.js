// Dashboard Sistema Financeiro
const STORAGE_KEYS = {
    USER_SESSION: 'financial_user_session',
    THEME: 'financial_theme'
};

// Mock data for demonstration
const MOCK_DATA = {
    portfolio: {
        totalValue: 125430.50,
        totalInvested: 98750.00,
        monthlyPerformance: 8.75,
        bestAsset: { symbol: 'PETR4', gain: 15.3 },
        assetCount: 12
    },
    assets: [
        { symbol: 'PETR4', name: 'Petrobrás PN', quantity: 500, avgPrice: 28.45, currentPrice: 32.80, type: 'stock_br' },
        { symbol: 'ITUB4', name: 'Itau Unibanco PN', quantity: 300, avgPrice: 24.20, currentPrice: 26.75, type: 'stock_br' },
        { symbol: 'VALE3', name: 'Vale ON', quantity: 200, avgPrice: 65.30, currentPrice: 71.20, type: 'stock_br' },
        { symbol: 'AAPL', name: 'Apple Inc', quantity: 50, avgPrice: 150.00, currentPrice: 175.50, type: 'stock_us' },
        { symbol: 'BTC', name: 'Bitcoin', quantity: 0.5, avgPrice: 35000, currentPrice: 42500, type: 'crypto' },
        { symbol: 'USD', name: 'Dólar Americano', quantity: 2000, avgPrice: 5.20, currentPrice: 4.95, type: 'currency' }
    ],
    transactions: [
        { date: '2024-01-15', asset: 'PETR4', type: 'buy', quantity: 100, price: 32.80, total: 3280 },
        { date: '2024-01-12', asset: 'BTC', type: 'buy', quantity: 0.1, price: 42500, total: 4250 },
        { date: '2024-01-10', asset: 'ITUB4', type: 'sell', quantity: 50, price: 26.75, total: 1337.50 },
        { date: '2024-01-08', asset: 'VALE3', type: 'dividend', quantity: 200, price: 2.50, total: 500 }
    ]
};

class DashboardSystem {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupTheme();
        this.loadDashboardData();
        this.setupNavigation();
    }

    checkAuthentication() {
        const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_SESSION) || 'null');
        if (!session) {
            window.location.href = '../index.html';
            return;
        }

        // Update user info
        document.getElementById('userName').textContent = session.email.split('@')[0];
        document.getElementById('userInitials').textContent = session.email[0].toUpperCase();
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Sidebar toggle for mobile
        document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());

        // Navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Performance period buttons
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', (e) => this.updatePerformanceChart(e.target.dataset.period));
        });
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

        // Recreate charts with new theme colors
        setTimeout(() => {
            this.createAllocationChart();
            this.createPerformanceChart();
        }, 100);
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

    logout() {
        localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
        window.location.href = '../index.html';
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
    }

    setupNavigation() {
        // Set initial active state
        this.showPage('dashboard');
    }

    handleNavigation(event) {
        event.preventDefault();
        const page = event.currentTarget.dataset.page;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.currentTarget.classList.add('active');

        // Show corresponding page
        this.showPage(page);

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            portfolio: 'Meus Ativos',
            operations: 'Nova Operação',
            transactions: 'Transações',
            reports: 'Relatórios'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
    }

    showPage(page) {
        // Hide all content sections
        const sections = ['dashboard', 'portfolio', 'operations', 'transactions', 'reports'];
        sections.forEach(section => {
            const element = document.getElementById(`${section}Content`);
            if (element) element.classList.add('hidden');
        });

        // Show selected page
        const targetSection = document.getElementById(`${page}Content`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }
    }

    async loadDashboardData() {
        try {
            // Simulate API loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update summary cards
            this.updateSummaryCards();
            this.updateLastUpdateTime();

            // Load charts
            this.createAllocationChart();
            this.createPerformanceChart();

            // Load recent data
            this.loadRecentTransactions();
            this.loadTopAssets();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Erro ao carregar dados do dashboard', 'error');
        }
    }

    updateSummaryCards() {
        const { portfolio } = MOCK_DATA;

        // Total Portfolio
        const totalGain = portfolio.totalValue - portfolio.totalInvested;
        const totalGainPercent = (totalGain / portfolio.totalInvested) * 100;

        document.getElementById('totalPortfolio').textContent = this.formatCurrency(portfolio.totalValue);
        document.getElementById('totalGain').innerHTML = `
            <svg class="h-4 w-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
            +${this.formatCurrency(totalGain)} (${totalGainPercent.toFixed(2)}%)
        `;

        // Monthly Performance
        document.getElementById('monthlyPerformance').textContent = `+${portfolio.monthlyPerformance.toFixed(2)}%`;

        // Best Asset
        document.getElementById('bestAsset').textContent = portfolio.bestAsset.symbol;
        document.getElementById('bestAssetGain').textContent = `+${portfolio.bestAsset.gain}%`;

        // Asset Count
        document.getElementById('assetCount').textContent = portfolio.assetCount;
    }

    createAllocationChart() {
        const ctx = document.getElementById('allocationChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.allocation) {
            this.charts.allocation.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';

        // Calculate allocation by asset type
        const allocation = this.calculateAllocation();

        this.charts.allocation = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: allocation.labels,
                datasets: [{
                    data: allocation.values,
                    backgroundColor: [
                        '#3b82f6', // Ações BR
                        '#10b981', // Ações US
                        '#f59e0b', // Cripto
                        '#8b5cf6', // Moedas
                        '#ef4444', // Outros
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: textColor,
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const percentage = ((context.raw / allocation.total) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(context.raw)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#e5e7eb';

        // Generate mock performance data
        const performanceData = this.generatePerformanceData();

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: performanceData.labels,
                datasets: [{
                    label: 'Patrimônio',
                    data: performanceData.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Patrimônio: ${this.formatCurrency(context.raw)}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor,
                            callback: (value) => this.formatCurrency(value, false)
                        }
                    }
                }
            }
        });
    }

    loadRecentTransactions() {
        const container = document.getElementById('recentTransactions');
        const transactions = MOCK_DATA.transactions.slice(0, 5);

        const html = transactions.map(transaction => {
            const typeColors = {
                buy: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20',
                sell: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20',
                dividend: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
            };

            const typeIcons = {
                buy: '↗',
                sell: '↙',
                dividend: '💰'
            };

            const typeLabels = {
                buy: 'Compra',
                sell: 'Venda',
                dividend: 'Dividendo'
            };

            return `
                <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div class="flex items-center space-x-3">
                        <div class="h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${typeColors[transaction.type]}">
                            ${typeIcons[transaction.type]}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${transaction.asset}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${typeLabels[transaction.type]} • ${this.formatDate(transaction.date)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900 dark:text-white">${this.formatCurrency(transaction.total)}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${transaction.quantity} unid.</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhuma transação recente</p>';
    }

    loadTopAssets() {
        const container = document.getElementById('topAssets');
        const assets = MOCK_DATA.assets.slice(0, 5);

        const html = assets.map(asset => {
            const currentValue = asset.quantity * asset.currentPrice;
            const gain = ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;
            const gainClass = gain >= 0 ? 'text-profit' : 'text-loss';

            const typeIcons = {
                stock_br: '🇧🇷',
                stock_us: '🇺🇸',
                crypto: '₿',
                currency: '💵'
            };

            return `
                <div class="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div class="flex items-center space-x-3">
                        <div class="h-8 w-8 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">
                            ${typeIcons[asset.type] || '📊'}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">${asset.symbol}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${asset.quantity} unid.</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900 dark:text-white">${this.formatCurrency(currentValue)}</p>
                        <p class="text-sm font-semibold ${gainClass}">${gain >= 0 ? '+' : ''}${gain.toFixed(2)}%</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html || '<p class="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum ativo encontrado</p>';
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById('lastUpdate').textContent = timeString;
    }

    updatePerformanceChart(period) {
        // Update active button
        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.classList.remove('bg-primary-100', 'dark:bg-primary-900', 'text-primary-600', 'dark:text-primary-300');
            btn.classList.add('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
        });

        document.querySelector(`[data-period="${period}"]`).classList.remove('bg-gray-100', 'dark:bg-gray-700', 'text-gray-600', 'dark:text-gray-300');
        document.querySelector(`[data-period="${period}"]`).classList.add('bg-primary-100', 'dark:bg-primary-900', 'text-primary-600', 'dark:text-primary-300');

        // Recreate chart with new data
        this.createPerformanceChart();
    }

    // Utility functions
    calculateAllocation() {
        const allocation = {};
        let total = 0;

        MOCK_DATA.assets.forEach(asset => {
            const value = asset.quantity * asset.currentPrice;
            const typeLabels = {
                stock_br: 'Ações BR',
                stock_us: 'Ações US',
                crypto: 'Cripto',
                currency: 'Moedas',
                fund: 'Fundos'
            };

            const label = typeLabels[asset.type] || 'Outros';
            allocation[label] = (allocation[label] || 0) + value;
            total += value;
        });

        return {
            labels: Object.keys(allocation),
            values: Object.values(allocation),
            total
        };
    }

    generatePerformanceData() {
        const days = 90;
        const labels = [];
        const values = [];
        const baseValue = 98750; // Total invested

        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));

            // Generate realistic portfolio growth
            const randomGrowth = (Math.random() - 0.5) * 0.02; // ±1% daily variation
            const trendGrowth = 0.0003; // 0.03% daily trend
            const currentValue = i === 0 ? MOCK_DATA.portfolio.totalValue :
                baseValue * (1 + (days - i) * trendGrowth + Math.sin((days - i) * 0.1) * 0.05);

            values.push(currentValue);
        }

        return { labels, values };
    }

    formatCurrency(value, withSymbol = true) {
        const formatted = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(value));

        return withSymbol ? `R$ ${formatted}` : formatted;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const colors = {
            error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400',
            success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400',
            info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
        };

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-4 py-3 border rounded-lg ${colors[type]} animate-slide-up z-50 max-w-sm`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardSystem();
});

// Update time every minute
setInterval(() => {
    const dashboard = new DashboardSystem();
    dashboard.updateLastUpdateTime();
}, 60000);