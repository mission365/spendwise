
import React, { useState, useEffect } from 'react';
import { Expense, Budget } from './types';
import { getExpenses, saveExpenses, getBudget, saveBudget, downloadCSV } from './services/storage';
import { fetchExpenses, createExpense, updateExpense, deleteExpense as deleteExpenseApi, fetchBudget, updateBudget } from './services/api';
import { getFinancialAdvice } from './services/geminiService';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({ limit: 0 });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      try {
        const [serverExpenses, serverBudget] = await Promise.all([
          fetchExpenses(),
          fetchBudget(),
        ]);
        setExpenses(serverExpenses);
        setBudget(serverBudget);
      } catch (error) {
        console.error('Failed to load data from server, falling back to local storage', error);
        setLoadError('Could not connect to the server. Showing local data only.');
        setExpenses(getExpenses());
        setBudget(getBudget());
      } finally {
        setIsLoadingExpenses(false);
      }
    };

    init();
  }, []);

  // Persist expenses
  useEffect(() => {
    if (expenses.length > 0) saveExpenses(expenses);
  }, [expenses]);

  // Persist budget to API
  useEffect(() => {
    if (budget.limit >= 0) {
      // Save to localStorage as backup
      saveBudget(budget);
      
      // Save to API (with error handling to not break UI)
      updateBudget(budget).catch(error => {
        console.error('Failed to save budget to server', error);
        // Don't show alert for budget saves to avoid annoying user
      });
    }
  }, [budget]);

  const handleAddOrUpdate = async (data: Omit<Expense, 'id'> & { id?: string }) => {
    try {
      if (data.id) {
        const { id, ...rest } = data;
        const updated = await updateExpense(id, rest as Omit<Expense, 'id'>);
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const { id, ...rest } = data;
        const created = await createExpense(rest as Omit<Expense, 'id'>);
        setExpenses(prev => [created, ...prev]);
      }
      setIsFormOpen(false);
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to save expense', error);
      alert('Failed to save expense. Please make sure the server is running.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await deleteExpenseApi(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense', error);
      alert('Failed to delete expense. Please make sure the server is running.');
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const isOverBudget = totalSpent > budget.limit;

  const fetchAiInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const advice = await getFinancialAdvice(expenses, budget);
      setAiInsight(advice);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">SpendWise</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => downloadCSV(expenses)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button 
                onClick={() => { setEditingExpense(null); setIsFormOpen(true); }}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {isLoadingExpenses && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-600 text-sm">
            Loading expenses from server...
          </div>
        )}

        {loadError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
            {loadError}
          </div>
        )}
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
             </div>
            <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Total Spending</p>
            <p className={`text-4xl font-extrabold transition-colors ${isOverBudget ? 'text-rose-600' : 'text-slate-900'}`}>
              ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            {isOverBudget && (
              <div className="mt-2 flex items-center gap-1.5 text-rose-500 text-sm font-bold animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Budget Exceeded
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Monthly Budget</p>
            <div className="flex items-end gap-3">
              <input 
                type="number"
                value={budget.limit}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setBudget({ limit: newLimit });
                }}
                onBlur={async () => {
                  // Save to API when user finishes editing
                  try {
                    await updateBudget(budget);
                  } catch (error) {
                    console.error('Failed to save budget', error);
                  }
                }}
                className="text-4xl font-extrabold text-slate-900 bg-transparent w-full focus:outline-none focus:ring-b-2 focus:ring-indigo-500 border-b-2 border-slate-100 py-1"
              />
            </div>
            <div className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden">
               <div 
                  className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min((totalSpent / (budget.limit || 1)) * 100, 100)}%` }}
               />
            </div>
          </div>

          <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl shadow-indigo-200 text-white flex flex-col justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">SpendWise Insights</p>
              {aiInsight ? (
                <p className="text-sm leading-relaxed">{aiInsight}</p>
              ) : (
                <p className="text-sm italic opacity-80">Generate a financial health report based on your habits.</p>
              )}
            </div>
            <button 
              onClick={fetchAiInsight}
              disabled={isLoadingInsight || expenses.length === 0}
              className="mt-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2 border border-white/20"
            >
              {isLoadingInsight ? (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Analyze Habits'}
            </button>
          </div>
        </div>

        {/* Dashboard Charts */}
        <Dashboard expenses={expenses} />

        {/* List Section */}
        <ExpenseList 
          expenses={expenses} 
          onEdit={(e) => { setEditingExpense(e); setIsFormOpen(true); }}
          onDelete={handleDelete}
        />
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <ExpenseForm 
          onSave={handleAddOrUpdate} 
          onCancel={() => { setIsFormOpen(false); setEditingExpense(null); }}
          initialData={editingExpense}
        />
      )}
    </div>
  );
};

export default App;
