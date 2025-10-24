import { useState } from 'react';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { Expense } from './types';
import './App.css';

function App() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

      <main className="app-main">
        {showForm ? (
          <ExpenseForm
            expense={selectedExpense}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        ) : (
          <>
            <div className="actions">
              <button onClick={handleAddNew} className="add-btn">
                ➕ Add New Expense
              </button>
            </div>
            <ExpenseList
              onExpenseSelect={handleExpenseSelect}
              refreshTrigger={refreshTrigger}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;