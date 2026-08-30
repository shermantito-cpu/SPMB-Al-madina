const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /await setDoc\(doc\(db, 'public_registrations', newNomorRegistrasi\), firestoreData\);/;
const replacement = `await setDoc(doc(db, 'public_registrations', newNomorRegistrasi), firestoreData);

      // 4. Sinkronisasi ke Spreadsheet (Background)
      try {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwyRnmLIF4gZAvhaKmmr2CW_RsApM6Bgv8TxxIOPXfRyvEYXJN18Ho_E-xNt9np8IDKxw/exec";
        fetch(GAS_URL + "?action=submitForm", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "submitForm",
            data: {
               ...firestoreData,
               // Convert nested to simple strings for spreadsheet if necessary
               buktiPembayaranBase64: firestoreData.buktiPembayaranBase64 ? firestoreData.buktiPembayaranBase64.substring(0, 100) + '... (terpotong, lihat di admin)' : ''
            }
          })
        }).catch(e => console.warn("GAS fetch warning", e));
      } catch (e) {
        console.warn("Gagal sinkronisasi ke spreadsheet:", e);
      }`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/MultiStepForm.tsx', content);
