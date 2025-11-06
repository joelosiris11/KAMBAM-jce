import { useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { useKanban } from '../context/KanbanContext';
import { useAuth } from '../context/AuthContext';
import TaskCard from './TaskCard';
import TaskDetailModal from './TaskDetailModal';
import TaskModal from './TaskModal';
import { FileText, ListTodo, PlayCircle, Eye, CheckCircle, Search } from 'lucide-react';
import './KanbanBoard.css';

const KanbanBoard = () => {
  const { currentUser } = useAuth();
  const { columns, moveTask, deleteTask, getTasksByColumn, updateTask } = useKanban();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'project-manager';
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQueries, setSearchQueries] = useState({});
  const [typeFilters, setTypeFilters] = useState({});

  const handleDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    console.log('🎯 Drag End:', { destination, source, draggableId });

    // No hay destino o es el mismo lugar
    if (!destination) {
      console.log('❌ Sin destino');
      return;
    }
    
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('❌ Mismo lugar');
      return;
    }

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    console.log('✅ Moviendo tarea:', { taskId, from: source.droppableId, to: newStatus });

    // Mover la tarea
    moveTask(taskId, newStatus);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handleDeleteTask = (taskId) => {
    // Solo admin puede eliminar tareas
    if (!isAdmin) {
      alert('Solo los administradores pueden eliminar tareas');
      return;
    }
    
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      deleteTask(taskId);
      if (selectedTask && selectedTask.id === taskId) {
        setShowDetailModal(false);
        setSelectedTask(null);
      }
    }
  };

  const handleResetHours = async (taskId) => {
    if (!isAdmin) return;
    await updateTask(taskId, { hours: 0 });
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const getColumnIcon = (columnId) => {
    const iconMap = {
      'backlog': FileText,
      'todo': ListTodo,
      'in-progress': PlayCircle,
      'review': Eye,
      'completed': CheckCircle
    };
    const IconComponent = iconMap[columnId] || ListTodo;
    return <IconComponent size={18} />;
  };

  const filterTasks = (tasks, columnId) => {
    let filtered = tasks;
    
    // Filtro de búsqueda
    const searchQuery = searchQueries[columnId]?.toLowerCase() || '';
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery) ||
        task.description?.toLowerCase().includes(searchQuery) ||
        task.createdBy?.toLowerCase().includes(searchQuery) ||
        task.assignedTo?.toLowerCase().includes(searchQuery)
      );
    }
    
    // Filtro de tipo
    const typeFilter = typeFilters[columnId];
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter);
    }
    
    return filtered;
  };

  const handleSearchChange = (columnId, value) => {
    setSearchQueries(prev => ({ ...prev, [columnId]: value }));
  };

  const handleTypeFilterChange = (columnId, value) => {
    setTypeFilters(prev => ({ ...prev, [columnId]: value }));
  };

  return (
    <div className="kanban-container">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns
            .sort((a, b) => a.order - b.order)
            .map((column) => {
              const allColumnTasks = getTasksByColumn(column.id);
              const columnTasks = filterTasks(allColumnTasks, column.id);

              return (
                <div key={column.id} className="column">
                  <div className="column-header">
                    <div className="column-header-content">
                      <div className="column-icon">
                        {getColumnIcon(column.id)}
                      </div>
                      <h3 className="column-title">{column.title}</h3>
                    </div>
                    <span className="task-count">
                      {columnTasks.length}
                      {allColumnTasks.length !== columnTasks.length && (
                        <span className="task-count-total">/{allColumnTasks.length}</span>
                      )}
                    </span>
                  </div>

                  {/* Filtros */}
                  <div className="column-filters">
                    <div className="column-search-wrapper">
                      <Search size={14} className="search-icon" />
                      <input
                        type="text"
                        className="column-search"
                        placeholder="Buscar..."
                        value={searchQueries[column.id] || ''}
                        onChange={(e) => handleSearchChange(column.id, e.target.value)}
                      />
                    </div>
                    <select
                      className="column-type-filter"
                      value={typeFilters[column.id] || 'all'}
                      onChange={(e) => handleTypeFilterChange(column.id, e.target.value)}
                    >
                      <option value="all">Todos</option>
                      <option value="general">General</option>
                      <option value="programacion">Código</option>
                      <option value="investigacion">Invest.</option>
                      <option value="diseno">Diseño</option>
                      <option value="testing">Testing</option>
                      <option value="documentacion">Docs</option>
                      <option value="reunion">Reunión</option>
                      <option value="bug">Bug</option>
                    </select>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`tasks-container ${
                          snapshot.isDraggingOver ? 'drag-over' : ''
                        }`}
                      >
                        {columnTasks.length === 0 ? (
                          <div className="empty-state">
                            <ListTodo size={32} className="empty-state-icon" />
                            <div className="empty-state-text">
                              Sin tareas aquí
                            </div>
                          </div>
                        ) : (
                          columnTasks.map((task, index) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              index={index}
                              onClick={() => handleTaskClick(task)}
                              onDelete={handleDeleteTask}
                              onEdit={handleEditTask}
                              isAdmin={isAdmin}
                              onResetHours={handleResetHours}
                            />
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
        </div>
      </DragDropContext>

      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
        />
      )}

      {showEditModal && selectedTask && (
        <TaskModal
          editTask={selectedTask}
          onClose={handleCloseEditModal}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
