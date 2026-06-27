import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Textarea } from '../components/ui/Textarea';
import { toast } from '../components/ui/Toast';
import { api } from '../shared/api/client';
import { UserPlus, Mail, MoreVertical, Shield, LogOut, Smartphone } from 'lucide-react';

export default function TeamPage() {
  const qc = useQueryClient();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    proposedRole: 'STAFF',
    department: '',
    position: '',
    personalMessage: '',
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => api.team.listMembers(),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['team-invitations'],
    queryFn: () => api.team.listInvitations(),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: () => api.team.listSessions(),
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.team.createInvitation(inviteData),
    onSuccess: () => {
      toast.success('Invitation envoyée', `${inviteData.email} recevra un email`);
      qc.invalidateQueries({ queryKey: ['team-invitations'] });
      setInviteModal(false);
      setInviteData({ email: '', proposedRole: 'STAFF', department: '', position: '', personalMessage: '' });
    },
    onError: (err: Error) => toast.error('Erreur', err.message),
  });

  const revokeSessionMutation = useMutation({
    mutationFn: (sessionId: string) => api.team.revokeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.success('Session révoquée');
    },
  });

  const revokeAllMutation = useMutation({
    mutationFn: () => api.team.revokeAllSessions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-sessions'] });
      toast.warning('Toutes vos autres sessions ont été déconnectées');
    },
  });

  const ROLE_COLORS = {
    OWNER: 'danger',
    ADMIN: 'gold',
    MANAGER: 'warning',
    STAFF: 'info',
    VIEWER: 'neutral',
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div className="p-8 space-y-8">
      {/* Membres */}
      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>👥 Équipe ({members.length})</CardTitle>
            <Button variant="primary" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setInviteModal(true)}>
              Inviter un membre
            </Button>
          </div>
        </CardHeader>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-400 border-b border-slate-700">
              <th className="text-left py-2">Membre</th>
              <th className="text-left py-2">Rôle</th>
              <th className="text-left py-2">Département</th>
              <th className="text-left py-2">Dernière activité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.id} className="border-b border-slate-800">
                <td className="py-3">
                  <div className="font-medium text-slate-100">{m.user.firstName} {m.user.lastName}</div>
                  <div className="text-xs text-slate-400">{m.user.email}</div>
                </td>
                <td><Badge variant={ROLE_COLORS[m.hotelRole as keyof typeof ROLE_COLORS] as any}>{m.hotelRole}</Badge></td>
                <td className="text-sm text-slate-300">{m.department || '—'}</td>
                <td className="text-sm text-slate-400">
                  {m.lastActiveAt ? new Date(m.lastActiveAt).toLocaleString('fr-FR') : '—'}
                </td>
                <td><button className="text-slate-400 hover:text-slate-100"><MoreVertical className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Invitations en attente */}
      {invitations.filter((i: any) => i.status === 'PENDING').length > 0 && (
        <Card variant="glass-strong" padding="lg">
          <CardHeader><CardTitle>📨 Invitations en attente ({invitations.filter((i: any) => i.status === 'PENDING').length})</CardTitle></CardHeader>
          {invitations.filter((i: any) => i.status === 'PENDING').map((inv: any) => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 mb-2">
              <div>
                <div className="font-medium">{inv.email}</div>
                <div className="text-xs text-slate-400">
                  Invité par {inv.invitedBy?.firstName} • Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <Badge variant={ROLE_COLORS[inv.proposedRole as keyof typeof ROLE_COLORS] as any}>
                {inv.proposedRole}
              </Badge>
            </div>
          ))}
        </Card>
      )}

      {/* Sessions actives */}
      <Card variant="glass-strong" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🔐 Sessions actives ({sessions.length})</CardTitle>
            {sessions.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => revokeAllMutation.mutate()}>
                Déconnecter les autres
              </Button>
            )}
          </div>
        </CardHeader>
        {sessions.map((s: any) => (
          <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 mb-2">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <div>
                <div className="font-medium">{s.deviceName || 'Appareil inconnu'}</div>
                <div className="text-xs text-slate-400">
                  {s.location || s.ipAddress} • Dernière utilisation : {new Date(s.lastUsedAt).toLocaleString('fr-FR')}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" leftIcon={<LogOut className="w-3 h-3" />}
              onClick={() => revokeSessionMutation.mutate(s.id)}>
              Révoquer
            </Button>
          </div>
        ))}
      </Card>

      {/* Modal d'invitation */}
      <Modal
        isOpen={inviteModal}
        onClose={() => setInviteModal(false)}
        title="Inviter un nouveau membre"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="marie@hotel.com"
            value={inviteData.email}
            onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
          />
          <Select
            label="Rôle"
            options={[
              { value: 'OWNER', label: 'Propriétaire (accès total)' },
              { value: 'ADMIN', label: 'Administrateur' },
              { value: 'MANAGER', label: 'Manager (opérations)' },
              { value: 'STAFF', label: 'Personnel (opérations quotidiennes)' },
              { value: 'VIEWER', label: 'Lecteur (lecture seule)' },
            ]}
            value={inviteData.proposedRole}
            onChange={(e) => setInviteData({ ...inviteData, proposedRole: e.target.value })}
          />
          <Input
            label="Département (optionnel)"
            placeholder="Réception, Cuisine, Housekeeping..."
            value={inviteData.department}
            onChange={(e) => setInviteData({ ...inviteData, department: e.target.value })}
          />
          <Input
            label="Poste (optionnel)"
            placeholder="Chef de rang, Gouvernante..."
            value={inviteData.position}
            onChange={(e) => setInviteData({ ...inviteData, position: e.target.value })}
          />
          <Textarea
            label="Message personnel (optionnel)"
            placeholder="Bienvenue dans l'équipe !"
            value={inviteData.personalMessage}
            onChange={(e) => setInviteData({ ...inviteData, personalMessage: e.target.value })}
            rows={3}
          />
          <Button
            variant="primary"
            fullWidth
            isLoading={inviteMutation.isPending}
            onClick={() => inviteMutation.mutate()}
            leftIcon={<Mail className="w-4 h-4" />}
          >
            Envoyer l'invitation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
