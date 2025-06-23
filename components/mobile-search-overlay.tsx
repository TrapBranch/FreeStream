'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, Trash2, TrendingUp, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/use-search-history';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSearchOverlay({ isOpen, onClose }: MobileSearchOverlayProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, addToHistory, removeFromHistory, clearHistory } = useSearchHistory();

  // Hot searches for quick access
  const hotSearches = [
    '复仇者联盟', '哈利波特', '权力的游戏', '流浪地球', 
    '肖申克的救赎', '盗梦空间', '泰坦尼克号', '阿凡达'
  ];

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      addToHistory(finalQuery.trim());
      router.push(`/search?q=${encodeURIComponent(finalQuery.trim())}`);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleHistoryClick = (historyQuery: string) => {
    handleSearch(historyQuery);
  };

  const handleRemoveHistory = (e: React.MouseEvent, historyQuery: string) => {
    e.stopPropagation();
    removeFromHistory(historyQuery);
  };

  const handleClearAllHistory = () => {
    clearHistory();
  };

  // Auto focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Delay to ensure overlay is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Search Panel */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-black/20 backdrop-blur-xl border-b border-white/10 p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-300 hover:text-white p-2 flex-shrink-0 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <form onSubmit={handleSubmit} className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="搜索电影、电视剧..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:bg-white/15 rounded-2xl transition-all duration-300"
                />
                {query && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Search History Section */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">搜索历史</h2>
                </div>
                <Button
                  onClick={handleClearAllHistory}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-1 text-sm transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  清空
                </Button>
              </div>

              <div className="space-y-2">
                {history.slice(0, 8).map((item, index) => (
                  <div
                    key={index}
                    onClick={() => handleHistoryClick(item.query)}
                    className="group flex items-center justify-between px-4 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/20"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Search className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      <span className="text-white truncate group-hover:text-blue-300 transition-colors">
                        {item.query}
                      </span>
                    </div>
                    <Button
                      onClick={(e) => handleRemoveHistory(e, item.query)}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg w-8 h-8 p-0 transition-all duration-200"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hot Searches Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">热门搜索</h2>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {hotSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(search)}
                  className="group text-left p-4 hover:bg-white/10 rounded-2xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/20"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      index < 3 
                        ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                        : 'bg-white/20 text-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-white group-hover:text-orange-300 transition-colors">
                      {search}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Empty State for History */}
          {history.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无搜索历史</h3>
              <p className="text-gray-400">开始搜索来建立您的历史记录</p>
            </div>
          )}

          {/* Search Tips */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">搜索小贴士</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                <span>使用具体的电影或剧集名称进行精确搜索</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                <span>输入演员名字查找相关作品</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                <span>尝试类型关键词如"科幻"、"喜剧"等</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 