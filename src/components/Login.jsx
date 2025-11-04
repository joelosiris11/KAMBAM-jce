import { useState } from 'react';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim() && pin.trim()) {
      setIsLoading(true);
      await onLogin(username.trim(), pin.trim());
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Panel Izquierdo - Branding */}
      <div className="login-branding">
        <div className="login-branding-content">
          <img src="/logo-jce.svg" alt="JCE Logo" className="login-brand-logo" />
          <h1 className="login-brand-title">Kanban JCE</h1>
          <p className="login-brand-subtitle">
            Sistema de gestión de proyectos y tareas colaborativo
          </p>
          <div className="login-features">
            <div className="login-feature">
              <div className="feature-icon">✨</div>
              <div className="feature-text">Gestión visual de tareas</div>
            </div>
            <div className="login-feature">
              <div className="feature-icon">📊</div>
              <div className="feature-text">Burndown charts en tiempo real</div>
            </div>
            <div className="login-feature">
              <div className="feature-icon">👥</div>
              <div className="feature-text">Colaboración en equipo</div>
            </div>
            <div className="login-feature">
              <div className="feature-icon">🔥</div>
              <div className="feature-text">Sincronización con Firebase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho - Login Form */}
      <div className="login-form-panel">
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Bienvenido</h2>
            <p className="login-subtitle">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} />
                Usuario
              </label>
              <div className="input-wrapper">
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pin" className="form-label">
                <Lock size={16} />
                PIN
              </label>
              <div className="input-wrapper">
                <input
                  id="pin"
                  type="password"
                  className="form-input"
                  placeholder="Tu PIN de 4 dígitos"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  autoComplete="current-password"
                  maxLength="4"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading || !username.trim() || !pin.trim()}
            >
              <LogIn size={18} />
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="login-help">
            <div className="help-item">
              <span className="help-icon">💡</span>
              <span className="help-text">
                <strong>¿Primera vez?</strong> Ingresa un usuario nuevo y crea tu PIN
              </span>
            </div>
            <div className="help-item">
              <span className="help-icon">🔐</span>
              <span className="help-text">
                <strong>¿Ya tienes cuenta?</strong> Solo ingresa tu usuario y PIN
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

