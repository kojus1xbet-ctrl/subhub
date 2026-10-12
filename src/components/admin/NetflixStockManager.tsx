'use client';

import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Send,
  ShieldAlert,
  Ban,
  AlertOctagon,
  Info
} from 'lucide-react';
import { SharedInventoryAccount, AccountProfileSlot } from '@/lib/types';
import { InventoryService } from '@/lib/inventory-service';
import { NetflixProfileAvatar } from '@/components/ui/NetflixProfileAvatar';
import { OtpRequest } from '@/lib/otp-service';

export function NetflixStockManager() {
  const [inventory, setInventory] = useState<SharedInventoryAccount[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editingPinSlotId, setEditingPinSlotId] = useState<string | null>(null);
  const [newPinValue, setNewPinValue] = useState('');
  const [editingPassword, setEditingPassword] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Gestion des Demandes de Code en Direct (OTP)
  const [otpRequests, setOtpRequests] = useState<OtpRequest[]>([]);
  const [adminOtpInput, setAdminOtpInput] = useState('');
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('subhub_admin_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  useEffect(() => {
    loadInventory();
    loadOtpRequests();
    const interval = setInterval(loadOtpRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.inventory) {
        setInventory(data.inventory);
      }
    } catch (e) {
      console.warn('Erreur chargement inventaire:', e);
    }
  };

  const loadOtpRequests = async () => {
    try {
      const res = await fetch('/api/otp?all=true', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.requests) {
        setOtpRequests(data.requests);
      }
    } catch (e) {}
  };

  const handleDeliverOtp = async (requestId: string) => {
    if (!adminOtpInput.trim()) return;
    setIsSubmittingOtp(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'deliver',
          requestId,
          code: adminOtpInput.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setAdminOtpInput('');
        setNotification(`Code "${adminOtpInput.trim()}" transmis avec succès au client en temps réel !`);
        setTimeout(() => setNotification(null), 4000);
        loadOtpRequests();
      } else {
        alert(data.error || 'Erreur lors de la validation du code');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleRejectOtp = async (requestId: string) => {
    if (!confirm("⚠️ ATTENTION SÉCURITÉ :\n\nVoulez-vous REFUSER cette demande ?\n\nN'utilisez cette option que si l'e-mail Netflix reçu concerne une RÉINITIALISATION DE MOT DE PASSE, une MODIFICATION D'EMAIL ou si vous suspectez un détournement de compte.")) {
      return;
    }
    setIsSubmittingOtp(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'reject',
          requestId,
          reason: 'Demande bloquée par l\'administrateur : Seuls les codes de connexion temporaire sont autorisés. Toute modification de mot de passe est strictement interdite.'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification('Demande de code refusée et bloquée pour des raisons de sécurité.');
        setTimeout(() => setNotification(null), 4000);
        loadOtpRequests();
      } else {
        alert(data.error || 'Erreur lors du refus de la demande');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handlePreloadOtp = async () => {
    if (!adminOtpInput.trim()) return;
    setIsSubmittingOtp(true);
    try {
      const res = await fetch('/api/otp', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'preload',
          code: adminOtpInput.trim(),
          masterEmail: netflixAccount?.masterEmail || 'kojs1xbet@gmail.com'
        })
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Code "${adminOtpInput.trim()}" pré-chargé en avance ! Il sera automatiquement délivré au prochain client qui tente de se connecter.`);
        setAdminOtpInput('');
        setTimeout(() => setNotification(null), 5000);
        loadOtpRequests();
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const netflixAccount = inventory.find((acc) => acc.productId === 'prod-netflix-4k') || inventory[0];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSavePin = async (accountId: string, slotId: string) => {
    if (newPinValue.trim().length !== 4) {
      alert('Le code PIN doit comporter exactement 4 chiffres.');
      return;
    }
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: 'update_pin',
          slotId,
          newPin: newPinValue.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingPinSlotId(null);
        setNewPinValue('');
        setNotification('Code PIN du profil mis à jour avec succès sur le serveur sécurisé.');
        setTimeout(() => setNotification(null), 3000);
        loadInventory();
      } else {
        alert(data.error || 'Erreur lors de la mise à jour');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  const handleSaveMasterPassword = (accountId: string) => {
    if (!newPasswordValue.trim()) return;
    alert('Pour des raisons de sécurité, le mot de passe maître Netflix reste strictement sur le serveur et ne transite pas sur le web.');
    setEditingPassword(false);
  };

  const handleReleaseSlot = async (accountId: string, slotId: string, profileName: string) => {
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'release_slot', slotId })
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Le profil "${profileName}" a été remis en stock disponible.`);
        setTimeout(() => setNotification(null), 3000);
        loadInventory();
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  const handleAssignSlot = async (slotId: string, profileName: string) => {
    const email = prompt(`Entrez l'email ou identifiant du nouveau client pour le profil "${profileName}" :`);
    if (!email || !email.trim()) return;

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action: 'assign_slot', slotId, clientEmail: email.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`🎉 Le profil "${profileName}" a été attribué avec succès à ${email.trim()} !`);
        setTimeout(() => setNotification(null), 4000);
        loadInventory();
      } else {
        alert(data.error || 'Erreur lors de l\'attribution');
      }
    } catch {
      alert('Erreur réseau');
    }
  };

  const handleSimulateAllocation = (accountId: string) => {
    const result = InventoryService.allocateProfileSlot('prod-netflix-4k', `client-${Date.now().toString().slice(-4)}@subhub.fr`);
    if (result) {
      loadInventory();
      setNotification(`🎉 Test réussi : Le profil "${result.slot.profileName}" (PIN: ${result.slot.pinCode}) a été instantanément attribué au client !`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      alert('Aucun profil client disponible en stock.');
    }
  };

  const handleResetAllClientSlots = (accountId: string) => {
    if (!confirm('Voulez-vous réinitialiser tous les profils clients en statut "Disponible" ? (Le profil admin LORD FLIX reste inchangé)')) {
      return;
    }
    const list = InventoryService.getSharedInventory();
    const acc = list.find((a) => a.id === accountId);
    if (acc) {
      acc.slots.forEach((s) => {
        if (!s.isReservedAdmin) {
          s.status = 'available';
          s.assignedToEmail = undefined;
          s.assignedAt = undefined;
        }
      });
      InventoryService.saveSharedInventory(list);
      setInventory([...list]);
      setNotification('Tous les profils clients ont été réinitialisés en "Disponible" (Stock plein).');
      setTimeout(() => setNotification(null), 3500);
    }
  };

  if (!netflixAccount) return null;

  const adminSlot = netflixAccount.slots.find((s) => s.isReservedAdmin);
  const clientSlots = netflixAccount.slots.filter((s) => !s.isReservedAdmin);
  const availableCount = clientSlots.filter((s) => s.status === 'available').length;
  const assignedCount = clientSlots.filter((s) => s.status === 'assigned').length;

  return (
    <div className="rounded-2xl border border-red-500/30 bg-slate-900/90 p-6 shadow-2xl relative overflow-hidden">
      
      {/* Halo d'ambiance Netflix */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      {/* Header du Gestionnaire */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 p-0.5 shadow-lg shadow-red-600/30">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950 font-black text-red-500 text-xl tracking-tighter">
              N
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Gestionnaire de Profils & Compte Netflix
              </h3>
              <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-400">
                Auto-Délivrance PIN ⚡
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Système de vente par profil individuel verrouillé par code PIN 4 chiffres
            </p>
          </div>
        </div>

        {/* Compteurs de Stock */}
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-emerald-400 font-mono">{availableCount} / {clientSlots.length}</div>
            <div className="text-[10px] text-slate-400">Disponibles Vente</div>
          </div>
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-indigo-400 font-mono">{assignedCount}</div>
            <div className="text-[10px] text-slate-400">Vendus / Attribués</div>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-amber-400 font-mono">1</div>
            <div className="text-[10px] text-slate-400">Réservé Admin</div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="my-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3.5 text-xs font-bold text-emerald-300 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Identifiants Master du Compte */}
      <div className="my-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <KeyRound className="h-3.5 w-3.5 text-red-400" />
            Identifiants Master du Compte Netflix
          </span>
          <a
            href="https://www.netflix.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Ouvrir Netflix</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Master Email */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Email Général :
            </label>
            <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
              <span className="font-mono text-xs text-white font-bold select-all truncate">
                {netflixAccount.masterEmail}
              </span>
              <button
                onClick={() => copyToClipboard(netflixAccount.masterEmail, 'master_email')}
                className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                {copiedKey === 'master_email' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedKey === 'master_email' ? 'Copié' : 'Copier'}
              </button>
            </div>
          </div>

          {/* Master Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Mot de Passe Général :
              </label>
              {!editingPassword && (
                <button
                  onClick={() => {
                    setEditingPassword(true);
                    setNewPasswordValue(netflixAccount.masterPassword);
                  }}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <Edit2 className="h-2.5 w-2.5" /> Modifier
                </button>
              )}
            </div>

            {editingPassword ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-900 border border-cyan-500/50 px-3 py-1.5 font-mono text-xs text-white focus:outline-none"
                  placeholder="Nouveau mot de passe..."
                  autoFocus
                />
                <button
                  onClick={() => handleSaveMasterPassword(netflixAccount.id)}
                  className="rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-cyan-500"
                >
                  OK
                </button>
                <button
                  onClick={() => setEditingPassword(false)}
                  className="rounded-lg bg-slate-800 px-2 py-1.5 text-[11px] text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-3 py-2">
                <span className="font-mono text-xs text-amber-300 select-all truncate">
                  {showPassword ? netflixAccount.masterPassword : '••••••••••••••••'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-slate-400 hover:text-white"
                    title={showPassword ? 'Masquer' : 'Afficher'}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(netflixAccount.masterPassword, 'master_pass')}
                    className="flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white"
                  >
                    {copiedKey === 'master_pass' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === 'master_pass' ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Centre de Validation des Codes de Connexion en Direct (Live OTP) */}
      <div className="my-6 rounded-xl border border-red-500/30 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-red-400" />
              Centre des Codes de Connexion en Direct (OTP Netflix / Foyer)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Bot Telegram Connecté
          </span>
        </div>

        {/* Si une demande est en attente */}
        {otpRequests.some((r) => r.status === 'pending') ? (
          <div className="space-y-3">
            {otpRequests.filter((r) => r.status === 'pending').map((req) => (
              <div 
                key={req.id} 
                className="rounded-xl border border-red-500/50 bg-red-950/40 p-4 space-y-3 shadow-lg"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-500/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-red-400 animate-ping" />
                    <span className="text-sm font-black text-white flex items-center gap-1.5">
                      🚨 Demande de Connexion au Compte Netflix
                    </span>
                    <span className="rounded bg-slate-800 text-slate-300 text-[10px] font-mono px-2 py-0.5 border border-slate-700">
                      {req.clientEmail}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300 font-mono">
                    Compte : <strong>{req.masterEmail}</strong>
                  </span>
                </div>

                {/* Guide de vérification anti-détournement */}
                <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>Contrôle Anti-Détournement obligatoire (Vérifiez l'objet du mail Netflix) :</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-emerald-950/30 border border-emerald-500/30 p-2.5 space-y-1">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 AUTORISÉ (Connexion normale)
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        Objet : <em>"Votre code d'accès temporaire"</em>, <em>"Code pour vous connecter"</em> ou <em>"Mise à jour du foyer"</em>.<br />
                        → <strong>Action :</strong> Copiez le code et transmettez-le au client ci-dessous.
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-950/40 border border-red-500/40 p-2.5 space-y-1">
                      <div className="font-bold text-red-400 flex items-center gap-1">
                        <AlertOctagon className="h-3.5 w-3.5" /> 🔴 DANGER (Vol de compte potentiel)
                      </div>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        Objet : <em>"Réinitialisation de mot de passe"</em> ou <em>"Modification d'e-mail"</em>.<br />
                        → <strong>Action :</strong> Ne donnez JAMAIS ce code ! Cliquez immédiatement sur <strong>Refuser / Bloquer</strong>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Saisissez le code temporaire Netflix (ex: 849201)..."
                    value={adminOtpInput}
                    onChange={(e) => setAdminOtpInput(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-900 border border-red-500/50 px-3.5 py-2 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    autoFocus
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeliverOtp(req.id)}
                      disabled={!adminOtpInput.trim() || isSubmittingOtp}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 transition-all"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Transmettre le Code
                    </button>
                    <button
                      onClick={() => handleRejectOtp(req.id)}
                      disabled={isSubmittingOtp}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-red-950/80 border border-red-500/50 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-900 hover:text-white transition-all"
                      title="Refuser si l'e-mail Netflix reçu concerne un changement de mot de passe ou d'e-mail"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Refuser / Bloquer
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>
                    💡 <strong>Depuis Telegram :</strong> Répondez avec <code>/code 123456</code> pour valider, ou <code>/refuser</code> pour bloquer.
                  </span>
                  <span>Profil attribué : <strong>{req.profileName}</strong></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Aucun client n'attend de code actuellement. En veille active 24h/24.</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dès qu'un client clique sur "Demander un code", vous recevrez une alerte prioritaire sur Telegram.
              </p>
            </div>

            {/* Mode Anticipation : Pré-charger un code reçu par e-mail en avance */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Mode Anticipation : Vous avez reçu le code Netflix par e-mail avant le client ?
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Valide 15 minutes
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Saisissez le code temporaire ci-dessous. Dès que le client ouvrira son interface ou cliquera sur "Demander le code", il sera <strong>automatiquement rempli et validé</strong> sans attente !
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Code Netflix reçu par mail (ex: 849201)..."
                  value={adminOtpInput}
                  onChange={(e) => setAdminOtpInput(e.target.value)}
                  className="flex-1 rounded-xl bg-slate-900 border border-indigo-500/40 px-3.5 py-2 font-mono text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handlePreloadOtp}
                  disabled={!adminOtpInput.trim() || isSubmittingOtp}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-500 disabled:opacity-40 transition-all shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Pré-charger pour le Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Historique des derniers codes et actions de sécurité */}
        {otpRequests.filter((r) => r.status === 'delivered' || r.status === 'rejected').length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Journal récent des codes & alertes de sécurité :
            </span>
            <div className="flex flex-wrap gap-2">
              {otpRequests.filter((r) => r.status === 'delivered' || r.status === 'rejected').slice(0, 4).map((r) => (
                <div 
                  key={r.id} 
                  className={`rounded-lg bg-slate-900 border px-2.5 py-1 text-[11px] flex items-center gap-2 font-mono ${
                    r.status === 'delivered' ? 'border-emerald-500/30 text-slate-300' : 'border-red-500/30 text-red-300'
                  }`}
                >
                  {r.status === 'delivered' ? (
                    <>
                      <span className="text-emerald-400 font-bold">{r.code}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-white font-sans">Connexion validée</span>
                    </>
                  ) : (
                    <>
                      <span className="text-red-400 font-bold">⛔ BLOQUÉ</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-red-200 font-sans">Refus sécurisé</span>
                    </>
                  )}
                  <span className="text-[9px] text-slate-500">
                    ({new Date(r.deliveredAt || r.requestedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guide Visuel Anti-Détournement & Distinction des Mails Netflix */}
      <div className="my-6 rounded-xl border border-indigo-500/30 bg-slate-950 p-4 space-y-3">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
          <Info className="h-4 w-4" />
          <span>Guide de Sécurité : Comment Netflix formule ses e-mails (Anti-Vol de Compte)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Netflix envoie des e-mails <strong>radicalement différents</strong> selon l'action demandée. Voici votre règle d'or pour ne jamais vous faire pirater le compte :
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 space-y-1.5">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              1. Code de Connexion Temporaire (100% Sûr)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Objet de l'e-mail :</strong> <em>"Votre code d'accès temporaire Netflix"</em>, <em>"Code pour vous connecter"</em> ou <em>"Mise à jour de votre foyer Netflix"</em>.<br />
              <strong>Texte :</strong> <em>"Utilisez ce code pour vous connecter à votre compte Netflix"</em>.<br />
              <strong>Impact :</strong> Permet UNIQUEMENT au client de regarder Netflix sur son écran. N'autorise aucune modification.
            </p>
          </div>
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3 space-y-1.5">
            <div className="font-bold text-red-400 flex items-center gap-1.5 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              2. Changement de Mot de Passe / Email (DANGER ABSOLU)
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              <strong>Objet de l'e-mail :</strong> <em>"Réinitialisation de votre mot de passe Netflix"</em> ou <em>"Instructions pour modifier votre e-mail"</em>.<br />
              <strong>Impact :</strong> Si vous transmettiez ce code, l'acheteur prendrait possession totale du compte !<br />
              <strong>Consigne :</strong> Ne donnez <strong>JAMAIS</strong> ce code. Cliquez sur <strong>Refuser / Bloquer</strong> ou tapez <code>/refuser</code> sur Telegram.
            </p>
          </div>
        </div>
      </div>

      {/* Grille des 5 Profils Réels */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>Profils Réels Configurés sur le Compte ({netflixAccount.slots.length})</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Codes PIN 4 chiffres livrés automatiquement dès l'achat
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {netflixAccount.slots.map((slot) => {
            const isEditingPin = editingPinSlotId === slot.id;

            return (
              <div 
                key={slot.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  slot.isReservedAdmin
                    ? 'border-red-500/40 bg-gradient-to-b from-red-950/40 to-slate-950/80 shadow-md'
                    : slot.status === 'assigned'
                    ? 'border-indigo-500/30 bg-slate-950/90'
                    : 'border-emerald-500/30 bg-slate-950/70 hover:border-emerald-500/50'
                }`}
              >
                {/* Header Carte Profil */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <NetflixProfileAvatar name={slot.profileName} size="md" isLocked={true} />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-white tracking-tight">
                          {slot.profileName}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {slot.isReservedAdmin ? 'Profil Administrateur' : 'Profil Utilisateur'}
                      </span>
                    </div>
                  </div>

                  {/* Badge Statut */}
                  {slot.isReservedAdmin ? (
                    <span className="rounded-full bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[9px] font-bold text-red-300 flex items-center gap-1">
                      <ShieldCheck className="h-2.5 w-2.5 text-red-400" />
                      ADMIN ONLY 🔒
                    </span>
                  ) : slot.status === 'assigned' ? (
                    <span className="rounded-full bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 text-[9px] font-bold text-indigo-300 flex items-center gap-1">
                      <UserCheck className="h-2.5 w-2.5 text-indigo-400" />
                      Attribué Client
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-bold text-emerald-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Disponible
                    </span>
                  )}
                </div>

                {/* Section Code PIN */}
                <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 mb-3 flex items-center justify-between">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Code PIN :
                  </div>

                  {isEditingPin ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        maxLength={4}
                        value={newPinValue}
                        onChange={(e) => setNewPinValue(e.target.value.replace(/\D/g, ''))}
                        className="w-16 rounded bg-slate-950 border border-red-500 px-2 py-0.5 text-center font-mono text-xs font-bold text-white focus:outline-none"
                        placeholder="0000"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSavePin(netflixAccount.id, slot.id)}
                        className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-500"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingPinSlotId(null)}
                        className="p-1 text-slate-400 hover:text-white text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 font-mono text-sm font-black text-white">
                        {slot.pinCode.split('').map((d, i) => (
                          <span key={i} className="px-1 py-0.2 rounded bg-slate-950 border border-slate-800 text-rose-300">
                            {d}
                          </span>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setEditingPinSlotId(slot.id);
                          setNewPinValue(slot.pinCode);
                        }}
                        className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Modifier le code PIN"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Détails Client si assigné */}
                {slot.assignedToEmail && (
                  <div className="text-[10px] text-slate-400 mb-3 truncate">
                    Client : <span className="text-indigo-300 font-mono font-medium">{slot.assignedToEmail}</span>
                  </div>
                )}

                {/* Actions Administrateur sur le Slot */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  {slot.isReservedAdmin ? (
                    <span className="text-[10px] text-red-400/80 font-medium">
                      🛡️ Protégé contre toute vente client
                    </span>
                  ) : slot.status === 'assigned' ? (
                    <button
                      onClick={() => handleReleaseSlot(netflixAccount.id, slot.id, slot.profileName)}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors"
                      title="Libérer et remettre en vente"
                    >
                      <RefreshCw className="h-3 w-3" /> Remettre en vente
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="h-3 w-3" /> En stock
                      </span>
                      <button
                        onClick={() => handleAssignSlot(slot.id, slot.profileName)}
                        className="px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors"
                        title="Attribuer manuellement ce profil à un client"
                      >
                        + Attribuer client
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Barre d'outils et Actions Rapides */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSimulateAllocation(netflixAccount.id)}
            disabled={availableCount === 0}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-lg hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Tester l'attribution automatique (Simulation Achat)
          </button>

          <button
            onClick={() => handleResetAllClientSlots(netflixAccount.id)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-750 hover:text-white transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-cyan-400" />
            Réinitialiser stock plein (4 profils libres)
          </button>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Synchronisation automatique avec le catalogue public SubHub</span>
        </div>
      </div>

    </div>
  );
}
