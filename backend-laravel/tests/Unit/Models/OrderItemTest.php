<?php

namespace Tests\Unit\Models;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Tests\TestCase;

class OrderItemTest extends TestCase
{
    public function test_fillable_contains_expected_fields(): void
    {
        $fillable = (new OrderItem())->getFillable();

        foreach (['order_id', 'product_id', 'quantity', 'price', 'plan'] as $field) {
            $this->assertContains($field, $fillable, "Champ attendu dans fillable : {$field}");
        }
    }

    public function test_price_is_cast_to_two_decimals(): void
    {
        $item = new OrderItem(['price' => '10.5']);
        $this->assertSame('10.50', $item->price);
    }

    public function test_quantity_is_cast_to_integer(): void
    {
        $item = new OrderItem(['quantity' => '3']);
        $this->assertIsInt($item->quantity);
        $this->assertSame(3, $item->quantity);
    }

    public function test_relations_are_belongs_to(): void
    {
        $this->assertSame(Order::class, get_class((new OrderItem())->order()->getRelated()));
        $this->assertSame(Product::class, get_class((new OrderItem())->product()->getRelated()));
    }
}
