function fmt(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface Props {
  balance: number;
  monthIncome: number;
  monthExpense: number;
  monthBalance: number;
}

export default function BalanceCard({ balance, monthIncome, monthExpense, monthBalance }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-3">
      <StatCard title="当前余额" value={balance} icon="💰" bg="from-violet-500 to-purple-600" textColor="text-white" />
      <StatCard title="本月收入" value={monthIncome} prefix="+" icon="📈" bg="from-emerald-400 to-teal-500" textColor="text-white" />
      <StatCard title="本月支出" value={monthExpense} prefix="-" icon="💸" bg="from-rose-400 to-pink-500" textColor="text-white" />
      <StatCard title="本月结余" value={monthBalance} prefix={monthBalance >= 0 ? '+' : ''} icon={monthBalance >= 0 ? '✅' : '⚠️'}
        bg={monthBalance >= 0 ? 'from-blue-400 to-cyan-500' : 'from-orange-400 to-amber-500'} textColor="text-white" />
    </div>
  );
}

function StatCard({ title, value, icon, bg, textColor, prefix = '' }: {
  title: string; value: number; icon: string; bg: string; textColor: string; prefix?: string;
}) {
  return (
    <div className={`rounded-2xl p-3 md:p-4 bg-gradient-to-br ${bg} shadow-md`}>
      <div className="flex items-center gap-1.5 mb-1.5 md:mb-2">
        <span className="text-sm md:text-base">{icon}</span>
        <p className={`text-[10px] md:text-xs font-medium ${textColor}/80`}>{title}</p>
      </div>
      <p className={`text-base md:text-xl font-bold ${textColor} tracking-tight`}>
        {prefix}¥{fmt(value)}
      </p>
    </div>
  );
}
