export type AuditEventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  resourceId?: string;
  details?: Record<string, any>;
  severity: AuditEventSeverity;
  previousHash: string;
  hash: string;
}

export async function generateSHA256Hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function createAuditEvent(
  params: Omit<AuditEvent, 'id' | 'timestamp' | 'hash'>
): Promise<AuditEvent> {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  const eventWithoutHash = {
    ...params,
    id,
    timestamp,
  };
  
  const dataString = JSON.stringify(eventWithoutHash, Object.keys(eventWithoutHash).sort());
  const hash = await generateSHA256Hash(dataString);
  
  return {
    ...eventWithoutHash,
    hash
  };
}
