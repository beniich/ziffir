// src/components/room-service/KitchenQueue.tsx
// ============================================================================
// File d'attente cuisine - affichage optimisé pour écrans cuisine
// ============================================================================

import { useState, useEffect } from 'react';
import { useRoomOrders } from '../../hooks/useRoomOrders';


export function KitchenQueue() {
  const { orders, transition, isLive, stats } = useRoomOrders({ view: 'kitchen' });
  
  // Tri : PENDING en premier, puis par ancienneté
  const sorted = [...orders].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
  });
  
  // Auto-refresh toutes les 30s pour les durées écoulées
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 30_000);
    return () => clearInterval(interval);
  }, []);
  
  const elapsed = (placedAt: string) => {
    const ms = Date.now() - new Date(placedAt).getTime();
    return Math.floor(ms / 60000);
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>👨‍🍳 File cuisine</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Stat label="En attente" value={stats.pending} color="#fbbf24" />
          <Stat label="En préparation" value={stats.preparing} color="#60a5fa" />
          <Stat label="Prêtes" value={stats.ready} color="#34d399" />
          <Stat label="Temps moyen" value={stats.avgPrepTime ? `${stats.avgPrepTime}min` : '—'} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isLive ? '#34d399' : '#9ca3af', fontWeight: 'bold' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: isLive ? '#34d399' : '#9ca3af' }} />
          {isLive ? 'LIVE' : 'OFFLINE'}
        </div>
      </header>
      
      {sorted.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '12px' }}>
          <p style={{ fontSize: '18px', color: '#6b7280' }}>✨ Aucune commande en cuisine</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {sorted.map(order => {
            const ageMin = elapsed(order.placedAt);
            const isUrgent = ageMin > 20;
            
            return (
              <article
                key={order.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: isUrgent ? '2px solid #ef4444' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <header style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{order.orderNumber}</h3>
                    <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Suite {order.room.number} · {order.guestName}</p>
                  </div>
                  <div style={{ 
                    backgroundColor: isUrgent ? '#fee2e2' : '#f3f4f6', 
                    color: isUrgent ? '#ef4444' : '#4b5563',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    height: 'fit-content'
                  }}>
                    {ageMin}min
                  </div>
                </header>
                
                {order.guestNotes && (
                  <div style={{ backgroundColor: '#fef3c7', padding: '10px', borderRadius: '8px', fontSize: '14px', color: '#92400e' }}>
                    📝 {order.guestNotes}
                  </div>
                )}
                
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map(item => (
                    <li key={item.id} style={{ display: 'flex', flexDirection: 'column', fontSize: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold' }}>{item.quantity}×</span>
                        <span>{item.nameSnapshot}</span>
                      </div>
                      {item.itemNotes && (
                        <span style={{ color: '#6b7280', fontSize: '13px', marginLeft: '24px' }}>→ {item.itemNotes}</span>
                      )}
                      {item.customizations && Object.keys(item.customizations).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginLeft: '24px', marginTop: '4px' }}>
                          {Object.entries(item.customizations).map(([k, v]) => (
                            <span key={k} style={{ backgroundColor: '#e5e7eb', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                
                <footer style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                  {order.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => transition(order.id, 'CONFIRMED', { version: order.version })}
                        style={{ flex: 1, padding: '10px', backgroundColor: '#34d399', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✅ Confirmer
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Raison du refus ?');
                          if (reason) transition(order.id, 'REJECTED', { version: order.version, reason });
                        }}
                        style={{ flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ❌ Refuser
                      </button>
                    </>
                  )}
                  
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => transition(order.id, 'PREPARING', { version: order.version })}
                      style={{ flex: 1, padding: '10px', backgroundColor: '#60a5fa', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      👨‍🍳 Commencer
                    </button>
                  )}
                  
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => transition(order.id, 'READY', { version: order.version })}
                      style={{ flex: 1, padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🍽️ Prête
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.02)', padding: '10px 16px', borderRadius: '8px' }}>
      <span style={{ fontSize: '24px', fontWeight: 'bold', color: color || '#1f2937' }}>{value}</span>
      <span style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  );
}
