'use client';

import { useState, useEffect } from 'react';
import { Play, X, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EpisodePagination from './episode-pagination';

interface Episode {
  name: string;
  url: string;
  episodeNumber: number;
}

interface EpisodeListProps {
  episodes: Episode[];
  currentEpisodeIndex: number;
  showEpisodes: boolean;
  onEpisodeChange: (index: number) => void;
  onClose: () => void;
}

const EPISODES_PER_PAGE = 30;

export default function EpisodeList({
  episodes,
  currentEpisodeIndex,
  showEpisodes,
  onEpisodeChange,
  onClose
}: EpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize to the page containing the current episode
    return Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE);
  });
  const totalEpisodes = episodes.length;
  const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);

  // Reset page only when the episodes list changes (switching play sources)
  const [episodesKey, setEpisodesKey] = useState(() => episodes.length);
  useEffect(() => {
    if (episodes.length !== episodesKey) {
      // Episodes list changed, reset to first page or current episode's page
      const newPage = Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE);
      setCurrentPage(newPage);
      setEpisodesKey(episodes.length);
    }
  }, [episodes.length, episodesKey, currentEpisodeIndex]);

  // Handle manual page change - no auto-adjustment after this
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Jump to current playing episode's page
  const jumpToCurrentEpisode = () => {
    const currentEpisodePage = Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE);
    setCurrentPage(currentEpisodePage);
  };

  if (!showEpisodes || totalEpisodes <= 1) {
    return null;
  }

  const startEpisodeIndex = currentPage * EPISODES_PER_PAGE;
  const endEpisodeIndex = Math.min(startEpisodeIndex + EPISODES_PER_PAGE, totalEpisodes);
  const currentPageEpisodes = episodes.slice(startEpisodeIndex, endEpisodeIndex);

  return (
    <div className="absolute right-0 top-0 bottom-0 w-full lg:w-96 bg-black/50 backdrop-blur-2xl border-l border-white/20 z-50 shadow-2xl shadow-black/50">
      <div className="p-4 lg:p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 lg:mb-6 bg-black/20 backdrop-blur-xl rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-white/10 shadow-xl shadow-black/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
              <Tv className="h-4 w-4 lg:h-5 lg:w-5 text-blue-400" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base lg:text-lg font-semibold text-white">选集播放</h3>
              {totalPages > 1 && (
                <div className="text-xs text-gray-400">
                  第 {currentPage + 1} 页 / 共 {totalPages} 页 (共 {totalEpisodes} 集)
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Jump to current episode button */}
            {totalPages > 1 && Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE) !== currentPage && (
              <Button
                onClick={jumpToCurrentEpisode}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs"
                title={`跳转到第${currentEpisodeIndex + 1}集`}
              >
                定位当前
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full w-8 h-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Pagination Controls */}
        <EpisodePagination
          totalEpisodes={totalEpisodes}
          currentPage={currentPage}
          episodesPerPage={EPISODES_PER_PAGE}
          onPageChange={handlePageChange}
        />
        
        {/* Episode Grid - Mobile Optimized */}
        <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 lg:gap-3">
          {currentPageEpisodes.map((episode, pageIndex) => {
            const actualIndex = startEpisodeIndex + pageIndex;
            const isCurrentEpisode = actualIndex === currentEpisodeIndex;
            
            return (
              <button
                key={actualIndex}
                onClick={() => onEpisodeChange(actualIndex)}
                className={`group relative overflow-hidden rounded-xl lg:rounded-2xl p-2 lg:p-4 h-16 lg:h-20 transition-all duration-300 border-2 backdrop-blur-md ${
                  isCurrentEpisode 
                    ? "border-red-500/60 bg-gradient-to-br from-red-600/40 to-red-700/40 shadow-xl shadow-red-500/30 text-white" 
                    : "border-white/20 bg-white/10 hover:border-blue-400/60 hover:bg-gradient-to-br hover:from-blue-600/20 hover:to-purple-600/20 text-gray-300 hover:text-white hover:shadow-xl hover:shadow-blue-500/25"
                }`}
              >
                {/* Current Episode Indicator */}
                {isCurrentEpisode && (
                  <div className="absolute top-1 lg:top-2 right-1 lg:right-2">
                    <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white shadow-lg shadow-white/50 animate-pulse"></div>
                  </div>
                )}
                
                {/* Play Icon */}
                <div className={`cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ${
                  isCurrentEpisode ? 'opacity-100' : 'group-hover:opacity-100'
                }`}>
                  <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                    <Play className="h-3 w-3 lg:h-4 lg:w-4 text-white fill-white ml-0.5" />
                  </div>
                </div>
                
                {/* Episode Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                  <div className="text-xs font-medium mb-1">
                    EP{(actualIndex + 1).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs opacity-75 truncate w-full">
                    {episode.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 