export type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray';

export interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
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