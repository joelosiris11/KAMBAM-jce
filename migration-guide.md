# Guía de Migración: LocalStorage → Base de Datos

Esta guía te ayudará a migrar tu aplicación Kanban JCE desde LocalStorage a una base de datos PostgreSQL con backend Node.js.

## Tabla de Contenidos

- [Resumen](#resumen)
- [Prerequisitos](#prerequisitos)
- [Fase 1: Configuración de la Base de Datos](#fase-1-configuración-de-la-base-de-datos)
- [Fase 2: Desarrollo del Backend](#fase-2-desarrollo-del-backend)
- [Fase 3: Migración de Datos](#fase-3-migración-de-datos)
- [Fase 4: Actualización del Frontend](#fase-4-actualización-del-frontend)
- [Fase 5: Deployment](#fase-5-deployment)
- [Troubleshooting](#troubleshooting)

---

## Resumen

### ¿Qué vamos a hacer?

```
┌─────────────────────┐         ┌─────────────────────┐
│   ANTES (Actual)    │         │  DESPUÉS (Migrado)  │
├─────────────────────┤         ├─────────────────────┤
│                     │         │                     │
│  React Frontend     │         │  React Frontend     │
│        ↓            │         │        ↓            │
│   LocalStorage      │   →     │   REST API          │
│                     │         │        ↓            │
│                     │         │   Node.js Backend   │
│                     │         │        ↓            │
│                     │         │   PostgreSQL DB     │
└─────────────────────┘         └─────────────────────┘
```

### Beneficios

- ✅ Datos centralizados
- ✅ Colaboración real-time
- ✅ Sin límites de almacenamiento
- ✅ Backup automático
- ✅ Escalable
- ✅ Seguridad mejorada

### Tiempo Estimado

- **Configuración**: 2-3 horas
- **Desarrollo Backend**: 8-16 horas
- **Migración de Datos**: 1-2 horas
- **Testing**: 4-8 horas
- **Total**: 2-4 días de trabajo

---

## Prerequisitos

### Software Necesario

```bash
# Node.js y npm
node --version  # v16+
npm --version   # v7+

# PostgreSQL
psql --version  # v14+

# Git
git --version
```

### Instalar PostgreSQL

#### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Windows
Descargar desde: https://www.postgresql.org/download/windows/

### Conocimientos Requeridos

- JavaScript/Node.js
- Express.js o Fastify
- SQL básico
- REST APIs
- React (ya lo tienes)

---

## Fase 1: Configuración de la Base de Datos

### Paso 1.1: Crear la Base de Datos

```bash
# Conectar a PostgreSQL
psql postgres

# Crear usuario
CREATE USER kanban_admin WITH PASSWORD 'tu_password_segura';

# Crear base de datos
CREATE DATABASE kanban_jce OWNER kanban_admin;

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE kanban_jce TO kanban_admin;

# Salir
\q
```

### Paso 1.2: Aplicar el Esquema

Crea el archivo `migrations/001_initial_schema.sql`:

```sql
-- Crear tablas
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  pin VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_role_check CHECK (role IN ('dev', 'design', 'pm', 'qa', 'admin', NULL))
);

CREATE TABLE columns (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT columns_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

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
  ))
);

CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author VARCHAR(100) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_comments_task_id ON comments(task_id);

-- Insertar columnas por defecto
INSERT INTO columns (id, title, color, "order") VALUES
  ('backlog', 'Backlog', '#94a3b8', 0),
  ('todo', 'Por Hacer', '#6366f1', 1),
  ('in-progress', 'En Proceso', '#f59e0b', 2),
  ('review', 'En Revisión', '#8b5cf6', 3),
  ('completed', 'Completado', '#10b981', 4);

-- Trigger para updated_at
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

Ejecutar:
```bash
psql kanban_jce -U kanban_admin < migrations/001_initial_schema.sql
```

---

## Fase 2: Desarrollo del Backend

### Paso 2.1: Crear Proyecto Backend

```bash
# Crear directorio
mkdir kanban-backend
cd kanban-backend

# Inicializar proyecto
npm init -y

# Instalar dependencias
npm install express cors dotenv pg bcrypt jsonwebtoken
npm install --save-dev nodemon

# Instalar Prisma (ORM recomendado)
npm install prisma @prisma/client
npx prisma init
```

### Paso 2.2: Configurar Prisma

Editar `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        BigInt   @id @default(autoincrement())
  username  String   @unique @db.VarChar(100)
  pin       String   @db.VarChar(255)
  role      String?  @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  tasksCreated  Task[]    @relation("TaskCreator")
  tasksAssigned Task[]    @relation("TaskAssignee")
  comments      Comment[]

  @@map("users")
}

model Column {
  id        String   @id @db.VarChar(50)
  title     String   @db.VarChar(100)
  color     String   @db.VarChar(7)
  order     Int
  createdAt DateTime @default(now()) @map("created_at")

  tasks Task[]

  @@map("columns")
}

model Task {
  id          BigInt   @id @default(autoincrement())
  title       String   @db.VarChar(255)
  description String?
  status      String   @db.VarChar(50)
  priority    String   @default("medium") @db.VarChar(10)
  type        String?  @default("general") @db.VarChar(50)
  hours       Decimal  @default(1.0) @db.Decimal(5, 1)
  createdBy   String   @map("created_by") @db.VarChar(100)
  assignedTo  String?  @map("assigned_to") @db.VarChar(100)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  column   Column    @relation(fields: [status], references: [id])
  creator  User      @relation("TaskCreator", fields: [createdBy], references: [username])
  assignee User?     @relation("TaskAssignee", fields: [assignedTo], references: [username])
  comments Comment[]

  @@map("tasks")
}

model Comment {
  id        BigInt   @id @default(autoincrement())
  taskId    BigInt   @map("task_id")
  author    String   @db.VarChar(100)
  text      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user User @relation(fields: [author], references: [username], onDelete: Cascade)

  @@map("comments")
}
```

Generar cliente:
```bash
npx prisma generate
npx prisma db pull  # Sincronizar con DB existente
```

### Paso 2.3: Crear API REST

Estructura del proyecto:
```
kanban-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── columnController.js
│   │   └── commentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   ├── columns.js
│   │   └── comments.js
│   └── server.js
├── .env
├── package.json
└── prisma/
    └── schema.prisma
```

**`src/server.js`**:
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import columnRoutes from './routes/columns.js';
import commentRoutes from './routes/comments.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/comments', commentRoutes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

**`.env`**:
```env
DATABASE_URL="postgresql://kanban_admin:tu_password@localhost:5432/kanban_jce"
JWT_SECRET="tu_secreto_super_seguro_aqui"
PORT=3000
NODE_ENV=development
```

Ver ejemplos completos de controladores y rutas en la carpeta `/backend-example`.

---

## Fase 3: Migración de Datos

### Paso 3.1: Script de Migración

Crear `scripts/migrate-data.js`:

```javascript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function migrate() {
  console.log('🔄 Iniciando migración de datos...');

  try {
    // 1. Migrar usuarios
    const usersData = JSON.parse(localStorage.getItem('kanban_users') || '[]');
    
    for (const user of usersData) {
      const hashedPin = await bcrypt.hash(user.pin, 10);
      
      await prisma.user.upsert({
        where: { username: user.username },
        update: {},
        create: {
          username: user.username,
          pin: hashedPin,
          role: user.role,
          createdAt: new Date(user.createdAt)
        }
      });
      
      console.log(`✅ Usuario migrado: ${user.username}`);
    }

    // 2. Migrar tareas
    const tasksData = JSON.parse(localStorage.getItem('kanban_tasks') || '[]');
    
    for (const task of tasksData) {
      const createdTask = await prisma.task.create({
        data: {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          type: task.type,
          hours: task.hours,
          createdBy: task.createdBy,
          assignedTo: task.assignedTo || null,
          createdAt: new Date(task.createdAt)
        }
      });

      // 3. Migrar comentarios de la tarea
      if (task.comments && task.comments.length > 0) {
        for (const comment of task.comments) {
          await prisma.comment.create({
            data: {
              taskId: createdTask.id,
              author: comment.author,
              text: comment.text,
              createdAt: new Date(comment.createdAt)
            }
          });
        }
      }

      console.log(`✅ Tarea migrada: ${task.title}`);
    }

    // 4. Migrar columnas personalizadas (si hay)
    const columnsData = JSON.parse(localStorage.getItem('kanban_columns') || '[]');
    
    for (const column of columnsData) {
      await prisma.column.upsert({
        where: { id: column.id },
        update: {
          title: column.title,
          color: column.color,
          order: column.order
        },
        create: {
          id: column.id,
          title: column.title,
          color: column.color,
          order: column.order
        }
      });
    }

    console.log('✅ Migración completada exitosamente!');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
```

### Paso 3.2: Exportar Datos del Frontend

En la consola del navegador:

```javascript
// Exportar todos los datos
const exportData = {
  users: JSON.parse(localStorage.getItem('kanban_users') || '[]'),
  tasks: JSON.parse(localStorage.getItem('kanban_tasks') || '[]'),
  columns: JSON.parse(localStorage.getItem('kanban_columns') || '[]')
};

// Copiar al portapapeles
copy(JSON.stringify(exportData, null, 2));

// O descargar como archivo
const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'kanban-data-export.json';
a.click();
```

### Paso 3.3: Ejecutar Migración

```bash
# Opción 1: Desde archivo JSON
node scripts/migrate-from-json.js kanban-data-export.json

# Opción 2: Migración manual
# 1. Importar en consola del navegador
# 2. Ejecutar script de migración
node scripts/migrate-data.js
```

---

## Fase 4: Actualización del Frontend

### Paso 4.1: Crear Cliente API

Crear `src/api/client.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }

    return response.json();
  }

  // Auth
  async login(username, pin) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, pin })
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    this.clearToken();
  }

  // Tasks
  async getTasks() {
    return this.request('/tasks');
  }

  async getTask(id) {
    return this.request(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  }

  async updateTask(id, updates) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  }

  async deleteTask(id) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }

  // Comments
  async getComments(taskId) {
    return this.request(`/tasks/${taskId}/comments`);
  }

  async createComment(taskId, text) {
    return this.request(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async deleteComment(taskId, commentId) {
    return this.request(`/tasks/${taskId}/comments/${commentId}`, {
      method: 'DELETE'
    });
  }

  // Columns
  async getColumns() {
    return this.request('/columns');
  }

  async createColumn(columnData) {
    return this.request('/columns', {
      method: 'POST',
      body: JSON.stringify(columnData)
    });
  }
}

export default new ApiClient();
```

### Paso 4.2: Actualizar Context

Reemplazar `src/utils/storage.js` con llamadas a la API:

```javascript
// Antes
export const getTasks = () => {
  const tasks = localStorage.getItem('kanban_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

// Después
export const getTasks = async () => {
  return await apiClient.getTasks();
};
```

### Paso 4.3: Actualizar KanbanContext

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const KanbanContext = createContext(null);

export const useKanban = () => useContext(KanbanContext);

export const KanbanProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, columnsData] = await Promise.all([
        apiClient.getTasks(),
        apiClient.getColumns()
      ]);
      setTasks(tasksData);
      setColumns(columnsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData) => {
    const newTask = await apiClient.createTask(taskData);
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  // ... más métodos

  return (
    <KanbanContext.Provider value={{ 
      tasks, 
      columns, 
      loading,
      addTask,
      // ...
    }}>
      {children}
    </KanbanContext.Provider>
  );
};
```

### Paso 4.4: Variables de Entorno

Crear `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

---

## Fase 5: Deployment

### Opción A: Vercel (Frontend) + Railway (Backend + DB)

#### Frontend (Vercel)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Configurar variables
vercel env add VITE_API_URL production
```

#### Backend (Railway)
```bash
# 1. Crear cuenta en railway.app
# 2. Crear nuevo proyecto
# 3. Agregar PostgreSQL
# 4. Conectar repositorio GitHub
# 5. Variables de entorno:
#    - DATABASE_URL (automático)
#    - JWT_SECRET
#    - NODE_ENV=production
```

### Opción B: DigitalOcean Droplet

```bash
# 1. Crear Droplet Ubuntu 22.04
# 2. SSH al servidor
ssh root@tu-ip

# 3. Instalar dependencias
apt update
apt install -y nodejs npm postgresql nginx

# 4. Configurar PostgreSQL
sudo -u postgres createdb kanban_jce

# 5. Clonar repositorios
git clone https://github.com/tu-org/kanban-backend.git
git clone https://github.com/tu-org/kanban-frontend.git

# 6. Backend
cd kanban-backend
npm install
npm run build

# Usar PM2 para mantener el proceso
npm install -g pm2
pm2 start dist/server.js --name kanban-api
pm2 startup
pm2 save

# 7. Frontend
cd ../kanban-frontend
npm install
npm run build

# 8. Configurar Nginx
nano /etc/nginx/sites-available/kanban
```

Configuración Nginx:
```nginx
server {
  listen 80;
  server_name tu-dominio.com;

  # Frontend
  location / {
    root /var/www/kanban-frontend/dist;
    try_files $uri $uri/ /index.html;
  }

  # API
  location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Activar:
```bash
ln -s /etc/nginx/sites-available/kanban /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### SSL con Let's Encrypt
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d tu-dominio.com
```

---

## Troubleshooting

### Error: Cannot connect to database

**Causa**: Credenciales incorrectas o PostgreSQL no está corriendo.

**Solución**:
```bash
# Verificar que PostgreSQL está corriendo
systemctl status postgresql

# Probar conexión
psql -U kanban_admin -d kanban_jce -h localhost

# Verificar .env
cat .env | grep DATABASE_URL
```

### Error: CORS blocked

**Causa**: Frontend y Backend en diferentes dominios.

**Solución** (`server.js`):
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://tu-dominio.com'],
  credentials: true
}));
```

### Error: Tasks not showing after migration

**Causa**: Referencias de usuarios no coinciden.

**Solución**:
```sql
-- Verificar usuarios en tasks
SELECT DISTINCT created_by FROM tasks 
WHERE created_by NOT IN (SELECT username FROM users);

-- Crear usuarios faltantes o actualizar referencias
```

### Error: Token expired

**Causa**: JWT expiró.

**Solución**:
- Incrementar tiempo de expiración en el backend
- Implementar refresh tokens
- Hacer logout/login

---

## Checklist de Migración

### Pre-Migración
- [ ] Backup completo de LocalStorage
- [ ] PostgreSQL instalado y corriendo
- [ ] Schema de DB creado
- [ ] Backend desarrollado y testeado
- [ ] API documentada

### Migración
- [ ] Exportar datos de LocalStorage
- [ ] Ejecutar script de migración
- [ ] Verificar integridad de datos
- [ ] Testear todas las funcionalidades
- [ ] Verificar permisos de usuarios

### Post-Migración
- [ ] Frontend actualizado para usar API
- [ ] Tests end-to-end pasando
- [ ] Documentación actualizada
- [ ] Monitoring configurado
- [ ] Backups automáticos activos
- [ ] SSL configurado
- [ ] Deploy completado

---

## Recursos Adicionales

### Documentación
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

### Tutoriales
- [REST API Best Practices](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/)
- [JWT Authentication](https://jwt.io/introduction)
- [SQL Query Optimization](https://use-the-index-luke.com/)

### Herramientas
- [Postman](https://www.postman.com/) - Testing de API
- [pgAdmin](https://www.pgadmin.org/) - GUI para PostgreSQL
- [TablePlus](https://tableplus.com/) - Cliente de DB

---

## Soporte

¿Necesitas ayuda con la migración?

- 📧 Email: dev@jce.gob.do
- 📚 Docs: Ver `database-schema.md`
- 🐛 Issues: GitHub Issues

---

**¡Buena suerte con tu migración!** 🚀


