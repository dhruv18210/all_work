"use client";

import Image from "next/image";
import { useState } from "react";
import { Heart, Share2, Ruler, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Dummy data for demo
const PRODUCT = {
  id: "1",
  name: "Linen Blend Shirt",
  brand: "Velora",
  price: 49.00,
  description: "Lightweight linen shirt with a relaxed fit. Perfect for summer days and casual outings. Features a classic collar, button placket, and a chest pocket.",
  images: [
    "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1976&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1602810319428-019690571b5b?q=80&w=1974&auto=format&fit=crop"
  ],
  colors: ["#F5F5DC", "#111111", "#87CEEB"],
  sizes: ["S", "M", "L", "XL", "XXL"],
  rating: 4.8,
  reviews: 120,
};

export default function ProductPage() {
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0]);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumb */}
      <div className="text-sm text-text-secondary mb-8">
        Home {'>'} Men {'>'} Shirts {'>'} <span className="text-primary">{PRODUCT.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 flex-shrink-0">
            {PRODUCT.images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(idx)}
                className={`relative w-20 h-24 md:w-full md:h-32 bg-gray-100 flex-shrink-0 border-2 transition-colors ${activeImage === idx ? 'border-primary' : 'border-transparent'}`}
              >
                <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative aspect-[3/4] w-full bg-gray-100 rounded-sm overflow-hidden">
            <Image src={PRODUCT.images[activeImage]} alt={PRODUCT.name} fill className="object-cover" />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{PRODUCT.name}</h1>
          <p className="text-text-secondary text-lg mb-6">{PRODUCT.brand}</p>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="text-2xl font-semibold">${PRODUCT.price.toFixed(2)}</span>
            <div className="flex items-center gap-1 text-accent text-sm">
              {'★'.repeat(5)} <span className="text-text-secondary ml-2">({PRODUCT.reviews} reviews)</span>
            </div>
          </div>

          <p className="text-text-secondary mb-8 leading-relaxed">
            {PRODUCT.description}
          </p>

          <div className="h-px w-full bg-border mb-8"></div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Color:</h3>
            <div className="flex gap-3">
              {PRODUCT.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 focus:outline-none ${selectedColor === color ? 'border-primary' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Size:</h3>
              <button className="text-sm text-text-secondary flex items-center gap-1 hover:text-primary transition-colors">
                <Ruler className="w-4 h-4" /> Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {PRODUCT.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-14 h-12 flex items-center justify-center border text-sm font-medium transition-colors ${selectedSize === size ? 'border-primary bg-primary text-white' : 'border-border text-primary hover:border-primary'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="flex gap-4 mb-8">
            <div className="flex items-center border border-border">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >-</button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >+</button>
            </div>
            <Button size="lg" className="flex-1 text-base">Add to Cart</Button>
          </div>

          {/* Secondary Actions */}
          <div className="flex gap-6 mb-12">
            <button className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
              <Heart className="w-4 h-4" /> Add to Wishlist
            </button>
            <button className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>

          {/* Accordions (Simulated) */}
          <div className="border-t border-border">
            <div className="py-4 border-b border-border flex justify-between items-center cursor-pointer hover:text-accent transition-colors font-medium">
              Description <span>+</span>
            </div>
            <div className="py-4 border-b border-border flex justify-between items-center cursor-pointer hover:text-accent transition-colors font-medium">
              Details & Care <span>+</span>
            </div>
            <div className="py-4 border-b border-border flex justify-between items-center cursor-pointer hover:text-accent transition-colors font-medium">
              <div className="flex items-center gap-2"><Truck className="w-4 h-4"/> Shipping & Returns</div> <span>+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
