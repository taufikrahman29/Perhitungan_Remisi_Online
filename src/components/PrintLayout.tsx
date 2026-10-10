import React from 'react';
import { Telraam } from '../lib/telramEngine';

export default function PrintLayout({ data }: { data: any }) {
  

  const { identitas, remisiList } = data;
  
  const formatDate = (dateStr: string) => {
      if (!dateStr) return '..... - ..... - .......';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '..... - ..... - .......';
      return Telraam.formatDate(d);
  };
  
  const result = data.result || {};

  const pT = (identitas.pTahun !== undefined && identitas.pTahun !== null) ? identitas.pTahun : '....';
  const pB = (identitas.pBulan !== undefined && identitas.pBulan !== null) ? identitas.pBulan : '....';
  const pH = (identitas.pHari !== undefined && identitas.pHari !== null) ? identitas.pHari : '....';

  const rT = result.rT ?? '....';
  const rB = result.rB ?? '....';
  const rH = result.rH ?? '....';

  return (
      <div className="bg-white text-black p-8 text-[11pt] font-sans mx-auto max-w-4xl leading-tight">
          <style>{`
            @media print {
              .print-table td { padding: 4px 0; vertical-align: top; font-size: 11pt; }
            }
            .print-table td { padding: 4px 0; vertical-align: top; font-size: 11pt; }
            .dot-line { border-bottom: 2px dotted #000; display: inline-block; min-height: 1em; }
          `}</style>
          
          <table className="w-full print-table mb-4">
            <tbody>
                <tr>
                    <td className="w-32 font-bold">DAFTAR</td>
                    <td className="w-4 font-bold">:</td>
                    <td colSpan={3} className="font-bold">Perhitungan Usulan Pembebasan Bersyarat / Cuti Bersyarat.</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="w-32 font-bold">a.n.</td>
                    <td colSpan={2}><span className="dot-line w-full">{identitas.nama || ''}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">No. Register</td>
                    <td className="w-4 font-bold">:</td>
                    <td>Bi. / Bila. <span className="dot-line min-w-[200px]">{identitas.noReg}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">Perkara</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line w-full">{identitas.perkara}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">Pidana</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line min-w-[80px] text-center">{pT || ''}</span> Tahun <span className="dot-line min-w-[80px] text-center">{pB || ''}</span> Bulan.</td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">No. Pidana</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line w-full">{identitas.noPidana}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">Denda / Subsider</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line w-full">{identitas.denda}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">Tanggal Ekpirasi</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line w-full">{identitas.tglExpAwal ? Telraam.formatDate(new Date(identitas.tglExpAwal)) : ''}</span></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td className="font-bold">Tgl 2/3 SDP</td>
                    <td className="font-bold">:</td>
                    <td><span className="dot-line w-full">{identitas.tgl23sdp ? Telraam.formatDate(new Date(identitas.tgl23sdp)) : ''}</span></td>
                </tr>
            </tbody>
          </table>

          <div className="border-b-2 border-black w-full mb-6"></div>

          <table className="w-full print-table mb-6">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8">Ditahan</td>
                      <td className="w-4 font-bold">:</td>
                      <td>{formatDate(identitas.tglDitahan)}</td>
                  </tr>
                  <tr>
                      <td className="font-bold pl-8">Diputus</td>
                      <td className="font-bold">:</td>
                      <td>{formatDate(identitas.tglDiputus)}</td>
                  </tr>
                  <tr>
                      <td colSpan={2}></td>
                      <td><div className="border-b border-black w-48 mt-1 mb-2"></div></td>
                  </tr>
              </tbody>
          </table>

          <table className="w-full print-table mb-6">
              <tbody>
                  {remisiList.length < 5 ? [...remisiList, ...Array(5 - remisiList.length).fill({jenis:'', y:0, m:0, d:0})].map((r, i) => {
                      const totalMonths = (r.y * 12) + r.m;
                      const hasRemisi = totalMonths > 0 || r.d > 0;
                      return (
                          <tr key={i}>
                              <td className="w-64 pl-8">Remisi <span className="dot-line w-32 font-bold text-center">{r.jenis || ''}</span></td>
                              <td className="w-4 font-bold">:</td>
                              <td>
                                  <span className="inline-block w-12 text-center">{totalMonths}</span> Bulan
                                  <span className="inline-block w-12 text-center ml-4">{r.d}</span> Hari.
                              </td>
                          </tr>
                      )
                  }) : remisiList.map((r: any, i: number) => {
                      const totalMonths = (r.y * 12) + r.m;
                      const hasRemisi = totalMonths > 0 || r.d > 0;
                      return (
                          <tr key={i}>
                              <td className="w-64 pl-8">Remisi <span className="dot-line w-32 font-bold text-center">{r.jenis || ''}</span></td>
                              <td className="w-4 font-bold">:</td>
                              <td>
                                  <span className="inline-block w-12 text-center">{totalMonths}</span> Bulan
                                  <span className="inline-block w-12 text-center ml-4">{r.d}</span> Hari.
                              </td>
                          </tr>
                      )
                  })}
                  <tr>
                      <td colSpan={2}></td>
                      <td className="relative pt-2">
                          <div className="border-b-2 border-black w-64"></div>
                          <span className="absolute right-[calc(100%-17rem)] -top-1 font-bold">+</span>
                      </td>
                  </tr>
                  <tr>
                      <td className="font-bold pl-8 pt-2">Remisi</td>
                      <td className="font-bold pt-2">:</td>
                      <td className="font-bold pt-2">
                          <span className="inline-block w-12 text-center">{(rT * 12) + rB}</span> Bulan
                          <span className="inline-block w-12 text-center ml-4">{rH}</span> Hari. = <span className="dot-line min-w-[200px]"></span>
                      </td>
                  </tr>
              </tbody>
          </table>

          <table className="w-full print-table mb-8">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8">Pidana</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{pT}</span> Tahun
                          <span className="inline-block w-12 text-center ml-4">{pB}</span> Bulan
                      </td>
                  </tr>
              </tbody>
          </table>

          {/* 1/3 */}
          <table className="w-full print-table mb-6">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8">1/3 MasaPidana</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          1/3 X <span className="inline-block w-12 text-center">{pT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{pB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{pH}</span> Hari
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{result?.f13?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.f13?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.f13?.d ?? '....'}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8">1/3 Pidana - Remisi</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{rT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{rB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{rH}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td colSpan={2}></td>
                      <td className="pt-2">
                          <div className="border-b-[3px] border-dashed border-black w-96 relative">
                              <span className="absolute right-0 -top-4 font-bold bg-white px-1">-</span>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-2">
                          <span className="inline-block w-12 text-center">{result?.sisa13?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa13?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa13?.d ?? '....'}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-4"><span className="dot-line min-w-[400px] text-center font-bold">{Telraam.formatDate(result?.date13)}</span></td>
                  </tr>
              </tbody>
          </table>

          {/* 1/2 */}
          <table className="w-full print-table mb-6">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8">1/2 MasaPidana</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          1/2 X <span className="inline-block w-12 text-center">{pT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{pB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{pH}</span> Hari
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{result?.f12?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.f12?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.f12?.d ?? '....'}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8">1/2 Pidana - Remisi</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{rT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{rB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{rH}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td colSpan={2}></td>
                      <td className="pt-2">
                          <div className="border-b-[3px] border-dashed border-black w-96 relative">
                              <span className="absolute right-0 -top-4 font-bold bg-white px-1">-</span>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-2">
                          <span className="inline-block w-12 text-center">{result?.sisa12?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa12?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa12?.d ?? '....'}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-4"><span className="dot-line min-w-[400px] text-center font-bold">{Telraam.formatDate(result?.date12)}</span></td>
                  </tr>
              </tbody>
          </table>

          {/* 2/3 */}
          <table className="w-full print-table mb-8">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8">2/3 MasaPidana</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          2/3 X <span className="inline-block w-12 text-center">{pT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{pB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{pH}</span> Hari
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{result?.f23?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.f23?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.f23?.d ?? '....'}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      {/* Deliberate typo matching the original form image: "2/3 MasaPidana" instead of "2/3 Pidana - Remisi" */}
                      <td className="w-64 font-bold pl-8">2/3 MasaPidana</td>
                      <td className="w-4 font-bold">:</td>
                      <td>
                          <span className="inline-block w-12 text-center">{rT}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{rB}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{rH}</span> Hari.
                      </td>
                  </tr>
                  <tr>
                      <td colSpan={2}></td>
                      <td className="pt-2">
                          <div className="border-b-[3px] border-dashed border-black w-96 relative">
                              <span className="absolute right-0 -top-4 font-bold bg-white px-1">-</span>
                          </div>
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-2">
                          <span className="inline-block w-12 text-center">{result?.sisa23?.y ?? '....'}</span> Tahun 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa23?.m ?? '....'}</span> Bulan 
                          <span className="inline-block w-12 text-center ml-2">{result?.sisa23?.d ?? '....'}</span> Hari
                      </td>
                  </tr>
                  <tr>
                      <td className="w-64 pl-8"></td>
                      <td className="w-4 font-bold">:</td>
                      <td className="pt-4"><span className="dot-line min-w-[400px] text-center font-bold">{Telraam.formatDate(result?.date23)}</span></td>
                  </tr>
              </tbody>
          </table>

          <table className="w-full print-table mt-8">
              <tbody>
                  <tr>
                      <td className="w-64 font-bold pl-8 pb-4">Ekspirasi PB / CMB / CB</td>
                      <td className="w-4 font-bold pb-4">:</td>
                      <td className="pb-4"><span className="dot-line min-w-[400px] text-center font-bold">{Telraam.formatDate(result?.date23)}</span></td>
                  </tr>
                  <tr>
                      <td className="w-64 font-bold pl-8">EkspirasiSetelahRemisi</td>
                      <td className="w-4 font-bold">:</td>
                      <td><span className="dot-line min-w-[400px] text-center font-bold">{result?.dateExpRemisi ? Telraam.formatDate(result?.dateExpRemisi) : '-'}</span></td>
                  </tr>
              </tbody>
          </table>
      </div>
  );
}
