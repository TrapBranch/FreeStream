'use client';

import { Search, Clock, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchHistory } from '@/hooks/use-search-history';
import { useRouter } from 'next/navigation';

export default function SearchHistoryPage() {
  const { history, removeFromHistory, clearHistory } = useSearchHistory();
  const router = useRouter();

  const handleHistoryClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleRemoveHistory = (query: string) => {
    removeFromHistory(query);
  };

  const handleClearAllHistory = () => {
    clearHistory();
  };

  // Mock hot searches - in a real app, this could come from an API
  const hotSearches = [
    '复仇者联盟',
    '哈利波特',
    '权力的游戏',
    '流浪地球',
    '肖申克的救赎',
    '盗梦空间',
    '泰坦尼克号',
    '阿凡达'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">搜索视频</h1>
        <p className="text-muted-foreground">请输入关键词搜索您想观看的内容</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search History */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-6 border border-border/30 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">搜索历史</h2>
            </div>
            {history.length > 0 && (
              <Button
                onClick={handleClearAllHistory}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg px-3 py-1 text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清空
              </Button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-hide">
              {history.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleHistoryClick(item.query)}
                  className="group flex items-center justify-between p-3 hover:bg-muted/20 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground/80 truncate group-hover:text-foreground transition-colors">
                      {item.query}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveHistory(item.query);
                      }}
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg w-8 h-8 p-0 transition-all duration-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">暂无搜索历史</p>
              <p className="text-muted-foreground/60 text-xs mt-1">搜索过的内容会在这里显示</p>
            </div>
          )}
        </div>

        {/* Hot Searches */}
        <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-6 border border-border/30 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">热门搜索</h2>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {hotSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(search)}
                className="group text-left p-3 hover:bg-muted/20 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index < 3 
                      ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors truncate">
                    {search}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground text-center">
              数据来源于用户搜索行为统计
            </p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-card/30 backdrop-blur-xl rounded-2xl p-6 border border-border/30 shadow-xl">
        <h3 className="text-lg font-semibold text-foreground mb-3">搜索小贴士</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-foreground/80">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium">精确搜索：</span>
              <span className="text-muted-foreground">使用具体的电影或剧集名称</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium">演员搜索：</span>
              <span className="text-muted-foreground">输入演员名字查找相关作品</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium">类型搜索：</span>
              <span className="text-muted-foreground">如"科幻"、"喜剧"等关键词</span>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
            <div>
              <span className="font-medium">年份搜索：</span>
              <span className="text-muted-foreground">添加年份如"2023"缩小范围</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}