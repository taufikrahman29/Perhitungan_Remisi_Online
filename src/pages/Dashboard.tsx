import React, { useEffect, useState } from 'react';
import { DB, STORAGE_WB, STORAGE_RIWAYAT, WargaBinaan, Riwayat } from '../lib/db';
import { Users, Calculator, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [wb, setWb] = useState<WargaBinaan[]>([]);
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);

  useEffect(() => {
    setWb(DB.get(STORAGE_WB));
    setRiwayat(DB.get(STORAGE_RIWAYAT));
  }, []);

  const thisMonth = riwayat.filter(r => new Date(r.timestamp).getMonth() === new Date().getMonth()).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-blue">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-royal-blue">
          <div className="p-3 bg-royal-light rounded-lg text-royal-blue">
            <Users size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Warga Binaan</p>
            <h2 className="text-3xl font-bold text-navy-blue">{wb.length}</h2>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4 border-l-4 border-gold">
          <div className="p-3 bg-orange-50 rounded-lg text-gold">
            <Calculator size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Perhitungan</p>
            <h2 className="text-3xl font-bold text-navy-blue">{riwayat.length}</h2>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-50 rounded-lg text-green-500">
            <CalendarCheck size={32} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Perhitungan Bulan Ini</p>
            <h2 className="text-3xl font-bold text-navy-blue">{thisMonth}</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Aktivitas Terakhir</h3>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100">
              {riwayat.slice().reverse().slice(0, 5).map(r => (
                <li key={r.id} className="p-4 flex gap-3 items-start">
                  <div className="mt-1 text-green-500"><CalendarCheck size={18} /></div>
                  <div>
                    <p className="text-sm text-slate-900">Perhitungan remisi untuk <strong>{r.nama}</strong> telah disimpan.</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(r.timestamp).toLocaleString('id-ID')}</p>
                  </div>
                </li>
              ))}
              {riwayat.length === 0 && <li className="p-4 text-sm text-slate-500">Belum ada aktivitas.</li>}
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold">Akses Cepat</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <Link to="/perhitungan" className="btn btn-primary justify-center py-3">
              <Calculator size={20} /> Hitung Baru
            </Link>
            <Link to="/telram" className="btn btn-secondary justify-center py-3">
              <CalendarCheck size={20} /> Cek TELRAM
            </Link>
            <Link to="/warga-binaan" className="btn btn-outline col-span-2 justify-center py-3">
              <Users size={20} /> Data Warga Binaan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
