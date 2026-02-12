
import { Expense, Budget } from '../types';

const EXPENSES_KEY = 'spendwise_expenses';
const BUDGET_KEY = 'spendwise_budget';

export const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const getExpenses = (): Expense[] => {
  const saved = localStorage.getItem(EXPENSES_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveBudget = (budget: Budget) => {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
};

export const getBudget = (): Budget => {
  const saved = localStorage.getItem(BUDGET_KEY);
  return saved ? JSON.parse(saved) : { limit: 2000 };
};

export const downloadCSV = (expenses: Expense[]) => {
  const headers = ['ID', 'Date', 'Description', 'Amount', 'Category'];
  const rows = expenses.map(e => [e.id, e.date, `"${e.description.replace(/"/g, '""')}"`, e.amount, e.category]);
  
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
