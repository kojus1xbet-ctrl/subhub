import { TelegramService } from './telegram/telegram-service';

export interface OtpRequest {
  id: string;
  subscriptionId: string;
  productName: string;
  masterEmail: string;
  profileName?: string;
  clientEmail: string;
  requestType: 'login_connection';
  status: 'pending' | 'delivered' | 'expired' | 'rejected';
  code?: string;
  rejectionReason?: string;
  requestedAt: string;
  deliveredAt?: string;
  expiresAt: string;
}

export interface PreLoadedOtp {
  code: string;
  masterEmail: string;
  createdAt: string;
  expiresAt: string;
}

// Stockage persistant en mémoire Node.js globale (partagé entre toutes les routes API)
declare global {
  var _subhub_otp_requests: OtpRequest[] | undefined;
  var _subhub_preloaded_otp: PreLoadedOtp | undefined;
}

if (!globalThis._subhub_otp_requests) {
  globalThis._subhub_otp_requests = [];
}

export class OtpService {
  private static getRequests(): OtpRequest[] {
    return globalThis._subhub_otp_requests || [];
  }

  private static setRequests(reqs: OtpRequest[]) {
    globalThis._subhub_otp_requests = reqs;
  }

  /**
   * Enregistre un code en avance (reçu par email avant que le client ne clique)
   */
  static storePreloadedOtp(code: string, masterEmail = 'kojs1xbet@gmail.com'): PreLoadedOtp {
    const pre: PreLoadedOtp = {
      code: code.trim(),
      masterEmail,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
    };
    globalThis._subhub_preloaded_otp = pre;
    return pre;
  }

  /**
   * Récupère le code pré-chargé s'il est encore valide
   */
  static getPreloadedOtp(masterEmail?: string): PreLoadedOtp | null {
    const pre = globalThis._subhub_preloaded_otp;
    if (!pre) return null;
    if (new Date(pre.expiresAt).getTime() < Date.now()) {
      globalThis._subhub_preloaded_otp = undefined;
      return null;
    }
    if (masterEmail && pre.masterEmail && pre.masterEmail.toLowerCase() !== masterEmail.toLowerCase()) {
      return null;
    }
    return pre;
  }

  static clearPreloadedOtp() {
    globalThis._subhub_preloaded_otp = undefined;
  }

  /**
   * Crée une nouvelle demande de code de connexion et alerte l'admin
   * (Si un code a déjà été pré-fourni par l'admin, il est injecté immédiatement !)
   */
  static createRequest(data: {
    subscriptionId: string;
    productName: string;
    masterEmail: string;
    profileName?: string;
    clientEmail?: string;
  }): OtpRequest {
    const requests = this.getRequests();

    // Expire les requêtes trop anciennes (> 15 minutes)
    const now = Date.now();
    const cleanList = requests.filter(
      (r) => new Date(r.expiresAt).getTime() > now
    );

    // Vérifier si un code a été pré-enregistré par l'admin avant la demande
    const preloaded = this.getPreloadedOtp(data.masterEmail);

    const newRequest: OtpRequest = {
      id: `otp-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      subscriptionId: data.subscriptionId,
      productName: data.productName,
      masterEmail: data.masterEmail,
      profileName: data.profileName || 'Profil Dédié',
      clientEmail: data.clientEmail || 'client@subhub.local',
      requestType: 'login_connection',
      status: preloaded ? 'delivered' : 'pending',
      code: preloaded ? preloaded.code : undefined,
      deliveredAt: preloaded ? new Date().toISOString() : undefined,
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
    };

    if (preloaded) {
      this.clearPreloadedOtp();
    }

    cleanList.unshift(newRequest);
    this.setRequests(cleanList);
    return newRequest;
  }

  /**
   * Récupère la dernière demande active pour un abonnement donné
   */
  static getLatestRequest(subscriptionId: string): OtpRequest | null {
    const requests = this.getRequests();
    const found = requests.find((r) => r.subscriptionId === subscriptionId);
    if (!found) return null;

    // Vérifier l'expiration
    if (new Date(found.expiresAt).getTime() < Date.now()) {
      found.status = 'expired';
    }
    return found;
  }

  /**
   * Récupère la dernière demande en attente (globale)
   */
  static getPendingRequest(): OtpRequest | null {
    const requests = this.getRequests();
    const found = requests.find(
      (r) => r.status === 'pending' && new Date(r.expiresAt).getTime() > Date.now()
    );
    return found || null;
  }

  /**
   * Récupère toutes les demandes récentes (pour l'admin)
   */
  static getAllRecentRequests(): OtpRequest[] {
    return this.getRequests().slice(0, 15);
  }

  /**
   * L'admin ou le Bot Telegram fournit le code pour une requête
   */
  static deliverCode(requestId: string, code: string): OtpRequest | null {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.code = code.trim();
      req.status = 'delivered';
      req.deliveredAt = new Date().toISOString();
      this.setRequests([...requests]);
      return req;
    }
    return null;
  }

  /**
   * L'admin fournit le code pour la dernière demande en attente (via message Telegram direct)
   * Si aucun client n'attend encore, le code est pré-enregistré pour le prochain client !
   */
  static deliverLatestPendingCode(code: string, masterEmail = 'kojs1xbet@gmail.com'): any {
    const pending = this.getPendingRequest();
    if (pending) {
      return this.deliverCode(pending.id, code);
    }

    // Aucun client en attente : on pré-enregistre le code en avance !
    const pre = this.storePreloadedOtp(code, masterEmail);
    return {
      id: 'preloaded',
      isPreloaded: true,
      status: 'delivered',
      code: pre.code,
      masterEmail: pre.masterEmail,
      clientEmail: 'Prochain client qui se connecte',
      profileName: 'Auto-remplissage',
      productName: 'Netflix Premium Ultra HD 4K',
      deliveredAt: pre.createdAt
    };
  }

  /**
   * L'admin refuse la demande de code (tentative suspecte, réinitialisation de mot de passe, etc.)
   */
  static rejectRequest(requestId: string, reason?: string): OtpRequest | null {
    const requests = this.getRequests();
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      req.status = 'rejected';
      req.rejectionReason = reason || 'Demande refusée par l\'administrateur : Seules les connexions simples sont autorisées. Toute modification de mot de passe ou d\'email est strictement interdite.';
      this.setRequests([...requests]);
      return req;
    }
    return null;
  }

  /**
   * L'admin refuse la dernière demande en attente (via commande Telegram /refuser)
   */
  static rejectLatestPendingRequest(reason?: string): OtpRequest | null {
    const pending = this.getPendingRequest();
    if (pending) {
      return this.rejectRequest(pending.id, reason);
    }
    return null;
  }
}
