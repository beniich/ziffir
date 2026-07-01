// src/components/SuiteControlPanel.tsx
// ============================================================================
// Composant UI temps réel pour contrôler une suite
// Indicateur Live/Offline, scènes, température, lumière, volets, DND
// ============================================================================

import { useState, useCallback } from 'react';
import { useSuiteControls, SuiteState } from '../hooks/useSuiteControls';

interface Props {
  roomId: string;
  compact?: boolean;
  themeMode?: 'dark' | 'light';
}

type SceneKey = SuiteState['scene'];

const SCENES: Array<{ key: SceneKey; label: string; icon: string }> = [
  { key: 'IDLE',    label: 'Repos',    icon: '💤' },
  { key: 'WELCOME', label: 'Accueil',  icon: '👋' },
  { key: 'MORNING', label: 'Matin',    icon: '☀️' },
  { key: 'WORK',    label: 'Travail',  icon: '💼' },
  { key: 'DINNER',  label: 'Dîner',    icon: '🍽️' },
  { key: 'NIGHT',   label: 'Nuit',     icon: '🌙' },
  { key: 'AWAY',    label: 'Absent',   icon: '✈️' },
];

export function SuiteControlPanel({ roomId, compact = false, themeMode = 'dark' }: Props) {
  const {
    getSuite, setScene, setTemperature, setLight,
    toggleCurtains, toggleDnd, toggleMusic, isLive,
  } = useSuiteControls({ roomId });

  const suite = getSuite(roomId);
  const [pending, setPending] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'error' | 'info' } | null>(null);

  const exec = useCallback(async (key: string, action: () => Promise<{ ok: boolean; error?: string }>) => {
    setPending(key);
    const result = await action();
    setPending(null);
    if (!result.ok) {
      setNotification({ msg: result.error || 'Erreur', type: 'error' });
      setTimeout(() => setNotification(null), 4000);
    }
  }, []);

  if (!suite) {
    return (
      <div style={{
        padding: '1.5rem',
        borderRadius: '1rem',
        background: themeMode === 'dark' ? 'rgba(10,10,12,0.8)' : 'rgba(252,250,242,0.9)',
        border: '1px solid rgba(193,154,107,0.2)',
        textAlign: 'center',
        color: '#c19a6b',
        fontFamily: 'monospace',
        fontSize: '13px',
      }}>
        ⟳ Chargement de la suite...
      </div>
    );
  }

  const isDark = themeMode === 'dark';
  const accent = '#c19a6b';
  const panelBg = isDark ? 'rgba(10,10,12,0.85)' : 'rgba(252,250,242,0.95)';
  const border = isDark ? '1px solid rgba(193,154,107,0.25)' : '1px solid rgba(193,154,107,0.3)';
  const textPrimary = isDark ? '#f1ece4' : '#1c1917';
  const textMuted = isDark ? '#78716c' : '#a8a29e';
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
  const activeBg = 'rgba(193,154,107,0.15)';

  return (
    <div style={{
      background: panelBg,
      border,
      borderRadius: '1.25rem',
      padding: compact ? '1rem' : '1.5rem',
      backdropFilter: 'blur(12px)',
      boxShadow: isDark
        ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(193,154,107,0.1)'
        : '0 4px 24px rgba(0,0,0,0.08)',
      position: 'relative',
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Notification */}
      {notification && (
        <div style={{
          position: 'absolute',
          top: '-2.5rem',
          left: 0,
          right: 0,
          background: notification.type === 'error' ? '#7f1d1d' : '#1c3a2e',
          color: notification.type === 'error' ? '#fca5a5' : '#6ee7b7',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '12px',
          textAlign: 'center',
          zIndex: 10,
          animation: 'fadeIn 0.2s ease',
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1.25rem',
      }}>
        <div>
          <div style={{ fontSize: compact ? '14px' : '16px', fontWeight: 700, color: textPrimary }}>
            Suite {suite.room.number}
          </div>
          {suite.room.floor && (
            <div style={{ fontSize: '11px', color: textMuted, marginTop: '2px' }}>
              Étage {suite.room.floor} · {suite.room.type}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            {suite.isOccupied && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '999px', background: 'rgba(16,185,129,0.15)',
                color: '#34d399', border: '1px solid rgba(16,185,129,0.3)',
              }}>● Occupée</span>
            )}
            {suite.doNotDisturb && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '999px', background: 'rgba(239,68,68,0.15)',
                color: '#f87171', border: '1px solid rgba(239,68,68,0.3)',
              }}>🔕 DND</span>
            )}
            {suite.maintenanceMode && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px',
                borderRadius: '999px', background: 'rgba(245,158,11,0.15)',
                color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)',
              }}>🔧 Maintenance</span>
            )}
          </div>
        </div>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: isLive ? '#10b981' : '#6b7280',
            boxShadow: isLive ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
          }} />
          <span style={{ fontSize: '11px', color: textMuted, fontFamily: 'monospace' }}>
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Scènes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${compact ? 4 : 7}, 1fr)`,
        gap: '0.4rem',
        marginBottom: '1.25rem',
      }}>
        {SCENES.map(s => (
          <button
            key={s.key}
            onClick={() => exec(`scene-${s.key}`, () => setScene(roomId, s.key))}
            disabled={!!pending || suite.scene === s.key}
            title={s.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.2rem', padding: compact ? '0.5rem 0.25rem' : '0.75rem 0.4rem',
              background: suite.scene === s.key ? activeBg : cardBg,
              border: suite.scene === s.key
                ? `1px solid ${accent}`
                : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: '0.625rem', cursor: pending ? 'wait' : 'pointer',
              opacity: pending && pending !== `scene-${s.key}` ? 0.5 : 1,
              transition: 'all 150ms ease',
            }}
          >
            <span style={{ fontSize: compact ? '16px' : '20px' }}>{s.icon}</span>
            {!compact && (
              <span style={{ fontSize: '10px', color: suite.scene === s.key ? accent : textMuted, fontWeight: 500 }}>
                {s.label}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Controls fins */}
      {!compact && (
        <>
          {/* Température */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '12px', color: textMuted }}>🌡️ Température</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                {suite.temperatureC.toFixed(1)}°C
              </span>
            </div>
            <input
              type="range" min="10" max="35" step="0.5"
              value={suite.temperatureC}
              onChange={e => exec('temp', () => setTemperature(roomId, parseFloat(e.target.value)))}
              style={{ width: '100%', accentColor: accent }}
            />
          </div>

          {/* Lumière */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '12px', color: textMuted }}>💡 Lumière</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: textPrimary, fontVariantNumeric: 'tabular-nums' }}>
                {suite.lightLevel}%
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={suite.lightLevel}
              onChange={e => exec('light', () => setLight(roomId, parseInt(e.target.value, 10)))}
              style={{ width: '100%', accentColor: accent }}
            />
          </div>

          {/* Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              {
                key: 'curtains',
                label: suite.curtainsOpen ? '🪟 Volets ouverts' : '🌑 Volets fermés',
                active: suite.curtainsOpen,
                action: () => toggleCurtains(roomId),
              },
              {
                key: 'dnd',
                label: suite.doNotDisturb ? '🔕 DND ON' : '🔔 DND OFF',
                active: suite.doNotDisturb,
                danger: true,
                action: () => toggleDnd(roomId),
              },
              {
                key: 'music',
                label: suite.musicPlaying ? '🎵 Musique ON' : '🔇 Musique OFF',
                active: suite.musicPlaying,
                action: () => toggleMusic(roomId),
              },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => exec(t.key, t.action)}
                disabled={!!pending}
                style={{
                  padding: '0.5rem 0.4rem', fontSize: '11px', fontWeight: 600,
                  border: t.active
                    ? `1px solid ${t.danger ? '#ef4444' : accent}`
                    : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: '0.5rem', cursor: pending ? 'wait' : 'pointer',
                  background: t.active
                    ? (t.danger ? 'rgba(239,68,68,0.12)' : activeBg)
                    : cardBg,
                  color: t.active ? (t.danger ? '#f87171' : accent) : textMuted,
                  transition: 'all 150ms ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Footer version */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        <span style={{ fontSize: '10px', color: textMuted, fontFamily: 'monospace' }}>
          v{suite.version}
        </span>
        <span style={{ fontSize: '10px', color: textMuted }}>
          {new Date(suite.lastUpdatedAt).toLocaleTimeString('fr-FR')}
        </span>
      </div>
    </div>
  );
}

export default SuiteControlPanel;
