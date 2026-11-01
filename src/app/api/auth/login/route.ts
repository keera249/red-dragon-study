import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  SESSION_COOKIE_NAME,
  checkRateLimit,
  createSessionToken,
  loadActorById,
  verifyPassword,
} from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email or password format.' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      await recordAuditLog({
        actorEmail: email,
        action: 'LOGIN_FAILED',
        entityType: 'AdminUser',
        summary: `Failed login attempt for ${email}`,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'Invalid credentials or inactive account.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await recordAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'LOGIN_FAILED',
        entityType: 'AdminUser',
        entityId: user.id,
        summary: `Invalid password attempt for ${user.email}`,
        ipAddress: ip,
      });
      return NextResponse.json({ error: 'Invalid credentials or inactive account.' }, { status: 401 });
    }

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      sessionVersion: user.sessionVersion,
    });

    const actor = await loadActorById(user.id);

    await recordAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN_SUCCESS',
      entityType: 'AdminUser',
      entityId: user.id,
      summary: `Employee ${user.email} signed in`,
      ipAddress: ip,
    });

    const response = NextResponse.json({ user: actor });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
