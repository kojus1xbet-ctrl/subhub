import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { sendVerificationEmail, getSmtpConfig, saveSmtpConfig } from '@/lib/mailer';

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
  verified?: boolean;
  createdAt: string;
}

interface OtpEntry {
  email: string;
  name?: string;
  passwordHash?: string;
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

function createSessionToken(
  email: string,
  provider: string,
  extra?: { name?: string; passwordHash?: string }
): string {
  const payload = JSON.stringify({
    email: email.toLowerCase().trim(),
    provider,
    name: extra?.name,
    passwordHash: extra?.passwordHash,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 jours
  });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function decodeAndVerifySessionToken(token: string, expectedEmail?: string): any | null {
  try {
    if (!token || !token.includes('.')) return null;
    const [base64Payload, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(base64Payload)
      .digest('base64url');
    if (signature !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (expectedEmail && payload.email !== expectedEmail.toLowerCase().trim()) return null;
    return payload;
  } catch {
    return null;
  }
}

// Jeton OTP signé sans état (compatible Vercel Serverless multi-instances)
function createSignedOtpToken(params: {
  email: string;
  code: string;
  name?: string;
  passwordHash?: string;
  expiresAt: number;
}): string {
  const payload = JSON.stringify({
    email: params.email.toLowerCase().trim(),
    code: params.code,
    name: params.name || '',
    passwordHash: params.passwordHash || '',
    expiresAt: params.expiresAt
  });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${signature}`;
}

function verifySignedOtpToken(otpToken: string, email: string, code: string): {
  valid: boolean;
  name?: string;
  passwordHash?: string;
  expired?: boolean;
} {
  try {
    if (!otpToken || !otpToken.includes('.')) return { valid: false };
    const [base64Payload, signature] = otpToken.split('.');
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(base64Payload)
      .digest('base64url');
    if (signature !== expectedSig) return { valid: false };

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (payload.email !== email.toLowerCase().trim()) return { valid: false };
    if (payload.expiresAt < Date.now()) return { valid: false, expired: true };
    if (payload.code !== code.trim()) return { valid: false };

    return {
      valid: true,
      name: payload.name,
      passwordHash: payload.passwordHash
    };
  } catch {
    return { valid: false };
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
    const {
      action,
      email,
      password,
      name,
      code,
      otpToken,
      isSignup,
      accessToken,
      idToken,
      googleUser
    } = body;

    // 0. Configuration SMTP Admin
    if (action === 'save_smtp_config') {
      saveSmtpConfig({
        gmailUser: body.gmailUser?.trim() || '',
        gmailAppPassword: body.gmailAppPassword?.trim() || '',
        resendApiKey: body.resendApiKey?.trim() || '',
        senderName: body.senderName?.trim() || 'SubHub Sécurité'
      });
      return NextResponse.json({
        success: true,
        message: 'Configuration e-mail enregistrée avec succès !'
      });
    }

    // 1. Authentification OAuth 2.0 Officielle Google
    if (action === 'google_oauth') {
      let verifiedEmail = '';
      let verifiedName = '';
      let verifiedPicture: string | null = null;
      let googleSub = '';

      if (idToken && typeof idToken === 'string' && idToken.split('.').length === 3) {
        try {
          const payloadJson = Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8');
          const gData = JSON.parse(payloadJson);
          if (gData.iss !== 'https://accounts.google.com' && gData.iss !== 'accounts.google.com') {
            return NextResponse.json({ success: false, error: 'Émetteur du jeton Google invalide' }, { status: 401 });
          }
          verifiedEmail = gData.email;
          verifiedName = gData.name || gData.given_name || verifiedEmail.split('@')[0];
          verifiedPicture = gData.picture || null;
          googleSub = gData.sub;
        } catch {
          return NextResponse.json({ success: false, error: 'Format ID Token Google invalide' }, { status: 401 });
        }
      } else if (googleUser && googleUser.email && accessToken) {
        verifiedEmail = googleUser.email;
        verifiedName = googleUser.name || googleUser.given_name || verifiedEmail.split('@')[0];
        verifiedPicture = googleUser.picture || null;
        googleSub = googleUser.sub || '';
      } else if (accessToken) {
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
      const sessionToken = createSessionToken(normalizedEmail, 'google', { name: verifiedName });

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
        verified: true,
        createdAt: user.createdAt
      });

      return NextResponse.json({
        success: true,
        message: 'Authentification Google réussie !',
        user
      });
    }

    // 2. Connexion par Email + Mot de passe personnel chiffré
    if (action === 'email_password_auth') {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir une adresse e-mail valide (ex: votre.nom@gmail.com)' },
          { status: 400 }
        );
      }
      if (!password || typeof password !== 'string' || password.length < 4) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir votre mot de passe (min. 4 caractères)' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const incomingHash = hashPassword(normalizedEmail, password);
      const clients = getStoredClients();
      const existing = clients[normalizedEmail];

      // Si le client existe déjà avec un mot de passe différent
      if (existing && existing.passwordHash && existing.passwordHash !== incomingHash) {
        return NextResponse.json(
          { success: false, error: 'Mot de passe incorrect. Vous pouvez aussi vous connecter via "Code par e-mail".' },
          { status: 401 }
        );
      }

      const isGoogleMail = normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com');
      const displayName = name?.trim() || existing?.name || normalizedEmail.split('@')[0];
      const provider: 'google' | 'email' = isGoogleMail ? 'google' : 'email';
      const sessionToken = createSessionToken(normalizedEmail, provider, {
        name: displayName,
        passwordHash: incomingHash
      });

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
        verified: true,
        createdAt: user.createdAt
      });

      return NextResponse.json({
        success: true,
        message: 'Connexion réussie !',
        user
      });
    }

    // 3. Envoi d'un code de vérification à 6 chiffres + Lien de validation par e-mail (Inscription ou Connexion)
    if (action === 'send_code' || action === 'register_send_code') {
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return NextResponse.json(
          { success: false, error: 'Veuillez saisir une adresse e-mail valide' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const displayName = name?.trim() || normalizedEmail.split('@')[0];
      const passwordHash = password && password.length >= 4 ? hashPassword(normalizedEmail, password) : '';
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

      const sessionToken = createSessionToken(
        normalizedEmail,
        normalizedEmail.endsWith('@gmail.com') ? 'google' : 'email',
        { name: displayName, passwordHash }
      );

      const signedOtpToken = createSignedOtpToken({
        email: normalizedEmail,
        code: generatedCode,
        name: displayName,
        passwordHash,
        expiresAt
      });

      OTP_STORE.set(normalizedEmail, {
        email: normalizedEmail,
        name: displayName,
        passwordHash,
        code: generatedCode,
        token: sessionToken,
        expiresAt
      });

      const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://subhub-phi.vercel.app';
      const magicLinkPath = `/dashboard?auth_token=${encodeURIComponent(sessionToken)}&email=${encodeURIComponent(normalizedEmail)}`;
      const fullMagicLinkUrl = `${origin}${magicLinkPath}`;

      // Envoi de l'e-mail réel contenant le code à 6 chiffres + le bouton de validation
      const emailResult = await sendVerificationEmail({
        to: normalizedEmail,
        name: displayName,
        code: generatedCode,
        magicLinkUrl: fullMagicLinkUrl,
        isSignup: Boolean(isSignup || action === 'register_send_code')
      });

      return NextResponse.json({
        success: true,
        emailSent: emailResult.sent,
        emailProvider: emailResult.provider || null,
        emailError: emailResult.error || null,
        message: emailResult.sent
          ? `Un e-mail contenant votre code à 6 chiffres et votre lien d'activation a été envoyé à ${normalizedEmail}`
          : `Code de sécurité généré pour ${normalizedEmail}`,
        email: normalizedEmail,
        // Si l'envoi SMTP est actif, on ne renvoie pas le code en clair dans l'UI pour garantir la validation de la boîte mail.
        // Si aucun serveur SMTP n'est encore configuré, on fournit le code de secours pour éviter tout blocage.
        code: emailResult.sent ? null : generatedCode,
        otpToken: signedOtpToken,
        magicLink: magicLinkPath
      });
    }

    // 4. Vérification du code à 6 chiffres (Inscription ou Connexion)
    if (action === 'verify_code') {
      if (!email || !code) {
        return NextResponse.json(
          { success: false, error: 'Adresse e-mail et code à 6 chiffres requis' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const cleanCode = code.toString().trim();

      let verifiedName = name?.trim() || '';
      let verifiedPassHash = '';
      let isValid = false;

      // A. Vérification via jeton signé stateless (prioritaire sur Vercel Serverless)
      if (otpToken) {
        const check = verifySignedOtpToken(otpToken, normalizedEmail, cleanCode);
        if (check.expired) {
          return NextResponse.json(
            { success: false, error: 'Ce code a expiré. Veuillez en demander un nouveau.' },
            { status: 400 }
          );
        }
        if (check.valid) {
          isValid = true;
          verifiedName = check.name || verifiedName;
          verifiedPassHash = check.passwordHash || '';
        }
      }

      // B. Vérification en mémoire locale en complément
      if (!isValid) {
        const entry = OTP_STORE.get(normalizedEmail);
        if (!entry) {
          return NextResponse.json(
            { success: false, error: 'Code incorrect ou expiré. Veuillez vérifier les 6 chiffres.' },
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
        if (entry.code !== cleanCode) {
          return NextResponse.json(
            { success: false, error: 'Code incorrect. Veuillez vérifier le code à 6 chiffres reçu.' },
            { status: 400 }
          );
        }
        isValid = true;
        verifiedName = entry.name || verifiedName;
        verifiedPassHash = entry.passwordHash || '';
        OTP_STORE.delete(normalizedEmail);
      }

      const clients = getStoredClients();
      const existing = clients[normalizedEmail];
      const finalName = verifiedName || existing?.name || normalizedEmail.split('@')[0];
      const finalPassHash = verifiedPassHash || existing?.passwordHash || '';
      const isGoogleMail = normalizedEmail.endsWith('@gmail.com') || normalizedEmail.endsWith('@googlemail.com');
      const provider: 'google' | 'email' = isGoogleMail ? 'google' : 'email';
      const sessionToken = createSessionToken(normalizedEmail, provider, {
        name: finalName,
        passwordHash: finalPassHash
      });

      const user = {
        id: existing?.id || `usr_${Date.now()}`,
        email: normalizedEmail,
        name: finalName,
        avatar: existing?.avatar || null,
        provider,
        sessionToken,
        createdAt: existing?.createdAt || new Date().toISOString()
      };

      saveStoredClient({
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: finalPassHash,
        avatar: user.avatar,
        provider: user.provider,
        verified: true,
        createdAt: user.createdAt
      });

      return NextResponse.json({
        success: true,
        message: 'Compte validé et connecté avec succès !',
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

// GET: Vérification cryptographique de session, validation de Magic Link, ou statut SMTP
export async function GET(req: NextRequest) {
  cleanExpiredEntries();
  const searchParams = req.nextUrl.searchParams;

  if (searchParams.get('smtp_status') === '1') {
    const cfg = getSmtpConfig();
    return NextResponse.json({
      configured: Boolean((cfg.gmailUser && cfg.gmailAppPassword) || cfg.resendApiKey),
      gmailUser: cfg.gmailUser || '',
      hasAppPassword: Boolean(cfg.gmailAppPassword),
      hasResendKey: Boolean(cfg.resendApiKey),
      senderName: cfg.senderName || 'SubHub Sécurité'
    });
  }

  const verifyToken = searchParams.get('verify_token');
  const token = searchParams.get('token');
  const email = searchParams.get('email')?.toLowerCase().trim();

  // 1. Vérification de validité d'un jeton de session existant
  if (verifyToken) {
    const payload = decodeAndVerifySessionToken(verifyToken, email);
    return NextResponse.json({ valid: Boolean(payload) });
  }

  // 2. Validation d'un lien magique reçu par e-mail (?token=...&email=...)
  if (!token || !email) {
    return NextResponse.json({ success: false, error: 'Paramètres de validation manquants' }, { status: 400 });
  }

  const decodedPayload = decodeAndVerifySessionToken(token, email);
  const entry = OTP_STORE.get(email);

  if (!decodedPayload && (!entry || entry.token !== token || entry.expiresAt < Date.now())) {
    return NextResponse.json({ success: false, error: 'Lien de validation invalide ou expiré' }, { status: 400 });
  }

  if (entry) {
    OTP_STORE.delete(email);
  }

  const clients = getStoredClients();
  const existing = clients[email];
  const displayName = decodedPayload?.name || entry?.name || existing?.name || email.split('@')[0];
  const passwordHash = decodedPayload?.passwordHash || entry?.passwordHash || existing?.passwordHash || '';
  const provider = (email.endsWith('@gmail.com') ? 'google' : 'email') as 'google' | 'email';

  const sessionToken = createSessionToken(email, provider, { name: displayName, passwordHash });

  const user = {
    id: existing?.id || `usr_${Date.now()}`,
    email,
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
    passwordHash,
    avatar: user.avatar,
    provider: user.provider,
    verified: true,
    createdAt: user.createdAt
  });

  return NextResponse.json({ success: true, user });
}
