import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentWrapper from '../PaymentWrapper';
import PaymentForm from '../PaymentForm';

jest.mock('@stripe/stripe-js', () => ({
    loadStripe: jest.fn(() => Promise.resolve({}))
}));

jest.mock('../PaymentForm', () => {
    return function MockPaymentForm(props: any) {
        return <div data-testid="payment-form" {...props} />;
    };
});

describe('PaymentWrapper', () => {
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

    it('renders PaymentForm within Stripe Elements', () => {
        const { container, getByTestId } = render(
            <PaymentWrapper {...mockProps} />
        );

        expect(container.querySelector('.StripeElement')).toBeTruthy();
        expect(getByTestId('payment-form')).toBeInTheDocument();
    });

    it('passes props to PaymentForm', () => {
        const { getByTestId } = render(
            <PaymentWrapper {...mockProps} />
        );

        const paymentForm = getByTestId('payment-form');
        expect(paymentForm).toHaveAttribute('amount', '1000');
        expect(paymentForm).toHaveAttribute('currency', 'USD');
        expect(paymentForm).toHaveAttribute('accountId', '1');
    });

    it('initializes Stripe with public key from environment', () => {
        render(<PaymentWrapper {...mockProps} />);

        expect(loadStripe).toHaveBeenCalledWith(
            process.env.REACT_APP_STRIPE_PUBLIC_KEY
        );
    });

    it('handles missing Stripe public key', () => {
        const originalEnv = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
        delete process.env.REACT_APP_STRIPE_PUBLIC_KEY;

        expect(() => render(<PaymentWrapper {...mockProps} />))
            .toThrow('Stripe public key is required');

        process.env.REACT_APP_STRIPE_PUBLIC_KEY = originalEnv;
    });
}); 