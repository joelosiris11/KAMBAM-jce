# Arquitectura del Sistema - Kanban JCE

## Vista General

```
┌─────────────────────────────────────────────────────────────┐
│                     KANBAN JCE SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   PRESENTATION       │
│   (React Frontend)   │
├──────────────────────┤
│ - Components         │
│ - Context API        │
│ - Hooks              │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   DATA LAYER         │
│   (LocalStorage)     │
├──────────────────────┤
│ - Users              │
│ - Tasks              │
│ - Columns            │
│ - Comments           │
└──────────────────────┘
```

---

## Arquitectura Actual (v2.0)

### Frontend - React SPA

#### Tecnologías
- **React 18** - UI Library
- **Vite** - Build tool
- **Context API** - State management
- **@hello-pangea/dnd** - Drag and drop
- **Lucide React** - Icons

#### Componentes Principales

```
App.jsx
├── Login.jsx
├── RoleSelection.jsx
└── Main Layout
    ├── Sidebar
    │   ├── Logo
    │   ├── Navigation
    │   └── User Profile
    └── Content
        ├── Header.jsx
        │   ├── Stats Cards
        │   └── New Task Button
        └── KanbanBoard.jsx
            ├── Column (x5)
            │   ├── Column Header
            │   ├── Search & Filters
            │   └── TaskCard (xN)
            │       ├── Title
            │       ├── Type Badge
            │       ├── Priority Badge
            │       ├── Description
            │       ├── Creator Info
            │       ├── Assignee Info
            │       └── Metadata (hours, date, comments)
            └── Modals
                ├── TaskModal (create/edit)
                ├── TaskDetailModal
                ├── ColumnManager
                └── SettingsPanel
```

#### State Management

**AuthContext**
```javascript
{
  currentUser: {
    id, username, pin, role, createdAt
  },
  users: [...],
  isAuthenticated: boolean,
  hasRole: boolean,
  login(),
  logout(),
  updateUserRole()
}
```

**KanbanContext**
```javascript
{
  tasks: [...],
  columns: [...],
  getTasksByColumn(),
  addTask(),
  updateTask(),
  deleteTask(),
  moveTask(),
  addComment(),
  deleteComment(),
  getStats()
}
```

#### Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Context Method
    ↓
storage.js Function
    ↓
LocalStorage Write
    ↓
Context State Update
    ↓
Component Re-render
```

---

## Modelo de Datos

### User
```typescript
interface User {
  id: number;
  username: string;
  pin: string;  // 4 dígitos
  role: 'dev' | 'design' | 'pm' | 'qa' | 'admin';
  createdAt: string; // ISO 8601
}
```

### Column
```typescript
interface Column {
  id: string;  // slug
  title: string;
  color: string;  // hex color
  order: number;
}
```

### Task
```typescript
interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;  // column id
  priority: 'low' | 'medium' | 'high';
  type: 'general' | 'programacion' | 'investigacion' | 
        'diseno' | 'testing' | 'documentacion' | 
        'reunion' | 'bug';
  hours: number;
  createdBy: string;  // username
  assignedTo?: string;  // username
  comments: Comment[];
  createdAt: string;
}
```

### Comment
```typescript
interface Comment {
  id: number;
  text: string;
  author: string;  // username
  createdAt: string;
}
```

---

## Flujo de Funcionalidades

### Autenticación

```
┌──────────┐    ┌──────────────┐    ┌────────────────┐
│  Login   │───▶│ Verify User  │───▶│ Set Session    │
│  Screen  │    │ (AuthContext)│    │ (LocalStorage) │
└──────────┘    └──────────────┘    └────────────────┘
                        │
                        ├─── New User → Create User
                        │
                        └─── Existing → Verify PIN
                                 │
                                 ├─── ✓ Login Success
                                 │
                                 └─── ✗ PIN Error
```

### Crear Tarea

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ Click "New"  │───▶│ TaskModal   │───▶│ addTask()    │
│ Button       │    │ (Form)      │    │ (Context)    │
└──────────────┘    └─────────────┘    └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ storage.js   │
                                       │ addTask()    │
                                       └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ LocalStorage │
                                       │ Write        │
                                       └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ Update State │
                                       │ Re-render    │
                                       └──────────────┘
```

### Drag and Drop

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ User Drags   │───▶│ onDragEnd   │───▶│ moveTask()   │
│ TaskCard     │    │ (Handler)   │    │ (Context)    │
└──────────────┘    └─────────────┘    └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ updateTask() │
                                       │ (storage)    │
                                       └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ Update State │
                                       │ Visual Update│
                                       └──────────────┘
```

### Búsqueda y Filtrado

```
┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ User Types   │───▶│ setState    │───▶│ filterTasks()│
│ in Search    │    │ (Component) │    │ (Computed)   │
└──────────────┘    └─────────────┘    └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ Filter by:   │
                                       │ - Text search│
                                       │ - Type       │
                                       └──────────────┘
                                               │
                                               ▼
                                       ┌──────────────┐
                                       │ Render       │
                                       │ Filtered List│
                                       └──────────────┘
```

---

## Arquitectura Futura (v3.0 - Con Backend)

```
┌─────────────────────────────────────────────────────────────┐
│                     KANBAN JCE SYSTEM v3.0                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   PRESENTATION       │
│   (React Frontend)   │
├──────────────────────┤
│ - React Components   │
│ - React Query        │
│ - WebSockets Client  │
└──────────┬───────────┘
           │ REST API / GraphQL
           ▼
┌──────────────────────┐
│   API LAYER          │
│   (Node.js Backend)  │
├──────────────────────┤
│ - Express/Fastify    │
│ - JWT Auth           │
│ - WebSockets         │
│ - Business Logic     │
└──────────┬───────────┘
           │ SQL Queries
           ▼
┌──────────────────────┐
│   DATA LAYER         │
│   (PostgreSQL)       │
├──────────────────────┤
│ - Users Table        │
│ - Tasks Table        │
│ - Columns Table      │
│ - Comments Table     │
│ - Sessions Table     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│   CACHE LAYER        │
│   (Redis)            │
├──────────────────────┤
│ - Session Cache      │
│ - Query Cache        │
│ - Real-time Data     │
└──────────────────────┘
```

### Endpoints API (Propuestos)

```
Authentication
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh
GET    /api/auth/me

Users
GET    /api/users
GET    /api/users/:id
PATCH  /api/users/:id
DELETE /api/users/:id

Tasks
GET    /api/tasks
GET    /api/tasks/:id
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/tasks?status=in-progress
GET    /api/tasks?assignedTo=username
GET    /api/tasks?search=query

Comments
GET    /api/tasks/:taskId/comments
POST   /api/tasks/:taskId/comments
DELETE /api/tasks/:taskId/comments/:commentId

Columns
GET    /api/columns
POST   /api/columns
PATCH  /api/columns/:id
DELETE /api/columns/:id

Stats
GET    /api/stats
GET    /api/stats/user/:username
```

---

## Patrones de Diseño Utilizados

### 1. **Context Provider Pattern**
Usado para estado global (Auth y Kanban)

```javascript
<AuthProvider>
  <KanbanProvider>
    <App />
  </KanbanProvider>
</AuthProvider>
```

### 2. **Compound Components**
TaskCard con subcomponentes

```javascript
<TaskCard>
  <TaskCard.Header />
  <TaskCard.Body />
  <TaskCard.Footer />
</TaskCard>
```

### 3. **Custom Hooks**
Encapsulación de lógica reutilizable

```javascript
const { currentUser, login, logout } = useAuth();
const { tasks, addTask, updateTask } = useKanban();
```

### 4. **Controlled Components**
Formularios controlados por React

```javascript
<input value={formData.title} onChange={handleChange} />
```

### 5. **Render Props** (con @hello-pangea/dnd)
```javascript
<Draggable>
  {(provided, snapshot) => (
    <div ref={provided.innerRef} {...provided.draggableProps}>
      {/* content */}
    </div>
  )}
</Draggable>
```

---

## Consideraciones de Performance

### Optimizaciones Actuales

1. **Lazy Evaluation**: Filtros calculados solo cuando cambian
2. **Memoization**: Componentes no re-renderizan innecesariamente
3. **Event Delegation**: Eventos manejados a nivel superior
4. **CSS Transitions**: Animaciones con GPU

### Optimizaciones Futuras

1. **React.memo()**: Para componentes puros
2. **useMemo()**: Para cálculos costosos
3. **useCallback()**: Para funciones en dependencias
4. **Virtual Scrolling**: Para listas largas de tareas
5. **Code Splitting**: Lazy loading de componentes
6. **Service Workers**: Para offline support

---

## Seguridad

### Actual (LocalStorage)

- ✓ PINs en texto plano (solo local)
- ✓ Sin exposición de red
- ✓ Datos solo en el navegador
- ✗ Sin encriptación
- ✗ Sin protección contra XSS

### Futuro (Backend)

- ✓ Bcrypt para hashear PINs
- ✓ JWT tokens con expiración
- ✓ HTTPS obligatorio
- ✓ CORS configurado
- ✓ Rate limiting
- ✓ SQL injection prevention (Prisma ORM)
- ✓ XSS prevention (sanitización)
- ✓ CSRF tokens
- ✓ Helmet.js para headers seguros

---

## Escalabilidad

### Límites Actuales

- **Usuarios**: Sin límite práctico (localStorage: ~5-10MB)
- **Tareas**: ~1000-5000 tareas (depende de navegador)
- **Comentarios**: ~100 por tarea recomendado
- **Columnas**: 10-20 columnas máximo

### Escalabilidad Futura

Con PostgreSQL y backend:
- **Usuarios**: Millones
- **Tareas**: Millones (con índices apropiados)
- **Comentarios**: Ilimitados
- **Columnas**: Cientos

---

## Testing Strategy

### Actual
- ✗ Sin tests automatizados
- ✓ Testing manual

### Recomendado para v3.0

```
Unit Tests
├── Components (Jest + React Testing Library)
├── Hooks (React Hooks Testing Library)
├── Utils (Jest)
└── API Client (Jest + MSW)

Integration Tests
├── User Flows (Cypress)
└── API Endpoints (Supertest)

E2E Tests
└── Critical Paths (Playwright)
```

---

## Monitoreo y Observabilidad (v3.0)

### Métricas

- Request latency
- Error rates
- Database query performance
- User sessions activas
- Tasks created/completed per day

### Logging

```javascript
{
  timestamp: "2024-01-15T10:30:00Z",
  level: "info",
  message: "Task created",
  userId: 123,
  taskId: 456,
  metadata: { ... }
}
```

### Alertas

- Database down
- High error rate (>1%)
- Slow queries (>500ms)
- High memory usage (>80%)

---

## Deployment Strategy

### Actual (v2.0)
- Build local
- Deploy estático (Vercel/Netlify)
- Sin backend

### Futuro (v3.0)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   GitHub    │────▶│   CI/CD     │────▶│  Production │
│   (Repo)    │     │  (Actions)  │     │   (Cloud)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ├── Run Tests
                           ├── Build
                           ├── Deploy Frontend
                           └── Deploy Backend
```

**Environments:**
- Development (local)
- Staging (pre-production)
- Production

---

## Documentos Relacionados

- **README.md** - Instalación y uso general
- **database-schema.md** - Esquema detallado de DB
- **migration-guide.md** - Guía de migración paso a paso
- **ARCHITECTURE.md** - Este documento

---

## Contacto

Para preguntas sobre la arquitectura:
- 📧 Email: dev@jce.gob.do
- 💬 Slack: #kanban-dev
- 📚 Wiki: Confluence

---

**Última actualización**: Noviembre 2024
**Versión del documento**: 1.0

