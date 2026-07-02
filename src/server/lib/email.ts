import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendInvitation(params: {
    to: string;
    inviteUrl: string;
    hotelName: string;
    inviterName: string;
    proposedRole: string;
    message?: string;
  }): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bienvenue chez ${params.hotelName}</h2>
        <p>${params.inviterName} vous invite à rejoindre l'équipe en tant que <strong>${params.proposedRole}</strong>.</p>
        ${params.message ? `<blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; color: #666;">${params.message}</blockquote>` : ''}
        <p>
          <a href="${params.inviteUrl}" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Accepter l'invitation
          </a>
        </p>
        <p style="color: #888; font-size: 12px;">Ce lien expire dans 7 jours.</p>
      </div>
    `;
    
    await transporter.sendMail({
      from: `"Ziffir" <${process.env.SMTP_FROM}>`,
      to: params.to,
      subject: `Invitation à rejoindre ${params.hotelName}`,
      html,
    });
  },
  
  async send(params: { to: string; subject: string; html: string }): Promise<void> {
    await transporter.sendMail({
      from: `"Ziffir" <${process.env.SMTP_FROM}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
  },
};
