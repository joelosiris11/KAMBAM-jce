import { createContext, useContext, useState, useEffect } from 'react';

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
    // Cargar usuarios desde localStorage
    const storedUsers = localStorage.getItem('kanban_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }

    // Verificar sesión activa
    const activeSession = localStorage.getItem('kanban_active_session');
    if (activeSession) {
      const user = JSON.parse(activeSession);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  const saveUsers = (usersData) => {
    localStorage.setItem('kanban_users', JSON.stringify(usersData));
    setUsers(usersData);
  };

  const login = (username, pin) => {
    const existingUser = users.find(u => u.username === username);

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
      // Usuario nuevo
      const newUser = {
        id: Date.now(),
        username,
        pin,
        role: null,
        createdAt: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('kanban_active_session', JSON.stringify(newUser));
      
      return { success: true, isNewUser: true };
    }
  };

  const updateUserRole = (role) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, role };
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? updatedUser : u
    );

    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('kanban_active_session', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('kanban_active_session');
  };

  const value = {
    currentUser,
    users,
    isAuthenticated,
    hasRole: currentUser?.role != null,
    login,
    logout,
    updateUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

