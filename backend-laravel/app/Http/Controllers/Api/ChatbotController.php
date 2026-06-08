<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportMessage;
use Illuminate\Http\Request;

class ChatbotController extends Controller
{
    // Base de connaissance CYNA — clés = mots-clés, valeur = réponse
    private array $kb = [
        'soc' => [
            'keywords' => ['soc', 'security operations', 'surveillance', 'monitoring', 'supervision'],
            'reply'    => "Nous proposons deux offres SOC :\n\n**SOC Essentials** à 699 €/mois — surveillance 8h/5j, alertes temps réel, rapport mensuel.\n**SOC Premium** à 1 299 €/mois — surveillance 24/7, IA + machine learning, SOAR automatisé, conformité ISO 27001 / RGPD / NIS2.\n\nSouhaitez-vous en savoir plus sur l'une de ces offres ?",
        ],
        'edr' => [
            'keywords' => ['edr', 'endpoint', 'poste de travail', 'antivirus', 'detection comportementale'],
            'reply'    => "Nos solutions EDR :\n\n**EDR Enterprise** à 899 €/mois — détection comportementale par IA, isolation automatique des endpoints compromis, analyse forensique. Compatible Windows, macOS et Linux.\n**EDR Pro** à 1 199 €/mois — machine learning avancé et threat hunting actif.\n\nVous souhaitez un essai gratuit de 14 jours ?",
        ],
        'xdr' => [
            'keywords' => ['xdr', 'extended', 'siem', 'correlation', 'corrélation', 'multi-vecteur', 'multi vecteur'],
            'reply'    => "Nos solutions XDR :\n\n**XDR Suite** à 1 799 €/mois — corrélation multi-sources, SOAR intégré, +50 connecteurs natifs, dashboard threat intelligence.\n**XDR Enterprise** à 2 499 €/mois — intégration SIEM complète, gestion multi-tenant pour MSSP, certifications SOC 2 Type II et ISO 27001.\n\nQuelle infrastructure souhaitez-vous protéger ?",
        ],
        'prix' => [
            'keywords' => ['prix', 'tarif', 'coût', 'cout', 'combien', 'abonnement', 'facturation', 'mensuel', 'annuel'],
            'reply'    => "Nos tarifs :\n\n• SOC Essentials : **699 €/mois**\n• SOC Premium : **1 299 €/mois**\n• EDR Enterprise : **899 €/mois**\n• EDR Pro : **1 199 €/mois**\n• XDR Suite : **1 799 €/mois**\n• XDR Enterprise : **2 499 €/mois**\n\nEn facturation annuelle, vous bénéficiez d'une **réduction de 17 %**. Un essai gratuit de 14 jours est disponible sur tous les produits.",
        ],
        'essai' => [
            'keywords' => ['essai', 'gratuit', 'demo', 'démonstration', 'demonstration', 'test', '14 jours', 'sans engagement'],
            'reply'    => "Oui, nous proposons un **essai gratuit de 14 jours** sur l'ensemble de nos solutions, sans carte bancaire et sans engagement.\n\nRendez-vous sur notre catalogue pour démarrer votre essai ou contactez-nous à contact@cyna-it.fr.",
        ],
        'conformite' => [
            'keywords' => ['rgpd', 'gdpr', 'conformité', 'conformite', 'iso', 'nis2', 'réglementation', 'reglementation', 'certification'],
            'reply'    => "Nos solutions couvrent nativement les principales réglementations :\n\n• **RGPD / GDPR** — minimisation des données, sauvegardes chiffrées, logs 30 jours\n• **NIS2** — directive européenne sur la cybersécurité\n• **ISO 27001** — management de la sécurité de l'information\n• **SOC 2 Type II** — disponible sur XDR Enterprise\n\nBesoin d'un rapport de conformité spécifique ? Contactez-nous à contact@cyna-it.fr.",
        ],
        'contact' => [
            'keywords' => ['contact', 'support', 'aide', 'assistance', 'equipe', 'équipe', 'humain', 'parler', 'conseiller', 'commercial'],
            'reply'    => "Notre équipe est disponible pour vous accompagner :\n\n📧 **contact@cyna-it.fr**\n⏱ Délai de réponse : 2 heures en heures ouvrées\n🛡 Support SOC 24/7 pour les incidents urgents\n\nVous pouvez également remplir notre formulaire de contact.",
        ],
        'connexion' => [
            'keywords' => ['connexion', 'connecter', 'compte', 'inscription', 'créer', 'creer', 'login', 'mot de passe', 'password'],
            'reply'    => "Pour accéder à votre espace client, rendez-vous sur la page **Connexion**. Si vous n'avez pas encore de compte, vous pouvez vous inscrire en quelques minutes.\n\nEn cas de problème avec votre mot de passe, utilisez la fonction « Mot de passe oublié ».",
        ],
        'commande' => [
            'keywords' => ['commande', 'panier', 'acheter', 'souscrire', 'commander', 'achat', 'paiement'],
            'reply'    => "Pour souscrire à une solution CYNA :\n\n1. Parcourez notre **catalogue**\n2. Ajoutez le produit au panier\n3. Choisissez votre plan (mensuel ou annuel)\n4. Finalisez votre commande\n\nVous retrouverez ensuite vos abonnements dans votre **espace client**.",
        ],
        'integration' => [
            'keywords' => ['intégration', 'integration', 'compatible', 'api', 'déploiement', 'deploiement', 'infrastructure', 'connecteur'],
            'reply'    => "Nos solutions sont **cloud-native** et se déploient en moins de 30 minutes.\n\nElles s'intègrent nativement avec plus de **50 outils** (SIEM, SOAR, firewalls, ticketing...) via API ou connecteurs prébuilt.\n\nCompatibilité EDR : Windows, macOS, Linux.",
        ],
        'bonjour' => [
            'keywords' => ['bonjour', 'salut', 'hello', 'bonsoir', 'coucou', 'bonne journée'],
            'reply'    => "Bonjour ! Bienvenue sur le support CYNA. Comment puis-je vous aider aujourd'hui ?\n\nJe peux vous renseigner sur nos solutions **SOC**, **EDR**, **XDR**, nos **tarifs**, la **conformité** ou l'**essai gratuit**.",
        ],
    ];

    private string $fallback = "Je n'ai pas bien compris votre question. Vous pouvez me demander des informations sur nos solutions **SOC, EDR, XDR**, nos **tarifs**, l'**essai gratuit** ou la **conformité** (RGPD, NIS2, ISO 27001).\n\nPour une demande spécifique, contactez-nous à contact@cyna-it.fr.";

    public function message(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $reply = $this->match($validated['message']);
        $requiresHuman = $reply === $this->fallback;

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

    private function match(string $input): string
    {
        $normalized = mb_strtolower($input);
        // Retirer les accents pour une comparaison plus souple
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $normalized) ?: $normalized;

        foreach ($this->kb as $topic) {
            foreach ($topic['keywords'] as $keyword) {
                $kw = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $keyword) ?: $keyword;
                if (str_contains($normalized, $kw)) {
                    return $topic['reply'];
                }
            }
        }

        return $this->fallback;
    }
}
