const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /const \[nomorRegistrasi, setNomorRegistrasi\] = useState\(''\);/;
const replacement = `const [nomorRegistrasi, setNomorRegistrasi] = useState('');
  
  // Real-time listener for registration status
  React.useEffect(() => {
    if (isSubmitted && nomorRegistrasi && !isVerified) {
      const unsubscribe = onSnapshot(doc(db, 'public_registrations', nomorRegistrasi), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.statusVerifikasi === 'Terverifikasi' || data.statusVerifikasi?.toLowerCase().includes('terverifikasi')) {
            setNomorPeserta(data.nomorPeserta || 'PMB-2027-' + Math.floor(1000 + Math.random() * 9000));
            setIsVerified(true);
            setIsCheckingFormVisible(false);
          }
        }
      });
      return () => unsubscribe();
    }
  }, [isSubmitted, nomorRegistrasi, isVerified]);`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/MultiStepForm.tsx', content);
