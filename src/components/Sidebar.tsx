import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calculator, CalendarDays, History, LogOut } from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { to: '/warga-binaan', label: 'Data Warga Binaan', icon: <Users size={20} /> },
    { to: '/perhitungan', label: 'Perhitungan Masa Pidana', icon: <Calculator size={20} /> },
    { to: '/telram', label: 'TELRAM Digital', icon: <CalendarDays size={20} /> },
    { to: '/riwayat', label: 'Riwayat Perhitungan', icon: <History size={20} /> },
  ];

  return (
    <div className={`fixed md:static inset-y-0 left-0 w-64 bg-navy-blue text-white z-40 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="p-6 border-b border-navy-light flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gold">REMISI<span className="text-white">ONLINE</span></h2>
          <p className="text-xs text-slate-400 mt-1">Sistem Perhitungan PB/CB/CMB</p>
        </div>
        <button className="md:hidden text-slate-300" onClick={() => setIsOpen(false)}>✕</button>
      </div>
      <nav className="p-4 space-y-1">
        {links.map((link) => {
          const isActive = location.pathname.startsWith(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => window.innerWidth < 768 && setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-royal-blue text-white shadow-md' 
                  : 'text-slate-300 hover:bg-navy-light hover:text-white'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 left-0 w-full border-t border-navy-light">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 text-sm font-medium text-red-400 hover:bg-navy-light hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Keluar (Logout)
        </button>
        <div className="p-4 pt-0 text-xs text-center text-slate-500">
          © 2026 Remisi Online
        </div>
      </div>
    </div>
  );
}
