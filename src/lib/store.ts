import { Product, UserSubscription, WalletTransaction, WarrantyClaim, SharedInventoryAccount } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-gpt-pro',
    name: 'ChatGPT Pro 2026 | GPT-4o Illimité & Modèles o1 | Compte Dédié 30j ⚡',
    slug: 'chatgpt-pro',
    category: 'ia',
    badge: 'Plus Populaire 🔥',
    shortDescription: 'Accès illimité à GPT-4o, modèles o1 raisonnement avancé, DALL-E 3 et Canvas.',
    description: 'Bénéficiez de la puissance maximale d\'OpenAI avec accès prioritaire sans temps d\'attente. Modèles o1 inclus pour le raisonnement mathématique et le code complexe, avec DALL-E 3 et Canvas.',
    officialPrice: 15000,
    buyPrice: 1500,
    sellPrice: 2625, // 2 625 FCFA
    paymentLinkChariow: 'https://chariow.com/pay/chatgpt-pro-2625',
    sourcePlatform: 'Plati.market',
    sourceUrl: 'https://plati.market/search/chatgpt+plus+pro',
    accountType: 'private_account',
    deliveryType: 'instant_auto',
    duration: '1 mois (Renouvelable)',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: true,
      requiresVpn: false,
      maxDevices: 2,
      instructions: [
        'Connectez-vous sur chat.openai.com avec les identifiants fournis dans votre coffre-fort.',
        'Vous pouvez changer le mot de passe immédiatement après votre première connexion.',
        'Conservez le profil dédié pour ne pas perdre votre historique de discussion.'
      ],
      restrictions: [
        'Ne partagez pas vos accès publiquement sur des canaux Discord ou Telegram.',
        'Respectez les règles d\'utilisation éthiques d\'OpenAI.'
      ]
    },
    features: [
      'Modèle o1-preview & o1-mini inclus',
      'GPT-4o illimité sans quota horaire',
      'Génération d\'images DALL-E 3',
      'Analyse de données et exécution de code Python',
      'Garantie de remplacement 30 jours'
    ],
    stockCount: 18,
    rating: 4.95,
    salesCount: 420,
    iconName: 'Bot',
    officialDomain: 'openai.com',
    isPopular: true
  },
  {
    id: 'prod-claude-pro',
    name: 'Claude Pro (Anthropic) | Sonnet 3.5 & Opus 200k Context | Artifacts Illimités 🧠',
    slug: 'claude-pro',
    category: 'ia',
    badge: 'Recommandé Dev 💻',
    shortDescription: 'Le meilleur modèle pour le code, la rédaction complexe et le raisonnement logique.',
    description: 'Accédez à Claude 3.5 Sonnet avec une fenêtre de contexte géante de 200k tokens et les fonctionnalités Claude Artifacts en illimité.',
    officialPrice: 15000,
    buyPrice: 1500,
    sellPrice: 2625,
    sourcePlatform: 'Plati.market',
    sourceUrl: 'https://plati.market/search/claude+pro',
    accountType: 'private_account',
    deliveryType: 'instant_auto',
    duration: '1 mois',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: true,
      requiresVpn: false,
      maxDevices: 2,
      instructions: [
        'Rendez-vous sur claude.ai avec les identifiants fournis.',
        'Entrez le mail fourni pour recevoir le code de sécurité temporaire ou utilisez le mot de passe.',
        'Profitez des fonctionnalités Artifacts et Projects.'
      ],
      restrictions: [
        'Interdiction de faire du scraping massif via l\'interface web.'
      ]
    },
    features: [
      '5x plus d\'utilisation que la version gratuite',
      'Accès prioritaire à Claude 3.5 Sonnet',
      'Projets et mémoire de contexte partagée',
      'Support des Artifacts interactifs',
      'Garantie échange immédiat'
    ],
    stockCount: 12,
    rating: 4.98,
    salesCount: 310,
    iconName: 'Sparkles',
    officialDomain: 'claude.ai',
    isPopular: true
  },
  {
    id: 'prod-gemini-adv',
    name: 'Google Gemini Advanced & AI Premium | 2M Tokens Contexte & 2 To Cloud Drive 🚀',
    slug: 'gemini-advanced',
    category: 'ia',
    badge: 'Contexte 2M Tokens ⚡',
    shortDescription: 'Intégration directe dans Google Workspace, 2 To de stockage Google Drive inclus.',
    description: 'Le modèle multimodal le plus puissant de Google avec la plus grande fenêtre de contexte au monde (2 millions de tokens, livres entiers et vidéos de plusieurs heures).',
    officialPrice: 15000,
    buyPrice: 1200,
    sellPrice: 2500,
    sourcePlatform: 'G2A',
    sourceUrl: 'https://g2a.com/gemini-advanced-google-one-ai-premium',
    accountType: 'personal_activation',
    deliveryType: 'manual_admin',
    duration: '1 mois',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: true,
      requiresVpn: false,
      maxDevices: 5,
      instructions: [
        'Activation via lien d\'invitation famille Google ou code promo.',
        'S\'applique directement sur votre compte Gmail personnel sans perdre vos données.',
        '2 To de stockage Drive ajoutés à votre compte.'
      ],
      restrictions: [
        'Votre compte Google ne doit pas faire partie d\'un autre groupe familial depuis moins de 12 mois.'
      ]
    },
    features: [
      'Modèle Gemini 1.5 Pro multimodal',
      'Fenêtre de contexte de 2 millions de tokens',
      '2 To de stockage Cloud Google Drive / Photos',
      'Intégration dans Gmail et Google Docs'
    ],
    stockCount: 8,
    rating: 4.89,
    salesCount: 195,
    iconName: 'Cpu',
    officialDomain: 'google.com',
    isPopular: false
  },
  {
    id: 'prod-grok-pro',
    name: 'Grok 2 & X Premium+ (xAI) | Images FLUX.1 Photoréalistes & Badge Certifié 🛸',
    slug: 'grok-premium-plus',
    category: 'ia',
    badge: 'Sans Censure 🚀',
    shortDescription: 'Grok 2 et FLUX.1 pour la génération d\'images sans restriction, badge bleu X certifié.',
    description: 'Accédez à Grok 2 sur X (anciennement Twitter) avec le flux d\'actualités en direct et la génération d\'images la plus réaliste du marché.',
    officialPrice: 15000,
    buyPrice: 1500,
    sellPrice: 2625,
    sourcePlatform: 'Z2U',
    sourceUrl: 'https://z2u.com/items/x-premium-plus-grok-ai-account',
    accountType: 'private_account',
    deliveryType: 'instant_auto',
    duration: '1 mois',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: true,
      requiresVpn: false,
      maxDevices: 1,
      instructions: [
        'Compte Twitter/X certifié Premium+ pré-activé.',
        'Accès direct au bouton Grok dans le menu latéral.'
      ],
      restrictions: [
        'Ne pas modifier le pseudo immédiatement pour éviter les déclenchements de sécurité X.'
      ]
    },
    features: [
      'Grok 2 avec génération d\'images FLUX.1',
      'Zéro publicité dans le fil d\'actualité X',
      'Mise en avant maximale des réponses',
      'Garantie totale 30 jours'
    ],
    stockCount: 14,
    rating: 4.91,
    salesCount: 145,
    iconName: 'Zap',
    officialDomain: 'x.ai',
    isPopular: false
  },
  {
    id: 'prod-netflix-4k',
    name: 'Netflix Premium Ultra HD (4K + HDR) | Profil Privé Sécurisé PIN | Sans Coupure 🎬',
    slug: 'netflix-premium-4k',
    category: 'streaming',
    badge: 'Profil Privé PIN 🎬',
    shortDescription: 'Profil privé sécurisé avec code PIN personnel sur compte officiel 4K HDR.',
    description: 'Profitez de tout le catalogue Netflix en qualité maximale 4K HDR avec son spatial Dolby Atmos sans coupure. Chaque profil possède son propre historique et son code PIN de verrouillage.',
    officialPrice: 15000,
    buyPrice: 1200,
    sellPrice: 2500, // 2 500 FCFA
    paymentLinkChariow: 'https://chariow.com/pay/netflix-premium-2500',
    sourcePlatform: 'Stock Direct Administrateur',
    sourceUrl: 'https://netflix.com',
    accountType: 'shared_account',
    deliveryType: 'instant_auto',
    duration: '1 mois',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: false,
      requiresVpn: false,
      maxDevices: 1,
      instructions: [
        'Connectez-vous sur netflix.com avec l\'adresse email et le mot de passe fournis.',
        'Sélectionnez STRICTEMENT votre profil assigné (ex: DUB, PRO 5, etc.).',
        'Entrez le code PIN personnel 4 chiffres fourni pour déverrouiller votre profil.'
      ],
      restrictions: [
        'NE MODIFIEZ JAMAIS l\'email ou le mot de passe général du compte.',
        'Le profil LORD FLIX est strictement réservé à l\'administration et ne doit pas être ouvert.',
        'Ne tentez pas de changer le forfait ou d\'ajouter des profils.'
      ]
    },
    features: [
      'Ultra HD (4K) et HDR sur tous vos écrans',
      'Profil dédié avec votre propre historique et liste',
      'Code PIN personnel 4 chiffres pour sécuriser votre profil',
      'Livraison instantanée 24/7 dans votre coffre-fort',
      'Garantie de remplacement automatique en 1 clic'
    ],
    stockCount: 3,
    rating: 4.96,
    salesCount: 890,
    iconName: 'Tv',
    officialDomain: 'netflix.com',
    isPopular: true
  },
  {
    id: 'prod-duolingo-super',
    name: 'Duolingo Super Family | Cœurs Illimités & Zéro Pub | 365 Jours Garanti 🦉',
    slug: 'duolingo-super',
    category: 'productivity',
    badge: 'Apprentissage 🦉',
    shortDescription: 'Apprenez sans frustration : zéro publicité, cœurs infinis et leçons hors-ligne.',
    description: 'Activez Duolingo Super directement sur votre profil existant sans perdre votre série (*streak*) ni vos points d\'expérience.',
    officialPrice: 10000,
    buyPrice: 1000,
    sellPrice: 2500,
    sourcePlatform: 'Plati.market',
    sourceUrl: 'https://plati.market/search/duolingo+super',
    accountType: 'personal_activation',
    deliveryType: 'instant_auto',
    duration: '1 an (365 jours)',
    durationDays: 365,
    warrantyDays: 365,
    rules: {
      canChangePassword: true,
      requiresVpn: false,
      maxDevices: 3,
      instructions: [
        'Vous recevez un lien d\'invitation officiel Duolingo Famille.',
        'Cliquez sur le lien tout en étant connecté à votre compte Duolingo.',
        'Votre compte devient instantanément Super pour 1 an !'
      ],
      restrictions: [
        'Aucune restriction sur votre compte personnel.'
      ]
    },
    features: [
      'Cœurs illimités pour apprendre sans pause',
      'Zéro publicité entre les leçons',
      'Test d\'évaluation de niveau illimité',
      'Conserve votre progression et vos séries intactes'
    ],
    stockCount: 30,
    rating: 4.97,
    salesCount: 560,
    iconName: 'BookOpen',
    officialDomain: 'duolingo.com',
    isPopular: false
  },
  {
    id: 'prod-prime-video',
    name: 'Amazon Prime Video 4K UHD | Films, Séries & Ligue 1 Pass | Zéro Publicité 🍿',
    slug: 'prime-video',
    category: 'streaming',
    badge: 'Films & Séries 🍿',
    shortDescription: 'Accès Prime Video Ultra HD 4K avec son Dolby 5.1 et streaming illimité sans publicité.',
    description: 'Profitez de toutes les séries originales Amazon Prime, documentaires et films récents en qualité 4K UHD avec profil personnel.',
    officialPrice: 8000,
    buyPrice: 1000,
    sellPrice: 2000,
    sourcePlatform: 'Plati.market',
    sourceUrl: 'https://plati.market/search/prime+video',
    accountType: 'shared_account',
    deliveryType: 'instant_auto',
    duration: '1 mois',
    durationDays: 30,
    warrantyDays: 30,
    rules: {
      canChangePassword: false,
      requiresVpn: false,
      maxDevices: 1,
      instructions: [
        'Connectez-vous sur primevideo.com avec les identifiants fournis.',
        'Utilisez le profil qui vous a été assigné.',
        'Ne modifiez pas le mot de passe général du compte.'
      ],
      restrictions: [
        'Interdiction de modifier les options d\'abonnement ou les coordonnées bancaires.'
      ]
    },
    features: [
      'Qualité 4K HDR & Dolby Audio',
      'Catalogue exclusif Prime Video & Ligue 1 pass disponible',
      'Zéro publicité durant vos visionnages',
      'Garantie échange express 30 jours'
    ],
    stockCount: 22,
    rating: 4.88,
    salesCount: 340,
    iconName: 'Film',
    officialDomain: 'amazon.com',
    isPopular: false
  }
];

export const INITIAL_USER_SUBSCRIPTIONS: UserSubscription[] = [];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

export const INITIAL_CLAIMS: WarrantyClaim[] = [];

export const INITIAL_SHARED_INVENTORY: SharedInventoryAccount[] = [];

