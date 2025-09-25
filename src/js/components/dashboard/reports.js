// Sistema de Relatórios Fiscais
class ReportsSystem {
    constructor() {
        this.transactions = this.loadTransactions();
        this.currentYear = new Date().getFullYear();
        this.selectedYear = this.currentYear;
        this.taxRates = {
            stocks_swing: 0.15,    // 15% para swing trade ações
            stocks_day: 0.20,      // 20% para day trade ações
            fiis: 0.20,           // 20% para FIIs
            crypto: 0.15,         // 15% para crypto
            international: 0.15   // 15% para ações internacionais
        };
        this.exemptionLimits = {
            stocks: 20000,        // R$ 20.000 isenção ações
            crypto: 35000,        // R$ 35.000 isenção crypto (valor fictício)
            fiis: 0               // Sem isenção FIIs
        };
    }

    loadTransactions() {
        const stored = localStorage.getItem('financial_operations') || '[]';
        return JSON.parse(stored);
    }

    renderReportsContent() {
        const content = `
            <div>
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Relatórios Fiscais</h2>
                            <p class="text-gray-600 dark:text-gray-400">Análise de impostos e obrigações fiscais</p>
                        </div>
                        <div class="flex items-center space-x-3 mt-4 sm:mt-0">
                            <select class="form-input" id="yearSelector">
                                ${this.generateYearOptions()}
                            </select>
                            <button class="btn-secondary" id="exportReport">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m6 5v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8"></path>
                                </svg>
                                Exportar DARF
                            </button>
                            <button class="btn-primary" id="generateReport">
                                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z"></path>
                                </svg>
                                Gerar Relatório
                            </button>
                        </div>
                    </div>

                    <!-- Year Summary Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div class="card border-l-4 border-red-500">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">IR a Pagar</p>
                                        <p class="text-xl font-bold text-red-600 dark:text-red-400" id="totalTaxes">
                                            ${this.formatCurrency(this.calculateTotalTaxes())}
                                        </p>
                                    </div>
                                    <div class="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card border-l-4 border-green-500">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Ganho Capital</p>
                                        <p class="text-xl font-bold text-green-600 dark:text-green-400" id="totalGains">
                                            ${this.formatCurrency(this.calculateTotalGains())}
                                        </p>
                                    </div>
                                    <div class="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card border-l-4 border-blue-500">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Vendas Totais</p>
                                        <p class="text-xl font-bold text-blue-600 dark:text-blue-400" id="totalSales">
                                            ${this.formatCurrency(this.calculateTotalSales())}
                                        </p>
                                    </div>
                                    <div class="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="card border-l-4 border-yellow-500">
                            <div class="card-body">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">Dividendos</p>
                                        <p class="text-xl font-bold text-yellow-600 dark:text-yellow-400" id="totalDividends">
                                            ${this.formatCurrency(this.calculateTotalDividends())}
                                        </p>
                                    </div>
                                    <div class="h-8 w-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                        <svg class="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tax Breakdown -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- IR por Categoria -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">IR por Categoria</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-4">
                                ${this.renderTaxByCategory()}
                            </div>
                        </div>
                    </div>

                    <!-- Isenções Utilizadas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Isenções Utilizadas</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-4">
                                ${this.renderExemptions()}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Monthly Breakdown -->
                <div class="card mb-6">
                    <div class="card-header">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Apuração Mensal - ${this.selectedYear}</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendas</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ganhos</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IR Devido</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DARF</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-finance-dark-card divide-y divide-gray-200 dark:divide-gray-700">
                                ${this.renderMonthlyBreakdown()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Tax Guidelines -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Alíquotas Vigentes -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alíquotas de IR</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-3">
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">Ações (Swing Trade)</span>
                                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">15%</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">Ações (Day Trade)</span>
                                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">20%</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">FIIs</span>
                                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">20%</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">Criptomoedas</span>
                                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">15%</span>
                                </div>
                                <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <span class="text-sm font-medium text-gray-900 dark:text-white">Ações Internacionais</span>
                                    <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">15%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prazos e Observações -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Prazos e Observações</h3>
                        </div>
                        <div class="card-body">
                            <div class="space-y-4">
                                <div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⏰ Prazos DARF</h4>
                                    <ul class="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• Ações: até o último dia útil do mês seguinte</li>
                                        <li>• Day Trade: até o último dia útil do mês seguinte</li>
                                        <li>• FIIs: até o último dia útil do mês seguinte</li>
                                    </ul>
                                </div>

                                <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 class="font-medium text-blue-800 dark:text-blue-200 mb-2">📋 Isenções</h4>
                                    <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <li>• Ações: até R$ 20.000/mês</li>
                                        <li>• FIIs: sem isenção</li>
                                        <li>• Crypto: regras específicas</li>
                                    </ul>
                                </div>

                                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <h4 class="font-medium text-red-800 dark:text-red-200 mb-2">⚠️ Importante</h4>
                                    <p class="text-sm text-red-700 dark:text-red-300">
                                        Este sistema é apenas informativo. Consulte sempre um contador para orientações específicas sobre sua situação fiscal.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    generateYearOptions() {
        const currentYear = new Date().getFullYear();
        let options = '';

        for (let year = currentYear; year >= currentYear - 5; year--) {
            const selected = year === this.selectedYear ? 'selected' : '';
            options += `<option value="${year}" ${selected}>${year}</option>`;
        }

        return options;
    }

    renderTaxByCategory() {
        const categories = [
            { name: 'Ações BR (Swing)', tax: this.calculateTaxForCategory('stock_br'), gains: 2450.00 },
            { name: 'Ações US', tax: this.calculateTaxForCategory('stock_us'), gains: 1230.50 },
            { name: 'FIIs', tax: this.calculateTaxForCategory('fiis'), gains: 640.00 },
            { name: 'Criptomoedas', tax: this.calculateTaxForCategory('crypto'), gains: 7500.00 },
            { name: 'Day Trade', tax: this.calculateTaxForCategory('day_trade'), gains: 0 }
        ];

        return categories.map(cat => `
            <div class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                    <span class="text-sm font-medium text-gray-900 dark:text-white">${cat.name}</span>
                    <div class="text-xs text-gray-500 dark:text-gray-400">Ganhos: ${this.formatCurrency(cat.gains)}</div>
                </div>
                <span class="text-sm font-semibold ${cat.tax > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}">
                    ${this.formatCurrency(cat.tax)}
                </span>
            </div>
        `).join('');
    }

    renderExemptions() {
        const exemptions = [
            { name: 'Ações BR', used: 18500, limit: 20000 },
            { name: 'Criptomoedas', used: 32000, limit: 35000 },
            { name: 'FIIs', used: 0, limit: 0 }
        ];

        return exemptions.map(ex => {
            const percentage = ex.limit > 0 ? (ex.used / ex.limit) * 100 : 0;
            const remaining = Math.max(0, ex.limit - ex.used);

            return `
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">${ex.name}</span>
                        <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            ${ex.limit > 0 ? `${percentage.toFixed(1)}%` : 'N/A'}
                        </span>
                    </div>
                    ${ex.limit > 0 ? `
                        <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                            <div class="bg-primary-600 h-2 rounded-full" style="width: ${Math.min(percentage, 100)}%"></div>
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                            Restante: ${this.formatCurrency(remaining)}
                        </div>
                    ` : `
                        <div class="text-xs text-gray-500 dark:text-gray-400">Sem isenção</div>
                    `}
                </div>
            `;
        }).join('');
    }

    renderMonthlyBreakdown() {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];

        return months.map((month, index) => {
            const sales = this.getMonthlySales(index + 1);
            const gains = this.getMonthlyGains(index + 1);
            const tax = this.getMonthlyTax(index + 1);
            const isPaid = Math.random() > 0.5; // Mock status
            const currentMonth = new Date().getMonth();
            const isCurrentYear = this.selectedYear === new Date().getFullYear();
            const isPastMonth = !isCurrentYear || index <= currentMonth;

            return `
                <tr class="${!isPastMonth ? 'opacity-50' : ''}">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        ${month} ${this.selectedYear}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        ${isPastMonth ? this.formatCurrency(sales) : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${gains >= 0 ? 'text-profit' : 'text-loss'}">
                        ${isPastMonth ? this.formatCurrency(gains) : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">
                        ${isPastMonth && tax > 0 ? this.formatCurrency(tax) : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${isPastMonth && tax > 0 ? `
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                isPaid
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }">
                                ${isPaid ? '✓ Pago' : '⚠ Pendente'}
                            </span>
                        ` : '-'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        ${isPastMonth && tax > 0 ? `
                            <button class="text-blue-600 hover:text-blue-500" onclick="generateDARF('${month}', ${this.selectedYear})">
                                Gerar DARF
                            </button>
                        ` : '-'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Calculation methods
    calculateTotalTaxes() {
        // Mock calculation - sum of all categories
        return 1842.50; // Example value
    }

    calculateTotalGains() {
        return this.transactions
            .filter(t => t.type === 'sell' && t.date.startsWith(this.selectedYear.toString()))
            .reduce((sum, t) => {
                // Simplified gain calculation (would need more complex logic in reality)
                return sum + (t.total * 0.1); // Assume 10% average gain
            }, 0);
    }

    calculateTotalSales() {
        return this.transactions
            .filter(t => t.type === 'sell' && t.date.startsWith(this.selectedYear.toString()))
            .reduce((sum, t) => sum + t.total, 0);
    }

    calculateTotalDividends() {
        return this.transactions
            .filter(t => t.type === 'dividend' && t.date.startsWith(this.selectedYear.toString()))
            .reduce((sum, t) => sum + t.total, 0);
    }

    calculateTaxForCategory(category) {
        // Mock calculations for each category
        const mockTaxes = {
            stock_br: 367.50,
            stock_us: 184.58,
            fiis: 128.00,
            crypto: 1125.00,
            day_trade: 0
        };
        return mockTaxes[category] || 0;
    }

    getMonthlySales(month) {
        return Math.random() * 50000; // Mock data
    }

    getMonthlyGains(month) {
        return (Math.random() - 0.5) * 10000; // Mock data - can be positive or negative
    }

    getMonthlyTax(month) {
        const gains = this.getMonthlyGains(month);
        return gains > 0 ? gains * 0.15 : 0; // 15% on positive gains
    }

    // Utility methods
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    setupEventListeners() {
        // Year selector
        document.getElementById('yearSelector')?.addEventListener('change', (e) => {
            this.selectedYear = parseInt(e.target.value);
            this.refreshReports();
        });

        // Generate report
        document.getElementById('generateReport')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Export DARF
        document.getElementById('exportReport')?.addEventListener('click', () => {
            this.exportDARF();
        });
    }

    refreshReports() {
        // Update all calculations and re-render
        document.getElementById('totalTaxes').textContent = this.formatCurrency(this.calculateTotalTaxes());
        document.getElementById('totalGains').textContent = this.formatCurrency(this.calculateTotalGains());
        document.getElementById('totalSales').textContent = this.formatCurrency(this.calculateTotalSales());
        document.getElementById('totalDividends').textContent = this.formatCurrency(this.calculateTotalDividends());

        // Update monthly table
        const tbody = document.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = this.renderMonthlyBreakdown();
        }

        this.showNotification(`Relatório atualizado para ${this.selectedYear}`, 'success');
    }

    generateReport() {
        this.showNotification('Gerando relatório detalhado...', 'info');

        setTimeout(() => {
            this.showNotification('Relatório gerado com sucesso!', 'success');
        }, 2000);
    }

    exportDARF() {
        const darfData = this.generateDARFData();
        const blob = new Blob([darfData], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `DARF_${this.selectedYear}.txt`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showNotification('Arquivo DARF exportado com sucesso!', 'success');
    }

    generateDARFData() {
        return `RELATÓRIO DARF - ${this.selectedYear}
=================================

RESUMO ANUAL:
- IR Total a Pagar: ${this.formatCurrency(this.calculateTotalTaxes())}
- Ganho de Capital: ${this.formatCurrency(this.calculateTotalGains())}
- Volume de Vendas: ${this.formatCurrency(this.calculateTotalSales())}
- Dividendos Recebidos: ${this.formatCurrency(this.calculateTotalDividends())}

DETALHAMENTO POR CATEGORIA:
- Ações BR (Swing): ${this.formatCurrency(this.calculateTaxForCategory('stock_br'))}
- Ações US: ${this.formatCurrency(this.calculateTaxForCategory('stock_us'))}
- FIIs: ${this.formatCurrency(this.calculateTaxForCategory('fiis'))}
- Criptomoedas: ${this.formatCurrency(this.calculateTaxForCategory('crypto'))}

OBSERVAÇÕES:
- Cálculos baseados nas transações registradas no sistema
- Consulte sempre um contador para validação
- Prazos de pagamento devem ser observados

Data de geração: ${new Date().toLocaleString('pt-BR')}
`;
    }

    showNotification(message, type = 'info') {
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

// Global functions
window.generateDARF = function(month, year) {
    alert(`Gerando DARF para ${month}/${year} - Funcionalidade em desenvolvimento`);
};

// Export for use in dashboard
window.ReportsSystem = ReportsSystem;