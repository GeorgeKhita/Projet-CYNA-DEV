<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->where('status', 'available')
            ->orderBy('priority');

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('name', strtoupper($request->category)));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->get('sort') === 'price_asc') {
            $query->orderBy('price_monthly');
        } elseif ($request->get('sort') === 'price_desc') {
            $query->orderByDesc('price_monthly');
        }

        $products = $query->get()->map(fn($p) => $this->format($p));

        return response()->json($products);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')->findOrFail($id);
        return response()->json($this->format($product));
    }

    private function format(Product $p): array
    {
        return [
            'id'            => $p->id,
            'name'          => $p->name,
            'slug'          => $p->slug,
            'description'   => $p->description,
            'features'      => $p->features ?? [],
            'images'        => $p->images ?? [],
            'price_monthly' => (float) $p->price_monthly,
            'price_annual'  => (float) $p->price_annual,
            'status'        => $p->status,
            'priority'      => $p->priority,
            'category'      => $p->category?->name ?? '',
            'category_color'=> $p->category?->color ?? '#00B4D8',
            'category_id'   => $p->category_id,
        ];
    }
}
