'use client';

import { useState, useEffect } from 'react';

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider: 'google' | 'email';
  sessionToken?: string;
  createdAt: string;
}

export const CLIENT_USER_STORAGE_KEY = 'subhub_client_user';
export const GOOGLE_CLIENT_ID_STORAGE_KEY = 'subhub_google_client_id';

export function getGoogleClientId(): string {
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  }
  if (typeof window !== 'undefined') {
    return localStorage.getItem(GOOGLE_CLIENT_ID_STORAGE_KEY) || '';
  }
  return '';
}

export function getStoredClientUser(): ClientUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CLIENT_USER_STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as ClientUser;
    if (!parsed || !parsed.email || !parsed.sessionToken) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveStoredClientUser(user: ClientUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLIENT_USER_STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('subhub_client_auth_change'));
  } catch (e) {
    console.error('Erreur sauvegarde utilisateur', e);
  }
}

export function removeStoredClientUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CLIENT_USER_STORAGE_KEY);
    window.dispatchEvent(new Event('subhub_client_auth_change'));
  } catch (e) {
    console.error('Erreur suppression session client', e);
  }
}

export function useClientAuth() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      const stored = getStoredClientUser();
      if (!stored) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(stored);
      setLoading(false);

      // Vérification cryptographique du jeton de session côté serveur
      try {
        const res = await fetch(`/api/auth/client?verify_token=${encodeURIComponent(stored.sessionToken || '')}&email=${encodeURIComponent(stored.email)}`);
        const data = await res.json();
        if (!data.valid) {
          removeStoredClientUser();
          setUser(null);
        }
      } catch {
        // En cas de coupure réseau passagère, conserver la session locale
      }
    };

    syncUser();
    window.addEventListener('subhub_client_auth_change', syncUser);
    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('subhub_client_auth_change', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);

  const login = (newUser: ClientUser) => {
    saveStoredClientUser(newUser);
    setUser(newUser);
  };

  const logout = () => {
    removeStoredClientUser();
    setUser(null);
  };

  return { 
    user, 
    loading, 
    isAuthenticated: !!user && !!user.sessionToken, 
    login, 
    logout 
  };
}
