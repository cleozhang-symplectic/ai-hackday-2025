import { Router, Request, Response } from 'express';
import { expenseService } from '../services/expenseService';

export const expenseRouter = Router();

// GET /api/expenses - Get all expenses
expenseRouter.get('/', (req: Request, res: Response) => {
  const expenses = expenseService.getAllExpenses();
  res.json(expenses);
});

// GET /api/expenses/:id - Get expense by ID
expenseRouter.get('/:id', (req: Request, res: Response) => {
  const expense = expenseService.getExpenseById(req.params.id);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

// POST /api/expenses - Create new expense
expenseRouter.post('/', (req: Request, res: Response) => {
  const { title, amount, currency, category, date, description, tags } = req.body;
  
  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newExpense = expenseService.createExpense({
      title,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      category,
      date,
      description,
      tags: tags || []
    });

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT /api/expenses/:id - Update expense
expenseRouter.put('/:id', (req: Request, res: Response) => {
  const { title, amount, currency, category, date, description, tags } = req.body;
  
  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (amount !== undefined) updates.amount = parseFloat(amount);
  if (currency !== undefined) updates.currency = currency;
  if (category !== undefined) updates.category = category;
  if (date !== undefined) updates.date = date;
  if (description !== undefined) updates.description = description;
  if (tags !== undefined) updates.tags = tags;

  const updatedExpense = expenseService.updateExpense(req.params.id, updates);
  if (!updatedExpense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json(updatedExpense);
});

// DELETE /api/expenses/:id - Delete expense
expenseRouter.delete('/:id', (req: Request, res: Response) => {
  const success = expenseService.deleteExpense(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.status(204).send();
});