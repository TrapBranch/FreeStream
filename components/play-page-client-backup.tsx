'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, SkipBack, SkipForward, List, X, Tv, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoProgressSlider, VolumeSlider } from '@/components/video-progress-slider';
import Link from 'next/link';
import { VideoItem } from '@/lib/api';
import { useRouter } from 'next/navigation';

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

// 检测视频格式类型
const getVideoType = (url: string): 'hls' | 'mp4' | 'iframe' | 'unknown' => {
  if (!url) return 'unknown';

  const lowerUrl = url.toLowerCase();

  // HLS 流格式
  if (lowerUrl.includes('.m3u8')) return 'hls';

  // 常见视频格式统一归为 mp4 类
  const mp4Formats = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.wmv', '.mpeg', '.mpg', '.3gp', '.ts'];
  if (mp4Formats.some(ext => lowerUrl.includes(ext))) return 'mp4';

  // 直播/流媒体关键字，也优先尝试 mp4 播放器加载
  if (lowerUrl.includes('rtmp') || lowerUrl.includes('.flv') || lowerUrl.includes('live')) return 'mp4';

  // 无法识别格式时，最后尝试 iframe 加载
  return 'iframe';
};


export default function PlayPageClient({ video, initialEpisode = 1, initialSource = 0 }: PlayPageClientProps) {
  const router = useRouter();
  const [playSources, setPlaySources] = useState<PlaySource[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(initialSource);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(initialEpisode - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [playerType, setPlayerType] = useState<'video' | 'iframe'>('video');
  const [currentEpisodePage, setCurrentEpisodePage] = useState(0);
  
  // Episode pagination settings
  const EPISODES_PER_PAGE = 30;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Parse play URLs with episode support
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
    
    console.log("🚀 ~ useEffect ~ sources:", sources)
    setPlaySources(sources);
  }, [video]);

  // 当播放源或集数改变时，重新检测播放器类型和初始化 HLS
  useEffect(() => {
    const currentEpisode = playSources[currentSourceIndex]?.episodes[currentEpisodeIndex];
    if (currentEpisode) {
      const videoType = getVideoType(currentEpisode.url);
      setPlayerType(videoType === 'iframe' ? 'iframe' : 'video');
      setVideoError(null);
      setIsPlaying(false);
      
      // 如果是 HLS 格式，初始化 HLS.js
      if (videoType === 'hls' && videoRef.current) {
        initializeHLS(currentEpisode.url);
      }
    }
    
    // 清理函数
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentSourceIndex, currentEpisodeIndex, playSources]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying && !showEpisodes && playerType === 'video') {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying, showEpisodes, playerType]);

  // Auto-adjust episode page when current episode changes
  useEffect(() => {
    const currentPage = Math.floor(currentEpisodeIndex / EPISODES_PER_PAGE);
    if (currentPage !== currentEpisodePage) {
      setCurrentEpisodePage(currentPage);
    }
  }, [currentEpisodeIndex, EPISODES_PER_PAGE, currentEpisodePage]);

  // 组件卸载时清理 HLS
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
  };

  const currentPlaySource = playSources[currentSourceIndex];
  const currentEpisode = currentPlaySource?.episodes[currentEpisodeIndex];
  const totalEpisodes = currentPlaySource?.episodes.length || 1;
  
  // Episode pagination logic
  const totalPages = Math.ceil(totalEpisodes / EPISODES_PER_PAGE);
  const startEpisodeIndex = currentEpisodePage * EPISODES_PER_PAGE;
  const endEpisodeIndex = Math.min(startEpisodeIndex + EPISODES_PER_PAGE, totalEpisodes);
  const currentPageEpisodes = currentPlaySource?.episodes.slice(startEpisodeIndex, endEpisodeIndex) || [];

  // 初始化 HLS 播放器
  const initializeHLS = (url: string) => {
    if (!videoRef.current) return;

    // 清理现有的 HLS 实例
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // 检查浏览器是否原生支持 HLS
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari 原生支持
      videoRef.current.src = url;
      console.log('使用原生 HLS 支持');
    } else if (Hls.isSupported()) {
      // 使用 HLS.js
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      
      hlsRef.current = hls;
      
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest 解析完成');
        setIsBuffering(false);
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS 错误:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setVideoError('网络错误，请检查网络连接');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setVideoError('媒体错误，视频格式可能不支持');
              break;
            default:
              setVideoError('播放失败，请尝试其他播放源');
              break;
          }
        }
      });

      console.log('使用 HLS.js');
    } else {
      setVideoError('您的浏览器不支持 HLS 播放');
    }
  };

  const handleSourceChange = (sourceIndex: string) => {
    const newSourceIndex = parseInt(sourceIndex);
    setCurrentSourceIndex(newSourceIndex);
    setCurrentEpisodeIndex(0);
    setIsPlaying(false);
    setVideoError(null);
    
    router.push(`/play/${video.vod_id}?episode=1&source=${newSourceIndex}`);
  };

  const handleEpisodeChange = (episodeIndex: number) => {
    setCurrentEpisodeIndex(episodeIndex);
    setIsPlaying(false);
    setCurrentTime(0);
    setVideoError(null);
    
    router.push(`/play/${video.vod_id}?episode=${episodeIndex + 1}&source=${currentSourceIndex}`);
  };

  const togglePlayPause = () => {
    if (playerType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('播放失败:', error);
            setVideoError('播放失败，请尝试其他播放源');
          });
        }
      }
      setIsPlaying(!isPlaying);
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
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume[0] / 100;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = (error: any) => {
    console.error('视频播放错误:', error);
    const errorMessage = getErrorMessage(error);
    setVideoError(errorMessage);
    setIsPlaying(false);
  };

  const getErrorMessage = (error: any): string => {
    if (error?.target?.error?.code) {
      switch (error.target.error.code) {
        case 1:
          return '播放被中止';
        case 2:
          return '网络错误';
        case 3:
          return '解码错误';
        case 4:
          return '不支持的视频格式';
        default:
          return '播放失败';
      }
    }
    return '播放失败，请尝试其他播放源';
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (value: number[]) => {
    if (videoRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const goToNextEpisode = () => {
    if (currentEpisodeIndex < totalEpisodes - 1) {
      handleEpisodeChange(currentEpisodeIndex + 1);
    }
  };

  const goToPrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      handleEpisodeChange(currentEpisodeIndex - 1);
    }
  };

  const goToEpisodePage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setCurrentEpisodePage(pageIndex);
    }
  };

  // 渲染视频播放器
  const renderVideoPlayer = () => {
    if (!currentEpisode) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-xl">暂无播放源</p>
          </div>
        </div>
      );
    }

    const videoType = getVideoType(currentEpisode.url);

    if (videoError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-xl mb-4">{videoError}</p>
            <div className="space-y-2">
              <Button
                onClick={() => {
                  setVideoError(null);
                  setIsPlaying(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                重试
              </Button>
              {playSources.length > 1 && (
                <p className="text-muted-foreground text-sm">请尝试切换其他播放源</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (playerType === 'iframe' || videoType === 'iframe') {
      return (
        <iframe
          key={`${currentSourceIndex}-${currentEpisodeIndex}`}
          src={currentEpisode.url}
          className="w-full h-full border-0"
          allowFullScreen
          title={`${video.vod_name} - ${currentEpisode.name}`}
          onLoad={() => setIsBuffering(false)}
        />
      );
    }

    // HTML5 视频播放器
    return (
      <div className="w-full h-full relative">
        <video
          ref={videoRef}
          key={`${currentSourceIndex}-${currentEpisodeIndex}`}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onError={handleVideoError}
          onClick={togglePlayPause}
          preload="metadata"
          crossOrigin="anonymous"
        >
          {videoType !== 'hls' && (
            <source src={currentEpisode.url} type="video/mp4" />
          )}
          <p className="text-foreground">您的浏览器不支持视频播放</p>
        </video>
        
        {/* Loading Spinner */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <div className="w-12 h-12 border-4 border-muted border-t-foreground rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={togglePlayPause}
              className="cursor-pointer w-20 h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm border-2 border-border/30 transition-all duration-300 hover:scale-110"
            >
              <Play className="h-8 w-8 text-foreground fill-foreground ml-1" />
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-background overflow-hidden -mt-16"
      style={{ height: 'calc(100vh - var(--spacing) * 4)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => !showEpisodes && playerType === 'video' && setShowControls(false)}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/80 pointer-events-none z-10" />
      
      {/* Top Bar - Mobile Optimized */}
      <div className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/60 to-transparent backdrop-blur-xl transition-all duration-300 ${showControls || playerType === 'iframe' ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
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
                  onClick={() => setShowEpisodes(!showEpisodes)}
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
                  <Badge className="bg-blue-600/80 text-foreground text-xs px-2 py-0.5 rounded-full">
                    {currentEpisode.name}
                  </Badge>
                )}
                <Badge className="bg-green-600/80 text-foreground text-xs px-2 py-0.5 rounded-full">
                  {currentPlaySource?.quality || 'HD'}
                </Badge>
                {playSources.length > 1 && (
                  <Badge className="bg-purple-600/80 text-foreground text-xs px-2 py-0.5 rounded-full">
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
                  <Badge className="bg-gradient-to-r from-purple-600/80 to-purple-700/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg shadow-purple-500/25">
                    {playerType === 'iframe' ? 'Iframe' : getVideoType(currentEpisode?.url || '').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Episode List Button - Glass Style */}
              {totalEpisodes > 1 && (
                <Button
                  onClick={() => setShowEpisodes(!showEpisodes)}
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-white/20 bg-background/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 shadow-lg shadow-black/25"
                >
                  <List className="h-4 w-4 mr-2" />
                  选集 ({currentEpisodeIndex + 1}/{totalEpisodes})
                </Button>
              )}
              
              {/* Source Selector - Enhanced Glass */}
              {playSources.length > 1 && (
                <Select value={currentSourceIndex.toString()} onValueChange={handleSourceChange}>
                  <SelectTrigger className="w-48 bg-background/20 backdrop-blur-xl text-foreground border-white/20 rounded-full px-4 py-2 shadow-lg shadow-black/25">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/80 backdrop-blur-2xl text-foreground border-white/20 rounded-2xl shadow-2xl shadow-black/50">
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
        {renderVideoPlayer()}
      </div>

      {/* Bottom Controls - Mobile Optimized */}
      {playerType === 'video' && currentEpisode && (
        <div className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 to-transparent transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
          {/* Mobile Controls */}
          <div className="lg:hidden p-4">
            {/* Progress Bar - Compact */}
            <div className="mb-4">
              <div className="relative bg-black/30 backdrop-blur-md rounded-full p-2 border border-white/10">
                <VideoProgressSlider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleProgressClick}
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
                    onClick={togglePlayPause}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm border border-white/20 rounded-full w-10 h-10 p-0 shadow-lg shadow-blue-500/25"
                  >
                    {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Play className="h-5 w-5 text-white ml-0.5" />}
                  </Button>
                  
                  <Button 
                    onClick={goToPrevEpisode}
                    disabled={currentEpisodeIndex === 0}
                    variant="ghost" 
                    size="sm" 
                    className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={goToNextEpisode}
                    disabled={currentEpisodeIndex >= totalEpisodes - 1}
                    variant="ghost" 
                    size="sm" 
                    className="text-foreground hover:bg-muted/20 disabled:opacity-50 disabled:cursor-not-allowed bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleMute}
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:bg-muted/20 bg-background/10 backdrop-blur-sm border border-border/20 rounded-full w-8 h-8 p-0"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    onClick={toggleFullscreen}
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
                  onValueChange={handleProgressClick}
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
                    onClick={togglePlayPause}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 backdrop-blur-sm border border-white/20 rounded-full w-12 h-12 p-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-0.5" />}
                  </Button>
                  
                  <Button 
                    onClick={goToPrevEpisode}
                    disabled={currentEpisodeIndex === 0}
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    onClick={goToNextEpisode}
                    disabled={currentEpisodeIndex >= totalEpisodes - 1}
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 border border-white/20">
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 rounded-full w-8 h-8 p-0"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="w-20">
                      <VolumeSlider
                        value={isMuted ? [0] : volume}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    onClick={toggleFullscreen}
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
      )}

      {/* Episode List Panel - Mobile Optimized */}
      {showEpisodes && totalEpisodes > 1 && (
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
                      第 {currentEpisodePage + 1} 页 / 共 {totalPages} 页 (共 {totalEpisodes} 集)
                    </div>
                  )}
                </div>
              </div>
              <Button
                onClick={() => setShowEpisodes(false)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full w-8 h-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mb-4 bg-black/20 backdrop-blur-xl rounded-xl p-3 border border-white/10">
                <Button
                  onClick={() => goToEpisodePage(currentEpisodePage - 1)}
                  disabled={currentEpisodePage === 0}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 flex-1 justify-center">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageIndex;
                    if (totalPages <= 7) {
                      pageIndex = i;
                    } else if (currentEpisodePage <= 3) {
                      pageIndex = i;
                    } else if (currentEpisodePage >= totalPages - 4) {
                      pageIndex = totalPages - 7 + i;
                    } else {
                      pageIndex = currentEpisodePage - 3 + i;
                    }
                    
                    const isCurrentPage = pageIndex === currentEpisodePage;
                    const startEp = pageIndex * EPISODES_PER_PAGE + 1;
                    const endEp = Math.min((pageIndex + 1) * EPISODES_PER_PAGE, totalEpisodes);
                    
                    return (
                      <Button
                        key={pageIndex}
                        onClick={() => goToEpisodePage(pageIndex)}
                        variant="ghost"
                        size="sm"
                        className={`text-xs px-2 py-1 h-8 min-w-12 rounded-lg transition-all duration-200 ${
                          isCurrentPage 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border border-white/20 shadow-lg" 
                            : "text-gray-300 hover:text-white hover:bg-white/20 bg-white/5"
                        }`}
                        title={`第${startEp}-${endEp}集`}
                      >
                        {startEp}-{endEp}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  onClick={() => goToEpisodePage(currentEpisodePage + 1)}
                  disabled={currentEpisodePage === totalPages - 1}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 bg-white/10 backdrop-blur-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            {/* Episode Grid - Mobile Optimized */}
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 lg:gap-3">
              {currentPageEpisodes.map((episode, pageIndex) => {
                const actualIndex = startEpisodeIndex + pageIndex;
                const isCurrentEpisode = actualIndex === currentEpisodeIndex;
                
                return (
                  <button
                    key={actualIndex}
                    onClick={() => handleEpisodeChange(actualIndex)}
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
      )}
    </div>
  );
} 