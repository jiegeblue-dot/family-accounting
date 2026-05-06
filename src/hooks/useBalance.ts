import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export function useBalance() {
  const { state } = useApp();

  return useMemo(() => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let totalIncome = 0;
    let totalExpense = 0;
    let monthIncome = 0;
    let monthExpense = 0;

    for (const t of state.transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
        if (t.date.startsWith(thisMonth)) monthIncome += t.amount;
      } else {
        totalExpense += t.amount;
        if (t.date.startsWith(thisMonth)) monthExpense += t.amount;
      }
    }

    return {
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      monthIncome,
      monthExpense,
      monthBalance: monthIncome - monthExpense,
    };
  }, [state.transactions]);
}
