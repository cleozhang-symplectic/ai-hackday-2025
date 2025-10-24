import { Budget, BudgetWarning, Currency } from '../types';
import { expenseService } from './expenseService';
import { currencyService } from './currencyService';

// In-memory storage (replace with database in production)
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

let budgets: Budget[] = [
  {
    id: '1',
    name: 'Monthly Groceries',
    category: 'Food',
    amount: 400,
    currency: 'USD',
    month: getCurrentMonth(),
    spent: 0, // Will be recalculated
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Transportation Budget',
    category: 'Transportation',
    amount: 200,
    currency: 'USD',
    month: getCurrentMonth(),
    spent: 0, // Will be recalculated
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Entertainment Fund',
    category: 'Entertainment',
    amount: 150,
    currency: 'USD',
    month: getCurrentMonth(),
    spent: 0, // Will be recalculated
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class BudgetService {
  private initialized = false;

  // Initialize spent amounts if not already done
  private async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.updateAllSpentAmounts();
      this.initialized = true;
    }
  }

  // Get all budgets
  async getAllBudgets(): Promise<Budget[]> {
    await this.initialize();
    return [...budgets]; // Return a copy to prevent direct mutation
  }

  // Get budget by ID
  getBudgetById(id: string): Budget | undefined {
    return budgets.find(b => b.id === id);
  }

  // Get budgets by month
  async getBudgetsByMonth(month: string): Promise<Budget[]> {
    await this.initialize();
    return budgets.filter(b => b.month === month);
  }

  // Create new budget
  async createBudget(budgetData: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>): Promise<Budget> {
    // Calculate initial spent amount based on existing expenses
    const spent = await this.calculateSpentAmount(budgetData.category, budgetData.month, budgetData.currency);
    
    const newBudget: Budget = {
      ...budgetData,
      id: Date.now().toString(),
      spent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    budgets.push(newBudget);
    return newBudget;
  }

  // Update budget
  updateBudget(id: string, updates: Partial<Omit<Budget, 'id' | 'spent' | 'createdAt'>>): Budget | null {
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) {
      return null;
    }

    const existingBudget = budgets[index];
    budgets[index] = {
      ...existingBudget,
      ...updates,
      id, // Ensure ID doesn't change
      spent: existingBudget.spent, // Keep current spent amount
      createdAt: existingBudget.createdAt, // Keep original creation date
      updatedAt: new Date().toISOString()
    };

    return budgets[index];
  }

  // Delete budget
  deleteBudget(id: string): boolean {
    const index = budgets.findIndex(b => b.id === id);
    if (index === -1) {
      return false;
    }
    budgets.splice(index, 1);
    return true;
  }

  // Calculate spent amount for a category in a specific month
  private async calculateSpentAmount(category: string, month: string, budgetCurrency: Currency): Promise<number> {
    const expenses = expenseService.getAllExpenses();
    
    const categoryExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
      return expense.category.toLowerCase() === category.toLowerCase() && expenseMonth === month;
    });

    // Convert all expenses to the budget's currency and sum them
    let total = 0;
    for (const expense of categoryExpenses) {
      const convertedAmount = await currencyService.convertAmount(expense.amount, expense.currency, budgetCurrency);
      total += convertedAmount;
    }

    return Math.round(total * 100) / 100;
  }

  // Update spent amounts for all budgets (call this when expenses change)
  async updateAllSpentAmounts(): Promise<void> {
    for (const budget of budgets) {
      budget.spent = await this.calculateSpentAmount(budget.category, budget.month, budget.currency);
      budget.updatedAt = new Date().toISOString();
    }
  }

  // Get budget warnings for a specific month
  async getBudgetWarnings(month: string): Promise<BudgetWarning[]> {
    const monthBudgets = await this.getBudgetsByMonth(month);
    const warnings: BudgetWarning[] = [];

    monthBudgets.forEach(budget => {
      const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
      
      let warningLevel: 'info' | 'warning' | 'danger' = 'info';
      if (percentage >= 100) {
        warningLevel = 'danger';
      } else if (percentage >= 80) {
        warningLevel = 'warning';
      } else if (percentage >= 50) {
        warningLevel = 'info';
      }

      // Only include warnings for budgets that are 50% or more spent
      if (percentage >= 50) {
        warnings.push({
          budgetId: budget.id,
          budgetName: budget.name,
          category: budget.category,
          percentage: Math.round(percentage * 100) / 100,
          amount: budget.spent,
          budgetAmount: budget.amount,
          currency: budget.currency,
          warningLevel
        });
      }
    });

    return warnings.sort((a, b) => b.percentage - a.percentage); // Sort by percentage descending
  }

  // Get current month's warnings
  async getCurrentMonthWarnings(): Promise<BudgetWarning[]> {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return await this.getBudgetWarnings(currentMonth);
  }

  // Get budget summary
  async getBudgetSummary(month?: string): Promise<{
    totalBudgets: number;
    totalBudgetAmount: number;
    totalSpent: number;
    remainingAmount: number;
    averageUtilization: number;
    categoryBreakdown: Array<{
      category: string;
      budgetCount: number;
      totalBudget: number;
      totalSpent: number;
      utilization: number;
    }>;
  }> {
    await this.initialize();
    const targetBudgets = month ? await this.getBudgetsByMonth(month) : budgets;
    
    const totalBudgets = targetBudgets.length;
    const totalBudgetAmount = targetBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = targetBudgets.reduce((sum, b) => sum + b.spent, 0);
    const remainingAmount = totalBudgetAmount - totalSpent;
    const averageUtilization = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;

    // Group by category
    const categoryMap = new Map<string, { budgetCount: number; totalBudget: number; totalSpent: number }>();
    targetBudgets.forEach(budget => {
      const existing = categoryMap.get(budget.category) || { budgetCount: 0, totalBudget: 0, totalSpent: 0 };
      categoryMap.set(budget.category, {
        budgetCount: existing.budgetCount + 1,
        totalBudget: existing.totalBudget + budget.amount,
        totalSpent: existing.totalSpent + budget.spent
      });
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      budgetCount: data.budgetCount,
      totalBudget: Math.round(data.totalBudget * 100) / 100,
      totalSpent: Math.round(data.totalSpent * 100) / 100,
      utilization: data.totalBudget > 0 ? Math.round((data.totalSpent / data.totalBudget) * 10000) / 100 : 0
    }));

    return {
      totalBudgets,
      totalBudgetAmount: Math.round(totalBudgetAmount * 100) / 100,
      totalSpent: Math.round(totalSpent * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      averageUtilization: Math.round(averageUtilization * 100) / 100,
      categoryBreakdown
    };
  }

  // Get available categories (from existing expenses)
  getAvailableCategories(): string[] {
    const expenses = expenseService.getAllExpenses();
    const categories = new Set(expenses.map(e => e.category));
    return Array.from(categories).sort();
  }
}

// Export a singleton instance
export const budgetService = new BudgetService();