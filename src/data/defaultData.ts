import { JenjangInfo, BankAccount, PendaftarData } from '../types';

export const JENJANG_LIST: JenjangInfo[] = [
  {
    id: "Raudhatul Athfal (TK)",
    shortName: "RA / TK Al-Madina",
    badge: "Usia 4 - 6 Tahun",
    biayaFormulir: 150000,
    biayaMasuk: "Rp 3.500.000 (Infaq Gedung & Seragam)",
    programUnggulan: ["Hafalan Juz 30 & Doa Harian", "Metode Tilawati & Iqro Cepat", "Karakter Islami Sejak Dini", "Sentra Motorik & Kreativitas"],
    deskripsi: "Pendidikan anak usia dini berbasis fitrah dan kecintaan Al-Qur'an dengan suasana bermain yang menyenangkan dan islami.",
    sheetTargetName: "Pendaftar_RA",
    kuota: 60,
    terdaftar: 38,
    iconName: "Baby"
  },
  {
    id: "Salafiyah Ula (SD)",
    shortName: "Salafiyah Ula (Setingkat SD)",
    badge: "Putra & Putri (Non-Asrama/Asrama)",
    biayaFormulir: 200000,
    biayaMasuk: "Rp 6.800.000",
    programUnggulan: ["Target Tahfidz 5-10 Juz", "Bahasa Arab & Inggris Praktis", "Kurikulum Diknas Terpadu", "Adab & Akhlak Salafus Shalih"],
    deskripsi: "Pendidikan dasar terpadu memadukan kurikulum keagamaan pesantren dan sains nasional berijazah resmi negara.",
    sheetTargetName: "Pendaftar_Ula",
    kuota: 90,
    terdaftar: 72,
    iconName: "BookOpen"
  },
  {
    id: "Salafiyah Wustho (SMP)",
    shortName: "Salafiyah Wustho (Setingkat SMP)",
    badge: "Boarding School / Asrama Wajib",
    biayaFormulir: 250000,
    biayaMasuk: "Rp 9.500.000 (Termasuk Ranjang & Lemari)",
    programUnggulan: ["Program Takhassus Tahfidz 15 Juz", "Kajian Kitab Jurumiyah & Aqidah", "Bilingual Environment (Arab-Inggris)", "Bela Diri Tapak Suci & Panahan"],
    deskripsi: "Masa transisi pembinaan kedisiplinan dan kemandirian santri usia remaja dengan lingkungan asrama kondusif 24 jam.",
    sheetTargetName: "Pendaftar_Wustho",
    kuota: 120,
    terdaftar: 98,
    iconName: "GraduationCap"
  },
  {
    id: "Salafiyah Ulya (SMA)",
    shortName: "Salafiyah Ulya (Setingkat SMA/MA)",
    badge: "Boarding School / Kader Ulama & Sains",
    biayaFormulir: 250000,
    biayaMasuk: "Rp 10.200.000",
    programUnggulan: ["Target Mutqin 30 Juz & Sanad", "Kajian Nahwu Sharaf Lanjutan (Alfiyah)", "Persiapan PTN, UIN, Madinah & Timur Tengah", "Pelatihan Kepemimpinan & Khitobah"],
    deskripsi: "Jenjang lanjutan pencetak kader ulama intelektual yang siap tembus universitas dalam negeri maupun Timur Tengah.",
    sheetTargetName: "Pendaftar_Ulya",
    kuota: 100,
    terdaftar: 84,
    iconName: "Award"
  },
  {
    id: "Ma'had Aly (D3/S1)",
    shortName: "Ma'had Aly Al-Madina (Takhassus)",
    badge: "Takhassus Fiqh & Ushul Fiqh",
    biayaFormulir: 300000,
    biayaMasuk: "Beasiswa Penuh / Subsidi Prestasi",
    programUnggulan: ["Spesialisasi Fiqh Wa Ushuluhu", "Kajian Kutubut Turats (Kitab Gundul)", "Karya Tulis Ilmiah & Bahtsul Masail", "Pengabdian Dakwah Nusantara"],
    deskripsi: "Pendidikan tinggi pesantren berfokus pada pendalaman turats Islam dan fatwa kontemporer berijazah sarjana agama.",
    sheetTargetName: "Pendaftar_Aly",
    kuota: 40,
    terdaftar: 29,
    iconName: "Scroll"
  }
];

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7189024512",
    accountHolder: "YAYASAN PONDOK PESANTREN AL-MADINA",
    code: "451",
    logoColor: "bg-emerald-600",
    instructions: [
      "Pilih Transfer > Antar BSI / Antar Bank Online (Kode 451)",
      "Masukkan Rekening: 7189024512 a.n YAYASAN PONDOK PESANTREN AL-MADINA",
      "Masukkan nominal sesuai jenjang pilihan",
      "Tulis berita transfer: 'SPMB - Nama Calon Santri'",
      "Simpan dan screenshot resi transfer untuk diunggah"
    ]
  },
  {
    bankName: "Bank Mandiri",
    accountNumber: "1130099887766",
    accountHolder: "PP AL MADINA PRABUMULIH SPMB",
    code: "008",
    logoColor: "bg-blue-700",
    instructions: [
      "Pilih Transfer > Ke Rekening Mandiri (008)",
      "Masukkan Rekening: 1130099887766",
      "Simpan bukti transaksi digital / ATM untuk diunggah"
    ]
  },
  {
    bankName: "Bank BRI",
    accountNumber: "008901004567531",
    accountHolder: "PANITIA SPMB AL-MADINA",
    code: "002",
    logoColor: "bg-blue-600",
    instructions: [
      "Pilih Transfer > Ke Rekening BRI (002)",
      "Masukkan Rekening: 008901004567531",
      "Simpan resi transaksi"
    ]
  }
];

export const INITIAL_REGISTRANTS: PendaftarData[] = [
  {
    id: "spmb-001",
    nomorRegistrasi: "SPMB-2027-00101",
    timestamp: "2026-08-15 08:30:00",
    jenjang: "Salafiyah Wustho (SMP)",
    nama: "Muhammad Rayhan Al-Fatih",
    nik: "1671012304080001",
    tempat_lahir: "Prabumulih",
    tgl_lahir: "2013-05-14",
    jk: "Laki-laki",
    anak_ke: 1,
    jml_saudara: 3,
    gol_darah: "O",
    riwayat_penyakit: "Tidak ada",
    asal_sekolah: "SDIT Al-Hikmah Prabumulih",
    nisn: "0134567890",
    tahun_lulus: 2026,
    nama_ayah: "H. Ahmad Dahlan, S.Pd.I",
    nama_ibu: "Hj. Siti Aisyah, S.E",
    no_wa: "081278901234",
    pekerjaan: "PNS / Guru",
    gaji: "Rp 3.000.001 - Rp 5.000.000",
    alamat: "Jl. Jenderal Sudirman No. 45 RT 03 RW 02, Kel. Muara Dua, Kec. Prabumulih Timur",
    kab_kota: "Kota Prabumulih",
    provinsi: "Sumatera Selatan",
    metode_bayar: "Transfer Bank",
    status: "Terverifikasi / Lunas",
    noUjian: "WST-2027-0101",
    jadwalUjian: "Ahad, 10 Januari 2027 | 08.00 - 12.00 WIB",
    ruangUjian: "Ruang 04 (Gedung Umar bin Khattab)",
    lokasiUjian: "Kampus Utama Ponpes Al-Madina Prabumulih",
    catatanPanitia: "Berkas lengkap dan transfer lunas terverifikasi Bank Syariah Indonesia.",
    biayaNominal: 250000
  },
  {
    id: "spmb-002",
    nomorRegistrasi: "SPMB-2027-00102",
    timestamp: "2026-08-16 10:15:00",
    jenjang: "Salafiyah Ulya (SMA)",
    nama: "Fathimah Az-Zahra",
    nik: "1671012304080002",
    tempat_lahir: "Palembang",
    tgl_lahir: "2010-09-21",
    jk: "Perempuan",
    anak_ke: 2,
    jml_saudara: 4,
    gol_darah: "A",
    riwayat_penyakit: "Alergi debu ringan",
    asal_sekolah: "MTs Negeri 1 Palembang",
    nisn: "0109876543",
    tahun_lulus: 2026,
    nama_ayah: "Ir. Bambang Trihatmojo",
    nama_ibu: "dr. Nurul Hidayah",
    no_wa: "081399887766",
    pekerjaan: "Wiraswasta / Dokter",
    gaji: "> Rp 5.000.000",
    alamat: "Komplek Pertamina Sukaraja Blok B No. 12, Prabumulih Selatan",
    kab_kota: "Kota Prabumulih",
    provinsi: "Sumatera Selatan",
    metode_bayar: "Transfer Bank",
    status: "Menunggu Verifikasi",
    catatanPanitia: "Bukti transfer telah diterima, sedang dalam pengecekan mutasi bank oleh bendahara.",
    biayaNominal: 250000
  },
  {
    id: "spmb-003",
    nomorRegistrasi: "SPMB-2027-00103",
    timestamp: "2026-08-17 14:20:00",
    jenjang: "Salafiyah Ula (SD)",
    nama: "Abdullah Zubair Pratama",
    nik: "1671012304080003",
    tempat_lahir: "Muara Enim",
    tgl_lahir: "2019-03-10",
    jk: "Laki-laki",
    anak_ke: 1,
    jml_saudara: 2,
    gol_darah: "B",
    riwayat_penyakit: "Tidak ada",
    asal_sekolah: "TK Islam Terpadu An-Nur",
    nisn: "0198761234",
    tahun_lulus: 2026,
    nama_ayah: "Rudi Hartono",
    nama_ibu: "Lestari Anggraini",
    no_wa: "085273112233",
    pekerjaan: "Karyawan Swasta",
    gaji: "Rp 1.000.000 - Rp 3.000.000",
    alamat: "Dusun II Karang Raja, Kec. Prabumulih Barat",
    kab_kota: "Kota Prabumulih",
    provinsi: "Sumatera Selatan",
    metode_bayar: "Tunai di Kantor (Khusus Domisili Dekat)",
    status: "Menunggu Pembayaran Tunai",
    catatanPanitia: "Harap konfirmasi ke kantor Tata Usaha sebelum batas waktu pembayaran tunai.",
    biayaNominal: 200000
  },
  {
    id: "spmb-004",
    nomorRegistrasi: "SPMB-2027-00104",
    timestamp: "2026-08-17 16:45:00",
    jenjang: "Raudhatul Athfal (TK)",
    nama: "Aisyah Humaira Khansa",
    nik: "1671012304080004",
    tempat_lahir: "Prabumulih",
    tgl_lahir: "2021-11-05",
    jk: "Perempuan",
    anak_ke: 3,
    jml_saudara: 3,
    gol_darah: "AB",
    riwayat_penyakit: "Tidak ada",
    asal_sekolah: "PAUD Melati",
    nisn: "-",
    tahun_lulus: 2026,
    nama_ayah: "Zulkifli Hasan",
    nama_ibu: "Maryam",
    no_wa: "082188776655",
    pekerjaan: "Pedagang",
    gaji: "Rp 1.000.000 - Rp 3.000.000",
    alamat: "Jl. Mayor Iskandar Pasar 1 Prabumulih",
    kab_kota: "Kota Prabumulih",
    provinsi: "Sumatera Selatan",
    metode_bayar: "Transfer Bank",
    status: "Terverifikasi / Lunas",
    noUjian: "RAT-2027-0042",
    jadwalUjian: "Sabtu, 9 Januari 2027 | 08.30 - 10.30 WIB",
    ruangUjian: "Sentra RA Bintang (Gedung Khadijah)",
    lokasiUjian: "Kampus 2 RA Al-Madina Prabumulih",
    catatanPanitia: "Semua berkas lengkap. Harap hadir 15 menit sebelum observasi kesiapan belajar.",
    biayaNominal: 150000
  },
  {
    id: "spmb-005",
    nomorRegistrasi: "SPMB-2027-00105",
    timestamp: "2026-08-18 09:10:00",
    jenjang: "Ma'had Aly (D3/S1)",
    nama: "Ahmad Zaki Mubarok",
    nik: "1671012304080005",
    tempat_lahir: "Baturaja",
    tgl_lahir: "2006-07-12",
    jk: "Laki-laki",
    anak_ke: 1,
    jml_saudara: 2,
    gol_darah: "O",
    riwayat_penyakit: "Tidak ada",
    asal_sekolah: "Pondok Pesantren Raudhatul Ulum Sakatiga",
    nisn: "0065432198",
    tahun_lulus: 2025,
    nama_ayah: "Drs. KH. Mansyur",
    nama_ibu: "Usth. Halimah",
    no_wa: "081273884499",
    pekerjaan: "Pendidik / Da'i",
    gaji: "Rp 3.000.001 - Rp 5.000.000",
    alamat: "Jl. Lintas Sumatera KM 5, Baturaja",
    kab_kota: "Kab. Ogan Komering Ulu",
    provinsi: "Sumatera Selatan",
    metode_bayar: "Transfer Bank",
    status: "Terverifikasi / Lunas",
    noUjian: "ALY-2027-0015",
    jadwalUjian: "Senin, 11 Januari 2027 | 09.00 - 14.00 WIB",
    ruangUjian: "Aula Utama Perpustakaan Ma'had Aly",
    lokasiUjian: "Gedung Pascasarjana Ponpes Al-Madina",
    catatanPanitia: "Siapkan hafalan minimal 5 Juz dan hafalan Matan Jurumiyah untuk tes lisan.",
    biayaNominal: 300000
  }
];

export const MODERN_GAS_CODE = `/**
 * =========================================================================
 * BACKEND GOOGLE APPS SCRIPT - SPMB PONDOK PESANTREN AL-MADINA PRABUMULIH
 * =========================================================================
 * Versi: 2.5 (Support REST API, Auto-Tab Multi Jenjang, Auto-Folder Drive, 
 * Auto-Headers, Ping & Test Data, No-CORS Text/JSON Response)
 */

// OPTIONAL: Biarkan kosong jika script ini dipasang langsung via menu 
// "Extensions > Apps Script" di Google Sheet Anda.
var SPREADSHEET_ID = '1WANylpCKTyHK4E1o3wstNg0hbhr4hf5evOa7mPgz02Y'; 
var FOLDER_ID = '1ECfPFrNbCLFmOrcIb1ef0dbkkK5CrF2I'; 
var TEMPLATE_DOC_ID = '15u3YoLBo_va_5MxTBVH7ctipahGcs3SFr0_EBMbFyxE'; 

/**
 * Handle HTTP GET Request
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  
  if (action === "ping") {
    var ss = getTargetSpreadsheet();
    return createJsonResponse({ 
      success: true, 
      status: "connected",
      message: "Alhamdulillah! Koneksi ke Google Spreadsheet berhasil.",
      sheetName: ss.getName(),
      timestamp: new Date().toISOString()
    });
  }

  if (action === "testData") {
    var testResult = insertTestRow();
    return createJsonResponse(testResult);
  }

  if (action === "cekStatus") {
    var nik = e.parameter.nik || "";
    var result = cekStatusPendaftar(nik);
    return createJsonResponse(result);
  }
  
  if (action === "cetakKartu") {
    var identifier = e.parameter.nik || "";
    var pdfResult = generateKartuUjian(identifier);
    return createJsonResponse(pdfResult);
  }
  
  if (action === "getAll") {
    var list = getAllPendaftar();
    return createJsonResponse({ success: true, data: list });
  }

  return HtmlService.createHtmlOutput(
    '<div style="font-family:sans-serif;padding:30px;text-align:center;max-width:500px;margin:auto;">' +
    '<h2 style="color:#047857;margin-bottom:8px;">Endpoint API SPMB Al-Madina Siap Digunakan</h2>' +
    '<p style="color:#4b5563;font-size:14px;">Web App Google Apps Script telah aktif dan terhubung ke Google Spreadsheet.</p>' +
    '<div style="background:#ecfdf5;border:1px solid #a7f3d0;padding:12px;border-radius:8px;margin-top:16px;color:#065f46;font-size:13px;">' +
    'Salin URL pada bilah alamat browser ini ke pengaturan aplikasi SPMB.' +
    '</div></div>'
  ).setTitle("SPMB Al-Madina API").setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Handle HTTP POST Request
 */
function doPost(e) {
  try {
    var postData;
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter;
      }
    } else if (e.parameter) {
      postData = e.parameter;
    } else {
      throw new Error("Data kiriman kosong");
    }

    if (postData.action === "ping") {
      return createJsonResponse({ success: true, message: "Pong! Server Google Apps Script merespons POST." });
    }

    if (postData.action === "testData") {
      return createJsonResponse(insertTestRow());
    }

    var result = processFormSubmission(postData);
    return createJsonResponse(result);
  } catch (err) {
    return createJsonResponse({ success: false, message: err.toString() });
  }
}

/**
 * Dapatkan Spreadsheet Target
 */
function getTargetSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "" && !SPREADSHEET_ID.includes("MASUKKAN")) {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Dapatkan Folder Drive Target (Otomatis Buat jika belum ada)
 */
function getTargetFolder() {
  if (FOLDER_ID && FOLDER_ID.trim() !== "" && !FOLDER_ID.includes("MASUKKAN")) {
    return DriveApp.getFolderById(FOLDER_ID.trim());
  }
  var folders = DriveApp.getFoldersByName("SPMB_AlMadina_Berkas_2027");
  if (folders.hasNext()) {
    return folders.next();
  }
  var newFolder = DriveApp.createFolder("SPMB_AlMadina_Berkas_2027");
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

/**
 * Memproses penyimpanan formulir pendaftaran
 */
function processFormSubmission(data) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);

    var ss = getTargetSpreadsheet();
    var folder = getTargetFolder();

    // 1. Simpan berkas upload ke Google Drive (jika ada)
    var buktiUrl = "", kkUrl = "", akteUrl = "", fotoUrl = "", skNisnUrl = "";

    if (data.bukti_bayar_base64) {
      buktiUrl = uploadFileToDrive(folder, data.nik + "_BUKTI_" + (data.nama || "santri"), data.bukti_bayar_base64, data.bukti_bayar_mime || "image/jpeg");
    }
    if (data.kk_base64) {
      kkUrl = uploadFileToDrive(folder, data.nik + "_KK_" + (data.nama || "santri"), data.kk_base64, data.kk_mime || "application/pdf");
    }
    if (data.akte_base64) {
      akteUrl = uploadFileToDrive(folder, data.nik + "_AKTE_" + (data.nama || "santri"), data.akte_base64, data.akte_mime || "application/pdf");
    }
    if (data.foto_base64) {
      fotoUrl = uploadFileToDrive(folder, data.nik + "_FOTO_" + (data.nama || "santri"), data.foto_base64, data.foto_mime || "image/jpeg");
    }
    if (data.sk_nisn_base64) {
      skNisnUrl = uploadFileToDrive(folder, data.nik + "_SK_NISN_" + (data.nama || "santri"), data.sk_nisn_base64, data.sk_nisn_mime || "application/pdf");
    }

    // 2. Tab Sheet sesuai Jenjang
    var sheetName = getSheetName(data.jenjang);
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow([
        "Timestamp", "No Registrasi", "Jenjang", "Nama Santri", "NIK", "Tempat Lahir", "Tgl Lahir", 
        "JK", "Anak Ke", "Asal Sekolah", "NISN", "Tahun Lulus", "Nama Ayah", "Nama Ibu", "No WhatsApp", 
        "Pekerjaan", "Gaji Perbulan", "Alamat Lengkap", "Metode Bayar", "Link Bukti Bayar", "Link KK", 
        "Link Akte", "Link Foto", "Link SK NISN", "Status Verifikasi", "No Ujian", "Jadwal Ujian", "Link Kartu PDF"
      ]);
      sheet.setFrozenRows(1);
      sheet.getRange("A1:AB1").setBackground("#047857").setFontColor("#ffffff").setFontWeight("bold");
    }

    var noRegistrasi = data.nomorRegistrasi || ("SPMB-2027-" + Utilities.formatDate(new Date(), "GMT+7", "MMdd") + Math.floor(100 + Math.random() * 900));
    var statusAwal = data.metode_bayar === "Transfer Bank" ? "Menunggu Verifikasi" : "Menunggu Pembayaran Tunai";
    var timestampStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      timestampStr,
      noRegistrasi,
      data.jenjang,
      data.nama,
      "'" + data.nik,
      data.tempat_lahir || "-",
      data.tgl_lahir || "-",
      data.jk || "-",
      data.anak_ke || 1,
      data.asal_sekolah || "-",
      "'" + (data.nisn || "-"),
      data.tahun_lulus || "-",
      data.nama_ayah || "-",
      data.nama_ibu || "-",
      "'" + (data.no_wa || "-"),
      data.pekerjaan || "-",
      data.gaji || "-",
      data.alamat || "-",
      data.metode_bayar || "-",
      buktiUrl,
      kkUrl,
      akteUrl,
      fotoUrl,
      skNisnUrl,
      statusAwal,
      "",
      "",
      ""
    ]);

    return { 
      success: true, 
      message: "Pendaftaran santri berhasil dicatat ke Google Spreadsheet!",
      nomorRegistrasi: noRegistrasi,
      status: statusAwal
    };

  } catch (e) {
    return { success: false, message: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Uji Coba Masukkan Baris Test
 */
function insertTestRow() {
  try {
    var ss = getTargetSpreadsheet();
    var sheet = ss.getSheetByName("Pendaftar_Ula");
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }
    var ts = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      ts,
      "SPMB-TEST-" + Math.floor(1000 + Math.random() * 9000),
      "Salafiyah Ula (SD)",
      "[TEST KONEKSI BERHASIL]",
      "'1671000000000000",
      "Prabumulih",
      "2018-01-01",
      "Laki-laki",
      "1",
      "TK Test",
      "'0011223344",
      "2026",
      "Ayah Test",
      "Ibu Test",
      "'08123456789",
      "Wiraswasta",
      "Rp 1.000.000 - Rp 3.000.000",
      "Jl. Uji Coba No. 1",
      "Transfer Bank",
      "", "", "", "", "",
      "Terverifikasi / Lunas",
      "ULA-TEST-001",
      "Ahad, 10 Januari 2027",
      ""
    ]);
    return {
      success: true,
      message: "Data percobaan berhasil ditambahkan ke sheet: " + sheet.getName(),
      timestamp: ts
    };
  } catch (err) {
    return { success: false, message: "Gagal menulis test row: " + err.toString() };
  }
}

/**
 * Upload Base64 ke Google Drive
 */
function uploadFileToDrive(folder, filename, base64Data, mimeType) {
  try {
    var rawData = base64Data;
    if (base64Data.indexOf(",") > -1) {
      rawData = base64Data.split(",")[1];
    }
    var blob = Utilities.newBlob(Utilities.base64Decode(rawData), mimeType, filename);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    return "Error upload: " + e.message;
  }
}

/**
 * Helper Tab Name
 */
function getSheetName(jenjang) {
  if (!jenjang) return "Pendaftar_Semua";
  if (jenjang.indexOf("RA") > -1 || jenjang.indexOf("TK") > -1) return "Pendaftar_RA";
  if (jenjang.indexOf("Ula") > -1 || jenjang.indexOf("SD") > -1) return "Pendaftar_Ula";
  if (jenjang.indexOf("Wustho") > -1 || jenjang.indexOf("SMP") > -1) return "Pendaftar_Wustho";
  if (jenjang.indexOf("Ulya") > -1 || jenjang.indexOf("SMA") > -1) return "Pendaftar_Ulya";
  if (jenjang.indexOf("Aly") > -1) return "Pendaftar_Aly";
  return "Data_Pendaftar_Lainnya";
}

/**
 * Cek Status Pendaftar by NIK atau No Registrasi
 */
function cekStatusPendaftar(identifier) {
  var ss = getTargetSpreadsheet();
  var sheets = ss.getSheets();
  var cleanId = (identifier || "").toString().replace(/['\\s]/g, "");

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) continue;
    
    var header = data[0];
    
    var getIndex = function(nameOptions) {
      for (var c = 0; c < header.length; c++) {
        var colName = header[c].toString().toLowerCase().trim();
        for (var n = 0; n < nameOptions.length; n++) {
          if (colName.indexOf(nameOptions[n].toLowerCase()) !== -1) return c;
        }
      }
      return -1;
    };

    var idxNik = getIndex(["nik", "n.i.k"]);
    var idxReg = getIndex(["no registrasi", "nomor registrasi", "noreg"]);
    var idxNama = getIndex(["nama"]);
    var idxJenjang = getIndex(["jenjang", "pendidikan"]);
    var idxStatus = getIndex(["status verifikasi", "status pembayaran", "status"]);
    var idxNoUjian = getIndex(["no ujian", "nomor ujian"]);
    var idxJadwal = getIndex(["jadwal"]);
    var idxKartu = getIndex(["kartu", "pdf"]);
    
    // Fallback indices if header not found
    if (idxNik === -1) idxNik = 4;
    if (idxReg === -1) idxReg = 1;
    if (idxJenjang === -1) idxJenjang = 2;
    if (idxNama === -1) idxNama = 3;
    if (idxStatus === -1) idxStatus = 24;
    if (idxNoUjian === -1) idxNoUjian = 25;
    if (idxJadwal === -1) idxJadwal = 26;
    if (idxKartu === -1) idxKartu = 27;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var rowNoReg = (row[idxReg] || "").toString().replace(/['\\s]/g, "");
      var rowNik = (row[idxNik] || "").toString().replace(/['\\s]/g, "");

      if (rowNik === cleanId || rowNoReg === cleanId) {
        return {
          ditemukan: true,
          nomorRegistrasi: row[idxReg] || "",
          jenjang: row[idxJenjang] || "",
          nama: row[idxNama] || "",
          nik: row[idxNik] || "",
          status: row[idxStatus] || "Menunggu Verifikasi",
          noUjian: row[idxNoUjian] || "",
          jadwalUjian: row[idxJadwal] || "",
          urlKartu: row[idxKartu] || "",
          tglDaftar: row[0]
        };
      }
    }
  }
  return { ditemukan: false };
}

/**
 * Cetak Kartu Ujian (Generate PDF from Template)
 */
function generateKartuUjian(identifier) {
  var dataPendaftar = cekStatusPendaftar(identifier);
  if (!dataPendaftar.ditemukan) {
    return { success: false, message: "Data tidak ditemukan." };
  }
  
  if (dataPendaftar.urlKartu && dataPendaftar.urlKartu.indexOf("http") > -1) {
    return { success: true, url: dataPendaftar.urlKartu, message: "Kartu sudah pernah dicetak." };
  }

  if (!TEMPLATE_DOC_ID) {
    return { success: false, message: "TEMPLATE_DOC_ID belum dikonfigurasi di script." };
  }

  try {
    var folder = getTargetFolder();
    var templateDoc = DriveApp.getFileById(TEMPLATE_DOC_ID);
    
    var newDocName = "Kartu_Ujian_" + dataPendaftar.nik + "_" + dataPendaftar.nama;
    var copyFile = templateDoc.makeCopy(newDocName, folder);
    var copyId = copyFile.getId();
    var doc = DocumentApp.openById(copyId);
    var body = doc.getBody();
    
    // Sesuaikan placeholder ini dengan yang ada di Template Dokumen Anda
    body.replaceText("{{NAMA}}", dataPendaftar.nama || "-");
    body.replaceText("{{NO_REG}}", dataPendaftar.nomorRegistrasi || "-");
    body.replaceText("{{NIK}}", dataPendaftar.nik || "-");
    body.replaceText("{{JENJANG}}", dataPendaftar.jenjang || "-");
    body.replaceText("{{NO_UJIAN}}", dataPendaftar.noUjian || "-");
    body.replaceText("{{JADWAL}}", dataPendaftar.jadwalUjian || "-");
    
    doc.saveAndClose();
    
    var pdfBlob = copyFile.getAs(MimeType.PDF);
    var pdfFile = folder.createFile(pdfBlob);
    pdfFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Hapus file dokumen sementaranya (dibungkus try-catch agar tidak error jika file terkunci oleh Google)
    try {
      copyFile.setTrashed(true);
    } catch (e) {
      // Abaikan jika gagal dihapus saat ini
    }
    
    var pdfUrl = pdfFile.getUrl();
    
    // Simpan link PDF ke Spreadsheet
    simpanUrlKartu(identifier, pdfUrl);
    
    return { success: true, url: pdfUrl, message: "Kartu PDF berhasil dibuat." };
  } catch (err) {
    return { success: false, message: "Gagal membuat PDF: " + err.toString() };
  }
}

function simpanUrlKartu(identifier, pdfUrl) {
  var ss = getTargetSpreadsheet();
  var sheets = ss.getSheets();
  var cleanId = (identifier || "").toString().replace(/['\\s]/g, "");

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) continue;
    
    var header = data[0];
    var getIndex = function(nameOptions) {
      for (var c = 0; c < header.length; c++) {
        var colName = header[c].toString().toLowerCase().trim();
        for (var n = 0; n < nameOptions.length; n++) {
          if (colName.indexOf(nameOptions[n].toLowerCase()) !== -1) return c;
        }
      }
      return -1;
    };

    var idxNik = getIndex(["nik", "n.i.k"]);
    var idxReg = getIndex(["no registrasi", "nomor registrasi", "noreg"]);
    var idxKartu = getIndex(["kartu", "pdf"]);
    
    if (idxNik === -1) idxNik = 4;
    if (idxReg === -1) idxReg = 1;
    if (idxKartu === -1) idxKartu = 27;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      var rowNoReg = (row[idxReg] || "").toString().replace(/['\\s]/g, "");
      var rowNik = (row[idxNik] || "").toString().replace(/['\\s]/g, "");

      if (rowNik === cleanId || rowNoReg === cleanId) {
        sheet.getRange(r + 1, idxKartu + 1).setValue(pdfUrl);
        return true;
      }
    }
  }
  return false;
}

/**
 * Helper JSON Response
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
