import { prisma } from '../../infrastructure/database/prisma.client.js';
import { createHash } from 'node:crypto';
import type { Request } from 'express';

export const GENESIS_HASH = '0'.repeat(64);

export type AuditPayload = {
  actor: string;
  action: string;
  resource: string;
  resourceId?: string;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
};

function canonicalize(obj: any): string {
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalize).join(',') + ']';
  if (obj instanceof Date) return JSON.stringify(obj.toISOString());
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalize(obj[k])).join(',') + '}';
}

export function computeHash(previousHash: string, payload: object): string {
  return createHash('sha256')
    .update(previousHash + canonicalize(payload))
    .digest('hex');
}

/**
 * Log an audit event with chained hash.
 * Fetches the chain head, computes the new hash, and persists atomically.
 */
export async function logAudit(payload: AuditPayload, req?: Request) {
  const lastEvent = await prisma.auditEvent.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true },
  });
  
  const previousHash = lastEvent?.hash ?? GENESIS_HASH;
  
  const fullPayload = {
    timestamp: new Date(),
    actor: payload.actor,
    action: payload.action,
    resource: payload.resource,
    resourceId: payload.resourceId ?? null,
    before: payload.before ?? null,
    after: payload.after ?? null,
    metadata: {
      ...(payload.metadata ?? {}),
      ...(req?.ip ? { ip: req.ip } : {}),
      ...(req?.get('user-agent') ? { userAgent: req.get('user-agent') } : {}),
    },
  };
  
  const hash = computeHash(previousHash, fullPayload);
  
  return prisma.auditEvent.create({
    data: {
      ...fullPayload,
      previousHash,
      hash,
    },
  });
}

/**
 * Verify the integrity of the entire chain.
 * Returns the first broken event ID if any, or null if all valid.
 */
export async function verifyChain(): Promise<{
  valid: boolean;
  eventsChecked: number;
  brokenAt: string | null;
  firstInvalidTimestamp: Date | null;
}> {
  const events = await prisma.auditEvent.findMany({
    orderBy: { timestamp: 'asc' },
  });
  
  let previousHash = GENESIS_HASH;
  
  for (const event of events) {
    const { hash, previousHash: storedPrev, ...rest } = event;
    
    if (storedPrev !== previousHash) {
      return {
        valid: false,
        eventsChecked: events.length,
        brokenAt: event.id,
        firstInvalidTimestamp: event.timestamp,
      };
    }
    
    const expectedHash = computeHash(previousHash, { ...rest, timestamp: event.timestamp });
    if (expectedHash !== hash) {
      return {
        valid: false,
        eventsChecked: events.length,
        brokenAt: event.id,
        firstInvalidTimestamp: event.timestamp,
      };
    }
    
    previousHash = hash;
  }
  
  return {
    valid: true,
    eventsChecked: events.length,
    brokenAt: null,
    firstInvalidTimestamp: null,
  };
}
