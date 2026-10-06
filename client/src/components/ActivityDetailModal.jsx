import { createPortal } from 'react-dom';
import { X, Calendar, Users, CheckCircle, Receipt, ArrowRight, Trash2, Loader2 } from 'lucide-react';
import { formatMMK } from '../utils/format';
import { formatFullDate } from '../utils/date';

export default function ActivityDetailModal({
  activity,
  onClose,
  currentUser,
  onDeleteExpense,
  isDeleting,
}) {
  if (!activity) return null;

  const isSettlement = activity.activityType === 'settlement';
  const isPayerMe = activity.paidBy?._id === currentUser?._id;
  const splitCount = activity.splitBetween?.length || 1;
  const perPersonShare = (activity.amount || 0) / splitCount;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 pt-3 sm:p-4 overflow-y-auto bg-[#011627]/85 backdrop-blur-xs animate-fade-in text-[#d6deeb]">
      <div className="bg-[#0b253a] rounded-lg shadow-2xl border border-[#1d3b53] w-full max-w-lg overflow-hidden flex flex-col my-2 sm:my-auto max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1d3b53] flex items-center justify-between bg-[#071c2f]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isSettlement
                  ? 'bg-[#22da6e]/15 text-[#22da6e] border-[#22da6e]/30'
                  : 'bg-[#7fdbca]/15 text-[#7fdbca] border-[#7fdbca]/30'
              }`}
            >
              {isSettlement ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Receipt className="w-4 h-4" />
              )}
            </div>
            <h3 className="font-bold text-[#ffffff] text-base">
              {isSettlement ? 'Settlement Details' : 'Expense Details'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#13344f] rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Top Banner: Title & Large Amount */}
          <div className="p-4 rounded-lg bg-[#071c2f] border border-[#1d3b53] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-extrabold text-[#ffffff] text-base sm:text-lg truncate">
                {isSettlement
                  ? `${activity.payer?.name} paid ${activity.receiver?.name}`
                  : activity.title}
              </h4>
              <p className="text-xs text-[#7f97b2] mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#5f7e97] shrink-0" />
                <span>{formatFullDate(activity.date)}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-xl sm:text-2xl font-black ${
                  isSettlement ? 'text-[#22da6e]' : 'text-[#7fdbca]'
                }`}
              >
                {formatMMK(activity.amount)}
              </span>
              <p className="text-[10px] text-[#7f97b2] uppercase tracking-wider font-bold">
                {isSettlement ? 'Repaid' : 'Total'}
              </p>
            </div>
          </div>

          {!isSettlement ? (
            <>
              {/* Paid By info */}
              <div className="p-3.5 rounded-lg bg-[#071c2f] border border-[#1d3b53] space-y-1.5">
                <span className="text-[11px] font-bold text-[#7f97b2] uppercase tracking-wider">
                  Paid Out of Pocket By
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#011627] text-xs font-black shadow-xs ring-1 ring-[#1d3b53]"
                    style={{ backgroundColor: activity.paidBy?.avatarColor || '#82aaff' }}
                  >
                    {activity.paidBy?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#ffffff] truncate">
                      {activity.paidBy?.name} {isPayerMe ? '(You)' : ''}
                    </p>
                    <p className="text-xs text-[#5f7e97] truncate">{activity.paidBy?.email}</p>
                  </div>
                </div>
              </div>

              {/* Split Breakdown */}
              <div className="p-3.5 rounded-lg bg-[#071c2f] border border-[#1d3b53] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#7f97b2] uppercase tracking-wider">
                    Split Breakdown ({activity.splitBetween?.length} Roommates)
                  </span>
                  <span className="text-xs font-bold text-[#7fdbca]">
                    {formatMMK(perPersonShare)} each
                  </span>
                </div>

                <div className="divide-y divide-[#1d3b53] pt-1">
                  {activity.splitBetween?.map((participant) => {
                    const isPayer = participant._id === activity.paidBy?._id;
                    return (
                      <div
                        key={participant._id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#011627] text-[10px] font-black"
                            style={{ backgroundColor: participant.avatarColor || '#7fdbca' }}
                          >
                            {participant.name?.charAt(0)}
                          </div>
                          <span className="font-semibold text-[#d6deeb]">
                            {participant.name} {participant._id === currentUser?._id ? '(You)' : ''}
                          </span>
                          {isPayer && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#82aaff]/15 text-[#82aaff] border border-[#82aaff]/30">
                              Payer
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-[#ffffff]">{formatMMK(perPersonShare)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Settlement details */
            <div className="p-3.5 rounded-lg bg-[#071c2f] border border-[#1d3b53] space-y-3">
              <span className="text-[11px] font-bold text-[#7f97b2] uppercase tracking-wider">
                Transfer Summary
              </span>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#0b253a] border border-[#1d3b53]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#011627] text-xs font-black"
                    style={{ backgroundColor: activity.payer?.avatarColor || '#82aaff' }}
                  >
                    {activity.payer?.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#ffffff]">{activity.payer?.name}</span>
                </div>

                <div className="flex items-center gap-1 text-[#22da6e] font-black text-xs">
                  <span>paid {formatMMK(activity.amount)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[#011627] text-xs font-black"
                    style={{ backgroundColor: activity.receiver?.avatarColor || '#22da6e' }}
                  >
                    {activity.receiver?.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-[#ffffff]">{activity.receiver?.name}</span>
                </div>
              </div>

              {activity.notes && (
                <div className="text-xs text-[#7f97b2] pt-1">
                  <span className="font-bold text-[#d6deeb]">Payment Note:</span> "{activity.notes}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#1d3b53] flex items-center justify-between bg-[#071c2f]/80 shrink-0">
          {!isSettlement ? (
            <button
              onClick={() => onDeleteExpense(activity._id, activity.title)}
              disabled={isDeleting}
              className="px-3.5 py-2 text-xs font-bold text-[#ff5874] hover:bg-[#ff5874]/15 rounded-lg border border-[#ff5874]/30 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Expense</span>
                </>
              )}
            </button>
          ) : (
            <div className="text-xs font-semibold text-[#22da6e] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Settled Payment
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#ffffff] bg-[#13344f] hover:bg-[#1d3b53] rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
