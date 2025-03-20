import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="primary"
          gutterBottom
        >
          Foreign Trading System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          A comprehensive platform for trading foreign currencies with real-time market data,
          secure payments, and advanced trading tools.
        </Typography>
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/register')}
          >
            Register
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h4" gutterBottom align="center">
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: 'primary.light',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Real-time Trading
                </Typography>
                <Typography>
                  Access real-time market data and execute trades with our advanced trading interface.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: 'secondary.light',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Secure Payments
                </Typography>
                <Typography>
                  Make secure deposits and withdrawals using our integrated payment system.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: 'info.light',
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Analytics Tools
                </Typography>
                <Typography>
                  Analyze market trends and track your performance with comprehensive analytics tools.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 