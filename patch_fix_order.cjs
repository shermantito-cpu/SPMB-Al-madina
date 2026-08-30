const fs = require('fs');
let content = fs.readFileSync('src/MultiStepForm.tsx', 'utf-8');

const regex = /\/\/ Real-time listener for registration status[\s\S]*?\}, \[isSubmitted, nomorRegistrasi, isVerified\]\);\n/;
content = content.replace(regex, '');

const target = /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/;
const replacement = `const [isSubmitting, setIsSubmitting] = useState(false);

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

content = content.replace(target, replacement);

fs.writeFileSync('src/MultiStepForm.tsx', content);
