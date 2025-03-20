import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import paymentService, { PaymentMethod } from '../services/paymentService';

interface PaymentFormProps {
    amount: number;
    currency: string;
    accountId: number;
    onSuccess: () => void;
    onError: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
    amount,
    currency,
    accountId,
    onSuccess,
    onError
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const methods = await paymentService.getPaymentMethods();
            setSavedPaymentMethods(methods);
            if (methods.length > 0) {
                setSelectedMethod(methods[0].id);
            }
        } catch (error) {
            setError('Failed to load saved payment methods');
            console.error(error);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (!stripe || !elements) {
            setError('Stripe has not been initialized');
            setLoading(false);
            return;
        }

        try {
            if (selectedMethod) {
                // Use saved payment method
                const paymentIntent = await paymentService.createPaymentIntent(
                    amount,
                    currency,
                    accountId
                );
                await paymentService.confirmPayment(
                    paymentIntent.id,
                    selectedMethod
                );
            } else {
                // Use new card
                const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                    type: 'card',
                    card: elements.getElement(CardElement)!,
                });

                if (stripeError) {
                    throw stripeError;
                }

                const paymentIntent = await paymentService.createPaymentIntent(
                    amount,
                    currency,
                    accountId
                );
                await paymentService.confirmPayment(
                    paymentIntent.id,
                    paymentMethod.id
                );
            }

            onSuccess();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment failed';
            setError(errorMessage);
            onError(error instanceof Error ? error : new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Payment Details
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Amount: {amount} {currency}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {savedPaymentMethods.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Saved Payment Methods
                            </Typography>
                            {savedPaymentMethods.map((method) => (
                                <Box
                                    key={method.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 1,
                                        p: 1,
                                        border: '1px solid',
                                        borderColor: selectedMethod === method.id ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedMethod(method.id)}
                                >
                                    <Typography>
                                        {method.card?.brand.toUpperCase()} •••• {method.card?.last4}
                                        (Expires {method.card?.expMonth}/{method.card?.expYear})
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {selectedMethod ? (
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading || !stripe}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Pay with Saved Card'}
                        </Button>
                    ) : (
                        <>
                            <Box sx={{ mb: 2 }}>
                                <CardElement
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: '16px',
                                                color: '#424770',
                                                '::placeholder': {
                                                    color: '#aab7c4',
                                                },
                                            },
                                            invalid: {
                                                color: '#9e2146',
                                            },
                                        },
                                    }}
                                />
                            </Box>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading || !stripe}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Pay with New Card'}
                            </Button>
                        </>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};

export default PaymentForm; 