<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Models\Subscription;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $totalRevenue    = Order::where('status', 'paid')->sum('total');
        $activeClients   = User::where('role', 'user')->count();
        $activeContracts = Subscription::where('status', 'active')->count();
        $openTickets     = SupportMessage::where('status', 'new')->count();

        $lastMonthRevenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [now()->subMonths(2)->startOfMonth(), now()->subMonth()->endOfMonth()])
            ->sum('total');

        $thisMonthRevenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [now()->startOfMonth(), now()])
            ->sum('total');

        $revenueTrend = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        $categoryStats = Subscription::with('product.category')
            ->where('status', 'active')->get()
            ->groupBy(fn($s) => $s->product?->category?->name ?? 'Autre')
            ->map(fn($items, $cat) => ['name' => $cat, 'value' => $items->count()])
            ->values();

        $recentOrders = Order::with('user')->latest()->take(5)->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'ref'        => 'CYN-' . str_pad($o->id, 6, '0', STR_PAD_LEFT),
                'client'     => $o->user ? $o->user->first_name . ' ' . $o->user->last_name : 'N/A',
                'amount'     => (float) $o->total,
                'status'     => $o->status,
                'created_at' => $o->created_at,
            ]);

        return response()->json([
            'kpis' => [
                'total_revenue'    => (float) $totalRevenue,
                'active_clients'   => $activeClients,
                'active_contracts' => $activeContracts,
                'open_tickets'     => $openTickets,
                'revenue_trend'    => $revenueTrend,
            ],
            'category_stats' => $categoryStats,
            'recent_orders'  => $recentOrders,
        ]);
    }

    /**
     * Données graphiques des ventes avec ventilation par catégorie.
     *
     * ?period=daily  → 7 derniers jours   (défaut)
     * ?period=weekly → 5 dernières semaines
     */
    public function revenueChart(Request $request): JsonResponse
    {
        $period = $request->query('period', 'daily');

        if ($period === 'weekly') {
            $slots = $this->buildWeeklySlots();
        } else {
            $slots = $this->buildDailySlots();
        }

        // Collecte des catégories distinctes sur la période complète
        $allCategories = collect();

        $sales = collect($slots)->map(function (array $slot) use (&$allCategories) {
            $orders = Order::where('status', 'paid')
                ->whereBetween('created_at', [$slot['start'], $slot['end']])
                ->with('details.product.category')
                ->get();

            $total      = 0.0;
            $byCategory = [];

            foreach ($orders as $order) {
                foreach ($order->details as $detail) {
                    $cat    = $detail->product?->category?->name ?? 'Autre';
                    $amount = (float) $detail->total_price;
                    $total += $amount;
                    $byCategory[$cat] = ($byCategory[$cat] ?? 0.0) + $amount;
                }
            }

            $allCategories = $allCategories->merge(array_keys($byCategory));

            return [
                'label'      => $slot['label'],
                'total'      => round($total, 2),
                'categories' => $byCategory,
            ];
        });

        $categories = $allCategories->unique()->values()->toArray();

        // Normalise chaque slot pour qu'il ait toutes les catégories (0 si absent)
        $normalized = $sales->map(function (array $slot) use ($categories) {
            $entry = ['label' => $slot['label'], 'total' => $slot['total']];
            foreach ($categories as $cat) {
                $entry[$cat] = round($slot['categories'][$cat] ?? 0.0, 2);
            }
            return $entry;
        });

        // Totaux globaux par catégorie (pour camembert)
        $categoryTotals = collect($categories)->map(function (string $cat) use ($normalized) {
            return [
                'name'  => $cat,
                'value' => round($normalized->sum($cat), 2),
            ];
        })->values();

        return response()->json([
            'period'          => $period,
            'categories'      => $categories,
            'sales'           => $normalized->values(),
            'category_totals' => $categoryTotals,
        ]);
    }

    private function buildDailySlots(): array
    {
        return collect(range(6, 0))->map(function (int $daysAgo) {
            $day = now()->subDays($daysAgo);
            return [
                'label' => $day->locale('fr')->isoFormat('ddd D/MM'),
                'start' => $day->copy()->startOfDay(),
                'end'   => $day->copy()->endOfDay(),
            ];
        })->toArray();
    }

    private function buildWeeklySlots(): array
    {
        return collect(range(4, 0))->map(function (int $weeksAgo) {
            $week = now()->subWeeks($weeksAgo);
            return [
                'label' => 'S' . $week->weekOfYear . ' ' . $week->year,
                'start' => $week->copy()->startOfWeek(),
                'end'   => $week->copy()->endOfWeek(),
            ];
        })->toArray();
    }
}
