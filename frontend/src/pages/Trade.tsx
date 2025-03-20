import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
  Snackbar,
  Tab,
  Tabs,
  Chip
} from '@mui/material';
import { RootState } from '../store';
import currencyService from '../services/currencyService';
import tradingService from '../services/tradingService';
import paymentService from '../services/paymentService';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Trade as TradeType } from '../services/tradingService';

// Currency pairs to display
const CURRENCY_PAIRS = [
  'USD/EUR',
  'USD/GBP',
  'USD/JPY',
  'EUR/GBP',
  'EUR/JPY',
  'GBP/JPY'
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trade-tabpanel-${index}`}
      aria-labelledby={`trade-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `trade-tab-${index}`,
    'aria-controls': `trade-tabpanel-${index}`,
  };
}

const Trade: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [balances, setBalances] = useState<{[key: string]: number}>({});
  const [rates, setRates] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<string>(CURRENCY_PAIRS[0]);
  const [amount, setAmount] = useState<string>('100');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const [recentTrades, setRecentTrades] = useState<TradeType[]>([]);
  const [notification, setNotification] = useState<{
    open: boolean,
    message: string,
    severity: 'success' | 'error' | 'info'
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [userBalances, userTrades, ratesData] = await Promise.all([
          tradingService.getUserBalances(user.id),
          tradingService.getUserTrades(user.id),
          fetchRates()
        ]);

        setBalances(userBalances);
        setRecentTrades(userTrades);
      } catch (err) {
        setError('Failed to load trade data');
        console.error('Error fetching trade data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh rates every 30 seconds
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const fetchRates = async () => {
    try {
      const ratesData: {[key: string]: number} = {};
      
      // Fetch rates for all currency pairs
      await Promise.all(
        CURRENCY_PAIRS.map(async (pair) => {
          const rate = await currencyService.getCurrentRate(pair);
          ratesData[pair] = rate;
        })
      );
      
      setRates(ratesData);
      return ratesData;
    } catch (err) {
      console.error('Error fetching rates:', err);
      return {};
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
      setError(null);
      
      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error('Invalid amount');
      }

      const [baseCurrency, quoteCurrency] = selectedPair.split('/');
      const rate = rates[selectedPair];
      if (!rate) {
        throw new Error('Rate not available');
      }

      // Check if user has enough balance
      const requiredBalance = tradeType === 'BUY' ? amountValue * rate : amountValue;
      const availableBalance = balances[tradeType === 'BUY' ? quoteCurrency : baseCurrency] || 0;

      if (requiredBalance > availableBalance) {
        throw new Error(`Insufficient ${tradeType === 'BUY' ? quoteCurrency : baseCurrency} balance`);
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

      // Update balances and trades
      const [newBalances, newTrades] = await Promise.all([
        tradingService.getUserBalances(user.id),
        tradingService.getUserTrades(user.id)
      ]);

      setBalances(newBalances);
      setRecentTrades(newTrades);

      setNotification({
        open: true,
        message: `${tradeType} order executed successfully!`,
        severity: 'success'
      });
      
      // Reset amount
      setAmount('100');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade');
    } finally {
      setTradeLoading(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const getTrendIndicator = (pair: string) => {
    const rate = rates[pair];
    const prevRate = rates[pair]; // In a real app, you'd compare with historical data
    
    if (rate > prevRate) {
      return {
        icon: <TrendingUpIcon color="success" />,
        color: 'success.main',
        label: 'Upward trend'
      };
    } else if (rate < prevRate) {
      return {
        icon: <TrendingDownIcon color="error" />,
        color: 'error.main',
        label: 'Downward trend'
      };
    } else {
      return {
        icon: <AccessTimeIcon color="info" />,
        color: 'info.main',
        label: 'Stable'
      };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Portfolio Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h5">Your Portfolio</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              {Object.entries(balances).map(([currency, amount]) => (
                <Grid item xs={12} sm={6} md={3} key={currency}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {currency}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {amount.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Trading Interface */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="trading tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Market Overview" />
              <Tab label="Trade Execution" />
            </Tabs>

            {/* Market Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                {CURRENCY_PAIRS.map((pair) => {
                  const trend = getTrendIndicator(pair);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={pair}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          transition: '0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => {
                          setSelectedPair(pair);
                          setTabValue(1);
                        }}
                      >
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="h6">{pair}</Typography>
                            {trend.icon}
                          </Box>
                          <Typography variant="h4" color="primary" gutterBottom>
                            {rates[pair]?.toFixed(4) || 'Loading...'}
                          </Typography>
                          <Typography variant="body2" color={trend.color}>
                            {trend.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </TabPanel>

            {/* Trade Execution Tab */}
            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Execute Trade
                      </Typography>
                      <Divider sx={{ mb: 3 }} />

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Currency Pair</InputLabel>
                        <Select
                          value={selectedPair}
                          onChange={(e) => setSelectedPair(e.target.value)}
                          label="Currency Pair"
                        >
                          {CURRENCY_PAIRS.map((pair) => (
                            <MenuItem key={pair} value={pair}>
                              {pair} - {rates[pair]?.toFixed(4) || 'Loading...'}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Trade Type</InputLabel>
                        <Select
                          value={tradeType}
                          onChange={(e) => setTradeType(e.target.value as 'BUY' | 'SELL')}
                          label="Trade Type"
                        >
                          <MenuItem value="BUY">BUY</MenuItem>
                          <MenuItem value="SELL">SELL</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="Amount"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        type="number"
                        sx={{ mb: 2 }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />

                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Rate: {rates[selectedPair]?.toFixed(4) || 'Loading...'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Estimated Total: ${(
                            parseFloat(amount || '0') * (rates[selectedPair] || 0)
                          ).toFixed(2)}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleExecuteTrade}
                        disabled={tradeLoading || !rates[selectedPair]}
                      >
                        {tradeLoading ? (
                          <CircularProgress size={24} />
                        ) : (
                          `${tradeType} ${selectedPair}`
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Recent Trades
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      {recentTrades.length === 0 ? (
                        <Typography color="text.secondary">No recent trades</Typography>
                      ) : (
                        <Box>
                          {recentTrades.slice(0, 5).map((trade) => (
                            <Card key={trade.id} variant="outlined" sx={{ mb: 1 }}>
                              <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography variant="subtitle1">
                                      {trade.amount} {trade.currency}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      Rate: {trade.rate.toFixed(4)}
                                    </Typography>
                                  </Box>
                                  <Box textAlign="right">
                                    <Chip
                                      label={trade.type}
                                      color={trade.type === 'BUY' ? 'success' : 'error'}
                                      size="small"
                                      sx={{ mb: 1 }}
                                    />
                                    <Typography variant="body2" color="text.secondary">
                                      {new Date(trade.timestamp).toLocaleString()}
                                    </Typography>
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Trade; 