'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2, TrendingUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/use-search-history';

export default function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Hot searches for quick access
  const hotSearches = [
    '复仇者联盟', '哈利波特', '权力的游戏', '流浪地球',
    '肖申克的救赎', '盗梦空间', '泰坦尼克号', '阿凡达'
  ];

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      // Immediately close dropdown and clear states
      forceCloseDropdown();

      addToHistory(finalQuery.trim());
      router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`);

      // Clear input and force blur
      setQuery('');

      // Force blur on mobile to close virtual keyboard
      if (inputRef.current) {
        inputRef.current.blur();
      }

      // Call onClose if provided
      onClose?.();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleHistoryClick = (historyQuery: string) => {
    // Immediately close dropdown before search
    forceCloseDropdown();

    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  const handleRemoveHistory = (e: React.MouseEvent, historyQuery: string) => {
    e.stopPropagation();
    removeFromHistory(historyQuery);
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearHistory();
  };

  const handleInputFocus = () => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setInputFocused(true);
    setShowHistory(true);
  };

  const handleInputBlur = () => {
    // Use timeout to allow clicks on dropdown items
    blurTimeoutRef.current = setTimeout(() => {
      setInputFocused(false);
      setShowHistory(false);
    }, 150);
  };

  // Force close dropdown
  const forceCloseDropdown = () => {
    setShowHistory(false);
    setInputFocused(false);
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  };

  // Handle dropdown item clicks without blur
  const handleDropdownItemClick = (callback: () => void) => {
    // Clear blur timeout to prevent dropdown from closing
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    callback();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        forceCloseDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const shouldShowDropdown = showHistory && inputFocused && (history.length > 0 || hotSearches.length > 0);
  const hasHistoryOrHotSearches = history.length > 0 || hotSearches.length > 0;

  return (
    <div className="relative max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="搜索电影、电视剧..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className={`pl-12 ${query ? 'pr-12' : hasHistoryOrHotSearches ? 'pr-16' : 'pr-4'} h-12 bg-background/80 backdrop-blur-md border-border/50 text-foreground placeholder-muted-foreground focus:border-primary focus:bg-background/90 rounded-2xl transition-all duration-300 hover:bg-background/90 hover:border-border/80 ${inputFocused ? 'ring-2 ring-primary/20' : ''
              }`}
          />

          {/* Clear button when there's text */}
          {query && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-muted-foreground hover:text-foreground bg-muted/50 backdrop-blur-sm rounded-full border border-border/30 hover:bg-muted/80 hover:border-border/50 transition-all duration-300 hover:scale-105"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* History indicator when no text */}
          {!query && hasHistoryOrHotSearches && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground/60" />
              <ChevronDown className={`h-3 w-3 text-muted-foreground/60 transition-transform duration-200 ${inputFocused ? 'rotate-180' : ''
                }`} />
            </div>
          )}
        </div>
      </form>

      {/* Search History & Hot Searches Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          onMouseDown={(e) => {
            // Prevent input blur when clicking on dropdown
            e.preventDefault();
          }}
        >
          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {/* Search History Section */}
            {history.length > 0 && (
              <div className="p-4 border-b border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">搜索历史</span>
                  </div>
                  <Button
                    onClick={(e) => handleDropdownItemClick(() => handleClearAllHistory(e))}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg px-2 py-1 text-xs transition-colors"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    清空
                  </Button>
                </div>

                <div className="space-y-1">
                  {history.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => handleDropdownItemClick(() => handleHistoryClick(item.query))}
                      className="group flex items-center justify-between p-2 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">
                          {item.query}
                        </span>
                      </div>
                      <Button
                        onClick={(e) => handleDropdownItemClick(() => handleRemoveHistory(e, item.query))}
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg w-6 h-6 p-0 transition-all duration-200"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hot Searches Section */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-foreground">热门搜索</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {hotSearches.slice(0, 6).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleDropdownItemClick(() => handleHistoryClick(search))}
                    className="group text-left p-2 hover:bg-muted/50 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${index < 3
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {search}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {history.length === 0 && (
              <div className="p-6 text-center border-b border-border/30">
                <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">暂无搜索历史</p>
                <p className="text-muted-foreground/70 text-xs mt-1">开始搜索来建立您的历史记录</p>
              </div>
            )}
          </div>

          {/* Footer Tip */}
          <div className="px-4 py-2 bg-muted/30 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              按 Enter 搜索，点击历史记录快速搜索
            </p>
          </div>
        </div>
      )}
    </div>
  );
}