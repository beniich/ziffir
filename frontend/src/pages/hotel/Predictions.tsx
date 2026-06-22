import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Badge } from '../../components/ui/Badge';
import { api } from '../../shared/api/client';
import { TrendingUp, AlertTriangle, CalendarDays, Percent } from 'lucide-react';

export default function Predictions() {
  const { data: forecast = [], isLoading: loadingForecast } = useQuery({
    queryKey: ['ml', 'forecast'],
    queryFn: () => api.hotel.mlForecast(7), // À ajouter dans shared/api/client
  });

  const { data: anomalies = [], isLoading: loadingAnomalies } = useQuery({
    queryKey: ['ml', 'anomalies'],
    queryFn: () => api.hotel.mlAnomalies(), // À ajouter dans shared/api/client
  });

  if (loadingForecast || loadingAnomalies) {
    return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
        <TrendingUp className="w-8 h-8 text-cyan-400" />
        <div>
          <h1 className="text-3xl font-bold text-slate-100">AI Forecasting & Insights</h1>
          <p className="text-slate-400">Prédictions d'occupation et détection d'anomalies en temps réel.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="glass" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-cyan-400" />
              Prévisions d'Occupation (7 prochains jours)
            </CardTitle>
          </CardHeader>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400">
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Occupation Prévue</th>
                  <th className="p-3 font-medium">Confiance</th>
                  <th className="p-3 font-medium">Action Recommandée</th>
                </tr>
              </thead>
              <tbody>
                {forecast.map((f: any, i: number) => (
                  <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                    <td className="p-3 text-slate-200">
                      {new Date(f.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${f.occupancyRate > 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${f.occupancyRate}%` }}
                          />
                        </div>
                        <span className="text-slate-300 font-semibold">{f.occupancyRate}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="ghost" className="text-cyan-400 border-cyan-400/30">
                        {Math.round(f.confidence * 100)}%
                      </Badge>
                    </td>
                    <td className="p-3">
                      {f.recommendedPriceMultiplier > 1 ? (
                        <span className="text-emerald-400 flex items-center gap-1 text-sm font-semibold">
                          <TrendingUp className="w-4 h-4" /> Augmenter les prix de {Math.round((f.recommendedPriceMultiplier - 1)*100)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Maintenir les tarifs</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card variant="glass" className="border-red-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Anomalies Détectées
            </CardTitle>
          </CardHeader>
          <div className="mt-4 space-y-4">
            {anomalies.length === 0 ? (
              <div className="text-slate-400 text-center py-8">Aucune anomalie détectée aujourd'hui.</div>
            ) : (
              anomalies.map((a: any, i: number) => (
                <div key={i} className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="danger" size="sm">{a.type}</Badge>
                    <span className="text-xs text-slate-500">
                      {new Date(a.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{a.description}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
