'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle, 
  Zap, 
  Sparkles,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

export function TelegramBotManager() {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [botInfo, setBotInfo] = useState<{ id: number; first_name: string; username: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('subhub_admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  // Charger le statut du bot sécurisé depuis le serveur
  useEffect(() => {
    loadBotStatus();
  }, []);

  const loadBotStatus = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'get_status' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBotInfo(data.bot);
        setBotToken(data.maskedToken || '••••••••••••••••••••');
        setChatId(data.chatId || '8927948134');
      } else {
        setBotInfo(null);
      }
    } catch {
      setBotInfo(null);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSendTestMessage = async (action: 'send_test' | 'send_sale_alert' | 'send_stock_alert') => {
    setIsSendingTest(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ 
          type: 'success', 
          text: action === 'send_test' 
            ? '🚀 Notification de test reçue sur votre Telegram !'
            : action === 'send_sale_alert'
            ? '💰 Alerte Vente envoyée sur votre Telegram (vibre/sonne) !'
            : '⚠️ Alerte Stock Critique envoyée sur votre smartphone !'
        });
      } else {
        const rawErr = (data.error || '').toLowerCase();
        let formattedErr = data.error || 'Échec d\'envoi Telegram';
        if (rawErr.includes('chat not found')) {
          formattedErr = `⚠️ Action requise : Un bot Telegram a interdiction de vous écrire tant que vous ne l'avez pas autorisé. Ouvrez @${botInfo?.username || 'votre_bot'} sur votre application Telegram et appuyez sur "DÉMARRER" (ou tapez /start), puis réessayez !`;
        }
        setStatusMessage({ type: 'error', text: formattedErr });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Erreur lors de la requête Telegram' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Bot Telegram Command Center & Alertes 24/7
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                botInfo 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                {botInfo ? `En Ligne : @${botInfo.username}` : 'Prêt à connecter'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Recevez instantanément chaque vente sur votre smartphone avec votre bénéfice net et pilotez vos stocks à distance.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-white px-3 py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 transition-colors self-start sm:self-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          Comment créer mon Bot en 30 secondes ?
        </button>
      </div>

      {/* Guide rapide dépliable */}
      {showGuide && (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 text-xs space-y-3 animate-fadeIn">
          <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" /> Guide Rapide de Configuration (Gratuit & Immédiat) :
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Étape 1 : Obtenir votre Bot Token</span>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  Ouvrir @BotFather ↗
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                1. Ouvrez Telegram et cherchez <code>@BotFather</code>.<br />
                2. Envoyez la commande <code>/newbot</code>.<br />
                3. Donnez un nom (ex: <i>SubHub Alerts</i>) et un @username (ex: <i>mon_subhub_bot</i>).<br />
                4. Copiez la clé API fournie (format : <code>7829104812:AAH9f_...</code>).
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-white flex items-center justify-between">
                <span>Étape 2 : Obtenir votre Chat ID</span>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  Ouvrir @userinfobot ↗
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                1. Ouvrez <code>@userinfobot</code> sur Telegram.<br />
                2. Cliquez sur <i>Démarrer</i> (ou tapez <code>/start</code>).<br />
                3. Copiez votre <b>Id</b> numérique (ex: <code>184920194</code>).<br />
                4. <b>Important :</b> Envoyez un premier message (ex: <i>bonjour</i>) à votre propre bot pour l'autoriser à vous écrire !
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            1. Token de votre Bot Telegram (BotFather) :
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="7829104812:AAH9f_xKLm..."
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono pr-20 focus:border-cyan-500 focus:outline-none"
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="p-1 text-slate-400 hover:text-white"
                title="Afficher/Masquer"
              >
                {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => loadBotStatus()}
                disabled={isChecking || !botToken}
                className="px-2 py-1 rounded bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600 hover:text-white text-[10px] font-bold transition-all disabled:opacity-40"
              >
                {isChecking ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Vérifier'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1.5">
            2. Votre Chat ID Personnel (userinfobot) :
          </label>
          <input
            type="text"
            placeholder="ex: 184920194"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Message de notification d'état */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn ${
          statusMessage.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
            : 'border-rose-500/30 bg-rose-950/30 text-rose-200'
        }`}>
          <div className="flex items-start gap-2.5">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            )}
            <span className="leading-relaxed">{statusMessage.text}</span>
          </div>

          {botInfo?.username && statusMessage.type === 'error' && statusMessage.text.includes('DÉMARRER') && (
            <a
              href={`https://t.me/${botInfo.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs shrink-0 shadow-md hover:from-cyan-500 hover:to-blue-500 transition-all self-start sm:self-auto"
            >
              <span>Ouvrir @{botInfo.username} sur Telegram ↗</span>
            </a>
          )}
        </div>
      )}

      {/* Actions de test & alertes en direct */}
      <div className="pt-2 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSendTestMessage('send_test')}
            disabled={isSendingTest || !botToken || !chatId}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600/30 border border-cyan-500/40 py-2.5 px-4 text-xs font-bold text-cyan-200 hover:bg-cyan-600 hover:text-white transition-all disabled:opacity-40 shadow-sm"
          >
            {isSendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Smartphone className="h-3.5 w-3.5" />}
            Envoyer un Ping Test sur mon Téléphone
          </button>

          <button
            type="button"
            onClick={() => handleSendTestMessage('send_sale_alert')}
            disabled={isSendingTest || !botToken || !chatId}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600/30 border border-emerald-500/40 py-2.5 px-4 text-xs font-bold text-emerald-200 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-40 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            Simuler une Alerte Vente (+20.20 €)
          </button>

          <button
            type="button"
            onClick={() => handleSendTestMessage('send_stock_alert')}
            disabled={isSendingTest || !botToken || !chatId}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600/30 border border-amber-500/40 py-2.5 px-4 text-xs font-bold text-amber-200 hover:bg-amber-600 hover:text-white transition-all disabled:opacity-40 shadow-sm"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            Simuler une Alerte Stock Critique
          </button>
        </div>
      </div>

      {/* Commandes interactives Telegram à distance */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="text-xs font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-cyan-400" />
            Commandes que vous pouvez envoyer à votre Bot depuis votre smartphone :
          </span>
          <span className="text-[11px] text-slate-500">Cliquez pour copier</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          {[
            { cmd: '/stats', desc: 'Affiche votre CA et bénéfice net du jour' },
            { cmd: '/stock', desc: 'Vérifie l\'état des stocks de chaque service' },
            { cmd: '/search ChatGPT Pro', desc: 'Compare Plati vs G2A en direct sur Telegram' },
            { cmd: '/boutique', desc: 'Ouvre directement le site public SubHub' }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => copyToClipboard(item.cmd)}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-cyan-500/40 hover:bg-slate-900 cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between font-mono font-bold text-cyan-300">
                <span>{item.cmd}</span>
                {copiedCmd === item.cmd ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-600 group-hover:text-slate-400" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
