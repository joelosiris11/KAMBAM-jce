import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useKanban } from '../context/KanbanContext';
import { ROLES, getRoleDisplay } from '../utils/roles';
import { firebaseRoles, isRolesServiceAvailable } from '../services/rolesService';
import RolesManager from './RolesManager';
import './Modal.css';
import './SettingsPanel.css';

const SettingsPanel = ({ onClose }) => {
  const { currentUser, users, logout, updateUser, deleteUser } = useAuth();
  const { tasks, columns } = useKanban();
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', pin: '', role: '' });
  const [showRolesManager, setShowRolesManager] = useState(false);
  const [availableRoles, setAvailableRoles] = useState(ROLES);

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'project-manager';

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      if (isRolesServiceAvailable()) {
        const rolesData = await firebaseRoles.getAll();
        if (rolesData.length > 0) {
          setAvailableRoles(rolesData);
        }
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  };

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

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      pin: user.pin,
      role: user.role || ''
    });
  };

  const handleSaveUser = async () => {
    if (!editForm.username || !editForm.pin) {
      alert('Username y PIN son obligatorios');
      return;
    }

    if (editForm.pin.length !== 4 || !/^\d+$/.test(editForm.pin)) {
      alert('El PIN debe tener exactamente 4 dígitos');
      return;
    }

    try {
      await updateUser(editingUser.username, editForm);
      setEditingUser(null);
      alert('✅ Usuario actualizado correctamente');
    } catch (error) {
      alert('❌ Error al actualizar usuario: ' + error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.username === currentUser.username) {
      alert('❌ No puedes eliminar tu propio usuario');
      return;
    }

    if (window.confirm(`⚠️ ¿Estás seguro de eliminar el usuario "${user.username}"?`)) {
      try {
        await deleteUser(user.username);
        alert('✅ Usuario eliminado correctamente');
      } catch (error) {
        alert('❌ Error al eliminar usuario: ' + error.message);
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

          {/* Gestión de Roles - Solo Admin */}
          {isAdmin && (
            <section className="settings-section">
              <h3 className="settings-section-title">🎭 Gestión de Roles</h3>
              <div className="settings-actions">
                <button 
                  className="settings-action-btn" 
                  onClick={() => setShowRolesManager(true)}
                >
                  <span className="action-icon">🎭</span>
                  <div className="action-content">
                    <div className="action-title">Administrar Roles</div>
                    <div className="action-description">
                      Crear, editar o desactivar roles del sistema
                    </div>
                  </div>
                </button>
              </div>
            </section>
          )}

          {/* Gestión de Usuarios - Solo Admin */}
          {isAdmin && (
            <section className="settings-section">
              <h3 className="settings-section-title">👥 Gestión de Usuarios</h3>
              <div className="users-list">
                {users.filter(u => !u.isTemporary).map((user) => (
                  <div key={user.id} className="user-list-item">
                    <div className="user-list-avatar">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-list-info">
                      <div className="user-list-name">{user.username}</div>
                      <div className="user-list-role">{getRoleDisplay(user.role)}</div>
                    </div>
                    <div className="user-list-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuario"
                      >
                        ✏️
                      </button>
                      {user.username !== currentUser.username && (
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDeleteUser(user)}
                          title="Eliminar usuario"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

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

      {/* Modal de Edición de Usuario */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content edit-user-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Editar Usuario</h2>
              <button className="modal-close" onClick={() => setEditingUser(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre de Usuario</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Nombre de usuario"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN (4 dígitos)</label>
                <input
                  type="password"
                  className="form-input"
                  value={editForm.pin}
                  onChange={(e) => setEditForm({ ...editForm, pin: e.target.value })}
                  placeholder="****"
                  maxLength="4"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol</label>
                <select
                  className="form-input"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="">Seleccionar rol...</option>
                  {availableRoles.filter(role => role.isActive !== false).map(role => (
                    <option key={role.id} value={role.id}>
                      {role.icon} {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditingUser(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSaveUser}>
                💾 Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gestión de Roles */}
      {showRolesManager && (
        <RolesManager 
          onClose={() => {
            setShowRolesManager(false);
            loadRoles(); // Recargar roles al cerrar
          }} 
        />
      )}
    </div>
  );
};

export default SettingsPanel;

