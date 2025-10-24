# Expense Tracker

A full-stack expense tracking application built with Node.js, Express, React, and TypeScript.

## Features

### 💰 Expense Management
- ✅ **Real-time CRUD operations** - add, edit, delete expenses with instant updates
- ✅ **Advanced filtering system** - filter by amount ranges, categories, dates, and tags
- ✅ **Comprehensive tagging** - custom tags with 8 color options for better organization
- ✅ **Flexible sorting** - sort by date, amount, title, or category with visual indicators
<img width="1893" height="976" alt="image" src="https://github.com/user-attachments/assets/ec3e0afb-81c8-4cf2-8b63-107fcfc8cfb9" />

### 🎯 Budget Management (NEW!)
- ✅ **Monthly budget tracking** with category-based budgets and real-time spent calculations
- ✅ **Smart budget warnings** at 50%, 80%, and 100% thresholds with automatic alerts
- ✅ **Budget dashboard** with utilization analytics and responsive mobile interface
<img width="1870" height="989" alt="image" src="https://github.com/user-attachments/assets/aac46fa7-fbd9-468f-9715-0408e5633c24" />

### 📊 Analytics
- ✅ **Interactive charts** powered by Chart.js with spending by category and monthly trends
- ✅ **Key statistics overview** with currency-aware spending calculations
- ✅ **Tag distribution analytics** with visual doughnut charts
- ✅ **CSV export functionality** - export all expense data with automatic filename generation
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

### Budgets
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

## Development

### Backend Development
The backend uses `ts-node-dev` for hot reloading during development. Any changes to TypeScript files will automatically restart the server.

### Frontend Development
The frontend uses Vite for fast development builds and hot module replacement.

### Adding New Features

1. **Backend**: Add new routes in `backend/src/routes/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **Shared Types**: Update type definitions in both `backend/src/types/` and `frontend/src/types/`

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

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Vite
- **AI Integration**: Model Context Protocol (MCP) SDK
- **Chat Interface**: Natural Language Processing with real-time updates
- **Charts**: Chart.js with react-chartjs-2
- **Development**: ts-node-dev, ESLint, Concurrently
- **Styling**: CSS3 with CSS Grid and Flexbox

- **HTTP Client**: Axios for API communication



