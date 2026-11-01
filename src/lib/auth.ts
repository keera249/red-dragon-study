import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { AuthenticatedActor, PermissionCode, hasPermission } from './rbac';

export const SESSION_COOKIE_NAME = 'rds_admin_session';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'red-dragon-study-fallback-dev-secret-key-2026';
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, 10);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export interface SessionPayload {
  userId: string;
  email: string;
  sessionVersion: number;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const hours = Number(process.env.SESSION_DURATION_HOURS || '24') || 24;
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${hours}h`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (
      typeof payload.userId === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.sessionVersion === 'number'
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        sessionVersion: payload.sessionVersion,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function loadActorById(userId: string, expectedSessionVersion?: number): Promise<AuthenticatedActor | null> {
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user || !user.isActive) return null;
  if (typeof expectedSessionVersion === 'number' && user.sessionVersion !== expectedSessionVersion) {
    return null;
  }

  const roles: string[] = [];
  const permissionsSet = new Set<string>();

  for (const ur of user.userRoles) {
    roles.push(ur.role.code);
    for (const rp of ur.role.rolePermissions) {
      permissionsSet.add(rp.permission.code);
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive,
    roles,
    permissions: Array.from(permissionsSet),
  };
}

export async function getAuthenticatedActor(req?: NextRequest): Promise<AuthenticatedActor | null> {
  try {
    let token: string | undefined;
    if (req) {
      token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    }
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }
    if (!token) return null;
    const payload = await verifySessionToken(token);
    if (!payload) return null;
    return loadActorById(payload.userId, payload.sessionVersion);
  } catch {
    return null;
  }
}

export async function requireApiAuth(
  requiredPermission?: PermissionCode,
  req?: NextRequest
): Promise<{ actor: AuthenticatedActor; errorResponse?: never } | { actor?: never; errorResponse: NextResponse }> {
  const actor = await getAuthenticatedActor(req);
  if (!actor) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      ),
    };
  }
  if (requiredPermission && !hasPermission(actor, requiredPermission)) {
    return {
      errorResponse: NextResponse.json(
        { error: `Forbidden: missing permission '${requiredPermission}'` },
        { status: 403 }
      ),
    };
  }
  return { actor };
}

// In-memory rate limiter for auth and inquiry endpoints
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60_000): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

export function resetRateLimitStore() {
  rateLimitStore.clear();
}
