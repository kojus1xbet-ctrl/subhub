export type AccountType = 
  | 'private_account'       // Compte dédié/privé (Email + Pass exclusifs)
  | 'shared_account'        // Compte partagé (Profil spécifique, mdp fixe)
  | 'personal_activation'   // Activé directement sur l'email personnel du client
  | 'license_key';          // Clé d'activation officielle

export type DeliveryType = 
  | 'instant_auto'          // Délivrance automatique instantanée depuis le stock
  | 'manual_admin';         // Nécessite une confirmation manuelle / bot

export type ProductCategory = 
  | 'ia' 
  | 'streaming' 
  | 'productivity' 
  | 'gaming' 
  | 'software';

export interface ProductRule {
  canChangePassword: boolean;
  requiresVpn: boolean;
  vpnRegion?: string;
  maxDevices: number;
  instructions: string[];
  restrictions: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  badge?: string;
  shortDescription: string;
  description: string;
  officialPrice: number;     // Prix officiel éditeur (ex: 200€)
  buyPrice: number;          // Prix d'achat fournisseur sur Plati/G2A (ex: 4€)
  sellPrice: number;         // Votre prix de vente (ex: 14.99€)
  sourcePlatform?: string;   // 'Plati.market', 'G2A', 'Z2U', etc.
  sourceUrl?: string;
  accountType: AccountType;
  deliveryType: DeliveryType;
  duration: string;          // "1 mois", "3 mois", "1 an", "À vie"
  durationDays: number;      // 30, 90, 365
  warrantyDays: number;      // ex: 30 jours de garantie
  rules: ProductRule;
  features: string[];
  stockCount: number;
  rating: number;
  salesCount: number;
  imageUrl?: string;
  logoUrl?: string;          // URL directe du logo officiel extrait du site
  officialDomain?: string;   // Domaine officiel (ex: openai.com, claude.ai)
  iconName: string;          // 'Bot', 'Sparkles', 'Tv', 'Gamepad2', 'Code', etc.
  isPopular?: boolean;
  paymentLinkChariow?: string; // Lien de paiement direct Chariow (Mobile Money / CB)
}

export interface UserSubscription {
  id: string;
  productId: string;
  productName: string;
  iconName: string;
  logoUrl?: string;
  officialDomain?: string;
  category: ProductCategory;
  accountType: AccountType;
  durationLabel: string;
  startDate: string;         // ISO date
  expiryDate: string;        // ISO date
  warrantyUntil: string;     // ISO date
  status: 'active' | 'expiring_soon' | 'expired' | 'claim_in_progress';
  credentials: {
    email?: string;
    password?: string;
    licenseKey?: string;
    inviteLink?: string;
    profileAssigned?: string;
    pinCode?: string;
    slotId?: string;
    additionalNotes?: string;
  };
  rules: ProductRule;
}

export interface WarrantyClaim {
  id: string;
  subscriptionId: string;
  productName: string;
  issueType: 'invalid_credentials' | 'account_downgraded' | 'account_banned' | 'other';
  description: string;
  status: 'pending' | 'auto_replaced' | 'refunded' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'purchase' | 'refund' | 'bonus';
  amount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending';
}

export interface AIParseResult {
  title: string;
  badge?: string;
  category: ProductCategory;
  officialPriceEUR?: number;
  originalPriceEUR: number;
  suggestedSellPriceEUR: number;
  estimatedMarginPercent: number;
  accountType: AccountType;
  deliveryType: DeliveryType;
  durationDays: number;
  warrantyDays: number;
  features: string[];
  rules: ProductRule;
  sellerRating?: string;
  detectedSource: string;
  aiSummary: string;
  description?: string;
  riskNotice?: string;
  imageUrl?: string;
  officialDomain?: string;   // Domaine officiel du service extrait par l'IA
  logoUrl?: string;          // Logo officiel extrait du site officiel
}

export interface SupplierOffer {
  platform: string; // 'Plati.market' | 'Z2U' | 'G2A' | 'G2G' | 'Kinguin'
  sellerName: string;
  sellerRating: string;
  salesCount: number;
  buyPriceEUR: number;
  suggestedSellPriceEUR: number;
  marginPercent: number;
  accountType: AccountType;
  deliveryType: DeliveryType;
  durationDays: number;
  warrantyDays: number;
  title: string;
  badge?: string;
  category: ProductCategory;
  purchaseUrl: string; // Lien direct d'achat ou recherche réelle sur la plateforme fournisseur
  isBestValue?: boolean;
  isLowestPrice?: boolean;
  isHighestTrust?: boolean;
  notes: string;
  features: string[];
  rules: ProductRule;
  officialDomain?: string;
  logoUrl?: string;
  description?: string;
  aiSummary: string;
}

export interface MultiSourceSearchResponse {
  query: string;
  summary: string;
  bestPickIndex: number;
  offers: SupplierOffer[];
}

export interface AccountProfileSlot {
  id: string;
  profileName: string;
  pinCode: string;
  isReservedAdmin: boolean; // Si true, réservé exclusivement à l'administrateur (ex: LORD FLIX)
  status: 'available' | 'assigned';
  assignedToEmail?: string;
  assignedAt?: string;
  avatarStyle?: 'lordflix' | 'dub' | 'gaston' | 'squid' | 'pro5' | 'custom';
}

export interface SharedInventoryAccount {
  id: string;
  productId: string;        // 'prod-netflix-4k'
  serviceName: string;      // 'Netflix Premium Ultra HD (4K)'
  masterEmail: string;      // 'kojs1xbet@gmail.com'
  masterPassword: string;   // Mot de passe principal du compte
  slots: AccountProfileSlot[];
  notes?: string;
  updatedAt: string;
}
