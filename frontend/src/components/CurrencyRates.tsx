import React, { useState, useEffect } from 'react';
import { 
    Paper, Typography, Box, Grid, Card, CardContent, 
    CircularProgress, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import axios from 'axios';

const CurrencyRates = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rates, setRates] = useState<any[]>([]);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/market-data/rates');
                setRates(response.data);
                setLastUpdated(new Date());
                setError(null);
            } catch (err) {
                console.error('Error fetching rates:', err);
                setError('Failed to load currency rates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchRates();
        
        // Set up polling every 30 seconds
        const intervalId = setInterval(fetchRates, 30000);
        
        return () => clearInterval(intervalId);
    }, []);

    const getTrendIcon = (change: number) => {
        if (change > 0) {
            return <TrendingUpIcon color="success" />;
        } else if (change < 0) {
            return <TrendingDownIcon color="error" />;
        } else {
            return <TrendingFlatIcon color="action" />;
        }
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'success';
        if (change < 0) return 'error';
        return 'default';
    };

    if (loading && rates.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error && rates.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fff9f9' }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                    Currency Exchange Rates
                </Typography>
                {lastUpdated && (
                    <Typography variant="caption" color="text.secondary">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </Typography>
                )}
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {rates.slice(0, 4).map((rate) => (
                    <Grid item xs={12} sm={6} md={3} key={rate.pair}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {rate.pair}
                                </Typography>
                                <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography variant="h6">{rate.rate.toFixed(4)}</Typography>
                                    <Box display="flex" alignItems="center">
                                        {getTrendIcon(rate.change24h)}
                                        <Chip 
                                            label={`${rate.change24h > 0 ? '+' : ''}${rate.change24h.toFixed(2)}%`}
                                            size="small"
                                            color={getChangeColor(rate.change24h) as any}
                                            sx={{ ml: 1 }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Currency Pair</TableCell>
                            <TableCell align="right">Rate</TableCell>
                            <TableCell align="right">24h Change</TableCell>
                            <TableCell align="right">High (24h)</TableCell>
                            <TableCell align="right">Low (24h)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rates.map((rate) => (
                            <TableRow key={rate.pair} hover>
                                <TableCell component="th" scope="row">
                                    {rate.pair}
                                </TableCell>
                                <TableCell align="right">{rate.rate.toFixed(4)}</TableCell>
                                <TableCell align="right">
                                    <Box display="flex" alignItems="center" justifyContent="flex-end">
                                        {getTrendIcon(rate.change24h)}
                                        <Typography 
                                            variant="body2" 
                                            color={getChangeColor(rate.change24h) + ".main"}
                                            sx={{ ml: 1 }}
                                        >
                                            {rate.change24h > 0 ? '+' : ''}{rate.change24h.toFixed(2)}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">{rate.high24h.toFixed(4)}</TableCell>
                                <TableCell align="right">{rate.low24h.toFixed(4)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default CurrencyRates; 