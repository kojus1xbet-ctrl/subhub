import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/server/admin-auth';
import { ServerInventoryStorage } from '@/lib/server/inventory-storage';

export async function GET(req: NextRequest) {
  if (!AdminAuth.verifyRequest(req)) {
    return NextResponse.json({ error: 'Accès refusé : Authentification administrateur requise' }, { status: 401 });
  }

  const inventory = ServerInventoryStorage.getFullInventory();
  return NextResponse.json({ success: true, inventory });
}

export async function POST(req: NextRequest) {
  if (!AdminAuth.verifyRequest(req)) {
    return NextResponse.json({ error: 'Accès refusé : Authentification administrateur requise' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, slotId, newPin, inventory } = body;

    if (action === 'update_pin') {
      if (!slotId || !newPin) {
        return NextResponse.json({ error: 'slotId et newPin requis' }, { status: 400 });
      }
      const updated = ServerInventoryStorage.updateSlotPin(slotId, newPin);
      return NextResponse.json({ success: updated });
    }

    if (action === 'release_slot') {
      if (!slotId) {
        return NextResponse.json({ error: 'slotId requis' }, { status: 400 });
      }
      const released = ServerInventoryStorage.releaseSlot(slotId);
      return NextResponse.json({ success: released });
    }

    if (action === 'assign_slot') {
      const { clientEmail } = body;
      if (!slotId || !clientEmail) {
        return NextResponse.json({ error: 'slotId et clientEmail requis' }, { status: 400 });
      }
      const assigned = ServerInventoryStorage.assignSlot(slotId, clientEmail);
      return NextResponse.json({ success: assigned });
    }

    if (action === 'save_inventory') {
      if (!Array.isArray(inventory)) {
        return NextResponse.json({ error: 'Inventaire invalide' }, { status: 400 });
      }
      ServerInventoryStorage.saveInventory(inventory);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Erreur serveur' }, { status: 500 });
  }
}
