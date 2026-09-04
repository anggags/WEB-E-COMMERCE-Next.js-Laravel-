<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['pending', 'success', 'failed']);
        return [
            'method' => fake()->randomElement(['bank_transfer', 'credit_card', 'ewallet', 'va', 'qris']),
            'status' => $status,
            'reference' => fake()->bothLetters(3) . fake()->numerify('########'),
            'paid_at' => $status === 'success' ? fake()->dateTimeBetween('-30 days', 'now') : null,
        ];
    }
}
