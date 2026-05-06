import type { AppState, Transaction, Budget } from '../types';
import { getDefaultCategories, DEFAULT_PAYERS } from './defaults';

export function getSeedState(): AppState {
  const categories = getDefaultCategories();
  const payers = DEFAULT_PAYERS;

  const t = (id: string, amount: number, catId: string, date: string, note: string, payerId: string): Transaction => ({
    id, type: 'expense', amount, categoryId: catId, date, note, payerId, createdAt: Date.now() - Math.random() * 5000000,
  });

  const transactions: Transaction[] = [
    t('seed-001', 779, 'expense-skincare', '2026-03-05', '海蓝之谜精粹水', 'payer-xujuan'),
    t('seed-002', 678, 'expense-skincare', '2026-03-08', '兰蔻防嗮', 'payer-xujuan'),
    t('seed-003', 175, 'expense-skincare', '2026-03-12', '洗面奶', 'payer-xujuan'),
    t('seed-004', 8500, 'expense-travel', '2026-03-10', '大理旅游', 'payer-xiaojie'),
    t('seed-005', 1100, 'expense-social', '2026-03-15', '给朋友带礼物', 'payer-xiaojie'),
    t('seed-006', 5962, 'expense-housing', '2026-03-01', '房贷', 'payer-xiaojie'),
    t('seed-007', 2145, 'expense-carloan', '2026-03-01', '车贷', 'payer-xiaojie'),
    t('seed-008', 4000, 'expense-carinsurance', '2026-03-01', '车险', 'payer-xiaojie'),
    t('seed-009', 3500, 'expense-living', '2026-03-01', '胥娟生活费', 'payer-xiaojie'),
    t('seed-010', 3500, 'expense-living', '2026-03-01', '肖杰生活费', 'payer-xiaojie'),
    t('seed-011', 600, 'expense-social', '2026-03-20', '汤兴豪婚礼还情', 'payer-xiaojie'),
    t('seed-012', 1000, 'expense-other', '2026-03-05', '车位租金', 'payer-xiaojie'),
    t('seed-013', 5962, 'expense-housing', '2026-04-01', '房贷', 'payer-xiaojie'),
    t('seed-014', 3500, 'expense-living', '2026-04-01', '肖杰生活费', 'payer-xiaojie'),
    t('seed-015', 346, 'expense-insurance', '2026-04-10', '胥娟医保', 'payer-xiaojie'),
    t('seed-016', 265, 'expense-insurance', '2026-04-10', '肖杰保险', 'payer-xiaojie'),
    t('seed-017', 262, 'expense-insurance', '2026-04-12', '胥娟意外险', 'payer-xiaojie'),
    t('seed-018', 2344, 'expense-insurance', '2026-04-15', '肖杰爸妈医保', 'payer-xiaojie'),
    t('seed-019', 313, 'expense-skincare', '2026-04-18', '肖杰爽肤水', 'payer-xujuan'),
  ];

  const budgets: Budget[] = [
    { categoryId: 'expense-housing', amount: 5962, budgetType: 'monthly' },
    { categoryId: 'expense-carloan', amount: 2145, budgetType: 'monthly' },
    { categoryId: 'expense-carinsurance', amount: 4000, budgetType: 'annual' },
    { categoryId: 'expense-insurance', amount: 4000, budgetType: 'annual' },
    { categoryId: 'expense-travel', amount: 10000, budgetType: 'annual' },
    { categoryId: 'expense-living', amount: 7000, budgetType: 'monthly' },
    { categoryId: 'expense-clothes', amount: 10000, budgetType: 'annual' },
    { categoryId: 'expense-skincare', amount: 6000, budgetType: 'annual' },
    { categoryId: 'expense-social', amount: 15000, budgetType: 'annual' },
    { categoryId: 'expense-other', amount: 0, budgetType: 'annual' },
  ];

  return { transactions, categories, budgets, payers };
}
