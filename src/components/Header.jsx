import { ListTodo, LoaderCircle, CheckCircle2, Clock } from 'lucide-react';
import './Header.css';

const Header = ({ stats }) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1 className="header-title">Mi Tablero</h1>
      </div>

      <div className="header-stats">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon primary">
              <ListTodo size={16} />
            </div>
            <div>
              <div className="stat-card-title">Total</div>
            </div>
          </div>
          <div className="stat-card-value">{stats.totalTasks}</div>
          <div className="stat-card-subtitle">tareas</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon info">
              <LoaderCircle size={16} />
            </div>
            <div>
              <div className="stat-card-title">En Proceso</div>
            </div>
          </div>
          <div className="stat-card-value">{stats.inProgressTasks}</div>
          <div className="stat-card-subtitle">en proceso</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon success">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="stat-card-title">Completadas</div>
            </div>
          </div>
          <div className="stat-card-value">{stats.completedTasks}</div>
          <div className="stat-card-subtitle">{stats.progressPercent}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon warning">
              <Clock size={16} />
            </div>
            <div>
              <div className="stat-card-title">Horas</div>
            </div>
          </div>
          <div className="stat-card-value">{stats.remainingHours.toFixed(1)}h</div>
          <div className="stat-card-subtitle">de {stats.totalHours.toFixed(1)}h</div>
        </div>
      </div>
    </header>
  );
};

export default Header;

