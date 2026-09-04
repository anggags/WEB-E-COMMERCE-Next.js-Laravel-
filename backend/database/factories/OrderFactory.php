<?php

namespace Database\Factories;

use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'invoice_no' => 'INV-' . strtoupper(fake()->bothLetters(2)) . '-' . fake()->numerify('#######'),
            'status' => fake()->randomElement(['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled']),
            'total' => fake()->randomFloat(2, 50000, 10000000),
        ];
    }
}
