'use client';

import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Users, 
  UserCheck, 
  KeyRound, 
  Clock, 
  Zap, 
  AlertTriangle, 
  Star, 
  Sparkles, 
  HelpCircle,
  Laptop,
  Globe2,
  ThumbsUp
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getBrandTheme } from '@/lib/brand-theme';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product) => void;
}

export function ProductDetailsModal({
  product,
  onClose,
  onBuy
}: ProductDetailsModalProps) {
  if (!product) return null;

  const theme = getBrandTheme(product.slug || product.name);
  const discountPercent = Math.round(
    ((product.officialPrice - product.sellPrice) / product.officialPrice) * 100
  );
  const moneySaved = Math.max(0, product.officialPrice - product.sellPrice);

  const renderAccountTypeBadge = (type: Product['accountType']) => {
    switch (type) {
      case 'private_account':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 text-xs font-semibold text-emerald-300">
            <Lock className="h-3.5 w-3.5" /> Compte Privé Dédié (Changement de pass autorisé)
          </span>
        );
      case 'shared_account':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-950/70 border border-amber-500/40 px-3 py-1 text-xs font-semibold text-amber-300">
            <Users className="h-3.5 w-3.5" /> Profil 4K avec Code PIN Personnel
          </span>
        );
      case 'personal_activation':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 px-3 py-1 text-xs font-semibold text-cyan-300">
            <UserCheck className="h-3.5 w-3.5" /> Activé sur Votre Adresse Email Perso
          </span>
        );
      case 'license_key':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-950/70 border border-purple-500/40 px-3 py-1 text-xs font-semibold text-purple-300">
            <KeyRound className="h-3.5 w-3.5" /> Clé Officielle Éditeur
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Container de la fenêtre modale */}
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.cardBorder} bg-slate-950 shadow-2xl shadow-black/80 my-auto overflow-hidden`}>
        
        {/* Halo lumineux d'ambiance de la marque */}
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full ${theme.topAmbientGlow} blur-3xl pointer-events-none`} />

        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/90 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
          title="Fermer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
          
          {/* En-tête : Logo, Titre et Statuts */}
          <div>
            <div className="flex items-start gap-4 mb-4">
              <BrandLogo
                slug={product.slug}
                name={product.name}
                officialDomain={product.officialDomain}
                logoUrl={product.logoUrl}
                size="xl"
                className="shadow-xl"
              />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {product.badge && (
                    <span className={`rounded-full ${theme.badgeBg} px-3 py-0.5 text-[11px] font-bold shadow-md uppercase tracking-wider`}>
                      {product.badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {product.rating} / 5
                    <span className="text-slate-500 font-normal">({product.salesCount} ventes vérifiées)</span>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {product.name}
                </h2>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
              {product.description || product.shortDescription}
            </p>
          </div>

          {/* Comparatif de Prix & Économies (Hero Box) */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/90 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                  Tarif Exclusif SubHub PRO
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {formatPrice(product.sellPrice)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    pour {product.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 line-through">
                    Prix éditeur officiel : {formatPrice(product.officialPrice)}
                  </span>
                  <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-xs font-black text-emerald-400">
                    -{discountPercent}% ({formatPrice(moneySaved)} d'économie)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {product.stockCount} accès en stock immédiat
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Garantie échange express {product.warrantyDays} jours
                </span>
              </div>
            </div>
          </div>

          {/* Type d'accès & Caractéristiques techniques */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-400" />
              Modalités & Type d'Accès
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                <div className="text-xs text-slate-400 font-medium mb-1">Type de compte :</div>
                <div>{renderAccountTypeBadge(product.accountType)}</div>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                <div className="text-xs text-slate-400 font-medium mb-1">Délivrance de l'accès :</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Clock className="h-3.5 w-3.5 text-indigo-400" />
                  {product.deliveryType === 'instant_auto' 
                    ? 'Automatique sous 30 secondes (Coffre-Fort)' 
                    : 'Traitement par bot dédié'}
                </span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                <div className="text-xs text-slate-400 font-medium mb-1">Appareils autorisés :</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Laptop className="h-3.5 w-3.5 text-indigo-400" />
                  Jusqu'à {product.rules?.maxDevices || 1} appareil(s) simultané(s)
                </span>
              </div>

              <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5">
                <div className="text-xs text-slate-400 font-medium mb-1">Utilisation réseau / VPN :</div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                  {product.rules?.requiresVpn 
                    ? `VPN Requis (${product.rules.vpnRegion || 'Région spécifique'})` 
                    : 'Aucun VPN requis (Accès direct en France et dans le monde)'}
                </span>
              </div>
            </div>
          </div>

          {/* Fonctionnalités Clés & Ce qui est inclus */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Ce qui est inclus dans votre formule
            </h3>
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 space-y-2.5">
              {product.features?.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className={`h-4 w-4 ${theme.textAccent} shrink-0 mt-0.5`} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions d'activation & Règles d'or */}
          {product.rules && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                Guide d'Activation & Règles de Garantie
              </h3>
              
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                {product.rules.instructions?.length > 0 && (
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1.5">
                      Comment activer votre compte :
                    </span>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400 leading-relaxed">
                      {product.rules.instructions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {product.rules.restrictions?.length > 0 && (
                  <div className="border-t border-slate-800/80 pt-3">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Règles d'or pour préserver votre garantie {product.warrantyDays}j :
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-400 leading-relaxed">
                      {product.rules.restrictions.map((res, i) => (
                        <li key={i}>{res}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avis de clients récents (Rassurance) */}
          <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ThumbsUp className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Derniers avis clients vérifiés
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">Alexandre M.</span>
                  <div className="flex text-amber-400">
                    {'★★★★★'}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  "Livré en 20 secondes dans le coffre-fort. Fonctionne impeccablement sans VPN, super économie !"
                </p>
              </div>
              <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-200">Karim B.</span>
                  <div className="flex text-amber-400">
                    {'★★★★★'}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  "J'avais une hésitation sur le renouvellement, mais le support et la garantie 30j rassurent totalement."
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer d'action persistant */}
        <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 bg-slate-950/95 p-4 sm:p-6 backdrop-blur-md">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-slate-400 font-medium">Prix final :</span>
            <span className="text-2xl font-black text-white font-mono">
              {formatPrice(product.sellPrice)}
            </span>
            <span className="text-xs text-slate-500">/ {product.duration}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onBuy(product);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl ${theme.buttonGradient} ${theme.buttonShadow} px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95`}
            >
              <Zap className="h-4 w-4" />
              Commander l'accès ({formatPrice(product.sellPrice)})
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
