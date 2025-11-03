import { createContext, useContext, useState, useEffect } from 'react';
import {
  getTasks,
  saveTasks,
  addTask as addTaskToStorage,
  updateTask as updateTaskInStorage,
  deleteTask as deleteTaskFromStorage,
  addComment as addCommentToStorage,
  deleteComment as deleteCommentFromStorage,
  getColumns,
  saveColumns,
  addColumn as addColumnToStorage,
  updateColumn as updateColumnInStorage,
  deleteColumn as deleteColumnFromStorage
} from '../utils/storage';

const KanbanContext = createContext(null);

export const useKanban = () => {
  const context = useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanban debe ser usado dentro de un KanbanProvider');
  }
  return context;
};

export const KanbanProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const loadedTasks = getTasks();
    const loadedColumns = getColumns();
    setTasks(loadedTasks);
    setColumns(loadedColumns);
    setLoading(false);
  };

  // ============= TAREAS =============
  const addTask = (taskData) => {
    const newTask = addTaskToStorage(taskData);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (taskId, updates) => {
    const updatedTask = updateTaskInStorage(taskId, updates);
    if (updatedTask) {
      // Recargar todas las tareas para asegurar sincronización
      const refreshedTasks = getTasks();
      setTasks(refreshedTasks);
    }
    return updatedTask;
  };

  const deleteTask = (taskId) => {
    deleteTaskFromStorage(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId, newStatus) => {
    const updatedTask = updateTaskInStorage(taskId, { status: newStatus });
    if (updatedTask) {
      // Recargar todas las tareas para reflejar el cambio inmediatamente
      const refreshedTasks = getTasks();
      setTasks(refreshedTasks);
      return updatedTask;
    }
    return null;
  };

  // ============= COMENTARIOS =============
  const addComment = (taskId, commentText) => {
    const comment = addCommentToStorage(taskId, commentText);
    if (comment) {
      const updatedTasks = getTasks();
      setTasks(updatedTasks);
    }
    return comment;
  };

  const deleteComment = (taskId, commentId) => {
    const success = deleteCommentFromStorage(taskId, commentId);
    if (success) {
      const updatedTasks = getTasks();
      setTasks(updatedTasks);
    }
    return success;
  };

  // ============= COLUMNAS =============
  const addColumn = (columnData) => {
    const newColumn = addColumnToStorage(columnData);
    setColumns([...columns, newColumn]);
    return newColumn;
  };

  const updateColumn = (columnId, updates) => {
    const updatedColumn = updateColumnInStorage(columnId, updates);
    if (updatedColumn) {
      setColumns(columns.map(c => c.id === columnId ? updatedColumn : c));
    }
    return updatedColumn;
  };

  const deleteColumn = (columnId) => {
    deleteColumnFromStorage(columnId);
    setColumns(columns.filter(c => c.id !== columnId));
    // Recargar tareas ya que algunas pueden haber sido movidas
    const updatedTasks = getTasks();
    setTasks(updatedTasks);
  };

  // ============= ESTADÍSTICAS =============
  const getStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const totalHours = tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
    const remainingHours = tasks
      .filter(t => t.status !== 'completed')
      .reduce((sum, task) => sum + (task.hours || 0), 0);
    const progressPercent = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalHours,
      remainingHours,
      progressPercent
    };
  };

  const getTasksByColumn = (columnId) => {
    return tasks.filter(task => task.status === columnId);
  };

  const value = {
    tasks,
    columns,
    loading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    deleteComment,
    addColumn,
    updateColumn,
    deleteColumn,
    getStats,
    getTasksByColumn,
    refreshData: loadData
  };

  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

