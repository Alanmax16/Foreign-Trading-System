import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PaymentHistory from '../PaymentHistory';
import paymentService from '../../services/paymentService';

jest.mock('../../services/paymentService');

describe('PaymentHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', () => {
        render(<PaymentHistory />);
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays payment history when data is loaded', async () => {
        const mockPayments = [
            {
                id: 'pi_123',
                amount: 1000,
                currency: 'USD',
                status: 'succeeded',
                createdAt: '2024-01-01T00:00:00Z',
                description: 'Test payment'
            }
        ];

        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValueOnce(mockPayments);

        render(<PaymentHistory />);

        await waitFor(() => {
            expect(screen.getByText('Payment History')).toBeInTheDocument();
            expect(screen.getByText('$1,000.00')).toBeInTheDocument();
            expect(screen.getByText('Succeeded')).toBeInTheDocument();
            expect(screen.getByText('Test payment')).toBeInTheDocument();
        });
    });

    it('displays empty state when no payments exist', async () => {
        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValueOnce([]);

        render(<PaymentHistory />);

        await waitFor(() => {
            expect(screen.getByText('No payment history available')).toBeInTheDocument();
        });
    });

    it('displays error state when loading fails', async () => {
        const error = new Error('Failed to load payment history');
        (paymentService.getPaymentHistory as jest.Mock).mockRejectedValueOnce(error);

        render(<PaymentHistory />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load payment history')).toBeInTheDocument();
        });
    });

    it('formats date correctly', async () => {
        const mockPayments = [
            {
                id: 'pi_123',
                amount: 1000,
                currency: 'USD',
                status: 'succeeded',
                createdAt: '2024-01-01T12:00:00Z',
                description: 'Test payment'
            }
        ];

        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValueOnce(mockPayments);

        render(<PaymentHistory />);

        await waitFor(() => {
            // Note: The exact format will depend on the user's locale
            expect(screen.getByText(/2024/)).toBeInTheDocument();
        });
    });

    it('formats currency correctly', async () => {
        const mockPayments = [
            {
                id: 'pi_123',
                amount: 1234.56,
                currency: 'EUR',
                status: 'succeeded',
                createdAt: '2024-01-01T00:00:00Z',
                description: 'Test payment'
            }
        ];

        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValueOnce(mockPayments);

        render(<PaymentHistory />);

        await waitFor(() => {
            expect(screen.getByText('€1,234.56')).toBeInTheDocument();
        });
    });

    it('displays different status colors', async () => {
        const mockPayments = [
            {
                id: 'pi_123',
                amount: 1000,
                currency: 'USD',
                status: 'succeeded',
                createdAt: '2024-01-01T00:00:00Z',
                description: 'Successful payment'
            },
            {
                id: 'pi_124',
                amount: 1000,
                currency: 'USD',
                status: 'failed',
                createdAt: '2024-01-01T00:00:00Z',
                description: 'Failed payment'
            }
        ];

        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValueOnce(mockPayments);

        render(<PaymentHistory />);

        await waitFor(() => {
            const successStatus = screen.getByText('Succeeded');
            const failedStatus = screen.getByText('Failed');
            
            expect(successStatus).toHaveStyle({ color: expect.stringMatching(/success/) });
            expect(failedStatus).toHaveStyle({ color: expect.stringMatching(/error/) });
        });
    });
}); 