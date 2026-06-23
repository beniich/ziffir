import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { toast } from '../../components/ui/Toast';
import { api } from '../../shared/api/client';
import { Lightbulb, Wind, Music, EyeOff } from 'lucide-react';

export default function HotelControls() {
  const qc = useQueryClient();
  const { data: controls = [], isLoading } = useQuery({
    queryKey: ['hotel', 'controls'],
    queryFn: () => api.hotel.controls(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => api.hotel.updateControl(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['hotel', 'controls'] });
    },
    onError: (err: Error) => toast.error('Erreur', err.message),
  });

  if (isLoading) return <Spinner variant="spinner" size="xl" fullScreen />;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Contrôle des Suites</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {controls.map((ctrl: any) => (
          <Card key={ctrl.id} variant="glass-strong" padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-100">
                {ctrl.room?.number || 'Suite'}
              </h3>
              <button
                onClick={() => updateMutation.mutate({ id: ctrl.id, data: { doNotDisturb: !ctrl.doNotDisturb } })}
                className={`p-2 rounded-lg transition-colors ${ctrl.doNotDisturb ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Lightbulb className={`w-4 h-4 ${ctrl.lights ? 'text-amber-400' : 'text-slate-500'}`} />
                  Éclairage
                </div>
                <button
                  onClick={() => updateMutation.mutate({ id: ctrl.id, data: { lights: !ctrl.lights } })}
                  className={`px-3 py-1 rounded text-xs font-bold ${ctrl.lights ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700 text-slate-400'}`}
                >
                  {ctrl.lights ? 'ON' : 'OFF'}
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    Climatisation
                  </div>
                  <span className="font-mono text-cyan-400">{ctrl.climate}°C</span>
                </div>
                <input
                  type="range" min={16} max={30} value={ctrl.climate}
                  onChange={(e) => updateMutation.mutate({ id: ctrl.id, data: { climate: Number(e.target.value) } })}
                  className="w-full accent-cyan-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Music className={`w-4 h-4 ${ctrl.music ? 'text-purple-400' : 'text-slate-500'}`} />
                  Musique
                </div>
                <button
                  onClick={() => updateMutation.mutate({ id: ctrl.id, data: { music: !ctrl.music } })}
                  className={`px-3 py-1 rounded text-xs font-bold ${ctrl.music ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-700 text-slate-400'}`}
                >
                  {ctrl.music ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
