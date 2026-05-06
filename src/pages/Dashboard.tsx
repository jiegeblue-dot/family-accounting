import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useBalance } from '../hooks/useBalance';
import BalanceCard from '../components/BalanceCard';
import TransactionList from '../components/TransactionList';
import TransactionForm from '../components/TransactionForm';
import EmptyState from '../components/EmptyState';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Transaction } from '../types';

const COLORS = ['#f43f5e', '#fb923c', '#fbbf24', '#a3e635', '#22d3ee', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#8b5cf6'];

function buildMonthOptions() {
  const now = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${d.getFullYear()}年${d.getMonth() + 1}月`,
    });
  }
  return options;
}

export default function Dashboard() {
  const { state } = useApp();
  const balance = useBalance();
  const [formOpen, setFormOpen] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const monthOptions = useMemo(() => buildMonthOptions(), []);
  const [pieMonth, setPieMonth] = useState(monthOptions[0]?.value || '');
  const [budgetMonth, setBudgetMonth] = useState(monthOptions[0]?.value || '');

  const pieData = useMemo(() => {
    const catMap = new Map(state.categories.map((c) => [c.id, c]));
    const agg: Record<string, number> = {};
    for (const t of state.transactions) {
      if (t.type === 'expense' && t.date.startsWith(pieMonth)) {
        const cat = catMap.get(t.categoryId);
        const name = cat ? `${cat.icon} ${cat.name}` : '未知';
        agg[name] = (agg[name] || 0) + t.amount;
      }
    }
    return Object.entries(agg)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [state.transactions, state.categories, pieMonth]);

  return (
    <div className="space-y-5">
      <BalanceCard balance={balance.balance} monthIncome={balance.monthIncome} monthExpense={balance.monthExpense} monthBalance={balance.monthBalance} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Expense Pie */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">支出分布</h3>
            <select value={pieMonth} onChange={(e) => setPieMonth(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:border-indigo-300">
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}
                  label={({ name }) => {
                    const short = (name ?? '').replace(/^[^\s]+\s/, '');
                    return short.length > 4 ? short.slice(0, 4) + '…' : short;
                  }}>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">该月暂无支出</div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-3">最近记录</h3>
          <TransactionList transactions={state.transactions} compact onEdit={(t) => { setEditTx(t); setFormOpen(true); }} />
        </div>
      </div>

      {/* Monthly Budget Progress */}
      {state.budgets.filter((b) => b.budgetType === 'monthly').length > 0 && (
        <BudgetProgress month={budgetMonth} onMonthChange={setBudgetMonth} monthOptions={monthOptions} />
      )}

      {/* FAB */}
      <button onClick={() => { setEditTx(null); setFormOpen(true); }}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-indigo-200 flex items-center justify-center text-2xl hover:shadow-xl transition-all z-40">
        +
      </button>

      {state.transactions.length === 0 && (
        <div className="hidden md:block">
          <EmptyState icon="💰" title="开始记账吧" description="点击下方按钮添加你的第一笔记录" />
          <div className="flex justify-center mt-4">
            <button onClick={() => { setEditTx(null); setFormOpen(true); }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-200 transition-all">
              + 记一笔
            </button>
          </div>
        </div>
      )}

      <TransactionForm open={formOpen} onClose={() => setFormOpen(false)} edit={editTx} />
    </div>
  );
}

function BudgetProgress({ month, onMonthChange, monthOptions }: { month: string; onMonthChange: (m: string) => void; monthOptions: { value: string; label: string }[] }) {
  const { state } = useApp();
  const catMap = new Map(state.categories.map((c) => [c.id, c]));

  const monthlyBudgets = state.budgets.filter((b) => b.budgetType === 'monthly' && b.amount > 0);

  const spent: Record<string, number> = {};
  for (const t of state.transactions) {
    if (t.type === 'expense' && t.date.startsWith(month) && monthlyBudgets.some((b) => b.categoryId === t.categoryId)) {
      spent[t.categoryId] = (spent[t.categoryId] || 0) + t.amount;
    }
  }

  const items = monthlyBudgets.map((b) => {
    const cat = catMap.get(b.categoryId);
    const s = spent[b.categoryId] || 0;
    const pct = b.amount > 0 ? (s / b.amount) * 100 : 0;
    return { ...b, cat, spent: s, pct };
  }).sort((a, b) => b.pct - a.pct);

  if (items.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700">预算进度</h3>
        <select value={month} onChange={(e) => onMonthChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 outline-none focus:border-indigo-300">
          {monthOptions.map((m) => (<option key={m.value} value={m.value}>{m.label}</option>))}
        </select>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.categoryId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[13px] font-medium text-gray-700">
                {item.cat?.icon} {item.cat?.name}
              </span>
              <span className={`text-[11px] md:text-xs font-semibold ${item.pct > 100 ? 'text-rose-500' : item.pct > 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {item.pct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${
                item.pct > 100 ? 'bg-gradient-to-r from-rose-400 to-pink-500' : item.pct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
              }`} style={{ width: `${Math.min(item.pct, 100)}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              ¥{item.spent.toLocaleString()} / ¥{item.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
