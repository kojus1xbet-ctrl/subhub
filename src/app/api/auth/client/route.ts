import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'subhub_default_client_secret_2026';
const IS_VERCEL = process.env.VERCEL === '1';
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');

interface StoredClientRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatar?: string | null;
  provider: 'google' | 'email';
  createdAt: string;
}

interface OtpEntry {
  email: string;
  code: string;
  token: string;
  expiresAt: number;
}

const OTP_STORE = new Map<string, OtpEntry>();

function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of OTP_STORE.entries()) {
    if (entry.expiresAt < now) {
      OTP_STORE.delete(key);
    }
  }
}

function hashPassword(email: string, password: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${email.toLowerCase().trim()}:${password}`)
    .digest('hex');
}

function createSessionToken(email: string, provider: string): string {
  const payload = JSON.stringify({
    email: email.toLowerCase().trim(),
    provider,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 jours
  });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySessionToken(token: string, expectedEmail?: string): boolean {
  try {
    if (!token || !token.includes('.')) return false;
    const [base64Payload, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(base64Payload)
      .digest('base64url');
    if (signature !== expectedSig) return false;

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return false;
    if (expectedEmail && payload.email !== expectedEmail.toLowerCase().trim()) return false;
    return true;
  } catch {
    return false;
  }
}

function getStoredClients(): Record<string, StoredClientRecord> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(CLIENTS_FILE)) {
      return JSON.parse(fs.readFileSync(CLIENTS_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('Lecture clients.json:', e);
  }
  return {};
}

function saveStoredClient(record: StoredClientRecord) {
  try {
    const clients = getStoredClients();
    clients[record.email.toLowerCase().trim()] = record;
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf8');
  } catch (e) {
    console.warn('Sauvegarde clients.json:', e);
  }
}

export async function POST(req: NextRequest) {
  cleanExpiredEntries();

  try {
    const body = await req.json();
    const { action, email, password, name, code, accessToken, idToken } = body;

    // 1. Authentification OAuth 2.0 Officielle Google (vérifiée auprès des serveurs Google)
    if (action === 'google_oauth') {
      let verifiedEmail = '';
      let verifiedName = '';
      let verifiedPicture: string | null = null;
      let googleSub = '';

      if (accessToken) {
        const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!gRes.ok) {
          return NextResponse.json(
            { success: false, error: 'Jeton Google OAuth invalide ou expiré' },
            { status: 401 }
          );
        }
        const gData = await gRes.json();
        verifiedEmail = gData.email;
        verifiedName = gData.name || gData.given_name || verifiedEmail.split('@')[0];
        verifiedPicture = gData.picture || null;
        googleSub = gData.sub;
      } else if (idToken) {
        const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        if (!gRes.ok) {
          return NextResponse.json(
            { success: false, error: 'ID Token Google invalide' },
            { status: 401 }
          );
        }
        const gData = await gRes.json();
        verifiedEmail = gData.email;
        verifiedName = gData.name || verifiedEmail.split('@')[0];
        verifiedPicture = gData.picture || null;
        googleSub = gData.sub;
      } else {
        return NextResponse.json(
          { success: false, error: 'Jeton d\'authentification Google manquant' },
          { status: 400 }
        );
      }

      if (!verifiedEmail) {
        return NextResponse.json(
          { success: false, error: 'Impossible de récupérer l\'adresse e-mail Google' },
          { status: 400 }
        );
      }

      const normalizedEmail = verifiedEmail.toLowerCase().trim();
      const sessionToken = createSessionToken(normalizedEmail, 'google');

      const user = {
        id: `usr_g_${googleSub || Date.now()}`,
        email: normalizedEmail,
        name: verifiedName,
        avatar: verifiedPicture,
        provider: 'google' as const,
        sessionToken,
        createdAt: new Date().toISOString()
      };

      saveStoredClient({
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: '',
        avatar: user.avatar,
        provider: 'google',
        createdAt: user.createdAt
      });

      return NextResponse.json({
        success: true,
        message: 'Authentification Google réussie !',
        user
      });
    }

    // 2. Authentification Client par Compte Google / Email + Mot de passe personnel chiffré
    if (action === 'email_password_auth') {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir une adresse e-mail valide (ex: votre.nom@gmail.com)' },
          { status: 400 }
        );
      }
      if (!password || typeof password !== 'string' || password.length < 4) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir un mot de passe d\'au moins 4 caractères' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const incomingHash = hashPassword(normalizedEmail, password);
      const clients = getStoredClients();
      const existing = clients[normalizedEmail];

      // Si le client existe déjà avec un mot de passe, vérifier le mot de passe
      if (existing && existing.passwordHash && existing.passwordHash !== incomingHash) {
        return NextResponse.json(
          { success: false, error: 'Mot de passe incorrect pour ce compte client.' },
          { status: 401 }
        );
      }

      const isGoogleMail = normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com');
      const displayName = (name?.trim() || existing?.name || normalizedEmail.split('@')[0]);
      const provider: 'google' | 'email' = isGoogleMail ? 'google' : 'email';
      const sessionToken = createSessionToken(normalizedEmail, provider);

      const user = {
        id: existing?.id || `usr_${Date.now()}`,
        email: normalizedEmail,
        name: displayName,
        avatar: existing?.avatar || null,
        provider,
        sessionToken,
        createdAt: existing?.createdAt || new Date().toISOString()
      };

      saveStoredClient({
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: incomingHash,
        avatar: user.avatar,
        provider: user.provider,
        createdAt: user.createdAt
      });

      return NextResponse.json({
        success: true,
        message: 'Connexion réussie !',
        user
      });
    }

    // 3. Envoi d'un code de vérification à 6 chiffres
    if (action === 'send_code') {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir une adresse e-mail valide' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const sessionToken = createSessionToken(normalizedEmail, 'email');
      const expiresAt = Date.now() + 15 * 60 * 1000;

      OTP_STORE.set(normalizedEmail, {
        email: normalizedEmail,
        code: generatedCode,
        token: sessionToken,
        expiresAt
      });

      return NextResponse.json({
        success: true,
        message: `Un code de vérification a été généré pour ${normalizedEmail}`,
        email: normalizedEmail,
        code: generatedCode,
        magicLink: `/dashboard?auth_token=${encodeURIComponent(sessionToken)}&email=${encodeURIComponent(normalizedEmail)}`
      });
    }

    // 4. Vérification du code à 6 chiffres
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

      OTP_STORE.delete(normalizedEmail);
      const isGoogleMail = normalizedEmail.endsWith('@gmail.com');
      const provider: 'google' | 'email' = isGoogleMail ? 'google' : 'email';
      const sessionToken = createSessionToken(normalizedEmail, provider);

      const user = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        provider,
        sessionToken,
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        message: 'Connexion réussie !',
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

// GET: Vérification cryptographique de session ou validation de Magic Link
export async function GET(req: NextRequest) {
  cleanExpiredEntries();
  const searchParams = req.nextUrl.searchParams;
  const verifyToken = searchParams.get('verify_token');
  const token = searchParams.get('token');
  const email = searchParams.get('email')?.toLowerCase().trim();

  // 1. Vérification de validité d'un jeton de session existant
  if (verifyToken) {
    const valid = verifySessionToken(verifyToken, email);
    return NextResponse.json({ valid });
  }

  // 2. Validation d'un lien magique
  if (!token || !email) {
    return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
  }

  const isSignedValid = verifySessionToken(token, email);
  const entry = OTP_STORE.get(email);

  if (!isSignedValid && (!entry || entry.token !== token || entry.expiresAt < Date.now())) {
    return NextResponse.json({ success: false, error: 'Lien magique invalide ou expiré' }, { status: 400 });
  }

  if (entry) {
    OTP_STORE.delete(email);
  }

  const sessionToken = createSessionToken(email, email.endsWith('@gmail.com') ? 'google' : 'email');

  const user = {
    id: `usr_${Date.now()}`,
    email,
    name: email.split('@')[0],
    provider: (email.endsWith('@gmail.com') ? 'google' : 'email') as 'google' | 'email',
    sessionToken,
    createdAt: new Date().toISOString()
  };

  return NextResponse.json({ success: true, user });
}
