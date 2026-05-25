<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Subscription;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard
     * KPIs principaux du tableau de bord
     */
    public function index(): JsonResponse
    {
        $totalRevenue   = Order::where('status', 'paid')->sum('total');
        $activeClients  = User::where('role', 'user')->where('is_active', true)->count();
        $activeContracts = Subscription::where('status', 'active')->count();
        $openTickets    = 0; // Placeholder — à connecter au système de tickets

        // Tendances (vs mois précédent)
        $lastMonthRevenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [
                now()->subMonths(2)->startOfMonth(),
                now()->subMonth()->endOfMonth(),
            ])
            ->sum('total');

        $thisMonthRevenue = Order::where('status', 'paid')
            ->whereBetween('created_at', [now()->startOfMonth(), now()])
            ->sum('total');

        $revenueTrend = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // Répartition par catégorie
        $categoryStats = Subscription::with('product')
            ->where('status', 'active')
            ->get()
            ->groupBy(fn($s) => $s->product->category ?? 'Autre')
            ->map(fn($items, $cat) => [
                'name'  => $cat,
                'value' => $items->count(),
            ])
            ->values();

        // Commandes récentes
        $recentOrders = Order::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($o) => [
                'id'         => $o->id,
                'ref'        => 'CMD-' . str_pad($o->id, 4, '0', STR_PAD_LEFT),
                'client'     => $o->user
                    ? $o->user->first_name . ' ' . $o->user->last_name
                    : 'N/A',
                'amount'     => $o->total,
                'status'     => $o->status,
                'created_at' => $o->created_at,
            ]);

        // Logs récents
        $recentLogs = ActivityLog::latest()->take(5)->get();

        return response()->json([
            'kpis' => [
                'total_revenue'    => $totalRevenue,
                'active_clients'   => $activeClients,
                'active_contracts' => $activeContracts,
                'open_tickets'     => $openTickets,
                'revenue_trend'    => $revenueTrend,
            ],
            'category_stats' => $categoryStats,
            'recent_orders'  => $recentOrders,
            'recent_logs'    => $recentLogs,
        ]);
    }

    /**
     * GET /api/admin/dashboard/revenue-chart
     * Données de CA sur 12 mois pour le graphique
     */
    public function revenueChart(): JsonResponse
    {
        $months = collect(range(11, 0))->map(function ($i) {
            $month = now()->subMonths($i);
            $revenue = Order::where('status', 'paid')
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->sum('total');

            return [
                'month'   => $month->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        });

        return response()->json($months);
    }
}
