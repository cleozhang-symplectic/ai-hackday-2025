import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { expenseAPI } from '../services/api';
import { currencyService } from '../services/currencyService';
import { settingsService } from '../services/settingsService';

interface ExpenseListProps {
  onExpenseSelect: (expense: Expense | null) => void;
  refreshTrigger: number;
}

type FilterType = 'none' | 'amount' | 'category' | 'date' | 'tag';
type AmountFilter = 'all' | 'under50' | '50to100' | 'over100';
type SortType = 'none' | 'date' | 'amount' | 'title' | 'category';
type SortOrder = 'asc' | 'desc';

export const ExpenseList = ({ onExpenseSelect, refreshTrigger }: ExpenseListProps) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [convertedAmounts, setConvertedAmounts] = useState<Map<string, number>>(new Map());
  
  // Filter states
  const [filterType, setFilterType] = useState<FilterType>('none');
  const [amountFilter, setAmountFilter] = useState<AmountFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('all');
  
  // Sort states
  const [sortType, setSortType] = useState<SortType>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    loadExpenses();
  }, [refreshTrigger]);

  // Listen for currency changes and recalculate converted amounts
  useEffect(() => {
    const unsubscribe = settingsService.addCurrencyChangeListener(() => {
      recalculateConvertedAmounts();
    });

    return unsubscribe;
  }, [expenses]);

  // Apply filters and sorting whenever expenses or criteria change
  useEffect(() => {
    applyFiltersAndSort();
  }, [expenses, filterType, amountFilter, categoryFilter, dateFilter, tagFilter, sortType, sortOrder]);

  const recalculateConvertedAmounts = async () => {
    if (expenses.length === 0) return;
    
    try {
      const mainCurrency = settingsService.getMainCurrency();
      const conversions = new Map<string, number>();
      
      for (const expense of expenses) {
        const convertedAmount = await currencyService.convertAmount(
          expense.amount,
          expense.currency,
          mainCurrency
        );
        conversions.set(expense.id, convertedAmount);
      }
      
      setConvertedAmounts(conversions);
    } catch (err) {
      console.error('Error recalculating converted amounts:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expenseAPI.getExpenses();
      setExpenses(data);
      
      // Convert all amounts to main currency
      const mainCurrency = settingsService.getMainCurrency();
      const conversions = new Map<string, number>();
      
      for (const expense of data) {
        const convertedAmount = await currencyService.convertAmount(
          expense.amount,
          expense.currency,
          mainCurrency
        );
        conversions.set(expense.id, convertedAmount);
      }
      
      setConvertedAmounts(conversions);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let processed = [...expenses];

    // Apply filters first
    if (filterType === 'amount') {
      switch (amountFilter) {
        case 'under50':
          processed = processed.filter(expense => {
            const convertedAmount = convertedAmounts.get(expense.id) || expense.amount;
            return convertedAmount < 50;
          });
          break;
        case '50to100':
          processed = processed.filter(expense => {
            const convertedAmount = convertedAmounts.get(expense.id) || expense.amount;
            return convertedAmount >= 50 && convertedAmount <= 100;
          });
          break;
        case 'over100':
          processed = processed.filter(expense => {
            const convertedAmount = convertedAmounts.get(expense.id) || expense.amount;
            return convertedAmount > 100;
          });
          break;
        default:
          break;
      }
    } else if (filterType === 'category' && categoryFilter !== 'all') {
      processed = processed.filter(expense => expense.category === categoryFilter);
    } else if (filterType === 'date' && dateFilter) {
      processed = processed.filter(expense => expense.date === dateFilter);
    } else if (filterType === 'tag' && tagFilter !== 'all') {
      processed = processed.filter(expense => 
        expense.tags && expense.tags.some(tag => tag.id === tagFilter)
      );
    }

    // Apply sorting
    if (sortType !== 'none') {
      processed.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortType) {
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'amount':
            aValue = convertedAmounts.get(a.id) || a.amount;
            bValue = convertedAmounts.get(b.id) || b.amount;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredExpenses(processed);
  };

  const resetFiltersAndSort = () => {
    setFilterType('none');
    setAmountFilter('all');
    setCategoryFilter('all');
    setDateFilter('');
    setTagFilter('all');
    setSortType('none');
    setSortOrder('desc');
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

  const displayExpenses = (filterType === 'none' && sortType === 'none') ? expenses : filteredExpenses;

  return (
    <div className="expense-list">
      <div className="expense-header-section">
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

            {/* Filter Options - Right after Filter by */}
            {filterType === 'amount' && (
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
            )}

            {filterType === 'category' && (
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
            )}

            {filterType === 'date' && (
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
            )}

            {filterType === 'tag' && (
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
            )}

            <label htmlFor="sort-type">Sort by:</label>
            <select 
              id="sort-type"
              value={sortType} 
              onChange={(e) => setSortType(e.target.value as SortType)}
              className="filter-select"
            >
              <option value="none">No Sort</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="title">Title</option>
              <option value="category">Category</option>
            </select>

            {sortType !== 'none' && (
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="filter-select sort-order"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            )}
            
            {(filterType !== 'none' || sortType !== 'none') && (
              <button onClick={resetFiltersAndSort} className="reset-filters-btn">
                Clear All
              </button>
            )}
          </div>
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
            {sortType !== 'none' && (
              <span className="sort-indicator"> (sorted by {sortType} {sortOrder === 'desc' ? '↓' : '↑'})</span>
            )}
          </div>
          <div className="expense-grid">
            {displayExpenses.map(expense => {
              const convertedAmount = convertedAmounts.get(expense.id) || expense.amount;
              const mainCurrency = settingsService.getMainCurrency();
              const formattedAmount = currencyService.formatAmount(convertedAmount, mainCurrency);
              
              return (
                <div key={expense.id} className="expense-card">
                  <div className="expense-header">
                    <h3>{expense.title}</h3>
                    <span className="expense-amount">
                      {formattedAmount}
                      {expense.currency !== mainCurrency && (
                        <span className="original-amount">
                          {' '}({currencyService.formatAmount(expense.amount, expense.currency)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="expense-details">
                    <p><strong>Category:</strong> {expense.category}</p>
                    <p><strong>Date:</strong> {expense.date}</p>
                    {expense.description && (
                      <p><strong>Description:</strong> {expense.description}</p>
                    )}
                    {expense.tags && expense.tags.length > 0 && (
                      <div className="expense-tags">
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};