import { useState, useEffect } from 'react';
import { PUBLIC_ROLES, getRolesByCategory } from '../utils/roles';
import { firebaseRoles, isRolesServiceAvailable } from '../services/rolesService';
import './RoleSelection.css';

const RoleSelection = ({ username, onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [roles, setRoles] = useState(PUBLIC_ROLES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      if (isRolesServiceAvailable()) {
        // Cargar roles desde Firebase
        const firebaseRolesData = await firebaseRoles.getPublic();
        if (firebaseRolesData.length > 0) {
          setRoles(firebaseRolesData);
        } else {
          // Si no hay roles en Firebase, usar locales
          setRoles(PUBLIC_ROLES);
        }
      } else {
        // Fallback a roles locales
        setRoles(PUBLIC_ROLES);
      }
    } catch (error) {
      console.error('Error al cargar roles:', error);
      // En caso de error, usar roles locales
      setRoles(PUBLIC_ROLES);
    }
    setLoading(false);
  };

  // Obtener categorías dinámicamente de los roles cargados
  const categories = [...new Set(roles.map(role => role.category))].sort();

  // Filtrar roles por categoría
  const filteredRoles = selectedCategory === 'all' 
    ? roles 
    : roles.filter(role => role.category === selectedCategory);

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="role-selection-container">
      <div className="role-selection-card">
        <div className="role-selection-header">
          <h1 className="role-selection-title">¡Bienvenido!</h1>
          <p className="role-selection-subtitle">
            Hola <span className="role-selection-username">{username}</span>, 
            selecciona tu rol en el equipo
          </p>
        </div>

        {loading ? (
          <div className="loading-roles">Cargando roles...</div>
        ) : (
          <>
            {/* Filtro de categorías */}
            <div className="category-filter">
          <button
            className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="roles-grid">
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="role-icon">{role.icon}</div>
              <div className="role-name">{role.name}</div>
              <p className="role-description">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="role-selection-footer">
          <button
            className="role-confirm-button"
            onClick={handleConfirm}
            disabled={!selectedRole}
          >
            Continuar
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;

