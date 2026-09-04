<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = fake()->words(3, true);
        return [
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => fake()->paragraphs(3, true),
            'price' => fake()->randomFloat(2, 15000, 5000000),
            'stock' => fake()->numberBetween(0, 200),
            'sku' => strtoupper(fake()->bothLetters(3) . fake()->numerify('####')),
            'is_active' => fake()->boolean(85),
        ];
    }
}
