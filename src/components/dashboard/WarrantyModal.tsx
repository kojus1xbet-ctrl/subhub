'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { UserSubscription } from '@/lib/types';

interface WarrantyModalProps {
  subscription: UserSubscription | null;
  onClose: () => void;
  onReplaced: (updatedSub: UserSubscription) => void;
}

export function WarrantyModal({ subscription, onClose, onReplaced }: WarrantyModalProps) {
  const [issueType, setIssueType] = useState<
    'invalid_credentials' | 'account_downgraded' | 'account_banned' | 'other'
  >('invalid_credentials');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!subscription) return null;

  const handleClaimReplacement = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Génération automatique d'un nouveau compte de réserve
      const updatedSub: UserSubscription = {
        ...subscription,
        credentials: {
          ...subscription.credentials,
          email: `replaced-${Math.floor(100 + Math.random() * 900)}-${subscription.credentials.email?.split('@')[0] || 'user'}@subhub-safe.com`,
          password: `NewSafe#${Math.floor(100000 + Math.random() * 900000)}!`,
          pinCode: subscription.credentials.pinCode ? `${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          additionalNotes: `Compte réassigné automatiquement via la Garantie Remplacement le ${new Date().toLocaleDateString('fr-FR')}.`
        }
      };

      setIsProcessing(false);
      setSuccess(true);
      onReplaced(updatedSub);
    }, 1500);
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

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 animate-bounce">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <h3 className="text-xl font-black text-white">Nouveaux Identifiants Livrés !</h3>
            <p className="mt-2 text-xs text-slate-400">
              Votre garantie a fonctionné avec succès. Vos nouveaux accès pour <span className="text-white font-semibold">{subscription.productName}</span> sont disponibles instantanément dans votre Coffre-fort.
            </p>

            <div className="mt-6">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                Ouvrir mon Coffre-fort avec les nouveaux accès
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Garantie & Remplacement 1 Clic</h3>
                <p className="text-xs text-slate-400">Service : {subscription.productName}</p>
              </div>
            </div>

            {/* Badge de statut garantie */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-emerald-300">Votre garantie est 100% active</div>
                  <div className="text-[11px] text-slate-400">
                    Valable jusqu'au {new Date(subscription.warrantyUntil).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
              <span className="rounded bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                Éligible
              </span>
            </div>

            {/* Formulaire de signalement */}
            <div className="space-y-4 mb-6">
              <label className="text-xs font-semibold text-slate-300">
                Quel est le problème rencontré ?
              </label>

              <div className="space-y-2">
                {[
                  { id: 'invalid_credentials', label: 'Mot de passe ou email invalide', desc: 'Le service indique identifiants incorrects' },
                  { id: 'account_downgraded', label: 'Compte repassé en version gratuite', desc: 'Plus d\'accès aux fonctionnalités Pro / Ultra HD' },
                  { id: 'account_banned', label: 'Session bloquée ou erreur de connexion', desc: 'Message d\'erreur du service' },
                  { id: 'other', label: 'Autre question technique', desc: 'Besoin d\'un nouveau compte' },
                ].map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setIssueType(opt.id as any)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      issueType === opt.id
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                      issueType === opt.id ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                    }`}>
                      {issueType === opt.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{opt.label}</div>
                      <div className="text-[11px] text-slate-400">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton de remplacement */}
            <button
              onClick={handleClaimReplacement}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 active:scale-[0.99] transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Génération et réattribution d'un nouveau compte...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Remplacer et obtenir un nouveau compte en 1 Clic
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
