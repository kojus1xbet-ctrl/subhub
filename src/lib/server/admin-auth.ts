import { NextRequest } from 'next/server';
import crypto from 'crypto';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'subhub_default_secret_key_change_me_9921';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'LordFlix#2026!Admin';
const ADMIN_PIN = process.env.ADMIN_PIN || '1602';

// Protection Brute-Force en mémoire
interface AttemptRecord {
  count: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, AttemptRecord>();

export class AdminAuth {
  /**
   * Vérifie si l'IP est temporairement bloquée après trop de tentatives
   */
  static isIpBlocked(ip: string): boolean {
    const record = loginAttempts.get(ip);
    if (!record) return false;
    if (record.blockedUntil > Date.now()) {
      return true;
    }
    if (record.blockedUntil <= Date.now() && record.count >= 5) {
      loginAttempts.delete(ip);
    }
    return false;
  }

  /**
   * Enregistre un échec de connexion
   */
  static recordFailedAttempt(ip: string): { remaining: number; blockedMinutes?: number } {
    const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
    record.count += 1;
    if (record.count >= 5) {
      record.blockedUntil = Date.now() + 5 * 60 * 1000; // Bloqué 5 minutes
      loginAttempts.set(ip, record);
      return { remaining: 0, blockedMinutes: 5 };
    }
    loginAttempts.set(ip, record);
    return { remaining: 5 - record.count };
  }

  /**
   * Réinitialise les tentatives après succès
   */
  static resetAttempts(ip: string): void {
    loginAttempts.delete(ip);
  }

  /**
   * Valide le mot de passe ou code PIN admin
   */
  static validateCredentials(input: string): boolean {
    if (!input) return false;
    const clean = input.trim();
    const currentPass = (process.env.ADMIN_PASSWORD || 'LordFlix#2026!Admin').trim();
    const currentPin = (process.env.ADMIN_PIN || '1602').trim();
    return clean === currentPass || clean === currentPin;
  }

  /**
   * Génère un jeton de session signé HMAC
   */
  static generateSessionToken(): string {
    const timestamp = Date.now().toString();
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${timestamp}:${nonce}`;
    const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}:${hmac}`).toString('base64');
  }

  /**
   * Vérifie la validité d'un jeton de session
   */
  static verifySessionToken(token: string): boolean {
    try {
      if (!token) return false;
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const parts = decoded.split(':');
      if (parts.length !== 3) return false;

      const [timestampStr, nonce, hmac] = parts;
      const timestamp = parseInt(timestampStr, 10);
      if (isNaN(timestamp)) return false;

      // Expiration du jeton après 24 heures
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - timestamp > maxAge) return false;

      const payload = `${timestampStr}:${nonce}`;
      const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

      return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
    } catch {
      return false;
    }
  }

  /**
   * Vérifie si la requête HTTP provient d'un administrateur authentifié
   */
  static verifyRequest(req: NextRequest): boolean {
    // 1. Vérification header Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (this.verifySessionToken(token)) return true;
    }

    // 2. Vérification cookie de session
    const cookieToken = req.cookies.get('subhub_admin_session')?.value;
    if (cookieToken && this.verifySessionToken(cookieToken)) {
      return true;
    }

    return false;
  }
}
