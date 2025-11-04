# 🎭 Sistema Dinámico de Roles con Firebase

## 📋 Descripción General

El sistema de roles ahora es **completamente dinámico** y se sincroniza con Firebase Firestore, permitiendo crear, editar, desactivar y eliminar roles en tiempo real desde la interfaz de administración.

## 🚀 Características Principales

### ✨ Gestión Dinámica de Roles
- **Crear roles personalizados** con nombre, icono, descripción, categoría y color
- **Editar roles existentes** (excepto el rol de Admin)
- **Activar/Desactivar roles** sin eliminarlos de la base de datos
- **Eliminar roles** que ya no sean necesarios
- **Sincronización en tiempo real** - Los cambios se reflejan instantáneamente en todos los clientes conectados

### 🔐 Seguridad y Permisos
- Solo **Administradores** y **Project Managers** pueden gestionar roles
- El rol **Admin** está protegido y no se puede eliminar
- Los roles se cargan de Firebase con fallback a roles locales si no está configurado

### 🎨 Interfaz de Usuario
- Panel de administración de roles accesible desde Configuración
- Filtrado por categorías en la selección de roles
- Indicadores visuales para roles activos/inactivos
- Diseño responsivo y moderno

## 📁 Estructura de Archivos

```
src/
├── services/
│   └── rolesService.js         # Servicio de Firebase para roles
├── components/
│   ├── RolesManager.jsx        # Componente de gestión de roles
│   ├── RolesManager.css        # Estilos del gestor de roles
│   ├── RoleSelection.jsx       # Selección de rol (ahora dinámico)
│   └── SettingsPanel.jsx       # Panel con acceso a gestión de roles
├── utils/
│   └── roles.js                # Definiciones de roles por defecto (fallback)
└── scripts/
    └── init-roles.js           # Script para inicializar roles en Firebase
```

## 🔧 Configuración Inicial

### 1. Inicializar Roles en Firebase

Ejecuta el siguiente comando para poblar Firebase con los roles por defecto:

```bash
npm run firebase:init-roles
```

Este comando creará 16 roles organizados en las siguientes categorías:
- **Gestión**: Admin, Project Manager
- **Análisis**: Analista de Negocios, Investigador de Procesos, Analista de Datos
- **Diseño**: Investigador UX, Diseñador de Servicio, Diseñador UI/UX
- **Desarrollo**: Desarrollador
- **Legal y Financiero**: Especialista en Cumplimiento, Asesor Legal, Asesor Financiero
- **Calidad**: Tester/Evaluador Funcional, QA
- **Soporte**: Especialista en Documentación, Comunicación Interna

### 2. Estructura de Datos en Firestore

Colección: `roles`

```javascript
{
  id: "developer",                    // ID único (usado como document ID)
  name: "Desarrollador",              // Nombre visible
  icon: "💻",                         // Emoji del rol
  description: "Diseña, codifica...", // Descripción del rol
  category: "Desarrollo",             // Categoría del rol
  color: "#16a34a",                   // Color personalizado (opcional)
  isActive: true,                     // Estado del rol
  createdAt: "2025-11-04T...",       // Fecha de creación
  updatedAt: "2025-11-04T..."        // Última actualización (opcional)
}
```

## 📚 Uso del Sistema

### Para Usuarios Normales

1. Al iniciar sesión por primera vez, se muestra la pantalla de selección de roles
2. Los roles se cargan dinámicamente desde Firebase
3. Se pueden filtrar roles por categoría
4. Solo aparecen roles activos (excepto Admin, que nunca aparece para autoasignación)

### Para Administradores

#### Acceder a la Gestión de Roles:
1. Abrir el panel de **⚙️ Configuración**
2. Ir a la sección **🎭 Gestión de Roles**
3. Click en **Administrar Roles**

#### Crear un Nuevo Rol:
1. Click en **➕ Crear Rol Nuevo**
2. Completar el formulario:
   - **ID**: Identificador único (se genera automáticamente en minúsculas)
   - **Nombre**: Nombre visible del rol
   - **Icono**: Emoji representativo
   - **Descripción**: Breve explicación del rol
   - **Categoría**: Seleccionar de la lista
   - **Color**: Color personalizado (opcional)
   - **Estado**: Activo/Inactivo
3. Click en **💾 Guardar**

#### Editar un Rol:
1. Click en el botón **✏️** del rol a editar
2. Modificar los campos necesarios (el ID no se puede cambiar)
3. Click en **💾 Guardar Cambios**

#### Desactivar/Activar un Rol:
1. Click en el botón **🔓** (activo) o **🔒** (inactivo)
2. El rol se oculta/muestra automáticamente en la selección de roles

#### Eliminar un Rol:
1. Click en el botón **🗑️** del rol a eliminar
2. Confirmar la acción
3. ⚠️ **Advertencia**: Los usuarios con ese rol pueden tener problemas

## 🔌 API del Servicio de Roles

### firebaseRoles

```javascript
import { firebaseRoles, isRolesServiceAvailable } from '../services/rolesService';

// Verificar si Firebase está disponible
if (isRolesServiceAvailable()) {
  // Obtener todos los roles
  const allRoles = await firebaseRoles.getAll();
  
  // Obtener solo roles activos
  const activeRoles = await firebaseRoles.getActive();
  
  // Obtener roles públicos (sin admin) y activos
  const publicRoles = await firebaseRoles.getPublic();
  
  // Obtener rol por ID
  const role = await firebaseRoles.getById('developer');
  
  // Crear nuevo rol
  const newRole = await firebaseRoles.create({
    id: 'custom-role',
    name: 'Rol Personalizado',
    icon: '🎯',
    description: 'Descripción...',
    category: 'Categoría',
    isActive: true
  });
  
  // Actualizar rol
  await firebaseRoles.update('developer', {
    description: 'Nueva descripción'
  });
  
  // Activar/Desactivar rol
  await firebaseRoles.toggleActive('developer', false);
  
  // Eliminar rol
  await firebaseRoles.delete('custom-role');
  
  // Escuchar cambios en tiempo real
  const unsubscribe = firebaseRoles.onSnapshot((roles) => {
    console.log('Roles actualizados:', roles);
  });
  
  // Limpiar listener
  unsubscribe();
}
```

## 🎯 Beneficios del Sistema Dinámico

1. **Flexibilidad Total**: Agregar nuevos roles sin modificar código
2. **Escalabilidad**: Soporta cualquier cantidad de roles
3. **Tiempo Real**: Cambios instantáneos en todos los clientes
4. **Sin Código Duro**: Los roles no están hardcodeados en la aplicación
5. **Gestión Centralizada**: Un solo lugar para administrar todos los roles
6. **Fallback Seguro**: Si Firebase falla, usa roles locales predefinidos
7. **Auditoría**: Timestamps de creación y actualización
8. **Fácil Migración**: Script para inicializar roles por defecto

## 🔄 Migración desde Roles Estáticos

Si tienes roles definidos en `src/utils/roles.js`, el sistema funciona de la siguiente manera:

1. **Prioridad**: Firebase > Roles locales
2. **Carga Inicial**: Intenta cargar desde Firebase
3. **Fallback**: Si Firebase no está disponible o no hay roles, usa `ROLES` de `roles.js`
4. **Script de Migración**: `npm run firebase:init-roles` migra roles locales a Firebase

## ⚠️ Consideraciones Importantes

### Eliminar Roles
- Al eliminar un rol, los usuarios que lo tienen asignado **mantendrán** ese rol
- Considera **desactivar** en lugar de eliminar si hay usuarios asignados
- El sistema mostrará el ID del rol si no encuentra la definición

### Rol de Administrador
- El rol `admin` está protegido y no se puede eliminar
- Solo se puede asignar desde el panel de administración
- No aparece en la selección de roles para nuevos usuarios

### Rendimiento
- Los listeners en tiempo real consumen recursos de Firebase
- Considera desactivar roles no utilizados en lugar de eliminarlos
- Los roles se cachean en el cliente para reducir lecturas

## 🚦 Reglas de Seguridad de Firebase

Asegúrate de configurar las siguientes reglas en Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Roles: lectura pública, escritura solo administradores
    match /roles/{roleId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'project-manager'];
    }
  }
}
```

## 📝 Próximas Mejoras Sugeridas

- [ ] Permisos específicos por rol (RBAC completo)
- [ ] Historial de cambios de roles
- [ ] Roles jerárquicos (herencia de permisos)
- [ ] Exportar/Importar configuración de roles
- [ ] Asignación masiva de roles a usuarios
- [ ] Estadísticas de uso de roles
- [ ] Validación de roles antes de eliminar (verificar usuarios asignados)

## 🐛 Solución de Problemas

### Los roles no se cargan
1. Verificar que Firebase esté correctamente configurado en `.env`
2. Ejecutar `npm run firebase:init-roles` para inicializar
3. Revisar la consola del navegador para errores de Firestore

### Los cambios no se reflejan en tiempo real
1. Verificar que el listener de `onSnapshot` esté activo
2. Comprobar la conexión a Firebase en la consola
3. Revisar las reglas de seguridad de Firestore

### Error al crear roles
1. Verificar que el ID del rol sea único
2. Comprobar que todos los campos obligatorios estén completos
3. Revisar permisos de escritura en Firestore

---

**Documentación actualizada:** 4 de Noviembre, 2025  
**Versión del Sistema:** 3.0.0  
**Compatibilidad:** React 18+, Firebase 12+

