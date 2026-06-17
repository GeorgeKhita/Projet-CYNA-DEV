<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CompanyController extends Controller
{
    private const SIRENE_API = 'https://recherche-entreprises.api.gouv.fr/search';

    /**
     * GET /api/companies/search?q=...
     * Proxy vers l'API Sirene data.gouv.fr — aucune clé requise
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim($request->query('q', ''));

        if (mb_strlen($q) < 2) {
            return response()->json([]);
        }

        $response = Http::timeout(5)->get(self::SIRENE_API, [
            'q'        => $q,
            'per_page' => 10,
            'status_diffusion' => 'O',
        ]);

        if (! $response->successful()) {
            return response()->json([]);
        }

        $results = collect($response->json('results', []))
            ->map(fn($r) => [
                'siren'       => $r['siren'] ?? null,
                'label'       => $r['nom_complet'] ?? '',
                'city'        => $r['siege']['libelle_commune'] ?? '',
                'postal_code' => $r['siege']['code_postal'] ?? '',
                'siret'       => $r['siege']['siret'] ?? null,
            ])
            ->filter(fn($r) => $r['label'] && $r['siren'])
            ->values();

        return response()->json($results);
    }
}
