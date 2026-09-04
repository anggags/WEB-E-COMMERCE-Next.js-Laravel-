<?php

namespace Database\Factories;

use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        return [
            'qty' => fake()->numberBetween(1, 3),
            'price' => fake()->randomFloat(2, 15000, 5000000),
        ];
    }
}
