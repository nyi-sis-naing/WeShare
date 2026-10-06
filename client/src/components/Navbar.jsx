import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SidebarDrawer from './SidebarDrawer';
import { ArrowLeftRight, LogOut, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(true);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#011627]/90 backdrop-blur-md border-b border-[#1d3b53]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger Menu (Three-line button) & Brand */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={handleToggleSidebar}
              className="p-2 -ml-1 text-[#7f97b2] hover:text-[#7fdbca] hover:bg-[#0b253a] active:bg-[#13344f] rounded-lg border border-[#1d3b53]/60 hover:border-[#7fdbca]/50 transition flex items-center justify-center shadow-xs"
              title="Dashboard Menu"
              aria-label="Toggle Dashboard Menu"
            >
              <Menu className="w-5 h-5 stroke-[2.25]" />
            </button>
          )}

          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#7fdbca] to-[#82aaff] flex items-center justify-center text-[#011627] font-black shadow-md shadow-[#7fdbca]/10 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.25]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#7fdbca] via-[#82aaff] to-[#c792ea] bg-clip-text text-transparent">
                WeShare
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-[#0b253a] text-[#7fdbca] rounded-full border border-[#1d3b53]">
                3-Person Flat
              </span>
            </div>
          </Link>
        </div>

        {/* User Info & Actions */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-[#7f97b2] hover:text-[#ff5874] hover:bg-[#ff5874]/10 rounded-lg transition-colors"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#7f97b2] hover:text-[#7fdbca] px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-bold text-[#011627] bg-[#7fdbca] hover:bg-[#7fdbca]/90 px-4 py-1.5 rounded-lg shadow-sm shadow-[#7fdbca]/20 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Slide-out Sidebar Drawer (accessed from anywhere) */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </header>
  );
}
