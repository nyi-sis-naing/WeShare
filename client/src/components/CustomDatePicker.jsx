import { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatShortDate } from '../utils/date';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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

const parseDateString = (str) => {
  if (!str) return new Date();
  const parts = str.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

export default function CustomDatePicker({
  value,
  onChange,
  label = 'Date',
  align = 'right', // 'right' | 'left'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const todayStr = toDateString(new Date());
  const selectedStr = value || todayStr;

  const [viewDate, setViewDate] = useState(() => {
    const d = parseDateString(value);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    if (value) {
      const d = parseDateString(value);
      setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const handleSelectDay = (dayDate) => {
    onChange(toDateString(dayDate));
    setIsOpen(false);
  };

  const handleQuickSelect = (daysAgo) => {
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    onChange(toDateString(target));
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsOpen(false);
  };

  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateObj = new Date(viewYear, viewMonth - 1, dayNum);
    calendarDays.push({
      dateObj,
      dayNum,
      isCurrentMonth: false,
      dateStr: toDateString(dateObj),
    });
  }

  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateObj = new Date(viewYear, viewMonth, dayNum);
    calendarDays.push({
      dateObj,
      dayNum,
      isCurrentMonth: true,
      dateStr: toDateString(dateObj),
    });
  }

  const remainingCells = (calendarDays.length <= 35 ? 35 : 42) - calendarDays.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const dateObj = new Date(viewYear, viewMonth + 1, dayNum);
    calendarDays.push({
      dateObj,
      dayNum,
      isCurrentMonth: false,
      dateStr: toDateString(dateObj),
    });
  }

  const isToday = selectedStr === todayStr;

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Button: Compact and clean */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3 py-2 text-sm bg-[#011627] border rounded-lg transition-all flex items-center justify-between text-left group shadow-2xs ${
          isOpen
            ? 'border-[#7fdbca] ring-2 ring-[#7fdbca]/20 text-[#ffffff]'
            : 'border-[#1d3b53] hover:border-[#2b5475] text-[#ffffff]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-[#7fdbca]/15 text-[#7fdbca] flex items-center justify-center border border-[#7fdbca]/25 shrink-0">
            <CalendarIcon className="w-3.5 h-3.5 stroke-[2.25]" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-[#ffffff] text-xs block leading-tight truncate">
              {formatShortDate(selectedStr)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          {isToday && (
            <span className="text-[9px] font-black px-1.5 py-0.2 bg-[#7fdbca]/15 text-[#7fdbca] border border-[#7fdbca]/30 rounded">
              Today
            </span>
          )}
          <span className="text-[10px] text-[#7f97b2] group-hover:text-[#7fdbca] transition-colors">
            ▼
          </span>
        </div>
      </button>

      {/* Themed Compact Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute top-full mt-1.5 z-[130] w-[268px] bg-[#071c2f] border border-[#1d3b53] rounded-lg shadow-2xl p-2.5 sm:p-3 animate-fade-in text-[#d6deeb] ${
            align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          }`}
        >
          {/* Header: Month, Year & Navigation */}
          <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[#1d3b53]">
            <div className="flex items-center gap-1">
              <span className="font-black text-[#ffffff] text-xs tracking-tight">
                {MONTH_NAMES[viewMonth]}
              </span>
              <span className="font-bold text-[#7f97b2] text-xs">
                {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded text-[#7f97b2] hover:text-[#7fdbca] hover:bg-[#0b253a] border border-[#1d3b53] transition"
                title="Previous Month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded text-[#7f97b2] hover:text-[#7fdbca] hover:bg-[#0b253a] border border-[#1d3b53] transition"
                title="Next Month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
            {DAYS_OF_WEEK.map((dayName, idx) => (
              <span
                key={dayName}
                className={`text-[9px] font-bold uppercase py-0.5 ${
                  idx === 0 || idx === 6 ? 'text-[#ff5874]/75' : 'text-[#5f7e97]'
                }`}
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Day Grid: Compact 7-column layout */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarDays.map(({ dateObj, dayNum, isCurrentMonth, dateStr }) => {
              const isSelected = dateStr === selectedStr;
              const isCellToday = dateStr === todayStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => handleSelectDay(dateObj)}
                  className={`h-7 w-full rounded text-[11px] font-bold transition flex items-center justify-center relative ${
                    isSelected
                      ? 'bg-[#7fdbca] text-[#011627] font-black shadow-xs shadow-[#7fdbca]/40'
                      : isCellToday
                      ? 'bg-[#0b253a] text-[#7fdbca] border border-[#7fdbca]/40 hover:bg-[#13344f]'
                      : isCurrentMonth
                      ? 'text-[#d6deeb] hover:bg-[#0b253a] hover:text-[#7fdbca]'
                      : 'text-[#35536e] hover:bg-[#0b253a]/50 hover:text-[#7f97b2]'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isCellToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#7fdbca] absolute bottom-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Select Presets Footer */}
          <div className="pt-2 mt-2 border-t border-[#1d3b53] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#0b253a] text-[#7fdbca] hover:bg-[#13344f] border border-[#1d3b53] transition"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#0b253a] text-[#d6deeb] hover:text-[#7fdbca] hover:bg-[#13344f] border border-[#1d3b53] transition"
              >
                Yesterday
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-semibold text-[#7f97b2] hover:text-[#ffffff] transition px-1"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
