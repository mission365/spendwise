import { Expense, Budget } from '../types';

// Default to a typical Laravel API URL; can be overridden via VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const fetchExpenses = async (): Promise<Expense[]> => {
  const res = await fetch(`${API_BASE_URL}/expenses`);
  if (!res.ok) {
    throw new Error('Failed to load expenses from server');
  }
  return res.json();
};

export const createExpense = async (
  data: Omit<Expense, 'id'>
): Promise<Expense> => {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create expense');
  }

  return res.json();
};

export const updateExpense = async (
  id: string,
  data: Omit<Expense, 'id'>
): Promise<Expense> => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update expense');
  }

  return res.json();
};

export const deleteExpense = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Failed to delete expense');
  }
};

export const fetchBudget = async (): Promise<Budget> => {
  const res = await fetch(`${API_BASE_URL}/budget`);
  if (!res.ok) {
    throw new Error('Failed to load budget from server');
  }
  return res.json();
};

export const updateBudget = async (budget: Budget): Promise<Budget> => {
  const res = await fetch(`${API_BASE_URL}/budget`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(budget),
  });

  if (!res.ok) {
    throw new Error('Failed to update budget');
  }

  return res.json();
};


