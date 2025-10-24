import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Expense } from '../types';
import { expenseAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface ChartData {
  category: string;
  amount: number;
  count: number;
}

interface MonthlyData {
  month: string;
  amount: number;
}

export function Analytics() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryData, setCategoryData] = useState<ChartData[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [expensesResponse, categoryResponse, monthlyResponse] = await Promise.all([
        expenseAPI.getExpenses(),
        fetch('http://localhost:3001/api/charts/category'),
        fetch('http://localhost:3001/api/charts/monthly')
      ]);

      setExpenses(expensesResponse);
      setCategoryData(await categoryResponse.json());
      setMonthlyData(await monthlyResponse.json());
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const highestExpense = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalExpenses: totalExpenses.toFixed(2),
      averageExpense: averageExpense.toFixed(2),
      highestExpense: highestExpense.toFixed(2),
      thisMonthTotal: thisMonthTotal.toFixed(2),
      totalCount: expenses.length,
      thisMonthCount: thisMonthExpenses.length
    };
  };

  const getCategoryChartData = () => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
      '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];

    return {
      labels: categoryData.map(item => item.category),
      datasets: [
        {
          label: 'Amount Spent',
          data: categoryData.map(item => item.amount),
          backgroundColor: colors.slice(0, categoryData.length),
          borderColor: colors.slice(0, categoryData.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyChartData = () => {
    return {
      labels: monthlyData.map(item => {
        const date = new Date(item.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }),
      datasets: [
        {
          label: 'Monthly Spending',
          data: monthlyData.map(item => item.amount),
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const getTagDistribution = () => {
    const tagCounts: { [key: string]: number } = {};
    expenses.forEach(expense => {
      expense.tags?.forEach(tag => {
        tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
      });
    });

    const tagData = Object.entries(tagCounts).map(([name, count]) => ({ name, count }));
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    return {
      labels: tagData.map(item => item.name),
      datasets: [
        {
          data: tagData.map(item => item.count),
          backgroundColor: colors.slice(0, tagData.length),
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  const exportToCSV = () => {
    // Create CSV headers
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Tags'];
    
    // Convert expenses to CSV rows
    const csvRows = expenses.map(expense => [
      expense.date,
      `"${(expense.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
      expense.amount.toString(),
      expense.category,
      expense.tags ? expense.tags.map(tag => tag.name).join('; ') : ''
    ]);
    
    // Combine headers and data
    const csvContent = [headers, ...csvRows]
      .map(row => row.join(','))
      .join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = calculateStats();

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div></div>
        <h2>📊 Analytics</h2>
        <button onClick={exportToCSV} className="export-btn">
          📥 Export CSV
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <div className="stat-value">${stats.totalExpenses}</div>
          <div className="stat-subtitle">{stats.totalCount} transactions</div>
        </div>
        
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-value">${stats.thisMonthTotal}</div>
          <div className="stat-subtitle">{stats.thisMonthCount} transactions</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Expense</h3>
          <div className="stat-value">${stats.averageExpense}</div>
          <div className="stat-subtitle">per transaction</div>
        </div>
        
        <div className="stat-card">
          <h3>Highest Expense</h3>
          <div className="stat-value">${stats.highestExpense}</div>
          <div className="stat-subtitle">single transaction</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Spending by Category</h3>
          <div className="chart-wrapper">
            <Bar
              data={getCategoryChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="chart-container">
          <h3>Monthly Spending Trend</h3>
          <div className="chart-wrapper">
            <Line
              data={getMonthlyChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {expenses.some(e => e.tags && e.tags.length > 0) && (
          <div className="chart-container">
            <h3>Tag Distribution</h3>
            <div className="chart-wrapper doughnut-chart">
              <Doughnut
                data={getTagDistribution()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}