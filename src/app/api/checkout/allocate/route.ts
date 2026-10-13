import { NextRequest, NextResponse } from 'next/server';
import { ServerInventoryStorage } from '@/lib/server/inventory-storage';
import { TelegramService } from '@/lib/telegram/telegram-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, clientEmail, productName, sellPrice } = body;

    if (!productId) {
      return NextResponse.json({ error: 'productId manquant' }, { status: 400 });
    }

    const emailForClient = clientEmail || 'client@subhub.local';

    // 1. Cas Compte Partagé (Ex: Netflix 4K)
    if (productId.includes('netflix') || productId === 'prod-netflix-4k') {
      const allocation = ServerInventoryStorage.allocateNextSlot(productId, emailForClient);

      if (!allocation) {
        return NextResponse.json(
          { error: 'Rupture de stock : tous les profils Netflix sont actuellement attribués.' },
          { status: 409 }
        );
      }

      // Alerte Telegram Automatique sur le smartphone de l'administrateur
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (botToken && adminChatId) {
        TelegramService.sendSaleAlert(
          { botToken, adminChatId },
          {
            productName: productName || 'Netflix Premium Ultra HD (4K)',
            clientEmail: emailForClient,
            sellPriceEUR: sellPrice || 6.99,
            buyPriceEUR: 1.50,
            netProfitEUR: (sellPrice || 6.99) - 1.50,
            marginPercent: 366,
            sourcePlatform: 'Stock Interne Sécurisé',
            sourceUrl: '',
            duration: '1 mois',
            remainingStock: ServerInventoryStorage.getAvailableSlotsCount(productId)
          }
        ).catch(() => {});
      }

      // STRICTEMENT ISOLÉ : Le client ne reçoit JAMAIS le mot de passe général
      // ni les PINs des autres profils.
      return NextResponse.json({
        success: true,
        accountType: 'shared_account',
        email: allocation.email,
        password: '', // Zéro mot de passe transmis
        profileAssigned: allocation.profileName,
        pinCode: allocation.pinCode,
        slotId: allocation.slotId,
        instructions: `Sur netflix.com, entrez l'adresse ${allocation.email} et choisissez 'Se connecter avec un code à usage unique'. Demandez le code en direct dans votre espace SubHub, puis accédez exclusivement au profil '${allocation.profileName}' avec le PIN ${allocation.pinCode}.`
      });
    }

    // 2. Cas CapCut Pro 6 Mois (Coordonnées Officielles du Stock Dédié)
    if (productId === 'prod-capcut-pro' || productId.includes('capcut')) {
      const capcutEmail = 'ahmedwaheedmagdy206@gmail.com';
      const capcutPassword = 'Aa01141954698';

      // Alerte Telegram Automatique sur le smartphone de l'administrateur
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (botToken && adminChatId) {
        TelegramService.sendSaleAlert(
          { botToken, adminChatId },
          {
            productName: productName || 'CapCut Pro 2026 | Licence 6 Mois (180j)',
            clientEmail: emailForClient,
            sellPriceEUR: 9.00, // 5 900 FCFA
            buyPriceEUR: 3.50, // 3.85$ (~2 400 FCFA)
            netProfitEUR: 5.50,
            marginPercent: 157,
            sourcePlatform: 'Stock Direct Administrateur',
            sourceUrl: 'https://capcut.com',
            duration: '6 mois',
            remainingStock: 1
          }
        ).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        accountType: 'private_account',
        email: capcutEmail,
        password: capcutPassword,
        instructions: `Connectez-vous sur l'application CapCut (PC, Mac, Mobile Android/iOS) ou sur capcut.com avec l'adresse e-mail ${capcutEmail} et votre mot de passe fourni. Votre licence CapCut Pro 6 mois est active avec export 4K 60fps et tous les outils IA débloqués.`
      });
    }

    // 3. Cas Compte Privé Dédié Générique (Ex: ChatGPT Pro, Claude Pro, etc.)
    const generatedEmail = `user-${Math.floor(1000 + Math.random() * 9000)}@subhub-premium.com`;
    const generatedPassword = `SubPass#${Math.floor(100000 + Math.random() * 900000)}!`;

    // Alerte Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    if (botToken && adminChatId) {
      TelegramService.sendSaleAlert(
        { botToken, adminChatId },
        {
          productName: productName || 'Abonnement Dédié SubHub',
          clientEmail: emailForClient,
          sellPriceEUR: sellPrice || 14.99,
          buyPriceEUR: 4.80,
          netProfitEUR: (sellPrice || 14.99) - 4.80,
          marginPercent: 212,
          sourcePlatform: 'Plati.market',
          sourceUrl: '',
          duration: '1 mois',
          remainingStock: 15
        }
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      accountType: 'private_account',
      email: generatedEmail,
      password: generatedPassword,
      instructions: `Connectez-vous sur le site officiel avec ces identifiants personnels. Vous pouvez modifier le mot de passe dès votre première connexion.`
    });
  } catch (error: any) {
    console.error('Erreur API allocation:', error);
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}
