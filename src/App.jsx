import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { useKanban } from './context/KanbanContext';
import Login from './components/Login';
import RoleSelection from './components/RoleSelection';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import TaskModal from './components/TaskModal';
import ColumnManager from './components/ColumnManager';
import SettingsPanel from './components/SettingsPanel';
import BurndownChart from './components/BurndownChart';
import { LayoutDashboard, Columns, Settings, LogOut, Plus, Folder, Github, Pencil, Check, X, Briefcase } from 'lucide-react';
import { firebaseSettings, isFirebaseAvailable } from './services/firebaseService';
import './App.css';

function App() {
  const { currentUser, login, updateUserRole, isAuthenticated, hasRole, logout } = useAuth();
  const { getStats } = useKanban();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // URLs editables (compartidas en Firebase o localStorage)
  const [filesUrl, setFilesUrl] = useState('https://drive.google.com/drive/folders/1kKKySnLWk8qLNDFGVEFT13GEVXWgndMZ?usp=sharing');
  const [gitUrl, setGitUrl] = useState('https://github.com/joelosiris11/jceFacturacion');
  const [projectUrl, setProjectUrl] = useState('');
  
  const [editingFilesUrl, setEditingFilesUrl] = useState(false);
  const [editingGitUrl, setEditingGitUrl] = useState(false);
  const [editingProjectUrl, setEditingProjectUrl] = useState(false);
  const [tempFilesUrl, setTempFilesUrl] = useState(filesUrl);
  const [tempGitUrl, setTempGitUrl] = useState(gitUrl);
  const [tempProjectUrl, setTempProjectUrl] = useState(projectUrl);
  
  // Cargar URLs desde Firebase o localStorage
  useEffect(() => {
    let unsubscribe = null;
    
    const loadUrls = async () => {
      if (isFirebaseAvailable()) {
        try {
          const settings = await firebaseSettings.get();
          if (settings.filesUrl) setFilesUrl(settings.filesUrl);
          if (settings.gitUrl) setGitUrl(settings.gitUrl);
          if (settings.projectUrl) setProjectUrl(settings.projectUrl);
          
          // Escuchar cambios en tiempo real
          unsubscribe = firebaseSettings.onSnapshot((settings) => {
            if (settings.filesUrl) setFilesUrl(settings.filesUrl);
            if (settings.gitUrl) setGitUrl(settings.gitUrl);
            if (settings.projectUrl) setProjectUrl(settings.projectUrl);
          });
        } catch (error) {
          console.error('Error al cargar configuraciones desde Firebase:', error);
          // Fallback a localStorage
          const savedFiles = localStorage.getItem('kanban_files_url');
          const savedGit = localStorage.getItem('kanban_git_url');
          const savedProject = localStorage.getItem('kanban_project_url');
          if (savedFiles) setFilesUrl(savedFiles);
          if (savedGit) setGitUrl(savedGit);
          if (savedProject) setProjectUrl(savedProject);
        }
      } else {
        // Usar localStorage si Firebase no está disponible
        const savedFiles = localStorage.getItem('kanban_files_url');
        const savedGit = localStorage.getItem('kanban_git_url');
        const savedProject = localStorage.getItem('kanban_project_url');
        if (savedFiles) setFilesUrl(savedFiles);
        if (savedGit) setGitUrl(savedGit);
        if (savedProject) setProjectUrl(savedProject);
      }
    };
    
    loadUrls();
    
    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async (username, pin) => {
    const result = await login(username, pin);
    
    if (result.success) {
      setLoginError('');
    } else {
      setLoginError(result.error);
    }
  };

  const handleRoleSelection = async (role) => {
    await updateUserRole(role);
  };
  
  const handleSaveFilesUrl = async () => {
    setFilesUrl(tempFilesUrl);
    setEditingFilesUrl(false);
    
    // Guardar inmediatamente
    if (isFirebaseAvailable()) {
      try {
        await firebaseSettings.update({ filesUrl: tempFilesUrl });
      } catch (error) {
        console.error('Error al guardar URL en Firebase:', error);
        localStorage.setItem('kanban_files_url', tempFilesUrl);
      }
    } else {
      localStorage.setItem('kanban_files_url', tempFilesUrl);
    }
  };
  
  const handleCancelFilesUrl = () => {
    setTempFilesUrl(filesUrl);
    setEditingFilesUrl(false);
  };
  
  const handleSaveGitUrl = async () => {
    setGitUrl(tempGitUrl);
    setEditingGitUrl(false);
    
    // Guardar inmediatamente
    if (isFirebaseAvailable()) {
      try {
        await firebaseSettings.update({ gitUrl: tempGitUrl });
      } catch (error) {
        console.error('Error al guardar URL en Firebase:', error);
        localStorage.setItem('kanban_git_url', tempGitUrl);
      }
    } else {
      localStorage.setItem('kanban_git_url', tempGitUrl);
    }
  };
  
  const handleCancelGitUrl = () => {
    setTempGitUrl(gitUrl);
    setEditingGitUrl(false);
  };
  
  const handleSaveProjectUrl = async () => {
    setProjectUrl(tempProjectUrl);
    setEditingProjectUrl(false);
    
    // Guardar inmediatamente
    if (isFirebaseAvailable()) {
      try {
        await firebaseSettings.update({ projectUrl: tempProjectUrl });
      } catch (error) {
        console.error('Error al guardar URL en Firebase:', error);
        localStorage.setItem('kanban_project_url', tempProjectUrl);
      }
    } else {
      localStorage.setItem('kanban_project_url', tempProjectUrl);
    }
  };
  
  const handleCancelProjectUrl = () => {
    setTempProjectUrl(projectUrl);
    setEditingProjectUrl(false);
  };

  // Función helper para normalizar URLs (agregar protocolo si falta)
  const normalizeUrl = (url) => {
    if (!url) return '';
    // Si ya tiene protocolo, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Si no tiene protocolo, agregar https://
    return `https://${url}`;
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
          {currentUser?.role === 'admin' && (
            <button 
              className="sidebar-nav-item" 
              onClick={() => setShowSettings(true)}
            >
              <Settings size={20} />
              <span>Configuración</span>
            </button>
          )}
          <div className="sidebar-nav-item-editable">
            {editingFilesUrl ? (
              <div className="sidebar-nav-edit-mode">
                <input
                  type="text"
                  className="sidebar-nav-url-input"
                  value={tempFilesUrl}
                  onChange={(e) => setTempFilesUrl(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveFilesUrl();
                    } else if (e.key === 'Escape') {
                      handleCancelFilesUrl();
                    }
                  }}
                  autoFocus
                />
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleSaveFilesUrl}
                  title="Guardar"
                >
                  <Check size={14} />
                </button>
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleCancelFilesUrl}
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="sidebar-nav-item" 
                  onClick={() => window.open(normalizeUrl(filesUrl), '_blank')}
                >
                  <Folder size={20} />
                  <span>Archivos</span>
                </button>
                <button
                  className="sidebar-nav-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempFilesUrl(filesUrl);
                    setEditingFilesUrl(true);
                  }}
                  title="Editar URL"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
          <div className="sidebar-nav-item-editable">
            {editingGitUrl ? (
              <div className="sidebar-nav-edit-mode">
                <input
                  type="text"
                  className="sidebar-nav-url-input"
                  value={tempGitUrl}
                  onChange={(e) => setTempGitUrl(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveGitUrl();
                    } else if (e.key === 'Escape') {
                      handleCancelGitUrl();
                    }
                  }}
                  autoFocus
                />
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleSaveGitUrl}
                  title="Guardar"
                >
                  <Check size={14} />
                </button>
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleCancelGitUrl}
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="sidebar-nav-item" 
                  onClick={() => window.open(normalizeUrl(gitUrl), '_blank')}
                >
                  <Github size={20} />
                  <span>Git</span>
                </button>
                <button
                  className="sidebar-nav-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempGitUrl(gitUrl);
                    setEditingGitUrl(true);
                  }}
                  title="Editar URL"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
          <div className="sidebar-nav-item-editable">
            {editingProjectUrl ? (
              <div className="sidebar-nav-edit-mode">
                <input
                  type="text"
                  className="sidebar-nav-url-input"
                  value={tempProjectUrl}
                  onChange={(e) => setTempProjectUrl(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveProjectUrl();
                    } else if (e.key === 'Escape') {
                      handleCancelProjectUrl();
                    }
                  }}
                  autoFocus
                />
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleSaveProjectUrl}
                  title="Guardar"
                >
                  <Check size={14} />
                </button>
                <button
                  className="sidebar-nav-edit-btn"
                  onClick={handleCancelProjectUrl}
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="sidebar-nav-item" 
                  onClick={() => projectUrl && window.open(normalizeUrl(projectUrl), '_blank')}
                  disabled={!projectUrl}
                >
                  <Briefcase size={20} />
                  <span>Proyecto</span>
                </button>
                <button
                  className="sidebar-nav-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempProjectUrl(projectUrl);
                    setEditingProjectUrl(true);
                  }}
                  title="Editar URL"
                >
                  <Pencil size={14} />
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Burndown Chart */}
        <div className="sidebar-chart">
          <BurndownChart />
        </div>

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
