<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Subscription;
use App\Models\SupportMessage;
use Illuminate\Http\JsonResponse;

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

    public function revenueChart(): JsonResponse
    {
        $months = collect(range(11, 0))->map(function ($i) {
            $month   = now()->subMonths($i);
            $revenue = Order::where('status', 'paid')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total');
            return ['month' => $month->locale('fr')->isoFormat('MMM YYYY'), 'revenue' => (float) $revenue];
        });

        return response()->json($months);
    }
}
