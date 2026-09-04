<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->whenLoaded('items');
        $total = collect($items)->sum(function ($item) {
            $price = $item->product->price + ($item->variant->extra_price ?? 0);
            return $price * $item->qty;
        });

        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($items),
            'items_count' => collect($items)->sum('qty'),
            'total' => round($total, 2),
        ];
    }
}
