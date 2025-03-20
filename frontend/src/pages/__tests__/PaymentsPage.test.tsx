import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentsPage from '../PaymentsPage';

jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../../components/PaymentMethods', () => {
    return function MockPaymentMethods() {
        return <div data-testid="payment-methods">Payment Methods Component</div>;
    };
});

jest.mock('../../components/PaymentHistory', () => {
    return function MockPaymentHistory() {
        return <div data-testid="payment-history">Payment History Component</div>;
    };
});

describe('PaymentsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the page title', () => {
        render(<PaymentsPage />);
        expect(screen.getByText('Payments')).toBeInTheDocument();
    });

    it('renders PaymentMethods component', () => {
        render(<PaymentsPage />);
        expect(screen.getByTestId('payment-methods')).toBeInTheDocument();
    });

    it('renders PaymentHistory component', () => {
        render(<PaymentsPage />);
        expect(screen.getByTestId('payment-history')).toBeInTheDocument();
    });

    it('renders components in correct order', () => {
        render(<PaymentsPage />);
        const components = screen.getAllByTestId(/payment-/);
        expect(components[0]).toHaveAttribute('data-testid', 'payment-methods');
        expect(components[1]).toHaveAttribute('data-testid', 'payment-history');
    });

    it('renders within a container with proper spacing', () => {
        const { container } = render(<PaymentsPage />);
        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveStyle({ maxWidth: '1200px' });
    });
}); 