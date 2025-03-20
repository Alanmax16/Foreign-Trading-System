import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '../PaymentForm';
import paymentService from '../../services/paymentService';

jest.mock('../../services/paymentService');

const mockStripe = loadStripe('test_key');

describe('PaymentForm', () => {
    const mockProps = {
        amount: 1000,
        currency: 'USD',
        accountId: 1,
        onSuccess: jest.fn(),
        onError: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders payment form with amount and currency', () => {
        render(
            <Elements stripe={mockStripe}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        expect(screen.getByText('Payment Details')).toBeInTheDocument();
        expect(screen.getByText('Amount: 1000 USD')).toBeInTheDocument();
    });

    it('displays saved payment methods if available', async () => {
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

        (paymentService.getPaymentMethods as jest.Mock).mockResolvedValueOnce(mockPaymentMethods);

        render(
            <Elements stripe={mockStripe}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('Saved Payment Methods')).toBeInTheDocument();
            expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument();
        });
    });

    it('handles payment submission with saved card', async () => {
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

        (paymentService.getPaymentMethods as jest.Mock).mockResolvedValueOnce(mockPaymentMethods);
        (paymentService.createPaymentIntent as jest.Mock).mockResolvedValueOnce({
            id: 'pi_123',
            clientSecret: 'secret_123'
        });
        (paymentService.confirmPayment as jest.Mock).mockResolvedValueOnce(undefined);

        render(
            <Elements stripe={mockStripe}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('Pay with Saved Card')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Pay with Saved Card'));

        await waitFor(() => {
            expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
                1000,
                'USD',
                1
            );
            expect(paymentService.confirmPayment).toHaveBeenCalledWith(
                'pi_123',
                'pm_123'
            );
            expect(mockProps.onSuccess).toHaveBeenCalled();
        });
    });

    it('handles payment submission with new card', async () => {
        const mockStripeInstance = {
            createPaymentMethod: jest.fn().mockResolvedValueOnce({
                paymentMethod: { id: 'pm_new' },
                error: null
            })
        };

        (window as any).Stripe = jest.fn().mockReturnValue(mockStripeInstance);
        (paymentService.createPaymentIntent as jest.Mock).mockResolvedValueOnce({
            id: 'pi_123',
            clientSecret: 'secret_123'
        });
        (paymentService.confirmPayment as jest.Mock).mockResolvedValueOnce(undefined);

        render(
            <Elements stripe={mockStripe}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        expect(screen.getByText('Pay with New Card')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Pay with New Card'));

        await waitFor(() => {
            expect(mockStripeInstance.createPaymentMethod).toHaveBeenCalled();
            expect(paymentService.createPaymentIntent).toHaveBeenCalledWith(
                1000,
                'USD',
                1
            );
            expect(paymentService.confirmPayment).toHaveBeenCalledWith(
                'pi_123',
                'pm_new'
            );
            expect(mockProps.onSuccess).toHaveBeenCalled();
        });
    });

    it('handles payment errors', async () => {
        const error = new Error('Payment failed');
        (paymentService.createPaymentIntent as jest.Mock).mockRejectedValueOnce(error);

        render(
            <Elements stripe={mockStripe}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        fireEvent.click(screen.getByText('Pay with New Card'));

        await waitFor(() => {
            expect(screen.getByText('Payment failed')).toBeInTheDocument();
            expect(mockProps.onError).toHaveBeenCalledWith(error);
        });
    });

    it('displays error when Stripe is not initialized', async () => {
        render(
            <Elements stripe={null}>
                <PaymentForm {...mockProps} />
            </Elements>
        );

        fireEvent.click(screen.getByText('Pay with New Card'));

        await waitFor(() => {
            expect(screen.getByText('Stripe has not been initialized')).toBeInTheDocument();
        });
    });
}); 