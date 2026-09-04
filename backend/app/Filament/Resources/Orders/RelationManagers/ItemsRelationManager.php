<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Produk dalam Pesanan';

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('product.images.url')
                    ->label('Gambar')
                    ->circular(),
                TextColumn::make('product.name')
                    ->label('Produk'),
                TextColumn::make('product.sku')
                    ->label('SKU'),
                TextColumn::make('price')
                    ->label('Harga')
                    ->money('IDR'),
                TextColumn::make('qty')
                    ->label('Qty'),
                TextColumn::make('subtotal')
                    ->label('Subtotal')
                    ->money('IDR')
                    ->getStateUsing(fn ($record) => $record->price * $record->qty),
            ]);
    }
}
