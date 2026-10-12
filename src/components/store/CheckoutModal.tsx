'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Wallet, 
  Coins, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Lock,
  Clock
} from 'lucide-react';
import { Product, UserSubscription } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { InventoryService } from '@/lib/inventory-service';
import { NetflixProfileAvatar } from '@/components/ui/NetflixProfileAvatar';
import { NetflixTutorialCarousel } from '@/components/ui/NetflixTutorialCarousel';
import { Copy, Check, Film, HelpCircle, Smartphone, ExternalLink } from 'lucide-react';

interface CheckoutModalProps {
  product: Product | null;
  walletBalance: number;
  onClose: () => void;
  onSuccess: (newSub: UserSubscription, deductedAmount: number) => void;
  onOpenWallet: () => void;
}

export function CheckoutModal({ 
  product, 
  walletBalance, 
  onClose, 
  onSuccess,
  onOpenWallet 
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'chariow' | 'wallet' | 'crypto' | 'card'>('chariow');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<UserSubscription | null>(null);
  const [showNetflixTutorial, setShowNetflixTutorial] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!product) return null;

  const cryptoDiscount = product.sellPrice * 0.05;
  const finalPrice = paymentMethod === 'crypto' 
    ? Math.max(0, product.sellPrice - cryptoDiscount) 
    : product.sellPrice;

  const hasEnoughBalance = walletBalance >= product.sellPrice;

  const handleConfirmPayment = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          sellPrice: finalPrice,
          clientEmail: 'client@subhub.local'
        })
      });

      const allocData = await res.json();
      if (!res.ok || !allocData.success) {
        alert(allocData.error || 'Erreur lors de l\'allocation du compte.');
        setIsProcessing(false);
        return;
      }

      const newSub: UserSubscription = {
        id: `sub-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        iconName: product.iconName,
        officialDomain: product.officialDomain,
        logoUrl: product.logoUrl,
        category: product.category,
        accountType: product.accountType,
        durationLabel: product.duration,
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + product.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        warrantyUntil: new Date(Date.now() + product.warrantyDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        credentials: {
          email: allocData.email,
          password: allocData.password || '',
          profileAssigned: allocData.profileAssigned,
          pinCode: allocData.pinCode,
          slotId: allocData.slotId,
          additionalNotes: allocData.instructions || (allocData.profileAssigned
            ? `Connectez-vous sur ${product.officialDomain || 'le site officiel'}, sélectionnez votre profil assigné "${allocData.profileAssigned}" et déverrouillez avec le code PIN ${allocData.pinCode}. Ne modifiez jamais le mot de passe général.`
            : `Accès délivré automatiquement depuis le pool de stock SubHub. Garantie active jusqu'au ${new Date(Date.now() + product.warrantyDays * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}.`)
        },
        rules: product.rules
      };

      const deducted = paymentMethod === 'wallet' ? product.sellPrice : 0;
      setOrderComplete(newSub);
      onSuccess(newSub, deducted);
    } catch (e) {
      alert('Erreur lors du traitement de la commande');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {orderComplete ? (
          /* Écran de succès immédiat */
          <div className="text-center py-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3 animate-bounce">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-black text-white">Commande Validée avec Succès !</h3>
            <p className="mt-1 text-xs text-slate-400">
              Votre accès à <span className="font-semibold text-white">{product.name}</span> a été provisionné et chiffré dans votre Coffre-fort.
            </p>

            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-left space-y-3">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span>Vos identifiants d'accès</span>
                <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Chiffré AES-256
                </span>
              </div>

              {/* Identifiants adaptés : Netflix vs autres */}
              {orderComplete.productId.includes('netflix') || orderComplete.productName.toLowerCase().includes('netflix') ? (
                <div className="space-y-3">
                  {/* Email Netflix copiable en un clic */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        1. Adresse e-mail du compte Netflix :
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(orderComplete.credentials.email || '');
                          setCopiedEmail(true);
                          setTimeout(() => setCopiedEmail(false), 2000);
                        }}
                        className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                      >
                        {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedEmail ? 'Copié !' : 'Copier l\'e-mail'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-sm font-black text-cyan-300 select-all tracking-wide">
                      {orderComplete.credentials.email}
                    </div>
                  </div>

                  {/* Bouton Tutoriel Carrousel 4 étapes */}
                  <button
                    onClick={() => setShowNetflixTutorial(true)}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-red-950/40 to-slate-900 p-3 text-left hover:border-rose-400 transition-all hover:scale-[1.01] shadow-lg shadow-rose-950/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white font-bold">
                        <Film className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white flex items-center gap-1.5">
                          Tutoriel : Comment se connecter à Netflix
                          <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold uppercase text-white">4 étapes</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Cliquez pour voir les captures d'écran et la marche à suivre
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-400 shrink-0">Ouvrir le guide →</span>
                  </button>

                  {/* Profil et Code PIN sécurisé */}
                  {orderComplete.credentials.profileAssigned && (
                    <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <NetflixProfileAvatar 
                            name={orderComplete.credentials.profileAssigned} 
                            size="sm" 
                            isLocked={true} 
                          />
                          <span className="text-xs font-bold text-white">
                            2. Votre Profil : <strong className="text-rose-400">{orderComplete.credentials.profileAssigned}</strong>
                          </span>
                        </div>
                        {orderComplete.credentials.pinCode && (
                          <div className="flex items-center gap-1 bg-slate-900 border border-red-500/40 px-2.5 py-1 rounded-lg">
                            <span className="text-[10px] text-slate-400 mr-1 font-sans">PIN :</span>
                            <span className="font-mono text-base font-black text-rose-300 tracking-widest">
                              {orderComplete.credentials.pinCode}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        ⚠️ <strong>Important :</strong> Ne confondez pas le <strong>code de connexion Netflix</strong> (demandé à l'étape 2 lors de la saisie de l'email) avec votre <strong>code PIN de profil {orderComplete.credentials.pinCode}</strong> (demandé uniquement à l'étape finale pour ouvrir votre profil).
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Autres produits avec mot de passe standard */
                <>
                  <div className="space-y-1.5 font-mono text-xs text-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Email :</span>
                      <span className="text-cyan-400 font-bold select-all">{orderComplete.credentials.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Mot de passe :</span>
                      <span className="text-amber-400 font-bold select-all">{orderComplete.credentials.password}</span>
                    </div>
                  </div>

                  {orderComplete.credentials.profileAssigned && (
                    <div className="mt-3 pt-3 border-t border-slate-800 rounded-xl bg-slate-900/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">
                          Profil assigné : <strong>{orderComplete.credentials.profileAssigned}</strong>
                        </span>
                        {orderComplete.credentials.pinCode && (
                          <span className="font-mono text-xs text-amber-300 font-bold">
                            PIN: {orderComplete.credentials.pinCode}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <a
                href="/dashboard"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg hover:from-indigo-500 hover:to-violet-500"
              >
                Accéder à mon Tableau de Bord
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-slate-400 hover:text-white"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        ) : (
          /* Formulaire de commande */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <BrandLogo
                slug={product.slug}
                name={product.name}
                officialDomain={product.officialDomain}
                logoUrl={product.logoUrl}
                size="lg"
              />
              <div>
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <p className="text-xs text-slate-400">Durée : {product.duration} • Livraison Instantanée</p>
              </div>
            </div>

            {/* Récapitulatif Garantie */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/30 p-3.5 mb-6 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-indigo-200">Garantie Totale {product.warrantyDays} Jours Incluse : </span>
                <span className="text-slate-300">
                  En cas de déconnexion ou problème, bouton de remplacement automatique en 1 clic disponible 24/7 sur votre dashboard.
                </span>
              </div>
            </div>

            {/* Choix du moyen de paiement */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-semibold text-slate-300">Mode de paiement :</label>

              {/* 1. Mobile Money & Carte Chariow */}
              <div 
                onClick={() => setPaymentMethod('chariow')}
                className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'chariow'
                    ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        Mobile Money & CB (Chariow)
                        <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2">
                          Populaire Afrique
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">Wave, Orange Money, MTN, Moov, Carte bancaire</div>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {formatPrice(product.sellPrice)}
                  </span>
                </div>

                {paymentMethod === 'chariow' && product.paymentLinkChariow && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-300">
                      Lien direct sécurisé Chariow disponible :
                    </span>
                    <a
                      href={product.paymentLinkChariow}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <span>Payer via Chariow</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* 2. Solde Portefeuille */}
              <div 
                onClick={() => setPaymentMethod('wallet')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Solde Portefeuille SubHub</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Disponible : {formatPrice(walletBalance)}
                    </div>
                  </div>
                </div>
                {!hasEnoughBalance ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenWallet();
                    }}
                    className="text-[11px] font-semibold text-indigo-400 hover:underline"
                  >
                    Recharger +
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">Instantané</span>
                )}
              </div>

              {/* 2. Crypto */}
              <div 
                onClick={() => setPaymentMethod('crypto')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'crypto'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Coins className="h-5 w-5 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Crypto-monnaies (USDT, BTC, LTC)
                      <span className="rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2">
                        -5%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">Paiement 100% anonyme sans blocage</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-white">
                  {formatPrice(finalPrice)}
                </span>
              </div>

              {/* 3. Carte Bancaire */}
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Carte Bancaire Sécurisée</div>
                    <div className="text-[11px] text-slate-400">Visa, Mastercard, Google Pay</div>
                  </div>
                </div>
                <span className="text-xs font-bold font-mono text-white">
                  {formatPrice(product.sellPrice)}
                </span>
              </div>
            </div>

            {/* Total & Action */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">Total à régler :</span>
              <span className="text-2xl font-black text-white font-mono">
                {formatPrice(finalPrice)}
              </span>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing || (paymentMethod === 'wallet' && !hasEnoughBalance)}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold shadow-lg transition-all ${
                paymentMethod === 'wallet' && !hasEnoughBalance
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Génération de vos identifiants sécurisés...
                </>
              ) : paymentMethod === 'wallet' && !hasEnoughBalance ? (
                'Solde insuffisant (Rechargez votre compte)'
              ) : (
                <>
                  Valider et recevoir mes identifiants
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* Tutoriel Carrousel Pas à Pas Netflix */}
      {orderComplete && (
        <NetflixTutorialCarousel
          isOpen={showNetflixTutorial}
          onClose={() => setShowNetflixTutorial(false)}
          clientEmail={orderComplete.credentials.email}
          assignedProfile={orderComplete.credentials.profileAssigned}
          pinCode={orderComplete.credentials.pinCode}
        />
      )}

    </div>
  );
}
