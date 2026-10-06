import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  X,
  ArrowLeftRight,
  History,
  BarChart3,
  Users,
  LogOut,
  Wallet,
} from 'lucide-react';
import { formatMMK, formatSignedMMK } from '../utils/format';

export default function SidebarDrawer({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    balances: null,
    expensesCount: 0,
    settlementsCount: 0,
    usersCount: 3,
  });

  // Fetch live stats when drawer opens
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      Promise.all([
        api.get('/balances').catch(() => ({ data: {} })),
        api.get('/expenses').catch(() => ({ data: {} })),
        api.get('/settlements').catch(() => ({ data: {} })),
        api.get('/users').catch(() => ({ data: {} })),
      ]).then(([balRes, expRes, setRes, usrRes]) => {
        setStats({
          balances: balRes.data?.success ? balRes.data : null,
          expensesCount: expRes.data?.expenses?.length || 0,
          settlementsCount: setRes.data?.settlements?.length || 0,
          usersCount: usrRes.data?.users?.length || 3,
        });
      });
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSpend = stats.balances?.totalHouseholdSpend || 0;
  const netBalance = stats.balances?.mySummary?.netBalance ?? 0;

  const handleNav = (path) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const isCurrent = (path) => location.pathname === path;

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden text-[#d6deeb]">
      {/* Dark frosted backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#011627]/80 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside className="fixed inset-y-0 left-0 max-w-full flex z-[10000]">
        <div className="w-80 max-w-[85vw] h-full bg-[#071c2f] border-r border-[#1d3b53] shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-right">
          {/* Top Section */}
          <div className="p-5 space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1d3b53]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#7fdbca] to-[#82aaff] flex items-center justify-center text-[#011627] font-black shadow-md shadow-[#7fdbca]/10">
                  <ArrowLeftRight className="w-5 h-5 stroke-[2.25]" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#7fdbca] via-[#82aaff] to-[#c792ea] bg-clip-text text-transparent">
                    WeShare
                  </span>
                  <span className="block text-[10px] font-bold text-[#7f97b2] uppercase tracking-wider">
                    Dashboard Menu
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-[#7f97b2] hover:text-[#ffffff] hover:bg-[#0b253a] rounded-lg transition"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Card */}
            {user && (
              <div className="p-3.5 bg-[#0b253a] rounded-lg border border-[#1d3b53] shadow-2xs space-y-2.5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#011627] text-sm font-black ring-2 ring-[#1d3b53] shadow-xs shrink-0"
                    style={{ backgroundColor: user.avatarColor || '#3B82F6' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#ffffff] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[#7f97b2] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Net position pill */}
                <div className="pt-2 border-t border-[#1d3b53]/80 flex items-center justify-between text-xs">
                  <span className="text-[#7f97b2] text-[11px] font-medium">Your Balance</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-lg border text-xs ${
                      netBalance > 0
                        ? 'bg-[#22da6e]/15 text-[#22da6e] border-[#22da6e]/30'
                        : netBalance < 0
                        ? 'bg-[#ff5874]/15 text-[#ff5874] border-[#ff5874]/30'
                        : 'bg-[#13344f] text-[#7fdbca] border-[#1d3b53]'
                    }`}
                  >
                    {formatSignedMMK(netBalance)}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Menu Links */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#5f7e97] uppercase tracking-wider px-2 block">
                Pages
              </span>

              {/* 1. Household Balances (Home Page) */}
              <button
                onClick={() => handleNav('/')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition group ${
                  isCurrent('/')
                    ? 'bg-[#0b253a] border-[#7fdbca]/40 text-[#7fdbca] shadow-xs'
                    : 'text-[#d6deeb] hover:bg-[#0b253a] hover:text-[#7fdbca] border-transparent hover:border-[#1d3b53]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 stroke-[2.25]" />
                  <span>Household Balances</span>
                </div>
                {isCurrent('/') && (
                  <span className="text-[10px] font-black px-2 py-0.5 bg-[#7fdbca]/15 text-[#7fdbca] rounded-md border border-[#7fdbca]/25">
                    Current Page
                  </span>
                )}
              </button>

              {/* 2. Activity History */}
              <button
                onClick={() => handleNav('/history')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition group ${
                  isCurrent('/history')
                    ? 'bg-[#0b253a] border-[#7fdbca]/40 text-[#7fdbca] shadow-xs'
                    : 'text-[#d6deeb] hover:bg-[#0b253a] hover:text-[#7fdbca] border-transparent hover:border-[#1d3b53]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <History className="w-4 h-4 text-[#7f97b2] group-hover:text-[#7fdbca] transition" />
                  <span>Activity History</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0b253a] text-[#7f97b2] border border-[#1d3b53] group-hover:border-[#7fdbca]/30 group-hover:text-[#7fdbca] transition">
                  {stats.expensesCount + stats.settlementsCount}
                </span>
              </button>

              {/* 3. Household Overview */}
              <button
                onClick={() => handleNav('/overview')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition group ${
                  isCurrent('/overview')
                    ? 'bg-[#0b253a] border-[#82aaff]/40 text-[#82aaff] shadow-xs'
                    : 'text-[#d6deeb] hover:bg-[#0b253a] hover:text-[#82aaff] border-transparent hover:border-[#1d3b53]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-4 h-4 text-[#7f97b2] group-hover:text-[#82aaff] transition" />
                  <span>Household Overview</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0b253a] text-[#7f97b2] border border-[#1d3b53] group-hover:border-[#82aaff]/30 group-hover:text-[#82aaff] transition">
                  {formatMMK(totalSpend)}
                </span>
              </button>

              {/* 4. Roommates in Flat */}
              <button
                onClick={() => handleNav('/roommates')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-xs font-bold transition group ${
                  isCurrent('/roommates')
                    ? 'bg-[#0b253a] border-[#c792ea]/40 text-[#c792ea] shadow-xs'
                    : 'text-[#d6deeb] hover:bg-[#0b253a] hover:text-[#c792ea] border-transparent hover:border-[#1d3b53]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#7f97b2] group-hover:text-[#c792ea] transition" />
                  <span>Roommates in Flat</span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#0b253a] text-[#7f97b2] border border-[#1d3b53] group-hover:border-[#c792ea]/30 group-hover:text-[#c792ea] transition">
                  {stats.usersCount}
                </span>
              </button>
            </div>
          </div>

          {/* Footer with Sign Out */}
          <div className="p-5 border-t border-[#1d3b53] bg-[#051726]/60">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-bold text-[#ff5874] hover:bg-[#ff5874]/15 border border-[#ff5874]/20 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of WeShare</span>
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
