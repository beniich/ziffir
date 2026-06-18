import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';

interface ChannelSyncTabProps {
  channels: Array<{
    name: string;
    status: string;
    iconColor: string;
  }>;
  syncLogs: string[];
}

export const ChannelSyncTab: React.FC<ChannelSyncTabProps> = ({ channels, syncLogs }) => {
  return (
    <div className="space-y-6 animate-fade-in" id="channel-sync-tab">
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-white/40 border border-white/60 shadow-xl">
        
        {/* Header Block in Camel & Slate */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/5 pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-6 h-6 text-[#c19a6b]" /> Zafir Channel Sync Engine
            </h2>
            <p className="text-xs text-slate-600">Distribute pricing, real-time availability parity & synchronize OTA integrations</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs bg-[#c19a6b]/20 hover:bg-[#c19a6b] hover:text-white text-[#7c5a30] border border-[#c19a6b]/40 font-mono font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Overwrite</span>
          </button>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in">
          {channels.map((channel, i) => (
            <div key={i} className="p-5 bg-white/45 border border-white/60 rounded-2xl flex flex-col items-center text-center shadow-sm hover:border-[#c19a6b]/70 transition-all duration-300">
              {/* Spinning sync circle */}
              <div className="w-14 h-14 bg-[#c19a6b]/20 rounded-full flex items-center justify-center mb-4 border border-[#c19a6b]/30 relative shadow-[0_0_15px_rgba(193,154,107,0.15)] text-[#7c5a30]">
                <svg className={`w-8 h-8 text-[#7c5a30] ${channel.status === 'Synced' ? 'animate-[spin_4s_linear_infinite]' : 'animate-[spin_1s_linear_infinite]'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-base font-serif-luxury">{channel.name}</h3>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`w-2 h-2 rounded-full ${channel.status === 'Synced' ? 'bg-emerald-500 shadow-sm' : 'bg-amber-400 animate-ping'}`} />
                <span className="text-xs font-mono text-slate-600 uppercase tracking-widest leading-none">{channel.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Matrix & Activity logs grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Price Parity Matrix */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest">Rate Parity Audit Matrix</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-350 bg-white/20 shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-[#c19a6b]/20 border-b border-slate-300">
                  <tr>
                    <th className="p-4 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider">Suite Type</th>
                    <th className="p-4 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider text-center">Booking.com</th>
                    <th className="p-4 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider text-center">Expedia</th>
                    <th className="p-4 text-xs font-bold font-mono text-slate-800 uppercase tracking-wider text-center">Direct Zafir</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-xs text-slate-800">
                  <tr className="border-b border-slate-200 hover:bg-[#c19a6b]/5 transition-colors">
                    <td className="p-4 font-sans font-semibold text-slate-800">Executive Suite 201</td>
                    <td className="p-4 text-center bg-emerald-50 text-emerald-800 font-bold">$1,200</td>
                    <td className="p-4 text-center bg-emerald-50 text-emerald-800 font-bold">$1,200</td>
                    <td className="p-4 text-center bg-[#c19a6b]/20 text-[#7c5a30] font-bold border-l border-slate-200">$1,150 (Best)</td>
                  </tr>
                  <tr className="border-b border-slate-200 hover:bg-[#c19a6b]/5 transition-colors">
                    <td className="p-4 font-sans font-semibold text-slate-800">Imperial Villa 1</td>
                    <td className="p-4 text-center bg-emerald-50 text-emerald-800 font-bold">$2,800</td>
                    <td className="p-4 text-center bg-red-50 text-red-800 font-bold">$3,100 (!Parity)</td>
                    <td className="p-4 text-center bg-[#c19a6b]/20 text-[#7c5a30] font-bold">$2,700</td>
                  </tr>
                  <tr className="hover:bg-[#c19a6b]/5 transition-colors">
                    <td className="p-4 font-sans font-semibold text-slate-800">Penthouse Suite 304</td>
                    <td className="p-4 text-center bg-emerald-50 text-emerald-800 font-bold">$4,500</td>
                    <td className="p-4 text-center bg-emerald-50 text-emerald-800 font-bold">$4,500</td>
                    <td className="p-4 text-center bg-[#c19a6b]/20 text-[#7c5a30] font-bold">$4,350</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sync Engine Log Terminal */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-mono text-slate-700 font-bold tracking-widest">Handshake Feed Logs</h3>
            <div className="p-4 bg-white/25 border border-slate-350 rounded-2xl h-56 font-mono text-[11px] text-slate-800 overflow-y-auto space-y-2 shadow-inner">
              <div className="text-[#7c5a30] mb-2 font-bold select-none">[CONCIERGE SYNC SYSTEM STATUS: ONLINE]</div>
              {syncLogs.map((log, i) => (
                <div key={i} className="hover:bg-[#c19a6b]/10 p-1 rounded transition-colors text-slate-800">
                  <span className="text-[#7c5a30] font-bold">&gt;&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
