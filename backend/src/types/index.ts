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