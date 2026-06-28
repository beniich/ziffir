import type { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../../../services/api-key.service.js';

export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const rawKey = authHeader.split(' ')[1];
  const apiKey = await validateApiKey(rawKey);

  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  // Ajouter l'hôtel au contexte de la requête pour les contrôleurs
  req.user = {
    id: 'api',
    userId: 'api', // pas d'utilisateur humain
    hotelId: apiKey.hotelId,
    role: 'ADMIN' as any, // override de type pour l'API
    email: `api_${apiKey.id}@sapphire.luxury`,
  };

  (req as any).apiKey = apiKey; // pour vérifier les scopes si besoin

  next();
}

export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = (req as any).apiKey;
    if (!apiKey) return res.status(401).json({ error: 'No API key context' });
    
    const scopes = apiKey.scopes.split(',');
    if (!scopes.includes(scope) && !scopes.includes('*')) {
      return res.status(403).json({ error: `Missing required scope: ${scope}` });
    }
    
    next();
  };
}
