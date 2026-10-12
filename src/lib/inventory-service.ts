import { AccountProfileSlot, SharedInventoryAccount, Product } from './types';
import { INITIAL_SHARED_INVENTORY, INITIAL_PRODUCTS } from './store';

const INVENTORY_STORAGE_KEY = 'subhub_shared_inventory';
const PRODUCTS_STORAGE_KEY = 'subhub_products';

export class InventoryService {
  /**
   * Récupère tous les comptes partagés et leurs profils
   */
  static getSharedInventory(): SharedInventoryAccount[] {
    if (typeof window === 'undefined') return INITIAL_SHARED_INVENTORY;
    try {
      const saved = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erreur lecture inventaire partagé:', e);
    }
    return INITIAL_SHARED_INVENTORY;
  }

  /**
   * Sauvegarde la liste des comptes partagés et met à jour le stock du catalogue
   */
  static saveSharedInventory(inventory: SharedInventoryAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
      // Synchronisation automatique du stock avec le catalogue des produits
      this.syncAllProductsStock(inventory);
    } catch (e) {
      console.warn('Erreur sauvegarde inventaire partagé:', e);
    }
  }

  /**
   * Compte les profils disponibles à la vente pour un produit donné
   */
  static getAvailableSlotsCount(productId: string, inventory?: SharedInventoryAccount[]): number {
    const list = inventory || this.getSharedInventory();
    const matchingAccounts = list.filter((acc) => acc.productId === productId);
    let count = 0;
    matchingAccounts.forEach((acc) => {
      acc.slots.forEach((s) => {
        if (!s.isReservedAdmin && s.status === 'available') {
          count++;
        }
      });
    });
    return count;
  }

  /**
   * Synchronise le stockCount dans subhub_products pour refléter le nombre réel de profils disponibles
   */
  static syncAllProductsStock(inventory: SharedInventoryAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      const savedProds = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      const products: Product[] = savedProds ? JSON.parse(savedProds) : INITIAL_PRODUCTS;

      let changed = false;
      const updatedProducts = products.map((prod) => {
        if (prod.accountType === 'shared_account') {
          const avail = this.getAvailableSlotsCount(prod.id, inventory);
          if (prod.stockCount !== avail) {
            changed = true;
            return { ...prod, stockCount: avail };
          }
        }
        return prod;
      });

      if (changed) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
      }
    } catch (e) {
      console.warn('Erreur synchronisation du stock produit:', e);
    }
  }

  /**
   * Assigne automatiquement le prochain profil disponible à un client
   * Le profil "LORD FLIX" (ou tout profil isReservedAdmin) est STRICTEMENT protégé et JAMAIS délivré.
   */
  static allocateProfileSlot(
    productId: string,
    clientEmail: string
  ): {
    account: SharedInventoryAccount;
    slot: AccountProfileSlot;
  } | null {
    const inventory = this.getSharedInventory();

    for (let acc of inventory) {
      if (acc.productId === productId) {
        // Recherche du premier profil disponible non réservé à l'admin
        const slot = acc.slots.find((s) => !s.isReservedAdmin && s.status === 'available');
        if (slot) {
          slot.status = 'assigned';
          slot.assignedToEmail = clientEmail;
          slot.assignedAt = new Date().toISOString();
          acc.updatedAt = new Date().toISOString();

          this.saveSharedInventory(inventory);
          return { account: acc, slot };
        }
      }
    }

    return null;
  }

  /**
   * Libère un profil pour le remettre en vente disponible
   */
  static releaseProfileSlot(accountId: string, slotId: string): SharedInventoryAccount[] {
    const inventory = this.getSharedInventory();
    const acc = inventory.find((a) => a.id === accountId);
    if (acc) {
      const slot = acc.slots.find((s) => s.id === slotId);
      if (slot) {
        slot.status = 'available';
        slot.assignedToEmail = undefined;
        slot.assignedAt = undefined;
        acc.updatedAt = new Date().toISOString();
        this.saveSharedInventory(inventory);
      }
    }
    return inventory;
  }

  /**
   * Met à jour le mot de passe master d'un compte partagé
   */
  static updateMasterPassword(accountId: string, newPassword: string): SharedInventoryAccount[] {
    const inventory = this.getSharedInventory();
    const acc = inventory.find((a) => a.id === accountId);
    if (acc) {
      acc.masterPassword = newPassword;
      acc.updatedAt = new Date().toISOString();
      this.saveSharedInventory(inventory);
    }
    return inventory;
  }

  /**
   * Met à jour l'email master d'un compte partagé
   */
  static updateMasterEmail(accountId: string, newEmail: string): SharedInventoryAccount[] {
    const inventory = this.getSharedInventory();
    const acc = inventory.find((a) => a.id === accountId);
    if (acc) {
      acc.masterEmail = newEmail;
      acc.updatedAt = new Date().toISOString();
      this.saveSharedInventory(inventory);
    }
    return inventory;
  }

  /**
   * Met à jour le code PIN d'un profil individuel
   */
  static updateSlotPin(accountId: string, slotId: string, newPin: string): SharedInventoryAccount[] {
    const inventory = this.getSharedInventory();
    const acc = inventory.find((a) => a.id === accountId);
    if (acc) {
      const slot = acc.slots.find((s) => s.id === slotId);
      if (slot) {
        slot.pinCode = newPin.trim();
        acc.updatedAt = new Date().toISOString();
        this.saveSharedInventory(inventory);
      }
    }
    return inventory;
  }

  /**
   * Ajoute un nouveau profil à un compte
   */
  static addProfileSlot(
    accountId: string,
    profileName: string,
    pinCode: string,
    isReservedAdmin: boolean = false,
    avatarStyle: 'lordflix' | 'dub' | 'gaston' | 'squid' | 'pro5' | 'custom' = 'custom'
  ): SharedInventoryAccount[] {
    const inventory = this.getSharedInventory();
    const acc = inventory.find((a) => a.id === accountId);
    if (acc) {
      acc.slots.push({
        id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        profileName: profileName.trim(),
        pinCode: pinCode.trim(),
        isReservedAdmin,
        status: isReservedAdmin ? 'assigned' : 'available',
        assignedToEmail: isReservedAdmin ? 'admin@subhub.local' : undefined,
        avatarStyle
      });
      acc.updatedAt = new Date().toISOString();
      this.saveSharedInventory(inventory);
    }
    return inventory;
  }
}
