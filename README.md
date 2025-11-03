# Kanban JCE - Sistema de Gestión de Tareas

<div align="center">
  <img src="public/logo-jce.svg" alt="Logo JCE" width="120" />
  <h3>Sistema Kanban para la Junta Central Electoral</h3>
  <p>
    <strong>Gestión eficiente de tareas y proyectos con interfaz moderna y drag-and-drop</strong>
  </p>
</div>

---

## Tabla de Contenidos

- [Características](#características)
- [Demo](#demo)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Funcionalidades Detalladas](#funcionalidades-detalladas)
- [Migración a Base de Datos](#migración-a-base-de-datos)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Características

### Gestión de Tareas
- ✅ **Tablero Kanban visual** con drag-and-drop fluido
- ✅ **Columnas personalizables** (crear, editar, eliminar, reordenar)
- ✅ **Prioridades** (Baja, Media, Alta)
- ✅ **Tipos de tarea** (Programación, Investigación, Diseño, Testing, Documentación, Reunión, Bug)
- ✅ **Asignación de usuarios** a tareas específicas
- ✅ **Estimación de horas** de trabajo
- ✅ **Búsqueda y filtrado** por columna y tipo

### Colaboración
- 💬 **Sistema de comentarios** en tiempo real
- 👥 **Multi-usuario** con roles (Dev, Design, PM, QA, Admin)
- 🔐 **Autenticación segura** con PIN
- 👤 **Perfiles de usuario** con avatar y rol

### Interfaz
- 🎨 **Diseño moderno y limpio** con iconos profesionales
- 🌙 **Modo oscuro** optimizado
- 📱 **Responsive** para móviles y tablets
- ⚡ **Interfaz rápida** sin recargas de página
- 🎯 **Indicadores visuales** de drag-and-drop

### Estadísticas
- 📊 **Dashboard en tiempo real** con métricas clave
- ⏱️ **Seguimiento de horas** estimadas vs completadas
- 📈 **Porcentaje de progreso** del proyecto
- 📋 **Conteo de tareas** por estado

---

## Demo

### Vista Principal
![Tablero Kanban](docs/screenshots/kanban-board.png)

### Gestión de Tareas
![Crear Tarea](docs/screenshots/task-modal.png)

### Comentarios
![Detalle de Tarea](docs/screenshots/task-detail.png)

---

## Tecnologías

### Frontend
- **React 18** - Framework UI
- **Vite 4** - Build tool y dev server
- **@hello-pangea/dnd** - Drag and drop
- **Lucide React** - Iconos SVG profesionales
- **CSS Modules** - Estilos encapsulados

### Almacenamiento
- **LocalStorage** - Persistencia de datos (actual)
- **PostgreSQL** - Base de datos (migración futura)

### Desarrollo
- **ESLint** - Linting
- **Vite HMR** - Hot Module Replacement

---

## Instalación

### Prerequisitos
- Node.js 16.x o superior
- npm 7.x o superior

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-org/kanban-jce.git
cd kanban-jce
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia el servidor de desarrollo

# Producción
npm run build        # Genera build de producción
npm run preview      # Preview del build de producción

# Calidad de código
npm run lint         # Ejecuta ESLint
```

---

## Uso

### 1. Primer Acceso

Al abrir la aplicación por primera vez:

1. **Login**: Ingresa un nombre de usuario y un PIN de 4 dígitos
2. **Selección de Rol**: Elige tu rol (Dev, Design, PM, QA, Admin)
3. **Acceso al Tablero**: Serás redirigido al tablero Kanban

### 2. Gestión de Tareas

#### Crear una Tarea
1. Click en el botón **"Nueva Tarea"** en el header
2. Completa el formulario:
   - **Título** (obligatorio)
   - **Descripción**
   - **Tipo de tarea** (Programación, Diseño, etc.)
   - **Estado** (columna inicial)
   - **Prioridad** (Baja, Media, Alta)
   - **Horas estimadas**
   - **Asignar a** (usuario responsable)
3. Click en **"Crear Tarea"**

#### Mover Tareas
- **Arrastra y suelta** cualquier tarjeta entre columnas
- La tarea se actualiza automáticamente
- Visual feedback durante el arrastre

#### Ver Detalles
1. Click en cualquier tarjeta de tarea
2. Ver información completa
3. Agregar comentarios
4. Eliminar tarea

#### Buscar y Filtrar
- Usa el **campo de búsqueda** en cada columna
- Filtra por **tipo de tarea** con el dropdown
- El contador muestra tareas visibles/total

### 3. Comentarios

1. Abre el detalle de una tarea
2. Escribe tu comentario en el área de texto
3. Click en **"Agregar Comentario"**
4. Los comentarios se actualizan en tiempo real
5. Puedes eliminar tus propios comentarios

### 4. Gestión de Columnas

1. Click en **"Columnas"** en el sidebar
2. **Crear columna**: Define ID, título, color y orden
3. **Editar columna**: Modifica propiedades existentes
4. **Eliminar columna**: Las tareas se mueven a la primera columna
5. **Reordenar**: Cambia el orden de visualización

### 5. Configuración

1. Click en **"Configuración"** en el sidebar
2. Ver información de tu perfil
3. Cambiar rol (si necesario)
4. Ver estadísticas personales

---

## Estructura del Proyecto

```
kanban-jce/
├── public/
│   └── logo-jce.svg           # Logo oficial de la JCE
├── src/
│   ├── components/            # Componentes React
│   │   ├── Login.jsx         # Pantalla de login
│   │   ├── RoleSelection.jsx # Selección de rol
│   │   ├── Header.jsx        # Barra superior con stats
│   │   ├── KanbanBoard.jsx   # Tablero principal
│   │   ├── TaskCard.jsx      # Tarjeta de tarea
│   │   ├── TaskModal.jsx     # Modal crear/editar tarea
│   │   ├── TaskDetailModal.jsx # Modal detalle + comentarios
│   │   ├── ColumnManager.jsx # Gestión de columnas
│   │   └── SettingsPanel.jsx # Panel de configuración
│   ├── context/               # Context API
│   │   ├── AuthContext.jsx   # Autenticación y usuarios
│   │   └── KanbanContext.jsx # Estado del Kanban
│   ├── utils/                 # Utilidades
│   │   └── storage.js        # Funciones de LocalStorage
│   ├── App.jsx               # Componente principal
│   ├── App.css               # Estilos globales
│   └── main.jsx              # Entry point
├── database-schema.md         # Esquema de base de datos
├── migration-guide.md         # Guía de migración a DB
├── package.json
├── vite.config.js
└── README.md
```

### Componentes Principales

#### `AuthContext.jsx`
- Gestión de usuarios y autenticación
- Login/logout
- Almacenamiento de sesión activa

#### `KanbanContext.jsx`
- Estado global del tablero
- CRUD de tareas y comentarios
- Gestión de columnas
- Cálculo de estadísticas

#### `storage.js`
- Interfaz con LocalStorage
- Funciones de persistencia
- Datos por defecto

---

## Funcionalidades Detalladas

### Sistema de Roles

```javascript
{
  'dev': 'Desarrollador',
  'design': 'Diseñador',
  'pm': 'Project Manager',
  'qa': 'Quality Assurance',
  'admin': 'Administrador'
}
```

Todos los roles tienen los mismos permisos actualmente. En una implementación futura con backend, se pueden agregar restricciones.

### Tipos de Tarea

| Tipo | Icono | Descripción |
|------|-------|-------------|
| General | Circle | Tareas generales |
| Programación | Code | Desarrollo de código |
| Investigación | FlaskConical | Research y análisis |
| Diseño | Palette | Diseño UI/UX |
| Testing | TestTube | Pruebas QA |
| Documentación | Book | Docs técnicas |
| Reunión | Users | Meetings |
| Bug | Bug | Corrección de errores |

### Prioridades

- **Baja** (🟢): Tareas no urgentes
- **Media** (🟡): Prioridad normal
- **Alta** (🔴): Tareas urgentes

Las tarjetas tienen un borde de color según la prioridad.

### Columnas por Defecto

1. **Backlog** - Tareas pendientes de iniciar
2. **Por Hacer** - Tareas listas para comenzar
3. **En Proceso** - Tareas en desarrollo
4. **En Revisión** - Tareas en review/testing
5. **Completado** - Tareas finalizadas

---

## Migración a Base de Datos

### ¿Por qué migrar?

El sistema actual usa **LocalStorage** para persistencia. Esto es ideal para:
- ✅ Prototipado rápido
- ✅ Sin necesidad de backend
- ✅ Sin costos de hosting

Pero tiene limitaciones:
- ❌ Datos locales al navegador
- ❌ Sin colaboración real-time
- ❌ Límite de 5-10MB
- ❌ Pérdida de datos si se borra el navegador

### Migración a PostgreSQL

Ver los documentos detallados:
- **`database-schema.md`** - Esquema completo de tablas
- **`migration-guide.md`** - Guía paso a paso de migración

#### Resumen del proceso:

1. **Configurar PostgreSQL**
```bash
# Instalar PostgreSQL
brew install postgresql  # macOS
# o descarga de https://postgresql.org

# Crear base de datos
createdb kanban_jce
```

2. **Ejecutar migraciones**
```bash
psql kanban_jce < migrations/001_initial_schema.sql
```

3. **Implementar Backend**
- Ver `/backend` folder (próximamente)
- Node.js + Express + Prisma ORM
- RESTful API o GraphQL

4. **Migrar datos existentes**
```bash
node scripts/migrate-localstorage-to-db.js
```

Ver **`migration-guide.md`** para instrucciones completas.

---

## Desarrollo

### Estructura de Datos (LocalStorage)

#### Tareas
```javascript
{
  id: 1234567890,
  title: "Implementar autenticación",
  description: "Crear sistema de login con JWT",
  status: "in-progress",
  priority: "high",
  type: "programacion",
  hours: 8,
  createdBy: "juan",
  assignedTo: "maria",
  comments: [...],
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

#### Usuarios
```javascript
{
  id: 1234567890,
  username: "juan",
  pin: "1234",
  role: "dev",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

#### Columnas
```javascript
{
  id: "in-progress",
  title: "En Proceso",
  color: "#f59e0b",
  order: 2
}
```

### Agregar Nuevas Funcionalidades

#### 1. Nuevo campo en tareas

Editar `src/utils/storage.js`:
```javascript
export const addTask = (taskData) => {
  const newTask = {
    id: Date.now(),
    ...taskData,
    nuevocampo: taskData.nuevocampo || 'default', // Agregar aquí
    comments: [],
    createdAt: new Date().toISOString()
  };
  // ...
};
```

#### 2. Nuevo componente

```bash
# Crear archivos
touch src/components/MiComponente.jsx
touch src/components/MiComponente.css
```

```javascript
// src/components/MiComponente.jsx
import './MiComponente.css';

const MiComponente = () => {
  return <div className="mi-componente">...</div>;
};

export default MiComponente;
```

### Debugging

#### Ver datos en LocalStorage

```javascript
// En la consola del navegador
console.log(localStorage.getItem('kanban_tasks'));
console.log(localStorage.getItem('kanban_users'));
console.log(localStorage.getItem('kanban_columns'));
```

#### Limpiar datos

```javascript
// Limpiar todo
localStorage.clear();

// Limpiar específico
localStorage.removeItem('kanban_tasks');
```

---

## Contribución

### Proceso

1. **Fork** el repositorio
2. **Crea** una branch para tu feature
```bash
git checkout -b feature/nueva-funcionalidad
```
3. **Commit** tus cambios
```bash
git commit -m 'feat: agregar nueva funcionalidad'
```
4. **Push** a tu branch
```bash
git push origin feature/nueva-funcionalidad
```
5. **Abre** un Pull Request

### Convenciones de Código

- Usar **componentes funcionales** con hooks
- Seguir el estilo de código existente
- Comentar funciones complejas
- Usar nombres descriptivos
- Mantener componentes pequeños y reutilizables

### Commits

Seguir [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato de código
refactor: refactorización
test: tests
chore: tareas de mantenimiento
```

---

## Roadmap

### Versión 2.1 (Próxima)
- [ ] Subtareas
- [ ] Adjuntar archivos a tareas
- [ ] Notificaciones
- [ ] Filtros avanzados
- [ ] Exportar a PDF/Excel

### Versión 3.0 (Backend)
- [ ] API REST con Node.js
- [ ] Base de datos PostgreSQL
- [ ] Autenticación JWT
- [ ] WebSockets para real-time
- [ ] Historial de cambios

### Versión 4.0 (Avanzado)
- [ ] Mobile app (React Native)
- [ ] Integraciones (Slack, Email)
- [ ] Dashboards avanzados
- [ ] Reportes automáticos
- [ ] IA para estimación de horas

---

## FAQ

### ¿Los datos son compartidos entre usuarios?
No, actualmente cada usuario tiene sus datos en su propio navegador (LocalStorage). Para compartir datos, necesitas migrar a una base de datos.

### ¿Se pierden los datos al cerrar el navegador?
No, LocalStorage persiste los datos incluso después de cerrar el navegador. Solo se pierden si limpias el caché o cambias de navegador.

### ¿Puedo usar esto en producción?
Sí, pero solo para uso individual o equipos pequeños en la misma computadora. Para equipos distribuidos, migra a la versión con backend.

### ¿Cómo cambio los colores del tema?
Edita las variables CSS en `src/App.css`:
```css
:root {
  --primary: #6366f1;  /* Color principal */
  --success: #10b981;  /* Color de éxito */
  /* ... */
}
```

### ¿Puedo agregar más columnas?
Sí, usa el panel de "Columnas" en el sidebar para crear, editar o eliminar columnas.

---

## Soporte

Para reportar bugs o solicitar features:
- 📧 Email: soporte@jce.gob.do
- 🐛 Issues: [GitHub Issues](https://github.com/tu-org/kanban-jce/issues)
- 📚 Docs: Esta documentación

---

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Créditos

Desarrollado para la **Junta Central Electoral** (JCE)

- **Logo**: Junta Central Electoral
- **Iconos**: [Lucide Icons](https://lucide.dev)
- **Drag & Drop**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)

---

<div align="center">
  <p>Hecho con ❤️ para la JCE</p>
  <p>© 2024 Junta Central Electoral - República Dominicana</p>
</div>

