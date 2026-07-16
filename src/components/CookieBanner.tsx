import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Check } from 'lucide-react';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('ziffir-cookie-consent');
    if (!consent) {
      // Small delay so it doesn't pop instantly and aggressively
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted') {
      loadMarketingTags();
    }
  }, []);

  const loadMarketingTags = () => {
    // Inject GTM script dynamically once consent is given
    if (!window.gtmLoaded) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-XXXXXXX');
      `;
      document.head.appendChild(gtmScript);
      window.gtmLoaded = true;
    }

    // Inject LinkedIn Insight Tag
    if (!window.liLoaded) {
      const liScript = document.createElement('script');
      liScript.type = 'text/javascript';
      liScript.innerHTML = `
        _linkedin_partner_id = "XXXXXXX";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        (function(l) {
        if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}
        var s = document.getElementsByTagName("script")[0];
        var b = document.createElement("script");
        b.type = "text/javascript";b.async = true;
        b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b, s);})(window.lintrk);
      `;
      document.head.appendChild(liScript);
      window.liLoaded = true;
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem('ziffir-cookie-consent', 'accepted');
    setIsVisible(false);
    loadMarketingTags();
  };

  const handleRejectAll = () => {
    localStorage.setItem('ziffir-cookie-consent', 'rejected');
    setIsVisible(false);
    // Essential cookies are still active, but no marketing tags are loaded
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-[99999] p-4 sm:p-6 pointer-events-none"
        >
          <div className="max-w-5xl mx-auto bg-[#060A13]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pointer-events-auto relative overflow-hidden">
            
            {/* Luxe gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#D4AF37] opacity-50" />

            <div className="flex-1 flex gap-4">
              <div className="hidden sm:flex h-12 w-12 rounded-full bg-[#D4AF37]/10 items-center justify-center flex-shrink-0 border border-[#D4AF37]/20">
                <ShieldAlert className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-medium text-white font-serif">Respect de votre vie privée</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Ziffir utilise des cookies fonctionnels (nécessaires au bon fonctionnement de la plateforme), 
                  ainsi que des cookies analytiques et marketing (Google, LinkedIn) pour améliorer votre 
                  expérience et vous proposer un contenu adapté.
                  {!showSettings && (
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-[#D4AF37] hover:text-amber-300 ml-2 underline underline-offset-4 decoration-[#D4AF37]/30 transition-colors"
                    >
                      En savoir plus
                    </button>
                  )}
                </p>

                {showSettings && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-4 space-y-3"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">Essentiels (Requis)</span>
                        <span className="text-xs text-slate-500">Nécessaires pour l'authentification et la sécurité.</span>
                      </div>
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">Analytique & Marketing</span>
                        <span className="text-xs text-slate-500">Google Tag Manager, LinkedIn Insight.</span>
                      </div>
                      <div className="h-5 w-5 rounded border border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={handleRejectAll}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-center"
              >
                Refuser
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2.5 rounded-lg text-sm font-medium text-[#060A13] bg-[#D4AF37] hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] text-center font-bold"
              >
                Tout Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Add TS types for window object extensions
declare global {
  interface Window {
    gtmLoaded?: boolean;
    liLoaded?: boolean;
    _linkedin_data_partner_ids?: string[];
    lintrk?: any;
  }
}
