import { NextRequest, NextResponse } from 'next/server';
import { GeminiService } from '@/lib/ai/gemini-service';
import { INITIAL_PRODUCTS } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { message, history, customApiKey, customCatalog } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Un message utilisateur est requis' },
        { status: 400 }
      );
    }

    const catalog = customCatalog || INITIAL_PRODUCTS;
    const cleanHistory = Array.isArray(history) ? history : [];

    const reply = await GeminiService.askClientConcierge(
      message,
      cleanHistory,
      catalog,
      customApiKey
    );

    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Erreur API concierge:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la réponse de l\'assistant' },
      { status: 500 }
    );
  }
}
