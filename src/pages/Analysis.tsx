import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import EmptyState from '../components/EmptyState';

const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#818cf8', '#c084fc', '#f472b6', '#e879f9', '#fb7185'];

export default function Analysis() {
  const { state } = useApp();
  const [year, setYear] = useState(new Date().getFullYear());

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);

  // Pie data
  const expensePie = useMemo(() => {
    const agg: Record<string, number> = {};
    for (const t of state.transactions) {
      if (t.type === 'expense') {
        const cat = catMap.get(t.categoryId);
        const name = cat ? `${cat.icon} ${cat.name}` : '未知';
        agg[name] = (agg[name] || 0) + t.amount;
      }
    }
    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.transactions, catMap]);

  const incomePie = useMemo(() => {
    const agg: Record<string, number> = {};
    for (const t of state.transactions) {
      if (t.type === 'income') {
        const cat = catMap.get(t.categoryId);
        const name = cat ? `${cat.icon} ${cat.name}` : '未知';
        agg[name] = (agg[name] || 0) + t.amount;
      }
    }
    return Object.entries(agg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.transactions, catMap]);

  // Monthly bar chart
  const barData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = String(i + 1).padStart(2, '0');
      return { key: `${year}-${m}`, label: `${m}月`, income: 0, expense: 0 };
    });

    for (const t of state.transactions) {
      const m = t.date.slice(0, 7);
      if (!m.startsWith(`${year}-`)) continue;
      const entry = months.find((e) => e.key === m);
      if (!entry) continue;
      if (t.type === 'income') entry.income += t.amount;
      else entry.expense += t.amount;
    }

    return months;
  }, [state.transactions, year]);

  const years = useMemo(() => {
    const set = new Set(state.transactions.map((t) => parseInt(t.date.slice(0, 4))));
    const y = new Date().getFullYear();
    set.add(y);
    return Array.from(set).sort((a, b) => b - a);
  }, [state.transactions]);

  if (state.transactions.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">数据分析</h2>
        <EmptyState icon="📈" title="暂无数据" description="添加收支记录后，这里会展示分析图表" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-800">数据分析</h2>

      {/* Monthly trend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">月度收支趋势</h3>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-2 py-1 text-xs border border-gray-200 rounded bg-white outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}年</option>
            ))}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
            <Legend />
            <Bar dataKey="income" name="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="支出" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">支出分类占比</h3>
          {expensePie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={expensePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} label={({ name, percent }) => {
                    const n = (name ?? '').replace(/^[^\s]+\s/, '');
                    return `${n.length > 4 ? n.slice(0,4)+'…' : n} ${((percent ?? 0) * 100).toFixed(0)}%`;
                  }}>
                    {expensePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <Ranking data={expensePie} colors={COLORS} />
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">暂无支出数据</div>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-hidden">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">收入分类占比</h3>
          {incomePie.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={incomePie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={45} label={({ name, percent }) => {
                    const n = (name ?? '').replace(/^[^\s]+\s/, '');
                    return `${n.length > 4 ? n.slice(0,4)+'…' : n} ${((percent ?? 0) * 100).toFixed(0)}%`;
                  }}>
                    {incomePie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `¥${Number(v).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              <Ranking data={incomePie} colors={COLORS} />
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-gray-400 text-sm">暂无收入数据</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Ranking({ data, colors }: { data: { name: string; value: number }[]; colors: string[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="mt-3 space-y-1.5">
      {data.slice(0, 8).map((d, i) => (
        <div key={d.name} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
          <span className="text-gray-600 truncate flex-1">{d.name}</span>
          <span className="text-gray-800 font-medium">¥{d.value.toFixed(2)}</span>
          <span className="text-gray-400 w-10 text-right">{((d.value / total) * 100).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}
