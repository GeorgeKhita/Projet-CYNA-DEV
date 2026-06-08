<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('display_order')
            ->withCount(['products' => fn($q) => $q->where('status', 'available')])
            ->get()
            ->map(fn($c) => [
                'id'            => $c->id,
                'name'          => $c->name,
                'description'   => $c->description,
                'color'         => $c->color,
                'display_order' => $c->display_order,
                'products_count'=> $c->products_count,
            ]);

        return response()->json($categories);
    }
}
