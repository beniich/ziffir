import { PublicLayout } from '../../components/layout/PublicLayout';
import { Link } from 'react-router-dom';

export function LegalPage() {
  return (
    <PublicLayout
      title="Mentions légales | Ziffir"
      description="Informations légales de Ziffir SAS : raison sociale, siège, capital, directeur de publication, hébergeur. Conformité RGPD."
    >
      <div className="ambient-glow glow-1" />

      <main className="max-w-4xl mx-auto px-4 py-24">
        <section className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm font-semibold mb-6">Informations</span>
          <h1 className="text-4xl font-bold text-slate-100 mb-4">Informations légales</h1>
          <p className="text-slate-400">Dernière mise à jour : 1er décembre 2024</p>
        </section>

        <article className="prose prose-invert prose-slate max-w-none prose-a:text-[#D4AF37] hover:prose-a:text-[#c19a6b]">
          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Éditeur du site</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-slate-900/40 p-6 rounded-xl border border-slate-700/40">
            <div>
              <p className="text-sm text-slate-400 mb-1">Raison sociale</p>
              <p className="font-medium text-slate-200">Ziffir SAS</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Forme juridique</p>
              <p className="font-medium text-slate-200">Société par actions simplifiée</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Capital social</p>
              <p className="font-medium text-slate-200">100 000 €</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Siège social</p>
              <p className="font-medium text-slate-200">42 rue de l'Innovation, 75002 Paris, France</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">SIRET</p>
              <p className="font-medium text-slate-200">123 456 789 00012</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">RCS</p>
              <p className="font-medium text-slate-200">Paris</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Numéro de TVA</p>
              <p className="font-medium text-slate-200">FR12 123456789</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Directeur de publication</p>
              <p className="font-medium text-slate-200">Jean Dupont</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Email</p>
              <p className="font-medium text-slate-200"><a href="mailto:contact@ziffir.com">contact@ziffir.com</a></p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Hébergement</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8 bg-slate-900/40 p-6 rounded-xl border border-slate-700/40">
            <div>
              <p className="text-sm text-slate-400 mb-1">Hébergeur</p>
              <p className="font-medium text-slate-200">AWS France (Amazon Web Services)</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Adresse</p>
              <p className="font-medium text-slate-200">31 Place des Corolles, 92400 Courbevoie</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-slate-400 mb-1">Infrastructure</p>
              <p className="font-medium text-slate-200">Région EU-West-3 (Paris), certification ISO 27001</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Propriété intellectuelle</h2>
          <p className="text-slate-300 mb-4">
            L'ensemble du contenu de ce site (textes, images, logos, code source, design) est protégé par le droit d'auteur et appartient à Ziffir SAS. Toute reproduction sans autorisation préalable est interdite.
          </p>
          <p className="text-slate-300 mb-8">
            Les marques Ziffir®, Prestige Portal®, Omni Stream® et leurs logos sont des marques déposées de Ziffir SAS.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Responsabilité</h2>
          <p className="text-slate-300 mb-8">
            Les informations présentes sur ce site sont fournies à titre indicatif. Malgré le soin apporté à leur mise à jour, Ziffir SAS ne peut être tenu responsable des erreurs, d'une absence de disponibilité des informations, ou de la présence de virus sur son site.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Droit applicable</h2>
          <p className="text-slate-300 mb-8">
            Le présent site est soumis au droit français. En cas de litige, les tribunaux français seront seuls compétents.
          </p>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-4 mt-8 border-b border-slate-800 pb-2">Contact DPO</h2>
          <p className="text-slate-300 mb-12">
            Pour toute question relative à la protection de vos données personnelles : <a href="mailto:dpo@ziffir.com">dpo@ziffir.com</a>
          </p>
        </article>

        {/* Legal Nav */}
        <nav className="mt-16 p-8 bg-slate-900/40 border border-[#D4AF37]/20 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-100 mb-6 flex items-center gap-3">
            <span className="text-[#D4AF37]">📚</span> Documents légaux
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            <li><Link to="/legal/terms" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-[#D4AF37]/10 border border-slate-700/50 hover:border-[#D4AF37]/30 transition text-slate-300 hover:text-white">Conditions Générales d'Utilisation</Link></li>
            <li><Link to="/legal/privacy" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-[#D4AF37]/10 border border-slate-700/50 hover:border-[#D4AF37]/30 transition text-slate-300 hover:text-white">Politique de confidentialité</Link></li>
            <li><Link to="/legal/gdpr" className="flex items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-[#D4AF37]/10 border border-slate-700/50 hover:border-[#D4AF37]/30 transition text-slate-300 hover:text-white">Conformité RGPD</Link></li>
          </ul>
        </nav>
      </main>
    </PublicLayout>
  );
}
