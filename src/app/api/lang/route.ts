import { NextRequest, NextResponse } from 'next/server';
import { LANGUAGE_COOKIE_NAME } from '@/lib/i18n';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const lang = body?.lang === 'en' ? 'en' : 'ar';
    const res = NextResponse.json({ lang });
    res.cookies.set(LANGUAGE_COOKIE_NAME, lang, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
