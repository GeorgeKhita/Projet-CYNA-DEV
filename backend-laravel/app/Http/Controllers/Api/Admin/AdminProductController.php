<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminProductController extends Controller
{
    /**
     * GET /api/admin/products
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $products = $query->latest()->paginate(20);

        return response()->json($products);
    }

    /**
     * POST /api/admin/products
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:200',
            'category'      => 'required|string|max:50',
            'description'   => 'required|string',
            'price_monthly' => 'required|numeric|min:0',
            'price_annual'  => 'required|numeric|min:0',
            'available'     => 'boolean',
            'popular'       => 'boolean',
        ]);

        $product = Product::create($data);

        ActivityLog::record(
            $request->user()->id,
            'product_created',
            "Produit créé : {$product->name}",
            $request->ip()
        );

        return response()->json($product, 201);
    }

    /**
     * GET /api/admin/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json($product);
    }

    /**
     * PUT /api/admin/products/{product}
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'sometimes|string|max:200',
            'category'      => 'sometimes|string|max:50',
            'description'   => 'sometimes|string',
            'price_monthly' => 'sometimes|numeric|min:0',
            'price_annual'  => 'sometimes|numeric|min:0',
            'available'     => 'boolean',
            'popular'       => 'boolean',
        ]);

        $product->update($data);

        ActivityLog::record(
            $request->user()->id,
            'product_updated',
            "Produit modifié : {$product->name}",
            $request->ip()
        );

        return response()->json($product);
    }

    /**
     * DELETE /api/admin/products/{product}
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        ActivityLog::record(
            $request->user()->id,
            'product_deleted',
            "Produit supprimé : {$product->name}",
            $request->ip()
        );

        $product->delete();

        return response()->json(['message' => 'Produit supprimé.']);
    }

    /**
     * PATCH /api/admin/products/{product}/toggle
     * Toggle disponibilité
     */
    public function toggle(Request $request, Product $product): JsonResponse
    {
        $product->update(['available' => ! $product->available]);

        ActivityLog::record(
            $request->user()->id,
            'product_toggled',
            "Disponibilité changée : {$product->name} → " . ($product->available ? 'Actif' : 'Inactif'),
            $request->ip()
        );

        return response()->json($product);
    }
}
