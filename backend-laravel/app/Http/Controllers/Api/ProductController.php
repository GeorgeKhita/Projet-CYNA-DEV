<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Liste les produits avec filtres optionnels
     * ?category=SOC, ?search=premium, ?sort=price_asc|price_desc|popular
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('available', true);

        // Filtre par catégorie
        if ($request->filled('category')) {
            $query->where('category', strtoupper($request->category));
        }

        // Recherche par nom
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Tri
        switch ($request->get('sort', 'order')) {
            case 'price_asc':
                $query->orderBy('price_monthly', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_monthly', 'desc');
                break;
            case 'popular':
                $query->orderByDesc('popular')->orderBy('order');
                break;
            default:
                $query->orderBy('order');
        }

        return response()->json($query->get());
    }

    /**
     * Retourne un produit par son ID
     */
    public function show(int $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json($product);
    }
}
