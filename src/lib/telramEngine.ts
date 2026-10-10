export const Telraam = {
    isLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },
    daysInYear(year: number): number {
        return this.isLeapYear(year) ? 366 : 365;
    },
    getDayOfYear(date: Date): number {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date.getTime() - start.getTime();
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    },
    dateFromDayOfYear(year: number, dayOfYear: number): Date {
        return new Date(year, 0, dayOfYear);
    },
    add(dateStr: string, y: number, m: number, d: number): Date | null {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;

        const targetYear = date.getFullYear() + y;
        let currentDayOfYear = this.getDayOfYear(date);
        
        // Adjust if starting from Feb 29 and target year is not leap
        if (date.getMonth() === 1 && date.getDate() === 29 && !this.isLeapYear(targetYear)) {
            currentDayOfYear = this.getDayOfYear(new Date(targetYear, 1, 28));
        }
        
        const totalDaysToAdd = (m * 30) + d;
        let resultYear = targetYear;
        let resultDayOfYear = currentDayOfYear + totalDaysToAdd;
        
        while (resultDayOfYear > this.daysInYear(resultYear)) {
            resultDayOfYear -= this.daysInYear(resultYear);
            resultYear++;
        }
        
        return this.dateFromDayOfYear(resultYear, resultDayOfYear);
    },
    subtract(date: Date, y: number, m: number, d: number): { date: Date, logs: string[] } | null {
        if (!date || isNaN(date.getTime())) return null;

        const targetYear = date.getFullYear() - y;
        let currentDayOfYear = this.getDayOfYear(date);
        
        if (date.getMonth() === 1 && date.getDate() === 29 && !this.isLeapYear(targetYear)) {
            currentDayOfYear = this.getDayOfYear(new Date(targetYear, 1, 28));
        }
        
        const totalDaysToSubtract = (m * 30) + d;
        let resultYear = targetYear;
        let resultDayOfYear = currentDayOfYear - totalDaysToSubtract;
        
        while (resultDayOfYear <= 0) {
            resultYear--;
            resultDayOfYear += this.daysInYear(resultYear);
        }
        
        const logs = [
            `Metode: Pengurangan menggunakan TELRAM kalender.`,
            `1. Tanggal Base: ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getFullYear()}`,
            `2. Hari Tahun Ke-: ${this.getDayOfYear(date)}`,
            `3. Durasi Pengurangan: ${y} Tahun, ${m} Bulan, ${d} Hari -> ${totalDaysToSubtract} Hari kalender`,
            `4. Pengurangan Hari: ${this.getDayOfYear(date)} - ${totalDaysToSubtract} = ${resultDayOfYear} (Sisa hari di tahun ${resultYear})`
        ];
        
        return { date: this.dateFromDayOfYear(resultYear, resultDayOfYear), logs: logs };
    },
    formatDate(date?: Date | null): string {
        if (!date || isNaN(date.getTime())) return '-';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    },
    formatDateInput(date?: Date | null): string {
        if (!date || isNaN(date.getTime())) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }
};
