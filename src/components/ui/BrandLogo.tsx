'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, Tv, BookOpen, Code2, Film, Music, Globe } from 'lucide-react';

interface BrandLogoProps {
  slug?: string;
  name?: string;
  officialDomain?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function BrandLogo({
  slug = '',
  name = '',
  officialDomain,
  logoUrl,
  className = '',
  size = 'md'
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-12 w-12 text-lg'
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const normalizedKey = `${slug} ${name} ${officialDomain || ''}`.toLowerCase();

  // 1. OpenAI / ChatGPT Officiel (Spirale blanche vectorielle sur fond vert émeraude officiel #10A37F)
  if (normalizedKey.includes('chatgpt') || normalizedKey.includes('openai') || normalizedKey.includes('gpt')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-[#10A37F] p-2.5 shadow-md shadow-[#10A37F]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="OpenAI ChatGPT"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white">
          <path
            d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 2. Claude (Anthropic) Officiel (Terracotta #CC785C / #D97706 avec logo vectoriel officiel Anthropic)
  if (normalizedKey.includes('claude') || normalizedKey.includes('anthropic') || normalizedKey.includes('sonnet') || normalizedKey.includes('opus')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#C15F3C] via-[#D97706] to-[#E2794D] p-2.5 shadow-md shadow-[#C15F3C]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="Anthropic Claude"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white">
          <path
            d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 3. Google Gemini Officiel (Étoile à 4 branches vectorielle officielle Google Gemini avec dégradé IA bleu/cyan/violet)
  if (normalizedKey.includes('gemini') || (normalizedKey.includes('google') && !normalizedKey.includes('youtube'))) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-blue-500/30 p-2.5 shadow-md shadow-blue-500/20 shrink-0 ${currentSizeClass} ${className}`}
        title="Google Gemini"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A73E8" />
              <stop offset="50%" stopColor="#8AB4F8" />
              <stop offset="100%" stopColor="#C58AF9" />
            </linearGradient>
          </defs>
          <path
            d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
            fill="url(#geminiGrad)"
          />
        </svg>
      </div>
    );
  }

  // 4. Netflix Officiel (Le célèbre N rouge à ruban officiel avec plis en relief)
  if (normalizedKey.includes('netflix')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-black border border-rose-900/50 p-2 shadow-md shadow-[#E50914]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="Netflix Premium"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          {/* Montant vertical droit */}
          <path d="M13.887 0v9.172l4.715 13.33V0h-4.715z" fill="#E50914" />
          {/* Ruban diagonal central en superposition avec ombrage carmin */}
          <path d="m5.398 0 8.348 23.602c2.346.059 4.856.398 4.856.398L10.113 0H5.398z" fill="#B81D24" />
          {/* Montant vertical gauche */}
          <path d="M5.398 1.5V24c1.873-.225 2.81-.312 4.715-.398v-9.22L5.398 1.5z" fill="#E50914" />
        </svg>
      </div>
    );
  }

  // 5. Grok 2 / xAI Officiel (Emblème géométrique officiel de grok.com / xAI)
  if (normalizedKey.includes('grok') || normalizedKey.includes('xai') || normalizedKey.includes('grok-premium-plus')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-black border border-slate-700/80 p-2 shadow-md shadow-white/10 shrink-0 ${currentSizeClass} ${className}`}
        title="xAI Grok"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white">
          <path d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815" />
        </svg>
      </div>
    );
  }

  // 6. Duolingo Officiel (Mascotte Duo vectorielle officielle sur vert iconique #58CC02)
  if (normalizedKey.includes('duolingo')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-[#58CC02] p-2 shadow-md shadow-[#58CC02]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="Duolingo Super"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-white">
          <path
            d="M14.484 18.213c1.142 1.033 2.657 1.662 4.316 1.662l.294-.001c1.985-.038 3.749-.976 4.905-2.422v1.98c0 2.522-2.043 4.568-4.567 4.568H4.569C2.045 23.998.002 21.954.002 19.43v-1.92c1.181 1.443 2.976 2.365 4.985 2.365l.35-.001c1.61-.027 3.076-.646 4.191-1.648.555.764 1.456 1.26 2.473 1.26 1.023 0 1.928-.502 2.483-1.273zm-5.349-.996c-.989 1.022-2.375 1.658-3.909 1.658h-.239c-2.229 0-4.146-1.343-4.987-3.262v-7.16c.281-.64.68-1.216 1.169-1.699-.035-.731.132-1.469.511-2.128.256-.44.867-.504 1.21-.124l.766.851c.007-.003.014-.003.021-.005-.098-.78.037-1.587.419-2.308.24-.45.757-.53 1.114-.164 0 0 3.939 3.979 4.035 4.084 1.542 1.348 4.066 1.287 5.686-.18.002-.003.007-.005.009-.007.042-.042 3.855-3.9 3.855-3.9.3361-.3451.8619-.3101 1.113.164.385.724.518 1.535.417 2.32.002.001.003.001.004.002l.007.002c.001 0 .002 0 .003.001l.776-.86c.342-.38.954-.316 1.207.124.387.673.553 1.427.509 2.173.496.501.897 1.099 1.169 1.762v6.941c-.816 1.978-2.761 3.373-5.032 3.373H18.8c-1.547 0-2.945-.648-3.936-1.686a.8386.8386 0 0 0-.009-.067c.313-.017.528-.162.688-.33.152-.16.299-.397.299-.776 0 0-.022-.312-.024-.324.693.767 1.696 1.249 2.811 1.249 2.092 0 3.787-1.696 3.787-3.787v-2.243c0-2.092-1.697-3.787-3.787-3.787-2.093 0-3.787 1.695-3.787 3.787v2.243c0 .266.027.526.079.776-.712-.784-1.744-1.278-2.842-1.278-1.239 0-2.339.523-3.064 1.355.063-.274.097-.56.097-.853v-2.243c0-2.092-1.697-3.787-3.788-3.787-2.09 0-3.787 1.695-3.787 3.787v2.243c0 2.093 1.697 3.787 3.787 3.787 1.151 0 2.182-.513 2.876-1.322-.008.035-.039.395-.039.395 0 .378.147.616.298.775.16.168.374.312.688.331a.7783.7783 0 0 0-.012.097zm.997.073c.729.131 1.733.305 1.792.305h.157c.059 0 1.789-.303 1.789-.303-.327.705-1.041 1.194-1.869 1.194-.829 0-1.543-.49-1.869-1.196zm-.971-1.379c.246-1.313 1.462-2.259 2.918-2.259 1.324 0 2.521.97 2.763 2.259v.105c0 .082-.029.115-.103.106l-2.658.473h-.157l-2.66-.476c-.075.01-.103-.023-.103-.105Zm8.023-6.392c.255-.14.549-.22.861-.22.992 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.542c.034.003.068.005.103.005.64 0 1.16-.518 1.16-1.156 0-.312-.125-.596-.327-.804zM5.162 9.461c.227-.104.48-.162.746-.162.991 0 1.798.804 1.798 1.798v1.919c0 .991-.804 1.797-1.798 1.797-.991 0-1.797-.803-1.797-1.797v-1.571c.089.022.182.034.278.034.641 0 1.16-.518 1.16-1.156 0-.342-.149-.65-.387-.862ZM.002 6.554V4.568C.002 2.044 2.045 0 4.569 0h14.865c2.522 0 4.565 2.044 4.565 4.568v2.041a5.1847 5.1847 0 0 0-.164-.197 4.8592 4.8592 0 0 0-.646-2.284c-.433-.754-1.315-1.037-2.07-.786a4.785 4.785 0 0 0-.327-.774h-.001c-.287-.54-.758-.835-1.248-.908-.493-.073-1.033.072-1.464.515l-3.82 3.864c-1.226 1.11-3.127 1.199-4.313.205-.103-.109-4.025-4.071-4.025-4.071-.427-.438-.966-.584-1.46-.51-.489.073-.961.367-1.248.907v.002c-.133.25-.241.508-.327.771-.753-.252-1.635.029-2.071.782 0 0-.001.001-.001.002-.4.694-.613 1.459-.645 2.23-.057.065-.113.13-.167.197z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 7. Amazon Prime Video Officiel (Vectoriel officiel flèche sourire et logo Prime sur bleu marine)
  if (normalizedKey.includes('prime') || normalizedKey.includes('amazon')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-[#00050D] border border-sky-500/30 p-2 shadow-md shadow-[#00A8E1]/25 shrink-0 ${currentSizeClass} ${className}`}
        title="Amazon Prime Video"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-[#00A8E1]">
          <path
            d="M0 9.508c0-.043.01-.073.028-.09.018-.017.047-.025.086-.025h.329c.07 0 .112.034.127.101l.032.119c.091-.088.202-.159.33-.21a1.04 1.04 0 0 1 .396-.079c.294 0 .528.109.7.326.171.217.257.51.257.88 0 .254-.042.475-.127.665-.086.19-.201.335-.347.437a.85.85 0 0 1-.502.154c-.125 0-.243-.02-.355-.06a.857.857 0 0 1-.288-.164v1.003c0 .043-.008.073-.025.09-.017.016-.046.025-.09.025H.115c-.04 0-.068-.009-.086-.025-.019-.017-.028-.047-.028-.09zm1.113.32a.868.868 0 0 0-.447.124v1.206a.834.834 0 0 0 .447.124c.17 0 .296-.058.376-.174.081-.117.121-.3.121-.55 0-.254-.04-.439-.118-.555-.08-.116-.206-.174-.379-.174zm2.248-.087c.121-.134.236-.23.344-.286a.733.733 0 0 1 .345-.085h.063c.043 0 .073.009.092.025.018.017.027.047.027.09v.385c0 .04-.008.068-.025.087-.017.018-.046.027-.089.027a.923.923 0 0 1-.082-.004 1.369 1.369 0 0 0-.383.025c-.1.02-.186.045-.256.076v1.54c0 .04-.008.069-.025.087-.016.018-.046.028-.089.028h-.437c-.04 0-.069-.01-.087-.028-.018-.018-.028-.047-.028-.087V9.508c0-.043.01-.073.028-.09.018-.017.047-.025.087-.025h.328c.07 0 .112.034.128.1zm1.526-.71a.396.396 0 0 1-.278-.096.338.338 0 0 1-.105-.262c0-.11.035-.197.105-.26a.395.395 0 0 1 .278-.097c.116 0 .208.032.278.096.07.064.105.151.105.261a.34.34 0 0 1-.105.262.396.396 0 0 1-.278.096zm-.333.477c0-.043.01-.073.027-.09.019-.017.048-.025.087-.025h.438c.043 0 .072.008.089.025s.025.047.025.09v2.113c0 .04-.008.069-.025.087-.017.018-.046.028-.09.028h-.437c-.04 0-.068-.01-.087-.028-.018-.018-.027-.047-.027-.087zm1.837.11c.161-.107.306-.183.435-.227.13-.045.263-.067.4-.067.273 0 .466.098.579.294.155-.104.3-.18.438-.225.137-.046.278-.069.424-.069.213 0 .377.06.495.179.117.12.175.286.175.5v1.618c0 .04-.008.069-.025.087-.017.019-.046.027-.089.027h-.438c-.04 0-.068-.008-.086-.027-.018-.018-.028-.047-.028-.087V10.15c0-.208-.092-.312-.278-.312-.164 0-.33.04-.497.119v1.664c0 .04-.008.069-.025.087-.017.019-.046.027-.09.027h-.437c-.04 0-.068-.008-.086-.027-.019-.018-.028-.047-.028-.087V10.15c0-.208-.093-.312-.278-.312-.17 0-.337.04-.502.123v1.66c0 .04-.008.069-.025.087-.017.019-.046.027-.089.027h-.438c-.039 0-.068-.008-.086-.027-.018-.018-.027-.047-.027-.087V9.508c0-.043.009-.073.027-.09.018-.017.047-.025.086-.025h.329c.07 0 .112.034.128.101zm4.387 1.16a1.81 1.81 0 0 1-.451-.05c.018.204.08.35.185.44.105.088.263.132.476.132.085 0 .168-.005.249-.016a3.08 3.08 0 0 0 .362-.078.143.143 0 0 1 .023-.002c.052 0 .078.035.078.105v.211c0 .049-.007.083-.02.103a.169.169 0 0 1-.08.053 1.953 1.953 0 0 1-.708.128c-.377 0-.666-.103-.868-.312-.203-.207-.304-.505-.304-.893 0-.398.104-.71.31-.935.207-.227.494-.34.862-.34.283 0 .504.069.664.206a.69.69 0 0 1 .24.55c0 .23-.087.403-.258.52-.172.119-.425.177-.76.177zm.064-.99c-.292 0-.46.18-.506.54.122.025.257.037.406.037.155 0 .267-.024.337-.071.07-.047.105-.12.105-.218 0-.193-.114-.289-.342-.289zm2.948 1.946a.21.21 0 0 1-.075-.011.119.119 0 0 1-.05-.037.274.274 0 0 1-.038-.071l-.777-2.04a1.863 1.863 0 0 1-.023-.063.162.162 0 0 1-.009-.05c0-.047.03-.07.091-.07h.454c.049 0 .084.01.107.028.023.018.04.049.052.092l.468 1.622.477-1.622a.175.175 0 0 1 .052-.092c.023-.018.058-.027.107-.027h.44c.061 0 .091.022.091.068a.16.16 0 0 1-.009.05l-.022.065-.777 2.039a.274.274 0 0 1-.039.07.122.122 0 0 1-.047.038.207.207 0 0 1-.078.01zm2.02-2.703a.393.393 0 0 1-.277-.097.338.338 0 0 1-.105-.26c0-.11.035-.198.105-.262a.393.393 0 0 1 .277-.096c.115 0 .207.032.277.096.07.064.104.151.104.261 0 .11-.034.197-.104.261a.393.393 0 0 1-.277.097zm-.218 2.703c-.04 0-.068-.01-.086-.028-.019-.018-.028-.047-.028-.087V9.507c0-.043.01-.072.028-.09.018-.016.047-.024.086-.024h.436c.042 0 .072.008.089.025.016.017.024.046.024.09v2.111c0 .04-.008.07-.024.087-.017.019-.047.028-.09.028zm1.948.05a.869.869 0 0 1-.513-.153.97.97 0 0 1-.334-.426 1.6 1.6 0 0 1-.116-.63c0-.38.09-.682.268-.91a.856.856 0 0 1 .709-.341.98.98 0 0 1 .622.206V8.458c0-.043.01-.073.027-.09.018-.016.047-.025.087-.025h.436c.042 0 .071.009.088.025.017.017.025.047.025.09v3.161c0 .04-.008.07-.025.087-.017.019-.046.028-.088.028h-.364a.135.135 0 0 1-.084-.023.137.137 0 0 1-.043-.078l-.027-.105a.958.958 0 0 1-.668.256zm.218-.504a.762.762 0 0 0 .418-.128v-1.21a.872.872 0 0 0-.45-.114c-.16 0-.28.06-.358.18-.08.121-.118.304-.118.548 0 .245.041.426.124.546.084.119.212.178.384.178zm2.588-.51c-.169 0-.315-.016-.44-.05.018.201.078.345.18.432.103.087.257.13.465.13.083 0 .164-.005.242-.016a2.997 2.997 0 0 0 .354-.076.135.135 0 0 1 .022-.002c.05 0 .075.035.075.103v.207c0 .048-.007.082-.02.101a.165.165 0 0 1-.077.052 1.895 1.895 0 0 1-.69.126c-.367 0-.65-.102-.846-.306-.197-.204-.296-.496-.296-.876 0-.39.1-.695.302-.917.202-.222.482-.333.84-.333.276 0 .492.068.647.203a.678.678 0 0 1 .234.539c0 .225-.084.395-.251.51-.168.115-.415.173-.74.173zm.063-.97c-.285 0-.45.176-.494.53.119.024.25.036.396.036.15 0 .26-.024.329-.07.068-.046.102-.117.102-.213 0-.19-.111-.284-.333-.284zm2.442 2.003c-.36 0-.642-.11-.845-.328-.203-.218-.304-.523-.304-.914 0-.388.101-.691.304-.91.203-.218.485-.327.845-.327s.642.109.845.327c.203.219.304.522.304.91 0 .39-.101.696-.304.914-.203.218-.485.328-.845.328zm0-.514c.318 0 .477-.242.477-.728 0-.483-.16-.724-.477-.724-.318 0-.477.241-.477.724 0 .486.16.728.477.728zm-6.844 1.886c.405-.306.944-.408 1.39-.408.418 0 .756.09.828.185.15.2-.039 1.584-.775 2.244-.112.102-.22.047-.17-.087.166-.442.536-1.436.36-1.677-.175-.242-1.158-.115-1.6-.058-.068.008-.107-.02-.112-.061v-.023c.004-.036.03-.078.079-.115zm-10.184-.172a.105.105 0 0 1 .106-.091c.027 0 .057.009.089.028a11.778 11.778 0 0 0 6.194 1.772c1.52 0 3.19-.34 4.726-1.043.232-.105.426.164.2.346-1.371 1.09-3.359 1.67-5.07 1.67-2.397 0-4.557-.956-6.191-2.547a.173.173 0 0 1-.054-.097Z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 8. Claude Code / Cursor / Outils Développeur IA
  if (normalizedKey.includes('cursor') || normalizedKey.includes('code') || normalizedKey.includes('copilot') || normalizedKey.includes('github')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 border border-indigo-500/40 p-2.5 shadow-md shadow-indigo-500/20 shrink-0 ${currentSizeClass} ${className}`}
        title="AI Developer Tool"
      >
        <Code2 className="h-full w-full text-indigo-400" />
      </div>
    );
  }

  // 9. Spotify Officiel (Vectoriel officiel ondes acoustiques sur vert #1DB954)
  if (normalizedKey.includes('spotify')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-[#1DB954] p-2 shadow-md shadow-[#1DB954]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="Spotify Premium"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-black">
          <path
            d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 10. YouTube Premium Officiel (Vectoriel officiel bouton rouge YouTube #FF0000)
  if (normalizedKey.includes('youtube')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-slate-950 border border-red-600/40 p-2 shadow-md shadow-red-600/25 shrink-0 ${currentSizeClass} ${className}`}
        title="YouTube Premium"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
            fill="#FF0000"
          />
          <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 11. Perplexity AI Officiel
  if (normalizedKey.includes('perplexity')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-[#0E1B22] border border-cyan-500/30 p-2 shadow-md shadow-cyan-500/20 shrink-0 ${currentSizeClass} ${className}`}
        title="Perplexity AI"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-[#20B2AA]">
          <path
            d="M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z"
            fill="currentColor"
          />
        </svg>
      </div>
    );
  }

  // 12. Suno AI Officiel (Badge Rouge Corail & Typographie officielle SUNO)
  if (normalizedKey.includes('suno')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#E53935] via-[#D32F2F] to-[#FF5252] p-2 shadow-md shadow-[#E53935]/30 shrink-0 ${currentSizeClass} ${className}`}
        title="Suno AI Music"
      >
        <span className="text-white font-black text-xs sm:text-sm tracking-tighter uppercase font-mono select-none">
          SUNO
        </span>
      </div>
    );
  }

  // 12b. CapCut Pro Officiel (Logo vectoriel stylisé sur fond noir avec reflets cyan/blanc)
  if (normalizedKey.includes('capcut')) {
    return (
      <div 
        className={`relative flex items-center justify-center rounded-xl bg-black border border-cyan-500/40 p-2 shadow-md shadow-cyan-500/20 shrink-0 ${currentSizeClass} ${className}`}
        title="CapCut Pro"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path d="M19.5 7.5L12 12l7.5 4.5V7.5z" fill="#00E5FF" />
          <path d="M4.5 7.5L12 12 4.5 16.5V7.5z" fill="#FFFFFF" />
          <circle cx="12" cy="12" r="2.5" fill="#00E5FF" />
        </svg>
      </div>
    );
  }

  // 13. Extraction Dynamique Pro (Nettoyage de domaine et résolveur multi-source de favicons HD)
  const rawDomain = officialDomain || (logoUrl ? (() => { try { return new URL(logoUrl).hostname; } catch { return null; } })() : null);
  const cleanDomain = rawDomain 
    ? rawDomain.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].trim() 
    : null;

  const resolvedLogoUrl = logoUrl || (cleanDomain ? `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128` : null);

  if (resolvedLogoUrl && !imgError) {
    return (
      <div className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700/60 p-1.5 shadow-md shrink-0 overflow-hidden ${currentSizeClass} ${className}`}>
        <img
          src={resolvedLogoUrl}
          alt={name || 'Service Logo'}
          className="h-full w-full object-contain rounded-md"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // 13. Fallback stylisé selon la catégorie du service
  return (
    <div className={`flex items-center justify-center rounded-xl bg-slate-800 border border-slate-700/60 shadow-inner shrink-0 ${currentSizeClass} ${className}`}>
      {normalizedKey.includes('tv') || normalizedKey.includes('stream') || normalizedKey.includes('film') || normalizedKey.includes('video') ? (
        <Film className="h-5 w-5 text-rose-400" />
      ) : normalizedKey.includes('music') || normalizedKey.includes('sound') || normalizedKey.includes('audio') ? (
        <Music className="h-5 w-5 text-emerald-400" />
      ) : normalizedKey.includes('book') || normalizedKey.includes('lang') || normalizedKey.includes('learn') ? (
        <BookOpen className="h-5 w-5 text-lime-400" />
      ) : (
        <Sparkles className="h-5 w-5 text-indigo-400" />
      )}
    </div>
  );
}
