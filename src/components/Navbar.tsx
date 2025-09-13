import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
          <Link to="/" className="flex items-center gap-2 hover-scale">
            <img
              src="/sendlo-removebg-preview.png"
              alt="Sendix Logo"
              className="w-12 h-12 md:w-16 md:h-16 object-contain flex-shrink-0"
            />
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-xl md:text-2xl font-bold text-foreground tracking-tight">SendiX</span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide hidden sm:block">by Ropebit Labs</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
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
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <img
                      src="/sendlo-removebg-preview.png"
                      alt="SendiX Logo"
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <div className="font-semibold text-foreground">SendiX</div>
                      <div className="text-xs text-muted-foreground">by Ropebit Labs</div>
                    </div>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
