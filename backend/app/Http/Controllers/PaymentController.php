<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        protected MidtransService $midtrans,
    ) {}

    /**
     * Generate a SNAP token for an order so the frontend can open the payment popup.
     * GET /api/orders/{order}/pay
     */
    public function pay(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Pesanan tidak ditemukan.'], 404);
        }

        $order->load('payment');

        if (!$order->payment) {
            return response()->json(['success' => false, 'message' => 'Data pembayaran tidak ditemukan.'], 404);
        }

        if (in_array($order->payment->status, ['paid', 'failed', 'refunded'])) {
            return response()->json(['success' => false, 'message' => 'Pesanan ini tidak dapat dibayar.'], 422);
        }

        // Reuse existing token if valid
        if ($order->payment->snap_token) {
            return response()->json([
                'success' => true,
                'snap_token' => $order->payment->snap_token,
                'client_key' => config('midtrans.client_key'),
            ]);
        }

        $token = $this->midtrans->createTransaction($order, $order->payment);

        $order->payment->update(['snap_token' => $token]);

        return response()->json([
            'success' => true,
            'snap_token' => $token,
            'client_key' => config('midtrans.client_key'),
        ]);
    }

    /**
     * Handle Midtrans webhook notification.
     * POST /api/midtrans/callback (public, no auth)
     */
    public function callback(Request $request): JsonResponse
    {
        $payload = $request->all();

        // Verify signature
        if (!$this->midtrans->verifyNotification($payload)) {
            return response()->json(['status' => 'invalid_signature'], 403);
        }

        $orderId = $payload['order_id'];
        $order = Order::where('invoice_no', $orderId)->with('payment')->first();

        if (!$order || !$order->payment) {
            return response()->json(['status' => 'order_not_found'], 404);
        }

        $transactionStatus = $payload['transaction_status'] ?? '';
        $fraudStatus = $payload['fraud_status'] ?? '';

        $statuses = $this->midtrans->mapStatus($transactionStatus, $fraudStatus);

        if ($statuses['payment']) {
            $order->payment->update([
                'status' => $statuses['payment'],
                'reference' => $payload['payment_type'] ?? $order->payment->reference,
                'paid_at' => in_array($statuses['payment'], ['paid'])
                    ? now()
                    : $order->payment->paid_at,
            ]);
        }

        if ($statuses['order']) {
            $order->update(['status' => $statuses['order']]);
        }

        return response()->json(['status' => 'ok']);
    }
}
