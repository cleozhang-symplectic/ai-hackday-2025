import { expenseService } from './expenseService';
import { currencyService } from './currencyService';
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