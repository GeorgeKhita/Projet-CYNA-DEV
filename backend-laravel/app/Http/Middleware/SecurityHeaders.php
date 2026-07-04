<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Ajoute les en-têtes de sécurité HTTP recommandés (OWASP) sur toutes les
 * réponses de l'API. Le TLS est terminé par le proxy (Railway/Vercel) : on
 * n'effectue donc pas de redirection ici, mais on envoie HSTS pour forcer le
 * navigateur à toujours utiliser HTTPS ensuite.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Empêche le navigateur de "deviner" un type MIME (protection XSS/upload).
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        // Interdit l'affichage du site dans une iframe (protection clickjacking).
        $response->headers->set('X-Frame-Options', 'DENY');
        // Limite les informations de référent envoyées vers d'autres domaines.
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        // Désactive les APIs sensibles du navigateur par défaut.
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // HSTS : uniquement quand la requête arrive en HTTPS (le proxy nous le
        // transmet via X-Forwarded-Proto). En local (http) on ne l'envoie pas
        // pour ne pas bloquer le développement.
        if ($request->isSecure()) {
            $response->headers->set(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
        }

        return $response;
    }
}
