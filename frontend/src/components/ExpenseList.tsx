import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { expenseAPI } from '../services/api';

interface ExpenseListProps {
  onExpenseSelect: (expense: Expense | null) => void;
  refreshTrigger: number;
}

type FilterType = 'none' | 'amount' | 'category' | 'date' | 'tag';
type AmountFilter = 'all' | 'under50' | '50to100' | 'over100';

export const ExpenseList = ({ onExpenseSelect, refreshTrigger }: ExpenseListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');

  useEffect(() => {
    loadExpenses();
  }, [refreshTrigger]);

  // Apply filters whenever expenses or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [expenses, filterType, amountFilter, categoryFilter, dateFilter, tagFilter]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseAPI.getExpenses();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filterType === 'amount') {
      switch (amountFilter) {
        case 'under50':
          filtered = filtered.filter(expense => expense.amount < 50);
          break;
        case '50to100':
          filtered = filtered.filter(expense => expense.amount >= 50 && expense.amount <= 100);
          break;
        case 'over100':
          filtered = filtered.filter(expense => expense.amount > 100);
          break;
        default:
          break;
      }
    } else if (filterType === 'category' && categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    } else if (filterType === 'date' && dateFilter) {
      filtered = filtered.filter(expense => expense.date === dateFilter);
    } else if (filterType === 'tag' && tagFilter !== 'all') {
      filtered = filtered.filter(expense => 
        expense.tags && expense.tags.some(tag => tag.id === tagFilter)
      );
    }

    setFilteredExpenses(filtered);
  };

  const resetFilters = () => {
    setFilterType('none');
    setAmountFilter('all');
    setCategoryFilter('all');
    setDateFilter('');
    setTagFilter('all');
  };

  const getUniqueCategories = () => {
    const categories = expenses.map(expense => expense.category);
    return [...new Set(categories)].sort();
  };

  const getUniqueDates = () => {
    const dates = expenses.map(expense => expense.date);
    return [...new Set(dates)].sort().reverse(); // Most recent first
  };

  const getUniqueTags = () => {
    const tags = expenses.flatMap(expense => expense.tags || []);
    const uniqueTagsMap = new Map();
    tags.forEach(tag => {
      uniqueTagsMap.set(tag.id, tag);
    });
    return Array.from(uniqueTagsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.deleteExpense(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  if (loading) return <div>Loading expenses...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const displayExpenses = filterType === 'none' ? expenses : filteredExpenses;

  return (
    <div className="expense-list">
      <div className="expense-header-section">
        <h2>Expenses</h2>
        
        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-row">
            <label htmlFor="filter-type">Filter by:</label>
            <select 
              id="filter-type"
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="filter-select"
            >
              <option value="none">No Filter</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
              <option value="date">Date</option>
              <option value="tag">Tag</option>
            </select>
            
            {filterType !== 'none' && (
              <button onClick={resetFilters} className="reset-filters-btn">
                Clear Filters
              </button>
            )}
          </div>

          {/* Amount Filter Options */}
          {filterType === 'amount' && (
            <div className="filter-options">
              <select 
                value={amountFilter} 
                onChange={(e) => setAmountFilter(e.target.value as AmountFilter)}
                className="filter-select"
              >
                <option value="all">All Amounts</option>
                <option value="under50">Under $50</option>
                <option value="50to100">$50 - $100</option>
                <option value="over100">Over $100</option>
              </select>
            </div>
          )}

          {/* Category Filter Options */}
          {filterType === 'category' && (
            <div className="filter-options">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Filter Options */}
          {filterType === 'date' && (
            <div className="filter-options">
              <select 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All Dates</option>
                {getUniqueDates().map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tag Filter Options */}
          {filterType === 'tag' && (
            <div className="filter-options">
              <select 
                value={tagFilter} 
                onChange={(e) => setTagFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Tags</option>
                {getUniqueTags().map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {displayExpenses.length === 0 ? (
        <p>{expenses.length === 0 ? 'No expenses found. Add your first expense!' : 'No expenses match the current filter.'}</p>
      ) : (
        <>
          <div className="results-summary">
            Showing {displayExpenses.length} of {expenses.length} expenses
            {filterType !== 'none' && (
              <span className="filter-indicator"> (filtered by {filterType})</span>
            )}
          </div>
          <div className="expense-grid">
            {displayExpenses.map(expense => (
              <div key={expense.id} className="expense-card">
                <div className="expense-header">
                  <h3>{expense.title}</h3>
                  <span className="expense-amount">${expense.amount.toFixed(2)}</span>
                </div>
                <div className="expense-details">
                  <p><strong>Category:</strong> {expense.category}</p>
                  <p><strong>Date:</strong> {expense.date}</p>
                  {expense.description && (
                    <p><strong>Description:</strong> {expense.description}</p>
                  )}
                  {expense.tags && expense.tags.length > 0 && (
                    <div className="expense-tags">
                      <strong>Tags:</strong>
                      <div className="tags-list">
                        {expense.tags.map(tag => (
                          <span key={tag.id} className={`tag tag-${tag.color}`}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="expense-actions">
                  <button onClick={() => onExpenseSelect(expense)}>Edit</button>
                  <button onClick={() => handleDelete(expense.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};