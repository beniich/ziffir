export const logger = {
  info: (ctx: any, msg?: string) => {
    console.log('[INFO]', ctx, msg || '');
  },
  error: (ctx: any, msg?: string) => {
    console.error('[ERROR]', ctx, msg || '');
  }
};

export const auditLogger = {
  info: (ctx: any, msg?: string) => {
    console.log('[AUDIT]', ctx, msg || '');
  },
  error: (ctx: any, msg?: string) => {
    console.error('[AUDIT_ERROR]', ctx, msg || '');
  }
};
