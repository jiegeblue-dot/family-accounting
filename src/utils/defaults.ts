import type { Category, Payer } from '../types';

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'type'>[] = [
  { id: 'income-salary', name: '工资', icon: '💰' },
  { id: 'income-bonus', name: '奖金', icon: '🎁' },
  { id: 'income-invest', name: '理财', icon: '📈' },
  { id: 'income-side', name: '兼职', icon: '💼' },
  { id: 'income-other', name: '其他', icon: '📦' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'type'>[] = [
  { id: 'expense-housing', name: '房贷', icon: '🏠' },
  { id: 'expense-carloan', name: '车贷', icon: '🚗' },
  { id: 'expense-carinsurance', name: '车险', icon: '🛡️' },
  { id: 'expense-insurance', name: '保险', icon: '💊' },
  { id: 'expense-travel', name: '旅游', icon: '✈️' },
  { id: 'expense-living', name: '生活费', icon: '🍜' },
  { id: 'expense-clothes', name: '衣服', icon: '👔' },
  { id: 'expense-skincare', name: '护肤品', icon: '💄' },
  { id: 'expense-social', name: '人情往来', icon: '🎀' },
  { id: 'expense-other', name: '其他', icon: '📦' },
];

export const DEFAULT_PAYERS: Payer[] = [
  { id: 'payer-xiaojie', name: '肖杰' },
  { id: 'payer-xujuan', name: '胥娟' },
];

export function getDefaultCategories(): Category[] {
  return [
    ...DEFAULT_INCOME_CATEGORIES.map((c) => ({ ...c, type: 'income' as const })),
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => ({ ...c, type: 'expense' as const })),
  ];
}
