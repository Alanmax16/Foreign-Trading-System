import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

interface PaymentWrapperProps {
    amount: number;
    currency: string;
    accountId: number;
    onSuccess: () => void;
    onError: (error: Error) => void;
}

const PaymentWrapper: React.FC<PaymentWrapperProps> = (props) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm {...props} />
        </Elements>
    );
};

export default PaymentWrapper; 