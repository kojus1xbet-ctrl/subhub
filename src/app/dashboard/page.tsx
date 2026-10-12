'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Wallet, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  Plus, 
  History, 
  Gift, 
  Copy, 
  Check,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { SecretVaultModal } from '@/components/dashboard/SecretVaultModal';
import { WarrantyModal } from '@/components/dashboard/WarrantyModal';
import { WalletModal } from '@/components/dashboard/WalletModal';
import { ClientConcierge } from '@/components/ai/ClientConcierge';
import { ClientAuthModal } from '@/components/auth/ClientAuthModal';
import { useClientAuth } from '@/lib/client-auth';
import { 
  INITIAL_USER_SUBSCRIPTIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_PRODUCTS 
} from '@/lib/store';
import { UserSubscription, WalletTransaction, Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function DashboardPage() {
  const { user, isAuthenticated, login, logout } = useClientAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>(INITIAL_USER_SUBSCRIPTIONS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [walletBalance, setWalletBalance] = useState<number>(42.50);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Modals
  const [selectedVaultSub, setSelectedVaultSub] = useState<UserSubscription | null>(null);
  const [selectedWarrantySub, setSelectedWarrantySub] = useState<UserSubscription | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedSubs = localStorage.getItem('subhub_subs');
      if (savedSubs) {
        setSubscriptions(JSON.parse(savedSubs));
      } else {
        setSubscriptions([]);
      }

      const savedBal = localStorage.getItem('subhub_wallet');
      if (savedBal) setWalletBalance(parseFloat(savedBal));
      else setWalletBalance(0);

      const savedProds = localStorage.getItem('subhub_products');
      if (savedProds) setProducts(JSON.parse(savedProds));

      // Vérification Magic Link URL (?auth_token=...&email=...)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const authToken = params.get('auth_token');
        const authEmail = params.get('email');
        if (authToken && authEmail) {
          fetch(`/api/auth/client?token=${encodeURIComponent(authToken)}&email=${encodeURIComponent(authEmail)}`)
            .then((res) => res.json())
            .then((data) => {
              if (data.success && data.user) {
                login(data.user);
                setNotification(`Connexion par lien magique réussie ! Bienvenue ${data.user.email}`);
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            })
            .catch(console.error);
        }
      }
    } catch (e) {
      console.warn('LocalStorage non disponible');
    }
  }, []);

  const handleWalletRecharge = (amount: number, bonus: number) => {
    const newBal = walletBalance + amount + bonus;
    setWalletBalance(newBal);
    localStorage.setItem('subhub_wallet', newBal.toString());

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      amount: amount + bonus,
      date: 'Aujourd\'hui',
      description: `Recharge Portefeuille (+${formatPrice(bonus)} bonus offert)`,
      status: 'completed'
    };
    setTransactions([newTx, ...transactions]);
  };

  const handleRenewSubscription = (sub: UserSubscription) => {
    // Prolonger de 30 jours
    const currentExpiry = new Date(sub.expiryDate).getTime();
    const newExpiryDate = new Date(Math.max(Date.now(), currentExpiry) + 30 * 24 * 60 * 60 * 1000).toISOString();
    const newWarrantyDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const updated = subscriptions.map((s) =>
      s.id === sub.id
        ? {
            ...s,
            expiryDate: newExpiryDate,
            warrantyUntil: newWarrantyDate,
            status: 'active' as const
          }
        : s
    );

    setSubscriptions(updated);
    localStorage.setItem('subhub_subs', JSON.stringify(updated));

    setNotification(`L'abonnement à ${sub.productName} a été prolongé de 30 jours !`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubscriptionReplaced = (updatedSub: UserSubscription) => {
    const updated = subscriptions.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubscriptions(updated);
    localStorage.setItem('subhub_subs', JSON.stringify(updated));
    setSelectedVaultSub(updatedSub);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://subhub.ai/join?ref=CLIENT-PRO-482');
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Navbar */}
      <Navbar
        walletBalance={walletBalance}
        activeSubsCount={subscriptions.length}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Toast Notification */}
        {notification && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Bannière Connexion Client si non connecté */}
        {!isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-950/30">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Connexion Espace Client</h3>
                <p className="text-xs text-slate-400">
                  Connectez-vous pour synchroniser vos accès sécurisés, vos codes PIN et votre solde.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow hover:bg-slate-100 transition-all hover:scale-[1.02]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continuer avec Google</span>
              </button>
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-[1.02]"
              >
                <span>Code d'accès par e-mail</span>
              </button>
            </div>
          </div>
        )}

        {/* Statut client connecté */}
        {isAuthenticated && user && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Session client active : <strong className="text-white font-mono">{user.email}</strong></span>
              <span className="rounded bg-indigo-950 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] text-indigo-300">
                {user.provider === 'google' ? 'Google Sign-In' : 'E-mail OTP'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Se déconnecter
            </button>
          </div>
        )}

        {/* Dashboard Header & KPI Cards */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Clock className="h-7 w-7 text-cyan-400" />
                Mon Espace Client & Suivi d'Abonnements
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Consultez le nombre de jours restants, vos accès sécurisés et activez votre garantie en 1 clic.
              </p>
            </div>

            <a
              href="/#catalog"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-violet-500 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" />
              Prendre un nouvel abonnement
            </a>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Card 1 : Abonnements Actifs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Abonnements Actifs</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                {subscriptions.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">ChatGPT Pro, Claude Pro, Netflix 4K...</p>
            </div>

            {/* Card 2 : Garantie Active */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Statut Garantie</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                100% Couvert
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Remplacement instantané disponible 24/7</p>
            </div>

            {/* Card 3 : Solde Portefeuille */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-1">Solde Disponible</span>
                <div className="text-2xl font-black text-white font-mono text-emerald-400">
                  {formatPrice(walletBalance)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Débit automatique sans frais</p>
              </div>

              <button
                onClick={() => setIsWalletOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 px-3 py-2 text-xs font-bold text-white transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-400" />
                Recharger
              </button>
            </div>

          </div>
        </div>

        {/* Section Abonnements Actifs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-400" />
              Vos Abonnements en Cours ({subscriptions.length})
            </h2>
            <span className="text-xs text-slate-400">
              Décompte actualisé en direct
            </span>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-slate-800 bg-slate-900/40">
              <Clock className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-300">Vous n'avez pas encore d'abonnement actif.</p>
              <a
                href="/#catalog"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
              >
                Découvrir les offres
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onOpenVault={(s) => setSelectedVaultSub(s)}
                  onOpenWarranty={(s) => setSelectedWarrantySub(s)}
                  onRenew={(s) => handleRenewSubscription(s)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Bannière Parrainage & Réduction */}
        <section className="mb-12 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-violet-950/30 to-slate-950 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Programme Parrainage & Offres Privilèges
                  <span className="rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5">
                    15% Commission
                  </span>
                </h3>
                <p className="mt-1 text-xs text-slate-300 max-w-xl">
                  Partagez votre lien de parrainage avec vos amis, collègues ou développeurs : ils bénéficient de 
                  <strong className="text-white"> -10% immédiats</strong> sur leur premier achat et vous recevez 
                  <strong className="text-emerald-400"> 15% de commission crédités</strong> directement sur votre portefeuille.
                </p>
              </div>
            </div>

            <button
              onClick={copyReferralLink}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/25 shrink-0 transition-colors"
            >
              {copiedReferral ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              {copiedReferral ? 'Lien de parrainage copié !' : 'Copier mon lien de parrainage'}
            </button>
          </div>
        </section>

        {/* Historique des Transactions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="text-lg font-bold text-white">Historique de vos Opérations</h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <div className="font-semibold text-white">{tx.description}</div>
                    <div className="text-[11px] text-slate-500">{tx.date}</div>
                  </div>
                  <div className={`font-mono font-bold ${
                    tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {tx.amount > 0 ? `+${formatPrice(tx.amount)}` : formatPrice(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />

      {/* Modals */}
      <SecretVaultModal
        subscription={selectedVaultSub}
        onClose={() => setSelectedVaultSub(null)}
      />

      <WarrantyModal
        subscription={selectedWarrantySub}
        onClose={() => setSelectedWarrantySub(null)}
        onReplaced={handleSubscriptionReplaced}
      />

      <WalletModal
        currentBalance={walletBalance}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onRecharge={handleWalletRecharge}
      />

      {/* AI Assistant */}
      <ClientConcierge products={products} />

      {/* Modal d'authentification client */}
      <ClientAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(u) => {
          login(u);
          setNotification(`Bienvenue, ${u.email} ! Votre espace personnel est synchronisé.`);
        }}
        redirectUrl="/dashboard"
      />

    </div>
  );
}
