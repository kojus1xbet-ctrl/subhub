import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    if (AdminAuth.isIpBlocked(ip)) {
      return NextResponse.json(
        { error: 'Trop de tentatives infructueuses. Accès temporairement bloqué pendant 5 minutes.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { pinOrPassword } = body;

    if (!pinOrPassword) {
      return NextResponse.json({ error: 'Code PIN ou mot de passe requis' }, { status: 400 });
    }

    const isValid = AdminAuth.validateCredentials(pinOrPassword);

    if (!isValid) {
      const { remaining, blockedMinutes } = AdminAuth.recordFailedAttempt(ip);
      if (blockedMinutes) {
        return NextResponse.json(
          { error: `Tentatives épuisées. Accès bloqué pendant ${blockedMinutes} minutes.` },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Identifiants incorrects. ${remaining} tentative(s) restante(s).` },
        { status: 401 }
      );
    }

    // Succès
    AdminAuth.resetAttempts(ip);
    const token = AdminAuth.generateSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authentification administrateur réussie',
      token
    });

    // Configuration d'un cookie sécurisé HTTP-only
    response.cookies.set({
      name: 'subhub_admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24h
      path: '/'
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const isAuth = AdminAuth.verifyRequest(req);
  return NextResponse.json({ authenticated: isAuth });
}

export async function DELETE(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Déconnexion effectuée' });
  response.cookies.delete('subhub_admin_session');
  return response;
}
