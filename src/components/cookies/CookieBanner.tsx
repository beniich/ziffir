import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './cookie-banner.css';

interface CookiePreferences {
  necessary: boolean; // toujours true
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'zafir_cookie_consent';
const VERSION = '1.0.0';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  
  // -------------------------------------------------------------------------
  // Initialisation : vérifie si le consentement a déjà été donné
  // -------------------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      // Aucun consentement : afficher le bandeau après 1s
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
    
    try {
      const parsed = JSON.parse(stored);
      // Vérifier que c'est la même version
      if (parsed.version === VERSION) {
        setPreferences(parsed.preferences);
        applyPreferences(parsed.preferences);
      } else {
        // Version différente : redemander
        setShowBanner(true);
      }
    } catch {
      setShowBanner(true);
    }
  }, []);
  
  // -------------------------------------------------------------------------
  // Application des préférences
  // -------------------------------------------------------------------------
  const applyPreferences = (prefs: CookiePreferences) => {
    // Cookies analytics (Google Analytics)
    if (prefs.analytics) {
      // Activer GA
      window.dispatchEvent(new CustomEvent('zafir:analytics:enable'));
    } else {
      window.dispatchEvent(new CustomEvent('zafir:analytics:disable'));
    }
    
    // Cookies marketing (Meta Pixel, etc.)
    if (prefs.marketing) {
      window.dispatchEvent(new CustomEvent('zafir:marketing:enable'));
    } else {
      window.dispatchEvent(new CustomEvent('zafir:marketing:disable'));
    }
  };
  
  // -------------------------------------------------------------------------
  // Sauvegarde et fermeture
  // -------------------------------------------------------------------------
  const saveConsent = (prefs: CookiePreferences) => {
    const data = {
      version: VERSION,
      preferences: prefs,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    applyPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);
  };
  
  const acceptAll = () => {
    const all: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(all);
    saveConsent(all);
  };
  
  const rejectAll = () => {
    const only: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(only);
    saveConsent(only);
  };
  
  const saveCustom = () => {
    saveConsent(preferences);
  };
  
  // Permet de rouvrir le modal via un événement global (ex: lien footer)
  useEffect(() => {
    const handler = () => setShowModal(true);
    window.addEventListener('zafir:cookie:open', handler);
    return () => window.removeEventListener('zafir:cookie:open', handler);
  }, []);
  
  return (
    <>
      {/* BANDEAU */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            role="dialog"
            aria-live="polite"
            aria-label="Bandeau de consentement aux cookies"
            className="cookie-banner"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="cookie-banner-content">
              <div className="cookie-banner-text">
                <h3>🍪 Nous respectons votre vie privée</h3>
                <p>
                  Ziffir utilise des cookies pour améliorer votre expérience, 
                  analyser l'audience et personnaliser le contenu. Vous pouvez 
                  accepter, refuser ou personnaliser vos choix. 
                  <Link to="/legal/cookies"> En savoir plus</Link>.
                </p>
              </div>
              
              <div className="cookie-banner-actions">
                <button type="button"
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                  aria-label="Refuser tous les cookies non essentiels"
                >
                  Tout refuser
                </button>
                <button type="button"
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
                  aria-label="Personnaliser les préférences de cookies"
                >
                  Personnaliser
                </button>
                <button type="button"
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F3E5AB] transition-colors"
                  aria-label="Accepter tous les cookies"
                >
                  Tout accepter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* MODAL DE PRÉFÉRENCES */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowBanner(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
          >
            <motion.div
              className="cookie-modal bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <header className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <h2 id="cookie-modal-title" className="text-xl font-bold text-slate-100 m-0">🛡️ Préférences cookies</h2>
                <button type="button"
                  className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
                  onClick={() => setShowModal(false)}
                  aria-label="Fermer"
                >
                  &times;
                </button>
              </header>
              
              <div className="p-6 overflow-y-auto">
                <p className="text-slate-300 mb-6">
                  Ziffir utilise différents types de cookies. Vous pouvez les 
                  accepter ou les refuser ci-dessous. Votre choix sera conservé 
                  pendant 13 mois.
                </p>
                
                <div className="space-y-4">
                  {/* Cookies strictement nécessaires */}
                  <article className="cookie-category">
                    <div className="cookie-category-header">
                      <div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">🔒 Cookies strictement nécessaires</h3>
                        <p className="text-sm text-slate-400">
                          Indispensables au fonctionnement du site 
                          (authentification, sécurité, équilibrage de charge). 
                          Ils ne nécessitent pas de consentement.
                        </p>
                      </div>
                      <div className="cookie-toggle disabled">
                        <label className="switch">
                          <input type="checkbox" checked disabled />
                          <span className="slider"></span>
                        </label>
                        <span className="cookie-status">Toujours actifs</span>
                      </div>
                    </div>
                  </article>
                  
                  {/* Cookies analytics */}
                  <article className="cookie-category">
                    <div className="cookie-category-header">
                      <div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">📊 Cookies de mesure d'audience</h3>
                        <p className="text-sm text-slate-400 mb-1">
                          Nous aident à comprendre comment les visiteurs 
                          utilisent notre site pour améliorer le service. Données anonymisées.
                        </p>
                        <p className="cookie-examples text-xs text-slate-500 italic">
                          Exemples : Google Analytics 4, Plausible, Matomo
                        </p>
                      </div>
                      <div className="cookie-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={e => setPreferences(p => ({ ...p, analytics: e.target.checked }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </article>
                  
                  {/* Cookies marketing */}
                  <article className="cookie-category">
                    <div className="cookie-category-header">
                      <div>
                        <h3 className="text-base font-semibold text-slate-200 mb-1">🎯 Cookies marketing</h3>
                        <p className="text-sm text-slate-400 mb-1">
                          Utilisés pour mesurer l'efficacité de nos campagnes 
                          publicitaires et afficher des contenus pertinents sur 
                          d'autres sites.
                        </p>
                        <p className="cookie-examples text-xs text-slate-500 italic">
                          Exemples : Meta Pixel, LinkedIn Insight, Google Ads
                        </p>
                      </div>
                      <div className="cookie-toggle">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={preferences.marketing}
                            onChange={e => setPreferences(p => ({ ...p, marketing: e.target.checked }))}
                          />
                          <span className="slider"></span>
                        </label>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
              
              <footer className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3">
                <button type="button" onClick={rejectAll} className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
                  Tout refuser
                </button>
                <button type="button" onClick={saveCustom} className="px-4 py-2 text-sm bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#F3E5AB] transition-colors">
                  Enregistrer mes choix
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
