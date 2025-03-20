import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import paymentReducer from './slices/paymentSlice';
import tradingReducer from './slices/tradingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payment: paymentReducer,
    trading: tradingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 