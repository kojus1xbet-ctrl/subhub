'use client';

import { useState, useEffect } from 'react';

export interface ClientUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'email';
  createdAt: string;
}

export const CLIENT_USER_STORAGE_KEY = 'subhub_client_user';

export function getStoredClientUser(): ClientUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(CLIENT_USER_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
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
    const syncUser = () => {
      setUser(getStoredClientUser());
      setLoading(false);
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
    isAuthenticated: !!user, 
    login, 
    logout 
  };
}
