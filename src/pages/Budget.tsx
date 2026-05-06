import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import EmptyState from '../components/EmptyState';

export default function Budget() {
  const { state, dispatch } = useApp();
  const expenseCats = state.categories.filter((c) => c.type === 'expense');
  const budgetMap = new Map(state.budgets.map((b) => [b.categoryId, b]));
  const catMap = new Map(state.categories.map((c) => [c.id, c]));

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = `${thisYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const stats = useMemo(() => {
    const yearlySpent: Record<string, number> = {};
    const monthlySpent: Record<string, number> = {};
    for (const t of state.transactions) {
      if (t.type !== 'expense') continue;
      yearlySpent[t.categoryId] = (yearlySpent[t.categoryId] || 0) + t.amount;
      if (t.date.startsWith(thisMonth)) {
        monthlySpent[t.categoryId] = (monthlySpent[t.categoryId] || 0) + t.amount;
      }
    }
    return { yearlySpent, monthlySpent };
  }, [state.transactions, thisMonth]);

  // New budget form
  const [showAdd, setShowAdd] = useState(false);
  const [addCat, setAddCat] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addType, setAddType] = useState<'monthly' | 'annual'>('monthly');
  const [addNote, setAddNote] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'monthly' | 'annual'>('monthly');
  const [editNote, setEditNote] = useState('');

  const unbudgeted = expenseCats.filter((c) => !budgetMap.has(c.id));

  const openAdd = () => {
    const first = unbudgeted[0];
    setAddCat(first?.id || expenseCats[0]?.id || '');
    setAddAmount('');
    setAddType('monthly');
    setAddNote('');
    setShowAdd(true);
  };

  const handleAdd = () => {
    const amt = parseFloat(addAmount);
    if (!addCat || !amt || amt <= 0) return;
    dispatch({ type: 'SET_BUDGET', payload: { categoryId: addCat, amount: Math.round(amt * 100) / 100, budgetType: addType, note: addNote.trim() || undefined } });
    setAddAmount(''); setAddNote('');
    setShowAdd(false);
  };

  const startEdit = (catId: string) => {
    const b = budgetMap.get(catId);
    if (!b) return;
    setEditingId(catId);
    setEditAmount(b.amount.toString());
    setEditType(b.budgetType);
    setEditNote(b.note || '');
  };

  const saveEdit = () => {
    const amt = parseFloat(editAmount);
    if (!editingId || !amt || amt <= 0) return;
    dispatch({ type: 'SET_BUDGET', payload: { categoryId: editingId, amount: Math.round(amt * 100) / 100, budgetType: editType, note: editNote.trim() || undefined } });
    setEditingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">预算管理</h2>
        <button onClick={openAdd}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all">
          + 新建预算
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-indigo-200 shadow-sm space-y-3">
          <p className="text-xs font-medium text-gray-500">新建预算</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select value={addCat} onChange={(e) => setAddCat(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300">
              {unbudgeted.length > 0 ? unbudgeted.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))
                : expenseCats.map((c) => (<option key={c.id} value={c.id}>{c.icon} {c.name}</option>))}
            </select>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 bg-white focus-within:border-indigo-300">
              <span className="text-gray-400 text-sm mr-1">¥</span>
              <input type="number" min="0" step="100" value={addAmount} onChange={(e) => setAddAmount(e.target.value)}
                placeholder="金额" className="w-full py-2 text-sm outline-none" autoFocus />
            </div>
            <select value={addType} onChange={(e) => setAddType(e.target.value as 'monthly' | 'annual')}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300">
              <option value="monthly">月度预算</option>
              <option value="annual">年度预算</option>
            </select>
            <input type="text" value={addNote} onChange={(e) => setAddNote(e.target.value)}
              placeholder="备注（可选）" className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-indigo-300" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="px-5 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 transition-colors">确认</button>
            <button onClick={() => setShowAdd(false)}
              className="px-5 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition-colors">取消</button>
          </div>
        </div>
      )}

      {expenseCats.length === 0 ? (
        <EmptyState icon="📊" title="暂无分类" />
      ) : state.budgets.length === 0 ? (
        <EmptyState icon="🎯" title="暂无预算" description="点击上方按钮创建第一个预算" />
      ) : (
        <div className="space-y-3">
          {state.budgets.map((b) => {
            const cat = catMap.get(b.categoryId);
            if (!cat) return null;
            const ySpent = stats.yearlySpent[b.categoryId] || 0;
            const mSpent = stats.monthlySpent[b.categoryId] || 0;
            const annualTotal = b.budgetType === 'monthly' ? b.amount * 12 : b.amount;
            const yPct = annualTotal > 0 ? (ySpent / annualTotal) * 100 : 0;
            const mPct = b.budgetType === 'monthly'
              ? (b.amount > 0 ? (mSpent / b.amount) * 100 : 0)
              : (annualTotal > 0 ? (ySpent / annualTotal) * 100 : 0);
            const isEditing = editingId === b.categoryId;

            return (
              <div key={b.categoryId} className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border shadow-sm transition-all ${isEditing ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cat.icon}</span>
                    <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      b.budgetType === 'monthly' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {b.budgetType === 'monthly' ? '月度' : '年度'}
                    </span>
                    {b.note && !isEditing && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]">📝 {b.note}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing && (
                      <span className="text-xs text-gray-500">
                        {b.budgetType === 'monthly'
                          ? <>月 ¥{b.amount.toLocaleString()} · 年 ¥{(b.amount * 12).toLocaleString()}</>
                          : <>年 ¥{b.amount.toLocaleString()}</>}
                      </span>
                    )}
                    <button onClick={() => startEdit(b.categoryId)}
                      className="text-xs text-indigo-400 hover:text-indigo-600 transition-colors px-1">修改</button>
                    <button onClick={() => dispatch({ type: 'DELETE_BUDGET', payload: b.categoryId })}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1">删除</button>
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="flex flex-wrap items-center gap-2 mb-3 bg-indigo-50/50 rounded-xl p-3">
                    <div className="flex items-center border border-gray-200 rounded-lg px-2 bg-white">
                      <span className="text-gray-400 text-xs mr-1">¥</span>
                      <input type="number" min="0" step="100" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}
                        className="w-24 py-1.5 text-sm outline-none" autoFocus />
                    </div>
                    <select value={editType} onChange={(e) => setEditType(e.target.value as 'monthly' | 'annual')}
                      className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none">
                      <option value="monthly">月度</option>
                      <option value="annual">年度</option>
                    </select>
                    <input type="text" value={editNote} onChange={(e) => setEditNote(e.target.value)}
                      placeholder="备注" className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white outline-none flex-1 min-w-[100px]" />
                    <button onClick={saveEdit}
                      className="px-3 py-1.5 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600 transition-colors">保存</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors">取消</button>
                  </div>
                )}

                {/* Progress bars */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-gray-400 w-8">年度</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${
                        yPct > 100 ? 'bg-gradient-to-r from-rose-400 to-pink-500' : yPct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      }`} style={{ width: `${Math.min(yPct, 100)}%` }} />
                    </div>
                    <span className="text-gray-500 w-32 text-right">¥{ySpent.toLocaleString()} / ¥{annualTotal.toLocaleString()}</span>
                    <span className={`w-10 text-right font-semibold ${yPct > 100 ? 'text-rose-500' : 'text-gray-500'}`}>{yPct.toFixed(1)}%</span>
                  </div>
                  {b.budgetType === 'monthly' && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-gray-400 w-8">本月</span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          mPct > 100 ? 'bg-gradient-to-r from-rose-400 to-pink-500' : mPct > 80 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        }`} style={{ width: `${Math.min(mPct, 100)}%` }} />
                      </div>
                      <span className="text-gray-500 w-32 text-right">¥{mSpent.toLocaleString()} / ¥{b.amount.toLocaleString()}</span>
                      <span className={`w-10 text-right font-semibold ${mPct > 100 ? 'text-rose-500' : 'text-gray-500'}`}>{mPct.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
