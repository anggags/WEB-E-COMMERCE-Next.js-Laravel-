<?php

namespace Tests\Feature;

use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Orders\Pages\EditOrder;
use App\Filament\Resources\Payments\Pages\ListPayments;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Models\Order;
use App\Models\User;
use Database\Seeders\EcommerceSeeder;
use Filament\Pages\Dashboard;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class FilamentAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(EcommerceSeeder::class);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@tokoonline.com')->firstOrFail();
    }

    public function test_dashboard_renders_for_admin(): void
    {
        Livewire::actingAs($this->admin())
            ->test(Dashboard::class)
            ->assertSuccessful();
    }

    public function test_list_orders_renders(): void
    {
        Livewire::actingAs($this->admin())
            ->test(ListOrders::class)
            ->assertSuccessful();
    }

    public function test_edit_order_renders_with_items_relation(): void
    {
        $order = Order::query()->firstOrFail();
        Livewire::actingAs($this->admin())
            ->test(EditOrder::class, ['record' => $order->getKey()])
            ->assertSuccessful();
    }

    public function test_list_payments_renders(): void
    {
        Livewire::actingAs($this->admin())
            ->test(ListPayments::class)
            ->assertSuccessful();
    }

    public function test_list_users_renders(): void
    {
        Livewire::actingAs($this->admin())
            ->test(ListUsers::class)
            ->assertSuccessful();
    }

    public function test_non_admin_cannot_access_panel(): void
    {
        $customer = User::where('role', 'customer')->firstOrFail();
        $this->assertFalse($customer->canAccessPanel(\Filament\Facades\Filament::getDefaultPanel()));
    }

    public function test_admin_can_update_order_status(): void
    {
        $order = Order::query()->firstOrFail();
        Livewire::actingAs($this->admin())
            ->test(EditOrder::class, ['record' => $order->getKey()])
            ->fillForm(['status' => 'completed'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertDatabaseHas('orders', [
            'id' => $order->getKey(),
            'status' => 'completed',
        ]);
    }
}
