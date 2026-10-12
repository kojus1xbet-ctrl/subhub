'use client';

import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Users, 
  UserCheck, 
  KeyRound,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { getBrandTheme } from '@/lib/brand-theme';

interface ProductCardProps {
  product: Product;
  onBuy: (product: Product) => void;
  onOpenDetails?: (product: Product) => void;
}

export function ProductCard({ product, onBuy, onOpenDetails }: ProductCardProps) {
  const theme = getBrandTheme(product.slug || product.name);
  // Badge du type de compte
  const renderAccountTypeBadge = (type: Product['accountType']) => {
    switch (type) {
      case 'private_account':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
            <Lock className="h-3 w-3" /> Compte Privé Dédié
          </span>
        );
      case 'shared_account':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[11px] font-medium text-amber-300">
            <Users className="h-3 w-3" /> Profil 4K PIN Sécurisé
          </span>
        );
      case 'personal_activation':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
            <UserCheck className="h-3 w-3" /> Sur Votre Email Perso
          </span>
        );
      case 'license_key':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 text-[11px] font-medium text-purple-300">
            <KeyRound className="h-3 w-3" /> Clé Officielle
          </span>
        );
    }
  };

  const discountPercent = Math.round(
    ((product.officialPrice - product.sellPrice) / product.officialPrice) * 100
  );

  return (
    <div className={`relative group flex flex-col justify-between rounded-2xl border ${theme.cardBorder} ${theme.cardBg} p-6 transition-all duration-300 ${theme.cardHoverBorder} ${theme.cardHoverShadow} hover:shadow-2xl backdrop-blur-sm`}>
      
      {/* Halo lumineux d'ambiance adapté à la marque (encapsulé pour ne pas déborder tout en laissant respirer les badges flottants) */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 -mr-16 -mt-16 w-40 h-40 rounded-full ${theme.topAmbientGlow} blur-3xl group-hover:scale-150 transition-transform duration-500`} />
      </div>

      {/* Badge promotion / Populaire flottant et parfaitement visible à cheval sur la bordure supérieure */}
      {product.badge && (
        <div className="absolute -top-3.5 left-6 z-20">
          <span className={`inline-flex items-center gap-1.5 rounded-full ${theme.badgeBg} px-3.5 py-1 text-[11px] font-bold shadow-lg shadow-black/50 border border-white/20 tracking-wide uppercase select-none`}>
            {product.badge}
          </span>
        </div>
      )}

      <div className="relative z-10">
        {/* En-tête : Logo Officiel + Badges */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="group-hover:scale-105 transition-transform">
            <BrandLogo
              slug={product.slug}
              name={product.name}
              officialDomain={product.officialDomain}
              logoUrl={product.logoUrl}
              size="xl"
            />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {renderAccountTypeBadge(product.accountType)}
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${theme.accentDot} animate-pulse`} />
              {product.stockCount} en stock
            </span>
          </div>
        </div>

        {/* Titre & Description */}
        <h3 
          onClick={() => onOpenDetails?.(product)}
          className="text-lg font-bold text-white tracking-tight group-hover:text-slate-100 transition-colors cursor-pointer hover:text-indigo-300"
        >
          {product.name}
        </h3>
        <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>

        {/* Liste des fonctionnalités */}
        <div className="mt-4 space-y-2 border-t border-slate-800/80 pt-4">
          {product.features.slice(0, 3).map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className={`h-3.5 w-3.5 ${theme.textAccent} shrink-0 mt-0.5`} />
              <span className="line-clamp-1">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Partie basse : Prix, Garantie et Bouton */}
      <div className="relative z-10 mt-6 border-t border-slate-800/80 pt-4">
        
        {/* Prix & Économie */}
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {formatPrice(product.sellPrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {product.duration}
              </span>
            </div>
            {product.officialPrice > product.sellPrice && (
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="line-through">{formatPrice(product.officialPrice)}</span>
                <span className={`font-semibold ${theme.textAccent}`}>
                  Économisez {discountPercent}%
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/90 px-2.5 py-1 text-[10px] font-medium text-slate-300 border border-slate-800">
              <ShieldCheck className={`h-3 w-3 ${theme.textAccent}`} />
              Garantie {product.warrantyDays}j
            </span>
          </div>
        </div>

        {/* Double bouton d'action : En savoir plus + Commander */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenDetails?.(product)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-600 px-3 py-3 text-xs font-bold text-slate-200 transition-all hover:text-white"
            title="Consulter tous les détails et conditions"
          >
            <Info className="h-3.5 w-3.5 text-indigo-400" />
            En savoir plus
          </button>
          <button
            type="button"
            onClick={() => onBuy(product)}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl ${theme.buttonGradient} ${theme.buttonShadow} px-3 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
          >
            <Zap className="h-3.5 w-3.5" />
            Commander
          </button>
        </div>
      </div>

    </div>
  );
}
