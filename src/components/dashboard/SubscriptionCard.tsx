'use client';

import React from 'react';
import { 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { UserSubscription } from '@/lib/types';
import { calculateDaysRemaining } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getBrandTheme } from '@/lib/brand-theme';

interface SubscriptionCardProps {
  subscription: UserSubscription;
  onOpenVault: (sub: UserSubscription) => void;
  onOpenWarranty: (sub: UserSubscription) => void;
  onRenew: (sub: UserSubscription) => void;
}

export function SubscriptionCard({ 
  subscription, 
  onOpenVault, 
  onOpenWarranty, 
  onRenew 
}: SubscriptionCardProps) {
  const { days, hours, isExpired, percentage } = calculateDaysRemaining(subscription.expiryDate);
  const theme = getBrandTheme(subscription.productId || subscription.productName);

  const isExpiringSoon = days <= 3 && !isExpired;

  return (
    <div className={`relative group flex flex-col justify-between rounded-2xl border ${theme.cardBg} ${
      isExpiringSoon
        ? 'border-amber-500/50 shadow-amber-500/10'
        : isExpired
        ? 'border-rose-500/50 opacity-85'
        : `${theme.cardBorder} ${theme.cardHoverBorder} ${theme.cardHoverShadow}`
    } p-6 transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-sm`}>
      
      {/* Halo lumineux d'ambiance adapté */}
      <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-36 h-36 rounded-full ${theme.topAmbientGlow} blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />
      
      <div>
        {/* Header : Logo Officiel + Statut */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <BrandLogo
            slug={subscription.productId}
            name={subscription.productName}
            officialDomain={subscription.officialDomain}
            logoUrl={subscription.logoUrl}
            size="xl"
          />

          <div className="flex flex-col items-end gap-1">
            {isExpired ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-950/80 border border-rose-500/30 px-2 py-0.5 text-[11px] font-bold text-rose-300">
                <AlertTriangle className="h-3 w-3" /> Expiré
              </span>
            ) : isExpiringSoon ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 text-[11px] font-bold text-amber-300 animate-pulse">
                <Clock className="h-3 w-3" /> Expire bientôt ({days}j restants)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Actif
              </span>
            )}
            
            <span className="text-[10px] text-slate-400 font-mono">
              Garantie jusqu'au {new Date(subscription.warrantyUntil).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Titre & Formule */}
        <h4 className="text-lg font-bold text-white tracking-tight">
          {subscription.productName}
        </h4>
        <div className="flex items-center flex-wrap gap-2 mt-1 text-xs text-slate-400">
          <span>Formule : {subscription.durationLabel}</span>
          <span>•</span>
          <span className="text-indigo-400 font-medium">
            {subscription.accountType === 'private_account' ? 'Compte Privé' : 'Profil Dédié'}
          </span>
          {subscription.credentials.profileAssigned && (
            <>
              <span>•</span>
              <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                <Lock className="h-2.5 w-2.5" />
                {subscription.credentials.profileAssigned}
              </span>
            </>
          )}
        </div>

        {/* Jauge Compte à rebours dynamique */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              Temps restant :
            </span>
            <span className="text-sm font-black font-mono text-white">
              {isExpired ? (
                <span className="text-rose-400">0 jour</span>
              ) : (
                <span className="text-cyan-300">{days} jours {hours}h</span>
              )}
            </span>
          </div>

          {/* Barre de progression */}
          <div className="h-2 w-full rounded-full bg-slate-800/80 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isExpiringSoon
                  ? 'bg-amber-400'
                  : isExpired
                  ? 'bg-rose-500'
                  : theme.progressBar
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 mt-6 space-y-2 border-t border-slate-800/80 pt-4">
        
        {/* Bouton Voir Identifiants */}
        <button
          onClick={() => onOpenVault(subscription)}
          className={`w-full flex items-center justify-center gap-2 rounded-xl ${theme.buttonGradient} ${theme.buttonShadow} px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98]`}
        >
          <Lock className="h-3.5 w-3.5" />
          Accéder aux identifiants (Coffre-fort)
        </button>

        {/* Boutons secondaires : Renouveler & Garantie */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onRenew(subscription)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-2.5 py-2 text-[11px] font-semibold text-slate-200 hover:bg-slate-750 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3 w-3 text-cyan-400" />
            Prolonger (+30j)
          </button>

          <button
            onClick={() => onOpenWarranty(subscription)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 px-2.5 py-2 text-[11px] font-semibold text-rose-300 hover:bg-rose-900/40 transition-colors"
          >
            <ShieldCheck className="h-3 w-3 text-rose-400" />
            Garantie en 1 Clic
          </button>
        </div>

      </div>

    </div>
  );
}
