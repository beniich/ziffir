import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const gdprJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Conformité RGPD - Ziffir',
  description: 'Ziffir est 100% conforme au RGPD : mesures techniques, sous-traitants, AIPD, sécurité',
  url: 'https://www.ziffir.com/legal/gdpr',
  inLanguage: 'fr-FR',
  publisher: {
    '@type': 'Organization',
    name: 'Ziffir SAS',
  },
  dateModified: '2024-12-01',
};

export function GdprPage() {
  return (
    <PublicLayout
      title="Conformité RGPD | Ziffir"
      description="Ziffir est 100% conforme au RGPD. Découvrez nos mesures techniques et organisationnelles, registre des traitements, DPO, et vos droits."
      jsonLd={gdprJsonLd}
    >
      <div className="ambient-glow glow-1" />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-6">✓ Conforme RGPD</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Conformité RGPD</h1>
          <p className="text-slate-400">Ziffir est conçu dès l'origine pour respecter le Règlement Général sur la Protection des Données (RGPD).</p>
        </motion.section>

        <motion.section 
          className="bg-slate-900/40 p-8 rounded-xl border border-slate-700/40 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-6">Notre engagement en bref</h2>
          <ul className="grid sm:grid-cols-2 gap-4 text-slate-300">
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Hébergement 100% UE (AWS Paris)</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> DPO désigné et joignable</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Registre des traitements à jour</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Analyse d'impact (AIPD) documentée</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Sous-traitants européens</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Chiffrement de bout en bout</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Audit log immutable</li>
            <li className="flex gap-2 items-start"><span className="text-green-400">✓</span> Droit à l'oubli effectif</li>
          </ul>
        </motion.section>

        <motion.article 
          className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <section id="cadre-legal">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2">1. Cadre légal</h2>
            <p className="text-slate-300">Ziffir SAS agit en qualité de :</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-2">
              <li><strong>Responsable de traitement</strong> pour les données de ses clients directs (hôtels).</li>
              <li><strong>Sous-traitant</strong> pour les données des clients finaux saisies par les hôtels. Nous traitons les données uniquement selon les instructions documentées de l'hôtel.</li>
            </ul>
          </section>

          <section id="registre">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">2. Registre des traitements</h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-slate-400 font-semibold">Traitement</th>
                    <th className="p-3 text-slate-400 font-semibold">Finalité</th>
                    <th className="p-3 text-slate-400 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">Gestion de compte</td>
                    <td className="p-3 text-slate-400">Permettre l'accès au service</td>
                    <td className="p-3 text-slate-400">Exécution du contrat</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">Facturation</td>
                    <td className="p-3 text-slate-400">Émettre et recouvrer les factures</td>
                    <td className="p-3 text-slate-400">Obligation légale</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">Support client</td>
                    <td className="p-3 text-slate-400">Répondre aux demandes</td>
                    <td className="p-3 text-slate-400">Exécution du contrat</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="sous-traitants">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">3. Sous-traitants</h2>
            <p className="text-slate-300 mt-2">Tous nos sous-traitants ont signé un accord de traitement des données (DPA) conforme à l'article 28 du RGPD :</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li><strong>AWS</strong> : Hébergement (Paris). Certifié ISO 27001, SOC 2 Type II, HDS.</li>
              <li><strong>Stripe</strong> : Paiements (Irlande). Certifié PCI DSS Level 1.</li>
              <li><strong>Resend</strong> : Emails transactionnels (UE).</li>
            </ul>
          </section>

          <section id="securite-tech">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">4. Mesures de sécurité</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-6">
              <div>
                <h3 className="text-xl font-bold text-slate-200 m-0 mb-3">Techniques</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2 m-0">
                  <li>Chiffrement TLS 1.3 en transit</li>
                  <li>Chiffrement AES-256 au repos</li>
                  <li>Authentification par tokens HTTP-only</li>
                  <li>2FA TOTP disponible</li>
                  <li>Isolation multi-tenant stricte</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-200 m-0 mb-3">Organisationnelles</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2 m-0">
                  <li>DPO désigné</li>
                  <li>Formation annuelle obligatoire RGPD</li>
                  <li>Accès limité au principe du moindre privilège</li>
                  <li>Tests d'intrusion annuels</li>
                  <li>Sauvegardes chiffrées quotidiennes</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="certifications">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">5. Certifications en cours</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div className="p-6 bg-slate-900/40 border border-slate-700/40 rounded-xl text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="font-bold text-slate-200 m-0">ISO 27001</h3>
                <p className="text-sm text-slate-400 mt-2 m-0">En cours · Q2 2025</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-700/40 rounded-xl text-center">
                <div className="text-3xl mb-2">🔒</div>
                <h3 className="font-bold text-slate-200 m-0">SOC 2 Type II</h3>
                <p className="text-sm text-slate-400 mt-2 m-0">En cours · Q4 2025</p>
              </div>
            </div>
          </section>

          <nav aria-label="Documents légaux associés" className="mt-16 pt-8 border-t border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Voir aussi</h2>
            <ul className="flex flex-wrap gap-4 list-none pl-0 m-0">
              <li><Link to="/legal" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Mentions légales</Link></li>
              <li><Link to="/legal/terms" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conditions d'utilisation</Link></li>
              <li><Link to="/legal/privacy" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique de confidentialité</Link></li>
              <li><Link to="/legal/cookies" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique des cookies</Link></li>
            </ul>
          </nav>
        </motion.article>
      </main>
    </PublicLayout>
  );
}
