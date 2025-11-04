// Servicio de Firebase para gestión de roles
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';

// ============= ROLES =============
export const firebaseRoles = {
  // Obtener todos los roles
  getAll: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const rolesRef = collection(db, 'roles');
    const snapshot = await getDocs(rolesRef);
    const roles = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
    // Ordenar en el cliente para evitar necesitar índice compuesto
    return roles.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.name.localeCompare(b.name);
    });
  },

  // Obtener rol por ID
  getById: async (roleId) => {
    if (!db) throw new Error('Firebase no configurado');
    const roleDocRef = doc(db, 'roles', roleId);
    const roleDoc = await getDoc(roleDocRef);
    
    if (!roleDoc.exists()) return null;
    
    return {
      ...roleDoc.data(),
      id: roleDoc.id
    };
  },

  // Crear nuevo rol
  create: async (roleData) => {
    if (!db) throw new Error('Firebase no configurado');
    const rolesRef = collection(db, 'roles');
    
    const newRole = {
      ...roleData,
      isActive: roleData.isActive !== undefined ? roleData.isActive : true,
      createdAt: serverTimestamp()
    };

    // Usar el id del rol como ID del documento
    const roleDocRef = doc(rolesRef, roleData.id);
    await setDoc(roleDocRef, newRole);
    
    return {
      ...newRole,
      createdAt: new Date().toISOString()
    };
  },

  // Actualizar rol
  update: async (roleId, updates) => {
    if (!db) throw new Error('Firebase no configurado');
    const roleDocRef = doc(db, 'roles', roleId);
    
    await updateDoc(roleDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    const updatedDoc = await getDoc(roleDocRef);
    return {
      ...updatedDoc.data(),
      id: updatedDoc.id
    };
  },

  // Eliminar rol
  delete: async (roleId) => {
    if (!db) throw new Error('Firebase no configurado');
    const roleDocRef = doc(db, 'roles', roleId);
    await deleteDoc(roleDocRef);
    return true;
  },

  // Activar/Desactivar rol
  toggleActive: async (roleId, isActive) => {
    if (!db) throw new Error('Firebase no configurado');
    const roleDocRef = doc(db, 'roles', roleId);
    await updateDoc(roleDocRef, { 
      isActive,
      updatedAt: serverTimestamp()
    });
    return true;
  },

  // Escuchar cambios en roles en tiempo real
  onSnapshot: (callback) => {
    if (!db) throw new Error('Firebase no configurado');
    const rolesRef = collection(db, 'roles');
    return onSnapshot(rolesRef, (snapshot) => {
      const roles = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      // Ordenar en el cliente
      const sortedRoles = roles.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        return a.name.localeCompare(b.name);
      });
      callback(sortedRoles);
    });
  },

  // Obtener solo roles activos
  getActive: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const allRoles = await firebaseRoles.getAll();
    return allRoles.filter(role => role.isActive !== false);
  },

  // Obtener roles públicos (sin admin) y activos
  getPublic: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const allRoles = await firebaseRoles.getActive();
    return allRoles.filter(role => role.id !== 'admin');
  }
};

// Verificar si Firebase está disponible
export const isRolesServiceAvailable = () => {
  return isFirebaseConfigured() && db !== null;
};

// Inicializar roles por defecto en Firebase
export const initializeDefaultRoles = async (defaultRoles) => {
  if (!db) throw new Error('Firebase no configurado');
  
  // Verificar si ya existen roles
  const rolesSnapshot = await getDocs(collection(db, 'roles'));
  
  if (rolesSnapshot.empty) {
    console.log('🔄 Inicializando roles por defecto en Firebase...');
    
    for (const role of defaultRoles) {
      await firebaseRoles.create(role);
    }
    
    console.log(`✅ ${defaultRoles.length} roles inicializados en Firebase`);
    return true;
  }
  
  return false;
};

