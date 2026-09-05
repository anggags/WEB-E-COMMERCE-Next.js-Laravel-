<?php

namespace Tests\Feature;

use App\Filament\Resources\Orders\Pages\ListOrders;
use App\Filament\Resources\Orders\Pages\EditOrder;
use App\Filament\Resources\Payments\Pages\ListPayments;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Products\Pages\ListProducts;
use App\Filament\Resources\Products\Pages\CreateProduct;
use App\Filament\Resources\Products\Pages\EditProduct;
use App\Filament\Resources\Categories\Pages\ListCategories;
use App\Filament\Resources\Categories\Pages\CreateCategory;
use App\Filament\Resources\Categories\Pages\EditCategory;
use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Models\Order;
use App\Models\Product;
use App\Models\Category;
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

    public function test_product_pages_render(): void
    {
        Livewire::actingAs($this->admin())
            ->test(ListProducts::class)
            ->assertSuccessful();

        Livewire::actingAs($this->admin())
            ->test(CreateProduct::class)
            ->assertSuccessful();

        $product = Product::query()->firstOrFail();
        Livewire::actingAs($this->admin())
            ->test(EditProduct::class, ['record' => $product->getKey()])
            ->assertSuccessful();
    }

    public function test_category_pages_render(): void
    {
        Livewire::actingAs($this->admin())
            ->test(ListCategories::class)
            ->assertSuccessful();

        Livewire::actingAs($this->admin())
            ->test(CreateCategory::class)
            ->assertSuccessful();

        $category = Category::query()->firstOrFail();
        Livewire::actingAs($this->admin())
            ->test(EditCategory::class, ['record' => $category->getKey()])
            ->assertSuccessful();
    }

    public function test_user_pages_render(): void
    {
        $user = User::where('role', 'customer')->firstOrFail();
        Livewire::actingAs($this->admin())
            ->test(CreateUser::class)
            ->assertSuccessful();

        Livewire::actingAs($this->admin())
            ->test(EditUser::class, ['record' => $user->getKey()])
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
