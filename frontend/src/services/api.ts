import axios from 'axios';
import { Expense, ChartData } from '../types';

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