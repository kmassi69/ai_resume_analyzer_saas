import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
      <Link to="/dashboard" className="text-xl font-semibold text-primary-600">
        AI Resume Analyzer
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-slate-600 text-sm">{user?.email}</span>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded hover:bg-slate-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
