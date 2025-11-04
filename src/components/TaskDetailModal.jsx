import { useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { useAuth } from '../context/AuthContext';
import { X, Clock, User, Calendar, MessageCircle, Trash2, UserCheck } from 'lucide-react';
import './Modal.css';
import './TaskDetailModal.css';

const TaskDetailModal = ({ task: initialTask, onClose }) => {
  const { tasks, updateTask, deleteTask, addComment, deleteComment } = useKanban();
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  
  // Obtener la tarea actualizada del contexto
  const task = tasks.find(t => t.id === initialTask.id) || initialTask;

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(task.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('¿Eliminar este comentario?')) {
      deleteComment(task.id, commentId);
    }
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      deleteTask(task.id);
      onClose();
    }
  };

  const getPriorityText = (priority) => {
    const priorities = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return priorities[priority] || priority;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Detalles de la Tarea</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="task-detail-header">
            <h3 className="task-detail-title">{task.title}</h3>
            <div className="task-detail-badges">
              {task.type && (() => {
                const typeLabels = {
                  'general': 'General',
                  'programacion': 'Programación',
                  'investigacion': 'Investigación',
                  'diseno': 'Diseño',
                  'testing': 'Testing',
                  'documentacion': 'Documentación',
                  'reunion': 'Reunión',
                  'bug': 'Bug'
                };
                const typeColors = {
                  'general': '#6b7280',
                  'programacion': '#10b981',
                  'investigacion': '#3b82f6',
                  'diseno': '#f59e0b',
                  'testing': '#ec4899',
                  'documentacion': '#8b5cf6',
                  'reunion': '#06b6d4',
                  'bug': '#ef4444'
                };
                return (
                  <span 
                    className="task-type-badge-detail" 
                    style={{ backgroundColor: typeColors[task.type] }}
                  >
                    {typeLabels[task.type]}
                  </span>
                );
              })()}
              <span className={`task-priority-badge ${task.priority}`}>
                {getPriorityText(task.priority)}
              </span>
            </div>
          </div>

          {task.description && (
            <div className="task-detail-section">
              <h4 className="task-detail-section-title">Descripción</h4>
              <p className="task-detail-description">{task.description}</p>
            </div>
          )}

          <div className="task-detail-meta">
            <div className="task-detail-meta-item">
              <span className="meta-icon">
                <Clock size={16} />
              </span>
              <div>
                <div className="meta-label">Horas estimadas</div>
                <div className="meta-value">{task.hours}h</div>
              </div>
            </div>

            <div className="task-detail-meta-item">
              <span className="meta-icon">
                <User size={16} />
              </span>
              <div>
                <div className="meta-label">Creado por</div>
                <div className="meta-value">{task.createdBy || 'Desconocido'}</div>
              </div>
            </div>

            <div className="task-detail-meta-item">
              <span className="meta-icon">
                <Calendar size={16} />
              </span>
              <div>
                <div className="meta-label">Fecha de creación</div>
                <div className="meta-value">{formatDate(task.createdAt)}</div>
              </div>
            </div>

            {task.assignedTo && (
              <div className="task-detail-meta-item">
                <span className="meta-icon">
                  <UserCheck size={16} />
                </span>
                <div>
                  <div className="meta-label">Asignado a</div>
                  <div className="meta-value">{task.assignedTo}</div>
                </div>
              </div>
            )}
          </div>

          <div className="task-detail-section">
            <h4 className="task-detail-section-title">
              <MessageCircle size={18} style={{ display: 'inline', marginRight: '8px' }} />
              Comentarios ({task.comments?.length || 0})
            </h4>
            
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                className="comment-input"
                placeholder="Escribe un comentario..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows="3"
              />
              <button type="submit" className="btn btn-primary" disabled={!commentText.trim()}>
                Agregar Comentario
              </button>
            </form>

            <div className="comments-list">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar">
                          {comment.author?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="comment-author-name">{comment.author}</div>
                          <div className="comment-date">{formatDate(comment.createdAt)}</div>
                        </div>
                      </div>
                      {comment.author === currentUser.username && (
                        <button
                          className="comment-delete"
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Eliminar comentario"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="empty-comments">
                  <MessageCircle size={48} className="empty-icon" />
                  <p>No hay comentarios aún</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} />
            Eliminar Tarea
          </button>
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

