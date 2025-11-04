import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { useFirebaseSync } from '../hooks/useFirebaseSync';

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

  // Callbacks memoizados para evitar reconexiones innecesarias
  const handleTasksUpdate = useCallback((updatedTasks) => {
    setTasks(updatedTasks);
  }, []);

  const handleColumnsUpdate = useCallback((updatedColumns) => {
    setColumns(updatedColumns);
  }, []);

  // Sincronización en tiempo real con Firebase
  useFirebaseSync(handleTasksUpdate, handleColumnsUpdate);

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const loadedTasks = await getTasks();
      const loadedColumns = await getColumns();
    setTasks(loadedTasks);
    setColumns(loadedColumns);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
    setLoading(false);
  };

  // ============= TAREAS =============
  const addTask = async (taskData) => {
    const newTask = await addTaskToStorage(taskData);
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = async (taskId, updates) => {
    const updatedTask = await updateTaskInStorage(taskId, updates);
    if (updatedTask) {
      // Recargar todas las tareas para asegurar sincronización
      const refreshedTasks = await getTasks();
      setTasks(refreshedTasks);
    }
    return updatedTask;
  };

  const deleteTask = async (taskId) => {
    await deleteTaskFromStorage(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const moveTask = async (taskId, newStatus) => {
    const updatedTask = await updateTaskInStorage(taskId, { status: newStatus });
    if (updatedTask) {
      // Recargar todas las tareas para reflejar el cambio inmediatamente
      const refreshedTasks = await getTasks();
      setTasks(refreshedTasks);
      return updatedTask;
    }
    return null;
  };

  // ============= COMENTARIOS =============
  const addComment = async (taskId, commentText) => {
    const comment = await addCommentToStorage(taskId, commentText);
    if (comment) {
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    }
    return comment;
  };

  const deleteComment = async (taskId, commentId) => {
    const success = await deleteCommentFromStorage(taskId, commentId);
    if (success) {
      const updatedTasks = await getTasks();
      setTasks(updatedTasks);
    }
    return success;
  };

  // ============= COLUMNAS =============
  const addColumn = async (columnData) => {
    const newColumn = await addColumnToStorage(columnData);
    setColumns([...columns, newColumn]);
    return newColumn;
  };

  const updateColumn = async (columnId, updates) => {
    const updatedColumn = await updateColumnInStorage(columnId, updates);
    if (updatedColumn) {
      setColumns(columns.map(c => c.id === columnId ? updatedColumn : c));
    }
    return updatedColumn;
  };

  const deleteColumn = async (columnId) => {
    await deleteColumnFromStorage(columnId);
    setColumns(columns.filter(c => c.id !== columnId));
    // Recargar tareas ya que algunas pueden haber sido movidas
    const updatedTasks = await getTasks();
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

