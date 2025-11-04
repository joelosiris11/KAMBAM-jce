// Script para inicializar roles en Firebase
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Roles por defecto del sistema
const DEFAULT_ROLES = [
  { 
    id: 'admin', 
    name: 'Administrador', 
    icon: '👑', 
    description: 'Control total del sistema y gestión de usuarios', 
    category: 'Gestión',
    color: '#dc2626',
    isActive: true
  },
  { 
    id: 'project-manager', 
    name: 'Project Manager', 
    icon: '📊', 
    description: 'Gestión completa de proyectos y tareas', 
    category: 'Gestión',
    color: '#6366f1',
    isActive: true
  },
  { 
    id: 'business-analyst', 
    name: 'Analista de Negocios', 
    icon: '📈', 
    description: 'Define requisitos y optimiza procesos de negocio', 
    category: 'Análisis',
    color: '#0891b2',
    isActive: true
  },
  { 
    id: 'process-researcher', 
    name: 'Investigador de Procesos', 
    icon: '🔬', 
    description: 'Analiza y mejora flujos de trabajo internos', 
    category: 'Análisis',
    color: '#0284c7',
    isActive: true
  },
  { 
    id: 'institutional-data-analyst', 
    name: 'Analista de Datos Institucionales', 
    icon: '🔍', 
    description: 'Interpreta datos para decisiones estratégicas', 
    category: 'Análisis',
    color: '#0369a1',
    isActive: true
  },
  { 
    id: 'ux-researcher', 
    name: 'Investigador UX', 
    icon: '💡', 
    description: 'Estudia el comportamiento del usuario para mejorar la experiencia', 
    category: 'Diseño',
    color: '#ea580c',
    isActive: true
  },
  { 
    id: 'service-designer', 
    name: 'Diseñador de Servicio', 
    icon: '🧩', 
    description: 'Diseña y optimiza la experiencia completa del servicio', 
    category: 'Diseño',
    color: '#f59e0b',
    isActive: true
  },
  { 
    id: 'ui-ux-designer', 
    name: 'Diseñador UI/UX', 
    icon: '🎨', 
    description: 'Crea interfaces de usuario intuitivas y atractivas', 
    category: 'Diseño',
    color: '#f97316',
    isActive: true
  },
  { 
    id: 'developer', 
    name: 'Desarrollador', 
    icon: '💻', 
    description: 'Diseña, codifica y mantiene aplicaciones de software', 
    category: 'Desarrollo',
    color: '#16a34a',
    isActive: true
  },
  { 
    id: 'compliance-specialist', 
    name: 'Especialista en Cumplimiento Normativo', 
    icon: '📜', 
    description: 'Asegura que la organización cumpla con las regulaciones', 
    category: 'Legal y Financiero',
    color: '#7c3aed',
    isActive: true
  },
  { 
    id: 'institutional-legal-advisor', 
    name: 'Asesor Legal Institucional', 
    icon: '⚖️', 
    description: 'Proporciona orientación legal y gestiona riesgos', 
    category: 'Legal y Financiero',
    color: '#9333ea',
    isActive: true
  },
  { 
    id: 'financial-advisor', 
    name: 'Asesor Financiero', 
    icon: '💰', 
    description: 'Ofrece asesoramiento sobre gestión de recursos financieros', 
    category: 'Legal y Financiero',
    color: '#a855f7',
    isActive: true
  },
  { 
    id: 'tester-functional-evaluator', 
    name: 'Tester / Evaluador Funcional', 
    icon: '🧪', 
    description: 'Realiza pruebas para asegurar la calidad del software', 
    category: 'Calidad',
    color: '#ec4899',
    isActive: true
  },
  { 
    id: 'documentation-specialist', 
    name: 'Especialista en Documentación', 
    icon: '📚', 
    description: 'Crea y gestiona la documentación técnica y de usuario', 
    category: 'Soporte',
    color: '#64748b',
    isActive: true
  },
  { 
    id: 'internal-communications-manager', 
    name: 'Encargado de Comunicación Interna', 
    icon: '📢', 
    description: 'Gestiona la comunicación efectiva dentro de la organización', 
    category: 'Soporte',
    color: '#475569',
    isActive: true
  },
  { 
    id: 'qa', 
    name: 'Analista de Calidad (QA)', 
    icon: '✅', 
    description: 'Asegura la calidad del producto a través de pruebas y procesos', 
    category: 'Calidad',
    color: '#059669',
    isActive: true
  }
];

async function initializeRoles() {
  try {
    console.log('🔄 Conectando a Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Conexión exitosa');
    console.log(`📝 Inicializando ${DEFAULT_ROLES.length} roles...`);

    for (const role of DEFAULT_ROLES) {
      const roleRef = doc(db, 'roles', role.id);
      await setDoc(roleRef, {
        ...role,
        createdAt: new Date().toISOString()
      });
      console.log(`✓ ${role.icon} ${role.name} (${role.category})`);
    }

    console.log('\n✅ ¡Roles inicializados correctamente en Firebase!');
    console.log(`\n📊 Total: ${DEFAULT_ROLES.length} roles`);
    console.log('🔥 Colección: roles\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error al inicializar roles:', error);
    process.exit(1);
  }
}

initializeRoles();

