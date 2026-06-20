import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, Download, Link, Check, QrCode } from 'lucide-react';
import { Course } from '../types';
import { INITIAL_AUDITS } from '../shared/data/mockData';
import { useAppStore } from '../shared/store/appStore';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

export const LedgerTab: React.FC = () => {
  const {
    studentName,
    studentId,
    blockchainId,
    courses,
    addCourse,
    removeCourse
  } = useAppStore();

  const auditLogs = INITIAL_AUDITS;

  // GPA calculations
  const totalCredits = courses.reduce((acc, curr) => acc + curr.credits, 0);
  const totalGPA = (() => {
    const gradePoints: Record<string, number> = {
      'A+': 4.3, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'F': 0.0
    };
    let totalGradeVal = 0;
    let totalCredsCount = 0;
    courses.forEach(c => {
      totalGradeVal += (gradePoints[c.grade] || 4.0) * c.credits;
      totalCredsCount += c.credits;
    });
    return totalCredsCount > 0 ? (totalGradeVal / totalCredsCount).toFixed(2) : '4.00';
  })();

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const queryParams = new URLSearchParams();
    queryParams.set('verify', 'true');
    queryParams.set('student', studentName);
    queryParams.set('id', studentId);
    queryParams.set('gpa', totalGPA);
    queryParams.set('credits', totalCredits.toFixed(1));
    queryParams.set('courses', courses.length.toString());
    queryParams.set('hash', blockchainId);

    const checkUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;

    QRCode.toDataURL(checkUrl, {
      margin: 1,
      width: 250,
      color: {
        dark: '#c19a6b',
        light: '#050b16'
      }
    })
    .then(url => setQrCodeUrl(url))
    .catch(err => console.error('Error generating Camel QR verification code', err));
  }, [courses, totalGPA, totalCredits, studentName, studentId, blockchainId]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  const exportPDF = async () => {
    setIsGenerating(true);
    setGenerationStep('Assembling cryptographic block variables...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setGenerationStep('Aligning authorized seal...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const doc = new jsPDF();
      
      doc.setDrawColor(193, 154, 107);
      doc.setLineWidth(1.0);
      doc.rect(8, 8, 194, 281);

      doc.setDrawColor(12, 27, 51);
      doc.setLineWidth(0.2);
      doc.rect(10, 10, 190, 277);

      doc.setFillColor(12, 27, 51);
      doc.rect(12, 12, 186, 32, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text("ZAFIR ELITE COMMAND ACADEMY", 105, 24, { align: 'center' });
      
      doc.setTextColor(193, 154, 107);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("Registry Hub & permanent decentralized credentials ledger", 105, 31, { align: 'center' });

      doc.setTextColor(12, 27, 51);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(15);
      doc.text("OFFICIAL REGISTERED TRANSCRIPT", 105, 56, { align: 'center' });

      doc.setFillColor(245, 230, 211);
      doc.rect(15, 66, 180, 36, 'F');

      doc.setTextColor(12, 27, 51);
      doc.setFontSize(9);
      doc.text("STUDENT LEGAL NAME:", 18, 73);
      doc.text(studentName.toUpperCase(), 64, 73);

      doc.text("ACADEMIC MAJOR:", 18, 80);
      doc.text("Master of Premium Hospitality", 64, 80);

      doc.text("DATE OF BIRTH:", 18, 87);
      doc.text("1998-05-14", 64, 87);

      doc.text("GPA CUMULATIVE:", 120, 73);
      doc.text(`${totalGPA} / 4.30`, 160, 73);

      doc.text("BLOCKCHAIN ROOT:", 120, 80);
      doc.text(blockchainId, 160, 80);

      doc.setFillColor(12, 27, 51);
      doc.rect(15, 110, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.text("CODE", 18, 115.5);
      doc.text("MODULE TITLE", 38, 115.5);
      doc.text("CREDITS", 144, 115.5);
      doc.text("GRADE", 174, 115.5);

      let yOffset = 118;
      doc.setTextColor('#1E293B');
      courses.forEach((course) => {
        doc.text(course.code, 18, yOffset + 5.5);
        doc.text(course.name, 38, yOffset + 5.5);
        doc.text(course.credits.toFixed(1), 144, yOffset + 5.5);
        doc.text(course.grade, 174, yOffset + 5.5);
        yOffset += 8;
      });

      const sigY = yOffset + 16;
      doc.setDrawColor(193, 154, 107);
      doc.circle(45, sigY + 16, 18);
      doc.text("ZAFIR OFFICIAL", 45, sigY + 14, { align: 'center' });
      doc.text("AUTHORIZED", 45, sigY + 19, { align: 'center' });

      doc.line(100, sigY + 16, 180, sigY + 16);
      doc.text("Dr. Alistair Vance, Dean of Academic Registry", 100, sigY + 21);

      doc.save(`Zafir_Official_Ledger_${studentName.replace(' ', '_')}.pdf`);
      
      confetti({
        particleCount: 100,
        spread: 85,
        colors: ['#c19a6b', '#ffffff']
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };
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

        {/* Full-width Forensic Security & Cryptographical Audit Logs Console */}
        <div className="lg:col-span-12 premium-border-glow rounded-3xl p-6 bg-slate-950/90 border-2 border-stone-900 text-stone-100 shadow-[0_0_20px_rgba(193,154,107,0.4)] relative overflow-hidden mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-sm font-mono tracking-widest text-[#c19a6b] font-bold uppercase">
                  FORENSIC AUDIT RECORD & CHINED ROLES LEDGER
                </h4>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Decentralized blockchain logs tracking dynamic clearance role elevation & visual engine shifts
              </p>
            </div>
            <div className="text-[10px] bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono px-3 py-1 rounded-lg">
              SYNC STATUS: BLOCKS SECURED // PARITY PARALLEL ACTIVE
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-800 bg-[#060a12]/80 max-h-72 overflow-y-auto">
            <table className="w-full text-left border-collapse font-mono text-[10.5px]">
              <thead>
                <tr className="bg-stone-900 border-b border-stone-800 text-[#c19a6b] uppercase tracking-wider text-[9px]">
                  <th className="p-3 pl-4">ID</th>
                  <th className="p-3">Time / Timestamp</th>
                  <th className="p-3">Event / Action</th>
                  <th className="p-3">Subject / Role</th>
                  <th className="p-3">Clearance Status</th>
                  <th className="p-3">Action Description / Reason log</th>
                  <th className="p-3 pr-4 text-right">Block Hash (SHA-256)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900">
                {auditLogs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 pl-4 font-bold text-slate-600">{log.id}</td>
                    <td className="p-3 text-slate-400 text-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-semibold text-slate-100 uppercase tracking-wide">{log.action}</td>
                    <td className="p-3 font-semibold text-[#c19a6b] text-nowrap">{log.role}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                        log.status === 'AUTHORIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        log.status === 'BYPASS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                      }`}>
                        {log.status === 'AUTHORIZED' && 'AUTHORIZED'}
                        {log.status === 'BYPASS' && 'SOVEREIGN_BYPASS'}
                        {log.status === 'RESTRICTED_ATTEMPT' && 'ATTEMPT_DENIED'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-350 max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </td>
                    <td className="p-3 pr-4 text-right font-mono text-stone-500 text-[10px] select-all uppercase">
                      {log.hash.slice(0, 16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 pt-3 border-t border-stone-800 flex justify-between items-center text-[9px] text-stone-500 font-mono">
            <span>CHAIN ANCHOR COMPLIANCE LOGS SHIELDED WITH DUAL-SIGN SIGNATURES</span>
            <span className="text-[#c19a6b] select-none">SHA_CHAINING_LINKED_BY_HASH: TRUE</span>
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
