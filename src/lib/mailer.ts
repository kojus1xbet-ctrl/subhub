import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const IS_VERCEL = process.env.VERCEL === '1';
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const SMTP_CONFIG_FILE = path.join(DATA_DIR, 'smtp-config.json');

export interface SmtpConfig {
  gmailUser?: string;
  gmailAppPassword?: string;
  resendApiKey?: string;
  senderName?: string;
}

export function getSmtpConfig(): SmtpConfig {
  let saved: SmtpConfig = {};
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      saved = JSON.parse(fs.readFileSync(SMTP_CONFIG_FILE, 'utf8'));
    }
  } catch {}

  return {
    gmailUser: process.env.GMAIL_USER || process.env.SMTP_USER || saved.gmailUser || '',
    gmailAppPassword: (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || saved.gmailAppPassword || '').replace(/\s+/g, ''),
    resendApiKey: process.env.RESEND_API_KEY || saved.resendApiKey || '',
    senderName: process.env.EMAIL_SENDER_NAME || saved.senderName || 'SubHub Sécurité'
  };
}

export function saveSmtpConfig(config: SmtpConfig) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SMTP_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.warn('Impossible de sauvegarder smtp-config.json:', e);
  }
}

export async function sendVerificationEmail(params: {
  to: string;
  name?: string;
  code: string;
  magicLinkUrl: string;
  isSignup?: boolean;
}): Promise<{ sent: boolean; provider?: 'gmail' | 'resend'; error?: string }> {
  const { to, name, code, magicLinkUrl, isSignup = false } = params;
  const config = getSmtpConfig();
  const displayName = name || to.split('@')[0];

  const subject = isSignup
    ? `${code} est votre code d'activation SubHub`
    : `${code} est votre code de connexion SubHub`;

  const html = `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#020617;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#0f172a;border:1px solid #1e293b;border-radius:20px;padding:32px;text-align:center;">
            <tr>
              <td>
                <div style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#06b6d4);padding:10px 18px;border-radius:12px;font-weight:900;font-size:20px;color:#ffffff;letter-spacing:-0.5px;margin-bottom:20px;">
                  SubHub
                </div>
                <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:800;color:#ffffff;">
                  ${isSignup ? 'Confirmez votre inscription' : 'Code de connexion sécurisé'}
                </h1>
                <p style="margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#94a3b8;">
                  Bonjour <strong style="color:#e2e8f0;">${displayName}</strong>,<br/>
                  ${
                    isSignup
                      ? 'Merci d\'avoir rejoint SubHub ! Utilisez le code de validation ci-dessous ou cliquez directement sur le bouton pour activer votre Espace Client.'
                      : 'Voici votre code de sécurité à usage unique pour accéder à votre Espace Client SubHub.'
                  }
                </p>

                <!-- Code OTP à 6 chiffres -->
                <div style="background-color:#020617;border:1px solid #312e81;border-radius:16px;padding:20px;margin-bottom:24px;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#818cf8;font-weight:700;margin-bottom:8px;">
                    Votre code à 6 chiffres
                  </div>
                  <div style="font-family:monospace;font-size:34px;font-weight:900;letter-spacing:10px;color:#ffffff;">
                    ${code}
                  </div>
                </div>

                <!-- Bouton Lien Magique de Validation -->
                <div style="margin-bottom:24px;">
                  <a href="${magicLinkUrl}" style="display:inline-block;background:linear-gradient(90deg,#4f46e5,#7c3aed);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;">
                    ${isSignup ? '✅ Valider mon inscription en 1 clic' : '🔓 Me connecter en 1 clic'}
                  </a>
                </div>

                <p style="margin:0 0 16px 0;font-size:12px;color:#64748b;">
                  Ce code et ce lien de validation sont valables pendant <strong>15 minutes</strong>.
                </p>

                <hr style="border:none;border-top:1px solid #1e293b;margin:20px 0;" />

                <p style="margin:0;font-size:11px;color:#475569;line-height:1.5;">
                  Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
                  <a href="${magicLinkUrl}" style="color:#6366f1;word-break:break-all;">${magicLinkUrl}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // 1. Priorité 1 : Gmail SMTP / Nodemailer
  if (config.gmailUser && config.gmailAppPassword) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmailUser,
          pass: config.gmailAppPassword
        }
      });

      await transporter.sendMail({
        from: `"${config.senderName}" <${config.gmailUser}>`,
        to,
        subject,
        html
      });

      return { sent: true, provider: 'gmail' };
    } catch (err: any) {
      console.error('Erreur envoi SMTP Gmail:', err);
      return { sent: false, error: err?.message || 'Erreur SMTP Gmail' };
    }
  }

  // 2. Priorité 2 : Resend API
  if (config.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${config.senderName} <onboarding@resend.dev>`,
          to: [to],
          subject,
          html
        })
      });

      if (res.ok) {
        return { sent: true, provider: 'resend' };
      } else {
        const errData = await res.json().catch(() => ({}));
        return { sent: false, error: errData?.message || 'Erreur API Resend' };
      }
    } catch (err: any) {
      return { sent: false, error: err?.message || 'Erreur réseau Resend' };
    }
  }

  return { sent: false, error: 'Aucun serveur e-mail (GMAIL_USER / GMAIL_APP_PASSWORD) configuré' };
}
