import React, { useState, useEffect } from 'react';
import { 
    Paper, Typography, Box, Card, CardContent, CardActionArea,
    Divider, Avatar, CircularProgress, Chip, Grid, Link
} from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const MarketNews = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [news, setNews] = useState<any[]>([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/market-data/news');
                setNews(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching market news:', err);
                setError('Failed to load market news. Please try again later.');
                
                // Fallback to mock data for UI demonstration
                if (process.env.NODE_ENV === 'development') {
                    setNews(generateMockNews());
                }
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const generateMockNews = () => {
        return [
            {
                id: 1,
                title: 'Federal Reserve Maintains Interest Rates',
                summary: 'The Federal Reserve has decided to maintain current interest rates, citing stable economic indicators and moderate inflation levels.',
                source: 'Financial Times',
                url: '#',
                publishedAt: new Date().toISOString(),
                category: 'POLICY'
            },
            {
                id: 2,
                title: 'EUR/USD Reaches 1.1800 Level',
                summary: 'The EUR/USD pair has reached the 1.1800 level for the first time in three months, driven by a weakening dollar and strong eurozone economic data.',
                source: 'Bloomberg',
                url: '#',
                publishedAt: new Date(Date.now() - 3600000).toISOString(),
                category: 'FOREX'
            },
            {
                id: 3,
                title: 'Oil Prices Jump on OPEC+ Supply Cut',
                summary: 'Oil prices have jumped 5% following an announcement by OPEC+ countries to cut production by 1.5 million barrels per day.',
                source: 'Reuters',
                url: '#',
                publishedAt: new Date(Date.now() - 7200000).toISOString(),
                category: 'COMMODITIES'
            },
            {
                id: 4,
                title: 'Global Stocks Rally on Positive Economic Data',
                summary: 'Global stocks are rallying as recent economic data from major economies suggests a stronger-than-expected recovery from recent downturns.',
                source: 'Wall Street Journal',
                url: '#',
                publishedAt: new Date(Date.now() - 10800000).toISOString(),
                category: 'STOCKS'
            }
        ];
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'FOREX':
                return <MonetizationOnIcon />;
            case 'STOCKS':
                return <TrendingUpIcon />;
            default:
                return <NewspaperIcon />;
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'FOREX':
                return 'primary';
            case 'POLICY':
                return 'secondary';
            case 'COMMODITIES':
                return 'warning';
            case 'STOCKS':
                return 'success';
            default:
                return 'default';
        }
    };

    if (loading && news.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
            </Box>
        );
    }

    if (error && news.length === 0) {
        return (
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#fff9f9' }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Market News & Updates
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
                {news.map((item) => (
                    <Grid item xs={12} sm={6} key={item.id}>
                        <Card variant="outlined">
                            <CardActionArea component={Link} href={item.url} target="_blank" rel="noopener">
                                <CardContent>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Chip 
                                            label={item.category} 
                                            size="small" 
                                            color={getCategoryColor(item.category) as any} 
                                            icon={getCategoryIcon(item.category)}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" gutterBottom>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        {item.summary}
                                    </Typography>
                                    <Box display="flex" alignItems="center">
                                        <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'grey.200' }}>
                                            {item.source.charAt(0)}
                                        </Avatar>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.source}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
};

export default MarketNews; 