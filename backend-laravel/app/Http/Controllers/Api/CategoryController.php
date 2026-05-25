<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    /**
     * Liste les catégories visibles
     */
    public function index(): JsonResponse
    {
        $categories = Category::where('visible', true)
            ->withCount(['products' => fn ($q) => $q->where('available', true)])
            ->get();

        return response()->json($categories);
    }
}
