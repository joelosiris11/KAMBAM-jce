import { useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { useAuth } from '../context/AuthContext';
import './Modal.css';

const TaskModal = ({ onClose, editTask = null }) => {
  const { addTask, updateTask, columns } = useKanban();
  const { currentUser, users } = useAuth();
  
  const [formData, setFormData] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    priority: editTask?.priority || 'medium',
    hours: editTask?.hours || 1,
    status: editTask?.status || columns[0]?.id || 'todo',
    type: editTask?.type || 'general',
    assignedTo: editTask?.assignedTo || null
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (editTask) {
      updateTask(editTask.id, formData);
    } else {
      addTask({
        ...formData,
        createdBy: currentUser.username,
        createdAt: new Date().toISOString()
      });
    }
    
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'hours' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editTask ? '✏️ Editar Tarea' : '➕ Nueva Tarea'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Título *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ej: Diseñar nueva landing page"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe los detalles de la tarea..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">
                Tipo de Tarea
              </label>
              <select
                id="type"
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="programacion">Programación</option>
                <option value="investigacion">Investigación</option>
                <option value="diseno">Diseño</option>
                <option value="testing">Testing</option>
                <option value="documentacion">Documentación</option>
                <option value="reunion">Reunión</option>
                <option value="bug">Bug Fix</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Estado
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                {columns.map(column => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                className="form-select"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hours" className="form-label">
                Horas estimadas
              </label>
              <input
                id="hours"
                name="hours"
                type="number"
                min="0.5"
                step="0.5"
                className="form-input"
                value={formData.hours}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo" className="form-label">
                Asignar a
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                className="form-select"
                value={formData.assignedTo || ''}
                onChange={handleChange}
              >
                <option value="">Sin asignar</option>
                {users.map(user => (
                  <option key={user.id} value={user.username}>
                    {user.username} {user.role ? `(${user.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editTask ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

