import { useState } from 'react';
import Dashboard from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Analysis from '../pages/Analysis';
import Budget from '../pages/Budget';
import Settings from '../pages/Settings';

type Page = 'dashboard' | 'transactions' | 'analysis' | 'budget' | 'settings';

const navItems: { key: Page; label: string; icon: string }[] = [
  { key: 'dashboard', label: '首页', icon: '📊' },
  { key: 'transactions', label: '流水', icon: '📋' },
  { key: 'analysis', label: '分析', icon: '📈' },
  { key: 'budget', label: '预算', icon: '🎯' },
  { key: 'settings', label: '设置', icon: '⚙️' },
];

export default function Layout() {
  const [page, setPage] = useState<Page>('dashboard');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 bg-gradient-to-b from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="p-5 border-b border-white/10">
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-2xl mr-2">🏠</span>家庭记账
          </h1>
          <p className="text-indigo-200 text-xs mt-1">每一笔都心中有数</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                page === item.key
                  ? 'bg-white/20 text-white shadow-lg shadow-black/10'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 text-xs text-indigo-300">
          家庭记账 v2.0
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto p-3 md:p-6">
          {renderPage(page)}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 flex shadow-xl safe-bottom">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setPage(item.key)}
            className={`flex-1 flex flex-col items-center pt-2 pb-1 text-[11px] font-medium transition-colors ${
              page === item.key ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function renderPage(page: Page) {
  switch (page) {
    case 'dashboard': return <Dashboard />;
    case 'transactions': return <Transactions />;
    case 'analysis': return <Analysis />;
    case 'budget': return <Budget />;
    case 'settings': return <Settings />;
  }
}
