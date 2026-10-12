import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/telegram-service';

export async function POST(req: NextRequest) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '8695660203:AAFdvl15xRn5XH9u9WhcP_Ibgq4Zl8g3eEA';
    if (!botToken) {
      return NextResponse.json({ ok: true, notice: 'Bot token not configured' });
    }

    const update = await req.json();
    await TelegramService.handleIncomingUpdate(botToken, update);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erreur Telegram Webhook:', error);
    return NextResponse.json({ ok: true }); // Telegram exige 200 OK pour ne pas renvoyer en boucle
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'SubHub Telegram Webhook',
    timestamp: new Date().toISOString()
  });
}
