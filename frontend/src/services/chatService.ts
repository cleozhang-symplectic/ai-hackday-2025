import axios from 'axios';

const API_BASE_URL = '/api/chat';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatStatus {
  ready: boolean;
  tools: Array<{
    name: string;
    description: string;
  }>;
}

class ChatService {
  async sendMessage(message: string): Promise<string> {
    const response = await axios.post(`${API_BASE_URL}/message`, {
      message
    });
    return response.data.response;
  }

  async getStatus(): Promise<ChatStatus> {
    const response = await axios.get(`${API_BASE_URL}/status`);
    return response.data;
  }

  async clearContext(): Promise<void> {
    await axios.post(`${API_BASE_URL}/clear`);
  }

  // Format a message for display
  formatMessage(content: string): string {
    // Convert markdown-style formatting to HTML-like formatting for display
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // Generate suggestions based on context
  getSuggestions(): string[] {
    return [
      "Add a $15 lunch expense",
      "Show me my recent expenses",
      "What's my spending summary?",
      "Convert $100 to EUR",
      "List my food expenses",
      "How much did I spend this month?"
    ];
  }

  // Parse user input for quick actions
  getQuickActions(input: string): Array<{action: string; label: string}> {
    const actions = [];
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('add') || lowerInput.includes('spent')) {
      actions.push({ action: 'add_expense', label: 'Add Expense' });
    }
    
    if (lowerInput.includes('show') || lowerInput.includes('list')) {
      actions.push({ action: 'list_expenses', label: 'View Expenses' });
    }
    
    if (lowerInput.includes('summary') || lowerInput.includes('total')) {
      actions.push({ action: 'summary', label: 'Get Summary' });
    }

    return actions;
  }

  // Create a unique message ID
  generateMessageId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

export const chatService = new ChatService();