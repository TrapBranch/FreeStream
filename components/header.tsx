'use client';

import { useState } from 'react';
import { Search, Bell, User, Film, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './search-bar';
import MobileSearchOverlay from './mobile-search-overlay';
import { useTheme } from '@/hooks/use-theme';

export default function Header() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Logo for mobile (with space for menu button), title for desktop */}
            <div className="flex items-center gap-4">
              {/* Mobile Logo - positioned to avoid menu button */}
              <div className="lg:hidden flex items-center gap-3 ml-10">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Film className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-foreground text-lg">影视</span>
              </div>
              
              {/* Desktop Title */}
              <h1 className="hidden lg:block text-xl font-bold text-foreground">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  随看
                </span>
              </h1>
            </div>

            {/* Right side - Search and User actions */}
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Search Bar */}
              <div className="hidden md:block relative">
                <SearchBar onClose={() => {}} />
              </div>

              {/* Mobile Search Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden text-muted-foreground hover:text-foreground p-2.5 bg-muted/50 hover:bg-muted rounded-xl border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-105"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground p-2.5 bg-muted/50 hover:bg-muted rounded-xl border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-105"
                title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Notifications */}
              {/* <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground relative p-2.5 bg-muted/50 hover:bg-muted rounded-xl border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-105"
                title="通知"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                </span>
              </Button> */}

              {/* User Profile */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground p-2.5 bg-muted/50 hover:bg-muted rounded-xl border border-border/30 hover:border-border/50 transition-all duration-200 hover:scale-105"
                title="用户中心"
              >
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay 
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
      />
    </>
  );
}