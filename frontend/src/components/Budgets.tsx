import { useState, useEffect } from 'react';
import { Budget } from '../types';
import { BudgetForm } from './BudgetForm';
import { BudgetList } from './BudgetList';
import { BudgetWarnings } from './BudgetWarnings';
import { budgetAPI } from '../services/api';
import { settingsService } from '../services/settingsService';
import { currencyService } from '../services/currencyService';

export const Budgets = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [mainCurrency, setMainCurrency] = useState(settingsService.getMainCurrency());
  const [convertedSummary, setConvertedSummary] = useState<any>(null);

  // Load budget summary when month changes
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoadingSummary(true);
        const data = await budgetAPI.getBudgetSummary(selectedMonth);
        setSummary(data);
        
        // Convert amounts to main currency
        const userCurrency = settingsService.getMainCurrency();
        
        // Convert category breakdown amounts
        const convertedCategoryBreakdown = await Promise.all(
          data.categoryBreakdown.map(async (category: any) => ({
            ...category,
            totalBudget: await currencyService.convertAmount(category.totalBudget, 'USD', userCurrency),
            totalSpent: await currencyService.convertAmount(category.totalSpent, 'USD', userCurrency)
          }))
        );
        
        const converted = {
          ...data,
          totalBudgetAmount: await currencyService.convertAmount(data.totalBudgetAmount, 'USD', userCurrency),
          totalSpent: await currencyService.convertAmount(data.totalSpent, 'USD', userCurrency),
          remainingAmount: await currencyService.convertAmount(data.remainingAmount, 'USD', userCurrency),
          categoryBreakdown: convertedCategoryBreakdown
        };
        setConvertedSummary(converted);
      } catch (err) {
        console.error('Error loading budget summary:', err);
      } finally {
        setLoadingSummary(false);
      }
    };

    loadSummary();
  }, [selectedMonth, refreshTrigger]);

  // Listen for currency changes
  useEffect(() => {
    const unsubscribe = settingsService.addCurrencyChangeListener(() => {
      setMainCurrency(settingsService.getMainCurrency());
      // Trigger summary reload when currency changes
      setRefreshTrigger(prev => prev + 1);
    });

    return unsubscribe;
  }, []);

  const handleSave = () => {
    setShowForm(false);
    setEditingBudget(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for past 6 months and next 12 months
    for (let i = -6; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: monthValue, label: monthName });
    }
    
    return options;
  };

  if (showForm) {
    return (
      <div className="budgets-container">
        <BudgetForm
          budget={editingBudget}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="budgets-container">
      <div className="budgets-header">
        <h2>🎯 Your Budgets</h2>
        
        <div className="header-controls">
          <div className="month-selector">
            <label htmlFor="month-select">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {generateMonthOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => setShowForm(true)} 
            className="add-btn"
          >
            ➕ Create Budget
          </button>
        </div>
      </div>

      {/* Budget Summary */}
      {convertedSummary && !loadingSummary && (
        <div className="budget-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Total Budgets</h4>
              <div className="summary-value">{convertedSummary.totalBudgets}</div>
            </div>
            <div className="summary-card">
              <h4>Total Amount</h4>
              <div className="summary-value">
                {currencyService.formatAmount(convertedSummary.totalBudgetAmount, mainCurrency)}
              </div>
            </div>
            <div className="summary-card">
              <h4>Total Spent</h4>
              <div className="summary-value">
                {currencyService.formatAmount(convertedSummary.totalSpent, mainCurrency)}
              </div>
            </div>
            <div className="summary-card">
              <h4>Remaining</h4>
              <div className={`summary-value ${convertedSummary.remainingAmount < 0 ? 'over-budget' : 'remaining'}`}>
                {currencyService.formatAmount(Math.abs(convertedSummary.remainingAmount), mainCurrency)}
                {convertedSummary.remainingAmount < 0 && <small> over</small>}
              </div>
            </div>
            <div className="summary-card">
              <h4>Avg. Utilization</h4>
              <div className="summary-value">{convertedSummary.averageUtilization.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Warnings */}
      <BudgetWarnings 
        selectedMonth={selectedMonth}
        autoRefresh={false}
      />

      {/* Budget List */}
      <BudgetList
        selectedMonth={selectedMonth}
        onEdit={handleEdit}
        onRefresh={handleRefresh}
        mainCurrency={mainCurrency}
      />

      {/* Category Breakdown */}
      {convertedSummary && convertedSummary.categoryBreakdown && convertedSummary.categoryBreakdown.length > 0 && (
        <div className="category-breakdown">
          <h3>Category Breakdown</h3>
          <p className="currency-note">
            <small>💡 All amounts shown in {currencyService.formatAmount(0, mainCurrency).replace('0.00', '').trim()} ({mainCurrency})</small>
          </p>
          <div className="breakdown-table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Budgets</th>
                  <th>Total Budget</th>
                  <th>Total Spent</th>
                  <th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {convertedSummary.categoryBreakdown.map((category: any) => (
                  <tr key={category.category}>
                    <td>{category.category}</td>
                    <td>{category.budgetCount}</td>
                    <td>{currencyService.formatAmount(category.totalBudget, mainCurrency)}</td>
                    <td>{currencyService.formatAmount(category.totalSpent, mainCurrency)}</td>
                    <td>
                      <div className="utilization-cell">
                        <span className={category.utilization >= 100 ? 'over-budget' : category.utilization >= 80 ? 'warning' : ''}>
                          {category.utilization.toFixed(1)}%
                        </span>
                        <div className="progress-mini">
                          <div 
                            className={`progress-fill-mini ${category.utilization >= 100 ? 'danger' : category.utilization >= 80 ? 'warning' : 'success'}`}
                            style={{ width: `${Math.min(category.utilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};