import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { RootState } from '../store';
import paymentService from '../services/paymentService';

interface Payment {
    id: number;
    userId: number;
    amount: number;
    type: 'DEPOSIT' | 'WITHDRAWAL';
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    timestamp: string;
    description?: string;
}

const PaymentHistory: React.FC = () => {
    const { user } = useSelector((state: RootState) => state.auth);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchPayments();
    }, [user?.id]);

    const fetchPayments = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const userPayments = await paymentService.getUserPayments(user.id);
            setPayments(userPayments);
            setError(null);
        } catch (err) {
            setError('Failed to load payment history');
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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
            <Typography variant="h6" gutterBottom>
                Payment History
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell align="right">Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((payment) => (
                                <TableRow key={payment.id} hover>
                                    <TableCell>
                                        {new Date(payment.timestamp).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payment.type}
                                            color={payment.type === 'DEPOSIT' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{payment.description || '-'}</TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            color={payment.type === 'DEPOSIT' ? 'success.main' : 'error.main'}
                                        >
                                            {payment.type === 'DEPOSIT' ? '+' : '-'} ${payment.amount.toFixed(2)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={payment.status}
                                            color={
                                                payment.status === 'COMPLETED'
                                                    ? 'success'
                                                    : payment.status === 'PENDING'
                                                    ? 'warning'
                                                    : 'error'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={payments.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
        </Paper>
    );
};

export default PaymentHistory; 