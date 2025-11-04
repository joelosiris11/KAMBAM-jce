import { useState, useEffect, useMemo } from 'react';
import { useKanban } from '../context/KanbanContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingDown, Settings } from 'lucide-react';
import './BurndownChart.css';

const BurndownChart = () => {
  const { tasks } = useKanban();
  const [sprintStart, setSprintStart] = useState(() => {
    const saved = localStorage.getItem('kanban_sprint_start');
    return saved || new Date().toISOString().split('T')[0];
  });
  const [sprintEnd, setSprintEnd] = useState(() => {
    const saved = localStorage.getItem('kanban_sprint_end');
    // Por defecto, 2 semanas desde hoy
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 14);
    return saved || defaultEnd.toISOString().split('T')[0];
  });
  const [showSettings, setShowSettings] = useState(false);

  // Guardar configuración en localStorage
  useEffect(() => {
    localStorage.setItem('kanban_sprint_start', sprintStart);
    localStorage.setItem('kanban_sprint_end', sprintEnd);
  }, [sprintStart, sprintEnd]);

  // Calcular totales
  const totalHours = useMemo(() => {
    return tasks.reduce((sum, task) => sum + (task.hours || 0), 0);
  }, [tasks]);

  const completedHours = useMemo(() => {
    return tasks
      .filter(task => task.status === 'done' || task.status === 'completed')
      .reduce((sum, task) => sum + (task.hours || 0), 0);
  }, [tasks]);

  const remainingHours = totalHours - completedHours;

  // Generar datos del gráfico
  const chartData = useMemo(() => {
    const start = new Date(sprintStart);
    const end = new Date(sprintEnd);
    const today = new Date();
    
    // Normalizar fechas a medianoche
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const daysElapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    
    if (totalDays <= 0) return [];

    const data = [];
    const dailyIdealBurn = totalHours / (totalDays - 1); // Burn por día

    for (let day = 0; day < totalDays; day++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + day);
      
      const dateStr = currentDate.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      });

      // Línea ideal (descendente lineal)
      const idealRemaining = Math.max(0, totalHours - (dailyIdealBurn * day));

      // Línea real
      let realRemaining = null;
      if (day <= daysElapsed) {
        // Para días pasados y hoy, mostrar el progreso real
        if (day === daysElapsed) {
          realRemaining = remainingHours;
        } else {
          // Para días pasados, interpolar
          const progressRatio = day / daysElapsed;
          const burnedSoFar = completedHours * progressRatio;
          realRemaining = totalHours - burnedSoFar;
        }
      }

      data.push({
        date: dateStr,
        ideal: Math.round(idealRemaining * 10) / 10,
        real: realRemaining !== null ? Math.round(realRemaining * 10) / 10 : null,
        isToday: day === daysElapsed
      });
    }

    return data;
  }, [sprintStart, sprintEnd, totalHours, completedHours, remainingHours]);

  // Calcular el estado del sprint
  const sprintStatus = useMemo(() => {
    const start = new Date(sprintStart);
    const end = new Date(sprintEnd);
    const today = new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today - start) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

    const progress = (completedHours / totalHours) * 100;
    const timeProgress = (daysElapsed / totalDays) * 100;

    let status = 'on-track';
    if (progress < timeProgress - 10) {
      status = 'behind';
    } else if (progress > timeProgress + 10) {
      status = 'ahead';
    }

    return {
      daysRemaining: Math.max(0, daysRemaining),
      totalDays,
      progress: Math.round(progress),
      timeProgress: Math.round(timeProgress),
      status
    };
  }, [sprintStart, sprintEnd, completedHours, totalHours]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="burndown-tooltip">
          <p className="tooltip-date">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name === 'ideal' ? 'Ideal' : 'Real'}: {entry.value}h
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="burndown-chart">
      <div className="burndown-header">
        <div className="burndown-title">
          <TrendingDown size={18} />
          <span>Burndown Chart</span>
        </div>
        <button 
          className="burndown-settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Configurar sprint"
        >
          <Settings size={16} />
        </button>
      </div>

      {showSettings && (
        <div className="burndown-settings">
          <div className="setting-group">
            <label>
              <Calendar size={14} />
              Inicio del Sprint
            </label>
            <input
              type="date"
              value={sprintStart}
              onChange={(e) => setSprintStart(e.target.value)}
            />
          </div>
          <div className="setting-group">
            <label>
              <Calendar size={14} />
              Fin del Sprint
            </label>
            <input
              type="date"
              value={sprintEnd}
              onChange={(e) => setSprintEnd(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="burndown-stats">
        <div className="stat-item">
          <span className="stat-label">Total</span>
          <span className="stat-value">{totalHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Completado</span>
          <span className="stat-value completed">{completedHours}h</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Restante</span>
          <span className="stat-value remaining">{remainingHours}h</span>
        </div>
      </div>

      <div className="sprint-status">
        <div className={`status-indicator ${sprintStatus.status}`}>
          {sprintStatus.status === 'ahead' && '🚀 Adelantado'}
          {sprintStatus.status === 'on-track' && '✅ En tiempo'}
          {sprintStatus.status === 'behind' && '⚠️ Retrasado'}
        </div>
        <div className="status-detail">
          {sprintStatus.daysRemaining > 0 ? (
            <span>{sprintStatus.daysRemaining} días restantes</span>
          ) : (
            <span className="sprint-ended">Sprint finalizado</span>
          )}
        </div>
      </div>

      <div className="burndown-graph">
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 9 }}
              stroke="#6b7280"
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 9 }}
              stroke="#6b7280"
              width={35}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="ideal" 
              stroke="#94a3b8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal"
            />
            <Line 
              type="monotone" 
              dataKey="real" 
              stroke="#6366f1" 
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 3 }}
              connectNulls={false}
              name="Real"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="burndown-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${sprintStatus.progress}%` }}
          />
        </div>
        <div className="progress-label">
          Progreso: {sprintStatus.progress}% ({completedHours}/{totalHours}h)
        </div>
      </div>
    </div>
  );
};

export default BurndownChart;

