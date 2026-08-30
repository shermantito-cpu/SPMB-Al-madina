const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace handleGlobalCheck
content = content.replace(/const handleGlobalCheck = async \(e: React\.FormEvent\) => \{[\s\S]*?(?=\s*useEffect\(\(\) => \{)/, `const handleGlobalCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalRegNum) return;
    setIsCheckingGlobal(true);
    setGlobalCheckMessage('');

    try {
      // Import the needed Firestore functions (make sure they are imported in App.tsx or use window object? Better yet, I'll use a dynamic import to avoid altering the top of the file since I'm patching)
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('./lib/firebase');
      
      const q = query(collection(db, 'public_registrations'), where('nomorRegistrasi', '==', globalRegNum));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
         const data = querySnapshot.docs[0].data();
         let jenjangCode = data.jenjang || '';
         if (!jenjangCode) {
            const name = (data.jenjangName || '').toLowerCase();
            if (name.includes('wustho')) jenjangCode = 'Wustho';
            else if (name.includes('ulya')) jenjangCode = 'Ulya';
            else if (name.includes('ula')) jenjangCode = 'Ula';
            else if (name.includes('ra') || name.includes('raudhatul')) jenjangCode = 'RA';
            else if (name.includes('aly') || name.includes('mahad')) jenjangCode = 'Mahad_Aly';
            else jenjangCode = 'Wustho';
         }
         navigateTo('home', jenjangCode, data.nomorRegistrasi);
         setGlobalRegNum(''); // reset on success
      } else {
         setGlobalCheckMessage('Nomor Registrasi tidak ditemukan.');
      }
    } catch (err) {
       console.error(err);
       setGlobalCheckMessage('Terjadi kesalahan koneksi.');
    } finally {
       setIsCheckingGlobal(false);
    }
  };

  `);
fs.writeFileSync('src/App.tsx', content);
