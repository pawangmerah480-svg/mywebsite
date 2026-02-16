// ============================================
// TRADING SIMULATOR INSTITUTIONAL MONSTER ELITE
// SCRIPT.JS - MASTER CONTROLLER
// VERSION: 2.0.0
// ============================================

// ============================================
// GLOBAL CONFIGURATION
// ============================================
const CONFIG = {
    // Account Settings
    INITIAL_BALANCE: 100,
    DAILY_TARGET: 1,
    MAX_DAILY_TRADES: 5,
    DEFAULT_RISK: 1,
    MAX_DRAWDOWN: 20,
    
    // Trading Settings
    TRADE_COOLDOWN_AFTER_LOSSES: 3,
    MIN_LOT_SIZE: 0.01,
    MAX_LOT_SIZE: 100,
    DEFAULT_LOT_SIZE: 0.01,
    
    // Market Settings
    UPDATE_INTERVAL: 1000,
    CHART_CANDLES: 100,
    NEWS_CHECK_INTERVAL: 30000,
    NEWS_DURATION: 120000,
    
    // Psychology Settings
    FEAR_THRESHOLD: 70,
    GREED_THRESHOLD: 70,
    FOMO_THRESHOLD: 50,
    CONFIDENCE_MAX: 100,
    
    // Pair Lists
    FOREX_PAIRS: [
        { name: 'EUR/USD', base: 'EUR', quote: 'USD', spread: 0.0001, volatility: 0.8, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'GBP/USD', base: 'GBP', quote: 'USD', spread: 0.00015, volatility: 1.0, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/JPY', base: 'USD', quote: 'JPY', spread: 0.01, volatility: 0.9, pipSize: 0.01, category: 'forex', type: 'Major' },
        { name: 'AUD/USD', base: 'AUD', quote: 'USD', spread: 0.00012, volatility: 0.7, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/CHF', base: 'USD', quote: 'CHF', spread: 0.00013, volatility: 0.6, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/CAD', base: 'USD', quote: 'CAD', spread: 0.00014, volatility: 0.8, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'NZD/USD', base: 'NZD', quote: 'USD', spread: 0.00016, volatility: 0.7, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'EUR/GBP', base: 'EUR', quote: 'GBP', spread: 0.0002, volatility: 0.6, pipSize: 0.0001, category: 'forex', type: 'Minor' },
        { name: 'EUR/JPY', base: 'EUR', quote: 'JPY', spread: 0.02, volatility: 0.9, pipSize: 0.01, category: 'forex', type: 'Minor' },
        { name: 'GBP/JPY', base: 'GBP', quote: 'JPY', spread: 0.025, volatility: 1.1, pipSize: 0.01, category: 'forex', type: 'Minor' }
    ],
    
    CRYPTO_PAIRS: [
        { name: 'BTC/USD', base: 'BTC', quote: 'USD', spread: 10, volatility: 3.0, pipSize: 0.1, category: 'crypto', type: 'Major' },
        { name: 'ETH/USD', base: 'ETH', quote: 'USD', spread: 2, volatility: 2.5, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'BNB/USD', base: 'BNB', quote: 'USD', spread: 1.5, volatility: 2.2, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'SOL/USD', base: 'SOL', quote: 'USD', spread: 0.8, volatility: 2.8, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'ADA/USD', base: 'ADA', quote: 'USD', spread: 0.0005, volatility: 2.4, pipSize: 0.0001, category: 'crypto', type: 'Minor' },
        { name: 'DOT/USD', base: 'DOT', quote: 'USD', spread: 0.3, volatility: 2.3, pipSize: 0.01, category: 'crypto', type: 'Minor' },
        { name: 'LINK/USD', base: 'LINK', quote: 'USD', spread: 0.4, volatility: 2.1, pipSize: 0.01, category: 'crypto', type: 'Minor' },
        { name: 'XRP/USD', base: 'XRP', quote: 'USD', spread: 0.0003, volatility: 2.6, pipSize: 0.0001, category: 'crypto', type: 'Minor' }
    ],
    
    COMMODITY_PAIRS: [
        { name: 'XAU/USD', base: 'XAU', quote: 'USD', spread: 0.5, volatility: 1.5, pipSize: 0.01, category: 'commodities', type: 'Gold' },
        { name: 'XAG/USD', base: 'XAG', quote: 'USD', spread: 0.03, volatility: 1.8, pipSize: 0.001, category: 'commodities', type: 'Silver' },
        { name: 'WTI/USD', base: 'WTI', quote: 'USD', spread: 0.1, volatility: 2.0, pipSize: 0.01, category: 'commodities', type: 'Oil' },
        { name: 'BRENT/USD', base: 'BRENT', quote: 'USD', spread: 0.12, volatility: 1.9, pipSize: 0.01, category: 'commodities', type: 'Oil' },
        { name: 'XPT/USD', base: 'XPT', quote: 'USD', spread: 2.0, volatility: 1.3, pipSize: 0.1, category: 'commodities', type: 'Platinum' },
        { name: 'XPD/USD', base: 'XPD', quote: 'USD', spread: 3.0, volatility: 1.4, pipSize: 0.1, category: 'commodities', type: 'Palladium' }
    ],
    
    INDICES: [
        { name: 'SPX/USD', base: 'SPX', quote: 'USD', spread: 2.5, volatility: 1.2, pipSize: 0.1, category: 'indices', type: 'S&P 500' },
        { name: 'NAS/USD', base: 'NAS', quote: 'USD', spread: 3.0, volatility: 1.4, pipSize: 0.1, category: 'indices', type: 'NASDAQ' },
        { name: 'DJI/USD', base: 'DJI', quote: 'USD', spread: 4.0, volatility: 1.1, pipSize: 0.1, category: 'indices', type: 'DOW JONES' },
        { name: 'DAX/USD', base: 'DAX', quote: 'USD', spread: 2.8, volatility: 1.3, pipSize: 0.1, category: 'indices', type: 'DAX 40' },
        { name: 'FTSE/USD', base: 'FTSE', quote: 'USD', spread: 2.2, volatility: 1.0, pipSize: 0.1, category: 'indices', type: 'FTSE 100' },
        { name: 'NIKKEI/USD', base: 'NIKKEI', quote: 'USD', spread: 5.0, volatility: 1.5, pipSize: 0.1, category: 'indices', type: 'NIKKEI 225' }
    ],
    
    SESSIONS: [
        { name: 'Asia', startHour: 0, endHour: 8, volatility: 0.5, fakeBreakout: 0.7, color: '#ffb300' },
        { name: 'London', startHour: 8, endHour: 16, volatility: 1.2, fakeBreakout: 0.4, color: '#2d7aff' },
        { name: 'New York', startHour: 13, endHour: 21, volatility: 1.5, fakeBreakout: 0.5, color: '#7c4dff' },
        { name: 'London-New York Overlap', startHour: 13, endHour: 16, volatility: 2.0, fakeBreakout: 0.6, color: '#00c853' }
    ],
    
    NEWS_EVENTS: [
        { name: 'FOMC Rate Decision', impact: 'high', volatilityMultiplier: 3, spreadMultiplier: 5, duration: 300000 },
        { name: 'NFP Report', impact: 'high', volatilityMultiplier: 2.5, spreadMultiplier: 4, duration: 240000 },
        { name: 'CPI Data', impact: 'high', volatilityMultiplier: 2.2, spreadMultiplier: 3.5, duration: 180000 },
        { name: 'GDP Release', impact: 'medium', volatilityMultiplier: 1.8, spreadMultiplier: 2.5, duration: 150000 },
        { name: 'Retail Sales', impact: 'medium', volatilityMultiplier: 1.5, spreadMultiplier: 2, duration: 120000 },
        { name: 'PMI Data', impact: 'medium', volatilityMultiplier: 1.3, spreadMultiplier: 1.8, duration: 100000 },
        { name: 'Central Bank Speech', impact: 'medium', volatilityMultiplier: 1.4, spreadMultiplier: 1.6, duration: 90000 },
        { name: 'Housing Data', impact: 'low', volatilityMultiplier: 1.1, spreadMultiplier: 1.2, duration: 60000 },
        { name: 'Consumer Confidence', impact: 'low', volatilityMultiplier: 1.05, spreadMultiplier: 1.1, duration: 45000 }
    ],
    
    EDUCATIONAL_TIPS: [
        "Risk management is more important than entry signals",
        "Always use stop loss to protect your capital",
        "Small consistent wins beat big risky trades",
        "Wait for market structure confirmation before entering",
        "Overtrading is the fastest way to blow your account",
        "The trend is your friend until it ends",
        "Don't fight the trend, trade with it",
        "FOMO leads to bad entries and losses",
        "Patience is a trader's superpower",
        "Keep a trading journal to track your progress",
        "Review your losses to learn from them",
        "Don't revenge trade after a loss",
        "Take breaks when you're on a losing streak",
        "News events cause high volatility - be careful",
        "Support becomes resistance, resistance becomes support",
        "Price respects key levels until it doesn't",
        "Liquidity grabs often precede reversals",
        "Order blocks show where institutions are active",
        "Higher timeframes show the bigger picture",
        "Multiple time frame analysis improves accuracy"
    ]
};

// ============================================
// MARKET ENGINE
// ============================================
class MarketEngine {
    constructor() {
        this.pairs = [];
        this.currentPrices = {};
        this.candles = {};
        this.trends = {};
        this.volatility = {};
        this.spreads = {};
        this.volumes = {};
        this.initializePairs();
        this.startPriceUpdates();
        console.log('MarketEngine initialized');
    }

    initializePairs() {
        // Combine all pairs
        const allPairs = [
            ...CONFIG.FOREX_PAIRS,
            ...CONFIG.CRYPTO_PAIRS,
            ...CONFIG.COMMODITY_PAIRS,
            ...CONFIG.INDICES
        ];
        
        allPairs.forEach(pair => {
            this.pairs.push(pair);
            const basePrice = this.generateInitialPrice(pair);
            this.currentPrices[pair.name] = basePrice;
            this.candles[pair.name] = this.generateInitialCandles(pair, basePrice);
            this.trends[pair.name] = this.generateTrend(pair);
            this.volatility[pair.name] = pair.volatility;
            this.spreads[pair.name] = pair.spread;
            this.volumes[pair.name] = Math.random() * 1000000;
        });
        
        console.log(`Initialized ${this.pairs.length} trading pairs`);
    }

    generateInitialPrice(pair) {
        const basePrices = {
            'EUR/USD': 1.12345,
            'GBP/USD': 1.26789,
            'USD/JPY': 148.234,
            'AUD/USD': 0.67890,
            'USD/CHF': 0.89123,
            'USD/CAD': 1.34567,
            'NZD/USD': 0.61234,
            'EUR/GBP': 0.85678,
            'EUR/JPY': 162.345,
            'GBP/JPY': 186.789,
            'BTC/USD': 56789.12,
            'ETH/USD': 3123.45,
            'BNB/USD': 412.56,
            'SOL/USD': 98.76,
            'ADA/USD': 0.4567,
            'DOT/USD': 7.89,
            'LINK/USD': 15.67,
            'XRP/USD': 0.5678,
            'XAU/USD': 1987.65,
            'XAG/USD': 23.45,
            'WTI/USD': 78.90,
            'BRENT/USD': 82.34,
            'XPT/USD': 945.67,
            'XPD/USD': 1023.45,
            'SPX/USD': 5123.45,
            'NAS/USD': 17890.12,
            'DJI/USD': 38765.43,
            'DAX/USD': 17890.67,
            'FTSE/USD': 8234.56,
            'NIKKEI/USD': 37890.23
        };
        return basePrices[pair.name] || 1.0000;
    }

    generateInitialCandles(pair, startPrice) {
        const candles = [];
        let price = startPrice;
        const volatility = pair.volatility * 0.01;
        
        for (let i = 0; i < CONFIG.CHART_CANDLES; i++) {
            const change = (Math.random() - 0.5) * volatility * price;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
            const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
            
            candles.push({
                time: Date.now() - (CONFIG.CHART_CANDLES - i) * 60000,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: Math.random() * 1000
            });
            
            price = close;
        }
        
        return candles;
    }

    generateTrend(pair) {
        return {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            strength: Math.random() * pair.volatility,
            age: 0,
            momentum: Math.random() * 0.5
        };
    }

    startPriceUpdates() {
        setInterval(() => this.updatePrices(), CONFIG.UPDATE_INTERVAL);
        console.log('Price updates started');
    }

    updatePrices() {
        const session = SessionManager ? SessionManager.getCurrentSession() : CONFIG.SESSIONS[1];
        const newsImpact = NewsEngine ? NewsEngine.getCurrentImpact() : null;
        
        this.pairs.forEach(pair => {
            const pairName = pair.name;
            const trend = this.trends[pairName];
            let price = this.currentPrices[pairName];
            
            // Calculate volatility
            let currentVolatility = this.calculateVolatility(pair, session, newsImpact);
            
            // Update trend occasionally
            if (Math.random() < 0.005) {
                trend.direction = Math.random() > 0.5 ? 'up' : 'down';
                trend.strength = Math.random() * pair.volatility;
                trend.age = 0;
            }
            trend.age++;
            
            // Calculate base change
            let change = (Math.random() - 0.5) * currentVolatility * 0.01 * price;
            
            // Add trend bias
            if (trend.direction === 'up') {
                change += trend.strength * 0.0001 * price;
            } else {
                change -= trend.strength * 0.0001 * price;
            }
            
            // Add session bias
            change *= session.volatility;
            
            // Add news impact
            if (newsImpact) {
                change *= (1 + newsImpact.volatilityMultiplier * 0.5);
                this.spreads[pairName] = pair.spread * newsImpact.spreadMultiplier;
            } else {
                this.spreads[pairName] = pair.spread;
            }
            
            // Update price
            price += change;
            
            // Add mean reversion (prices tend to stay in range)
            const avgPrice = this.calculateAveragePrice(pairName);
            if (price > avgPrice * 1.05) {
                price -= Math.random() * currentVolatility * 0.005 * price;
            } else if (price < avgPrice * 0.95) {
                price += Math.random() * currentVolatility * 0.005 * price;
            }
            
            this.currentPrices[pairName] = price;
            
            // Update candles
            this.updateCandles(pairName, price);
            
            // Update volume
            this.volumes[pairName] = this.volumes[pairName] * 0.9 + Math.random() * 100000;
            
            // Check for fake breakout
            if (Math.random() < pair.volatility * 0.1 * session.fakeBreakout) {
                this.generateFakeBreakout(pairName);
            }
        });
        
        // Trigger UI update
        if (UIController && UIController.updatePrices) {
            UIController.updatePrices(this.currentPrices);
        }
    }

    calculateVolatility(pair, session, newsImpact) {
        let vol = pair.volatility * session.volatility;
        if (newsImpact) {
            vol *= (1 + newsImpact.volatilityMultiplier);
        }
        
        // Add random volatility spikes
        if (Math.random() < 0.01) {
            vol *= 1.5;
        }
        
        return Math.min(vol, pair.volatility * 3);
    }

    calculateAveragePrice(pairName) {
        const candles = this.candles[pairName];
        if (!candles || candles.length < 20) return this.currentPrices[pairName];
        
        let sum = 0;
        for (let i = candles.length - 20; i < candles.length; i++) {
            sum += candles[i].close;
        }
        return sum / 20;
    }

    updateCandles(pairName, price) {
        const candles = this.candles[pairName];
        const lastCandle = candles[candles.length - 1];
        
        // Update current candle
        lastCandle.close = price;
        lastCandle.high = Math.max(lastCandle.high, price);
        lastCandle.low = Math.min(lastCandle.low, price);
        lastCandle.volume += Math.random() * 100;
        
        // Add new candle every minute
        const timeSinceLastCandle = Date.now() - lastCandle.time;
        if (timeSinceLastCandle >= 60000) {
            const newCandle = {
                time: Date.now(),
                open: price,
                high: price,
                low: price,
                close: price,
                volume: Math.random() * 1000
            };
            candles.push(newCandle);
            
            // Keep only last CHART_CANDLES candles
            if (candles.length > CONFIG.CHART_CANDLES) {
                candles.shift();
            }
        }
    }

    generateFakeBreakout(pairName) {
        const price = this.currentPrices[pairName];
        const fakeMove = price * (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
        
        // Create fake breakout
        this.currentPrices[pairName] = price + fakeMove;
        
        // Quick reversal after 3 seconds
        setTimeout(() => {
            this.currentPrices[pairName] = price;
            
            // Show fake breakout message
            NotificationManager.show(`Fake breakout detected on ${pairName}`, 'warning');
        }, 3000);
    }

    getPrice(pairName) {
        return this.currentPrices[pairName] || 0;
    }

    getCandles(pairName) {
        return this.candles[pairName] || [];
    }

    getSpread(pairName) {
        return this.spreads[pairName] || 0;
    }

    getPairInfo(pairName) {
        return this.pairs.find(p => p.name === pairName);
    }

    getAllPairs() {
        return this.pairs;
    }

    getPairsByCategory(category) {
        return this.pairs.filter(p => p.category === category);
    }
}

// ============================================
// TREND ENGINE
// ============================================
class TrendEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.trends = {};
        this.supportLevels = {};
        this.resistanceLevels = {};
        this.movingAverages = {};
        console.log('TrendEngine initialized');
    }

    analyzeTrend(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) {
            return { direction: 'neutral', strength: 0, confidence: 0 };
        }
        
        // Calculate various moving averages
        const ma20 = this.calculateMA(candles, 20);
        const ma50 = this.calculateMA(candles, 50);
        const ma100 = this.calculateMA(candles, 100);
        const ma200 = this.calculateMA(candles, 200);
        
        // Store MAs
        this.movingAverages[pairName] = { ma20, ma50, ma100, ma200 };
        
        // Determine trend direction and strength
        let direction = 'neutral';
        let strength = 0;
        let confidence = 0;
        
        // Check alignment of MAs
        if (ma20 > ma50 && ma50 > ma100 && ma100 > ma200) {
            direction = 'up';
            strength = (ma20 - ma200) / ma200 * 100;
            confidence = 0.8;
        } else if (ma20 < ma50 && ma50 < ma100 && ma100 < ma200) {
            direction = 'down';
            strength = (ma200 - ma20) / ma200 * 100;
            confidence = 0.8;
        } else if (ma20 > ma50 && ma50 > ma100) {
            direction = 'up';
            strength = (ma20 - ma100) / ma100 * 100;
            confidence = 0.6;
        } else if (ma20 < ma50 && ma50 < ma100) {
            direction = 'down';
            strength = (ma100 - ma20) / ma100 * 100;
            confidence = 0.6;
        }
        
        // Calculate additional indicators
        const rsi = this.calculateRSI(candles);
        const macd = this.calculateMACD(candles);
        
        // Update support and resistance
        this.findSupportResistance(pairName, candles);
        
        return {
            direction,
            strength,
            confidence,
            rsi,
            macd,
            ma20,
            ma50,
            ma100,
            ma200
        };
    }

    calculateMA(candles, period) {
        if (candles.length < period) {
            return candles[candles.length - 1].close;
        }
        
        let sum = 0;
        for (let i = candles.length - period; i < candles.length; i++) {
            sum += candles[i].close;
        }
        return sum / period;
    }

    calculateRSI(candles, period = 14) {
        if (candles.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = candles.length - period; i < candles.length; i++) {
            const change = candles[i].close - candles[i - 1].close;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateMACD(candles) {
        const ema12 = this.calculateEMA(candles, 12);
        const ema26 = this.calculateEMA(candles, 26);
        const macdLine = ema12 - ema26;
        const signalLine = this.calculateEMA(candles, 9, macdLine);
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: macdLine - signalLine
        };
    }

    calculateEMA(candles, period, price = null) {
        if (candles.length < period) return candles[candles.length - 1].close;
        
        const multiplier = 2 / (period + 1);
        let ema = price || candles[candles.length - period].close;
        
        for (let i = candles.length - period + 1; i < candles.length; i++) {
            ema = (candles[i].close - ema) * multiplier + ema;
        }
        
        return ema;
    }

    findSupportResistance(pairName, candles) {
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        
        const swingHighs = [];
        const swingLows = [];
        const lookback = 5;
        
        // Find swing points
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Swing high
            let isSwingHigh = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (highs[j] >= highs[i]) {
                    isSwingHigh = false;
                    break;
                }
            }
            if (isSwingHigh) {
                swingHighs.push({ price: highs[i], index: i });
            }
            
            // Swing low
            let isSwingLow = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (lows[j] <= lows[i]) {
                    isSwingLow = false;
                    break;
                }
            }
            if (isSwingLow) {
                swingLows.push({ price: lows[i], index: i });
            }
        }
        
        // Cluster levels
        this.resistanceLevels[pairName] = this.clusterLevels(swingHighs.map(s => s.price));
        this.supportLevels[pairName] = this.clusterLevels(swingLows.map(s => s.price));
    }

    clusterLevels(levels) {
        const clustered = [];
        const threshold = 0.002; // 0.2%
        
        levels.sort((a, b) => a - b);
        
        for (const level of levels) {
            let found = false;
            for (const cluster of clustered) {
                if (Math.abs(level - cluster.level) / cluster.level < threshold) {
                    cluster.count++;
                    cluster.level = (cluster.level * (cluster.count - 1) + level) / cluster.count;
                    found = true;
                    break;
                }
            }
            if (!found) {
                clustered.push({ level, count: 1, strength: 1 });
            }
        }
        
        // Calculate strength based on count
        clustered.forEach(c => {
            c.strength = Math.min(c.count / 3, 1);
        });
        
        return clustered.filter(c => c.count >= 2);
    }

    getSupportLevels(pairName) {
        return this.supportLevels[pairName] || [];
    }

    getResistanceLevels(pairName) {
        return this.resistanceLevels[pairName] || [];
    }

    getBreakoutSignal(pairName) {
        const trend = this.analyzeTrend(pairName);
        const price = this.marketEngine.getPrice(pairName);
        const supports = this.getSupportLevels(pairName);
        const resistances = this.getResistanceLevels(pairName);
        const candles = this.marketEngine.getCandles(pairName);
        
        // Check for breakout
        if (trend.direction === 'up') {
            // Find nearest resistance
            const nearestResistance = resistances.find(r => r.level > price);
            if (nearestResistance) {
                const distance = (nearestResistance.level - price) / price;
                if (distance < 0.005) {
                    return {
                        type: 'resistance-test',
                        level: nearestResistance.level,
                        strength: nearestResistance.strength
                    };
                }
            }
            
            // Check if price broke above recent high
            const recentHigh = Math.max(...candles.slice(-20).map(c => c.high));
            if (price > recentHigh) {
                return {
                    type: 'breakout-up',
                    level: price,
                    strength: 0.7
                };
            }
        } else if (trend.direction === 'down') {
            // Find nearest support
            const nearestSupport = supports.find(s => s.level < price);
            if (nearestSupport) {
                const distance = (price - nearestSupport.level) / price;
                if (distance < 0.005) {
                    return {
                        type: 'support-test',
                        level: nearestSupport.level,
                        strength: nearestSupport.strength
                    };
                }
            }
            
            // Check if price broke below recent low
            const recentLow = Math.min(...candles.slice(-20).map(c => c.low));
            if (price < recentLow) {
                return {
                    type: 'breakout-down',
                    level: price,
                    strength: 0.7
                };
            }
        }
        
        return null;
    }
}

// ============================================
// STRUCTURE ENGINE
// ============================================
class StructureEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.structures = {};
        this.hh = {}; // Higher Highs
        this.hl = {}; // Higher Lows
        this.lh = {}; // Lower Highs
        this.ll = {}; // Lower Lows
        this.bos = {}; // Break of Structure
        this.choch = {}; // Change of Character
        console.log('StructureEngine initialized');
    }

    analyzeStructure(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 20) return null;
        
        // Find swing points
        const swings = this.findSwings(candles);
        
        // Determine market structure
        let structure = 'ranging';
        let lastHH = null, lastHL = null, lastLH = null, lastLL = null;
        let hhArray = [], hlArray = [], lhArray = [], llArray = [];
        
        for (let i = 0; i < swings.length; i++) {
            const swing = swings[i];
            
            if (swing.type === 'high') {
                if (lastHH === null || swing.price > lastHH) {
                    lastHH = swing.price;
                    hhArray.push({ price: swing.price, index: swing.index });
                } else if (lastHH !== null && swing.price < lastHH) {
                    lastLH = swing.price;
                    lhArray.push({ price: swing.price, index: swing.index });
                }
            } else {
                if (lastLL === null || swing.price < lastLL) {
                    lastLL = swing.price;
                    llArray.push({ price: swing.price, index: swing.index });
                } else if (lastLL !== null && swing.price > lastLL) {
                    lastHL = swing.price;
                    hlArray.push({ price: swing.price, index: swing.index });
                }
            }
        }
        
        // Store levels
        this.hh[pairName] = hhArray.slice(-3);
        this.hl[pairName] = hlArray.slice(-3);
        this.lh[pairName] = lhArray.slice(-3);
        this.ll[pairName] = llArray.slice(-3);
        
        // Determine trend
        if (hhArray.length > 1 && hlArray.length > 1) {
            const lastHHVal = hhArray[hhArray.length - 1].price;
            const prevHHVal = hhArray[hhArray.length - 2].price;
            const lastHLVal = hlArray[hlArray.length - 1].price;
            const prevHLVal = hlArray[hlArray.length - 2].price;
            
            if (lastHHVal > prevHHVal && lastHLVal > prevHLVal) {
                structure = 'uptrend';
            }
        }
        
        if (lhArray.length > 1 && llArray.length > 1) {
            const lastLHVal = lhArray[lhArray.length - 1].price;
            const prevLHVal = lhArray[lhArray.length - 2].price;
            const lastLLVal = llArray[llArray.length - 1].price;
            const prevLLVal = llArray[llArray.length - 2].price;
            
            if (lastLHVal < prevLHVal && lastLLVal < prevLLVal) {
                structure = 'downtrend';
            }
        }
        
        // Check for Break of Structure
        this.checkBreakOfStructure(pairName, candles, swings);
        
        // Check for Change of Character
        this.checkChangeOfCharacter(pairName, structure);
        
        this.structures[pairName] = {
            structure,
            hh: hhArray,
            hl: hlArray,
            lh: lhArray,
            ll: llArray,
            bos: this.bos[pairName],
            choch: this.choch[pairName],
            swings
        };
        
        return this.structures[pairName];
    }

    findSwings(candles) {
        const swings = [];
        const lookback = 3;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Check for swing high
            let isSwingHigh = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (candles[j].high >= candles[i].high) {
                    isSwingHigh = false;
                    break;
                }
            }
            if (isSwingHigh) {
                swings.push({
                    type: 'high',
                    price: candles[i].high,
                    index: i,
                    time: candles[i].time
                });
            }
            
            // Check for swing low
            let isSwingLow = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (candles[j].low <= candles[i].low) {
                    isSwingLow = false;
                    break;
                }
            }
            if (isSwingLow) {
                swings.push({
                    type: 'low',
                    price: candles[i].low,
                    index: i,
                    time: candles[i].time
                });
            }
        }
        
        return swings;
    }

    checkBreakOfStructure(pairName, candles, swings) {
        if (swings.length < 4) return;
        
        const price = this.marketEngine.getPrice(pairName);
        const recentSwings = swings.slice(-4);
        
        // Check for BOS in uptrend
        if (recentSwings[0].type === 'low' && recentSwings[1].type === 'high' &&
            recentSwings[2].type === 'low' && recentSwings[3].type === 'high') {
            
            const low1 = recentSwings[0].price;
            const high1 = recentSwings[1].price;
            const low2 = recentSwings[2].price;
            const high2 = recentSwings[3].price;
            
            if (low2 > low1 && price > high1) {
                this.bos[pairName] = {
                    type: 'bullish',
                    price: price,
                    time: Date.now(),
                    strength: 'strong'
                };
            }
        }
        
        // Check for BOS in downtrend
        if (recentSwings[0].type === 'high' && recentSwings[1].type === 'low' &&
            recentSwings[2].type === 'high' && recentSwings[3].type === 'low') {
            
            const high1 = recentSwings[0].price;
            const low1 = recentSwings[1].price;
            const high2 = recentSwings[2].price;
            const low2 = recentSwings[3].price;
            
            if (high2 < high1 && price < low1) {
                this.bos[pairName] = {
                    type: 'bearish',
                    price: price,
                    time: Date.now(),
                    strength: 'strong'
                };
            }
        }
    }

    checkChangeOfCharacter(pairName, currentStructure) {
        const previousStructure = this.structures[pairName]?.structure;
        
        if (previousStructure && currentStructure !== previousStructure) {
            this.choch[pairName] = {
                from: previousStructure,
                to: currentStructure,
                time: Date.now()
            };
        }
    }

    getStructure(pairName) {
        return this.structures[pairName] || {
            structure: 'unknown',
            hh: [],
            hl: [],
            lh: [],
            ll: []
        };
    }

    getOrderBlocks(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        const orderBlocks = [];
        
        for (let i = 1; i < candles.length - 2; i++) {
            // Bullish order block (big green candle)
            if (candles[i].close > candles[i].open * 1.01) {
                // Check if it's followed by continuation
                if (candles[i + 1].close > candles[i + 1].open &&
                    candles[i + 2].close > candles[i + 2].open) {
                    orderBlocks.push({
                        type: 'bullish',
                        price: candles[i].close,
                        range: {
                            high: candles[i].high,
                            low: candles[i].low
                        },
                        time: candles[i].time,
                        strength: (candles[i].close - candles[i].open) / candles[i].open * 100
                    });
                }
            }
            
            // Bearish order block (big red candle)
            if (candles[i].open > candles[i].close * 1.01) {
                // Check if it's followed by continuation
                if (candles[i + 1].close < candles[i + 1].open &&
                    candles[i + 2].close < candles[i + 2].open) {
                    orderBlocks.push({
                        type: 'bearish',
                        price: candles[i].close,
                        range: {
                            high: candles[i].high,
                            low: candles[i].low
                        },
                        time: candles[i].time,
                        strength: (candles[i].open - candles[i].close) / candles[i].close * 100
                    });
                }
            }
        }
        
        return orderBlocks.slice(-10);
    }
}

// ============================================
// SUPPLY DEMAND ENGINE
// ============================================
class SupplyDemandEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.supplyZones = {};
        this.demandZones = {};
        console.log('SupplyDemandEngine initialized');
    }

    analyzeZones(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) return { supply: [], demand: [] };
        
        const supplyZones = this.findSupplyZones(candles);
        const demandZones = this.findDemandZones(candles);
        
        this.supplyZones[pairName] = this.mergeZones(supplyZones);
        this.demandZones[pairName] = this.mergeZones(demandZones);
        
        return {
            supply: this.supplyZones[pairName],
            demand: this.demandZones[pairName]
        };
    }

    findSupplyZones(candles) {
        const zones = [];
        const lookback = 10;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Look for strong selling pressure
            const zoneHigh = candles[i].high;
            const zoneLow = candles[i].low;
            const touches = [];
            
            // Find touches of this zone
            for (let j = Math.max(0, i - 20); j < Math.min(candles.length, i + 20); j++) {
                if (j === i) continue;
                
                // Check if price touched this zone
                if (candles[j].high >= zoneLow && candles[j].low <= zoneHigh) {
                    touches.push(candles[j]);
                }
            }
            
            // Check for strong rejection (long upper wick)
            const upperWick = candles[i].high - Math.max(candles[i].open, candles[i].close);
            const totalRange = candles[i].high - candles[i].low;
            
            if (touches.length >= 2 && upperWick > totalRange * 0.6) {
                zones.push({
                    price: zoneHigh,
                    high: zoneHigh,
                    low: zoneLow,
                    strength: touches.length,
                    touches: touches.length,
                    type: 'supply',
                    formedAt: candles[i].time
                });
            }
        }
        
        return zones;
    }

    findDemandZones(candles) {
        const zones = [];
        const lookback = 10;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Look for strong buying pressure
            const zoneHigh = candles[i].high;
            const zoneLow = candles[i].low;
            const touches = [];
            
            // Find touches of this zone
            for (let j = Math.max(0, i - 20); j < Math.min(candles.length, i + 20); j++) {
                if (j === i) continue;
                
                // Check if price touched this zone
                if (candles[j].high >= zoneLow && candles[j].low <= zoneHigh) {
                    touches.push(candles[j]);
                }
            }
            
            // Check for strong rejection (long lower wick)
            const lowerWick = Math.min(candles[i].open, candles[i].close) - candles[i].low;
            const totalRange = candles[i].high - candles[i].low;
            
            if (touches.length >= 2 && lowerWick > totalRange * 0.6) {
                zones.push({
                    price: zoneLow,
                    high: zoneHigh,
                    low: zoneLow,
                    strength: touches.length,
                    touches: touches.length,
                    type: 'demand',
                    formedAt: candles[i].time
                });
            }
        }
        
        return zones;
    }

    mergeZones(zones) {
        const merged = [];
        const threshold = 0.002; // 0.2%
        
        zones.sort((a, b) => a.price - b.price);
        
        for (const zone of zones) {
            let found = false;
            
            for (const m of merged) {
                if (Math.abs(zone.price - m.price) / m.price < threshold) {
                    // Merge zones
                    m.high = Math.max(m.high, zone.high);
                    m.low = Math.min(m.low, zone.low);
                    m.strength = (m.strength * m.touches + zone.strength * zone.touches) / (m.touches + zone.touches);
                    m.touches += zone.touches;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                merged.push({ ...zone });
            }
        }
        
        return merged;
    }

    getSupplyZones(pairName) {
        return this.supplyZones[pairName] || [];
    }

    getDemandZones(pairName) {
        return this.demandZones[pairName] || [];
    }

    isInSupplyZone(pairName, price) {
        const zones = this.getSupplyZones(pairName);
        return zones.some(zone => price >= zone.low && price <= zone.high);
    }

    isInDemandZone(pairName, price) {
        const zones = this.getDemandZones(pairName);
        return zones.some(zone => price >= zone.low && price <= zone.high);
    }

    getNearestSupply(pairName, price) {
        const zones = this.getSupplyZones(pairName);
        let nearest = null;
        let minDistance = Infinity;
        
        for (const zone of zones) {
            const distance = zone.price - price;
            if (distance > 0 && distance < minDistance) {
                minDistance = distance;
                nearest = zone;
            }
        }
        
        return nearest;
    }

    getNearestDemand(pairName, price) {
        const zones = this.getDemandZones(pairName);
        let nearest = null;
        let minDistance = Infinity;
        
        for (const zone of zones) {
            const distance = price - zone.price;
            if (distance > 0 && distance < minDistance) {
                minDistance = distance;
                nearest = zone;
            }
        }
        
        return nearest;
    }
}

// ============================================
// LIQUIDITY ENGINE
// ============================================
class LiquidityEngine {
    constructor(marketEngine, structureEngine) {
        this.marketEngine = marketEngine;
        this.structureEngine = structureEngine;
        this.liquidityLevels = {};
        this.liquidityGrabs = {};
        console.log('LiquidityEngine initialized');
    }

    findLiquidity(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) return [];
        
        const structure = this.structureEngine.getStructure(pairName);
        const liquidity = [];
        
        // Find liquidity above recent highs (stop losses of shorts)
        const recentHighs = candles.slice(-20).map(c => c.high);
        const highestHigh = Math.max(...recentHighs);
        
        liquidity.push({
            type: 'sell-side',
            price: highestHigh * 1.001,
            area: {
                high: highestHigh * 1.002,
                low: highestHigh
            },
            strength: recentHighs.filter(h => h > highestHigh * 0.998).length,
            source: 'recent-highs'
        });
        
        // Find liquidity below recent lows (stop losses of longs)
        const recentLows = candles.slice(-20).map(c => c.low);
        const lowestLow = Math.min(...recentLows);
        
        liquidity.push({
            type: 'buy-side',
            price: lowestLow * 0.999,
            area: {
                high: lowestLow,
                low: lowestLow * 0.998
            },
            strength: recentLows.filter(l => l < lowestLow * 1.002).length,
            source: 'recent-lows'
        });
        
        // Find liquidity at swing highs
        if (structure.hh && structure.hh.length > 0) {
            structure.hh.forEach(hh => {
                liquidity.push({
                    type: 'sell-side',
                    price: hh.price * 1.001,
                    area: {
                        high: hh.price * 1.002,
                        low: hh.price
                    },
                    strength: 2,
                    source: 'swing-high'
                });
            });
        }
        
        // Find liquidity at swing lows
        if (structure.ll && structure.ll.length > 0) {
            structure.ll.forEach(ll => {
                liquidity.push({
                    type: 'buy-side',
                    price: ll.price * 0.999,
                    area: {
                        high: ll.price,
                        low: ll.price * 0.998
                    },
                    strength: 2,
                    source: 'swing-low'
                });
            });
        }
        
        // Find double tops/bottoms (liquidity grabs)
        const doubleTops = this.findDoubleTops(candles);
        const doubleBottoms = this.findDoubleBottoms(candles);
        
        this.liquidityLevels[pairName] = [...liquidity, ...doubleTops, ...doubleBottoms];
        
        return this.liquidityLevels[pairName];
    }

    findDoubleTops(candles) {
        const tops = [];
        const lookback = 20;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            if (this.isSwingHigh(candles, i)) {
                // Look for another similar high within 20 candles
                for (let j = i + 1; j < Math.min(i + 20, candles.length - lookback); j++) {
                    if (this.isSwingHigh(candles, j)) {
                        const diff = Math.abs(candles[i].high - candles[j].high) / candles[i].high;
                        if (diff < 0.002) { // 0.2% difference
                            tops.push({
                                type: 'sell-side',
                                price: (candles[i].high + candles[j].high) / 2,
                                area: {
                                    high: Math.max(candles[i].high, candles[j].high),
                                    low: Math.min(candles[i].high, candles[j].high)
                                },
                                strength: 3,
                                source: 'double-top',
                                grabLikely: true
                            });
                            break;
                        }
                    }
                }
            }
        }
        
        return tops;
    }

    findDoubleBottoms(candles) {
        const bottoms = [];
        const lookback = 20;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            if (this.isSwingLow(candles, i)) {
                for (let j = i + 1; j < Math.min(i + 20, candles.length - lookback); j++) {
                    if (this.isSwingLow(candles, j)) {
                        const diff = Math.abs(candles[i].low - candles[j].low) / candles[i].low;
                        if (diff < 0.002) {
                            bottoms.push({
                                type: 'buy-side',
                                price: (candles[i].low + candles[j].low) / 2,
                                area: {
                                    high: Math.max(candles[i].low, candles[j].low),
                                    low: Math.min(candles[i].low, candles[j].low)
                                },
                                strength: 3,
                                source: 'double-bottom',
                                grabLikely: true
                            });
                            break;
                        }
                    }
                }
            }
        }
        
        return bottoms;
    }

    isSwingHigh(candles, index) {
        if (index < 2 || index >= candles.length - 2) return false;
        const high = candles[index].high;
        return high > candles[index - 1].high &&
               high > candles[index - 2].high &&
               high > candles[index + 1].high &&
               high > candles[index + 2].high;
    }

    isSwingLow(candles, index) {
        if (index < 2 || index >= candles.length - 2) return false;
        const low = candles[index].low;
        return low < candles[index - 1].low &&
               low < candles[index - 2].low &&
               low < candles[index + 1].low &&
               low < candles[index + 2].low;
    }

    detectLiquidityGrab(pairName, price, direction) {
        const levels = this.liquidityLevels[pairName] || [];
        const grab = {
            grabbed: false,
            level: null,
            type: null
        };
        
        for (const level of levels) {
            // Check if price grabbed sell-side liquidity
            if (direction === 'up' && level.type === 'sell-side') {
                if (price >= level.area.low && price <= level.area.high) {
                    grab.grabbed = true;
                    grab.level = level;
                    grab.type = 'sell-side';
                    
                    // Record the grab
                    this.liquidityGrabs[pairName] = {
                        time: Date.now(),
                        price: price,
                        level: level,
                        direction: 'up'
                    };
                    
                    break;
                }
            }
            
            // Check if price grabbed buy-side liquidity
            if (direction === 'down' && level.type === 'buy-side') {
                if (price >= level.area.low && price <= level.area.high) {
                    grab.grabbed = true;
                    grab.level = level;
                    grab.type = 'buy-side';
                    
                    this.liquidityGrabs[pairName] = {
                        time: Date.now(),
                        price: price,
                        level: level,
                        direction: 'down'
                    };
                    
                    break;
                }
            }
        }
        
        return grab;
    }

    getLiquidityLevels(pairName) {
        return this.liquidityLevels[pairName] || [];
    }

    getRecentGrab(pairName) {
        return this.liquidityGrabs[pairName];
    }
}

// ============================================
// NEWS ENGINE
// ============================================
class NewsEngine {
    constructor() {
        this.newsEvents = CONFIG.NEWS_EVENTS;
        this.scheduledNews = [];
        this.currentImpact = null;
        this.nextNews = null;
        this.newsHistory = [];
        this.startNewsSimulation();
        console.log('NewsEngine initialized');
    }

    startNewsSimulation() {
        setInterval(() => this.checkSchedule(), CONFIG.NEWS_CHECK_INTERVAL);
        this.scheduleRandomNews();
    }

    scheduleRandomNews() {
        // Schedule news every 3-7 minutes
        const scheduleNews = () => {
            const delay = (Math.floor(Math.random() * 4) + 3) * 60 * 1000; // 3-7 minutes
            setTimeout(() => {
                this.generateNews();
                scheduleNews(); // Schedule next
            }, delay);
        };
        
        scheduleNews();
    }

    generateNews() {
        const news = this.newsEvents[Math.floor(Math.random() * this.newsEvents.length)];
        const releaseTime = Date.now() + 60000; // 1 minute from now
        
        this.nextNews = {
            ...news,
            releaseTime: releaseTime,
            countdown: 60
        };
        
        this.scheduledNews.push(this.nextNews);
        
        // Notify UI
        if (UIController && UIController.showNewsPopup) {
            UIController.showNewsPopup(this.nextNews);
        }
        
        // Start countdown
        this.startCountdown();
    }

    startCountdown() {
        const interval = setInterval(() => {
            if (!this.nextNews) {
                clearInterval(interval);
                return;
            }
            
            const remaining = Math.max(0, (this.nextNews.releaseTime - Date.now()) / 1000);
            this.nextNews.countdown = remaining;
            
            if (remaining <= 0) {
                clearInterval(interval);
                this.releaseNews();
            }
        }, 1000);
    }

    releaseNews() {
        if (!this.nextNews) return;
        
        this.currentImpact = this.nextNews;
        this.newsHistory.push({
            ...this.nextNews,
            releaseTime: Date.now()
        });
        
        // Clear next news
        this.nextNews = null;
        
        // Notify UI
        if (UIController && UIController.showNewsRelease) {
            UIController.showNewsRelease(this.currentImpact);
        }
        
        NotificationManager.show(
            `🔔 ${this.currentImpact.name} released! High volatility expected.`,
            'warning'
        );
        
        // Impact lasts for configured duration
        setTimeout(() => {
            this.currentImpact = null;
            NotificationManager.show('News impact subsided', 'info');
        }, this.currentImpact.duration || CONFIG.NEWS_DURATION);
    }

    checkSchedule() {
        // Clean up old scheduled news
        this.scheduledNews = this.scheduledNews.filter(n => n.releaseTime > Date.now());
    }

    getCurrentImpact() {
        return this.currentImpact;
    }

    getNextNews() {
        return this.nextNews;
    }

    getNewsHistory() {
        return this.newsHistory.slice(-10);
    }
}

// ============================================
// SESSION MANAGER
// ============================================
class SessionManager {
    constructor() {
        this.sessions = CONFIG.SESSIONS;
        this.currentSession = this.getCurrentSession();
        this.sessionHistory = [];
        this.startSessionTracking();
        console.log('SessionManager initialized');
    }

    getCurrentSession() {
        const now = new Date();
        const hour = now.getUTCHours();
        
        // Check for overlap first
        if (hour >= 13 && hour < 16) {
            return this.sessions[3]; // Overlap
        }
        
        // Check other sessions
        for (const session of this.sessions) {
            if (session.name === 'London-New York Overlap') continue;
            
            if (hour >= session.startHour && hour < session.endHour) {
                return session;
            }
        }
        
        // Default to Asia (overnight)
        return this.sessions[0];
    }

    startSessionTracking() {
        setInterval(() => {
            const newSession = this.getCurrentSession();
            if (newSession.name !== this.currentSession.name) {
                this.sessionHistory.push({
                    from: this.currentSession,
                    to: newSession,
                    time: Date.now()
                });
                
                this.currentSession = newSession;
                
                // Notify UI
                if (UIController && UIController.updateSession) {
                    UIController.updateSession(this.currentSession);
                }
                
                NotificationManager.show(
                    `Session changed to ${this.currentSession.name}`,
                    'info'
                );
            }
        }, 60000); // Check every minute
    }

    getSession() {
        return this.currentSession;
    }

    getSessionName() {
        return this.currentSession.name;
    }

    getSessionColor() {
        return this.currentSession.color;
    }

    getVolatilityMultiplier() {
        return this.currentSession.volatility;
    }

    getFakeBreakoutProbability() {
        return this.currentSession.fakeBreakout;
    }

    getSessionHours() {
        return this.sessions.map(s => ({
            name: s.name,
            start: s.startHour,
            end: s.endHour,
            active: s.name === this.currentSession.name
        }));
    }
}

// ============================================
// PSYCHOLOGY ENGINE
// ============================================
class PsychologyEngine {
    constructor() {
        this.state = {
            fear: 0,
            greed: 0,
            fomo: 0,
            confidence: 50,
            revenge: 0,
            overtrade: 0,
            patience: 100,
            discipline: 100
        };
        
        this.messages = CONFIG.EDUCATIONAL_TIPS;
        this.messageHistory = [];
        this.lastMessageTime = Date.now();
        console.log('PsychologyEngine initialized');
    }

    updateAfterTrade(tradeResult) {
        // Update psychology based on trade result
        if (tradeResult === 'win') {
            this.state.confidence = Math.min(100, this.state.confidence + 5);
            this.state.greed = Math.min(100, this.state.greed + 3);
            this.state.fear = Math.max(0, this.state.fear - 5);
            this.state.revenge = Math.max(0, this.state.revenge - 2);
        } else if (tradeResult === 'loss') {
            this.state.fear = Math.min(100, this.state.fear + 8);
            this.state.confidence = Math.max(0, this.state.confidence - 5);
            this.state.revenge = Math.min(100, this.state.revenge + 5);
            this.state.greed = Math.max(0, this.state.greed - 3);
        }
        
        // Normalize values
        this.normalizeState();
        
        // Generate message if needed
        this.generateMessage();
        
        return this.getState();
    }

    updateAfterWinStreak(streak) {
        if (streak >= 2) {
            this.state.confidence = Math.min(100, this.state.confidence + streak * 2);
            this.state.greed = Math.min(100, this.state.greed + streak * 3);
            
            if (streak >= 3) {
                this.showMessage(
                    `⚠️ ${streak} wins in a row! Don't get overconfident.`,
                    'warning'
                );
            }
        }
    }

    updateAfterLossStreak(streak) {
        if (streak >= 2) {
            this.state.fear = Math.min(100, this.state.fear + streak * 5);
            this.state.revenge = Math.min(100, this.state.revenge + streak * 5);
            
            if (streak >= 3) {
                this.showMessage(
                    `⚠️ ${streak} losses in a row. Take a break! Revenge trading is dangerous.`,
                    'danger'
                );
            }
        }
    }

    detectFOMO(entry) {
        const price = MarketEngine ? MarketEngine.getPrice(entry.pair) : 0;
        const candles = MarketEngine ? MarketEngine.getCandles(entry.pair) : [];
        
        if (candles.length < 5) return false;
        
        const recentPrices = candles.slice(-5).map(c => c.close);
        const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / 5;
        const priceChange = (price - avgPrice) / avgPrice * 100;
        
        let fomoDetected = false;
        
        if (entry.type === 'buy' && priceChange > 0.5) {
            this.state.fomo = Math.min(100, this.state.fomo + 15);
            fomoDetected = true;
        } else if (entry.type === 'sell' && priceChange < -0.5) {
            this.state.fomo = Math.min(100, this.state.fomo + 15);
            fomoDetected = true;
        }
        
        if (fomoDetected) {
            this.showMessage(
                "⚠️ FOMO detected! Entry without retracement increases risk.",
                'warning'
            );
        }
        
        return fomoDetected;
    }

    detectOvertrade(tradeCount, timeFrame) {
        const tradesPerHour = tradeCount / (timeFrame / 3600000);
        
        if (tradesPerHour > 3) {
            this.state.overtrade = Math.min(100, this.state.overtrade + 10);
            this.state.patience = Math.max(0, this.state.patience - 5);
            
            this.showMessage(
                "⚠️ Overtrading detected! Quality over quantity.",
                'warning'
            );
            return true;
        }
        
        return false;
    }

    detectRevenge(lastTradeResult) {
        if (lastTradeResult === 'loss' && this.state.revenge > 50) {
            this.showMessage(
                "⚠️ Revenge trading pattern detected! Take a break.",
                'danger'
            );
            return true;
        }
        return false;
    }

    normalizeState() {
        Object.keys(this.state).forEach(key => {
            this.state[key] = Math.min(100, Math.max(0, this.state[key]));
        });
    }

    generateMessage() {
        // Generate random educational message every 30 seconds
        if (Date.now() - this.lastMessageTime > 30000) {
            const randomIndex = Math.floor(Math.random() * this.messages.length);
            const message = this.messages[randomIndex];
            
            this.showMessage(message, 'info');
            this.lastMessageTime = Date.now();
        }
        
        // Generate psychology-based messages
        if (this.state.fear > 70) {
            this.showMessage(
                "😨 High fear detected. Consider lowering position size.",
                'warning'
            );
        } else if (this.state.greed > 70) {
            this.showMessage(
                "🤑 Greed is high. Stick to your trading plan.",
                'warning'
            );
        } else if (this.state.fomo > 50) {
            this.showMessage(
                "👀 FOMO is high. Wait for confirmation.",
                'warning'
            );
        } else if (this.state.confidence > 80) {
            this.showMessage(
                "💪 Confidence is high but stay humble.",
                'info'
            );
        }
    }

    showMessage(message, type = 'info') {
        this.messageHistory.push({
            message,
            type,
            time: Date.now()
        });
        
        if (UIController && UIController.showPsychologyMessage) {
            UIController.showPsychologyMessage(message);
        }
    }

    getState() {
        return { ...this.state };
    }

    getMessages() {
        return this.messageHistory.slice(-10);
    }

    reset() {
        this.state = {
            fear: 0,
            greed: 0,
            fomo: 0,
            confidence: 50,
            revenge: 0,
            overtrade: 0,
            patience: 100,
            discipline: 100
        };
    }
}

// ============================================
// RISK MANAGER
// ============================================
class RiskManager {
    constructor() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.drawdown = 0;
        this.peakBalance = CONFIG.INITIAL_BALANCE;
        this.tradingLocked = false;
        this.lastTradeTime = null;
        this.tradeHistory = [];
        console.log('RiskManager initialized');
    }

    calculatePositionSize(accountBalance, riskPercent, entryPrice, stopLossPrice, pair) {
        if (!stopLossPrice) return 0;
        
        const riskAmount = accountBalance * (riskPercent / 100);
        const priceDifference = Math.abs(entryPrice - stopLossPrice);
        
        // Get pip value based on pair
        const pipValue = this.getPipValue(pair, entryPrice);
        
        if (priceDifference === 0) return 0;
        
        // Calculate position size
        const positionSize = riskAmount / (priceDifference / pipValue * 10);
        
        // Round to nearest valid lot size
        return Math.round(positionSize * 100) / 100;
    }

    getPipValue(pair, price) {
        // Determine pip value based on pair
        if (pair.includes('JPY')) {
            return 0.01; // JPY pairs
        } else if (pair.includes('XAU') || pair.includes('XAG')) {
            return 0.01; // Metals
        } else if (pair.includes('BTC') || pair.includes('ETH')) {
            return 0.1; // Crypto
        } else {
            return 0.0001; // Most forex
        }
    }

    validateTrade(trade) {
        const issues = [];
        
        // Check daily limit
        if (this.dailyTrades >= CONFIG.MAX_DAILY_TRADES) {
            issues.push(`Daily trade limit (${CONFIG.MAX_DAILY_TRADES}) reached`);
        }
        
        // Check stop loss
        if (!trade.stopLoss) {
            issues.push("Stop loss is required for all trades");
        } else {
            // Check stop loss distance
            const slDistance = Math.abs(trade.entryPrice - trade.stopLoss);
            const minDistance = trade.entryPrice * 0.001; // 0.1% minimum
            
            if (slDistance < minDistance) {
                issues.push("Stop loss too tight");
            }
        }
        
        // Check take profit
        if (trade.takeProfit) {
            const tpDistance = Math.abs(trade.takeProfit - trade.entryPrice);
            const minRR = 1.5; // Minimum 1:1.5 risk-reward
            
            if (tpDistance < Math.abs(trade.entryPrice - trade.stopLoss) * minRR) {
                issues.push("Risk-reward ratio too low (minimum 1:1.5)");
            }
        }
        
        // Check risk percentage
        if (trade.riskPercent > 2) {
            issues.push("Risk exceeds 2% (institutional maximum)");
        }
        
        // Check drawdown
        if (this.drawdown >= CONFIG.MAX_DRAWDOWN) {
            issues.push(`Max drawdown (${CONFIG.MAX_DRAWDOWN}%) reached. Trading locked.`);
            this.tradingLocked = true;
        }
        
        // Check cooldown after losses
        if (this.consecutiveLosses >= CONFIG.TRADE_COOLDOWN_AFTER_LOSSES) {
            const cooldownRemaining = this.getCooldownRemaining();
            if (cooldownRemaining > 0) {
                const minutes = Math.ceil(cooldownRemaining / 60);
                issues.push(`Cooldown active: ${minutes} minutes remaining`);
            }
        }
        
        // Check if trading is locked
        if (this.tradingLocked) {
            issues.push("Trading is locked due to max drawdown");
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    getCooldownRemaining() {
        if (!this.lastTradeTime || this.consecutiveLosses < 3) return 0;
        
        const cooldownMinutes = Math.min(this.consecutiveLosses * 5, 30); // Max 30 minutes
        const elapsed = (Date.now() - this.lastTradeTime) / 1000; // seconds
        
        return Math.max(0, cooldownMinutes * 60 - elapsed);
    }

    updateAfterTrade(tradeResult, profit) {
        this.dailyTrades++;
        this.lastTradeTime = Date.now();
        
        this.tradeHistory.push({
            result: tradeResult,
            profit: profit,
            time: Date.now()
        });
        
        if (tradeResult === 'win') {
            this.consecutiveWins++;
            this.consecutiveLosses = 0;
        } else {
            this.consecutiveLosses++;
            this.consecutiveWins = 0;
        }
        
        // Keep only last 100 trades
        if (this.tradeHistory.length > 100) {
            this.tradeHistory.shift();
        }
    }

    updateDrawdown(currentBalance) {
        if (currentBalance > this.peakBalance) {
            this.peakBalance = currentBalance;
            this.drawdown = 0;
        } else {
            this.drawdown = ((this.peakBalance - currentBalance) / this.peakBalance) * 100;
        }
        
        // Check if drawdown limit reached
        if (this.drawdown >= CONFIG.MAX_DRAWDOWN) {
            this.tradingLocked = true;
            NotificationManager.show(
                `⚠️ Max drawdown (${CONFIG.MAX_DRAWDOWN}%) reached. Trading locked.`,
                'danger'
            );
        }
        
        return this.drawdown;
    }

    checkDailyTarget(currentBalance, startBalance) {
        const profit = currentBalance - startBalance;
        const targetMet = profit >= CONFIG.DAILY_TARGET;
        
        if (targetMet) {
            NotificationManager.show(
                `🎯 Daily target of $${CONFIG.DAILY_TARGET} achieved!`,
                'success'
            );
        }
        
        return targetMet;
    }

    getRiskMetrics() {
        const trades = this.tradeHistory;
        const wins = trades.filter(t => t.result === 'win');
        const losses = trades.filter(t => t.result === 'loss');
        
        const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
        const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.profit, 0)) / losses.length : 0;
        
        return {
            dailyTrades: this.dailyTrades,
            maxDailyTrades: CONFIG.MAX_DAILY_TRADES,
            consecutiveLosses: this.consecutiveLosses,
            consecutiveWins: this.consecutiveWins,
            drawdown: this.drawdown,
            maxDrawdown: CONFIG.MAX_DRAWDOWN,
            tradingLocked: this.tradingLocked,
            cooldownRemaining: this.getCooldownRemaining(),
            winRate: trades.length ? (wins.length / trades.length * 100) : 0,
            avgWin: avgWin,
            avgLoss: avgLoss,
            profitFactor: avgLoss ? (avgWin * wins.length) / (avgLoss * losses.length) : 0
        };
    }

    resetDaily() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.tradingLocked = false;
    }

    reset() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.drawdown = 0;
        this.peakBalance = CONFIG.INITIAL_BALANCE;
        this.tradingLocked = false;
        this.lastTradeTime = null;
        this.tradeHistory = [];
    }
}// ============================================
// TRADING SIMULATOR INSTITUTIONAL MONSTER ELITE
// SCRIPT.JS - MASTER CONTROLLER
// VERSION: 2.0.0
// ============================================

// ============================================
// GLOBAL CONFIGURATION
// ============================================
const CONFIG = {
    // Account Settings
    INITIAL_BALANCE: 100,
    DAILY_TARGET: 1,
    MAX_DAILY_TRADES: 5,
    DEFAULT_RISK: 1,
    MAX_DRAWDOWN: 20,
    
    // Trading Settings
    TRADE_COOLDOWN_AFTER_LOSSES: 3,
    MIN_LOT_SIZE: 0.01,
    MAX_LOT_SIZE: 100,
    DEFAULT_LOT_SIZE: 0.01,
    
    // Market Settings
    UPDATE_INTERVAL: 1000,
    CHART_CANDLES: 100,
    NEWS_CHECK_INTERVAL: 30000,
    NEWS_DURATION: 120000,
    
    // Psychology Settings
    FEAR_THRESHOLD: 70,
    GREED_THRESHOLD: 70,
    FOMO_THRESHOLD: 50,
    CONFIDENCE_MAX: 100,
    
    // Pair Lists
    FOREX_PAIRS: [
        { name: 'EUR/USD', base: 'EUR', quote: 'USD', spread: 0.0001, volatility: 0.8, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'GBP/USD', base: 'GBP', quote: 'USD', spread: 0.00015, volatility: 1.0, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/JPY', base: 'USD', quote: 'JPY', spread: 0.01, volatility: 0.9, pipSize: 0.01, category: 'forex', type: 'Major' },
        { name: 'AUD/USD', base: 'AUD', quote: 'USD', spread: 0.00012, volatility: 0.7, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/CHF', base: 'USD', quote: 'CHF', spread: 0.00013, volatility: 0.6, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'USD/CAD', base: 'USD', quote: 'CAD', spread: 0.00014, volatility: 0.8, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'NZD/USD', base: 'NZD', quote: 'USD', spread: 0.00016, volatility: 0.7, pipSize: 0.0001, category: 'forex', type: 'Major' },
        { name: 'EUR/GBP', base: 'EUR', quote: 'GBP', spread: 0.0002, volatility: 0.6, pipSize: 0.0001, category: 'forex', type: 'Minor' },
        { name: 'EUR/JPY', base: 'EUR', quote: 'JPY', spread: 0.02, volatility: 0.9, pipSize: 0.01, category: 'forex', type: 'Minor' },
        { name: 'GBP/JPY', base: 'GBP', quote: 'JPY', spread: 0.025, volatility: 1.1, pipSize: 0.01, category: 'forex', type: 'Minor' }
    ],
    
    CRYPTO_PAIRS: [
        { name: 'BTC/USD', base: 'BTC', quote: 'USD', spread: 10, volatility: 3.0, pipSize: 0.1, category: 'crypto', type: 'Major' },
        { name: 'ETH/USD', base: 'ETH', quote: 'USD', spread: 2, volatility: 2.5, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'BNB/USD', base: 'BNB', quote: 'USD', spread: 1.5, volatility: 2.2, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'SOL/USD', base: 'SOL', quote: 'USD', spread: 0.8, volatility: 2.8, pipSize: 0.01, category: 'crypto', type: 'Major' },
        { name: 'ADA/USD', base: 'ADA', quote: 'USD', spread: 0.0005, volatility: 2.4, pipSize: 0.0001, category: 'crypto', type: 'Minor' },
        { name: 'DOT/USD', base: 'DOT', quote: 'USD', spread: 0.3, volatility: 2.3, pipSize: 0.01, category: 'crypto', type: 'Minor' },
        { name: 'LINK/USD', base: 'LINK', quote: 'USD', spread: 0.4, volatility: 2.1, pipSize: 0.01, category: 'crypto', type: 'Minor' },
        { name: 'XRP/USD', base: 'XRP', quote: 'USD', spread: 0.0003, volatility: 2.6, pipSize: 0.0001, category: 'crypto', type: 'Minor' }
    ],
    
    COMMODITY_PAIRS: [
        { name: 'XAU/USD', base: 'XAU', quote: 'USD', spread: 0.5, volatility: 1.5, pipSize: 0.01, category: 'commodities', type: 'Gold' },
        { name: 'XAG/USD', base: 'XAG', quote: 'USD', spread: 0.03, volatility: 1.8, pipSize: 0.001, category: 'commodities', type: 'Silver' },
        { name: 'WTI/USD', base: 'WTI', quote: 'USD', spread: 0.1, volatility: 2.0, pipSize: 0.01, category: 'commodities', type: 'Oil' },
        { name: 'BRENT/USD', base: 'BRENT', quote: 'USD', spread: 0.12, volatility: 1.9, pipSize: 0.01, category: 'commodities', type: 'Oil' },
        { name: 'XPT/USD', base: 'XPT', quote: 'USD', spread: 2.0, volatility: 1.3, pipSize: 0.1, category: 'commodities', type: 'Platinum' },
        { name: 'XPD/USD', base: 'XPD', quote: 'USD', spread: 3.0, volatility: 1.4, pipSize: 0.1, category: 'commodities', type: 'Palladium' }
    ],
    
    INDICES: [
        { name: 'SPX/USD', base: 'SPX', quote: 'USD', spread: 2.5, volatility: 1.2, pipSize: 0.1, category: 'indices', type: 'S&P 500' },
        { name: 'NAS/USD', base: 'NAS', quote: 'USD', spread: 3.0, volatility: 1.4, pipSize: 0.1, category: 'indices', type: 'NASDAQ' },
        { name: 'DJI/USD', base: 'DJI', quote: 'USD', spread: 4.0, volatility: 1.1, pipSize: 0.1, category: 'indices', type: 'DOW JONES' },
        { name: 'DAX/USD', base: 'DAX', quote: 'USD', spread: 2.8, volatility: 1.3, pipSize: 0.1, category: 'indices', type: 'DAX 40' },
        { name: 'FTSE/USD', base: 'FTSE', quote: 'USD', spread: 2.2, volatility: 1.0, pipSize: 0.1, category: 'indices', type: 'FTSE 100' },
        { name: 'NIKKEI/USD', base: 'NIKKEI', quote: 'USD', spread: 5.0, volatility: 1.5, pipSize: 0.1, category: 'indices', type: 'NIKKEI 225' }
    ],
    
    SESSIONS: [
        { name: 'Asia', startHour: 0, endHour: 8, volatility: 0.5, fakeBreakout: 0.7, color: '#ffb300' },
        { name: 'London', startHour: 8, endHour: 16, volatility: 1.2, fakeBreakout: 0.4, color: '#2d7aff' },
        { name: 'New York', startHour: 13, endHour: 21, volatility: 1.5, fakeBreakout: 0.5, color: '#7c4dff' },
        { name: 'London-New York Overlap', startHour: 13, endHour: 16, volatility: 2.0, fakeBreakout: 0.6, color: '#00c853' }
    ],
    
    NEWS_EVENTS: [
        { name: 'FOMC Rate Decision', impact: 'high', volatilityMultiplier: 3, spreadMultiplier: 5, duration: 300000 },
        { name: 'NFP Report', impact: 'high', volatilityMultiplier: 2.5, spreadMultiplier: 4, duration: 240000 },
        { name: 'CPI Data', impact: 'high', volatilityMultiplier: 2.2, spreadMultiplier: 3.5, duration: 180000 },
        { name: 'GDP Release', impact: 'medium', volatilityMultiplier: 1.8, spreadMultiplier: 2.5, duration: 150000 },
        { name: 'Retail Sales', impact: 'medium', volatilityMultiplier: 1.5, spreadMultiplier: 2, duration: 120000 },
        { name: 'PMI Data', impact: 'medium', volatilityMultiplier: 1.3, spreadMultiplier: 1.8, duration: 100000 },
        { name: 'Central Bank Speech', impact: 'medium', volatilityMultiplier: 1.4, spreadMultiplier: 1.6, duration: 90000 },
        { name: 'Housing Data', impact: 'low', volatilityMultiplier: 1.1, spreadMultiplier: 1.2, duration: 60000 },
        { name: 'Consumer Confidence', impact: 'low', volatilityMultiplier: 1.05, spreadMultiplier: 1.1, duration: 45000 }
    ],
    
    EDUCATIONAL_TIPS: [
        "Risk management is more important than entry signals",
        "Always use stop loss to protect your capital",
        "Small consistent wins beat big risky trades",
        "Wait for market structure confirmation before entering",
        "Overtrading is the fastest way to blow your account",
        "The trend is your friend until it ends",
        "Don't fight the trend, trade with it",
        "FOMO leads to bad entries and losses",
        "Patience is a trader's superpower",
        "Keep a trading journal to track your progress",
        "Review your losses to learn from them",
        "Don't revenge trade after a loss",
        "Take breaks when you're on a losing streak",
        "News events cause high volatility - be careful",
        "Support becomes resistance, resistance becomes support",
        "Price respects key levels until it doesn't",
        "Liquidity grabs often precede reversals",
        "Order blocks show where institutions are active",
        "Higher timeframes show the bigger picture",
        "Multiple time frame analysis improves accuracy"
    ]
};

// ============================================
// MARKET ENGINE
// ============================================
class MarketEngine {
    constructor() {
        this.pairs = [];
        this.currentPrices = {};
        this.candles = {};
        this.trends = {};
        this.volatility = {};
        this.spreads = {};
        this.volumes = {};
        this.initializePairs();
        this.startPriceUpdates();
        console.log('MarketEngine initialized');
    }

    initializePairs() {
        // Combine all pairs
        const allPairs = [
            ...CONFIG.FOREX_PAIRS,
            ...CONFIG.CRYPTO_PAIRS,
            ...CONFIG.COMMODITY_PAIRS,
            ...CONFIG.INDICES
        ];
        
        allPairs.forEach(pair => {
            this.pairs.push(pair);
            const basePrice = this.generateInitialPrice(pair);
            this.currentPrices[pair.name] = basePrice;
            this.candles[pair.name] = this.generateInitialCandles(pair, basePrice);
            this.trends[pair.name] = this.generateTrend(pair);
            this.volatility[pair.name] = pair.volatility;
            this.spreads[pair.name] = pair.spread;
            this.volumes[pair.name] = Math.random() * 1000000;
        });
        
        console.log(`Initialized ${this.pairs.length} trading pairs`);
    }

    generateInitialPrice(pair) {
        const basePrices = {
            'EUR/USD': 1.12345,
            'GBP/USD': 1.26789,
            'USD/JPY': 148.234,
            'AUD/USD': 0.67890,
            'USD/CHF': 0.89123,
            'USD/CAD': 1.34567,
            'NZD/USD': 0.61234,
            'EUR/GBP': 0.85678,
            'EUR/JPY': 162.345,
            'GBP/JPY': 186.789,
            'BTC/USD': 56789.12,
            'ETH/USD': 3123.45,
            'BNB/USD': 412.56,
            'SOL/USD': 98.76,
            'ADA/USD': 0.4567,
            'DOT/USD': 7.89,
            'LINK/USD': 15.67,
            'XRP/USD': 0.5678,
            'XAU/USD': 1987.65,
            'XAG/USD': 23.45,
            'WTI/USD': 78.90,
            'BRENT/USD': 82.34,
            'XPT/USD': 945.67,
            'XPD/USD': 1023.45,
            'SPX/USD': 5123.45,
            'NAS/USD': 17890.12,
            'DJI/USD': 38765.43,
            'DAX/USD': 17890.67,
            'FTSE/USD': 8234.56,
            'NIKKEI/USD': 37890.23
        };
        return basePrices[pair.name] || 1.0000;
    }

    generateInitialCandles(pair, startPrice) {
        const candles = [];
        let price = startPrice;
        const volatility = pair.volatility * 0.01;
        
        for (let i = 0; i < CONFIG.CHART_CANDLES; i++) {
            const change = (Math.random() - 0.5) * volatility * price;
            const open = price;
            const close = price + change;
            const high = Math.max(open, close) + Math.random() * Math.abs(change) * 0.5;
            const low = Math.min(open, close) - Math.random() * Math.abs(change) * 0.5;
            
            candles.push({
                time: Date.now() - (CONFIG.CHART_CANDLES - i) * 60000,
                open: open,
                high: high,
                low: low,
                close: close,
                volume: Math.random() * 1000
            });
            
            price = close;
        }
        
        return candles;
    }

    generateTrend(pair) {
        return {
            direction: Math.random() > 0.5 ? 'up' : 'down',
            strength: Math.random() * pair.volatility,
            age: 0,
            momentum: Math.random() * 0.5
        };
    }

    startPriceUpdates() {
        setInterval(() => this.updatePrices(), CONFIG.UPDATE_INTERVAL);
        console.log('Price updates started');
    }

    updatePrices() {
        const session = SessionManager ? SessionManager.getCurrentSession() : CONFIG.SESSIONS[1];
        const newsImpact = NewsEngine ? NewsEngine.getCurrentImpact() : null;
        
        this.pairs.forEach(pair => {
            const pairName = pair.name;
            const trend = this.trends[pairName];
            let price = this.currentPrices[pairName];
            
            // Calculate volatility
            let currentVolatility = this.calculateVolatility(pair, session, newsImpact);
            
            // Update trend occasionally
            if (Math.random() < 0.005) {
                trend.direction = Math.random() > 0.5 ? 'up' : 'down';
                trend.strength = Math.random() * pair.volatility;
                trend.age = 0;
            }
            trend.age++;
            
            // Calculate base change
            let change = (Math.random() - 0.5) * currentVolatility * 0.01 * price;
            
            // Add trend bias
            if (trend.direction === 'up') {
                change += trend.strength * 0.0001 * price;
            } else {
                change -= trend.strength * 0.0001 * price;
            }
            
            // Add session bias
            change *= session.volatility;
            
            // Add news impact
            if (newsImpact) {
                change *= (1 + newsImpact.volatilityMultiplier * 0.5);
                this.spreads[pairName] = pair.spread * newsImpact.spreadMultiplier;
            } else {
                this.spreads[pairName] = pair.spread;
            }
            
            // Update price
            price += change;
            
            // Add mean reversion (prices tend to stay in range)
            const avgPrice = this.calculateAveragePrice(pairName);
            if (price > avgPrice * 1.05) {
                price -= Math.random() * currentVolatility * 0.005 * price;
            } else if (price < avgPrice * 0.95) {
                price += Math.random() * currentVolatility * 0.005 * price;
            }
            
            this.currentPrices[pairName] = price;
            
            // Update candles
            this.updateCandles(pairName, price);
            
            // Update volume
            this.volumes[pairName] = this.volumes[pairName] * 0.9 + Math.random() * 100000;
            
            // Check for fake breakout
            if (Math.random() < pair.volatility * 0.1 * session.fakeBreakout) {
                this.generateFakeBreakout(pairName);
            }
        });
        
        // Trigger UI update
        if (UIController && UIController.updatePrices) {
            UIController.updatePrices(this.currentPrices);
        }
    }

    calculateVolatility(pair, session, newsImpact) {
        let vol = pair.volatility * session.volatility;
        if (newsImpact) {
            vol *= (1 + newsImpact.volatilityMultiplier);
        }
        
        // Add random volatility spikes
        if (Math.random() < 0.01) {
            vol *= 1.5;
        }
        
        return Math.min(vol, pair.volatility * 3);
    }

    calculateAveragePrice(pairName) {
        const candles = this.candles[pairName];
        if (!candles || candles.length < 20) return this.currentPrices[pairName];
        
        let sum = 0;
        for (let i = candles.length - 20; i < candles.length; i++) {
            sum += candles[i].close;
        }
        return sum / 20;
    }

    updateCandles(pairName, price) {
        const candles = this.candles[pairName];
        const lastCandle = candles[candles.length - 1];
        
        // Update current candle
        lastCandle.close = price;
        lastCandle.high = Math.max(lastCandle.high, price);
        lastCandle.low = Math.min(lastCandle.low, price);
        lastCandle.volume += Math.random() * 100;
        
        // Add new candle every minute
        const timeSinceLastCandle = Date.now() - lastCandle.time;
        if (timeSinceLastCandle >= 60000) {
            const newCandle = {
                time: Date.now(),
                open: price,
                high: price,
                low: price,
                close: price,
                volume: Math.random() * 1000
            };
            candles.push(newCandle);
            
            // Keep only last CHART_CANDLES candles
            if (candles.length > CONFIG.CHART_CANDLES) {
                candles.shift();
            }
        }
    }

    generateFakeBreakout(pairName) {
        const price = this.currentPrices[pairName];
        const fakeMove = price * (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
        
        // Create fake breakout
        this.currentPrices[pairName] = price + fakeMove;
        
        // Quick reversal after 3 seconds
        setTimeout(() => {
            this.currentPrices[pairName] = price;
            
            // Show fake breakout message
            NotificationManager.show(`Fake breakout detected on ${pairName}`, 'warning');
        }, 3000);
    }

    getPrice(pairName) {
        return this.currentPrices[pairName] || 0;
    }

    getCandles(pairName) {
        return this.candles[pairName] || [];
    }

    getSpread(pairName) {
        return this.spreads[pairName] || 0;
    }

    getPairInfo(pairName) {
        return this.pairs.find(p => p.name === pairName);
    }

    getAllPairs() {
        return this.pairs;
    }

    getPairsByCategory(category) {
        return this.pairs.filter(p => p.category === category);
    }
}

// ============================================
// TREND ENGINE
// ============================================
class TrendEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.trends = {};
        this.supportLevels = {};
        this.resistanceLevels = {};
        this.movingAverages = {};
        console.log('TrendEngine initialized');
    }

    analyzeTrend(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) {
            return { direction: 'neutral', strength: 0, confidence: 0 };
        }
        
        // Calculate various moving averages
        const ma20 = this.calculateMA(candles, 20);
        const ma50 = this.calculateMA(candles, 50);
        const ma100 = this.calculateMA(candles, 100);
        const ma200 = this.calculateMA(candles, 200);
        
        // Store MAs
        this.movingAverages[pairName] = { ma20, ma50, ma100, ma200 };
        
        // Determine trend direction and strength
        let direction = 'neutral';
        let strength = 0;
        let confidence = 0;
        
        // Check alignment of MAs
        if (ma20 > ma50 && ma50 > ma100 && ma100 > ma200) {
            direction = 'up';
            strength = (ma20 - ma200) / ma200 * 100;
            confidence = 0.8;
        } else if (ma20 < ma50 && ma50 < ma100 && ma100 < ma200) {
            direction = 'down';
            strength = (ma200 - ma20) / ma200 * 100;
            confidence = 0.8;
        } else if (ma20 > ma50 && ma50 > ma100) {
            direction = 'up';
            strength = (ma20 - ma100) / ma100 * 100;
            confidence = 0.6;
        } else if (ma20 < ma50 && ma50 < ma100) {
            direction = 'down';
            strength = (ma100 - ma20) / ma100 * 100;
            confidence = 0.6;
        }
        
        // Calculate additional indicators
        const rsi = this.calculateRSI(candles);
        const macd = this.calculateMACD(candles);
        
        // Update support and resistance
        this.findSupportResistance(pairName, candles);
        
        return {
            direction,
            strength,
            confidence,
            rsi,
            macd,
            ma20,
            ma50,
            ma100,
            ma200
        };
    }

    calculateMA(candles, period) {
        if (candles.length < period) {
            return candles[candles.length - 1].close;
        }
        
        let sum = 0;
        for (let i = candles.length - period; i < candles.length; i++) {
            sum += candles[i].close;
        }
        return sum / period;
    }

    calculateRSI(candles, period = 14) {
        if (candles.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = candles.length - period; i < candles.length; i++) {
            const change = candles[i].close - candles[i - 1].close;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    calculateMACD(candles) {
        const ema12 = this.calculateEMA(candles, 12);
        const ema26 = this.calculateEMA(candles, 26);
        const macdLine = ema12 - ema26;
        const signalLine = this.calculateEMA(candles, 9, macdLine);
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: macdLine - signalLine
        };
    }

    calculateEMA(candles, period, price = null) {
        if (candles.length < period) return candles[candles.length - 1].close;
        
        const multiplier = 2 / (period + 1);
        let ema = price || candles[candles.length - period].close;
        
        for (let i = candles.length - period + 1; i < candles.length; i++) {
            ema = (candles[i].close - ema) * multiplier + ema;
        }
        
        return ema;
    }

    findSupportResistance(pairName, candles) {
        const highs = candles.map(c => c.high);
        const lows = candles.map(c => c.low);
        
        const swingHighs = [];
        const swingLows = [];
        const lookback = 5;
        
        // Find swing points
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Swing high
            let isSwingHigh = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (highs[j] >= highs[i]) {
                    isSwingHigh = false;
                    break;
                }
            }
            if (isSwingHigh) {
                swingHighs.push({ price: highs[i], index: i });
            }
            
            // Swing low
            let isSwingLow = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (lows[j] <= lows[i]) {
                    isSwingLow = false;
                    break;
                }
            }
            if (isSwingLow) {
                swingLows.push({ price: lows[i], index: i });
            }
        }
        
        // Cluster levels
        this.resistanceLevels[pairName] = this.clusterLevels(swingHighs.map(s => s.price));
        this.supportLevels[pairName] = this.clusterLevels(swingLows.map(s => s.price));
    }

    clusterLevels(levels) {
        const clustered = [];
        const threshold = 0.002; // 0.2%
        
        levels.sort((a, b) => a - b);
        
        for (const level of levels) {
            let found = false;
            for (const cluster of clustered) {
                if (Math.abs(level - cluster.level) / cluster.level < threshold) {
                    cluster.count++;
                    cluster.level = (cluster.level * (cluster.count - 1) + level) / cluster.count;
                    found = true;
                    break;
                }
            }
            if (!found) {
                clustered.push({ level, count: 1, strength: 1 });
            }
        }
        
        // Calculate strength based on count
        clustered.forEach(c => {
            c.strength = Math.min(c.count / 3, 1);
        });
        
        return clustered.filter(c => c.count >= 2);
    }

    getSupportLevels(pairName) {
        return this.supportLevels[pairName] || [];
    }

    getResistanceLevels(pairName) {
        return this.resistanceLevels[pairName] || [];
    }

    getBreakoutSignal(pairName) {
        const trend = this.analyzeTrend(pairName);
        const price = this.marketEngine.getPrice(pairName);
        const supports = this.getSupportLevels(pairName);
        const resistances = this.getResistanceLevels(pairName);
        const candles = this.marketEngine.getCandles(pairName);
        
        // Check for breakout
        if (trend.direction === 'up') {
            // Find nearest resistance
            const nearestResistance = resistances.find(r => r.level > price);
            if (nearestResistance) {
                const distance = (nearestResistance.level - price) / price;
                if (distance < 0.005) {
                    return {
                        type: 'resistance-test',
                        level: nearestResistance.level,
                        strength: nearestResistance.strength
                    };
                }
            }
            
            // Check if price broke above recent high
            const recentHigh = Math.max(...candles.slice(-20).map(c => c.high));
            if (price > recentHigh) {
                return {
                    type: 'breakout-up',
                    level: price,
                    strength: 0.7
                };
            }
        } else if (trend.direction === 'down') {
            // Find nearest support
            const nearestSupport = supports.find(s => s.level < price);
            if (nearestSupport) {
                const distance = (price - nearestSupport.level) / price;
                if (distance < 0.005) {
                    return {
                        type: 'support-test',
                        level: nearestSupport.level,
                        strength: nearestSupport.strength
                    };
                }
            }
            
            // Check if price broke below recent low
            const recentLow = Math.min(...candles.slice(-20).map(c => c.low));
            if (price < recentLow) {
                return {
                    type: 'breakout-down',
                    level: price,
                    strength: 0.7
                };
            }
        }
        
        return null;
    }
}

// ============================================
// STRUCTURE ENGINE
// ============================================
class StructureEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.structures = {};
        this.hh = {}; // Higher Highs
        this.hl = {}; // Higher Lows
        this.lh = {}; // Lower Highs
        this.ll = {}; // Lower Lows
        this.bos = {}; // Break of Structure
        this.choch = {}; // Change of Character
        console.log('StructureEngine initialized');
    }

    analyzeStructure(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 20) return null;
        
        // Find swing points
        const swings = this.findSwings(candles);
        
        // Determine market structure
        let structure = 'ranging';
        let lastHH = null, lastHL = null, lastLH = null, lastLL = null;
        let hhArray = [], hlArray = [], lhArray = [], llArray = [];
        
        for (let i = 0; i < swings.length; i++) {
            const swing = swings[i];
            
            if (swing.type === 'high') {
                if (lastHH === null || swing.price > lastHH) {
                    lastHH = swing.price;
                    hhArray.push({ price: swing.price, index: swing.index });
                } else if (lastHH !== null && swing.price < lastHH) {
                    lastLH = swing.price;
                    lhArray.push({ price: swing.price, index: swing.index });
                }
            } else {
                if (lastLL === null || swing.price < lastLL) {
                    lastLL = swing.price;
                    llArray.push({ price: swing.price, index: swing.index });
                } else if (lastLL !== null && swing.price > lastLL) {
                    lastHL = swing.price;
                    hlArray.push({ price: swing.price, index: swing.index });
                }
            }
        }
        
        // Store levels
        this.hh[pairName] = hhArray.slice(-3);
        this.hl[pairName] = hlArray.slice(-3);
        this.lh[pairName] = lhArray.slice(-3);
        this.ll[pairName] = llArray.slice(-3);
        
        // Determine trend
        if (hhArray.length > 1 && hlArray.length > 1) {
            const lastHHVal = hhArray[hhArray.length - 1].price;
            const prevHHVal = hhArray[hhArray.length - 2].price;
            const lastHLVal = hlArray[hlArray.length - 1].price;
            const prevHLVal = hlArray[hlArray.length - 2].price;
            
            if (lastHHVal > prevHHVal && lastHLVal > prevHLVal) {
                structure = 'uptrend';
            }
        }
        
        if (lhArray.length > 1 && llArray.length > 1) {
            const lastLHVal = lhArray[lhArray.length - 1].price;
            const prevLHVal = lhArray[lhArray.length - 2].price;
            const lastLLVal = llArray[llArray.length - 1].price;
            const prevLLVal = llArray[llArray.length - 2].price;
            
            if (lastLHVal < prevLHVal && lastLLVal < prevLLVal) {
                structure = 'downtrend';
            }
        }
        
        // Check for Break of Structure
        this.checkBreakOfStructure(pairName, candles, swings);
        
        // Check for Change of Character
        this.checkChangeOfCharacter(pairName, structure);
        
        this.structures[pairName] = {
            structure,
            hh: hhArray,
            hl: hlArray,
            lh: lhArray,
            ll: llArray,
            bos: this.bos[pairName],
            choch: this.choch[pairName],
            swings
        };
        
        return this.structures[pairName];
    }

    findSwings(candles) {
        const swings = [];
        const lookback = 3;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Check for swing high
            let isSwingHigh = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (candles[j].high >= candles[i].high) {
                    isSwingHigh = false;
                    break;
                }
            }
            if (isSwingHigh) {
                swings.push({
                    type: 'high',
                    price: candles[i].high,
                    index: i,
                    time: candles[i].time
                });
            }
            
            // Check for swing low
            let isSwingLow = true;
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (candles[j].low <= candles[i].low) {
                    isSwingLow = false;
                    break;
                }
            }
            if (isSwingLow) {
                swings.push({
                    type: 'low',
                    price: candles[i].low,
                    index: i,
                    time: candles[i].time
                });
            }
        }
        
        return swings;
    }

    checkBreakOfStructure(pairName, candles, swings) {
        if (swings.length < 4) return;
        
        const price = this.marketEngine.getPrice(pairName);
        const recentSwings = swings.slice(-4);
        
        // Check for BOS in uptrend
        if (recentSwings[0].type === 'low' && recentSwings[1].type === 'high' &&
            recentSwings[2].type === 'low' && recentSwings[3].type === 'high') {
            
            const low1 = recentSwings[0].price;
            const high1 = recentSwings[1].price;
            const low2 = recentSwings[2].price;
            const high2 = recentSwings[3].price;
            
            if (low2 > low1 && price > high1) {
                this.bos[pairName] = {
                    type: 'bullish',
                    price: price,
                    time: Date.now(),
                    strength: 'strong'
                };
            }
        }
        
        // Check for BOS in downtrend
        if (recentSwings[0].type === 'high' && recentSwings[1].type === 'low' &&
            recentSwings[2].type === 'high' && recentSwings[3].type === 'low') {
            
            const high1 = recentSwings[0].price;
            const low1 = recentSwings[1].price;
            const high2 = recentSwings[2].price;
            const low2 = recentSwings[3].price;
            
            if (high2 < high1 && price < low1) {
                this.bos[pairName] = {
                    type: 'bearish',
                    price: price,
                    time: Date.now(),
                    strength: 'strong'
                };
            }
        }
    }

    checkChangeOfCharacter(pairName, currentStructure) {
        const previousStructure = this.structures[pairName]?.structure;
        
        if (previousStructure && currentStructure !== previousStructure) {
            this.choch[pairName] = {
                from: previousStructure,
                to: currentStructure,
                time: Date.now()
            };
        }
    }

    getStructure(pairName) {
        return this.structures[pairName] || {
            structure: 'unknown',
            hh: [],
            hl: [],
            lh: [],
            ll: []
        };
    }

    getOrderBlocks(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        const orderBlocks = [];
        
        for (let i = 1; i < candles.length - 2; i++) {
            // Bullish order block (big green candle)
            if (candles[i].close > candles[i].open * 1.01) {
                // Check if it's followed by continuation
                if (candles[i + 1].close > candles[i + 1].open &&
                    candles[i + 2].close > candles[i + 2].open) {
                    orderBlocks.push({
                        type: 'bullish',
                        price: candles[i].close,
                        range: {
                            high: candles[i].high,
                            low: candles[i].low
                        },
                        time: candles[i].time,
                        strength: (candles[i].close - candles[i].open) / candles[i].open * 100
                    });
                }
            }
            
            // Bearish order block (big red candle)
            if (candles[i].open > candles[i].close * 1.01) {
                // Check if it's followed by continuation
                if (candles[i + 1].close < candles[i + 1].open &&
                    candles[i + 2].close < candles[i + 2].open) {
                    orderBlocks.push({
                        type: 'bearish',
                        price: candles[i].close,
                        range: {
                            high: candles[i].high,
                            low: candles[i].low
                        },
                        time: candles[i].time,
                        strength: (candles[i].open - candles[i].close) / candles[i].close * 100
                    });
                }
            }
        }
        
        return orderBlocks.slice(-10);
    }
}

// ============================================
// SUPPLY DEMAND ENGINE
// ============================================
class SupplyDemandEngine {
    constructor(marketEngine) {
        this.marketEngine = marketEngine;
        this.supplyZones = {};
        this.demandZones = {};
        console.log('SupplyDemandEngine initialized');
    }

    analyzeZones(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) return { supply: [], demand: [] };
        
        const supplyZones = this.findSupplyZones(candles);
        const demandZones = this.findDemandZones(candles);
        
        this.supplyZones[pairName] = this.mergeZones(supplyZones);
        this.demandZones[pairName] = this.mergeZones(demandZones);
        
        return {
            supply: this.supplyZones[pairName],
            demand: this.demandZones[pairName]
        };
    }

    findSupplyZones(candles) {
        const zones = [];
        const lookback = 10;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Look for strong selling pressure
            const zoneHigh = candles[i].high;
            const zoneLow = candles[i].low;
            const touches = [];
            
            // Find touches of this zone
            for (let j = Math.max(0, i - 20); j < Math.min(candles.length, i + 20); j++) {
                if (j === i) continue;
                
                // Check if price touched this zone
                if (candles[j].high >= zoneLow && candles[j].low <= zoneHigh) {
                    touches.push(candles[j]);
                }
            }
            
            // Check for strong rejection (long upper wick)
            const upperWick = candles[i].high - Math.max(candles[i].open, candles[i].close);
            const totalRange = candles[i].high - candles[i].low;
            
            if (touches.length >= 2 && upperWick > totalRange * 0.6) {
                zones.push({
                    price: zoneHigh,
                    high: zoneHigh,
                    low: zoneLow,
                    strength: touches.length,
                    touches: touches.length,
                    type: 'supply',
                    formedAt: candles[i].time
                });
            }
        }
        
        return zones;
    }

    findDemandZones(candles) {
        const zones = [];
        const lookback = 10;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            // Look for strong buying pressure
            const zoneHigh = candles[i].high;
            const zoneLow = candles[i].low;
            const touches = [];
            
            // Find touches of this zone
            for (let j = Math.max(0, i - 20); j < Math.min(candles.length, i + 20); j++) {
                if (j === i) continue;
                
                // Check if price touched this zone
                if (candles[j].high >= zoneLow && candles[j].low <= zoneHigh) {
                    touches.push(candles[j]);
                }
            }
            
            // Check for strong rejection (long lower wick)
            const lowerWick = Math.min(candles[i].open, candles[i].close) - candles[i].low;
            const totalRange = candles[i].high - candles[i].low;
            
            if (touches.length >= 2 && lowerWick > totalRange * 0.6) {
                zones.push({
                    price: zoneLow,
                    high: zoneHigh,
                    low: zoneLow,
                    strength: touches.length,
                    touches: touches.length,
                    type: 'demand',
                    formedAt: candles[i].time
                });
            }
        }
        
        return zones;
    }

    mergeZones(zones) {
        const merged = [];
        const threshold = 0.002; // 0.2%
        
        zones.sort((a, b) => a.price - b.price);
        
        for (const zone of zones) {
            let found = false;
            
            for (const m of merged) {
                if (Math.abs(zone.price - m.price) / m.price < threshold) {
                    // Merge zones
                    m.high = Math.max(m.high, zone.high);
                    m.low = Math.min(m.low, zone.low);
                    m.strength = (m.strength * m.touches + zone.strength * zone.touches) / (m.touches + zone.touches);
                    m.touches += zone.touches;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                merged.push({ ...zone });
            }
        }
        
        return merged;
    }

    getSupplyZones(pairName) {
        return this.supplyZones[pairName] || [];
    }

    getDemandZones(pairName) {
        return this.demandZones[pairName] || [];
    }

    isInSupplyZone(pairName, price) {
        const zones = this.getSupplyZones(pairName);
        return zones.some(zone => price >= zone.low && price <= zone.high);
    }

    isInDemandZone(pairName, price) {
        const zones = this.getDemandZones(pairName);
        return zones.some(zone => price >= zone.low && price <= zone.high);
    }

    getNearestSupply(pairName, price) {
        const zones = this.getSupplyZones(pairName);
        let nearest = null;
        let minDistance = Infinity;
        
        for (const zone of zones) {
            const distance = zone.price - price;
            if (distance > 0 && distance < minDistance) {
                minDistance = distance;
                nearest = zone;
            }
        }
        
        return nearest;
    }

    getNearestDemand(pairName, price) {
        const zones = this.getDemandZones(pairName);
        let nearest = null;
        let minDistance = Infinity;
        
        for (const zone of zones) {
            const distance = price - zone.price;
            if (distance > 0 && distance < minDistance) {
                minDistance = distance;
                nearest = zone;
            }
        }
        
        return nearest;
    }
}

// ============================================
// LIQUIDITY ENGINE
// ============================================
class LiquidityEngine {
    constructor(marketEngine, structureEngine) {
        this.marketEngine = marketEngine;
        this.structureEngine = structureEngine;
        this.liquidityLevels = {};
        this.liquidityGrabs = {};
        console.log('LiquidityEngine initialized');
    }

    findLiquidity(pairName) {
        const candles = this.marketEngine.getCandles(pairName);
        if (!candles || candles.length < 50) return [];
        
        const structure = this.structureEngine.getStructure(pairName);
        const liquidity = [];
        
        // Find liquidity above recent highs (stop losses of shorts)
        const recentHighs = candles.slice(-20).map(c => c.high);
        const highestHigh = Math.max(...recentHighs);
        
        liquidity.push({
            type: 'sell-side',
            price: highestHigh * 1.001,
            area: {
                high: highestHigh * 1.002,
                low: highestHigh
            },
            strength: recentHighs.filter(h => h > highestHigh * 0.998).length,
            source: 'recent-highs'
        });
        
        // Find liquidity below recent lows (stop losses of longs)
        const recentLows = candles.slice(-20).map(c => c.low);
        const lowestLow = Math.min(...recentLows);
        
        liquidity.push({
            type: 'buy-side',
            price: lowestLow * 0.999,
            area: {
                high: lowestLow,
                low: lowestLow * 0.998
            },
            strength: recentLows.filter(l => l < lowestLow * 1.002).length,
            source: 'recent-lows'
        });
        
        // Find liquidity at swing highs
        if (structure.hh && structure.hh.length > 0) {
            structure.hh.forEach(hh => {
                liquidity.push({
                    type: 'sell-side',
                    price: hh.price * 1.001,
                    area: {
                        high: hh.price * 1.002,
                        low: hh.price
                    },
                    strength: 2,
                    source: 'swing-high'
                });
            });
        }
        
        // Find liquidity at swing lows
        if (structure.ll && structure.ll.length > 0) {
            structure.ll.forEach(ll => {
                liquidity.push({
                    type: 'buy-side',
                    price: ll.price * 0.999,
                    area: {
                        high: ll.price,
                        low: ll.price * 0.998
                    },
                    strength: 2,
                    source: 'swing-low'
                });
            });
        }
        
        // Find double tops/bottoms (liquidity grabs)
        const doubleTops = this.findDoubleTops(candles);
        const doubleBottoms = this.findDoubleBottoms(candles);
        
        this.liquidityLevels[pairName] = [...liquidity, ...doubleTops, ...doubleBottoms];
        
        return this.liquidityLevels[pairName];
    }

    findDoubleTops(candles) {
        const tops = [];
        const lookback = 20;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            if (this.isSwingHigh(candles, i)) {
                // Look for another similar high within 20 candles
                for (let j = i + 1; j < Math.min(i + 20, candles.length - lookback); j++) {
                    if (this.isSwingHigh(candles, j)) {
                        const diff = Math.abs(candles[i].high - candles[j].high) / candles[i].high;
                        if (diff < 0.002) { // 0.2% difference
                            tops.push({
                                type: 'sell-side',
                                price: (candles[i].high + candles[j].high) / 2,
                                area: {
                                    high: Math.max(candles[i].high, candles[j].high),
                                    low: Math.min(candles[i].high, candles[j].high)
                                },
                                strength: 3,
                                source: 'double-top',
                                grabLikely: true
                            });
                            break;
                        }
                    }
                }
            }
        }
        
        return tops;
    }

    findDoubleBottoms(candles) {
        const bottoms = [];
        const lookback = 20;
        
        for (let i = lookback; i < candles.length - lookback; i++) {
            if (this.isSwingLow(candles, i)) {
                for (let j = i + 1; j < Math.min(i + 20, candles.length - lookback); j++) {
                    if (this.isSwingLow(candles, j)) {
                        const diff = Math.abs(candles[i].low - candles[j].low) / candles[i].low;
                        if (diff < 0.002) {
                            bottoms.push({
                                type: 'buy-side',
                                price: (candles[i].low + candles[j].low) / 2,
                                area: {
                                    high: Math.max(candles[i].low, candles[j].low),
                                    low: Math.min(candles[i].low, candles[j].low)
                                },
                                strength: 3,
                                source: 'double-bottom',
                                grabLikely: true
                            });
                            break;
                        }
                    }
                }
            }
        }
        
        return bottoms;
    }

    isSwingHigh(candles, index) {
        if (index < 2 || index >= candles.length - 2) return false;
        const high = candles[index].high;
        return high > candles[index - 1].high &&
               high > candles[index - 2].high &&
               high > candles[index + 1].high &&
               high > candles[index + 2].high;
    }

    isSwingLow(candles, index) {
        if (index < 2 || index >= candles.length - 2) return false;
        const low = candles[index].low;
        return low < candles[index - 1].low &&
               low < candles[index - 2].low &&
               low < candles[index + 1].low &&
               low < candles[index + 2].low;
    }

    detectLiquidityGrab(pairName, price, direction) {
        const levels = this.liquidityLevels[pairName] || [];
        const grab = {
            grabbed: false,
            level: null,
            type: null
        };
        
        for (const level of levels) {
            // Check if price grabbed sell-side liquidity
            if (direction === 'up' && level.type === 'sell-side') {
                if (price >= level.area.low && price <= level.area.high) {
                    grab.grabbed = true;
                    grab.level = level;
                    grab.type = 'sell-side';
                    
                    // Record the grab
                    this.liquidityGrabs[pairName] = {
                        time: Date.now(),
                        price: price,
                        level: level,
                        direction: 'up'
                    };
                    
                    break;
                }
            }
            
            // Check if price grabbed buy-side liquidity
            if (direction === 'down' && level.type === 'buy-side') {
                if (price >= level.area.low && price <= level.area.high) {
                    grab.grabbed = true;
                    grab.level = level;
                    grab.type = 'buy-side';
                    
                    this.liquidityGrabs[pairName] = {
                        time: Date.now(),
                        price: price,
                        level: level,
                        direction: 'down'
                    };
                    
                    break;
                }
            }
        }
        
        return grab;
    }

    getLiquidityLevels(pairName) {
        return this.liquidityLevels[pairName] || [];
    }

    getRecentGrab(pairName) {
        return this.liquidityGrabs[pairName];
    }
}

// ============================================
// NEWS ENGINE
// ============================================
class NewsEngine {
    constructor() {
        this.newsEvents = CONFIG.NEWS_EVENTS;
        this.scheduledNews = [];
        this.currentImpact = null;
        this.nextNews = null;
        this.newsHistory = [];
        this.startNewsSimulation();
        console.log('NewsEngine initialized');
    }

    startNewsSimulation() {
        setInterval(() => this.checkSchedule(), CONFIG.NEWS_CHECK_INTERVAL);
        this.scheduleRandomNews();
    }

    scheduleRandomNews() {
        // Schedule news every 3-7 minutes
        const scheduleNews = () => {
            const delay = (Math.floor(Math.random() * 4) + 3) * 60 * 1000; // 3-7 minutes
            setTimeout(() => {
                this.generateNews();
                scheduleNews(); // Schedule next
            }, delay);
        };
        
        scheduleNews();
    }

    generateNews() {
        const news = this.newsEvents[Math.floor(Math.random() * this.newsEvents.length)];
        const releaseTime = Date.now() + 60000; // 1 minute from now
        
        this.nextNews = {
            ...news,
            releaseTime: releaseTime,
            countdown: 60
        };
        
        this.scheduledNews.push(this.nextNews);
        
        // Notify UI
        if (UIController && UIController.showNewsPopup) {
            UIController.showNewsPopup(this.nextNews);
        }
        
        // Start countdown
        this.startCountdown();
    }

    startCountdown() {
        const interval = setInterval(() => {
            if (!this.nextNews) {
                clearInterval(interval);
                return;
            }
            
            const remaining = Math.max(0, (this.nextNews.releaseTime - Date.now()) / 1000);
            this.nextNews.countdown = remaining;
            
            if (remaining <= 0) {
                clearInterval(interval);
                this.releaseNews();
            }
        }, 1000);
    }

    releaseNews() {
        if (!this.nextNews) return;
        
        this.currentImpact = this.nextNews;
        this.newsHistory.push({
            ...this.nextNews,
            releaseTime: Date.now()
        });
        
        // Clear next news
        this.nextNews = null;
        
        // Notify UI
        if (UIController && UIController.showNewsRelease) {
            UIController.showNewsRelease(this.currentImpact);
        }
        
        NotificationManager.show(
            `🔔 ${this.currentImpact.name} released! High volatility expected.`,
            'warning'
        );
        
        // Impact lasts for configured duration
        setTimeout(() => {
            this.currentImpact = null;
            NotificationManager.show('News impact subsided', 'info');
        }, this.currentImpact.duration || CONFIG.NEWS_DURATION);
    }

    checkSchedule() {
        // Clean up old scheduled news
        this.scheduledNews = this.scheduledNews.filter(n => n.releaseTime > Date.now());
    }

    getCurrentImpact() {
        return this.currentImpact;
    }

    getNextNews() {
        return this.nextNews;
    }

    getNewsHistory() {
        return this.newsHistory.slice(-10);
    }
}

// ============================================
// SESSION MANAGER
// ============================================
class SessionManager {
    constructor() {
        this.sessions = CONFIG.SESSIONS;
        this.currentSession = this.getCurrentSession();
        this.sessionHistory = [];
        this.startSessionTracking();
        console.log('SessionManager initialized');
    }

    getCurrentSession() {
        const now = new Date();
        const hour = now.getUTCHours();
        
        // Check for overlap first
        if (hour >= 13 && hour < 16) {
            return this.sessions[3]; // Overlap
        }
        
        // Check other sessions
        for (const session of this.sessions) {
            if (session.name === 'London-New York Overlap') continue;
            
            if (hour >= session.startHour && hour < session.endHour) {
                return session;
            }
        }
        
        // Default to Asia (overnight)
        return this.sessions[0];
    }

    startSessionTracking() {
        setInterval(() => {
            const newSession = this.getCurrentSession();
            if (newSession.name !== this.currentSession.name) {
                this.sessionHistory.push({
                    from: this.currentSession,
                    to: newSession,
                    time: Date.now()
                });
                
                this.currentSession = newSession;
                
                // Notify UI
                if (UIController && UIController.updateSession) {
                    UIController.updateSession(this.currentSession);
                }
                
                NotificationManager.show(
                    `Session changed to ${this.currentSession.name}`,
                    'info'
                );
            }
        }, 60000); // Check every minute
    }

    getSession() {
        return this.currentSession;
    }

    getSessionName() {
        return this.currentSession.name;
    }

    getSessionColor() {
        return this.currentSession.color;
    }

    getVolatilityMultiplier() {
        return this.currentSession.volatility;
    }

    getFakeBreakoutProbability() {
        return this.currentSession.fakeBreakout;
    }

    getSessionHours() {
        return this.sessions.map(s => ({
            name: s.name,
            start: s.startHour,
            end: s.endHour,
            active: s.name === this.currentSession.name
        }));
    }
}

// ============================================
// PSYCHOLOGY ENGINE
// ============================================
class PsychologyEngine {
    constructor() {
        this.state = {
            fear: 0,
            greed: 0,
            fomo: 0,
            confidence: 50,
            revenge: 0,
            overtrade: 0,
            patience: 100,
            discipline: 100
        };
        
        this.messages = CONFIG.EDUCATIONAL_TIPS;
        this.messageHistory = [];
        this.lastMessageTime = Date.now();
        console.log('PsychologyEngine initialized');
    }

    updateAfterTrade(tradeResult) {
        // Update psychology based on trade result
        if (tradeResult === 'win') {
            this.state.confidence = Math.min(100, this.state.confidence + 5);
            this.state.greed = Math.min(100, this.state.greed + 3);
            this.state.fear = Math.max(0, this.state.fear - 5);
            this.state.revenge = Math.max(0, this.state.revenge - 2);
        } else if (tradeResult === 'loss') {
            this.state.fear = Math.min(100, this.state.fear + 8);
            this.state.confidence = Math.max(0, this.state.confidence - 5);
            this.state.revenge = Math.min(100, this.state.revenge + 5);
            this.state.greed = Math.max(0, this.state.greed - 3);
        }
        
        // Normalize values
        this.normalizeState();
        
        // Generate message if needed
        this.generateMessage();
        
        return this.getState();
    }

    updateAfterWinStreak(streak) {
        if (streak >= 2) {
            this.state.confidence = Math.min(100, this.state.confidence + streak * 2);
            this.state.greed = Math.min(100, this.state.greed + streak * 3);
            
            if (streak >= 3) {
                this.showMessage(
                    `⚠️ ${streak} wins in a row! Don't get overconfident.`,
                    'warning'
                );
            }
        }
    }

    updateAfterLossStreak(streak) {
        if (streak >= 2) {
            this.state.fear = Math.min(100, this.state.fear + streak * 5);
            this.state.revenge = Math.min(100, this.state.revenge + streak * 5);
            
            if (streak >= 3) {
                this.showMessage(
                    `⚠️ ${streak} losses in a row. Take a break! Revenge trading is dangerous.`,
                    'danger'
                );
            }
        }
    }

    detectFOMO(entry) {
        const price = MarketEngine ? MarketEngine.getPrice(entry.pair) : 0;
        const candles = MarketEngine ? MarketEngine.getCandles(entry.pair) : [];
        
        if (candles.length < 5) return false;
        
        const recentPrices = candles.slice(-5).map(c => c.close);
        const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / 5;
        const priceChange = (price - avgPrice) / avgPrice * 100;
        
        let fomoDetected = false;
        
        if (entry.type === 'buy' && priceChange > 0.5) {
            this.state.fomo = Math.min(100, this.state.fomo + 15);
            fomoDetected = true;
        } else if (entry.type === 'sell' && priceChange < -0.5) {
            this.state.fomo = Math.min(100, this.state.fomo + 15);
            fomoDetected = true;
        }
        
        if (fomoDetected) {
            this.showMessage(
                "⚠️ FOMO detected! Entry without retracement increases risk.",
                'warning'
            );
        }
        
        return fomoDetected;
    }

    detectOvertrade(tradeCount, timeFrame) {
        const tradesPerHour = tradeCount / (timeFrame / 3600000);
        
        if (tradesPerHour > 3) {
            this.state.overtrade = Math.min(100, this.state.overtrade + 10);
            this.state.patience = Math.max(0, this.state.patience - 5);
            
            this.showMessage(
                "⚠️ Overtrading detected! Quality over quantity.",
                'warning'
            );
            return true;
        }
        
        return false;
    }

    detectRevenge(lastTradeResult) {
        if (lastTradeResult === 'loss' && this.state.revenge > 50) {
            this.showMessage(
                "⚠️ Revenge trading pattern detected! Take a break.",
                'danger'
            );
            return true;
        }
        return false;
    }

    normalizeState() {
        Object.keys(this.state).forEach(key => {
            this.state[key] = Math.min(100, Math.max(0, this.state[key]));
        });
    }

    generateMessage() {
        // Generate random educational message every 30 seconds
        if (Date.now() - this.lastMessageTime > 30000) {
            const randomIndex = Math.floor(Math.random() * this.messages.length);
            const message = this.messages[randomIndex];
            
            this.showMessage(message, 'info');
            this.lastMessageTime = Date.now();
        }
        
        // Generate psychology-based messages
        if (this.state.fear > 70) {
            this.showMessage(
                "😨 High fear detected. Consider lowering position size.",
                'warning'
            );
        } else if (this.state.greed > 70) {
            this.showMessage(
                "🤑 Greed is high. Stick to your trading plan.",
                'warning'
            );
        } else if (this.state.fomo > 50) {
            this.showMessage(
                "👀 FOMO is high. Wait for confirmation.",
                'warning'
            );
        } else if (this.state.confidence > 80) {
            this.showMessage(
                "💪 Confidence is high but stay humble.",
                'info'
            );
        }
    }

    showMessage(message, type = 'info') {
        this.messageHistory.push({
            message,
            type,
            time: Date.now()
        });
        
        if (UIController && UIController.showPsychologyMessage) {
            UIController.showPsychologyMessage(message);
        }
    }

    getState() {
        return { ...this.state };
    }

    getMessages() {
        return this.messageHistory.slice(-10);
    }

    reset() {
        this.state = {
            fear: 0,
            greed: 0,
            fomo: 0,
            confidence: 50,
            revenge: 0,
            overtrade: 0,
            patience: 100,
            discipline: 100
        };
    }
}

// ============================================
// RISK MANAGER
// ============================================
class RiskManager {
    constructor() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.drawdown = 0;
        this.peakBalance = CONFIG.INITIAL_BALANCE;
        this.tradingLocked = false;
        this.lastTradeTime = null;
        this.tradeHistory = [];
        console.log('RiskManager initialized');
    }

    calculatePositionSize(accountBalance, riskPercent, entryPrice, stopLossPrice, pair) {
        if (!stopLossPrice) return 0;
        
        const riskAmount = accountBalance * (riskPercent / 100);
        const priceDifference = Math.abs(entryPrice - stopLossPrice);
        
        // Get pip value based on pair
        const pipValue = this.getPipValue(pair, entryPrice);
        
        if (priceDifference === 0) return 0;
        
        // Calculate position size
        const positionSize = riskAmount / (priceDifference / pipValue * 10);
        
        // Round to nearest valid lot size
        return Math.round(positionSize * 100) / 100;
    }

    getPipValue(pair, price) {
        // Determine pip value based on pair
        if (pair.includes('JPY')) {
            return 0.01; // JPY pairs
        } else if (pair.includes('XAU') || pair.includes('XAG')) {
            return 0.01; // Metals
        } else if (pair.includes('BTC') || pair.includes('ETH')) {
            return 0.1; // Crypto
        } else {
            return 0.0001; // Most forex
        }
    }

    validateTrade(trade) {
        const issues = [];
        
        // Check daily limit
        if (this.dailyTrades >= CONFIG.MAX_DAILY_TRADES) {
            issues.push(`Daily trade limit (${CONFIG.MAX_DAILY_TRADES}) reached`);
        }
        
        // Check stop loss
        if (!trade.stopLoss) {
            issues.push("Stop loss is required for all trades");
        } else {
            // Check stop loss distance
            const slDistance = Math.abs(trade.entryPrice - trade.stopLoss);
            const minDistance = trade.entryPrice * 0.001; // 0.1% minimum
            
            if (slDistance < minDistance) {
                issues.push("Stop loss too tight");
            }
        }
        
        // Check take profit
        if (trade.takeProfit) {
            const tpDistance = Math.abs(trade.takeProfit - trade.entryPrice);
            const minRR = 1.5; // Minimum 1:1.5 risk-reward
            
            if (tpDistance < Math.abs(trade.entryPrice - trade.stopLoss) * minRR) {
                issues.push("Risk-reward ratio too low (minimum 1:1.5)");
            }
        }
        
        // Check risk percentage
        if (trade.riskPercent > 2) {
            issues.push("Risk exceeds 2% (institutional maximum)");
        }
        
        // Check drawdown
        if (this.drawdown >= CONFIG.MAX_DRAWDOWN) {
            issues.push(`Max drawdown (${CONFIG.MAX_DRAWDOWN}%) reached. Trading locked.`);
            this.tradingLocked = true;
        }
        
        // Check cooldown after losses
        if (this.consecutiveLosses >= CONFIG.TRADE_COOLDOWN_AFTER_LOSSES) {
            const cooldownRemaining = this.getCooldownRemaining();
            if (cooldownRemaining > 0) {
                const minutes = Math.ceil(cooldownRemaining / 60);
                issues.push(`Cooldown active: ${minutes} minutes remaining`);
            }
        }
        
        // Check if trading is locked
        if (this.tradingLocked) {
            issues.push("Trading is locked due to max drawdown");
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    getCooldownRemaining() {
        if (!this.lastTradeTime || this.consecutiveLosses < 3) return 0;
        
        const cooldownMinutes = Math.min(this.consecutiveLosses * 5, 30); // Max 30 minutes
        const elapsed = (Date.now() - this.lastTradeTime) / 1000; // seconds
        
        return Math.max(0, cooldownMinutes * 60 - elapsed);
    }

    updateAfterTrade(tradeResult, profit) {
        this.dailyTrades++;
        this.lastTradeTime = Date.now();
        
        this.tradeHistory.push({
            result: tradeResult,
            profit: profit,
            time: Date.now()
        });
        
        if (tradeResult === 'win') {
            this.consecutiveWins++;
            this.consecutiveLosses = 0;
        } else {
            this.consecutiveLosses++;
            this.consecutiveWins = 0;
        }
        
        // Keep only last 100 trades
        if (this.tradeHistory.length > 100) {
            this.tradeHistory.shift();
        }
    }

    updateDrawdown(currentBalance) {
        if (currentBalance > this.peakBalance) {
            this.peakBalance = currentBalance;
            this.drawdown = 0;
        } else {
            this.drawdown = ((this.peakBalance - currentBalance) / this.peakBalance) * 100;
        }
        
        // Check if drawdown limit reached
        if (this.drawdown >= CONFIG.MAX_DRAWDOWN) {
            this.tradingLocked = true;
            NotificationManager.show(
                `⚠️ Max drawdown (${CONFIG.MAX_DRAWDOWN}%) reached. Trading locked.`,
                'danger'
            );
        }
        
        return this.drawdown;
    }

    checkDailyTarget(currentBalance, startBalance) {
        const profit = currentBalance - startBalance;
        const targetMet = profit >= CONFIG.DAILY_TARGET;
        
        if (targetMet) {
            NotificationManager.show(
                `🎯 Daily target of $${CONFIG.DAILY_TARGET} achieved!`,
                'success'
            );
        }
        
        return targetMet;
    }

    getRiskMetrics() {
        const trades = this.tradeHistory;
        const wins = trades.filter(t => t.result === 'win');
        const losses = trades.filter(t => t.result === 'loss');
        
        const avgWin = wins.length ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
        const avgLoss = losses.length ? Math.abs(losses.reduce((sum, t) => sum + t.profit, 0)) / losses.length : 0;
        
        return {
            dailyTrades: this.dailyTrades,
            maxDailyTrades: CONFIG.MAX_DAILY_TRADES,
            consecutiveLosses: this.consecutiveLosses,
            consecutiveWins: this.consecutiveWins,
            drawdown: this.drawdown,
            maxDrawdown: CONFIG.MAX_DRAWDOWN,
            tradingLocked: this.tradingLocked,
            cooldownRemaining: this.getCooldownRemaining(),
            winRate: trades.length ? (wins.length / trades.length * 100) : 0,
            avgWin: avgWin,
            avgLoss: avgLoss,
            profitFactor: avgLoss ? (avgWin * wins.length) / (avgLoss * losses.length) : 0
        };
    }

    resetDaily() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.tradingLocked = false;
    }

    reset() {
        this.dailyTrades = 0;
        this.consecutiveLosses = 0;
        this.consecutiveWins = 0;
        this.drawdown = 0;
        this.peakBalance = CONFIG.INITIAL_BALANCE;
        this.tradingLocked = false;
        this.lastTradeTime = null;
        this.tradeHistory = [];
    }
         }
