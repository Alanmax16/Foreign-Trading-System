import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    description?: string;
}

export interface PaymentState {
    paymentMethods: PaymentMethod[];
    paymentHistory: Payment[];
    loading: boolean;
    error: string | null;
}

const initialState: PaymentState = {
    paymentMethods: [],
    paymentHistory: [],
    loading: false,
    error: null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPaymentMethods: (state, action: PayloadAction<PaymentMethod[]>) => {
            state.paymentMethods = action.payload;
        },
        addPaymentMethod: (state, action: PayloadAction<PaymentMethod>) => {
            state.paymentMethods.push(action.payload);
        },
        removePaymentMethod: (state, action: PayloadAction<string>) => {
            state.paymentMethods = state.paymentMethods.filter(
                method => method.id !== action.payload
            );
        },
        setPaymentHistory: (state, action: PayloadAction<Payment[]>) => {
            state.paymentHistory = action.payload;
        },
        addPaymentToHistory: (state, action: PayloadAction<Payment>) => {
            state.paymentHistory.push(action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        }
    }
});

export const {
    setPaymentMethods,
    addPaymentMethod,
    removePaymentMethod,
    setPaymentHistory,
    addPaymentToHistory,
    setLoading,
    setError
} = paymentSlice.actions;

export default paymentSlice.reducer; 