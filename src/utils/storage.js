// Funciones de utilidad para manejar localStorage

// ============= TAREAS =============
export const getTasks = () => {
  const tasks = localStorage.getItem('kanban_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

export const saveTasks = (tasks) => {
  localStorage.setItem('kanban_tasks', JSON.stringify(tasks));
};

export const addTask = (taskData) => {
  const tasks = getTasks();
  const newTask = {
    id: Date.now(),
    ...taskData,
    comments: [],
    createdAt: taskData.createdAt || new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
};

export const updateTask = (taskId, updates) => {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) return null;
  
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  saveTasks(tasks);
  return tasks[taskIndex];
};

export const deleteTask = (taskId) => {
  const tasks = getTasks();
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  saveTasks(filteredTasks);
  return true;
};

// ============= COMENTARIOS =============
export const addComment = (taskId, commentText) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return null;
  
  const activeSession = localStorage.getItem('kanban_active_session');
  const currentUser = activeSession ? JSON.parse(activeSession) : null;
  
  const newComment = {
    id: Date.now(),
    text: commentText,
    author: currentUser?.username || 'Anónimo',
    createdAt: new Date().toISOString()
  };
  
  task.comments = task.comments || [];
  task.comments.push(newComment);
  saveTasks(tasks);
  
  return newComment;
};

export const deleteComment = (taskId, commentId) => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task || !task.comments) return false;
  
  task.comments = task.comments.filter(c => c.id !== commentId);
  saveTasks(tasks);
  
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

export const getColumns = () => {
  const columns = localStorage.getItem('kanban_columns');
  if (!columns) {
    saveColumns(DEFAULT_COLUMNS);
    return DEFAULT_COLUMNS;
  }
  return JSON.parse(columns);
};

export const saveColumns = (columns) => {
  localStorage.setItem('kanban_columns', JSON.stringify(columns));
};

export const addColumn = (columnData) => {
  const columns = getColumns();
  const newColumn = {
    ...columnData,
    order: columnData.order ?? columns.length
  };
  columns.push(newColumn);
  saveColumns(columns);
  return newColumn;
};

export const updateColumn = (columnId, updates) => {
  const columns = getColumns();
  const columnIndex = columns.findIndex(c => c.id === columnId);
  
  if (columnIndex === -1) return null;
  
  columns[columnIndex] = { ...columns[columnIndex], ...updates };
  saveColumns(columns);
  return columns[columnIndex];
};

export const deleteColumn = (columnId) => {
  const columns = getColumns();
  const filteredColumns = columns.filter(c => c.id !== columnId);
  saveColumns(filteredColumns);
  
  // Mover todas las tareas de la columna eliminada a la primera columna
  const tasks = getTasks();
  const firstColumnId = filteredColumns[0]?.id;
  
  if (firstColumnId) {
    const updatedTasks = tasks.map(task => 
      task.status === columnId ? { ...task, status: firstColumnId } : task
    );
    saveTasks(updatedTasks);
  }
  
  return true;
};

