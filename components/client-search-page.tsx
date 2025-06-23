'use client';

import { useState, useEffect, useCallback } from 'react';
import { VideoItem } from '@/lib/api';
import VideoCard from './video-card';
import { Loader2, Search } from 'lucide-react';

interface ClientSearchPageProps {
  query: string;
  initialVideos: VideoItem[];
  totalCount: number;
  initialPageCount?: number;
  currentPage?: number;
}

export default function ClientSearchPage({ 
  query,
  initialVideos, 
  totalCount,
  initialPageCount = 1,
  currentPage = 1
}: ClientSearchPageProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [page, setPage] = useState(currentPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(currentPage < initialPageCount);
  const [error, setError] = useState<string | null>(null);

  // Client-side fetch function using Next.js API route
  const fetchMoreVideos = useCallback(async (pageNum: number) => {
    try {
      const response = await fetch(`/api/videos?wd=${encodeURIComponent(query)}&pg=${pageNum}`);
      
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
  }, [query]);

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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
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

  // Reset when query changes
  useEffect(() => {
    setVideos(initialVideos);
    setPage(currentPage);
    setHasMore(currentPage < initialPageCount);
    setError(null);
  }, [query, initialVideos, currentPage, initialPageCount]);

  return (
    <div>
      {/* Search Results Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          搜索结果
        </h1>
        <p className="text-muted-foreground">
          关键词 &ldquo;{query}&rdquo; 共找到 {totalCount} 个结果
        </p>
        <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-4"></div>
        {/* Debug info */}
        <p className="text-muted-foreground/60 text-xs mt-2">
          当前页: {page} / {initialPageCount} | 还有更多: {hasMore ? '是' : '否'} | 视频数: {videos.length}
        </p>
      </div>

      {/* Results */}
      {videos.length > 0 ? (
        <>
          {/* Video Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10 gap-4 md:gap-6">
            {videos.map((video, index) => (
              <VideoCard key={`${video.vod_id}-${index}`} video={video} />
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">加载中...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <p className="text-destructive mb-4">{error}</p>
                <button
                  onClick={loadMore}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                >
                  重试
                </button>
              </div>
            </div>
          )}

          {/* End Message */}
          {!hasMore && videos.length > 0 && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center text-muted-foreground">
                <p className="text-lg">已经到底了</p>
                <p className="text-sm mt-1">共 {videos.length} 个视频</p>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">没有找到相关内容</h2>
          <p className="text-muted-foreground">请尝试其他关键词或浏览其他分类</p>
        </div>
      )}

      {/* Intersection Observer Sentinel */}
      <div id="infinite-scroll-sentinel" className="h-4" />
    </div>
  );
} 