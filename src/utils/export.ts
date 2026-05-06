import type { Transaction, Category, Payer } from '../types';

export function exportToCSV(transactions: Transaction[], categories: Category[], payers: Payer[]): void {
  const catMap = new Map(categories.map((c) => [c.id, c]));
  const payerMap = new Map(payers.map((p) => [p.id, p]));
  const headers = ['类型', '金额', '分类', '日期', '记账人', '备注'];
  const rows = transactions.map((t) => {
    const cat = catMap.get(t.categoryId);
    const payer = payerMap.get(t.payerId);
    return [
      t.type === 'income' ? '收入' : '支出',
      t.amount.toString(),
      cat ? `${cat.icon} ${cat.name}` : '未知',
      t.date,
      payer?.name || '',
      t.note,
    ];
  });
  const BOM = '﻿';
  const csv = BOM + [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `记账数据_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
