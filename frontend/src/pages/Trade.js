import React, { useState, useEffect } from 'react';
import { tradeAPI } from '../services/api';

const Trade = () => {
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '',
    type: 'buy'
  });

  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await tradeAPI.getExchangeRates();
        setExchangeRates(response.data.rates);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch exchange rates');
        setLoading(false);
      }
    };

    fetchExchangeRates();
    // Refresh rates every minute
    const interval = setInterval(fetchExchangeRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const calculateExchangeAmount = () => {
    if (!formData.amount || !exchangeRates[formData.toCurrency]) return '0.00';
    const rate = exchangeRates[formData.toCurrency] / exchangeRates[formData.fromCurrency];
    return (parseFloat(formData.amount) * rate).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const tradeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        exchangeRate: exchangeRates[formData.toCurrency] / exchangeRates[formData.fromCurrency]
      };

      await tradeAPI.executeTrade(tradeData);
      setSuccess('Trade executed successfully!');
      setFormData({ ...formData, amount: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute trade');
    } finally {
      setLoading(false);
    }
  };

  if (loading && Object.keys(exchangeRates).length === 0) {
    return <div className="container">Loading exchange rates...</div>;
  }

  return (
    <div className="container">
      <div className="card trade-form">
        <h2 style={{ marginBottom: '1.5rem' }}>Execute Trade</h2>
        
        {error && (
          <div className="alert alert-error" style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success" style={{ color: 'var(--success-color)', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trade Type</label>
            <select
              name="type"
              className="form-control"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>

          <div className="form-group">
            <label>From Currency</label>
            <select
              name="fromCurrency"
              className="form-control"
              value={formData.fromCurrency}
              onChange={handleChange}
            >
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>To Currency</label>
            <select
              name="toCurrency"
              className="form-control"
              value={formData.toCurrency}
              onChange={handleChange}
            >
              {currencies.filter(c => c !== formData.fromCurrency).map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              className="form-control"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Exchange Rate</label>
            <div className="exchange-rate" style={{ 
              padding: '0.5rem', 
              background: '#f3f4f6', 
              borderRadius: '0.375rem' 
            }}>
              1 {formData.fromCurrency} = {' '}
              {(exchangeRates[formData.toCurrency] / exchangeRates[formData.fromCurrency]).toFixed(4)}{' '}
              {formData.toCurrency}
            </div>
          </div>

          <div className="form-group">
            <label>You will {formData.type}</label>
            <div className="exchange-amount" style={{ 
              padding: '0.5rem', 
              background: '#f3f4f6', 
              borderRadius: '0.375rem',
              fontWeight: 'bold' 
            }}>
              {calculateExchangeAmount()} {formData.toCurrency}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Execute Trade'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Trade;
