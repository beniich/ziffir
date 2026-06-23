import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const ACTIVITIES = [
  { id: 1, title: 'Spa & Wellness', date: '2025-01-20', time: '14:00', spots: 4, image: '🧖' },
  { id: 2, title: 'Dégustation de vins', date: '2025-01-22', time: '19:00', spots: 8, image: '🍷' },
  { id: 3, title: 'Cours de cuisine', date: '2025-01-25', time: '10:00', spots: 6, image: '👨🍳' },
  { id: 4, title: 'Excursion culturelle', date: '2025-01-27', time: '09:00', spots: 12, image: '🏛️' },
];

export default function Activities() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Activités & Expériences</h1>
      <p className="text-slate-400">Découvrez nos événements exclusifs</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACTIVITIES.map((act) => (
          <Card key={act.id} variant="glass-strong" padding="lg" hoverable>
            <div className="flex items-start gap-4">
              <div className="text-5xl">{act.image}</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-100">{act.title}</h3>
                <div className="text-sm text-slate-400 mt-1">
                  📅 {new Date(act.date).toLocaleDateString('fr-FR')} • 🕐 {act.time}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <Badge variant="cyber">{act.spots} places</Badge>
                  <Button variant="primary" size="sm">Réserver</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
