// app/products/[slug]/_components/ProductDetailClient.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useCart } from "@/components/Layouts/overlays/cart/cart-context";

interface ProductImage {
  id: string;
  object_path: string;
  bucket_name: string;
  alt_text: string;
  position: number;
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  title?: string;
  options: Record<string, any>;
  price_cents: number;
  compare_at_price_cents?: number;
  inventory_quantity: number;
  weight_grams?: number;
  position: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price_cents: number;
  compare_at_price_cents?: number;
  currency: string;
  status: string;
  badge?: string;
  is_featured: boolean;
  brand?: string;
  material?: string;
  made_in?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  categories: Category[];
}

interface ProductDetailClientProps {
  product: Product;
}

// Helper to get display value from option (handles both strings and objects like color)
function getOptionDisplayValue(optionValue: any): string {
  if (typeof optionValue === 'string') return optionValue;
  if (optionValue && typeof optionValue === 'object' && optionValue.name) {
    return optionValue.name;
  }
  return String(optionValue);
}

// Helper to compare option values (handles color objects)
function optionsMatch(value1: any, value2: any): boolean {
  if (typeof value1 === 'string' && typeof value2 === 'string') {
    return value1 === value2;
  }
  if (value1?.name && value2?.name) {
    return value1.name === value2.name;
  }
  return String(value1) === String(value2);
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, any>>({});
  
  // 🛒 Cart integration
  const { addItem } = useCart();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Get image URL from Supabase Storage
  const getImageUrl = (image: ProductImage) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${image.bucket_name}/${image.object_path}`;
  };

  // Check if product has variants
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Get all unique option names and their values
  const optionTypes = useMemo(() => {
    if (!hasVariants) return {};
    
    const types: Record<string, Set<string>> = {};
    const rawValues: Record<string, any[]> = {};
    
    product.variants.forEach((variant) => {
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!types[key]) {
          types[key] = new Set();
          rawValues[key] = [];
        }
        const displayValue = getOptionDisplayValue(value);
        if (!types[key].has(displayValue)) {
          types[key].add(displayValue);
          rawValues[key].push(value);
        }
      });
    });
    
    const result: Record<string, any[]> = {};
    Object.entries(types).forEach(([key, valueSet]) => {
      result[key] = rawValues[key];
    });
    
    return result;
  }, [product.variants, hasVariants]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    if (product.variants.length === 1) return product.variants[0];

    if (Object.keys(selectedOptions).length === 0) {
      return product.variants[0];
    }

    const match = product.variants.find((v) => {
      return Object.entries(selectedOptions).every(
        ([optionKey, optionValue]) => {
          const variantValue = v.options[optionKey];
          return optionsMatch(variantValue, optionValue);
        }
      );
    });
    
    return match || product.variants[0];
  }, [product.variants, selectedOptions, hasVariants]);

  // Calculate price
  const displayPrice = selectedVariant?.price_cents ?? product.price_cents;
  const compareAtPrice = selectedVariant?.compare_at_price_cents ?? product.compare_at_price_cents;
  const hasDiscount = compareAtPrice && compareAtPrice > displayPrice;

  // Check if product is in stock
  const inStock = selectedVariant ? selectedVariant.inventory_quantity > 0 : true;

  // Navigate gallery
  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // 🛒 Add to cart handler
  const handleAddToCart = async () => {
    if (!selectedVariant || !inStock) return;
    
    setIsAddingToCart(true);
    try {
      await addItem(selectedVariant.id, 1);
      // Cart drawer will open automatically!
    } catch (error) {
      console.error('Failed to add to cart:', error);
      // Optional: Show error toast here
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Helper to render option button with color swatch if applicable
  const renderOptionButton = (optionName: string, optionValue: any, isSelected: boolean) => {
    const displayValue = getOptionDisplayValue(optionValue);
    const isColor = optionName.toLowerCase() === 'color' && optionValue?.hex;

    return (
      <button
        key={displayValue}
        onClick={() => setSelectedOptions(prev => ({ ...prev, [optionName]: optionValue }))}
        className={`px-4 py-2 border rounded-md transition-colors ${
          isSelected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-input hover:border-primary'
        }`}
      >
        {isColor && (
          <span 
            className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300"
            style={{ backgroundColor: optionValue.hex }}
          />
        )}
        {displayValue}
      </button>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span>/</span>
        {product.categories.length > 0 && (
          <>
            <Link 
              href={`/${product.categories[0].slug}`} 
              className="hover:text-foreground transition-colors"
            >
              {product.categories[0].name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-foreground">{product.title}</span>
      </nav>

      {/* Product Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.images.length > 0 ? (
              <>
                <Image
                  src={getImageUrl(product.images[selectedImageIndex])}
                  alt={product.images[selectedImageIndex].alt_text || product.title}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Gallery Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-primary text-primary-foreground">
                      {product.badge}
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-6 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square relative rounded-lg overflow-hidden border-2 transition-colors ${
                    index === selectedImageIndex
                      ? 'border-primary'
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                >
                  <Image
                    src={getImageUrl(image)}
                    alt={image.alt_text || `${product.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
            
            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold">
                ${(displayPrice / 100).toFixed(2)}
              </span>
              {hasDiscount && compareAtPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${(compareAtPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="prose prose-sm max-w-none mb-6">
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}
          </div>

          {/* Variant Options */}
          {hasVariants && Object.keys(optionTypes).length > 0 && (
            <div className="space-y-4">
              {Object.entries(optionTypes).map(([optionName, optionValues]) => (
                <div key={optionName}>
                  <label className="block text-sm font-medium mb-2 capitalize">
                    {optionName}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {optionValues.map((value: any) => {
                      const displayValue = getOptionDisplayValue(value);
                      const isSelected = selectedOptions[optionName] 
                        ? optionsMatch(selectedOptions[optionName], value)
                        : false;
                      
                      return renderOptionButton(optionName, value, isSelected);
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock Status */}
          {selectedVariant && (
            <div className="text-sm">
              {inStock ? (
                <span className="text-green-600 font-medium">
                  ✓ In Stock ({selectedVariant.inventory_quantity} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">
                  Out of Stock
                </span>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex gap-3">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6 space-y-2 text-sm">
            {selectedVariant?.sku && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">SKU:</span>
                <span className="font-medium">{selectedVariant.sku}</span>
              </div>
            )}
            {product.brand && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Brand:</span>
                <span className="font-medium">{product.brand}</span>
              </div>
            )}
            {product.material && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Material:</span>
                <span className="font-medium">{product.material}</span>
              </div>
            )}
            {product.made_in && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Made In:</span>
                <span className="font-medium">{product.made_in}</span>
              </div>
            )}
            {selectedVariant?.weight_grams && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight:</span>
                <span className="font-medium">{selectedVariant.weight_grams}g</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}