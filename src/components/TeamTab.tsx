// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  UserPlus, Mail, Smartphone, LogOut, MoreVertical,
  Shield, Clock, CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { api } from '../api';

// ─── Types ─────────────────────────────────────────────────────
interface TeamMember {
  id: string;
  hotelRole: string;
  department: string;
  position: string;
  lastActiveAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

interface Invitation {
  id: string;
  email: string;
  proposedRole: string;
  status: string;
  expiresAt: string;
  invitedBy: { firstName: string; lastName: string };
}

interface ActiveSession {
  id: string;
  deviceName: string;
  location: string;
  ipAddress: string;
  lastUsedAt: string;
}

interface TeamTabProps {
  language: 'EN' | 'FR' | 'RU';
  addAuditLog: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT', role?: string) => void;
}

// ─── Role badge colors ─────────────────────────────────────────
const ROLE_BADGE: Record<string, string> = {
  OWNER:   'bg-red-500/20 text-red-300 border-red-500/40',
  ADMIN:   'bg-amber-500/20 text-amber-300 border-amber-500/40',
  MANAGER: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  STAFF:   'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  VIEWER:  'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const ROLES = ['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

export const TeamTab: React.FC<TeamTabProps> = ({ language, addAuditLog }) => {
  const [members, setMembers]         = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [sessions, setSessions]       = useState<ActiveSession[]>([]);
  const [loading, setLoading]         = useState(false);
  const [activeSection, setActiveSection] = useState<'members' | 'invites' | 'sessions'>('members');

  // Invite form state
  const [showInviteForm, setShowInviteForm]     = useState(false);
  const [inviteEmail, setInviteEmail]           = useState('');
  const [inviteRole, setInviteRole]             = useState('STAFF');
  const [inviteDept, setInviteDept]             = useState('');
  const [invitePosition, setInvitePosition]     = useState('');
  const [inviteMessage, setInviteMessage]       = useState('');
  const [inviteLoading, setInviteLoading]       = useState(false);
  const [successMsg, setSuccessMsg]             = useState('');

  // Load data from backend
  const loadData = async () => {
    setLoading(true);
    try {
      const [m, i, s] = await Promise.allSettled([
        api.team.listMembers(),
        api.team.listInvitations(),
        api.team.listSessions(),
      ]);
      if (m.status === 'fulfilled') setMembers(m.value);
      if (i.status === 'fulfilled') setInvitations(i.value);
      if (s.status === 'fulfilled') setSessions(s.value);
    } catch {
      // Backend may not be running locally — fail silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    try {
      await api.team.createInvitation({
        email: inviteEmail.trim(),
        proposedRole: inviteRole,
        department: inviteDept || undefined,
        position: invitePosition || undefined,
        personalMessage: inviteMessage || undefined,
      });
      addAuditLog('TEAM_INVITATION_SENT', `Invitation sent to ${inviteEmail} (role: ${inviteRole})`, 'AUTHORIZED');
      setSuccessMsg(`✅ Invitation envoyée à ${inviteEmail}`);
      setInviteEmail(''); setInviteDept(''); setInvitePosition(''); setInviteMessage('');
      setShowInviteForm(false);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setSuccessMsg(`❌ Erreur: ${err.message}`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await api.team.revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {}
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Révoquer toutes vos autres sessions actives ?')) return;
    try {
      await api.team.revokeAllSessions();
      setSessions([]);
    } catch {}
  };

  const pendingInvites = invitations.filter(i => i.status === 'PENDING');

  return (
    <div className="space-y-6 animate-fade-in" id="team-tab">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Gestion de l'Équipe & Permissions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Invitez, gérez les rôles et surveillez les sessions actives de votre équipe.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-sm font-semibold transition"
          >
            <UserPlus className="w-4 h-4" />
            Inviter un membre
          </button>
        </div>
      </div>

      {/* ── Success Message ──────────────────────────────────── */}
      {successMsg && (
        <div className={`p-3 rounded-xl text-sm font-medium border ${successMsg.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {successMsg}
        </div>
      )}

      {/* ── Invite Form ────────────────────────────────────── */}
      {showInviteForm && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-slate-900/70 animate-fade-in">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" /> Nouvelle Invitation
          </h3>
          <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Email *</label>
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="marie@hotel.com" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Rôle *</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                {ROLES.map(r => (
                  <option key={r} value={r}>
                    {r === 'OWNER' ? 'Propriétaire' : r === 'ADMIN' ? 'Administrateur' : r === 'MANAGER' ? 'Manager' : r === 'STAFF' ? 'Personnel' : 'Lecteur'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Département</label>
              <input value={inviteDept} onChange={e => setInviteDept(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Réception, Cuisine..." />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Poste</label>
              <input value={invitePosition} onChange={e => setInvitePosition(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Chef de rang, Gouvernante..." />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Message personnel</label>
              <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} rows={2}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500 resize-none"
                placeholder="Bienvenue dans l'équipe !" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={inviteLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition disabled:opacity-50">
                {inviteLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Envoyer l'invitation
              </button>
              <button type="button" onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Section Nav ─────────────────────────────────────── */}
      <div className="flex gap-2 border-b border-slate-700/50 pb-1">
        {(['members', 'invites', 'sessions'] as const).map(sec => (
          <button key={sec} onClick={() => setActiveSection(sec)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${activeSection === sec ? 'bg-slate-800 text-white border-b-2 border-amber-500' : 'text-slate-400 hover:text-white'}`}>
            {sec === 'members' ? `👥 Membres (${members.length})` : sec === 'invites' ? `📨 Invitations (${pendingInvites.length})` : `🔐 Sessions (${sessions.length})`}
          </button>
        ))}
      </div>

      {/* ── Members Table ───────────────────────────────────── */}
      {activeSection === 'members' && (
        <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden">
          {members.length === 0 ? (
            <div className="p-10 text-center text-slate-500">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun membre trouvé. Vérifiez que le backend est démarré.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700 bg-slate-900/50">
                  <th className="text-left px-5 py-3">Membre</th>
                  <th className="text-left px-5 py-3">Rôle</th>
                  <th className="text-left px-5 py-3 hidden sm:table-cell">Département</th>
                  <th className="text-left px-5 py-3 hidden md:table-cell">Dernière activité</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-b border-slate-800 hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white">{m.user.firstName} {m.user.lastName}</div>
                      <div className="text-xs text-slate-500">{m.user.email}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${ROLE_BADGE[m.hotelRole] || ROLE_BADGE.VIEWER}`}>
                        {m.hotelRole}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 hidden sm:table-cell">{m.department || '—'}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">
                      {m.lastActiveAt ? new Date(m.lastActiveAt).toLocaleString('fr-FR') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-slate-500 hover:text-slate-300 transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Invitations ────────────────────────────────────── */}
      {activeSection === 'invites' && (
        <div className="space-y-3">
          {pendingInvites.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center text-slate-500 border border-white/10">
              <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune invitation en attente.</p>
            </div>
          ) : (
            pendingInvites.map(inv => (
              <div key={inv.id} className="glass-panel flex items-center justify-between p-4 rounded-2xl border border-slate-700 bg-slate-900/50">
                <div>
                  <div className="font-medium text-white">{inv.email}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Invité par {inv.invitedBy?.firstName} — Expire le {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${ROLE_BADGE[inv.proposedRole] || ROLE_BADGE.VIEWER}`}>
                    {inv.proposedRole}
                  </span>
                  <button onClick={() => api.team.revokeInvitation(inv.id).then(loadData)} className="text-slate-500 hover:text-red-400 transition">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Sessions ───────────────────────────────────────── */}
      {activeSection === 'sessions' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            {sessions.length > 1 && (
              <button onClick={handleRevokeAllSessions}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition">
                <LogOut className="w-3 h-3" /> Déconnecter toutes les autres sessions
              </button>
            )}
          </div>
          {sessions.length === 0 ? (
            <div className="glass-panel p-10 rounded-3xl text-center text-slate-500 border border-white/10">
              <Smartphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune session active trouvée.</p>
            </div>
          ) : (
            sessions.map(s => (
              <div key={s.id} className="glass-panel flex items-center justify-between p-4 rounded-2xl border border-slate-700 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{s.deviceName || 'Appareil inconnu'}</div>
                    <div className="text-xs text-slate-500">
                      {s.location || s.ipAddress} — {new Date(s.lastUsedAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleRevokeSession(s.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition">
                  <LogOut className="w-3 h-3" /> Révoquer
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
