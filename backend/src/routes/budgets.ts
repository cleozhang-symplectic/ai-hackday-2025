import { Router, Request, Response } from 'express';
import { budgetService } from '../services/budgetService';

export const budgetRouter = Router();

// GET /api/budgets - Get all budgets
budgetRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { month } = req.query;
    
    if (month && typeof month === 'string') {
      const budgets = await budgetService.getBudgetsByMonth(month);
      res.json(budgets);
    } else {
      const budgets = await budgetService.getAllBudgets();
      res.json(budgets);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// GET /api/budgets/:id - Get budget by ID
budgetRouter.get('/:id', (req: Request, res: Response) => {
  const budget = budgetService.getBudgetById(req.params.id);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  res.json(budget);
});

// POST /api/budgets - Create new budget
budgetRouter.post('/', async (req: Request, res: Response) => {
  const { name, category, amount, currency, month } = req.body;
  
  if (!name || !category || !amount || !month) {
    return res.status(400).json({ error: 'Missing required fields: name, category, amount, month' });
  }

  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
  }

  try {
    const newBudget = await budgetService.createBudget({
      name,
      category,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      month
    });

    res.status(201).json(newBudget);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// PUT /api/budgets/:id - Update budget
budgetRouter.put('/:id', (req: Request, res: Response) => {
  const { name, category, amount, currency, month } = req.body;
  
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (category !== undefined) updates.category = category;
  if (amount !== undefined) updates.amount = parseFloat(amount);
  if (currency !== undefined) updates.currency = currency;
  if (month !== undefined) {
    // Validate month format if provided
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
    }
    updates.month = month;
  }

  const updatedBudget = budgetService.updateBudget(req.params.id, updates);
  if (!updatedBudget) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  res.json(updatedBudget);
});

// DELETE /api/budgets/:id - Delete budget
budgetRouter.delete('/:id', (req: Request, res: Response) => {
  const success = budgetService.deleteBudget(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Budget not found' });
  }

  res.status(204).send();
});

// GET /api/budgets/warnings/:month - Get budget warnings for a specific month
budgetRouter.get('/warnings/:month', async (req: Request, res: Response) => {
  const { month } = req.params;
  
  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
  }

  try {
    const warnings = await budgetService.getBudgetWarnings(month);
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget warnings' });
  }
});

// GET /api/budgets/warnings - Get current month's budget warnings
budgetRouter.get('/warnings', async (req: Request, res: Response) => {
  try {
    const warnings = await budgetService.getCurrentMonthWarnings();
    res.json(warnings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget warnings' });
  }
});

// GET /api/budgets/summary/:month - Get budget summary for a specific month
budgetRouter.get('/summary/:month', async (req: Request, res: Response) => {
  const { month } = req.params;
  
  // Validate month format (YYYY-MM)
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(month)) {
    return res.status(400).json({ error: 'Month must be in YYYY-MM format' });
  }

  try {
    const summary = await budgetService.getBudgetSummary(month);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
});

// GET /api/budgets/summary - Get overall budget summary
budgetRouter.get('/summary', async (req: Request, res: Response) => {
  try {
    const summary = await budgetService.getBudgetSummary();
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
});

// GET /api/budgets/categories - Get available categories
budgetRouter.get('/categories', (req: Request, res: Response) => {
  const categories = budgetService.getAvailableCategories();
  res.json(categories);
});

// POST /api/budgets/refresh - Refresh spent amounts for all budgets
budgetRouter.post('/refresh', async (req: Request, res: Response) => {
  try {
    await budgetService.updateAllSpentAmounts();
    res.json({ message: 'Budget spent amounts refreshed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to refresh budget amounts' });
  }
});