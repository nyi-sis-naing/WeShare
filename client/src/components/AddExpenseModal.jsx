import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { X, Receipt, AlertCircle, Loader2 } from 'lucide-react';
import { formatMMK } from '../utils/format';
import { getTodayDateString } from '../utils/date';
import CustomDatePicker from './CustomDatePicker';

export default function AddExpenseModal({
  isOpen,
  onClose,
  users = [],
  currentUser,
  onExpenseAdded,
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setAmount('');
      setDate(getTodayDateString());
      setPaidBy(currentUser?._id || users[0]?._id || '');
      setSplitBetween(users.map((u) => u._id));
      setError('');
    }
  }, [isOpen, currentUser, users]);

  if (!isOpen) return null;

  const handleToggleParticipant = (userId) => {
    if (splitBetween.includes(userId)) {
      if (splitBetween.length === 1) {
        setError('At least one person must be included in the split');
        return;
      }
      setError('');
      setSplitBetween(splitBetween.filter((id) => id !== userId));
    } else {
      setError('');
      setSplitBetween([...splitBetween, userId]);
    }
  };

  const handleSelectAll = () => {
    setSplitBetween(users.map((u) => u._id));
  };

  const numParticipants = splitBetween.length;
  const parsedAmount = parseFloat(amount) || 0;
  const perPersonShare = numParticipants > 0 ? (parsedAmount / numParticipants).toFixed(2) : '0.00';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a title for the expense');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (splitBetween.length === 0) {
      setError('Please select at least one person to split this with');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/expenses', {
        title: title.trim(),
        amount: parsedAmount,
        paidBy,
        splitBetween,
        date: date ? new Date(date) : new Date(),
      });

      if (res.data.success) {
        if (onExpenseAdded) onExpenseAdded();
        onClose();
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2.5 pt-3 sm:p-4 overflow-y-auto bg-[#011627]/85 backdrop-blur-xs animate-fade-in text-[#d6deeb]">
      <div className="bg-[#0b253a] rounded-lg shadow-2xl border border-[#1d3b53] w-full max-w-lg overflow-hidden flex flex-col my-1 sm:my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1d3b53] flex items-center justify-between bg-[#071c2f]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7fdbca]/15 text-[#7fdbca] flex items-center justify-center border border-[#7fdbca]/30">
              <Receipt className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Add New Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#13344f] rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-[#ff5874]/10 border border-[#ff5874]/30 rounded-lg text-[#ff5874] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
              Expense Description
            </label>
            <input
              type="text"
              placeholder="e.g. Costco groceries, WiFi bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#d6deeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition"
              required
            />
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Total Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3.5 pr-12 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#ffffff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] font-bold transition"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7f97b2] font-black text-xs pointer-events-none">
                  Ks
                </span>
              </div>
            </div>

            <CustomDatePicker
              label="Date"
              value={date}
              onChange={setDate}
            />
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
              Who Paid?
            </label>
            <select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#d6deeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition font-medium"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id} className="bg-[#0b253a] text-[#d6deeb]">
                  {u.name} {u._id === currentUser?._id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Split Between */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#7f97b2] uppercase tracking-wider">
                Split Between
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-[#7fdbca] hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 bg-[#071c2f] p-3 rounded-lg border border-[#1d3b53]">
              {users.map((u) => {
                const isChecked = splitBetween.includes(u._id);
                return (
                  <label
                    key={u._id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer border transition text-sm ${
                      isChecked
                        ? 'bg-[#0b253a] border-[#2b5475] text-[#ffffff] font-medium shadow-2xs'
                        : 'bg-transparent border-transparent text-[#7f97b2] hover:bg-[#0d2840]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleParticipant(u._id)}
                        className="w-4 h-4 accent-[#7fdbca] rounded border-[#1d3b53]"
                      />
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-[#011627] font-black"
                        style={{ backgroundColor: u.avatarColor || '#7fdbca' }}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                    {isChecked && parsedAmount > 0 && (
                      <span className="text-xs font-bold text-[#7fdbca]">
                        {formatMMK(perPersonShare)}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Split breakdown banner */}
            {parsedAmount > 0 && numParticipants > 0 && (
              <p className="mt-2 text-xs text-[#7f97b2] text-right">
                {formatMMK(parsedAmount)} split between {numParticipants} roommates ={' '}
                <strong className="text-[#7fdbca] font-bold">{formatMMK(perPersonShare)} each</strong>
              </p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-sm font-semibold text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#13344f] rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-black text-[#011627] bg-[#7fdbca] hover:bg-[#7fdbca]/90 active:bg-[#68c9b8] rounded-lg shadow-md shadow-[#7fdbca]/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
