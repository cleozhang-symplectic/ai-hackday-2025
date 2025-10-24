import { Router, Request, Response } from 'express';
import { ChartData } from '../types';

export const chartRouter = Router();

// Mock function to calculate chart data from expenses
function getChartData(): ChartData[] {
  // In a real app, this would query the database
  const mockData: ChartData[] = [
    { category: 'Food', amount: 125.50, count: 3 },
    { category: 'Transportation', amount: 95.00, count: 2 },
    { category: 'Entertainment', amount: 60.00, count: 1 },
    { category: 'Utilities', amount: 150.00, count: 1 }
  ];
  
  return mockData;
}

// GET /api/charts/category - Get expenses grouped by category
chartRouter.get('/category', (req: Request, res: Response) => {
  const chartData = getChartData();
  res.json(chartData);
});

// GET /api/charts/monthly - Get monthly spending data
chartRouter.get('/monthly', (req: Request, res: Response) => {
  // Mock monthly data
  const monthlyData = [
    { month: '2024-01', amount: 430.50 },
    { month: '2024-02', amount: 385.25 },
    { month: '2024-03', amount: 512.75 }
  ];
  
  res.json(monthlyData);
});