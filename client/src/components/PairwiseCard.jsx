import { formatNumber } from '../utils/format';

export default function PairwiseCard({ pair, currentUser }) {
  const { userA, userB, amount, status, debtor } = pair;

  const currentUserId = currentUser?._id;
  const isUserA = userA._id === currentUserId;
  const isUserB = userB._id === currentUserId;
  const isMeInvolved = isUserA || isUserB;

  let roleType = 'settled';
  let badgeColor = 'border-[#7fdbca]/50 text-[#7fdbca] bg-transparent';
  let amountColor = 'text-[#7fdbca]';

  if (status === 'settled') {
    roleType = 'settled';
    badgeColor = 'border-[#22da6e]/50 text-[#22da6e] bg-transparent';
    amountColor = 'text-[#22da6e]';
  } else if (isMeInvolved) {
    if (debtor?._id === currentUserId) {
      roleType = 'i_owe';
      badgeColor = 'border-[#ff5874]/50 text-[#ff5874] bg-transparent';
      amountColor = 'text-[#ff5874]';
    } else {
      roleType = 'i_am_owed';
      badgeColor = 'border-[#22da6e]/50 text-[#22da6e] bg-transparent';
      amountColor = 'text-[#22da6e]';
    }
  } else {
    roleType = 'third_party';
    badgeColor = 'border-[#ecc48d]/50 text-[#ecc48d] bg-transparent';
    amountColor = 'text-[#ecc48d]';
  }

  return (
    <div className="bg-[#0b253a] rounded-lg p-5 shadow-sm border border-[#1d3b53] hover:border-[#234d70] hover:shadow-lg hover:shadow-[#011627]/50 transition-all flex flex-col justify-between relative overflow-hidden group">
      {/* Top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          roleType === 'i_am_owed'
            ? 'bg-[#22da6e]'
            : roleType === 'i_owe'
            ? 'bg-[#ff5874]'
            : roleType === 'third_party'
            ? 'bg-[#ecc48d]'
            : 'bg-[#1d3b53]'
        }`}
      />

      {/* Card Header: 2 Users */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            {/* User A Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#011627] text-xs font-black shadow-sm ring-1 ring-[#1d3b53]"
              style={{ backgroundColor: userA.avatarColor || '#82aaff' }}
              title={userA.name}
            >
              {userA.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold text-[#5f7e97]">&</span>
            {/* User B Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#011627] text-xs font-black shadow-sm ring-1 ring-[#1d3b53]"
              style={{ backgroundColor: userB.avatarColor || '#7fdbca' }}
              title={userB.name}
            >
              {userB.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Badge: square with small border radius, no bg color */}
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeColor}`}
          >
            {status === 'settled'
              ? 'Settled'
              : roleType === 'i_owe'
              ? 'You Owe'
              : roleType === 'i_am_owed'
              ? 'Owed to You'
              : 'Roommate Debt'}
          </span>
        </div>

        {/* Pair Description */}
        <h3 className="font-bold text-[#ffffff] text-sm mb-1 tracking-tight">
          {userA.name} & {userB.name}
        </h3>

        {/* Amount display with 'Ks' smaller than amount and no 'outstanding' text */}
        <div className="mt-3 flex items-baseline gap-1">
          <span className={`text-xl font-black tracking-tight ${amountColor}`}>
            {formatNumber(amount)}
          </span>
          <span className={`text-[11px] font-bold ml-1 ${amountColor} opacity-75`}>
            Ks
          </span>
        </div>
      </div>
    </div>
  );
}
