import React from 'react';
import { ShieldCheck, Zap, Lock, Headphones, Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Avantages & Réassurance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Garantie 30 Jours</div>
              <div className="text-[11px] text-slate-400">Remplacement automatique en 1 clic</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Livraison Instantanée</div>
              <div className="text-[11px] text-slate-400">Accès direct dans votre Coffre-fort</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Coffre Chiffré AES-256</div>
              <div className="text-[11px] text-slate-400">Vos identifiants 100% sécurisés</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Support & IA 24/7</div>
              <div className="text-[11px] text-slate-400">Assistance dédiée par Nova AI</div>
            </div>
          </div>
        </div>

        {/* Liens et Mentions */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-400">SubHub AI PRO</span>
            <span>— Plateforme de gestion d'accès aux services cloud et numériques.</span>
          </div>
          <div>
            Tous droits réservés © {new Date().getFullYear()} SubHub Technologies.
          </div>
        </div>

      </div>
    </footer>
  );
}
