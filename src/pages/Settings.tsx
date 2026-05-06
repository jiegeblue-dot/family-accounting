import { useState } from 'react';
import { useApp, generateId } from '../context/AppContext';
import { exportToCSV } from '../utils/export';
import { DEFAULT_PAYERS } from '../utils/defaults';
import ConfirmDialog from '../components/ConfirmDialog';
import { getStoredSecret, setStoredSecret } from '../components/AuthGate';
import type { Category } from '../types';

export default function Settings() {
  const { state, dispatch, resetData } = useApp();
  const [inviteCode, setInviteCode] = useState(getStoredSecret);
  const [codeInput, setCodeInput] = useState('');
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('🏷️');
  const [deleteCat, setDeleteCat] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);

  const [newPayer, setNewPayer] = useState('');
  const [editPayer, setEditPayer] = useState<{ id: string; name: string } | null>(null);

  const incomeCats = state.categories.filter((c) => c.type === 'income');
  const expenseCats = state.categories.filter((c) => c.type === 'expense');
  const defaultPayerIds = new Set(DEFAULT_PAYERS.map((p) => p.id));
  const usedCatIds = new Set(state.transactions.map((t) => t.categoryId));
  const usedPayerIds = new Set(state.transactions.map((t) => t.payerId));

  const handleAddCategory = () => {
    const name = newName.trim();
    if (!name) return;
    dispatch({ type: 'ADD_CATEGORY', payload: { id: `custom-${generateId()}`, name, type: addType, icon: newIcon || '🏷️' } });
    setNewName(''); setNewIcon('🏷️');
  };

  const handleAddPayer = () => {
    const name = newPayer.trim();
    if (!name) return;
    if (editPayer) {
      dispatch({ type: 'UPDATE_PAYER', payload: { ...editPayer, name } });
      setEditPayer(null);
    } else {
      dispatch({ type: 'ADD_PAYER', payload: { id: `payer-${generateId()}`, name } });
    }
    setNewPayer('');
  };

  // Only prevent deleting categories that are in use by transactions
  const canDeleteCat = (catId: string) => !usedCatIds.has(catId);

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-gray-800">设置</h2>

      {/* Payer management */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">记账人管理</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {state.payers.map((p) => (
            <span key={p.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
              👤 {p.name}
              {!defaultPayerIds.has(p.id) && (
                <button onClick={() => { setEditPayer(p); setNewPayer(p.name); }}
                  className="text-indigo-400 hover:text-indigo-600 ml-0.5">✎</button>
              )}
              {!defaultPayerIds.has(p.id) && !usedPayerIds.has(p.id) && (
                <button onClick={() => dispatch({ type: 'DELETE_PAYER', payload: p.id })}
                  className="text-indigo-400 hover:text-red-500 ml-0.5">×</button>
              )}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newPayer} onChange={(e) => setNewPayer(e.target.value)}
            placeholder={editPayer ? '修改名称' : '新增记账人'}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-300"
            onKeyDown={(e) => e.key === 'Enter' && handleAddPayer()} />
          <button onClick={handleAddPayer} disabled={!newPayer.trim()}
            className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors">
            {editPayer ? '保存' : '添加'}
          </button>
          {editPayer && (
            <button onClick={() => { setEditPayer(null); setNewPayer(''); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-xl hover:bg-gray-200 transition-colors">取消</button>
          )}
        </div>
      </div>

      {/* Invite code */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">邀请码</h3>
        <p className="text-[10px] text-gray-400 mb-3">当前邀请码：<span className="font-mono font-bold text-indigo-600 text-sm">{inviteCode || '未设置'}</span>。把邀请码和链接发给家人即可共同记账</p>
        <div className="flex gap-2">
          <input type="text" value={codeInput} onChange={(e) => setCodeInput(e.target.value)}
            placeholder="输入新邀请码（至少4位）"
            className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-300" />
          <button onClick={() => {
            const c = codeInput.trim();
            if (c.length >= 4) { setStoredSecret(c); setInviteCode(c); setCodeInput(''); }
          }} disabled={codeInput.trim().length < 4}
            className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors">
            修改
          </button>
        </div>
      </div>

      {/* Category management */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">分类管理</h3>
        <p className="text-[10px] text-gray-400 mb-3">增删收入和支出分类。已被流水使用的分类不可删除，未使用的可自由删除</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['expense', 'income'] as const).map((t) => (
            <button key={t} onClick={() => setAddType(t)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${addType === t ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t === 'expense' ? '💸 支出' : '💰 收入'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newIcon} onChange={(e) => setNewIcon(e.target.value)}
            className="w-14 text-center text-lg border border-gray-200 rounded-xl outline-none focus:border-indigo-300" maxLength={2} />
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="分类名称" className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-indigo-300"
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} />
          <button onClick={handleAddCategory} disabled={!newName.trim()}
            className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-xl hover:bg-indigo-600 disabled:opacity-40 transition-colors">添加</button>
        </div>
        <div className="mt-3 space-y-2">
          <p className="text-[10px] text-gray-400">收入分类</p>
          <div className="flex flex-wrap gap-1.5">
            {incomeCats.map((c) => (<CatTag key={c.id} cat={c} canDelete={canDeleteCat(c.id)} onDelete={() => setDeleteCat(c.id)} />))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2">支出分类</p>
          <div className="flex flex-wrap gap-1.5">
            {expenseCats.map((c) => (<CatTag key={c.id} cat={c} canDelete={canDeleteCat(c.id)} onDelete={() => setDeleteCat(c.id)} />))}
          </div>
        </div>
      </div>

      {/* Data management */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">数据管理</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportToCSV(state.transactions, state.categories, state.payers)}
            disabled={state.transactions.length === 0}
            className="px-4 py-2 text-sm bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-500 hover:to-teal-600 disabled:opacity-40 transition-all shadow-md">
            📤 导出 CSV
          </button>
          <button onClick={() => setShowReset(true)}
            className="px-4 py-2 text-sm bg-gradient-to-r from-rose-400 to-pink-500 text-white rounded-xl font-medium hover:from-rose-500 hover:to-pink-600 transition-all shadow-md">
            🔄 清除所有数据
          </button>
        </div>
      </div>

      <ConfirmDialog open={deleteCat !== null} title="删除分类" message="确定要删除这个分类吗？" confirmText="删除" danger
        onConfirm={() => { if (deleteCat) dispatch({ type: 'DELETE_CATEGORY', payload: deleteCat }); setDeleteCat(null); }}
        onCancel={() => setDeleteCat(null)} />
      <ConfirmDialog open={showReset} title="清除所有数据" message="确定要清除所有记账数据吗？此操作不可撤销！" confirmText="确认清除" danger
        onConfirm={() => { setShowReset(false); resetData(); }}
        onCancel={() => setShowReset(false)} />
    </div>
  );
}

function CatTag({ cat, canDelete, onDelete }: { cat: Category; canDelete: boolean; onDelete: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full text-[11px] text-gray-600 border border-gray-100">
      {cat.icon} {cat.name}
      {canDelete && <button onClick={onDelete} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>}
    </span>
  );
}
