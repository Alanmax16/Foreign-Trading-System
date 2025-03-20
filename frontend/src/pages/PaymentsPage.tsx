import React from 'react';
import { Container, Grid, Typography, Box, Paper } from '@mui/material';
import PaymentMethods from '../components/PaymentMethods';
import PaymentHistory from '../components/PaymentHistory';

const PaymentsPage: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Payments & Transactions
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <PaymentMethods />
                </Grid>
                <Grid item xs={12}>
                    <PaymentHistory />
                </Grid>
            </Grid>
        </Container>
    );
};

export default PaymentsPage; 