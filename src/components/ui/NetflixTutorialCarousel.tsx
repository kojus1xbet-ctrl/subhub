'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Film, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Lock, 
  ShieldCheck,
  Video
} from 'lucide-react';

interface NetflixTutorialCarouselProps {
  isOpen: boolean;
  onClose: () => void;
  clientEmail?: string;
  assignedProfile?: string;
  pinCode?: string;
}

export function NetflixTutorialCarousel({
  isOpen,
  onClose,
  clientEmail = 'kojs1xbet@gmail.com',
  assignedProfile = 'DUB',
  pinCode = '0297'
}: NetflixTutorialCarouselProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState<'carousel' | 'video'>('carousel');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  if (!isOpen) return null;

  const copyEmail = () => {
    navigator.clipboard.writeText(clientEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pinCode);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const steps = [
    {
      number: 1,
      title: "Ouvrir Netflix & Cliquer sur « S'identifier »",
      subtitle: "Ne cherchez pas à créer de compte, cliquez directement sur le bouton de connexion.",
      image: "/tutorials/netflix/step1-identify.png",
      badge: "Étape 1 sur 4",
      highlight: "Bouton en haut à droite",
      instructions: [
        "Ouvrez l'application Netflix sur votre appareil (TV, Smartphone, Tablette ou netflix.com sur PC).",
        "Cliquez sur le bouton « S'identifier » situé en haut à droite de l'écran d'accueil.",
        "N'entrez pas dans « Créer un compte », le compte Premium 4K UHD est déjà prêt et actif !"
      ],
      warning: "Ne tentez pas de souscrire ou de changer d'offre."
    },
    {
      number: 2,
      title: "Saisir l'e-mail & Demander le code de connexion",
      subtitle: "Netflix demande un code temporaire à 4 chiffres envoyé par e-mail.",
      image: "/tutorials/netflix/step2-enter-code.png",
      badge: "Étape 2 sur 4 • Très Important ⚠️",
      highlight: "Code temporaire (4 chiffres)",
      instructions: [
        `Collez l'adresse e-mail fournie : ${clientEmail} (copiable en un clic ci-dessous).`,
        "Netflix affiche : « Saisissez le code envoyé à votre adresse e-mail » avec 4 cases.",
        "Retournez sur SubHub ou votre bot Telegram et cliquez sur « Demander le code de connexion » pour recevoir ces 4 chiffres.",
        "Saisissez immédiatement ce code temporaire pour vous connecter au compte."
      ],
      warning: "⚠️ ATTENTION : Ne confondez PAS ce code temporaire de connexion avec votre code PIN de profil ! Ce code sert uniquement à ouvrir le compte Netflix."
    },
    {
      number: 3,
      title: "Sélectionner STRICTEMENT votre profil assigné",
      subtitle: `Cliquez uniquement sur votre profil « ${assignedProfile} ». Tous les profils sont protégés.`,
      image: "/tutorials/netflix/step3-select-profile.png",
      badge: "Étape 3 sur 4",
      highlight: `Profil attribué : ${assignedProfile}`,
      instructions: [
        "Une fois le code validé, Netflix affiche l'écran de sélection des profils.",
        `Repérez et cliquez EXCLUSIVEMENT sur votre profil personnel : « ${assignedProfile} ».`,
        "Chaque profil possède son propre historique, ses favoris et ses recommandations isolées."
      ],
      warning: `⛔ RÈGLE STRICTE : Ne cliquez JAMAIS sur le profil administrateur LORD FLIX ni sur les profils des autres clients.`
    },
    {
      number: 4,
      title: "Déverrouiller avec votre Code PIN personnel",
      subtitle: `Saisissez votre code PIN à 4 chiffres (${pinCode}) pour ouvrir votre session privée.`,
      image: "/tutorials/netflix/step4-enter-pin.png",
      badge: "Étape 4 sur 4 • Accès Débloqué 🎉",
      highlight: `Code PIN personnel : ${pinCode}`,
      instructions: [
        "Netflix vous demande : « Entrez votre code PIN pour accéder à ce profil ».",
        `Tapez votre code PIN personnel à 4 chiffres : ${pinCode}.`,
        "Votre session privée s'ouvre instantanément en qualité 4K Ultra HD !",
        "Vous restez connecté sur cet appareil, vous n'aurez plus besoin de recommencer."
      ],
      warning: "Conservez précieusement ce code PIN dans votre coffre-fort SubHub."
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-rose-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* En-tête modal */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black border border-rose-900/60 shadow-md shadow-[#E50914]/20">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M13.887 0v9.172l4.715 13.33V0h-4.715z" fill="#E50914" />
                <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398z" fill="#B81D24" />
                <path d="M5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398v-9.22L5.398 1.5z" fill="#E50914" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                Guide de Connexion Netflix Pas à Pas
                <span className="hidden sm:inline-block rounded-full bg-rose-950 border border-rose-500/30 px-2 py-0.5 text-[10px] text-rose-300 font-semibold">
                  Tutoriel Officiel
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Suivez ces 4 étapes simples pour vous connecter sans confusion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Carrousel / Vidéo */}
            <div className="flex rounded-lg bg-slate-850 p-0.5 border border-slate-750 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('carousel')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'carousel' 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="h-3.5 w-3.5" />
                <span>Images (4 étapes)</span>
              </button>
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeTab === 'video' 
                    ? 'bg-rose-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                <span>Vidéo</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Barre d'accès rapide (Email & PIN copiables en 1 clic) */}
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Email compte :</span>
            <span className="font-mono font-bold text-cyan-300 select-all">{clientEmail}</span>
            <button
              onClick={copyEmail}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white font-medium border border-slate-700"
              title="Copier l'email"
            >
              {copiedEmail ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedEmail ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Profil assigné :</span>
            <span className="font-bold text-rose-400">{assignedProfile}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Code PIN :</span>
            <span className="font-mono font-black text-rose-300 bg-rose-950/60 border border-rose-500/30 px-1.5 py-0.5 rounded">
              {pinCode}
            </span>
            <button
              onClick={copyPin}
              className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white font-medium border border-slate-700"
              title="Copier le code PIN"
            >
              {copiedPin ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedPin ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {activeTab === 'video' ? (
          /* Mode Lecteur Vidéo (Emplacement vidéo prêt pour intégration future) */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center bg-slate-950/40">
            <div className="w-full max-w-xl aspect-video rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/80 flex flex-col items-center justify-center p-6 text-slate-400">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 mb-4 animate-pulse">
                <Play className="h-8 w-8 ml-1" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Vidéo Démonstrative en cours de production
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                L'enregistrement vidéo complet sera intégré directement ici. En attendant, consultez le guide en 4 étapes illustrées ci-dessous !
              </p>
              <button
                onClick={() => setActiveTab('carousel')}
                className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-rose-500 hover:to-red-500 transition-all"
              >
                <Film className="h-3.5 w-3.5" />
                <span>Voir les 4 étapes illustrées</span>
              </button>
            </div>
          </div>
        ) : (
          /* Mode Carrousel Interactif */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col">
            
            {/* Barre d'étapes (Steppers) */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {steps.map((s, idx) => (
                <button
                  key={s.number}
                  onClick={() => setCurrentStep(idx)}
                  className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                    currentStep === idx
                      ? 'border-rose-500 bg-rose-950/40 text-white shadow-md'
                      : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-850 hover:text-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider ${currentStep === idx ? 'text-rose-400' : 'text-slate-500'}`}>
                    Étape {s.number}
                  </span>
                  <span className="text-xs font-bold truncate w-full mt-0.5">
                    {s.number === 1 ? "S'identifier" : s.number === 2 ? "Code E-mail" : s.number === 3 ? "Profil" : "Code PIN"}
                  </span>
                </button>
              ))}
            </div>

            {/* Carte Diapositive Actuelle */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center flex-1">
              
              {/* Colonne Image / Capture Réelle */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative rounded-2xl border border-slate-750 bg-black/90 p-2 shadow-2xl overflow-hidden max-h-[380px] flex items-center justify-center group">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="max-h-[360px] w-auto object-contain rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {/* Badge flottant sur l'image */}
                  <div className="absolute top-4 left-4 rounded-full bg-black/80 border border-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                    {current.highlight}
                  </div>
                </div>
              </div>

              {/* Colonne Explications Détaillées */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-4">
                
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/80 border border-rose-500/40 px-3 py-1 text-[11px] font-bold text-rose-300 mb-2">
                    <span>{current.badge}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {current.title}
                  </h3>
                  
                  <p className="mt-1 text-xs text-slate-400">
                    {current.subtitle}
                  </p>

                  {/* Liste d'instructions */}
                  <div className="mt-4 space-y-2.5 rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                    {current.instructions.map((ins, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                        <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ins}</span>
                      </div>
                    ))}
                  </div>

                  {/* Alerte / Règle importante */}
                  {current.warning && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 p-3 text-[11px] text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{current.warning}</span>
                    </div>
                  )}
                </div>

                {/* Bouton d'action selon l'étape */}
                {currentStep === 1 && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Besoin du code temporaire maintenant ?</div>
                      <div className="text-[10px] text-slate-400">Cliquez pour ouvrir l'assistant et recevoir vos 4 chiffres</div>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
                    >
                      Demander le code
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* Pied de page navigation Carrousel */}
        <div className="border-t border-slate-800 bg-slate-950/90 px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 hover:border-slate-700 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>

          {/* Indicateurs à points */}
          <div className="flex items-center gap-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentStep === idx ? 'w-6 bg-rose-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Aller à l'étape ${idx + 1}`}
              />
            ))}
          </div>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>J'ai compris, me connecter !</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-rose-500 hover:to-red-500 transition-all"
            >
              <span>Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
