import { useState } from 'react';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { Analytics } from './components/Analytics';
import { Expense } from './types';
import './App.css';

type TabType = 'expenses' | 'analytics';

function App() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');

  const handleExpenseSelect = (expense: Expense | null) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setSelectedExpense(null);
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setSelectedExpense(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setSelectedExpense(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 Expense Tracker</h1>
        <p>Track your daily expenses and visualize your spending patterns</p>
      </header>

      {!showForm && (
        <nav className="app-nav">
          <button 
            className={`nav-tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            💳 Expenses
          </button>
          <button 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </nav>
      )}

      <main className="app-main">
        {showForm ? (
          <ExpenseForm
            expense={selectedExpense}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        ) : activeTab === 'expenses' ? (
          <div className="expenses-section">
            <div className="expenses-header">
              <h2>💳 Your Expenses</h2>
              <button onClick={handleAddNew} className="add-btn">
                ➕ Add New Expense
              </button>
            </div>
            <ExpenseList
              onExpenseSelect={handleExpenseSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        ) : (
          <Analytics />
        )}
      </main>
    </div>
  );
}

export default App;