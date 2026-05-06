import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmDialog from './ConfirmDialog';
import EmptyState from './EmptyState';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  compact?: boolean;
}

export default function TransactionList({ transactions, onEdit, compact }: Props) {
  const { state, dispatch } = useApp();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const catMap = useMemo(() => new Map(state.categories.map((c) => [c.id, c])), [state.categories]);
  const payerMap = useMemo(() => new Map(state.payers.map((p) => [p.id, p])), [state.payers]);

  const getCat = (id: string) => catMap.get(id) ?? { name: '未知', icon: '❓' };
  const getPayer = (id: string) => payerMap.get(id)?.name ?? '';

  const list = compact ? transactions.slice(0, 5) : transactions;

  if (list.length === 0) {
    return <EmptyState icon="📋" title="还没有记录" description="点击右下角按钮记一笔吧" />;
  }

  return (
    <>
      <div className="space-y-2">
        {list.map((t) => {
          const cat = getCat(t.categoryId);
          const isIncome = t.type === 'income';
          return (
            <div key={t.id}
              onClick={() => onEdit(t)}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-3 md:p-3.5 flex items-center gap-3 border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer active:bg-gray-50">
              <span className="text-2xl shrink-0">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] md:text-sm font-semibold text-gray-800 truncate">{cat.name}</span>
                  {getPayer(t.payerId) && (
                    <span className="text-[10px] md:text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full shrink-0">
                      {getPayer(t.payerId)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] md:text-xs text-gray-400">
                  {t.date}
                  {t.note && <span className="ml-1 text-gray-500">· {t.note}</span>}
                </p>
              </div>
              <span className={`text-sm md:text-sm font-bold whitespace-nowrap ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isIncome ? '+' : '-'}¥{t.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
              <button onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }}
                className="shrink-0 text-gray-300 hover:text-red-400 transition-all p-1.5 text-base">
                🗑️
              </button>
            </div>
          );
        })}
      </div>
      <ConfirmDialog open={deleteId !== null} title="删除记录" message="确定要删除这条记录吗？" confirmText="删除" danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_TRANSACTION', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)} />
    </>
  );
}
