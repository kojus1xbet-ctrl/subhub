export interface BrandTheme {
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardHoverShadow: string;
  topAmbientGlow: string;
  badgeBg: string;
  buttonGradient: string;
  buttonShadow: string;
  textAccent: string;
  accentDot: string;
  progressBar: string;
  glowBorderColor: string;
}

export function getBrandTheme(slugOrName: string = ''): BrandTheme {
  const key = slugOrName.toLowerCase();

  // 1. ChatGPT / OpenAI (Vert émeraude & Teal #10A37F)
  if (key.includes('chatgpt') || key.includes('openai') || key.includes('gpt')) {
    return {
      cardBg: 'bg-gradient-to-b from-emerald-950/25 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-emerald-500/20',
      cardHoverBorder: 'hover:border-emerald-500/50',
      cardHoverShadow: 'hover:shadow-emerald-500/10',
      topAmbientGlow: 'bg-emerald-500/15',
      badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white',
      buttonShadow: 'shadow-emerald-600/25',
      textAccent: 'text-emerald-400',
      accentDot: 'bg-emerald-400',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      glowBorderColor: 'rgba(16, 163, 127, 0.3)'
    };
  }

  // 2. Claude (Anthropic) (Ambre / Terracotta #D97706)
  if (key.includes('claude') || key.includes('anthropic') || key.includes('sonnet')) {
    return {
      cardBg: 'bg-gradient-to-b from-amber-950/25 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-amber-500/20',
      cardHoverBorder: 'hover:border-amber-500/50',
      cardHoverShadow: 'hover:shadow-amber-500/10',
      topAmbientGlow: 'bg-amber-500/15',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-orange-600 border border-amber-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white',
      buttonShadow: 'shadow-amber-600/25',
      textAccent: 'text-amber-400',
      accentDot: 'bg-amber-400',
      progressBar: 'bg-gradient-to-r from-amber-500 to-orange-400',
      glowBorderColor: 'rgba(217, 119, 6, 0.3)'
    };
  }

  // 3. Google Gemini (Bleu Électrique / Cyan / Violet)
  if (key.includes('gemini') || key.includes('google')) {
    return {
      cardBg: 'bg-gradient-to-b from-blue-950/30 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-blue-500/25',
      cardHoverBorder: 'hover:border-blue-400/50',
      cardHoverShadow: 'hover:shadow-blue-500/15',
      topAmbientGlow: 'bg-blue-500/20',
      badgeBg: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 border border-cyan-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white',
      buttonShadow: 'shadow-blue-600/25',
      textAccent: 'text-cyan-400',
      accentDot: 'bg-cyan-400',
      progressBar: 'bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400',
      glowBorderColor: 'rgba(59, 130, 246, 0.35)'
    };
  }

  // 4. Netflix (Rouge Rubis Officiel #E50914)
  if (key.includes('netflix')) {
    return {
      cardBg: 'bg-gradient-to-b from-rose-950/30 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-rose-500/20',
      cardHoverBorder: 'hover:border-rose-500/50',
      cardHoverShadow: 'hover:shadow-rose-500/15',
      topAmbientGlow: 'bg-rose-500/20',
      badgeBg: 'bg-gradient-to-r from-rose-600 to-red-600 border border-rose-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white',
      buttonShadow: 'shadow-rose-600/25',
      textAccent: 'text-rose-400',
      accentDot: 'bg-rose-500',
      progressBar: 'bg-gradient-to-r from-rose-500 to-red-500',
      glowBorderColor: 'rgba(229, 9, 20, 0.35)'
    };
  }

  // 5. Grok / xAI (Monochrome Cyber Minimaliste & Blanc)
  if (key.includes('grok') || key.includes('xai') || key.includes('grok-premium-plus')) {
    return {
      cardBg: 'bg-gradient-to-b from-slate-800/25 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-slate-700/60',
      cardHoverBorder: 'hover:border-slate-400/60',
      cardHoverShadow: 'hover:shadow-white/5',
      topAmbientGlow: 'bg-white/10',
      badgeBg: 'bg-gradient-to-r from-slate-700 to-slate-800 border border-slate-500/40 text-white',
      buttonGradient: 'bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600 hover:border-slate-400 hover:bg-slate-700 text-white',
      buttonShadow: 'shadow-slate-900/40',
      textAccent: 'text-slate-200',
      accentDot: 'bg-white',
      progressBar: 'bg-gradient-to-r from-slate-400 via-slate-200 to-white',
      glowBorderColor: 'rgba(255, 255, 255, 0.25)'
    };
  }

  // 6. Duolingo (Vert Pomme & Lime #58CC02)
  if (key.includes('duolingo')) {
    return {
      cardBg: 'bg-gradient-to-b from-lime-950/25 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-lime-500/20',
      cardHoverBorder: 'hover:border-lime-500/50',
      cardHoverShadow: 'hover:shadow-lime-500/15',
      topAmbientGlow: 'bg-lime-500/15',
      badgeBg: 'bg-gradient-to-r from-lime-600 to-emerald-600 border border-lime-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-lime-600 via-emerald-600 to-lime-600 hover:from-lime-500 hover:to-emerald-500 text-white',
      buttonShadow: 'shadow-lime-600/25',
      textAccent: 'text-lime-400',
      accentDot: 'bg-lime-400',
      progressBar: 'bg-gradient-to-r from-lime-500 to-emerald-400',
      glowBorderColor: 'rgba(88, 204, 2, 0.35)'
    };
  }

  // 7. Amazon Prime Video (Bleu Électrique / Cyan #00A8E1 sur Noir d'Encre)
  if (key.includes('prime') || key.includes('amazon')) {
    return {
      cardBg: 'bg-gradient-to-b from-sky-950/30 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-sky-500/25',
      cardHoverBorder: 'hover:border-sky-400/50',
      cardHoverShadow: 'hover:shadow-sky-500/15',
      topAmbientGlow: 'bg-sky-500/20',
      badgeBg: 'bg-gradient-to-r from-sky-600 to-blue-600 border border-sky-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-sky-600 via-blue-600 to-sky-600 hover:from-sky-500 hover:to-blue-500 text-white',
      buttonShadow: 'shadow-sky-600/25',
      textAccent: 'text-sky-400',
      accentDot: 'bg-sky-400',
      progressBar: 'bg-gradient-to-r from-sky-500 to-blue-400',
      glowBorderColor: 'rgba(0, 168, 225, 0.35)'
    };
  }

  // 8. Spotify (Vert Émeraude Vibrant #1DB954)
  if (key.includes('spotify')) {
    return {
      cardBg: 'bg-gradient-to-b from-emerald-950/25 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-emerald-500/25',
      cardHoverBorder: 'hover:border-emerald-400/50',
      cardHoverShadow: 'hover:shadow-emerald-500/15',
      topAmbientGlow: 'bg-emerald-500/20',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-green-600 border border-emerald-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white',
      buttonShadow: 'shadow-emerald-600/25',
      textAccent: 'text-emerald-400',
      accentDot: 'bg-emerald-400',
      progressBar: 'bg-gradient-to-r from-emerald-500 to-teal-400',
      glowBorderColor: 'rgba(29, 185, 84, 0.35)'
    };
  }

  // 9. YouTube Premium (Rouge Écarlate #FF0000)
  if (key.includes('youtube')) {
    return {
      cardBg: 'bg-gradient-to-b from-red-950/30 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-red-500/20',
      cardHoverBorder: 'hover:border-red-500/50',
      cardHoverShadow: 'hover:shadow-red-500/15',
      topAmbientGlow: 'bg-red-500/20',
      badgeBg: 'bg-gradient-to-r from-red-600 to-rose-700 border border-red-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white',
      buttonShadow: 'shadow-red-600/25',
      textAccent: 'text-red-400',
      accentDot: 'bg-red-500',
      progressBar: 'bg-gradient-to-r from-red-500 to-rose-400',
      glowBorderColor: 'rgba(255, 0, 0, 0.35)'
    };
  }

  // 10. Suno AI (Rouge Corail / Rose Néon #E53935)
  if (key.includes('suno')) {
    return {
      cardBg: 'bg-gradient-to-b from-rose-950/30 via-slate-900/80 to-slate-900/95',
      cardBorder: 'border-rose-500/25',
      cardHoverBorder: 'hover:border-rose-400/50',
      cardHoverShadow: 'hover:shadow-rose-500/15',
      topAmbientGlow: 'bg-rose-500/20',
      badgeBg: 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 border border-rose-400/30 text-white',
      buttonGradient: 'bg-gradient-to-r from-red-600 via-rose-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white',
      buttonShadow: 'shadow-rose-600/25',
      textAccent: 'text-rose-400',
      accentDot: 'bg-rose-500',
      progressBar: 'bg-gradient-to-r from-rose-500 to-orange-400',
      glowBorderColor: 'rgba(229, 57, 53, 0.35)'
    };
  }

  // 11. Défaut (Thème signature SubHub : Indigo / Violet moderne)
  return {
    cardBg: 'bg-gradient-to-b from-indigo-950/20 via-slate-900/80 to-slate-900/95',
    cardBorder: 'border-slate-800',
    cardHoverBorder: 'hover:border-indigo-500/50',
    cardHoverShadow: 'hover:shadow-indigo-500/10',
    topAmbientGlow: 'bg-indigo-500/15',
    badgeBg: 'bg-gradient-to-r from-indigo-600 to-violet-600 border border-indigo-400/30 text-white',
    buttonGradient: 'bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white',
    buttonShadow: 'shadow-indigo-600/25',
    textAccent: 'text-indigo-400',
    accentDot: 'bg-indigo-400',
    progressBar: 'bg-gradient-to-r from-indigo-500 to-cyan-400',
    glowBorderColor: 'rgba(99, 102, 241, 0.3)'
  };
}
