// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  UserPlus, Mail, Shield, Clock, CheckCircle, XCircle, RefreshCw,
  Edit2, Trash2, Lock, Eye, EyeOff, ChevronDown, Users, Search,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { api, BackendUser } from '../../../api';
import confetti from 'canvas-confetti';

interface TeamTabProps {
  language?: 'EN' | 'FR' | 'RU';
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT') => void;
}

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-500/20 text-red-300 border-red-500/40',
  ADMIN:       'bg-amber-500/20 text-amber-300 border-amber-500/40',
  MANAGER:     'bg-blue-500/20 text-blue-300 border-blue-500/40',
  STAFF:       'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  VIEWER:      'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN:       'Administrateur',
  MANAGER:     'Manager',
  STAFF:       'Personnel',
  VIEWER:      'Lecteur',
};

const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'VIEWER'];

export const TeamTab: React.FC<TeamTabProps> = ({ language = 'FR', addAuditLog }) => {
  const [users, setUsers]           = useState<BackendUser[]>([]);
  const [loading, setLoading]       = useState(false);
  const [searchQuery, setSearch]    = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg]     = useState('');

  // Create form
  const [showCreate, setShowCreate]         = useState(false);
  const [newEmail, setNewEmail]             = useState('');
  const [newFirst, setNewFirst]             = useState('');
  const [newLast, setNewLast]               = useState('');
  const [newRole, setNewRole]               = useState('STAFF');
  const [newPassword, setNewPassword]       = useState('');
  const [showPassword, setShowPassword]     = useState(false);
  const [createLoading, setCreateLoading]   = useState(false);

  // Edit modal
  const [editUser, setEditUser]             = useState<BackendUser | null>(null);
  const [editRole, setEditRole]             = useState('STAFF');
  const [editActive, setEditActive]         = useState(true);

  // Password reset modal
  const [pwResetUser, setPwResetUser]       = useState<BackendUser | null>(null);
  const [newPw, setNewPw]                   = useState('');
  const [showNewPw, setShowNewPw]           = useState(false);
  const [pwLoading, setPwLoading]           = useState(false);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 5000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showError('Erreur de chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFirst || !newLast || !newPassword) return;
    setCreateLoading(true);
    try {
      const user = await api.users.create({
        email: newEmail,
        firstName: newFirst,
        lastName: newLast,
        role: newRole,
        password: newPassword,
      });
      setUsers(prev => [user, ...prev]);
      setShowCreate(false);
      setNewEmail(''); setNewFirst(''); setNewLast(''); setNewPassword('');
      showSuccess(`✅ Compte créé pour ${newFirst} ${newLast}`);
      addAuditLog?.('USER_CREATED', `Compte créé: ${newEmail}`, 'AUTHORIZED');
      confetti({ particleCount: 40, colors: ['#c19a6b', '#ffffff'] });
    } catch (err: any) {
      showError(`❌ ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      const updated = await api.users.update(editUser.id, { role: editRole, isActive: editActive });
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...updated } : u));
      setEditUser(null);
      showSuccess(`✅ Rôle de ${editUser.firstName} mis à jour`);
      addAuditLog?.('USER_ROLE_CHANGED', `Rôle changé: ${editUser.email} → ${editRole}`, 'AUTHORIZED');
    } catch (err: any) {
      showError(`❌ ${err.message}`);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwResetUser || !newPw) return;
    if (newPw.length < 8) { showError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setPwLoading(true);
    try {
      await api.users.resetPassword(pwResetUser.id, newPw);
      setPwResetUser(null);
      setNewPw('');
      showSuccess(`✅ Mot de passe réinitialisé pour ${pwResetUser.firstName}`);
      addAuditLog?.('USER_PASSWORD_RESET', `Mot de passe réinitialisé: ${pwResetUser.email}`, 'AUTHORIZED');
    } catch (err: any) {
      showError(`❌ ${err.message}`);
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeactivate = async (user: BackendUser) => {
    if (!confirm(`Désactiver le compte de ${user.firstName} ${user.lastName} ?`)) return;
    try {
      await api.users.deactivate(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: false } : u));
      showSuccess(`✅ Compte de ${user.firstName} désactivé`);
      addAuditLog?.('USER_DEACTIVATED', `Compte désactivé: ${user.email}`, 'AUTHORIZED');
    } catch (err: any) {
      showError(`❌ ${err.message}`);
    }
  };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount   = users.filter(u => u.isActive).length;
  const adminCount    = users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length;
  const managerCount  = users.filter(u => u.role === 'MANAGER').length;

  return (
    <div className="space-y-6 animate-fade-in" id="team-tab">

      {/* ── Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Membres actifs', value: activeCount, icon: Users, color: 'text-emerald-400' },
          { label: 'Administrateurs', value: adminCount, icon: ShieldCheck, color: 'text-amber-400' },
          { label: 'Managers', value: managerCount, icon: Shield, color: 'text-blue-400' },
        ].map(stat => (
          <div key={stat.label} className="glass-panel p-4 rounded-2xl border border-white/10 bg-slate-900/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────── */}
      <div className="glass-panel p-5 rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/80 to-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" /> Gestion des Accès & Rôles
          </h2>
          <p className="text-xs text-slate-400 mt-1">Créez, modifiez et révoquez les accès de votre équipe.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadUsers} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-sm font-semibold transition"
          >
            <UserPlus className="w-4 h-4" /> Nouveau Membre
          </button>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="p-3 rounded-xl text-sm font-medium border bg-emerald-500/10 border-emerald-500/30 text-emerald-300">{successMsg}</div>
      )}
      {errorMsg && (
        <div className="p-3 rounded-xl text-sm font-medium border bg-red-500/10 border-red-500/30 text-red-300">{errorMsg}</div>
      )}

      {/* ── Create Form ─────────────────────────────── */}
      {showCreate && (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 bg-slate-900/70 animate-fade-in">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" /> Nouveau Compte
          </h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Prénom *</label>
              <input value={newFirst} onChange={e => setNewFirst(e.target.value)} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Sophie" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Nom *</label>
              <input value={newLast} onChange={e => setNewLast(e.target.value)} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="Martin" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Email *</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                placeholder="sophie@hotel.com" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Rôle</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Mot de passe * (min. 8 car.)</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 pr-9 text-white text-sm focus:outline-none focus:border-amber-500"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={createLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition disabled:opacity-50">
                {createLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Créer le compte
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search ──────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={searchQuery} onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
          placeholder="Rechercher un membre..." />
      </div>

      {/* ── Users Table ─────────────────────────────── */}
      <div className="glass-panel rounded-3xl border border-white/10 bg-slate-900/50 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{loading ? 'Chargement...' : 'Aucun membre trouvé.'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-700 bg-slate-900/50">
                <th className="text-left px-5 py-3">Membre</th>
                <th className="text-left px-5 py-3">Rôle</th>
                <th className="text-left px-5 py-3 hidden sm:table-cell">Statut</th>
                <th className="text-left px-5 py-3 hidden md:table-cell">Dernière connexion</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className={`border-b border-slate-800 hover:bg-slate-800/40 transition ${!u.isActive ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${ROLE_BADGE[u.role] || ROLE_BADGE.VIEWER}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className={`text-xs flex items-center gap-1 ${u.isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {u.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {u.isActive ? 'Actif' : 'Désactivé'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-500 hidden md:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR') : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {/* Edit role */}
                      <button
                        onClick={() => { setEditUser(u); setEditRole(u.role); setEditActive(u.isActive); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 transition"
                        title="Modifier le rôle"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {/* Reset password */}
                      <button
                        onClick={() => { setPwResetUser(u); setNewPw(''); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-sky-500/10 transition"
                        title="Réinitialiser le mot de passe"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      {/* Deactivate */}
                      {u.isActive && (
                        <button
                          onClick={() => handleDeactivate(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Désactiver le compte"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit Role Modal ─────────────────────────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" />
              Modifier {editUser.firstName} {editUser.lastName}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Rôle</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500">
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Compte actif</span>
                <button
                  onClick={() => setEditActive(a => !a)}
                  className={`w-12 h-6 rounded-full transition-colors duration-200 ${editActive ? 'bg-emerald-500' : 'bg-slate-600'} relative`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${editActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleEditSave}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm transition">
                Enregistrer
              </button>
              <button onClick={() => setEditUser(null)}
                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Password Reset Modal ────────────────────── */}
      {pwResetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-400" />
              Nouveau mot de passe
            </h3>
            <p className="text-xs text-slate-400 mb-4">Pour : <span className="text-slate-200">{pwResetUser.email}</span></p>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-1 block">Nouveau mot de passe *</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPw} onChange={e => setNewPw(e.target.value)} required minLength={8}
                    className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 pr-9 text-white text-sm focus:outline-none focus:border-sky-500"
                    placeholder="Min. 8 caractères..." />
                  <button type="button" onClick={() => setShowNewPw(s => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {newPw.length > 0 && newPw.length < 8 && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Au moins 8 caractères requis
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={pwLoading || newPw.length < 8}
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {pwLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Réinitialiser
                </button>
                <button type="button" onClick={() => setPwResetUser(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm transition">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
