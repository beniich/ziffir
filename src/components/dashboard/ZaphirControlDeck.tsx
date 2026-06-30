// src/components/dashboard/ZaphirControlDeck.tsx
// ============================================================================
// Pont de Commande Zaphir (Glassmorphism Haut de Gamme)
// ============================================================================

import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { ApiManagerView } from './ApiManagerView';
import { KitchenQueue } from '../room-service/KitchenQueue';
import { ArrivalsTimeline } from '../arrivals/ArrivalsTimeline';
import { HotelMap3D } from './HotelMap3D';

// Mock pour la démo - Dans un vrai dashboard, on routerait ces composants
export function ZaphirControlDeck() {
  const { isConnected } = useSocket();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ARRIVALS' | 'ROOM_SERVICE' | 'SECURITY' | 'AI_CORE'>('OVERVIEW');
  const [logs, setLogs] = useState<string[]>([]);

  // Local state for HotelMap3D (standalone usage in this deck)
  const [glowingRooms, setGlowingRooms] = useState<Record<string, boolean>>({});
  const [occupancyMap, setOccupancyMap] = useState<Record<string, boolean>>({ royal: true, corridor: true });
  const [temperatureMap] = useState<Record<string, number>>({ royal: 21.5, imperial: 22.0, prestige: 21.0, boardroom: 20.5, corridor: 20.0 });
  const toggleRoomGlow = (room: string) => setGlowingRooms((prev) => ({ ...prev, [room]: !prev[room] }));

  // Simulation d'un flux de logs (Hash Chain Audit & AI Events)
  useEffect(() => {
    const messages = [
      '[AUDIT] Hash vérifié (Block #1948)',
      '[Zaphir Core] VIP "Jean D." approaching (5 min). Pre-cooling Suite 402.',
      '[Zaphir Core] Order #RS-2023-08-0043 READY. Auto-assigned to Staff #12.',
      '[SECURITY] Token tracker updated (used: 4291/100000)',
      '[AUDIT] Suite 402 scene changed to WELCOME',
    ];

    let i = 0;
    const interval = setInterval(() => {
      setLogs(prev => [messages[i % messages.length], ...prev].slice(0, 15));
      i++;
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      color: '#e5e5e5',
      fontFamily: "'Inter', sans-serif",
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a1a 0%, #050505 80%)',
      padding: '20px'
    }}>
      {/* HEADER GLASSMORPHISM */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #d4af37, #aa8529)', borderRadius: '8px' }} />
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 300, letterSpacing: '2px', color: '#fff' }}>ZAPHIR <span style={{ fontWeight: 'bold' }}>CORE</span></h1>
        </div>
        
        <nav style={{ display: 'flex', gap: '8px' }}>
          {(['OVERVIEW', 'ARRIVALS', 'ROOM_SERVICE', 'SECURITY', 'AI_CORE'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: activeTab === tab ? '#fff' : '#a3a3a3',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === tab ? 600 : 400,
                transition: 'all 0.2s'
              }}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isConnected ? '#34d399' : '#ef4444' }} />
          {isConnected ? 'LIVE NEURAL LINK' : 'OFFLINE'}
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        
        {/* CONTENU PRINCIPAL */}
        <main style={{
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          overflow: 'hidden',
          minHeight: '70vh'
        }}>
          {activeTab === 'SECURITY' && <ApiManagerView />}
          {activeTab === 'ARRIVALS' && <ArrivalsTimeline />}
          {activeTab === 'ROOM_SERVICE' && (
            <div style={{ filter: 'invert(1) hue-rotate(180deg)' }}>
              {/* Le composant actuel est en mode clair, on l'inverse pour le dark mode du dashboard */}
              <KitchenQueue />
            </div>
          )}
          {activeTab === 'OVERVIEW' && (
            <div style={{ width: '100%', height: '100%', minHeight: '600px', overflow: 'hidden' }}>
              <HotelMap3D
                language="EN"
                lightScene="ambient"
                glowingRooms={glowingRooms}
                toggleRoomGlow={toggleRoomGlow}
                occupancyMap={occupancyMap}
                setOccupancyMap={setOccupancyMap}
                temperatureMap={temperatureMap}
              />
            </div>
          )}
          {activeTab === 'AI_CORE' && (
            <div style={{ padding: '40px' }}>
              <h2 style={{ fontWeight: 300, color: '#d4af37', marginBottom: '24px' }}>AI Orchestrator Rules</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <RuleCard title="VIP Arrival Synergy" description="Pre-cool suite and play welcome music when driver is approaching." active={true} />
                <RuleCard title="Green AI (Energy Saver)" description="Switch to AWAY mode after 10m of vacancy." active={true} />
                <RuleCard title="Room Service Auto-Assign" description="Assign nearest available staff when order is READY." active={true} />
              </div>
            </div>
          )}
        </main>

        {/* SIDEBAR - HASH CHAIN TERMINAL */}
        <aside style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#a3a3a3', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Terminal Audit & Event Bus
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column-reverse', gap: '8px', fontFamily: "'Fira Code', monospace", fontSize: '12px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.includes('AUDIT') ? '#34d399' : (log.includes('Zaphir Core') ? '#60a5fa' : '#a3a3a3'), opacity: 1 - (i * 0.06) }}>
                <span style={{ opacity: 0.5 }}>{new Date().toLocaleTimeString()}</span> {log}
              </div>
            ))}
          </div>
        </aside>

      </div>
    </div>
  );
}

function RuleCard({ title, description, active }: { title: string; description: string; active: boolean }) {
  return (
    <div style={{ padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: `4px solid ${active ? '#34d399' : '#ef4444'}` }}>
      <h4 style={{ margin: '0 0 4px 0', color: '#fff' }}>{title}</h4>
      <p style={{ margin: 0, color: '#a3a3a3', fontSize: '14px' }}>{description}</p>
    </div>
  );
}
