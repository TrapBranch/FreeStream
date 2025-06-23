'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Tv, ChevronDown, ChevronUp } from 'lucide-react';
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

interface EpisodeListProps {
  videoId: string;
  playFrom: string;
  playUrl: string;
  currentEpisode?: number;
}

export default function EpisodeList({ videoId, playFrom, playUrl, currentEpisode = 1 }: EpisodeListProps) {
  const [selectedSource, setSelectedSource] = useState(0);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  
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
  const displayEpisodes = showAllEpisodes ? currentPlaySource.episodes : currentPlaySource.episodes.slice(0, 15);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">选集播放</h3>
            <p className="text-muted-foreground text-sm">共 {totalEpisodes} 集可观看</p>
          </div>
        </div>
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium">
          <Tv className="h-4 w-4 mr-2" />
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
                onClick={() => setSelectedSource(index)}
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

      {/* Episode Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold text-foreground">剧集列表</p>
          {totalEpisodes > 15 && (
            <Button
              onClick={() => setShowAllEpisodes(!showAllEpisodes)}
              variant="ghost"
              size="sm"
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
            >
              {showAllEpisodes ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  收起
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  查看全部 ({totalEpisodes})
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-3">
          {displayEpisodes.map((episode, index) => {
            const episodeNum = episode.episodeNumber;
            const isCurrentEpisode = episodeNum === currentEpisode;
            
            return (
              <Link 
                key={index} 
                href={`/play/${videoId}?episode=${episodeNum}&source=${selectedSource}`}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-lg transition-all duration-300 group-hover:scale-105 ${
                  isCurrentEpisode 
                    ? 'ring-2 ring-red-500 shadow-lg' 
                    : 'group-hover:shadow-lg'
                }`}>
                  <div className={`aspect-video flex items-center justify-center text-white font-medium text-sm transition-all duration-300 ${
                    isCurrentEpisode
                      ? 'bg-gradient-to-br from-red-600 to-red-700'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700 group-hover:from-blue-600 group-hover:to-blue-700'
                  }`}>
                    <div className="text-center px-2">
                      <div className="text-xs opacity-75 mb-1">
                        {episode.name.replace('第', '').replace('集', '')}
                      </div>
                      <div className="font-bold">
                        EP{episodeNum.toString().padStart(2, '0')}
                      </div>
                    </div>
                    
                    {/* Play Icon Overlay */}
                    <div className={`cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 ${
                      isCurrentEpisode ? 'opacity-100' : 'group-hover:opacity-100'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-slate-900/20 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-4 w-4 text-slate-50 fill-current ml-0.5" />
                      </div>
                    </div>
                    
                    {/* Current Episode Indicator */}
                    {isCurrentEpisode && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Episode Title */}
                  <div className="p-2 bg-card/80 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground truncate text-center">
                      {episode.name}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Show More Hint */}
        {!showAllEpisodes && totalEpisodes > 15 && (
          <div className="text-center py-4">
            <Button
              onClick={() => setShowAllEpisodes(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 shadow-lg"
            >
              查看更多剧集 (+{totalEpisodes - 15})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 