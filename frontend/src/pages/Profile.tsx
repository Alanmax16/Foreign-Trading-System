import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { RootState } from '../store';
import tradingService from '../services/tradingService';
import { Trade } from '../services/tradingService';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PersonIcon from '@mui/icons-material/Person';

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
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Profile: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [balances, setBalances] = useState<{ [key: string]: number }>({});
  const [tradeSummary, setTradeSummary] = useState<{
    totalTrades: number;
    totalVolume: number;
    profitLoss: number;
    mostTradedCurrency: string;
  }>({
    totalTrades: 0,
    totalVolume: 0,
    profitLoss: 0,
    mostTradedCurrency: ''
  });
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        setError(null);

        const [userTrades, userBalances, summary] = await Promise.all([
          tradingService.getUserTrades(user.id),
          tradingService.getUserBalances(user.id),
          tradingService.getTradeSummary(user.id)
        ]);

        setTrades(userTrades);
        setBalances(userBalances);
        setTradeSummary(summary);
      } catch (err) {
        setError('Failed to load profile data. Please try again.');
        console.error('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  mr: 2
                }}
              >
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box sx={{ overflow: 'hidden' }}>
                <Typography variant="h5" noWrap>
                  {user?.username}
                </Typography>
                <Typography
                  color="textSecondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: isMobile ? '150px' : '200px'
                  }}
                >
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemText
                  primary="Member Since"
                  secondary={new Date(user?.createdAt || '').toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Total Trades"
                  secondary={tradeSummary.totalTrades}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Trading Volume"
                  secondary={`$${tradeSummary.totalVolume.toFixed(2)}`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Profit/Loss"
                  secondary={
                    <Typography
                      component="span"
                      color={tradeSummary.profitLoss >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${tradeSummary.profitLoss.toFixed(2)}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Most Traded"
                  secondary={tradeSummary.mostTradedCurrency}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="profile tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Portfolio" icon={<AccountBalanceWalletIcon />} iconPosition="start" />
              <Tab label="Trade History" icon={<ShowChartIcon />} iconPosition="start" />
            </Tabs>

            {/* Portfolio Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={2}>
                {Object.entries(balances).map(([currency, amount]) => (
                  <Grid item xs={12} sm={6} key={currency}>
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
            </TabPanel>

            {/* Trade History Tab */}
            <TabPanel value={tabValue} index={1}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Currency</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Rate</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id} hover>
                        <TableCell>
                          {new Date(trade.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={trade.type}
                            color={trade.type === 'BUY' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{trade.currency}</TableCell>
                        <TableCell align="right">{trade.amount.toFixed(2)}</TableCell>
                        <TableCell align="right">{trade.rate.toFixed(4)}</TableCell>
                        <TableCell align="right">
                          ${(trade.amount * trade.rate).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={trade.status}
                            color={trade.status === 'COMPLETED' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 