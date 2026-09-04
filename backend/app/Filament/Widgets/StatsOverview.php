<?php

namespace App\Filament\Widgets;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Produk', Product::count())
                ->description('Produk aktif: ' . Product::where('is_active', true)->count())
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('primary'),
            Stat::make('Total Pesanan', Order::count())
                ->description('Pending: ' . Order::where('status', 'pending')->count())
                ->descriptionIcon('heroicon-m-shopping-cart')
                ->color('info'),
            Stat::make('Pendapatan', 'Rp ' . number_format(Order::where('status', 'completed')->sum('total'), 0, ',', '.'))
                ->description('Total pesanan selesai')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('success'),
            Stat::make('Pelanggan', User::where('role', 'customer')->count())
                ->description('Total customer terdaftar')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
        ];
    }
}
