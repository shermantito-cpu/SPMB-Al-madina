const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

// Add verification modal state
code = code.replace(
  /const \[filterJenjang, setFilterJenjang\] = useState\('Semua'\);/,
  `const [filterJenjang, setFilterJenjang] = useState('Semua');
  const [verifyingUser, setVerifyingUser] = useState<any>(null);`
);

// Update handleVerifyAction to not use window.confirm anymore
code = code.replace(
  /const handleVerifyAction = async \([\s\S]*?alert\('Gagal memproses pendaftar: ' \+ err\.message\);\n    \}\n  \};/,
  `const handleVerifyAction = async (action: 'terima' | 'tolak') => {
    if (!verifyingUser) return;
    const { id, jenjang, uid } = verifyingUser;
    const isTerima = action === 'terima';
    const confirmMessage = isTerima ? 'Terima pendaftar ini dan buatkan nomor ujian?' : 'Tolak pendaftar ini?';
    if (!window.confirm(confirmMessage)) return;

    try {
      let newNomorPeserta = '';
      let newStatus = isTerima ? 'Terverifikasi' : 'Ditolak';

      if (isTerima) {
        const currentYear = new Date().getFullYear() + 1;
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const prefix = (jenjang || 'PMB').substring(0,3).toUpperCase();
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
      setVerifyingUser(null);
    } catch (err: any) {
      console.error("Error during verification:", err);
      alert('Gagal memproses pendaftar: ' + err.message);
    }
  };`
);

// Replace table buttons
code = code.replace(
  /<td className="px-6 py-4 flex gap-2">[\s\S]*?<\/td>/,
  `<td className="px-6 py-4">
                        <button 
                          onClick={() => setVerifyingUser({ id: row.id, jenjang: row.jenjangName || row.jenjang || 'PMB', uid: row.uid, namaLengkap: row.namaLengkap, noReg: row.nomorRegistrasi })}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors"
                        >
                          <Check size={14} /> Verifikasi
                        </button>
                      </td>`
);

// Add modal at the end before </div></>
code = code.replace(
  /<\/div>\s*\)\;\s*\}\s*$/,
  `
      {verifyingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm px-4">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl flex flex-col max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Verifikasi Pendaftar</h3>
            <p className="text-sm text-gray-600 mb-6">
              Anda akan memverifikasi pendaftar <strong>{verifyingUser.namaLengkap}</strong> ({verifyingUser.noReg}). Apakah pendaftar ini diterima atau ditolak?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => handleVerifyAction('terima')}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Terima
              </button>
              <button 
                onClick={() => handleVerifyAction('tolak')}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
              >
                Tolak
              </button>
            </div>
            <button 
              onClick={() => setVerifyingUser(null)}
              className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
`
);

fs.writeFileSync('src/pages/AdminDashboard.tsx', code);
