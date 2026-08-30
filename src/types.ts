export type JenjangType = 
  | "Raudhatul Athfal (TK)"
  | "Salafiyah Ula (SD)"
  | "Salafiyah Wustho (SMP)"
  | "Salafiyah Ulya (SMA)"
  | "Ma'had Aly (D3/S1)";

export type StatusPendaftaran = 
  | "Menunggu Pembayaran Tunai"
  | "Menunggu Verifikasi"
  | "Terverifikasi / Lunas"
  | "Perlu Perbaikan Berkas"
  | "Ditolak";

export type MetodeBayar = "Transfer Bank" | "Tunai di Kantor (Khusus Domisili Dekat)";

export interface UploadedFileMeta {
  fileName: string;
  fileSize: number;
  mimeType: string;
  base64Data?: string; // base64 without prefix or with prefix
  previewUrl?: string;
  driveUrl?: string;
}

export interface PendaftarData {
  id: string;
  nomorRegistrasi: string;
  timestamp: string;
  jenjang: JenjangType;
  
  // Data Santri
  nama: string;
  nik: string;
  tempat_lahir: string;
  tgl_lahir: string;
  jk: "Laki-laki" | "Perempuan" | "";
  anak_ke: number | string;
  jml_saudara?: number | string;
  gol_darah?: string;
  riwayat_penyakit?: string;
  
  // Data Pendidikan
  asal_sekolah: string;
  nisn: string;
  tahun_lulus: number | string;
  
  // Data Orang Tua
  nama_ayah: string;
  nama_ibu: string;
  no_wa: string;
  pekerjaan: string;
  pekerjaan_ibu?: string;
  gaji: string;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kab_kota?: string;
  provinsi?: string;
  
  // Administrasi
  metode_bayar: MetodeBayar;
  bukti_bayar?: UploadedFileMeta;
  kk?: UploadedFileMeta;
  akte?: UploadedFileMeta;
  foto?: UploadedFileMeta;
  sk_nisn?: UploadedFileMeta;
  
  // Status & Ujian
  status: StatusPendaftaran;
  catatanPanitia?: string;
  noUjian?: string;
  jadwalUjian?: string;
  ruangUjian?: string;
  lokasiUjian?: string;
  linkKartuPdf?: string;
  biayaNominal?: number;
}

export interface JenjangInfo {
  id: JenjangType;
  shortName: string;
  badge: string;
  biayaFormulir: number;
  biayaMasuk: string;
  programUnggulan: string[];
  deskripsi: string;
  sheetTargetName: string;
  kuota: number;
  terdaftar: number;
  iconName: string;
}

export interface BankAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  code: string;
  logoColor: string;
  instructions: string[];
}

export interface GasConfig {
  webAppUrl: string;
  spreadsheetId: string;
  folderId: string;
  autoSync: boolean;
  lastSync?: string;
}
