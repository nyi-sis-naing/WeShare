import { createPortal } from 'react-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { formatMonthLabel } from '../utils/date';

export default function ClearHistoryModal({
  isOpen,
  onClose,
  selectedMonth,
  clearScope,
  setClearScope,
  onConfirmClear,
  clearing,
}) {
  if (!isOpen) return null;

  const isMonthSpecific = selectedMonth !== 'all';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 pt-3 sm:p-4 overflow-y-auto bg-[#011627]/85 backdrop-blur-xs animate-fade-in text-[#d6deeb]">
      <div className="bg-[#0b253a] rounded-lg shadow-2xl border border-[#1d3b53] w-full max-w-md p-5 sm:p-6 space-y-4 text-[#d6deeb] my-2 sm:my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#ff5874]/15 text-[#ff5874] flex items-center justify-center shrink-0 border border-[#ff5874]/30">
            <AlertCircle className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-[#ffffff] text-base">Clear Activity History</h3>
            <p className="text-xs text-[#7f97b2]">Choose what history you want to remove</p>
          </div>
        </div>

        <p className="text-xs text-[#7f97b2] leading-relaxed">
          This will permanently delete the selected logged expenses and settlements and automatically recalculate pairwise balances.
        </p>

        {/* Scope options */}
        {isMonthSpecific ? (
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1d3b53] bg-[#071c2f] cursor-pointer hover:border-[#2b5475] transition">
              <input
                type="radio"
                name="clearScope"
                value="month"
                checked={clearScope === 'month'}
                onChange={() => setClearScope('month')}
                className="accent-[#7fdbca]"
              />
              <div>
                <p className="text-xs font-bold text-[#ffffff]">
                  Clear {formatMonthLabel(selectedMonth)} only
                </p>
                <p className="text-[11px] text-[#7f97b2]">
                  Deletes only transactions in this month
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-[#1d3b53] bg-[#071c2f] cursor-pointer hover:border-[#2b5475] transition">
              <input
                type="radio"
                name="clearScope"
                value="all"
                checked={clearScope === 'all'}
                onChange={() => setClearScope('all')}
                className="accent-[#7fdbca]"
              />
              <div>
                <p className="text-xs font-bold text-[#ffffff]">Clear All History</p>
                <p className="text-[11px] text-[#7f97b2]">
                  Wipes all expenses & resets all balances to 0 Ks
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="p-3 bg-[#ff5874]/10 border border-[#ff5874]/30 rounded-lg text-[#ff5874] text-xs font-medium">
            You are about to clear <strong>all historical expenses and settlements</strong>. All roommate balances will reset to 0 Ks.
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={clearing}
            className="px-4 py-2 text-xs font-semibold text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#13344f] rounded-lg transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmClear}
            disabled={clearing}
            className="px-4 py-2 text-xs font-black text-[#011627] bg-[#ff5874] hover:bg-[#ff7890] rounded-lg shadow-xs shadow-[#ff5874]/20 transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {clearing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Clearing...</span>
              </>
            ) : (
              'Confirm & Clear'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
