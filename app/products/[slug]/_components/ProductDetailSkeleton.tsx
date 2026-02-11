export default function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-4 bg-muted animate-pulse rounded w-16" />
        <span className="text-muted-foreground">/</span>
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
        <span className="text-muted-foreground">/</span>
        <div className="h-4 bg-muted animate-pulse rounded w-32" />
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-muted animate-pulse rounded-lg" />
          
          {/* Thumbnail Strip */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
          </div>

          {/* Price */}
          <div className="h-10 bg-muted animate-pulse rounded w-1/3" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-full" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>

          {/* Variants */}
          <div className="space-y-3">
            <div className="h-5 bg-muted animate-pulse rounded w-24" />
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="h-14 bg-muted animate-pulse rounded-lg w-full" />

          {/* Tags */}
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded-full w-20" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}