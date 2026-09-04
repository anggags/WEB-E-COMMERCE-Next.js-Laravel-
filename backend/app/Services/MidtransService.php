<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey = config('midtrans.server_key');
        Config::$clientKey = config('midtrans.client_key');
        Config::$isProduction = config('midtrans.is_production');
    }

    /**
     * Generate a SNAP token for the given order & payment.
     * Returns the snap_token string.
     */
    public function createTransaction(Order $order, Payment $payment): string
    {
        $customerDetails = [
            'first_name' => $order->user->name,
            'email' => $order->user->email,
        ];

        if ($order->address) {
            $customerDetails['phone'] = $order->address->phone;
            $customerDetails['billing_address'] = [
                'address' => $order->address->full_address,
                'city' => $order->address->city,
                'postal_code' => $order->address->postal_code,
            ];
        }

        $itemDetails = $order->items->map(fn ($item) => [
            'id' => (string) $item->product_id,
            'name' => $item->product->name ?? "Produk #{$item->product_id}",
            'price' => (int) $item->price,
            'quantity' => $item->qty,
        ])->toArray();

        $params = [
            'transaction_details' => [
                'order_id' => $order->invoice_no,
                'gross_amount' => (int) $order->total,
            ],
            'customer_details' => $customerDetails,
            'item_details' => $itemDetails,
            'callbacks' => [
                'finish' => config('midtrans.finish_redirect_url'),
                'unfinish' => config('midtrans.unfinish_redirect_url'),
                'error' => config('midtrans.error_redirect_url'),
            ],
        ];

        $snapResult = Snap::createTransaction($params);

        return $snapResult->token;
    }

    /**
     * Verify the incoming webhook notification signature.
     */
    public function verifyNotification(array $payload): bool
    {
        $signatureKey = hash('sha512',
            $payload['order_id'] . $payload['status_code'] . $payload['gross_amount'] . config('midtrans.server_key')
        );

        return $signatureKey === ($payload['signature_key'] ?? '');
    }

    /**
     * Map Midtrans transaction_status to our internal statuses.
     */
    public function mapStatus(string $transactionStatus, string $fraudStatus): array
    {
        if ($transactionStatus === 'capture' && $fraudStatus === 'accept') {
            return ['order' => 'paid', 'payment' => 'paid'];
        }
        if ($transactionStatus === 'settlement') {
            return ['order' => 'paid', 'payment' => 'paid'];
        }
        if ($transactionStatus === 'pending') {
            return ['order' => 'pending', 'payment' => 'pending'];
        }
        if (in_array($transactionStatus, ['expire', 'cancel', 'deny'])) {
            return ['order' => 'cancelled', 'payment' => 'failed'];
        }
        if ($transactionStatus === 'refund') {
            return ['order' => 'cancelled', 'payment' => 'refunded'];
        }

        return ['order' => null, 'payment' => null];
    }
}
