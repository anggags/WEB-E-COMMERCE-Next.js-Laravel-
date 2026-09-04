<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method,
            'status' => $this->status,
            'reference' => $this->reference,
            'paid_at' => $this->paid_at,
            'snap_token' => $this->snap_token,
        ];
    }
}
