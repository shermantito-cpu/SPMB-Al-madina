const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminDashboard.tsx', 'utf-8');

const regex = /const handleVerify = async \(id: string, jenjang: string\) => \{[\s\S]*?fetchData\(\); \/\/ Refresh data\n    \} catch \(err\) \{/;

const replacement = `const handleVerify = async (id: string, jenjang: string) => {
    if (!window.confirm('Verifikasi pendaftar ini dan buatkan nomor ujian?')) return;
    try {
      // Generate Nomor Ujian: PMB-2027-[JENJANG]-[RANDOM]
      const currentYear = new Date().getFullYear() + 1;
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const prefix = jenjang.substring(0,3).toUpperCase();
      const newNomorPeserta = \`PMB-\${currentYear}-\${prefix}-\${randomDigits}\`;

      // Update Firestore
      await updateDoc(doc(db, 'public_registrations', id), {
        statusVerifikasi: 'Terverifikasi',
        nomorPeserta: newNomorPeserta
      });

      // Update Spreadsheet
      try {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwyRnmLIF4gZAvhaKmmr2CW_RsApM6Bgv8TxxIOPXfRyvEYXJN18Ho_E-xNt9np8IDKxw/exec";
        await fetch(GAS_URL + "?action=updateStatus", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
             action: "updateStatus",
             nomorRegistrasi: id,
             statusVerifikasi: "Terverifikasi",
             nomorPeserta: newNomorPeserta
          })
        });
      } catch(e) {
        console.warn("Gagal sinkronisasi ke spreadsheet:", e);
      }

      alert('Pendaftar berhasil diverifikasi!');
      fetchData(); // Refresh data
    } catch (err) {`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/pages/AdminDashboard.tsx', content);
