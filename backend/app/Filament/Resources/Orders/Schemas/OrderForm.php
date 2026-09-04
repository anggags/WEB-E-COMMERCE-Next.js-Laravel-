<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('invoice_no')
                    ->label('No. Invoice')
                    ->disabled()
                    ->dehydrated(),
                TextInput::make('user.name')
                    ->label('Pembeli')
                    ->disabled()
                    ->dehydrated(),
                TextInput::make('total')
                    ->label('Total')
                    ->disabled()
                    ->dehydrated()
                    ->prefix('Rp'),
                Select::make('status')
                    ->label('Status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Dibayar',
                        'processing' => 'Diproses',
                        'shipped' => 'Dikirim',
                        'completed' => 'Selesai',
                        'cancelled' => 'Dibatalkan',
                    ])
                    ->required()
                    ->native(false),
            ]);
    }
}
