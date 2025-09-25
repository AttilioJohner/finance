// Sistema de Operações
class OperationsSystem {
    constructor() {
        this.operationData = {
            type: 'buy',
            asset: '',
            quantity: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            fees: 0,
            notes: ''
        };
        this.assetSuggestions = this.getAssetSuggestions();
    }

    getAssetSuggestions() {
        return [
            // Ações BR (Janeiro 2025 - preços realistas)
            { symbol: 'PETR4', name: 'Petrobras PN', type: 'stock_br', price: 38.45 },
            { symbol: 'VALE3', name: 'Vale ON', type: 'stock_br', price: 62.15 },
            { symbol: 'ITUB4', name: 'Itau Unibanco PN', type: 'stock_br', price: 33.25 },
            { symbol: 'BBAS3', name: 'Banco do Brasil ON', type: 'stock_br', price: 26.80 },
            { symbol: 'BBDC4', name: 'Bradesco PN', type: 'stock_br', price: 13.85 },
            { symbol: 'WEGE3', name: 'Weg ON', type: 'stock_br', price: 45.75 },
            { symbol: 'ABEV3', name: 'Ambev SA ON', type: 'stock_br', price: 10.95 },
            { symbol: 'JBSS3', name: 'JBS ON', type: 'stock_br', price: 28.50 },
            { symbol: 'MGLU3', name: 'Magazine Luiza ON', type: 'stock_br', price: 8.90 },

            // Ações US (USD convertido para BRL ~5.50)
            { symbol: 'AAPL', name: 'Apple Inc', type: 'stock_us', price: 962.50 }, // ~175 USD
            { symbol: 'MSFT', name: 'Microsoft Corp', type: 'stock_us', price: 2475.00 }, // ~450 USD
            { symbol: 'GOOGL', name: 'Alphabet Inc', type: 'stock_us', price: 907.50 }, // ~165 USD
            { symbol: 'AMZN', name: 'Amazon.com Inc', type: 'stock_us', price: 1017.50 }, // ~185 USD
            { symbol: 'TSLA', name: 'Tesla Inc', type: 'stock_us', price: 1870.00 }, // ~340 USD
            { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'stock_us', price: 742.50 }, // ~135 USD
            { symbol: 'META', name: 'Meta Platforms Inc', type: 'stock_us', price: 2970.00 }, // ~540 USD

            // Criptomoedas (BRL)
            { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', price: 525000.00 }, // ~95k USD
            { symbol: 'ETH', name: 'Ethereum', type: 'crypto', price: 20350.00 }, // ~3.7k USD
            { symbol: 'BNB', name: 'Binance Coin', type: 'crypto', price: 4015.00 }, // ~730 USD
            { symbol: 'ADA', name: 'Cardano', type: 'crypto', price: 5.22 }, // ~0.95 USD
            { symbol: 'SOL', name: 'Solana', type: 'crypto', price: 1034.50 }, // ~188 USD
            { symbol: 'XRP', name: 'XRP', type: 'crypto', price: 12.65 }, // ~2.30 USD

            // Moedas
            { symbol: 'USD', name: 'Dólar Americano', type: 'currency', price: 5.52 },
            { symbol: 'EUR', name: 'Euro', type: 'currency', price: 5.75 },
            { symbol: 'GBP', name: 'Libra Esterlina', type: 'currency', price: 6.82 },
            { symbol: 'JPY', name: 'Iene Japonês', type: 'currency', price: 0.0355 }, // por 100 ienes

            // Fundos Imobiliários
            { symbol: 'HGLG11', name: 'CSHG Logística FII', type: 'real_estate', price: 108.90 },
            { symbol: 'XPML11', name: 'XP Malls FII', type: 'real_estate', price: 98.75 },
            { symbol: 'KNRI11', name: 'Kinea Renda Imobiliária FII', type: 'real_estate', price: 92.15 },
            { symbol: 'BCFF11', name: 'BC Ffii Fundo', type: 'real_estate', price: 75.40 },
            { symbol: 'VILG11', name: 'Vila Olímpia Corporate FII', type: 'real_estate', price: 82.30 }
        ];
    }

    renderOperationsContent() {
        const content = `
            <div class="max-w-4xl mx-auto">
                <!-- Header -->
                <div class="mb-8">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Nova Operação</h2>
                    <p class="text-gray-600 dark:text-gray-400">Registre suas operações de compra, venda e outras transações</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Operation Form -->
                    <div class="lg:col-span-2">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Dados da Operação</h3>
                            </div>
                            <div class="card-body">
                                <form id="operationForm" class="space-y-6">
                                    <!-- Operation Type -->
                                    <div>
                                        <label class="form-label">Tipo de Operação</label>
                                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            <button type="button" class="operation-type-btn active" data-type="buy">
                                                <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                                </svg>
                                                Compra
                                            </button>
                                            <button type="button" class="operation-type-btn" data-type="sell">
                                                <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 12H6"></path>
                                                </svg>
                                                Venda
                                            </button>
                                            <button type="button" class="operation-type-btn" data-type="dividend">
                                                <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                Dividendo
                                            </button>
                                            <button type="button" class="operation-type-btn" data-type="split">
                                                <svg class="h-5 w-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                                                </svg>
                                                Split
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Asset Selection -->
                                    <div>
                                        <label for="assetInput" class="form-label">Ativo</label>
                                        <div class="relative">
                                            <input
                                                type="text"
                                                id="assetInput"
                                                class="form-input"
                                                placeholder="Digite o código do ativo (ex: PETR4, AAPL, BTC)"
                                                autocomplete="off">
                                            <div id="assetSuggestions" class="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 hidden max-h-48 overflow-y-auto">
                                            </div>
                                        </div>
                                        <div id="selectedAssetInfo" class="mt-2 hidden">
                                            <div class="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <div class="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300 mr-3" id="assetIcon">
                                                    📊
                                                </div>
                                                <div class="flex-1">
                                                    <p class="font-medium text-gray-900 dark:text-white" id="assetName">-</p>
                                                    <p class="text-sm text-gray-500 dark:text-gray-400">Preço atual: <span id="assetCurrentPrice">-</span></p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Quantity and Price -->
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label for="quantityInput" class="form-label">Quantidade</label>
                                            <input
                                                type="number"
                                                id="quantityInput"
                                                class="form-input"
                                                placeholder="0"
                                                step="any"
                                                min="0">
                                        </div>
                                        <div>
                                            <label for="priceInput" class="form-label">Preço Unitário</label>
                                            <div class="relative">
                                                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
                                                <input
                                                    type="number"
                                                    id="priceInput"
                                                    class="form-input pl-8"
                                                    placeholder="0,00"
                                                    step="0.01"
                                                    min="0">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Date and Fees -->
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label for="dateInput" class="form-label">Data da Operação</label>
                                            <input
                                                type="date"
                                                id="dateInput"
                                                class="form-input"
                                                value="${this.operationData.date}">
                                        </div>
                                        <div>
                                            <label for="feesInput" class="form-label">Taxa/Corretagem</label>
                                            <div class="relative">
                                                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">R$</span>
                                                <input
                                                    type="number"
                                                    id="feesInput"
                                                    class="form-input pl-8"
                                                    placeholder="0,00"
                                                    step="0.01"
                                                    min="0"
                                                    value="0">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Notes -->
                                    <div>
                                        <label for="notesInput" class="form-label">Observações (Opcional)</label>
                                        <textarea
                                            id="notesInput"
                                            class="form-input"
                                            rows="3"
                                            placeholder="Adicione observações sobre esta operação..."></textarea>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="flex items-center justify-between pt-4">
                                        <button type="button" class="btn-secondary" id="clearForm">
                                            Limpar Formulário
                                        </button>
                                        <button type="submit" class="btn-primary" id="submitOperation">
                                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                            Registrar Operação
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <!-- Operation Summary -->
                    <div class="space-y-6">
                        <!-- Summary Card -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Resumo da Operação</h3>
                            </div>
                            <div class="card-body space-y-4">
                                <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span class="text-gray-600 dark:text-gray-400">Tipo:</span>
                                    <span class="font-medium text-gray-900 dark:text-white" id="summaryType">Compra</span>
                                </div>
                                <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span class="text-gray-600 dark:text-gray-400">Ativo:</span>
                                    <span class="font-medium text-gray-900 dark:text-white" id="summaryAsset">-</span>
                                </div>
                                <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span class="text-gray-600 dark:text-gray-400">Quantidade:</span>
                                    <span class="font-medium text-gray-900 dark:text-white" id="summaryQuantity">-</span>
                                </div>
                                <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span class="text-gray-600 dark:text-gray-400">Preço Unitário:</span>
                                    <span class="font-medium text-gray-900 dark:text-white" id="summaryPrice">-</span>
                                </div>
                                <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                    <span class="text-gray-600 dark:text-gray-400">Taxas:</span>
                                    <span class="font-medium text-gray-900 dark:text-white" id="summaryFees">R$ 0,00</span>
                                </div>
                                <div class="flex justify-between items-center py-3 bg-gray-50 dark:bg-gray-700 rounded-lg px-3">
                                    <span class="font-semibold text-gray-900 dark:text-white">Total:</span>
                                    <span class="text-xl font-bold text-primary-600 dark:text-primary-400" id="summaryTotal">R$ 0,00</span>
                                </div>
                            </div>
                        </div>

                        <!-- Quick Actions -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ações Rápidas</h3>
                            </div>
                            <div class="card-body space-y-3">
                                <button class="w-full btn-secondary text-left" onclick="fillQuickOperation('PETR4', 'buy')">
                                    <div class="flex items-center">
                                        <span class="mr-3">🇧🇷</span>
                                        <div>
                                            <div class="font-medium">Comprar PETR4</div>
                                            <div class="text-sm text-gray-500">R$ 32,80</div>
                                        </div>
                                    </div>
                                </button>
                                <button class="w-full btn-secondary text-left" onclick="fillQuickOperation('AAPL', 'buy')">
                                    <div class="flex items-center">
                                        <span class="mr-3">🇺🇸</span>
                                        <div>
                                            <div class="font-medium">Comprar AAPL</div>
                                            <div class="text-sm text-gray-500">R$ 175,50</div>
                                        </div>
                                    </div>
                                </button>
                                <button class="w-full btn-secondary text-left" onclick="fillQuickOperation('BTC', 'buy')">
                                    <div class="flex items-center">
                                        <span class="mr-3">₿</span>
                                        <div>
                                            <div class="font-medium">Comprar BTC</div>
                                            <div class="text-sm text-gray-500">R$ 42.500,00</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <!-- Tips -->
                        <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div class="flex">
                                <svg class="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <div>
                                    <h4 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">💡 Dicas</h4>
                                    <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                        <li>• Use códigos exatos dos ativos</li>
                                        <li>• Inclua sempre as taxas de corretagem</li>
                                        <li>• Confira os dados antes de confirmar</li>
                                        <li>• Mantenha registros organizados</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return content;
    }

    setupEventListeners() {
        // Operation type buttons
        document.querySelectorAll('.operation-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectOperationType(e));
        });

        // Asset input with suggestions
        const assetInput = document.getElementById('assetInput');
        if (assetInput) {
            assetInput.addEventListener('input', (e) => this.handleAssetInput(e));
            assetInput.addEventListener('blur', () => {
                // Delay hiding suggestions to allow clicks
                setTimeout(() => this.hideSuggestions(), 200);
            });
        }

        // Form inputs for real-time summary update
        ['quantityInput', 'priceInput', 'feesInput'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => this.updateSummary());
            }
        });

        // Form submission
        const form = document.getElementById('operationForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Clear form button
        const clearBtn = document.getElementById('clearForm');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearForm());
        }
    }

    selectOperationType(event) {
        // Remove active class from all buttons
        document.querySelectorAll('.operation-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to clicked button
        event.currentTarget.classList.add('active');

        // Update operation data
        this.operationData.type = event.currentTarget.dataset.type;

        // Update summary
        this.updateSummary();
    }

    handleAssetInput(event) {
        const value = event.target.value.toUpperCase();
        this.operationData.asset = value;

        if (value.length > 0) {
            this.showSuggestions(value);
        } else {
            this.hideSuggestions();
            this.hideAssetInfo();
        }
    }

    showSuggestions(searchTerm) {
        const suggestions = this.assetSuggestions.filter(asset =>
            asset.symbol.includes(searchTerm) || asset.name.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 8);

        const container = document.getElementById('assetSuggestions');
        if (!container) return;

        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        const typeIcons = {
            stock_br: '🇧🇷',
            stock_us: '🇺🇸',
            crypto: '₿',
            currency: '💵',
            real_estate: '🏢'
        };

        container.innerHTML = suggestions.map(asset => `
            <div class="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                 onclick="selectAsset('${asset.symbol}')">
                <div class="flex items-center">
                    <span class="mr-3 text-lg">${typeIcons[asset.type] || '📊'}</span>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">${asset.symbol}</div>
                        <div class="text-sm text-gray-500 dark:text-gray-400">${asset.name}</div>
                    </div>
                    <div class="ml-auto text-right">
                        <div class="font-medium text-gray-900 dark:text-white">${this.formatCurrency(asset.price)}</div>
                    </div>
                </div>
            </div>
        `).join('');

        container.classList.remove('hidden');
    }

    hideSuggestions() {
        const container = document.getElementById('assetSuggestions');
        if (container) {
            container.classList.add('hidden');
        }
    }

    selectAsset(symbol) {
        const asset = this.assetSuggestions.find(a => a.symbol === symbol);
        if (!asset) return;

        // Update input
        const input = document.getElementById('assetInput');
        if (input) input.value = symbol;

        // Update price input with current price
        const priceInput = document.getElementById('priceInput');
        if (priceInput) priceInput.value = asset.price.toFixed(2);

        // Show asset info
        this.showAssetInfo(asset);

        // Hide suggestions
        this.hideSuggestions();

        // Update summary
        this.operationData.asset = symbol;
        this.operationData.price = asset.price;
        this.updateSummary();
    }

    showAssetInfo(asset) {
        const container = document.getElementById('selectedAssetInfo');
        const icon = document.getElementById('assetIcon');
        const name = document.getElementById('assetName');
        const price = document.getElementById('assetCurrentPrice');

        if (container && icon && name && price) {
            const typeIcons = {
                stock_br: '🇧🇷',
                stock_us: '🇺🇸',
                crypto: '₿',
                currency: '💵',
                real_estate: '🏢'
            };

            icon.textContent = typeIcons[asset.type] || '📊';
            name.textContent = asset.name;
            price.textContent = this.formatCurrency(asset.price);

            container.classList.remove('hidden');
        }
    }

    hideAssetInfo() {
        const container = document.getElementById('selectedAssetInfo');
        if (container) {
            container.classList.add('hidden');
        }
    }

    updateSummary() {
        const typeLabels = {
            buy: 'Compra',
            sell: 'Venda',
            dividend: 'Dividendo',
            split: 'Split'
        };

        const quantity = parseFloat(document.getElementById('quantityInput')?.value || 0);
        const price = parseFloat(document.getElementById('priceInput')?.value || 0);
        const fees = parseFloat(document.getElementById('feesInput')?.value || 0);

        const total = (quantity * price) + fees;

        // Update summary display
        document.getElementById('summaryType').textContent = typeLabels[this.operationData.type] || 'Compra';
        document.getElementById('summaryAsset').textContent = this.operationData.asset || '-';
        document.getElementById('summaryQuantity').textContent = quantity > 0 ? this.formatQuantity(quantity) : '-';
        document.getElementById('summaryPrice').textContent = price > 0 ? this.formatCurrency(price) : '-';
        document.getElementById('summaryFees').textContent = this.formatCurrency(fees);
        document.getElementById('summaryTotal').textContent = this.formatCurrency(total);
    }

    handleSubmit(event) {
        event.preventDefault();

        // Get form data
        const formData = {
            type: this.operationData.type,
            asset: document.getElementById('assetInput').value.toUpperCase(),
            quantity: parseFloat(document.getElementById('quantityInput').value || 0),
            price: parseFloat(document.getElementById('priceInput').value || 0),
            date: document.getElementById('dateInput').value,
            fees: parseFloat(document.getElementById('feesInput').value || 0),
            notes: document.getElementById('notesInput').value
        };

        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Save operation (mock implementation)
        this.saveOperation(formData);

        // Show success message
        this.showNotification('Operação registrada com sucesso!', 'success');

        // Clear form
        this.clearForm();
    }

    validateForm(data) {
        const errors = [];

        if (!data.asset.trim()) {
            errors.push('Ativo é obrigatório');
        }

        if (data.quantity <= 0) {
            errors.push('Quantidade deve ser maior que zero');
        }

        if (data.price <= 0 && data.type !== 'split') {
            errors.push('Preço deve ser maior que zero');
        }

        if (!data.date) {
            errors.push('Data é obrigatória');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('\n'), 'error');
            return false;
        }

        return true;
    }

    saveOperation(data) {
        // Get existing operations
        const operations = JSON.parse(localStorage.getItem('financial_operations') || '[]');

        // Add new operation
        const operation = {
            id: Date.now().toString(),
            ...data,
            timestamp: new Date().toISOString(),
            total: (data.quantity * data.price) + data.fees
        };

        operations.push(operation);

        // Save to localStorage
        localStorage.setItem('financial_operations', JSON.stringify(operations));

        // Log for debugging
        console.log('Operation saved:', operation);
    }

    clearForm() {
        // Reset form
        document.getElementById('operationForm').reset();

        // Reset operation data
        this.operationData = {
            type: 'buy',
            asset: '',
            quantity: '',
            price: '',
            date: new Date().toISOString().split('T')[0],
            fees: 0,
            notes: ''
        };

        // Reset UI
        document.querySelectorAll('.operation-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.operation-type-btn[data-type="buy"]').classList.add('active');

        // Hide asset info and suggestions
        this.hideAssetInfo();
        this.hideSuggestions();

        // Update summary
        this.updateSummary();
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    formatQuantity(quantity) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        }).format(quantity || 0);
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

// Global functions for quick operations
window.selectAsset = function(symbol) {
    if (window.currentOperationsSystem) {
        window.currentOperationsSystem.selectAsset(symbol);
    }
};

window.fillQuickOperation = function(symbol, type) {
    if (window.currentOperationsSystem) {
        // Set operation type
        document.querySelector(`[data-type="${type}"]`).click();

        // Fill asset
        window.currentOperationsSystem.selectAsset(symbol);

        // Focus on quantity input
        document.getElementById('quantityInput').focus();
    }
};

// Export for use in dashboard
window.OperationsSystem = OperationsSystem;