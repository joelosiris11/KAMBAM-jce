import { useState, useEffect } from 'react';
import { firebaseRoles, isRolesServiceAvailable } from '../services/rolesService';
import { ROLES } from '../utils/roles';
import './Modal.css';
import './RolesManager.css';

const RolesManager = ({ onClose }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    icon: '',
    description: '',
    category: '',
    color: '#6366f1',
    isActive: true
  });

  const categories = ['Gestión', 'Tecnología', 'Diseño', 'Análisis', 'Calidad', 'Legal', 'Finanzas', 'Comunicación'];

  useEffect(() => {
    loadRoles();
    
    // Suscribirse a cambios en tiempo real si Firebase está disponible
    if (isRolesServiceAvailable()) {
      const unsubscribe = firebaseRoles.onSnapshot((updatedRoles) => {
        setRoles(updatedRoles);
      });
      return unsubscribe;
    }
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      if (isRolesServiceAvailable()) {
        const rolesData = await firebaseRoles.getAll();
        setRoles(rolesData);
      } else {
        // Fallback a roles locales
        setRoles(ROLES);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      alert('❌ Error al cargar roles: ' + error.message);
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingRole(null);
    setFormData({
      id: '',
      name: '',
      icon: '',
      description: '',
      category: '',
      color: '#6366f1',
      isActive: true
    });
  };

  const handleEdit = (role) => {
    setIsCreating(false);
    setEditingRole(role);
    setFormData({
      id: role.id,
      name: role.name,
      icon: role.icon,
      description: role.description,
      category: role.category,
      color: role.color || '#6366f1',
      isActive: role.isActive !== false
    });
  };

  const handleSave = async () => {
    if (!formData.id || !formData.name || !formData.category) {
      alert('❌ ID, Nombre y Categoría son obligatorios');
      return;
    }

    try {
      if (isRolesServiceAvailable()) {
        if (isCreating) {
          // Verificar que el ID no exista
          const existing = roles.find(r => r.id === formData.id);
          if (existing) {
            alert('❌ Ya existe un rol con ese ID');
            return;
          }
          await firebaseRoles.create(formData);
          alert('✅ Rol creado correctamente');
        } else {
          await firebaseRoles.update(editingRole.id, formData);
          alert('✅ Rol actualizado correctamente');
        }
        await loadRoles();
        setIsCreating(false);
        setEditingRole(null);
      } else {
        alert('⚠️ Firebase no está configurado. Los cambios no se guardarán.');
      }
    } catch (error) {
      console.error('Error al guardar rol:', error);
      alert('❌ Error al guardar: ' + error.message);
    }
  };

  const handleDelete = async (role) => {
    if (role.id === 'admin') {
      alert('❌ No puedes eliminar el rol de Administrador');
      return;
    }

    if (window.confirm(`⚠️ ¿Estás seguro de eliminar el rol "${role.name}"?\n\nLos usuarios con este rol podrían tener problemas.`)) {
      try {
        if (isRolesServiceAvailable()) {
          await firebaseRoles.delete(role.id);
          alert('✅ Rol eliminado correctamente');
          await loadRoles();
        } else {
          alert('⚠️ Firebase no está configurado');
        }
      } catch (error) {
        console.error('Error al eliminar rol:', error);
        alert('❌ Error al eliminar: ' + error.message);
      }
    }
  };

  const handleToggleActive = async (role) => {
    try {
      if (isRolesServiceAvailable()) {
        await firebaseRoles.toggleActive(role.id, !role.isActive);
        await loadRoles();
      } else {
        alert('⚠️ Firebase no está configurado');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('❌ Error: ' + error.message);
    }
  };

  const handleInitializeDefaults = async () => {
    if (window.confirm('⚠️ ¿Inicializar roles por defecto en Firebase?\n\nEsto creará todos los roles si no existen.')) {
      try {
        const { initializeDefaultRoles } = await import('../services/rolesService');
        const initialized = await initializeDefaultRoles(ROLES);
        if (initialized) {
          alert('✅ Roles inicializados correctamente');
          await loadRoles();
        } else {
          alert('ℹ️ Los roles ya estaban inicializados');
        }
      } catch (error) {
        console.error('Error al inicializar roles:', error);
        alert('❌ Error: ' + error.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content roles-manager-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">🎭 Gestión de Roles</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Cargando roles...</div>
          ) : (
            <>
              {/* Acciones */}
              <div className="roles-actions">
                <button className="btn btn-primary" onClick={handleCreate}>
                  ➕ Crear Rol Nuevo
                </button>
                {isRolesServiceAvailable() && roles.length === 0 && (
                  <button className="btn btn-secondary" onClick={handleInitializeDefaults}>
                    🔄 Inicializar Roles Por Defecto
                  </button>
                )}
              </div>

              {/* Lista de Roles */}
              <div className="roles-list-manager">
                {roles.map((role) => (
                  <div key={role.id} className={`role-manager-item ${!role.isActive ? 'inactive' : ''}`}>
                    <div className="role-manager-icon">{role.icon}</div>
                    <div className="role-manager-info">
                      <div className="role-manager-name">
                        {role.name}
                        {!role.isActive && <span className="inactive-badge">Inactivo</span>}
                      </div>
                      <div className="role-manager-meta">
                        <span className="role-category">{role.category}</span>
                        <span className="role-id">ID: {role.id}</span>
                      </div>
                    </div>
                    <div className="role-manager-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEdit(role)}
                        title="Editar rol"
                      >
                        ✏️
                      </button>
                      <button
                        className={`btn-icon ${role.isActive ? '' : 'success'}`}
                        onClick={() => handleToggleActive(role)}
                        title={role.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {role.isActive ? '🔓' : '🔒'}
                      </button>
                      {role.id !== 'admin' && (
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(role)}
                          title="Eliminar rol"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Crear/Editar Rol */}
      {(isCreating || editingRole) && (
        <div className="modal-overlay" onClick={() => { setIsCreating(false); setEditingRole(null); }}>
          <div className="modal-content edit-role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {isCreating ? '➕ Crear Rol' : '✏️ Editar Rol'}
              </h2>
              <button className="modal-close" onClick={() => { setIsCreating(false); setEditingRole(null); }}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">ID del Rol *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="ej: analista-datos"
                  disabled={!isCreating}
                />
                <small>Solo letras, números y guiones. Se usa como identificador único.</small>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Analista de Datos"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Icono (Emoji)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="📊"
                  maxLength="2"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descripción del rol..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoría *</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Seleccionar categoría...</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="form-input color-input"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Rol activo (disponible para asignar)</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => { setIsCreating(false); setEditingRole(null); }}
              >
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                💾 Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesManager;

