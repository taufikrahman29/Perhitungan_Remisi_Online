import React, { useState, useEffect } from 'react';
import { DB, STORAGE_RIWAYAT, Riwayat } from '../lib/db';
import { useNavigate } from 'react-router-dom';
import { Printer, Trash2, ArrowUpRight } from 'lucide-react';

export default function RiwayatPage() {
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setRiwayat(DB.get(STORAGE_RIWAYAT));
  }, []);

  const handleDelete = (id: number) => {
    if(confirm("Hapus riwayat ini?")) {
        const updated = riwayat.filter(r => r.id !== id);
        setRiwayat(updated);
        DB.save(STORAGE_RIWAYAT, updated);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-navy-blue">Riwayat Perhitungan</h1>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Tanggal Input</th>
                <th className="p-4 font-semibold text-slate-700">Nama & Register</th>
                <th className="p-4 font-semibold text-slate-700">Masa Pidana</th>
                <th className="p-4 font-semibold text-slate-700">Total Remisi</th>
                <th className="p-4 font-semibold text-slate-700">Ekspirasi</th>
                <th className="p-4 font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {riwayat.slice().reverse().map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 text-sm">{new Date(item.timestamp).toLocaleDateString('id-ID')}</td>
                  <td className="p-4">
                      <div className="font-bold text-navy-blue">{item.nama}</div>
                      <div className="text-xs text-slate-500">{item.noReg}</div>
                  </td>
                  <td className="p-4 text-sm">{item.masaPidana}</td>
                  <td className="p-4 text-sm">{item.totalRemisi}</td>
                  <td className="p-4 text-sm font-semibold">{item.ekspirasi}</td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => navigate('/perhitungan', { state: { riwayatId: item.id } })}
                      className="btn btn-primary px-2 py-1 text-xs"
                      title="Muat Ulang"
                    >
                      <ArrowUpRight size={14} /> Muat
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 px-2 py-1 text-xs"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {riwayat.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Belum ada riwayat perhitungan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
