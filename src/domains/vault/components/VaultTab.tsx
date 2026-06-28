// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Unlock, CheckCircle, RefreshCw, Plus, ShieldAlert, FileText, Clock } from 'lucide-react';
import { api, BackendVaultDoc } from '../../../api';

interface VaultTabProps {
  addAuditLog?: (action: string, reason: string, status: 'AUTHORIZED' | 'BYPASS' | 'RESTRICTED_ATTEMPT') => void;
}

const SECURITY_LEVEL_COLORS: Record<string, string> = {
  PRESIDENTIAL: 'bg-red-500/20 text-red-300 border-red-500/40',
  ELITE:        'bg-amber-500/20 text-amber-300 border-amber-500/40',
  STANDARD:     'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
};

export const VaultTab: React.FC<VaultTabProps> = ({ addAuditLog }) => {
  const [docs, setDocs] = useState<(BackendVaultDoc & { decrypting?: boolean; progress?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [auditLog, setAuditLog] = useState<{ time: string; label: string; color: string }[]>([
    { time: '10:28', label: 'Access Granted: Exec Node', color: 'border-emerald-500/60' },
    { time: '10:25', label: 'File Decrypted: Contract_Acq_1', color: 'border-amber-500' },
    { time: '10:18', label: 'Unregistered Handshake Blocked', color: 'border-red-500/60' },
  ]);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Contracts');
  const [newDocLevel, setNewDocLevel] = useState('STANDARD');

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.vault.list();
      if (res.success) setDocs(res.data.map(d => ({ ...d, decrypting: false, progress: 0 })));
    } catch (err) {
      console.warn('[VaultTab] Backend unavailable, using empty state');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  const startDecrypt = async (id: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, decrypting: true, progress: 0 } : d));

    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setDocs(prev => prev.map(d => d.id === id ? { ...d, progress } : d));
    }, 200);

    try {
      await new Promise(res => setTimeout(res, 2500)); // Wait for animation
      const result = await api.vault.decrypt(id);
      if (result.success) {
        setDocs(prev => prev.map(d =>
          d.id === id ? { ...d, decrypting: false, progress: 100, encrypted: false, withdrawnAt: result.data.decryptedAt } : d
        ));
        setAuditLog(prev => [{
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          label: `File Decrypted: ${docs.find(d => d.id === id)?.name?.substring(0, 22)}...`,
          color: 'border-amber-500',
        }, ...prev.slice(0, 4)]);
        addAuditLog?.('VAULT_DECRYPT', `Document ${id} décryptographié`, 'AUTHORIZED');
      }
    } catch (err) {
      clearInterval(interval);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, decrypting: false, progress: 0 } : d));
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    try {
      const res = await api.vault.deposit({ name: newDocName, category: newDocCategory, securityLevel: newDocLevel });
      if (res.success) {
        setDocs(prev => [{ ...res.data, decrypting: false, progress: 0 }, ...prev]);
        setShowDepositForm(false);
        setNewDocName('');
        addAuditLog?.('VAULT_DEPOSIT', `Document ${newDocName} déposé dans le coffre`, 'AUTHORIZED');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="vault-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Document list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif-luxury text-slate-800 font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#c19a6b]" /> Secure Document Vault
              </h3>
              <div className="flex gap-2">
                <button onClick={loadDocs} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setShowDepositForm(!showDepositForm)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#c19a6b]/20 hover:bg-[#c19a6b]/30 border border-[#c19a6b]/40 text-[#7c5a30] text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Déposer
                </button>
              </div>
            </div>

            {/* Deposit form */}
            {showDepositForm && (
              <form onSubmit={handleDeposit} className="mb-4 p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c19a6b]" /> Nouveau Document Classifié
                </h4>
                <input
                  value={newDocName} onChange={e => setNewDocName(e.target.value)} required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c19a6b]"
                  placeholder="Nom du document..."
                />
                <div className="grid grid-cols-2 gap-2">
                  <select value={newDocCategory} onChange={e => setNewDocCategory(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c19a6b]">
                    {['Contracts', 'Legal', 'Travel', 'Finance', 'Confidential'].map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <select value={newDocLevel} onChange={e => setNewDocLevel(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#c19a6b]">
                    {['STANDARD', 'ELITE', 'PRESIDENTIAL'].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded-xl bg-[#c19a6b] text-white text-sm font-semibold transition hover:bg-[#a07840]">
                    Déposer
                  </button>
                  <button type="button" onClick={() => setShowDepositForm(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 text-sm transition hover:bg-slate-300">
                    Annuler
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3 animate-fade-in">
              {docs.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-400">
                  <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Coffre vide — déposez votre premier document</p>
                </div>
              )}
              {docs.map((doc) => (
                <div key={doc.id} className="p-4 bg-white/45 border border-white/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#c19a6b]/70 transition-all duration-300 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.encrypted ? 'bg-[#c19a6b]/20 text-[#7c5a30] border border-[#c19a6b]/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-300/30'
                    }`}>
                      {doc.encrypted ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        {doc.name}
                        {doc.decrypting && (
                          <span className="text-xs text-sky-600 animate-pulse font-mono">
                            (Decrypting {Math.floor(doc.progress || 0)}%)
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        {doc.docRef} · SHA: ZV7A-{doc.hash?.substring(0, 8)}
                      </p>
                      {/* Progress bar during decryption */}
                      {doc.decrypting && (
                        <div className="mt-1.5 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#c19a6b] to-[#7c5a30] rounded-full transition-all duration-200"
                            style={{ width: `${doc.progress || 0}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${SECURITY_LEVEL_COLORS[doc.securityLevel] || SECURITY_LEVEL_COLORS.STANDARD}`}>
                      {doc.securityLevel}
                    </span>
                    {doc.encrypted ? (
                      <button
                        onClick={() => startDecrypt(doc.id)}
                        disabled={doc.decrypting}
                        className="text-xs bg-[#c19a6b]/20 hover:bg-[#c19a6b] hover:text-white text-[#7c5a30] border border-[#c19a6b]/40 font-mono font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 duration-200 disabled:opacity-50"
                      >
                        {doc.decrypting ? 'Decrypting...' : 'Decrypt File'}
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> UNLOCKED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Audit log map */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 flex flex-col justify-between shadow-xl">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c19a6b] animate-ping" />
              Sovereign Node Logs
            </h3>

            {/* World map SVG */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-300/60 bg-[#faf8f4] p-1 flex items-center justify-center shadow-inner mb-4">
              <svg viewBox="0 0 400 200" className="w-full h-auto">
                <defs>
                  <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f3f1e9" />
                    <stop offset="100%" stopColor="#e9e5d9" />
                  </linearGradient>
                </defs>
                <rect width="400" height="200" fill="url(#ocean)" rx="10"/>
                <g fill="#c19a6b" opacity="0.25">
                  <path d="M20,40 Q25,35 45,30 T80,45 L90,65 L85,85 T60,95 L40,85 L20,70 Z" />
                  <path d="M75,100 T95,115 L100,140 L90,175 L80,165 T70,120 Z" />
                  <path d="M150,30 Q190,25 240,30 T320,45 L340,65 L330,85 T280,95 L220,110 L180,95 T150,75 Z" />
                  <path d="M170,75 Q210,70 215,95 L225,125 L210,160 L195,145 T175,105 Z" />
                  <path d="M300,125 Q325,120 345,130 L350,150 L330,165 L305,150 Z" />
                </g>
                <g fill="none" stroke="#7c5a30" strokeWidth="1" opacity="0.55">
                  <path d="M65,60 Q120,40 185,55" strokeDasharray="3 3"/>
                  <path d="M185,55 Q240,75 320,80" strokeDasharray="3 3"/>
                  <path d="M65,60 Q170,120 215,80" strokeDasharray="3 3"/>
                </g>
                <g>
                  <circle cx="65" cy="60" r="4" fill="#c19a6b" stroke="#fff" strokeWidth="1"/>
                  <circle cx="185" cy="55" r="4" fill="#c19a6b" stroke="#fff" strokeWidth="1"/>
                  <circle cx="320" cy="80" r="3.5" fill="#0284c7" stroke="#fff" strokeWidth="1"/>
                  <circle cx="215" cy="80" r="4" fill="#c19a6b" stroke="#fff" strokeWidth="1"/>
                </g>
              </svg>
              <div className="absolute top-3 left-3 bg-white/85 px-2 py-0.5 border border-slate-300 rounded text-[8px] font-mono text-slate-700 shadow-sm">
                ACTIVE SHA-256 DISPATCH
              </div>
            </div>

            {/* Audit trail */}
            <div className="space-y-3.5 max-h-44 overflow-y-auto pr-1">
              {auditLog.map((entry, i) => (
                <div key={i} className={`border-l ${entry.color} pl-3`}>
                  <p className="text-xs text-slate-800 font-semibold leading-tight">{entry.label}</p>
                  <p className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {entry.time} // SHA-256 HASH MATCH
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
