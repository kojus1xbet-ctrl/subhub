import React from 'react';

interface NetflixProfileAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLocked?: boolean;
}

export function NetflixProfileAvatar({ name, size = 'md', isLocked = true }: NetflixProfileAvatarProps) {
  const norm = name.toUpperCase().trim();

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-12 h-12 rounded-xl text-base',
    lg: 'w-16 h-16 rounded-2xl text-xl',
    xl: 'w-20 h-20 rounded-2xl text-2xl'
  }[size];

  // Identifie le style visuel exact inspiré des captures Netflix de l'utilisateur
  if (norm.includes('LORD') || norm.includes('FLIX')) {
    // Profil Admin : Homme barbu sur fond dégradé rouge/sombre + couronne
    return (
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-red-500/40 bg-gradient-to-b from-red-700 via-rose-900 to-black flex items-center justify-center`}>
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl">👑</span>
        </div>
        {isLocked && (
          <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-amber-300">
            🔒
          </div>
        )}
      </div>
    );
  }

  if (norm.includes('DUB')) {
    // Profil DUB : Peluche rouge aux grands yeux mignons et sourire
    return (
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-rose-500/40 bg-gradient-to-tr from-red-600 via-rose-600 to-red-500 flex flex-col items-center justify-center select-none`}>
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-sm" />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-900 shadow-sm" />
        </div>
        <div className="w-3.5 h-1.5 border-b-2 border-slate-900 rounded-full" />
        {isLocked && (
          <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-rose-300">
            🔒
          </div>
        )}
      </div>
    );
  }

  if (norm.includes('GASTON')) {
    // Profil GASTON SEP 01 : Homme aux lunettes de soleil sur fond rouge
    return (
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-red-600/40 bg-gradient-to-b from-red-600 via-red-800 to-neutral-900 flex items-center justify-center select-none`}>
        <span className="text-xl">🕶️</span>
        {isLocked && (
          <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-red-300">
            🔒
          </div>
        )}
      </div>
    );
  }

  if (norm.includes('MOD') || norm.includes('TSAR') || norm.includes('0309')) {
    // Profil MOD TSAR 0309 : Masque géométrique Squid Game noir sur fond rose
    return (
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-pink-500/40 bg-gradient-to-tr from-pink-400 via-pink-500 to-rose-400 flex items-center justify-center select-none`}>
        <div className="flex items-center justify-center bg-slate-950 text-white rounded-lg px-1.5 py-1 text-sm shadow">
          🎭
        </div>
        {isLocked && (
          <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-pink-300">
            🔒
          </div>
        )}
      </div>
    );
  }

  if (norm.includes('PRO') && (norm.includes('5') || norm.includes('PRO5'))) {
    // Profil PRO 5 : Carré bleu souriant emblématique Netflix
    return (
      <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-blue-500/40 bg-gradient-to-tr from-blue-600 via-sky-500 to-blue-400 flex flex-col items-center justify-center select-none`}>
        <div className="flex items-center justify-between w-6 mb-1 px-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        <div className="w-4 h-1.5 border-b-2 border-white rounded-full" />
        {isLocked && (
          <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-blue-200">
            🔒
          </div>
        )}
      </div>
    );
  }

  // Profil par défaut
  return (
    <div className={`relative ${sizeClasses} overflow-hidden shadow-md border border-slate-700 bg-gradient-to-tr from-red-600 to-indigo-700 flex items-center justify-center font-bold text-white select-none`}>
      {name.slice(0, 2).toUpperCase()}
      {isLocked && (
        <div className="absolute bottom-1 right-1 bg-black/80 rounded-full p-0.5 text-[9px] text-white">
          🔒
        </div>
      )}
    </div>
  );
}
