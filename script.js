class StockAnalyzer {
    constructor() {
        this.currentSymbol = 'NIFTY 50';
        this.chart = null;
        this.isMarketOpen = true;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateTime();
        this.loadQuickStock('NIFTY 50');
        this.startLiveUpdates();
        setInterval(() => this.updateTime(), 1000);
    }

    bindEvents() {
        // Search
        document.getElementById('searchBtn').addEventListener('click', () => {
            const symbol = document.getElementById('stockSearch').value.toUpperCase();
            if (symbol) this.loadStock(symbol);
        });

        document.getElementById('stockSearch').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const symbol = e.target.value.toUpperCase();
                if (symbol) this.loadStock(symbol);
            }
        });

        // Quick buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.quick-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.loadQuickStock(e.target.dataset.symbol);
            });
        });

        // Action buttons
        document.getElementById('analyzeBtn').addEventListener('click', () => this.aiAnalysis());
        document.getElementById('alertBtn').addEventListener('click', () => this.setAlert());
        document.getElementById('compareBtn').addEventListener('click', () => this.compareStocks());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());

        // Chart tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelector('.tab-btn.active').classList.remove('active');
                e.target.classList.add('active');
                this.switchChart(e.target.dataset.chart);
            });
        });
    }

    // Live Indian Market Data (Alpha Vantage + Mock for demo)
    async fetchLiveData(symbol) {
        try {
            // Real API integration (Alpha Vantage - Get your free key)
            const apiKey = 'YOUR_ALPHA_VANTAGE_KEY'; // Replace with real key
            const response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
            );
            
            if (response.ok) {
                const data = await response.json();
                return data['Global Quote'];
            }
        } catch (error) {
            console.log('Using mock data for demo...');
        }

        // Mock Indian Market Data (Realistic)
        return this.getMockIndianData(symbol);
    }

    getMockIndianData(symbol) {
        const basePrices = {
            'NIFTY 50': 24250,
            'RELIANCE': 2950,
            'TCS': 4150,
            'INFY': 1850,
            'HDFCBANK': 1650
        };

        const basePrice = basePrices[symbol] || 1000;
        const change = (Math.random() - 0.5) * 2;
        const price = basePrice * (1 + change / 100);

        return {
            '01. symbol': symbol,
            '02. open': (price * 0.998).toFixed(2),
            '03. high': (price * 1.002).toFixed(2),
            '04. low': (price * 0.996).toFixed(2),
            '05. price': price.toFixed(2),
            '08. previous close': (price * 0.999).toFixed(2),
            '09. change': change.toFixed(2),
            '10. change percent': `${change.toFixed(2)}%`
        };
    }

    // AI 5-Minute Prediction (ML Model Simulation)
    predict5Min(data) {
        const change = parseFloat(data['09. change']);
        const volatility = Math.random() * 0.5 + 0.2;
        const confidence = Math.floor(Math.random() * 30 + 70);
        
        // Simple ML prediction logic
        const prediction = change > 0 || Math.random() > 0.4 ? 'UP' : 'DOWN';
        
        return {
            direction: prediction,
            confidence: confidence,
            probability: Math.random() * 0.3 + 0.7
        };
    }

    async loadStock(symbol) {
        this.showLoading();
        this.currentSymbol = symbol;
        
        const data = await this.fetchLiveData(symbol);
        await this.updateStockInfo(data);
        await this.updateChart();
        this.hideLoading();
    }

    async loadQuickStock(symbol) {
        document.getElementById('stockSearch').value = symbol;
        await this.loadStock(symbol);
    }

    updateStockInfo(data) {
        document.getElementById('stockName').textContent = data['01. symbol'] || this.currentSymbol;
        document.getElementById('currentPrice').textContent = 
            new Intl.NumberFormat('en-IN').format(parseFloat(data['05. price'] || 0));

        const changePercent = data['10. change percent'] || '0%';
        const changeEl = document.getElementById('changePercent');
        const priceChangeEl = document.getElementById('priceChange');
        
        changeEl.textContent = changePercent;
        priceChangeEl.className = parseFloat(changePercent) >= 0 ? 'price-change positive' : 'price-change negative';

        // 5-min prediction
        const prediction = this.predict5
