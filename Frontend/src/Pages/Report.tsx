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
import './Report.css';

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

interface DashboardData {
  totalRevenue: number;
  revenueGrowth: string;
  monthRevenue: number;
  monthGrowth: string;
  totalAdmins: number;
  activeAdmins: number;
  monthlyData: number[];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatGrowthLabel = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) return '0.0% vs last month';
    return '+100.0% vs last month';
  }
  const change = ((current - previous) / previous) * 100;
  const prefix = change >= 0 ? '+' : '';
  return `${prefix}${change.toFixed(1)}% vs last month`;
};

const Report = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(() => MONTH_LABELS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState('Year');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl}/api/admin/dashboard-summary`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        const monthlyData = Array.isArray(payload?.monthlyData)
          ? payload.monthlyData.map((value: unknown) => Number(value) || 0)
          : new Array(12).fill(0);

        setDashboardData({
          totalRevenue: Number(payload?.totalRevenue) || 0,
          revenueGrowth: String(payload?.revenueGrowth ?? '0.0% vs last month'),
          monthRevenue: Number(payload?.monthRevenue) || 0,
          monthGrowth: String(payload?.monthGrowth ?? '0.0% vs last month'),
          totalAdmins: Number(payload?.totalAdmins) || 0,
          activeAdmins: Number(payload?.activeAdmins) || 0,
          monthlyData,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiBaseUrl]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Navbar activePage="report" />
        <div className="dashboard-content">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="dashboard-container">
        <Navbar activePage="report" />
        <div className="dashboard-content">
          <div className="loading">{error || 'No dashboard data available.'}</div>
        </div>
      </div>
    );
  }

  const selectedMonthIndex = MONTH_LABELS.indexOf(selectedMonth);
  const selectedMonthRevenue =
    selectedMonthIndex >= 0 ? dashboardData.monthlyData[selectedMonthIndex] ?? 0 : 0;
  const previousMonthRevenue =
    selectedMonthIndex > 0 ? dashboardData.monthlyData[selectedMonthIndex - 1] ?? 0 : 0;
  const selectedMonthGrowth = formatGrowthLabel(selectedMonthRevenue, previousMonthRevenue);

  const chartData = {
    labels: MONTH_LABELS,
    datasets: [
      {
        label: 'Revenue',
        data: dashboardData.monthlyData,
        borderColor: '#666',
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
        max: 1000,
        ticks: {
          stepSize: 250,
        },
        grid: {
          color: '#e0e0e0',
          drawBorder: false,
        },
        border: {
          display: false,
          dash: [5, 5],
        },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <Navbar activePage="report" />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Analytics Dashboard!</h1>
        </div>

        <div className="dashboard-main">
          <div className="dashboard-sidebar">
            {/* Total Revenue Card */}
            <div className="stat-card stat-card-dark">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">
                ₹ {dashboardData.totalRevenue.toLocaleString()}
              </div>
              <div className="stat-growth positive">{dashboardData.revenueGrowth}</div>
            </div>

            {/* Month Revenue Card */}
            <div className="stat-card stat-card-light">
              <div className="stat-header">
                <div className="stat-label">Month Revenue</div>
                <select 
                  className="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {MONTH_LABELS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stat-value">
                ₹ {selectedMonthRevenue.toLocaleString()}
              </div>
              <div className="stat-growth positive">{selectedMonthGrowth}</div>
            </div>

            {/* Total Admin Card */}
            <div className="stat-card stat-card-light">
              <div className="stat-label">Total Admin</div>
              <div className="stat-value">{dashboardData.totalAdmins}</div>
              <div className="stat-info">{dashboardData.activeAdmins} Active Admins</div>
            </div>
          </div>

          <div className="dashboard-chart-section">
            <div className="chart-header">
              <h2>Revenue Analysis</h2>
              <select 
                className="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="Year">Year</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
