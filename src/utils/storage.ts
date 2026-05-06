import type { AppState } from '../types';
import { getDefaultCategories, DEFAULT_PAYERS } from './defaults';
import { getSeedState } from './seed';

const STORAGE_KEY = 'family-accounting';
const SEEDED_KEY = 'family-accounting-seeded';

const defaultState: AppState = {
  transactions: [],
  categories: getDefaultCategories(),
  budgets: [],
  payers: DEFAULT_PAYERS,
};

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state = JSON.parse(raw) as Partial<AppState>;

      // Migration: fix transactions missing payerId
      const transactions = (state.transactions || []).map((t) => ({
        ...t,
        payerId: t.payerId || state.payers?.[0]?.id || DEFAULT_PAYERS[0].id,
      }));

      // Migration: fix budgets missing budgetType
      const budgets = (state.budgets || []).map((b) => ({
        ...b,
        budgetType: (b as { budgetType?: string }).budgetType === 'monthly' ? 'monthly' as const : 'annual' as const,
      }));

      if (!transactions.length && !localStorage.getItem(SEEDED_KEY)) {
        const seeded = getSeedState();
        if (seeded.transactions.length > 0) {
          saveState(seeded);
          localStorage.setItem(SEEDED_KEY, '1');
          return seeded;
        }
      }

      const migrated = {
        transactions,
        categories: state.categories?.length ? state.categories : getDefaultCategories(),
        budgets,
        payers: state.payers?.length ? state.payers : DEFAULT_PAYERS,
      };
      saveState(migrated);
      return migrated;
    }
    if (!localStorage.getItem(SEEDED_KEY)) {
      const seeded = getSeedState();
      if (seeded.transactions.length > 0) {
        saveState(seeded);
        localStorage.setItem(SEEDED_KEY, '1');
        return seeded;
      }
    }
    return defaultState;
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SEEDED_KEY);
}
