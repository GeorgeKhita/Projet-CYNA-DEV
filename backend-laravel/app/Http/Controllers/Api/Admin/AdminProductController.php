<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->orderBy('priority')->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'name'          => 'required|string|max:150',
            'description'   => 'required|string',
            'features'      => 'nullable|array',
            'price_monthly' => 'required|numeric|min:0',
            'price_annual'  => 'required|numeric|min:0',
            'status'        => 'in:available,unavailable',
            'priority'      => 'integer|min:0',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . uniqid();

        $product = Product::create($data);

        return response()->json($this->format($product->load('category')), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($this->format($product->load('category')));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id'   => 'sometimes|exists:categories,id',
            'name'          => 'sometimes|string|max:150',
            'description'   => 'sometimes|string',
            'features'      => 'nullable|array',
            'price_monthly' => 'sometimes|numeric|min:0',
            'price_annual'  => 'sometimes|numeric|min:0',
            'status'        => 'in:available,unavailable',
            'priority'      => 'integer|min:0',
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']) . '-' . $product->id;
        }

        $product->update($data);

        return response()->json($this->format($product->load('category')));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Produit supprimé.']);
    }

    public function toggle(Product $product): JsonResponse
    {
        $product->update(['status' => $product->status === 'available' ? 'unavailable' : 'available']);
        return response()->json($this->format($product->load('category')));
    }

    private function format(Product $p): array
    {
        return [
            'id'            => $p->id,
            'name'          => $p->name,
            'slug'          => $p->slug,
            'description'   => $p->description,
            'features'      => $p->features ?? [],
            'price_monthly' => (float) $p->price_monthly,
            'price_annual'  => (float) $p->price_annual,
            'status'        => $p->status,
            'priority'      => $p->priority,
            'category'      => $p->category?->name,
            'category_color'=> $p->category?->color,
            'category_id'   => $p->category_id,
        ];
    }
}
