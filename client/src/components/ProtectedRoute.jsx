import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#011627]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7fdbca] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#7f97b2] font-medium text-sm">Loading WeShare...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
