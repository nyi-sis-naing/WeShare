import { useState, useMemo } from 'react';
import api from '../services/api';
import {
  Trash2,
  Calendar,
  List,
  Users,
  CheckCircle,
  Receipt,
  ShoppingBag,
  Zap,
  Building2,
  UtensilsCrossed,
  Layers,
  Tv,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { formatNumber } from '../utils/format';
import {
  getCurrentMonthKey,
  getMonthKey,
  formatMonthLabel,
  formatShortDate,
} from '../utils/date';
import ActivityDetailModal from './ActivityDetailModal';
import ClearHistoryModal from './ClearHistoryModal';
import ActivityCalendarView from './ActivityCalendarView';

const CATEGORY_ICONS = {
  Groceries: ShoppingBag,
  Utilities: Zap,
  Rent: Building2,
  Dining: UtensilsCrossed,
  Household: Layers,
  Entertainment: Tv,
  Other: Tag,
};

export default function ExpenseList({
  expenses = [],
  settlements = [],
  currentUser,
  onExpenseDeleted,
  onHistoryCleared,
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [deletingId, setDeletingId] = useState(null);

  // Modal states
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearScope, setClearScope] = useState('all');
  const [clearing, setClearing] = useState(false);

  // Combine and sort expenses and settlements chronologically (newest first)
  const combinedActivity = useMemo(() => {
    return [
      ...expenses.map((e) => ({
        ...e,
        activityType: 'expense',
        sortDate: new Date(e.date),
        monthKey: getMonthKey(e.date),
      })),
      ...settlements.map((s) => ({
        ...s,
        activityType: 'settlement',
        sortDate: new Date(s.date),
        monthKey: getMonthKey(s.date),
      })),
    ].sort((a, b) => b.sortDate - a.sortDate);
  }, [expenses, settlements]);

  // Unique list of year-months present in data
  const availableMonths = useMemo(() => {
    const monthSet = new Set();
    combinedActivity.forEach((item) => {
      if (item.monthKey && item.monthKey !== 'unknown') {
        monthSet.add(item.monthKey);
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [combinedActivity]);

  // Filter by activity type tab
  const typeFiltered = useMemo(() => {
    if (activeTab === 'expenses') {
      return combinedActivity.filter((item) => item.activityType === 'expense');
    }
    if (activeTab === 'settlements') {
      return combinedActivity.filter((item) => item.activityType === 'settlement');
    }
    return combinedActivity;
  }, [combinedActivity, activeTab]);

  // Filter by selected month
  const filteredItems = useMemo(() => {
    if (selectedMonth === 'all') {
      return typeFiltered;
    }
    return typeFiltered.filter((item) => item.monthKey === selectedMonth);
  }, [typeFiltered, selectedMonth]);

  // Group filtered activity records by month
  const monthlyGroups = useMemo(() => {
    const groups = {};
    filteredItems.forEach((item) => {
      const key = item.monthKey;
      if (!groups[key]) {
        groups[key] = {
          monthKey: key,
          label: formatMonthLabel(key),
          items: [],
          totalExpenseAmount: 0,
          settlementCount: 0,
        };
      }
      groups[key].items.push(item);
      if (item.activityType === 'expense') {
        groups[key].totalExpenseAmount += item.amount || 0;
      } else {
        groups[key].settlementCount += 1;
      }
    });
    return Object.values(groups);
  }, [filteredItems]);

  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await api.delete(`/expenses/${id}`);
      if (res.data.success) {
        if (selectedActivity && selectedActivity._id === id) {
          setSelectedActivity(null);
        }
        if (onExpenseDeleted) {
          onExpenseDeleted(id);
        }
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
      alert(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    setClearing(true);
    try {
      const query = clearScope === 'month' && selectedMonth !== 'all' ? `?month=${selectedMonth}` : '?month=all';
      const res = await api.delete(`/expenses/clear${query}`);
      if (res.data.success) {
        setIsClearModalOpen(false);
        setSelectedActivity(null);
        if (onHistoryCleared) {
          onHistoryCleared();
        }
      }
    } catch (err) {
      console.error('Failed to clear history:', err);
      alert(err.response?.data?.message || 'Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="bg-[#0b253a] rounded-lg border border-[#1d3b53] shadow-sm overflow-hidden text-[#d6deeb]">
      {/* Header and Controls */}
      <div className="p-5 border-b border-[#1d3b53] bg-[#081e31]/70 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-[#ffffff] text-base">Household Activity History</h3>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* View Mode Switcher: List vs Calendar */}
            <div className="flex items-center gap-1 bg-[#011627] p-1 rounded-lg border border-[#1d3b53]">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-[#0b253a] text-[#7fdbca] border border-[#1d3b53] shadow-xs'
                    : 'text-[#7f97b2] hover:text-[#d6deeb]'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                  viewMode === 'calendar'
                    ? 'bg-[#0b253a] text-[#7fdbca] border border-[#1d3b53] shadow-xs'
                    : 'text-[#7f97b2] hover:text-[#d6deeb]'
                }`}
                title="Calendar View"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* Action: Clear History Button */}
            {combinedActivity.length > 0 && (
              <button
                onClick={() => {
                  setClearScope(selectedMonth !== 'all' ? 'month' : 'all');
                  setIsClearModalOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-[#ff5874] hover:text-[#ff7890] bg-[#ff5874]/10 hover:bg-[#ff5874]/20 rounded-lg border border-[#ff5874]/30 transition flex items-center gap-1.5 shadow-xs"
                title="Clear activity history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Toolbar (Shown only in list mode) */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Monthly Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#7f97b2] uppercase tracking-wider">
                Month:
              </span>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold text-[#d6deeb] bg-[#011627] border border-[#1d3b53] hover:border-[#2b5475] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/30 focus:border-[#7fdbca] transition shadow-2xs"
                >
                  <option value={getCurrentMonthKey()}>
                    This Month ({formatMonthLabel(getCurrentMonthKey())})
                  </option>
                  <option value="all">All Months ({availableMonths.length})</option>
                  {availableMonths
                    .filter((m) => m !== getCurrentMonthKey())
                    .map((m) => (
                      <option key={m} value={m}>
                        {formatMonthLabel(m)}
                      </option>
                    ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#7f97b2] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 bg-[#011627] p-1 rounded-lg text-xs font-semibold border border-[#1d3b53] overflow-x-auto max-w-full scrollbar-none">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-md transition font-bold ${
                  activeTab === 'all'
                    ? 'bg-[#0b253a] text-[#7fdbca] shadow-2xs border border-[#1d3b53]'
                    : 'text-[#7f97b2] hover:text-[#d6deeb]'
                }`}
              >
                All ({expenses.length + settlements.length})
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-3 py-1 rounded-md transition font-bold ${
                  activeTab === 'expenses'
                    ? 'bg-[#0b253a] text-[#7fdbca] shadow-2xs border border-[#1d3b53]'
                    : 'text-[#7f97b2] hover:text-[#d6deeb]'
                }`}
              >
                Expenses ({expenses.length})
              </button>
              <button
                onClick={() => setActiveTab('settlements')}
                className={`px-3 py-1 rounded-md transition font-bold ${
                  activeTab === 'settlements'
                    ? 'bg-[#0b253a] text-[#7fdbca] shadow-2xs border border-[#1d3b53]'
                    : 'text-[#7f97b2] hover:text-[#d6deeb]'
                }`}
              >
                Settlements ({settlements.length})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main View Area: Calendar View vs List View */}
      {viewMode === 'calendar' ? (
        <div className="p-4 sm:p-5">
          <ActivityCalendarView
            expenses={expenses}
            settlements={settlements}
            currentUser={currentUser}
            onSelectActivity={setSelectedActivity}
          />
        </div>
      ) : (
        /* Monthly Grouped List Feed */
        <div className="divide-y divide-[#1d3b53] max-h-[560px] overflow-y-auto">
        {monthlyGroups.length === 0 ? (
          <div className="py-14 text-center text-[#5f7e97]">
            <Receipt className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#7f97b2]" />
            <p className="text-sm font-semibold text-[#7f97b2]">
              No activity for {formatMonthLabel(selectedMonth)}
            </p>
            <p className="text-xs text-[#5f7e97] mt-1">
              {selectedMonth !== 'all' ? (
                <span>
                  No expenses or settlements recorded this month.{' '}
                  <button
                    onClick={() => setSelectedMonth('all')}
                    className="text-[#7fdbca] font-bold hover:underline ml-1"
                  >
                    View All Months
                  </button>
                </span>
              ) : (
                'Add your first shared expense or settle up above'
              )}
            </p>
          </div>
        ) : (
          monthlyGroups.map((group) => (
            <div key={group.monthKey} className="divide-y divide-[#1d3b53]">
              {/* Monthly Section Header */}
              <div className="sticky top-0 z-10 px-5 py-2.5 bg-[#071c2f]/95 backdrop-blur-xs flex items-center justify-between border-y border-[#1d3b53]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#7fdbca]" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#ffffff]">
                    {group.label}
                  </span>
                  <span className="text-[11px] text-[#7f97b2] font-medium">
                    ({group.items.length} {group.items.length === 1 ? 'record' : 'records'})
                  </span>
                </div>
              </div>

              {/* Items in this Month */}
              {group.items.map((item) => {
                if (item.activityType === 'settlement') {
                  return (
                    <div
                      key={`settle-${item._id}`}
                      onClick={() => setSelectedActivity(item)}
                      className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 hover:bg-[#0f2d45]/70 active:bg-[#0f2d45] transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#22da6e]/15 text-[#22da6e] flex items-center justify-center shrink-0 border border-[#22da6e]/30 group-hover:scale-105 transition-transform">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-[#ffffff] text-xs sm:text-sm truncate group-hover:text-[#7fdbca] transition-colors block">
                            {item.payer?.name} paid {item.receiver?.name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-[#7f97b2] mt-0.5">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#5f7e97]" />
                              {formatShortDate(item.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="font-black text-[#22da6e] text-sm sm:text-base">
                            {formatNumber(item.amount)}
                          </span>
                          <span className="text-[11px] font-bold text-[#22da6e]/80">
                            Ks
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Expense Item
                const IconComponent = CATEGORY_ICONS[item.category] || Receipt;
                const isPayerMe = item.paidBy?._id === currentUser?._id;
                const splitCount = item.splitBetween?.length || 1;

                return (
                  <div
                    key={`exp-${item._id}`}
                    onClick={() => setSelectedActivity(item)}
                    className="px-3.5 py-2.5 sm:px-4 sm:py-2.5 hover:bg-[#0f2d45]/70 active:bg-[#0f2d45] transition flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#13344f] text-[#82aaff] flex items-center justify-center shrink-0 group-hover:bg-[#1d3b53] group-hover:scale-105 border border-[#1d3b53] transition">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#ffffff] text-xs sm:text-sm truncate group-hover:text-[#7fdbca] transition-colors block">
                          {item.title}
                        </span>

                        <div className="flex items-center gap-2 sm:gap-3 text-[11px] text-[#7f97b2] mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#5f7e97]" />
                            {formatShortDate(item.date)}
                          </span>
                          <span>
                            Paid by{' '}
                            <strong className="text-[#d6deeb] font-semibold">
                              {isPayerMe ? 'You' : item.paidBy?.name}
                            </strong>
                          </span>
                          <span className="flex items-center gap-1 text-[#7f97b2]">
                            <Users className="w-3 h-3 text-[#5f7e97]" />
                            Split {splitCount} ways ({formatNumber(item.amount / splitCount)} Ks ea)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="font-black text-[#ffffff] text-sm sm:text-base">
                            {formatNumber(item.amount)}
                          </span>
                          <span className="text-[11px] font-bold text-[#7f97b2]">
                            Ks
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExpense(item._id, item.title);
                        }}
                        disabled={deletingId === item._id}
                        className="p-1.5 text-[#5f7e97] hover:text-[#ff5874] hover:bg-[#ff5874]/15 rounded-md transition opacity-60 group-hover:opacity-100"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    )}

      {/* Activity Detail Modal */}
      <ActivityDetailModal
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
        currentUser={currentUser}
        onDeleteExpense={handleDeleteExpense}
        isDeleting={deletingId === selectedActivity?._id}
      />

      {/* Clear Confirmation Modal */}
      <ClearHistoryModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        selectedMonth={selectedMonth}
        clearScope={clearScope}
        setClearScope={setClearScope}
        onConfirmClear={handleClearHistory}
        clearing={clearing}
      />
    </div>
  );
}
