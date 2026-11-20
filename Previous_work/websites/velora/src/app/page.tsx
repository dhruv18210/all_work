import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

const TRENDING_PRODUCTS = [
  {
    id: "1",
    name: "Linen Blend Shirt",
    brand: "Velora",
    price: 49.00,
    image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1976&auto=format&fit=crop",
    hoverImage: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1976&auto=format&fit=crop", // placeholder
    isNew: true,
  },
  {
    id: "2",
    name: "Relaxed Fit Chinos",
    brand: "Velora",
    price: 59.00,
    originalPrice: 79.00,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1974&auto=format&fit=crop",
    salePercentage: 25,
  },
  {
    id: "3",
    name: "Classic Denim Jacket",
    brand: "Velora",
    price: 89.00,
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1974&auto=format&fit=crop",
  },
  {
    id: "4",
    name: "Cotton Essentials Tee",
    brand: "Velora",
    price: 29.00,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop",
    isNew: true,
  }
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center bg-[#EAEAEA] overflow-hidden">
        {/* Placeholder for Hero Image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <p className="text-accent font-semibold tracking-wider uppercase mb-4">New Collection</p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              Summer Essentials
            </h1>
            <p className="text-lg text-text-secondary mb-10 max-w-md">
              Elevated style. Everyday comfort. Discover our latest collection crafted for versatility.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/women" className="bg-primary text-white px-8 py-4 font-semibold hover:bg-black transition-colors flex items-center gap-2">
                SHOP WOMEN <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/men" className="bg-transparent border border-primary text-primary px-8 py-4 font-semibold hover:bg-primary hover:text-white transition-colors flex items-center gap-2">
                SHOP MEN
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-b border-border bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 border border-border rounded-full flex items-center justify-center text-primary">
                {/* Icon placeholder */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-text-secondary">On orders over $100</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 border border-border rounded-full flex items-center justify-center text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </div>
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-sm text-text-secondary">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-4 border border-border rounded-full flex items-center justify-center text-primary">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-sm text-text-secondary">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trending Products Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trending Now</h2>
              <p className="text-text-secondary max-w-2xl">
                Discover our most popular pieces this season. Handpicked for your elevated everyday wardrobe.
              </p>
            </div>
            <Link href="/collections/trending" className="hidden md:flex items-center gap-2 font-medium hover:text-accent transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {TRENDING_PRODUCTS.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
          
          <div className="mt-10 flex justify-center md:hidden">
            <Link href="/collections/trending" className="flex items-center gap-2 font-medium hover:text-accent transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer for next sections */}
      <div className="h-16"></div>
    </div>
  );
}
