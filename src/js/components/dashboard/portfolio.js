// Sistema de Portfólio
class PortfolioSystem {
    constructor() {
        this.assets = this.getAssets();
        this.sortBy = 'value';
        this.sortOrder = 'desc';
        this.filterType = 'all';
        this.searchTerm = '';
    }

    getAssets() {
        // Mock data expandido para demonstração
        return [
            {
                symbol: 'PETR4',
                name: 'Petrobras PN',
                quantity: 500,
                avgPrice: 28.45,
                currentPrice: 32.80,
                type: 'stock_br',
                sector: 'Petróleo e Gás',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'ITUB4',
                name: 'Itau Unibanco PN',
                quantity: 300,
                avgPrice: 24.20,
                currentPrice: 26.75,
                type: 'stock_br',
                sector: 'Bancário',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'VALE3',
                name: 'Vale ON',
                quantity: 200,
                avgPrice: 65.30,
                currentPrice: 71.20,
                type: 'stock_br',
                sector: 'Mineração',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'AAPL',
                name: 'Apple Inc',
                quantity: 50,
                avgPrice: 150.00,
                currentPrice: 175.50,
                type: 'stock_us',
                sector: 'Tecnologia',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'MSFT',
                name: 'Microsoft Corp',
                quantity: 30,
                avgPrice: 280.00,
                currentPrice: 320.75,
                type: 'stock_us',
                sector: 'Tecnologia',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'BTC',
                name: 'Bitcoin',
                quantity: 0.5,
                avgPrice: 35000,
                currentPrice: 42500,
                type: 'crypto',
                sector: 'Criptomoeda',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'ETH',
                name: 'Ethereum',
                quantity: 2.5,
                avgPrice: 2200,
                currentPrice: 2850,
                type: 'crypto',
                sector: 'Criptomoeda',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'USD',
                name: 'Dólar Americano',
                quantity: 2000,
                avgPrice: 5.20,
                currentPrice: 4.95,
                type: 'currency',
                sector: 'Moeda',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'HGLG11',
                name: 'CSHG Logística FII',
                quantity: 100,
                avgPrice: 98.50,
                currentPrice: 105.20,
                type: 'real_estate',
                sector: 'Fundos Imobiliários',
                lastUpdate: new Date().toISOString()
            },
            {
                symbol: 'XPML11',
                name: 'XP Malls FII',
                quantity: 150,
                avgPrice: 89.30,
                currentPrice: 94.75,
                type: 'real_estate',
                sector: 'Fundos Imobiliários',
                lastUpdate: new Date().toISOString()
            }
        ];
    }

    renderPortfolioContent() {
        const content = `
            <!-- Portfolio Header -->
            <div class="mb-8">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Meus Ativos</h2>
                        <p class="text-gray-600 dark:text-gray-400">Gerencie e monitore seu portfólio de investimentos</p>
                    </div>
                    <div class="flex items-center space-x-3 mt-4 sm:mt-0">
                        <button class="btn-secondary" id="refreshPrices">
                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                            </svg>
                            Atualizar Preços
                        </button>
                        <button class="btn-primary" onclick="window.location.href='#operations'">
                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Nova Operação
                        </button>
                    </div>
                </div>

                <!-- Portfolio Summary Cards -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div class="card">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                                    <p class="text-xl font-bold text-gray-900 dark:text-white" id="portfolioTotalValue">
                                        ${this.formatCurrency(this.calculateTotalValue())}
                                    </p>
                                </div>
                                <div class="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                                    <svg class="h-5 w-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Total Investido</p>
                                    <p class="text-xl font-bold text-gray-900 dark:text-white">
                                        ${this.formatCurrency(this.calculateTotalInvested())}
                                    </p>
                                </div>
                                <div class="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                    <svg class="h-5 w-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Lucro/Prejuízo</p>
                                    <p class="text-xl font-bold ${this.calculateTotalGain() >= 0 ? 'text-profit' : 'text-loss'}">
                                        ${this.formatCurrency(this.calculateTotalGain())}
                                    </p>
                                </div>
                                <div class="h-8 w-8 ${this.calculateTotalGain() >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'} rounded-lg flex items-center justify-center">
                                    <svg class="h-5 w-5 ${this.calculateTotalGain() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${this.calculateTotalGain() >= 0 ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'}"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">Rentabilidade</p>
                                    <p class="text-xl font-bold ${this.calculateTotalReturn() >= 0 ? 'text-profit' : 'text-loss'}">
                                        ${this.calculateTotalReturn() >= 0 ? '+' : ''}${this.calculateTotalReturn().toFixed(2)}%
                                    </p>
                                </div>
                                <div class="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                    <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters and Search -->
                <div class="card mb-6">
                    <div class="card-body">
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <!-- Search -->
                            <div class="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar ativo..."
                                    class="form-input pl-10 w-64"
                                    id="assetSearch">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </div>

                            <!-- Filters -->
                            <div class="flex items-center space-x-4">
                                <select class="form-input" id="typeFilter">
                                    <option value="all">Todos os Tipos</option>
                                    <option value="stock_br">Ações BR</option>
                                    <option value="stock_us">Ações US</option>
                                    <option value="crypto">Cripto</option>
                                    <option value="currency">Moedas</option>
                                    <option value="real_estate">FIIs</option>
                                </select>

                                <select class="form-input" id="sortBy">
                                    <option value="value">Ordenar por Valor</option>
                                    <option value="gain">Ordenar por Ganho</option>
                                    <option value="symbol">Ordenar por Símbolo</option>
                                    <option value="quantity">Ordenar por Quantidade</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Assets Table -->
            <div class="card">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ativo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço Atual</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantidade</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preço Médio</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ganho/Perda</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">% Carteira</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-finance-dark-card divide-y divide-gray-200 dark:divide-gray-700" id="assetsTableBody">
                            ${this.renderAssetsRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        return content;
    }

    renderAssetsRows() {
        const filteredAssets = this.getFilteredAssets();
        const totalPortfolioValue = this.calculateTotalValue();

        return filteredAssets.map(asset => {
            const currentValue = asset.quantity * asset.currentPrice;
            const investedValue = asset.quantity * asset.avgPrice;
            const gain = currentValue - investedValue;
            const gainPercent = ((gain / investedValue) * 100);
            const portfolioPercent = ((currentValue / totalPortfolioValue) * 100);

            const typeIcons = {
                stock_br: '🇧🇷',
                stock_us: '🇺🇸',
                crypto: '₿',
                currency: '💵',
                real_estate: '🏢'
            };

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="h-8 w-8 rounded bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-sm mr-3">
                                ${typeIcons[asset.type] || '📊'}
                            </div>
                            <div>
                                <div class="text-sm font-medium text-gray-900 dark:text-white">${asset.symbol}</div>
                                <div class="text-sm text-gray-500 dark:text-gray-400">${asset.name}</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                            ${this.formatCurrency(asset.currentPrice)}
                        </div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">
                            ${this.getRandomPriceChange()}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${this.formatQuantity(asset.quantity, asset.type)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${this.formatCurrency(asset.avgPrice)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900 dark:text-white">
                            ${this.formatCurrency(currentValue)}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-semibold ${gain >= 0 ? 'text-profit' : 'text-loss'}">
                            ${gain >= 0 ? '+' : ''}${this.formatCurrency(gain)}
                        </div>
                        <div class="text-sm ${gain >= 0 ? 'text-profit' : 'text-loss'}">
                            ${gain >= 0 ? '+' : ''}${gainPercent.toFixed(2)}%
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <div class="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div class="bg-primary-600 h-2 rounded-full" style="width: ${Math.min(portfolioPercent, 100)}%"></div>
                            </div>
                            <span class="text-sm text-gray-600 dark:text-gray-400">${portfolioPercent.toFixed(1)}%</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="text-primary-600 hover:text-primary-500" onclick="viewAssetDetails('${asset.symbol}')" title="Ver detalhes">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                </svg>
                            </button>
                            <button class="text-green-600 hover:text-green-500" onclick="buyAsset('${asset.symbol}')" title="Comprar">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                            </button>
                            <button class="text-red-600 hover:text-red-500" onclick="sellAsset('${asset.symbol}')" title="Vender">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    getFilteredAssets() {
        let filtered = [...this.assets];

        // Apply type filter
        if (this.filterType !== 'all') {
            filtered = filtered.filter(asset => asset.type === this.filterType);
        }

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(asset =>
                asset.symbol.toLowerCase().includes(term) ||
                asset.name.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (this.sortBy) {
                case 'value':
                    aValue = a.quantity * a.currentPrice;
                    bValue = b.quantity * b.currentPrice;
                    break;
                case 'gain':
                    aValue = (a.currentPrice - a.avgPrice) / a.avgPrice;
                    bValue = (b.currentPrice - b.avgPrice) / b.avgPrice;
                    break;
                case 'symbol':
                    aValue = a.symbol;
                    bValue = b.symbol;
                    break;
                case 'quantity':
                    aValue = a.quantity;
                    bValue = b.quantity;
                    break;
                default:
                    aValue = a.quantity * a.currentPrice;
                    bValue = b.quantity * b.currentPrice;
            }

            if (typeof aValue === 'string') {
                return this.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            return this.sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        });

        return filtered;
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('assetSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value;
                this.updateAssetsTable();
            });
        }

        // Type filter
        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filterType = e.target.value;
                this.updateAssetsTable();
            });
        }

        // Sort by
        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.updateAssetsTable();
            });
        }

        // Refresh prices
        const refreshBtn = document.getElementById('refreshPrices');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPrices());
        }
    }

    updateAssetsTable() {
        const tbody = document.getElementById('assetsTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderAssetsRows();
        }
    }

    refreshPrices() {
        // Simulate price updates
        this.assets.forEach(asset => {
            const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
            asset.currentPrice *= (1 + variation);
            asset.lastUpdate = new Date().toISOString();
        });

        this.updateAssetsTable();

        // Show notification
        this.showNotification('Preços atualizados com sucesso!', 'success');
    }

    // Calculation methods
    calculateTotalValue() {
        return this.assets.reduce((total, asset) => {
            return total + (asset.quantity * asset.currentPrice);
        }, 0);
    }

    calculateTotalInvested() {
        return this.assets.reduce((total, asset) => {
            return total + (asset.quantity * asset.avgPrice);
        }, 0);
    }

    calculateTotalGain() {
        return this.calculateTotalValue() - this.calculateTotalInvested();
    }

    calculateTotalReturn() {
        const invested = this.calculateTotalInvested();
        const gain = this.calculateTotalGain();
        return invested > 0 ? (gain / invested) * 100 : 0;
    }

    // Utility methods
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(value));
    }

    formatQuantity(quantity, type) {
        if (type === 'crypto') {
            return quantity.toFixed(4);
        }
        return new Intl.NumberFormat('pt-BR').format(quantity);
    }

    getRandomPriceChange() {
        const change = (Math.random() - 0.5) * 0.1;
        const isPositive = change >= 0;
        const color = isPositive ? 'text-profit' : 'text-loss';
        const symbol = isPositive ? '+' : '';
        return `<span class="${color}">${symbol}${(change * 100).toFixed(2)}%</span>`;
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

// Global functions for asset actions
window.viewAssetDetails = function(symbol) {
    alert(`Ver detalhes de ${symbol} - Funcionalidade em desenvolvimento`);
};

window.buyAsset = function(symbol) {
    alert(`Comprar ${symbol} - Redirecionando para nova operação`);
};

window.sellAsset = function(symbol) {
    alert(`Vender ${symbol} - Redirecionando para nova operação`);
};

// Export for use in dashboard
window.PortfolioSystem = PortfolioSystem;