import React, { useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Trade from './pages/Trade';
import Home from './pages/Home';
import PaymentsPage from './pages/PaymentsPage';
import AdminDashboard from './pages/AdminDashboard';
import Unauthorized from './pages/Unauthorized';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import { CircularProgress, Box, Typography } from '@mui/material';

const App: React.FC = () => {
    const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    // Fallback UI to show while loading
    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
            >
                <CircularProgress size={60} />
                <Typography variant="h6" style={{ marginTop: 20 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                
                {/* Regular user routes */}
                <Route
                    path="dashboard"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Profile />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="trading"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <Trade />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="payments"
                    element={
                        <PrivateRoute isAuthenticated={isAuthenticated}>
                            <PaymentsPage />
                        </PrivateRoute>
                    }
                />
                
                {/* Admin routes */}
                <Route
                    path="admin"
                    element={<RoleRoute component={AdminDashboard} requiredRole="ADMIN" />}
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
        </Routes>
    );
};

export default App; 