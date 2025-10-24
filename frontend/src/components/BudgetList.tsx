import { useState, useEffect } from 'react';
import { Budget, Currency } from '../types';
import { budgetAPI } from '../services/api';
import { currencyService } from '../services/currencyService';

interface BudgetListProps {
  selectedMonth: string;
  onEdit: (budget: Budget) => void;
  onRefresh: () => void;
  mainCurrency: Currency;
}

export const BudgetList = ({ selectedMonth, onEdit, onRefresh, mainCurrency }: BudgetListProps) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [convertedBudgets, setConvertedBudgets] = useState<(Budget & { convertedAmount: number; convertedSpent: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetAPI.getBudgets(selectedMonth);
      setBudgets(data);
      
      // Convert budget amounts to main currency
      const converted = await Promise.all(
        data.map(async (budget) => ({
          ...budget,
          convertedAmount: await currencyService.convertAmount(budget.amount, budget.currency, mainCurrency),
          convertedSpent: await currencyService.convertAmount(budget.spent, budget.currency, mainCurrency)
        }))
      );
      setConvertedBudgets(converted);
      setError(null);
    } catch (err) {
      setError('Failed to load budgets');
      console.error('Error loading budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, mainCurrency]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      await budgetAPI.deleteBudget(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      onRefresh();
    } catch (err) {
      setError('Failed to delete budget');
      console.error('Error deleting budget:', err);
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    if (percentage >= 50) return 'info';
    return 'success';
  };

  const getUtilizationPercentage = (spent: number, amount: number) => {
    return amount > 0 ? Math.round((spent / amount) * 100) : 0;
  };



  if (loading) {
    return <div className="loading">Loading budgets...</div>;
  }

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={loadBudgets} className="btn-retry">Retry</button>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="empty-state">
        <p>No budgets found for this month.</p>
        <p>Create your first budget to start tracking your spending!</p>
      </div>
    );
  }

  return (
    <div className="budget-list">
      <div className="list-header">
        <h3>Budgets for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</h3>
        <button onClick={() => budgetAPI.refreshBudgets().then(onRefresh)} className="btn-refresh">
          Refresh Spent Amounts
        </button>
      </div>
      
      <div className="budget-cards">
        {convertedBudgets.map(budget => {
          const utilizationPercentage = getUtilizationPercentage(budget.convertedSpent, budget.convertedAmount);
          const utilizationColor = getUtilizationColor(utilizationPercentage);
          const remainingAmount = budget.convertedAmount - budget.convertedSpent;
          const isOverBudget = budget.convertedSpent > budget.convertedAmount;

          return (
            <div key={budget.id} className={`budget-card ${utilizationColor}`}>
              <div className="budget-header">
                <h4>{budget.name}</h4>
                <div className="budget-actions">
                  <button onClick={() => onEdit(budget)} className="btn-edit">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(budget.id)} className="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="budget-details">
                <div className="category">
                  <span className="label">Category:</span>
                  <span className="value">{budget.category}</span>
                </div>
                
                <div className="amounts">
                  <div className="amount-row">
                    <span className="label">Budget:</span>
                    <span className="value">
                      {currencyService.formatAmount(budget.convertedAmount, mainCurrency)}
                    </span>
                  </div>
                  <div className="amount-row">
                    <span className="label">Spent:</span>
                    <span className="value">
                      {currencyService.formatAmount(budget.convertedSpent, mainCurrency)}
                    </span>
                  </div>
                  <div className="amount-row">
                    <span className="label">{isOverBudget ? 'Over Budget:' : 'Remaining:'}:</span>
                    <span className={`value ${isOverBudget ? 'over-budget' : 'remaining'}`}>
                      {currencyService.formatAmount(Math.abs(remainingAmount), mainCurrency)}
                    </span>
                  </div>
                </div>
                
                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${utilizationColor}`}
                      style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {utilizationPercentage}% used
                    {isOverBudget && (
                      <span className="over-budget-text"> (Over Budget!)</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="budget-dates">
                <small>
                  Created: {new Date(budget.createdAt).toLocaleDateString()}
                  {budget.updatedAt !== budget.createdAt && (
                    <> | Updated: {new Date(budget.updatedAt).toLocaleDateString()}</>
                  )}
                </small>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};