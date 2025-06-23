'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Episode {
  name: string;
  url: string;
  episodeNumber: number;
}

interface PlaySource {
  name: string;
  episodes: Episode[];
}

interface EpisodeListPaginatedProps {
  videoId: string;
  playFrom: string;
  playUrl: string;
  currentEpisode?: number;
}

const EPISODES_PER_PAGE = 30;

export default function EpisodeListPaginated({ 
  videoId, 
  playFrom, 
  playUrl, 
  currentEpisode = 1 
}: EpisodeListPaginatedProps) {
  const [selectedSource, setSelectedSource] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  
  // Parse play sources and episodes
  const playSources: PlaySource[] = [];
  
  if (playFrom && playUrl) {
    const playFroms = playFrom.split('$$$');
    const playUrls = playUrl.split('$$$');
    
    playUrls.forEach((urlGroup, index) => {
      const sourceName = playFroms[index] || `播放源${index + 1}`;
      const episodes: Episode[] = [];
      const episodeList = urlGroup.split('#');
      
      episodeList.forEach((episode, episodeIndex) => {
        const [episodeName, episodeUrl] = episode.split('$');
        if (episodeName && episodeUrl) {
          episodes.push({
            name: episodeName,
            url: episodeUrl,
            episodeNumber: episodeIndex + 1
          });
        }
      });
      
      if (episodes.length > 0) {
        playSources.push({
          name: sourceName,
          episodes
        });
      }
    });
  }

  if (playSources.length === 0) {
    return null;
  }

  const currentPlaySource = playSources[selectedSource];
  const totalEpisodes = currentPlaySource?.episodes.length || 0;
  const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
  
  // Reset to first page when changing source
  const handleSourceChange = (sourceIndex: number) => {
    setSelectedSource(sourceIndex);
    setCurrentPage(0);
  };

  // Get episodes for current page
  const startEpisodeIndex = currentPage * EPISODES_PER_PAGE;
  const endEpisodeIndex = Math.min(startEpisodeIndex + EPISODES_PER_PAGE, totalEpisodes);
  const currentPageEpisodes = currentPlaySource.episodes.slice(startEpisodeIndex, endEpisodeIndex);

  // Generate pagination buttons (max 7 buttons)
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 7;
    
    if (totalPages <= maxButtons) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Smart pagination
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 0; i < maxButtons; i++) {
          buttons.push(i);
        }
      } else if (currentPage >= totalPages - 4) {
        // Show last pages
        for (let i = totalPages - maxButtons; i < totalPages; i++) {
          buttons.push(i);
        }
      } else {
        // Show current page and surrounding pages
        for (let i = currentPage - 3; i <= currentPage + 3; i++) {
          buttons.push(i);
        }
      }
    }
    
    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-foreground">选集播放</h3>
            <p className="text-muted-foreground text-sm">共 {totalEpisodes} 集可观看</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 lg:px-4 py-1 lg:py-2 text-xs lg:text-sm font-medium">
          <Tv className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
          {totalEpisodes} 集
        </Badge>
      </div>

      {/* Source Selector */}
      {playSources.length > 1 && (
        <div className="space-y-4">
          <p className="text-lg font-semibold text-foreground">选择播放源</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {playSources.map((source, index) => (
              <button
                key={index}
                onClick={() => handleSourceChange(index)}
                className={`group relative overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
                  selectedSource === index
                    ? 'border-blue-500 bg-gradient-to-br from-blue-600/20 to-purple-600/20 shadow-lg'
                    : 'border-border bg-card/50 hover:border-border/80 hover:bg-card/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className={`font-medium ${selectedSource === index ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {source.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {source.episodes.length} 集
                    </p>
                  </div>
                  {selectedSource === index && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
                
                {/* Animated border */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 transition-opacity duration-300 ${
                  selectedSource === index ? 'opacity-20' : 'group-hover:opacity-10'
                }`}></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-card/50 backdrop-blur-xl rounded-xl p-3 border border-border/30">
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 0}
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>
          
          <div className="flex items-center gap-1">
            {getPaginationButtons().map((pageIndex) => {
              const isCurrentPage = pageIndex === currentPage;
              const startEp = pageIndex * EPISODES_PER_PAGE + 1;
              const endEp = Math.min((pageIndex + 1) * EPISODES_PER_PAGE, totalEpisodes);
              
              return (
                <Button
                  key={pageIndex}
                  onClick={() => setCurrentPage(pageIndex)}
                  variant="ghost"
                  size="sm"
                  className={`text-xs px-2 py-1 h-8 min-w-12 rounded-lg transition-all duration-200 ${
                    isCurrentPage 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-white/20 shadow-lg" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                  title={`第${startEp}-${endEp}集`}
                >
                  {startEp}-{endEp}
                </Button>
              );
            })}
          </div>
          
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            variant="ghost"
            size="sm"
            className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Episode Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground">
            剧集列表 
            {totalPages > 1 && (
              <span className="text-sm text-muted-foreground font-normal ml-2">
                第 {currentPage + 1} 页 / 共 {totalPages} 页 (第 {startEpisodeIndex + 1}-{endEpisodeIndex} 集)
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-15 gap-2 lg:gap-3">
          {currentPageEpisodes.map((episode, index) => {
            const episodeNum = episode.episodeNumber;
            const isCurrentEpisode = episodeNum === currentEpisode;
            
            return (
              <Link 
                key={index} 
                href={`/play/${videoId}?episode=${episodeNum}&source=${selectedSource}`}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-lg lg:rounded-xl transition-all duration-300 group-hover:scale-105 ${
                  isCurrentEpisode 
                    ? 'ring-2 ring-red-500 shadow-lg' 
                    : 'group-hover:shadow-lg'
                }`}>
                  <div className={`aspect-video flex items-center justify-center text-white font-medium text-xs lg:text-sm transition-all duration-300 ${
                    isCurrentEpisode
                      ? 'bg-gradient-to-br from-red-600 to-red-700'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-blue-600 group-hover:to-blue-700'
                  }`}>
                    <div className="text-center px-1 lg:px-2">
                      <div className="text-xs opacity-75 mb-0.5 lg:mb-1 truncate">
                        {episode.name.replace('第', '').replace('集', '')}
                      </div>
                      <div className="font-bold text-xs lg:text-sm">
                        EP{episodeNum.toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    {/* Play Icon Overlay */}
                    <div className={`cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ${
                      isCurrentEpisode ? 'opacity-100' : 'group-hover:opacity-100'
                    }`}>
                      <div className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-3 w-3 lg:h-4 lg:w-4 text-slate-50 fill-current ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Current Episode Indicator */}
                    {isCurrentEpisode && (
                      <div className="absolute top-1 lg:top-2 right-1 lg:right-2">
                        <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 