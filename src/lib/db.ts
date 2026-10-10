export const STORAGE_WB = 'REMISI_DB_WB';
export const STORAGE_RIWAYAT = 'REMISI_DB_RIWAYAT';

export interface WargaBinaan {
    id: number;
    nama: string;
    noReg: string;
    perkara: string;
    lama?: string;
    exp?: string;
    status?: string;
    [key: string]: any; // Allow arbitrary extra properties from Excel import
}

export interface Riwayat {
    id: number;
    timestamp: string;
    nama: string;
    noReg: string;
    masaPidana: string;
    totalRemisi: string;
    ekspirasi: string;
    status: string;
    dataDetails: any;
}

export const DB = {
    get<T>(key: string): T[] {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    },
    save<T>(key: string, data: T[]): void {
        localStorage.setItem(key, JSON.stringify(data));
    },
    init(): void {
        if(this.get<WargaBinaan>(STORAGE_WB).length === 0) {
            this.save<WargaBinaan>(STORAGE_WB, [
                { id: 1, nama: "Budi Santoso", noReg: "BI.123/2023", perkara: "Pidana Umum", lama: "2 Tahun 0 Bulan 0 Hari", exp: "15-04-2025", status: "Aktif" },
                { id: 2, nama: "Andi Saputra", noReg: "BIIA.456/2022", perkara: "Pidana Khusus", lama: "5 Tahun 6 Bulan 0 Hari", exp: "20-12-2027", status: "Aktif" }
            ]);
        }
    }
};
