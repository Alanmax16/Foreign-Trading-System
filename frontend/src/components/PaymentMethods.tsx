import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider
} from '@mui/material';
import { RootState } from '../store';
import paymentService from '../services/paymentService';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CreditCardIcon from '@mui/icons-material/CreditCard';

interface PaymentMethod {
    id: string;
    type: string;
    card?: {
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
    };
}

const PaymentMethods: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [amount, setAmount] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            const methods = await paymentService.getPaymentMethods();
            setPaymentMethods(methods);
            setError(null);
        } catch (err) {
            setError('Failed to load payment methods');
            console.error('Error fetching payment methods:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setAmount('');
        setSelectedMethod(null);
    };

    const handleDeleteMethod = async (methodId: string) => {
        try {
            await paymentService.detachPaymentMethod(methodId);
            await fetchPaymentMethods();
        } catch (err) {
            setError('Failed to remove payment method');
            console.error('Error removing payment method:', err);
        }
    };

    const handleProcessPayment = async () => {
        if (!user?.id || !selectedMethod || !amount) return;

        try {
            setProcessing(true);
            const amountValue = parseFloat(amount);
            
            if (isNaN(amountValue) || amountValue <= 0) {
                throw new Error('Invalid amount');
            }

            // Create payment intent
            const intent = await paymentService.createPaymentIntent(
                amountValue * 100, // Convert to cents
                'USD',
                user.id
            );

            // Confirm payment
            await paymentService.confirmPayment(intent.id, selectedMethod);

            // Process the payment
            await paymentService.processPayment(
                user.id,
                amountValue,
                'DEPOSIT',
                'Account deposit'
            );

            handleCloseDialog();
            await fetchPaymentMethods();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process payment');
            console.error('Payment error:', err);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">Payment Methods</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddPayment}
                >
                    Add Payment Method
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Grid container spacing={2}>
                {paymentMethods.map((method) => (
                    <Grid item xs={12} sm={6} md={4} key={method.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box display="flex" alignItems="center">
                                        <CreditCardIcon sx={{ mr: 1 }} />
                                        <Box>
                                            <Typography variant="subtitle1">
                                                {method.card?.brand.toUpperCase()}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                •••• {method.card?.last4}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                Expires {method.card?.expMonth}/{method.card?.expYear}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton
                                        onClick={() => handleDeleteMethod(method.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Add Funds</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Select Payment Method
                        </Typography>
                        <Grid container spacing={2}>
                            {paymentMethods.map((method) => (
                                <Grid item xs={12} key={method.id}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            border: selectedMethod === method.id ? 2 : 1,
                                            borderColor: selectedMethod === method.id ? 'primary.main' : 'divider'
                                        }}
                                        onClick={() => setSelectedMethod(method.id)}
                                    >
                                        <CardContent>
                                            <Box display="flex" alignItems="center">
                                                <CreditCardIcon sx={{ mr: 1 }} />
                                                <Box>
                                                    <Typography variant="subtitle1">
                                                        {method.card?.brand.toUpperCase()}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        •••• {method.card?.last4}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <TextField
                            label="Amount (USD)"
                            type="number"
                            fullWidth
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            margin="normal"
                            inputProps={{ min: 0, step: 0.01 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleProcessPayment}
                        variant="contained"
                        disabled={!selectedMethod || !amount || processing}
                    >
                        {processing ? <CircularProgress size={24} /> : 'Process Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default PaymentMethods; 