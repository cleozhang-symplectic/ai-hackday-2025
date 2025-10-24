import { Expense, Tag } from '../types';

// In-memory storage (replace with database in production)
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

let expenses: Expense[] = [
  {
    id: '1',
    title: 'Groceries',
    amount: 75.50,
    currency: 'USD',
    category: 'Food',
    date: getCurrentDate(),
    description: 'Weekly grocery shopping',
    tags: [
      { id: 'tag1', name: 'Essential', color: 'green' },
      { id: 'tag2', name: 'Weekly', color: 'blue' }
    ]
  },
  {
    id: '2', 
    title: 'Gas',
    amount: 45.00,
    currency: 'USD',
    category: 'Transportation',
    date: getCurrentDate(),
    description: 'Fuel for car',
    tags: [
      { id: 'tag1', name: 'Essential', color: 'green' },
      { id: 'tag3', name: 'Vehicle', color: 'red' }
    ]
  },
  {
    id: '3',
    title: 'Movie Tickets',
    amount: 20.00,
    currency: 'GBP',
    category: 'Entertainment',
    date: getCurrentDate(),
    description: 'Cinema tickets for weekend',
    tags: [
      { id: 'tag4', name: 'Fun', color: 'purple' }
    ]
  }
];

export class ExpenseService {
  // Get all expenses
  getAllExpenses(): Expense[] {
    return [...expenses]; // Return a copy to prevent direct mutation
  }

  // Get expense by ID
  getExpenseById(id: string): Expense | undefined {
    return expenses.find(e => e.id === id);
  }

  // Create new expense
  createExpense(expenseData: Omit<Expense, 'id'>): Expense {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
      tags: expenseData.tags || []
    };
    expenses.push(newExpense);
    return newExpense;
  }

  // Update expense
  updateExpense(id: string, updates: Partial<Omit<Expense, 'id'>>): Expense | null {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return null;
    }

    expenses[index] = {
      ...expenses[index],
      ...updates,
      id // Ensure ID doesn't change
    };

    return expenses[index];
  }

  // Delete expense
  deleteExpense(id: string): boolean {
    const index = expenses.findIndex(e => e.id === id);
    if (index === -1) {
      return false;
    }
    expenses.splice(index, 1);
    return true;
  }

  // Get expenses by category
  getExpensesByCategory(category: string): Expense[] {
    return expenses.filter(e => e.category.toLowerCase() === category.toLowerCase());
  }

  // Get expenses by date range
  getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
    return expenses.filter(e => e.date >= startDate && e.date <= endDate);
  }

  // Get spending summary
  getSpendingSummary(): {
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    categorySummary: Array<{ category: string; count: number; total: number }>;
  } {
    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    // Group by category
    const categoryMap = new Map<string, { count: number; total: number }>();
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { count: 0, total: 0 };
      categoryMap.set(expense.category, {
        count: existing.count + 1,
        total: existing.total + expense.amount
      });
    });

    const categorySummary = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      total: Math.round(data.total * 100) / 100
    }));

    return {
      totalExpenses,
      totalAmount: Math.round(totalAmount * 100) / 100,
      averageAmount: Math.round(averageAmount * 100) / 100,
      categorySummary
    };
  }

  // Get recent expenses (last N expenses)
  getRecentExpenses(limit: number = 10): Expense[] {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Search expenses by title or description
  searchExpenses(query: string): Expense[] {
    const searchTerm = query.toLowerCase();
    return expenses.filter(expense => 
      expense.title.toLowerCase().includes(searchTerm) ||
      (expense.description && expense.description.toLowerCase().includes(searchTerm))
    );
  }
}

// Export a singleton instance
export const expenseService = new ExpenseService();