import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../Components/Navbar';
import { reportAPI } from '../api';

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

interface ReportData {
  totalAmountCurrentYear: number;
  totalAdmins: number;
}

interface MonthRevenueData {
  totalAmountMonth: number;
  month: number;
  year: number;
}

interface YearGraphData {
  year: number;
  months: Array<{
    month: string;
    amount: number;
  }>;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Cache expiry time (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

// Helper functions for sessionStorage with expiry
const getFromCache = <T,>(key: string): T | null => {
  try {
    const cached = sessionStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return data as T;
  } catch {
    return null;
  }
};

const saveToCache = <T,>(key: string, data: T): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (err) {
    console.error('Failed to save to cache:', err);
  }
};

const Report = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [monthRevenueData, setMonthRevenueData] = useState<number>(0);
  const [yearGraphData, setYearGraphData] = useState<YearGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Fetch report summary
  useEffect(() => {
    const fetchReportSummary = async () => {
      const cacheKey = 'report_summary';
      const cached = getFromCache<ReportData>(cacheKey);
      
      if (cached) {
        setReportData(cached);
        return;
      }

      try {
        const result = await reportAPI.getReport();
        setReportData(result.data);
        saveToCache(cacheKey, result.data);
      } catch (err) {
        console.error('Error fetching report summary:', err);
        setError('Unable to load report data.');
      }
    };

    fetchReportSummary();
  }, []);

  // Fetch month revenue when selected month changes
  useEffect(() => {
    const fetchMonthRevenue = async () => {
      const cacheKey = `month_revenue_${selectedMonth}`;
      const cached = getFromCache<{ totalAmountMonth: number }>(cacheKey);
      
      if (cached) {
        setMonthRevenueData(cached.totalAmountMonth || 0);
        return;
      }

      try {
        const result = await reportAPI.getMonthRevenue(selectedMonth);
        setMonthRevenueData(result.data?.totalAmountMonth || 0);
        saveToCache(cacheKey, result.data);
      } catch (err) {
        console.error('Error fetching month revenue:', err);
      }
    };

    fetchMonthRevenue();
  }, [selectedMonth]);

  // Fetch year graph data when selected year changes
  useEffect(() => {
    const fetchYearGraph = async () => {
      const cacheKey = `year_graph_${selectedYear}`;
      const cached = getFromCache<YearGraphData>(cacheKey);
      
      if (cached) {
        setYearGraphData(cached);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await reportAPI.getYearlyRevenueGraph(selectedYear);
        setYearGraphData(result.data);
        saveToCache(cacheKey, result.data);
      } catch (err) {
        console.error('Error fetching year graph:', err);
        setError('Unable to load graph data.');
      } finally {
        setLoading(false);
      }
    };

    fetchYearGraph();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="report" />
        <div className="p-8">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar activePage="report" />
        <div className="p-8">
          <div className="text-center text-red-600">{error || 'No dashboard data available.'}</div>
        </div>
      </div>
    );
  }

  const monthlyData = yearGraphData?.months.map(m => m.amount) || new Array(12).fill(0);
  const maxValue = Math.max(...monthlyData, 1000);
  const yAxisMax = Math.ceil(maxValue / 1000) * 1000;

  const chartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Revenue',
        data: monthlyData,
        borderColor: '#4b5563',
        backgroundColor: 'transparent',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: any) => `₹ ${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: yAxisMax,
        ticks: {
          stepSize: Math.ceil(yAxisMax / 4),
          callback: (value: any) => `₹${value}`,
        },
        grid: {
          color: '#e5e7eb',
          drawBorder: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="report" />

      <div className="pt-20 px-8 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard!</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with stat cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Total Revenue Card */}
            <div className="bg-gray-900 text-white rounded-lg p-6 shadow-lg">
              <div className="text-sm text-gray-400 mb-2">Total Revenue</div>
              <div className="text-3xl font-bold mb-3">
                ₹ {reportData.totalAmountCurrentYear.toLocaleString()}
              </div>
              <div className="text-sm text-green-400">Current Year</div>
            </div>

            {/* Month Revenue Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-600">Month Revenue</div>
                <select 
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {MONTH_LABELS.map((month, index) => (
                    <option key={month} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-3">
                ₹ {monthRevenueData.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">{MONTH_LABELS[selectedMonth - 1]} {new Date().getFullYear()}</div>
            </div>

            {/* Total Admin Card */}
            <div className="bg-white rounded-lg p-6 shadow-lg border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Admin</div>
              <div className="text-3xl font-bold text-gray-900 mb-3">{reportData.totalAdmins}</div>
              <div className="text-sm text-gray-500">Active Admins</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Revenue Analysis</h2>
                <select 
                  className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="h-96">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
