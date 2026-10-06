import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExpenseList from '../components/ExpenseList';
import { History, RefreshCw, Loader2 } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistoryData = useCallback(async () => {
    try {
      const [expRes, setRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/settlements'),
      ]);
      if (expRes.data.success) setExpenses(expRes.data.expenses || []);
      if (setRes.data.success) setSettlements(setRes.data.settlements || []);
    } catch (err) {
      console.error('Failed to load history data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistoryData();
  };

  const handleExpenseDeleted = (deletedId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== deletedId));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-[#d6deeb]">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1d3b53]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#7fdbca]/15 text-[#7fdbca] flex items-center justify-center border border-[#7fdbca]/30">
              <History className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ffffff] tracking-tight">
              Household Activity History
            </h1>
            <button
              onClick={handleRefresh}
              className={`p-1.5 text-[#7f97b2] hover:text-[#7fdbca] rounded-lg hover:bg-[#0b253a] transition ${
                refreshing ? 'animate-spin text-[#7fdbca]' : ''
              }`}
              title="Refresh history"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#7f97b2]">
            Detailed monthly log of shared household expenses and debt repayments
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#7f97b2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#7fdbca]" />
          <p className="text-sm font-semibold">Loading transaction records...</p>
        </div>
      ) : (
        <div className="shadow-lg rounded-lg overflow-hidden border border-[#1d3b53]">
          <ExpenseList
            expenses={expenses}
            settlements={settlements}
            currentUser={user}
            onExpenseDeleted={handleExpenseDeleted}
            onHistoryCleared={fetchHistoryData}
          />
        </div>
      )}
    </div>
  );
}
