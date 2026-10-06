import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import { X, CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function SettleUpModal({
  isOpen,
  onClose,
  users = [],
  prefillPair,
  currentUser,
  onSettled,
}) {
  const [payer, setPayer] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('Payment settled via Venmo/Cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (prefillPair?.debtor && prefillPair?.creditor) {
        setPayer(prefillPair.debtor._id);
        setReceiver(prefillPair.creditor._id);
        setAmount(prefillPair.amount > 0 ? String(prefillPair.amount) : '');
        setNotes(`Paid ${prefillPair.creditor.name} via KBZPay / Cash`);
      } else {
        const otherUser = users.find((u) => u._id !== currentUser?._id) || users[1];
        setPayer(currentUser?._id || users[0]?._id || '');
        setReceiver(otherUser?._id || '');
        setAmount('');
        setNotes('Payment settled');
      }
    }
  }, [isOpen, prefillPair, currentUser, users]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (!payer || !receiver) {
      setError('Please select both payer and recipient');
      return;
    }
    if (payer === receiver) {
      setError('Payer and recipient cannot be the same person');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/settlements', {
        payer,
        receiver,
        amount: parsedAmount,
        notes: notes.trim(),
      });

      if (res.data.success) {
        if (onSettled) onSettled();
        onClose();
      }
    } catch (err) {
      console.error('Failed to record settlement:', err);
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const payerObj = users.find((u) => u._id === payer);
  const receiverObj = users.find((u) => u._id === receiver);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-2.5 pt-3 sm:p-4 overflow-y-auto bg-[#011627]/85 backdrop-blur-xs animate-fade-in text-[#d6deeb]">
      <div className="bg-[#0b253a] rounded-lg shadow-2xl border border-[#1d3b53] w-full max-w-md overflow-hidden flex flex-col my-1 sm:my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[92vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1d3b53] flex items-center justify-between bg-[#071c2f]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#22da6e]/15 text-[#22da6e] flex items-center justify-center border border-[#22da6e]/30">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#ffffff]">Settle Up Balance</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#13344f] rounded-lg transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#ff5874]/10 border border-[#ff5874]/30 rounded-lg text-[#ff5874] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Visual Transfer Pill */}
          {payerObj && receiverObj && (
            <div className="p-3 bg-[#071c2f] rounded-lg border border-[#1d3b53] flex items-center justify-between text-xs font-bold text-[#d6deeb]">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#011627] text-[10px] font-black"
                  style={{ backgroundColor: payerObj.avatarColor || '#82aaff' }}
                >
                  {payerObj.name.charAt(0)}
                </div>
                <span>{payerObj.name}</span>
              </div>
              <div className="flex items-center gap-1 text-[#7fdbca] font-black">
                <span>pays</span>
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#011627] text-[10px] font-black"
                  style={{ backgroundColor: receiverObj.avatarColor || '#22da6e' }}
                >
                  {receiverObj.name.charAt(0)}
                </div>
                <span>{receiverObj.name}</span>
              </div>
            </div>
          )}

          {/* Payer and Receiver Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Payer (Who pays)
              </label>
              <select
                value={payer}
                onChange={(e) => setPayer(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#011627] border border-[#1d3b53] text-[#d6deeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition font-medium"
                required
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id} className="bg-[#0b253a] text-[#d6deeb]">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Recipient (Who receives)
              </label>
              <select
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#011627] border border-[#1d3b53] text-[#d6deeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition font-medium"
                required
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id} className="bg-[#0b253a] text-[#d6deeb]">
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
              Settlement Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-3.5 pr-12 py-2.5 text-base font-black text-[#ffffff] bg-[#011627] border border-[#1d3b53] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22da6e]/20 focus:border-[#22da6e] transition"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7f97b2] font-black text-xs pointer-events-none">
                Ks
              </span>
            </div>
          </div>

          {/* Note / Method */}
          <div>
            <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
              Payment Note
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via Apple Pay / Cash"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#011627] border border-[#1d3b53] text-[#d6deeb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition"
            />
          </div>

          {/* Buttons */}
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
              className="px-5 py-2.5 text-sm font-black text-[#011627] bg-[#22da6e] hover:bg-[#22da6e]/90 active:bg-[#1bb85c] rounded-lg shadow-md shadow-[#22da6e]/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Confirm Settlement'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
