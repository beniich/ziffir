import { Request, Response, NextFunction } from 'express';
import './types.js'; // Ensure Express Request is augmented

/**
 * Security Envelope: Authentication Middleware
 * Extracts Bearer Token or Zaphir-API-Key and validates it.
 * Populates req.user if valid, otherwise throws 401.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-zaphir-api-key'];

  try {
    // 1. API Key based Authentication (for Server-to-Server or IoT devices)
    if (apiKeyHeader) {
      // In production, validate apiKey against DB. 
      // For now, simple static check for demonstration.
      if (apiKeyHeader === 'ZAPHIR_MASTER_KEY') {
        req.user = {
          userId: 'system-service',
          tenantId: 'zaphir-global',
          role: 'system_admin'
        };
        return next();
      }
    }

    // 2. JWT Bearer Token Authentication (for Web App Users)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      // TODO: Verify JWT with Firebase Admin.
      // For now, we simulate token decoding:
      // A real implementation would do: const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Sandbox bypass simulation:
      if (token === 'sandbox-token-operator') {
        req.user = { userId: 'sandbox-operator-1', tenantId: 'tenant_test', role: 'operator' };
        return next();
      } else if (token === 'sandbox-token-proprietor') {
        req.user = { userId: 'sandbox-proprietor-1', tenantId: 'tenant_test', role: 'manager' };
        return next();
      }
    }

    // 3. Fallback: Unauthenticated
    return res.status(401).json({ error: 'Unauthorized', message: 'Missing or invalid authentication credentials.' });

  } catch (error) {
    return res.status(500).json({ error: 'Internal Security Error', details: error instanceof Error ? error.message : String(error) });
  }
};
