<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'variants', 'reviews'])
            ->withCount('reviews')
            ->where('is_active', true);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('category')) {
            $category = Category::where('slug', $request->category)->first();
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('id', $category->id)
                  ->orWhere('parent_id', $category->id);
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('rating')) {
            $query->whereHas('reviews', function ($q) use ($request) {
                $q->havingRaw('AVG(rating) >= ?', [$request->rating]);
            });
        }

        $sort = $request->get('sort', 'newest');
        [$column, $direction] = match ($sort) {
            'price_asc' => ['price', 'asc'],
            'price_desc' => ['price', 'desc'],
            'name' => ['name', 'asc'],
            'best_selling' => ['stock', 'desc'],
            default => ['created_at', 'desc'],
        };
        $query->orderBy($column, $direction);

        $products = $query->paginate($request->get('per_page', 12));

        return ProductResource::collection($products);
    }

    public function show($slug)
    {
        $product = Product::with(['category', 'images', 'variants', 'reviews.user'])
            ->withCount('reviews')
            ->where('slug', $slug)
            ->firstOrFail();

        return new ProductResource($product);
    }

    public function related($slug)
    {
        $product = Product::where('slug', $slug)->firstOrFail();

        $products = Product::with(['category', 'images', 'variants'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->limit(4)
            ->get();

        return ProductResource::collection($products);
    }
}
