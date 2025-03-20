import tradingService from '../tradingService';
import authService from '../authService';
import paymentService from '../paymentService';
import { User } from '../../store/slices/authSlice';

// Mock the auth and payment services
jest.mock('../authService');
jest.mock('../paymentService');

describe('TradingService', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    balance: 10000,
    createdAt: new Date().toISOString(),
    enabled: true,
    roles: ['USER']
  };

  beforeEach(() => {
    // Reset mock implementations before each test
    jest.clearAllMocks();
    // Use proper typecasting for mocks
    (authService.getUserById as jest.Mock).mockReturnValue(mockUser);
    (paymentService.processPayment as jest.Mock).mockResolvedValue({
      id: 1,
      userId: 1,
      amount: 1000,
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    });
  });

  describe('executeTrade', () => {
    it('should execute a buy trade successfully', async () => {
      const trade = await tradingService.executeTrade({
        userId: 1,
        type: 'BUY',
        amount: 1000,
        baseCurrency: 'USD',
        quoteCurrency: 'EUR',
        rate: 0.85
      });

      expect(trade).toBeDefined();
      expect(trade.type).toBe('BUY');
      expect(trade.amount).toBe(1000);
      expect(trade.currency).toBe('USD/EUR');
      expect(trade.rate).toBe(0.85);
      expect(trade.status).toBe('COMPLETED');
      expect(authService.getUserById).toHaveBeenCalledWith(1);
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        1,
        850,
        'WITHDRAWAL',
        expect.any(String)
      );
    });

    it('should execute a sell trade successfully', async () => {
      const trade = await tradingService.executeTrade({
        userId: 1,
        type: 'SELL',
        amount: 1000,
        baseCurrency: 'USD',
        quoteCurrency: 'EUR',
        rate: 0.85
      });

      expect(trade).toBeDefined();
      expect(trade.type).toBe('SELL');
      expect(trade.amount).toBe(1000);
      expect(trade.currency).toBe('USD/EUR');
      expect(trade.rate).toBe(0.85);
      expect(trade.status).toBe('COMPLETED');
      expect(authService.getUserById).toHaveBeenCalledWith(1);
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        1,
        850,
        'DEPOSIT',
        expect.any(String)
      );
    });

    it('should throw error for insufficient funds', async () => {
      const userWithLowBalance: User = {
        ...mockUser,
        balance: 100
      };
      (authService.getUserById as jest.Mock).mockReturnValue(userWithLowBalance);

      await expect(
        tradingService.executeTrade({
          userId: 1,
          type: 'BUY',
          amount: 1000,
          baseCurrency: 'USD',
          quoteCurrency: 'EUR',
          rate: 0.85
        })
      ).rejects.toThrow('Insufficient funds');
    });

    it('should throw error for non-existent user', async () => {
      (authService.getUserById as jest.Mock).mockReturnValue(null);

      await expect(
        tradingService.executeTrade({
          userId: 1,
          type: 'BUY',
          amount: 1000,
          baseCurrency: 'USD',
          quoteCurrency: 'EUR',
          rate: 0.85
        })
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserTrades', () => {
    it('should return user trades', async () => {
      const trades = await tradingService.getUserTrades(1);
      expect(Array.isArray(trades)).toBe(true);
    });
  });
}); 