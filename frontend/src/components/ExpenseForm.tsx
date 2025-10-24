import { useState, useEffect } from 'react';
import { Expense, Tag, Currency, CURRENCIES } from '../types';
import { expenseAPI } from '../services/api';
import { TagSelector } from './TagSelector';
import { settingsService } from '../services/settingsService';

interface ExpenseFormProps {
  expense: Expense | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ExpenseForm = ({ expense, onSave, onCancel }: ExpenseFormProps) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount?.toString() || '',
    currency: expense?.currency || settingsService.getMainCurrency(),
    category: expense?.category || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || ''
  });

  const [selectedTags, setSelectedTags] = useState<Tag[]>(expense?.tags || []);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing tags from localStorage (simple tag persistence)
  useEffect(() => {
    const savedTags = localStorage.getItem('expenseTrackerTags');
    if (savedTags) {
      try {
        setAvailableTags(JSON.parse(savedTags));
      } catch (err) {
        console.error('Error parsing saved tags:', err);
      }
    }
  }, []);

  // Save tags to localStorage whenever they change
  const saveTagsToStorage = (tags: Tag[]) => {
    localStorage.setItem('expenseTrackerTags', JSON.stringify(tags));
    setAvailableTags(tags);
  };

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleTagCreate = (newTag: Omit<Tag, 'id'>) => {
    const tag: Tag = {
      ...newTag,
      id: Date.now().toString()
    };
    const updatedTags = [...availableTags, tag];
    saveTagsToStorage(updatedTags);
    setSelectedTags(prev => [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.category || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const expenseData = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        currency: formData.currency as Currency,
        category: formData.category,
        date: formData.date,
        description: formData.description,
        tags: selectedTags
      };

      if (expense) {
        // Update existing expense
        await expenseAPI.updateExpense(expense.id, expenseData);
      } else {
        // Create new expense
        await expenseAPI.createExpense(expenseData);
      }

      onSave();
    } catch (err) {
      setError(`Failed to ${expense ? 'update' : 'create'} expense`);
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="expense-form">
      <h2>{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
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
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Food">Food</option>
            <option value="Transportation">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Utilities">Utilities</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Shopping">Shopping</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className="form-group">
          <TagSelector
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            onTagCreate={handleTagCreate}
          />
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (expense ? 'Update' : 'Create')}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};