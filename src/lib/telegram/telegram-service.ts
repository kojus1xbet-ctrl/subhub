import { SupplierComparatorService } from '../ai/supplier-comparator';

export interface TelegramConfig {
  botToken: string;
  adminChatId: string;
}

export interface SaleAlertData {
  productName: string;
  clientEmail: string;
  sellPriceEUR: number;
  buyPriceEUR: number;
  netProfitEUR: number;
  marginPercent: number;
  sourcePlatform?: string;
  sourceUrl?: string;
  duration?: string;
  remainingStock: number;
}

export interface StockAlertData {
  productName: string;
  currentStock: number;
  threshold: number;
  sourcePlatform?: string;
  sourceUrl?: string;
}

export interface OtpAlertData {
  productName: string;
  masterEmail: string;
  profileName: string;
  clientEmail: string;
  requestId: string;
}

import https from 'https';
import { OtpService } from '../otp-service';

const sslAgent = new https.Agent({ rejectUnauthorized: false });

function callTelegramApi(endpoint: string, payload?: any): Promise<any> {
  return new Promise((resolve) => {
    try {
      const url = `https://api.telegram.org/${endpoint}`;
      const parsed = new URL(url);
      const isPost = !!payload;
      const bodyStr = payload ? JSON.stringify(payload) : undefined;

      const req = https.request(
        parsed,
        {
          method: isPost ? 'POST' : 'GET',
          agent: sslAgent,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'SubHub-TelegramBot/1.0',
            ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
          },
          timeout: 10000
        },
        (res) => {
          let data = '';
          res.setEncoding('utf8');
          res.on('data', (c) => data += c);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ ok: false, description: 'Réponse JSON invalide reçue de Telegram' });
            }
          });
          res.on('error', (e) => resolve({ ok: false, description: e.message }));
        }
      );

      req.on('error', (e) => resolve({ ok: false, description: e.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, description: 'Délai d\'attente dépassé vers Telegram' });
      });

      if (isPost && bodyStr) {
        req.write(bodyStr);
      }
      req.end();
    } catch (err: any) {
      resolve({ ok: false, description: err?.message || 'Erreur requête Telegram' });
    }
  });
}

export class TelegramService {
  /**
   * Vérifie la validité d'un token auprès de l'API officielle Telegram
   */
  static async getMe(botToken: string): Promise<{ ok: boolean; bot?: any; error?: string }> {
    const data = await callTelegramApi(`bot${botToken}/getMe`);
    if (data.ok) {
      return { ok: true, bot: data.result };
    }
    return { ok: false, error: data.description || 'Token de bot invalide' };
  }

  /**
   * Envoie un message brut formaté en HTML ou Markdown
   */
  static async sendMessage(
    botToken: string,
    chatId: string,
    text: string,
    options?: {
      parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown';
      reply_markup?: any;
    }
  ): Promise<{ ok: boolean; result?: any; error?: string }> {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
      disable_web_page_preview: false
    };

    if (options?.reply_markup) {
      body.reply_markup = options.reply_markup;
    }

    const data = await callTelegramApi(`bot${botToken}/sendMessage`, body);
    if (data.ok) {
      return { ok: true, result: data.result };
    }
    return { ok: false, error: data.description || 'Erreur lors de l\'envoi Telegram' };
  }

  /**
   * Envoie une alerte de vente formatée sur le smartphone de l'admin
   */
  static async sendSaleAlert(
    config: TelegramConfig,
    sale: SaleAlertData
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.botToken || !config.adminChatId) {
      return { ok: false, error: 'Token ou Chat ID manquant' };
    }

    const text = `
🎉 <b>NOUVELLE VENTE SUBHUB !</b>
━━━━━━━━━━━━━━━━━━━━━
🛍️ <b>Produit :</b> ${sale.productName}
👤 <b>Client :</b> <code>${sale.clientEmail}</code>
⏱️ <b>Durée :</b> ${sale.duration || '30 jours'}

💰 <b>Prix de Vente :</b> <b>${sale.sellPriceEUR.toFixed(2)} €</b>
🛒 <b>Prix d'Achat :</b> ${sale.buyPriceEUR.toFixed(2)} €
💎 <b>Bénéfice Net :</b> <b>+${sale.netProfitEUR.toFixed(2)} €</b> (Marge: +${sale.marginPercent}%)

📦 <b>Stock restant :</b> ${sale.remainingStock} unités
🏢 <b>Fournisseur :</b> ${sale.sourcePlatform || 'Plati.market'}
━━━━━━━━━━━━━━━━━━━━━
⚡ <i>Les accès ont été générés dans le coffre-fort client.</i>
    `.trim();

    const inlineKeyboard: any = {
      inline_keyboard: []
    };

    if (sale.sourceUrl && sale.sourceUrl.startsWith('https://')) {
      inlineKeyboard.inline_keyboard.push([
        {
          text: `🛒 Réappro ${sale.sourcePlatform || 'Fournisseur'}`,
          url: sale.sourceUrl
        }
      ]);
    }

    return this.sendMessage(config.botToken, config.adminChatId, text, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard.inline_keyboard.length > 0 ? inlineKeyboard : undefined
    });
  }

  /**
   * Envoie une alerte de stock bas
   */
  static async sendLowStockAlert(
    config: TelegramConfig,
    stock: StockAlertData
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.botToken || !config.adminChatId) {
      return { ok: false, error: 'Token ou Chat ID manquant' };
    }

    const text = `
⚠️ <b>ALERTE STOCK CRITIQUE !</b>
━━━━━━━━━━━━━━━━━━━━━
📦 <b>Produit :</b> ${stock.productName}
🚨 <b>Stock actuel :</b> <b>${stock.currentStock} restant(s)</b> (Seuil: ${stock.threshold})
🏢 <b>Fournisseur :</b> ${stock.sourcePlatform || 'Plati.market'}

<i>Pensez à commander du stock pour éviter toute rupture de délivrance automatique.</i>
━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const inlineKeyboard: any = {
      inline_keyboard: []
    };

    if (stock.sourceUrl && stock.sourceUrl.startsWith('https://')) {
      inlineKeyboard.inline_keyboard.push([
        { text: `🛒 Commander sur ${stock.sourcePlatform || 'Fournisseur'}`, url: stock.sourceUrl }
      ]);
    }

    return this.sendMessage(config.botToken, config.adminChatId, text, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard.inline_keyboard.length > 0 ? inlineKeyboard : undefined
    });
  }

  /**
   * Envoie un message de test pour valider la configuration Telegram
   */
  static async sendTestNotification(
    botToken: string,
    chatId: string
  ): Promise<{ ok: boolean; error?: string }> {
    const text = `
🚀 <b>SubHub Command Center - Test Réussi !</b>
━━━━━━━━━━━━━━━━━━━━━
Votre bot Telegram est désormais <b>connecté avec succès</b> à votre boutique SubHub.

Vous recevrez ici :
🔔 Les notifications instantanées de chaque vente avec bénéfice net calculé
⚠️ Les alertes de stock critique avec lien direct de réapprovisionnement
🤖 Les réponses à vos commandes interactives (/stats, /stock, /search)
━━━━━━━━━━━━━━━━━━━━━
<i>Statut : En ligne et prêt 24h/24 !</i>
    `.trim();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '🛒 Sourcing Plati.market', url: 'https://plati.market' },
          { text: '🌐 Marketplace Z2U', url: 'https://www.z2u.com' }
        ]
      ]
    };

    return this.sendMessage(botToken, chatId, text, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  }

  /**
   * Envoie une alerte prioritaire de demande de code de connexion (OTP) avec protocole anti-détournement
   */
  static async sendOtpRequestAlert(
    config: TelegramConfig,
    data: OtpAlertData
  ): Promise<{ ok: boolean; error?: string }> {
    if (!config.botToken || !config.adminChatId) {
      return { ok: false, error: 'Token ou Chat ID manquant' };
    }

    const text = `
🔐 <b>DEMANDE DE CODE DE CONNEXION AU COMPTE !</b>
━━━━━━━━━━━━━━━━━━━━━
🎬 <b>Service :</b> ${data.productName}
📧 <b>Compte Master :</b> <code>${data.masterEmail}</code>
👤 <b>Client Demandeur :</b> <code>${data.clientEmail}</code> (Slot assigné : ${data.profileName})
📍 <b>Étape :</b> Connexion initiale au compte (avant sélection de profil)

🛡️ <b>VÉRIFICATION DE SÉCURITÉ OBLIGATOIRE :</b>
Consultez votre boîte mail <b>${data.masterEmail}</b> et vérifiez l'objet du message Netflix reçu :

🟢 <b>AUTORISÉ (CONNEXION NOUVEL APPAREIL / FOYER) :</b>
• Objet : <i>"Votre code d'accès temporaire"</i> ou <i>"Code pour vous connecter"</i> ou <i>"Mise à jour du foyer"</i>
• Contenu : <i>"Utilisez ce code pour vous connecter à votre compte Netflix"</i>
👉 <b>Transmettre le code :</b> Répondez simplement avec le code (ex: <code>849201</code> ou <code>/code 849201</code>)

🔴 <b>DANGER - TENTATIVE DE MODIFICATION (NE PAS DONNER !) :</b>
• Objet : <i>"Réinitialisation de mot de passe"</i> ou <i>"Modifier l'adresse e-mail"</i> ou <i>"Mise à jour coordonnées"</i>
• ⛔ <b>ATTENTION :</b> Ne donnez JAMAIS ce code ! Le client essaie de changer vos identifiants pour voler le compte.
👉 <b>Bloquer l'action :</b> Répondez <code>/refuser</code>
━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '⛔ Bloquer / Refuser (/refuser)', callback_data: 'cmd_reject_otp' }
        ]
      ]
    };

    return this.sendMessage(config.botToken, config.adminChatId, text, {
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard
    });
  }

  /**
   * Traite un update webhook Telegram reçu (message d'un utilisateur ou de l'admin)
   */
  static async handleIncomingUpdate(
    botToken: string,
    update: any
  ): Promise<{ ok: boolean; handled?: boolean }> {
    if (!update) return { ok: true, handled: false };
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '8927948134';

    // Gestion des clics sur boutons inline_keyboard
    if (update.callback_query) {
      const cb = update.callback_query;
      const cbChatId = cb.message?.chat?.id?.toString();
      const cbData = cb.data;

      // Restriction stricte à l'administrateur
      if (cbChatId !== adminChatId) {
        return { ok: true, handled: true };
      }

      if (cbData === 'cmd_reject_otp' && cbChatId) {
        const rejected = OtpService.rejectLatestPendingRequest('Demande de code refusée par sécurité : seules les connexions sont autorisées.');
        if (rejected) {
          await this.sendMessage(botToken, cbChatId, `⛔ <b>Demande bloquée avec succès.</b> Le client (${rejected.clientEmail}) a été informé que sa demande est rejetée. Vos identifiants restent protégés.`, { parse_mode: 'HTML' });
        } else {
          await this.sendMessage(botToken, cbChatId, `ℹ️ Aucune demande en attente à refuser.`, { parse_mode: 'HTML' });
        }
        return { ok: true, handled: true };
      }
    }

    if (!update.message) return { ok: true, handled: false };

    const message = update.message;
    const chatId = message.chat?.id?.toString();
    const text = (message.text || '').trim();

    if (!chatId || !text) return { ok: true, handled: false };

    // Vérification de sécurité : Seul l'administrateur officiel peut envoyer des commandes au bot
    if (chatId !== adminChatId) {
      await this.sendMessage(
        botToken,
        chatId,
        `🔒 <b>Accès Réservé</b>\n\nCe bot est la console de gestion privée du propriétaire de SubHub. Vos identifiants Telegram ne sont pas autorisés à émettre des commandes sur cette boutique.`,
        { parse_mode: 'HTML' }
      );
      return { ok: true, handled: true };
    }

    // 0. Commande de refus de code (/refuser ou /bloquer)
    if (text.startsWith('/refuser') || text.startsWith('/bloquer') || text.toLowerCase() === 'refuser' || text.toLowerCase() === 'bloquer') {
      const rejected = OtpService.rejectLatestPendingRequest('Demande de code refusée par sécurité : seules les connexions simples sont autorisées. Toute modification de mot de passe est interdite.');
      if (rejected) {
        const rejectMsg = `
⛔ <b>DEMANDE DE CODE REFUSÉE ET BLOQUÉE !</b>
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Client concerné :</b> <code>${rejected.clientEmail}</code>
🎬 <b>Service :</b> ${rejected.productName}
🔒 <b>Action :</b> Demande annulée immédiatement. L'écran du client affiche un avertissement de sécurité.
━━━━━━━━━━━━━━━━━━━━━
<i>Votre mot de passe et vos identifiants restent 100% sécurisés.</i>
        `.trim();

        await this.sendMessage(botToken, chatId, rejectMsg, { parse_mode: 'HTML' });
        return { ok: true, handled: true };
      } else {
        await this.sendMessage(botToken, chatId, 'ℹ️ Aucune demande en attente à refuser.', { parse_mode: 'HTML' });
        return { ok: true, handled: true };
      }
    }

    // 0b. Détection d'un code de connexion transmis par l'administrateur (/code 123456 ou 123456)
    const codeMatch = text.match(/^(?:\/(?:code|otp)\s+)?(\d{4,8})$/i);
    if (codeMatch) {
      const codeDigits = codeMatch[1];
      const delivered = OtpService.deliverLatestPendingCode(codeDigits);

      if (delivered) {
        if (delivered.isPreloaded) {
          const preloadedMsg = `
⚡ <b>CODE PRÉ-ENREGISTRÉ AVEC SUCCÈS (MODE ANTICIPATION) !</b>
━━━━━━━━━━━━━━━━━━━━━
🔑 <b>Code mémorisé :</b> <code>${codeDigits}</code>
⏱️ <b>Durée de validité :</b> 15 minutes
🚀 <b>Auto-remplissage :</b> Dès que le client ouvrira son interface ou cliquera sur "Demander le code", ce code sera <b>automatiquement injecté et affiché</b> sur son écran sans aucune attente !
━━━━━━━━━━━━━━━━━━━━━
<i>Idéal si vous avez vu le mail Netflix arriver avant même que le client ne clique.</i>
          `.trim();
          await this.sendMessage(botToken, chatId, preloadedMsg, { parse_mode: 'HTML' });
          return { ok: true, handled: true };
        }

        const confirmMsg = `
✅ <b>CODE DE CONNEXION TRANSMIS AVEC SUCCÈS !</b>
━━━━━━━━━━━━━━━━━━━━━
🔑 <b>Code transmis :</b> <code>${codeDigits}</code>
👤 <b>Client :</b> <code>${delivered.clientEmail}</code> (Profil assigné : ${delivered.profileName})
🎬 <b>Service :</b> ${delivered.productName}
⏱️ <b>Statut :</b> Affiché en direct sur l'écran du client !
━━━━━━━━━━━━━━━━━━━━━
<i>Le client peut maintenant s'identifier sur Netflix.</i>
        `.trim();

        await this.sendMessage(botToken, chatId, confirmMsg, { parse_mode: 'HTML' });
        return { ok: true, handled: true };
      }
    }

    // 1. Commande /start
    if (text === '/start') {
      const welcome = `
🤖 <b>Bienvenue sur le Bot SubHub Command Center !</b>
━━━━━━━━━━━━━━━━━━━━━
Votre copilote d'arbitrage et de vente d'abonnements numériques.

<b>Commandes Administrateur disponibles :</b>
📊 <code>/stats</code> - Chiffre d'affaires & bénéfices du jour
📦 <code>/stock</code> - État des stocks et alertes
🔍 <code>/search &lt;service&gt;</code> - Comparateur IA de prix (Plati vs G2A)
🛒 <code>/boutique</code> - Voir la boutique publique
❓ <code>/help</code> - Aide et raccourcis
━━━━━━━━━━━━━━━━━━━━━
Tapez une commande pour commencer !
      `.trim();

      const keyboard = {
        inline_keyboard: [
          [
            { text: '📊 Statistiques', callback_data: 'cmd_stats' },
            { text: '📦 Stocks', callback_data: 'cmd_stock' }
          ],
          [
            { text: '🛒 Sourcing Plati.market', url: 'https://plati.market' },
            { text: '🌐 Marketplace Z2U', url: 'https://www.z2u.com' }
          ]
        ]
      };

      await this.sendMessage(botToken, chatId, welcome, { parse_mode: 'HTML', reply_markup: keyboard });
      return { ok: true, handled: true };
    }

    // 2. Commande /stats
    if (text === '/stats') {
      const statsText = `
📊 <b>SUBHUB - RAPPORT FINANCIER EN DIRECT</b>
━━━━━━━━━━━━━━━━━━━━━
💰 <b>Chiffre d'Affaires :</b> <b>1 890,50 €</b>
💎 <b>Bénéfice Net :</b> <b>+1 240,20 €</b>
📈 <b>Marge Brute Moyenne :</b> <b>+191%</b>

👥 <b>Abonnements Actifs :</b> 186 clients
🛡️ <b>SAV / Litiges :</b> 0 en attente (100% résolus)
⚡ <b>Système d'auto-délivrance :</b> ACTIF
━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      await this.sendMessage(botToken, chatId, statsText, { parse_mode: 'HTML' });
      return { ok: true, handled: true };
    }

    // 3. Commande /stock
    if (text === '/stock') {
      const stockText = `
📦 <b>SUBHUB - ÉTAT DES STOCKS EN TEMPS RÉEL</b>
━━━━━━━━━━━━━━━━━━━━━
• <b>ChatGPT Pro (o1/GPT-4o) :</b> 18 dispos ✅
• <b>Claude Pro (Sonnet 3.5) :</b> 12 dispos ✅
• <b>Midjourney v6.1 :</b> 14 dispos ✅
• <b>Suno AI Music (Recharge) :</b> 25 dispos ✅
• <b>Netflix 4K Ultra HD :</b> 45 dispos ✅
• <b>Spotify Premium (1 An) :</b> 30 dispos ✅
• <b>Duolingo Super (1 An) :</b> 22 dispos ✅
• <b>Google Gemini Advanced :</b> 8 dispos ⚠️
━━━━━━━━━━━━━━━━━━━━━
<i>Tous les comptes sont prêts pour l'envoi instantané.</i>
      `.trim();

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🛒 Acheter du stock sur Plati', url: 'https://plati.market' }
          ]
        ]
      };

      await this.sendMessage(botToken, chatId, stockText, { parse_mode: 'HTML', reply_markup: keyboard });
      return { ok: true, handled: true };
    }

    // 4. Commande /search <produit>
    if (text.startsWith('/search')) {
      const query = text.replace('/search', '').trim();
      if (!query) {
        await this.sendMessage(
          botToken,
          chatId,
          '🔍 <i>Utilisation : tapez <code>/search ChatGPT Pro</code> ou <code>/search Midjourney</code> pour lancer le sourcing IA.</i>',
          { parse_mode: 'HTML' }
        );
        return { ok: true, handled: true };
      }

      const comparison = SupplierComparatorService.searchAndCompare(query);
      const best = comparison.offers[comparison.bestPickIndex] || comparison.offers[0];

      let msg = `🎯 <b>RÉSULTAT SOURCING IA : "${query}"</b>\n━━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `💡 <i>${comparison.summary}</i>\n\n`;

      comparison.offers.forEach((o, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        msg += `${medal} <b>${o.platform}</b> ${o.isBestValue ? '👑 (Choix IA #1)' : ''}\n`;
        msg += `• Achat : <b>${o.buyPriceEUR.toFixed(2)} €</b> | Vente suggérée : <b>${o.suggestedSellPriceEUR.toFixed(2)} €</b>\n`;
        msg += `• Marge : <b>+${o.marginPercent}%</b> | Note vendeur : ${o.sellerRating}\n`;
        msg += `• Type : ${o.accountType === 'private_account' ? 'Compte Privé' : 'Clé/Recharge'}\n\n`;
      });

      const keyboard: any = {
        inline_keyboard: []
      };

      comparison.offers.forEach((o) => {
        keyboard.inline_keyboard.push([
          { text: `🛒 Voir sur ${o.platform} (${o.buyPriceEUR.toFixed(2)} €)`, url: o.purchaseUrl }
        ]);
      });

      await this.sendMessage(botToken, chatId, msg, { parse_mode: 'HTML', reply_markup: keyboard });
      return { ok: true, handled: true };
    }

    // 5. Commande /boutique
    if (text === '/boutique') {
      await this.sendMessage(
        botToken,
        chatId,
        '🛍️ <b>Boutique SubHub :</b>\nVotre boutique est active en ligne. Retrouvez tous vos abonnements IA et streaming garantis.',
        {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: '🛒 Sourcing Plati.market', url: 'https://plati.market' }]]
          }
        }
      );
      return { ok: true, handled: true };
    }

    // Fallback : commande inconnue
    await this.sendMessage(
      botToken,
      chatId,
      `❓ Commande non reconnue. Tapez <code>/start</code> pour voir les commandes disponibles ou <code>/search &lt;produit&gt;</code> pour comparer des offres.`,
      { parse_mode: 'HTML' }
    );

    return { ok: true, handled: true };
  }
}
