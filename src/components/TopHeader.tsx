import React from 'react';
import { Menu } from 'lucide-react';

export default function TopHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 z-30">
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex-1 md:flex-none flex justify-center md:hidden">
        <h1 className="text-lg font-bold text-navy-blue">REMISI<span className="text-royal-blue">ONLINE</span></h1>
      </div>

      <div className="hidden md:flex items-center gap-4 ml-auto">
        <div className="text-right">
          <p className="text-sm font-bold text-navy-blue">Petugas Admin</p>
          <p className="text-xs text-slate-500">Lapas Kelas I</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-royal-light flex items-center justify-center text-royal-blue font-bold">
          A
        </div>
      </div>
    </header>
  );
}
