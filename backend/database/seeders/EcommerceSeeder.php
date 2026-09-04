<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class EcommerceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin Toko',
            'email' => 'admin@tokoonline.com',
            'role' => 'admin',
        ]);

        $customers = User::factory(8)->create(['role' => 'customer']);

        $allUsers = collect([$admin])->concat($customers);

        $categoriesData = [
            ['name' => 'Elektronik', 'slug' => 'elektronik', 'children' => [
                ['name' => 'Smartphone', 'slug' => 'smartphone'],
                ['name' => 'Laptop', 'slug' => 'laptop'],
                ['name' => 'Aksesoris HP', 'slug' => 'aksesoris-hp'],
                ['name' => 'Audio', 'slug' => 'audio'],
            ]],
            ['name' => 'Fashion Pria', 'slug' => 'fashion-pria', 'children' => [
                ['name' => 'Kaos', 'slug' => 'kaos-pria'],
                ['name' => 'Celana', 'slug' => 'celana-pria'],
                ['name' => 'Jaket', 'slug' => 'jaket-pria'],
            ]],
            ['name' => 'Fashion Wanita', 'slug' => 'fashion-wanita', 'children' => [
                ['name' => 'Dress', 'slug' => 'dress'],
                ['name' => 'Blouse', 'slug' => 'blouse'],
                ['name' => 'Rok', 'slug' => 'rok'],
            ]],
            ['name' => 'Rumah & Dapur', 'slug' => 'rumah-dapur', 'children' => [
                ['name' => 'Peralatan Masak', 'slug' => 'peralatan-masak'],
                ['name' => 'Dekorasi', 'slug' => 'dekorasi'],
            ]],
            ['name' => 'Kecantikan', 'slug' => 'kecantikan', 'children' => [
                ['name' => 'Skincare', 'slug' => 'skincare'],
                ['name' => 'Makeup', 'slug' => 'makeup'],
            ]],
            ['name' => 'Olahraga', 'slug' => 'olahraga', 'children' => [
                ['name' => 'Fitness', 'slug' => 'fitness'],
                ['name' => 'Outdoor', 'slug' => 'outdoor'],
            ]],
            ['name' => 'Makanan & Minuman', 'slug' => 'makanan-minuman', 'children' => [
                ['name' => 'Snack', 'slug' => 'snack'],
                ['name' => 'Minuman', 'slug' => 'minuman'],
            ]],
            ['name' => 'Bayi & Anak', 'slug' => 'bayi-anak', 'children' => [
                ['name' => 'Mainan', 'slug' => 'mainan'],
                ['name' => 'Pakaian Bayi', 'slug' => 'pakaian-bayi'],
            ]],
        ];

        $categories = collect();
        foreach ($categoriesData as $catData) {
            $parent = Category::create([
                'name' => $catData['name'],
                'slug' => $catData['slug'],
                'parent_id' => null,
            ]);
            $categories->push($parent);

            foreach ($catData['children'] as $childData) {
                $child = Category::create([
                    'name' => $childData['name'],
                    'slug' => $childData['slug'],
                    'parent_id' => $parent->id,
                ]);
                $categories->push($child);
            }
        }

        $productsPerCategory = [
            'smartphone' => [
                ['name' => 'Samsung Galaxy S24 Ultra', 'price' => 19999000, 'sku' => 'SMG-S24U', 'stock' => 25],
                ['name' => 'iPhone 15 Pro Max', 'price' => 22499000, 'sku' => 'APL-15PM', 'stock' => 15],
                ['name' => 'Xiaomi 14 Pro', 'price' => 8999000, 'sku' => 'XMI-14P', 'stock' => 40],
                ['name' => 'Google Pixel 8', 'price' => 9499000, 'sku' => 'GGL-PX8', 'stock' => 20],
            ],
            'laptop' => [
                ['name' => 'MacBook Air M3 15"', 'price' => 21999000, 'sku' => 'APL-MBA-M3', 'stock' => 12],
                ['name' => 'ASUS ROG Zephyrus G14', 'price' => 18999000, 'sku' => 'ASU-ROG-G14', 'stock' => 8],
                ['name' => 'Lenovo ThinkPad X1 Carbon', 'price' => 16499000, 'sku' => 'LEN-TP-X1', 'stock' => 10],
                ['name' => 'HP Spectre x360', 'price' => 15999000, 'sku' => 'HP-SP-X360', 'stock' => 14],
            ],
            'aksesoris-hp' => [
                ['name' => 'Case iPhone 15 Pro Clear', 'price' => 199000, 'sku' => 'ACC-CIP15', 'stock' => 100],
                ['name' => 'Charger USB-C GaN 65W', 'price' => 349000, 'sku' => 'ACC-GAN65', 'stock' => 80],
                ['name' => 'Tempered Glass Samsung S24', 'price' => 79000, 'sku' => 'ACC-TGS24', 'stock' => 150],
                ['name' => 'TWS Earbuds Pro', 'price' => 299000, 'sku' => 'ACC-TWS', 'stock' => 60],
            ],
            'audio' => [
                ['name' => 'Sony WH-1000XM5', 'price' => 4999000, 'sku' => 'SNY-XM5', 'stock' => 20],
                ['name' => 'JBL Charge 5', 'price' => 2499000, 'sku' => 'JBL-CH5', 'stock' => 25],
                ['name' => 'Marshall Stanmore III', 'price' => 5999000, 'sku' => 'MRS-SM3', 'stock' => 10],
            ],
            'kaos-pria' => [
                ['name' => 'Kaos Polos Cotton Combed 30s', 'price' => 89000, 'sku' => 'FKP-KOS-30', 'stock' => 200],
                ['name' => 'Kaos Graphic Oversize', 'price' => 149000, 'sku' => 'FKP-KOS-GO', 'stock' => 80],
                ['name' => 'Kaos Polo Ralph Lauren', 'price' => 399000, 'sku' => 'FKP-KOS-PL', 'stock' => 30],
            ],
            'celana-pria' => [
                ['name' => 'Celana Chino Slim Fit', 'price' => 249000, 'sku' => 'FKP-CLN-CF', 'stock' => 50],
                ['name' => 'Celana Jogger Cargo', 'price' => 199000, 'sku' => 'FKP-CLN-JC', 'stock' => 60],
                ['name' => 'Jeans Straight Blue', 'price' => 349000, 'sku' => 'FKP-CLN-JS', 'stock' => 40],
            ],
            'jaket-pria' => [
                ['name' => 'Jaket Windbreaker Waterproof', 'price' => 399000, 'sku' => 'FKP-JKT-WB', 'stock' => 25],
                ['name' => 'Hoodie Oversize Premium', 'price' => 299000, 'sku' => 'FKP-JKT-HO', 'stock' => 35],
            ],
            'dress' => [
                ['name' => 'Dress Floral Midi', 'price' => 299000, 'sku' => 'FKW-DRS-FM', 'stock' => 30],
                ['name' => 'Maxi Dress Elegant', 'price' => 449000, 'sku' => 'FKW-DRS-ME', 'stock' => 20],
                ['name' => 'Casual Sundress', 'price' => 199000, 'sku' => 'FKW-DRS-CS', 'stock' => 45],
            ],
            'blouse' => [
                ['name' => 'Blouse Silk Premium', 'price' => 349000, 'sku' => 'FKW-BLS-SP', 'stock' => 25],
                ['name' => 'Kimono Wrap Blouse', 'price' => 249000, 'sku' => 'FKW-BLS-KW', 'stock' => 30],
            ],
            'rok' => [
                ['name' => 'Rok Plaid A-Line', 'price' => 179000, 'sku' => 'FKW-RKL-PA', 'stock' => 40],
                ['name' => 'Rok Denim Mini', 'price' => 199000, 'sku' => 'FKW-RKL-DM', 'stock' => 35],
            ],
            'peralatan-masak' => [
                ['name' => 'Panci Stainless Steel Set', 'price' => 499000, 'sku' => 'RHD-PNC-SS', 'stock' => 15],
                ['name' => 'Blender Portable USB', 'price' => 149000, 'sku' => 'RHD-BLP-UB', 'stock' => 50],
                ['name' => 'Air Fryer 5.5L Digital', 'price' => 899000, 'sku' => 'RHD-AFR-DG', 'stock' => 20],
            ],
            'dekorasi' => [
                ['name' => 'Lampu LED Hias Gantung', 'price' => 199000, 'sku' => 'RHD-LMP-GH', 'stock' => 40],
                ['name' => 'Vas Bunga Keramik Minimalis', 'price' => 149000, 'sku' => 'RHD-VAS-KM', 'stock' => 30],
            ],
            'skincare' => [
                ['name' => 'Serum Vitamin C 20ml', 'price' => 189000, 'sku' => 'KCT-SVC-20', 'stock' => 60],
                ['name' => 'Sunscreen SPF 50 PA+++', 'price' => 129000, 'sku' => 'KCT-SNS-50', 'stock' => 80],
                ['name' => 'Moisturizer Gel Hyaluronic', 'price' => 159000, 'sku' => 'KCT-MGH-30', 'stock' => 70],
                ['name' => 'Toner AHA BHA Exfoliating', 'price' => 119000, 'sku' => 'KCT-TAB-10', 'stock' => 55],
            ],
            'makeup' => [
                ['name' => 'Foundation Liquid Full Coverage', 'price' => 249000, 'sku' => 'KCT-FLC-30', 'stock' => 40],
                ['name' => 'Lip Cream Matte 12 Colors', 'price' => 199000, 'sku' => 'KCT-LCM-12', 'stock' => 50],
                ['name' => 'Palette Eyeshadow 18 Colors', 'price' => 299000, 'sku' => 'KCT-PEY-18', 'stock' => 35],
            ],
            'fitness' => [
                ['name' => 'Dumbbell Adjustable Set 20kg', 'price' => 899000, 'sku' => 'OLH-DBA-20', 'stock' => 15],
                ['name' => 'Yoga Mat Anti-Slip 8mm', 'price' => 199000, 'sku' => 'OLH-YMA-8M', 'stock' => 40],
                ['name' => 'Resistance Band Set 5pcs', 'price' => 149000, 'sku' => 'OLH-RBS-5P', 'stock' => 50],
            ],
            'outdoor' => [
                ['name' => 'Tas Ransel Waterproof 40L', 'price' => 499000, 'sku' => 'OLH-TRW-40', 'stock' => 20],
                ['name' => 'Sepatu Hiking Trail', 'price' => 799000, 'sku' => 'OLH-SHT-TR', 'stock' => 18],
            ],
            'snack' => [
                ['name' => 'Keripik Singkong Balado 500gr', 'price' => 35000, 'sku' => 'MNM-KSB-50', 'stock' => 100],
                ['name' => 'Dark Chocolate Premium 70%', 'price' => 69000, 'sku' => 'MNM-DCP-70', 'stock' => 80],
                ['name' => 'Granola Mix Premium 300gr', 'price' => 59000, 'sku' => 'MNM-GRM-30', 'stock' => 60],
            ],
            'minuman' => [
                ['name' => 'Kopi Arabica Gayo 250gr', 'price' => 89000, 'sku' => 'MNM-KAG-25', 'stock' => 70],
                ['name' => 'Teh Matcha Premium 50gr', 'price' => 79000, 'sku' => 'MNM-TMP-50', 'stock' => 50],
                ['name' => 'Susu Oat Milk 1L', 'price' => 45000, 'sku' => 'MNM-SOM-1L', 'stock' => 90],
            ],
            'mainan' => [
                ['name' => 'LEGO Technic Race Car', 'price' => 1299000, 'sku' => 'BYA-LTR-RC', 'stock' => 12],
                ['name' => 'Puzzle 1000 Pieces Landscape', 'price' => 149000, 'sku' => 'BYA-PZL-1K', 'stock' => 30],
                ['name' => 'RC Drone Mini dengan Camera', 'price' => 499000, 'sku' => 'BYA-RDM-CM', 'stock' => 20],
            ],
            'pakaian-bayi' => [
                ['name' => 'Setelan Bayi Katun 3pcs', 'price' => 129000, 'sku' => 'BYA-SBK-3P', 'stock' => 40],
                ['name' => 'Selimut Bayi Bulu Lembut', 'price' => 159000, 'sku' => 'BYA-SBL-FL', 'stock' => 25],
            ],
        ];

        $allProducts = collect();
        $slugCounters = [];

        foreach ($productsPerCategory as $slug => $items) {
            $category = Category::where('slug', $slug)->first();
            if (!$category) continue;

            foreach ($items as $item) {
                $baseSlug = Str::slug($item['name']);
                $slugCounters[$baseSlug] = ($slugCounters[$baseSlug] ?? 0) + 1;
                $finalSlug = $slugCounters[$baseSlug] > 1
                    ? $baseSlug . '-' . $slugCounters[$baseSlug]
                    : $baseSlug;

                $product = Product::create([
                    'category_id' => $category->id,
                    'name' => $item['name'],
                    'slug' => $finalSlug,
                    'description' => "Deskripsi lengkap untuk {$item['name']}. Produk berkualitas tinggi dengan garansi resmi. Cocok untuk kebutuhan sehari-hari Anda.",
                    'price' => $item['price'],
                    'stock' => $item['stock'],
                    'sku' => $item['sku'],
                    'is_active' => true,
                ]);

                $imageCount = rand(2, 4);
                for ($i = 0; $i < $imageCount; $i++) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'url' => "https://placehold.co/600x400/f0f0f0/333?text=" . urlencode($item['name']) . "+" . ($i + 1),
                        'sort_order' => $i,
                    ]);
                }

                if (in_array($category->slug, ['smartphone', 'laptop', 'kaos-pria', 'celana-pria', 'dress'])) {
                    $variantNames = match(true) {
                        str_contains($category->slug, 'smartphone') => ['128GB', '256GB', '512GB', '1TB'],
                        str_contains($category->slug, 'laptop') => ['16GB/512GB', '16GB/1TB', '32GB/1TB'],
                        str_contains($category->slug, 'kaos') => ['S', 'M', 'L', 'XL', 'XXL'],
                        str_contains($category->slug, 'celana') => ['28', '30', '32', '34', '36'],
                        default => ['S', 'M', 'L', 'XL'],
                    };
                    foreach ($variantNames as $vName) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'name' => $vName,
                            'extra_price' => fake()->randomElement([0, 0, 0, 50000, 100000, 150000]),
                            'stock' => rand(5, $item['stock']),
                        ]);
                    }
                }

                $allProducts->push($product);
            }
        }

        foreach ($customers as $customer) {
            $addrCount = rand(1, 3);
            for ($i = 0; $i < $addrCount; $i++) {
                Address::create([
                    'user_id' => $customer->id,
                    'label' => $i === 0 ? 'Rumah' : fake()->randomElement(['Kantor', 'Kos', 'Orang Tua']),
                    'recipient_name' => $customer->name,
                    'phone' => fake()->numerify('08##########'),
                    'full_address' => fake()->address(),
                    'city' => fake()->randomElement(['Jakarta Selatan', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang', 'Medan', 'Makassar', 'Bali']),
                    'postal_code' => fake()->numerify('#####'),
                    'is_default' => $i === 0,
                ]);
            }
        }

        foreach ($customers as $customer) {
            $cart = Cart::create(['user_id' => $customer->id]);
            $itemCount = rand(1, 4);
            $shuffled = $allProducts->shuffle()->take($itemCount);
            foreach ($shuffled as $product) {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'variant_id' => $product->variants()->exists()
                        ? $product->variants()->inRandomOrder()->first()->id
                        : null,
                    'qty' => rand(1, 3),
                ]);
            }
        }

        $reviewComments = [
            5 => 'Sangat puas! Produk sesuai deskripsi, pengiriman cepat.',
            4 => 'Bagus, kualitas oke. Pengiriman sedikit telat tapi overall memuaskan.',
            3 => 'Lumayan, sesuai harga. Tapi ada sedikit cacat kecil.',
            2 => 'Kurang sesuai ekspektasi. Bahan agak tipis.',
            1 => 'Kecewa, produk tidak sesuai foto.',
        ];

        foreach ($customers as $customer) {
            $reviewCount = rand(1, 4);
            $reviewProducts = $allProducts->shuffle()->take($reviewCount);
            foreach ($reviewProducts as $product) {
                $ratingWeights = [1 => 5, 2 => 10, 3 => 25, 4 => 35, 5 => 25];
                $totalWeight = array_sum($ratingWeights);
                $random = mt_rand(1, $totalWeight);
                $rating = 1;
                foreach ($ratingWeights as $value => $weight) {
                    $random -= $weight;
                    if ($random <= 0) {
                        $rating = $value;
                        break;
                    }
                }
                Review::create([
                    'user_id' => $customer->id,
                    'product_id' => $product->id,
                    'rating' => $rating,
                    'comment' => $reviewComments[$rating],
                ]);
            }
        }

        foreach ($customers as $customer) {
            $wishlistProducts = $allProducts->shuffle()->take(rand(2, 6));
            foreach ($wishlistProducts as $product) {
                Wishlist::create([
                    'user_id' => $customer->id,
                    'product_id' => $product->id,
                ]);
            }
        }

        foreach ($customers->random(5) as $customer) {
            $address = $customer->addresses()->first();
            if (!$address) continue;

            $orderCount = rand(1, 3);
            for ($o = 0; $o < $orderCount; $o++) {
                $orderProducts = $allProducts->shuffle()->take(rand(1, 4));
                $total = 0;

                $order = Order::create([
                    'user_id' => $customer->id,
                    'address_id' => $address->id,
                    'invoice_no' => 'INV-' . strtoupper(Str::random(2)) . '-' . str_pad(mt_rand(1, 9999999), 7, '0', STR_PAD_LEFT),
                    'status' => fake()->randomElement(['pending', 'paid', 'processing', 'shipped', 'completed', 'completed', 'completed']),
                    'total' => 0,
                ]);

                foreach ($orderProducts as $product) {
                    $qty = rand(1, 2);
                    $itemPrice = $product->price;
                    $total += $itemPrice * $qty;

                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'qty' => $qty,
                        'price' => $itemPrice,
                    ]);
                }

                $order->update(['total' => $total]);

                Payment::create([
                    'order_id' => $order->id,
                    'method' => fake()->randomElement(['bank_transfer', 'credit_card', 'ewallet', 'va', 'qris']),
                    'status' => match ($order->status) {
                        'pending' => 'pending',
                        'cancelled' => 'failed',
                        default => 'success',
                    },
                    'reference' => strtoupper(Str::random(3)) . '-' . mt_rand(10000000, 99999999),
                    'paid_at' => in_array($order->status, ['paid', 'processing', 'shipped', 'completed'])
                        ? fake()->dateTimeBetween('-30 days', '-1 day')
                        : null,
                ]);
            }
        }

        $this->command->info("Seed completed!");
        $this->command->info("Users: " . User::count());
        $this->command->info("Categories: " . Category::count());
        $this->command->info("Products: " . Product::count());
        $this->command->info("Product Images: " . ProductImage::count());
        $this->command->info("Product Variants: " . ProductVariant::count());
        $this->command->info("Addresses: " . Address::count());
        $this->command->info("Carts: " . Cart::count());
        $this->command->info("Cart Items: " . CartItem::count());
        $this->command->info("Orders: " . Order::count());
        $this->command->info("Order Items: " . OrderItem::count());
        $this->command->info("Payments: " . Payment::count());
        $this->command->info("Reviews: " . Review::count());
        $this->command->info("Wishlists: " . Wishlist::count());
    }
}
