import { Router, Request, Response } from 'express';
import { mcpClient } from '../services/mcpClient';

export const chatRouter = Router();

// Simple AI-like response generator
class ChatAssistant {
  private context: string[] = [];

  async processMessage(userMessage: string): Promise<string> {
    this.context.push(`User: ${userMessage}`);
    
    try {
      // Analyze the message to determine intent and extract parameters
      const intent = this.analyzeIntent(userMessage);
      
      let response = '';
      
      switch (intent.action) {
        case 'add_expense':
          response = await this.handleAddExpense(userMessage, intent.params);
          break;
        case 'list_expenses':
          response = await this.handleListExpenses(userMessage, intent.params);
          break;
        case 'get_summary':
          response = await this.handleGetSummary(userMessage);
          break;
        case 'convert_currency':
          response = await this.handleConvertCurrency(userMessage, intent.params);
          break;
        case 'help':
          response = this.getHelpMessage();
          break;
        default:
          response = await this.handleGeneralQuery(userMessage);
      }
      
      this.context.push(`Assistant: ${response}`);
      return response;
      
    } catch (error) {
      const errorMsg = `I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or rephrase your request.`;
      this.context.push(`Assistant: ${errorMsg}`);
      return errorMsg;
    }
  }

  private analyzeIntent(message: string): { action: string; params: any } {
    const msg = message.toLowerCase();
    
    // Add expense patterns
    if (msg.includes('add') || msg.includes('spent') || msg.includes('bought') || msg.includes('paid')) {
      return {
        action: 'add_expense',
        params: this.extractExpenseParams(message)
      };
    }
    
    // List/show expenses patterns
    if (msg.includes('show') || msg.includes('list') || msg.includes('expenses') || msg.includes('what did i')) {
      return {
        action: 'list_expenses',
        params: this.extractListParams(message)
      };
    }
    
    // Summary patterns
    if (msg.includes('summary') || msg.includes('total') || msg.includes('how much') || msg.includes('analytics')) {
      return { action: 'get_summary', params: {} };
    }
    
    // Currency conversion patterns
    if (msg.includes('convert') || (msg.includes('to') && (msg.includes('usd') || msg.includes('eur') || msg.includes('gbp')))) {
      return {
        action: 'convert_currency',
        params: this.extractCurrencyParams(message)
      };
    }
    
    // Help patterns
    if (msg.includes('help') || msg.includes('what can you do') || msg.includes('commands')) {
      return { action: 'help', params: {} };
    }
    
    return { action: 'general', params: {} };
  }

  private extractExpenseParams(message: string): any {
    const params: any = {};
    
    // Extract amount using regex
    const amountMatch = message.match(/\$?(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      params.amount = parseFloat(amountMatch[1]);
    }
    
    // Extract category keywords
    const categories = ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping'];
    for (const category of categories) {
      if (message.toLowerCase().includes(category)) {
        params.category = category.charAt(0).toUpperCase() + category.slice(1);
        break;
      }
    }
    
    // Extract title/description
    const commonWords = ['add', 'spent', 'bought', 'paid', 'for', 'on', 'a', 'an', 'the', '$'];
    const words = message.split(' ').filter(word => 
      !commonWords.includes(word.toLowerCase()) && 
      !/^\d+(\.\d{2})?$/.test(word) &&
      !/^\$\d+(\.\d{2})?$/.test(word)
    );
    
    if (words.length > 0) {
      params.title = words.join(' ').replace(/[^\w\s]/g, '').trim();
    }
    
    // Default values
    if (!params.category) params.category = 'Other';
    if (!params.title) params.title = 'Expense';
    
    return params;
  }

  private extractListParams(message: string): any {
    const params: any = {};
    
    // Extract category filter
    const categories = ['food', 'transportation', 'entertainment', 'utilities', 'healthcare', 'shopping'];
    for (const category of categories) {
      if (message.toLowerCase().includes(category)) {
        params.category = category.charAt(0).toUpperCase() + category.slice(1);
        break;
      }
    }
    
    // Extract limit
    const limitMatch = message.match(/(\d+)\s*(recent|last|latest)/i);
    if (limitMatch) {
      params.limit = parseInt(limitMatch[1]);
    } else {
      params.limit = 5; // Default to 5 recent expenses
    }
    
    return params;
  }

  private extractCurrencyParams(message: string): any {
    const params: any = {};
    
    const amountMatch = message.match(/(\d+(?:\.\d{2})?)/);
    if (amountMatch) {
      params.amount = parseFloat(amountMatch[1]);
    }
    
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const currencyMatches = message.toUpperCase().match(new RegExp(`\\b(${currencies.join('|')})\\b`, 'g'));
    
    if (currencyMatches && currencyMatches.length >= 2) {
      params.from = currencyMatches[0];
      params.to = currencyMatches[1];
    }
    
    return params;
  }

  private async handleAddExpense(message: string, params: any): Promise<string> {
    if (!params.amount) {
      return "I'd be happy to help you add an expense! However, I need to know the amount. Could you tell me how much you spent?";
    }

    try {
      const result = await mcpClient.callTool('add_expense', {
        title: params.title || 'Expense',
        amount: params.amount,
        category: params.category || 'Other',
        description: `Added via chat: ${message}`
      });

      if (result && result.content && result.content[0]) {
        return `✅ ${result.content[0].text}`;
      }
      
      return `✅ Successfully added expense: ${params.title} for $${params.amount} in ${params.category} category.`;
    } catch (error) {
      return `I had trouble adding that expense. ${error instanceof Error ? error.message : 'Please try again.'}`;
    }
  }

  private async handleListExpenses(message: string, params: any): Promise<string> {
    try {
      const result = await mcpClient.callTool('list_expenses', params);
      
      if (result && result.content && result.content[0]) {
        return result.content[0].text;
      }
      
      return "I couldn't retrieve your expenses right now. Please try again.";
    } catch (error) {
      return `I had trouble getting your expenses. ${error instanceof Error ? error.message : 'Please try again.'}`;
    }
  }

  private async handleGetSummary(message: string): Promise<string> {
    try {
      const result = await mcpClient.callTool('get_spending_summary');
      
      if (result && result.content && result.content[0]) {
        return result.content[0].text;
      }
      
      return "I couldn't generate your spending summary right now. Please try again.";
    } catch (error) {
      return `I had trouble getting your spending summary. ${error instanceof Error ? error.message : 'Please try again.'}`;
    }
  }

  private async handleConvertCurrency(message: string, params: any): Promise<string> {
    if (!params.amount || !params.from || !params.to) {
      return "For currency conversion, I need the amount, source currency, and target currency. For example: 'Convert $100 from USD to EUR'";
    }

    try {
      const result = await mcpClient.callTool('convert_currency', params);
      
      if (result && result.content && result.content[0]) {
        return result.content[0].text;
      }
      
      return `I couldn't convert ${params.amount} ${params.from} to ${params.to} right now. Please try again.`;
    } catch (error) {
      return `I had trouble with the currency conversion. ${error instanceof Error ? error.message : 'Please try again.'}`;
    }
  }

  private async handleGeneralQuery(message: string): Promise<string> {
    // Try to be helpful with general queries
    if (message.toLowerCase().includes('expense')) {
      return "I can help you manage your expenses! Try saying things like:\n• 'Add a $15 lunch expense'\n• 'Show me my recent expenses'\n• 'What's my spending summary?'\n• 'Convert $100 to EUR'";
    }
    
    return "I'm your expense tracking assistant! I can help you add expenses, view your spending history, get summaries, and convert currencies. What would you like to do?";
  }

  private getHelpMessage(): string {
    return `🤖 **Expense Tracker Assistant**

I can help you with:

**Adding Expenses:**
• "Add a $12 lunch expense"
• "I spent $25 on transportation"
• "Bought coffee for $4.50"

**Viewing Expenses:**
• "Show me my recent expenses"
• "List my food expenses"
• "What did I spend on entertainment?"

**Analytics:**
• "Give me a spending summary"
• "How much did I spend total?"
• "Show me my expense breakdown"

**Currency Conversion:**
• "Convert $100 to EUR"
• "How much is 50 GBP in USD?"

Just ask me naturally - I'll understand what you want to do!`;
  }

  getContext(): string[] {
    return [...this.context];
  }

  clearContext(): void {
    this.context = [];
  }
}

const chatAssistant = new ChatAssistant();

// POST /api/chat/message - Send a message to the chat assistant
chatRouter.post('/message', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!mcpClient.isReady()) {
      return res.status(503).json({ 
        error: 'Chat assistant is not ready yet. Please wait a moment and try again.' 
      });
    }

    const response = await chatAssistant.processMessage(message);
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'I encountered an error processing your message. Please try again.' 
    });
  }
});

// GET /api/chat/status - Get chat assistant status
chatRouter.get('/status', (req: Request, res: Response) => {
  res.json({
    ready: mcpClient.isReady(),
    tools: mcpClient.getAvailableTools().map(tool => ({
      name: tool.name,
      description: tool.description
    }))
  });
});

// POST /api/chat/clear - Clear conversation context
chatRouter.post('/clear', (req: Request, res: Response) => {
  chatAssistant.clearContext();
  res.json({ message: 'Conversation cleared' });
});

// GET /api/chat/context - Get conversation context (for debugging)
chatRouter.get('/context', (req: Request, res: Response) => {
  res.json({ context: chatAssistant.getContext() });
});