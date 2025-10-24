import { expenseService } from './expenseService';
import { currencyService } from './currencyService';
import { budgetService } from './budgetService';
import { Currency } from '../types';

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

class MCPClientWrapper {
  private isInitialized = true; // Always ready since we're using direct function calls
  private tools: MCPTool[] = [
    {
      name: 'add_expense',
      description: 'Add a new expense to the tracker',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Title or name of the expense' },
          amount: { type: 'number', description: 'Amount spent (numeric value)' },
          currency: { type: 'string', description: 'Currency code (defaults to USD)', default: 'USD' },
          category: { type: 'string', description: 'Expense category' },
          date: { type: 'string', description: 'Date of expense (YYYY-MM-DD format, defaults to today)' },
          description: { type: 'string', description: 'Optional detailed description of the expense' }
        },
        required: ['title', 'amount', 'category']
      }
    },
    {
      name: 'list_expenses',
      description: 'List expenses with optional filtering',
      inputSchema: {
        type: 'object',
        properties: {
          category: { type: 'string', description: 'Filter by category' },
          limit: { type: 'number', description: 'Maximum number of expenses to return (default: 10)', default: 10 },
          search: { type: 'string', description: 'Search in title and description' },
          startDate: { type: 'string', description: 'Start date for date range filter (YYYY-MM-DD)' },
          endDate: { type: 'string', description: 'End date for date range filter (YYYY-MM-DD)' }
        }
      }
    },
    {
      name: 'get_expense',
      description: 'Get details of a specific expense by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Expense ID' } },
        required: ['id']
      }
    },
    {
      name: 'update_expense',
      description: 'Update an existing expense',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Expense ID to update' },
          title: { type: 'string', description: 'New title (optional)' },
          amount: { type: 'number', description: 'New amount (optional)' },
          currency: { type: 'string', description: 'New currency (optional)' },
          category: { type: 'string', description: 'New category (optional)' },
          date: { type: 'string', description: 'New date (optional)' },
          description: { type: 'string', description: 'New description (optional)' }
        },
        required: ['id']
      }
    },
    {
      name: 'delete_expense',
      description: 'Delete an expense by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Expense ID to delete' } },
        required: ['id']
      }
    },
    {
      name: 'get_spending_summary',
      description: 'Get spending analytics and summary',
      inputSchema: {
        type: 'object',
        properties: {
          convertToCurrency: { type: 'string', description: 'Currency to convert all amounts to (optional)', default: 'USD' }
        }
      }
    },
    {
      name: 'convert_currency',
      description: 'Convert an amount from one currency to another',
      inputSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'Amount to convert' },
          from: { type: 'string', description: 'Source currency' },
          to: { type: 'string', description: 'Target currency' }
        },
        required: ['amount', 'from', 'to']
      }
    },
    {
      name: 'create_budget',
      description: 'Create a new monthly budget for a category',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Budget name (e.g., "Monthly Groceries")' },
          category: { type: 'string', description: 'Budget category (e.g., "Food", "Transportation", "Entertainment")' },
          amount: { type: 'number', description: 'Budget amount (numeric value)' },
          currency: { type: 'string', description: 'Currency code (defaults to USD)', default: 'USD' },
          month: { type: 'string', description: 'Month in YYYY-MM format (defaults to current month)' }
        },
        required: ['name', 'category', 'amount']
      }
    },
    {
      name: 'list_budgets',
      description: 'List budgets with optional month filtering',
      inputSchema: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Filter by month (YYYY-MM format, optional)' }
        }
      }
    },
    {
      name: 'get_budget',
      description: 'Get details of a specific budget by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Budget ID' } },
        required: ['id']
      }
    },
    {
      name: 'update_budget',
      description: 'Update an existing budget',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Budget ID to update' },
          name: { type: 'string', description: 'New budget name (optional)' },
          category: { type: 'string', description: 'New category (optional)' },
          amount: { type: 'number', description: 'New budget amount (optional)' },
          currency: { type: 'string', description: 'New currency (optional)' },
          month: { type: 'string', description: 'New month in YYYY-MM format (optional)' }
        },
        required: ['id']
      }
    },
    {
      name: 'delete_budget',
      description: 'Delete a budget by ID',
      inputSchema: {
        type: 'object',
        properties: { id: { type: 'string', description: 'Budget ID to delete' } },
        required: ['id']
      }
    },
    {
      name: 'get_budget_warnings',
      description: 'Get budget warnings for overspending or approaching limits',
      inputSchema: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Month to check (YYYY-MM format, defaults to current month)' }
        }
      }
    },
    {
      name: 'get_budget_summary',
      description: 'Get budget summary and analytics',
      inputSchema: {
        type: 'object',
        properties: {
          month: { type: 'string', description: 'Month for summary (YYYY-MM format, optional for overall summary)' }
        }
      }
    },
    {
      name: 'refresh_budget_amounts',
      description: 'Refresh spent amounts for all budgets based on current expenses',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  constructor() {
    console.log('MCP Client initialized with direct function calls');
  }

  async callTool(toolName: string, args: any = {}): Promise<any> {
    try {
      switch (toolName) {
        case 'add_expense':
          return await this.handleAddExpense(args);
        case 'list_expenses':
          return await this.handleListExpenses(args);
        case 'get_expense':
          return await this.handleGetExpense(args);
        case 'update_expense':
          return await this.handleUpdateExpense(args);
        case 'delete_expense':
          return await this.handleDeleteExpense(args);
        case 'get_spending_summary':
          return await this.handleGetSpendingSummary(args);
        case 'convert_currency':
          return await this.handleConvertCurrency(args);
        case 'create_budget':
          return await this.handleCreateBudget(args);
        case 'list_budgets':
          return await this.handleListBudgets(args);
        case 'get_budget':
          return await this.handleGetBudget(args);
        case 'update_budget':
          return await this.handleUpdateBudget(args);
        case 'delete_budget':
          return await this.handleDeleteBudget(args);
        case 'get_budget_warnings':
          return await this.handleGetBudgetWarnings(args);
        case 'get_budget_summary':
          return await this.handleGetBudgetSummary(args);
        case 'refresh_budget_amounts':
          return await this.handleRefreshBudgetAmounts(args);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleAddExpense(args: any) {
    const { title, amount, currency = 'USD', category, date, description } = args;

    if (!title || !amount || !category) {
      throw new Error('Missing required fields: title, amount, and category are required');
    }

    const expenseDate = date || new Date().toISOString().split('T')[0];

    const newExpense = expenseService.createExpense({
      title,
      amount: parseFloat(amount),
      currency: currency as Currency,
      category,
      date: expenseDate,
      description: description || '',
      tags: []
    });

    return {
      content: [
        {
          type: 'text',
          text: `✅ Expense added successfully!\n\n**${newExpense.title}**\n- Amount: ${newExpense.currency} ${newExpense.amount}\n- Category: ${newExpense.category}\n- Date: ${newExpense.date}\n- ID: ${newExpense.id}${newExpense.description ? `\n- Description: ${newExpense.description}` : ''}`,
        },
      ],
    };
  }

  private async handleListExpenses(args: any) {
    const { category, limit = 10, search, startDate, endDate } = args;

    let expenses = expenseService.getAllExpenses();

    // Apply filters
    if (category) {
      expenses = expenseService.getExpensesByCategory(category);
    }

    if (startDate && endDate) {
      expenses = expenseService.getExpensesByDateRange(startDate, endDate);
    }

    if (search) {
      expenses = expenseService.searchExpenses(search);
    }

    // Sort by date (most recent first) and limit
    expenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    if (expenses.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No expenses found matching your criteria.',
          },
        ],
      };
    }

    const expenseList = expenses.map(expense => 
      `• **${expense.title}** - ${expense.currency} ${expense.amount} (${expense.category}) - ${expense.date}${expense.description ? ` - ${expense.description}` : ''}`
    ).join('\n');

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      content: [
        {
          type: 'text',
          text: `📋 **Found ${expenses.length} expenses:**\n\n${expenseList}\n\n**Total shown:** ~${Math.round(totalAmount * 100) / 100} (mixed currencies)`,
        },
      ],
    };
  }

  private async handleGetExpense(args: any) {
    const { id } = args;

    const expense = expenseService.getExpenseById(id);
    if (!expense) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    const tags = expense.tags && expense.tags.length > 0 
      ? expense.tags.map(tag => tag.name).join(', ')
      : 'None';

    return {
      content: [
        {
          type: 'text',
          text: `💰 **Expense Details:**\n\n**${expense.title}**\n- ID: ${expense.id}\n- Amount: ${expense.currency} ${expense.amount}\n- Category: ${expense.category}\n- Date: ${expense.date}\n- Description: ${expense.description || 'None'}\n- Tags: ${tags}`,
        },
      ],
    };
  }

  private async handleUpdateExpense(args: any) {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error('No updates provided');
    }

    const updatedExpense = expenseService.updateExpense(id, cleanUpdates);
    if (!updatedExpense) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ Expense updated successfully!\n\n**${updatedExpense.title}**\n- Amount: ${updatedExpense.currency} ${updatedExpense.amount}\n- Category: ${updatedExpense.category}\n- Date: ${updatedExpense.date}\n- ID: ${updatedExpense.id}`,
        },
      ],
    };
  }

  private async handleDeleteExpense(args: any) {
    const { id } = args;

    const expense = expenseService.getExpenseById(id);
    if (!expense) {
      throw new Error(`Expense with ID ${id} not found`);
    }

    const success = expenseService.deleteExpense(id);
    if (!success) {
      throw new Error(`Failed to delete expense with ID ${id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `🗑️ Expense deleted successfully!\n\nDeleted: **${expense.title}** (${expense.currency} ${expense.amount})`,
        },
      ],
    };
  }

  private async handleGetSpendingSummary(args: any) {
    const { convertToCurrency = 'USD' } = args;

    const summary = expenseService.getSpendingSummary();
    
    let totalConverted = summary.totalAmount;
    let averageConverted = summary.averageAmount;
    
    if (convertToCurrency !== 'USD') {
      try {
        totalConverted = await currencyService.convertAmount(summary.totalAmount, 'USD', convertToCurrency as Currency);
        averageConverted = await currencyService.convertAmount(summary.averageAmount, 'USD', convertToCurrency as Currency);
      } catch (error) {
        // If conversion fails, continue with original amounts
      }
    }

    const categoryDetails = summary.categorySummary
      .sort((a, b) => b.total - a.total)
      .map(cat => `  • ${cat.category}: ${cat.count} expenses, ${convertToCurrency} ${Math.round(cat.total * 100) / 100}`)
      .join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `📊 **Spending Summary:**\n\n**Overview:**\n- Total Expenses: ${summary.totalExpenses}\n- Total Amount: ${convertToCurrency} ${Math.round(totalConverted * 100) / 100}\n- Average per Expense: ${convertToCurrency} ${Math.round(averageConverted * 100) / 100}\n\n**By Category:**\n${categoryDetails}`,
        },
      ],
    };
  }

  private async handleConvertCurrency(args: any) {
    const { amount, from, to } = args;

    try {
      const convertedAmount = await currencyService.convertAmount(amount, from as Currency, to as Currency);
      const rate = await currencyService.getExchangeRate(from as Currency, to as Currency);

      return {
        content: [
          {
            type: 'text',
            text: `💱 **Currency Conversion:**\n\n${from} ${amount} = ${to} ${Math.round(convertedAmount * 100) / 100}\n\nExchange rate: 1 ${from} = ${Math.round(rate * 10000) / 10000} ${to}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Currency conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCreateBudget(args: any) {
    const { name, category, amount, currency = 'USD', month } = args;

    if (!name || !category || !amount) {
      throw new Error('Missing required fields: name, category, and amount are required');
    }

    const budgetMonth = month || (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    })();

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(budgetMonth)) {
      throw new Error('Month must be in YYYY-MM format');
    }

    const newBudget = await budgetService.createBudget({
      name,
      category,
      amount: parseFloat(amount),
      currency: currency as Currency,
      month: budgetMonth
    });

    return {
      content: [
        {
          type: 'text',
          text: `🎯 **Budget created successfully!**\n\n**${newBudget.name}**\n- Category: ${newBudget.category}\n- Amount: ${newBudget.currency} ${newBudget.amount}\n- Month: ${new Date(newBudget.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}\n- Current Spent: ${newBudget.currency} ${newBudget.spent}\n- Remaining: ${newBudget.currency} ${(newBudget.amount - newBudget.spent).toFixed(2)}\n- ID: ${newBudget.id}`,
        },
      ],
    };
  }

  private async handleListBudgets(args: any) {
    const { month } = args;

    const budgets = month ? await budgetService.getBudgetsByMonth(month) : await budgetService.getAllBudgets();

    if (budgets.length === 0) {
      const monthText = month ? ` for ${new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : '';
      return {
        content: [
          {
            type: 'text',
            text: `No budgets found${monthText}.`,
          },
        ],
      };
    }

    const budgetList = budgets.map(budget => {
      const utilization = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
      const statusEmoji = utilization >= 100 ? '🚨' : utilization >= 80 ? '⚠️' : utilization >= 50 ? '💡' : '✅';
      return `${statusEmoji} **${budget.name}** (${budget.category})\n  Budget: ${budget.currency} ${budget.amount} | Spent: ${budget.currency} ${budget.spent} (${utilization}%)`;
    }).join('\n\n');

    const monthText = month ? ` for ${new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : '';

    return {
      content: [
        {
          type: 'text',
          text: `🎯 **Budgets${monthText}:**\n\n${budgetList}`,
        },
      ],
    };
  }

  private async handleGetBudget(args: any) {
    const { id } = args;

    const budget = budgetService.getBudgetById(id);
    if (!budget) {
      throw new Error(`Budget with ID ${id} not found`);
    }

    const utilization = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
    const remaining = budget.amount - budget.spent;
    const statusEmoji = utilization >= 100 ? '🚨' : utilization >= 80 ? '⚠️' : utilization >= 50 ? '💡' : '✅';

    return {
      content: [
        {
          type: 'text',
          text: `${statusEmoji} **Budget Details:**\n\n**${budget.name}**\n- ID: ${budget.id}\n- Category: ${budget.category}\n- Budget Amount: ${budget.currency} ${budget.amount}\n- Spent: ${budget.currency} ${budget.spent}\n- Remaining: ${budget.currency} ${remaining.toFixed(2)}\n- Utilization: ${utilization}%\n- Month: ${new Date(budget.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}\n- Created: ${new Date(budget.createdAt).toLocaleDateString()}\n- Updated: ${new Date(budget.updatedAt).toLocaleDateString()}`,
        },
      ],
    };
  }

  private async handleUpdateBudget(args: any) {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error('No updates provided');
    }

    // Validate month format if provided
    if (cleanUpdates.month) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (typeof cleanUpdates.month === 'string' && !monthRegex.test(cleanUpdates.month)) {
        throw new Error('Month must be in YYYY-MM format');
      }
    }

    const updatedBudget = budgetService.updateBudget(id, cleanUpdates);
    if (!updatedBudget) {
      throw new Error(`Budget with ID ${id} not found`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `✅ **Budget updated successfully!**\n\n**${updatedBudget.name}**\n- Category: ${updatedBudget.category}\n- Amount: ${updatedBudget.currency} ${updatedBudget.amount}\n- Month: ${new Date(updatedBudget.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}\n- Current Spent: ${updatedBudget.currency} ${updatedBudget.spent}\n- ID: ${updatedBudget.id}`,
        },
      ],
    };
  }

  private async handleDeleteBudget(args: any) {
    const { id } = args;

    const budget = budgetService.getBudgetById(id);
    if (!budget) {
      throw new Error(`Budget with ID ${id} not found`);
    }

    const success = budgetService.deleteBudget(id);
    if (!success) {
      throw new Error(`Failed to delete budget with ID ${id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: `🗑️ **Budget deleted successfully!**\n\nDeleted: **${budget.name}** (${budget.currency} ${budget.amount})`,
        },
      ],
    };
  }

  private async handleGetBudgetWarnings(args: any) {
    const { month } = args;

    const warnings = month ? await budgetService.getBudgetWarnings(month) : await budgetService.getCurrentMonthWarnings();

    if (warnings.length === 0) {
      const monthText = month ? ` for ${new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : ' for this month';
      return {
        content: [
          {
            type: 'text',
            text: `✅ **Great job!** No budget warnings${monthText}. All your budgets are within healthy spending limits.`,
          },
        ],
      };
    }

    const warningList = warnings.map(warning => {
      const emoji = warning.warningLevel === 'danger' ? '🚨' : warning.warningLevel === 'warning' ? '⚠️' : '💡';
      const message = warning.percentage >= 100 
        ? `You've exceeded your budget by ${warning.currency} ${(warning.amount - warning.budgetAmount).toFixed(2)}`
        : warning.percentage >= 80
        ? `You're approaching your budget limit (${Math.round(warning.percentage)}% used)`
        : `You've used ${Math.round(warning.percentage)}% of your budget`;
      
      return `${emoji} **${warning.budgetName}** (${warning.category})\n  ${message}\n  Spent: ${warning.currency} ${warning.amount} / Budget: ${warning.currency} ${warning.budgetAmount}`;
    }).join('\n\n');

    const monthText = month ? ` for ${new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : ' for this month';

    return {
      content: [
        {
          type: 'text',
          text: `⚠️ **Budget Alerts${monthText}:**\n\n${warningList}`,
        },
      ],
    };
  }

  private async handleGetBudgetSummary(args: any) {
    const { month } = args;

    const summary = await budgetService.getBudgetSummary(month);

    const categoryDetails = summary.categoryBreakdown
      .sort((a, b) => b.utilization - a.utilization)
      .map(cat => {
        const emoji = cat.utilization >= 100 ? '🚨' : cat.utilization >= 80 ? '⚠️' : cat.utilization >= 50 ? '💡' : '✅';
        return `  ${emoji} ${cat.category}: ${cat.budgetCount} budget(s), ${cat.utilization.toFixed(1)}% utilization`;
      })
      .join('\n');

    const monthText = month ? ` for ${new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` : '';
    const overallEmoji = summary.averageUtilization >= 100 ? '🚨' : summary.averageUtilization >= 80 ? '⚠️' : summary.averageUtilization >= 50 ? '💡' : '✅';

    return {
      content: [
        {
          type: 'text',
          text: `${overallEmoji} **Budget Summary${monthText}:**\n\n**Overview:**\n- Total Budgets: ${summary.totalBudgets}\n- Total Budget Amount: $${summary.totalBudgetAmount}\n- Total Spent: $${summary.totalSpent}\n- Remaining: $${summary.remainingAmount}\n- Average Utilization: ${summary.averageUtilization.toFixed(1)}%\n\n**By Category:**\n${categoryDetails}`,
        },
      ],
    };
  }

  private async handleRefreshBudgetAmounts(args: any) {
    try {
      await budgetService.updateAllSpentAmounts();

      return {
        content: [
          {
            type: 'text',
            text: `✅ **Budget amounts refreshed successfully!**\n\nAll budget spent amounts have been recalculated based on your current expenses.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to refresh budget amounts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getAvailableTools(): MCPTool[] {
    return [...this.tools];
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  destroy() {
    // Nothing to clean up in direct mode
  }
}

// Singleton instance
export const mcpClient = new MCPClientWrapper();