import React, { useState, useEffect } from 'react';
import { tradeAPI } from '../services/api';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState({
    holdings: [],
    totalValue: 0,
    dailyChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await tradeAPI.getPortfolio();
        setPortfolio(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load portfolio data');
        setLoading(false);
      }
    };

    fetchPortfolio();
    // Refresh portfolio data every minute
    const interval = setInterval(fetchPortfolio, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="container">Loading portfolio...</div>;
  }

  if (error) {
    return <div className="container" style={{ color: 'var(--error-color)' }}>{error}</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem' }}>Portfolio</h1>

      <div className="dashboard-grid">
        <div className="stats-card">
          <h3>Total Portfolio Value</h3>
          <div className="value">${portfolio.totalValue.toFixed(2)}</div>
        </div>
        <div className="stats-card">
          <h3>24h Change</h3>
          <div className="value" style={{
            color: portfolio.dailyChange >= 0 ? 'var(--success-color)' : 'var(--error-color)'
          }}>
            {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Currency Holdings</h2>
        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ textAlign: 'left', padding: '1rem' }}>Currency</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>Amount</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>Value (USD)</th>
                <th style={{ textAlign: 'right', padding: '1rem' }}>24h Change</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => (
                <tr 
                  key={holding.currency}
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: '500' }}>{holding.currency}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>
                    {holding.amount.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right', padding: '1rem' }}>
                    ${holding.valueUSD.toFixed(2)}
                  </td>
                  <td style={{ 
                    textAlign: 'right', 
                    padding: '1rem',
                    color: holding.change >= 0 ? 'var(--success-color)' : 'var(--error-color)'
                  }}>
                    {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
