<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
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
