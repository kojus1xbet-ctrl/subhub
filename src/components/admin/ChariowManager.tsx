'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  ArrowRight,
  Tv,
  Bot,
  HelpCircle,
  Smartphone
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function ChariowManager() {
  const [publicOrigin, setPublicOrigin] = useState<string>('');
  const [netflixLink, setNetflixLink] = useState('https://chariow.com/pay/netflix-premium-2500');
  const [chatgptLink, setChatgptLink] = useState('https://chariow.com/pay/chatgpt-pro-2625');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicOrigin(window.location.origin);
      const savedN = localStorage.getItem('chariow_netflix_link');
      if (savedN) setNetflixLink(savedN);
      const savedG = localStorage.getItem('chariow_chatgpt_link');
      if (savedG) setChatgptLink(savedG);
    }
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveLinks = () => {
    localStorage.setItem('chariow_netflix_link', netflixLink);
    localStorage.setItem('chariow_chatgpt_link', chatgptLink);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const netflixConnectUrl = `${publicOrigin || 'https://subhub.ai'}/connect/netflix`;
  const chatgptConnectUrl = `${publicOrigin || 'https://subhub.ai'}/connect/chatgpt`;

  const netflixDeliveryMessage = `🎉 Merci pour votre achat ! Votre accès Netflix Premium Ultra HD 4K est actif.

👉 LIEN DE CONNEXION ET IDENTIFIANTS :
${netflixConnectUrl}

📋 INSTRUCTIONS DE CONNEXION :
1. Ouvrez l'application Netflix et cliquez sur « S'identifier ».
2. Saisissez l'adresse e-mail officielle fournie sur le lien ci-dessus.
3. Netflix vous demandera un code à 4 chiffres : cliquez sur « Demander le code » pour le recevoir instantanément.
4. Cliquez exclusivement sur votre profil assigné et entrez votre code PIN personnel à 4 chiffres.

⚠️ Support 24/7 et assistance Telegram : @mon_subhub_bot`;

  const chatgptDeliveryMessage = `🎉 Merci pour votre achat ! Votre accès ChatGPT Pro / Plus (GPT-4o, o1, Canvas) est validé.

👉 LIEN D'ACCÈS À VOS IDENTIFIANTS :
${chatgptConnectUrl}

📋 INSTRUCTIONS DE CONNEXION :
1. Rendez-vous sur https://chat.openai.com.
2. Entrez les identifiants (email & mot de passe) délivrés sur votre lien.
3. Profitez des modèles avancés GPT-4o, o1 et de la génération d'images DALL-E 3.

⚠️ Support & Garantie active sur Telegram : @mon_subhub_bot`;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-md">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white">Intégration Chariow (Mobile Money & CB)</h3>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Paiements Afrique FCFA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Configurez vos liens de paiement Chariow et copiez les liens de connexion/redirection pour vos clients.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveLinks}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all"
        >
          {savedSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          <span>{savedSuccess ? 'Liens Enregistrés !' : 'Enregistrer les liens'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARTE 1 : NETFLIX (2 500 FCFA) */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-slate-950 to-slate-950 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black border border-rose-900/60 shadow-md">
                <Tv className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Netflix Premium 4K UHD</h4>
                <p className="text-[10px] text-slate-400">Profil Privé Sécurisé PIN • 30 Jours</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-rose-400 font-mono">2 500 FCFA</div>
              <div className="text-[10px] text-slate-500 font-semibold">Montant Chariow</div>
            </div>
          </div>

          {/* Lien de redirection / Connexion après achat */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              🔗 Lien de Connexion Client (À mettre dans Chariow comme URL de redirection) :
            </label>
            <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs">
              <span className="font-mono text-cyan-300 truncate mr-2 select-all font-semibold">
                {netflixConnectUrl}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(netflixConnectUrl, 'netflix_url')}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Copier le lien"
                >
                  {copiedKey === 'netflix_url' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <a
                  href={netflixConnectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Tester le lien"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Lien de Paiement Chariow (Fourni par le vendeur) */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              💳 Votre Lien de Paiement Chariow pour Netflix (2 500 FCFA) :
            </label>
            <input
              type="url"
              value={netflixLink}
              onChange={(e) => setNetflixLink(e.target.value)}
              placeholder="https://chariow.com/pay/votre-lien-netflix"
              className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none font-mono"
            />
          </div>

          {/* Message de livraison prêt à copier */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Message de livraison Chariow (En français) :
              </label>
              <button
                onClick={() => copyToClipboard(netflixDeliveryMessage, 'netflix_msg')}
                className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'netflix_msg' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'netflix_msg' ? 'Copié !' : 'Copier le message'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[10px] text-slate-300 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
              {netflixDeliveryMessage}
            </pre>
          </div>
        </div>

        {/* CARTE 2 : CHATGPT (2 625 FCFA) */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-slate-950 to-slate-950 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#10A37F] text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">ChatGPT Pro / Plus</h4>
                <p className="text-[10px] text-slate-400">GPT-4o, Modèles o1, DALL-E 3 • 30 Jours</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-base font-black text-emerald-400 font-mono">2 625 FCFA</div>
              <div className="text-[10px] text-slate-500 font-semibold">Montant Chariow</div>
            </div>
          </div>

          {/* Lien de redirection / Connexion après achat */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              🔗 Lien de Connexion Client (À mettre dans Chariow comme URL de redirection) :
            </label>
            <div className="flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs">
              <span className="font-mono text-cyan-300 truncate mr-2 select-all font-semibold">
                {chatgptConnectUrl}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(chatgptConnectUrl, 'chatgpt_url')}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Copier le lien"
                >
                  {copiedKey === 'chatgpt_url' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <a
                  href={chatgptConnectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Tester le lien"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Lien de Paiement Chariow (Fourni par le vendeur) */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              💳 Votre Lien de Paiement Chariow pour ChatGPT (2 625 FCFA) :
            </label>
            <input
              type="url"
              value={chatgptLink}
              onChange={(e) => setChatgptLink(e.target.value)}
              placeholder="https://chariow.com/pay/votre-lien-chatgpt"
              className="w-full rounded-xl border border-slate-750 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          {/* Message de livraison prêt à copier */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Message de livraison Chariow (En français) :
              </label>
              <button
                onClick={() => copyToClipboard(chatgptDeliveryMessage, 'chatgpt_msg')}
                className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                {copiedKey === 'chatgpt_msg' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'chatgpt_msg' ? 'Copié !' : 'Copier le message'}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[10px] text-slate-300 font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
              {chatgptDeliveryMessage}
            </pre>
          </div>
        </div>

      </div>

      {/* Guide Récapitulatif Chariow */}
      <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400 flex items-start gap-3">
        <HelpCircle className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-white">Comment configurer votre compte Chariow en 2 minutes :</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-300">
            <li>Connectez-vous à votre tableau de bord sur <strong>Chariow.com</strong>.</li>
            <li>Créez vos 2 produits numériques : <strong>Netflix (2 500 FCFA)</strong> et <strong>ChatGPT (2 625 FCFA)</strong>.</li>
            <li>Dans le champ <em>« URL de redirection / Lien du produit »</em>, collez les <strong>Liens de Connexion</strong> ci-dessus.</li>
            <li>Dans le champ <em>« Message de confirmation client »</em>, collez le <strong>Message de livraison</strong> fourni ci-dessus.</li>
            <li>Copiez vos liens de paiement Chariow et collez-les dans les champs ci-dessus pour que vos clients puissent payer en 1 clic depuis SubHub !</li>
          </ol>
        </div>
      </div>

    </div>
  );
}
