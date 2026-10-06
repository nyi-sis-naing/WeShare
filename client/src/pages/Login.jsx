import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, LogIn, AlertCircle, Loader2, Zap } from 'lucide-react';

const QUICK_USERS = [
  { name: 'NSN (me)', email: 'nyi@gmail.com', color: '#82aaff' },
  { name: 'WMO', email: 'wine@gmail.com', color: '#c792ea' },
  { name: 'YYP', email: 'yair@gmail.com', color: '#ecc48d' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setLocalError('');

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setLocalError(res.message);
    }
  };

  const handleQuickLogin = async (quickEmail) => {
    setEmail(quickEmail);
    setPassword('password123');
    setLoading(true);
    setLocalError('');

    const res = await login(quickEmail, 'password123');
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setLocalError(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 text-[#d6deeb]">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#7fdbca] to-[#82aaff] rounded-lg flex items-center justify-center text-[#011627] mx-auto shadow-lg shadow-[#7fdbca]/10 mb-3">
            <ArrowLeftRight className="w-7 h-7 stroke-[2.25]" />
          </div>
          <h1 className="text-2xl font-black text-[#ffffff] tracking-tight">
            Welcome to WeShare
          </h1>
          <p className="text-sm text-[#7f97b2] mt-1">
            Log in to manage 3-way household expenses & balances
          </p>
        </div>

        {/* Quick Roommate Switcher Card */}
        <div className="bg-[#0b253a] border border-[#1d3b53] rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#7fdbca] uppercase tracking-wider mb-2.5">
            <Zap className="w-3.5 h-3.5 text-[#7fdbca] stroke-[2.25]" />
            <span>1-Click Roommate Login</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_USERS.map((roommate) => (
              <button
                key={roommate.email}
                type="button"
                onClick={() => handleQuickLogin(roommate.email)}
                disabled={loading}
                className="flex flex-col items-center p-2.5 bg-[#071c2f] rounded-lg border border-[#1d3b53] hover:border-[#7fdbca] hover:shadow-xs transition text-center group disabled:opacity-50"
              >
                <div
                  className="w-7 h-7 rounded-full text-[#011627] text-xs font-black flex items-center justify-center mb-1 group-hover:scale-105 transition-transform ring-1 ring-[#1d3b53]"
                  style={{ backgroundColor: roommate.color }}
                >
                  {roommate.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-[#ffffff] line-clamp-1">
                  {roommate.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-[#5f7e97]">Quick sign in</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-[#0b253a] rounded-lg p-6 shadow-sm border border-[#1d3b53]">
          <form onSubmit={handleSubmit} className="space-y-4">
            {localError && (
              <div className="p-3 bg-[#ff5874]/15 border border-[#ff5874]/30 rounded-lg text-[#ff5874] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{localError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="nyi@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#ffffff] rounded-lg focus:bg-[#011627] focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#ffffff] rounded-lg focus:bg-[#011627] focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#7fdbca] hover:bg-[#7fdbca]/90 active:bg-[#68c9b8] text-[#011627] font-black rounded-lg shadow-md shadow-[#7fdbca]/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#7f97b2]">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#7fdbca] hover:underline">
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
