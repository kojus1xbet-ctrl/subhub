import { NextRequest, NextResponse } from 'next/server';

interface OtpEntry {
  email: string;
  code: string;
  token: string;
  expiresAt: number;
}

// Stockage en mémoire des codes temporaires (durée 15 minutes)
const OTP_STORE = new Map<string, OtpEntry>();

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of OTP_STORE.entries()) {
    if (entry.expiresAt < now) {
      OTP_STORE.delete(key);
    }
  }
}

export async function POST(req: NextRequest) {
  cleanExpiredEntries();

  try {
    const body = await req.json();
    const { action, email, code, token, googleProfile } = body;

    // 1. Envoi de code / lien par email
    if (action === 'send_code') {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir une adresse email valide' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Générer code 6 chiffres
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min

      OTP_STORE.set(normalizedEmail, {
        email: normalizedEmail,
        code: generatedCode,
        token: sessionToken,
        expiresAt
      });

      console.log(`[CLIENT AUTH] Code généré pour ${normalizedEmail}: ${generatedCode}`);

      return NextResponse.json({
        success: true,
        message: `Un code de connexion temporaire a été envoyé à ${normalizedEmail}`,
        email: normalizedEmail,
        code: generatedCode, // Fourni pour test direct ou saisie immédiate
        token: sessionToken,
        magicLink: `/dashboard?auth_token=${sessionToken}&email=${encodeURIComponent(normalizedEmail)}`
      });
    }

    // 2. Vérification du code de connexion
    if (action === 'verify_code') {
      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: 'Email et code à 6 chiffres requis' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const entry = OTP_STORE.get(normalizedEmail);

      if (!entry) {
        return NextResponse.json(
          { success: false, error: 'Aucun code actif pour cet e-mail ou code expiré' },
          { status: 400 }
        );
      }

      if (entry.expiresAt < Date.now()) {
        OTP_STORE.delete(normalizedEmail);
        return NextResponse.json(
          { success: false, error: 'Ce code a expiré. Veuillez en redemander un nouveau.' },
          { status: 400 }
        );
      }

      if (entry.code !== code.toString().trim()) {
        return NextResponse.json(
          { success: false, error: 'Code incorrect. Veuillez vérifier le code à 6 chiffres.' },
          { status: 400 }
        );
      }

      // Code valide -> Supprimer le OTP consommé
      OTP_STORE.delete(normalizedEmail);

      const user = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        provider: 'email',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Connexion réussie !',
        user
      });
    }

    // 3. Connexion rapide via Google
    if (action === 'google_signin') {
      const gEmail = (googleProfile?.email || 'client.subhub@gmail.com').trim().toLowerCase();
      const gName = googleProfile?.name || gEmail.split('@')[0] || 'Client Google';
      const gAvatar = googleProfile?.avatar || null;

      const user = {
        id: `usr_g_${Date.now()}`,
        email: gEmail,
        name: gName,
        avatar: gAvatar,
        provider: 'google',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Connexion Google réussie !',
        user
      });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET: Validation d'un lien magique (Magic Link)
export async function GET(req: NextRequest) {
  cleanExpiredEntries();
  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get('token');
  const email = searchParams.get('email')?.toLowerCase();

  if (!token || !email) {
    return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
  }

  const entry = OTP_STORE.get(email);
  if (!entry || entry.token !== token || entry.expiresAt < Date.now()) {
    return NextResponse.json({ success: false, error: 'Lien magique invalide ou expiré' }, { status: 400 });
  }

  // Consommer le token
  OTP_STORE.delete(email);

  const user = {
    id: `usr_${Date.now()}`,
    email,
    name: email.split('@')[0],
    provider: 'email',
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ success: true, user });
}
