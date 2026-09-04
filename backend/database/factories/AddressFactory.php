<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AddressFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'label' => fake()->randomElement(['Rumah', 'Kantor', 'Kos', 'Gudang']),
            'recipient_name' => fake()->name(),
            'phone' => fake()->numerify('08##########'),
            'full_address' => fake()->address(),
            'city' => fake()->city(),
            'postal_code' => fake()->numerify('#####'),
            'is_default' => fake()->boolean(30),
        ];
    }
}
