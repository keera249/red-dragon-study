import { prisma } from './prisma';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'newPassword',
  'oldPassword',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'jwt',
  'cookie',
]);

export function sanitizeAuditMetadata(input: unknown): unknown {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) {
    return input.map(sanitizeAuditMetadata);
  }
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k) || /password|token|secret/i.test(k)) {
      clean[k] = '[REDACTED]';
    } else if (v && typeof v === 'object') {
      clean[k] = sanitizeAuditMetadata(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export async function recordAuditLog(params: {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}) {
  try {
    const sanitized = params.metadata ? sanitizeAuditMetadata(params.metadata) : null;
    await prisma.auditLog.create({
      data: {
        actorId: params.actorId || null,
        actorEmail: params.actorEmail || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        summary: params.summary,
        metadataJson: sanitized ? JSON.stringify(sanitized) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
