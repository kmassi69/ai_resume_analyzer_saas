import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

