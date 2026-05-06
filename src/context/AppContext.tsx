import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { AppState, AppAction, Transaction, Category } from '../types';
import { loadState, saveState } from '../utils/storage';
import { getDefaultCategories, DEFAULT_PAYERS } from '../utils/defaults';

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return { ...state, transactions: state.transactions.map((t) => t.id === action.payload.id ? action.payload : t) };
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.payload) };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map((c) => c.id === action.payload.id ? action.payload : c) };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        transactions: state.transactions.map((t) => t.categoryId === action.payload ? { ...t, categoryId: 'expense-other' } : t),
        budgets: state.budgets.filter((b) => b.categoryId !== action.payload),
      };
    case 'SET_BUDGET':
      return {
        ...state,
        budgets: state.budgets.some((b) => b.categoryId === action.payload.categoryId)
          ? state.budgets.map((b) => b.categoryId === action.payload.categoryId ? action.payload : b)
          : [...state.budgets, action.payload],
      };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.categoryId !== action.payload) };
    case 'ADD_PAYER':
      return { ...state, payers: [...state.payers, action.payload] };
    case 'UPDATE_PAYER':
      return { ...state, payers: state.payers.map((p) => p.id === action.payload.id ? action.payload : p) };
    case 'DELETE_PAYER': {
      const fallback = state.payers[0]?.id || '';
      return {
        ...state,
        payers: state.payers.filter((p) => p.id !== action.payload),
        transactions: state.transactions.map((t) => t.payerId === action.payload ? { ...t, payerId: fallback } : t),
      };
    }
    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<AppAction>; resetData: () => void } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  useEffect(() => { saveState(state); }, [state]);
  const resetData = () => {
    saveState({ transactions: [], categories: getDefaultCategories(), budgets: [], payers: DEFAULT_PAYERS });
    window.location.reload();
  };
  return <AppContext.Provider value={{ state, dispatch, resetData }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export type { Transaction, Category };
