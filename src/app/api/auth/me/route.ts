import { NextResponse } from 'next/server';
import { getAuthenticatedActor } from '@/lib/auth';

export async function GET() {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user: actor });
}
