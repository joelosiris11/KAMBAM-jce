// Servicio de Firebase para operaciones de Firestore
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';

// ============= HELPERS =============
const convertTimestamp = (timestamp) => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) return timestamp.toDate().toISOString();
  return timestamp;
};

// ============= USUARIOS =============
export const firebaseUsers = {
  // Obtener todos los usuarios
  getAll: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().id || doc.id,
      createdAt: convertTimestamp(doc.data().createdAt)
    }));
  },

  // Obtener usuario por username
  getByUsername: async (username) => {
    if (!db) throw new Error('Firebase no configurado');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      ...doc.data(),
      id: doc.data().id || doc.id,
      createdAt: convertTimestamp(doc.data().createdAt)
    };
  },

  // Crear nuevo usuario
  create: async (userData) => {
    if (!db) throw new Error('Firebase no configurado');
    const usersRef = collection(db, 'users');
    
    const newUser = {
      ...userData,
      id: userData.id || Date.now(),
      createdAt: serverTimestamp()
    };

    // Usar el username como ID del documento
    const userDocRef = doc(usersRef, userData.username);
    await setDoc(userDocRef, newUser);
    
    return {
      ...newUser,
      createdAt: new Date().toISOString()
    };
  },

  // Actualizar usuario
  update: async (username, updates) => {
    if (!db) throw new Error('Firebase no configurado');
    const userDocRef = doc(db, 'users', username);
    await updateDoc(userDocRef, updates);
    
    const updatedDoc = await getDoc(userDocRef);
    return {
      ...updatedDoc.data(),
      id: updatedDoc.data().id || updatedDoc.id,
      createdAt: convertTimestamp(updatedDoc.data().createdAt)
    };
  },

  // Eliminar usuario
  delete: async (username) => {
    if (!db) throw new Error('Firebase no configurado');
    const userDocRef = doc(db, 'users', username);
    await deleteDoc(userDocRef);
    return true;
  },

  // Escuchar cambios en usuarios en tiempo real
  onSnapshot: (callback) => {
    if (!db) throw new Error('Firebase no configurado');
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().id || doc.id,
        createdAt: convertTimestamp(doc.data().createdAt)
      }));
      callback(users);
    });
  }
};

// ============= COLUMNAS =============
export const firebaseColumns = {
  // Obtener todas las columnas
  getAll: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const columnsRef = collection(db, 'columns');
    const q = query(columnsRef, orderBy('order'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  // Crear nueva columna
  create: async (columnData) => {
    if (!db) throw new Error('Firebase no configurado');
    const columnsRef = collection(db, 'columns');
    
    // Usar el id como ID del documento
    const columnDocRef = doc(columnsRef, columnData.id);
    await setDoc(columnDocRef, columnData);
    
    return columnData;
  },

  // Actualizar columna
  update: async (columnId, updates) => {
    if (!db) throw new Error('Firebase no configurado');
    const columnDocRef = doc(db, 'columns', columnId);
    await updateDoc(columnDocRef, updates);
    
    const updatedDoc = await getDoc(columnDocRef);
    return {
      id: updatedDoc.id,
      ...updatedDoc.data()
    };
  },

  // Eliminar columna
  delete: async (columnId) => {
    if (!db) throw new Error('Firebase no configurado');
    const columnDocRef = doc(db, 'columns', columnId);
    await deleteDoc(columnDocRef);
    return true;
  },

  // Escuchar cambios en columnas en tiempo real
  onSnapshot: (callback) => {
    if (!db) throw new Error('Firebase no configurado');
    const columnsRef = collection(db, 'columns');
    const q = query(columnsRef, orderBy('order'));
    return onSnapshot(q, (snapshot) => {
      const columns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(columns);
    });
  }
};

// ============= TAREAS =============
export const firebaseTasks = {
  // Obtener todas las tareas
  getAll: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.data().id || doc.id,
      createdAt: convertTimestamp(doc.data().createdAt),
      comments: doc.data().comments || []
    }));
  },

  // Obtener tarea por ID
  getById: async (taskId) => {
    if (!db) throw new Error('Firebase no configurado');
    const taskDocRef = doc(db, 'tasks', String(taskId));
    const taskDoc = await getDoc(taskDocRef);
    
    if (!taskDoc.exists()) return null;
    
    return {
      ...taskDoc.data(),
      id: taskDoc.data().id || taskDoc.id,
      createdAt: convertTimestamp(taskDoc.data().createdAt),
      comments: taskDoc.data().comments || []
    };
  },

  // Crear nueva tarea
  create: async (taskData) => {
    if (!db) throw new Error('Firebase no configurado');
    const tasksRef = collection(db, 'tasks');
    
    const newTask = {
      ...taskData,
      id: taskData.id || Date.now(),
      comments: [],
      createdAt: serverTimestamp()
    };

    // Usar el id de la tarea como ID del documento
    const taskDocRef = doc(tasksRef, String(newTask.id));
    await setDoc(taskDocRef, newTask);
    
    return {
      ...newTask,
      createdAt: new Date().toISOString()
    };
  },

  // Actualizar tarea
  update: async (taskId, updates) => {
    if (!db) throw new Error('Firebase no configurado');
    const taskDocRef = doc(db, 'tasks', String(taskId));
    await updateDoc(taskDocRef, updates);
    
    const updatedDoc = await getDoc(taskDocRef);
    return {
      ...updatedDoc.data(),
      id: updatedDoc.data().id || updatedDoc.id,
      createdAt: convertTimestamp(updatedDoc.data().createdAt),
      comments: updatedDoc.data().comments || []
    };
  },

  // Eliminar tarea
  delete: async (taskId) => {
    if (!db) throw new Error('Firebase no configurado');
    const taskDocRef = doc(db, 'tasks', String(taskId));
    await deleteDoc(taskDocRef);
    return true;
  },

  // Escuchar cambios en tareas en tiempo real
  onSnapshot: (callback) => {
    if (!db) throw new Error('Firebase no configurado');
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.data().id || doc.id,
        createdAt: convertTimestamp(doc.data().createdAt),
        comments: doc.data().comments || []
      }));
      callback(tasks);
    });
  }
};

// ============= COMENTARIOS =============
export const firebaseComments = {
  // Agregar comentario a una tarea
  add: async (taskId, commentData) => {
    if (!db) throw new Error('Firebase no configurado');
    const taskDocRef = doc(db, 'tasks', String(taskId));
    const taskDoc = await getDoc(taskDocRef);
    
    if (!taskDoc.exists()) throw new Error('Tarea no encontrada');
    
    const task = taskDoc.data();
    const newComment = {
      id: Date.now(),
      ...commentData,
      createdAt: new Date().toISOString()
    };
    
    const updatedComments = [...(task.comments || []), newComment];
    await updateDoc(taskDocRef, { comments: updatedComments });
    
    return newComment;
  },

  // Eliminar comentario de una tarea
  delete: async (taskId, commentId) => {
    if (!db) throw new Error('Firebase no configurado');
    const taskDocRef = doc(db, 'tasks', String(taskId));
    const taskDoc = await getDoc(taskDocRef);
    
    if (!taskDoc.exists()) throw new Error('Tarea no encontrada');
    
    const task = taskDoc.data();
    const updatedComments = (task.comments || []).filter(c => c.id !== commentId);
    await updateDoc(taskDocRef, { comments: updatedComments });
    
    return true;
  }
};

// ============= INICIALIZACIÓN =============
export const initializeDefaultData = async () => {
  if (!db) throw new Error('Firebase no configurado');
  
  // Verificar si ya existen columnas
  const columnsSnapshot = await getDocs(collection(db, 'columns'));
  
  if (columnsSnapshot.empty) {
    console.log('🔄 Inicializando columnas por defecto...');
    const defaultColumns = [
      { id: 'backlog', title: 'Backlog', color: '#94a3b8', order: 0 },
      { id: 'todo', title: 'Por Hacer', color: '#6366f1', order: 1 },
      { id: 'in-progress', title: 'En Proceso', color: '#f59e0b', order: 2 },
      { id: 'review', title: 'En Revisión', color: '#8b5cf6', order: 3 },
      { id: 'completed', title: 'Completado', color: '#10b981', order: 4 }
    ];
    
    for (const column of defaultColumns) {
      await firebaseColumns.create(column);
    }
    
    console.log('✅ Columnas por defecto creadas');
  }
};

// ============= CONFIGURACIONES COMPARTIDAS =============
export const firebaseSettings = {
  // Obtener configuración
  get: async () => {
    if (!db) throw new Error('Firebase no configurado');
    const settingsDocRef = doc(db, 'settings', 'app');
    const settingsDoc = await getDoc(settingsDocRef);
    
    if (!settingsDoc.exists()) {
      // Crear configuración por defecto
      const defaultSettings = {
        filesUrl: 'https://drive.google.com/drive/folders/1kKKySnLWk8qLNDFGVEFT13GEVXWgndMZ?usp=sharing',
        gitUrl: 'https://github.com/joelosiris11/jceFacturacion',
        updatedAt: serverTimestamp()
      };
      await setDoc(settingsDocRef, defaultSettings);
      return defaultSettings;
    }
    
    return settingsDoc.data();
  },

  // Actualizar configuración
  update: async (updates) => {
    if (!db) throw new Error('Firebase no configurado');
    const settingsDocRef = doc(db, 'settings', 'app');
    await updateDoc(settingsDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    const updatedDoc = await getDoc(settingsDocRef);
    return updatedDoc.data();
  },

  // Escuchar cambios en tiempo real
  onSnapshot: (callback) => {
    if (!db) throw new Error('Firebase no configurado');
    const settingsDocRef = doc(db, 'settings', 'app');
    return onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    });
  }
};

// Verificar si Firebase está disponible
export const isFirebaseAvailable = () => {
  return isFirebaseConfigured() && db !== null;
};

