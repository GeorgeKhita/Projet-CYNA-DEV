<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CarouselSlide;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCarouselController extends Controller
{
    /**
     * GET /api/admin/carousel
     */
    public function index(): JsonResponse
    {
        $slides = CarouselSlide::orderBy('position')->get();
        return response()->json($slides);
    }

    /**
     * POST /api/admin/carousel
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'    => 'required|string|max:200',
            'subtitle' => 'nullable|string|max:400',
            'image_url'=> 'nullable|url|max:500',
            'cta_text' => 'nullable|string|max:100',
            'cta_url'  => 'nullable|string|max:500',
            'active'   => 'boolean',
        ]);

        $data['position'] = CarouselSlide::max('position') + 1;

        $slide = CarouselSlide::create($data);

        ActivityLog::record(
            $request->user()->id,
            'carousel_created',
            "Slide créé : {$slide->title}",
            $request->ip()
        );

        return response()->json($slide, 201);
    }

    /**
     * PUT /api/admin/carousel/{slide}
     */
    public function update(Request $request, CarouselSlide $slide): JsonResponse
    {
        $data = $request->validate([
            'title'    => 'sometimes|string|max:200',
            'subtitle' => 'nullable|string|max:400',
            'image_url'=> 'nullable|url|max:500',
            'cta_text' => 'nullable|string|max:100',
            'cta_url'  => 'nullable|string|max:500',
            'active'   => 'boolean',
        ]);

        $slide->update($data);

        ActivityLog::record(
            $request->user()->id,
            'carousel_updated',
            "Slide modifié : {$slide->title}",
            $request->ip()
        );

        return response()->json($slide);
    }

    /**
     * DELETE /api/admin/carousel/{slide}
     */
    public function destroy(Request $request, CarouselSlide $slide): JsonResponse
    {
        ActivityLog::record(
            $request->user()->id,
            'carousel_deleted',
            "Slide supprimé : {$slide->title}",
            $request->ip()
        );

        $slide->delete();

        return response()->json(['message' => 'Slide supprimé.']);
    }

    /**
     * POST /api/admin/carousel/reorder
     */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'order'   => 'required|array',
            'order.*' => 'integer|exists:carousel_slides,id',
        ]);

        foreach ($data['order'] as $position => $id) {
            CarouselSlide::where('id', $id)->update(['position' => $position + 1]);
        }

        return response()->json(['message' => 'Ordre mis à jour.']);
    }
}
