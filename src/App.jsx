import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useKanban } from './context/KanbanContext';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import ColumnManager from './components/ColumnManager';
import SettingsPanel from './components/SettingsPanel';
import { LayoutDashboard, Columns, Settings, LogOut, Plus } from 'lucide-react';
import './App.css';

function App() {
  const { currentUser, login, updateUserRole, isAuthenticated, hasRole, logout } = useAuth();
  const { getStats } = useKanban();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (username, pin) => {
    const result = login(username, pin);
    
    if (result.success) {
      setLoginError('');
    } else {
      setLoginError(result.error);
    }
  };

  const handleRoleSelection = (role) => {
    updateUserRole(role);
  };

  // Mostrar pantalla de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  // Mostrar pantalla de selección de rol
  if (!hasRole) {
    return (
      <RoleSelection
        username={currentUser.username}
        onSelectRole={handleRoleSelection}
      />
    );
  }

  // Pantalla principal
  const stats = getStats();

  return (
    <div className="app-wrapper">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-logo">
          <img src="/logo-jce.svg" alt="JCE Logo" className="logo-img" />
          <h2>
            Kanban JCE
          </h2>
        </div>

        {/* Botón Nueva Tarea */}
        <div className="sidebar-new-task">
          <button className="btn-new-task" onClick={() => setShowTaskModal(true)}>
            <Plus size={20} />
            <span>Nueva Tarea</span>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button className="sidebar-nav-item active">
            <LayoutDashboard size={20} />
            <span>Tablero</span>
          </button>
          <button 
            className="sidebar-nav-item" 
            onClick={() => setShowColumnManager(true)}
          >
            <Columns size={20} />
            <span>Columnas</span>
          </button>
          <button 
            className="sidebar-nav-item" 
            onClick={() => setShowSettings(true)}
          >
            <Settings size={20} />
            <span>Configuración</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{currentUser.username}</span>
              <span className="sidebar-user-role">{currentUser.role}</span>
            </div>
            <button 
              className="btn-logout-sidebar" 
              onClick={logout}
              title="Cerrar sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="app-content">
        <Header stats={stats} />
        
        <KanbanBoard />

        {/* Modales */}
        {showTaskModal && (
          <TaskModal onClose={() => setShowTaskModal(false)} />
        )}

        {showColumnManager && (
          <ColumnManager onClose={() => setShowColumnManager(false)} />
        )}

        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </main>
    </div>
  );
}

export default App;
