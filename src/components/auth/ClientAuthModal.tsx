'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound,
  Loader2,
  AlertCircle,
  User
} from 'lucide-react';
import { ClientUser, getGoogleClientId } from '@/lib/client-auth';

declare global {
  interface Window {
    google?: any;
  }
}

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: ClientUser) => void;
  redirectUrl?: string;
  inline?: boolean;
}

export function ClientAuthModal({
  isOpen,
  onClose,
  onSuccess,
  redirectUrl = '/dashboard',
  inline = false
}: ClientAuthModalProps) {
  const [step, setStep] = useState<'options' | 'google_form' | 'otp_sent' | 'success'>('options');
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [receivedCode, setReceivedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nativeBtnRendered, setNativeBtnRendered] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);

  const completeLogin = (loggedUser: ClientUser) => {
    setLoading(false);
    setGoogleLoading(false);
    setStep('success');
    setTimeout(() => {
      onSuccess(loggedUser);
      if (onClose) onClose();
      if (!inline && typeof window !== 'undefined' && redirectUrl) {
        window.location.href = redirectUrl;
      }
    }, 600);
  };

  // Callback officiel Google Identity Services (ID Token JWT)
  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) return;
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'google_oauth',
          idToken: response.credential
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Échec de validation Google');
      }
      completeLogin(data.user);
    } catch (err: any) {
      setGoogleLoading(false);
      setError(err?.message || 'Erreur lors de la connexion Google');
    }
  };

  // Initialisation du bouton natif Google Sign-In dès que le modal est visible
  useEffect(() => {
    if ((!isOpen && !inline) || step !== 'options') return;
    if (typeof window === 'undefined') return;

    const clientId = getGoogleClientId();
    if (!clientId) return;

    const initGoogleButton = () => {
      if (!window.google?.accounts?.id || !googleBtnContainerRef.current) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'continue_with',
          logo_alignment: 'left',
          width: 360
        });
        setNativeBtnRendered(true);
        return true;
      } catch (e) {
        console.warn('Erreur renderButton Google:', e);
        return false;
      }
    };

    if (!initGoogleButton()) {
      const interval = setInterval(() => {
        if (initGoogleButton()) {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isOpen, inline, step]);

  if (!isOpen && !inline) return null;

  // Bouton secours OAuth 2.0 Popup (avec error_callback et timeout anti-blocage)
  const handleGoogleSignInClick = () => {
    setError(null);
    const clientId = getGoogleClientId();

    if (clientId && window.google?.accounts?.oauth2) {
      setGoogleLoading(true);

      // Sécurité anti-rotation infinie (8 secondes max)
      const safetyTimer = setTimeout(() => {
        setGoogleLoading(false);
      }, 8000);

      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          error_callback: (err: any) => {
            clearTimeout(safetyTimer);
            setGoogleLoading(false);
            if (err?.type === 'popup_closed') {
              return;
            }
            setStep('google_form');
          },
          callback: async (tokenResponse: any) => {
            clearTimeout(safetyTimer);
            if (tokenResponse.error) {
              setGoogleLoading(false);
              setError('Authentification Google annulée ou refusée.');
              return;
            }
            try {
              // Récupération directe du profil Google depuis le navigateur
              let googleUser = null;
              try {
                const uRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (uRes.ok) {
                  googleUser = await uRes.json();
                }
              } catch {}

              const res = await fetch('/api/auth/client', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'google_oauth',
                  accessToken: tokenResponse.access_token,
                  googleUser
                })
              });
              const data = await res.json();
              if (!data.success) {
                throw new Error(data.error || 'Échec de validation Google');
              }

              completeLogin(data.user);
            } catch (err: any) {
              setGoogleLoading(false);
              setError(err?.message || 'Erreur lors de la validation Google');
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
      } catch {
        clearTimeout(safetyTimer);
        setGoogleLoading(false);
        setStep('google_form');
      }
    } else {
      setStep('google_form');
    }
  };

  // Validation par Compte Gmail / Email + Mot de passe personnel chiffré
  const handlePasswordSubmit = async (e: React.FormEvent, forceGmail = false) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Veuillez saisir une adresse e-mail valide.');
      return;
    }

    if (forceGmail && !trimmedEmail.endsWith('@gmail.com') && !trimmedEmail.endsWith('@googlemail.com')) {
      setError('Veuillez saisir une adresse Google valide se terminant par @gmail.com');
      return;
    }

    if (!password || password.length < 4) {
      setError('Veuillez définir ou saisir votre mot de passe personnel (min. 4 caractères).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'email_password_auth',
          email: trimmedEmail,
          password,
          name: name.trim() || undefined
        })
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Identifiants incorrects');
      }

      completeLogin(data.user);
    } catch (err: any) {
      setError(err?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Demande de code OTP à 6 chiffres
  const handleSendEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse e-mail valide');
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
      setStep('otp_sent');
    } catch (err: any) {
      setError(err?.message || 'Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  // Vérification du code OTP à 6 chiffres
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

      completeLogin(data.user);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la vérification');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div 
      className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Bouton Fermer (uniquement en mode modal) */}
      {!inline && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          title="Fermer"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* Étape Succès */}
      {step === 'success' && (
        <div className="text-center py-6 animate-scaleUp">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-white">Authentification Validée !</h3>
          <p className="mt-2 text-sm text-slate-400">
            Ouverture sécurisée de votre Espace Client...
          </p>
        </div>
      )}

      {/* Étape Identification Google (@gmail.com) */}
      {step === 'google_form' && (
        <div>
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-2.5 shadow-md mb-3">
              <svg viewBox="0 0 24 24" className="h-7 w-7">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-white">
              Connexion avec Google
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Identifiez-vous avec votre adresse <strong className="text-white">@gmail.com</strong> personnelle pour accéder à votre coffre-fort.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handlePasswordSubmit(e, true)} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Votre adresse Google (@gmail.com)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.nom@gmail.com"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Votre prénom ou pseudo (optionnel)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Jean"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Code PIN ou Mot de passe de votre Espace SubHub
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 caractères"
                  className="w-full rounded-xl border border-slate-750 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Lors de votre 1ère connexion, ce code verrouillera votre compte personnel.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim() || password.length < 4}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
              ) : (
                <>
                  <span>Valider mon compte Google</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setStep('options');
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
            >
              ← Retour aux méthodes de connexion
            </button>
          </form>
        </div>
      )}

      {/* Étape 1 : Choix Google ou Connexion Email */}
      {step === 'options' && (
        <div>
          <div className="text-center mb-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connexion Espace Client
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Authentification requise pour accéder à vos abonnements, codes PIN et portefeuille.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Bouton Officiel Natif Google Sign-In (non blocable par les bloqueurs de popups) */}
          <div className="flex flex-col items-center gap-2">
            <div ref={googleBtnContainerRef} className="w-full flex justify-center min-h-[44px]" />

            {!nativeBtnRendered && (
              <button
                type="button"
                onClick={handleGoogleSignInClick}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {googleLoading ? (
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
            )}
          </div>

          {/* Séparateur */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              ou avec votre e-mail
            </span>
          </div>

          {/* Onglets Mot de passe vs Code temporaire */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-950 p-1 border border-slate-800 mb-4">
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(null); }}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                authMode === 'password'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mot de passe
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(null); }}
              className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                authMode === 'otp'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Code à 6 chiffres
            </button>
          </div>

          {authMode === 'password' ? (
            <form onSubmit={(e) => handlePasswordSubmit(e, false)} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Votre adresse e-mail
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

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Mot de passe personnel
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-750 bg-slate-950/70 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || password.length < 4}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>Se connecter à mon espace</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
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
                    <span>Recevoir le code à 6 chiffres</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Session chiffrée HMAC-SHA256 & coffre-fort isolé</span>
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
              Code de sécurité généré pour : <br />
              <span className="font-semibold text-slate-200">{email}</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-950/50 border border-red-500/30 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {receivedCode && (
            <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
                  Votre code de connexion
                </span>
                <button
                  type="button"
                  onClick={() => setOtpCode(receivedCode)}
                  className="text-[11px] font-bold text-cyan-400 hover:underline"
                >
                  Copier et remplir
                </button>
              </div>
              <div className="mt-1 text-lg font-black font-mono tracking-widest text-white">
                {receivedCode}
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Valable pendant 15 minutes.
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
                  <span>Valider et déverrouiller mon espace</span>
                </>
              )}
            </button>

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
  );

  if (inline) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {cardContent}
    </div>
  );
}
