'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  KeyRound, 
  Send, 
  Check, 
  Copy, 
  Clock, 
  AlertCircle, 
  AlertTriangle,
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { UserSubscription } from '@/lib/types';
import { OtpRequest } from '@/lib/otp-service';

interface LiveOtpRequesterProps {
  subscription: UserSubscription;
}

export function LiveOtpRequester({ subscription }: LiveOtpRequesterProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'waiting' | 'delivered' | 'rejected'>('idle');
  const [activeRequest, setActiveRequest] = useState<OtpRequest | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier au montage s'il y a déjà une demande active pour cet abonnement
  useEffect(() => {
    checkExistingRequest();
    return () => {
      stopPolling();
    };
  }, [subscription.id]);

  const checkExistingRequest = async () => {
    try {
      const res = await fetch(`/api/otp?subscriptionId=${subscription.id}`);
      const data = await res.json();

      // 1. Si une demande enregistrée existe
      if (data.request) {
        setActiveRequest(data.request);
        if (data.request.status === 'delivered') {
          setStatus('delivered');
          return;
        } else if (data.request.status === 'rejected') {
          setStatus('rejected');
          return;
        } else if (data.request.status === 'pending') {
          setStatus('waiting');
          startPolling();
          return;
        }
      }

      // 2. Si un code a été pré-enregistré par l'administrateur en avance
      if (data.preloaded && data.preloaded.code) {
        setActiveRequest({
          id: 'preloaded',
          subscriptionId: subscription.id,
          productName: subscription.productName,
          masterEmail: subscription.credentials.email || 'kojs1xbet@gmail.com',
          profileName: subscription.credentials.profileAssigned || 'Profil Dédié',
          clientEmail: 'client@subhub.local',
          requestType: 'login_connection',
          status: 'delivered',
          code: data.preloaded.code,
          deliveredAt: data.preloaded.createdAt,
          requestedAt: data.preloaded.createdAt,
          expiresAt: data.preloaded.expiresAt
        });
        setStatus('delivered');
      }
    } catch (e) {
      // Ignorer
    }
  };

  const startPolling = () => {
    stopPolling();
    setElapsedSeconds(0);

    elapsedTimerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/otp?subscriptionId=${subscription.id}`);
        const data = await res.json();

        if (data.request) {
          if (data.request.status === 'delivered') {
            setActiveRequest(data.request);
            setStatus('delivered');
            stopPolling();
          } else if (data.request.status === 'rejected') {
            setActiveRequest(data.request);
            setStatus('rejected');
            stopPolling();
          }
        } else if (data.preloaded && data.preloaded.code) {
          setActiveRequest({
            id: 'preloaded',
            subscriptionId: subscription.id,
            productName: subscription.productName,
            masterEmail: subscription.credentials.email || 'kojs1xbet@gmail.com',
            profileName: subscription.credentials.profileAssigned || 'Profil Dédié',
            clientEmail: 'client@subhub.local',
            requestType: 'login_connection',
            status: 'delivered',
            code: data.preloaded.code,
            deliveredAt: data.preloaded.createdAt,
            requestedAt: data.preloaded.createdAt,
            expiresAt: data.preloaded.expiresAt
          });
          setStatus('delivered');
          stopPolling();
        }
      } catch (e) {
        // Ignorer
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    pollTimerRef.current = null;
    elapsedTimerRef.current = null;
  };

  const handleRequestCode = async () => {
    setStatus('requesting');

    let botToken = '';
    let adminChatId = '';
    try {
      botToken = localStorage.getItem('subhub_tg_token') || '';
      adminChatId = localStorage.getItem('subhub_tg_chat_id') || '';
    } catch (e) {}

    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request',
          subscriptionId: subscription.id,
          productName: subscription.productName,
          masterEmail: subscription.credentials.email || 'kojs1xbet@gmail.com',
          profileName: subscription.credentials.profileAssigned || 'Profil Client',
          clientEmail: 'client@subhub.local',
          botToken,
          adminChatId
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setActiveRequest(data.request);
        if (data.request.status === 'delivered') {
          // Si le code a été pré-enregistré en avance, délivrance immédiate !
          setStatus('delivered');
        } else {
          setStatus('waiting');
          startPolling();
        }
      } else {
        setStatus('idle');
        alert(data.error || 'Erreur lors de la demande de code');
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Impossible de contacter le serveur.');
    }
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const isNetflix = subscription.productId.includes('netflix') || subscription.productName.toLowerCase().includes('netflix');

  return (
    <div className="rounded-xl border border-red-500/30 bg-slate-950 p-4 mt-3 relative overflow-hidden">
      
      {/* 1. Écran initial (Idle) */}
      {status === 'idle' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-red-400" />
              Code de Connexion au Compte {isNetflix ? '(Connexion Netflix / Foyer)' : ''}
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> Relais Bot Vérifié
            </span>
          </div>

          {/* Nuance Pédagogique : Étape 1 Connexion vs Étape 2 Profil */}
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 space-y-1.5 text-[11px] text-slate-300">
            <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
              <Lock className="h-3.5 w-3.5 text-cyan-400" />
              Comment se connecter à Netflix :
            </div>
            <p className="text-slate-300">
              <strong>Étape 1 (Connexion sans mot de passe) :</strong> Sur Netflix, saisissez l'e-mail <code>{subscription.credentials.email}</code> et choisissez <em>« Se connecter par code à usage unique »</em> (ou <em>« Recevoir un code par e-mail »</em>). Aucun mot de passe n'est requis. Cliquez sur le bouton ci-dessous pour récupérer votre code en direct.
            </p>
            <p className="text-slate-300">
              <strong>Étape 2 (Votre Profil & Code PIN) :</strong> Dès que l'accueil Netflix s'ouvre, cliquez exclusivement sur votre profil assigné <strong>{subscription.credentials.profileAssigned}</strong> et entrez votre code PIN personnel <strong>{subscription.credentials.pinCode}</strong>.
            </p>
          </div>

          <div className="rounded-lg bg-red-950/20 border border-red-500/20 p-2 text-[10px] text-rose-300 flex items-start gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
            <span>
              <strong>Avis de sécurité :</strong> Seuls les codes de <u>connexion simple</u> sont transmis. Toute tentative de réinitialisation de mot de passe est détectée et rejetée par l'administrateur.
            </span>
          </div>

          <button
            onClick={handleRequestCode}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/25 hover:from-red-500 hover:to-rose-500 transition-all active:scale-[0.98]"
          >
            <Send className="h-3.5 w-3.5" />
            Demander le code de connexion à l'administrateur
          </button>
        </div>
      )}

      {/* 2. Envoi de la demande (Requesting) */}
      {status === 'requesting' && (
        <div className="py-3 text-center space-y-2">
          <RefreshCw className="h-5 w-5 text-red-400 animate-spin mx-auto" />
          <p className="text-xs font-bold text-white">Transmission de l'alerte à l'administrateur...</p>
        </div>
      )}

      {/* 3. En attente du code de l'admin (Waiting) */}
      {status === 'waiting' && (
        <div className="py-2 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold text-white">
                Alerte de connexion transmise à l'administrateur !
              </span>
            </div>
            <span className="font-mono text-xs text-cyan-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> {elapsedSeconds}s
            </span>
          </div>

          <div className="rounded-lg bg-red-950/20 border border-red-500/20 p-3 space-y-1.5">
            <p className="text-xs text-slate-300">
              L'administrateur a été notifié sur Telegram d'une <strong>demande de connexion au compte</strong> (<code>{subscription.credentials.email}</code>).
            </p>
            <p className="text-[11px] text-slate-400">
              Il consulte l'email reçu sur son téléphone pour vérifier qu'il s'agit bien d'un code de connexion. Dès qu'il valide le code, celui-ci s'affichera <strong>instantanément ici en direct</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-slate-500">
              Actualisation temps réel active (toutes les 2 sec)
            </span>
            <button
              onClick={() => {
                stopPolling();
                setStatus('idle');
              }}
              className="text-[11px] text-slate-400 hover:text-white underline"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* 4. Code délivré avec succès (Delivered) */}
      {status === 'delivered' && activeRequest && activeRequest.code && (
        <div className="py-1 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Code de Connexion Validé par l'Administrateur !
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Reçu il y a quelques instants
            </span>
          </div>

          {/* Affichage des Chiffres du Code */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              {activeRequest.code.split('').map((char, index) => (
                <span
                  key={index}
                  className="w-8 h-10 flex items-center justify-center rounded-lg bg-slate-950 border border-emerald-500/50 font-mono text-xl font-black text-white shadow-md select-all"
                >
                  {char}
                </span>
              ))}
            </div>

            <button
              onClick={() => copyCodeToClipboard(activeRequest.code!)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all active:scale-[0.98]"
            >
              {copiedCode ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedCode ? 'Code Copié !' : 'Copier le Code'}
            </button>
          </div>

          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
            <span>👉 Collez ce code dans la fenêtre Netflix pour valider votre connexion.</span>
            <button
              onClick={handleRequestCode}
              className="text-[10px] text-cyan-400 hover:underline shrink-0 ml-2"
            >
              Nouveau code
            </button>
          </div>

          {/* Étape Suivante Immédiate : Choix du Profil & Code PIN */}
          {subscription.credentials.profileAssigned && (
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 space-y-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Étape 2 : Accéder à votre profil
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Réservé exclusivement pour vous
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Votre Profil :</span>
                  <span className="text-sm font-black text-white">{subscription.credentials.profileAssigned}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Votre Code PIN :</span>
                  <span className="text-sm font-black font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded">
                    {subscription.credentials.pinCode}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                👉 Une fois ce code de connexion validé sur Netflix, cliquez UNIQUEMENT sur le profil <strong>{subscription.credentials.profileAssigned}</strong> et entrez votre code PIN personnel <strong>{subscription.credentials.pinCode}</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Demande Rejetée / Bloquée par l'Administrateur (Rejected) */}
      {status === 'rejected' && (
        <div className="py-2 space-y-3 animate-fadeIn">
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-bold">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Demande Refusée par Sécurité</span>
            </div>
            <p className="text-xs text-rose-200">
              {activeRequest?.rejectionReason || "L'administrateur a refusé cette demande car l'action détectée ne correspond pas à une simple connexion au compte (ex: tentative de modification de mot de passe)."}
            </p>
            <p className="text-[11px] text-slate-400">
              Connectez-vous normalement sur <code>netflix.com</code> avec l'email fourni en demandant un code à usage unique (sans tenter de modifier le mot de passe).
            </p>
          </div>

          <button
            onClick={() => setStatus('idle')}
            className="w-full py-2 text-xs text-slate-300 bg-slate-900 rounded-xl hover:bg-slate-800 border border-slate-800 font-semibold transition-colors"
          >
            Faire une nouvelle demande de connexion
          </button>
        </div>
      )}

    </div>
  );
}
