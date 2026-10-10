import { Telraam } from './telramEngine';

export interface Duration {
    y: number;
    m: number;
    d: number;
}

export const EnginePerhitungan = {
    // Helper: subtract administrative durations with borrowing logic (used BEFORE adding to calendar)
    adminSubtractDuration(y1: number, m1: number, d1: number, y2: number, m2: number, d2: number): Duration {
        let y = y1 - y2;
        let m = m1 - m2;
        let d = d1 - d2;
        
        if (d < 0) {
            d += 30;
            m -= 1;
        }
        if (m < 0) {
            m += 12;
            y -= 1;
        }
        return { y, m, d };
    },

    hitungMasaPidana(pTahun: number, pBulan: number, pHari: number, rTahun: number, rBulan: number, rHari: number, tglDitahanStr: string, tglExpAwalStr: string) {
        const totalPidanaDays = (pTahun * 360) + (pBulan * 30) + pHari;
        
        const calcFraction = (fraction: number): Duration => {
            const fDays = Math.floor(totalPidanaDays * fraction);
            return { 
                y: Math.floor(fDays / 360), 
                m: Math.floor((fDays % 360) / 30), 
                d: (fDays % 360) % 30 
            };
        };

        const f13 = calcFraction(1/3);
        const f12 = calcFraction(1/2);
        const f23 = calcFraction(2/3);

        const sisa13 = this.adminSubtractDuration(f13.y, f13.m, f13.d, rTahun, rBulan, rHari);
        const sisa12 = this.adminSubtractDuration(f12.y, f12.m, f12.d, rTahun, rBulan, rHari);
        const sisa23 = this.adminSubtractDuration(f23.y, f23.m, f23.d, rTahun, rBulan, rHari);

        let date13 = null, date12 = null, date23 = null, dateExpRemisi = null, logs: string[] = [];

        if (tglDitahanStr) {
            date13 = Telraam.add(tglDitahanStr, sisa13.y, sisa13.m, sisa13.d);
            date12 = Telraam.add(tglDitahanStr, sisa12.y, sisa12.m, sisa12.d);
            date23 = Telraam.add(tglDitahanStr, sisa23.y, sisa23.m, sisa23.d);
        }

        if (tglExpAwalStr) {
            const expDate = new Date(tglExpAwalStr);
            if (!isNaN(expDate.getTime())) {
                const res = Telraam.subtract(expDate, rTahun, rBulan, rHari);
                if (res) {
                    dateExpRemisi = res.date;
                    logs = res.logs;
                }
            }
        }

        return {
            f13, f12, f23,
            sisa13, sisa12, sisa23,
            date13, date12, date23,
            dateExpRemisi,
            logs
        };
    },

    hitungSelisihTanggal(tglAwal: string, tglAkhir: string): Duration | null {
        if (!tglAwal || !tglAkhir) return null;
        const [y1, m1, day1] = tglAwal.split('-').map(Number);
        const [y2, m2, day2] = tglAkhir.split('-').map(Number);
        
        // Handle input format YYYY-MM-DD
        const parseDateString = (str: string) => {
             const parts = str.split('-');
             if(parts[0].length === 4) { // YYYY-MM-DD
                 return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
             } else { // DD-MM-YYYY
                 return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
             }
        };

        const d1 = parseDateString(tglAwal);
        const d2 = parseDateString(tglAkhir);
        
        if (isNaN(d1.getTime()) || isNaN(d2.getTime()) || d2 < d1) return null;
        
        let yDiff = d2.getFullYear() - d1.getFullYear();
        let mDiff = d2.getMonth() - d1.getMonth();
        let dDiff = d2.getDate() - d1.getDate();

        if (dDiff < 0) {
            mDiff -= 1;
            const daysInPrevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
            const borrowDays = (d1.getDate() > daysInPrevMonth) ? d1.getDate() : daysInPrevMonth;
            dDiff += borrowDays;
        }
        if (mDiff < 0) {
            mDiff += 12;
            yDiff -= 1;
        }
        return { y: yDiff, m: mDiff, d: dDiff };
    }
};
