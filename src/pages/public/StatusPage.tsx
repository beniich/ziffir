import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';

type ComponentStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance';

interface ComponentInfo {
  id: string;
  name: string;
  description: string;
  status: ComponentStatus;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  affectedComponents: string[];
  createdAt: string;
  resolvedAt: string | null;
  updates: Array<{
    id: string;
    status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
    message: string;
    createdAt: string;
  }>;
}

interface Maintenance {
  id: string;
  title: string;
  description: string;
  scheduledStart: string;
  scheduledEnd: string;
  affectedComponents: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

interface UptimeDay {
  date: string;
  uptime: number; // 0-100
}

const STATUS_CONFIG: Record<ComponentStatus, { label: string; color: string; icon: string }> = {
  operational:    { label: 'Opérationnel',      color: '#10b981', icon: '✓' },
  degraded:       { label: 'Performance réduite', color: '#f59e0b', icon: '⚠️' },
  partial_outage: { label: 'Panne partielle',   color: '#f97316', icon: '⚠️' },
  major_outage:   { label: 'Panne majeure',     color: '#ef4444', icon: '✕' },
  maintenance:    { label: 'Maintenance',       color: '#3b82f6', icon: '🔧' },
};

const INCIDENT_STATUS_LABELS: Record<string, string> = {
  investigating: 'Investigation en cours',
  identified: 'Identifié',
  monitoring: 'Surveillance',
  resolved: 'Résolu',
};

const SEVERITY_LABELS: Record<string, string> = {
  minor: 'Mineur',
  major: 'Majeur',
  critical: 'Critique',
};

const SEVERITY_COLORS: Record<string, string> = {
  minor: '#3b82f6',
  major: '#f59e0b',
  critical: '#ef4444',
};

export function StatusPage() {
  const [components, setComponents] = useState<ComponentInfo[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [uptime, setUptime] = useState<UptimeDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // -------------------------------------------------------------------------
  // Fetch initial + auto-refresh
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Mocking the fetch to provide a realistic preview
    const fetchStatus = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setComponents([
          { id: '1', name: 'API Principale', description: 'API backend pour l\'application Ziffir', status: 'operational' },
          { id: '2', name: 'Domotique', description: 'Service de contrôle des chambres', status: 'operational' },
          { id: '3', name: 'Base de données', description: 'Stockage des données sécurisé', status: 'operational' },
          { id: '4', name: 'Module d\'IA', description: 'Prédictions et analyses', status: 'operational' },
          { id: '5', name: 'Paiements', description: 'Passerelle de paiement Stripe', status: 'operational' },
        ]);
        
        setIncidents([]); // No active incidents
        
        setMaintenances([]); // No scheduled maintenance
        
        // Mock 90 days of uptime (all 100%)
        const past90Days = Array.from({ length: 90 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (89 - i));
          return { date: d.toISOString().split('T')[0], uptime: 100 };
        });
        setUptime(past90Days);
        
      } catch (err) {
        console.error("Erreur lors de la récupération du statut :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    let intervalId: number | undefined;
    if (autoRefresh) {
      intervalId = window.setInterval(fetchStatus, 60000); // 1 minute
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh]);

  const overallStatus = components.some(c => c.status === 'major_outage') 
    ? 'major_outage' 
    : components.some(c => c.status === 'partial_outage') 
      ? 'partial_outage' 
      : components.some(c => c.status === 'degraded') 
        ? 'degraded' 
        : 'operational';

  return (
    <PublicLayout
      title="Statut du système | Ziffir"
      description="Consultez l'état actuel des services Ziffir, les incidents en cours et l'historique de disponibilité."
    >
      <SEO 
        title="Statut du système"
        description="Consultez l'état actuel des services Ziffir et l'historique de disponibilité."
        url="/status"
      />

      <div className="ambient-glow glow-1" />

      <main className="max-w-5xl mx-auto px-4 py-24 min-h-screen">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex justify-between items-end mb-6">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#3b82f6]/10 border border-[#3b82f6]/20 text-[#3b82f6] text-sm font-semibold mb-4">Support & Infrastructure</span>
              <h1 className="text-4xl font-bold text-slate-100">Statut du système Ziffir</h1>
            </div>
            
            <button type="button" 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`text-sm flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                autoRefresh ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-slate-700 text-slate-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`} />
              Actualisation auto {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>

          {loading ? (
            <div className="h-32 rounded-xl bg-slate-900/50 border border-slate-800 animate-pulse flex items-center justify-center">
              <span className="text-slate-500">Vérification de l'état des systèmes...</span>
            </div>
          ) : (
            <>
              {/* Overall Status Banner */}
              <div 
                className="p-6 rounded-xl border flex items-center gap-4 mb-10 shadow-lg"
                style={{ 
                  backgroundColor: `${STATUS_CONFIG[overallStatus].color}15`,
                  borderColor: `${STATUS_CONFIG[overallStatus].color}40`,
                  color: STATUS_CONFIG[overallStatus].color
                }}
              >
                <div className="text-3xl">{STATUS_CONFIG[overallStatus].icon}</div>
                <div>
                  <h2 className="text-xl font-bold mb-1">
                    {overallStatus === 'operational' ? 'Tous les systèmes sont opérationnels' : 'Problèmes détectés sur certains services'}
                  </h2>
                  <p className="opacity-80 text-sm">Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}</p>
                </div>
              </div>

              {/* Components List */}
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden mb-12">
                <h3 className="text-lg font-bold text-slate-200 p-5 border-b border-slate-800 bg-slate-900/60">Services et Composants</h3>
                <div className="divide-y divide-slate-800/50">
                  {components.map(comp => (
                    <div key={comp.id} className="p-5 flex justify-between items-center hover:bg-slate-800/30 transition-colors">
                      <div>
                        <div className="font-medium text-slate-200">{comp.name}</div>
                        <div className="text-sm text-slate-500 mt-1">{comp.description}</div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: `${STATUS_CONFIG[comp.status].color}15`, color: STATUS_CONFIG[comp.status].color }}>
                        <span>{STATUS_CONFIG[comp.status].icon}</span>
                        {STATUS_CONFIG[comp.status].label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Uptime Graph */}
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 p-6 mb-12">
                <h3 className="text-lg font-bold text-slate-200 mb-6">Disponibilité (90 derniers jours)</h3>
                <div className="flex gap-1 h-12 items-end">
                  {uptime.map((day, i) => (
                    <div 
                      key={day.date}
                      className="flex-1 rounded-sm group relative"
                      style={{ 
                        height: '100%', 
                        backgroundColor: day.uptime >= 99.9 ? '#10b981' : day.uptime >= 95 ? '#f59e0b' : '#ef4444',
                        opacity: 0.8
                      }}
                    >
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-xs px-2 py-1 rounded whitespace-nowrap z-10 transition-opacity pointer-events-none shadow-xl border border-slate-700">
                        {new Date(day.date).toLocaleDateString('fr-FR')} : {day.uptime}%
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-3 font-mono">
                  <span>Il y a 90 jours</span>
                  <span>100% de disponibilité</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>

              {/* Incidents & Maintenance */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Incidents récents
                  </h3>
                  {incidents.length > 0 ? (
                    <div className="space-y-4">
                      {incidents.map(inc => (
                        <div key={inc.id} className="p-4 rounded-lg border border-slate-800 bg-slate-900/30">
                          <div className="font-medium text-slate-200">{inc.title}</div>
                          <div className="text-sm text-slate-400 mt-1">{INCIDENT_STATUS_LABELS[inc.status]}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-slate-800/50 bg-slate-900/20 text-center text-slate-500">
                      Aucun incident enregistré récemment.
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Maintenances prévues
                  </h3>
                  {maintenances.length > 0 ? (
                    <div className="space-y-4">
                      {maintenances.map(m => (
                        <div key={m.id} className="p-4 rounded-lg border border-slate-800 bg-slate-900/30">
                          <div className="font-medium text-slate-200">{m.title}</div>
                          <div className="text-sm text-slate-400 mt-1">Prévu pour le : {new Date(m.scheduledStart).toLocaleDateString('fr-FR')}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 rounded-xl border border-slate-800/50 bg-slate-900/20 text-center text-slate-500">
                      Aucune maintenance programmée.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </PublicLayout>
  );
}
