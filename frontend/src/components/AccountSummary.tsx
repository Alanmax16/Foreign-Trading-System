import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Box, Grid, Card, CardContent, CardHeader,
    Divider, List, ListItem, ListItemText, ListItemIcon, Avatar,
    Chip, CircularProgress, Button
} from '@mui/material';
import { 
    AccountBalance as AccountIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
    SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AccountSummary = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                setLoading(true);
                
                // Get account balances
                const accountsResponse = await axios.get('/api/accounts');
                setAccounts(accountsResponse.data);
                
                // Get recent transactions
                const transactionsResponse = await axios.get('/api/transactions/recent');
                setTransactions(transactionsResponse.data);
                
                setError(null);
            } catch (err) {
                console.error('Error fetching account data:', err);
                setError('Failed to load account data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchAccountData();
    }, []);

    const getTotalBalance = () => {
        // In a real app, this would convert all currencies to a base currency
        return accounts.reduce((sum, account) => sum + account.balance, 0).toFixed(2);
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return <ArrowUpIcon color="success" />;
            case 'WITHDRAWAL':
                return <ArrowDownIcon color="error" />;
            case 'TRADE':
                return <SwapIcon color="primary" />;
            default:
                return <AccountIcon />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'success';
            case 'WITHDRAWAL':
                return 'error';
            case 'TRADE':
                return 'primary';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fff9f9' }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    return (
        <Grid container spacing={3}>
            {/* Account Balance Summary */}
            <Grid item xs={12} md={4}>
                <Card elevation={3}>
                    <CardHeader 
                        title="Total Balance"
                        avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><AccountIcon /></Avatar>}
                    />
                    <CardContent>
                        <Typography variant="h4" align="center" gutterBottom>
                            ${getTotalBalance()}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            <Button 
                                variant="contained" 
                                fullWidth
                                onClick={() => navigate('/deposits')}
                            >
                                Deposit Funds
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>

            {/* Account Listing */}
            <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Your Accounts</Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                        {accounts.map((account) => (
                            <Grid item xs={12} sm={6} key={account.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {account.currency} Account
                                                </Typography>
                                                <Typography variant="h6">
                                                    {account.balance.toFixed(2)} {account.currency}
                                                </Typography>
                                            </Box>
                                            <Chip 
                                                label={account.active ? 'Active' : 'Inactive'} 
                                                color={account.active ? 'success' : 'default'} 
                                                size="small" 
                                            />
                                        </Box>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Account #: {account.accountNumber}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Grid>

            {/* Recent Transactions */}
            <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Recent Transactions</Typography>
                        <Button 
                            variant="text" 
                            size="small"
                            onClick={() => navigate('/transactions')}
                        >
                            View All
                        </Button>
                    </Box>
                    <Divider />
                    
                    {transactions.length === 0 ? (
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No recent transactions
                            </Typography>
                        </Box>
                    ) : (
                        <List>
                            {transactions.map((transaction) => (
                                <React.Fragment key={transaction.id}>
                                    <ListItem>
                                        <ListItemIcon>
                                            {getTransactionIcon(transaction.transactionType)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={transaction.description}
                                            secondary={new Date(transaction.createdAt).toLocaleString()}
                                        />
                                        <Box>
                                            <Typography 
                                                variant="body2" 
                                                color={getTransactionColor(transaction.transactionType) + ".main"}
                                            >
                                                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} {transaction.currency}
                                            </Typography>
                                            <Chip 
                                                label={transaction.status} 
                                                size="small" 
                                                color={transaction.status === 'COMPLETED' ? 'success' : 
                                                       transaction.status === 'FAILED' ? 'error' : 'default'}
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default AccountSummary; 