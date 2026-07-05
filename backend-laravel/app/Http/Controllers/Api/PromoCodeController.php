<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    // ── Admin CRUD ────────────────────────────────────────────────────────

    /**
     * GET /api/admin/promo-codes
     * Liste tous les codes promo (backoffice).
     */
    public function index(): JsonResponse
    {
        $promos = PromoCode::orderByDesc('created_at')->get();

        return response()->json($promos->map(fn($p) => [
            'id'           => $p->id,
            'code'         => $p->code,
            'type'         => $p->type,
            'value'        => (float) $p->value,
            'min_order_ht' => $p->min_order_ht !== null ? (float) $p->min_order_ht : null,
            'max_uses'     => $p->max_uses,
            'uses_count'   => $p->uses_count,
            'expires_at'   => $p->expires_at?->toDateString(),
            'is_active'    => $p->is_active,
            'created_at'   => $p->created_at,
        ]));
    }

    /**
     * POST /api/admin/promo-codes
     * Crée un code promo.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'         => 'required|string|max:50|unique:promo_codes,code',
            'type'         => 'required|in:percent,fixed',
            'value'        => 'required|numeric|min:0',
            'min_order_ht' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'expires_at'   => 'nullable|date|after:now',
            'is_active'    => 'boolean',
        ]);

        $data['code']      = strtoupper(trim($data['code']));
        $data['is_active'] = $data['is_active'] ?? true;

        $promo = PromoCode::create($data);

        return response()->json($promo, 201);
    }

    /**
     * PUT /api/admin/promo-codes/{promoCode}
     * Met à jour un code promo.
     */
    public function update(Request $request, PromoCode $promoCode): JsonResponse
    {
        $data = $request->validate([
            'code'         => 'sometimes|string|max:50|unique:promo_codes,code,' . $promoCode->id,
            'type'         => 'sometimes|in:percent,fixed',
            'value'        => 'sometimes|numeric|min:0',
            'min_order_ht' => 'nullable|numeric|min:0',
            'max_uses'     => 'nullable|integer|min:1',
            'expires_at'   => 'nullable|date',
            'is_active'    => 'boolean',
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        $promoCode->update($data);

        return response()->json($promoCode->fresh());
    }

    /**
     * DELETE /api/admin/promo-codes/{promoCode}
     * Supprime un code promo.
     */
    public function destroy(PromoCode $promoCode): JsonResponse
    {
        $promoCode->delete();

        return response()->json(null, 204);
    }

    // ── Public ────────────────────────────────────────────────────────────

    /**
     * POST /api/promo-codes/validate
     * Validates a promo code and returns the discount details.
     */
    public function validate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'     => 'required|string|max:50',
            'total_ht' => 'nullable|numeric|min:0',
        ]);

        $totalHt = isset($data['total_ht']) ? (float) $data['total_ht'] : null;

        $promo = PromoCode::whereRaw('UPPER(code) = ?', [strtoupper(trim($data['code']))])->first();

        if (!$promo) {
            return response()->json(['message' => 'Code promo invalide.'], 422);
        }

        if (!$promo->isValid($totalHt)) {
            if (!$promo->is_active) {
                return response()->json(['message' => 'Ce code promo n\'est plus actif.'], 422);
            }
            if ($promo->expires_at && $promo->expires_at->isPast()) {
                return response()->json(['message' => 'Ce code promo a expiré.'], 422);
            }
            if ($promo->max_uses !== null && $promo->uses_count >= $promo->max_uses) {
                return response()->json(['message' => 'Ce code promo a atteint son nombre maximum d\'utilisations.'], 422);
            }
            if ($promo->min_order_ht !== null && $totalHt !== null && $totalHt < (float) $promo->min_order_ht) {
                return response()->json([
                    'message' => sprintf(
                        'Ce code promo est valable pour toute commande supérieure à %s€ HT.',
                        number_format((float) $promo->min_order_ht, 2, ',', ' ')
                    ),
                ], 422);
            }
            return response()->json(['message' => 'Ce code promo n\'est pas applicable.'], 422);
        }

        $discountAmount = $totalHt !== null ? $promo->computeDiscount($totalHt) : null;
        $newTotalHt     = $totalHt !== null ? max(0, $totalHt - $discountAmount) : null;

        $label = $promo->type === 'percent'
            ? '-' . (int) $promo->value . '%'
            : '-' . number_format((float) $promo->value, 2, ',', ' ') . '€';

        return response()->json([
            'code'            => $promo->code,
            'type'            => $promo->type,
            'value'           => (float) $promo->value,
            'label'           => $label,
            'discount_amount' => $discountAmount,
            'new_total_ht'    => $newTotalHt,
        ]);
    }
}
