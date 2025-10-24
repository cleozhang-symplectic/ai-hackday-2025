# Expense Tracker

A full-stack expense tracking application built with Node.js, Express, React, and TypeScript.

## Features

### 💰 Expense Management
- ✅ **Real-time CRUD operations** - add, edit, delete expenses with instant updates
- ✅ **Advanced filtering system** - filter by amount ranges, categories, dates, and tags
- ✅ **Comprehensive tagging** - custom tags with 8 color options for better organization
- ✅ **Flexible sorting** - sort by date, amount, title, or category with visual indicators
- ✅ **CSV export functionality** - export all expense data with automatic filename generation
<img width="1893" height="976" alt="image" src="https://github.com/user-attachments/assets/ec3e0afb-81c8-4cf2-8b63-107fcfc8cfb9" />

### 🎯 Budget Management (NEW!)
- ✅ **Monthly budget tracking** with category-based budgets and real-time spent calculations
- ✅ **Smart budget warnings** at 50%, 80%, and 100% thresholds with automatic alerts
- ✅ **Multi-currency support** with automatic conversion and analytics
- ✅ **AI chatbot integration** - create, update, and track budgets via natural language
- ✅ **Budget dashboard** with utilization analytics and responsive mobile interface
<img width="1870" height="989" alt="image" src="https://github.com/user-attachments/assets/aac46fa7-fbd9-468f-9715-0408e5633c24" />

### 📊 Analytics
- ✅ **Interactive charts** powered by Chart.js with spending by category and monthly trends
- ✅ **Key statistics overview** with currency-aware spending calculations
- ✅ **Tag distribution analytics** with visual doughnut charts
- ✅ **Budget utilization tracking** with progress indicators and warnings
- ✅ **Real-time data updates** reflecting all expense and budget changes
<img width="1859" height="968" alt="image" src="https://github.com/user-attachments/assets/a286eeaa-7511-4198-b413-6042cefe19c1" />

### 💱 Multi-Currency
- ✅ **15+ major currencies** supported (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, etc.)
- ✅ **Real-time exchange rates** with automatic fetching from external APIs
- ✅ **Offline fallback rates** for reliability when internet is unavailable
- ✅ **Currency settings modal** with easy configuration and real-time updates
<img width="1409" height="852" alt="image" src="https://github.com/user-attachments/assets/a1dd96fe-3f21-4119-8fa8-fc9d73d19c28" />

### 🤖 AI Chat Assistant
- ✅ **Natural language processing** - "Add a $15 lunch expense" or "Create a $500 food budget"
- ✅ **Smart conversation interface** with real-time data sync and message history
- ✅ **Mobile-responsive chat UI** with floating chat button and voice-like interactions
- ✅ **AI-powered analytics** - get spending summaries, budget warnings, and currency conversion
- ✅ **Seamless integration** - no complex forms needed, just natural conversation
<img width="1875" height="972" alt="image" src="https://github.com/user-attachments/assets/9cb04347-14c2-4eec-97fb-f3c588d86533" />

## Project Structure

```
expense-tracker/
├── backend/                 # Express server
│   ├── src/
│   │   ├── types/          # TypeScript type definitions
│   │   ├── routes/         # API route handlers
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main app component
│   ├── package.json
│   └── tsconfig.json
└── package.json           # Root package.json with scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Optional: AI assistant that supports MCP (Claude Desktop, etc.)

### Installation

1. **Install all dependencies**
   ```bash
   npm run install:all
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both the backend server on `http://localhost:3001` and the frontend on `http://localhost:3000`.

### 🚀 Quick Start with AI Assistant

To start managing expenses with an AI assistant:

1. **Start the MCP server:**
   ```bash
   npm run mcp
   ```

2. **Connect your AI assistant** using the configuration in `mcp-config-dev.json`

3. **Start talking to your AI:**
   - "Add a $15 lunch expense"
   - "Show me this month's spending"
   - "What's my biggest expense category?"

### Individual Commands

**Backend only:**
```bash
npm run dev:backend
```

**Frontend only:**
```bash
npm run dev:frontend
```

**Build for production:**
```bash
npm run build
```

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets (NEW!)
- `GET /api/budgets` - Get all budgets (optional ?month=YYYY-MM filter)
- `GET /api/budgets/:id` - Get budget by ID
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/warnings` - Get current month's budget warnings
- `GET /api/budgets/warnings/:month` - Get budget warnings for specific month
- `GET /api/budgets/summary` - Get overall budget summary
- `GET /api/budgets/summary/:month` - Get budget summary for specific month
- `GET /api/budgets/categories` - Get all available expense categories
- `POST /api/budgets/refresh` - Refresh spent amounts for all budgets

### Charts
- `GET /api/charts/category` - Get expenses grouped by category
- `GET /api/charts/monthly` - Get monthly spending data

### Currency
- `GET /api/currency/rates` - Get current exchange rates
- `GET /api/currency/rates/:baseCurrency` - Get rates for specific base currency

### Health Check
- `GET /api/health` - Server health status

## Data Model

### Expense
```typescript
interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: Currency;
  category: string;
  date: string;
  description?: string;
  tags: Tag[];
}
```

### Budget (NEW!)
```typescript
interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: Currency;
  month: string; // Format: YYYY-MM
  spent: number; // Current amount spent in this category for the month
  createdAt: string;
  updatedAt: string;
}
```

### Budget Warning (NEW!)
```typescript
interface BudgetWarning {
  budgetId: string;
  budgetName: string;
  category: string;
  percentage: number; // Percentage of budget spent
  amount: number;
  budgetAmount: number;
  currency: Currency;
  warningLevel: 'info' | 'warning' | 'danger'; // 50%, 80%, 100%+
}
```

### Tag
```typescript
interface Tag {
  id: string;
  name: string;
  color: TagColor;
}

type TagColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'indigo' | 'gray';
```

### Currency Support
```typescript
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | 'SGD' | 'HKD' | 'NZD';
```

## Development

### Backend Development
The backend uses `ts-node-dev` for hot reloading during development. Any changes to TypeScript files will automatically restart the server.

### Frontend Development
The frontend uses Vite for fast development builds and hot module replacement.

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Shared Types**: Update type definitions in both `backend/src/types/` and `frontend/src/types/`

## Key Features

### 💱 Multi-Currency Support
- Support for 15+ major currencies (USD, EUR, GBP, JPY, etc.)
- Real-time exchange rate fetching from external API
- Offline fallback rates for reliability  
- Automatic currency conversion for all expenses
- Currency settings configuration modal
- Real-time updates when main currency changes

### 🔄 Flexible Sorting System
- Sort expenses by date (newest/oldest first)
- Sort by amount (highest/lowest first)
- Sort by title (A-Z or Z-A)
- Sort by category (alphabetical)
- Inline sorting controls with visual indicators

### 🏷️ Advanced Tagging System
- Create custom tags with 8 color options
- Tag-based filtering and search
- Visual tag distribution analytics
- Collapsible tag selector in forms

### 📊 Analytics Dashboard
- Interactive charts powered by Chart.js
- Currency-aware spending calculations
- Spending by category (bar chart)
- Monthly spending trends (line chart)
- Tag distribution (doughnut chart)
- Key statistics overview with converted amounts

### 🔍 Advanced Filtering
- Filter by amount ranges (under $50, $50-$100, over $100)
- Category-based filtering
- Date range filtering
- Tag-based filtering
- Inline filter controls
- Combined filter support

### 📥 Data Export
- Export all expense data to CSV format
- Automatic filename with current date
- Includes all fields: date, description, amount, category, tags

### 📱 Responsive Design
- Mobile-first approach
- Collapsible navigation on mobile
- Optimized chart displays
- Touch-friendly interface

## 🤖 MCP Server Integration

The expense tracker now includes a **Model Context Protocol (MCP) server** that allows AI assistants to interact with your expenses through natural language. This enables you to manage expenses by talking to AI agents like Claude, ChatGPT, or other MCP-compatible assistants.

### What is MCP?

The Model Context Protocol (MCP) is a standard that allows AI assistants to safely interact with external tools and data sources. With the MCP server, you can:

- ✅ Add expenses through natural conversation
- ✅ View and search your expense history  
- ✅ Get spending analytics and summaries
- ✅ Update or delete existing expenses
- ✅ Convert between currencies
- ✅ Filter expenses by category, date, or amount

### Starting the MCP Server

There are several ways to run the MCP server:

**Development Mode (with hot reload):**
```bash
npm run mcp
```

**Production Mode:**
```bash
# First build the project
npm run build
cd backend && npm run start:mcp
```

**Direct execution:**
```bash
cd backend && npx tsx src/mcp-server.ts
```

### Available MCP Tools

The MCP server exposes the following tools for AI assistants:

#### 📝 `add_expense`
Add a new expense to the tracker
- **Required**: title, amount, category
- **Optional**: currency (defaults to USD), date (defaults to today), description

#### 📋 `list_expenses` 
List expenses with optional filtering
- **Options**: category filter, limit (default 10), search text, date range

#### 🔍 `get_expense`
Get details of a specific expense by ID
- **Required**: expense ID

#### ✏️ `update_expense`
Update an existing expense
- **Required**: expense ID
- **Optional**: any expense fields to update

#### 🗑️ `delete_expense`
Delete an expense by ID
- **Required**: expense ID

#### 📊 `get_spending_summary`
Get spending analytics and summary
- **Optional**: convertToCurrency (default USD)

#### 💱 `convert_currency`
Convert an amount between currencies
- **Required**: amount, from currency, to currency

#### 🎯 `create_budget` (NEW!)
Create a new monthly budget for a category
- **Required**: name, category, amount
- **Optional**: currency (default USD), month (default current month)

#### 📋 `list_budgets` (NEW!)
List budgets with optional month filtering
- **Optional**: month (YYYY-MM format)

#### 🔍 `get_budget` (NEW!)
Get details of a specific budget by ID
- **Required**: budget ID

#### ✏️ `update_budget` (NEW!)
Update an existing budget
- **Required**: budget ID
- **Optional**: any budget fields to update

#### 🗑️ `delete_budget` (NEW!)
Delete a budget by ID
- **Required**: budget ID

#### ⚠️ `get_budget_warnings` (NEW!)
Get budget warnings for overspending or approaching limits
- **Optional**: month (YYYY-MM format, defaults to current month)

#### 📈 `get_budget_summary` (NEW!)
Get budget summary and analytics
- **Optional**: month (YYYY-MM format for specific month summary)

#### 🔄 `refresh_budget_amounts` (NEW!)
Refresh spent amounts for all budgets based on current expenses

### Connecting to AI Assistants

#### For Claude Desktop App

1. **Build the project first:**
   ```bash
   npm run build
   ```

2. **Add to your Claude Desktop configuration** (`claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "expense-tracker": {
         "command": "node",
         "args": ["dist/mcp-server.js"],
         "cwd": "/path/to/your/expense-tracker/backend"
       }
     }
   }
   ```

#### For Development/Testing

Use the development configuration with hot reload:
```json
{
  "mcpServers": {
    "expense-tracker-dev": {
      "command": "npx",
      "args": ["tsx", "src/mcp-server.ts"],
      "cwd": "/path/to/your/expense-tracker/backend"
    }
  }
}
```

### Example Conversations

Once connected, you can interact with your expenses naturally:

**Adding Expenses:**
- "Add a $12.50 lunch expense for today"
- "I spent €25 on transportation yesterday"
- "Add coffee expense: $4.50, Food category, from Starbucks"

**Budget Management:**
- "Create a $500 food budget for this month"
- "Show me my budget warnings"
- "What's my budget summary for December?"
- "Update my transportation budget to $300"
- "How much have I spent on groceries this month?"

**Viewing Expenses:**
- "Show me my recent expenses"
- "List all food expenses from this month"
- "What did I spend on entertainment?"

**Analytics:**
- "Give me a spending summary"
- "How much did I spend total this month?"
- "Show me my expenses by category"

**Management:**
- "Update expense ID 123 to $15.00"
- "Delete the coffee expense from yesterday"
- "Convert $100 to EUR"

### Configuration Files

The repository includes ready-to-use configuration files:

- `mcp-config.json` - Production configuration
- `mcp-config-dev.json` - Development configuration

Simply copy the relevant configuration to your AI assistant's config file and update the path.

### Troubleshooting

**Server won't start:**
- Ensure dependencies are installed: `npm run install:all`
- Build the project: `npm run build`
- Check that port 3001 isn't in use

**AI assistant can't connect:**
- Verify the path in your MCP config is correct
- Make sure the server is built: `npm run build`
- Check that the command and args match your setup

**Tools not working:**
- Restart your AI assistant after config changes
- Check server logs for error messages
- Verify the expense tracker backend is accessible

### Security Note

The MCP server operates on your local machine and doesn't expose any network ports. It communicates with AI assistants through secure stdin/stdout communication, ensuring your expense data stays private and local.

## Future Enhancements

- [ ] MCP server authentication and permissions
- [ ] Real-time expense notifications through MCP
- [ ] Bulk expense operations via MCP
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [x] ✅ **Budget tracking and alerts** - Completed!
- [ ] Advanced budget features (recurring budgets, budget templates)
- [ ] Budget notifications and email alerts
- [ ] Budget vs actual spending charts
- [ ] PDF export functionality
- [ ] Expense receipt uploads
- [ ] Recurring expense management
- [ ] Dark mode support
- [ ] Historical exchange rate tracking
- [ ] Custom currency rate override
- [ ] Batch currency conversion for existing data
- [ ] Budget forecasting and predictions
- [ ] Expense categorization AI suggestions
- [ ] Multi-user budget sharing

## 🤖 AI Chatbot Assistant

### Web Interface Chatbot

The expense tracker now includes a **built-in AI chatbot** that allows you to manage expenses using natural language directly in the web interface:

**Key Features:**
- **Natural Language Processing**: Type commands like "Add a $25 coffee expense" or "Show my spending this month"
- **Real-time Integration**: Changes made through chat instantly update the main expense tracker
- **Smart Suggestions**: Helpful example commands for new users
- **Mobile-Responsive**: Works seamlessly on desktop and mobile devices
- **Conversation Context**: Maintains chat history during your session

**How to Use:**
1. Open the expense tracker at [http://localhost:3000](http://localhost:3000)
2. Click the floating chat button (💬) in the bottom-right corner
3. Start typing natural language commands:
   - "Add a $15 lunch expense"
   - "Show me my grocery spending"
   - "What's my total spending this month?"
   - "Convert $100 to EUR"
   - "Delete the coffee expense from yesterday"

**Supported Commands:**
- **Add expenses**: "Add a $20 dinner expense with italian tag"
- **Budget management**: "Create a $400 groceries budget" or "Show my budget warnings"
- **View expenses**: "Show me all my expenses" or "List coffee expenses"
- **Get summaries**: "What's my spending summary?" or "How much did I spend on food?"
- **Currency conversion**: "Convert $50 to GBP"
- **Update expenses**: "Change my last expense to $25"
- **Delete expenses**: "Delete expense number 5"

### MCP Server Integration

For advanced users, the expense tracker also exposes a **Model Context Protocol (MCP) server** that can integrate with Claude Desktop and other MCP-compatible AI assistants:

**Available Tools:**
- `add_expense` - Add new expenses with automatic categorization
- `list_expenses` - Get filtered expense lists with smart search
- `get_expense` - Retrieve specific expense details
- `update_expense` - Modify existing expenses
- `delete_expense` - Remove expenses from the tracker
- `get_spending_summary` - Generate comprehensive spending reports
- `convert_currency` - Real-time currency conversion

**Setup for Claude Desktop:**
1. Copy the configuration from `mcp-config-dev.json`
2. Add it to your Claude Desktop configuration
3. Restart Claude Desktop
4. Start the MCP server: `npm run mcp`

See `CLAUDE_SETUP.md` for detailed setup instructions.

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Vite
- **AI Integration**: Model Context Protocol (MCP) SDK
- **Chat Interface**: Natural Language Processing with real-time updates
- **Charts**: Chart.js with react-chartjs-2
- **Development**: ts-node-dev, ESLint, Concurrently
- **Styling**: CSS3 with CSS Grid and Flexbox

- **HTTP Client**: Axios for API communication

