export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  categoryId: string;
  date: string;
  note: string;
  payerId: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

export interface Budget {
  categoryId: string;
  amount: number;
  budgetType: 'monthly' | 'annual';
  note?: string;
}

export interface Payer {
  id: string;
  name: string;
}

export interface AppState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  payers: Payer[];
}

export type AppAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_PAYER'; payload: Payer }
  | { type: 'UPDATE_PAYER'; payload: Payer }
  | { type: 'DELETE_PAYER'; payload: string };
