<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    private string $systemPrompt = <<<'PROMPT'
Tu es l'assistant virtuel officiel de CYNA, une plateforme B2B de cybersécurité SaaS.
Réponds UNIQUEMENT en français, de façon professionnelle, concise et bienveillante.
Ne réponds qu'aux sujets liés à CYNA et à la cybersécurité.

=== PRODUITS CYNA ===

SOC (Security Operations Center) — Surveillance et détection de menaces en temps réel
• SOC Essentials : 699 €/mois — surveillance 8h/5j par des analystes SOC, alertes temps réel email/SMS, rapport mensuel
• SOC Premium    : 1 299 €/mois — surveillance 24h/24 7j/7, IA + machine learning, SOAR automatisé, conformité ISO 27001 / RGPD / NIS2

EDR (Endpoint Detection & Response) — Protection avancée des postes de travail
• EDR Enterprise : 899 €/mois — détection comportementale par IA, isolation automatique des endpoints compromis, analyse forensique, compatible Windows / macOS / Linux
• EDR Pro        : 1 199 €/mois — machine learning avancé + threat hunting actif

XDR (Extended Detection & Response) — Détection et réponse unifiées sur toute l'infrastructure
• XDR Suite      : 1 799 €/mois — corrélation d'événements multi-sources, SOAR intégré, +50 connecteurs natifs, dashboard threat intelligence
• XDR Enterprise : 2 499 €/mois — intégration SIEM complète, gestion multi-tenant pour MSSP, SOC 2 Type II, ISO 27001

=== INFORMATIONS COMMERCIALES ===
• Essai gratuit 14 jours sans carte bancaire sur tous les produits
• Réduction de 17 % en facturation annuelle par rapport au mensuel
• Déploiement cloud-native en moins de 30 minutes
• Plus de 500 entreprises protégées

=== CONFORMITÉ ===
Nos solutions couvrent nativement : RGPD (GDPR), NIS2, ISO 27001, SOC 2 Type II

=== SUPPORT ===
• Email : contact@cyna-it.fr
• Délai de réponse : 2 heures en heures ouvrées
• Support SOC 24/7 disponible pour les incidents urgents

=== RÈGLES IMPÉRATIVES ===
- Tes réponses doivent être courtes : 2 à 5 phrases maximum, sauf si un détail technique est explicitement demandé.
- Si tu ne connais pas la réponse ou si la question sort du cadre CYNA, dis-le clairement et invite l'utilisateur à contacter contact@cyna-it.fr ou à remplir le formulaire de contact.
- Ne promets jamais de fonctionnalités non mentionnées dans ce prompt.
- Pour les demandes commerciales avancées (négociation, cas d'usage très spécifiques), propose un rendez-vous avec l'équipe commerciale via contact@cyna-it.fr.
- Utilise "vous" (vouvoiement) systématiquement.
PROMPT;

    public function message(Request $request)
    {
        $validated = $request->validate([
            'message'           => 'required|string|max:2000',
            'history'           => 'array|max:20',
            'history.*.role'    => 'required|in:user,assistant',
            'history.*.content' => 'required|string|max:2000',
        ]);

        // Construire le tableau de messages pour Claude
        $messages = [];
        foreach ($validated['history'] ?? [] as $msg) {
            $messages[] = [
                'role'    => $msg['role'],
                'content' => $msg['content'],
            ];
        }
        $messages[] = [
            'role'    => 'user',
            'content' => $validated['message'],
        ];

        // Appel à l'API Anthropic
        $response = Http::withHeaders([
            'x-api-key'         => config('services.anthropic.key'),
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model'      => config('services.anthropic.model'),
            'max_tokens' => 1024,
            'system'     => $this->systemPrompt,
            'messages'   => $messages,
        ]);

        if (!$response->successful()) {
            Log::error('Anthropic API error', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(
                ['error' => 'Le service est temporairement indisponible. Veuillez réessayer ou contacter contact@cyna-it.fr.'],
                503
            );
        }

        $reply = $response->json('content.0.text') ?? '';

        // Détecter si une intervention humaine est nécessaire
        $requiresHuman = $this->needsHuman($reply);

        // Sauvegarder l'échange en base
        SupportMessage::create([
            'user_id'        => $request->user()?->id,
            'type'           => 'chatbot',
            'email'          => $request->user()?->email ?? 'anonymous',
            'message_body'   => "USER: {$validated['message']}\n\nBOT: {$reply}",
            'requires_human' => $requiresHuman,
            'status'         => 'new',
        ]);

        return response()->json(['reply' => $reply]);
    }

    private function needsHuman(string $reply): bool
    {
        $keywords = ['je ne sais pas', 'je n\'ai pas cette information', 'contacter notre équipe', 'contactez-nous', 'hors de ma portée'];
        $lower = strtolower($reply);
        foreach ($keywords as $kw) {
            if (str_contains($lower, $kw)) {
                return true;
            }
        }
        return false;
    }
}
