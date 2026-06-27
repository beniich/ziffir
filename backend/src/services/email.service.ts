import { logger } from '../utils/logger';

export const sendEmail = async (options: {
  to: string;
  subject: string;
  template: string;
  data: any;
}) => {
  logger.info({ to: options.to, subject: options.subject }, 'MOCK EMAIL SENT');
  return true;
};
