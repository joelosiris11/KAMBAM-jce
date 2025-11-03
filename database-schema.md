# Esquema de Base de Datos - Kanban JCE

Este documento detalla el esquema completo de base de datos para migrar el sistema Kanban desde LocalStorage a una base de datos relacional (PostgreSQL/MySQL recomendado).

## Tabla de Contenidos
- [Diagrama ER](#diagrama-er)
- [Tablas](#tablas)
- [Relaciones](#relaciones)
- [Índices](#índices)
- [Ejemplos de Consultas](#ejemplos-de-consultas)

---

## Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │     tasks       │       │    comments     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────┤ created_by (FK) │       │ id (PK)         │
│ username        │       │ assigned_to (FK)│◄──────┤ task_id (FK)    │
│ pin             │       │ status (FK)     │       │ author          │
│ role            │       │ title           │       │ text            │
│ created_at      │       │ description     │       │ created_at      │
└─────────────────┘       │ priority        │       └─────────────────┘
                          │ type            │
                          │ hours           │
                          │ created_at      │
                          └─────────────────┘
                                   │
                                   │
                          ┌────────▼─────────┐
                          │    columns       │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ title            │
                          │ color            │
                          │ order            │
                          └──────────────────┘
```

---

## Tablas

### 1. `users`
Almacena la información de los usuarios del sistema.

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  pin VARCHAR(255) NOT NULL,  -- Almacenar hasheado con bcrypt
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT users_username_unique UNIQUE (username),
  CONSTRAINT users_role_check CHECK (role IN ('dev', 'design', 'pm', 'qa', 'admin', NULL))
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);
```

**Campos:**
- `id`: Identificador único del usuario (auto-incremental)
- `username`: Nombre de usuario (único)
- `pin`: PIN de acceso (hasheado)
- `role`: Rol del usuario (dev, design, pm, qa, admin)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 2. `columns`
Define las columnas del tablero Kanban.

```sql
CREATE TABLE columns (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,  -- Formato hex: #RRGGBB
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT columns_order_unique UNIQUE ("order"),
  CONSTRAINT columns_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX idx_columns_order ON columns("order");
```

**Campos:**
- `id`: Identificador único de la columna (slug)
- `title`: Título de la columna
- `color`: Color en formato hexadecimal
- `order`: Orden de visualización
- `created_at`: Fecha de creación

**Columnas por defecto:**
```sql
INSERT INTO columns (id, title, color, "order") VALUES
  ('backlog', 'Backlog', '#94a3b8', 0),
  ('todo', 'Por Hacer', '#6366f1', 1),
  ('in-progress', 'En Proceso', '#f59e0b', 2),
  ('review', 'En Revisión', '#8b5cf6', 3),
  ('completed', 'Completado', '#10b981', 4);
```

---

### 3. `tasks`
Almacena todas las tareas del tablero Kanban.

```sql
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL REFERENCES columns(id) ON DELETE SET DEFAULT,
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  type VARCHAR(50) DEFAULT 'general',
  hours DECIMAL(5,1) DEFAULT 1.0,
  created_by VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  assigned_to VARCHAR(100) REFERENCES users(username) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high')),
  CONSTRAINT tasks_type_check CHECK (type IN (
    'general', 'programacion', 'investigacion', 'diseno', 
    'testing', 'documentacion', 'reunion', 'bug'
  )),
  CONSTRAINT tasks_hours_positive CHECK (hours > 0)
);

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_type ON tasks(type);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_search ON tasks USING gin(to_tsvector('spanish', title || ' ' || COALESCE(description, '')));
```

**Campos:**
- `id`: Identificador único de la tarea
- `title`: Título de la tarea
- `description`: Descripción detallada
- `status`: Estado actual (referencia a `columns.id`)
- `priority`: Prioridad (low, medium, high)
- `type`: Tipo de tarea
- `hours`: Horas estimadas
- `created_by`: Usuario que creó la tarea
- `assigned_to`: Usuario asignado (nullable)
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 4. `comments`
Almacena los comentarios de las tareas.

```sql
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT comments_text_not_empty CHECK (LENGTH(text) > 0)
);

CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_author ON comments(author);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

**Campos:**
- `id`: Identificador único del comentario
- `task_id`: ID de la tarea (relación con `tasks`)
- `author`: Usuario autor del comentario
- `text`: Contenido del comentario
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización

---

### 5. `sessions` (Opcional - para autenticación avanzada)
Almacena las sesiones activas de los usuarios.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT sessions_expires_future CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## Relaciones

### Relaciones Principales

1. **users → tasks (created_by)**
   - Tipo: One-to-Many
   - Un usuario puede crear muchas tareas
   - ON DELETE CASCADE: Si se elimina el usuario, se eliminan sus tareas

2. **users → tasks (assigned_to)**
   - Tipo: One-to-Many
   - Un usuario puede tener asignadas muchas tareas
   - ON DELETE SET NULL: Si se elimina el usuario, las tareas se desasignan

3. **columns → tasks (status)**
   - Tipo: One-to-Many
   - Una columna puede contener muchas tareas
   - ON DELETE SET DEFAULT: Si se elimina la columna, las tareas van al estado por defecto

4. **tasks → comments**
   - Tipo: One-to-Many
   - Una tarea puede tener muchos comentarios
   - ON DELETE CASCADE: Si se elimina la tarea, se eliminan sus comentarios

5. **users → comments (author)**
   - Tipo: One-to-Many
   - Un usuario puede escribir muchos comentarios
   - ON DELETE CASCADE: Si se elimina el usuario, se eliminan sus comentarios

---

## Vistas Útiles

### Vista de tareas con información completa
```sql
CREATE VIEW tasks_full AS
SELECT 
  t.id,
  t.title,
  t.description,
  t.status,
  c.title as status_title,
  c.color as status_color,
  t.priority,
  t.type,
  t.hours,
  t.created_by,
  u1.role as creator_role,
  t.assigned_to,
  u2.role as assignee_role,
  t.created_at,
  t.updated_at,
  COUNT(DISTINCT cm.id) as comment_count
FROM tasks t
  LEFT JOIN columns c ON t.status = c.id
  LEFT JOIN users u1 ON t.created_by = u1.username
  LEFT JOIN users u2 ON t.assigned_to = u2.username
  LEFT JOIN comments cm ON cm.task_id = t.id
GROUP BY t.id, c.title, c.color, u1.role, u2.role;
```

### Vista de estadísticas por usuario
```sql
CREATE VIEW user_stats AS
SELECT 
  u.id,
  u.username,
  u.role,
  COUNT(DISTINCT t1.id) as tasks_created,
  COUNT(DISTINCT t2.id) as tasks_assigned,
  COUNT(DISTINCT c.id) as comments_written,
  SUM(CASE WHEN t2.status = 'completed' THEN t2.hours ELSE 0 END) as hours_completed
FROM users u
  LEFT JOIN tasks t1 ON u.username = t1.created_by
  LEFT JOIN tasks t2 ON u.username = t2.assigned_to
  LEFT JOIN comments c ON u.username = c.author
GROUP BY u.id, u.username, u.role;
```

---

## Triggers

### Actualizar `updated_at` automáticamente
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Ejemplos de Consultas

### Obtener todas las tareas de una columna específica
```sql
SELECT * FROM tasks_full 
WHERE status = 'in-progress'
ORDER BY created_at DESC;
```

### Buscar tareas por texto
```sql
SELECT * FROM tasks 
WHERE to_tsvector('spanish', title || ' ' || COALESCE(description, '')) 
  @@ to_tsquery('spanish', 'diseño | landing');
```

### Obtener tareas con sus comentarios
```sql
SELECT 
  t.id,
  t.title,
  json_agg(
    json_build_object(
      'id', c.id,
      'author', c.author,
      'text', c.text,
      'created_at', c.created_at
    ) ORDER BY c.created_at DESC
  ) as comments
FROM tasks t
  LEFT JOIN comments c ON c.task_id = t.id
WHERE t.id = $1
GROUP BY t.id, t.title;
```

### Estadísticas del tablero
```sql
SELECT 
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE status = 'in-progress') as in_progress_tasks,
  SUM(hours) as total_hours,
  SUM(hours) FILTER (WHERE status != 'completed') as remaining_hours,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    1
  ) as progress_percent
FROM tasks;
```

### Tareas asignadas a un usuario
```sql
SELECT * FROM tasks_full
WHERE assigned_to = $1
ORDER BY 
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  created_at DESC;
```

### Top usuarios más activos
```sql
SELECT 
  username,
  role,
  tasks_created,
  tasks_assigned,
  comments_written,
  hours_completed
FROM user_stats
ORDER BY 
  tasks_created + tasks_assigned + comments_written DESC
LIMIT 10;
```

---

## Migraciones

### Migración inicial (crear todas las tablas)
Ver archivo: `migrations/001_initial_schema.sql`

### Script de migración desde LocalStorage
Ver archivo: `migration-guide.md`

---

## Notas Importantes

1. **Seguridad:**
   - Los PINs deben hashearse con bcrypt antes de almacenar
   - Implementar rate limiting en endpoints de autenticación
   - Usar prepared statements para prevenir SQL injection

2. **Performance:**
   - Los índices están optimizados para las consultas más comunes
   - Considerar particionamiento si se esperan millones de tareas
   - Usar caché (Redis) para consultas frecuentes

3. **Escalabilidad:**
   - Este esquema soporta miles de usuarios y millones de tareas
   - Para necesidades mayores, considerar sharding por `status`
   - Implementar archivado de tareas completadas

4. **Backup:**
   - Realizar backups diarios automáticos
   - Mantener al menos 30 días de backups
   - Probar restauración regularmente

---

## Tecnologías Recomendadas

### Backend
- **Node.js** con Express o Fastify
- **TypeScript** para type safety
- **Prisma ORM** o **Sequelize** para manejo de base de datos
- **JWT** para autenticación

### Base de Datos
- **PostgreSQL 14+** (recomendado)
- Alternativa: **MySQL 8.0+**

### Caché
- **Redis** para sesiones y datos frecuentes

### Migración de Datos
Ver el archivo `migration-guide.md` para instrucciones detalladas sobre cómo migrar los datos existentes desde LocalStorage a la base de datos.

