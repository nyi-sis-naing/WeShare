import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Receipt,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { formatNumber } from '../utils/format';
import { formatFullDate } from '../utils/date';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const toDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function ActivityCalendarView({
  expenses = [],
  settlements = [],
  onSelectActivity,
  currentUser,
}) {
  const now = new Date();
  const todayStr = toDateString(now);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr);

  // Group all transactions by "YYYY-MM-DD"
  const activityByDay = useMemo(() => {
    const map = {};

    expenses.forEach((e) => {
      if (!e.date) return;
      const key = toDateString(new Date(e.date));
      if (!map[key]) {
        map[key] = { expenses: [], settlements: [], totalExpense: 0, totalSettlement: 0 };
      }
      map[key].expenses.push(e);
      map[key].totalExpense += e.amount || 0;
    });

    settlements.forEach((s) => {
      if (!s.date) return;
      const key = toDateString(new Date(s.date));
      if (!map[key]) {
        map[key] = { expenses: [], settlements: [], totalExpense: 0, totalSettlement: 0 };
      }
      map[key].settlements.push(s);
      map[key].totalSettlement += s.amount || 0;
    });

    return map;
  }, [expenses, settlements]);

  // Generate 35 or 42 grid cells for the current viewMonth
  const calendarCells = useMemo(() => {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // 1. Previous month trailing days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const dateObj = new Date(viewYear, viewMonth - 1, dayNum);
      const dateStr = toDateString(dateObj);
      cells.push({
        dateObj,
        dayNum,
        dateStr,
        isCurrentMonth: false,
        data: activityByDay[dateStr] || null,
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dateObj = new Date(viewYear, viewMonth, dayNum);
      const dateStr = toDateString(dateObj);
      cells.push({
        dateObj,
        dayNum,
        dateStr,
        isCurrentMonth: true,
        data: activityByDay[dateStr] || null,
      });
    }

    // 3. Next month leading days (fill up to 35 or 42)
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const dateObj = new Date(viewYear, viewMonth + 1, dayNum);
      const dateStr = toDateString(dateObj);
      cells.push({
        dateObj,
        dayNum,
        dateStr,
        isCurrentMonth: false,
        data: activityByDay[dateStr] || null,
      });
    }

    return cells;
  }, [viewYear, viewMonth, activityByDay]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const d = new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelectedDateStr(toDateString(d));
  };

  const selectedDayData = activityByDay[selectedDateStr] || { expenses: [], settlements: [] };
  const hasSelectedDayActivity =
    selectedDayData.expenses.length > 0 || selectedDayData.settlements.length > 0;

  const monthlyTotalSpend = calendarCells
    .filter((c) => c.isCurrentMonth && c.data)
    .reduce((sum, c) => sum + (c.data.totalExpense || 0), 0);

  return (
    <div className="space-y-3.5 animate-fade-in text-[#d6deeb]">
      {/* Calendar Navigation Header - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 bg-[#071c2f] rounded-lg border border-[#1d3b53]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#7fdbca]/15 text-[#7fdbca] flex items-center justify-center border border-[#7fdbca]/30 shrink-0">
            <CalendarIcon className="w-4 h-4 stroke-[2.25]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#ffffff] tracking-tight">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h3>
              <button
                type="button"
                onClick={handleJumpToToday}
                className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-[#0b253a] text-[#7fdbca] border border-[#1d3b53] hover:border-[#7fdbca]/50 transition"
              >
                Today
              </button>
            </div>
            <p className="text-[11px] text-[#7f97b2] leading-tight mt-0.5">
              Monthly spend:{' '}
              <span className="font-extrabold text-[#7fdbca]">
                {formatNumber(monthlyTotalSpend)} Ks
              </span>
            </p>
          </div>
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-1 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-md bg-[#0b253a] hover:bg-[#13344f] text-[#7f97b2] hover:text-[#ffffff] border border-[#1d3b53] transition"
            title="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-md bg-[#0b253a] hover:bg-[#13344f] text-[#7f97b2] hover:text-[#ffffff] border border-[#1d3b53] transition"
            title="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Themed Calendar Grid - Compact Height */}
      <div className="bg-[#0b253a] rounded-lg border border-[#1d3b53] overflow-hidden shadow-xs">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-[#1d3b53] bg-[#071c2f]/95 text-center">
          {DAYS_OF_WEEK.map((dayName, idx) => (
            <div
              key={dayName}
              className={`py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                idx === 0 || idx === 6 ? 'text-[#ff5874]/80' : 'text-[#7f97b2]'
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar Day Cells - Compact heights: h-12 on mobile, h-14 on desktop */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#1d3b53]/60">
          {calendarCells.map((cell) => {
            const isToday = cell.dateStr === todayStr;
            const isSelected = cell.dateStr === selectedDateStr;
            const hasData = !!cell.data;
            const expenseCount = cell.data?.expenses?.length || 0;
            const settlementCount = cell.data?.settlements?.length || 0;

            return (
              <button
                key={cell.dateStr}
                type="button"
                onClick={() => setSelectedDateStr(cell.dateStr)}
                className={`h-12 sm:h-14 p-1 sm:p-1.5 text-left transition-all flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#13344f] ring-2 ring-inset ring-[#7fdbca]'
                    : cell.isCurrentMonth
                    ? 'bg-[#0b253a] hover:bg-[#0f2d45]'
                    : 'bg-[#061827]/60 text-[#3b5973] hover:bg-[#0b253a]/40'
                }`}
              >
                {/* Header of cell: day number + indicator dots */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[11px] font-black px-1 py-0.2 rounded ${
                      isToday
                        ? 'bg-[#7fdbca] text-[#011627]'
                        : isSelected
                        ? 'text-[#7fdbca]'
                        : cell.isCurrentMonth
                        ? 'text-[#d6deeb]'
                        : 'text-[#486b88]'
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {/* Tiny dot indicators */}
                  {hasData && (
                    <div className="flex items-center gap-0.5">
                      {expenseCount > 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#7fdbca]"
                          title={`${expenseCount} expense(s)`}
                        />
                      )}
                      {settlementCount > 0 && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#22da6e]"
                          title={`${settlementCount} settlement(s)`}
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Body of cell: Daily amount spent */}
                <div className="w-full text-right leading-none mt-auto">
                  {cell.data?.totalExpense > 0 ? (
                    <div className="inline-flex items-baseline gap-0.5 justify-end">
                      <span className="text-[10px] sm:text-[11px] font-black text-[#7fdbca] leading-none truncate max-w-full">
                        {formatNumber(cell.data.totalExpense)}
                      </span>
                      <span className="text-[8px] font-bold text-[#7fdbca]/75 hidden sm:inline leading-none">
                        Ks
                      </span>
                    </div>
                  ) : cell.data?.totalSettlement > 0 ? (
                    <div className="inline-flex items-center justify-end gap-0.5 text-right">
                      <CheckCircle className="w-2.5 h-2.5 text-[#22da6e]" />
                      <span className="text-[9px] font-bold text-[#22da6e] leading-none">
                        Paid
                      </span>
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Panel - Compact */}
      <div className="p-3 sm:p-4 bg-[#071c2f] rounded-lg border border-[#1d3b53] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-[#1d3b53]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#7fdbca]" />
            <h4 className="text-xs sm:text-sm font-bold text-[#ffffff]">
              Transactions on {formatFullDate(selectedDateStr)}
            </h4>
          </div>
          <span className="text-[11px] text-[#7f97b2]">
            {selectedDayData.expenses.length + selectedDayData.settlements.length} total
          </span>
        </div>

        {!hasSelectedDayActivity ? (
          <div className="py-4 text-center text-[#5f7e97] text-xs">
            No expenses or settlements recorded on this day.
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {/* Expenses on this day */}
            {selectedDayData.expenses.map((item) => (
              <div
                key={`day-exp-${item._id}`}
                onClick={() => onSelectActivity({ ...item, activityType: 'expense' })}
                className="p-2 sm:p-2.5 bg-[#0b253a] hover:bg-[#0f2d45] rounded-lg border border-[#1d3b53] hover:border-[#7fdbca]/40 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#13344f] text-[#82aaff] flex items-center justify-center border border-[#1d3b53] shrink-0">
                    <Receipt className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#ffffff] group-hover:text-[#7fdbca] transition truncate">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-[#7f97b2]">
                      Paid by{' '}
                      <strong className="text-[#d6deeb]">
                        {item.paidBy?._id === currentUser?._id ? 'You' : item.paidBy?.name}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-extrabold text-[#ffffff] text-xs">
                      {formatNumber(item.amount)}
                    </span>
                    <span className="text-[9px] font-bold text-[#7f97b2]">
                      Ks
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#5f7e97] group-hover:text-[#7fdbca] transition" />
                </div>
              </div>
            ))}

            {/* Settlements on this day */}
            {selectedDayData.settlements.map((item) => (
              <div
                key={`day-set-${item._id}`}
                onClick={() => onSelectActivity({ ...item, activityType: 'settlement' })}
                className="p-2 sm:p-2.5 bg-[#0b253a] hover:bg-[#0f2d45] rounded-lg border border-[#1d3b53] hover:border-[#22da6e]/40 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-md bg-[#22da6e]/15 text-[#22da6e] flex items-center justify-center border border-[#22da6e]/30 shrink-0">
                    <CheckCircle className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#ffffff] group-hover:text-[#7fdbca] transition truncate">
                      {item.payer?.name} paid {item.receiver?.name}
                    </p>
                    <p className="text-[10px] text-[#7f97b2]">
                      Debt repayment settled
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-1.5">
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-extrabold text-[#22da6e] text-xs">
                      {formatNumber(item.amount)}
                    </span>
                    <span className="text-[9px] font-bold text-[#22da6e]/80">
                      Ks
                    </span>
                  </div>
                  <ArrowRight className="w-3 h-3 text-[#5f7e97] group-hover:text-[#22da6e] transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
