import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const privacyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Politique de confidentialité Ziffir',
  description: 'Comment Ziffir protège vos données personnelles et celles de vos clients finaux',
  url: 'https://www.ziffir.com/legal/privacy',
  inLanguage: 'fr-FR',
  publisher: {
    '@type': 'Organization',
    name: 'Ziffir SAS',
  },
  dateModified: '2024-12-01',
};

export function PrivacyPage() {
  return (
    <PublicLayout
      title="Politique de confidentialité | Ziffir"
      description="Comment Ziffir protège vos données personnelles et celles de vos clients finaux. Conformité RGPD, mesures de sécurité, droits des utilisateurs."
      jsonLd={privacyJsonLd}
    >
      <div className="ambient-glow glow-1" />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Document juridique</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Politique de confidentialité</h1>
          <p className="text-slate-400">Dernière mise à jour : 1er décembre 2024 · Conforme RGPD</p>
        </motion.section>

        <motion.article 
          className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <nav aria-label="Sommaire" className="bg-slate-900/40 p-6 rounded-xl border border-slate-700/40 mb-12">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-4 mt-0">Sommaire</h2>
            <ol className="grid sm:grid-cols-2 gap-2 m-0 list-decimal list-inside text-slate-300">
              <li><a href="#preambule" className="no-underline">Préambule</a></li>
              <li><a href="#responsable" className="no-underline">Responsable du traitement</a></li>
              <li><a href="#donnees-collectees" className="no-underline">Données collectées</a></li>
              <li><a href="#utilisation" className="no-underline">Utilisation des données</a></li>
              <li><a href="#partage" className="no-underline">Partage des données</a></li>
              <li><a href="#transferts" className="no-underline">Transferts hors UE</a></li>
              <li><a href="#conservation" className="no-underline">Durée de conservation</a></li>
              <li><a href="#droits" className="no-underline">Vos droits</a></li>
              <li><a href="#securite" className="no-underline">Sécurité des données</a></li>
              <li><a href="#violation" className="no-underline">Notification de violation</a></li>
              <li><a href="#modifications" className="no-underline">Modifications</a></li>
              <li><a href="#contact-dpo" className="no-underline">Contact DPO</a></li>
            </ol>
          </nav>

          <section id="preambule">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2">1. Préambule</h2>
            <p>
              Ziffir SAS accorde une importance particulière à la protection de 
              vos données personnelles et de celles de vos clients finaux. La 
              présente politique détaille les données que nous collectons, la 
              manière dont nous les utilisons, et les droits dont vous disposez.
            </p>
            <p>
              Nous nous engageons à respecter le Règlement Général sur la 
              Protection des Données (RGPD) et la loi française Informatique et 
              Libertés modifiée. Pour plus de détails sur notre conformité, 
              consultez notre <Link to="/legal/gdpr">page dédiée à la conformité RGPD</Link>.
            </p>
          </section>

          <section id="responsable">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2">2. Responsable du traitement</h2>
            <dl className="grid sm:grid-cols-[1fr_2fr] gap-4 bg-slate-900/40 p-6 rounded-xl border border-slate-700/40">
              <dt className="text-sm text-slate-400">Responsable du traitement</dt>
              <dd className="font-medium text-slate-200 m-0">Ziffir SAS, 42 rue de l'Innovation, 75002 Paris, France</dd>
              
              <dt className="text-sm text-slate-400">DPO (Délégué à la Protection des Données)</dt>
              <dd className="font-medium text-slate-200 m-0">
                Marie Martin — <a href="mailto:dpo@ziffir.com">dpo@ziffir.com</a>
              </dd>
              
              <dt className="text-sm text-slate-400">Représentant légal</dt>
              <dd className="font-medium text-slate-200 m-0">Jean Dupont, Président de Ziffir SAS</dd>
            </dl>
          </section>

          <section id="donnees-collectees">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">3. Données collectées</h2>
            
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.1 Données que vous nous fournissez</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <caption className="sr-only">Données fournies directement par l'utilisateur</caption>
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-slate-400 font-semibold">Catégorie</th>
                    <th className="p-3 text-slate-400 font-semibold">Exemples</th>
                    <th className="p-3 text-slate-400 font-semibold">Finalité</th>
                    <th className="p-3 text-slate-400 font-semibold">Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/50">
                    <th className="p-3 font-medium text-slate-300">Compte utilisateur</th>
                    <td className="p-3 text-slate-400">Nom, email, mot de passe (hashé), téléphone</td>
                    <td className="p-3 text-slate-400">Création et gestion de votre compte</td>
                    <td className="p-3 text-slate-400">Exécution du contrat</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <th className="p-3 font-medium text-slate-300">Données de l'établissement</th>
                    <td className="p-3 text-slate-400">Nom de l'hôtel, adresse, SIRET, IBAN</td>
                    <td className="p-3 text-slate-400">Facturation, support</td>
                    <td className="p-3 text-slate-400">Exécution du contrat</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <th className="p-3 font-medium text-slate-300">Données des clients finaux</th>
                    <td className="p-3 text-slate-400">Nom, email, téléphone, préférences</td>
                    <td className="p-3 text-slate-400">Fourniture du service</td>
                    <td className="p-3 text-slate-400">Exécution du contrat</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <th className="p-3 font-medium text-slate-300">Données de paiement</th>
                    <td className="p-3 text-slate-400">Numéro de carte (chez Stripe), historique</td>
                    <td className="p-3 text-slate-400">Facturation</td>
                    <td className="p-3 text-slate-400">Obligation légale</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.2 Données collectées automatiquement</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>
                <strong>Données de connexion</strong> : IP, navigateur, OS. <em>Finalité</em> : sécurité, statistiques. <em>Base légale</em> : intérêt légitime.
              </li>
              <li>
                <strong>Cookies</strong> : voir notre <Link to="/legal/cookies">politique des cookies</Link>.
              </li>
              <li>
                <strong>Logs techniques</strong> : <em>Finalité</em> : débogage, sécurité, audit. <em>Conservation</em> : 12 mois maximum.
              </li>
              <li>
                <strong>Données d'usage</strong> : fonctionnalités utilisées. <em>Finalité</em> : amélioration produit. Anonymisées.
              </li>
            </ul>
          </section>

          <section id="utilisation">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">4. Utilisation des données</h2>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li><strong>Fournir le service</strong> : exploiter la plateforme, traiter les paiements, fournir le support.</li>
              <li><strong>Améliorer le service</strong> : analyser l'usage, développer de nouvelles fonctionnalités.</li>
              <li><strong>Communiquer</strong> : vous informer des évolutions produit.</li>
              <li><strong>Assurer la sécurité</strong> : prévenir les attaques, tracer les accès (cf. <Link to="/features#ledger">Ledger</Link>).</li>
              <li><strong>Respecter nos obligations légales</strong> : facturation, réponse aux autorités.</li>
            </ul>
          </section>

          <section id="partage">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">5. Partage des données</h2>
            <div className="p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl my-4 text-[#D4AF37]">
              <strong>🔒 Engagement :</strong> Nous ne vendons jamais vos données. Nous ne les partageons que dans les cas strictement nécessaires.
            </div>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li><strong>Sous-traitants techniques</strong> : AWS (hébergement), Stripe (paiements), Resend (emails).</li>
              <li><strong>Autorités légales</strong> : sur demande légalement fondée (réquisition judiciaire).</li>
              <li><strong>Cession</strong> : en cas de fusion ou cession, avec notification préalable.</li>
            </ul>
          </section>

          <section id="transferts">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">6. Transferts hors UE</h2>
            <p>
              Nos principaux sous-traitants sont hébergés dans l'UE. En cas de transfert hors UE, nous utilisons les Clauses Contractuelles Types (CCT) ou des décisions d'adéquation (Data Privacy Framework pour les USA).
            </p>
          </section>

          <section id="droits">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">7. Vos droits</h2>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl">
                <h3 className="font-bold text-slate-200 m-0">👁️ Droit d'accès</h3>
                <p className="text-sm text-slate-400 mt-1 m-0">Obtenir la confirmation que vos données sont traitées et en obtenir une copie.</p>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl">
                <h3 className="font-bold text-slate-200 m-0">✏️ Droit de rectification</h3>
                <p className="text-sm text-slate-400 mt-1 m-0">Corriger des données inexactes ou incomplètes.</p>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl">
                <h3 className="font-bold text-slate-200 m-0">🗑️ Droit à l'effacement</h3>
                <p className="text-sm text-slate-400 mt-1 m-0">Obtenir l'effacement de vos données.</p>
              </div>
              <div className="p-4 bg-slate-900/40 border border-slate-700/40 rounded-xl">
                <h3 className="font-bold text-slate-200 m-0">📦 Droit à la portabilité</h3>
                <p className="text-sm text-slate-400 mt-1 m-0">Recevoir vos données dans un format structuré.</p>
              </div>
            </div>
            
            <div className="p-6 bg-slate-800/50 border border-slate-700/50 rounded-xl mt-6">
              <h3 className="text-lg font-bold text-slate-100 m-0">Comment exercer vos droits ?</h3>
              <p className="text-slate-300 mt-2 m-0">
                Écrivez à : <a href="mailto:dpo@ziffir.com">dpo@ziffir.com</a>. Nous répondrons dans un délai d'un mois.
              </p>
            </div>
          </section>

          <section id="securite">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">8. Sécurité des données</h2>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li>Chiffrement TLS 1.3 en transit (HTTPS obligatoire)</li>
              <li>Chiffrement AES-256 au repos pour toutes les données stockées</li>
              <li>Authentification par tokens HTTP-only (immunisé XSS)</li>
              <li>2FA TOTP disponible (Google Authenticator, Authy, 1Password)</li>
              <li>Audit log immutable avec hash chain cryptographique</li>
            </ul>
          </section>

          <section id="contact-dpo">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">9. Contact DPO</h2>
            <address className="not-italic text-slate-300 p-6 bg-slate-900/40 rounded-xl border border-slate-700/40 mt-4">
              <strong>Marie Martin, DPO</strong><br />
              Ziffir SAS<br />
              42 rue de l'Innovation, 75002 Paris, France<br />
              <a href="mailto:dpo@ziffir.com">dpo@ziffir.com</a>
            </address>
          </section>

          <nav aria-label="Documents légaux associés" className="mt-16 pt-8 border-t border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Voir aussi</h2>
            <ul className="flex flex-wrap gap-4 list-none pl-0 m-0">
              <li><Link to="/legal" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Mentions légales</Link></li>
              <li><Link to="/legal/terms" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conditions d'utilisation</Link></li>
              <li><Link to="/legal/gdpr" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conformité RGPD</Link></li>
              <li><Link to="/legal/cookies" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique des cookies</Link></li>
            </ul>
          </nav>
        </motion.article>
      </main>
    </PublicLayout>
  );
}
