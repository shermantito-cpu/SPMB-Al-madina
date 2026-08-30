const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const regex = /const handleVerify = async \(id: string, jenjang: string\) => \{[\s\S]*?alert\('Gagal memverifikasi pendaftar: ' \+ err\.message\);\n    \}\n  \};/;

const replacement = `const handleVerify = async (id: string, jenjang: string, uid?: string) => {
    if (!window.confirm('Verifikasi pendaftar ini dan buatkan nomor ujian?')) return;
    try {
      console.log("Verifying ID:", id, "Jenjang:", jenjang);
      const currentYear = new Date().getFullYear() + 1;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = jenjang.substring(0,3).toUpperCase();
      const newNomorPeserta = \`PMB-\${currentYear}-\${prefix}-\${randomDigits}\`;

      // Update Firestore for public_registrations
      await updateDoc(doc(db, 'public_registrations', id), {
        statusVerifikasi: 'Terverifikasi',
        nomorPeserta: newNomorPeserta
      });

      // Update for users/uid/registrations if uid exists
      if (uid) {
         try {
            await updateDoc(doc(db, 'users', uid, 'registrations', id), {
               statusVerifikasi: 'Terverifikasi',
               nomorPeserta: newNomorPeserta
            });
         } catch(e) {
            console.warn("Failed to update user private subcollection:", e);
         }
      }

      alert('Pendaftar berhasil diverifikasi!');
      fetchData(); // Refresh data
    } catch (err: any) {
      console.error("Error during verification:", err);
      alert('Gagal memverifikasi pendaftar: ' + err.message);
    }
  };`;

content = content.replace(regex, replacement);

const buttonRegex = /onClick=\{\(\) => handleVerify\(row\.id, row\.jenjangName \|\| row\.jenjang \|\| 'PMB'\)\}/;
content = content.replace(buttonRegex, "onClick={() => handleVerify(row.id, row.jenjangName || row.jenjang || 'PMB', row.uid)}");

fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
