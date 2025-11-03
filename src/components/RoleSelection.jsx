import { useState } from 'react';
import './RoleSelection.css';

const RoleSelection = ({ username, onSelectRole }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'admin',
      name: 'Administrador',
      icon: '👑',
      description: 'Control total del sistema y gestión de usuarios'
    },
    {
      id: 'project-manager',
      name: 'Project Manager',
      icon: '📊',
      description: 'Gestión completa de proyectos y tareas'
    },
    {
      id: 'developer',
      name: 'Desarrollador',
      icon: '💻',
      description: 'Gestión de tareas de desarrollo'
    },
    {
      id: 'designer',
      name: 'Diseñador',
      icon: '🎨',
      description: 'Gestión de tareas de diseño'
    }
  ];

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

        <div className="roles-grid">
          {roles.map((role) => (
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
      </div>
    </div>
  );
};

export default RoleSelection;

