import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Minimize2, Bot } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Message {
  role: 'bot' | 'user';
  text: string;
  time: string;
}

// ── Base de connaissance CYNA ────────────────────────────────────────────────

const KB: { keywords: string[]; response: string }[] = [
  {
    keywords: ['soc', 'security operations', 'surveillance', 'monitoring'],
    response:
      'Nos solutions **SOC** (Security Operations Center) offrent une surveillance 24/7 de votre infrastructure. Deux offres disponibles :\n• **Cyna SOC Premium** — 1 299€/mois (IA + SOAR + conformité NIS2/ISO27001)\n• **Cyna SOC Essentials** — 699€/mois (idéal PME, monitoring essentiel)\n\nVoulez-vous voir les détails sur [notre catalogue](/catalogue?category=SOC) ?',
  },
  {
    keywords: ['edr', 'endpoint', 'poste de travail', 'antivirus', 'detection endpoint'],
    response:
      'Nos solutions **EDR** (Endpoint Detection & Response) protègent tous vos postes de travail et serveurs :\n• **Cyna EDR Enterprise** — 899€/mois (détection comportementale IA, isolation automatique)\n• **Cyna EDR Pro** — 1 199€/mois (machine learning + threat hunting)\n\nCompatible Windows, macOS et Linux. Voir le [catalogue EDR](/catalogue?category=EDR).',
  },
  {
    keywords: ['xdr', 'extended', 'suite', 'siem', 'corrélation', 'multi-vecteur'],
    response:
      'Nos solutions **XDR** (Extended Detection & Response) offrent une vision unifiée de toute votre sécurité :\n• **Cyna XDR Suite** — 1 799€/mois (SOAR intégré, +50 intégrations)\n• **Cyna XDR Enterprise** — 2 499€/mois (SIEM bidirectionnel, multi-tenant)\n\nConsultez le [catalogue XDR](/catalogue?category=XDR).',
  },
  {
    keywords: ['prix', 'tarif', 'coût', 'combien', 'abonnement', 'facturation'],
    response:
      'Nos tarifs commencent à **699€/mois** pour le SOC Essentials. Tous les abonnements sont disponibles en mensuel ou annuel (économie de ~17%).\n\nGamme complète :\n• SOC Essentials : 699€/mois\n• EDR Enterprise : 899€/mois\n• SOC Premium : 1 299€/mois\n• XDR Suite : 1 799€/mois\n• XDR Enterprise : 2 499€/mois\n\nVoir les [tarifs complets](/catalogue).',
  },
  {
    keywords: ['essai', 'gratuit', 'demo', 'démonstration', 'test', '14 jours'],
    response:
      'Oui ! Nous proposons un **essai gratuit de 14 jours** sans engagement sur toutes nos solutions. Aucune carte bancaire requise.\n\nRendez-vous sur n\'importe quelle fiche produit du [catalogue](/catalogue) et cliquez sur "Essai gratuit 14 jours".',
  },
  {
    keywords: ['rgpd', 'conformité', 'iso', 'nis2', 'réglementation', 'gdpr'],
    response:
      'La conformité est au cœur de nos solutions. Cyna couvre :\n• **RGPD** — données minimisées, backups chiffrés, logs 30j\n• **NIS2** — directive européenne sur la cybersécurité\n• **ISO 27001** — management de la sécurité de l\'information\n• **SOC 2 Type II** — disponible sur XDR Enterprise\n\nTout est intégré nativement, sans configuration supplémentaire.',
  },
  {
    keywords: ['contact', 'support', 'aide', 'assistance', 'équipe', 'humain', 'parler'],
    response:
      'Notre équipe est disponible pour vous aider !\n\n📧 **Email :** contact@cyna-it.fr\n💬 **Formulaire :** [Page Contact](/contact)\n🕐 **Délai de réponse :** 2h en heures ouvrées\n\nPour les urgences sécurité, notre SOC est disponible **24/7**.',
  },
  {
    keywords: ['connexion', 'connecter', 'compte', 'inscription', 'créer', 'login'],
    response:
      'Pour accéder à votre espace client :\n• [Se connecter](/connexion)\n• [Créer un compte](/inscription)\n\nAprès connexion, votre espace client vous permet de gérer vos abonnements, commandes et paramètres.',
  },
  {
    keywords: ['commande', 'panier', 'acheter', 'souscrire', 'commander'],
    response:
      'Pour souscrire à une solution :\n1. Ajoutez un produit au [panier](/panier) depuis le catalogue\n2. Connectez-vous (ou créez un compte)\n3. Choisissez votre adresse de facturation\n4. Validez le paiement\n\nEn quelques minutes, votre solution est active !',
  },
  {
    keywords: ['intégration', 'compatible', 'api', 'déploiement', 'infrastructure'],
    response:
      'Nos solutions SaaS sont **cloud-native** et s\'intègrent facilement :\n• Déploiement en moins de **30 minutes**\n• Compatible avec votre infrastructure existante\n• API REST documentée\n• Connecteurs natifs pour +50 outils (SIEM, ITSM, ticketing...)\n• Support technique dédié lors de l\'onboarding.',
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou'],
    response:
      "Bonjour ! 👋 Je suis l'assistant virtuel CYNA. Je peux vous renseigner sur :\n• Nos solutions **SOC, EDR, XDR**\n• Les **tarifs** et offres d'abonnement\n• La **conformité** (RGPD, NIS2, ISO 27001)\n• L'**essai gratuit 14 jours**\n\nQue puis-je faire pour vous ?",
  },
  {
    keywords: ['merci', 'super', 'parfait', 'nickel', 'ok', 'bien'],
    response:
      "Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Vous pouvez aussi contacter directement notre équipe via la [page contact](/contact).",
  },
];

const DEFAULT_RESPONSE =
  "Je n'ai pas bien compris votre question. Vous pouvez me demander des informations sur nos solutions **SOC, EDR, XDR**, les **tarifs**, la **conformité RGPD/NIS2**, ou contacter notre équipe sur la [page contact](/contact).";

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULT_RESPONSE;
}

// Render simple markdown (bold **text**, links [label](url), newlines)
function renderMarkdown(text: string) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    // Bold
    const segments = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = segments.map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**')) {
        return <strong key={j}>{seg.slice(2, -2)}</strong>;
      }
      // Links [label](url)
      const linkParts = seg.split(/(\[[^\]]+\]\([^)]+\))/g);
      return linkParts.map((lp, k) => {
        const linkMatch = lp.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (linkMatch) {
          return (
            <a key={k} href={linkMatch[2]} className="text-[#00B4D8] underline hover:text-[#0096B8]">
              {linkMatch[1]}
            </a>
          );
        }
        return <span key={k}>{lp}</span>;
      });
    });
    return (
      <span key={i}>
        {rendered}
        {i < parts.length - 1 && <br />}
      </span>
    );
  });
}

// ── Component ────────────────────────────────────────────────────────────────

export function ChatBot() {
  const user = useAuthStore((s) => s.user);
  const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U';

  const [open, setOpen]         = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: user
        ? `Bonjour ${user.firstName} ! 👋 Comment puis-je vous aider aujourd'hui ? Je peux vous renseigner sur nos solutions SOC, EDR, XDR, les tarifs ou la conformité.`
        : "Bonjour ! 👋 Je suis l'assistant virtuel CYNA. Comment puis-je vous aider ? (SOC, EDR, XDR, tarifs, conformité...)",
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, messages]);

  const now = () =>
    new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { role: 'user', text, time: now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate typing delay (600–1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const botText = getBotResponse(text);
      setMessages((prev) => [...prev, { role: 'bot', text: botText, time: now() }]);
      setTyping(false);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Suggested questions
  const suggestions = [
    'Quelles sont vos solutions ?',
    'Quels sont vos tarifs ?',
    'Essai gratuit ?',
    'Conformité RGPD ?',
  ];

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#00B4D8] rounded-full flex items-center justify-center shadow-lg shadow-[#00B4D8]/30 hover:bg-[#0096B8] transition-all hover:scale-110 z-50 group"
          aria-label="Ouvrir le chat"
        >
          <MessageSquare className="w-7 h-7 text-[#0A1628]" />
          {/* Pulse dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-2 border-[#0A1628] animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 w-96 bg-[#0A1628] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 z-50 flex flex-col transition-all duration-200 ${
            minimized ? 'h-auto' : 'h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00B4D8] to-[#0096B8] rounded-t-2xl p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">Support CYNA</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                  <span className="text-xs text-white/80">En ligne — répond en quelques secondes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMinimized(!minimized)}
                className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label={minimized ? 'Agrandir' : 'Réduire'}
              >
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold ${
                      msg.role === 'bot'
                        ? 'bg-[#00B4D8]/20 border border-[#00B4D8]/30'
                        : 'bg-[#00B4D8]'
                    }`}>
                      {msg.role === 'bot'
                        ? <Bot className="w-3.5 h-3.5 text-[#00B4D8]" />
                        : <span className="text-[#0A1628]">{initials}</span>
                      }
                    </div>

                    {/* Bubble */}
                    <div className={`max-w-[75%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'bot'
                          ? 'bg-white/5 border border-white/10 rounded-tl-none text-gray-300'
                          : 'bg-[#00B4D8] rounded-tr-none text-[#0A1628] font-medium'
                      }`}>
                        {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
                      </div>
                      <div className="text-xs text-gray-600 mt-1 px-1">{msg.time}</div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {typing && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00B4D8]/20 border border-[#00B4D8]/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-[#00B4D8]" />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Suggested questions (shown only at the start) */}
              {messages.length <= 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        setTimeout(() => {
                          const userMsg: Message = { role: 'user', text: s, time: now() };
                          setMessages((prev) => [...prev, userMsg]);
                          setInput('');
                          setTyping(true);
                          setTimeout(() => {
                            const botText = getBotResponse(s);
                            setMessages((prev) => [...prev, { role: 'bot', text: botText, time: now() }]);
                            setTyping(false);
                          }, 700);
                        }, 0);
                      }}
                      className="text-xs px-3 py-1.5 bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8] rounded-full hover:bg-[#00B4D8]/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-white/10 flex-shrink-0">
                <div className="flex gap-2 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Posez votre question..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-[#00B4D8] rounded-xl flex items-center justify-center hover:bg-[#0096B8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4 text-[#0A1628]" />
                  </button>
                </div>
                <p className="text-center text-gray-600 text-xs mt-2">
                  Assistant virtuel CYNA — réponse humaine via <a href="/contact" className="text-gray-500 hover:text-gray-400 underline">formulaire contact</a>
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
