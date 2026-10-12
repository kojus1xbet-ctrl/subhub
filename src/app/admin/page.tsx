'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wand2, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShieldCheck, 
  Bell, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Users, 
  Bot, 
  Percent, 
  Trash2,
  RefreshCw,
  Lock,
  ArrowRight,
  LogOut,
  Store,
  KeyRound,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { Footer } from '@/components/layout/Footer';
import { AIProductImporter } from '@/components/admin/AIProductImporter';
import { TelegramBotManager } from '@/components/admin/TelegramBotManager';
import { NetflixStockManager } from '@/components/admin/NetflixStockManager';
import { ChariowManager } from '@/components/admin/ChariowManager';
import { INITIAL_PRODUCTS, INITIAL_USER_SUBSCRIPTIONS } from '@/lib/store';
import { Product, UserSubscription } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [userSubs, setUserSubs] = useState<UserSubscription[]>(INITIAL_USER_SUBSCRIPTIONS);
  const [notification, setNotification] = useState<string | null>(null);

  // Sécurité & Authentification Admin Côté Serveur
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    checkExistingAuth();

    try {
      const savedProducts = localStorage.getItem('subhub_products');
      if (savedProducts) setProducts(JSON.parse(savedProducts));

      const savedSubs = localStorage.getItem('subhub_subs');
      if (savedSubs) setUserSubs(JSON.parse(savedSubs));
    } catch (e) {
      console.warn('LocalStorage non disponible');
    }
  }, []);

  const checkExistingAuth = async () => {
    const token = sessionStorage.getItem('subhub_admin_token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/auth', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem('subhub_admin_token');
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsLoggingIn(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinOrPassword: pinInput.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('subhub_admin_token', data.token);
        setPinInput('');
      } else {
        setErrorMessage(data.error || 'Code d\'accès incorrect.');
      }
    } catch {
      setErrorMessage('Erreur réseau lors de la vérification.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch {}
    setIsAuthenticated(false);
    sessionStorage.removeItem('subhub_admin_token');
    setPinInput('');
  };

  const handleProductCreated = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem('subhub_products', JSON.stringify(updated));

    setNotification(`Le produit "${newProduct.name}" a été ajouté au catalogue avec succès !`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    localStorage.setItem('subhub_products', JSON.stringify(updated));
  };

  // Calcul des statistiques financières
  const totalRevenue = products.reduce((acc, p) => acc + (p.salesCount * p.sellPrice), 0) + 1420;
  const totalCost = products.reduce((acc, p) => acc + (p.salesCount * p.buyPrice), 0) + 410;
  const totalProfit = totalRevenue - totalCost;
  const avgMargin = Math.round((totalProfit / totalCost) * 100);

  // 1. Écran de Verrouillage / Sécurité Administrateur
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
          
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 mb-5">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black text-center text-white">
            Console d'Administration SubHub
          </h2>
          <p className="mt-1.5 text-xs text-center text-slate-400">
            Espace confidentiel protégé par jeton de session chiffré et protection anti-brute-force.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Clé d'Accès ou Code PIN Administrateur :
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  placeholder="Saisissez votre code PIN ou mot de passe..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-10 py-2.5 text-sm text-white placeholder-slate-500 focus:border-fuchsia-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-600/25 hover:from-fuchsia-500 hover:to-indigo-500 transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isLoggingIn ? 'Vérification sécurisée...' : 'Déverrouiller la Console'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="pt-2 text-center">
              <a
                href="/"
                className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Store className="h-3.5 w-3.5" />
                Retourner à la boutique publique
              </a>
            </div>
          </form>

        </div>
      </div>
    );
  }

  // 2. Console Administrateur Déverrouillée
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-fuchsia-500 selection:text-white">
      
      {/* Header Dédié Administrateur (Invisible aux clients) */}
      <header className="sticky top-0 z-50 w-full border-b border-fuchsia-500/20 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-0.5 shadow-md shadow-fuchsia-600/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Wand2 className="h-5 w-5 text-fuchsia-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white flex items-center gap-2">
                SubHub <span className="text-fuchsia-400">Command Center</span>
                <span className="rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 px-2 py-0.2 text-[10px] font-bold text-fuchsia-300">
                  ADMIN ONLY 🔒
                </span>
              </span>
              <p className="text-[10px] text-slate-400">Gestion des stocks, marges Plati/G2A et importations IA</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            >
              <Store className="h-3.5 w-3.5 text-indigo-400" />
              Voir le Site Public
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/30 transition-colors"
              title="Verrouiller la session"
            >
              <LogOut className="h-3.5 w-3.5" />
              Verrouiller
            </button>
          </div>

        </div>
      </header>

      <main className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        
        {/* Header */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-950/40 px-3 py-1 text-[11px] font-bold text-fuchsia-300 mb-2">
                <Bot className="h-3.5 w-3.5 text-fuchsia-400" />
                Mode Administrateur & Arbitrage Digital
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                Centre de Commandement SubHub
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Gérez vos approvisionnements sur Plati/G2A/Z2U, calculez vos marges et importez de nouveaux services par IA.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 font-mono">
                Système d'auto-délivrance : ACTIF
              </span>
            </div>
          </div>

          {/* Toast Notification */}
          {notification && (
            <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-xs font-bold text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{notification}</span>
            </div>
          )}

          {/* Cartes KPI Financières & Opérationnelles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Chiffre d'Affaires</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-[11px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Bénéfice net : +{formatPrice(totalProfit)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Marge Brute Moyenne</span>
                <Percent className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-indigo-400 font-mono">
                +{avgMargin}%
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Sur l'ensemble des offres en vente</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Abonnements Actifs</span>
                <Users className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {userSubs.length + 184}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Clients satisfaits sous garantie</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">SAV & Litiges</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                0 En Attente
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Géré à 100% par le bouton 1-clic</p>
            </div>

          </div>
        </div>

        {/* Cœur du système : Extracteur & Décodeur IA */}
        <section>
          <AIProductImporter onProductCreated={handleProductCreated} />
        </section>

        {/* Gestionnaire d'Inventaire Profils & Comptes Netflix Réels */}
        <section>
          <NetflixStockManager />
        </section>

        {/* Intégration Liens de Connexion & Paiements Chariow (Mobile Money) */}
        <section>
          <ChariowManager />
        </section>

        {/* Catalogue des Produits en Vente & Marges Réelles */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              Catalogue en Vente & Rentabilité ({products.length} services)
            </h3>
            <span className="text-xs text-slate-400">
              Synchronisé en temps réel avec la boutique publique
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Fournisseur</th>
                    <th className="p-4">Type d'accès</th>
                    <th className="p-4 text-right">Prix Achat</th>
                    <th className="p-4 text-right">Prix Vente</th>
                    <th className="p-4 text-right">Marge Nette</th>
                    <th className="p-4 text-center">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {products.map((p) => {
                    const profit = p.sellPrice - p.buyPrice;
                    const margin = Math.round((profit / p.buyPrice) * 100);

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2.5">
                          <BrandLogo
                            slug={p.slug}
                            name={p.name}
                            officialDomain={p.officialDomain}
                            logoUrl={p.logoUrl}
                            size="sm"
                          />
                          <span>{p.name}</span>
                          {p.badge && (
                            <span className="rounded bg-indigo-500/20 text-indigo-300 text-[10px] px-1.5 py-0.5">
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {p.sourceUrl ? (
                            <a
                              href={p.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold transition-colors group"
                              title="Ouvrir la page chez le fournisseur pour commander du stock"
                            >
                              <span>{p.sourcePlatform || 'Fournisseur'}</span>
                              <ExternalLink className="h-3 w-3 text-cyan-500/70 group-hover:text-cyan-300" />
                            </a>
                          ) : (
                            <span className="text-slate-400">{p.sourcePlatform || 'Plati.market'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {p.accountType === 'private_account' ? 'Compte Privé' :
                             p.accountType === 'shared_account' ? 'Profil PIN' :
                             p.accountType === 'personal_activation' ? 'Sur Email Client' : 'Clé'}
                          </span>
                        </td>
                        <td className="p-4 text-right font-mono text-slate-400">
                          {formatPrice(p.buyPrice)}
                        </td>
                        <td className="p-4 text-right font-mono text-white font-bold">
                          {formatPrice(p.sellPrice)}
                        </td>
                        <td className="p-4 text-right font-mono text-emerald-400 font-bold">
                          +{formatPrice(profit)} (+{margin}%)
                        </td>
                        <td className="p-4 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.stockCount > 5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                          }`}>
                            {p.stockCount} dispos
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {p.sourceUrl && (
                              <a
                                href={p.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 hover:bg-cyan-900/50 hover:text-white transition-colors"
                                title="Acheter du stock chez le fournisseur"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
                              title="Supprimer du catalogue"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section Notifications & Pilotage Bot Telegram Admin */}
        <TelegramBotManager />

      </main>

      <Footer />

    </div>
  );
}
