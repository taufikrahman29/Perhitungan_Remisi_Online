import React, { useState } from 'react';
import { Telraam } from '../lib/telramEngine';

export default function TelramDigital() {
  const [baseYear, setBaseYear] = useState(2022);

  const months = ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOPEMBER", "DESEMBER"];
  const shortMonths = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nop", "Des"];
  
  // Generate 4 years (48 columns) x 31 rows
  const cols = 48;
  const rows = 31;
  const grid = [];
  
  for (let r = 0; r < rows; r++) {
      let rowData = [];
      for (let c = 0; c < cols; c++) {
          // Telram logic: Cell(r, c) = Jan 1st + (c * 30) + r days
          const date = new Date(baseYear, 0, 1);
          date.setDate(date.getDate() + (c * 30) + r);
          
          const d = date.getDate();
          const m = date.getMonth();
          const isFirst = d === 1;
          
          rowData.push({
              text: isFirst ? shortMonths[m] : d.toString(),
              isFirst
          });
      }
      grid.push(rowData);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
            <h1 className="text-2xl font-bold text-navy-blue">TELRAM Digital</h1>
            <p className="text-sm text-slate-500 mt-1">
                Tabel Perhitungan Masa Pidana / Masa Penahanan (Kalender Perhitungan)
            </p>
        </div>
        <div className="flex items-center gap-3">
            <label className="font-semibold text-slate-600">Pilih Tahun Dasar:</label>
            <input 
              type="number" 
              className="form-control w-32 font-bold" 
              value={baseYear} 
              onChange={e => setBaseYear(parseInt(e.target.value) || new Date().getFullYear())} 
            />
        </div>
      </div>

      <div className="bg-white p-2 md:p-4 shadow-xl overflow-x-auto w-full">
         <style>{`
            .telram-table th, .telram-table td { border: 1px solid #000; text-align: center; font-family: Arial, sans-serif; }
            .telram-table th { font-weight: bold; }
            .telram-col-sep { border-right: 3px solid #000 !important; }
         `}</style>
         
         <div className="mb-4 mx-auto w-max text-center border-2 border-black bg-green-300 p-2 text-sm font-bold shadow">
             TAHUN KABISAT<br/>
             <span className="font-normal text-xs">Tahun yang jumlah hari dalam 1 thnnya adalah 366 hr,<br/>
             Penambahan 1 hari pada bulan Februari menjadi 29 hr<br/>
             (Ctrl+Ctrl: Tahunnya dapat dibagi 4, contoh: 2004, 2008, 2012 dst)</span>
         </div>

         <table className="telram-table text-[10pt] min-w-max border-collapse border-2 border-black mx-auto">
             <thead>
                 <tr>
                     {Array.from({length: cols}).map((_, i) => (
                         <th key={'m'+i} className={`bg-blue-300 py-4 px-1 min-w-[28px] ${i % 12 === 11 ? 'telram-col-sep' : ''}`} style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: '100px' }}>
                             {months[i % 12]}
                         </th>
                     ))}
                 </tr>
                 <tr>
                     {Array.from({length: cols}).map((_, i) => (
                         <th key={'num'+i} className={`bg-yellow-300 py-1 ${i % 12 === 11 ? 'telram-col-sep' : ''}`}>
                             {(i % 12) + 1}
                         </th>
                     ))}
                 </tr>
             </thead>
             <tbody>
                 {grid.map((row, rIdx) => (
                     <tr key={rIdx}>
                         {row.map((cell, cIdx) => (
                             <td key={cIdx} className={`py-1 px-1 ${cell.isFirst ? 'text-red-600 font-bold' : 'text-black'} ${cIdx % 12 === 11 ? 'telram-col-sep' : ''}`}>
                                 {cell.text}
                             </td>
                         ))}
                     </tr>
                 ))}
             </tbody>
         </table>
      </div>
    </div>
  );
}
