'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Lock,
  Info
} from 'lucide-react';
import { UserSubscription } from '@/lib/types';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { NetflixProfileAvatar } from '@/components/ui/NetflixProfileAvatar';
import { NetflixTutorialCarousel } from '@/components/ui/NetflixTutorialCarousel';
import { LiveOtpRequester } from './LiveOtpRequester';
import { Film } from 'lucide-react';

interface SecretVaultModalProps {
  subscription: UserSubscription | null;
  onClose: () => void;
}

export function SecretVaultModal({ subscription, onClose }: SecretVaultModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  if (!subscription) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isNetflix = subscription.productId.includes('netflix') || subscription.productName.toLowerCase().includes('netflix');

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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BrandLogo
            slug={subscription.productId}
            name={subscription.productName}
            officialDomain={subscription.officialDomain}
            logoUrl={subscription.logoUrl}
            size="lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{subscription.productName}</h3>
              <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Chiffré AES-256
              </span>
            </div>
            <p className="text-xs text-slate-400">Coffre-fort d'identifiants sécurisé SubHub</p>
          </div>
        </div>

        {/* Identifiants */}
        <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4 mb-5">
          
          {/* Email / Identifiant */}
          {subscription.credentials.email && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Email / Identifiant de connexion :</div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                <span className="font-mono text-xs text-cyan-300 select-all truncate mr-2 font-bold">
                  {subscription.credentials.email}
                </span>
                <button
                  onClick={() => copyToClipboard(subscription.credentials.email!, 'email')}
                  className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white font-medium"
                >
                  {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedField === 'email' ? 'Copié !' : 'Copier l\'e-mail'}
                </button>
              </div>
            </div>
          )}

          {/* Si Netflix : Pas de mot de passe, mais instruction claire de connexion par code */}
          {isNetflix ? (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> Méthode d'accès Netflix :
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                  ⚡ Sans mot de passe
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sur Netflix, saisissez l'email <strong>{subscription.credentials.email}</strong> puis sélectionnez <strong>« Se connecter par code à usage unique »</strong> (ou « Recevoir un code par e-mail »).
              </p>
              <p className="text-[11px] text-slate-400">
                Aucun mot de passe n'est requis. Demandez ou récupérez votre code de connexion temporaire ci-dessous.
              </p>

              {/* Bouton vers le guide pas-à-pas illustré */}
              <button
                type="button"
                onClick={() => setShowTutorial(true)}
                className="mt-2 w-full flex items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/70 via-red-950/40 to-slate-900 p-2.5 text-left hover:border-rose-400 hover:scale-[1.01] transition-all shadow-md"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white font-bold shrink-0">
                    <Film className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      Tutoriel : Comment se connecter à Netflix
                      <span className="rounded bg-rose-600 px-1 py-0.2 text-[9px] font-bold uppercase text-white">4 étapes</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Voir les 4 captures d'écran pour éviter toute confusion
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-rose-400 shrink-0">Ouvrir →</span>
              </button>
            </div>
          ) : (
            /* Autres abonnements : Mot de passe normal */
            subscription.credentials.password && (
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1">Mot de passe :</div>
                <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                  <span className="font-mono text-xs text-amber-300 select-all truncate mr-2">
                    {showPassword ? subscription.credentials.password : '••••••••••••••••'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-slate-400 hover:text-white"
                      title={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(subscription.credentials.password!, 'password')}
                      className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                      {copiedField === 'password' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {copiedField === 'password' ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Profil assigné & Code PIN Sécurisé (Compte Partagé / Netflix) */}
          {subscription.credentials.profileAssigned && (
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Votre Profil Sécurisé :
                </span>
                <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> PIN Verrouillé
                </span>
              </div>

              {/* Carte Profil Netflix */}
              <div className="rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <NetflixProfileAvatar 
                    name={subscription.credentials.profileAssigned} 
                    size="md" 
                    isLocked={true} 
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-white">
                        {subscription.credentials.profileAssigned}
                      </span>
                      <button
                        onClick={() => copyToClipboard(subscription.credentials.profileAssigned!, 'profile')}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5"
                        title="Copier le nom du profil"
                      >
                        {copiedField === 'profile' ? <Check className="h-2.5 w-2.5 text-emerald-400" /> : <Copy className="h-2.5 w-2.5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Profil individuel avec historique personnel
                    </p>
                  </div>
                </div>

                {/* Code PIN 4 chiffres */}
                {subscription.credentials.pinCode && (
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2">
                    <div className="text-right mr-1">
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Code PIN</div>
                      <div className="text-[10px] text-rose-400 font-semibold">4 Chiffres</div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {subscription.credentials.pinCode.split('').map((digit, i) => (
                        <span 
                          key={i} 
                          className="w-7 h-8 flex items-center justify-center rounded-lg bg-red-950/60 border border-red-500/40 font-mono text-base font-black text-white shadow-inner"
                        >
                          {digit}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => copyToClipboard(subscription.credentials.pinCode!, 'pin')}
                      className="ml-1 rounded-lg bg-red-600/20 border border-red-500/30 p-1.5 text-red-300 hover:bg-red-600 hover:text-white transition-colors"
                      title="Copier le code PIN"
                    >
                      {copiedField === 'pin' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Règle stricte profil */}
              <div className="rounded-lg bg-red-950/30 border border-red-500/20 p-2.5 text-[11px] text-red-200 flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Consigne d'accès :</strong> Cliquez uniquement sur le profil <strong>{subscription.credentials.profileAssigned}</strong> et saisissez le PIN <strong>{subscription.credentials.pinCode}</strong>. Ne tentez jamais d'ouvrir le profil administrateur <strong>LORD FLIX</strong> ni de modifier les paramètres du compte.
                </span>
              </div>
            </div>
          )}

          {/* Lien d'invitation direct si applicable */}
          {subscription.credentials.inviteLink && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 mb-1">Lien d'invitation officiel :</div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                <span className="font-mono text-xs text-indigo-300 truncate mr-2">
                  {subscription.credentials.inviteLink}
                </span>
                <button
                  onClick={() => copyToClipboard(subscription.credentials.inviteLink!, 'invite')}
                  className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                  {copiedField === 'invite' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedField === 'invite' ? 'Copié' : 'Copier'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Module de Demande de Code de Connexion en Direct (OTP / Netflix Foyer) */}
        <div className="mb-5">
          <LiveOtpRequester subscription={subscription} />
        </div>

        {/* Consignes & Règles à respecter */}
        <div className="space-y-3 mb-6">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
              <Info className="h-4 w-4" /> Instructions d'activation recommandées
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {subscription.rules.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {subscription.rules.restrictions.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-950/20 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1.5">
                <AlertTriangle className="h-4 w-4" /> Règles de préservation de garantie
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {subscription.rules.restrictions.map((res, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
        >
          Fermer le coffre-fort
        </button>

      </div>

      {/* Tutoriel Carrousel Pas à Pas Netflix */}
      {isNetflix && (
        <NetflixTutorialCarousel
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          clientEmail={subscription.credentials.email}
          assignedProfile={subscription.credentials.profileAssigned}
          pinCode={subscription.credentials.pinCode}
        />
      )}

    </div>
  );
}
