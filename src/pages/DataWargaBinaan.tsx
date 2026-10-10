import React, { useState, useEffect, useRef } from 'react';
import { DB, STORAGE_WB, WargaBinaan } from '../lib/db';
import { useNavigate } from 'react-router-dom';
import { Calculator, Trash2, Search, FileUp, FileDown, FileText, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataWargaBinaan() {
  const [wb, setWb] = useState<WargaBinaan[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{show: boolean, type: 'success'|'error', message: string}>({ show: false, type: 'success', message: '' });
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWb(DB.get(STORAGE_WB));
  }, []);

  const showToast = (type: 'success'|'error', message: string) => {
      setToast({ show: true, type, message });
      setTimeout(() => setToast({ show: false, type, message }), 3000);
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data warga binaan ini?")) {
      const updated = wb.filter(item => item.id !== id);
      setWb(updated);
      DB.save(STORAGE_WB, updated);
      showToast('success', 'Data warga binaan hasil dihapus.');
    }
  };

  const handleExportExcel = () => {
    setIsLoading(true);
    setTimeout(() => {
      const ws = XLSX.utils.json_to_sheet(wb);
      const wbXlsx = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbXlsx, ws, "Data WB");
      XLSX.writeFile(wbXlsx, "Data_Warga_Binaan.xlsx");
      setIsLoading(false);
      showToast('success', 'Data hasil diekspor kana Excel.');
    }, 500);
  };

  const handleExportCSV = () => {
    setIsLoading(true);
    setTimeout(() => {
      const ws = XLSX.utils.json_to_sheet(wb);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Data_Warga_Binaan.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsLoading(false);
      showToast('success', 'Data hasil diekspor kana CSV.');
    }, 500);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        await new Promise(r => setTimeout(r, 800)); // Simulate loading
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        let importedCount = 0;
        let duplicateCount = 0;
        const currentData = [...wb];

        data.forEach(row => {
          if (!row.nama || !row.noReg) return; // Skip invalid
          
          // Check duplication by noReg
          const exists = currentData.some(w => w.noReg === row.noReg);
          if (exists) {
            duplicateCount++;
          } else {
            currentData.push({
              id: Date.now() + Math.random(),
              nama: row.nama || '',
              noReg: row.noReg || '',
              perkara: row.perkara || '',
              pTahun: Number(row.pTahun) || 0,
              pBulan: Number(row.pBulan) || 0,
              pHari: Number(row.pHari) || 0,
              denda: row.denda || '',
              noPidana: row.noPidana || '',
              tglDitahan: row.tglDitahan || '',
              tglExpAwal: row.tglExpAwal || '',
              tgl23sdp: row.tgl23sdp || '',
              ekspirasiText: row.ekspirasiText || ''
            });
            importedCount++;
          }
        });

        if (importedCount > 0) {
          setWb(currentData);
          DB.save(STORAGE_WB, currentData);
          showToast('success', `Data warga binaan parantos hasil diimpor. (${importedCount} lebet, ${duplicateCount} duplikat)`);
        } else if (duplicateCount > 0) {
          showToast('error', 'Sadaya data tos aya (duplikat). Teu aya nu diimpor.');
        } else {
          showToast('error', 'Teu mendakan data nu valid dina file.');
        }
      } catch (err) {
        showToast('error', 'Data teu tiasa diimpor. Mangga periksa format file.');
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const filtered = wb.filter(item => item.nama.toLowerCase().includes(search.toLowerCase()) || item.noReg.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
    {/* TOAST NOTIFICATION */}
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${toast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border text-white ${toast.type === 'success' ? 'bg-emerald-500 border-emerald-600' : 'bg-red-500 border-red-600'}`}>
            {toast.type === 'success' ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
                <AlertCircle size={24} />
            )}
            <span className="font-medium text-lg">{toast.message}</span>
        </div>
    </div>

    {/* FULLSCREEN LOADING POPUP */}
    {isLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                    <svg className="animate-spin h-12 w-12 text-navy-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">Mangga Antosan</h3>
                <p className="text-slate-500 font-medium text-center">Nuju mroses data...</p>
            </div>
        </div>
    )}

    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy-blue">Data Warga Binaan</h1>
        
        <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari nama / no. reg..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-control pl-10 w-full"
              />
            </div>
            
            <div className="flex gap-2 shrink-0">
                <button onClick={handleExportExcel} disabled={isLoading} className="btn btn-outline border-emerald-200 text-emerald-700 hover:bg-emerald-50 shadow-sm whitespace-nowrap">
                    <FileUp size={18} className="mr-2"/> Ekspor Excel
                </button>
                <button onClick={handleExportCSV} disabled={isLoading} className="btn btn-outline border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm whitespace-nowrap">
                    <FileText size={18} className="mr-2"/> Ekspor CSV
                </button>
                <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleImportExcel} />
                <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="btn btn-primary shadow-sm whitespace-nowrap">
                    <FileDown size={18} className="mr-2"/> Impor Excel
                </button>
            </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">No</th>
                <th className="p-4 font-semibold text-slate-700">Nama Lengkap</th>
                <th className="p-4 font-semibold text-slate-700">No. Register</th>
                <th className="p-4 font-semibold text-slate-700">Perkara</th>
                <th className="p-4 font-semibold text-slate-700">Lama Pidana</th>
                <th className="p-4 font-semibold text-slate-700">Ekspirasi</th>
                <th className="p-4 font-semibold text-slate-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4 font-bold text-navy-blue">{item.nama}</td>
                  <td className="p-4">{item.noReg}</td>
                  <td className="p-4">{item.perkara}</td>
                  <td className="p-4">{item.lama}</td>
                  <td className="p-4">{item.exp}</td>
                  <td className="p-4 flex gap-2">
                    <button 
                      onClick={() => navigate('/perhitungan', { state: { wbId: item.id } })}
                      className="btn btn-primary px-3 py-1 text-xs"
                      title="Hitung"
                    >
                      <Calculator size={14} /> Hitung
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 px-3 py-1 text-xs"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length === 0 && (
              <div className="text-center p-8 text-slate-400">
                  Belum ada data warga binaan yang tersimpan atau cocok dengan pencarian.
              </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
