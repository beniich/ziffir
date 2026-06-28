import type { Response } from 'express';
import { env } from '../config/env.js';

const COOKIE_NAME = 'sapphire_token';
const isProd = env.NODE_ENV === 'production';

// ISO 27001: durée de session max 12h pour accès à données sensibles
const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 heures

export const cookieOptions = {
  httpOnly: true,
  secure: isProd,                          // false en dev (HTTP localhost)
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
  maxAge: SESSION_MAX_AGE_MS,
};

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, cookieOptions);
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: 0 });
}

export { COOKIE_NAME };
