import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ShieldCheck, Download, Search, Activity, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  eventType: string;
  actorId: string | null;
  actorType: string;
  action: string;
  ipAddress: string | null;
  hash: string;
  createdAt: string;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic filters
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/audit/logs', window.location.origin);
      if (eventTypeFilter) url.searchParams.append('eventType', eventTypeFilter);
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const data = await res.json();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter]);

  const handleExport = () => {
    window.location.href = '/api/audit/export';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-[#D4AF37]" size={28} />
            SOC 2 & ISO 27001 Compliance Audit
          </h1>
          <p className="text-slate-400 mt-1">
            Immutable cryptographic ledger of all sensitive activities across your hotel infrastructure.
          </p>
        </div>
        
        <button type="button" 
          onClick={handleExport}
          className="btn-primary glow-btn-sm flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV for Auditors
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Filter by Event Type (e.g., AUTH.LOGIN)"
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
          </div>
          <button type="button" 
            onClick={fetchLogs} 
            className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Logs"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
            Error: {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-sm font-medium text-slate-400">
                <th className="pb-3 pr-4">Timestamp</th>
                <th className="pb-3 pr-4">Event Type</th>
                <th className="pb-3 pr-4">Action</th>
                <th className="pb-3 pr-4">Actor</th>
                <th className="pb-3 pr-4">IP Address</th>
                <th className="pb-3 pr-4">Hash Chain (Tamper-Evident)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    <Activity className="animate-spin inline mr-2" size={16} /> Loading secure ledger...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 pr-4 text-slate-300 whitespace-nowrap">
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-[#D4AF37] text-xs font-mono">
                        {log.eventType}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-200 max-w-xs truncate" title={log.action}>
                      {log.action}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {log.actorId ? <span className="font-mono text-xs">{log.actorId.slice(0,8)}...</span> : 'System'}
                      <span className="text-[10px] ml-1 uppercase bg-slate-800 px-1 rounded">{log.actorType}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="py-3 pr-4 text-slate-500 font-mono text-xs truncate max-w-[120px]" title={log.hash}>
                      {log.hash}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
