const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// replace handleVerify
code = code.replace(
  /const handleVerify = async \(id: string, jenjang: string, uid\?: string\) => \{[\s\S]*?setData\(prev => prev\.map\(item => item\.id === id \? \{ \.\.\.item, statusVerifikasi: 'Terverifikasi', nomorPeserta: newNomorPeserta \} : item\)\);\n    \} catch \(err: any\) \{[\s\S]*?alert\('Gagal memverifikasi pendaftar: ' \+ err\.message\);\n    \}\n  \};/,
  `const handleVerifyAction = async (id: string, jenjang: string, uid: string | undefined, action: 'terima' | 'tolak') => {
    const isTerima = action === 'terima';
    const confirmMessage = isTerima ? 'Terima pendaftar ini dan buatkan nomor ujian?' : 'Tolak pendaftar ini?';
    if (!window.confirm(confirmMessage)) return;

    try {
      let newNomorPeserta = '';
      let newStatus = isTerima ? 'Terverifikasi' : 'Ditolak';

      if (isTerima) {
        const currentYear = new Date().getFullYear() + 1;
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const prefix = jenjang.substring(0,3).toUpperCase();
        newNomorPeserta = \`PMB-\${currentYear}-\${prefix}-\${randomDigits}\`;
      }

      // Update Firestore for public_registrations
      await updateDoc(doc(db, 'public_registrations', id), {
        statusVerifikasi: newStatus,
        ...(isTerima ? { nomorPeserta: newNomorPeserta } : {})
      });

      // Update for users/uid/registrations if uid exists
      if (uid) {
         try {
            await updateDoc(doc(db, 'users', uid, 'registrations', id), {
               statusVerifikasi: newStatus,
               ...(isTerima ? { nomorPeserta: newNomorPeserta } : {})
            });
         } catch(e) {
            console.warn("Failed to update user private subcollection:", e);
         }
      }

      alert(isTerima ? 'Pendaftar berhasil diverifikasi!' : 'Pendaftar ditolak.');
      
      // Update state locally immediately for instant feedback
      setData(prev => prev.map(item => item.id === id ? { ...item, statusVerifikasi: newStatus, ...(isTerima ? { nomorPeserta: newNomorPeserta } : {}) } : item));
    } catch (err: any) {
      console.error("Error during verification:", err);
      alert('Gagal memproses pendaftar: ' + err.message);
    }
  };`
);

// replace buttons in table
code = code.replace(
  /<td className="px-6 py-4">\s*<button\s*onClick=\{[^}]+\}\s*className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1\.5 rounded-lg font-bold flex items-center gap-1 transition-colors"\s*>\s*<Check size=\{14\} \/> Verifikasi\s*<\/button>\s*<\/td>/,
  `<td className="px-6 py-4 flex gap-2">
                        <button 
                          onClick={() => handleVerifyAction(row.id, row.jenjangName || row.jenjang || 'PMB', row.uid, 'terima')}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Terima
                        </button>
                        <button 
                          onClick={() => handleVerifyAction(row.id, row.jenjangName || row.jenjang || 'PMB', row.uid, 'tolak')}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          Tolak
                        </button>
                      </td>`
);

// Also filter out 'Ditolak' from pending
code = code.replace(
  /const pendingData = filteredData\.filter\(d => !\(d\.statusVerifikasi \|\| ''\)\.toLowerCase\(\)\.includes\('terverifikasi'\)\);/,
  `const pendingData = filteredData.filter(d => {
    const status = (d.statusVerifikasi || '').toLowerCase();
    return !status.includes('terverifikasi') && !status.includes('ditolak');
  });`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
