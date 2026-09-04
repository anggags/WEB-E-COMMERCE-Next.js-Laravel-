<?php

namespace App\Http\Controllers;

use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\OrderResource;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Services\MidtransService;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    public function checkout(CheckoutRequest $request, MidtransService $midtrans)
    {
        $user = $request->user();

        // Verify address belongs to user
        $address = Address::where('id', $request->address_id)->where('user_id', $user->id)->first();

        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat tidak ditemukan.',
            ], 404);
        }

        $cart = Cart::where('user_id', $user->id)
            ->with(['items.product', 'items.variant'])
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang kosong.',
            ], 422);
        }

        DB::beginTransaction();

        try {
            $total = $cart->items->sum(function ($item) {
                $price = $item->product->price + ($item->variant->extra_price ?? 0);
                return $price * $item->qty;
            });

            $invoiceNo = 'INV-' . strtoupper(substr(uniqid(), -8));

            $order = Order::create([
                'user_id' => $user->id,
                'address_id' => $request->address_id,
                'invoice_no' => $invoiceNo,
                'status' => 'pending',
                'total' => $total,
            ]);

            foreach ($cart->items as $item) {
                $price = $item->product->price + ($item->variant->extra_price ?? 0);
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'qty' => $item->qty,
                    'price' => $price,
                ]);
            }

            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => $request->payment_method,
                'status' => 'pending',
            ]);

            $cart->items()->delete();

            DB::commit();

            $order->load(['address', 'items.product.images', 'payment']);

            // Generate SNAP token
            $snapToken = null;
            $clientKey = config('midtrans.client_key');

            try {
                $snapToken = $midtrans->createTransaction($order, $payment);
                $payment->update(['snap_token' => $snapToken]);
            } catch (\Exception $e) {
                // Non-fatal: order is created, user can pay later via /pay
                \Log::warning('Midtrans SNAP token generation failed: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Pesanan berhasil dibuat.',
                'data' => new OrderResource($order),
                'payment' => [
                    'order_id' => $order->id,
                    'invoice_no' => $order->invoice_no,
                    'method' => $payment->method,
                    'status' => $payment->status,
                    'reference' => $payment->reference,
                    'total' => $order->total,
                ],
                'snap_token' => $snapToken,
                'client_key' => $clientKey,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
