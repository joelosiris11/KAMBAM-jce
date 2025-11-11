import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const UrlEditModal = ({ isOpen, onClose, title, currentUrl, onSave, icon: Icon }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Mostrar la URL sin normalizar (sin https:// si fue agregado automáticamente)
      let displayUrl = currentUrl || '';
      // Si la URL empieza con https:// y no tiene http://, podría haber sido normalizada
      // Pero mostramos lo que está guardado
      setUrl(displayUrl);
    }
  }, [isOpen, currentUrl]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(url);
    onClose();
  };

  const handleCancel = () => {
    setUrl(currentUrl || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {Icon && <Icon size={24} />}
            <h2 className="modal-title">{title}</h2>
          </div>
          <button className="modal-close" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="url" className="form-label">
                URL
              </label>
              <input
                id="url"
                type="url"
                className="form-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                autoFocus
              />
              <small style={{ 
                display: 'block', 
                marginTop: '8px', 
                color: 'var(--text-tertiary)',
                fontSize: '12px'
              }}>
                Ingresa la URL completa (se agregará https:// automáticamente si falta)
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UrlEditModal;

