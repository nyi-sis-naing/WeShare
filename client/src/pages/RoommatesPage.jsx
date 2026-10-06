import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, RefreshCw, Loader2, Mail } from 'lucide-react';

export default function RoommatesPage() {
  const { user } = useAuth();
  const [householdUsers, setHouseholdUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsersData = useCallback(async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setHouseholdUsers(res.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load roommates data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersData();
  }, [fetchUsersData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsersData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in text-[#d6deeb]">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1d3b53]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-[#c792ea]/15 text-[#c792ea] flex items-center justify-center border border-[#c792ea]/30">
              <Users className="w-5 h-5 stroke-[2.25]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#ffffff] tracking-tight">
              Roommates in Flat
            </h1>
            <button
              onClick={handleRefresh}
              className={`p-1.5 text-[#7f97b2] hover:text-[#7fdbca] rounded-lg hover:bg-[#0b253a] transition ${
                refreshing ? 'animate-spin text-[#7fdbca]' : ''
              }`}
              title="Refresh roommates"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[#7f97b2]">
            Active flatmates sharing household living costs in your 3-person flat
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#7f97b2]">
          <Loader2 className="w-8 h-8 animate-spin text-[#7fdbca]" />
          <p className="text-sm font-semibold">Loading roommate profiles...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {householdUsers.map((member) => {
              const isMe = member._id === user?._id;

              return (
                <div
                  key={member._id}
                  className="bg-[#0b253a] rounded-lg p-5 sm:p-6 border border-[#1d3b53] hover:border-[#2b5475] shadow-xs flex flex-col justify-between space-y-5 transition group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-13 h-13 rounded-lg flex items-center justify-center text-[#011627] text-lg font-black shadow-md ring-2 ring-[#1d3b53] group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: member.avatarColor || '#82aaff' }}
                      >
                        {member.name.charAt(0)}
                      </div>

                      {isMe ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 text-[#7fdbca] border border-[#7fdbca]/50 rounded-md bg-transparent">
                          You
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-0.5 text-[#7f97b2] border border-[#1d3b53] rounded-md bg-transparent">
                          Flatmate
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#ffffff] tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs text-[#7f97b2] flex items-center gap-1.5 mt-1">
                        <Mail className="w-3.5 h-3.5 text-[#5f7e97]" />
                        <span>{member.email}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#1d3b53] flex items-center justify-between text-xs text-[#7f97b2]">
                    <span>Flat Split Share</span>
                    <span className="font-bold text-[#7fdbca]">33.3% Equal</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
