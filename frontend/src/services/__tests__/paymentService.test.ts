import '@testing-library/jest-dom';
import axios from 'axios';
import { jest } from '@jest/globals';
import paymentService from '../paymentService';
import authService from '../authService';
import { User } from '../../store/slices/authSlice';

// Types
type MockedFunction<T extends (...args: any) => any> = {
  [P in keyof T]: T[P];
} & {
  mockClear: () => void;
  mockReset: () => void;
  mockRestore: () => void;
  mockImplementation: (fn: (...args: Parameters<T>) => ReturnType<T>) => MockedFunction<T>;
  mockImplementationOnce: (fn: (...args: Parameters<T>) => ReturnType<T>) => MockedFunction<T>;
  mockReturnValue: (value: ReturnType<T>) => MockedFunction<T>;
  mockReturnValueOnce: (value: ReturnType<T>) => MockedFunction<T>;
  mockResolvedValue: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockResolvedValueOnce: (value: Awaited<ReturnType<T>>) => MockedFunction<T>;
  mockRejectedValue: (reason: unknown) => MockedFunction<T>;
  mockRejectedValueOnce: (reason: unknown) => MockedFunction<T>;
};

type MockedObject<T extends object> = {
  [P in keyof T]: T[P] extends (...args: any) => any
    ? MockedFunction<T[P]>
    : T[P] extends object
    ? MockedObject<T[P]>
    : T[P];
};

// Mock axios
jest.mock('axios');
const mockedAxios = axios as unknown as MockedObject<typeof axios>;

// Mock types
type PaymentIntent = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret: string;
};

type PaymentMethod = {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
};

type Payment = {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    description?: string;
};

// Mock the auth service
jest.mock('../authService');

describe('PaymentService', () => {
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
    (authService.getUserById as jest.Mock).mockReturnValue(mockUser);
  });

  describe('processPayment', () => {
    it('should process a deposit payment successfully', async () => {
      const payment = await paymentService.processPayment(
        1,
        1000,
        'DEPOSIT',
        'Test deposit'
      );

      expect(payment).toBeDefined();
      expect(payment.type).toBe('DEPOSIT');
      expect(payment.amount).toBe(1000);
      expect(payment.status).toBe('COMPLETED');
      expect(authService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUser.balance).toBe(11000); // 10000 + 1000
    });

    it('should process a withdrawal payment successfully', async () => {
      const payment = await paymentService.processPayment(
        1,
        1000,
        'WITHDRAWAL',
        'Test withdrawal'
      );

      expect(payment).toBeDefined();
      expect(payment.type).toBe('WITHDRAWAL');
      expect(payment.amount).toBe(1000);
      expect(payment.status).toBe('COMPLETED');
      expect(authService.getUserById).toHaveBeenCalledWith(1);
      expect(mockUser.balance).toBe(9000); // 10000 - 1000
    });

    it('should throw error for insufficient funds during withdrawal', async () => {
      const userWithLowBalance: User = {
        ...mockUser,
        balance: 100
      };
      (authService.getUserById as jest.Mock).mockReturnValue(userWithLowBalance);

      await expect(
        paymentService.processPayment(1, 1000, 'WITHDRAWAL')
      ).rejects.toThrow('Insufficient funds');
    });

    it('should throw error for non-existent user', async () => {
      (authService.getUserById as jest.Mock).mockReturnValue(null);

      await expect(
        paymentService.processPayment(1, 1000, 'DEPOSIT')
      ).rejects.toThrow('User not found');
    });
  });

  describe('getUserPayments', () => {
    it('should return user payments', async () => {
      // First create a payment
      await paymentService.processPayment(1, 1000, 'DEPOSIT', 'Test payment');

      const payments = await paymentService.getUserPayments(1);
      expect(Array.isArray(payments)).toBe(true);
      expect(payments.length).toBeGreaterThan(0);
      expect(payments[0].userId).toBe(1);
    });
  });

  describe('getUserBalance', () => {
    it('should return user balance', async () => {
      const balance = await paymentService.getUserBalance(1);
      expect(balance).toBe(10000);
    });

    it('should return 0 for non-existent user', async () => {
      (authService.getUserById as jest.Mock).mockReturnValue(null);
      const balance = await paymentService.getUserBalance(1);
      expect(balance).toBe(0);
    });
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent successfully', async () => {
      const mockResponse = {
        data: {
          id: 'pi_123',
          amount: 1000,
          currency: 'USD',
          status: 'requires_payment_method',
          clientSecret: 'secret_123'
        } as PaymentIntent
      };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await paymentService.createPaymentIntent(1000, 'USD', 1);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/create-intent', {
        amount: 1000,
        currency: 'USD',
        accountId: 1
      });
    });

    it('should handle errors when creating payment intent', async () => {
      const error = new Error('Failed to create payment intent');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(paymentService.createPaymentIntent(1000, 'USD', 1))
        .rejects
        .toThrow('Failed to create payment intent');
    });
  });

  describe('getPaymentMethods', () => {
    it('should fetch payment methods successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'pm_123',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              expMonth: 12,
              expYear: 2025
            }
          }
        ] as PaymentMethod[]
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await paymentService.getPaymentMethods();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/payments/methods');
    });

    it('should handle errors when fetching payment methods', async () => {
      const error = new Error('Failed to fetch payment methods');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(paymentService.getPaymentMethods())
        .rejects
        .toThrow('Failed to fetch payment methods');
    });
  });

  describe('attachPaymentMethod', () => {
    it('should attach payment method successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await paymentService.attachPaymentMethod('pm_123');

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/attach-method', {
        paymentMethodId: 'pm_123'
      });
    });

    it('should handle errors when attaching payment method', async () => {
      const error = new Error('Failed to attach payment method');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(paymentService.attachPaymentMethod('pm_123'))
        .rejects
        .toThrow('Failed to attach payment method');
    });
  });

  describe('detachPaymentMethod', () => {
    it('should detach payment method successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await paymentService.detachPaymentMethod('pm_123');

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/detach-method', {
        paymentMethodId: 'pm_123'
      });
    });

    it('should handle errors when detaching payment method', async () => {
      const error = new Error('Failed to detach payment method');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(paymentService.detachPaymentMethod('pm_123'))
        .rejects
        .toThrow('Failed to detach payment method');
    });
  });

  describe('getPaymentHistory', () => {
    it('should fetch payment history successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'pi_123',
            amount: 1000,
            currency: 'USD',
            status: 'succeeded',
            createdAt: '2024-01-01T00:00:00Z',
            description: 'Test payment'
          }
        ] as Payment[]
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await paymentService.getPaymentHistory();

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/payments/history');
    });

    it('should handle errors when fetching payment history', async () => {
      const error = new Error('Failed to fetch payment history');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(paymentService.getPaymentHistory())
        .rejects
        .toThrow('Failed to fetch payment history');
    });
  });

  describe('handlePaymentWebhook', () => {
    it('should handle payment webhook successfully', async () => {
      const mockEvent = {
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_123',
            amount: 1000,
            currency: 'USD'
          }
        }
      };
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await paymentService.handlePaymentWebhook(mockEvent);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/payments/webhook', mockEvent);
    });

    it('should handle errors when processing webhook', async () => {
      const error = new Error('Failed to process webhook');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(paymentService.handlePaymentWebhook({}))
        .rejects
        .toThrow('Failed to process webhook');
    });
  });
}); 