import { Router, Request, Response } from 'express';
import { Expense } from '../types';

export const expenseRouter = Router();

// In-memory storage (replace with database in production)
let expenses: Expense[] = [
  {
    id: '1',
    title: 'Groceries',
    amount: 75.50,
    category: 'Food',
    date: '2024-01-15',
    description: 'Weekly grocery shopping',
    tags: [
      { id: 'tag1', name: 'Essential', color: 'green' },
      { id: 'tag2', name: 'Weekly', color: 'blue' }
    ]
  },
  {
    id: '2', 
    title: 'Gas',
    amount: 45.00,
    category: 'Transportation',
    date: '2024-01-14',
    description: 'Fuel for car',
    tags: [
      { id: 'tag1', name: 'Essential', color: 'green' },
      { id: 'tag3', name: 'Vehicle', color: 'red' }
    ]
  }
];

// GET /api/expenses - Get all expenses
expenseRouter.get('/', (req: Request, res: Response) => {
  res.json(expenses);
});

// GET /api/expenses/:id - Get expense by ID
expenseRouter.get('/:id', (req: Request, res: Response) => {
  const expense = expenses.find(e => e.id === req.params.id);
  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(expense);
});

// POST /api/expenses - Create new expense
expenseRouter.post('/', (req: Request, res: Response) => {
  const { title, amount, category, date, description, tags } = req.body;
  
  if (!title || !amount || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newExpense: Expense = {
    id: Date.now().toString(),
    title,
    amount: parseFloat(amount),
    category,
    date,
    description,
    tags: tags || []
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

// PUT /api/expenses/:id - Update expense
expenseRouter.put('/:id', (req: Request, res: Response) => {
  const index = expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const { title, amount, category, date, description, tags } = req.body;
  expenses[index] = {
    ...expenses[index],
    title: title || expenses[index].title,
    amount: amount ? parseFloat(amount) : expenses[index].amount,
    category: category || expenses[index].category,
    date: date || expenses[index].date,
    description: description !== undefined ? description : expenses[index].description,
    tags: tags !== undefined ? tags : expenses[index].tags
  };

  res.json(expenses[index]);
});

// DELETE /api/expenses/:id - Delete expense
expenseRouter.delete('/:id', (req: Request, res: Response) => {
  const index = expenses.findIndex(e => e.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  expenses.splice(index, 1);
  res.status(204).send();
});