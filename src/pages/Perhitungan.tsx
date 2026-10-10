import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DB, STORAGE_WB, WargaBinaan, Riwayat, STORAGE_RIWAYAT } from '../lib/db';
import { EnginePerhitungan, Duration } from '../lib/calculator';
import { Telraam } from '../lib/telramEngine';
import { Save, Printer, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import PrintLayout from '../components/PrintLayout';

interface RemisiRow {
  jenis: string;
  y: number;
  m: number;
  d: number;
}

export default function Perhitungan() {
  const location = useLocation();
  const [identitas, setIdentitas] = useState({
    nama: '', noReg: '', perkara: '', noPidana: '', denda: '',
    tglDitahan: '', tglDiputus: '', tgl23sdp: '', tglExpAwal: '',
    pTahun: 0, pBulan: 0, pHari: 0
  });
  
  const [remisiList, setRemisiList] = useState<RemisiRow[]>(Array(5).fill({jenis:'', y:0, m:0, d:0}));
  const [result, setResult] = useState<any>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{show: boolean, type: 'success'|'error', message: string}>({ show: false, type: 'success', message: '' });

  const showToast = (type: 'success'|'error', message: string) => {
      setToast({ show: true, type, message });
      setTimeout(() => setToast({ show: false, type, message }), 3000);
  };
  
  useEffect(() => {
    if (location.state?.wbId) {
       const wb = DB.get<WargaBinaan>(STORAGE_WB).find(w => w.id === location.state.wbId);
       if (wb) {
           const lmatch = (wb.lama || '').match(/(\d+)\s*Tahun\s*(\d+)\s*Bulan\s*(\d+)\s*Hari/i);
           setIdentitas(prev => ({
             ...prev,
             nama: wb.nama,
             noReg: wb.noReg,
             perkara: wb.perkara,
             pTahun: lmatch ? parseInt(lmatch[1]) : 0,
             pBulan: lmatch ? parseInt(lmatch[2]) : 0,
             pHari: lmatch ? parseInt(lmatch[3]) : 0,
             tglExpAwal: wb.exp ? wb.exp.split('-').reverse().join('-') : ''
           }));
       }
    } else if (location.state?.riwayatId) {
       const r = DB.get<Riwayat>(STORAGE_RIWAYAT).find(w => w.id === location.state.riwayatId);
       if(r && r.dataDetails) {
           const d = r.dataDetails;
           setIdentitas({
             nama: d.nama, noReg: d.noReg, perkara: d.perkara, noPidana: d.noPidana, denda: d.denda,
             tglDitahan: d.tglAwal ? Telraam.formatDateInput(new Date(d.tglAwal)) : '',
             tglDiputus: d.tglDiputus, tgl23sdp: d.tgl23sdp, 
             tglExpAwal: d.tglExpAwal ? Telraam.formatDateInput(new Date(d.tglExpAwal)) : '',
             pTahun: d.pidanaObj.y, pBulan: d.pidanaObj.m, pHari: d.pidanaObj.d
           });
           setRemisiList(d.remisiList || []);
       }
    }
  }, [location]);

  const calculateAll = () => {
     let rT = 0, rB = 0, rH = 0;
     remisiList.forEach(r => { rT += r.y; rB += r.m; rH += r.d; });
     rB += Math.floor(rH / 30); rH %= 30;
     rT += Math.floor(rB / 12); rB %= 12;

     if (!identitas.tglDitahan) {
         setResult(null);
         return;
     }

     const res = EnginePerhitungan.hitungMasaPidana(
         identitas.pTahun, identitas.pBulan, identitas.pHari,
         rT, rB, rH,
         identitas.tglDitahan, identitas.tglExpAwal
     );
     
     const selisihTahanan = EnginePerhitungan.hitungSelisihTanggal(identitas.tglDitahan, identitas.tglDiputus);

     setResult({
         ...res,
         rT, rB, rH,
         selisihTahanan
     });
  };

  useEffect(() => {
     calculateAll();
  }, [identitas, remisiList]);

  const updateIdentitas = (field: string, value: string | number) => {
      setIdentitas(prev => ({...prev, [field]: value}));
  };

  const updateRemisi = (index: number, field: keyof RemisiRow, value: any) => {
      const newList = [...remisiList];
      newList[index] = { ...newList[index], [field]: value };
      setRemisiList(newList);
  };

  const addRemisi = () => setRemisiList([...remisiList, {jenis:'', y:0, m:0, d:0}]);
  const removeRemisi = (idx: number) => setRemisiList(remisiList.filter((_, i) => i !== idx));

  const resetForm = () => {
      if(confirm("Anda yakin ingin mereset seluruh formulir?")) {
          setIdentitas({
              nama: '', noReg: '', perkara: '', noPidana: '', denda: '',
              tglDitahan: '', tglDiputus: '', tgl23sdp: '', tglExpAwal: '',
              pTahun: 0, pBulan: 0, pHari: 0
          });
          setRemisiList(Array(5).fill({jenis:'', y:0, m:0, d:0}));
          setResult(null);
      }
  };

  const simpanData = async () => {
      if(!result || !result.date23) {
          showToast('error', 'Data teu tiasa disimpen. Mangga lengkepan Tanggal Ditahan.');
          return;
      }
      
      setIsSaving(true);
      
      // Simulate network request/processing time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
          const rText = [];
          if(result.rT>0) rText.push(`${result.rT} Tahun`);
          if(result.rB>0) rText.push(`${result.rB} Bulan`);
          if(result.rH>0) rText.push(`${result.rH} Hari`);
          const totalR = rText.length>0 ? rText.join(' ') : '0 Bulan 0 Hari';
          const mPidana = `${identitas.pTahun} Tahun ${identitas.pBulan} Bulan ${identitas.pHari} Hari`;
          
          const newRiwayat: Riwayat = {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              nama: identitas.nama || 'Tanpa Nama',
              noReg: identitas.noReg || '-',
              masaPidana: mPidana,
              totalRemisi: totalR,
              ekspirasi: result.dateExpRemisi ? Telraam.formatDate(result.dateExpRemisi) : '-',
              status: new Date() >= result.date23 ? 'MEMENUHI (2/3)' : 'BELUM MEMENUHI',
              dataDetails: {
                  ...identitas,
                  tglAwal: identitas.tglDitahan,
                  pidanaObj: { y: identitas.pTahun, m: identitas.pBulan, d: identitas.pHari },
                  remisiList,
                  totalRemisi: totalR,
                  remisiObj: { y: result.rT, m: result.rB, d: result.rH },
                  ...result
              }
          };
          const rw = DB.get<Riwayat>(STORAGE_RIWAYAT);
          rw.push(newRiwayat);
          DB.save(STORAGE_RIWAYAT, rw);
          
          showToast('success', 'Data parantos hasil disimpen.');
      } catch (error) {
          showToast('error', 'Data teu tiasa disimpen. Mangga cobian deui.');
      } finally {
          setIsSaving(false);
      }
  };

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
    {isSaving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 animate-in fade-in zoom-in duration-200">
                <div className="relative">
                    <svg className="animate-spin h-12 w-12 text-navy-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Save size={16} className="text-navy-blue animate-pulse" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mt-6 mb-2">Mangga Antosan</h3>
                <p className="text-slate-500 font-medium text-center">Nuju nyimpen data...</p>
            </div>
        </div>
    )}

    <div className="space-y-6 print:hidden">
        <h1 className="text-2xl font-bold text-navy-blue">Perhitungan Masa Pidana</h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="space-y-6">
                {/* IDENTITAS */}
                <div className="card">
                    <div className="card-header"><h3 className="font-semibold">A. Identitas Warga Binaan</h3></div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input type="text" className="form-control" value={identitas.nama} onChange={e=>updateIdentitas('nama', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Nomor Register</label>
                            <input type="text" className="form-control" value={identitas.noReg} onChange={e=>updateIdentitas('noReg', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Perkara</label>
                            <input type="text" className="form-control" value={identitas.perkara} onChange={e=>updateIdentitas('perkara', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>No. Putusan</label>
                            <input type="text" className="form-control" value={identitas.noPidana} onChange={e=>updateIdentitas('noPidana', e.target.value)} />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label>Lama Pidana</label>
                            <div className="flex gap-2">
                                <input type="number" className="form-control w-full" placeholder="Tahun" value={identitas.pTahun || ''} onChange={e=>updateIdentitas('pTahun', parseInt(e.target.value)||0)} />
                                <input type="number" className="form-control w-full" placeholder="Bulan" value={identitas.pBulan || ''} onChange={e=>updateIdentitas('pBulan', parseInt(e.target.value)||0)} />
                                <input type="number" className="form-control w-full" placeholder="Hari" value={identitas.pHari || ''} onChange={e=>updateIdentitas('pHari', parseInt(e.target.value)||0)} />
                            </div>
                        </div>
                        <div className="form-group md:col-span-2">
                            <label>Denda / Subsider</label>
                            <input type="text" className="form-control" value={identitas.denda} onChange={e=>updateIdentitas('denda', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Tgl Mulai Ditahan <span className="text-red-500">*</span></label>
                            <input type="date" className="form-control" value={identitas.tglDitahan} onChange={e=>updateIdentitas('tglDitahan', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Tgl Ekspirasi Awal</label>
                            <input type="date" className="form-control" value={identitas.tglExpAwal} onChange={e=>updateIdentitas('tglExpAwal', e.target.value)} />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label>Tgl 2/3 SDP (Opsional)</label>
                            <input type="date" className="form-control" value={identitas.tgl23sdp} onChange={e=>updateIdentitas('tgl23sdp', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* REMISI */}
                <div className="card">
                    <div className="card-header flex justify-between">
                        <h3 className="font-semibold">B. Remisi</h3>
                        <button onClick={addRemisi} className="text-white text-xs bg-royal-blue px-2 py-1 rounded hover:bg-royal-dark transition">Tambah Baris</button>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead>
                                <tr>
                                    <th className="pb-2 font-semibold">Jenis / Keterangan</th>
                                    <th className="pb-2 font-semibold">Tahun</th>
                                    <th className="pb-2 font-semibold">Bulan</th>
                                    <th className="pb-2 font-semibold">Hari</th>
                                    <th className="pb-2 font-semibold text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {remisiList.map((r, i) => (
                                    <tr key={i} className="border-t border-slate-100">
                                        <td className="py-2 pr-2">
                                            <input type="text" placeholder="Cth: RK 2026" className="form-control px-3 py-1" value={r.jenis} onChange={e=>updateRemisi(i, 'jenis', e.target.value)} />
                                        </td>
                                        <td className="py-2 pr-2"><input type="number" min="0" className="form-control px-2 py-1 w-20" value={r.y || ''} onChange={e=>updateRemisi(i, 'y', Math.max(0, parseInt(e.target.value)||0))} /></td>
                                        <td className="py-2 pr-2"><input type="number" min="0" className="form-control px-2 py-1 w-20" value={r.m || ''} onChange={e=>updateRemisi(i, 'm', Math.max(0, parseInt(e.target.value)||0))} /></td>
                                        <td className="py-2 pr-2"><input type="number" min="0" className="form-control px-2 py-1 w-20" value={r.d || ''} max="30" onChange={e=>updateRemisi(i, 'd', Math.min(30, Math.max(0, parseInt(e.target.value)||0)))} /></td>
                                        <td className="py-2 text-center"><button onClick={()=>removeRemisi(i)} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 size={16}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* HASIL */}
            <div className="space-y-6">
                <div className="card">
                    <div className="card-header bg-slate-800"><h3 className="font-semibold text-white">C. Rincian Perhitungan Masa Pidana</h3></div>
                    <div className="p-4 space-y-6">
                        {result && result.date13 ? (
                            <>
                                {/* 1/3 MASA PIDANA */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-navy-blue border-b border-slate-300 pb-2 mb-3">1/3 Masa Pidana</h4>
                                    <div className="grid grid-cols-[160px_auto_1fr] gap-x-2 gap-y-2 text-sm">
                                        <span className="font-medium">1/3 Masa Pidana</span><span>:</span>
                                        <span className="font-semibold">{result.f13?.y || 0} Tahun, {result.f13?.m || 0} Bulan, {result.f13?.d || 0} Hari</span>
                                        
                                        <span className="font-medium">1/3 Pidana - Remisi</span><span>:</span>
                                        <span className="font-semibold text-red-600">- {result.rT || 0} Tahun, {result.rB || 0} Bulan, {result.rH || 0} Hari</span>
                                        
                                        <span className="font-bold">Sisa 1/3 Pidana</span><span className="font-bold">:</span>
                                        <span className="font-bold">{result.sisa13?.y || 0} Tahun, {result.sisa13?.m || 0} Bulan, {result.sisa13?.d || 0} Hari</span>
                                        
                                        <span className="font-bold mt-2">Tanggal Hasil 1/3</span><span className="font-bold mt-2">:</span>
                                        <span className="font-black text-lg text-navy-blue mt-1">{result.date13 ? Telraam.formatDate(result.date13) : '-'}</span>
                                    </div>
                                </div>

                                {/* 1/2 MASA PIDANA */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg shadow-sm">
                                    <h4 className="font-bold text-navy-blue border-b border-slate-300 pb-2 mb-3">1/2 Masa Pidana</h4>
                                    <div className="grid grid-cols-[160px_auto_1fr] gap-x-2 gap-y-2 text-sm">
                                        <span className="font-medium">1/2 Masa Pidana</span><span>:</span>
                                        <span className="font-semibold">{result.f12?.y || 0} Tahun, {result.f12?.m || 0} Bulan, {result.f12?.d || 0} Hari</span>
                                        
                                        <span className="font-medium">1/2 Pidana - Remisi</span><span>:</span>
                                        <span className="font-semibold text-red-600">- {result.rT || 0} Tahun, {result.rB || 0} Bulan, {result.rH || 0} Hari</span>
                                        
                                        <span className="font-bold">Sisa 1/2 Pidana</span><span className="font-bold">:</span>
                                        <span className="font-bold">{result.sisa12?.y || 0} Tahun, {result.sisa12?.m || 0} Bulan, {result.sisa12?.d || 0} Hari</span>
                                        
                                        <span className="font-bold mt-2">Tanggal Hasil 1/2</span><span className="font-bold mt-2">:</span>
                                        <span className="font-black text-lg text-navy-blue mt-1">{result.date12 ? Telraam.formatDate(result.date12) : '-'}</span>
                                    </div>
                                </div>

                                {/* 2/3 MASA PIDANA */}
                                <div className="p-4 bg-royal-light border-2 border-royal-blue rounded-lg shadow-sm">
                                    <h4 className="font-bold text-royal-dark border-b border-royal-blue/30 pb-2 mb-3">2/3 Masa Pidana (PB/CMB)</h4>
                                    <div className="grid grid-cols-[160px_auto_1fr] gap-x-2 gap-y-2 text-sm">
                                        <span className="font-medium">2/3 Masa Pidana</span><span>:</span>
                                        <span className="font-semibold">{result.f23?.y || 0} Tahun, {result.f23?.m || 0} Bulan, {result.f23?.d || 0} Hari</span>
                                        
                                        <span className="font-medium">2/3 Pidana - Remisi</span><span>:</span>
                                        <span className="font-semibold text-red-600">- {result.rT || 0} Tahun, {result.rB || 0} Bulan, {result.rH || 0} Hari</span>
                                        
                                        <span className="font-bold">Sisa 2/3 Pidana</span><span className="font-bold">:</span>
                                        <span className="font-bold">{result.sisa23?.y || 0} Tahun, {result.sisa23?.m || 0} Bulan, {result.sisa23?.d || 0} Hari</span>
                                        
                                        <span className="font-bold mt-2 text-royal-dark">Tanggal Ekspirasi 2/3</span><span className="font-bold mt-2 text-royal-dark">:</span>
                                        <span className="font-black text-2xl text-royal-blue mt-1">{result.date23 ? Telraam.formatDate(result.date23) : '-'}</span>
                                    </div>
                                </div>

                                {/* EKSPIRASI SETELAH REMISI */}
                                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg flex justify-between items-center shadow-sm">
                                    <span className="font-bold text-green-800 text-lg">Ekspirasi Setelah Remisi</span>
                                    <span className="font-black text-green-600 text-2xl">{result.dateExpRemisi ? Telraam.formatDate(result.dateExpRemisi) : '-'}</span>
                                </div>
                                
                                {result.logs && result.logs.length > 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 text-xs text-yellow-800 rounded-lg border border-yellow-200 shadow-sm hidden">
                                        <strong className="block mb-2 text-sm">Log TELRAM (Penghitungan Ekspirasi):</strong>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {result.logs.map((l: string, i: number) => <li key={i}>{l}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center p-12 text-slate-400">
                                <AlertCircle size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-medium">Lengkapi Tanggal Mulai Ditahan dan Lama Pidana untuk melihat hasil perhitungan.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={simpanData} 
                        disabled={isSaving}
                        className={`btn btn-primary flex-1 flex items-center justify-center py-3 text-base shadow-md transition-colors ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                        <Save size={20} className="mr-2"/> Simpan Data
                    </button>
                    <button onClick={calculateAll} className="btn btn-secondary justify-center px-4 shadow-sm" title="Hitung Ulang Secara Manual"><RefreshCw size={20}/> Hitung</button>
                    <button onClick={() => window.print()} className="btn btn-outline justify-center px-4 shadow-sm" title="Cetak Hasil"><Printer size={20}/> Cetak</button>
                    <button onClick={resetForm} className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 justify-center px-4 shadow-sm" title="Reset Form"><Trash2 size={20}/> Reset</button>
                </div>
            </div>
        </div>
    </div>
    
    <div className="hidden print:block w-full">
        <PrintLayout data={{ identitas, remisiList, result: result || {} }} />
    </div>
    </>
  );
}
