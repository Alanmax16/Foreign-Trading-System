import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { User } from '../store/slices/authSlice';
import authService from './authService';

// Mock data
const MOCK_PAYMENT_METHODS = [
  {
    id: 'pm_1234567890',
    type: 'card',
    card: {
      brand: 'visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2025
    }
  },
  {
    id: 'pm_0987654321',
    type: 'card',
    card: {
      brand: 'mastercard',
      last4: '9876',
      expMonth: 10,
      expYear: 2024
    }
  }
];

const MOCK_PAYMENT_HISTORY = [
  {
    id: 'pi_1234567890',
    amount: 5000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    description: 'Account deposit'
  },
  {
    id: 'pi_0987654321',
    amount: 10000,
    currency: 'USD',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    description: 'Account deposit'
  },
  {
    id: 'pi_5678901234',
    amount: 2500,
    currency: 'USD',
    status: 'succeeded',
    createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    description: 'Account deposit'
  }
];

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_mock');

// Mock payments database
let MOCK_PAYMENTS: Payment[] = [];
let nextPaymentId = 1;

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientSecret: string;
}

export interface PaymentMethod {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
}

export interface Payment {
  id: number;
  userId: number;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  status: 'COMPLETED' | 'FAILED' | 'PENDING';
  timestamp: string;
  description?: string;
}

class PaymentService {
    private static instance: PaymentService;
    private mockMode: boolean = true; // Set to false to use real API calls

    private constructor() {}

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    public async createPaymentIntent(
        amount: number,
        currency: string,
        accountId: number
    ): Promise<PaymentIntent> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            
            return {
                id: `pi_${Date.now()}`,
                amount,
                currency,
                status: 'requires_payment_method',
                clientSecret: `mock_secret_${Date.now()}`
            };
        } else {
            try {
                const response = await axios.post('/api/payments/create-intent', {
                    amount,
                    currency,
                    accountId
                });
                return response.data;
            } catch (error) {
                console.error('Error creating payment intent:', error);
                throw error;
            }
        }
    }

    public async confirmPayment(
        paymentIntentId: string,
        paymentMethodId: string
    ): Promise<void> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
            
            // Simulate success or failure based on payment method ID
            if (paymentMethodId.includes('fail')) {
                throw new Error('Payment failed: Card declined');
            }
            
            return;
        } else {
            try {
                await axios.post('/api/payments/confirm', {
                    paymentIntentId,
                    paymentMethodId
                });
            } catch (error) {
                console.error('Error confirming payment:', error);
                throw error;
            }
        }
    }

    public async getPaymentMethods(): Promise<PaymentMethod[]> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            return [...MOCK_PAYMENT_METHODS];
        } else {
            try {
                const response = await axios.get('/api/payments/methods');
                return response.data;
            } catch (error) {
                console.error('Error fetching payment methods:', error);
                throw error;
            }
        }
    }

    public async attachPaymentMethod(paymentMethodId: string): Promise<void> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            return;
        } else {
            try {
                await axios.post('/api/payments/attach-method', {
                    paymentMethodId
                });
            } catch (error) {
                console.error('Error attaching payment method:', error);
                throw error;
            }
        }
    }

    public async detachPaymentMethod(paymentMethodId: string): Promise<void> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            return;
        } else {
            try {
                await axios.post('/api/payments/detach-method', {
                    paymentMethodId
                });
            } catch (error) {
                console.error('Error detaching payment method:', error);
                throw error;
            }
        }
    }

    public async getPaymentHistory(): Promise<any[]> {
        if (this.mockMode) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 600));
            
            return [...MOCK_PAYMENT_HISTORY];
        } else {
            try {
                const response = await axios.get('/api/payments/history');
                return response.data;
            } catch (error) {
                console.error('Error fetching payment history:', error);
                throw error;
            }
        }
    }

    public async handlePaymentWebhook(event: any): Promise<void> {
        if (this.mockMode) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // No action needed for mock mode, just simulate success
            return;
        } else {
            try {
                await axios.post('/api/payments/webhook', event);
            } catch (error) {
                console.error('Error handling payment webhook:', error);
                throw error;
            }
        }
    }

    public async processPayment(
        userId: number,
        amount: number,
        type: 'DEPOSIT' | 'WITHDRAWAL',
        description?: string
    ): Promise<Payment> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            const user = authService.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Create new payment
            const payment: Payment = {
                id: nextPaymentId++,
                userId,
                amount,
                type,
                status: 'COMPLETED',
                timestamp: new Date().toISOString(),
                description
            };

            // Add payment to mock database
            MOCK_PAYMENTS.push(payment);

            return payment;
        } else {
            try {
                const response = await axios.post('/api/payments', {
                    userId,
                    amount,
                    type,
                    description
                });
                return response.data;
            } catch (error) {
                console.error('Payment processing error:', error);
                throw error;
            }
        }
    }

    public async getUserPayments(userId: number): Promise<Payment[]> {
        if (this.mockMode) {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            return MOCK_PAYMENTS.filter(payment => payment.userId === userId);
        } else {
            try {
                const response = await axios.get(`/api/payments/user/${userId}`);
                return response.data;
            } catch (error) {
                console.error('Error fetching user payments:', error);
                throw error;
            }
        }
    }

    public async getUserBalance(userId: number): Promise<number> {
        if (this.mockMode) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 300));
            const user = authService.getUserById(userId);
            return user?.balance || 0;
        } else {
            try {
                const response = await fetch(`/api/users/${userId}/balance`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user balance');
                }

                const data = await response.json();
                return data.balance;
            } catch (error) {
                console.error('Error fetching user balance:', error);
                throw error;
            }
        }
    }
}

export default PaymentService.getInstance(); 