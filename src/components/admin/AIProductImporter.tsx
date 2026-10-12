'use client';

import React, { useState } from 'react';
import { 
  Wand2, 
  Link as LinkIcon, 
  ArrowRight, 
  Check, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Lock, 
  Users, 
  KeyRound, 
  RefreshCw, 
  Settings, 
  Percent, 
  ExternalLink,
  Search,
  ShoppingCart,
  TrendingUp,
  Award,
  Zap,
  Tag,
  Store
} from 'lucide-react';
import { 
  Product, 
  AIParseResult, 
  AccountType, 
  DeliveryType, 
  ProductCategory, 
  SupplierOffer, 
  MultiSourceSearchResponse 
} from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';

interface AIProductImporterProps {
  onProductCreated: (newProduct: Product) => void;
}

export function AIProductImporter({ onProductCreated }: AIProductImporterProps) {
  // Navigation entre les 2 modes
  const [activeTab, setActiveTab] = useState<'search' | 'url'>('search');

  // Mode 1 : Recherche Multi-Plateformes
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<MultiSourceSearchResponse | null>(null);

  // Mode 2 : Analyse d'URL directe
  const [url, setUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Données de l'offre en cours d'édition
  const [parsedData, setParsedData] = useState<AIParseResult | null>(null);
  const [activeSourceUrl, setActiveSourceUrl] = useState<string>('');

  // Formulaire d'ajustement Admin
  const [sellPrice, setSellPrice] = useState<number>(14.99);
  const [marginMultiplier, setMarginMultiplier] = useState<number>(2.5);
  const [accountType, setAccountType] = useState<AccountType>('private_account');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('instant_auto');
  const [stockCount, setStockCount] = useState<number>(20);
  const [productTitle, setProductTitle] = useState('');
  const [productBadge, setProductBadge] = useState('Nouveau 🚀');
  const [isSaved, setIsSaved] = useState(false);

  // Persistance de la clé API Gemini
  React.useEffect(() => {
    try {
      const savedKey = localStorage.getItem('subhub_gemini_key');
      if (savedKey) setCustomApiKey(savedKey);
    } catch {}
  }, []);

  const handleApiKeyChange = (keyVal: string) => {
    setCustomApiKey(keyVal);
    try {
      localStorage.setItem('subhub_gemini_key', keyVal);
    } catch {}
  };

  // Mots-clés rapides pour le sourcing multi-fournisseurs
  const quickSearchKeywords = [
    { label: 'ChatGPT Pro', query: 'ChatGPT Pro' },
    { label: 'Claude Pro', query: 'Claude Pro' },
    { label: 'Midjourney v6', query: 'Midjourney' },
    { label: 'Suno AI Music', query: 'Suno AI' },
    { label: 'Netflix 4K', query: 'Netflix 4K' },
    { label: 'Spotify Premium', query: 'Spotify Premium' },
    { label: 'Duolingo Super', query: 'Duolingo Super' },
    { label: 'Google Gemini Adv', query: 'Gemini Advanced' },
    { label: 'Grok 2 FLUX', query: 'Grok 2' },
  ];

  // Exemples d'URLs réelles pour test direct
  const sampleUrls = [
    { label: 'Plati - Suno Recharge (1.05€)', url: 'https://plati.market/itm/suno-music-generation-2-tracks-per-run-balance-top-up/5975075' },
    { label: 'Plati - ChatGPT Pro', url: 'https://plati.market/search/chatgpt+plus+pro' },
    { label: 'Plati - Claude Pro', url: 'https://plati.market/search/claude+pro' },
    { label: 'Z2U - Midjourney v6', url: 'https://www.z2u.com/midjourney/subscriptions-12-21358' },
    { label: 'Plati - Netflix 4K UHD', url: 'https://plati.market/search/netflix+premium+4k' },
    { label: 'Plati - Spotify 1 An', url: 'https://plati.market/search/spotify+premium+12' },
    { label: 'Plati - Duolingo Super', url: 'https://plati.market/search/duolingo+super' },
    { label: 'G2A - Gemini Adv', url: 'https://www.g2a.com/search?query=gemini+advanced' }
  ];

  // Action : Recherche Multi-Plateformes
  const handlePerformSearch = async (queryToSearch = searchQuery) => {
    const q = queryToSearch.trim();
    if (!q) {
      setError('Veuillez saisir un mot-clé (ex: ChatGPT Pro, Midjourney, Netflix...)');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/compare-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.error || 'Erreur lors du sourcing multi-plateformes');
      }

      setSearchResult(res.data);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la recherche des fournisseurs');
    } finally {
      setIsSearching(false);
    }
  };

  // Action : Sélectionner une offre issue de la recherche comparative
  const handleSelectOffer = (offer: SupplierOffer) => {
    const adaptedParseResult: AIParseResult = {
      title: offer.title,
      badge: offer.badge || 'Recommandé 🚀',
      category: offer.category,
      officialPriceEUR: offer.buyPriceEUR * 3.5,
      originalPriceEUR: offer.buyPriceEUR,
      suggestedSellPriceEUR: offer.suggestedSellPriceEUR,
      estimatedMarginPercent: offer.marginPercent,
      accountType: offer.accountType,
      deliveryType: offer.deliveryType,
      durationDays: offer.durationDays,
      warrantyDays: offer.warrantyDays,
      features: offer.features,
      rules: offer.rules,
      sellerRating: offer.sellerRating,
      detectedSource: offer.platform,
      aiSummary: offer.aiSummary,
      description: offer.description,
      officialDomain: offer.officialDomain,
      logoUrl: offer.logoUrl
    };

    setParsedData(adaptedParseResult);
    setActiveSourceUrl(offer.purchaseUrl);
    setProductTitle(offer.title);
    setProductBadge(offer.badge || 'Recommandé 🚀');
    setAccountType(offer.accountType);
    setDeliveryType(offer.deliveryType);
    setSellPrice(offer.suggestedSellPriceEUR);
    setIsSaved(false);

    if (offer.buyPriceEUR > 0) {
      setMarginMultiplier(
        parseFloat((offer.suggestedSellPriceEUR / offer.buyPriceEUR).toFixed(1))
      );
    }

    // Scroll vers l'éditeur
    setTimeout(() => {
      document.getElementById('product-editor-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Action : Analyse d'une URL directe
  const handleAnalyzeUrl = async (targetUrl = url) => {
    if (!targetUrl.trim()) {
      setError('Veuillez renseigner une URL de produit.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/ai/parse-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          customApiKey: customApiKey.trim() || undefined
        })
      });

      const res = await response.json();
      if (!response.ok || !res.success) {
        throw new Error(res.error || 'Erreur lors de l\'analyse');
      }

      const data: AIParseResult = res.data;
      setParsedData(data);
      setActiveSourceUrl(targetUrl);
      setProductTitle(data.title);
      setProductBadge(data.badge || 'Top Offre 🚀');
      setAccountType(data.accountType);
      setDeliveryType(data.deliveryType);
      setSellPrice(data.suggestedSellPriceEUR);

      if (data.originalPriceEUR > 0) {
        setMarginMultiplier(
          parseFloat((data.suggestedSellPriceEUR / data.originalPriceEUR).toFixed(1))
        );
      }
    } catch (err: any) {
      setError(err?.message || 'Erreur inconnue lors de l\'analyse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultiplierChange = (newMult: number) => {
    setMarginMultiplier(newMult);
    if (parsedData?.originalPriceEUR) {
      const calculated = parseFloat((parsedData.originalPriceEUR * newMult).toFixed(2));
      setSellPrice(calculated);
    }
  };

  const handleSaveToCatalog = () => {
    if (!parsedData) return;

    const officialPriceCalculated = parsedData.officialPriceEUR || parseFloat((sellPrice * 2.2).toFixed(2));

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: productTitle || parsedData.title,
      slug: (productTitle || parsedData.title).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: parsedData.category,
      badge: productBadge || parsedData.badge || 'Top Offre 🚀',
      shortDescription: parsedData.aiSummary,
      description: parsedData.description || parsedData.aiSummary,
      officialPrice: officialPriceCalculated,
      buyPrice: parsedData.originalPriceEUR,
      sellPrice: sellPrice,
      sourcePlatform: parsedData.detectedSource,
      sourceUrl: activeSourceUrl || url,
      accountType: accountType,
      deliveryType: deliveryType,
      duration: `${parsedData.durationDays} jours`,
      durationDays: parsedData.durationDays,
      warrantyDays: parsedData.warrantyDays,
      rules: parsedData.rules,
      features: parsedData.features,
      stockCount: stockCount,
      rating: 4.95,
      salesCount: 120,
      iconName: parsedData.category === 'ia' ? 'Bot' : parsedData.category === 'streaming' ? 'Tv' : 'Sparkles',
      officialDomain: parsedData.officialDomain,
      logoUrl: parsedData.logoUrl,
      isPopular: true
    };

    onProductCreated(newProduct);
    setIsSaved(true);
  };

  const netProfit = parsedData ? (sellPrice - parsedData.originalPriceEUR) : 0;
  const currentMarginPercent = parsedData && parsedData.originalPriceEUR > 0
    ? Math.round((netProfit / parsedData.originalPriceEUR) * 100)
    : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
      
      {/* Header avec switcher d'onglets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 text-white shadow-lg shadow-fuchsia-600/20">
            <Wand2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Sourcing & Comparateur IA Multi-Fournisseurs
              <span className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                Plati • Z2U • G2A • G2G
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Tapez un nom de service (ex: ChatGPT Pro) ou collez une URL. L'IA trouve la meilleure offre et vous fournit le lien direct d'achat.
            </p>
          </div>
        </div>

        {/* Configuration Clé API Gemini Optionnelle */}
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 transition-colors self-start sm:self-auto"
        >
          <Settings className="h-3.5 w-3.5 text-fuchsia-400" />
          Clé API Gemini ({customApiKey ? 'Active' : 'Automatique'})
        </button>
      </div>

      {/* Clé API Input Drawer */}
      {showKeyInput && (
        <div className="mt-4 p-4 rounded-xl border border-fuchsia-500/20 bg-fuchsia-950/20 text-xs">
          <label className="font-semibold text-fuchsia-300 block mb-1">
            Votre clé Google Gemini API (Optionnel) :
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="AIzaSy..."
              value={customApiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-white font-mono"
            />
            <button
              onClick={() => setShowKeyInput(false)}
              className="rounded-lg bg-fuchsia-600 px-3 py-1.5 font-bold text-white"
            >
              Enregistrer
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Si non renseignée, notre moteur de comparaison et de scraping intelligent est actif par défaut.
          </p>
        </div>
      )}

      {/* Barre de navigation des modes */}
      <div className="mt-6 flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-600/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Search className="h-3.5 w-3.5" />
          1. Recherche IA par Mot-Clé (Recommandé)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-600/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          2. Analyser une URL Directe (Plati, Z2U...)
        </button>
      </div>

      {/* ONGLET 1 : RECHERCHE MULTI-PLATEFORMES */}
      {activeTab === 'search' && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tapez un service : ChatGPT Pro, Claude Pro, Midjourney, Netflix 4K, Suno..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePerformSearch()}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-10 py-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handlePerformSearch()}
              disabled={isSearching}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/25 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 transition-all shrink-0"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Comparaison en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Comparer les Fournisseurs
                </>
              )}
            </button>
          </div>

          {/* Raccourcis de recherche en 1 clic */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" /> Tendances :
            </span>
            {quickSearchKeywords.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(item.query);
                  handlePerformSearch(item.query);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-fuchsia-500/50 hover:text-white hover:bg-slate-900 transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* RÉSULTAT DU COMPARATEUR MULTI-PLATEFORMES */}
          {searchResult && (
            <div className="mt-6 space-y-4 pt-4 border-t border-slate-800 animate-fadeIn">
              {/* Synthèse IA du Benchmark */}
              <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Verdict du Comparateur IA :
                    </h4>
                    <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                      {searchResult.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grille des offres trouvées par marketplace */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResult.offers.map((offer, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between transition-all ${
                      offer.isBestValue 
                        ? 'border-fuchsia-500/50 bg-gradient-to-b from-fuchsia-950/20 to-slate-900/90 shadow-lg shadow-fuchsia-900/20 ring-1 ring-fuchsia-500/30'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      {/* En-tête de la carte fournisseur */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                            offer.platform === 'Plati.market' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            offer.platform === 'Z2U' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            offer.platform === 'G2A' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {offer.platform}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-bold">
                            ⭐ {offer.sellerRating}
                          </span>
                        </div>

                        {offer.isBestValue && (
                          <span className="rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 px-2 py-0.5 text-[10px] font-black text-fuchsia-300 flex items-center gap-1">
                            <Award className="h-3 w-3" /> Choix IA #1
                          </span>
                        )}
                        {offer.isLowestPrice && !offer.isBestValue && (
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                            💰 Prix Mini
                          </span>
                        )}
                      </div>

                      {/* Titre & type de compte */}
                      <h5 className="text-xs font-bold text-white line-clamp-2 mb-2" title={offer.title}>
                        {offer.title}
                      </h5>

                      <div className="flex flex-wrap gap-1.5 mb-3 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {offer.accountType === 'private_account' ? '🔒 Compte Privé Dédié' :
                           offer.accountType === 'shared_account' ? '👥 Profil PIN' :
                           offer.accountType === 'personal_activation' ? '👤 Sur Email Perso' : '🔑 Clé / Recharge'}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          🛡️ Garantie : {offer.warrantyDays}j
                        </span>
                      </div>

                      {/* Prix fournisseur vs Prix de vente */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-3">
                        <div>
                          <div className="text-[10px] text-slate-400">Prix d'achat :</div>
                          <div className="text-sm font-black text-white font-mono">
                            {formatPrice(offer.buyPriceEUR)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-emerald-400 font-semibold">Marge nette :</div>
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            +{offer.marginPercent}%
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-4">
                        {offer.notes}
                      </p>
                    </div>

                    {/* BOUTONS D'ACTION CLÉS */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/60">
                      {/* 1. LIEN DIRECT VERS LA PAGE D'ACHAT FOURNISSEUR */}
                      <a
                        href={offer.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
                        title="Ouvrir le catalogue ou l'offre sur la place de marché pour acheter du stock"
                      >
                        <ShoppingCart className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Acheter sur {offer.platform}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400 ml-0.5" />
                      </a>

                      {/* 2. BOUTON D'IMPORTATION EN 1 CLIC */}
                      <button
                        type="button"
                        onClick={() => handleSelectOffer(offer)}
                        className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all shadow-sm ${
                          offer.isBestValue
                            ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white hover:from-fuchsia-500 hover:to-indigo-500'
                            : 'bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-600 hover:text-white'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Importer cette offre
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ONGLET 2 : ANALYSE D'UNE URL DIRECTE */}
      {activeTab === 'url' && (
        <div className="mt-4 space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="url"
                placeholder="Collez ici l'URL (ex: https://plati.market/itm/... ou https://z2u.com/...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeUrl()}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-10 py-3 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleAnalyzeUrl()}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/25 hover:from-fuchsia-500 hover:to-indigo-500 disabled:opacity-50 transition-all shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Décodage par l'IA...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyser avec l'IA
                </>
              )}
            </button>
          </div>

          {/* Boutons d'exemples rapides avec vraies URLs fonctionnelles */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 mr-1">Tester rapidement (liens réels) :</span>
            {sampleUrls.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setUrl(item.url);
                  handleAnalyzeUrl(item.url);
                }}
                className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-fuchsia-500/50 hover:text-white transition-all"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ÉDITEUR DU PRODUIT SÉLECTIONNÉ OU ANALYSÉ */}
      {parsedData && (
        <div id="product-editor-section" className="mt-8 border-t border-slate-800 pt-6 space-y-6 animate-fadeIn">
          
          {/* Diagnostic IA & Badges détectés */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <BrandLogo
                  slug={parsedData.category}
                  name={productTitle || parsedData.title}
                  officialDomain={parsedData.officialDomain}
                  logoUrl={parsedData.logoUrl}
                  size="lg"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-xs font-bold text-indigo-300">
                      Source : {parsedData.detectedSource}
                    </span>
                    {parsedData.sellerRating && (
                      <span className="rounded-md bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-xs font-bold">
                        ⭐ Vendeur : {parsedData.sellerRating}
                      </span>
                    )}
                  </div>
                  {parsedData.officialDomain && (
                    <span className="text-[11px] text-cyan-300 font-medium flex items-center gap-1 mt-1">
                      🌐 Logo officiel extrait depuis : <strong>{parsedData.officialDomain}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* BOUTON D'ACCÈS DIRECT À LA PAGE D'ACHAT FOURNISSEUR */}
              {activeSourceUrl && (
                <a
                  href={activeSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 text-xs font-bold text-cyan-300 hover:bg-cyan-900/40 hover:text-white transition-all shadow-sm shrink-0"
                  title="Ouvrir la page chez le fournisseur pour acheter vos comptes ou vos clés"
                >
                  <ShoppingCart className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ouvrir la page d'achat sur {parsedData.detectedSource}</span>
                  <ExternalLink className="h-3 w-3 ml-0.5" />
                </a>
              )}
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">
              💡 <span className="font-semibold text-white">Synthèse IA :</span> {parsedData.aiSummary}
            </p>
            {parsedData.riskNotice && (
              <div className="mt-2 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Conseil tactique Admin : {parsedData.riskNotice}</span>
              </div>
            )}
          </div>

          {/* Grille d'édition Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Colonne 1 : Données Produits */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Titre du produit sur votre boutique :
                </label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Type de compte détecté :
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="private_account">🔒 Compte Privé Dédié</option>
                    <option value="shared_account">👥 Profil Partagé (PIN)</option>
                    <option value="personal_activation">👤 Sur Email Perso</option>
                    <option value="license_key">🔑 Clé / Solde Recharge</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Mode de délivrance :
                  </label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  >
                    <option value="instant_auto">⚡ Instantané (Stock auto)</option>
                    <option value="manual_admin">👤 Manuel (Sur commande)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Stock initial disponible :
                  </label>
                  <input
                    type="number"
                    value={stockCount}
                    onChange={(e) => setStockCount(parseInt(e.target.value) || 0)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Badge d'accroche :
                  </label>
                  <input
                    type="text"
                    value={productBadge}
                    onChange={(e) => setProductBadge(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Ce qu'on peut faire et ce qu'on ne peut pas faire */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
                <div className="text-xs font-bold text-slate-300">Règles & Sécurité extraites :</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`p-2 rounded-lg border ${
                    parsedData.rules.canChangePassword ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' : 'border-rose-500/30 bg-rose-950/20 text-rose-300'
                  }`}>
                    {parsedData.rules.canChangePassword ? '✅ Mot de passe modifiable' : '❌ Mot de passe fixe (Ne pas changer)'}
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    !parsedData.rules.requiresVpn ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
                  }`}>
                    {!parsedData.rules.requiresVpn ? '✅ 100% Sans VPN' : `⚠️ VPN Requis (${parsedData.rules.vpnRegion || 'Activation'})`}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 2 : Moteur de Calcul de Marge Commerciale */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Calculateur de Marge Commerciale</span>
                  </div>
                  <span className="rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2 py-0.5">
                    Marge : +{currentMarginPercent}%
                  </span>
                </div>

                {/* Données financières */}
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Prix d'achat (Fournisseur) :</div>
                    <div className="text-lg font-black text-white font-mono mt-0.5">
                      {formatPrice(parsedData.originalPriceEUR)}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40">
                    <div className="text-[11px] text-emerald-300 font-semibold">Bénéfice Net par Vente :</div>
                    <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                      +{formatPrice(netProfit)}
                    </div>
                  </div>
                </div>

                {/* Multiplicateur de marge rapide */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                    <span>Multiplicateur suggéré :</span>
                    <span className="text-indigo-400 font-bold font-mono">x{marginMultiplier}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {[1.5, 2.0, 2.5, 3.0, 4.0].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleMultiplierChange(m)}
                        className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          marginMultiplier === m
                            ? 'border-indigo-500 bg-indigo-600 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        x{m}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Votre prix de vente public (€) :
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(parseFloat(e.target.value) || 0)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-base text-white font-mono font-bold focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Bouton de validation pour publication en boutique */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                {isSaved ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/30 border border-emerald-500/50 py-3 text-sm font-bold text-emerald-300 animate-fadeIn">
                    <CheckCircle2 className="h-5 w-5" />
                    Produit publié et disponible immédiatement en boutique !
                  </div>
                ) : (
                  <button
                    onClick={handleSaveToCatalog}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all active:scale-[0.99]"
                  >
                    <Check className="h-4 w-4" />
                    Publier ce produit en Boutique
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
