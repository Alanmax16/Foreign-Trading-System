import React, { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, parseISO, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TradeData {
  date: string;
  price: number;
  amount: number;
  type: string;
  currency: string;
}

interface TradeHistoryChartProps {
  tradeHistory?: TradeData[];
}

const TradeHistoryChart: React.FC<TradeHistoryChartProps> = ({ tradeHistory }) => {
  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [] as any[]
  });

  useEffect(() => {
    if (!tradeHistory || tradeHistory.length === 0) {
      // Mock data for development/preview
      const mockData = generateMockData();
      prepareChartData(mockData);
    } else {
      prepareChartData(tradeHistory);
    }
  }, [tradeHistory]);

  const generateMockData = (): TradeData[] => {
    const mockData: TradeData[] = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const date = subDays(today, i);
      mockData.push({
        date: format(date, 'yyyy-MM-dd'),
        price: 1.1 + Math.random() * 0.2,
        amount: Math.floor(Math.random() * 10000),
        type: Math.random() > 0.5 ? 'buy' : 'sell',
        currency: 'EUR/USD'
      });
    }
    
    return mockData;
  };

  const prepareChartData = (data: TradeData[]) => {
    const dates = data.map(item => format(parseISO(item.date), 'MMM d'));
    
    // Group by currency pair
    const currencyPairsSet = new Set(data.map(item => item.currency));
    const currencyPairs = Array.from(currencyPairsSet);
    
    const datasets = currencyPairs.map((pair, index) => {
      const pairData = data.filter(item => item.currency === pair);
      
      return {
        label: pair,
        data: pairData.map(item => item.price),
        borderColor: getColor(index),
        backgroundColor: getBackgroundColor(index),
        tension: 0.1
      };
    });
    
    setChartData({
      labels: dates,
      datasets
    });
  };
  
  const getColor = (index: number): string => {
    const colors = [
      'rgb(75, 192, 192)',
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 206, 86)',
      'rgb(153, 102, 255)',
      'rgb(255, 159, 64)'
    ];
    return colors[index % colors.length];
  };
  
  const getBackgroundColor = (index: number): string => {
    const colors = [
      'rgba(75, 192, 192, 0.2)',
      'rgba(255, 99, 132, 0.2)',
      'rgba(54, 162, 235, 0.2)',
      'rgba(255, 206, 86, 0.2)',
      'rgba(153, 102, 255, 0.2)',
      'rgba(255, 159, 64, 0.2)'
    ];
    return colors[index % colors.length];
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Trade History Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default TradeHistoryChart; 