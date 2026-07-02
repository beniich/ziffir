import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable d'environnement manquante: ${key}`);
  }
  return value;
}

export const config = {
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000'),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    inviteSecret: process.env.JWT_INVITE_SECRET || 'dev-invite-secret-change-me',
  },
  
  cookies: {
    domain: process.env.COOKIE_DOMAIN || '',
    secure: process.env.COOKIE_SECURE === 'true',
  },
  
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025'), // MailHog par défaut en dev
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@ziffir.local',
  },
  
  database: {
    url: required('DATABASE_URL'),
  },
};
