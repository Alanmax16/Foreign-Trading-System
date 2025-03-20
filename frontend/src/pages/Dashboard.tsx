import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Button
} from '@mui/material';
import { RootState } from '../store';
import MarketDashboard from '../components/MarketDashboard';
import tradingService from '../services/tradingService';
import paymentService from '../services/paymentService';
import { Trade } from '../services/tradingService';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch balances for all currencies and recent trades in parallel
        const [userBalances, userTrades] = await Promise.all([
          tradingService.getUserBalances(user.id),
          tradingService.getUserTrades(user.id)
        ]);

        setBalances(userBalances);
        setRecentTrades(userTrades.slice(0, 5)); // Get last 5 trades
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleTradeClick = () => {
    navigate('/trade');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const totalBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome back, {user?.username}!
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Here's your trading overview
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleTradeClick}
                startIcon={<TrendingUpIcon />}
              >
                Trade Now
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Account Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <Typography variant="h6">Account Summary</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Total Balance (USD)
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              ${totalBalance.toFixed(2)}
            </Typography>

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Currency Balances
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(balances).map(([currency, amount]) => (
                  <Grid item xs={12} key={currency}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary">
                          {currency}
                        </Typography>
                        <Typography variant="h6">
                          {amount.toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Market Overview */}
        <Grid item xs={12} md={8}>
          <MarketDashboard />
        </Grid>

        {/* Recent Trades */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Trades
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {recentTrades.length === 0 ? (
              <Typography color="text.secondary">No recent trades</Typography>
            ) : (
              <Grid container spacing={2}>
                {recentTrades.map((trade) => (
                  <Grid item xs={12} sm={6} md={4} key={trade.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" color={trade.type === 'BUY' ? 'success.main' : 'error.main'}>
                            {trade.type}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(trade.timestamp).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="h6" gutterBottom>
                          {trade.amount} {trade.currency}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rate: {trade.rate.toFixed(4)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total: ${(trade.amount * trade.rate).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 