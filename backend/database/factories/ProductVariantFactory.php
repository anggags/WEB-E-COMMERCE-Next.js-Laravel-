<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Hitam', 'Putih', 'Merah', 'Biru', 'Hijau']),
            'extra_price' => fake()->randomFloat(2, 0, 50000),
            'stock' => fake()->numberBetween(0, 100),
        ];
    }
}
