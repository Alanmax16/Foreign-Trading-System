import axios from 'axios';
import { User } from '../store/slices/authSlice';
import authService from './authService';

export interface Trade {
  id: number;
  userId: number;
  type: 'BUY' | 'SELL';
  amount: number;
  currency: string;
  rate: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
  description?: string;
}

export interface TradeRequest {
  userId: number;
  type: 'BUY' | 'SELL';
  amount: number;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
}

// Mock trades database
let MOCK_TRADES: Trade[] = [];
let nextTradeId = 1;

// Mock user balances
let MOCK_BALANCES: { [userId: number]: { [currency: string]: number } } = {};

class TradingService {
  private static instance: TradingService;
  private mockMode: boolean = true; // Set to false to use real API calls

  private constructor() {}

  public static getInstance(): TradingService {
    if (!TradingService.instance) {
      TradingService.instance = new TradingService();
    }
    return TradingService.instance;
  }

  private initializeUserBalances(userId: number) {
    if (!MOCK_BALANCES[userId]) {
      MOCK_BALANCES[userId] = {
        USD: 10000,
        EUR: 5000,
        GBP: 4000,
        JPY: 500000
      };
    }
  }

  public async executeTrade(request: TradeRequest): Promise<Trade> {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      const user = authService.getUserById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      this.initializeUserBalances(request.userId);
      const userBalances = MOCK_BALANCES[request.userId];

      // Calculate required and resulting amounts
      const { baseCurrency, quoteCurrency, amount, type, rate } = request;
      const requiredAmount = type === 'BUY' ? amount * rate : amount;
      const sourceCurrency = type === 'BUY' ? quoteCurrency : baseCurrency;
      const targetCurrency = type === 'BUY' ? baseCurrency : quoteCurrency;

      // Check if user has enough balance
      if (userBalances[sourceCurrency] < requiredAmount) {
        throw new Error(`Insufficient ${sourceCurrency} balance`);
      }

      // Update balances
      userBalances[sourceCurrency] -= requiredAmount;
      userBalances[targetCurrency] = (userBalances[targetCurrency] || 0) + (type === 'BUY' ? amount : amount * rate);

      // Create trade record
      const trade: Trade = {
        id: nextTradeId++,
        userId: request.userId,
        type: request.type,
        amount: request.amount,
        currency: `${request.baseCurrency}/${request.quoteCurrency}`,
        rate: request.rate,
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
        description: `${request.type} ${request.amount} ${request.baseCurrency} at ${request.rate} ${request.quoteCurrency}`
      };

      MOCK_TRADES.push(trade);
      return trade;
    } else {
      try {
        const response = await axios.post('/api/trades/execute', request);
        return response.data;
      } catch (error) {
        console.error('Error executing trade:', error);
        throw error;
      }
    }
  }

  public async getUserTrades(userId: number): Promise<Trade[]> {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      return MOCK_TRADES.filter(trade => trade.userId === userId);
    } else {
      try {
        const response = await axios.get(`/api/trades/user/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user trades:', error);
        throw error;
      }
    }
  }

  public async getUserBalances(userId: number): Promise<{ [key: string]: number }> {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      this.initializeUserBalances(userId);
      return MOCK_BALANCES[userId];
    } else {
      try {
        const response = await axios.get(`/api/users/${userId}/balances`);
        return response.data;
      } catch (error) {
        console.error('Error fetching user balances:', error);
        throw error;
      }
    }
  }

  public async getTradeSummary(userId: number): Promise<{
    totalTrades: number;
    totalVolume: number;
    profitLoss: number;
    mostTradedCurrency: string;
  }> {
    if (this.mockMode) {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

      const userTrades = MOCK_TRADES.filter(trade => trade.userId === userId);
      
      // Calculate summary statistics
      const summary = {
        totalTrades: userTrades.length,
        totalVolume: 0,
        profitLoss: 0,
        mostTradedCurrency: ''
      };

      // Calculate volume and profit/loss
      const currencyCount: { [key: string]: number } = {};
      userTrades.forEach(trade => {
        const volume = trade.amount * trade.rate;
        summary.totalVolume += volume;
        
        // Simple P&L calculation (in real app would be more complex)
        if (trade.type === 'BUY') {
          summary.profitLoss -= volume;
        } else {
          summary.profitLoss += volume;
        }

        // Track currency frequency
        const currency = trade.currency.split('/')[0];
        currencyCount[currency] = (currencyCount[currency] || 0) + 1;
      });

      // Find most traded currency
      summary.mostTradedCurrency = Object.entries(currencyCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

      return summary;
    } else {
      try {
        const response = await axios.get(`/api/trades/summary/${userId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching trade summary:', error);
        throw error;
      }
    }
  }
}

export default TradingService.getInstance(); 