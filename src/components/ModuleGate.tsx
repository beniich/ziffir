import React from 'react';
import { useTenant } from '../hooks/useTenant';

interface ModuleGateProps {
  requiredPlan: 'TRIAL' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ModuleGate({ requiredPlan, children, fallback }: ModuleGateProps) {
  const { hasPlan } = useTenant();

  if (!hasPlan(requiredPlan)) {
    if (fallback) return <>{fallback}</>;
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
        <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-[#c19a6b]/20 to-[#c19a6b]/5 flex items-center justify-center border border-[#c19a6b]/30">
          <svg className="w-8 h-8 text-[#c19a6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2 font-serif">Accès Premium Requis</h3>
        <p className="text-white/70 mb-6 max-w-md">
          Ce module exclusif nécessite le plan {requiredPlan}. Mettez à niveau votre établissement pour débloquer ces fonctionnalités de classe mondiale.
        </p>
        <button className="px-6 py-2.5 bg-[#c19a6b] hover:bg-[#a8865c] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#c19a6b]/20">
          Découvrir nos plans
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
