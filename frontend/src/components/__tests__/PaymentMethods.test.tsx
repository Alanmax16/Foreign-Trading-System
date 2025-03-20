import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentMethods from '../PaymentMethods';
import paymentService from '../../services/paymentService';

jest.mock('../../services/paymentService');

const mockStripe = loadStripe('test_key');

describe('PaymentMethods', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays saved payment methods', async () => {
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
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('Payment Methods')).toBeInTheDocument();
            expect(screen.getByText('VISA')).toBeInTheDocument();
            expect(screen.getByText(/4242/)).toBeInTheDocument();
            expect(screen.getByText(/12\/2025/)).toBeInTheDocument();
        });
    });

    it('displays empty state when no payment methods exist', async () => {
        (paymentService.getPaymentMethods as jest.Mock).mockResolvedValueOnce([]);

        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('No payment methods added yet')).toBeInTheDocument();
        });
    });

    it('handles adding a new payment method', async () => {
        (paymentService.getPaymentMethods as jest.Mock).mockResolvedValueOnce([]);

        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('Add New Card')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Add New Card'));

        expect(screen.getByText('Add New Payment Method')).toBeInTheDocument();
    });

    it('handles deleting a payment method', async () => {
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
        (paymentService.detachPaymentMethod as jest.Mock).mockResolvedValueOnce(undefined);

        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('VISA')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(paymentService.detachPaymentMethod).toHaveBeenCalledWith('pm_123');
        });
    });

    it('handles errors when loading payment methods', async () => {
        const error = new Error('Failed to load payment methods');
        (paymentService.getPaymentMethods as jest.Mock).mockRejectedValueOnce(error);

        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to load payment methods')).toBeInTheDocument();
        });
    });

    it('handles errors when deleting a payment method', async () => {
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
        (paymentService.detachPaymentMethod as jest.Mock).mockRejectedValueOnce(
            new Error('Failed to delete payment method')
        );

        render(
            <Elements stripe={mockStripe}>
                <PaymentMethods />
            </Elements>
        );

        await waitFor(() => {
            expect(screen.getByText('VISA')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete payment method')).toBeInTheDocument();
        });
    });
}); 