# 📈 Burndown Chart - Documentación

## 🎯 Descripción General

Se ha implementado un **Burndown Chart profesional** en el sidebar izquierdo del tablero Kanban que permite:
- **Visualizar el progreso del sprint** con dos líneas: ideal y real
- **Configurar fechas** de inicio y fin del sprint
- **Analizar el estado** del proyecto (adelantado, en tiempo, retrasado)
- **Seguimiento en tiempo real** del trabajo restante

---

## 📊 Características Principales

### ✨ Visualización Dual
- **Línea Ideal** (gris punteada): Muestra el descenso lineal esperado de horas
- **Línea Real** (azul sólida): Muestra el progreso real basado en tareas completadas

### ⚙️ Configuración Flexible
- **Fecha de Inicio**: Personalizable desde el panel de configuración
- **Fecha de Fin**: Define la duración del sprint (por defecto: 14 días)
- **Persistencia**: Las fechas se guardan en localStorage

### 📉 Métricas en Tiempo Real
- **Total de Horas**: Suma de todas las tareas estimadas
- **Horas Completadas**: Suma de tareas en estado "done"
- **Horas Restantes**: Diferencia entre total y completadas

### 🚦 Indicadores de Estado
- **🚀 Adelantado**: Progreso > esperado (+10%)
- **✅ En Tiempo**: Progreso alineado con lo esperado (±10%)
- **⚠️ Retrasado**: Progreso < esperado (-10%)

### 📱 Diseño Responsivo
- **Desktop**: Sidebar fijo de 320px a la izquierda
- **Tablet**: Sidebar arriba, altura máxima 400px
- **Mobile**: Sidebar compacto arriba, altura máxima 300px

---

## 🏗️ Arquitectura Técnica

### Archivos Creados

#### 1. `/src/components/BurndownChart.jsx`
Componente principal del gráfico

**Funcionalidades:**
- Calcula horas totales, completadas y restantes
- Genera datos para las líneas ideal y real
- Interpola progreso en días pasados
- Determina estado del sprint
- Renderiza gráfico con Recharts

**Hooks utilizados:**
- `useState`: Para fechas del sprint y estado del panel de configuración
- `useEffect`: Para persistir fechas en localStorage
- `useMemo`: Para cálculos optimizados de métricas y datos del gráfico
- `useKanban`: Para acceder a las tareas

**Estructura de datos del gráfico:**
```javascript
{
  date: "Nov 4",           // Fecha formateada
  ideal: 80.5,             // Horas ideales restantes
  real: 75.2,              // Horas reales restantes (null si es futuro)
  isToday: true            // Marcador de día actual
}
```

#### 2. `/src/components/BurndownChart.css`
Estilos completos del componente

**Características:**
- Variables CSS para consistencia
- Responsive design con media queries
- Dark mode support
- Animaciones suaves
- Custom tooltip styling

---

## 📐 Integración en el Sistema

### Modificaciones Realizadas

#### 1. `/src/components/KanbanBoard.jsx`
```javascript
// Import agregado
import BurndownChart from './BurndownChart';

// Estructura actualizada
<div className="kanban-container">
  {/* Sidebar Izquierdo */}
  <div className="kanban-sidebar">
    <BurndownChart />
  </div>

  {/* Área Principal del Kanban */}
  <DragDropContext onDragEnd={handleDragEnd}>
    <div className="kanban-board">
      {/* ... columnas ... */}
    </div>
  </DragDropContext>
</div>
```

#### 2. `/src/components/KanbanBoard.css`
```css
/* Nuevo layout con sidebar */
.kanban-container {
  display: flex;
  gap: 16px;
  overflow: hidden;
}

.kanban-sidebar {
  flex: 0 0 320px;
  overflow-y: auto;
  height: calc(100vh - 140px);
}

.kanban-board {
  flex: 1;
  overflow-x: auto;
}

/* Media queries para responsive */
@media (max-width: 1024px) {
  .kanban-container {
    flex-direction: column;
  }
  
  .kanban-sidebar {
    width: 100%;
    max-height: 400px;
  }
}
```

---

## 🎨 Elementos Visuales

### Panel de Estadísticas
```
┌─────────────────────────────────┐
│ Total      Completado  Restante │
│  120h         75h        45h    │
└─────────────────────────────────┘
```

### Indicador de Estado
```
┌──────────────────────────────────┐
│ ✅ En tiempo  |  7 días restantes │
└──────────────────────────────────┘
```

### Gráfico de Líneas
```
Horas
  ^
120|●
100|  ●
 80|    ●  ●
 60|        ●
 40|          ●
 20|            ●
  0|______________●
    Día 1 → Día 14
    
    ● ● ● Línea Real
    - - - Línea Ideal
```

### Barra de Progreso
```
┌──────────────────────────────────┐
│███████████░░░░░░░░░░░░░░░░░░░░░│
│ Progreso: 62% (75/120h)          │
└──────────────────────────────────┘
```

---

## 💡 Cómo Funciona

### Cálculo de la Línea Ideal

```javascript
const dailyIdealBurn = totalHours / (totalDays - 1);
const idealRemaining = totalHours - (dailyIdealBurn * dayNumber);
```

**Ejemplo:**
- Total: 120 horas
- Duración: 14 días
- Burn diario: 120 / 13 ≈ 9.23h/día
- Día 5: 120 - (9.23 × 5) ≈ 73.85h restantes

### Cálculo de la Línea Real

```javascript
// Para el día actual
realRemaining = totalHours - completedHours;

// Para días pasados (interpolación)
const progressRatio = day / daysElapsed;
const burnedSoFar = completedHours * progressRatio;
realRemaining = totalHours - burnedSoFar;
```

**Ejemplo:**
- Hoy es día 5
- Completadas: 50h
- Real hoy: 120 - 50 = 70h
- Real día 3: 120 - (50 × 3/5) = 90h

### Determinación del Estado

```javascript
const progress = (completedHours / totalHours) * 100;
const timeProgress = (daysElapsed / totalDays) * 100;

if (progress < timeProgress - 10) {
  status = 'behind';  // Retrasado
} else if (progress > timeProgress + 10) {
  status = 'ahead';   // Adelantado
} else {
  status = 'on-track'; // En tiempo
}
```

---

## 🎯 Uso del Sistema

### Para Usuarios

#### Ver el Burndown Chart
1. El chart aparece automáticamente en el sidebar izquierdo
2. Muestra el progreso en tiempo real
3. Se actualiza cuando cambias tareas a "done"

#### Configurar el Sprint
1. Click en el botón **⚙️** (engranaje) en el header
2. Selecciona **Inicio del Sprint**
3. Selecciona **Fin del Sprint**
4. Las fechas se guardan automáticamente

#### Interpretar el Gráfico
- **Línea gris punteada**: Descenso ideal esperado
- **Línea azul sólida**: Tu progreso real
- **Por encima de la ideal**: Vas adelantado 🚀
- **Sobre la ideal**: Vas perfecto ✅
- **Por debajo de la ideal**: Vas retrasado ⚠️

### Para Administradores

#### Monitorear el Equipo
- Revisa el indicador de estado (adelantado/en tiempo/retrasado)
- Verifica los días restantes del sprint
- Analiza la tendencia de la línea real vs ideal

#### Ajustar Planificación
- Si van retrasados: Considera reducir scope o agregar recursos
- Si van adelantados: Pueden agregar más tareas
- Al finalizar sprint: Configura nuevas fechas

---

## 🔧 Personalización

### Cambiar Colores

En `BurndownChart.css`:

```css
/* Línea ideal */
stroke="#94a3b8"  /* Cambiar color de línea ideal */

/* Línea real */
stroke="#6366f1"  /* Cambiar color de línea real */

/* Estados */
.status-indicator.ahead {
  background: #dcfce7; /* Verde para adelantado */
  color: #15803d;
}

.status-indicator.on-track {
  background: #dbeafe; /* Azul para en tiempo */
  color: #1e40af;
}

.status-indicator.behind {
  background: #fee2e2; /* Rojo para retrasado */
  color: #991b1b;
}
```

### Ajustar Tamaño

En `BurndownChart.jsx`:

```javascript
<ResponsiveContainer width="100%" height={200}>
  {/* Cambiar height={200} a tu preferencia */}
</ResponsiveContainer>
```

En `KanbanBoard.css`:

```css
.kanban-sidebar {
  flex: 0 0 320px; /* Cambiar ancho del sidebar */
}
```

### Cambiar Formato de Fechas

```javascript
const dateStr = currentDate.toLocaleDateString('es-ES', { 
  month: 'short',  // Cambiar a 'long', 'numeric', '2-digit'
  day: 'numeric'   // Cambiar a '2-digit'
});
```

---

## 📊 Dependencias

### Librería de Gráficos: Recharts

```bash
npm install recharts
```

**Componentes utilizados:**
- `LineChart`: Contenedor principal
- `Line`: Líneas del gráfico
- `XAxis`: Eje de fechas
- `YAxis`: Eje de horas
- `CartesianGrid`: Grilla de fondo
- `Tooltip`: Información al pasar el mouse
- `Legend`: Leyenda del gráfico
- `ResponsiveContainer`: Contenedor responsive

**Ventajas de Recharts:**
- 🎨 Altamente personalizable
- 📱 Totalmente responsive
- ⚡ Rendimiento optimizado
- 🎯 API simple y declarativa
- 📦 Peso ligero (~200KB)

---

## 🚀 Mejoras Futuras Sugeridas

### Funcionalidades Adicionales
- [ ] Historial de sprints anteriores
- [ ] Comparación entre sprints
- [ ] Exportar gráfico como imagen
- [ ] Predicción de finalización basada en velocidad
- [ ] Notificaciones cuando se desvía del plan
- [ ] Múltiples métricas (velocity, story points)
- [ ] Integración con calendario
- [ ] Comentarios y anotaciones en el gráfico

### Análisis Avanzado
- [ ] Gráfico de Velocity (velocidad del equipo)
- [ ] Cumulative Flow Diagram
- [ ] Lead Time y Cycle Time
- [ ] Burnup Chart (complementario)
- [ ] Filtros por tipo de tarea
- [ ] Filtros por usuario asignado

### Optimizaciones
- [ ] Caché de cálculos pesados
- [ ] Lazy loading del gráfico
- [ ] Virtual scrolling para sprints largos
- [ ] Service worker para datos offline

---

## 🐛 Solución de Problemas

### El gráfico no se muestra
1. Verificar que hay tareas con `estimatedHours` definidas
2. Verificar que las fechas de sprint sean válidas
3. Revisar la consola para errores de Recharts

### Las líneas no se actualizan
1. Verificar que las tareas estén en estado "done"
2. Recargar la página para forzar actualización
3. Revisar que `useKanban` esté devolviendo las tareas correctamente

### El estado muestra incorrecto
1. Verificar la configuración de fechas (inicio y fin)
2. Asegurarse de que la fecha actual esté dentro del sprint
3. Revisar que las horas estimadas sean correctas

### Problemas de responsive
1. Verificar que el viewport esté configurado en `index.html`
2. Limpiar caché del navegador
3. Revisar media queries en `KanbanBoard.css`

---

## 📝 Notas Técnicas

### Optimización con useMemo

Los cálculos pesados están memoizados:

```javascript
// Se recalcula solo cuando cambian las tareas
const totalHours = useMemo(() => {
  return tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0);
}, [tasks]);

// Se recalcula solo cuando cambian fechas o métricas
const chartData = useMemo(() => {
  // ... generación de datos ...
}, [sprintStart, sprintEnd, totalHours, completedHours, remainingHours]);
```

### Persistencia en localStorage

```javascript
// Guardar
localStorage.setItem('kanban_sprint_start', sprintStart);
localStorage.setItem('kanban_sprint_end', sprintEnd);

// Cargar
const saved = localStorage.getItem('kanban_sprint_start');
const defaultValue = new Date().toISOString().split('T')[0];
return saved || defaultValue;
```

### Interpolación de Datos Históricos

Para días pasados, se calcula una estimación del progreso:

```javascript
const progressRatio = day / daysElapsed;
const burnedSoFar = completedHours * progressRatio;
realRemaining = totalHours - burnedSoFar;
```

Esto asume un ritmo constante de trabajo, útil para visualización histórica.

---

## ✅ Checklist de Implementación

- [x] Instalar Recharts
- [x] Crear componente BurndownChart
- [x] Implementar cálculo de línea ideal
- [x] Implementar cálculo de línea real
- [x] Agregar configuración de fechas
- [x] Crear panel de estadísticas
- [x] Implementar indicador de estado
- [x] Agregar barra de progreso
- [x] Diseñar UI responsive
- [x] Integrar en KanbanBoard
- [x] Actualizar CSS del layout
- [x] Verificar linter (0 errores)
- [x] Documentar funcionalidades
- [x] Probar en diferentes resoluciones

---

## 🎊 Estado Final

**✅ BURNDOWN CHART COMPLETAMENTE FUNCIONAL**

El sistema de seguimiento de sprint está listo para producción con:
- 📊 Visualización profesional con Recharts
- ⚙️ Configuración flexible de fechas
- 🚦 Indicadores inteligentes de estado
- 📱 Diseño completamente responsive
- 💾 Persistencia de configuración
- ⚡ Rendimiento optimizado con memoización
- 🎨 UI moderna y limpia

---

**Implementado:** 4 de Noviembre, 2025  
**Versión:** 3.1.0 - Burndown Chart  
**Librería:** Recharts 2.x  
**Compatibilidad:** React 18+, todos los navegadores modernos

