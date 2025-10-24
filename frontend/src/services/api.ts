import axios from 'axios';
import { Expense, ChartData, Budget, BudgetWarning } from '../types';

const API_BASE_URL = '/api';

export const expenseAPI = {
  // Get all expenses
  getExpenses: async (): Promise<Expense[]> => {
    const response = await axios.get(`${API_BASE_URL}/expenses`);
    return response.data;
  },

  // Get expense by ID
  getExpense: async (id: string): Promise<Expense> => {
    const response = await axios.get(`${API_BASE_URL}/expenses/${id}`);
    return response.data;
  },

  // Create new expense
  createExpense: async (expense: Omit<Expense, 'id'>): Promise<Expense> => {
    const response = await axios.post(`${API_BASE_URL}/expenses`, expense);
    return response.data;
  },

  // Update expense
  updateExpense: async (id: string, expense: Partial<Omit<Expense, 'id'>>): Promise<Expense> => {
    const response = await axios.put(`${API_BASE_URL}/expenses/${id}`, expense);
    return response.data;
  },

  // Delete expense
  deleteExpense: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/expenses/${id}`);
  }
};

export const chartAPI = {
  // Get category chart data
  getCategoryData: async (): Promise<ChartData[]> => {
    const response = await axios.get(`${API_BASE_URL}/charts/category`);
    return response.data;
  },

  // Get monthly chart data
  getMonthlyData: async (): Promise<Array<{ month: string; amount: number }>> => {
    const response = await axios.get(`${API_BASE_URL}/charts/monthly`);
    return response.data;
  }
};

export const budgetAPI = {
  // Get all budgets or budgets for a specific month
  getBudgets: async (month?: string): Promise<Budget[]> => {
    const url = month ? `${API_BASE_URL}/budgets?month=${month}` : `${API_BASE_URL}/budgets`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get budget by ID
  getBudget: async (id: string): Promise<Budget> => {
    const response = await axios.get(`${API_BASE_URL}/budgets/${id}`);
    return response.data;
  },

  // Create new budget
  createBudget: async (budget: Omit<Budget, 'id' | 'spent' | 'createdAt' | 'updatedAt'>): Promise<Budget> => {
    const response = await axios.post(`${API_BASE_URL}/budgets`, budget);
    return response.data;
  },

  // Update budget
  updateBudget: async (id: string, budget: Partial<Omit<Budget, 'id' | 'spent' | 'createdAt'>>): Promise<Budget> => {
    const response = await axios.put(`${API_BASE_URL}/budgets/${id}`, budget);
    return response.data;
  },

  // Delete budget
  deleteBudget: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/budgets/${id}`);
  },

  // Get budget warnings for a specific month
  getBudgetWarnings: async (month: string): Promise<BudgetWarning[]> => {
    const response = await axios.get(`${API_BASE_URL}/budgets/warnings/${month}`);
    return response.data;
  },

  // Get current month's budget warnings
  getCurrentMonthWarnings: async (): Promise<BudgetWarning[]> => {
    const response = await axios.get(`${API_BASE_URL}/budgets/warnings`);
    return response.data;
  },

  // Get budget summary for a specific month
  getBudgetSummary: async (month?: string): Promise<{
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
  }> => {
    const url = month ? `${API_BASE_URL}/budgets/summary/${month}` : `${API_BASE_URL}/budgets/summary`;
    const response = await axios.get(url);
    return response.data;
  },

  // Get available categories
  getCategories: async (): Promise<string[]> => {
    const response = await axios.get(`${API_BASE_URL}/budgets/categories`);
    return response.data;
  },

  // Refresh spent amounts for all budgets
  refreshBudgets: async (): Promise<void> => {
    await axios.post(`${API_BASE_URL}/budgets/refresh`);
  }
};