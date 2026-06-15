<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->addresses()->latest()->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'first_name'   => 'required|string|max:80',
            'last_name'    => 'required|string|max:80',
            'address1'     => 'nullable|string|max:200',
            'address2'     => 'nullable|string|max:200',
            'city'         => 'required|string|max:100',
            'region'       => 'nullable|string|max:100',
            'postal_code'  => 'required|string|max:20',
            'country'      => 'required|string|size:2',
            'phone_number' => 'nullable|string|max:30',
        ]);

        $address = $request->user()->addresses()->create($data);

        return response()->json($address, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->addresses()->findOrFail($id);

        $data = $request->validate([
            'first_name'   => 'sometimes|string|max:80',
            'last_name'    => 'sometimes|string|max:80',
            'address1'     => 'nullable|string|max:200',
            'address2'     => 'nullable|string|max:200',
            'city'         => 'sometimes|string|max:100',
            'region'       => 'nullable|string|max:100',
            'postal_code'  => 'sometimes|string|max:20',
            'country'      => 'sometimes|string|size:2',
            'phone_number' => 'nullable|string|max:30',
        ]);

        $address->update($data);

        return response()->json($address);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $request->user()->addresses()->findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
