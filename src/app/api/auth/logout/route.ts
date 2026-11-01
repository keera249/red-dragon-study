import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, getAuthenticatedActor } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit';

export async function POST() {
  const actor = await getAuthenticatedActor();
  if (actor) {
    await recordAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      action: 'LOGOUT',
      entityType: 'AdminUser',
      entityId: actor.id,
      summary: `Employee ${actor.email} signed out`,
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  return response;
}
