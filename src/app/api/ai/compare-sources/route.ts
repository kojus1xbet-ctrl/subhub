import { NextRequest, NextResponse } from 'next/server';
import { SupplierComparatorService } from '@/lib/ai/supplier-comparator';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Veuillez préciser un nom de produit ou service à rechercher (ex: ChatGPT Pro, Midjourney, Netflix...)' },
        { status: 400 }
      );
    }

    const comparison = SupplierComparatorService.searchAndCompare(query);

    return NextResponse.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    console.error('Erreur API compare-sources:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la comparaison des fournisseurs' },
      { status: 500 }
    );
  }
}
