'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  MessageSquare, 
  ShieldCheck, 
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { Product } from '@/lib/types';

interface ClientConciergeProps {
  products: Product[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ClientConcierge({ products }: ClientConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Bonjour ! Je suis **Nova**, votre conseiller SubHub. Vous hésitez entre **ChatGPT Pro**, **Claude Pro**, **Grok** ou **Netflix 4K** ? Posez-moi vos questions, je vous guide vers la meilleure offre !"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    "Quel outil choisir pour coder ?",
    "Différence ChatGPT Pro vs Claude ?",
    "Comment fonctionne la garantie ?",
    "Comment payer en crypto ou par solde ?"
  ];

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: messageText.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: updatedMessages.slice(-6),
          customCatalog: products
        })
      });

      const res = await response.json();
      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      } else {
        throw new Error('Erreur de réponse');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Je rencontre une micro-coupure réseau, mais nos abonnements ChatGPT Pro, Claude Pro et Netflix 4K sont actuellement disponibles avec livraison immédiate et garantie 30 jours !"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Fenêtre de discussion */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[360px] sm:w-[400px] flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-md overflow-hidden animate-slideUp">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">Nova AI</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-400">Conseiller d'achat & Support SubHub</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.content}</div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs pl-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>Nova rédige un conseil...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Questions rapides */}
          <div className="border-t border-slate-800/80 bg-slate-950/60 p-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="shrink-0 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-slate-300 hover:border-indigo-500/50 hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t border-slate-800 bg-slate-950 p-3"
          >
            <input
              type="text"
              placeholder="Posez votre question (ex: ChatGPT ou Claude ?)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 p-3.5 text-white shadow-2xl shadow-indigo-600/40 hover:scale-105 transition-all"
      >
        <Sparkles className="h-5 w-5 text-cyan-200 animate-spin-slow" />
        <span className="hidden sm:inline text-xs font-bold pr-1">Conseiller IA 24/7</span>
      </button>

    </div>
  );
}
