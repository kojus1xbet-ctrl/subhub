'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Tv, 
  Bot, 
  Copy, 
  Check, 
  Lock, 
  ExternalLink, 
  ArrowRight, 
  ShieldCheck, 
  Film, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NetflixTutorialCarousel } from '@/components/ui/NetflixTutorialCarousel';
import { NetflixProfileAvatar } from '@/components/ui/NetflixProfileAvatar';
import { UserSubscription } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function ServiceConnectPage() {
  const params = useParams();
  const service = (params.service as string)?.toLowerCase() || 'netflix';
  const isNetflix = service.includes('netflix');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [provisioned, setProvisioned] = useState<UserSubscription | null>(null);

  const defaultNetflixEmail = 'kojs1xbet@gmail.com';
  const defaultNetflixProfile = 'DUB';
  const defaultNetflixPin = '0297';

  useEffect(() => {
    // Provisionner automatiquement l'accès dans le localStorage du client
    try {
      const savedSubs = localStorage.getItem('subhub_subs');
      const parsedSubs: UserSubscription[] = savedSubs ? JSON.parse(savedSubs) : [];

      if (isNetflix) {
        const netflixSub: UserSubscription = {
          id: `sub-chariow-netflix-${Date.now()}`,
          productId: 'prod-netflix-4k',
          productName: 'Netflix Premium Ultra HD (4K + HDR)',
          iconName: 'Tv',
          officialDomain: 'netflix.com',
          category: 'streaming',
          accountType: 'shared_account',
          durationLabel: '1 mois',
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          warrantyUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credentials: {
            email: defaultNetflixEmail,
            profileAssigned: defaultNetflixProfile,
            pinCode: defaultNetflixPin,
            additionalNotes: 'Payé via Chariow (2 500 FCFA). Connexion par code sans mot de passe.'
          },
          rules: {
            canChangePassword: false,
            requiresVpn: false,
            maxDevices: 1,
            instructions: [
              'Ouvrez Netflix et cliquez sur S\'identifier.',
              'Entrez l\'email fourni et demandez votre code temporaire à 4 chiffres.',
              `Sélectionnez exclusivement votre profil assigné ${defaultNetflixProfile} et entrez le code PIN ${defaultNetflixPin}.`
            ],
            restrictions: ['Ne modifiez jamais le mot de passe général du compte.']
          }
        };

        setProvisioned(netflixSub);
        if (!parsedSubs.some((s) => s.productId === 'prod-netflix-4k')) {
          localStorage.setItem('subhub_subs', JSON.stringify([netflixSub, ...parsedSubs]));
        }
      } else {
        // ChatGPT
        const gptSub: UserSubscription = {
          id: `sub-chariow-gpt-${Date.now()}`,
          productId: 'prod-gpt-pro',
          productName: 'ChatGPT Pro / Plus (OpenAI)',
          iconName: 'Bot',
          officialDomain: 'openai.com',
          category: 'ia',
          accountType: 'private_account',
          durationLabel: '1 mois',
          startDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          warrantyUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          credentials: {
            email: 'subhub.client.gpt@gmail.com',
            password: 'OpenAI#Client2026!Secure',
            additionalNotes: 'Payé via Chariow (2 625 FCFA). Accès illimité GPT-4o, modèles o1.'
          },
          rules: {
            canChangePassword: true,
            requiresVpn: false,
            maxDevices: 2,
            instructions: ['Connectez-vous sur chat.openai.com avec vos identifiants.'],
            restrictions: ['Conservez vos accès privés.']
          }
        };

        setProvisioned(gptSub);
        if (!parsedSubs.some((s) => s.productId === 'prod-gpt-pro')) {
          localStorage.setItem('subhub_subs', JSON.stringify([gptSub, ...parsedSubs]));
        }
      }
    } catch (e) {
      console.warn('Erreur localStorage', e);
    }
  }, [isNetflix]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      <Navbar
        walletBalance={0}
        activeSubsCount={1}
        onOpenWallet={() => {}}
      />

      <main className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 py-10 w-full space-y-8 animate-fadeIn">
        
        {/* En-tête Succès de Paiement Chariow */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 animate-bounce">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 mb-2">
            <span>Paiement Chariow Validé avec Succès</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Vos Identifiants d'Accès Officiels
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            {isNetflix 
              ? 'Votre accès Netflix Premium 4K UHD (2 500 FCFA) est provisionné et garanti 30 jours.' 
              : 'Votre accès ChatGPT Pro / Plus (2 625 FCFA) est prêt avec modèles o1 et GPT-4o.'}
          </p>
        </div>

        {/* Bloc Identifiants */}
        {isNetflix ? (
          <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black border border-rose-900/60 shadow-md">
                  <Tv className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Netflix Premium 4K UHD</h3>
                  <p className="text-xs text-slate-400">Montant réglé : <span className="font-bold text-rose-400 font-mono">2 500 FCFA</span></p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                ⚡ Prêt à l'emploi
              </span>
            </div>

            {/* Email de connexion */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Adresse e-mail du compte Netflix :
                </span>
                <button
                  onClick={() => copyToClipboard(defaultNetflixEmail, 'email')}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                >
                  {copiedKey === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'email' ? 'Copié !' : 'Copier l\'e-mail'}</span>
                </button>
              </div>
              <div className="font-mono text-base font-black text-cyan-300 select-all tracking-wide">
                {defaultNetflixEmail}
              </div>
            </div>

            {/* Bouton Carrousel Tutoriel */}
            <button
              onClick={() => setShowTutorial(true)}
              className="w-full flex items-center justify-between gap-3 rounded-xl border border-rose-500/50 bg-gradient-to-r from-rose-950/80 via-red-950/50 to-slate-900 p-3.5 text-left hover:border-rose-400 transition-all hover:scale-[1.01] shadow-lg shadow-rose-950/40"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-bold shrink-0">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                    Comment se connecter sans mot de passe ?
                    <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[9px] font-bold uppercase text-white">4 étapes</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Cliquez ici pour voir les 4 captures d'écran et la marche à suivre
                  </div>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 shrink-0">Ouvrir le guide →</span>
            </button>

            {/* Profil et PIN */}
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <NetflixProfileAvatar 
                    name={defaultNetflixProfile} 
                    size="md" 
                    isLocked={true} 
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">2. Votre Profil Assigné :</span>
                    <div className="text-sm font-black text-white">
                      Profil : <strong className="text-rose-400">{defaultNetflixProfile}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900 border border-red-500/40 px-3 py-1.5 rounded-xl">
                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 block font-sans">CODE PIN</span>
                    <span className="font-mono text-base font-black text-rose-300 tracking-widest">
                      {defaultNetflixPin}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(defaultNetflixPin, 'pin')}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                    title="Copier le PIN"
                  >
                    {copiedKey === 'pin' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                ⚠️ <strong>Rappel capital :</strong> Le <strong>code de connexion</strong> (demandé à l'étape 2 sur Netflix) vous est envoyé en direct. Le <strong>code PIN {defaultNetflixPin}</strong> sert quant à lui uniquement à déverrouiller votre profil à l'étape 4. Ne les confondez pas !
              </p>
            </div>

          </div>
        ) : (
          /* Bloc ChatGPT */
          <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-5 sm:p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10A37F] text-white shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">ChatGPT Pro / Plus (OpenAI)</h3>
                  <p className="text-xs text-slate-400">Montant réglé : <span className="font-bold text-emerald-400 font-mono">2 625 FCFA</span></p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
                ⚡ Prêt à l'emploi
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-slate-400">Email OpenAI :</span>
                <span className="text-cyan-300 font-bold select-all">subhub.client.gpt@gmail.com</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                <span className="text-slate-400">Mot de passe :</span>
                <span className="text-amber-300 font-bold select-all">OpenAI#Client2026!Secure</span>
              </div>
            </div>

            <a
              href="https://chat.openai.com"
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <span>Se connecter sur chat.openai.com</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        {/* Liens Espace Client & Telegram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <a
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all"
          >
            <span>Accéder à mon Espace Client</span>
            <ArrowRight className="h-4 w-4" />
          </a>

          <a
            href="https://t.me/mon_subhub_bot"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
          >
            <span>Assistance Telegram @mon_subhub_bot</span>
            <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
          </a>
        </div>

      </main>

      <Footer />

      {/* Tutoriel Carrousel 4 étapes */}
      {isNetflix && (
        <NetflixTutorialCarousel
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          clientEmail={defaultNetflixEmail}
          assignedProfile={defaultNetflixProfile}
          pinCode={defaultNetflixPin}
        />
      )}

    </div>
  );
}
