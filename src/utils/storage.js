// Funciones de utilidad para manejar localStorage o Firebase
import { 
  firebaseTasks, 
  firebaseColumns, 
  firebaseComments,
  isFirebaseAvailable 
} from '../services/firebaseService';

// ============= TAREAS =============
export const getTasks = async () => {
  if (isFirebaseAvailable()) {
    try {
      return await firebaseTasks.getAll();
    } catch (error) {
      console.error('Error al obtener tareas de Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = localStorage.getItem('kanban_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

export const saveTasks = async (tasks) => {
  if (isFirebaseAvailable()) {
    // Con Firebase, no necesitamos esta función
    // Las tareas se guardan individualmente
    return;
  }
  localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
};

export const addTask = async (taskData) => {
  const newTask = {
    id: Date.now(),
    ...taskData,
    comments: [],
    createdAt: taskData.createdAt || new Date().toISOString()
  };
  
  if (isFirebaseAvailable()) {
    try {
      return await firebaseTasks.create(newTask);
    } catch (error) {
      console.error('Error al crear tarea en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = await getTasks();
  tasks.push(newTask);
  await saveTasks(tasks);
  return newTask;
};

export const updateTask = async (taskId, updates) => {
  if (isFirebaseAvailable()) {
    try {
      return await firebaseTasks.update(taskId, updates);
    } catch (error) {
      console.error('Error al actualizar tarea en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = await getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  await saveTasks(tasks);
  return tasks[taskIndex];
};

export const deleteTask = async (taskId) => {
  if (isFirebaseAvailable()) {
    try {
      return await firebaseTasks.delete(taskId);
    } catch (error) {
      console.error('Error al eliminar tarea en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = await getTasks();
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  await saveTasks(filteredTasks);
  return true;
};

// ============= COMENTARIOS =============
export const addComment = async (taskId, commentText) => {
  const activeSession = localStorage.getItem('kanban_active_session');
  const currentUser = activeSession ? JSON.parse(activeSession) : null;
  
  const newComment = {
    id: Date.now(),
    text: commentText,
    author: currentUser?.username || 'Anónimo',
    createdAt: new Date().toISOString()
  };
  
  if (isFirebaseAvailable()) {
    try {
      return await firebaseComments.add(taskId, newComment);
    } catch (error) {
      console.error('Error al agregar comentario en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return null;
  
  task.comments = task.comments || [];
  task.comments.push(newComment);
  await saveTasks(tasks);
  
  return newComment;
};

export const deleteComment = async (taskId, commentId) => {
  if (isFirebaseAvailable()) {
    try {
      return await firebaseComments.delete(taskId, commentId);
    } catch (error) {
      console.error('Error al eliminar comentario en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const tasks = await getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || !task.comments) return false;
  
  task.comments = task.comments.filter(c => c.id !== commentId);
  await saveTasks(tasks);
  
  return true;
};

// ============= COLUMNAS =============
const DEFAULT_COLUMNS = [
  { id: 'backlog', title: 'Backlog', color: '#94a3b8', order: 0 },
  { id: 'todo', title: 'Por Hacer', color: '#6366f1', order: 1 },
  { id: 'in-progress', title: 'En Proceso', color: '#f59e0b', order: 2 },
  { id: 'review', title: 'En Revisión', color: '#8b5cf6', order: 3 },
  { id: 'completed', title: 'Completado', color: '#10b981', order: 4 }
];

export const getColumns = async () => {
  if (isFirebaseAvailable()) {
    try {
      const columns = await firebaseColumns.getAll();
      if (columns.length === 0) {
        // Inicializar columnas por defecto en Firebase
        for (const column of DEFAULT_COLUMNS) {
          await firebaseColumns.create(column);
        }
        return DEFAULT_COLUMNS;
      }
      return columns;
    } catch (error) {
      console.error('Error al obtener columnas de Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const columns = localStorage.getItem('kanban_columns');
  if (!columns) {
    await saveColumns(DEFAULT_COLUMNS);
    return DEFAULT_COLUMNS;
  }
  return JSON.parse(columns);
};

export const saveColumns = async (columns) => {
  if (isFirebaseAvailable()) {
    // Con Firebase, no necesitamos esta función
    // Las columnas se guardan individualmente
    return;
  }
  localStorage.setItem('kanban_columns', JSON.stringify(columns));
};

export const addColumn = async (columnData) => {
  if (isFirebaseAvailable()) {
    try {
      const columns = await firebaseColumns.getAll();
      const newColumn = {
        ...columnData,
        order: columnData.order ?? columns.length
      };
      return await firebaseColumns.create(newColumn);
    } catch (error) {
      console.error('Error al crear columna en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const columns = await getColumns();
  const newColumn = {
    ...columnData,
    order: columnData.order ?? columns.length
  };
  columns.push(newColumn);
  await saveColumns(columns);
  return newColumn;
};

export const updateColumn = async (columnId, updates) => {
  if (isFirebaseAvailable()) {
    try {
      return await firebaseColumns.update(columnId, updates);
    } catch (error) {
      console.error('Error al actualizar columna en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const columns = await getColumns();
  const columnIndex = columns.findIndex(c => c.id === columnId);
  
  if (columnIndex === -1) return null;
  
  columns[columnIndex] = { ...columns[columnIndex], ...updates };
  await saveColumns(columns);
  return columns[columnIndex];
};

export const deleteColumn = async (columnId) => {
  if (isFirebaseAvailable()) {
    try {
      await firebaseColumns.delete(columnId);
      
      // Mover todas las tareas de la columna eliminada a la primera columna
      const tasks = await firebaseTasks.getAll();
      const columns = await firebaseColumns.getAll();
      const firstColumnId = columns[0]?.id;
      
      if (firstColumnId) {
        const tasksToUpdate = tasks.filter(task => task.status === columnId);
        for (const task of tasksToUpdate) {
          await firebaseTasks.update(task.id, { status: firstColumnId });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error al eliminar columna en Firebase:', error);
      // Fallback a localStorage
    }
  }
  
  const columns = await getColumns();
  const filteredColumns = columns.filter(c => c.id !== columnId);
  await saveColumns(filteredColumns);
  
  // Mover todas las tareas de la columna eliminada a la primera columna
  const tasks = await getTasks();
  const firstColumnId = filteredColumns[0]?.id;
  
  if (firstColumnId) {
    const updatedTasks = tasks.map(task => 
      task.status === columnId ? { ...task, status: firstColumnId } : task
    );
    await saveTasks(updatedTasks);
  }
  
  return true;
};

