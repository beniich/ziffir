import { Resend } from 'resend';
import { env } from '../config/env.js';

// Utilise Resend si la clé est dispo, sinon fallback console
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const FROM = 'Sapphire <hello@sapphire.luxury>';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string) {
  if (resend) {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) throw new Error(`Resend error: ${error.message}`);
    return { success: true, id: data?.id };
  } else {
    // Dev fallback
    console.log(`\n📧 [ONBOARDING EMAIL → ${to}]\n📝 ${subject}\n${html.replace(/<[^>]+>/g, '').slice(0, 200)}...\n`);
    return { success: true, id: `mock-${Date.now()}` };
  }
}

// ─── Base HTML template ──────────────────────────────────────────────────────

function baseTemplate(content: string, preheader = '') {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Sapphire</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A0E27; margin: 0; padding: 0; }
  .container { max-width: 600px; margin: 0 auto; background: #121633; border-radius: 12px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #1a1f4e 0%, #0A0E27 100%); padding: 32px 40px; border-bottom: 1px solid rgba(212,175,55,0.3); }
  .logo { font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: 2px; }
  .tagline { color: #8E96BD; font-size: 12px; margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; }
  .body { padding: 40px; color: #CBD5E1; line-height: 1.7; }
  h1 { color: #F1F5F9; font-size: 24px; font-weight: 700; margin: 0 0 16px; }
  h2 { color: #D4AF37; font-size: 18px; font-weight: 600; margin: 28px 0 12px; }
  p { margin: 0 0 16px; }
  .cta { display: inline-block; background: linear-gradient(135deg, #D4AF37, #F5CC5C); color: #0A0E27; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 8px 0; }
  .tip-box { background: rgba(212,175,55,0.08); border-left: 3px solid #D4AF37; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0; }
  .step { display: flex; gap: 12px; margin: 12px 0; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px; }
  .step-num { background: #D4AF37; color: #0A0E27; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; }
  .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.06); color: #4B5563; font-size: 12px; }
  a { color: #D4AF37; }
</style>
</head>
<body>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">${preheader}</div>
  <div class="container">
    <div class="header">
      <div class="logo">◆ SAPPHIRE</div>
      <div class="tagline">Le PMS des hôtels d'exception</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© 2025 Sapphire. Tous droits réservés.</p>
      <p><a href="https://sapphire.luxury">sapphire.luxury</a> · <a href="https://sapphire.luxury/legal/privacy">Confidentialité</a> · <a href="{{unsubscribe_url}}">Se désabonner</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Les 8 templates d'onboarding
// ═══════════════════════════════════════════════════════════════════════════════

export interface OnboardingContext {
  adminName: string;
  adminEmail: string;
  hotelName: string;
  hotelCity: string;
  appUrl?: string;
  loginEmail?: string;
  loginPassword?: string; // uniquement J0
}

// ── J0 : Bienvenue + accès ──────────────────────────────────────────────────
export async function sendWelcomeEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>Bienvenue sur Sapphire, ${ctx.adminName} ! 🎉</h1>
    <p>Votre espace <strong>${ctx.hotelName}</strong> est prêt. Voici vos accès :</p>

    <div class="tip-box">
      <strong>📧 Identifiant :</strong> ${ctx.loginEmail ?? ctx.adminEmail}<br/>
      <strong>🔑 Mot de passe :</strong> ${ctx.loginPassword ?? '[défini lors de l\'inscription]'}
    </div>

    <a href="${appUrl}/login" class="cta">Accéder à mon espace →</a>

    <h2>Vos 3 premières actions</h2>
    <div class="step"><span class="step-num">1</span><span>Complétez le profil de votre hôtel (logo, chambres, tarifs)</span></div>
    <div class="step"><span class="step-num">2</span><span>Invitez votre équipe (réceptionnistes, gouvernante)</span></div>
    <div class="step"><span class="step-num">3</span><span>Créez votre première réservation test</span></div>

    <p style="margin-top:28px;">Des questions ? Répondez directement à cet email, je vous réponds en moins de 4h.</p>
    <p>À très vite,<br/><strong>Alex — Fondateur Sapphire</strong></p>
  `, `Votre espace ${ctx.hotelName} est prêt — accédez maintenant`);

  return sendEmail(ctx.adminEmail, `Bienvenue sur Sapphire, ${ctx.adminName} — vos accès sont prêts`, html);
}

// ── J2 : Premiers pas ────────────────────────────────────────────────────────
export async function sendFirstStepsEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>Comment avance ${ctx.hotelName} ? 🏨</h1>
    <p>Il y a 2 jours, vous avez rejoint Sapphire. Voici la suite logique pour en tirer le maximum rapidement :</p>

    <h2>Guide rapide (30 minutes)</h2>
    <div class="step"><span class="step-num">1</span><span><strong>Configurez vos types de chambres</strong> → Paramètres › Hôtel › Chambres</span></div>
    <div class="step"><span class="step-num">2</span><span><strong>Ajoutez vos tarifs saisonniers</strong> → Paramètres › Hôtel › Tarifs</span></div>
    <div class="step"><span class="step-num">3</span><span><strong>Créez votre premier client</strong> → Clients › Nouveau client</span></div>
    <div class="step"><span class="step-num">4</span><span><strong>Faites une réservation test</strong> → Réservations › Nouvelle réservation</span></div>

    <div class="tip-box">
      💡 <strong>Astuce :</strong> Le module housekeeping vous permet d'assigner les tâches de nettoyage automatiquement après chaque check-out. Testez-le dès votre première réservation !
    </div>

    <a href="${appUrl}" class="cta">Continuer la configuration →</a>

    <p>Si vous êtes bloqué sur quoi que ce soit, <a href="mailto:support@sapphire.luxury">écrivez-moi</a> — je donne personnellement un coup de main aux hôtels de la première vague.</p>
  `, `Guide rapide : 4 étapes pour être opérationnel en 30 min`);

  return sendEmail(ctx.adminEmail, `${ctx.hotelName} — Guide de démarrage rapide (30 min)`, html);
}

// ── J5 : Channel Manager ─────────────────────────────────────────────────────
export async function sendChannelManagerEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>Connectez vos canaux de distribution 🔗</h1>
    <p>Bonjour ${ctx.adminName},</p>
    <p>La plupart des hôtels perdent 12-18% de RevPAR à cause de surbookings et de prix désynchronisés entre leurs canaux. Notre <strong>Channel Manager intégré</strong> résout ça en quelques clics.</p>

    <h2>Canaux supportés</h2>
    <div class="step"><span class="step-num">🏢</span><span><strong>Booking.com</strong> — Synchronisation bidirectionnelle des disponibilités et prix</span></div>
    <div class="step"><span class="step-num">✈️</span><span><strong>Expedia</strong> — Push automatique des tarifs</span></div>
    <div class="step"><span class="step-num">🏠</span><span><strong>Airbnb</strong> — Import des réservations</span></div>
    <div class="step"><span class="step-num">🌐</span><span><strong>Site direct</strong> — Widget de réservation personnalisable</span></div>

    <div class="tip-box">
      ⚡ <strong>Temps de setup :</strong> ~15 minutes par canal. Nous avons des guides pas-à-pas pour chaque OTA.
    </div>

    <a href="${appUrl}/channels" class="cta">Connecter mes canaux →</a>

    <p>Si vous avez déjà des contrats avec des OTAs, envoyez-moi vos accès et je fais le setup avec vous lors d'un call de 20 min.</p>
  `, `Connectez Booking.com, Expedia et Airbnb en 15 minutes`);

  return sendEmail(ctx.adminEmail, `${ctx.hotelName} — Connectez vos canaux OTA (+ 15% RevPAR)`, html);
}

// ── J12 : Fin du trial approche ──────────────────────────────────────────────
export async function sendTrialEndingEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>Votre période d'essai se termine bientôt ⏳</h1>
    <p>Bonjour ${ctx.adminName},</p>
    <p>Il reste <strong>2 jours</strong> à votre période d'essai gratuite de Sapphire pour <strong>${ctx.hotelName}</strong>.</p>
    <p>Pas de panique — aucune donnée ne sera perdue. Mais si vous souhaitez continuer à utiliser Sapphire sans interruption, c'est le bon moment pour activer votre abonnement.</p>

    <h2>Choisissez votre plan</h2>
    <div class="step"><span class="step-num">🥈</span><span><strong>Starter</strong> — 99€/mois · Jusqu'à 20 chambres · PMS complet</span></div>
    <div class="step"><span class="step-num">🥇</span><span><strong>Pro</strong> — 249€/mois · Jusqu'à 100 chambres · PMS + Channel Manager + BI</span></div>
    <div class="step"><span class="step-num">💎</span><span><strong>Enterprise</strong> — 799€/mois · Illimité · Tout inclus + Support prioritaire</span></div>

    <a href="${appUrl}/billing" class="cta">Activer mon abonnement →</a>

    <p>Si le prix est un blocage ou si vous avez des questions, <a href="mailto:alex@sapphire.luxury">répondez à cet email</a>. Je m'engage à trouver une solution qui vous convient.</p>
  `, `2 jours restants — continuez sans interruption`);

  return sendEmail(ctx.adminEmail, `[${ctx.hotelName}] Votre essai se termine dans 2 jours`, html);
}

// ── J14 : Check-in 2 semaines ────────────────────────────────────────────────
export async function sendTwoWeekCheckinEmail(ctx: OnboardingContext) {
  const html = baseTemplate(`
    <h1>Comment se passe ${ctx.hotelName} sur Sapphire ? 💬</h1>
    <p>Bonjour ${ctx.adminName},</p>
    <p>Deux semaines déjà ! Je voulais faire le point avec vous personnellement.</p>

    <h2>Une seule question :</h2>
    <div class="tip-box" style="font-size:18px;text-align:center;">
      Quelle est la fonctionnalité que vous utilisez le plus ? Et celle que vous trouvez manquante ?
    </div>

    <p>Vos retours me sont précieux — ce sont eux qui guident les prochaines fonctionnalités de Sapphire.</p>
    <p>Si vous avez 20 minutes, je serais ravi de vous appeler pour un retour d'expérience. En échange, je vous fais un setup personnalisé de votre channel manager.</p>

    <a href="https://cal.com/sapphire/feedback" class="cta">Réserver un appel (20 min) →</a>

    <p>Ou répondez simplement à cet email 🙂</p>
    <p>Alex</p>
  `, `J-14 : votre retour compte beaucoup pour nous`);

  return sendEmail(ctx.adminEmail, `${ctx.adminName}, comment se passe Sapphire ? (2 min)`, html);
}

// ── J21 : Usage tips avancés ─────────────────────────────────────────────────
export async function sendAdvancedTipsEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>3 features avancées que vous n'utilisez peut-être pas 🚀</h1>
    <p>Bonjour ${ctx.adminName},</p>
    <p>Voici 3 fonctionnalités cachées de Sapphire qui font gagner en moyenne 4h/semaine aux équipes hôtelières :</p>

    <h2>1. Rapports automatiques PDF</h2>
    <p>Générez un rapport complet (RevPAR, occupation, revenus) en 1 clic. Envoyez-le automatiquement à votre direction chaque semaine → <a href="${appUrl}/reports">Rapports</a></p>

    <h2>2. Segmentation invités</h2>
    <p>Identifiez vos clients VIP, loisir vs business, nationaux vs étrangers. Personnalisez l'accueil en conséquence → <a href="${appUrl}/guests">Clients</a></p>

    <h2>3. Facturation automatique au check-out</h2>
    <p>La facture PDF est générée et envoyée au client automatiquement au check-out. Fini les oublis → <a href="${appUrl}/invoices">Facturation</a></p>

    <a href="${appUrl}" class="cta">Explorer les fonctionnalités →</a>
  `, `3 fonctionnalités avancées pour gagner 4h/semaine`);

  return sendEmail(ctx.adminEmail, `${ctx.hotelName} — 3 features avancées que vous n'utilisez peut-être pas`, html);
}

// ── J30 : Bilan 1 mois + demande de témoignage ───────────────────────────────
export async function sendOneMonthReviewEmail(ctx: OnboardingContext) {
  const html = baseTemplate(`
    <h1>🎊 1 mois avec Sapphire — Bilan pour ${ctx.hotelName}</h1>
    <p>Bonjour ${ctx.adminName},</p>
    <p>Déjà un mois ! C'est un moment clé pour faire le bilan ensemble.</p>

    <div class="tip-box">
      Nous espérons que Sapphire a simplifié la gestion opérationnelle de <strong>${ctx.hotelName}</strong>. Si vous êtes satisfait, nous avons une faveur à vous demander.
    </div>

    <h2>💬 Laissez-nous un témoignage (2 min)</h2>
    <p>Votre retour aidera d'autres hôteliers comme vous à découvrir Sapphire. En échange :</p>
    <div class="step"><span class="step-num">✓</span><span>1 mois de réduction sur votre prochain abonnement</span></div>
    <div class="step"><span class="step-num">✓</span><span>Votre hôtel mis en avant sur notre page Clients</span></div>
    <div class="step"><span class="step-num">✓</span><span>Accès prioritaire aux prochaines fonctionnalités</span></div>

    <a href="https://sapphire.luxury/testimonial?hotel=${encodeURIComponent(ctx.hotelName)}&email=${encodeURIComponent(ctx.adminEmail)}" class="cta">Laisser un témoignage →</a>

    <h2>📣 Recommandez Sapphire et gagnez</h2>
    <p>Notre programme d'affiliation vous donne <strong>15% de commission</strong> pour chaque hôtel que vous nous recommandez. Votre lien unique de parrainage se trouve dans votre espace Partenaires.</p>

    <p>Merci pour votre confiance,<br/><strong>Alex — Fondateur Sapphire</strong></p>
  `, `Bilan 1 mois + une faveur à vous demander`);

  return sendEmail(ctx.adminEmail, `🎊 ${ctx.hotelName} — bilan de votre 1er mois sur Sapphire`, html);
}

// ── Win-back (après annulation) ──────────────────────────────────────────────
export async function sendWinBackEmail(ctx: OnboardingContext) {
  const appUrl = ctx.appUrl ?? 'https://app.sapphire.luxury';
  const html = baseTemplate(`
    <h1>Vous nous manquez, ${ctx.adminName} 👋</h1>
    <p>Nous avons vu que vous avez annulé votre abonnement Sapphire pour <strong>${ctx.hotelName}</strong>.</p>
    <p>Avant que vous partiez définitivement, j'aimerais comprendre ce qui n'a pas fonctionné pour vous. 2 minutes de votre temps ?</p>

    <div class="tip-box">
      <strong>Offre spéciale retour :</strong> Si vous revenez dans les 30 jours, bénéficiez de <strong>2 mois offerts</strong> sur n'importe quel plan.
    </div>

    <a href="${appUrl}/billing?promo=COMEBACK2" class="cta">Reprendre mon abonnement →</a>

    <p>Ou dites-moi simplement pourquoi vous êtes parti — <a href="mailto:alex@sapphire.luxury">répondez à cet email</a>. Chaque retour compte.</p>
    <p>Alex</p>
  `, `Nous avons une offre pour vous faire revenir`);

  return sendEmail(ctx.adminEmail, `[${ctx.hotelName}] Votre offre de retour — 2 mois offerts`, html);
}

// ═══════════════════════════════════════════════════════════════════════════════
// Export groupé
// ═══════════════════════════════════════════════════════════════════════════════

export const onboardingEmails = {
  sendWelcomeEmail,         // J0
  sendFirstStepsEmail,      // J2
  sendChannelManagerEmail,  // J5
  sendTrialEndingEmail,     // J12
  sendTwoWeekCheckinEmail,  // J14
  sendAdvancedTipsEmail,    // J21
  sendOneMonthReviewEmail,  // J30
  sendWinBackEmail,         // Win-back
};
