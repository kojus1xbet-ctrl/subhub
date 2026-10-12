'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  Wallet, 
  LayoutDashboard, 
  Store, 
  PlusCircle,
  Clock,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useClientAuth } from '@/lib/client-auth';

interface NavbarProps {
  walletBalance: number;
  activeSubsCount: number;
  onOpenWallet: () => void;
  onOpenAuth?: () => void;
}

export function Navbar({ 
  walletBalance, 
  activeSubsCount, 
  onOpenWallet, 
  onOpenAuth 
}: NavbarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useClientAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isDashboard = pathname === '/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Sub<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Hub</span>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                  AI PRO
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Abonnements IA & Streaming Garantis</p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <Store className="h-4 w-4 text-indigo-400" />
              Boutique
            </a>

            <a
              href="/dashboard"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === '/dashboard' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-850 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-cyan-400" />
              Mon Espace Client
              {isAuthenticated && activeSubsCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white">
                  {activeSubsCount}
                </span>
              )}
            </a>
          </nav>
        </div>

        {/* Right side: Actions, Profil & Auth */}
        <div className="flex items-center gap-3">
          
          {/* Solde Portefeuille : VISIBLE UNIQUEMENT SUR LE DASHBOARD ET SI LE CLIENT EST AUTHENTIFIÉ */}
          {isDashboard && isAuthenticated && (
            <button
              onClick={onOpenWallet}
              className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-left transition-all hover:border-indigo-500/50 hover:bg-slate-850 hover:shadow-md animate-fadeIn"
              title="Cliquez pour recharger votre solde"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-medium text-slate-400">Solde Portefeuille</div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  {formatPrice(walletBalance)}
                </div>
              </div>
              <PlusCircle className="h-3.5 w-3.5 text-slate-400 hover:text-white ml-1" />
            </button>
          )}

          {/* Section Profil Utilisateur si connecté */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-white hover:border-slate-700 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-lg object-cover border border-indigo-500/30"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-300 font-bold uppercase text-[10px] border border-indigo-500/30">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                )}
                <span className="font-semibold max-w-[120px] truncate hidden sm:inline">
                  {user.name || user.email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Menu déroulant profil */}
              {showUserMenu && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900/95 p-2 shadow-xl backdrop-blur-md z-50 animate-fadeIn"
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      Connecté via {user.provider === 'google' ? 'Google' : 'Email'}
                    </span>
                  </div>

                  <a
                    href="/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Mon Espace Client</span>
                  </a>

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Bouton Se Connecter pour les visiteurs */
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all hover:scale-[1.02]"
            >
              <User className="h-3.5 w-3.5" />
              <span>Se connecter</span>
            </button>
          )}

          {/* Lien rapide vers Dashboard si on est sur la page d'accueil */}
          {!isDashboard && (
            <a
              href="/dashboard"
              className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:border-slate-700 hover:text-white transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>Mes Abonnements</span>
            </a>
          )}

        </div>

      </div>
    </header>
  );
}
