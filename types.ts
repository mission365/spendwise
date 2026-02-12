
export type Category = 'Food' | 'Rent' | 'Fun' | 'Shopping' | 'Transport' | 'Bills' | 'Health' | 'Other';

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: Category;
}

export interface Budget {
  limit: number;
}

export const CATEGORIES: Category[] = ['Food', 'Rent', 'Fun', 'Shopping', 'Transport', 'Bills', 'Health', 'Other'];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: '#f87171',
  Rent: '#60a5fa',
  Fun: '#fbbf24',
  Shopping: '#818cf8',
  Transport: '#34d399',
  Bills: '#fb7185',
  Health: '#fb923c',
  Other: '#94a3b8'
};
