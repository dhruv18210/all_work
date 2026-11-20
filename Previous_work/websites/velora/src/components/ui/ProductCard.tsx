"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { cn } from "./Button";

export interface ProductProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  isNew?: boolean;
  salePercentage?: number;
}

export function ProductCard({
  id,
  name,
  brand,
  price,
  originalPrice,
  image,
  hoverImage,
  isNew,
  salePercentage,
}: ProductProps) {
  return (
    <div className="group relative flex flex-col gap-3">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 rounded-md">
        <Link href={`/product/${id}`}>
          <Image
            src={image}
            alt={name}
            fill
            className={cn(
              "object-cover object-center transition-opacity duration-500",
              hoverImage && "group-hover:opacity-0"
            )}
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`${name} alternate`}
              fill
              className="object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isNew && (
            <span className="bg-white text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider">
              New
            </span>
          )}
          {salePercentage && (
            <span className="bg-error text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
              -{salePercentage}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 transform translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <button className="bg-white p-2 rounded-full shadow-sm hover:text-accent transition-colors">
            <Heart className="w-5 h-5" />
          </button>
        </div>

        {/* Add to Cart - Slide up on hover */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
          <button className="w-full bg-primary/90 backdrop-blur-sm text-white py-3 font-medium flex items-center justify-center gap-2 hover:bg-primary transition-colors rounded">
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-text-secondary">{brand}</p>
        <Link href={`/product/${id}`} className="font-medium text-text-primary hover:text-accent transition-colors line-clamp-1">
          {name}
        </Link>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-semibold">${price.toFixed(2)}</span>
          {originalPrice && (
            <span className="text-text-secondary line-through text-sm">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
