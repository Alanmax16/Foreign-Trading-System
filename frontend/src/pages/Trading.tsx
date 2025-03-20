import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  SelectChangeEvent
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RootState } from '../store';
import { updateMarketData, setSelectedCurrencyPair } from '../store/slices/tradingSlice';
import axios from 'axios';
import io from 'socket.io-client';

interface MarketData {
  baseCurrency: string;
  quoteCurrency: string;
  currentPrice: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface TradeForm {
  type: 'BUY' | 'SELL';
  amount: string;
  price: string;
  stopLoss?: string;
  takeProfit?: string;
}

const Trading: React.FC = () => {
  const dispatch = useDispatch();
  const { marketData, selectedCurrencyPair } = useSelector(
    (state: RootState) => state.trading
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [tradeForm, setTradeForm] = useState<TradeForm>({
    type: 'BUY',
    amount: '',
    price: '',
  });

  // Initialize with some mock data if empty
  useEffect(() => {
    if (Object.keys(marketData).length === 0) {
      // Add mock data for demonstration
      const mockData: MarketData = {
        baseCurrency: 'EUR',
        quoteCurrency: 'USD',
        currentPrice: 1.08,
        change24h: 0.02,
        volume24h: 1000000,
        high24h: 1.1,
        low24h: 1.06
      };
      dispatch(updateMarketData(mockData));
      dispatch(setSelectedCurrencyPair('EUR/USD'));
    }
  }, [dispatch, marketData]);

  useEffect(() => {
    // Simulate socket connection
    const mockSocket = {
      on: (event: string, callback: (data: any) => void) => {
        // Simulate market data updates every 10 seconds
        const interval = setInterval(() => {
          const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
          const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
          const [base, quote] = randomPair.split('/');
          
          const mockUpdate: MarketData = {
            baseCurrency: base,
            quoteCurrency: quote,
            currentPrice: Math.random() * 2 + 0.5,
            change24h: (Math.random() - 0.5) * 0.1,
            volume24h: Math.random() * 1000000,
            high24h: Math.random() * 2 + 1,
            low24h: Math.random() * 0.5 + 0.5
          };
          
          callback(mockUpdate);
        }, 10000);
        
        return () => clearInterval(interval);
      },
      disconnect: () => {}
    };
    
    const cleanup = mockSocket.on('market-data-update', (data: MarketData) => {
      dispatch(updateMarketData(data));
    });

    return cleanup;
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTradeForm({
      ...tradeForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCurrencyPairChange = (e: SelectChangeEvent<string>) => {
    dispatch(setSelectedCurrencyPair(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await axios.post('/api/trades', tradeForm);
      // Reset form
      setTradeForm({
        type: 'BUY',
        amount: '',
        price: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  const currentMarketData = selectedCurrencyPair && marketData[selectedCurrencyPair]
    ? marketData[selectedCurrencyPair]
    : null;

  // Fallback data for the chart if current market data is not available
  const chartData = currentMarketData 
    ? [
        { time: '00:00', price: currentMarketData.low24h },
        { time: '12:00', price: currentMarketData.currentPrice },
        { time: '24:00', price: currentMarketData.high24h },
      ]
    : [
        { time: '00:00', price: 1.05 },
        { time: '12:00', price: 1.08 },
        { time: '24:00', price: 1.10 },
      ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Market Data */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                {selectedCurrencyPair || 'Select a currency pair'}
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Currency Pair</InputLabel>
                <Select
                  value={selectedCurrencyPair || ''}
                  label="Currency Pair"
                  onChange={handleCurrencyPairChange}
                >
                  <MenuItem value="EUR/USD">EUR/USD</MenuItem>
                  <MenuItem value="GBP/USD">GBP/USD</MenuItem>
                  <MenuItem value="USD/JPY">USD/JPY</MenuItem>
                  <MenuItem value="AUD/USD">AUD/USD</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#1976d2"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Trading Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{ mb: 2 }}
            >
              <Tab label="Market Order" />
              <Tab label="Limit Order" />
            </Tabs>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Order Type</InputLabel>
                <Select
                  value={tradeForm.type}
                  label="Order Type"
                  name="type"
                  onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value as 'BUY' | 'SELL' })}
                >
                  <MenuItem value="BUY">Buy</MenuItem>
                  <MenuItem value="SELL">Sell</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Amount"
                name="amount"
                type="number"
                value={tradeForm.amount}
                onChange={handleFormChange}
                sx={{ mb: 2 }}
              />

              {selectedTab === 1 && (
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={tradeForm.price}
                  onChange={handleFormChange}
                  sx={{ mb: 2 }}
                />
              )}

              <TextField
                fullWidth
                label="Stop Loss"
                name="stopLoss"
                type="number"
                value={tradeForm.stopLoss || ''}
                onChange={handleFormChange}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Take Profit"
                name="takeProfit"
                type="number"
                value={tradeForm.takeProfit || ''}
                onChange={handleFormChange}
                sx={{ mb: 2 }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color={tradeForm.type === 'BUY' ? 'success' : 'error'}
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Execute Trade'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Market Overview
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(marketData).map(([pair, data]) => (
                <Grid item xs={12} sm={6} md={3} key={pair}>
                  <Box
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="subtitle2">{pair}</Typography>
                    <Typography variant="h6">
                      {data.currentPrice.toFixed(4)}
                    </Typography>
                    <Typography
                      color={data.change24h >= 0 ? 'success.main' : 'error.main'}
                    >
                      {data.change24h.toFixed(2)}%
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Trading; 