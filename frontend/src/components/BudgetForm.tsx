import { useState, useEffect } from 'react';
import { Budget, Currency, CURRENCIES } from '../types';
import { budgetAPI } from '../services/api';
import { settingsService } from '../services/settingsService';

interface BudgetFormProps {
  budget: Budget | null;
  onSave: () => void;
  onCancel: () => void;
}

export const BudgetForm = ({ budget, onSave, onCancel }: BudgetFormProps) => {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    category: budget?.category || '',
    amount: budget?.amount?.toString() || '',
    currency: budget?.currency || settingsService.getMainCurrency(),
    month: budget?.month || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })()
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await budgetAPI.getCategories();
        setAvailableCategories(categories);
      } catch (err) {
        console.error('Error loading categories:', err);
        // Fallback to default categories
        setAvailableCategories([
          'Food', 'Transportation', 'Entertainment', 'Utilities', 
          'Healthcare', 'Shopping', 'Other'
        ]);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.amount || !formData.month) {
      setError('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const budgetData = {
        name: formData.name,
        category: formData.category,
        amount: amount,
        currency: formData.currency as Currency,
        month: formData.month
      };

      if (budget) {
        // Update existing budget
        await budgetAPI.updateBudget(budget.id, budgetData);
      } else {
        // Create new budget
        await budgetAPI.createBudget(budgetData);
      }

      onSave();
    } catch (err) {
      setError(`Failed to ${budget ? 'update' : 'create'} budget`);
      console.error('Error saving budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Generate options for current month and next 11 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: monthValue, label: monthName });
    }
    
    return options;
  };

  return (
    <div className="budget-form">
      <h2>{budget ? 'Edit Budget' : 'Create New Budget'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Budget Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Monthly Groceries, Gas Budget"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            {availableCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Budget Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="currency">Currency</label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              {CURRENCIES.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="month">Month *</label>
          <select
            id="month"
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
          >
            {generateMonthOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (budget ? 'Update Budget' : 'Create Budget')}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};