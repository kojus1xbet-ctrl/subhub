import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '@/lib/otp-service';
import { TelegramService } from '@/lib/telegram/telegram-service';
import { AdminAuth } from '@/lib/server/admin-auth';

// Limiteur de requêtes simple pour éviter le spam de notifications
const clientRequestTimes = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, subscriptionId, productName, masterEmail, profileName, clientEmail, requestId, code, reason } = body;

    // 1. Actions d'administration STRICTEMENT protégées
    if (action === 'deliver' || action === 'preload' || action === 'reject') {
      if (!AdminAuth.verifyRequest(req)) {
        return NextResponse.json({ error: 'Accès refusé : Action réservée à l\'administrateur' }, { status: 401 });
      }

      // Pré-enregistrement d'un code avant la demande client
      if (action === 'preload') {
        if (!code) {
          return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
        }
        const preloaded = OtpService.storePreloadedOtp(code, masterEmail);
        return NextResponse.json({ success: true, preloaded });
      }

      // Transmission d'un code au client
      if (action === 'deliver') {
        if (!code) {
          return NextResponse.json({ error: 'Code manquant' }, { status: 400 });
        }
        const delivered = requestId
          ? OtpService.deliverCode(requestId, code)
          : OtpService.deliverLatestPendingCode(code);

        if (delivered) {
          return NextResponse.json({ success: true, request: delivered });
        }
        return NextResponse.json({ error: 'Aucune demande correspondante trouvée' }, { status: 404 });
      }

      // Refus d'un code (tentative suspecte)
      if (action === 'reject') {
        const rejected = requestId
          ? OtpService.rejectRequest(requestId, reason)
          : OtpService.rejectLatestPendingRequest(reason);

        if (rejected) {
          return NextResponse.json({ success: true, request: rejected });
        }
        return NextResponse.json({ error: 'Aucune demande correspondante trouvée' }, { status: 404 });
      }
    }

    // 2. Demande d'un nouveau code de connexion par le client
    if (action === 'request') {
      if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId manquant' }, { status: 400 });
      }

      // Anti-spam : 1 demande toutes les 15 secondes par abonnement
      const lastTime = clientRequestTimes.get(subscriptionId) || 0;
      if (Date.now() - lastTime < 15000) {
        return NextResponse.json(
          { error: 'Veuillez patienter quelques instants avant de relancer une demande de code.' },
          { status: 429 }
        );
      }
      clientRequestTimes.set(subscriptionId, Date.now());

      const newRequest = OtpService.createRequest({
        subscriptionId,
        productName: productName || 'Netflix Premium Ultra HD 4K',
        masterEmail: masterEmail || 'Compte Netflix Officiel',
        profileName: profileName || 'Profil Client',
        clientEmail: clientEmail || 'client@subhub.local'
      });

      // Si le code n'était pas pré-chargé et que la demande est en attente, alerter l'admin sur Telegram
      if (newRequest.status === 'pending') {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

        if (token && chatId) {
          try {
            await TelegramService.sendOtpRequestAlert(
              { botToken: token, adminChatId: chatId },
              {
                productName: newRequest.productName,
                masterEmail: newRequest.masterEmail,
                profileName: newRequest.profileName || 'Profil Dédié',
                clientEmail: newRequest.clientEmail,
                requestId: newRequest.id
              }
            );
          } catch (tgErr) {
            console.warn('Erreur envoi notification Telegram OTP:', tgErr);
          }
        }
      }

      return NextResponse.json({
        success: true,
        request: newRequest
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('Erreur API OTP:', error);
    return NextResponse.json({ error: error?.message || 'Erreur interne' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subscriptionId = searchParams.get('subscriptionId');
    const all = searchParams.get('all');
    const checkPreload = searchParams.get('checkPreload');

    // 1. Consultation globale de toutes les requêtes : ADMIN SEULEMENT
    if (all === 'true' || checkPreload === 'true') {
      if (!AdminAuth.verifyRequest(req)) {
        return NextResponse.json({ error: 'Accès refusé : Consultation globale réservée à l\'administrateur' }, { status: 401 });
      }

      if (all === 'true') {
        const requests = OtpService.getAllRecentRequests();
        const preloaded = OtpService.getPreloadedOtp();
        return NextResponse.json({ requests, preloaded });
      }

      if (checkPreload === 'true') {
        const masterEmail = searchParams.get('masterEmail') || undefined;
        const preloaded = OtpService.getPreloadedOtp(masterEmail);
        return NextResponse.json({ preloaded });
      }
    }

    // 2. Consultation isolée par le client pour SON abonnement uniquement
    if (subscriptionId) {
      const reqData = OtpService.getLatestRequest(subscriptionId);
      // On ne renvoie le code que s'il est délivré ou si un code a été associé
      return NextResponse.json({ request: reqData });
    }

    return NextResponse.json({ error: 'Paramètre subscriptionId requis' }, { status: 400 });
  } catch (error: any) {
    console.error('Erreur GET API OTP:', error);
    return NextResponse.json({ error: error?.message || 'Erreur interne' }, { status: 500 });
  }
}
