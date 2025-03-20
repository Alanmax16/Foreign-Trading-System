import axios from 'axios';

// Mock data
const CURRENCY_PAIRS = [
  'EUR/USD',
  'GBP/USD',
  'USD/JPY',
  'AUD/USD',
  'USD/CAD',
  'USD/CHF',
  'NZD/USD'
];

interface MarketData {
  baseCurrency: string;
  quoteCurrency: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
}

class MarketDataService {
  private static instance: MarketDataService;
  private mockMode: boolean = true; // Set to true to use mock data instead of API calls
  private marketData: Record<string, MarketData> = {};
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Initialize mock data
    if (this.mockMode) {
      this.initializeMockData();
      this.startMockDataUpdates();
    }
  }

  public static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  private initializeMockData(): void {
    CURRENCY_PAIRS.forEach(pair => {
      const [base, quote] = pair.split('/');
      this.marketData[pair] = this.generateMockData(base, quote);
    });
  }

  private startMockDataUpdates(): void {
    // Update market data every 5 seconds
    this.updateInterval = setInterval(() => {
      CURRENCY_PAIRS.forEach(pair => {
        const [base, quote] = pair.split('/');
        this.updateMockData(pair, base, quote);
      });
    }, 5000);
  }

  public stopMockDataUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private generateMockData(baseCurrency: string, quoteCurrency: string): MarketData {
    let basePrice = 0;
    const pair = `${baseCurrency}/${quoteCurrency}`;
    
    // Set realistic initial rates
    if (pair === 'EUR/USD') basePrice = 1.08;
    else if (pair === 'GBP/USD') basePrice = 1.27;
    else if (pair === 'USD/JPY') basePrice = 134.5;
    else if (pair === 'AUD/USD') basePrice = 0.67;
    else if (pair === 'USD/CAD') basePrice = 1.35;
    else if (pair === 'USD/CHF') basePrice = 0.92;
    else if (pair === 'NZD/USD') basePrice = 0.62;
    else basePrice = 1 + Math.random(); // Default for any other pair
    
    const currentPrice = basePrice + (Math.random() * 0.02 - 0.01);
    const change24h = Math.random() * 0.04 - 0.02; // -2% to 2%
    const volume24h = Math.round(Math.random() * 500000000) + 100000000; // 100M to 600M
    const volatility = 0.015; // 1.5% volatility
    
    return {
      baseCurrency,
      quoteCurrency,
      currentPrice,
      change24h,
      volume24h,
      high24h: currentPrice * (1 + volatility * Math.random()),
      low24h: currentPrice * (1 - volatility * Math.random()),
      lastUpdated: new Date().toISOString()
    };
  }

  private updateMockData(pair: string, baseCurrency: string, quoteCurrency: string): void {
    const currentData = this.marketData[pair];
    if (!currentData) return;
    
    // Random price movement with mean reversion
    const basePrice = currentData.currentPrice;
    const volatility = 0.002; // 0.2% per update
    const meanReversionStrength = 0.1; // How strongly price reverts to base price
    
    // Get pair-specific base price
    let pairBasePrice = 0;
    if (pair === 'EUR/USD') pairBasePrice = 1.08;
    else if (pair === 'GBP/USD') pairBasePrice = 1.27;
    else if (pair === 'USD/JPY') pairBasePrice = 134.5;
    else if (pair === 'AUD/USD') pairBasePrice = 0.67;
    else if (pair === 'USD/CAD') pairBasePrice = 1.35;
    else if (pair === 'USD/CHF') pairBasePrice = 0.92;
    else if (pair === 'NZD/USD') pairBasePrice = 0.62;
    else pairBasePrice = 1 + Math.random();
    
    // Calculate new price with mean reversion to base price
    const randomWalk = (Math.random() - 0.5) * 2 * volatility * basePrice;
    const meanReversion = (pairBasePrice - basePrice) * meanReversionStrength;
    const newPrice = basePrice + randomWalk + meanReversion;
    
    // Update high and low if needed
    const high24h = Math.max(currentData.high24h, newPrice);
    const low24h = Math.min(currentData.low24h, newPrice);
    
    // Calculate new change percentage from previous day
    const change24h = (newPrice / basePrice - 1) * 100;
    
    // Update volume
    const volumeChange = (Math.random() - 0.5) * 0.02 * currentData.volume24h;
    const volume24h = Math.max(100000, currentData.volume24h + volumeChange);
    
    this.marketData[pair] = {
      ...currentData,
      currentPrice: newPrice,
      change24h,
      volume24h,
      high24h,
      low24h,
      lastUpdated: new Date().toISOString()
    };
  }

  public async getMarketData(): Promise<Record<string, MarketData>> {
    if (this.mockMode) {
      // Return a copy of the current mock data
      return { ...this.marketData };
    } else {
      try {
        const response = await axios.get('/api/market-data');
        return response.data;
      } catch (error) {
        console.error('Error fetching market data:', error);
        throw error;
      }
    }
  }

  public async getCurrencyPair(pair: string): Promise<MarketData | null> {
    if (this.mockMode) {
      return this.marketData[pair] || null;
    } else {
      try {
        const response = await axios.get(`/api/market-data/${pair}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching data for ${pair}:`, error);
        throw error;
      }
    }
  }

  public getAvailableCurrencyPairs(): string[] {
    if (this.mockMode) {
      return CURRENCY_PAIRS;
    } else {
      // In real mode, this would fetch from API
      return CURRENCY_PAIRS;
    }
  }

  public subscribeToUpdates(callback: (data: Record<string, MarketData>) => void): () => void {
    if (this.mockMode) {
      // Create a dedicated interval for this subscriber
      const interval = setInterval(() => {
        callback({ ...this.marketData });
      }, 3000);
      
      // Return unsubscribe function
      return () => clearInterval(interval);
    } else {
      // In a real app, this would set up a WebSocket connection
      console.warn('WebSocket subscription not implemented in API mode');
      return () => {};
    }
  }
}

export default MarketDataService.getInstance(); 