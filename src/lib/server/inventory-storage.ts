import fs from 'fs';
import path from 'path';
import { SharedInventoryAccount, AccountProfileSlot } from '@/lib/types';

const IS_VERCEL = process.env.VERCEL === '1';
const BUNDLED_DATA_DIR = path.resolve(process.cwd(), 'data');
const BUNDLED_INVENTORY_FILE = path.join(BUNDLED_DATA_DIR, 'inventory.json');
const DATA_DIR = IS_VERCEL ? path.join('/tmp', 'data') : BUNDLED_DATA_DIR;
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');

const INITIAL_SERVER_INVENTORY: SharedInventoryAccount[] = [
  {
    id: 'acc-netflix-kojs',
    productId: 'prod-netflix-4k',
    serviceName: 'Netflix Premium Ultra HD (4K)',
    masterEmail: 'kojs1xbet@gmail.com',
    masterPassword: 'SubHub#Netflix2026!',
    notes: 'Compte officiel configuré avec profils verrouillés par PIN personnel.',
    updatedAt: new Date().toISOString(),
    slots: [
      {
        id: 'slot-lordflix',
        profileName: 'LORD FLIX',
        pinCode: '1602',
        isReservedAdmin: true,
        status: 'assigned',
        assignedToEmail: 'admin@subhub.local (Propriétaire / Admin)',
        avatarStyle: 'lordflix'
      },
      {
        id: 'slot-dub',
        profileName: 'DUB',
        pinCode: '0297',
        isReservedAdmin: false,
        status: 'available',
        avatarStyle: 'dub'
      },
      {
        id: 'slot-pro5',
        profileName: 'PRO 5',
        pinCode: '0213',
        isReservedAdmin: false,
        status: 'available',
        avatarStyle: 'pro5'
      },
      {
        id: 'slot-modtsar',
        profileName: 'MOD TSAR 0309',
        pinCode: '1407',
        isReservedAdmin: false,
        status: 'available',
        avatarStyle: 'squid'
      },
      {
        id: 'slot-gaston',
        profileName: 'GASTON SEP 01',
        pinCode: '9870',
        isReservedAdmin: false,
        status: 'available',
        avatarStyle: 'gaston'
      }
    ]
  },
  {
    id: 'acc-capcut-pro-ahmed',
    productId: 'prod-capcut-pro',
    serviceName: 'CapCut Pro 2026 (Licence 6 Mois)',
    masterEmail: 'ahmedwaheedmagdy206@gmail.com',
    masterPassword: 'Aa01141954698',
    notes: 'Compte officiel CapCut Pro 6 mois (180j) avec export 4K 60fps et suite IA débloquée.',
    updatedAt: new Date().toISOString(),
    slots: [
      {
        id: 'slot-capcut-1',
        profileName: 'Licence CapCut Pro Dédiée (6 Mois)',
        pinCode: '',
        isReservedAdmin: false,
        status: 'available',
        avatarStyle: 'custom'
      }
    ]
  }
];

export class ServerInventoryStorage {
  private static ensureDataFile(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(INVENTORY_FILE)) {
        if (IS_VERCEL && fs.existsSync(BUNDLED_INVENTORY_FILE)) {
          const content = fs.readFileSync(BUNDLED_INVENTORY_FILE, 'utf8');
          fs.writeFileSync(INVENTORY_FILE, content, 'utf8');
        } else {
          fs.writeFileSync(INVENTORY_FILE, JSON.stringify(INITIAL_SERVER_INVENTORY, null, 2), 'utf8');
        }
      }
    } catch (e) {
      console.error('Erreur initialisation dossier data:', e);
    }
  }

  /**
   * Récupère l'inventaire complet (Réservé à l'Admin avec Authentification)
   */
  static getFullInventory(): SharedInventoryAccount[] {
    this.ensureDataFile();
    try {
      if (fs.existsSync(INVENTORY_FILE)) {
        const raw = fs.readFileSync(INVENTORY_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Erreur lecture inventory.json:', e);
    }
    return INITIAL_SERVER_INVENTORY;
  }

  /**
   * Sauvegarde l'inventaire
   */
  static saveInventory(inventory: SharedInventoryAccount[]): void {
    this.ensureDataFile();
    try {
      fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf8');
    } catch (e) {
      console.error('Erreur écriture inventory.json:', e);
    }
  }

  /**
   * Met à jour le code PIN d'un slot (Admin uniquement)
   */
  static updateSlotPin(slotId: string, newPin: string): boolean {
    const list = this.getFullInventory();
    let found = false;

    for (let acc of list) {
      const slot = acc.slots.find((s) => s.id === slotId);
      if (slot) {
        slot.pinCode = newPin.trim();
        acc.updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (found) {
      this.saveInventory(list);
    }
    return found;
  }

  /**
   * Alloue en toute sécurité un profil au client qui vient d'acheter.
   * STRICTEMENT isolé : Le client ne reçoit QUE son profil et son code PIN personnel.
   * Il ne reçoit AUCUN mot de passe général et n'a JAMAIS accès au profil admin LORD FLIX.
   */
  static allocateNextSlot(
    productId: string,
    clientEmail: string
  ): {
    email: string;
    profileName: string;
    pinCode: string;
    slotId: string;
  } | null {
    const list = this.getFullInventory();

    for (let acc of list) {
      if (acc.productId === productId) {
        // Recherche du premier profil disponible non réservé à l'administrateur
        const slot = acc.slots.find((s) => !s.isReservedAdmin && s.status === 'available');
        if (slot) {
          slot.status = 'assigned';
          slot.assignedToEmail = clientEmail;
          slot.assignedAt = new Date().toISOString();
          acc.updatedAt = new Date().toISOString();

          this.saveInventory(list);

          return {
            email: acc.masterEmail,
            profileName: slot.profileName,
            pinCode: slot.pinCode,
            slotId: slot.id
          };
        }
      }
    }

    return null;
  }

  /**
   * Libère un profil pour le remettre en stock
   */
  static releaseSlot(slotId: string): boolean {
    const list = this.getFullInventory();
    let found = false;

    for (let acc of list) {
      const slot = acc.slots.find((s) => s.id === slotId);
      if (slot && !slot.isReservedAdmin) {
        slot.status = 'available';
        slot.assignedToEmail = undefined;
        slot.assignedAt = undefined;
        acc.updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (found) {
      this.saveInventory(list);
    }
    return found;
  }

  /**
   * Assigne manuellement un profil à un client spécifique (par l'Admin)
   */
  static assignSlot(slotId: string, clientEmail: string): boolean {
    const list = this.getFullInventory();
    let found = false;

    for (let acc of list) {
      const slot = acc.slots.find((s) => s.id === slotId);
      if (slot && !slot.isReservedAdmin) {
        slot.status = 'assigned';
        slot.assignedToEmail = clientEmail.trim();
        slot.assignedAt = new Date().toISOString();
        acc.updatedAt = new Date().toISOString();
        found = true;
        break;
      }
    }

    if (found) {
      this.saveInventory(list);
    }
    return found;
  }

  /**
   * Renvoie le nombre de profils disponibles (public, sans révéler d'identifiants)
   */
  static getAvailableSlotsCount(productId: string): number {
    const list = this.getFullInventory();
    const matching = list.filter((acc) => acc.productId === productId);
    let count = 0;
    matching.forEach((acc) => {
      acc.slots.forEach((s) => {
        if (!s.isReservedAdmin && s.status === 'available') {
          count++;
        }
      });
    });
    return count;
  }
}

