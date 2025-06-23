'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { VideoItem } from '@/lib/api';
import { useRouter } from 'next/navigation';

import VideoPlayer, { VideoPlayerRef } from './play/video-player';
import VideoControls from './play/video-controls';
import EpisodeList from './play/episode-list';
import { usePlayerControls } from '@/hooks/use-player-controls';
import { useAutoPlayNext } from '@/hooks/use-auto-play-next';

interface PlayPageClientProps {
  video: VideoItem;
  initialEpisode?: number;
  initialSource?: number;
}

interface Episode {
  name: string;
  url: string;
  episodeNumber: number;
}

interface PlaySource {
  name: string;
  episodes: Episode[];
  quality: string;
}

export default function PlayPageClient({ video, initialEpisode = 1, initialSource = 0 }: PlayPageClientProps) {
  const router = useRouter();
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State management
  const [playSources, setPlaySources] = useState<PlaySource[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(initialSource);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(initialEpisode - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showAutoPlayCountdown, setShowAutoPlayCountdown] = useState(false);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(3);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  // Auto play next hook with localStorage
  const { autoPlayNext, setAutoPlayNext, isLoaded: autoPlayNextLoaded } = useAutoPlayNext();

  // Player controls hook
  const {
    showControls,
    showCursor,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
    handleEpisodesToggle,
    handleFullscreenChange,
  } = usePlayerControls({ isFullscreen, showEpisodes, isBuffering });

  // Parse play URLs with episode support
  useEffect(() => {
    const sources: PlaySource[] = [];

    if (video.vod_play_url && video.vod_play_from) {
      const playFroms = video.vod_play_from.split('$$$');
      const playUrls = video.vod_play_url.split('$$$');

      playUrls.forEach((urlGroup, index) => {
        const fromName = playFroms[index] || `播放源${index + 1}`;
        const episodes: Episode[] = [];
        const episodeList = urlGroup.split('#');

        episodeList.forEach((episodeStr, episodeIndex) => {
          const [episodeName, episodeUrl] = episodeStr.split('$');
          if (episodeName && episodeUrl) {
            episodes.push({
              name: episodeName,
              url: episodeUrl,
              episodeNumber: episodeIndex + 1
            });
          }
        });

        if (episodes.length > 0) {
          let quality = 'HD';
          if (episodeList[0] && episodeList[0].includes('m3u8')) quality = 'HLS';
          if (fromName.includes('4K')) quality = '4K';
          if (fromName.includes('1080')) quality = '1080P';
          if (fromName.includes('720')) quality = '720P';

          sources.push({
            name: fromName,
            episodes,
            quality
          });
        }
      });
    }

    setPlaySources(sources);
  }, [video]);

  // Monitor fullscreen state changes
  useEffect(() => {
    const onFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      handleFullscreenChange(isNowFullscreen);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [handleFullscreenChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          if (isFullscreen) {
            toggleFullscreen();
          }
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, isPlaying, isMuted]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleSourceChange = (sourceIndex: string) => {
    const newIndex = parseInt(sourceIndex);
    setCurrentSourceIndex(newIndex);
    setCurrentEpisodeIndex(0);
    router.push(`/play/${video.vod_id}?episode=1&source=${newIndex}`);
  };

  const handleEpisodeChange = (episodeIndex: number, autoPlay: boolean = false) => {
    setCurrentEpisodeIndex(episodeIndex);
    setShowEpisodes(false);
    setShouldAutoPlay(autoPlay);
    router.push(`/play/${video.vod_id}?episode=${episodeIndex + 1}&source=${currentSourceIndex}`);
  };

  // Handle episodes list toggle wrapper
  const onEpisodesToggle = () => {
    const newShowEpisodes = handleEpisodesToggle(showEpisodes);
    setShowEpisodes(newShowEpisodes);
  };

  // Handle episodes list close
  const handleEpisodesClose = () => {
    setShowEpisodes(false);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      videoPlayerRef.current?.pause();
    } else {
      videoPlayerRef.current?.play();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };

  const handleAutoPlayNextChange = (enabled: boolean) => {
    setAutoPlayNext(enabled);
  };

  const handleVideoEnded = () => {
    const totalEpisodes = currentPlaySource?.episodes.length || 1;
    const canGoToNext = currentEpisodeIndex < totalEpisodes - 1;

    if (autoPlayNext && canGoToNext) {
      setShowAutoPlayCountdown(true);
      setAutoPlayCountdown(3);

      // 倒计时逻辑
      countdownTimerRef.current = setInterval(() => {
        setAutoPlayCountdown((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            setShowAutoPlayCountdown(false);
            goToNextEpisode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleCancelAutoPlay = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setShowAutoPlayCountdown(false);
    setAutoPlayCountdown(3);
  };

  const handleImmediatePlay = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setShowAutoPlayCountdown(false);
    goToNextEpisode();
  };

  const handleProgressClick = (value: number[]) => {
    const newTime = (value[0] / 100) * duration;
    videoPlayerRef.current?.setCurrentTime(newTime);
  };

  const goToNextEpisode = () => {
    const totalEpisodes = currentPlaySource?.episodes.length || 1;
    if (currentEpisodeIndex < totalEpisodes - 1) {
      handleEpisodeChange(currentEpisodeIndex + 1, true);
    }
  };

  const goToPrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      handleEpisodeChange(currentEpisodeIndex - 1);
    }
  };

  // Computed values
  const currentPlaySource = playSources[currentSourceIndex];
  const currentEpisode = currentPlaySource?.episodes[currentEpisodeIndex];
  const totalEpisodes = currentPlaySource?.episodes.length || 1;

  // 监听集数变化，处理自动播放
  useEffect(() => {
    if (shouldAutoPlay && currentEpisode) {
      // 确保在新集数加载后自动播放
      const timer = setTimeout(() => {
        if (videoPlayerRef.current && shouldAutoPlay) {
          videoPlayerRef.current.play();
          setIsPlaying(true);
          setShouldAutoPlay(false);
        }
      }, 1000); // 给足够时间让视频加载

      return () => clearTimeout(timer);
    }
  }, [currentEpisode, shouldAutoPlay]);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-background overflow-hidden -mt-16"
      style={{
        height: 'calc(100vh - var(--spacing) * 4)',
        cursor: showCursor ? 'default' : 'none'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      tabIndex={0}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80 pointer-events-none z-10" />

      {/* Top Bar - Mobile Optimized */}
      <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-xl transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="p-4 lg:p-6">
          {/* Mobile Layout */}
          <div className="lg:hidden">
            {/* Top Row - Back button and Episode List */}
            <div className="flex items-center justify-between mb-3">
              <Link href={`/video/${video.vod_id}`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-sm">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  返回
                </Button>
              </Link>

              {totalEpisodes > 1 && (
                <Button
                  onClick={onEpisodesToggle}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-sm"
                >
                  <List className="h-4 w-4 mr-1" />
                  {currentEpisodeIndex + 1}/{totalEpisodes}
                </Button>
              )}
            </div>

            {/* Title Row */}
            <div className="bg-black/20 backdrop-blur-xl rounded-xl p-3 border border-white/10">
              <h1 className="text-lg font-bold text-white truncate">{video.vod_name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {currentEpisode && (
                  <Badge className="bg-blue-600/80 text-white text-xs px-2 py-0.5 rounded-full">
                    {currentEpisode.name}
                  </Badge>
                )}
                <Badge className="bg-green-600/80 text-white text-xs px-2 py-0.5 rounded-full">
                  {currentPlaySource?.quality || 'HD'}
                </Badge>
                {playSources.length > 1 && (
                  <Badge className="bg-purple-600/80 text-white text-xs px-2 py-0.5 rounded-full">
                    {currentPlaySource?.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout - Keep Original */}
          <div className="hidden lg:flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/video/${video.vod_id}`}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/25">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  返回
                </Button>
              </Link>
              <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-xl shadow-black/30">
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{video.vod_name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  {video.type_name && (
                    <Badge className="bg-gradient-to-r from-red-600/80 to-red-700/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg shadow-red-500/25">
                      {video.type_name}
                    </Badge>
                  )}
                  {currentEpisode && (
                    <Badge className="bg-gradient-to-r from-blue-600/80 to-blue-700/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg shadow-blue-500/25">
                      {currentEpisode.name}
                    </Badge>
                  )}
                  <Badge className="bg-gradient-to-r from-green-600/80 to-green-700/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg shadow-green-500/25">
                    {currentPlaySource?.quality || 'HD'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Episode List Button - Glass Style */}
              {totalEpisodes > 1 && (
                <Button
                  onClick={onEpisodesToggle}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/25"
                >
                  <List className="h-4 w-4 mr-2" />
                  选集 ({currentEpisodeIndex + 1}/{totalEpisodes})
                </Button>
              )}

              {/* Source Selector - Enhanced Glass */}
              {playSources.length > 1 && (
                <Select value={currentSourceIndex.toString()} onValueChange={handleSourceChange}>
                  <SelectTrigger className="w-48 bg-white/20 backdrop-blur-xl text-white border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/25">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black/80 backdrop-blur-2xl text-white border-white/20 rounded-2xl shadow-2xl shadow-black/50">
                    {playSources.map((source, index) => (
                      <SelectItem key={index} value={index.toString()} className="rounded-xl hover:bg-white/10 transition-colors">
                        {source.name} ({source.episodes.length}集)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="absolute inset-0">
        <VideoPlayer
          ref={videoPlayerRef}
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          playbackRate={playbackRate}
          shouldAutoPlay={shouldAutoPlay}
          onPlay={() => {
            setIsPlaying(true);
          }}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={setCurrentTime}
          onLoadedMetadata={setDuration}
          onError={setVideoError}
          onBuffering={setIsBuffering}
          onEnded={handleVideoEnded}
          volume={volume}
          isMuted={isMuted}
        />
      </div>

      {/* Bottom Controls */}
      <VideoControls
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        showControls={showControls}
        canGoToPrev={currentEpisodeIndex > 0}
        canGoToNext={currentEpisodeIndex < totalEpisodes - 1}
        isBuffering={isBuffering}
        currentEpisode={currentEpisode}
        playbackRate={playbackRate}
        autoPlayNext={autoPlayNext}
        onPlayPause={togglePlayPause}
        onProgressChange={handleProgressClick}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onPrevEpisode={goToPrevEpisode}
        onNextEpisode={goToNextEpisode}
        onPlaybackRateChange={handlePlaybackRateChange}
        onAutoPlayNextChange={handleAutoPlayNextChange}
      />

      {/* Auto Play Countdown */}
      {showAutoPlayCountdown && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
          <div className="min-w-xs bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-white text-center shadow-2xl">
            <div className="text-lg font-medium mb-2">即将播放下一集</div>
            <div className="text-3xl font-bold text-blue-400 mb-4">{autoPlayCountdown}</div>
            <div className="text-sm text-gray-300 mb-4">
              下一集：{currentPlaySource?.episodes[currentEpisodeIndex + 1]?.name}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleCancelAutoPlay}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                取消
              </Button>
              <Button
                onClick={handleImmediatePlay}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                立即播放
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Episode List */}
      <EpisodeList
        episodes={currentPlaySource?.episodes || []}
        currentEpisodeIndex={currentEpisodeIndex}
        showEpisodes={showEpisodes}
        onEpisodeChange={handleEpisodeChange}
        onClose={handleEpisodesClose}
      />
    </div>
  );
} 