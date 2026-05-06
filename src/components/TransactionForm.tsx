import { useState, useEffect } from 'react';
import { useApp, generateId } from '../context/AppContext';
import type { Transaction } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  edit?: Transaction | null;
}

export default function TransactionForm({ open, onClose, edit }: Props) {
  const { state, dispatch } = useApp();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [payerId, setPayerId] = useState(state.payers[0]?.id || '');

  const filteredCategories = state.categories.filter((c) => c.type === type);

  useEffect(() => {
    if (edit) {
      setType(edit.type);
      setAmount(edit.amount.toString());
      setCategoryId(edit.categoryId);
      setDate(edit.date);
      setNote(edit.note);
      setPayerId(edit.payerId);
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
      setPayerId(state.payers[0]?.id || '');
    }
  }, [edit, open]);

  useEffect(() => {
    const cats = state.categories.filter((c) => c.type === type);
    if (cats.length > 0 && !cats.find((c) => c.id === categoryId)) {
      setCategoryId(cats[0].id);
    }
  }, [type, state.categories, categoryId]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !categoryId) return;

    const transaction: Transaction = {
      id: edit?.id ?? generateId(),
      type,
      amount: Math.round(amt * 100) / 100,
      categoryId,
      date,
      note: note.trim(),
      payerId: payerId || state.payers[0]?.id || '',
      createdAt: edit?.createdAt ?? Date.now(),
    };

    if (edit) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-800">{edit ? '编辑记录' : '记一笔'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  type === t ? (t === 'expense' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md' : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md') : 'text-gray-500'
                }`}
              >
                {t === 'expense' ? '💸 支出' : '💰 收入'}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">金额</label>
            <div className="flex items-center border-2 border-gray-100 rounded-xl px-4 py-2.5 focus-within:border-indigo-300 transition-colors bg-gray-50">
              <span className="text-gray-400 mr-1 text-lg">¥</span>
              <input type="number" step="0.01" min="0.01" required value={amount}
                onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                className="flex-1 outline-none text-xl font-bold bg-transparent" autoFocus />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">分类</label>
            <div className="grid grid-cols-5 gap-1.5">
              {filteredCategories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => setCategoryId(cat.id)}
                  className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] transition-all ${
                    categoryId === cat.id
                      ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Payer row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">日期</label>
              <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none bg-gray-50 focus:border-indigo-300 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">记账人</label>
              <select value={payerId} onChange={(e) => setPayerId(e.target.value)}
                className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm outline-none bg-gray-50 focus:border-indigo-300 transition-colors">
                {state.payers.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">备注（可选）</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..." className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none bg-gray-50 focus:border-indigo-300 transition-colors" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-sm font-medium rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              取消
            </button>
            <button type="submit"
              className={`flex-1 py-3 text-sm font-bold rounded-xl text-white shadow-lg transition-all ${
                type === 'expense' ? 'bg-gradient-to-r from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600' : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600'
              }`}>
              {edit ? '💾 保存' : type === 'expense' ? '📝 记支出' : '📝 记收入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
