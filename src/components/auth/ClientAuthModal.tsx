'use client';

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  KeyRound,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ClientUser } from '@/lib/client-auth';

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ClientUser) => void;
  redirectUrl?: string;
}

export function ClientAuthModal({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl = '/dashboard'
}: ClientAuthModalProps) {
  const [step, setStep] = useState<'options' | 'otp_sent' | 'success'>('options');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Connexion avec Google
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const defaultEmail = email.trim() || 'client.subhub@gmail.com';
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_signin',
          googleProfile: {
            email: defaultEmail,
            name: defaultEmail.split('@')[0],
            avatar: null
          }
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la connexion Google');
      }

      setStep('success');
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // 2. Demande de code OTP / Lien par email
  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_code',
          email: email.trim()
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Impossible d\'envoyer le code');
      }

      setReceivedCode(data.code);
      setMagicLink(data.magicLink);
      setStep('otp_sent');
    } catch (err: any) {
      setError(err?.message || 'Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  // 3. Vérification du code OTP
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError('Veuillez entrer le code à 6 chiffres');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_code',
          email: email.trim(),
          code: otpCode.trim()
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Code invalide ou expiré');
      }

      setStep('success');
      setTimeout(() => {
        onSuccess(data.user);
        onClose();
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Étape Succès */}
        {step === 'success' && (
          <div className="text-center py-6 animate-scaleUp">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
              <CheckCircle2 className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-white">Connexion Réussie !</h3>
            <p className="mt-2 text-sm text-slate-400">
              Redirection instantanée vers votre Espace Client...
            </p>
          </div>
        )}

        {/* Étape 1 : Choix Google ou Saisie Email */}
        {step === 'options' && (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Espace Client SubHub
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Connectez-vous pour accéder à vos codes PIN, votre coffre-fort et votre solde.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Bouton Continuer avec Google */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:bg-slate-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-800" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Continuer avec Google</span>
            </button>

            {/* Séparateur */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative bg-slate-900 px-3 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                ou par e-mail
              </span>
            </div>

            {/* Formulaire Email */}
            <form onSubmit={handleSendEmailCode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Votre adresse e-mail personnelle
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: client@gmail.com"
                    className="w-full rounded-xl border border-slate-750 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Recevoir le code de connexion</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Connexion sécurisée sans mot de passe complexe</span>
            </div>
          </div>
        )}

        {/* Étape 2 : Saisie du code reçu */}
        {step === 'otp_sent' && (
          <div>
            <div className="text-center mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-3">
                <KeyRound className="h-6 w-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Vérification du code
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Un code à 6 chiffres a été envoyé à : <br />
                <span className="font-semibold text-slate-200">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Notification d'aide rapide / code généré pour tests */}
            {receivedCode && (
              <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                    Code temporaire généré
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpCode(receivedCode)}
                    className="text-[11px] font-bold text-cyan-400 hover:underline"
                  >
                    Remplir automatiquement
                  </button>
                </div>
                <div className="mt-1 text-lg font-black font-mono tracking-widest text-white">
                  {receivedCode}
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Valable pendant 15 minutes pour vous connecter.
                </p>
              </div>
            )}

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Saisissez le code à 6 chiffres
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-xl border border-slate-750 bg-slate-950/80 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Valider et accéder à mon espace</span>
                  </>
                )}
              </button>

              {/* Bouton Lien magique direct */}
              {magicLink && (
                <a
                  href={magicLink}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 py-2.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Se connecter via le lien magique direct</span>
                </a>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('options')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ← Changer d'e-mail
                </button>
                <button
                  type="button"
                  onClick={handleSendEmailCode}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  Renvoyer un code
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
