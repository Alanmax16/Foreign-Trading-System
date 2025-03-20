import { configureStore } from '@reduxjs/toolkit';
import paymentReducer, {
    setPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setPaymentHistory,
    addPaymentToHistory,
    PaymentState
} from '../paymentSlice';

// Create a type definition for the test file
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

describe('paymentSlice', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                payment: paymentReducer
            }
        });
    });

    it('should handle initial state', () => {
        expect(store.getState().payment).toEqual({
            paymentMethods: [],
            paymentHistory: [],
            loading: false,
            error: null
        });
    });

    it('should handle setPaymentMethods', () => {
        const mockPaymentMethods = [
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
        ];

        store.dispatch(setPaymentMethods(mockPaymentMethods));

        expect(store.getState().payment.paymentMethods).toEqual(mockPaymentMethods);
    });

    it('should handle addPaymentMethod', () => {
        const mockPaymentMethod = {
            id: 'pm_123',
            type: 'card',
            card: {
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025
            }
        };

        store.dispatch(addPaymentMethod(mockPaymentMethod));

        expect(store.getState().payment.paymentMethods).toEqual([mockPaymentMethod]);
    });

    it('should handle removePaymentMethod', () => {
        const mockPaymentMethod = {
            id: 'pm_123',
            type: 'card',
            card: {
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025
            }
        };

        store.dispatch(addPaymentMethod(mockPaymentMethod));
        store.dispatch(removePaymentMethod('pm_123'));

        expect(store.getState().payment.paymentMethods).toEqual([]);
    });

    it('should handle setPaymentHistory', () => {
        const mockPaymentHistory = [
            {
                id: 'pi_123',
                amount: 1000,
                currency: 'USD',
                status: 'succeeded',
                createdAt: '2024-01-01T00:00:00Z',
                description: 'Test payment'
            }
        ];

        store.dispatch(setPaymentHistory(mockPaymentHistory));

        expect(store.getState().payment.paymentHistory).toEqual(mockPaymentHistory);
    });

    it('should handle addPaymentToHistory', () => {
        const mockPayment = {
            id: 'pi_123',
            amount: 1000,
            currency: 'USD',
            status: 'succeeded',
            createdAt: '2024-01-01T00:00:00Z',
            description: 'Test payment'
        };

        store.dispatch(addPaymentToHistory(mockPayment));

        expect(store.getState().payment.paymentHistory).toEqual([mockPayment]);
    });

    it('should handle multiple actions in sequence', () => {
        const mockPaymentMethod = {
            id: 'pm_123',
            type: 'card',
            card: {
                brand: 'visa',
                last4: '4242',
                expMonth: 12,
                expYear: 2025
            }
        };

        const mockPayment = {
            id: 'pi_123',
            amount: 1000,
            currency: 'USD',
            status: 'succeeded',
            createdAt: '2024-01-01T00:00:00Z',
            description: 'Test payment'
        };

        store.dispatch(addPaymentMethod(mockPaymentMethod));
        store.dispatch(addPaymentToHistory(mockPayment));
        store.dispatch(removePaymentMethod('pm_123'));

        expect(store.getState().payment).toEqual({
            paymentMethods: [],
            paymentHistory: [mockPayment],
            loading: false,
            error: null
        });
    });
}); 