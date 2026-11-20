"use client";

import Link from "next/link";
import { Globe, MessageCircle, Share2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-secondary pt-16 pb-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-6">Velora</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">
            Modern fashion for the modern you. Elevate your style with premium quality and timeless designs.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-accent transition-colors">
              <Globe className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              <Share2 className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Shop</h3>
          <ul className="space-y-4">
            <li><Link href="/men" className="text-sm text-gray-400 hover:text-white transition-colors">Men</Link></li>
            <li><Link href="/women" className="text-sm text-gray-400 hover:text-white transition-colors">Women</Link></li>
            <li><Link href="/collections" className="text-sm text-gray-400 hover:text-white transition-colors">Collections</Link></li>
            <li><Link href="/new-arrivals" className="text-sm text-gray-400 hover:text-white transition-colors">New Arrivals</Link></li>
            <li><Link href="/sale" className="text-sm text-gray-400 hover:text-white transition-colors">Sale</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Customer Care</h3>
          <ul className="space-y-4">
            <li><Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            <li><Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            <li><Link href="/shipping" className="text-sm text-gray-400 hover:text-white transition-colors">Shipping & Delivery</Link></li>
            <li><Link href="/returns" className="text-sm text-gray-400 hover:text-white transition-colors">Returns & Exchanges</Link></li>
            <li><Link href="/size-guide" className="text-sm text-gray-400 hover:text-white transition-colors">Size Guide</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">
            Subscribe to get updates on new arrivals, special offers, and more.
          </p>
          <form className="flex flex-col gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-transparent border border-gray-600 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-accent text-white"
            />
            <button className="bg-white text-primary font-medium py-2 rounded-md hover:bg-accent hover:text-white transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} VELORA. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="text-xs text-gray-500 hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="text-xs text-gray-500 hover:text-white">Terms & Conditions</Link>
          <Link href="/accessibility" className="text-xs text-gray-500 hover:text-white">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
