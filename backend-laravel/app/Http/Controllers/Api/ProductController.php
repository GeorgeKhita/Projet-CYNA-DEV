<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->withCount(['subscriptions as active_subscriptions_count' => fn($q) => $q->whereIn('status', ['active', 'past_due'])])
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

        $perPage  = min((int) ($request->get('per_page', 12)), 50);
        $paginated = $query->paginate($perPage)->through(fn($p) => $this->format($p));

        return response()->json($paginated);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q'           => 'nullable|string|max:100',
            'category_id' => 'nullable|integer|exists:categories,id',
            'price_min'   => 'nullable|numeric|min:0',
            'price_max'   => 'nullable|numeric|min:0',
            'sort'        => 'nullable|in:price_asc,price_desc,name_asc,name_desc',
        ]);

        $query = Product::with('category')
            ->withCount(['subscriptions as active_subscriptions_count' => fn($q) => $q->whereIn('status', ['active', 'past_due'])]);

        if ($request->filled('q')) {
            $term = '%' . $request->q . '%';
            $query->where(fn($q) => $q
                ->where('name', 'like', $term)
                ->orWhere('description', 'like', $term)
            );
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('price_min')) {
            $query->where('price_monthly', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price_monthly', '<=', $request->price_max);
        }

        match ($request->get('sort')) {
            'price_asc'  => $query->orderBy('price_monthly'),
            'price_desc' => $query->orderByDesc('price_monthly'),
            'name_asc'   => $query->orderBy('name'),
            'name_desc'  => $query->orderByDesc('name'),
            default      => $query->orderBy('priority'),
        };

        $products = $query->get();

        return response()->json([
            'results' => $products->map(fn($p) => $this->format($p)),
            'facets'  => [
                'total'      => $products->count(),
                'categories' => Category::whereIn('id', $products->pluck('category_id')->unique())
                    ->get(['id', 'name', 'color']),
                'price_range' => [
                    'min' => (float) ($products->min('price_monthly') ?? 0),
                    'max' => (float) ($products->max('price_monthly') ?? 0),
                ],
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = Product::with('category')
            ->withCount(['subscriptions as active_subscriptions_count' => fn($q) => $q->whereIn('status', ['active', 'past_due'])])
            ->findOrFail($id);
        return response()->json($this->format($product));
    }

    private function format(Product $p): array
    {
        $lang  = request()->query('lang', request()->header('Accept-Language', 'fr'));
        $useEn = str_starts_with((string) $lang, 'en');

        $maxCapacity  = $p->max_capacity;
        $activeCount  = (int) ($p->active_subscriptions_count ?? 0);
        $inStock      = $maxCapacity === null || $activeCount < $maxCapacity;
        $stockRemaining = $maxCapacity !== null ? max(0, $maxCapacity - $activeCount) : null;

        return [
            'id'               => $p->id,
            'name'             => ($useEn && $p->name_en) ? $p->name_en : $p->name,
            'slug'             => $p->slug,
            'description'      => ($useEn && $p->description_en) ? $p->description_en : $p->description,
            'features'         => ($useEn && $p->features_en) ? $p->features_en : ($p->features ?? []),
            'images'           => $p->images ?? [],
            'price_monthly'    => (float) $p->price_monthly,
            'price_annual'     => (float) $p->price_annual,
            'status'           => $p->status,
            'priority'         => $p->priority,
            'category'         => $p->category?->name ?? '',
            'category_color'   => $p->category?->color ?? '#00B4D8',
            'category_id'      => $p->category_id,
            'max_capacity'     => $maxCapacity,
            'subscriptions_count' => $activeCount,
            'stock_remaining'  => $stockRemaining,
            'in_stock'         => $inStock,
        ];
    }
}
