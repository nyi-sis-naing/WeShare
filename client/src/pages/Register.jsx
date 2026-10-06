import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeftRight, UserPlus, AlertCircle, Loader2 } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setLocalError('');

    const res = await register(name, email, password);
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
        <div className="text-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#7fdbca] to-[#82aaff] rounded-lg flex items-center justify-center text-[#011627] mx-auto shadow-lg shadow-[#7fdbca]/10 mb-3">
            <ArrowLeftRight className="w-7 h-7 stroke-[2.25]" />
          </div>
          <h1 className="text-2xl font-black text-[#ffffff] tracking-tight">
            Join WeShare
          </h1>
          <p className="text-sm text-[#7f97b2] mt-1">
            Create an account to join your flatmates
          </p>
        </div>

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
                Full Name
              </label>
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#011627] border border-[#1d3b53] text-[#ffffff] rounded-lg focus:bg-[#011627] focus:outline-none focus:ring-2 focus:ring-[#7fdbca]/20 focus:border-[#7fdbca] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#7f97b2] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="alex@example.com"
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
                placeholder="At least 6 characters"
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
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-[#7f97b2]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#7fdbca] hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
