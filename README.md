# 💰 Financial Control System

Sistema completo de controle pessoal de finanças desenvolvido com HTML, CSS (Tailwind), JavaScript e integração com APIs de cotações em tempo real.

## 🚀 Funcionalidades

### ✅ **Implementado**
- [x] Sistema de login com autenticação
- [x] Interface moderna com Tailwind CSS
- [x] Dark/Light mode
- [x] Design responsivo

### 🔄 **Em Desenvolvimento**
- [ ] Dashboard com métricas em tempo real
- [ ] Gestão de portfólio multi-classe
- [ ] Registro de operações (compra/venda)
- [ ] Integração com APIs de cotações
- [ ] Análise de performance

### 📋 **Roadmap**
- [ ] Calculadoras financeiras
- [ ] Relatórios fiscais (IR)
- [ ] Import/Export de dados
- [ ] PWA (Progressive Web App)

## 🏗️ Arquitetura

```
src/
├── styles/
│   ├── input.css          # Tailwind + componentes customizados
│   └── output.css         # CSS compilado
├── js/
│   ├── utils/
│   │   ├── constants.js   # Constantes do sistema
│   │   └── helpers.js     # Funções utilitárias
│   ├── components/
│   │   ├── auth/          # Sistema de autenticação
│   │   ├── ui/            # Componentes de interface
│   │   ├── financial/     # Componentes financeiros
│   │   └── dashboard/     # Dashboard principal
│   ├── services/          # Integração com APIs
│   └── controllers/       # Lógica de negócio
├── pages/                 # Páginas da aplicação
├── assets/                # Recursos estáticos
└── index.html            # Página de login
```

## 🎨 Design System

### **Paleta de Cores**
- **Primary**: #3b82f6 (azul confiança)
- **Success**: #10b981 (verde lucro)
- **Danger**: #ef4444 (vermelho perda)
- **Warning**: #f59e0b (amarelo alerta)

### **Componentes**
- Cards responsivos
- Formulários com validação
- Indicadores financeiros
- Gráficos interativos
- Notificações toast

## 🔧 Como Executar

### **Desenvolvimento**
```bash
# Instalar dependências
npm install

# Compilar CSS (modo watch)
npm run build-css

# Servidor de desenvolvimento
npm run dev
```

### **Produção**
```bash
# Build para produção
npm run build

# Deploy para GitHub
npm run deploy
```

## 🌐 Acesso Demo

**URL**: [http://localhost:3000](http://localhost:3000)

**Credenciais Demo**:
- Email: `demo@financeiro.com`
- Senha: `123456`

## 📊 Classes de Ativos Suportadas

- 📈 **Ações Nacionais** (B3)
- 🌍 **Ações Internacionais** (NYSE, NASDAQ)
- 💰 **Criptomoedas** (Bitcoin, Ethereum, etc.)
- 💵 **Moedas** (USD, EUR, GBP, etc.)
- 🏠 **Fundos Imobiliários** (FIIs)
- 📊 **Renda Fixa** (CDB, Tesouro Direto)
- 🌎 **ETFs Internacionais**

## 🔌 Integrações

### **APIs de Cotações**
- HG Brasil (ações BR)
- Twelve Data (ações US)
- CoinGecko (criptomoedas)
- Exchange Rate API (moedas)

### **Funcionalidades Avançadas**
- Cálculo automático de preço médio
- Análise de risco e diversificação
- Projeções de rentabilidade
- Alertas de preço
- Rebalanceamento automático

## 🛡️ Segurança

- Dados criptografados no LocalStorage
- Validação rigorosa de inputs
- Sanitização de dados
- Sessões seguras
- Logs de auditoria

## 📱 Responsividade

Interface otimizada para:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

## 🚀 Performance

- ⚡ Code splitting
- 🔄 Lazy loading
- 📦 Service Workers
- 🗜️ Compressão de assets
- 💾 Cache inteligente

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Desenvolvido com ❤️ usando Tailwind CSS**