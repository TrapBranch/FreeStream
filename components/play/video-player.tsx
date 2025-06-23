'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  currentEpisode: {
    name: string;
    url: string;
    episodeNumber: number;
  } | undefined;
  isPlaying: boolean;
  playbackRate: number;
  shouldAutoPlay: boolean;
  onPlay: () => void;
  onPause: () => void;
  onTimeUpdate: (currentTime: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onError: (error: string) => void;
  onBuffering: (isBuffering: boolean) => void;
  onEnded: () => void;
  volume: number[];
  isMuted: boolean;
}

export interface VideoPlayerRef {
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  requestFullscreen: () => void;
  exitFullscreen: () => void;
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

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  currentEpisode,
  isPlaying,
  playbackRate,
  shouldAutoPlay,
  onPlay,
  onPause,
  onTimeUpdate,
  onLoadedMetadata,
  onError,
  onBuffering,
  onEnded,
  volume,
  isMuted
}, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useImperativeHandle(ref, () => ({
    play: () => videoRef.current?.play(),
    pause: () => videoRef.current?.pause(),
    setCurrentTime: (time: number) => {
      if (videoRef.current) {
        videoRef.current.currentTime = time;
      }
    },
    setVolume: (vol: number) => {
      if (videoRef.current) {
        videoRef.current.volume = vol;
      }
    },
    setPlaybackRate: (rate: number) => {
      if (videoRef.current) {
        videoRef.current.playbackRate = rate;
      }
    },
    requestFullscreen: () => videoRef.current?.requestFullscreen(),
    exitFullscreen: () => document.exitFullscreen()
  }));

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
        console.log('HLS manifest loaded');
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              onError('网络错误，请检查网络连接');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              onError('媒体错误，尝试恢复播放');
              hls.recoverMediaError();
              break;
            default:
              onError('播放器错误，请刷新页面重试');
              hls.destroy();
              break;
          }
        }
      });
    } else {
      onError('当前浏览器不支持HLS播放');
    }
  };

  // 当集数改变时，重新初始化播放器
  useEffect(() => {
    if (currentEpisode) {
      const videoType = getVideoType(currentEpisode.url);
      onBuffering(true);
      
      if (videoType === 'hls' && videoRef.current) {
        initializeHLS(currentEpisode.url);
      } else if (videoType === 'mp4' && videoRef.current) {
        videoRef.current.src = currentEpisode.url;
      }
    }
    
    // 清理函数
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode]);

  // 当视频加载完成后，重新设置倍速
  useEffect(() => {
    const handleLoadedData = () => {
      if (videoRef.current && playbackRate !== 1) {
        videoRef.current.playbackRate = playbackRate;
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleLoadedData);
      return () => {
        videoElement.removeEventListener('loadeddata', handleLoadedData);
      };
    }
  }, [currentEpisode, playbackRate]);

  // 设置音量和静音状态
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  // 设置播放速度
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onLoadedMetadata(videoRef.current.duration);
      onBuffering(false);
      // 确保倍速设置正确应用
      if (playbackRate !== 1) {
        videoRef.current.playbackRate = playbackRate;
      }
    }
  };

  const handleVideoError = (error: any) => {
    console.error('Video error:', error);
    onError('视频加载失败，请稍后重试');
    onBuffering(false);
  };

  const handlePlay = () => {
    onPlay();
    onBuffering(false);
  };

  const handlePause = () => {
    onPause();
  };

  const handleWaiting = () => {
    onBuffering(true);
  };

  const handleCanPlay = () => {
    onBuffering(false);
  };

  if (!currentEpisode) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50">📺</div>
          <p>暂无可播放的视频源</p>
        </div>
      </div>
    );
  }

  const videoType = getVideoType(currentEpisode.url);

  if (videoType === 'iframe') {
    return (
      <iframe
        src={currentEpisode.url}
        className="w-full h-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media"
      />
    );
  }

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleVideoError}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        onEnded={onEnded}
        onClick={handleVideoClick}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      />
      
      {/* Center Play Button */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="w-20 h-20 rounded-full bg-background/20 hover:bg-background/30 backdrop-blur-sm border-2 border-border/30 transition-all duration-300 hover:scale-110 flex items-center justify-center">
            <Play className="h-8 w-8 text-muted-foreground fill-muted-foreground ml-1" />
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer; 