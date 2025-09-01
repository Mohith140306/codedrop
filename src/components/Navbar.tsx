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
        <Link to="/" className="flex items-center space-x-2 hover-scale">
  <img
    src="/sendlog.jpg"
    alt="Sendix Logo"
    className="w-6 h-6 md:w-8 md:h-8 rounded-lg object-contain"
  />
  <div className="flex flex-col">
    <span className="text-lg md:text-xl font-bold text-foreground">Sendix</span>
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
