export const logger = {
  info: (meta: any, msg: string) => console.log(`[INFO] ${msg}`, meta),
  warn: (meta: any, msg: string) => console.warn(`[WARN] ${msg}`, meta),
  error: (meta: any, msg: string) => console.error(`[ERROR] ${msg}`, meta),
  debug: (meta: any, msg: string) => console.debug(`[DEBUG] ${msg}`, meta),
};
