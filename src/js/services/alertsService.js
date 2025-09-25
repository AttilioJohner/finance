// Serviço de Alertas de Preço
class AlertsService {
    constructor() {
        this.alerts = this.loadAlerts();
        this.activeAlerts = new Map();
        this.checkInterval = 30000; // 30 segundos
        this.intervalId = null;
        this.soundEnabled = true;
        this.notificationsEnabled = true;
        this.init();
    }

    init() {
        this.startMonitoring();
        this.setupEventListeners();
        console.log('Alerts Service initialized with', this.alerts.length, 'alerts');
    }

    loadAlerts() {
        const stored = localStorage.getItem('financial_alerts') || '[]';
        return JSON.parse(stored);
    }

    saveAlerts() {
        localStorage.setItem('financial_alerts', JSON.stringify(this.alerts));
    }

    createAlert(alertData) {
        const alert = {
            id: this.generateId(),
            symbol: alertData.symbol.toUpperCase(),
            name: alertData.name || alertData.symbol,
            type: alertData.type, // 'above', 'below', 'change_percent'
            value: parseFloat(alertData.value),
            condition: alertData.condition || 'once', // 'once', 'always'
            enabled: true,
            triggered: false,
            createdAt: new Date().toISOString(),
            lastChecked: null,
            triggerCount: 0,
            notes: alertData.notes || ''
        };

        this.alerts.push(alert);
        this.saveAlerts();

        return alert;
    }

    updateAlert(id, updateData) {
        const alertIndex = this.alerts.findIndex(a => a.id === id);
        if (alertIndex === -1) return null;

        this.alerts[alertIndex] = { ...this.alerts[alertIndex], ...updateData };
        this.saveAlerts();

        return this.alerts[alertIndex];
    }

    deleteAlert(id) {
        this.alerts = this.alerts.filter(a => a.id !== id);
        this.saveAlerts();
    }

    enableAlert(id) {
        this.updateAlert(id, { enabled: true, triggered: false });
    }

    disableAlert(id) {
        this.updateAlert(id, { enabled: false });
    }

    async startMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        this.intervalId = setInterval(async () => {
            await this.checkAlerts();
        }, this.checkInterval);

        console.log('Alert monitoring started');
    }

    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        console.log('Alert monitoring stopped');
    }

    async checkAlerts() {
        const enabledAlerts = this.alerts.filter(a => a.enabled && !a.triggered);

        if (enabledAlerts.length === 0) return;

        try {
            // Buscar cotações para todos os símbolos únicos
            const symbols = [...new Set(enabledAlerts.map(a => a.symbol))];
            const quotes = await this.getQuotesForSymbols(symbols);

            for (const alert of enabledAlerts) {
                const quote = quotes.find(q => q.symbol === alert.symbol);
                if (!quote) continue;

                const shouldTrigger = this.checkAlertCondition(alert, quote);

                if (shouldTrigger) {
                    await this.triggerAlert(alert, quote);
                }

                // Update last checked
                this.updateAlert(alert.id, { lastChecked: new Date().toISOString() });
            }

        } catch (error) {
            console.error('Error checking alerts:', error);
        }
    }

    async getQuotesForSymbols(symbols) {
        const quotes = [];

        for (const symbol of symbols) {
            try {
                let type = this.determineAssetType(symbol);
                const quote = await window.quotesService.getQuote(symbol, type);
                quotes.push({
                    symbol: symbol,
                    price: quote.price,
                    change: quote.change,
                    changePercent: quote.changePercent
                });
            } catch (error) {
                console.warn(`Failed to get quote for ${symbol}:`, error);
            }
        }

        return quotes;
    }

    determineAssetType(symbol) {
        // Heurísticas para determinar tipo do ativo
        if (symbol.endsWith('3') || symbol.endsWith('4') || symbol.endsWith('11')) {
            return 'stock_br';
        }
        if (['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP'].includes(symbol)) {
            return 'crypto';
        }
        if (['USD', 'EUR', 'GBP', 'JPY'].includes(symbol)) {
            return 'currency';
        }
        return 'stock_us'; // Default
    }

    checkAlertCondition(alert, quote) {
        switch (alert.type) {
            case 'above':
                return quote.price >= alert.value;

            case 'below':
                return quote.price <= alert.value;

            case 'change_percent_positive':
                return quote.changePercent >= alert.value;

            case 'change_percent_negative':
                return quote.changePercent <= -Math.abs(alert.value);

            case 'volume_above':
                return quote.volume >= alert.value;

            default:
                return false;
        }
    }

    async triggerAlert(alert, quote) {
        console.log('Triggering alert:', alert.symbol, alert.type, alert.value);

        // Update alert status
        this.updateAlert(alert.id, {
            triggered: alert.condition === 'once',
            triggerCount: alert.triggerCount + 1,
            lastTriggered: new Date().toISOString()
        });

        // Create notification message
        const message = this.createAlertMessage(alert, quote);

        // Show browser notification
        if (this.notificationsEnabled) {
            await this.showNotification(alert, message, quote);
        }

        // Show in-app notification
        this.showInAppNotification(alert, message);

        // Play sound
        if (this.soundEnabled) {
            this.playAlertSound();
        }

        // Log to console
        console.log(`🚨 ALERT: ${message}`);

        // Trigger custom event
        this.dispatchAlertEvent(alert, quote);
    }

    createAlertMessage(alert, quote) {
        const price = this.formatCurrency(quote.price);

        switch (alert.type) {
            case 'above':
                return `${alert.symbol} subiu acima de ${this.formatCurrency(alert.value)}! Preço atual: ${price}`;

            case 'below':
                return `${alert.symbol} desceu abaixo de ${this.formatCurrency(alert.value)}! Preço atual: ${price}`;

            case 'change_percent_positive':
                return `${alert.symbol} subiu ${quote.changePercent.toFixed(2)}%! Meta: +${alert.value}%`;

            case 'change_percent_negative':
                return `${alert.symbol} caiu ${Math.abs(quote.changePercent).toFixed(2)}%! Meta: -${alert.value}%`;

            default:
                return `Alerta para ${alert.symbol}: ${price}`;
        }
    }

    async showNotification(alert, message, quote) {
        if (!window.pwaService) return;

        try {
            await window.pwaService.sendNotification(`Alerta de Preço - ${alert.symbol}`, {
                body: message,
                icon: '/src/assets/icons/icon-192x192.png',
                badge: '/src/assets/icons/alert-96.png',
                tag: `price-alert-${alert.id}`,
                requireInteraction: true,
                actions: [
                    {
                        action: 'view',
                        title: 'Ver Dashboard'
                    },
                    {
                        action: 'disable',
                        title: 'Desabilitar'
                    }
                ],
                data: {
                    alertId: alert.id,
                    symbol: alert.symbol,
                    price: quote.price
                }
            });
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    showInAppNotification(alert, message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-up';
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                </div>
                <div class="flex-1">
                    <p class="font-medium text-sm">🚨 Alerta de Preço</p>
                    <p class="text-sm mt-1">${message}</p>
                    <div class="flex items-center space-x-2 mt-3">
                        <button class="bg-white text-yellow-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100" onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); window.alertsService?.disableAlert('${alert.id}')">
                            Desabilitar
                        </button>
                        <button class="text-white/80 hover:text-white text-xs" onclick="this.parentElement.parentElement.parentElement.parentElement.remove()">
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    playAlertSound() {
        try {
            // Create audio context for alert sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);

        } catch (error) {
            console.warn('Failed to play alert sound:', error);
        }
    }

    dispatchAlertEvent(alert, quote) {
        const event = new CustomEvent('priceAlert', {
            detail: {
                alert: alert,
                quote: quote,
                timestamp: new Date().toISOString()
            }
        });

        window.dispatchEvent(event);
    }

    setupEventListeners() {
        // Listen for notification interactions
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                const { type, data } = event.data;

                if (type === 'NOTIFICATION_CLICK' && data.alertId) {
                    if (data.action === 'disable') {
                        this.disableAlert(data.alertId);
                    }
                }
            });
        }
    }

    // UI Helper methods
    renderAlertsManager() {
        return `
            <div class="card">
                <div class="card-header">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Alertas de Preço</h3>
                        <button class="btn-primary" id="addAlertBtn">
                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                            Novo Alerta
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    ${this.alerts.length === 0 ? this.renderEmptyState() : this.renderAlertsList()}
                </div>
            </div>

            <!-- Add Alert Modal -->
            <div id="addAlertModal" class="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                    <div class="p-6">
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Criar Novo Alerta</h3>

                        <form id="addAlertForm" class="space-y-4">
                            <div>
                                <label class="form-label">Ativo</label>
                                <input type="text" id="alertSymbol" class="form-input" placeholder="Ex: PETR4, AAPL, BTC" required>
                            </div>

                            <div>
                                <label class="form-label">Tipo de Alerta</label>
                                <select id="alertType" class="form-input" required>
                                    <option value="above">Preço acima de</option>
                                    <option value="below">Preço abaixo de</option>
                                    <option value="change_percent_positive">Variação positiva de</option>
                                    <option value="change_percent_negative">Variação negativa de</option>
                                </select>
                            </div>

                            <div>
                                <label class="form-label">Valor</label>
                                <input type="number" id="alertValue" class="form-input" step="0.01" placeholder="0.00" required>
                            </div>

                            <div>
                                <label class="form-label">Condição</label>
                                <select id="alertCondition" class="form-input">
                                    <option value="once">Disparar uma vez</option>
                                    <option value="always">Sempre que atingir</option>
                                </select>
                            </div>

                            <div>
                                <label class="form-label">Observações (opcional)</label>
                                <textarea id="alertNotes" class="form-input" rows="3" placeholder="Motivo do alerta..."></textarea>
                            </div>

                            <div class="flex items-center justify-end space-x-3 pt-4">
                                <button type="button" class="btn-secondary" onclick="document.getElementById('addAlertModal').classList.add('hidden')">
                                    Cancelar
                                </button>
                                <button type="submit" class="btn-primary">
                                    Criar Alerta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5z"></path>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhum alerta configurado</h3>
                <p class="text-gray-500 dark:text-gray-400 mb-4">Configure alertas para ser notificado sobre mudanças de preço</p>
                <button class="btn-primary" onclick="document.getElementById('addAlertModal').classList.remove('hidden')">
                    Criar Primeiro Alerta
                </button>
            </div>
        `;
    }

    renderAlertsList() {
        return `
            <div class="space-y-3">
                ${this.alerts.map(alert => this.renderAlertItem(alert)).join('')}
            </div>
        `;
    }

    renderAlertItem(alert) {
        const typeLabels = {
            above: 'Acima de',
            below: 'Abaixo de',
            change_percent_positive: 'Variação +',
            change_percent_negative: 'Variação -'
        };

        const statusColor = alert.enabled ?
            (alert.triggered ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400') :
            'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';

        const statusText = alert.enabled ?
            (alert.triggered ? 'Disparado' : 'Ativo') :
            'Desabilitado';

        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex-1">
                    <div class="flex items-center space-x-3">
                        <h4 class="font-medium text-gray-900 dark:text-white">${alert.symbol}</h4>
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}">
                            ${statusText}
                        </span>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        ${typeLabels[alert.type]} ${alert.type.includes('change_percent') ? alert.value + '%' : this.formatCurrency(alert.value)}
                    </p>
                    ${alert.lastTriggered ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Último disparo: ${this.formatDate(alert.lastTriggered)}</p>` : ''}
                </div>
                <div class="flex items-center space-x-2">
                    <button class="text-blue-600 hover:text-blue-500" onclick="alertsService.${alert.enabled ? 'disableAlert' : 'enableAlert'}('${alert.id}')" title="${alert.enabled ? 'Desabilitar' : 'Habilitar'}">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${alert.enabled ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636' : 'M15 17h5l-5 5v-5z'}"></path>
                        </svg>
                    </button>
                    <button class="text-red-600 hover:text-red-500" onclick="alertsService.deleteAlert('${alert.id}')" title="Excluir">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    setupUIEventListeners() {
        // Add alert form
        document.getElementById('addAlertForm')?.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = {
                symbol: document.getElementById('alertSymbol').value,
                type: document.getElementById('alertType').value,
                value: document.getElementById('alertValue').value,
                condition: document.getElementById('alertCondition').value,
                notes: document.getElementById('alertNotes').value
            };

            this.createAlert(formData);
            document.getElementById('addAlertModal').classList.add('hidden');
            document.getElementById('addAlertForm').reset();

            // Refresh UI
            this.refreshAlertsUI();
        });

        // Add alert button
        document.getElementById('addAlertBtn')?.addEventListener('click', () => {
            document.getElementById('addAlertModal').classList.remove('hidden');
        });
    }

    refreshAlertsUI() {
        const container = document.getElementById('alertsContainer');
        if (container) {
            container.innerHTML = this.renderAlertsManager();
            this.setupUIEventListeners();
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    // Settings
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        localStorage.setItem('alerts_sound_enabled', enabled);
    }

    setNotificationsEnabled(enabled) {
        this.notificationsEnabled = enabled;
        localStorage.setItem('alerts_notifications_enabled', enabled);
    }

    setCheckInterval(seconds) {
        this.checkInterval = seconds * 1000;
        this.startMonitoring(); // Restart with new interval
        localStorage.setItem('alerts_check_interval', seconds);
    }

    getStats() {
        return {
            total: this.alerts.length,
            active: this.alerts.filter(a => a.enabled && !a.triggered).length,
            triggered: this.alerts.filter(a => a.triggered).length,
            disabled: this.alerts.filter(a => !a.enabled).length
        };
    }
}

// Create global instance
window.alertsService = new AlertsService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertsService;
}