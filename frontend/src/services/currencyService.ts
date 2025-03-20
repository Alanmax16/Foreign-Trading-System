import axios from 'axios';

// Use a free API key for testing - in production, this should be in environment variables
const API_KEY = '2EGDQO5LNPQY1C1Z';
const BASE_URL = 'https://www.alphavantage.co/query';

export interface CurrencyRate {
    pair: string;
    rate: number;
    change24h: number;
    high24h: number;
    low24h: number;
    lastUpdated: string;
}

export interface HistoricalData {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface TechnicalIndicator {
    timestamp: string;
    value: number;
}

class CurrencyService {
    private static instance: CurrencyService;
    private rates: Map<string, CurrencyRate> = new Map();
    private lastUpdate: Date | null = null;
    private updateInterval: number = 60000; // 1 minute
    private mockMode: boolean = false; // Use real API calls

    private constructor() {}

    public static getInstance(): CurrencyService {
        if (!CurrencyService.instance) {
            CurrencyService.instance = new CurrencyService();
        }
        return CurrencyService.instance;
    }

    public async getExchangeRates(): Promise<CurrencyRate[]> {
        if (this.shouldUpdate()) {
            await this.updateRates();
        }
        return Array.from(this.rates.values());
    }

    public async getExchangeRate(baseCurrency: string, quoteCurrency: string): Promise<number> {
        const pair = `${baseCurrency}/${quoteCurrency}`;
        if (this.shouldUpdate()) {
            await this.updateRates();
        }
        const rate = this.rates.get(pair);
        if (!rate) {
            throw new Error(`Exchange rate not available for ${pair}`);
        }
        return rate.rate;
    }

    // Method for getting current rate of a currency pair (format: 'USD/EUR')
    public async getCurrentRate(currencyPair: string): Promise<number> {
        try {
            const [baseCurrency, quoteCurrency] = currencyPair.split('/');
            const response = await axios.get(BASE_URL, {
                params: {
                    function: 'CURRENCY_EXCHANGE_RATE',
                    from_currency: baseCurrency,
                    to_currency: quoteCurrency,
                    apikey: API_KEY
                }
            });

            if (response.data['Error Message']) {
                throw new Error(response.data['Error Message']);
            }

            const rateData = response.data['Realtime Currency Exchange Rate'];
            if (!rateData) {
                throw new Error('Rate data not available');
            }

            const rate = parseFloat(rateData['5. Exchange Rate']);
            
            // Update the rates map
            this.rates.set(currencyPair, {
                pair: currencyPair,
                rate,
                change24h: parseFloat(rateData['9. Change'] || '0'),
                high24h: parseFloat(rateData['3. High Price'] || rate),
                low24h: parseFloat(rateData['4. Low Price'] || rate),
                lastUpdated: rateData['6. Last Refreshed']
            });

            return rate;
        } catch (error) {
            console.error(`Error fetching rate for ${currencyPair}:`, error);
            // Fallback to mock data if API fails
            const mockRates: { [key: string]: number } = {
                'USD/EUR': 0.85,
                'USD/GBP': 0.73,
                'USD/JPY': 110.5,
                'EUR/GBP': 0.86,
                'EUR/JPY': 129.5,
                'GBP/JPY': 150.2
            };
            return mockRates[currencyPair] || 1.0;
        }
    }

    public async getHistoricalData(
        baseCurrency: string,
        quoteCurrency: string,
        interval: string = 'FX_DAILY'
    ): Promise<any[]> {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: interval,
                    from_symbol: baseCurrency,
                    to_symbol: quoteCurrency,
                    apikey: API_KEY
                }
            });

            if (response.data['Error Message']) {
                throw new Error(response.data['Error Message']);
            }

            const timeSeriesData = response.data[`Time Series FX (${interval.split('_')[1].toLowerCase()})`];
            if (!timeSeriesData) {
                throw new Error('Historical data not available');
            }

            return Object.entries(timeSeriesData).map(([timestamp, data]: [string, any]) => ({
                timestamp,
                open: parseFloat(data['1. open']),
                high: parseFloat(data['2. high']),
                low: parseFloat(data['3. low']),
                close: parseFloat(data['4. close'])
            }));
        } catch (error) {
            console.error('Error fetching historical data:', error);
            // Return mock historical data
            return Array.from({ length: 30 }, (_, i) => ({
                timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                open: 1.0 + Math.random() * 0.1,
                high: 1.1 + Math.random() * 0.1,
                low: 0.9 + Math.random() * 0.1,
                close: 1.0 + Math.random() * 0.1
            }));
        }
    }

    public async getTechnicalIndicators(
        baseCurrency: string,
        quoteCurrency: string,
        indicator: string = 'RSI'
    ): Promise<TechnicalIndicator[]> {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    function: indicator,
                    symbol: `${baseCurrency}${quoteCurrency}`,
                    interval: '5min',
                    apikey: API_KEY
                }
            });

            const technicalData = response.data[`Technical Analysis: ${indicator}`];
            return Object.entries(technicalData).map(([timestamp, data]: [string, any]) => ({
                timestamp,
                value: parseFloat(data[indicator])
            }));
        } catch (error) {
            console.error('Error fetching technical indicators:', error);
            throw error;
        }
    }

    private shouldUpdate(): boolean {
        return !this.lastUpdate || 
               Date.now() - this.lastUpdate.getTime() > this.updateInterval;
    }

    private async updateRates(): Promise<void> {
        const currencyPairs = [
            'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
            'USD/CHF', 'NZD/USD', 'EUR/GBP', 'EUR/JPY', 'GBP/JPY'
        ];

        for (const pair of currencyPairs) {
            try {
                const [baseCurrency, quoteCurrency] = pair.split('/');
                const response = await axios.get(BASE_URL, {
                    params: {
                        function: 'CURRENCY_EXCHANGE_RATE',
                        from_currency: baseCurrency,
                        to_currency: quoteCurrency,
                        apikey: API_KEY
                    }
                });

                const rateData = response.data['Realtime Currency Exchange Rate'];
                const rate: CurrencyRate = {
                    pair,
                    rate: parseFloat(rateData['5. Exchange Rate']),
                    change24h: parseFloat(rateData['9. Change']),
                    high24h: parseFloat(rateData['10. High (24h)']),
                    low24h: parseFloat(rateData['11. Low (24h)']),
                    lastUpdated: rateData['6. Last Refreshed']
                };

                this.rates.set(pair, rate);
            } catch (error) {
                console.error(`Error updating rate for ${pair}:`, error);
            }
        }

        this.lastUpdate = new Date();
    }
}

export default CurrencyService.getInstance(); 