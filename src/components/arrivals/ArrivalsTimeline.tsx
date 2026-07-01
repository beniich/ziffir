// src/components/arrivals/ArrivalsTimeline.tsx
// ============================================================================
// Vue opérationnelle Arrivals VIP — Timeline + Checklist par équipe
// ============================================================================

import { useState } from 'react';
import { useArrivals, Arrival, ArrivalTask, ArrivalStatus, TeamType } from '../../hooks/useArrivals';

const VIP_COLORS: Record<string, string> = {
  CLASSIC:   '#9ca3af',
  PREFERRED: '#60a5fa',
  VIP:       '#a78bfa',
  PRESTIGE:  '#fbbf24',
  ROYAL:     '#f59e0b',
  BLACKLISTED:'#ef4444',
};

const VIP_ICONS: Record<string, string> = {
  CLASSIC: '●', PREFERRED: '★', VIP: '◆', PRESTIGE: '👑', ROYAL: '🏰', BLACKLISTED: '⛔',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: '#6b7280', CONFIRMED: '#60a5fa', IN_PREPARATION: '#f59e0b',
  DRIVER_EN_ROUTE: '#8b5cf6', ENROUTE: '#8b5cf6', LANDED: '#34d399',
  AT_HOTEL: '#f59e0b', CHECKED_IN: '#10b981', NO_SHOW: '#ef4444', CANCELLED: '#ef4444',
};

const TEAM_ICONS: Record<TeamType, string> = {
  RECEPTION: '🛎', CONCIERGERIE: '🎩', HOUSEKEEPING: '🛏',
  KITCHEN: '👨‍🍳', BELL_SERVICE: '🧳', TRANSPORT: '🚗',
  SECURITY: '🔒', MANAGEMENT: '💼', EXTERNAL: '🌐',
};

const STATUS_NEXT: Partial<Record<ArrivalStatus, { label: string; toStatus: ArrivalStatus }>> = {
  SCHEDULED:      { label: 'Confirmer', toStatus: 'CONFIRMED' },
  CONFIRMED:      { label: 'Démarrer préparation', toStatus: 'IN_PREPARATION' },
  IN_PREPARATION: { label: 'Chauffeur en route', toStatus: 'DRIVER_EN_ROUTE' },
  DRIVER_EN_ROUTE:{ label: 'Client en route', toStatus: 'ENROUTE' },
  ENROUTE:        { label: 'À l\'hôtel', toStatus: 'AT_HOTEL' },
  LANDED:         { label: 'À l\'hôtel', toStatus: 'AT_HOTEL' },
  AT_HOTEL:       { label: 'Check-in ✅', toStatus: 'CHECKED_IN' },
};

function timeUntil(isoDate: string): string {
  const ms = new Date(isoDate).getTime() - Date.now();
  if (ms < 0) return `${Math.abs(Math.round(ms / 60000))}min de retard`;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `Dans ${h}h${m ? m : ''}` : `Dans ${m}min`;
}

function TaskRow({ task, onUpdate }: { task: ArrivalTask; onUpdate: (status: string) => void }) {
  const isDone = task.status === 'COMPLETED' || task.status === 'CANCELLED';
  const isLate = task.dueAt && !isDone && new Date(task.dueAt) < new Date();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
      backgroundColor: task.isCritical ? 'rgba(239,68,68,0.05)' : 'rgba(0,0,0,0.015)',
      borderLeft: `3px solid ${task.isCritical ? '#ef4444' : '#e5e7eb'}`,
      borderRadius: '0 8px 8px 0', opacity: isDone ? 0.5 : 1,
    }}>
      <span style={{ fontSize: '18px' }}>{TEAM_ICONS[task.team as TeamType]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '14px', fontWeight: task.isCritical ? 600 : 400,
            textDecoration: isDone ? 'line-through' : 'none',
            color: isDone ? '#9ca3af' : '#111827',
          }}>
            {task.title}
          </span>
          {task.isCritical && !isDone && (
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>CRITIQUE</span>
          )}
          {isLate && (
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>EN RETARD</span>
          )}
        </div>
        {task.dueAt && (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            ⏱ {new Date(task.dueAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {task.assignedUser && ` · ${task.assignedUser.displayName}`}
          </div>
        )}
      </div>
      {!isDone && task.status !== 'BLOCKED' && (
        <div style={{ display: 'flex', gap: '6px' }}>
          {task.status === 'PENDING' && (
            <button onClick={() => onUpdate('IN_PROGRESS')} style={{
              fontSize: '12px', padding: '4px 10px', backgroundColor: '#60a5fa', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}>▶ Start</button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <button onClick={() => onUpdate('COMPLETED')} style={{
              fontSize: '12px', padding: '4px 10px', backgroundColor: '#10b981', color: '#fff',
              border: 'none', borderRadius: '6px', cursor: 'pointer',
            }}>✓ Done</button>
          )}
        </div>
      )}
      {isDone && <span style={{ fontSize: '18px' }}>✅</span>}
    </div>
  );
}

function ArrivalCard({ arrival, onTransition, onTaskUpdate }: {
  arrival: Arrival;
  onTransition: (id: string, status: ArrivalStatus, version: number) => void;
  onTaskUpdate: (taskId: string, updates: any) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const vipColor = VIP_COLORS[arrival.vipLevel] || '#9ca3af';
  const nextAction = STATUS_NEXT[arrival.status];
  const completedCount = arrival.tasks.filter(t => t.status === 'COMPLETED').length;
  const progress = arrival.tasks.length > 0 ? completedCount / arrival.tasks.length : 0;
  const criticalPending = arrival.tasks.filter(t => t.isCritical && !['COMPLETED', 'CANCELLED'].includes(t.status)).length;

  return (
    <article style={{
      backgroundColor: '#ffffff',
      border: `2px solid ${criticalPending > 0 ? '#fbbf24' : vipColor}20`,
      borderLeft: `4px solid ${vipColor}`,
      borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {/* En-tête */}
      <header
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '50%',
          backgroundColor: `${vipColor}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px', flexShrink: 0,
        }}>
          {VIP_ICONS[arrival.vipLevel]}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>
              {arrival.guestName}
            </h3>
            <span style={{
              padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
              backgroundColor: `${vipColor}20`, color: vipColor,
            }}>
              {arrival.vipLevel}
            </span>
            <span style={{
              padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
              backgroundColor: STATUS_COLORS[arrival.status] + '20',
              color: STATUS_COLORS[arrival.status],
              fontWeight: 600,
            }}>
              {arrival.status.replace(/_/g, ' ')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '13px', color: '#6b7280' }}>
            <span>🕐 {timeUntil(arrival.scheduledArrivalAt)}</span>
            {arrival.room && <span>🚪 Suite {arrival.room.number}</span>}
            {arrival.flightNumber && <span>✈ {arrival.flightNumber}</span>}
            {arrival.driverName && <span>🚗 {arrival.driverName}</span>}
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {/* Barre de progression tasks */}
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
            {completedCount}/{arrival.tasks.length} tâches
            {criticalPending > 0 && <span style={{ color: '#ef4444', marginLeft: '6px' }}>⚠ {criticalPending} critiques</span>}
          </div>
          <div style={{ width: '80px', height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: progress === 1 ? '#10b981' : '#60a5fa', borderRadius: '2px', transition: 'width 0.3s' }} />
          </div>
        </div>

        <span style={{ color: '#9ca3af', fontSize: '20px' }}>{expanded ? '▲' : '▼'}</span>
      </header>

      {/* Détail tasks */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {arrival.tasks.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Aucune tâche.</p>
          )}
          {arrival.tasks
            .sort((a, b) => (b.priority - a.priority) || (a.dueAt || '').localeCompare(b.dueAt || ''))
            .map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onUpdate={(status) => onTaskUpdate(task.id, { status, version: task.version })}
              />
            ))}

          {/* Action principale */}
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            {nextAction && (
              <button
                onClick={() => onTransition(arrival.id, nextAction.toStatus, arrival.version)}
                style={{
                  flex: 1, padding: '10px', backgroundColor: '#1f2937', color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                }}
              >
                {nextAction.label} →
              </button>
            )}
            {!['CANCELLED', 'CHECKED_IN', 'NO_SHOW'].includes(arrival.status) && (
              <button
                onClick={() => onTransition(arrival.id, 'CANCELLED', arrival.version)}
                style={{
                  padding: '10px 16px', backgroundColor: 'transparent', color: '#ef4444',
                  border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                }}
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
export function ArrivalsTimeline() {
  const { arrivals, loading, isLive, stats, transition, updateTask } = useArrivals({ upcoming: true });

  const handleTransition = async (id: string, toStatus: ArrivalStatus, version: number) => {
    await transition(id, toStatus, { version });
  };

  const handleTaskUpdate = async (taskId: string, updates: any) => {
    await updateTask(taskId, updates);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        <p style={{ color: '#6b7280' }}>Chargement des arrivées…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      {/* KPI Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 300 }}>
            🏨 Arrivals VIP <span style={{ fontWeight: 700 }}>Operations</span>
          </h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
            Tableau de bord de coordination multi-équipes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <KpiCard label="Aujourd'hui" value={stats.today} color="#60a5fa" />
          <KpiCard label="ROYAL" value={stats.royalCount} color="#f59e0b" />
          <KpiCard label="Tâches en attente" value={stats.pendingTasks} color="#a78bfa" />
          <KpiCard label="Critique !" value={stats.criticalPending} color="#ef4444" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: isLive ? '#10b981' : '#9ca3af' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isLive ? '#10b981' : '#9ca3af' }} />
          {isLive ? 'LIVE' : 'OFFLINE'}
        </div>
      </header>

      {/* Liste des arrivées */}
      {arrivals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '16px' }}>
          <p style={{ fontSize: '40px' }}>✨</p>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Aucune arrivée en cours</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {arrivals.map(arrival => (
            <ArrivalCard
              key={arrival.id}
              arrival={arrival}
              onTransition={handleTransition}
              onTaskUpdate={handleTaskUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      padding: '12px 20px', backgroundColor: `${color}10`, borderRadius: '10px',
      border: `1px solid ${color}30`, textAlign: 'center',
    }}>
      <div style={{ fontSize: '26px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}
