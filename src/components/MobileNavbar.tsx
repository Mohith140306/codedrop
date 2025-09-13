import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MoreVertical, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileNavbar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isMobile) return null;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/send', label: 'Send' },
    { path: '/get', label: 'Get' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/sendlo-removebg-preview.png"
            alt="SendiX Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold text-foreground">SendiX</span>
        </Link>

        {/* Menu Button */}
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
      </div>
    </nav>
  );
};