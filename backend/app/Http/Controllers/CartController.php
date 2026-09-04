<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartItemRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->getOrCreateCart($request->user());

        $cart->load(['items.product.images', 'items.variant']);

        return new CartResource($cart);
    }

    public function addItem(StoreCartItemRequest $request)
    {
        $cart = $this->getOrCreateCart($request->user());

        $product = Product::findOrFail($request->product_id);

        if (!$product->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak aktif.',
            ], 422);
        }

        $variant = $request->variant_id
            ? ProductVariant::where('id', $request->variant_id)->where('product_id', $product->id)->first()
            : null;

        if ($request->variant_id && !$variant) {
            return response()->json([
                'success' => false,
                'message' => 'Varian tidak ditemukan untuk produk ini.',
            ], 422);
        }

        $existing = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->where('variant_id', $request->variant_id)
            ->first();

        if ($existing) {
            $existing->increment('qty', $request->qty);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'qty' => $request->qty,
            ]);
        }

        $cart->load(['items.product.images', 'items.variant']);

        return new CartResource($cart);
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $item)
    {
        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan.',
            ], 404);
        }

        $item->update(['qty' => $request->qty]);
        $item->cart->load(['items.product.images', 'items.variant']);

        return new CartResource($item->cart);
    }

    public function removeItem(Request $request, CartItem $item)
    {
        if ($item->cart->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Item tidak ditemukan.',
            ], 404);
        }

        $cartId = $item->cart_id;
        $item->delete();

        $cart = Cart::where('id', $cartId)->with(['items.product.images', 'items.variant'])->first();

        return new CartResource($cart);
    }

    public function clear(Request $request)
    {
        $cart = $this->getOrCreateCart($request->user());
        $cart->items()->delete();

        $cart->load(['items.product.images', 'items.variant']);

        return new CartResource($cart);
    }

    private function getOrCreateCart($user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }
}
