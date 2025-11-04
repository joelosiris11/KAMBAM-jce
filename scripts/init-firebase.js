#!/usr/bin/env node

/**
 * Script de inicialización de Firebase para Kanban JCE
 * 
 * Este script ayuda a inicializar las colecciones por defecto en Firestore
 * 
 * Uso:
 *   1. Asegúrate de tener el archivo .env configurado
 *   2. Ejecuta: node scripts/init-firebase.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ No se encontró el archivo .env');
  console.error('📝 Copia .env.example a .env y configura tus credenciales de Firebase');
  process.exit(1);
}

// Configuración de Firebase desde variables de entorno
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Validar configuración
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Configuración de Firebase incompleta');
  console.error('Asegúrate de tener todas las variables en .env:');
  console.error('  - VITE_FIREBASE_API_KEY');
  console.error('  - VITE_FIREBASE_PROJECT_ID');
  console.error('  - VITE_FIREBASE_AUTH_DOMAIN');
  console.error('  - VITE_FIREBASE_STORAGE_BUCKET');
  console.error('  - VITE_FIREBASE_MESSAGING_SENDER_ID');
  console.error('  - VITE_FIREBASE_APP_ID');
  process.exit(1);
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Columnas por defecto
const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8', order: 0 },
  { id: 'todo', title: 'Por Hacer', color: '#6366f1', order: 1 },
  { id: 'in-progress', title: 'En Proceso', color: '#f59e0b', order: 2 },
  { id: 'review', title: 'En Revisión', color: '#8b5cf6', order: 3 },
  { id: 'completed', title: 'Completado', color: '#10b981', order: 4 }
];

// Tareas de ejemplo
const EXAMPLE_TASKS = [
  {
    id: Date.now(),
    title: '¡Bienvenido a Kanban JCE!',
    description: 'Esta es una tarea de ejemplo. Puedes editarla o eliminarla.',
    status: 'todo',
    priority: 'medium',
    type: 'general',
    hours: 1,
    createdBy: 'sistema',
    assignedTo: null,
    comments: [
      {
        id: Date.now(),
        text: '¡Firebase está funcionando correctamente! 🔥',
        author: 'sistema',
        createdAt: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  }
];

async function initializeFirebase() {
  console.log('\n🔥 Inicializando Firebase...\n');
  console.log(`📦 Proyecto: ${firebaseConfig.projectId}`);
  console.log(`🌍 Región: ${firebaseConfig.authDomain}\n`);

  try {
    // Verificar si ya existen columnas
    const columnsSnapshot = await getDocs(collection(db, 'columns'));
    
    if (columnsSnapshot.empty) {
      console.log('📝 Creando columnas por defecto...');
      for (const column of DEFAULT_COLUMNS) {
        await setDoc(doc(db, 'columns', column.id), column);
        console.log(`  ✅ Columna creada: ${column.title}`);
      }
    } else {
      console.log(`✓ Ya existen ${columnsSnapshot.size} columnas`);
    }

    // Verificar si ya existen tareas
    const tasksSnapshot = await getDocs(collection(db, 'tasks'));
    
    if (tasksSnapshot.empty) {
      console.log('\n📝 Creando tarea de ejemplo...');
      for (const task of EXAMPLE_TASKS) {
        await setDoc(doc(db, 'tasks', String(task.id)), task);
        console.log(`  ✅ Tarea creada: ${task.title}`);
      }
    } else {
      console.log(`✓ Ya existen ${tasksSnapshot.size} tareas`);
    }

    console.log('\n✅ ¡Inicialización completada!\n');
    console.log('🚀 Ahora puedes ejecutar: npm run dev\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al inicializar Firebase:');
    console.error(error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n💡 Solución: Verifica las reglas de seguridad en Firebase Console');
      console.error('   Ve a: Firestore Database → Rules');
      console.error('   Para desarrollo, puedes usar:');
      console.error('   allow read, write: if true;');
    }
    
    process.exit(1);
  }
}

// Ejecutar
initializeFirebase();

