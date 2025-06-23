'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { VideoItem } from '@/lib/api';
import VideoCard from './video-card';
import { Loader2 } from 'lucide-react';

interface ClientHomePageProps {
  initialVideos: VideoItem[];
  initialPageCount?: number;
  currentPage?: number;
}

export default function ClientHomePage({ 
  initialVideos, 
  initialPageCount = 1,
  currentPage = 1 
}: ClientHomePageProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(currentPage < initialPageCount);
  const [error, setError] = useState<string | null>(null);

  // Client-side fetch function using Next.js API route
  const fetchMoreVideos = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/videos?pg=${pageNum}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        videos: data.list || [],
        hasMore: pageNum < data.pagecount,
        totalPages: data.pagecount
      };
    } catch (error) {
      console.error('Error fetching more videos:', error);
      return { videos: [], hasMore: false, totalPages: 0 };
    }
  }, []);

  // Load more videos function
  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const result = await fetchMoreVideos(nextPage);
      
      if (result.videos.length === 0) {
        setHasMore(false);
      } else {
        setVideos(prev => [...prev, ...result.videos]);
        setPage(nextPage);
        setHasMore(result.hasMore);
      }
    } catch (err) {
      setError('加载更多内容时出错');
      console.error('Error loading more videos:', err);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchMoreVideos]);

  // Intersection Observer for infinite scroll - optimized
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          // Add small delay to prevent too frequent loading
          setTimeout(() => {
            if (!loading && hasMore) {
              loadMore();
            }
          }, 100);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Reduced from 100px to prevent too early loading
      }
    );

    const sentinel = document.getElementById('infinite-scroll-sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loadMore, loading, hasMore]);

  return (
    <div>
      {/* Title */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <h2 className="text-3xl font-bold text-foreground">最新影片</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent"></div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mb-2"></div>
        <p className="text-muted-foreground text-sm">
          发现最新最热门的影视内容
        </p>
        {/* Debug info - only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <p className="text-muted-foreground/70 text-xs mt-2">
            当前页: {page} / {initialPageCount} | 还有更多: {hasMore ? '是' : '否'} | 视频数: {videos.length}
          </p>
        )}
      </div>

      {/* Video Grid - 考虑左侧菜单的响应式布局 */}
      <div className="video-grid-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10 gap-4 md:gap-6">
        {videos.map((video, index) => (
          <VideoCard key={`${video.vod_id}-${index}`} video={video} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-primary/20"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-foreground mb-1">加载中...</p>
              <p className="text-sm text-muted-foreground">正在获取更多精彩内容</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-destructive rounded-full flex items-center justify-center">
                <span className="text-destructive-foreground text-sm">!</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">加载失败</h3>
            <p className="text-destructive mb-6 text-sm">{error}</p>
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 font-medium"
            >
              重新加载
            </button>
          </div>
        </div>
      )}

      {/* End Message */}
      {!hasMore && videos.length > 0 && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-xs">✓</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">全部加载完成</h3>
            <p className="text-muted-foreground text-sm">共为您找到 {videos.length} 个精彩视频</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {videos.length === 0 && !loading && (
        <div className="flex justify-center items-center py-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-lg">?</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-foreground mb-3">暂无内容</h3>
            <p className="text-muted-foreground text-sm mb-6">当前没有可显示的视频内容</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full transition-all duration-300 hover:scale-105 font-medium"
            >
              刷新页面
            </button>
          </div>
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div id="infinite-scroll-sentinel" className="h-4"></div>
    </div>
  );
} 