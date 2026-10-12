'use client';

import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Coins, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface WalletModalProps {
  currentBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onRecharge: (amount: number, bonus: number) => void;
}

export function WalletModal({ currentBalance, isOpen, onClose, onRecharge }: WalletModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(10000);
  const [method, setMethod] = useState<'chariow' | 'crypto' | 'card'>('chariow');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Calcul du bonus de rechargement incitatif
  const getBonus = (amt: number) => {
    if (amt >= 25000) return amt * 0.10; // +10% offert
    if (amt >= 10000) return amt * 0.05;  // +5% offert
    return 0;
  };

  const bonus = getBonus(selectedAmount);
  const totalCredited = selectedAmount + bonus;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      onRecharge(selectedAmount, bonus);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setSuccess(false);
            onClose();
          }}
          className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h3 className="text-xl font-black text-white">Solde Rechargé avec Succès !</h3>
            <p className="mt-2 text-xs text-slate-400">
              <span className="font-bold text-emerald-400">+{formatPrice(totalCredited)}</span> ont été crédités sur votre portefeuille SubHub.
            </p>

            <button
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="mt-6 w-full rounded-xl bg-slate-800 py-3 text-xs font-bold text-white hover:bg-slate-700"
            >
              Fermer et retourner au site
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Recharger mon Portefeuille</h3>
                <p className="text-xs text-slate-400">
                  Solde actuel : <span className="font-mono text-emerald-400 font-bold">{formatPrice(currentBalance)}</span>
                </p>
              </div>
            </div>

            {/* Montants prédéfinis */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Choisissez un montant :
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { amt: 5000, label: '5 000 FCFA', badge: null },
                  { amt: 10000, label: '10 000 FCFA', badge: '+5% Offert' },
                  { amt: 25000, label: '25 000 FCFA', badge: '+10% Offert 🔥' },
                ].map((item) => (
                  <button
                    key={item.amt}
                    type="button"
                    onClick={() => setSelectedAmount(item.amt)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                      selectedAmount === item.amt
                        ? 'border-indigo-500 bg-indigo-950/50 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {item.badge && (
                      <span className="absolute -top-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black text-slate-950 shadow">
                        {item.badge}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-slate-300 block">
                Moyen de rechargement :
              </label>

              {/* 1. Mobile Money & CB (Chariow) */}
              <div 
                onClick={() => setMethod('chariow')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  method === 'chariow'
                    ? 'border-emerald-500 bg-emerald-950/40 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-slate-200">Mobile Money (Chariow)</span>
                    <span className="text-[10px] text-slate-400 block">Wave, Orange Money, MTN, Moov</span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Populaire
                </span>
              </div>

              {/* 2. Crypto */}
              <div 
                onClick={() => setMethod('crypto')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  method === 'crypto'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-semibold text-slate-200">Crypto (USDT, BTC, LTC) - Sans Frais</span>
                </div>
              </div>

              {/* 3. Carte Bancaire */}
              <div 
                onClick={() => setMethod('card')}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  method === 'card'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-200">Carte Bancaire / Apple Pay</span>
                </div>
              </div>
            </div>

            {/* Récapitulatif crédit */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Total crédité sur votre compte :</div>
                {bonus > 0 && (
                  <div className="text-[11px] text-emerald-400 font-medium">
                    Dont {formatPrice(bonus)} de bonus offert
                  </div>
                )}
              </div>
              <div className="text-xl font-black text-white font-mono">
                {formatPrice(totalCredited)}
              </div>
            </div>

            {/* Bouton */}
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 active:scale-[0.99] transition-all"
            >
              {isProcessing ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  Crédit en cours...
                </>
              ) : (
                <>
                  Confirmer le rechargement de {formatPrice(selectedAmount)}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
