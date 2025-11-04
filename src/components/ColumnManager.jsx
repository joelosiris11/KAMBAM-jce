import { useState } from 'react';
import { useKanban } from '../context/KanbanContext';
import { ChevronUp, ChevronDown } from 'lucide-react';
import './Modal.css';
import './ColumnManager.css';

const ColumnManager = ({ onClose }) => {
  const { columns, addColumn, updateColumn, deleteColumn } = useKanban();
  const [isAdding, setIsAdding] = useState(false);
  const [newColumn, setNewColumn] = useState({
    id: '',
    title: '',
    color: '#6366f1'
  });

  const handleAddColumn = (e) => {
    e.preventDefault();
    
    if (!newColumn.id.trim() || !newColumn.title.trim()) {
      alert('ID y título son obligatorios');
      return;
    }

    // Verificar que el ID no exista
    if (columns.find(col => col.id === newColumn.id)) {
      alert('Ya existe una columna con ese ID');
      return;
    }

    addColumn({
      ...newColumn,
      order: columns.length
    });

    setNewColumn({ id: '', title: '', color: '#6366f1' });
    setIsAdding(false);
  };

  const handleDeleteColumn = (columnId) => {
    if (columns.length <= 1) {
      alert('Debe haber al menos una columna');
      return;
    }

    if (window.confirm('¿Eliminar esta columna? Las tareas se moverán a la primera columna.')) {
      deleteColumn(columnId);
    }
  };

  const handleUpdateColor = (columnId, color) => {
    updateColumn(columnId, { color });
  };

  const handleMoveColumn = (columnId, direction) => {
    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
    const currentIndex = sortedColumns.findIndex(col => col.id === columnId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Intercambiar posición con la columna anterior
      const targetColumn = sortedColumns[currentIndex - 1];
      updateColumn(columnId, { order: targetColumn.order });
      updateColumn(targetColumn.id, { order: sortedColumns[currentIndex].order });
    } else if (direction === 'down' && currentIndex < sortedColumns.length - 1) {
      // Intercambiar posición con la columna siguiente
      const targetColumn = sortedColumns[currentIndex + 1];
      updateColumn(columnId, { order: targetColumn.order });
      updateColumn(targetColumn.id, { order: sortedColumns[currentIndex].order });
    }
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📑 Gestión de Columnas</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="columns-list">
            {sortedColumns.map((column, index) => (
              <div key={column.id} className="column-item">
                <div className="column-reorder-buttons">
                  <button
                    className="btn-icon btn-reorder"
                    onClick={() => handleMoveColumn(column.id, 'up')}
                    disabled={index === 0}
                    title="Mover arriba"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    className="btn-icon btn-reorder"
                    onClick={() => handleMoveColumn(column.id, 'down')}
                    disabled={index === sortedColumns.length - 1}
                    title="Mover abajo"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                <div className="column-item-info">
                  <div 
                    className="column-color-preview" 
                    style={{ backgroundColor: column.color }}
                  />
                  <div>
                    <div className="column-item-title">{column.title}</div>
                    <div className="column-item-id">ID: {column.id}</div>
                  </div>
                </div>
                <div className="column-item-actions">
                  <input
                    type="color"
                    value={column.color}
                    onChange={(e) => handleUpdateColor(column.id, e.target.value)}
                    className="color-picker"
                    title="Cambiar color"
                  />
                  <button
                    className="btn-icon btn-danger-icon"
                    onClick={() => handleDeleteColumn(column.id)}
                    title="Eliminar columna"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {isAdding ? (
            <form onSubmit={handleAddColumn} className="add-column-form">
              <div className="form-group">
                <label className="form-label">ID de la columna *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: review"
                  value={newColumn.id}
                  onChange={(e) => setNewColumn({ ...newColumn, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Título *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej: En Revisión"
                  value={newColumn.title}
                  onChange={(e) => setNewColumn({ ...newColumn, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="color"
                  className="form-input color-input"
                  value={newColumn.color}
                  onChange={(e) => setNewColumn({ ...newColumn, color: e.target.value })}
                />
              </div>
              <div className="add-column-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Agregar Columna
                </button>
              </div>
            </form>
          ) : (
            <button className="btn-add-column" onClick={() => setIsAdding(true)}>
              ➕ Agregar Nueva Columna
            </button>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnManager;

