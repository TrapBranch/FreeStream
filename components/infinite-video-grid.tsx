'use client';

import { useState, useEffect, useCallback } from 'react';
import { VideoItem } from '@/lib/api';
import VideoCard from './video-card';
import { Loader2 } from 'lucide-react';

interface InfiniteVideoGridProps {
  initialVideos: VideoItem[];
  fetchMoreVideos: (page: number) => Promise<{ videos: VideoItem[]; hasMore: boolean }>;
  title?: string;
  className?: string;
}

export default function InfiniteVideoGrid({ 
  initialVideos, 
  fetchMoreVideos, 
  title,
  className = ""
}: InfiniteVideoGridProps) {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Reset when initialVideos change (for new searches/categories)
  useEffect(() => {
    setVideos(initialVideos);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialVideos]);

  return (
    <div className={className}>
      {title && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
          </div>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>
      )}

      {/* Video Grid - 考虑左侧菜单的响应式布局 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 4xl:grid-cols-8 5xl:grid-cols-9 6xl:grid-cols-10 gap-4 md:gap-6">
        {videos.map((video) => (
          <VideoCard key={`${video.vod_id}-${video.vod_time}`} video={video} />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-16">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="absolute inset-0 h-8 w-8 animate-ping rounded-full bg-blue-500/20"></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-1">加载中...</p>
              <p className="text-sm text-gray-500">正在获取更多精彩内容</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex justify-center items-center py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">!</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">加载失败</h3>
            <p className="text-red-400 mb-6 text-sm">{error}</p>
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full transition-all duration-300 hover:scale-105 font-medium"
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
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">全部加载完成</h3>
            <p className="text-gray-400 text-sm">共为您找到 {videos.length} 个精彩视频</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {videos.length === 0 && !loading && (
        <div className="flex justify-center items-center py-24">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">?</span>
              </div>
            </div>
            <h3 className="text-xl font-medium text-white mb-3">暂无内容</h3>
            <p className="text-gray-400 text-sm">请尝试其他分类或搜索关键词</p>
          </div>
        </div>
      )}

      {/* Intersection Observer Sentinel */}
      <div id="infinite-scroll-sentinel" className="h-4" />
    </div>
  );
} 