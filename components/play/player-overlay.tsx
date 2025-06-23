'use client';

import { Play, AlertCircle, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerOverlayProps {
  isPlaying: boolean;
  isBuffering: boolean;
  videoError: string | null;
  showEpisodes: boolean;
  totalEpisodes: number;
  onPlayPause: () => void;
  onToggleEpisodes: () => void;
}

export default function PlayerOverlay({
  isPlaying,
  isBuffering,
  videoError,
  showEpisodes,
  totalEpisodes,
  onPlayPause,
  onToggleEpisodes
}: PlayerOverlayProps) {
  return (
    <>
      {/* Error Overlay */}
      {videoError && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 rounded-3xl">
          <div className="text-center text-white p-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-red-300 mb-4">{videoError}</p>
            <Button
              onClick={onPlayPause}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2"
            >
              重试播放
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isBuffering && !videoError && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30 rounded-3xl">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-300">加载中...</p>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isBuffering && !videoError && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20 rounded-3xl"
          onClick={onPlayPause}
        >
          <div className="bg-white/10 backdrop-blur-md rounded-full p-6 transition-all duration-300 hover:bg-white/20 hover:scale-110 border border-white/20 shadow-2xl shadow-black/50">
            <Play className="h-16 w-16 text-white fill-white ml-1" />
          </div>
        </div>
      )}

      {/* Episode List Toggle Button */}
      {totalEpisodes > 1 && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            onClick={onToggleEpisodes}
            variant="ghost"
            size="sm"
            className={`transition-all duration-300 backdrop-blur-md border border-white/20 rounded-full w-12 h-12 p-0 shadow-lg ${
              showEpisodes 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-blue-500/25" 
                : "bg-white/10 text-white hover:bg-white/20 hover:shadow-xl"
            }`}
          >
            <List className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
} 