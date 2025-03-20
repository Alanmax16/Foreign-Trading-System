const axios = require('axios');

// You can replace this with your preferred market data API
const MARKET_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

class MarketDataService {
  constructor() {
    this.rates = {};
    this.lastUpdate = null;
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  async initialize() {
    await this.updateRates();
    setInterval(() => this.updateRates(), this.updateInterval);
  }

  async updateRates() {
    try {
      const response = await axios.get(MARKET_API_URL);
      this.rates = response.data.rates;
      this.lastUpdate = new Date();
      console.log('Market rates updated successfully');
    } catch (error) {
      console.error('Error updating market rates:', error);
    }
  }

  getExchangeRate(baseCurrency, quoteCurrency) {
    if (!this.rates[baseCurrency] || !this.rates[quoteCurrency]) {
      throw new Error('Invalid currency pair');
    }

    // Convert through USD
    const baseRate = this.rates[baseCurrency];
    const quoteRate = this.rates[quoteCurrency];
    return quoteRate / baseRate;
  }

  getAllRates() {
    return {
      rates: this.rates,
      lastUpdate: this.lastUpdate
    };
  }

  // Calculate profit/loss for a trade
  calculateProfitLoss(trade) {
    const { type, amount, price, baseCurrency, quoteCurrency } = trade;
    const currentRate = this.getExchangeRate(baseCurrency, quoteCurrency);
    
    if (type === 'buy') {
      return amount * (currentRate - price);
    } else {
      return amount * (price - currentRate);
    }
  }

  // Get supported currency pairs
  getSupportedPairs() {
    const currencies = Object.keys(this.rates);
    const pairs = [];
    
    for (let i = 0; i < currencies.length; i++) {
      for (let j = i + 1; j < currencies.length; j++) {
        pairs.push({
          base: currencies[i],
          quote: currencies[j],
          rate: this.getExchangeRate(currencies[i], currencies[j])
        });
      }
    }

    return pairs;
  }

  // Get mock market data for demo mode
  getMockMarketData() {
    const baseCurrencies = ['USD', 'EUR', 'GBP', 'JPY'];
    const mockData = {};

    baseCurrencies.forEach(base => {
      mockData[base] = {};
      baseCurrencies.forEach(quote => {
        if (base !== quote) {
          // Generate a random rate between 0.5 and 2.0
          const baseRate = Math.random() * 1.5 + 0.5;
          mockData[base][quote] = baseRate;
        }
      });
    });

    return mockData;
  }
}

// Create and export a singleton instance
const marketDataService = new MarketDataService();
module.exports = marketDataService;
