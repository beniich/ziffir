import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SEO } from '../../components/seo/SEO';

export function CgvPage() {
  return (
    <PublicLayout
      title="Conditions Générales de Vente"
      description="Conditions Générales de Vente de Ziffir : tarification, facturation, paiement, renouvellement, résiliation, droit de rétractation."
    >
      <SEO 
        title="Conditions Générales de Vente (CGV)"
        description="CGV Ziffir : prix, modalités de paiement, facturation, renouvellement, droit de rétractation entreprise."
        url="/legal/cgv"
      />

      <main id="main-content" className="legal-page max-w-4xl mx-auto px-4 py-24">
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Document contractuel</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Conditions Générales de Vente</h1>
          <p className="text-slate-400">
            Dernière mise à jour : 1er décembre 2024
          </p>
        </motion.section>

        <motion.article 
          className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl my-4 text-[#3b82f6]">
            <p className="m-0">
              <strong>📌 Distinction importante :</strong> les présentes CGV 
              régissent les relations commerciales entre Ziffir et ses clients 
              (établissements hôteliers). Les CGU régissent l'utilisation de 
              la plateforme par les utilisateurs finaux. Les deux documents 
              sont complémentaires.
            </p>
          </div>

          <nav aria-label="Sommaire" className="bg-slate-900/40 p-6 rounded-xl border border-slate-700/40 mb-12 mt-8">
            <h2 className="text-xl font-bold text-[#D4AF37] mb-4 mt-0">Sommaire</h2>
            <ol className="grid sm:grid-cols-2 gap-2 m-0 list-decimal list-inside text-slate-300">
              <li><a href="#objet" className="no-underline">Objet et champ d'application</a></li>
              <li><a href="#documents" className="no-underline">Documents contractuels</a></li>
              <li><a href="#prix" className="no-underline">Prix et tarification</a></li>
              <li><a href="#commande" className="no-underline">Prise de commande</a></li>
              <li><a href="#paiement" className="no-underline">Modalités de paiement</a></li>
              <li><a href="#facturation" className="no-underline">Facturation</a></li>
              <li><a href="#renouvellement" className="no-underline">Renouvellement</a></li>
              <li><a href="#essai" className="no-underline">Période d'essai</a></li>
              <li><a href="#retractation" className="no-underline">Droit de rétractation</a></li>
              <li><a href="#duree" className="no-underline">Durée et résiliation</a></li>
              <li><a href="#sla" className="no-underline">Niveau de service (SLA)</a></li>
              <li><a href="#donnees" className="no-underline">Données et propriété</a></li>
              <li><a href="#confidentialite" className="no-underline">Confidentialité</a></li>
              <li><a href="#garanties" className="no-underline">Garanties et responsabilité</a></li>
              <li><a href="#force-majeure" className="no-underline">Force majeure</a></li>
              <li><a href="#litiges" className="no-underline">Litiges et droit applicable</a></li>
            </ol>
          </nav>

          <section id="objet">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">1. Objet et champ d'application</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) régissent les 
              conditions dans lesquelles la société Ziffir SAS fournit à ses 
              clients professionnels (les "Clients") ses services de plateforme 
              SaaS d'intelligence prédictive pour l'hôtellerie de luxe (les 
              "Services").
            </p>
            <p>
              Elles s'appliquent à toute commande de Services passée par un 
              Client auprès de Ziffir, que ce soit via le site web, par 
              signature d'un bon de commande, ou via tout autre canal de 
              vente.
            </p>
          </section>

          <section id="documents">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">2. Documents contractuels</h2>
            <p>Les documents contractuels, par ordre de priorité décroissante, sont :</p>
            <ol className="list-decimal pl-6 text-slate-300 space-y-2 mt-4">
              <li>L'éventuel bon de commande signé ou la proposition commerciale acceptée</li>
              <li>Les présentes Conditions Générales de Vente (CGV)</li>
              <li>Les Conditions Générales d'Utilisation (CGU) de la plateforme</li>
              <li>La Politique de confidentialité</li>
              <li>Les conditions spécifiques du plan souscrit (Premium, Platinium, Golden, Enterprise)</li>
            </ol>
          </section>

          <section id="prix">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">3. Prix et tarification</h2>
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.1 Prix en vigueur</h3>
            <p>Les prix applicables sont ceux en vigueur au moment de la commande, tels qu'indiqués :</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li>Sur la page <Link to="/pricing">Tarifs</Link> du site Ziffir</li>
              <li>Dans la proposition commerciale acceptée par le Client</li>
              <li>Dans le bon de commande signé</li>
            </ul>
            
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.2 Devise et taxes</h3>
            <p>
              Les prix sont exprimés en euros (€) hors taxes (HT). La TVA 
              applicable est ajoutée au moment de la facturation selon le 
              taux en vigueur (20% en France métropolitaine).
            </p>
            
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">3.3 Évolution des prix</h3>
            <p>
              Ziffir se réserve le droit de modifier ses prix à la fin de 
              chaque période de facturation. Le Client sera informé de toute 
              modification au moins <strong>30 jours avant</strong> sa prise 
              d'effet.
            </p>
          </section>

          <section id="commande">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">4. Prise de commande</h2>
            <p>La commande est réputée acceptée par Ziffir lors :</p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li>De la validation en ligne par le Client (clic sur "Je m'abonne" ou équivalent)</li>
              <li>De la signature du bon de commande ou de la proposition commerciale</li>
              <li>Du premier paiement (dans le cas d'une souscription immédiate)</li>
            </ul>
          </section>

          <section id="paiement">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">5. Modalités de paiement</h2>
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">5.1 Moyens de paiement acceptés</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li><strong>Carte bancaire</strong> : Visa, Mastercard, American Express (via Stripe)</li>
              <li><strong>Prélèvement SEPA</strong> : pour les clients européens (mandat signé)</li>
              <li><strong>Virement bancaire</strong> : pour les contrats annuels (RIB fourni sur demande)</li>
            </ul>
            
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">5.2 Échéance</h3>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li><strong>Abonnement mensuel</strong> : à la date de souscription puis chaque mois à la même date</li>
              <li><strong>Abonnement annuel</strong> : à la date de souscription puis chaque année (avec remise de 15%)</li>
              <li><strong>Services ponctuels</strong> : à 30 jours fin de mois à compter de la facture</li>
            </ul>
          </section>

          <section id="facturation">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">6. Facturation</h2>
            <p>
              Les factures sont émises :
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2 mt-4">
              <li>Électroniquement (PDF) par email à l'adresse de facturation</li>
              <li>Disponibles à tout moment dans l'espace client</li>
              <li>Au format électronique conforme à la norme EN 16931</li>
            </ul>
          </section>

          <section id="renouvellement">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">7. Renouvellement</h2>
            <p>
              Le contrat est conclu pour la durée souscrite (mensuelle ou 
              annuelle). Il est tacitement reconductible pour des périodes 
              d'égale durée, sauf résiliation par le Client au moins 30 jours 
              avant l'échéance.
            </p>
          </section>

          <section id="essai">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">8. Période d'essai</h2>
            <p>
              Une période d'essai gratuite de <strong>14 jours</strong> est 
              proposée à tout nouveau Client. Elle inclut l'accès à toutes 
              les fonctionnalités du plan Platinium, sans carte bancaire 
              requise.
            </p>
          </section>

          <section id="retractation">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">9. Droit de rétractation</h2>
            <div className="p-4 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl my-4 text-[#3b82f6]">
              <p className="m-0">
                <strong>ℹ️ Client professionnel :</strong> conformément à 
                l'article L221-28-13° du Code de la consommation, le droit 
                de rétractation ne s'applique pas aux contrats conclus entre 
                professionnels pour des besoins exclusivement professionnels.
              </p>
            </div>
            <p>
              Toutefois, à titre commercial, Ziffir offre une garantie 
              satisfait ou remboursé de <strong>30 jours</strong> à compter 
              de la première souscription payante, sans condition.
            </p>
          </section>

          <section id="duree">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">10. Durée et résiliation</h2>
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">10.1 Durée</h3>
            <p>Le contrat est souscrit pour la durée choisie par le Client.</p>
            
            <h3 className="text-xl font-bold text-slate-200 mt-6 mb-3">10.2 Résiliation par le Client</h3>
            <p>Le Client peut résilier son contrat à tout moment depuis ses paramètres (pour les abonnements mensuels) ou au plus tard 30 jours avant l'échéance (pour les abonnements annuels).</p>
          </section>

          <section id="sla">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">11. Niveau de service (SLA)</h2>
            <p>
              Ziffir s'engage sur des niveaux de disponibilité allant jusqu'à 99,99% selon le plan souscrit. Des crédits de service sont applicables en cas de non-respect de ces engagements.
            </p>
          </section>

          <section id="donnees">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">12. Données et propriété intellectuelle</h2>
            <p>
              Le Client reste propriétaire exclusif de toutes les données qu'il saisit dans la plateforme. Ziffir conserve l'intégralité des droits de propriété intellectuelle sur la plateforme.
            </p>
          </section>

          <section id="confidentialite">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">13. Confidentialité</h2>
            <p>
              Chacune des parties s'engage à considérer comme confidentielles toutes les informations dont elle pourrait avoir connaissance à l'occasion de l'exécution du contrat.
            </p>
          </section>

          <section id="garanties">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">14. Garanties et responsabilité</h2>
            <p>
              Dans les limites autorisées par la loi, la responsabilité totale de Ziffir au titre des présentes CGV est plafonnée au montant des sommes effectivement versées par le Client au cours des 12 derniers mois.
            </p>
          </section>

          <section id="force-majeure">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">15. Force majeure</h2>
            <p>
              Aucune des parties ne pourra être tenue responsable de l'inexécution de ses obligations contractuelles si cette inexécution résulte d'un cas de force majeure.
            </p>
          </section>

          <section id="litiges">
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">16. Litiges et droit applicable</h2>
            <p>
              Les présentes CGV sont régies par le droit français. À défaut de résolution amiable, tout litige sera de la compétence exclusive du Tribunal de commerce de Paris.
            </p>
          </section>

          <nav aria-label="Documents légaux associés" className="mt-16 pt-8 border-t border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Documents associés</h2>
            <ul className="flex flex-wrap gap-4 list-none pl-0 m-0">
              <li><Link to="/legal" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Mentions légales</Link></li>
              <li><Link to="/legal/terms" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conditions d'utilisation (CGU)</Link></li>
              <li><Link to="/legal/privacy" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique de confidentialité</Link></li>
              <li><Link to="/legal/gdpr" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conformité RGPD</Link></li>
              <li><Link to="/legal/cookies" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique des cookies</Link></li>
              <li><Link to="/pricing" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Tarifs</Link></li>
            </ul>
          </nav>
        </motion.article>
      </main>
    </PublicLayout>
  );
}
