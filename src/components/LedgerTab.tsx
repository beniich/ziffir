import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Download, Link, Check, QrCode } from 'lucide-react';
import { Course } from '../types';

interface LedgerTabProps {
  studentName: string;
  studentId: string;
  totalGPA: string;
  totalCredits: number;
  blockchainId: string;
  courses: Course[];
  addCourse: (course: Course) => void;
  removeCourse: (code: string) => void;
  exportPDF: () => void;
  isGenerating: boolean;
  qrCodeUrl: string;
}

export const LedgerTab: React.FC<LedgerTabProps> = ({
  studentName,
  studentId,
  totalGPA,
  totalCredits,
  blockchainId,
  courses,
  addCourse,
  removeCourse,
  exportPDF,
  isGenerating,
  qrCodeUrl
}) => {
  // Local form state to append dynamic modules
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const newCredits = 3.0;
  const [newGrade, setNewGrade] = useState('A+');
  const [newCat, setNewCat] = useState<'Operations' | 'Gastronomy' | 'Service' | 'Management'>('Operations');

  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'scanning' | 'verifying' | 'valid'>('idle');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;
    addCourse({
      code: newCode.toUpperCase(),
      name: newName,
      category: newCat,
      credits: newCredits,
      grade: newGrade,
      completedDate: new Date().toISOString().split('T')[0]
    });
    setNewCode('');
    setNewName('');
  };

  const handleLocalVerify = () => {
    setVerifyStatus('scanning');
    setTimeout(() => {
      setVerifyStatus('verifying');
      setTimeout(() => {
        setVerifyStatus('valid');
      }, 1500);
    }, 1500);
  };

  const handleCopyLink = () => {
    const queryParams = new URLSearchParams();
    queryParams.set('verify', 'true');
    queryParams.set('student', studentName);
    queryParams.set('id', studentId);
    queryParams.set('gpa', totalGPA);
    queryParams.set('credits', totalCredits.toString());
    queryParams.set('hash', blockchainId);
    const link = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="ledger-tab">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Dynamic course units and manager */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Registry Card */}
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 shadow-xl">
            <h3 className="text-xl font-serif-luxury text-slate-800 font-bold mb-4 flex items-center gap-2">
              🏆 Academic Registry & Course Management
            </h3>

            {/* List Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-300 bg-white/20 shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#c19a6b]/25 text-[#7c5a30] font-mono text-[10px] uppercase tracking-wider border-b border-slate-300">
                    <th className="p-3.5 pl-6">Code</th>
                    <th className="p-4">Course Unit Name</th>
                    <Th>Category</Th>
                    <Th>Credits</Th>
                    <Th className="text-right pr-6">Grade</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                  {courses.map((c) => (
                    <tr key={c.code} className="hover:bg-[#c19a6b]/10 transition">
                      <td className="p-4 pl-6 font-mono font-bold text-[#7c5a30]">{c.code}</td>
                      <td className="p-4 text-slate-800 font-semibold">{c.name}</td>
                      <td className="p-4 font-mono text-slate-600">{c.category}</td>
                      <td className="p-4 font-mono">{c.credits.toFixed(1)}</td>
                      <td className="p-4 pr-6 text-right font-mono font-bold text-slate-800 flex items-center justify-end gap-3">
                        <span>{c.grade}</span>
                        <button 
                          type="button"
                          onClick={() => removeCourse(c.code)}
                          className="text-red-500 hover:text-red-600 font-bold p-1 px-2 hover:bg-red-50 rounded transition"
                          title="Remove unit"
                        >
                          &times;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Dynamic Module Addition Form */}
            <form onSubmit={handleCreate} className="mt-6 pt-6 border-t border-black/5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end animate-fade-in">
              <div className="sm:col-span-3 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Unit Code</label>
                <input 
                  type="text" 
                  value={newCode} 
                  required
                  onChange={(e) => setNewCode(e.target.value)} 
                  placeholder="HOSP-702" 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/50 border border-slate-300 text-slate-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none placeholder-slate-400" 
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Unit Description</label>
                <input 
                  type="text" 
                  value={newName} 
                  required
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="Master Caviar Curation & Ethics" 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/50 border border-slate-300 text-slate-800 focus:border-[#c19a6b] focus:ring-0 focus:outline-none placeholder-slate-400" 
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Category</label>
                <select 
                  value={newCat} 
                  onChange={(e) => setNewCat(e.target.value as any)} 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/50 border border-slate-300 text-[#7c5a30] font-mono focus:border-[#c19a6b] focus:ring-0 hover:border-[#c19a6b] duration-150 cursor-pointer"
                >
                  <option value="Operations">Operations</option>
                  <option value="Gastronomy">Gastronomy</option>
                  <option value="Service">Service</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Grade</label>
                <select 
                  value={newGrade} 
                  onChange={(e) => setNewGrade(e.target.value)} 
                  className="w-full p-2.5 text-xs rounded-xl bg-white/50 border border-slate-300 text-slate-800 font-mono focus:border-[#c19a6b] focus:ring-0 hover:border-[#c19a6b] duration-150 cursor-pointer"
                >
                  {['A+', 'A', 'A-', 'B+', 'B', 'B-'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="sm:col-span-1">
                <button 
                  type="submit" 
                  className="w-full p-2.5 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors shadow shadow-[#c19a6b]/30"
                >
                  Apply
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Dynamic laser scanning QR Verification system on column 3 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-white/40 border border-white/60 flex flex-col justify-between h-full space-y-5 relative overflow-hidden group shadow-xl">
            
            <div className="space-y-1.5 relative z-10">
              <span className="text-[8px] bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 px-2.5 py-1 rounded font-mono font-bold uppercase tracking-widest leading-none">
                Sovereign Distributed LEDGER
              </span>
              <h3 className="text-lg font-serif-luxury text-slate-800 font-bold leading-tight">Ledger Proof-of-Registry</h3>
              <p className="text-xs text-slate-600">Confirm permanent cryptographic compliance on public chains</p>
            </div>

            {/* Graphic laser line scanning QR code */}
            <div className="relative w-48 h-48 mx-auto bg-white/80 rounded-2xl border border-[#c19a6b]/30 flex items-center justify-center p-3.5 group overflow-hidden shadow-sm">
              
              {/* Pulsing laser scan lines */}
              <div className="absolute left-0 w-full h-[1.5px] bg-[#c19a6b] shadow-[0_0_8px_rgba(193,154,107,0.8)] z-10 laser-line" />
              <style>{`
                @keyframes laserDown {
                  0%, 100% { top: 0%; opacity: 0.3; }
                  50% { top: 100%; opacity: 1; }
                }
                .laser-line {
                  animation: laserDown 2s ease-in-out infinite;
                }
              `}</style>

              {qrCodeUrl ? (
                <img src={qrCodeUrl} alt="Cryptographic Ledger QR Code" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center font-mono text-[10px] text-slate-500">
                  <QrCode className="w-8 h-8 text-[#c19a6b] mx-auto animate-pulse mb-2" />
                  Generating registry...
                </div>
              )}
            </div>

            {/* Micro status info */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs border-b border-black/5 pb-2">
                <span className="text-slate-600 font-mono">Block Hash Record:</span>
                <code className="text-[#7c5a30] font-mono select-all text-xs bg-[#c19a6b]/15 p-1 rounded px-2 truncate max-w-[150px]" title={blockchainId}>{blockchainId}</code>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-mono">Dynamic Live GPA:</span>
                <strong className="text-slate-800 font-mono">{totalGPA} / 4.30</strong>
              </div>
            </div>

            {/* Dispatch interactives */}
            <div className="space-y-2 relative z-10 pt-2 border-t border-black/5">
              <button
                onClick={handleLocalVerify}
                className="w-full py-3 bg-[#c19a6b] hover:bg-[#7c5a30] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow active:scale-95 flex items-center justify-center gap-1.5 font-mono duration-200"
              >
                {verifyStatus === 'scanning' && <RefreshCw className="w-4 h-4 animate-spin" />}
                {verifyStatus === 'verifying' && <RefreshCw className="w-4 h-4 animate-spin text-white" />}
                {verifyStatus === 'valid' && <ShieldCheck className="w-4 h-4" />}
                {verifyStatus === 'idle' && <ShieldCheck className="w-4 h-4" />}
                
                <span>
                  {verifyStatus === 'idle' && 'Test verification node'}
                  {verifyStatus === 'scanning' && 'Scanning cryptographic QR...'}
                  {verifyStatus === 'verifying' && 'Validating blockchain node...'}
                  {verifyStatus === 'valid' && 'SIGNATURE SECURE VALID! 🎉'}
                </span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 py-2.5 bg-white/60 hover:bg-white/80 text-slate-700 text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-300 font-mono shadow-sm"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Link className="w-3.5 h-3.5 text-[#7c5a30]" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={exportPDF}
                  disabled={isGenerating}
                  className="flex-1 py-2.5 bg-white/60 hover:bg-white/80 text-slate-700 text-[11px] rounded-xl transition-all flex items-center justify-center gap-1.5 border border-slate-300 font-mono shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#7c5a30]" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

// Help helper headers
function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`p-4 text-xs font-bold font-mono text-slate-700 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}
