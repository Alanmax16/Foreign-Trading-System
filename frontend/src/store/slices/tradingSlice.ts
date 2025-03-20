import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Trade {
  id: number;
  baseCurrency: string;
  quoteCurrency: string;
  amount: number;
  price: number;
  type: 'BUY' | 'SELL';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
}

interface MarketData {
  baseCurrency: string;
  quoteCurrency: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface TradingState {
  trades: Trade[];
  marketData: Record<string, MarketData>;
  loading: boolean;
  error: string | null;
  selectedCurrencyPair: string | null;
}

const initialState: TradingState = {
  trades: [],
  marketData: {},
  loading: false,
  error: null,
  selectedCurrencyPair: null,
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    updateTrade: (state, action: PayloadAction<Trade>) => {
      const index = state.trades.findIndex((trade) => trade.id === action.payload.id);
      if (index !== -1) {
        state.trades[index] = action.payload;
      }
    },
    updateMarketData: (state, action: PayloadAction<MarketData>) => {
      const key = `${action.payload.baseCurrency}/${action.payload.quoteCurrency}`;
      state.marketData[key] = action.payload;
    },
    setSelectedCurrencyPair: (state, action: PayloadAction<string | null>) => {
      state.selectedCurrencyPair = action.payload;
    },
    clearTradingState: (state) => {
      state.trades = [];
      state.marketData = {};
      state.loading = false;
      state.error = null;
      state.selectedCurrencyPair = null;
    },
  },
});

export const {
  setLoading,
  setError,
  addTrade,
  updateTrade,
  updateMarketData,
  setSelectedCurrencyPair,
  clearTradingState,
} = tradingSlice.actions;
export default tradingSlice.reducer; 