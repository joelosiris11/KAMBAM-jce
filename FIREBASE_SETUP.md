# 🔥 Configuración de Firebase - Kanban JCE

Esta guía te ayudará a conectar tu aplicación Kanban con Firebase para tener sincronización en tiempo real y almacenamiento en la nube.

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Crear Proyecto en Firebase](#crear-proyecto-en-firebase)
3. [Configurar Firebase en la Aplicación](#configurar-firebase-en-la-aplicación)
4. [Configurar Firestore Database](#configurar-firestore-database)
5. [Configurar Reglas de Seguridad](#configurar-reglas-de-seguridad)
6. [Migrar Datos Existentes (Opcional)](#migrar-datos-existentes-opcional)
7. [Verificar la Conexión](#verificar-la-conexión)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisitos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta de Google (para acceder a Firebase Console)
- ✅ Node.js instalado (v14 o superior)
- ✅ Aplicación Kanban corriendo localmente
- ✅ Acceso a la [Firebase Console](https://console.firebase.google.com/)

---

## 1. Crear Proyecto en Firebase

### Paso 1.1: Acceder a Firebase Console

1. Ve a [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Agregar proyecto"** o **"Create a project"**

### Paso 1.2: Configurar el Proyecto

1. **Nombre del proyecto**: Ingresa `kanban-jce` (o el nombre que prefieras)
2. **Google Analytics**: Puedes deshabilitarlo si no lo necesitas
3. Haz clic en **"Crear proyecto"**
4. Espera a que Firebase termine de configurar tu proyecto (1-2 minutos)

### Paso 1.3: Registrar tu Aplicación Web

1. En la página principal del proyecto, haz clic en el ícono **Web** `</>`
2. Registra tu app con el nombre: `Kanban JCE Web`
3. **NO** marques la opción "Firebase Hosting" (a menos que lo necesites)
4. Haz clic en **"Registrar app"**

### Paso 1.4: Copiar las Credenciales

Verás un código similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnop",
  authDomain: "kanban-jce.firebaseapp.com",
  projectId: "kanban-jce",
  storageBucket: "kanban-jce.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**⚠️ IMPORTANTE**: Guarda estas credenciales, las necesitarás en el siguiente paso.

---

## 2. Configurar Firebase en la Aplicación

### Paso 2.1: Crear archivo de variables de entorno

1. En la raíz de tu proyecto, crea un archivo llamado `.env`:

```bash
touch .env
```

2. Abre el archivo `.env` y agrega las credenciales de Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnop
VITE_FIREBASE_AUTH_DOMAIN=kanban-jce.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kanban-jce
VITE_FIREBASE_STORAGE_BUCKET=kanban-jce.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**⚠️ NOTA**: Reemplaza los valores con tus propias credenciales de Firebase.

### Paso 2.2: Agregar .env al .gitignore

Si usas Git, asegúrate de que `.env` esté en tu `.gitignore`:

```bash
echo ".env" >> .gitignore
```

### Paso 2.3: Reiniciar el Servidor de Desarrollo

Para que Vite cargue las nuevas variables de entorno:

```bash
npm run dev
```

---

## 3. Configurar Firestore Database

### Paso 3.1: Crear la Base de Datos

1. En Firebase Console, ve a **"Build"** → **"Firestore Database"**
2. Haz clic en **"Crear base de datos"** o **"Create database"**
3. Selecciona el modo:
   - **Modo de producción**: Recomendado (configuraremos las reglas después)
   - **Modo de prueba**: Solo para desarrollo (expira en 30 días)
4. Selecciona una ubicación cercana a tus usuarios:
   - Para República Dominicana: `us-east1` (Carolina del Sur)
   - Para otros países: Elige la más cercana
5. Haz clic en **"Habilitar"**

### Paso 3.2: Esperar la Creación

Firebase tardará 1-2 minutos en crear la base de datos.

---

## 4. Configurar Reglas de Seguridad

### Paso 4.1: Configurar Reglas Básicas

Por ahora, usaremos reglas permisivas para desarrollo. En producción, deberás configurar autenticación adecuada.

1. En Firestore Database, ve a la pestaña **"Reglas"** o **"Rules"**
2. Reemplaza las reglas existentes con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura a todos (SOLO DESARROLLO)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en **"Publicar"** o **"Publish"**

**⚠️ ADVERTENCIA**: Estas reglas permiten acceso completo a cualquier persona. En producción, debes implementar autenticación y reglas más restrictivas.

### Paso 4.2: Reglas de Producción (Recomendadas)

Para producción, usa reglas más seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios: todos pueden leer, solo el dueño puede escribir
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Columnas: todos pueden leer, solo autenticados pueden escribir
    match /columns/{columnId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Tareas: todos pueden leer y escribir si están autenticados
    match /tasks/{taskId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Migrar Datos Existentes (Opcional)

Si ya tienes datos en `localStorage`, puedes migrarlos a Firebase:

### Opción A: Migración Manual desde la Consola

1. Abre la aplicación en el navegador
2. Abre las DevTools (F12)
3. Ve a la pestaña **Console**
4. Ejecuta estos comandos:

```javascript
// Ver tus datos actuales
console.log('Users:', JSON.parse(localStorage.getItem('kanban_users')));
console.log('Tasks:', JSON.parse(localStorage.getItem('kanban_tasks')));
console.log('Columns:', JSON.parse(localStorage.getItem('kanban_columns')));
```

5. Copia los datos y créalos manualmente en Firebase Console:
   - Ve a Firestore Database → **"Datos"** → **"Agregar colección"**
   - Crea las colecciones: `users`, `tasks`, `columns`
   - Agrega los documentos uno por uno

### Opción B: Script de Migración Automática

Crea un archivo `migrate.js` en la raíz del proyecto:

```javascript
// migrate.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  // Tus credenciales aquí
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  // Obtener datos de localStorage
  const users = JSON.parse(localStorage.getItem('kanban_users') || '[]');
  const tasks = JSON.parse(localStorage.getItem('kanban_tasks') || '[]');
  const columns = JSON.parse(localStorage.getItem('kanban_columns') || '[]');
  
  // Migrar usuarios
  for (const user of users) {
    await setDoc(doc(db, 'users', user.username), user);
  }
  
  // Migrar tareas
  for (const task of tasks) {
    await setDoc(doc(db, 'tasks', String(task.id)), task);
  }
  
  // Migrar columnas
  for (const column of columns) {
    await setDoc(doc(db, 'columns', column.id), column);
  }
  
  console.log('✅ Migración completada!');
}

migrate();
```

---

## 6. Verificar la Conexión

### Paso 6.1: Revisar la Consola del Navegador

1. Abre la aplicación en el navegador
2. Abre las DevTools (F12)
3. Ve a la pestaña **Console**
4. Deberías ver:

```
✅ Firebase inicializado correctamente
🔄 Iniciando sincronización en tiempo real con Firebase...
```

### Paso 6.2: Verificar Datos en Firestore

1. Ve a Firebase Console → Firestore Database
2. Deberías ver las colecciones:
   - `columns` (con 5 columnas por defecto)
   - `tasks` (con las tareas creadas)
   - `users` (con los usuarios registrados)

### Paso 6.3: Probar Sincronización en Tiempo Real

1. Abre la aplicación en dos pestañas del navegador
2. Crea una tarea en una pestaña
3. Verifica que aparezca automáticamente en la otra pestaña
4. ✅ Si funciona, ¡la sincronización está activa!

---

## 7. Características de la Integración

### ✅ Funcionalidades Implementadas

- **Sincronización en tiempo real**: Los cambios se reflejan instantáneamente en todas las pestañas/dispositivos
- **Fallback automático**: Si Firebase no está configurado, usa `localStorage`
- **Manejo de errores**: Si Firebase falla, la app continúa funcionando con localStorage
- **Modo híbrido**: Las sesiones se mantienen en localStorage para persistencia local

### 🔄 Cómo Funciona

1. **Al iniciar**: La app intenta conectarse a Firebase
2. **Si Firebase está configurado**: 
   - Todas las operaciones se hacen en Firebase
   - Los listeners en tiempo real actualizan la UI automáticamente
3. **Si Firebase NO está configurado**:
   - La app usa localStorage como antes
   - No hay sincronización entre dispositivos

### 📊 Estructura de Datos en Firestore

```
firestore/
├── users/
│   └── {username}/
│       ├── id
│       ├── username
│       ├── pin
│       ├── role
│       └── createdAt
├── tasks/
│   └── {taskId}/
│       ├── id
│       ├── title
│       ├── description
│       ├── status
│       ├── priority
│       ├── type
│       ├── hours
│       ├── createdBy
│       ├── assignedTo
│       ├── comments[]
│       └── createdAt
└── columns/
    └── {columnId}/
        ├── id
        ├── title
        ├── color
        └── order
```

---

## 8. Troubleshooting

### Problema: "Firebase no configurado"

**Solución**:
1. Verifica que el archivo `.env` exista en la raíz del proyecto
2. Asegúrate de que las variables empiecen con `VITE_`
3. Reinicia el servidor de desarrollo: `npm run dev`

### Problema: "Permission denied" en Firestore

**Solución**:
1. Ve a Firestore Database → Reglas
2. Verifica que las reglas permitan acceso
3. Para desarrollo, usa: `allow read, write: if true;`

### Problema: Los datos no se sincronizan

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en la pestaña Console
3. Verifica que Firebase esté inicializado correctamente
4. Revisa la pestaña Network para ver si hay solicitudes a Firestore

### Problema: "apiKey is not defined"

**Solución**:
1. Verifica que `.env` tenga todas las variables
2. No uses comillas en los valores del `.env`
3. Reinicia el servidor después de modificar `.env`

### Problema: Datos duplicados

**Solución**:
1. La app usa el mismo ID en localStorage y Firebase
2. Si ves duplicados, limpia localStorage:
```javascript
localStorage.clear();
```
3. Recarga la aplicación

---

## 9. Despliegue en Producción

### Firebase Hosting (Recomendado)

1. Instala Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Inicia sesión:
```bash
firebase login
```

3. Inicializa Firebase en tu proyecto:
```bash
firebase init
```

4. Selecciona:
   - Hosting
   - Usa el proyecto que creaste
   - Public directory: `dist`
   - Single-page app: **Yes**

5. Build y deploy:
```bash
npm run build
firebase deploy
```

### Otras Opciones de Hosting

- **Vercel**: Conecta tu repo de GitHub y agrega las variables de entorno
- **Netlify**: Similar a Vercel
- **Render**: Soporte para variables de entorno

**⚠️ IMPORTANTE**: En producción, siempre configura las variables de entorno en la plataforma de hosting.

---

## 10. Seguridad en Producción

### Checklist de Seguridad

- [ ] Configurar reglas de Firestore restrictivas
- [ ] Implementar autenticación real (no solo PINs)
- [ ] Usar variables de entorno en producción
- [ ] Habilitar CORS solo para tu dominio
- [ ] Configurar límites de lectura/escritura
- [ ] Habilitar App Check para prevenir abuso
- [ ] Configurar backups automáticos

### Reglas de Firestore Recomendadas para Producción

Ver el archivo `database-schema.md` para reglas detalladas de seguridad.

---

## 11. Monitoreo y Analytics

### Firebase Performance Monitoring

1. En Firebase Console, ve a **"Performance"**
2. Habilita Performance Monitoring
3. Agrega el SDK a tu app

### Firebase Analytics

1. En Firebase Console, ve a **"Analytics"**
2. Habilita Google Analytics
3. Agrega el Measurement ID al `.env`:
```env
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 12. Recursos Adicionales

### Documentación Oficial
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

### Videos Tutoriales
- [Firebase en 100 segundos](https://www.youtube.com/watch?v=vAoB4VbhRzM)
- [Firestore Tutorial Completo](https://www.youtube.com/watch?v=35RlydUf6xo)

### Comunidad
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)
- [Firebase Community](https://firebase.google.com/community)

---

## 13. Soporte

Si tienes problemas con la configuración:

1. **Revisa la consola del navegador** para errores específicos
2. **Verifica las reglas de Firestore** en Firebase Console
3. **Consulta la documentación** de Firebase
4. **Contacta al equipo de desarrollo**: dev@jce.gob.do

---

## Resumen de Comandos Rápidos

```bash
# Instalar dependencias (ya hecho)
npm install firebase

# Crear archivo .env
touch .env

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Deploy a Firebase Hosting
firebase deploy
```

---

**¡Felicidades!** 🎉 Tu aplicación Kanban ahora está conectada a Firebase con sincronización en tiempo real.

**Última actualización**: Noviembre 2024
**Versión**: 1.0

