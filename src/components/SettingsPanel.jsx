import { useAuth } from '../context/AuthContext';
import { useKanban } from '../context/KanbanContext';
import './Modal.css';
import './SettingsPanel.css';

const SettingsPanel = ({ onClose }) => {
  const { currentUser, users, logout } = useAuth();
  const { tasks, columns } = useKanban();

  const stats = {
    totalUsers: users.length,
    totalTasks: tasks.length,
    totalColumns: columns.length,
    storageUsed: ((JSON.stringify(localStorage).length / 1024).toFixed(2))
  };

  const handleExportData = () => {
    const data = {
      users,
      tasks,
      columns,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kanban-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos. ¿Estás seguro?')) {
      if (window.confirm('¿Realmente seguro? Esta acción no se puede deshacer.')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Configuración del Sistema</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Información del Usuario */}
          <section className="settings-section">
            <h3 className="settings-section-title">👤 Usuario Actual</h3>
            <div className="user-card">
              <div className="user-card-avatar">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-card-info">
                <div className="user-card-name">{currentUser.username}</div>
                <div className="user-card-role">{currentUser.role}</div>
              </div>
              <button className="btn btn-secondary" onClick={logout}>
                🚪 Cerrar Sesión
              </button>
            </div>
          </section>

          {/* Estadísticas */}
          <section className="settings-section">
            <h3 className="settings-section-title">📊 Estadísticas del Sistema</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">👥</div>
                <div className="stat-value">{stats.totalUsers}</div>
                <div className="stat-label">Usuarios</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📋</div>
                <div className="stat-value">{stats.totalTasks}</div>
                <div className="stat-label">Tareas</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">📑</div>
                <div className="stat-value">{stats.totalColumns}</div>
                <div className="stat-label">Columnas</div>
              </div>
              <div className="stat-item">
                <div className="stat-icon">💾</div>
                <div className="stat-value">{stats.storageUsed}KB</div>
                <div className="stat-label">Almacenamiento</div>
              </div>
            </div>
          </section>

          {/* Gestión de Datos */}
          <section className="settings-section">
            <h3 className="settings-section-title">💾 Gestión de Datos</h3>
            <div className="settings-actions">
              <button className="settings-action-btn" onClick={handleExportData}>
                <span className="action-icon">📥</span>
                <div className="action-content">
                  <div className="action-title">Exportar Datos</div>
                  <div className="action-description">
                    Descarga un backup de todos tus datos
                  </div>
                </div>
              </button>

              <button className="settings-action-btn danger" onClick={handleClearData}>
                <span className="action-icon">🗑️</span>
                <div className="action-content">
                  <div className="action-title">Borrar Todos los Datos</div>
                  <div className="action-description">
                    Elimina permanentemente todos los datos del sistema
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* Información de la Aplicación */}
          <section className="settings-section">
            <h3 className="settings-section-title">ℹ️ Sobre la Aplicación</h3>
            <div className="app-info">
              <div className="app-info-item">
                <strong>Aplicación:</strong> Kanban Pro
              </div>
              <div className="app-info-item">
                <strong>Versión:</strong> 2.0.0
              </div>
              <div className="app-info-item">
                <strong>Almacenamiento:</strong> LocalStorage
              </div>
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

