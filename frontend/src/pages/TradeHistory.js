import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/TradeHistory.css';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/trades/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrades(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch trade history');
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  if (loading) return <div className="loading">Loading trade history...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trade-history">
      <h2>Trade History</h2>
      <div className="trade-list">
        {trades.length === 0 ? (
          <p>No trades found</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Currency Pair</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id}>
                  <td>{new Date(trade.timestamp).toLocaleString()}</td>
                  <td>{trade.currencyPair}</td>
                  <td className={trade.type.toLowerCase()}>{trade.type}</td>
                  <td>{trade.amount}</td>
                  <td>{trade.rate}</td>
                  <td className={trade.status.toLowerCase()}>{trade.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
