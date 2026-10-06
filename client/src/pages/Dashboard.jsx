import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PairwiseCard from '../components/PairwiseCard';
import AddExpenseModal from '../components/AddExpenseModal';
import SettleUpModal from '../components/SettleUpModal';
import {
  Plus,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  ArrowLeftRight,
} from 'lucide-react';
import { formatNumber, formatSignedNumber } from '../utils/format';

export default function Dashboard() {
  const { user } = useAuth();

  const [balances, setBalances] = useState(null);
  const [householdUsers, setHouseholdUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [settlePrefillPair, setSettlePrefillPair] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [balRes, usrRes] = await Promise.all([
        api.get('/balances'),
        api.get('/users'),
      ]);

      if (balRes.data?.success) setBalances(balRes.data);
      if (usrRes.data?.success) setHouseholdUsers(usrRes.data.users || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleGeneralSettle = () => {
    setSettlePrefillPair(null);
    setIsSettleUpOpen(true);
  };

  const mySummary = balances?.mySummary || {
    totalOwed: 0,
    totalOwe: 0,
    netBalance: 0,
  };

  const pairs = balances?.pairs || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#d6deeb]">
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ffffff] tracking-tight">
              Household Balances
            </h1>
            <button
              onClick={handleRefresh}
              className={`p-1.5 text-[#7f97b2] hover:text-[#7fdbca] rounded-lg hover:bg-[#0b253a] transition ${
                refreshing ? 'animate-spin text-[#7fdbca]' : ''
              }`}
              title="Refresh balances"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-[#7f97b2] mt-1">
            Real-time pairwise debt tracking for your 3-roommate home
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleGeneralSettle}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-[#0b253a] hover:bg-[#13344f] active:bg-[#13344f] text-[#d6deeb] text-sm font-bold rounded-lg border border-[#1d3b53] hover:border-[#2b5475] transition flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#22da6e]" />
            <span>Settle Up</span>
          </button>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-[#7fdbca] hover:bg-[#7fdbca]/90 active:bg-[#68c9b8] text-[#011627] text-sm font-black rounded-lg shadow-md shadow-[#7fdbca]/20 transition flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Net Summary Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Your Net Position */}
        <div className="bg-[#0b253a] rounded-lg p-5 border border-[#1d3b53] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
              Your Net Position
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                mySummary.netBalance > 0
                  ? 'bg-[#22da6e]/15 text-[#22da6e]'
                  : mySummary.netBalance < 0
                  ? 'bg-[#ff5874]/15 text-[#ff5874]'
                  : 'bg-[#13344f] text-[#7fdbca]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span
              className={`text-2xl font-black tracking-tight ${
                mySummary.netBalance > 0
                  ? 'text-[#22da6e]'
                  : mySummary.netBalance < 0
                  ? 'text-[#ff5874]'
                  : 'text-[#d6deeb]'
              }`}
            >
              {formatSignedNumber(mySummary.netBalance)}
            </span>
            <span
              className={`text-xs font-bold ml-1 ${
                mySummary.netBalance > 0
                  ? 'text-[#22da6e]/80'
                  : mySummary.netBalance < 0
                  ? 'text-[#ff5874]/80'
                  : 'text-[#7f97b2]'
              }`}
            >
              Ks
            </span>
          </div>
          <p className="text-xs text-[#7f97b2] mt-1">
            {mySummary.netBalance > 0
              ? 'You are owed money overall'
              : mySummary.netBalance < 0
              ? 'You owe money overall'
              : 'All balances squared away'}
          </p>
        </div>

        {/* Card 2: You are Owed */}
        <div className="bg-[#0b253a] rounded-lg p-5 border border-[#1d3b53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
              You are Owed
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#22da6e]/15 text-[#22da6e] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-[#22da6e]">
              +{formatNumber(mySummary.totalOwed)}
            </span>
            <span className="text-xs font-bold text-[#22da6e]/80 ml-1">
              Ks
            </span>
          </div>
          <p className="text-xs text-[#7f97b2] mt-1">From roommate shares</p>
        </div>

        {/* Card 3: You Owe */}
        <div className="bg-[#0b253a] rounded-lg p-5 border border-[#1d3b53] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
              You Owe
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#ff5874]/15 text-[#ff5874] flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-[#ff5874]">
              -{formatNumber(mySummary.totalOwe)}
            </span>
            <span className="text-xs font-bold text-[#ff5874]/80 ml-1">
              Ks
            </span>
          </div>
          <p className="text-xs text-[#7f97b2] mt-1">To other roommates</p>
        </div>
      </div>

      {/* 3 Distinct Pairwise Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-[#ffffff] tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-[#7fdbca] stroke-[2.25]" />
              <span>Exact Pairwise Balances</span>
            </h2>
            <p className="text-xs text-[#7f97b2]">
              Direct debt relationship between each pair of roommates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pairs.length > 0 ? (
            pairs.map((pair) => (
              <PairwiseCard
                key={pair.pairId}
                pair={pair}
                currentUser={user}
              />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center bg-[#0b253a] rounded-lg border border-[#1d3b53] text-[#7f97b2]">
              <p className="text-sm font-semibold">Loading pairwise balances...</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        users={householdUsers}
        currentUser={user}
        onExpenseAdded={fetchDashboardData}
      />

      <SettleUpModal
        isOpen={isSettleUpOpen}
        onClose={() => setIsSettleUpOpen(false)}
        users={householdUsers}
        prefillPair={settlePrefillPair}
        currentUser={user}
        onSettled={fetchDashboardData}
      />
    </div>
  );
}
