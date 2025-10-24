import { useState, useEffect } from 'react';
import { BudgetWarning, CURRENCIES } from '../types';
import { budgetAPI } from '../services/api';

interface BudgetWarningsProps {
  selectedMonth?: string;
  autoRefresh?: boolean;
  hideWhenEmpty?: boolean;
}

export const BudgetWarnings = ({ selectedMonth, autoRefresh = false, hideWhenEmpty = false }: BudgetWarningsProps) => {
  const [warnings, setWarnings] = useState<BudgetWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWarnings = async () => {
    try {
      setLoading(true);
      const data = selectedMonth 
        ? await budgetAPI.getBudgetWarnings(selectedMonth)
        : await budgetAPI.getCurrentMonthWarnings();
      setWarnings(data);
      setError(null);
    } catch (err) {
      // Don't show error in the UI when in expenses tab - just log it
      setError(null);
      setWarnings([]);
      console.error('Error loading budget warnings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarnings();
  }, [selectedMonth]);

  // Auto-refresh warnings every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadWarnings();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedMonth]);

  const getWarningIcon = (level: 'info' | 'warning' | 'danger') => {
    switch (level) {
      case 'info':
        return '💡';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '🚨';
      default:
        return '📊';
    }
  };

  const getWarningMessage = (warning: BudgetWarning) => {
    const percentage = Math.round(warning.percentage);
    
    if (percentage >= 100) {
      return `You've exceeded your budget by ${getCurrencySymbol(warning.currency)}${(warning.amount - warning.budgetAmount).toFixed(2)}`;
    } else if (percentage >= 80) {
      return `You're approaching your budget limit (${percentage}% used)`;
    } else {
      return `You've used ${percentage}% of your budget`;
    }
  };

  const getCurrencySymbol = (currencyCode: string) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  if (loading) {
    return <div className="loading">Loading budget warnings...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={loadWarnings} className="btn-retry">Retry</button>
      </div>
    );
  }

  if (warnings.length === 0) {
    if (hideWhenEmpty) {
      return null;
    }
    return (
      <div className="no-warnings">
        <div className="success-message">
          <span className="icon">✅</span>
          <p>Great job! No budget warnings for this month.</p>
          <small>All your budgets are within healthy spending limits.</small>
        </div>
      </div>
    );
  }

  const monthDisplay = selectedMonth 
    ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'this month';

  return (
    <div className="budget-warnings">
      <div className="warnings-header">
        <h3>Budget Alerts for {monthDisplay}</h3>
        <button onClick={loadWarnings} className="btn-refresh">
          Refresh
        </button>
      </div>
      
      <div className="warnings-list">
        {warnings.map(warning => (
          <div 
            key={warning.budgetId} 
            className={`warning-card ${warning.warningLevel}`}
          >
            <div className="warning-icon">
              {getWarningIcon(warning.warningLevel)}
            </div>
            
            <div className="warning-content">
              <div className="warning-title">
                <strong>{warning.budgetName}</strong>
                <span className="category-badge">{warning.category}</span>
              </div>
              
              <div className="warning-message">
                {getWarningMessage(warning)}
              </div>
              
              <div className="warning-details">
                <div className="amount-info">
                  <span>Spent: {getCurrencySymbol(warning.currency)}{warning.amount.toFixed(2)}</span>
                  <span>Budget: {getCurrencySymbol(warning.currency)}{warning.budgetAmount.toFixed(2)}</span>
                </div>
                
                <div className="progress-mini">
                  <div 
                    className={`progress-fill-mini ${warning.warningLevel}`}
                    style={{ width: `${Math.min(warning.percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="warning-percentage">
              {Math.round(warning.percentage)}%
            </div>
          </div>
        ))}
      </div>
      
      <div className="warnings-footer">
        <div className="legend">
          <div className="legend-item">
            <span className="legend-color info"></span>
            <span>50-79% used</span>
          </div>
          <div className="legend-item">
            <span className="legend-color warning"></span>
            <span>80-99% used</span>
          </div>
          <div className="legend-item">
            <span className="legend-color danger"></span>
            <span>100%+ used</span>
          </div>
        </div>
      </div>
    </div>
  );
};