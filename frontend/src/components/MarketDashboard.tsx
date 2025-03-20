import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Grid,
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  useTheme,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { RootState } from '../store';
import currencyService from '../services/currencyService';
import tradingService from '../services/tradingService';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Currency pairs to display
const CURRENCY_PAIRS = [
  'USD/EUR',
  'USD/GBP',
  'USD/JPY',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY'
];

const MarketDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [rates, setRates] = useState<{[key: string]: number}>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>(CURRENCY_PAIRS[0]);
  const [amount, setAmount] = useState<string>('100');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  const [userBalances, setUserBalances] = useState<{[key: string]: number}>({});
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

  // Fetch current rates, historical data, user balances and recent trades
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ratesData: {[key: string]: number} = {};
        
        // Fetch rates for all currency pairs
        await Promise.all(
          CURRENCY_PAIRS.map(async (pair) => {
            const rate = await currencyService.getCurrentRate(pair);
            ratesData[pair] = rate;
          })
        );
        
        setRates(ratesData);

        // Fetch historical data for selected pair
        const [base, quote] = selectedPair.split('/');
        const history = await currencyService.getHistoricalData(base, quote);
        setHistoricalData(history);

        // Fetch user balances if user is logged in
        if (user?.id) {
          const balances = await tradingService.getUserBalances(user.id);
          setUserBalances(balances);

          // Fetch recent trades
          const trades = await tradingService.getUserTrades(user.id);
          setRecentTrades(trades.slice(0, 5)); // Get last 5 trades
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load market data');
        console.error('Error fetching market data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedPair, user?.id]);

  const chartData = {
    labels: historicalData.map(d => new Date(d.timestamp).toLocaleDateString()).reverse(),
    datasets: [
      {
        label: selectedPair,
        data: historicalData.map(d => d.close).reverse(),
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${selectedPair} Exchange Rate History`
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  const handleExecuteTrade = async () => {
    if (!user?.id) {
      setNotification({
        open: true,
        message: 'You must be logged in to trade',
        severity: 'error'
      });
      return;
    }

    try {
      setTradeLoading(true);
      
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Invalid amount');
      }

      const rate = rates[selectedPair];
      if (!rate) {
        throw new Error('Rate not available');
      }

      // Check if user has sufficient balance
      const [baseCurrency, quoteCurrency] = selectedPair.split('/');
      const requiredBalance = tradeType === 'BUY' ? amountValue * rate : amountValue;
      const currencyToCheck = tradeType === 'BUY' ? quoteCurrency : baseCurrency;
      
      if (!userBalances[currencyToCheck] || userBalances[currencyToCheck] < requiredBalance) {
        throw new Error(`Insufficient ${currencyToCheck} balance`);
      }

      // Execute trade
      const trade = await tradingService.executeTrade({
        userId: user.id,
        type: tradeType,
        amount: amountValue,
        baseCurrency,
        quoteCurrency,
        rate
      });

      // Update balances and recent trades after successful trade
      const updatedBalances = await tradingService.getUserBalances(user.id);
      setUserBalances(updatedBalances);
      
      const updatedTrades = await tradingService.getUserTrades(user.id);
      setRecentTrades(updatedTrades.slice(0, 5));

      setNotification({
        open: true,
        message: `${tradeType} order executed successfully!`,
        severity: 'success'
      });
      
      // Reset form
      setAmount('100');
    } catch (err) {
      console.error('Trade execution error:', err);
      setNotification({
        open: true,
        message: err instanceof Error ? err.message : 'Failed to execute trade',
        severity: 'error'
      });
    } finally {
      setTradeLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  if (loading && Object.keys(rates).length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Market Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {/* Chart */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Currency Rates Table */}
        <Grid item xs={12} md={8}>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Currency Pair</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">24h Change</TableCell>
                  <TableCell align="right">24h High</TableCell>
                  <TableCell align="right">24h Low</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CURRENCY_PAIRS.map((pair) => (
                  <TableRow 
                    key={pair} 
                    hover 
                    selected={pair === selectedPair}
                    onClick={() => setSelectedPair(pair)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {pair}
                    </TableCell>
                    <TableCell align="right">
                      {rates[pair]?.toFixed(4) || 'Loading...'}
                    </TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: rates[pair] > 0 ? 'success.main' : 'error.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {rates[pair] > 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                      {(rates[pair] * 0.01).toFixed(4)}%
                    </TableCell>
                    <TableCell align="right">
                      {(rates[pair] * 1.01).toFixed(4)}
                    </TableCell>
                    <TableCell align="right">
                      {(rates[pair] * 0.99).toFixed(4)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Trade Execution Panel */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Execute Trade
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <TextField
              select
              label="Currency Pair"
              fullWidth
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              margin="normal"
              size="small"
            >
              {CURRENCY_PAIRS.map((pair) => (
                <MenuItem key={pair} value={pair}>
                  {pair}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              margin="normal"
              size="small"
              InputProps={{
                inputProps: { min: 0 }
              }}
            />

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                fullWidth
                variant={tradeType === 'BUY' ? 'contained' : 'outlined'}
                color="success"
                onClick={() => setTradeType('BUY')}
              >
                Buy
              </Button>
              <Button
                fullWidth
                variant={tradeType === 'SELL' ? 'contained' : 'outlined'}
                color="error"
                onClick={() => setTradeType('SELL')}
              >
                Sell
              </Button>
            </Box>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleExecuteTrade}
              disabled={tradeLoading}
            >
              {tradeLoading ? <CircularProgress size={24} /> : `${tradeType} Now`}
            </Button>
          </Paper>

          {/* Market Summary Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Market Summary
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selected Pair: {selectedPair}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Current Rate: {rates[selectedPair]?.toFixed(4)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trade Value: ${(parseFloat(amount || '0') * (rates[selectedPair] || 0)).toFixed(2)}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Your Balances:
              </Typography>
              {Object.entries(userBalances).map(([currency, balance]) => (
                <Typography key={currency} variant="body2" color="text.secondary">
                  {currency}: {balance.toFixed(2)}
                </Typography>
              ))}
            </CardContent>
          </Card>

          {/* Recent Trades Card */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Trades
              </Typography>
              {recentTrades.length > 0 ? (
                <List dense>
                  {recentTrades.map((trade, index) => (
                    <ListItem key={index} divider={index < recentTrades.length - 1}>
                      <ListItemText
                        primary={`${trade.type} ${trade.amount} ${trade.baseCurrency}/${trade.quoteCurrency}`}
                        secondary={`Rate: ${trade.rate} - ${new Date(trade.timestamp).toLocaleString()}`}
                        primaryTypographyProps={{
                          color: trade.type === 'BUY' ? 'success.main' : 'error.main'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent trades
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
      >
        <Alert onClose={closeNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketDashboard; 