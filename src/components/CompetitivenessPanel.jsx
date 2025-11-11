import { useMemo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { X, Trophy, UserPlus, CheckCircle2, FileText, TrendingUp, PlayCircle, CircleCheck } from 'lucide-react';
import './CompetitivenessPanel.css';

const CompetitivenessPanel = ({ onClose }) => {
  const { tasks } = useKanban();

  // Calcular estadísticas por usuario
  const userStats = useMemo(() => {
    const stats = {};

    tasks.forEach(task => {
      // Tareas creadas
      if (task.createdBy) {
        if (!stats[task.createdBy]) {
          stats[task.createdBy] = {
            username: task.createdBy,
            created: 0,
            assigned: 0,
            validated: 0,
            completed: 0,
            inProgress: 0,
            total: 0
          };
        }
        stats[task.createdBy].created++;
        stats[task.createdBy].total++;
      }

      // Tareas asignadas
      if (task.assignedTo) {
        if (!stats[task.assignedTo]) {
          stats[task.assignedTo] = {
            username: task.assignedTo,
            created: 0,
            assigned: 0,
            validated: 0,
            completed: 0,
            inProgress: 0,
            total: 0
          };
        }
        stats[task.assignedTo].assigned++;
        
        // Tareas completadas (asignadas y en estado completed)
        if (task.status === 'completed') {
          stats[task.assignedTo].completed++;
        }
        
        // Tareas en proceso (asignadas y en estado in-progress)
        if (task.status === 'in-progress') {
          stats[task.assignedTo].inProgress++;
        }
        
        // Solo contar una vez si createdBy y assignedTo son el mismo
        if (task.assignedTo !== task.createdBy) {
          stats[task.assignedTo].total++;
        }
      }

      // Tareas validadas
      if (task.validated && task.validatedBy) {
        if (!stats[task.validatedBy]) {
          stats[task.validatedBy] = {
            username: task.validatedBy,
            created: 0,
            assigned: 0,
            validated: 0,
            completed: 0,
            inProgress: 0,
            total: 0
          };
        }
        stats[task.validatedBy].validated++;
        // Solo contar una vez si no está ya contado
        if (task.validatedBy !== task.createdBy && task.validatedBy !== task.assignedTo) {
          stats[task.validatedBy].total++;
        }
      }
    });

    // Convertir a array y ordenar por total (competitividad)
    return Object.values(stats)
      .map(user => ({
        ...user,
        score: user.created * 1 + user.assigned * 1.2 + user.validated * 1.5 + user.completed * 1.8 // Ponderación
      }))
      .sort((a, b) => b.score - a.score);
  }, [tasks]);

  // Encontrar el máximo para normalizar las barras
  const maxValue = useMemo(() => {
    if (userStats.length === 0) return 1;
    return Math.max(
      ...userStats.map(u => Math.max(u.created, u.assigned, u.validated, u.completed, u.inProgress))
    );
  }, [userStats]);

  return (
    <div className="competitiveness-panel-overlay" onClick={onClose}>
      <div className="competitiveness-panel" onClick={(e) => e.stopPropagation()}>
        <div className="competitiveness-panel-header">
          <div className="competitiveness-panel-title">
            <Trophy size={20} />
            <h2>Competitividad</h2>
          </div>
          <button className="competitiveness-panel-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="competitiveness-panel-content">
          {userStats.length === 0 ? (
            <div className="competitiveness-panel-empty">
              <FileText size={48} />
              <p>No hay datos de usuarios disponibles</p>
            </div>
          ) : (
            <div className="competitiveness-stats-list">
              {userStats.map((user, index) => (
                <div key={user.username} className="competitiveness-user-card">
                  <div className="competitiveness-user-header">
                    <div className="competitiveness-user-rank">
                      {index === 0 && <Trophy size={14} className="trophy-gold" />}
                      {index === 1 && <Trophy size={14} className="trophy-silver" />}
                      {index === 2 && <Trophy size={14} className="trophy-bronze" />}
                      <span className="rank-number">#{index + 1}</span>
                    </div>
                    <div className="competitiveness-user-name">
                      <span className="user-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <span className="user-username">{user.username}</span>
                    </div>
                    <div className="competitiveness-user-score">
                      <TrendingUp size={12} />
                      <span>{Math.round(user.score)}</span>
                    </div>
                  </div>

                  <div className="competitiveness-user-stats-grid">
                    <div className="stat-item-compact">
                      <div className="stat-icon-label">
                        <FileText size={12} className="stat-icon stat-icon-created" />
                        <span className="stat-label-text">Creadas</span>
                      </div>
                      <div className="stat-value-compact">{user.created}</div>
                    </div>

                    <div className="stat-item-compact">
                      <div className="stat-icon-label">
                        <UserPlus size={12} className="stat-icon stat-icon-assigned" />
                        <span className="stat-label-text">Asignadas</span>
                      </div>
                      <div className="stat-value-compact">{user.assigned}</div>
                    </div>

                    <div className="stat-item-compact">
                      <div className="stat-icon-label">
                        <CircleCheck size={12} className="stat-icon stat-icon-completed" />
                        <span className="stat-label-text">Completadas</span>
                      </div>
                      <div className="stat-value-compact">{user.completed}</div>
                    </div>

                    <div className="stat-item-compact">
                      <div className="stat-icon-label">
                        <PlayCircle size={12} className="stat-icon stat-icon-progress" />
                        <span className="stat-label-text">En Proceso</span>
                      </div>
                      <div className="stat-value-compact">{user.inProgress}</div>
                    </div>

                    <div className="stat-item-compact">
                      <div className="stat-icon-label">
                        <CheckCircle2 size={12} className="stat-icon stat-icon-validated" />
                        <span className="stat-label-text">Validadas</span>
                      </div>
                      <div className="stat-value-compact">{user.validated}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitivenessPanel;

