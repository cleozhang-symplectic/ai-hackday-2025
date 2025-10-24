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
import { currencyService } from '../services/currencyService';
import { settingsService } from '../services/settingsService';

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
  const [convertedExpenses, setConvertedExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Listen for currency changes and reload analytics data
  useEffect(() => {
    const unsubscribe = settingsService.addCurrencyChangeListener(() => {
      loadAnalyticsData();
    });

    return unsubscribe;
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const expensesResponse = await expenseAPI.getExpenses();
      setExpenses(expensesResponse);

      // Convert all expenses to main currency
      const mainCurrency = settingsService.getMainCurrency();
      const convertedExpensesData: Expense[] = [];
      
      for (const expense of expensesResponse) {
        const convertedAmount = await currencyService.convertAmount(
          expense.amount,
          expense.currency,
          mainCurrency
        );
        convertedExpensesData.push({
          ...expense,
          amount: convertedAmount,
          currency: mainCurrency
        });
      }
      
      setConvertedExpenses(convertedExpensesData);

      // Generate category and monthly data from converted expenses
      const categoryMap = new Map<string, { amount: number; count: number }>();
      const monthlyMap = new Map<string, number>();

      convertedExpensesData.forEach(expense => {
        // Category data
        const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
        categoryMap.set(expense.category, {
          amount: existing.amount + expense.amount,
          count: existing.count + 1
        });

        // Monthly data
        const monthKey = expense.date.substring(0, 7); // YYYY-MM format
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + expense.amount);
      });

      // Convert maps to arrays
      const categoryDataArray = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        amount: Math.round(data.amount * 100) / 100, // Round to 2 decimal places
        count: data.count
      }));

      const monthlyDataArray = Array.from(monthlyMap.entries())
        .map(([month, amount]) => ({
          month,
          amount: Math.round(amount * 100) / 100 // Round to 2 decimal places
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      setCategoryData(categoryDataArray);
      setMonthlyData(monthlyDataArray);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalExpenses = convertedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const averageExpense = convertedExpenses.length > 0 ? totalExpenses / convertedExpenses.length : 0;
    const highestExpense = convertedExpenses.length > 0 ? Math.max(...convertedExpenses.map(e => e.amount)) : 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthExpenses = convertedExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const mainCurrency = settingsService.getMainCurrency();

    return {
      totalExpenses: currencyService.formatAmount(totalExpenses, mainCurrency),
      averageExpense: currencyService.formatAmount(averageExpense, mainCurrency),
      highestExpense: currencyService.formatAmount(highestExpense, mainCurrency),
      thisMonthTotal: currencyService.formatAmount(thisMonthTotal, mainCurrency),
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
    convertedExpenses.forEach(expense => {
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
    const headers = ['Date', 'Description', 'Amount', 'Original Amount', 'Original Currency', 'Category', 'Tags'];
    
    // Convert expenses to CSV rows
    const csvRows = expenses.map((expense, index) => {
      const convertedAmount = convertedExpenses[index]?.amount || expense.amount;
      return [
        expense.date,
        `"${(expense.description || '').replace(/"/g, '""')}"`, // Escape quotes in description
        convertedAmount.toString(),
        expense.amount.toString(),
        expense.currency,
        expense.category,
        expense.tags ? expense.tags.map(tag => tag.name).join('; ') : ''
      ];
    });
    
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
          <div className="stat-value">{stats.totalExpenses}</div>
          <div className="stat-subtitle">{stats.totalCount} transactions</div>
        </div>
        
        <div className="stat-card">
          <h3>This Month</h3>
          <div className="stat-value">{stats.thisMonthTotal}</div>
          <div className="stat-subtitle">{stats.thisMonthCount} transactions</div>
        </div>
        
        <div className="stat-card">
          <h3>Average Expense</h3>
          <div className="stat-value">{stats.averageExpense}</div>
          <div className="stat-subtitle">per transaction</div>
        </div>
        
        <div className="stat-card">
          <h3>Highest Expense</h3>
          <div className="stat-value">{stats.highestExpense}</div>
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
                        const mainCurrency = settingsService.getMainCurrency();
                        return currencyService.formatAmount(Number(value), mainCurrency);
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
                        const mainCurrency = settingsService.getMainCurrency();
                        return currencyService.formatAmount(Number(value), mainCurrency);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {convertedExpenses.some(e => e.tags && e.tags.length > 0) && (
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