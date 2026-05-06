import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import type { Transaction } from '../types';

export default function Transactions() {
  const { state } = useApp();
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [payerFilter, setPayerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let list = state.transactions;
    if (filter !== 'all') list = list.filter((t) => t.type === filter);
    if (categoryFilter !== 'all') list = list.filter((t) => t.categoryId === categoryFilter);
    if (payerFilter !== 'all') list = list.filter((t) => t.payerId === payerFilter);
    if (search.trim()) {
      const kw = search.trim().toLowerCase();
      list = list.filter((t) => t.note.toLowerCase().includes(kw));
    }
    if (dateFrom) list = list.filter((t) => t.date >= dateFrom);
    if (dateTo) list = list.filter((t) => t.date <= dateTo);
    return list;
  }, [state.transactions, filter, categoryFilter, payerFilter, search, dateFrom, dateTo]);

  const total = filtered.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">流水</h2>
        <button onClick={() => { setEditTx(null); setFormOpen(true); }}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all">
          + 记一笔
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-100 shadow-sm space-y-2.5">
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'income' | 'expense')}
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300">
            <option value="all">全部类型</option>
            <option value="income">💰 收入</option>
            <option value="expense">💸 支出</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300">
            <option value="all">全部分类</option>
            {state.categories.filter((c) => filter === 'all' || c.type === filter).map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
          <select value={payerFilter} onChange={(e) => setPayerFilter(e.target.value)}
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300">
            <option value="all">全部记账人</option>
            {state.payers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 搜索备注..."
            className="px-3 py-2 text-[13px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300 flex-1 min-w-[120px]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-gray-400">日期：</span>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="px-2.5 py-1.5 text-[12px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300" />
          <span className="text-[12px] text-gray-400">至</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="px-2.5 py-1.5 text-[12px] border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-[12px] text-indigo-500 hover:text-indigo-700 px-1">清除</button>
          )}
        </div>
      </div>

      <TransactionList transactions={filtered} onEdit={(t) => { setEditTx(t); setFormOpen(true); }} />

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          共 {filtered.length} 条记录 · 合计 ¥{total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
        </p>
      )}

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} edit={editTx} />
    </div>
  );
}
