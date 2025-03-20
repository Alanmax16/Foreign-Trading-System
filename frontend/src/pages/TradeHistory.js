import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { format } from 'date-fns';
import axios from 'axios';
import TradeHistoryChart from '../components/TradeHistoryChart';
import { useAuth } from '../context/AuthContext';
import '../styles/TradeHistory.css';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    profitableTrades: 0,
    totalProfit: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  const fetchTrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/trades/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrades(response.data.trades);

      const statsResponse = await axios.get('http://localhost:5000/api/trades/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data.stats);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'executed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return filter === 'demo' ? trade.isDemo : !trade.isDemo;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trade History
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Trading Statistics</Typography>
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box>
              <Typography variant="subtitle1">Total Trades</Typography>
              <Typography variant="h5">{stats.totalTrades}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Profitable Trades</Typography>
              <Typography variant="h5">{stats.profitableTrades}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">Total Profit/Loss</Typography>
              <Typography variant="h5" color={stats.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                ${stats.totalProfit.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TradeHistoryChart trades={trades} />
      </Box>

      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Account Type</InputLabel>
          <Select
            value={filter}
            label="Account Type"
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="all">All Trades</MenuItem>
            <MenuItem value="live">Live Account</MenuItem>
            <MenuItem value="demo">Demo Account</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Pair</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Profit/Loss</TableCell>
              <TableCell>Account</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTrades
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trade) => (
                <TableRow key={trade._id}>
                  <TableCell>
                    {format(new Date(trade.createdAt), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.type.toUpperCase()}
                      color={trade.type === 'buy' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{`${trade.baseCurrency}/${trade.quoteCurrency}`}</TableCell>
                  <TableCell>{trade.amount}</TableCell>
                  <TableCell>${trade.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={trade.status.toUpperCase()}
                      color={getStatusColor(trade.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography
                      color={trade.profit >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${trade.profit.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={trade.isDemo ? 'Demo' : 'Live'}
                      color={trade.isDemo ? 'info' : 'primary'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredTrades.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default TradeHistory;
