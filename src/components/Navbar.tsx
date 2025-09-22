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
    <nav className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-elegant">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 hover-lift transition-elegant">
            <img
              src="/sendlo-removebg-preview.png"
              alt="Sendix Logo"
              className="w-12 h-12 md:w-16 md:h-16 object-contain flex-shrink-0 drop-shadow-lg"
            />
            <div className="flex flex-col justify-center leading-tight">
              <span className="text-xl md:text-2xl font-bold text-elegant tracking-tight">SendiX</span>
              <span className="text-xs text-muted-foreground font-medium tracking-wide hidden sm:block opacity-75">by Ropebit Labs</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {!isMobile && (
            <div className="flex items-center space-x-6 md:space-x-10">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-semibold tracking-wide transition-elegant story-link",
                    location.pathname === item.path
                      ? "text-elegant"
                      : "text-muted-foreground hover:text-elegant"
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
                <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent/10 transition-elegant">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 glass-card">
                <div className="flex flex-col gap-4 mt-6">
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <img
                      src="/sendlo-removebg-preview.png"
                      alt="SendiX Logo"
                      className="w-8 h-8 object-contain drop-shadow-md"
                    />
                    <div>
                      <div className="font-bold text-elegant">SendiX</div>
                      <div className="text-xs text-muted-foreground opacity-75">by Ropebit Labs</div>
                    </div>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center px-4 py-3 rounded-lg text-sm font-semibold transition-elegant ${
                        location.pathname === item.path
                          ? 'gradient-elegant text-white shadow-elegant'
                          : 'text-muted-foreground hover:text-elegant hover:bg-accent/10'
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
