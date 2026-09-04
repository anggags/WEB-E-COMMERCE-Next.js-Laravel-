<?php

namespace Database\Factories;

use App\Models\ProductImage;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProductImageFactory extends Factory
{
    protected $model = ProductImage::class;

    public function definition(): array
    {
        return [
            'url' => fake()->imageUrl(600, 400, 'product', true),
            'sort_order' => fake()->numberBetween(0, 10),
        ];
    }
}
