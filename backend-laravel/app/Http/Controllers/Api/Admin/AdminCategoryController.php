<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    /**
     * GET /api/admin/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')->orderBy('display_order')->get();
        return response()->json($categories);
    }

    /**
     * POST /api/admin/categories
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100|unique:categories,name',
            'color'         => 'required|string|max:20',
            'description'   => 'nullable|string',
            'image'         => 'nullable|url|max:500',
            'display_order' => 'integer|min:0',
        ]);

        $data['display_order'] = $data['display_order'] ?? (Category::max('display_order') + 1);

        $category = Category::create($data);

        ActivityLog::record(
            $request->user()->id,
            'category_created',
            "Catégorie créée : {$category->name}",
            $request->ip()
        );

        return response()->json($category, 201);
    }

    /**
     * PUT /api/admin/categories/{category}
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'sometimes|string|max:100|unique:categories,name,' . $category->id,
            'color'         => 'sometimes|string|max:20',
            'description'   => 'nullable|string',
            'image'         => 'nullable|url|max:500',
            'display_order' => 'sometimes|integer|min:0',
        ]);

        $category->update($data);

        ActivityLog::record(
            $request->user()->id,
            'category_updated',
            "Catégorie modifiée : {$category->name}",
            $request->ip()
        );

        return response()->json($category);
    }

    /**
     * POST /api/admin/categories/reorder
     */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:categories,id',
        ]);

        foreach ($data['order'] as $position => $id) {
            Category::where('id', $id)->update(['display_order' => $position + 1]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }

    /**
     * DELETE /api/admin/categories/{category}
     */
    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->products()->count() > 0) {
            return response()->json([
                'message' => 'Impossible de supprimer : des produits sont liés à cette catégorie.',
            ], 422);
        }

        ActivityLog::record(
            $request->user()->id,
            'category_deleted',
            "Catégorie supprimée : {$category->name}",
            $request->ip()
        );

        $category->delete();

        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}
