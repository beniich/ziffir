import { env } from '../config/env.js';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface EmailResult {
  id: string;
  success: boolean;
  error?: string;
}

/**
 * Email service abstraction.
 * Falls back to MockEmailService if no provider is configured.
 */
export interface IEmailService {
  send(opts: EmailOptions): Promise<EmailResult>;
}

class MockEmailService implements IEmailService {
  async send(opts: EmailOptions): Promise<EmailResult> {
    const recipients = Array.isArray(opts.to) ? opts.to.join(', ') : opts.to;
    console.log('\n📧 ============ MOCK EMAIL ============');
    console.log(`To: ${recipients}`);
    console.log(`Subject: ${opts.subject}`);
    console.log(`Body:\n${opts.text ?? opts.html.replace(/<[^>]+>/g, '')}`);
    console.log('=====================================\n');
    
    return {
      id: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      success: true,
    };
  }
}

class ResendEmailService implements IEmailService {
  constructor(private apiKey: string, private from: string) {}

  async send(opts: EmailOptions): Promise<EmailResult> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.from,
          to: Array.isArray(opts.to) ? opts.to : [opts.to],
          subject: opts.subject,
          html: opts.html,
          text: opts.text,
          reply_to: opts.replyTo,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        return { id: '', success: false, error };
      }

      const data = (await res.json()) as { id: string };
      return { id: data.id, success: true };
    } catch (err) {
      return {
        id: '',
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }
}

function createEmailService(): IEmailService {
  if (env.RESEND_API_KEY && env.RESEND_API_KEY.length > 0) {
    console.log('📧 Email service: Resend');
    return new ResendEmailService(env.RESEND_API_KEY, env.SMTP_FROM);
  }
  console.log('📧 Email service: MOCK (set RESEND_API_KEY for real emails)');
  return new MockEmailService();
}

export const emailService = createEmailService();

// ===== Email templates =====

export const emailTemplates = {
  userInvitation(params: {
    inviterName: string;
    hotelName: string;
    setupUrl: string;
    role: string;
  }): EmailOptions {
    return {
      to: '', // filled by caller
      subject: `Invitation à rejoindre ${params.hotelName}`,
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Bienvenue sur Sapphire</h1>
          <p>Bonjour,</p>
          <p><strong>${params.inviterName}</strong> vous invite à rejoindre <strong>${params.hotelName}</strong> en tant que <strong>${params.role}</strong>.</p>
          <p>Cliquez sur le lien ci-dessous pour configurer votre compte :</p>
          <p style="margin: 24px 0;">
            <a href="${params.setupUrl}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Configurer mon compte
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 7 jours.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">Sapphire PMS — ${params.hotelName}</p>
        </div>
      `,
      text: `${params.inviterName} vous invite à rejoindre ${params.hotelName} (${params.role}).\n\nConfigurez votre compte : ${params.setupUrl}\n\nCe lien expire dans 7 jours.`,
    };
  },

  passwordReset(params: {
    userName: string;
    resetUrl: string;
  }): EmailOptions {
    return {
      to: '',
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Réinitialisation du mot de passe</h1>
          <p>Bonjour ${params.userName},</p>
          <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
          <p style="margin: 24px 0;">
            <a href="${params.resetUrl}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 1 heure.</p>
        </div>
      `,
      text: `Bonjour ${params.userName},\n\nRéinitialisez votre mot de passe : ${params.resetUrl}\n\nCe lien expire dans 1 heure.`,
    };
  },

  temporaryPassword(params: {
    userName: string;
    tempPassword: string;
    loginUrl: string;
  }): EmailOptions {
    return {
      to: '',
      subject: 'Votre nouveau mot de passe temporaire',
      html: `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1e40af;">Mot de passe réinitialisé</h1>
          <p>Bonjour ${params.userName},</p>
          <p>Votre mot de passe a été réinitialisé par un administrateur.</p>
          <p><strong>Mot de passe temporaire :</strong></p>
          <pre style="background: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace;">${params.tempPassword}</pre>
          <p>Connectez-vous et changez-le immédiatement :</p>
          <p style="margin: 24px 0;">
            <a href="${params.loginUrl}" style="background: #1e40af; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
              Se connecter
            </a>
          </p>
          <p style="color: #dc2626; font-size: 14px;">⚠️ Ce mot de passe ne s'affiche qu'une seule fois.</p>
        </div>
      `,
      text: `Bonjour ${params.userName},\n\nMot de passe temporaire : ${params.tempPassword}\n\nConnectez-vous : ${params.loginUrl}\n\n⚠️ Changez-le immédiatement.`,
    };
  },
};
