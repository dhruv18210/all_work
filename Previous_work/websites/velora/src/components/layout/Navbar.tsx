"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Menu } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-4">
          <button 
            className="lg:hidden p-2 -ml-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5 text-text-primary" />
          </button>
          <Link href="/" className="text-2xl font-bold tracking-widest text-primary uppercase">
            Velora
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/new-arrivals" className="text-sm font-medium hover:text-accent transition-colors">
            New Arrivals
          </Link>
          <Link href="/men" className="text-sm font-medium hover:text-accent transition-colors">
            Men
          </Link>
          <Link href="/women" className="text-sm font-medium hover:text-accent transition-colors">
            Women
          </Link>
          <Link href="/collections" className="text-sm font-medium hover:text-accent transition-colors">
            Collections
          </Link>
          <Link href="/sale" className="text-sm font-medium text-error hover:text-accent transition-colors">
            Sale
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 lg:gap-6">
          <button className="hidden sm:block text-text-primary hover:text-accent transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-text-primary hover:text-accent transition-colors">
            <User className="w-5 h-5" />
          </button>
          <button className="text-text-primary hover:text-accent transition-colors">
            <Heart className="w-5 h-5" />
          </button>
          <button className="text-text-primary hover:text-accent transition-colors relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown (Simple version) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-background border-b border-border shadow-lg p-4 flex flex-col gap-4">
           <Link href="/new-arrivals" className="text-sm font-medium">New Arrivals</Link>
           <Link href="/men" className="text-sm font-medium">Men</Link>
           <Link href="/women" className="text-sm font-medium">Women</Link>
           <Link href="/collections" className="text-sm font-medium">Collections</Link>
           <Link href="/sale" className="text-sm font-medium text-error">Sale</Link>
        </div>
      )}
    </header>
  );
}
