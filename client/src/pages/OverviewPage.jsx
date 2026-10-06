import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatNumber } from '../utils/format';
import { BarChart3, RefreshCw, Loader2, Receipt, CheckCircle } from 'lucide-react';

export default function OverviewPage() {
  const { user } = useAuth();
  const [balances, setBalances] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [householdUsers, setHouseholdUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverviewData = useCallback(async () => {
    try {
      const [balRes, expRes, setRes, usrRes] = await Promise.all([
        api.get('/balances'),
        api.get('/expenses'),
        api.get('/settlements'),
        api.get('/users'),
      ]);
      if (balRes.data?.success) setBalances(balRes.data);
      if (expRes.data?.success) setExpenses(expRes.data.expenses || []);
      if (setRes.data?.success) setSettlements(setRes.data.settlements || []);
      if (usrRes.data?.success) setHouseholdUsers(usrRes.data.users || []);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOverviewData();
  };

  const totalSpend = balances?.totalHouseholdSpend || 0;
  const totalExpensesCount = balances?.totalExpensesCount || expenses.length;
  const totalSettlementsCount = balances?.totalSettlementsCount || settlements.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#d6deeb]">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1d3b53]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#82aaff]/15 text-[#82aaff] flex items-center justify-center border border-[#82aaff]/30">
              <BarChart3 className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ffffff] tracking-tight">
              Household Overview
            </h1>
            <button
              onClick={handleRefresh}
              className={`p-1.5 text-[#7f97b2] hover:text-[#7fdbca] rounded-lg hover:bg-[#0b253a] transition ${
                refreshing ? 'animate-spin text-[#7fdbca]' : ''
              }`}
              title="Refresh overview"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#7f97b2]">
            Comprehensive financial breakdown & out-of-pocket spending per flatmate
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#7f97b2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#7fdbca]" />
          <p className="text-sm font-semibold">Loading household statistics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Total Group Spend */}
            <div className="bg-[#0b253a] rounded-lg p-6 border border-[#1d3b53] shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
                  Total Group Spending
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#7fdbca]/15 text-[#7fdbca] flex items-center justify-center border border-[#7fdbca]/30">
                  <BarChart3 className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#7fdbca] tracking-tight">
                  {formatNumber(totalSpend)}
                </span>
                <span className="text-xs font-bold text-[#7fdbca]/80 ml-1">
                  Ks
                </span>
              </div>
              <p className="text-xs text-[#7f97b2] mt-1.5">Across all logged roommate expenses</p>
            </div>

            {/* Card 2: Total Logged Expenses */}
            <div className="bg-[#0b253a] rounded-lg p-6 border border-[#1d3b53] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
                  Logged Expenses
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#82aaff]/15 text-[#82aaff] flex items-center justify-center border border-[#82aaff]/30">
                  <Receipt className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#ffffff] tracking-tight">
                  {totalExpensesCount}
                </span>
              </div>
              <p className="text-xs text-[#7f97b2] mt-1.5">Shared transactions recorded</p>
            </div>

            {/* Card 3: Settlements Made */}
            <div className="bg-[#0b253a] rounded-lg p-6 border border-[#1d3b53] shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7f97b2]">
                  Settlements Made
                </span>
                <div className="w-9 h-9 rounded-lg bg-[#22da6e]/15 text-[#22da6e] flex items-center justify-center border border-[#22da6e]/30">
                  <CheckCircle className="w-5 h-5 stroke-[2.25]" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black text-[#22da6e] tracking-tight">
                  {totalSettlementsCount}
                </span>
              </div>
              <p className="text-xs text-[#7f97b2] mt-1.5">Debts squared away between flatmates</p>
            </div>
          </div>

          {/* Detailed Section: Spent by Each Person */}
          <div className="bg-[#0b253a] rounded-lg p-4 sm:p-5 border border-[#1d3b53] shadow-sm space-y-3">
            <div className="pb-2.5 border-b border-[#1d3b53]">
              <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Spent by Each Person</h2>
            </div>

            <div className="space-y-2.5 pt-0.5">
              {householdUsers.map((member) => {
                const memberSpend = expenses
                  .filter((e) => (e.paidBy?._id || e.paidBy) === member._id)
                  .reduce((sum, e) => sum + (e.amount || 0), 0);
                const pct = totalSpend > 0 ? Math.min(100, Math.round((memberSpend / totalSpend) * 100)) : 0;
                const isMe = member._id === user?._id;

                return (
                  <div
                    key={`page-spend-${member._id}`}
                    className="px-3 py-2 sm:px-3.5 sm:py-2.5 bg-[#071c2f]/70 rounded-lg border border-[#1d3b53]/80 space-y-1.5 shadow-2xs hover:border-[#2b5475] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[#011627] text-[10px] sm:text-xs font-black shadow-xs ring-1 ring-[#1d3b53]"
                          style={{ backgroundColor: member.avatarColor || '#7fdbca' }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-[#ffffff] leading-tight">
                            {member.name} {isMe ? '(You)' : ''}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-[#5f7e97] leading-tight mt-0.5">{member.email}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="font-extrabold text-[#ffffff] text-xs sm:text-sm">
                            {formatNumber(memberSpend)}
                          </span>
                          <span className="text-[10px] font-bold text-[#7f97b2]">
                            Ks
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] text-[#7f97b2] font-semibold block leading-tight mt-0.5">
                          {pct}% of household total
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1 bg-[#011627] rounded-full overflow-hidden border border-[#1d3b53]/40">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: member.avatarColor || '#7fdbca',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
