'use client';

import { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, HelpCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { VideoProgressSlider, VolumeSlider } from '@/components/video-progress-slider';

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number[];
  isMuted: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  canGoToPrev: boolean;
  canGoToNext: boolean;
  isBuffering: boolean;
  currentEpisode: any;
  playbackRate: number;
  autoPlayNext: boolean;
  onPlayPause: () => void;
  onProgressChange: (value: number[]) => void;
  onVolumeChange: (value: number[]) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onPrevEpisode: () => void;
  onNextEpisode: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onAutoPlayNextChange: (enabled: boolean) => void;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default function VideoControls({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  isFullscreen,
  showControls,
  canGoToPrev,
  canGoToNext,
  isBuffering,
  currentEpisode,
  playbackRate,
  autoPlayNext,
  onPlayPause,
  onProgressChange,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onPrevEpisode,
  onNextEpisode,
  onPlaybackRateChange,
  onAutoPlayNextChange
}: VideoControlsProps) {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 可选倍速列表
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 3];

  const handlePlaybackRateChange = (rate: number) => {
    onPlaybackRateChange(rate);
    setShowSettings(false);
  };

  if (!currentEpisode) {
    return null;
  }

  return (
    <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
      {/* Mobile Controls */}
      <div className="lg:hidden p-4">
        {/* Progress Bar - Compact */}
        <div className="mb-4">
          <div className="relative bg-black/30 backdrop-blur-md rounded-full p-2 border border-white/10">
            <VideoProgressSlider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={onProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>
          
          {/* Time Display - Compact */}
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="text-gray-300">{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control Buttons - Mobile Layout */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              <Button
                onClick={onPlayPause}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 p-0 shadow-lg shadow-blue-500/25"
              >
                {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
              </Button>
              
              <Button 
                onClick={onPrevEpisode}
                disabled={!canGoToPrev}
                variant="ghost" 
                size="sm" 
                className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={onNextEpisode}
                disabled={!canGoToNext}
                variant="ghost" 
                size="sm" 
                className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-muted/20 bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Settings Panel - Mobile */}
                {showSettings && (
                  <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl p-3 text-sm text-white shadow-2xl min-w-40 z-50">
                    {/* 播放速度 */}
                    <div className="text-xs text-gray-300 mb-2 font-medium">播放速度</div>
                    <div className="space-y-1 mb-4">
                      {playbackRates.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors ${
                            playbackRate === rate
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          {rate === 1 ? '正常' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                    
                    {/* 自动播放下一集 */}
                    {canGoToNext && (
                      <>
                        <div className="border-t border-white/10 pt-3">
                          <div className="text-xs text-gray-300 mb-2 font-medium">播放设置</div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs">自动播放下一集</span>
                            <Switch
                              checked={autoPlayNext}
                              onCheckedChange={onAutoPlayNextChange}
                              className="scale-75"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <Button
                onClick={onToggleMute}
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-muted/20 bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                onClick={onToggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-foreground hover:bg-muted/20 bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Controls - Keep Original */}
      <div className="hidden lg:block p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          {/* Progress Container with backdrop blur */}
          <div className="relative bg-black/20 backdrop-blur-md rounded-full p-3 border border-white/10">
            <VideoProgressSlider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={onProgressChange}
              max={100}
              step={0.1}
              className="w-full"
            />
          </div>
          
          {/* Time Display with backdrop blur */}
          <div className="flex justify-between items-center mt-3">
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10">
              <span className="text-sm text-white font-medium">{formatTime(currentTime)}</span>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/10">
              <span className="text-sm text-gray-300 font-medium">{formatTime(duration)}</span>
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onPlayPause}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm border border-white/20 rounded-full w-12 h-12 p-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-110"
              >
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-0.5" />}
              </Button>
              
              <Button 
                onClick={onPrevEpisode}
                disabled={!canGoToPrev}
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={onNextEpisode}
                disabled={!canGoToNext}
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                <Button
                  onClick={onToggleMute}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <div className="w-20">
                  <VolumeSlider
                    value={isMuted ? [0] : volume}
                    onValueChange={onVolumeChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 p-0 transition-all duration-300 hover:scale-105"
                  title="设置"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Settings Panel - Desktop */}
                {showSettings && (
                  <div className="absolute bottom-12 right-0 bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-sm text-white shadow-2xl min-w-48 z-50">
                    {/* 播放速度 */}
                    <div className="text-sm text-gray-300 mb-3 font-medium">播放速度</div>
                    <div className="space-y-1 mb-4">
                      {playbackRates.map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handlePlaybackRateChange(rate)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            playbackRate === rate
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          {rate === 1 ? '正常' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                    
                    {/* 自动播放下一集 */}
                    {canGoToNext && (
                      <>
                        <div className="border-t border-white/10 pt-3">
                          <div className="text-sm text-gray-300 mb-3 font-medium">播放设置</div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">自动播放下一集</span>
                            <Switch
                              checked={autoPlayNext}
                              onCheckedChange={onAutoPlayNextChange}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Button
                  onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 p-0 transition-all duration-300 hover:scale-105"
                  title="键盘快捷键"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
                
                {/* Keyboard shortcuts tooltip */}
                {showKeyboardHelp && (
                  <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-sm text-white shadow-2xl min-w-48">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>播放/暂停</span>
                        <kbd className="bg-white/20 px-2 py-1 rounded text-xs">Space</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>全屏</span>
                        <kbd className="bg-white/20 px-2 py-1 rounded text-xs">F</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>静音</span>
                        <kbd className="bg-white/20 px-2 py-1 rounded text-xs">M</kbd>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>退出全屏</span>
                        <kbd className="bg-white/20 px-2 py-1 rounded text-xs">Esc</kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <Button
                onClick={onToggleFullscreen}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 p-0 transition-all duration-300 hover:scale-105"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 