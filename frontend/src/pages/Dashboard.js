import React, { useState, useEffect } from 'react';
import { tradeAPI } from '../services/api';
import TradeHistoryChart from '../components/TradeHistoryChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTrades: 0,
    profitLoss: 0,
    balance: 0,
    activePositions: 0
  });
  
  const [tradeData, setTradeData] = useState({
    dates: [],
    volumes: [],
    profits: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, historyResponse] = await Promise.all([
          tradeAPI.getDashboardStats(),
          tradeAPI.getTradeHistory()
        ]);

        setStats(statsResponse.data);
        
        // Process trade history data for the chart
        const processedData = processTradeHistory(historyResponse.data);
        setTradeData(processedData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const processTradeHistory = (history) => {
    const dates = history.map(trade => new Date(trade.timestamp).toLocaleDateString());
    const volumes = history.map(trade => trade.volume);
    const profits = history.map(trade => trade.profitLoss);

    return { dates, volumes, profits };
  };

  if (loading) {
    return <div className="container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="container" style={{ color: 'var(--error-color)' }}>{error}</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Trades</h3>
          <div className="value">{stats.totalTrades}</div>
        </div>
        <div className="stats-card">
          <h3>Profit/Loss</h3>
          <div className="value" style={{ 
            color: stats.profitLoss >= 0 ? 'var(--success-color)' : 'var(--error-color)'
          }}>
            ${stats.profitLoss.toFixed(2)}
          </div>
        </div>
        <div className="stats-card">
          <h3>Account Balance</h3>
          <div className="value">${stats.balance.toFixed(2)}</div>
        </div>
        <div className="stats-card">
          <h3>Active Positions</h3>
          <div className="value">{stats.activePositions}</div>
        </div>
      </div>

      <div className="chart-container">
        <TradeHistoryChart tradeData={tradeData} />
      </div>
    </div>
  );
};

export default Dashboard;
