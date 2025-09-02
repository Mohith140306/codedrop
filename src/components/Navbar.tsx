import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Send } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/send', label: 'Send' },
    { path: '/get', label: 'Get' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 hover-scale">
  <img
    src="/sendlo-removebg-preview.png"
    alt="Sendix Logo"
    className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-contain flex-shrink-0 bg-primary/5 p-1"
  />
  <div className="flex flex-col justify-center leading-tight">
    <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">SendiX</span>
    <span className="text-xs text-muted-foreground font-medium tracking-wide hidden sm:block">by Ropebit Labs</span>
  </div>
</Link>
 {/* Navigation Links */}
          <div className="flex items-center space-x-4 md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-2 py-1 md:px-3 md:py-2 text-xs md:text-sm font-semibold tracking-wide uppercase transition-smooth story-link",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
