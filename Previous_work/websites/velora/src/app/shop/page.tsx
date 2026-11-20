import { ProductCard } from "@/components/ui/ProductCard";
import { SlidersHorizontal } from "lucide-react";

const PRODUCTS = [
  { id: "1", name: "Linen Blend Shirt", brand: "Velora", price: 49.00, image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1976&auto=format&fit=crop", isNew: true },
  { id: "2", name: "Relaxed Fit Chinos", brand: "Velora", price: 59.00, originalPrice: 79.00, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?q=80&w=1974&auto=format&fit=crop", salePercentage: 25 },
  { id: "3", name: "Classic Denim Jacket", brand: "Velora", price: 89.00, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=1974&auto=format&fit=crop" },
  { id: "4", name: "Cotton Essentials Tee", brand: "Velora", price: 29.00, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop", isNew: true },
  { id: "5", name: "Wool Blend Coat", brand: "Velora", price: 199.00, image: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1974&auto=format&fit=crop" },
  { id: "6", name: "Silk Slip Dress", brand: "Velora", price: 129.00, image: "https://images.unsplash.com/photo-1572804013309-846874ebdb6e?q=80&w=1974&auto=format&fit=crop" },
  { id: "7", name: "Pleated Midi Skirt", brand: "Velora", price: 69.00, image: "https://images.unsplash.com/photo-1583496661160-c588c443c98d?q=80&w=1974&auto=format&fit=crop" },
  { id: "8", name: "Oversized Knit Sweater", brand: "Velora", price: 79.00, originalPrice: 99.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1972&auto=format&fit=crop", salePercentage: 20 },
];

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Shop All</h1>
        <p className="text-text-secondary max-w-2xl">
          Explore our complete collection of premium fashion pieces designed for modern, everyday elegance.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" /> Filters
            </h2>
            <span className="text-sm text-text-secondary lg:hidden">120 Items</span>
          </div>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-medium mb-4">Category</h3>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="text-primary font-medium">All Clothing</li>
                <li className="hover:text-primary cursor-pointer transition-colors">T-Shirts</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Shirts</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Pants & Denim</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Jackets & Coats</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-4">Size</h3>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button key={size} className="w-10 h-10 border border-border flex items-center justify-center text-sm hover:border-primary transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Price</h3>
              <input type="range" className="w-full accent-primary" />
              <div className="flex justify-between text-sm mt-2 text-text-secondary">
                <span>$0</span>
                <span>$500+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6 hidden lg:flex">
            <span className="text-sm text-text-secondary">Showing 1-8 of 120 items</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary">Sort by:</span>
              <select className="border border-border text-sm p-2 bg-transparent focus:outline-none focus:border-primary">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Popularity</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {PRODUCTS.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          {/* Pagination Placeholder */}
          <div className="mt-16 flex justify-center">
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 border border-border flex items-center justify-center text-sm hover:border-primary">1</button>
              <button className="w-10 h-10 border border-border flex items-center justify-center text-sm hover:border-primary bg-primary text-white">2</button>
              <button className="w-10 h-10 border border-border flex items-center justify-center text-sm hover:border-primary">3</button>
              <span className="px-2">...</span>
              <button className="w-10 h-10 border border-border flex items-center justify-center text-sm hover:border-primary">8</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
