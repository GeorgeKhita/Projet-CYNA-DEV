import { useState } from 'react';
import { Mail, MessageSquare, Send, X } from 'lucide-react';

export function ContactPage() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Contactez-nous</h1>
          <p className="text-xl text-muted-foreground">Notre équipe est là pour vous aider</p>
        </div>

        <div className="bg-gradient-to-br from-card to-card border border-border rounded-xl p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-foreground font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="votre.email@entreprise.com"
                  className="w-full bg-muted/50 border border-border rounded-lg pl-11 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">Sujet</label>
              <input
                type="text"
                placeholder="Quel est l'objet de votre message ?"
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-foreground font-medium mb-2">Message</label>
              <textarea
                rows={6}
                placeholder="Décrivez votre demande en détail..."
                className="w-full bg-muted/50 border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#00B4D8] text-primary-foreground font-semibold rounded-lg hover:bg-[#0096B8] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Envoyer
            </button>
          </form>
        </div>
      </div>

      {/* Floating Chat Button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-[#00B4D8] rounded-full flex items-center justify-center shadow-lg shadow-[#00B4D8]/30 hover:bg-[#0096B8] transition-all hover:scale-110"
        >
          <MessageSquare className="w-7 h-7 text-primary-foreground" />
        </button>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-gradient-to-br from-card to-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#00B4D8] to-[#0096B8] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="text-foreground font-semibold">Support CYNA</div>
                <div className="text-xs text-foreground/80">En ligne</div>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 space-y-4 h-96 overflow-y-auto bg-background">
            {/* Bot Message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#00B4D8]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 border border-border rounded-lg rounded-tl-none p-3">
                  <p className="text-muted-foreground text-sm">
                    Bonjour ! Comment puis-je vous aider aujourd'hui ?
                  </p>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Il y a quelques instants</div>
              </div>
            </div>

            {/* User Message */}
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-8 h-8 bg-[#00B4D8] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-foreground text-sm font-semibold">JD</span>
              </div>
              <div className="flex-1 text-right">
                <div className="bg-[#00B4D8] rounded-lg rounded-tr-none p-3 inline-block">
                  <p className="text-primary-foreground text-sm font-medium">
                    Je cherche des infos sur votre solution EDR
                  </p>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Il y a quelques instants</div>
              </div>
            </div>

            {/* Bot Response */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-[#00B4D8]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-[#00B4D8]" />
              </div>
              <div className="flex-1">
                <div className="bg-muted/50 border border-border rounded-lg rounded-tl-none p-3">
                  <p className="text-muted-foreground text-sm">
                    Excellente question ! Notre solution EDR Enterprise offre une protection avancée des endpoints avec détection comportementale et réponse automatisée. Souhaitez-vous un essai gratuit de 14 jours ?
                  </p>
                </div>
                <div className="text-xs text-muted-foreground mt-1">À l'instant</div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-border bg-background">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tapez votre message..."
                className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B4D8] focus:border-transparent text-sm"
              />
              <button className="w-10 h-10 bg-[#00B4D8] rounded-lg flex items-center justify-center hover:bg-[#0096B8] transition-colors">
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
