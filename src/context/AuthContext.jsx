import { createContext, useContext, useState, useEffect } from 'react';
import { firebaseUsers, isFirebaseAvailable } from '../services/firebaseService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      // Cargar usuarios desde Firebase o localStorage
      if (isFirebaseAvailable()) {
        try {
          const usersFromFirebase = await firebaseUsers.getAll();
          setUsers(usersFromFirebase);
        } catch (error) {
          console.error('Error al cargar usuarios de Firebase:', error);
          // Fallback a localStorage
          const storedUsers = localStorage.getItem('kanban_users');
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        }
      } else {
    const storedUsers = localStorage.getItem('kanban_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
        }
    }

    // Verificar sesión activa
    const activeSession = localStorage.getItem('kanban_active_session');
    if (activeSession) {
      const user = JSON.parse(activeSession);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
    };

    loadUsers();
  }, []);

  const saveUsers = async (usersData) => {
    localStorage.setItem('kanban_users', JSON.stringify(usersData));
    setUsers(usersData);
  };

  const login = async (username, pin) => {
    // Normalizar username a minúsculas (case-insensitive)
    const normalizedUsername = username.toLowerCase().trim();
    
    // Buscar usuario en Firebase o localStorage
    let existingUser = users.find(u => u.username.toLowerCase() === normalizedUsername);
    
    // Si no está en memoria, buscar en Firebase
    if (!existingUser && isFirebaseAvailable()) {
      try {
        existingUser = await firebaseUsers.getByUsername(normalizedUsername);
      } catch (error) {
        console.error('Error al buscar usuario en Firebase:', error);
      }
    }

    if (existingUser) {
      // Usuario existente
      if (existingUser.pin === pin) {
        setCurrentUser(existingUser);
        setIsAuthenticated(true);
        localStorage.setItem('kanban_active_session', JSON.stringify(existingUser));
        return { success: true, isNewUser: false };
      } else {
        return { success: false, error: 'PIN incorrecto' };
      }
    } else {
      // Usuario nuevo - NO crear todavía, solo guardar info temporal
      const tempUser = {
        id: Date.now(),
        username: normalizedUsername,  // Guardar normalizado
        pin,
        role: null,
        createdAt: new Date().toISOString(),
        isTemporary: true  // Marcar como temporal
      };
      
      // Guardar usuario temporal en sesión (sin crear en BD)
      setCurrentUser(tempUser);
      setIsAuthenticated(true);
      localStorage.setItem('kanban_active_session', JSON.stringify(tempUser));
      
      return { success: true, isNewUser: true };
    }
  };

  const updateUserRole = async (role) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, role, isTemporary: false };
    
    // Si es un usuario temporal (nuevo), crear ahora en la base de datos
    if (currentUser.isTemporary) {
      // Crear el usuario en Firebase/localStorage AHORA que tiene rol
      if (isFirebaseAvailable()) {
        try {
          const createdUser = await firebaseUsers.create(updatedUser);
          setUsers([...users, createdUser]);
          setCurrentUser(createdUser);
          localStorage.setItem('kanban_active_session', JSON.stringify(createdUser));
          return;
        } catch (error) {
          console.error('Error al crear usuario en Firebase:', error);
          // Fallback a localStorage
        }
      }
      
      // Fallback a localStorage
      const updatedUsers = [...users, updatedUser];
      await saveUsers(updatedUsers);
      setCurrentUser(updatedUser);
      localStorage.setItem('kanban_active_session', JSON.stringify(updatedUser));
    } else {
      // Usuario existente - solo actualizar el rol
      if (isFirebaseAvailable()) {
        try {
          await firebaseUsers.update(currentUser.username, { role });
        } catch (error) {
          console.error('Error al actualizar rol en Firebase:', error);
          // Continuar con localStorage como fallback
        }
      }
      
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? updatedUser : u
    );

      await saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('kanban_active_session', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('kanban_active_session');
  };

  // Funciones de administrador
  const updateUser = async (oldUsername, updates) => {
    if (!currentUser) return;

    // Normalizar usernames
    const normalizedOldUsername = oldUsername.toLowerCase();
    
    // Buscar el usuario
    let user = users.find(u => u.username.toLowerCase() === normalizedOldUsername);
    
    if (!user && isFirebaseAvailable()) {
      try {
        user = await firebaseUsers.getByUsername(normalizedOldUsername);
      } catch (error) {
        console.error('Error al buscar usuario:', error);
      }
    }

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Preparar datos actualizados (normalizar nuevo username si existe)
    const updatedUserData = {
      ...user,
      ...updates,
      username: updates.username ? updates.username.toLowerCase().trim() : user.username,
      isTemporary: false
    };

    // Si cambió el username, necesitamos eliminar el viejo y crear uno nuevo
    if (updates.username && updates.username.toLowerCase() !== normalizedOldUsername) {
      // Actualizar en Firebase
      if (isFirebaseAvailable()) {
        try {
          // Eliminar el viejo
          const oldUserRef = await firebaseUsers.getByUsername(oldUsername);
          if (oldUserRef) {
            // Crear el nuevo con el username actualizado
            await firebaseUsers.create(updatedUserData);
            // Eliminar el viejo
            // TODO: Implementar delete en firebaseUsers
          }
        } catch (error) {
          console.error('Error al actualizar usuario en Firebase:', error);
        }
      }

      // Actualizar en localStorage
      const updatedUsers = users.map(u => 
        u.username.toLowerCase() === normalizedOldUsername ? updatedUserData : u
      );
      await saveUsers(updatedUsers);
      setUsers(updatedUsers);

      // Si es el usuario actual, actualizar sesión
      if (currentUser.username.toLowerCase() === normalizedOldUsername) {
        setCurrentUser(updatedUserData);
        localStorage.setItem('kanban_active_session', JSON.stringify(updatedUserData));
      }
    } else {
      // Solo actualizar datos, no username
      if (isFirebaseAvailable()) {
        try {
          await firebaseUsers.update(normalizedOldUsername, updates);
        } catch (error) {
          console.error('Error al actualizar usuario en Firebase:', error);
        }
      }

      const updatedUsers = users.map(u => 
        u.username.toLowerCase() === normalizedOldUsername ? updatedUserData : u
      );
      await saveUsers(updatedUsers);
      setUsers(updatedUsers);

      // Si es el usuario actual, actualizar sesión
      if (currentUser.username.toLowerCase() === normalizedOldUsername) {
        setCurrentUser(updatedUserData);
        localStorage.setItem('kanban_active_session', JSON.stringify(updatedUserData));
      }
    }
  };

  const deleteUser = async (username) => {
    if (!currentUser) return;
    
    const normalizedUsername = username.toLowerCase();
    if (currentUser.username.toLowerCase() === normalizedUsername) {
      throw new Error('No puedes eliminar tu propio usuario');
    }

    // Eliminar de Firebase
    if (isFirebaseAvailable()) {
      try {
        await firebaseUsers.delete(normalizedUsername);
      } catch (error) {
        console.error('Error al eliminar usuario de Firebase:', error);
      }
    }

    // Eliminar de localStorage
    const updatedUsers = users.filter(u => u.username.toLowerCase() !== normalizedUsername);
    await saveUsers(updatedUsers);
    setUsers(updatedUsers);
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    hasRole: currentUser?.role != null && !currentUser?.isTemporary,
    login,
    logout,
    updateUserRole,
    updateUser,
    deleteUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

