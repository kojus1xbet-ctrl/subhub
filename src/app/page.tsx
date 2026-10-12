'use client';

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Search, 
  ArrowRight, 
  Layers,
  HelpCircle,
  TrendingUp,
  Percent
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/store/ProductCard';
import { CheckoutModal } from '@/components/store/CheckoutModal';
import { ProductDetailsModal } from '@/components/store/ProductDetailsModal';
import { WalletModal } from '@/components/dashboard/WalletModal';
import { ClientConcierge } from '@/components/ai/ClientConcierge';
import { ClientAuthModal } from '@/components/auth/ClientAuthModal';
import { useClientAuth } from '@/lib/client-auth';
import { INITIAL_PRODUCTS, INITIAL_USER_SUBSCRIPTIONS } from '@/lib/store';
import { InventoryService } from '@/lib/inventory-service';
import { Product, ProductCategory, UserSubscription } from '@/lib/types';

export default function HomePage() {
  const { user, isAuthenticated, login } = useClientAuth();
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>(INITIAL_USER_SUBSCRIPTIONS);
  const [walletBalance, setWalletBalance] = useState<number>(42.50);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [buyingProduct, setBuyingProduct] = useState<Product | null>(null);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Synchronisation avec localStorage & inventaire
  useEffect(() => {
    try {
      const availNetflixSlots = InventoryService.getAvailableSlotsCount('prod-netflix-4k');
      const savedProducts = localStorage.getItem('subhub_products');
      if (savedProducts) {
        const parsed: Product[] = JSON.parse(savedProducts);
        const synced = parsed.map((p) => 
          p.id === 'prod-netflix-4k' ? { ...p, stockCount: availNetflixSlots } : p
        );
        setProducts(synced);
      } else {
        const initialSynced = INITIAL_PRODUCTS.map((p) =>
          p.id === 'prod-netflix-4k' ? { ...p, stockCount: availNetflixSlots } : p
        );
        setProducts(initialSynced);
      }

      const savedSubs = localStorage.getItem('subhub_subs');
      if (savedSubs) setUserSubs(JSON.parse(savedSubs));

      const savedBalance = localStorage.getItem('subhub_wallet');
      if (savedBalance) setWalletBalance(parseFloat(savedBalance));
    } catch (e) {
      console.warn('LocalStorage non disponible');
    }
  }, []);

  const handleOrderSuccess = (newSub: UserSubscription, deducted: number) => {
    const updatedSubs = [newSub, ...userSubs];
    setUserSubs(updatedSubs);
    localStorage.setItem('subhub_subs', JSON.stringify(updatedSubs));

    if (deducted > 0) {
      const newBal = Math.max(0, walletBalance - deducted);
      setWalletBalance(newBal);
      localStorage.setItem('subhub_wallet', newBal.toString());
    }
  };

  const handleWalletRecharge = (amount: number, bonus: number) => {
    const newBal = walletBalance + amount + bonus;
    setWalletBalance(newBal);
    localStorage.setItem('subhub_wallet', newBal.toString());
  };

  // Filtrage
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        walletBalance={walletBalance}
        activeSubsCount={userSubs.length}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-900 bg-gradient-to-b from-indigo-950/20 via-slate-950 to-slate-950">
          
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-inner mb-6 animate-fadeIn">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Nouveau : Accès ChatGPT Pro & Claude 3.5 Sonnet disponibles en stock</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
              Vos Outils IA & Services Premium{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400">
                Jusqu'à -85%
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Bénéficiez des modèles d'intelligence artificielle les plus puissants (o1, GPT-4o, Claude, Grok) et du streaming 4K avec 
              <span className="text-white font-medium"> livraison immédiate</span>, 
              <span className="text-white font-medium"> coffre-fort d'identifiants chiffré</span> et 
              <span className="text-white font-medium"> garantie de remplacement 30 jours en 1 clic</span>.
            </p>

            {/* Quick action buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#catalog"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-105"
              >
                Explorer le Catalogue
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
              >
                <Clock className="h-4 w-4 text-cyan-400" />
                Tableau de Bord Client ({userSubs.length} Actifs)
              </a>
            </div>

            {/* Micro Stats Bar */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/60 text-left">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <div className="text-xl font-black text-white font-mono">100%</div>
                <div className="text-xs text-slate-400 font-medium">Garantie Remplacement</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <div className="text-xl font-black text-cyan-400 font-mono">&lt; 30 sec</div>
                <div className="text-xs text-slate-400 font-medium">Livraison Instantanée</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <div className="text-xl font-black text-emerald-400 font-mono">4.9 / 5</div>
                <div className="text-xs text-slate-400 font-medium">Satisfaction Clients</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <div className="text-xl font-black text-indigo-400 font-mono">-5% Crypto</div>
                <div className="text-xs text-slate-400 font-medium">Remise USDT / BTC</div>
              </div>
            </div>

          </div>
        </section>

        {/* Section Catalogue */}
        <section id="catalog" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Layers className="h-6 w-6 text-indigo-400" />
                Services & Abonnements Disponibles
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Choisissez votre formule et commencez à utiliser vos outils immédiatement sans engagement long.
              </p>
            </div>

            {/* Barre de recherche */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Rechercher (ChatGPT, Claude...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-9 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Filtres de catégorie */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {[
              { id: 'all', label: 'Toutes les Offres' },
              { id: 'ia', label: '🤖 Intelligence Artificielle (GPT, Claude, Grok)' },
              { id: 'streaming', label: '🍿 Streaming (Netflix 4K)' },
              { id: 'productivity', label: '⚡ Productivité & Langues' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                    : 'border border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grille des produits avec espacement suffisant pour les badges flottants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5 gap-y-9">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onBuy={(p) => setBuyingProduct(p)}
                onOpenDetails={(p) => setSelectedDetailProduct(p)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40">
              <HelpCircle className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Aucun produit ne correspond à votre recherche.</p>
              <button
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-3 text-xs text-indigo-400 hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

        </section>

        {/* Section FAQ & Sécurité */}
        <section className="border-t border-slate-900 bg-slate-950/60 py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold text-white text-center mb-8">
              Questions Fréquentes & Rassurance
            </h3>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="font-bold text-white text-sm mb-1">
                  Comment fonctionne la garantie de remplacement 30 jours ?
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Si vous rencontrez la moindre déconnexion ou problème technique avec un compte, vous n'avez pas besoin d'attendre un support lent : un bouton <strong>« Remplacement en 1 Clic »</strong> dans votre tableau de bord vous réassigne automatiquement de nouveaux accès instantanément.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="font-bold text-white text-sm mb-1">
                  Où sont stockés mes identifiants de connexion ?
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Dès votre commande validée, vos identifiants sont chiffrés et placés dans votre <strong>Coffre-fort personnel (Secret Vault)</strong> sur votre espace client. Vous pouvez les consulter et les copier à tout moment en toute sécurité.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="font-bold text-white text-sm mb-1">
                  Quels sont les moyens de paiement acceptés ?
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Vous pouvez régler via votre <strong>Solde Portefeuille SubHub</strong>, par <strong>Crypto-monnaies (USDT, BTC, LTC avec -5% de réduction)</strong> ou par <strong>Carte bancaire sécurisée</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ProductDetailsModal
        product={selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onBuy={(p) => {
          setSelectedDetailProduct(null);
          setBuyingProduct(p);
        }}
      />

      <CheckoutModal
        product={buyingProduct}
        walletBalance={walletBalance}
        onClose={() => setBuyingProduct(null)}
        onSuccess={handleOrderSuccess}
        onOpenWallet={() => setIsWalletOpen(true)}
      />

      <WalletModal
        currentBalance={walletBalance}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onRecharge={handleWalletRecharge}
      />

      {/* Conseiller IA Client 24/7 */}
      <ClientConcierge products={products} />

      {/* Modal d'authentification client (Google, Email OTP, Lien magique) */}
      <ClientAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newUser) => login(newUser)}
        redirectUrl="/dashboard"
      />

    </div>
  );
}
