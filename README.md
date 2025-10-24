# Expense Tracker

A full-stack expense tracking application built with Node.js, Express, React, and TypeScript.

## Features

### 🤖 AI Chat Assistant (NEW!)
- ✅ **Natural language expense management** - "Add a $15 lunch expense"
- ✅ **Smart conversation interface** with message history and context
- ✅ **Automatic expense parsing** from natural language input
- ✅ **Real-time data sync** with the main expense tracker
- ✅ **Mobile-responsive chat UI** with floating chat button
- ✅ **AI-powered analytics** - ask for spending summaries and insights
- ✅ **Currency conversion** through chat commands
- ✅ **Voice-like interactions** - no complex forms or navigation needed

### Backend (Express + TypeScript)
- ✅ RESTful API for expense CRUD operations
- ✅ **MCP (Model Context Protocol) server** for AI assistant integration
- ✅ **Chat API endpoints** with natural language processing
- ✅ Chart data endpoints for expense analytics
- ✅ CORS enabled for frontend integration
- ✅ TypeScript for type safety
- ✅ In-memory data storage (easily replaceable with database)
- ✅ Currency conversion API integration
- ✅ Real-time exchange rate fetching

### Frontend (React + TypeScript)
- ✅ **Interactive AI chatbot interface** with modern chat UI
- ✅ **Smart suggestion system** for new users
- ✅ Modern React with hooks and functional components
- ✅ TypeScript for type safety
- ✅ Responsive design with CSS Grid
- ✅ Form validation and error handling
- ✅ Real-time expense management (add, edit, delete)
- ✅ Advanced filtering system (amount, category, date, tags)
- ✅ Comprehensive tagging system with custom colors
- ✅ Analytics dashboard with interactive charts
- ✅ CSV export functionality
- ✅ Tab-based navigation (Expenses/Analytics)
- ✅ Multi-currency support with real-time conversion
- ✅ Flexible sorting system (date, amount, title, category)
- ✅ Currency settings configuration

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
  category: string;
  date: string;
  description?: string;
  tags?: Tag[];
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
- [ ] Budget tracking and alerts
- [ ] PDF export functionality
- [ ] Expense receipt uploads
- [ ] Recurring expense management
- [ ] Dark mode support
- [ ] Historical exchange rate tracking
- [ ] Custom currency rate override
- [ ] Batch currency conversion for existing data

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