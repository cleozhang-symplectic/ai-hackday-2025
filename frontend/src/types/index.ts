export type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'SGD' | 'HKD' | 'NZD';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: string;
}

export interface UserSettings {
  mainCurrency: Currency;
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

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
];