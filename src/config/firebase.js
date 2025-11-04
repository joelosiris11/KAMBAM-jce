// Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Verificar si Firebase está configurado
const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey && 
         firebaseConfig.apiKey !== 'tu_api_key_aqui' && 
         firebaseConfig.projectId;
};

// Inicializar Firebase solo si está configurado
let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
  }
} else {
  console.warn('⚠️ Firebase no configurado. Usando LocalStorage como fallback.');
  console.warn('Para usar Firebase, configura las variables de entorno en .env');
}

export { app, auth, db, isFirebaseConfigured };

