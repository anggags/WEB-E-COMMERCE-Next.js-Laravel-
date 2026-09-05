<?php

namespace App\Filament\Resources\Products\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Informasi Dasar')
                    ->schema([
                        Select::make('category_id')
                            ->relationship('category', 'name')
                            ->label('Kategori')
                            ->required(),
                        TextInput::make('name')
                            ->label('Nama Produk')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(
                                fn ($state, callable $set) => blank($state)
                                    ? null
                                    : $set('slug', Str::slug($state))
                            ),
                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('sku')
                            ->label('SKU')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('price')
                            ->label('Harga')
                            ->required()
                            ->numeric()
                            ->prefix('Rp'),
                        TextInput::make('stock')
                            ->label('Stok')
                            ->required()
                            ->numeric()
                            ->default(0),
                        Textarea::make('description')
                            ->label('Deskripsi')
                            ->columnSpanFull(),
                        Toggle::make('is_active')
                            ->label('Aktif')
                            ->inline(false)
                            ->default(true),
                    ])->columns(2),

                Section::make('Gambar Produk')
                    ->schema([
                        Repeater::make('images')
                            ->label('Gambar')
                            ->relationship('images')
                            ->schema([
                                FileUpload::make('url')
                                    ->image()
                                    ->directory('products')
                                    ->imageEditor()
                                    ->required(),
                                TextInput::make('sort_order')
                                    ->label('Urutan')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->orderable('sort_order')
                            ->defaultItems(0)
                            ->reorderableWithButtons(),
                    ]),

                Section::make('Varian Produk')
                    ->schema([
                        Repeater::make('variants')
                            ->label('Varian')
                            ->relationship('variants')
                            ->schema([
                                TextInput::make('name')
                                    ->label('Nama Varian')
                                    ->required(),
                                TextInput::make('extra_price')
                                    ->label('Harga Tambahan')
                                    ->numeric()
                                    ->prefix('Rp')
                                    ->default(0),
                                TextInput::make('stock')
                                    ->label('Stok')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->defaultItems(0)
                            ->reorderableWithButtons(),
                    ]),
            ]);
    }
}
