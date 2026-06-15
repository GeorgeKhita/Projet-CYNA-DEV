<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentMethodController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->paymentMethods()->latest()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'cardholder_name'  => 'nullable|string|max:150',
            'last_four_digits' => 'required|string|size:4',
            'expiry_date'      => 'required|string|size:5',
            'payment_token'    => 'nullable|string',
            'is_default'       => 'boolean',
        ]);

        return DB::transaction(function () use ($request, $data) {
            if (!empty($data['is_default'])) {
                $request->user()->paymentMethods()->update(['is_default' => false]);
            }

            $method = $request->user()->paymentMethods()->create($data);

            return response()->json($method, 201);
        });
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);

        $data = $request->validate([
            'cardholder_name' => 'nullable|string|max:150',
            'expiry_date'     => 'sometimes|string|size:5',
            'is_default'      => 'boolean',
        ]);

        return DB::transaction(function () use ($request, $method, $data) {
            if (!empty($data['is_default'])) {
                $request->user()->paymentMethods()->update(['is_default' => false]);
            }

            $method->update($data);

            return response()->json($method->fresh());
        });
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $method = $request->user()->paymentMethods()->findOrFail($id);
        $wasDefault = $method->is_default;
        $method->delete();

        if ($wasDefault) {
            $request->user()->paymentMethods()->latest()->first()?->update(['is_default' => true]);
        }

        return response()->json(null, 204);
    }
}
