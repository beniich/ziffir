import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function CookiesPage() {
  return (
    <PublicLayout
      title="Politique des cookies | Ziffir"
      description="Ziffir utilise des cookies pour améliorer votre expérience. Découvrez leur nature, leur finalité et comment les gérer."
    >
      <div className="ambient-glow glow-1" />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <motion.section 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Légal</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Politique des cookies</h1>
          <p className="text-slate-400">Dernière mise à jour : 1er décembre 2024</p>
        </motion.section>

        <motion.article 
          className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <section>
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-slate-300">
              Un cookie est un petit fichier texte stocké sur votre appareil 
              (ordinateur, tablette, smartphone) lorsque vous visitez un site 
              web. Il permet au site de mémoriser vos actions et préférences 
              pendant une durée déterminée.
            </p>
            <p className="text-slate-300 mt-4">
              Les cookies peuvent être déposés par le site que vous visitez 
              (<em>cookies propres</em>) ou par des tiers (<em>cookies tiers</em>).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">2. Cookies utilisés par Ziffir</h2>
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-sm text-left">
                <caption className="sr-only">Liste des cookies utilisés</caption>
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-3 text-slate-400 font-semibold">Cookie</th>
                    <th className="p-3 text-slate-400 font-semibold">Type</th>
                    <th className="p-3 text-slate-400 font-semibold">Finalité</th>
                    <th className="p-3 text-slate-400 font-semibold">Durée</th>
                    <th className="p-3 text-slate-400 font-semibold text-center">Obligatoire ?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">ziffir_session</td>
                    <td className="p-3 text-slate-400">Propre</td>
                    <td className="p-3 text-slate-400">Maintenir votre session de connexion active et sécurisée (JWT).</td>
                    <td className="p-3 text-slate-400">Session</td>
                    <td className="p-3 text-center text-green-400">Oui</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">ziffir_prefs</td>
                    <td className="p-3 text-slate-400">Propre</td>
                    <td className="p-3 text-slate-400">Mémoriser vos préférences d'interface (thème, langue).</td>
                    <td className="p-3 text-slate-400">1 an</td>
                    <td className="p-3 text-center text-green-400">Oui</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">__stripe_mid, __stripe_sid</td>
                    <td className="p-3 text-slate-400">Tiers</td>
                    <td className="p-3 text-slate-400">Prévention de la fraude et sécurisation des paiements.</td>
                    <td className="p-3 text-slate-400">1 an</td>
                    <td className="p-3 text-center text-green-400">Oui</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="p-3 font-medium text-slate-300">_ga, _gid</td>
                    <td className="p-3 text-slate-400">Tiers</td>
                    <td className="p-3 text-slate-400">Mesure d'audience anonymisée.</td>
                    <td className="p-3 text-slate-400">13 mois</td>
                    <td className="p-3 text-center text-slate-500">Non</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#D4AF37] border-b border-slate-800 pb-2 mt-8">3. Gestion de vos préférences</h2>
            <p className="text-slate-300">
              Vous pouvez à tout moment modifier vos préférences concernant l'utilisation des cookies non essentiels.
              Les cookies strictement nécessaires au fonctionnement de la plateforme (authentification, sécurité) ne peuvent pas être désactivés.
            </p>
            <p className="text-slate-300 mt-4">
              La plupart des navigateurs vous permettent de refuser les cookies. Vous trouverez plus d'informations sur la gestion des cookies sur le site de la <a href="https://www.cnil.fr/" target="_blank" rel="noopener noreferrer">CNIL</a>.
            </p>
          </section>

          <nav aria-label="Documents légaux associés" className="mt-16 pt-8 border-t border-slate-800">
            <h2 className="text-xl font-bold text-slate-100 mb-4">Voir aussi</h2>
            <ul className="flex flex-wrap gap-4 list-none pl-0 m-0">
              <li><Link to="/legal" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Mentions légales</Link></li>
              <li><Link to="/legal/terms" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conditions d'utilisation</Link></li>
              <li><Link to="/legal/privacy" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Politique de confidentialité</Link></li>
              <li><Link to="/legal/gdpr" className="text-[#D4AF37] hover:text-[#c19a6b] px-4 py-2 bg-[#D4AF37]/10 rounded-lg no-underline">Conformité RGPD</Link></li>
            </ul>
          </nav>
        </motion.article>
      </main>
    </PublicLayout>
  );
}
