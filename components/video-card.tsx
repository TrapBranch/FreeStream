'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Play, Clock, Star } from 'lucide-react';
import { VideoItem } from '@/lib/api';
import { useState } from 'react';

interface VideoCardProps {
  video: VideoItem;
  size?: 'small' | 'medium' | 'large';
}

export default function VideoCard({ video, size = 'medium' }: VideoCardProps) {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Link href={`/video/${video.vod_id}`} className="group block w-full video-card-optimized">
      <div className="relative w-full aspect-[3/4] sm:aspect-[3/4.2] overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-muted to-muted/80 shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-[1.02] border border-border/50">
        {/* Background Image - Full Container */}
        {!imageError && video.vod_pic ? (
          <Image
            src={video.vod_pic}
            alt={video.vod_name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/60 to-primary/80 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary-foreground/80" />
          </div>
        )}
        
        {/* Simplified Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        
        {/* Play Button Overlay - Simplified */}
        <div className="cursor-pointer absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <div className="bg-black/70 rounded-full p-4 sm:p-5 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl">
            <Play className="h-8 w-8 sm:h-10 sm:w-10 text-white fill-white" />
          </div>
        </div>
        
        {/* Top Badges - Simplified */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between items-start z-10">
          {video.vod_year && (
            <div className="bg-black/60 rounded-full px-3 py-1.5 text-xs text-slate-100 font-semibold shadow-lg">
              {video.vod_year}
            </div>
          )}
          {video.vod_remarks && (
            <div className="bg-orange-500/60 rounded-full px-3 py-1.5 text-xs text-amber-50 font-semibold flex items-center gap-1 whitespace-nowrap max-w-[100px] sm:max-w-none overflow-hidden shadow-lg">
              <Star className="h-3 w-3 fill-current flex-shrink-0" />
              <span className="truncate">{video.vod_remarks}</span>
            </div>
          )}
        </div>
        
        {/* Bottom Content - Simplified */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 backdrop-blur-sm">
          <h3 className="font-bold text-slate-50 text-sm mb-2 sm:mb-3 line-clamp-2 group-hover:text-amber-300 transition-colors leading-tight">
            {video.vod_name}
          </h3>
          
          {/* Tags - Simplified */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 overflow-hidden">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap overflow-hidden">
              {video.vod_area && (
                <span className="bg-slate-700/85 rounded-full px-2.5 py-1 text-xs text-slate-200 font-medium whitespace-nowrap flex-shrink-0">
                  {video.vod_area}
                </span>
              )}
              {video.type_name && (
                <span className="bg-indigo-600/85 rounded-full px-2.5 py-1 text-xs text-indigo-50 font-medium whitespace-nowrap flex-shrink-0 max-w-[80px] sm:max-w-none overflow-hidden">
                  <span className="truncate">{video.type_name}</span>
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-slate-300">
            <Clock className="h-3 w-3 flex-shrink-0" />
            <span className="truncate text-xs">{video.vod_time}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}