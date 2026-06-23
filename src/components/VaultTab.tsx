import React from 'react';
import { Lock, Unlock, CheckCircle } from 'lucide-react';
import { VaultDocument } from '../types';

interface VaultTabProps {
  vaultDocs: VaultDocument[];
  startDecrypt: (id: string) => void;
}

export const VaultTab: React.FC<VaultTabProps> = ({ vaultDocs, startDecrypt }) => {
  return (
    <div className="space-y-6 animate-fade-in" id="vault-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Secure documents list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl">
            <h3 className="text-xl font-serif-luxury text-slate-800 font-bold mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#c19a6b]" /> Secure Document Vault
            </h3>

            <div className="space-y-3 animate-fade-in">
              {vaultDocs.map((doc) => (
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
                        {doc.decrypting && <span className="text-xs text-sky-600 animate-pulse font-mono">(Decrypting {Math.floor(doc.progress)}%)</span>}
                      </h4>
                      <p className="text-xs text-slate-600 font-mono">Secured HASH: ZV7A00-{doc.id.toUpperCase()} // lvl {doc.securityLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {doc.encrypted ? (
                      <button
                        onClick={() => startDecrypt(doc.id)}
                        disabled={doc.decrypting}
                        className="text-xs bg-[#c19a6b]/20 hover:bg-[#c19a6b] hover:text-white text-[#7c5a30] border border-[#c19a6b]/40 font-mono font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 duration-200"
                      >
                        {doc.decrypting ? 'Decrypting...' : 'Decrypt File'}
                      </button>
                    ) : (
                      <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> SECURE UNLOCKED
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Global authorization map node networks */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 flex flex-col justify-between shadow-xl">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest flex items-center gap-1.5 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c19a6b] animate-ping" />
              Sovereign Node Logs
            </h3>

            {/* Global authorization connections world map SVG */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-300/60 bg-[#faf8f4] p-1 flex items-center justify-center shadow-inner mb-4">
              <svg viewBox="0 0 400 200" className="w-full h-auto">
                <defs>
                  <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f3f1e9" />
                    <stop offset="100%" stopColor="#e9e5d9" />
                  </linearGradient>
                </defs>
                <rect width="400" height="200" fill="url(#ocean)" rx="10"/>
                {/* Simplified continents */}
                <g fill="#c19a6b" opacity="0.25">
                  <path d="M20,40 Q25,35 45,30 T80,45 L90,65 L85,85 T60,95 L40,85 L20,70 Z" />
                  <path d="M75,100 T95,115 L100,140 L90,175 L80,165 T70,120 Z" />
                  <path d="M150,30 Q190,25 240,30 T320,45 L340,65 L330,85 T280,95 L220,110 L180,95 T150,75 Z" />
                  <path d="M170,75 Q210,70 215,95 L225,125 L210,160 L195,145 T175,105 Z" />
                  <path d="M300,125 Q325,120 345,130 L350,150 L330,165 L305,150 Z" />
                </g>
                {/* Dynamic authorization connections flow */}
                <g fill="none" stroke="#7c5a30" strokeWidth="1" className="dash-flow animate-[dash_2s_linear_infinite]" opacity="0.55">
                  <path d="M65,60 Q120,40 185,55" strokeDasharray="3 3"/>
                  <path d="M185,55 Q240,75 320,80" strokeDasharray="3 3"/>
                  <path d="M65,60 Q170,120 215,80" strokeDasharray="3 3"/>
                </g>
                <g fill="#7c5a30">
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

            {/* Scrollable node authorization records */}
            <div className="space-y-3.5 h-44 overflow-y-auto pr-1">
              <div className="border-l border-emerald-500/60 pl-3">
                <p className="text-xs text-slate-800 font-semibold leading-tight">Access Granted: Exec Node</p>
                <p className="text-[9px] text-emerald-600 font-mono">10:28 AM // BIO-VERIFIED</p>
              </div>
              <div className="border-l border-[#c19a6b] pl-3">
                <p className="text-xs text-slate-800 font-semibold leading-tight">File Decrypted: Contract_Acq_1</p>
                <p className="text-[9px] text-[#7c5a30] font-mono">10:25 AM // SHA-256 HASH MATCH</p>
              </div>
              <div className="border-l border-red-500/60 pl-3">
                <p className="text-xs text-slate-800 font-semibold leading-tight">Unregistered Handshake Blocked</p>
                <p className="text-[9px] text-red-500 font-mono">10:18 AM // VPN_PROXY INGRESS DISMISS</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
