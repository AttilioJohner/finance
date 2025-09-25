// Sistema de Transações
class TransactionsSystem {
    constructor() {
        this.transactions = this.loadTransactions();
        this.filteredTransactions = [...this.transactions];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.sortBy = 'date';
        this.sortOrder = 'desc';
        this.filters = {
            type: 'all',
            asset: '',
            dateFrom: '',
            dateTo: '',
            minValue: '',
            maxValue: ''
        };
    }

    loadTransactions() {
        // Carregar do localStorage primeiro
        const stored = localStorage.getItem('financial_operations') || '[]';
        let transactions = JSON.parse(stored);

        // Se não houver transações, criar dados mock
        if (transactions.length === 0) {
            transactions = this.generateMockTransactions();
            localStorage.setItem('financial_operations', JSON.stringify(transactions));
        }

        return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    generateMockTransactions() {
        const mockTransactions = [
            // Janeiro 2025
            { id: '1', date: '2025-01-20', asset: 'PETR4', type: 'buy', quantity: 100, price: 38.45, total: 3845.00, fees: 15.00, notes: 'Compra estratégica após queda' },
            { id: '2', date: '2025-01-18', asset: 'BTC', type: 'buy', quantity: 0.05, price: 525000, total: 26250.00, fees: 50.00, notes: 'Aproveitando correção' },
            { id: '3', date: '2025-01-15', asset: 'ITUB4', type: 'dividend', quantity: 300, price: 0.85, total: 255.00, fees: 0.00, notes: 'Dividendos 4T 2024' },
            { id: '4', date: '2025-01-12', asset: 'HGLG11', type: 'buy', quantity: 50, price: 108.90, total: 5445.00, fees: 12.00, notes: 'Diversificação FIIs' },
            { id: '5', date: '2025-01-10', asset: 'AAPL', type: 'sell', quantity: 5, price: 962.50, total: 4812.50, fees: 25.00, notes: 'Realização parcial lucros' },

            // Dezembro 2024
            { id: '6', date: '2024-12-28', asset: 'VALE3', type: 'buy', quantity: 50, price: 62.15, total: 3107.50, fees: 8.00, notes: 'Posicionamento para 2025' },
            { id: '7', date: '2024-12-22', asset: 'USD', type: 'buy', quantity: 500, price: 5.52, total: 2760.00, fees: 0.00, notes: 'Hedge cambial' },
            { id: '8', date: '2024-12-20', asset: 'ETH', type: 'buy', quantity: 1.0, price: 20350, total: 20350.00, fees: 40.00, notes: 'Diversificação crypto' },
            { id: '9', date: '2024-12-18', asset: 'WEGE3', type: 'buy', quantity: 100, price: 45.75, total: 4575.00, fees: 10.00, notes: 'Ação de qualidade' },
            { id: '10', date: '2024-12-15', asset: 'BBAS3', type: 'dividend', quantity: 250, price: 1.20, total: 300.00, fees: 0.00, notes: 'Dividendos 3T 2024' },

            // Novembro 2024
            { id: '11', date: '2024-11-30', asset: 'MSFT', type: 'buy', quantity: 4, price: 2475.00, total: 9900.00, fees: 45.00, notes: 'Tech americana' },
            { id: '12', date: '2024-11-25', asset: 'PETR4', type: 'sell', quantity: 50, price: 35.20, total: 1760.00, fees: 8.00, notes: 'Ajuste posição' },
            { id: '13', date: '2024-11-20', asset: 'KNRI11', type: 'buy', quantity: 80, price: 92.15, total: 7372.00, fees: 15.00, notes: 'Renda passiva' },
            { id: '14', date: '2024-11-15', asset: 'BTC', type: 'sell', quantity: 0.1, price: 480000, total: 48000.00, fees: 100.00, notes: 'Realização lucros' },
            { id: '15', date: '2024-11-10', asset: 'ITUB4', type: 'buy', quantity: 150, price: 33.25, total: 4987.50, fees: 12.00, notes: 'Setor bancário' },

            // Outubro 2024
            { id: '16', date: '2024-10-28', asset: 'GOOGL', type: 'buy', quantity: 3, price: 907.50, total: 2722.50, fees: 20.00, notes: 'Big Tech' },
            { id: '17', date: '2024-10-22', asset: 'XPML11', type: 'buy', quantity: 60, price: 98.75, total: 5925.00, fees: 12.00, notes: 'Shopping centers' },
            { id: '18', date: '2024-10-18', asset: 'EUR', type: 'buy', quantity: 200, price: 5.75, total: 1150.00, fees: 0.00, notes: 'Moeda forte' },
            { id: '19', date: '2024-10-15', asset: 'VALE3', type: 'dividend', quantity: 200, price: 2.80, total: 560.00, fees: 0.00, notes: 'Dividendos especiais' },
            { id: '20', date: '2024-10-10', asset: 'BBAS3', type: 'buy', quantity: 100, price: 26.80, total: 2680.00, fees: 8.00, notes: 'Banco estatal' }
        ];

        // Adicionar timestamps
        return mockTransactions.map(t => ({
            ...t,
            timestamp: new Date(t.date).toISOString(),
            id: t.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
    }

    renderTransactionsContent() {
        const content = `
            <div>
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Histórico de Transações</h2>
                            <p class="text-gray-600 dark:text-gray-400">Visualize e gerencie todas as suas operações</p>
                        </div>
                        <div class="flex items-center space-x-3 mt-4 sm:mt-0">
                            <button class="btn-secondary" id="exportTransactions">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m6 5v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8"></path>
                                </svg>
                                Exportar
                            </button>
                            <button class="btn-primary" onclick="window.location.href='#operations'">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                                Nova Transação
                            </button>
                        </div>
                    </div>

                    <!-- Statistics Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div class="card">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Transações</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-white">${this.transactions.length}</p>
                                    </div>
                                    <div class="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Volume Total</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-white">${this.formatCurrency(this.getTotalVolume())}</p>
                                    </div>
                                    <div class="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Este Mês</p>
                                        <p class="text-xl font-bold text-gray-900 dark:text-white">${this.getMonthlyTransactions()}</p>
                                    </div>
                                    <div class="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Última Transação</p>
                                        <p class="text-lg font-bold text-gray-900 dark:text-white">${this.transactions[0]?.asset || '-'}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">${this.transactions[0] ? this.formatDate(this.transactions[0].date) : '-'}</p>
                                    </div>
                                    <div class="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="card mb-6">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
                    </div>
                    <div class="card-body">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                            <div>
                                <label class="form-label">Tipo</label>
                                <select class="form-input" id="typeFilter">
                                    <option value="all">Todos</option>
                                    <option value="buy">Compra</option>
                                    <option value="sell">Venda</option>
                                    <option value="dividend">Dividendo</option>
                                    <option value="split">Split</option>
                                </select>
                            </div>

                            <div>
                                <label class="form-label">Ativo</label>
                                <input type="text" class="form-input" placeholder="Ex: PETR4" id="assetFilter">
                            </div>

                            <div>
                                <label class="form-label">Data Inicial</label>
                                <input type="date" class="form-input" id="dateFromFilter">
                            </div>

                            <div>
                                <label class="form-label">Data Final</label>
                                <input type="date" class="form-input" id="dateToFilter">
                            </div>

                            <div>
                                <label class="form-label">Valor Mínimo</label>
                                <input type="number" class="form-input" placeholder="0,00" step="0.01" id="minValueFilter">
                            </div>

                            <div>
                                <label class="form-label">Valor Máximo</label>
                                <input type="number" class="form-input" placeholder="0,00" step="0.01" id="maxValueFilter">
                            </div>
                        </div>

                        <div class="flex items-center justify-between mt-4">
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando ${this.filteredTransactions.length} de ${this.transactions.length} transações
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="btn-secondary" id="clearFilters">
                                    Limpar Filtros
                                </button>
                                <button class="btn-primary" id="applyFilters">
                                    Aplicar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Transactions Table -->
                <div class="card">
                    <div class="card-header">
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Transações</h3>
                            <div class="flex items-center space-x-2">
                                <select class="form-input text-sm" id="itemsPerPage">
                                    <option value="10">10 por página</option>
                                    <option value="25">25 por página</option>
                                    <option value="50">50 por página</option>
                                    <option value="100">100 por página</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('date')">
                                        Data
                                        <svg class="inline h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                                        </svg>
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('asset')">
                                        Ativo
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('type')">
                                        Tipo
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('quantity')">
                                        Quantidade
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('price')">
                                        Preço Unit.
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="sortTable('total')">
                                        Total
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Observações
                                    </th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-finance-dark-card divide-y divide-gray-200 dark:divide-gray-700" id="transactionsTableBody">
                                ${this.renderTransactionsRows()}
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="card-body border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="text-sm text-gray-600 dark:text-gray-400">
                                Mostrando ${this.getStartIndex()} a ${this.getEndIndex()} de ${this.filteredTransactions.length} resultados
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="btn-secondary disabled:opacity-50" id="prevPage" ${this.currentPage === 1 ? 'disabled' : ''}>
                                    Anterior
                                </button>
                                <span class="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                                    Página ${this.currentPage} de ${this.getTotalPages()}
                                </span>
                                <button class="btn-secondary disabled:opacity-50" id="nextPage" ${this.currentPage === this.getTotalPages() ? 'disabled' : ''}>
                                    Próximo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    renderTransactionsRows() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedTransactions = this.filteredTransactions.slice(startIndex, endIndex);

        if (paginatedTransactions.length === 0) {
            return `
                <tr>
                    <td colspan="8" class="px-6 py-12 text-center">
                        <div class="text-gray-500 dark:text-gray-400">
                            <svg class="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z"></path>
                            </svg>
                            <p>Nenhuma transação encontrada</p>
                            <p class="text-sm mt-1">Tente ajustar os filtros ou adicionar novas transações</p>
                        </div>
                    </td>
                </tr>
            `;
        }

        return paginatedTransactions.map(transaction => {
            const typeColors = {
                buy: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                sell: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                dividend: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                split: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
            };

            const typeLabels = {
                buy: 'Compra',
                sell: 'Venda',
                dividend: 'Dividendo',
                split: 'Split'
            };

            const typeIcons = {
                buy: '↗️',
                sell: '↙️',
                dividend: '💰',
                split: '🔄'
            };

            return `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${this.formatDate(transaction.date)}
                        <div class="text-xs text-gray-500 dark:text-gray-400">${this.formatTime(transaction.timestamp)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-medium text-gray-900 dark:text-white">${transaction.asset}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[transaction.type]}">
                            ${typeIcons[transaction.type]} ${typeLabels[transaction.type]}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${this.formatQuantity(transaction.quantity)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${this.formatCurrency(transaction.price)}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="font-medium text-gray-900 dark:text-white">
                            ${this.formatCurrency(transaction.total)}
                        </div>
                        ${transaction.fees > 0 ? `<div class="text-xs text-gray-500 dark:text-gray-400">Taxas: ${this.formatCurrency(transaction.fees)}</div>` : ''}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        ${transaction.notes || '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex items-center space-x-2">
                            <button class="text-blue-600 hover:text-blue-500" onclick="editTransaction('${transaction.id}')" title="Editar">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button class="text-red-600 hover:text-red-500" onclick="deleteTransaction('${transaction.id}')" title="Excluir">
                                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Calculation and utility methods
    getTotalVolume() {
        return this.transactions.reduce((total, t) => total + (t.total || 0), 0);
    }

    getMonthlyTransactions() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate.getMonth() === currentMonth &&
                   transactionDate.getFullYear() === currentYear;
        }).length;
    }

    getTotalPages() {
        return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    }

    getStartIndex() {
        return this.filteredTransactions.length === 0 ? 0 : (this.currentPage - 1) * this.itemsPerPage + 1;
    }

    getEndIndex() {
        const endIndex = this.currentPage * this.itemsPerPage;
        return Math.min(endIndex, this.filteredTransactions.length);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatQuantity(quantity) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        }).format(quantity || 0);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Event handlers and filters
    setupEventListeners() {
        // Filter buttons
        document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document.getElementById('clearFilters')?.addEventListener('click', () => this.clearFilters());

        // Pagination
        document.getElementById('prevPage')?.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage')?.addEventListener('click', () => this.goToPage(this.currentPage + 1));

        // Items per page
        document.getElementById('itemsPerPage')?.addEventListener('change', (e) => {
            this.itemsPerPage = parseInt(e.target.value);
            this.currentPage = 1;
            this.updateTable();
        });

        // Export
        document.getElementById('exportTransactions')?.addEventListener('click', () => this.exportTransactions());
    }

    applyFilters() {
        this.filters = {
            type: document.getElementById('typeFilter').value,
            asset: document.getElementById('assetFilter').value.toUpperCase(),
            dateFrom: document.getElementById('dateFromFilter').value,
            dateTo: document.getElementById('dateToFilter').value,
            minValue: parseFloat(document.getElementById('minValueFilter').value) || null,
            maxValue: parseFloat(document.getElementById('maxValueFilter').value) || null
        };

        this.filteredTransactions = this.transactions.filter(transaction => {
            // Type filter
            if (this.filters.type !== 'all' && transaction.type !== this.filters.type) {
                return false;
            }

            // Asset filter
            if (this.filters.asset && !transaction.asset.includes(this.filters.asset)) {
                return false;
            }

            // Date filters
            if (this.filters.dateFrom && transaction.date < this.filters.dateFrom) {
                return false;
            }
            if (this.filters.dateTo && transaction.date > this.filters.dateTo) {
                return false;
            }

            // Value filters
            if (this.filters.minValue && transaction.total < this.filters.minValue) {
                return false;
            }
            if (this.filters.maxValue && transaction.total > this.filters.maxValue) {
                return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.updateTable();
    }

    clearFilters() {
        document.getElementById('typeFilter').value = 'all';
        document.getElementById('assetFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('minValueFilter').value = '';
        document.getElementById('maxValueFilter').value = '';

        this.filteredTransactions = [...this.transactions];
        this.currentPage = 1;
        this.updateTable();
    }

    goToPage(page) {
        if (page >= 1 && page <= this.getTotalPages()) {
            this.currentPage = page;
            this.updateTable();
        }
    }

    updateTable() {
        const tbody = document.getElementById('transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = this.renderTransactionsRows();
        }

        // Update pagination info
        const startIndex = document.querySelector('.text-sm.text-gray-600');
        if (startIndex) {
            startIndex.textContent = `Mostrando ${this.getStartIndex()} a ${this.getEndIndex()} de ${this.filteredTransactions.length} resultados`;
        }

        // Update pagination buttons
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.querySelector('span.px-3.py-2');

        if (prevBtn) prevBtn.disabled = this.currentPage === 1;
        if (nextBtn) nextBtn.disabled = this.currentPage === this.getTotalPages();
        if (pageInfo) pageInfo.textContent = `Página ${this.currentPage} de ${this.getTotalPages()}`;
    }

    exportTransactions() {
        const csv = this.generateCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `transacoes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Transações exportadas com sucesso!', 'success');
    }

    generateCSV() {
        const headers = ['Data', 'Ativo', 'Tipo', 'Quantidade', 'Preço', 'Total', 'Taxas', 'Observações'];
        const rows = this.filteredTransactions.map(t => [
            t.date,
            t.asset,
            t.type,
            t.quantity,
            t.price,
            t.total,
            t.fees || 0,
            `"${t.notes || ''}"`
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showNotification(message, type = 'info') {
        // Implementation similar to other components
        const colors = {
            error: 'bg-red-100 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600 dark:text-red-400',
            success: 'bg-green-100 border-green-400 text-green-700 dark:bg-green-900/20 dark:border-green-600 dark:text-green-400',
            info: 'bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400'
        };

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-4 py-3 border rounded-lg ${colors[type]} animate-slide-up z-50 max-w-sm`;
        notification.textContent = message;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Global functions for actions
window.sortTable = function(column) {
    // Implementation for sorting
    console.log('Sort by:', column);
};

window.editTransaction = function(id) {
    alert(`Editar transação ${id} - Funcionalidade em desenvolvimento`);
};

window.deleteTransaction = function(id) {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
        // Implementation for deleting transaction
        console.log('Delete transaction:', id);
    }
};

// Export for use in dashboard
window.TransactionsSystem = TransactionsSystem;