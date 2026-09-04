<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::withCount('products')
            ->with(['children' => fn ($q) => $q->withCount('products')])
            ->whereNull('parent_id');

        if ($request->boolean('with_products')) {
            $query->with('products.images');
        }

        return CategoryResource::collection($query->get());
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->with(['children' => fn ($q) => $q->withCount('products')])
            ->withCount('products')
            ->firstOrFail();

        return new CategoryResource($category);
    }

    public function products($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $products = Product::with(['category', 'images', 'variants', 'reviews'])
            ->withCount('reviews')
            ->where('is_active', true)
            ->where(function ($q) use ($category) {
                $q->where('category_id', $category->id)
                  ->orWhereIn('category_id', $category->children->pluck('id'));
            })
            ->paginate($request->get('per_page', 12));

        return ProductResource::collection($products);
    }
}
