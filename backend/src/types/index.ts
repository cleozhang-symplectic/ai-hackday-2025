export type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'SGD' | 'HKD' | 'NZD';

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string;
  description?: string;
  tags: Tag[];
}

export interface ChartData {
  category: string;
  amount: number;
  count: number;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: Currency;
  month: string; // Format: YYYY-MM
  spent: number; // Current amount spent in this category for the month
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWarning {
  budgetId: string;
  budgetName: string;
  category: string;
  percentage: number; // Percentage of budget spent
  amount: number;
  budgetAmount: number;
  currency: Currency;
  warningLevel: 'info' | 'warning' | 'danger'; // 50%, 80%, 100%+
}