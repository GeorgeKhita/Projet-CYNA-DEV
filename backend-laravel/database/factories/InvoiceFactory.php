<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class InvoiceFactory extends Factory
{
    public function definition(): array
    {
        static $counter = 1;

        return [
            'user_id'        => User::factory(),
            'order_id'       => Order::factory(),
            'invoice_number' => sprintf('CYN-%06d', $counter++),
            'amount'         => fake()->randomFloat(2, 50, 5000),
            'status'         => 'paid',
            'pdf_path'       => null,
        ];
    }
}
