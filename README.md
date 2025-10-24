# Expense Tracker

A full-stack expense tracking application built with Node.js, Express, React, and TypeScript.

## Features

### Backend (Express + TypeScript)
- ✅ RESTful API for expense CRUD operations
- ✅ Chart data endpoints for expense analytics
- ✅ CORS enabled for frontend integration
- ✅ TypeScript for type safety
- ✅ In-memory data storage (easily replaceable with database)

### Frontend (React + TypeScript)
- ✅ Modern React with hooks and functional components
- ✅ TypeScript for type safety
- ✅ Responsive design with CSS Grid
- ✅ Form validation and error handling
- ✅ Real-time expense management (add, edit, delete)

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

### Charts
- `GET /api/charts/category` - Get expenses grouped by category
- `GET /api/charts/monthly` - Get monthly spending data

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
}
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

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Data visualization charts
- [ ] Export functionality (PDF/CSV)
- [ ] Expense categories management
- [ ] Budget tracking and alerts
- [ ] Mobile responsive improvements
- [ ] Dark mode support

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React, TypeScript, Vite
- **Development**: ts-node-dev, ESLint, Concurrently
- **Styling**: CSS3 with CSS Grid and Flexbox