import { useState } from 'react';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { Analytics } from './components/Analytics';
import { CurrencySettings } from './components/CurrencySettings';
import { Chatbox } from './components/Chatbox';
import { Budgets } from './components/Budgets';
import { BudgetWarnings } from './components/BudgetWarnings';
import { Expense } from './types';
import './App.css';

type TabType = 'expenses' | 'analytics' | 'budgets';

function App() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [showCurrencySettings, setShowCurrencySettings] = useState(false);
  const [showChatbox, setShowChatbox] = useState(false);

  const handleExpenseSelect = (expense: Expense | null) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setSelectedExpense(null);
    setShowForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleChatUpdate = () => {
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
        <button 
          onClick={() => setShowCurrencySettings(true)}
          className="settings-btn"
          title="Currency Settings"
        >
          💱
        </button>
        <div className="header-content">
          <h1>💰 Expense Tracker</h1>
          <p>Track your daily expenses and visualize your spending patterns</p>
        </div>
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
            className={`nav-tab ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            🎯 Budgets
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
            <BudgetWarnings autoRefresh={true} hideWhenEmpty={true} />
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
        ) : activeTab === 'budgets' ? (
          <Budgets />
        ) : (
          <Analytics />
        )}
      </main>

      {showCurrencySettings && (
        <CurrencySettings onClose={() => setShowCurrencySettings(false)} />
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setShowChatbox(true)}
        className="chat-toggle-btn"
        title="Chat with AI Assistant"
      >
        🤖
      </button>

      {/* Chatbox */}
      <Chatbox 
        isOpen={showChatbox} 
        onClose={() => setShowChatbox(false)}
        onUpdate={handleChatUpdate}
      />
    </div>
  );
}

export default App;