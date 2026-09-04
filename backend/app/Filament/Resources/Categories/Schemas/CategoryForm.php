<?php

namespace App\Filament\Resources\Categories\Schemas;

use App\Models\Category;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Nama Kategori')
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
                Select::make('parent_id')
                    ->label('Kategori Induk')
                    ->relationship('parent', 'name')
                    ->options(Category::whereNull('parent_id')->pluck('name', 'id'))
                    ->searchable()
                    ->placeholder('Tanpa induk (kategori utama)'),
            ]);
    }
}
