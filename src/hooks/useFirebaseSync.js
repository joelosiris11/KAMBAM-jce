// Hook para sincronización en tiempo real con Firebase
import { useEffect, useRef } from 'react';
import { firebaseTasks, firebaseColumns, isFirebaseAvailable } from '../services/firebaseService';

/**
 * Hook personalizado para sincronizar datos en tiempo real con Firebase
 * Escucha cambios en las colecciones y actualiza el estado automáticamente
 * 
 * @param {Function} onTasksUpdate - Callback cuando las tareas cambien
 * @param {Function} onColumnsUpdate - Callback cuando las columnas cambien
 * @returns {Object} Estado de conexión y funciones de control
 */
export const useFirebaseSync = (onTasksUpdate, onColumnsUpdate) => {
  const unsubscribeTasksRef = useRef(null);
  const unsubscribeColumnsRef = useRef(null);
  const isActive = useRef(false);

  useEffect(() => {
    // Solo activar si Firebase está configurado
    if (!isFirebaseAvailable()) {
      console.log('📴 Firebase no configurado - sincronización deshabilitada');
      return;
    }

    console.log('🔄 Iniciando sincronización en tiempo real con Firebase...');
    isActive.current = true;

    // Suscribirse a cambios en tareas
    if (onTasksUpdate) {
      try {
        unsubscribeTasksRef.current = firebaseTasks.onSnapshot((tasks) => {
          if (isActive.current) {
            console.log('📥 Tareas actualizadas desde Firebase:', tasks.length);
            onTasksUpdate(tasks);
          }
        });
      } catch (error) {
        console.error('Error al suscribirse a tareas:', error);
      }
    }

    // Suscribirse a cambios en columnas
    if (onColumnsUpdate) {
      try {
        unsubscribeColumnsRef.current = firebaseColumns.onSnapshot((columns) => {
          if (isActive.current) {
            console.log('📥 Columnas actualizadas desde Firebase:', columns.length);
            onColumnsUpdate(columns);
          }
        });
      } catch (error) {
        console.error('Error al suscribirse a columnas:', error);
      }
    }

    // Cleanup al desmontar
    return () => {
      console.log('🔌 Desconectando sincronización de Firebase...');
      isActive.current = false;
      
      if (unsubscribeTasksRef.current) {
        unsubscribeTasksRef.current();
        unsubscribeTasksRef.current = null;
      }
      
      if (unsubscribeColumnsRef.current) {
        unsubscribeColumnsRef.current();
        unsubscribeColumnsRef.current = null;
      }
    };
  }, [onTasksUpdate, onColumnsUpdate]);

  return {
    isFirebaseActive: isFirebaseAvailable(),
    isListening: isActive.current
  };
};

/**
 * Hook simplificado para componentes que solo necesitan saber si Firebase está activo
 */
export const useFirebaseStatus = () => {
  return {
    isConnected: isFirebaseAvailable(),
    mode: isFirebaseAvailable() ? 'firebase' : 'localStorage'
  };
};

