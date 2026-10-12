import { NextRequest, NextResponse } from 'next/server';
import { TelegramService, SaleAlertData, StockAlertData } from '@/lib/telegram/telegram-service';
import { AdminAuth } from '@/lib/server/admin-auth';

export async function POST(req: NextRequest) {
  // STRICTEMENT PROTÉGÉ : Seul l'administrateur authentifié peut interagir avec le bot
  if (!AdminAuth.verifyRequest(req)) {
    return NextResponse.json({ error: 'Accès refusé : Authentification administrateur requise' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, saleData, stockData } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (!botToken || !adminChatId) {
      return NextResponse.json({ error: 'Variables Telegram non configurées sur le serveur' }, { status: 500 });
    }

    // 1. Récupération du statut du bot (sans fuite de token)
    if (action === 'get_status') {
      const res = await TelegramService.getMe(botToken);
      if (res.ok && res.bot) {
        return NextResponse.json({
          success: true,
          connected: true,
          bot: {
            id: res.bot.id,
            first_name: res.bot.first_name,
            username: res.bot.username
          },
          maskedToken: `${botToken.substring(0, 10)}...${botToken.substring(botToken.length - 4)}`,
          chatId: adminChatId
        });
      }
      return NextResponse.json({ success: false, connected: false, error: res.error });
    }

    // 2. Envoi d'un message de test
    if (action === 'send_test') {
      const res = await TelegramService.sendTestNotification(botToken, adminChatId);
      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Message de test envoyé sur votre smartphone !' });
      }
      return NextResponse.json({ error: res.error || 'Erreur lors de l\'envoi' }, { status: 400 });
    }

    // 3. Alerte Vente
    if (action === 'send_sale_alert') {
      const sale: SaleAlertData = saleData || {
        productName: 'Abonnement Test Sécurisé',
        clientEmail: 'client@subhub.local',
        sellPriceEUR: 29.90,
        buyPriceEUR: 9.70,
        netProfitEUR: 20.20,
        marginPercent: 208,
        sourcePlatform: 'Plati.market',
        sourceUrl: '',
        duration: '1 mois',
        remainingStock: 5
      };

      const res = await TelegramService.sendSaleAlert({ botToken, adminChatId }, sale);
      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Alerte de vente transmise avec succès !' });
      }
      return NextResponse.json({ error: res.error || 'Erreur lors de l\'envoi' }, { status: 400 });
    }

    // 4. Alerte Stock Critique
    if (action === 'send_stock_alert') {
      const stock: StockAlertData = stockData || {
        productName: 'Netflix Premium Ultra HD (4K)',
        currentStock: 1,
        threshold: 2,
        sourcePlatform: 'Stock Interne',
        sourceUrl: ''
      };

      const res = await TelegramService.sendLowStockAlert({ botToken, adminChatId }, stock);
      if (res.ok) {
        return NextResponse.json({ success: true, message: 'Alerte de stock critique envoyée !' });
      }
      return NextResponse.json({ error: res.error || 'Erreur lors de l\'envoi' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('Erreur API Telegram:', error);
    return NextResponse.json({ error: error?.message || 'Erreur interne' }, { status: 500 });
  }
}
