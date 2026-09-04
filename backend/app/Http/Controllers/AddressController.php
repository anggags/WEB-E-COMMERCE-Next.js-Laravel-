<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAddressRequest;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request)
    {
        $addresses = Address::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return AddressResource::collection($addresses);
    }

    public function store(StoreAddressRequest $request)
    {
        $default = $request->boolean('is_default', false);

        $address = DB::transaction(function () use ($request, $default) {
            if ($default) {
                Address::where('user_id', $request->user()->id)->update(['is_default' => false]);
            }

            return Address::create([
                'user_id' => $request->user()->id,
                'label' => $request->label,
                'recipient_name' => $request->recipient_name,
                'phone' => $request->phone,
                'full_address' => $request->full_address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'is_default' => $default,
            ]);
        });

        return (new AddressResource($address))->additional(['message' => 'Alamat berhasil ditambahkan.']);
    }

    public function update(StoreAddressRequest $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat tidak ditemukan.',
            ], 404);
        }

        $default = $request->boolean('is_default', false);

        DB::transaction(function () use ($request, $address, $default) {
            if ($default) {
                Address::where('user_id', $request->user()->id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update([
                'label' => $request->label,
                'recipient_name' => $request->recipient_name,
                'phone' => $request->phone,
                'full_address' => $request->full_address,
                'city' => $request->city,
                'postal_code' => $request->postal_code,
                'is_default' => $default,
            ]);
        });

        return (new AddressResource($address->fresh()))->additional(['message' => 'Alamat berhasil diperbarui.']);
    }

    public function destroy(Request $request, Address $address)
    {
        if ($address->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Alamat tidak ditemukan.',
            ], 404);
        }

        $address->delete();

        return response()->json([
            'success' => true,
            'message' => 'Alamat berhasil dihapus.',
        ]);
    }
}
