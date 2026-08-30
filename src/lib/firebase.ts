import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "gen-lang-client-0646658467",
  appId: "1:478911067250:web:f5410105737eb7aad17eeb",
  apiKey: "AIzaSyD9mWE2rVvwTuBupGh04cJ-L9u61AssYIA",
  authDomain: "gen-lang-client-0646658467.firebaseapp.com",
  storageBucket: "gen-lang-client-0646658467.firebasestorage.app",
  messagingSenderId: "478911067250"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-spmbpondokpesant-197912ec-454e-4e6e-8e16-716c01792768");
export const storage = getStorage(app);
