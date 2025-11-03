import { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim() && pin.trim()) {
      onLogin(username.trim(), pin.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">📋</div>
          <h1 className="login-title">Kanban Pro</h1>
          <p className="login-subtitle">
            Gestiona tus proyectos de forma eficiente
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin" className="form-label">
              PIN
            </label>
            <input
              id="pin"
              type="password"
              className="form-input"
              placeholder="Ingresa tu PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>

        <div className="login-help">
          <p className="login-help-text">
            💡 Usuario nuevo: Crea un PIN y elige tu rol<br />
            🔐 Usuario existente: Ingresa tu PIN
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

