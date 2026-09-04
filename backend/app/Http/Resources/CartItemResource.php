<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product' => new ProductResource($this->whenLoaded('product')),
            'variant' => new ProductVariantResource($this->whenLoaded('variant')),
            'qty' => $this->qty,
            'subtotal' => $this->whenLoaded('product', function () {
                $price = $this->product->price + ($this->variant->extra_price ?? 0);
                return $price * $this->qty;
            }),
        ];
    }
}
