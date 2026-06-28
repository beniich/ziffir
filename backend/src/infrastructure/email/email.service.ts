// Simulate sending emails
// In a production environment, this would use Resend, Sendgrid, or Nodemailer

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const emailService = {
  async sendEmail(options: EmailOptions) {
    // For the MVP, we just log to the console to simulate sending
    console.log('----------------------------------------------------');
    console.log(`📧 [EMAIL SENT TO]: ${options.to}`);
    console.log(`📝 [SUBJECT]: ${options.subject}`);
    console.log(`📄 [CONTENT]:\n${options.html.replace(/<[^>]+>/g, '')}`); // Strip HTML for console readability
    console.log('----------------------------------------------------');
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    return { success: true, messageId: `mock-${Date.now()}` };
  },

  async sendConfirmation(guestName: string, email: string, checkIn: Date, checkOut: Date, roomNumber: string) {
    const formatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' });
    return this.sendEmail({
      to: email,
      subject: 'Confirmation de votre réservation — Sapphire',
      html: `
        <h1>Bonjour ${guestName},</h1>
        <p>Nous sommes ravis de confirmer votre réservation dans notre établissement.</p>
        <ul>
          <li><strong>Chambre :</strong> ${roomNumber}</li>
          <li><strong>Arrivée :</strong> ${formatter.format(checkIn)}</li>
          <li><strong>Départ :</strong> ${formatter.format(checkOut)}</li>
        </ul>
        <p>Toute notre équipe a hâte de vous accueillir.</p>
        <p>Cordialement,<br/>L'équipe Sapphire</p>
      `
    });
  },

  async sendCheckOutReceipt(guestName: string, email: string, amount: number) {
    return this.sendEmail({
      to: email,
      subject: 'Votre facture — Sapphire',
      html: `
        <h1>Merci pour votre séjour, ${guestName}</h1>
        <p>Nous espérons que vous avez passé un excellent moment parmi nous.</p>
        <p>Veuillez trouver ci-dessous le montant total réglé pour votre séjour : <strong>${amount.toFixed(2)} €</strong>.</p>
        <p>À très bientôt,<br/>L'équipe Sapphire</p>
      `
    });
  }
};
