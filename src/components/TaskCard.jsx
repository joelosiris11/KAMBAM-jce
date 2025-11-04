import { Draggable } from '@hello-pangea/dnd';
import { Clock, Calendar, MessageCircle, X, Code, FlaskConical, Palette, TestTube, Book, Users, Bug, Circle, UserCheck } from 'lucide-react';
import './TaskCard.css';

const TaskCard = ({ task, index, onClick, onDelete }) => {
  const date = new Date(task.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const commentCount = task.comments ? task.comments.length : 0;

  const getPriorityText = (priority) => {
    const priorities = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };
    return priorities[priority] || priority;
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'general': Circle,
      'programacion': Code,
      'investigacion': FlaskConical,
      'diseno': Palette,
      'testing': TestTube,
      'documentacion': Book,
      'reunion': Users,
      'bug': Bug
    };
    return iconMap[type] || Circle;
  };

  const handleCardClick = (e) => {
    // No abrir modal si se hace click en botones o se está arrastrando
    if (e.target.closest('button') || e.defaultPrevented) {
      return;
    }
    onClick();
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onDelete(task.id);
  };

  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          data-priority={task.priority}
          style={provided.draggableProps.style}
        >
          <div className="task-card-header" onClick={handleCardClick}>
            <h4 className="task-card-title">{task.title}</h4>
            <div className="task-badges">
              {task.type && (() => {
                const TypeIcon = getTypeIcon(task.type);
                const typeLabels = {
                  'general': 'General',
                  'programacion': 'Código',
                  'investigacion': 'Investigación',
                  'diseno': 'Diseño',
                  'testing': 'Testing',
                  'documentacion': 'Docs',
                  'reunion': 'Reunión',
                  'bug': 'Bug'
                };
                return (
                  <span className="task-type-badge" title={typeLabels[task.type]}>
                    <TypeIcon size={13} />
                    <span className="task-type-text">{typeLabels[task.type]}</span>
                  </span>
                );
              })()}
              <span className={`task-priority-badge ${task.priority}`}>
                {getPriorityText(task.priority)}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="task-card-description" onClick={handleCardClick}>{task.description}</p>
          )}

          <div className="task-card-users" onClick={handleCardClick}>
            {task.createdBy && (
              <div className="task-creator">
                <div className="task-creator-avatar">
                  {task.createdBy.charAt(0).toUpperCase()}
                </div>
                <span className="task-user-label">Creado: {task.createdBy}</span>
              </div>
            )}
            
            {task.assignedTo && (
              <div className="task-assigned">
                <div className="task-assigned-icon">
                  <UserCheck size={12} />
                </div>
                <span className="task-user-label">Asignado: {task.assignedTo}</span>
              </div>
            )}
          </div>

          <div className="task-card-footer" onClick={handleCardClick}>
            <div className="task-card-meta">
              <div className="task-card-meta-item">
                <Clock size={12} />
                <span>{task.hours}h</span>
              </div>
              <div className="task-card-meta-item">
                <Calendar size={12} />
                <span>{date}</span>
              </div>
              {commentCount > 0 && (
                <div className="task-comments-badge">
                  <MessageCircle size={12} />
                  <span>{commentCount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
