// Catálogo centralizado de roles del sistema
// Este archivo será reemplazado por Firebase en el futuro

export const ROLES = [
  // Gestión y Liderazgo
  {
    id: 'admin',
    name: 'Administrador',
    icon: '👑',
    description: 'Control total del sistema y gestión de usuarios',
    category: 'Gestión',
    color: '#8b5cf6'
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    icon: '📊',
    description: 'Gestión completa de proyectos y tareas',
    category: 'Gestión',
    color: '#6366f1'
  },

  // Desarrollo y Tecnología
  {
    id: 'developer',
    name: 'Desarrollador',
    icon: '💻',
    description: 'Desarrollo de software y soluciones técnicas',
    category: 'Tecnología',
    color: '#3b82f6'
  },

  // Diseño y UX
  {
    id: 'designer',
    name: 'Diseñador',
    icon: '🎨',
    description: 'Diseño visual y creativo',
    category: 'Diseño',
    color: '#ec4899'
  },
  {
    id: 'ux-researcher',
    name: 'Investigador UX',
    icon: '🔬',
    description: 'Investigación de experiencia de usuario',
    category: 'Diseño',
    color: '#f59e0b'
  },
  {
    id: 'ui-ux-designer',
    name: 'Diseñador UI/UX',
    icon: '🖌️',
    description: 'Diseño de interfaces y experiencia de usuario',
    category: 'Diseño',
    color: '#a855f7'
  },
  {
    id: 'service-designer',
    name: 'Diseñador de Servicio',
    icon: '🎯',
    description: 'Diseño de servicios y procesos',
    category: 'Diseño',
    color: '#06b6d4'
  },

  // Análisis y Datos
  {
    id: 'business-analyst',
    name: 'Analista de Negocios',
    icon: '📈',
    description: 'Análisis de requerimientos y procesos de negocio',
    category: 'Análisis',
    color: '#10b981'
  },
  {
    id: 'data-analyst',
    name: 'Analista de Datos Institucionales',
    icon: '📊',
    description: 'Análisis de datos y métricas institucionales',
    category: 'Análisis',
    color: '#14b8a6'
  },
  {
    id: 'process-researcher',
    name: 'Investigador de Procesos',
    icon: '🔍',
    description: 'Investigación y optimización de procesos',
    category: 'Análisis',
    color: '#0ea5e9'
  },

  // Calidad y Testing
  {
    id: 'qa',
    name: 'Analista de Calidad (QA)',
    icon: '✅',
    description: 'Control de calidad y pruebas',
    category: 'Calidad',
    color: '#84cc16'
  },
  {
    id: 'functional-tester',
    name: 'Tester / Evaluador Funcional',
    icon: '🧪',
    description: 'Pruebas funcionales y evaluación de sistemas',
    category: 'Calidad',
    color: '#22c55e'
  },

  // Legal y Cumplimiento
  {
    id: 'compliance-specialist',
    name: 'Especialista en Cumplimiento Normativo',
    icon: '⚖️',
    description: 'Asegurar cumplimiento de normativas y regulaciones',
    category: 'Legal',
    color: '#ef4444'
  },
  {
    id: 'legal-advisor',
    name: 'Asesor Legal Institucional',
    icon: '👨‍⚖️',
    description: 'Asesoría legal y consultoría institucional',
    category: 'Legal',
    color: '#dc2626'
  },

  // Finanzas y Administración
  {
    id: 'financial-advisor',
    name: 'Asesor Financiero',
    icon: '💰',
    description: 'Asesoría financiera y gestión presupuestaria',
    category: 'Finanzas',
    color: '#f59e0b'
  },

  // Comunicación y Documentación
  {
    id: 'documentation-specialist',
    name: 'Especialista en Documentación',
    icon: '📝',
    description: 'Creación y gestión de documentación técnica',
    category: 'Comunicación',
    color: '#6366f1'
  },
  {
    id: 'internal-communications',
    name: 'Encargado de Comunicación Interna',
    icon: '📢',
    description: 'Gestión de comunicación interna institucional',
    category: 'Comunicación',
    color: '#8b5cf6'
  }
];

// Roles que pueden seleccionarse al registrarse (excluye admin)
export const PUBLIC_ROLES = ROLES.filter(role => role.id !== 'admin');

// Obtener rol por ID
export const getRoleById = (id) => {
  return ROLES.find(role => role.id === id);
};

// Obtener nombre display del rol
export const getRoleDisplay = (id) => {
  const role = getRoleById(id);
  return role ? role.name : id;
};

// Obtener roles por categoría
export const getRolesByCategory = () => {
  const categories = {};
  ROLES.forEach(role => {
    if (!categories[role.category]) {
      categories[role.category] = [];
    }
    categories[role.category].push(role);
  });
  return categories;
};

// Categorías de roles
export const ROLE_CATEGORIES = [
  'Gestión',
  'Tecnología',
  'Diseño',
  'Análisis',
  'Calidad',
  'Legal',
  'Finanzas',
  'Comunicación'
];

