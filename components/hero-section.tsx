'use client';

import { VideoItem } from '@/lib/api';
import { Play, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface HeroSectionProps {
  featuredVideo: VideoItem;
}

export default function HeroSection({ featuredVideo }: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-2xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        {!imageError && featuredVideo.vod_pic ? (
          <Image
            src={featuredVideo.vod_pic}
            alt={featuredVideo.vod_name}
            fill
            className="object-cover"
            onError={handleImageError}
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
        )}
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="mx-auto px-6">
          <div className="space-y-6 text-white">
            {/* Category */}
            {featuredVideo.type_name && (
              <div className="flex items-center gap-2">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                  {featuredVideo.type_name}
                </span>
                {featuredVideo.vod_year && (
                  <span className="text-gray-300 text-sm">
                    {featuredVideo.vod_year}
                  </span>
                )}
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {featuredVideo.vod_name}
            </h1>
            
            {/* Rating and Info */}
            <div className="flex items-center gap-4 text-sm">
              {featuredVideo.vod_remarks && (
                <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{featuredVideo.vod_remarks}</span>
                </div>
              )}
              {featuredVideo.vod_area && (
                <span className="text-gray-300">{featuredVideo.vod_area}</span>
              )}
              {featuredVideo.vod_lang && (
                <span className="text-gray-300">{featuredVideo.vod_lang}</span>
              )}
            </div>
            
            {/* Description */}
            {featuredVideo.vod_content && (
              <p className="text-gray-200 text-lg max-w-2xl line-clamp-3">
                {featuredVideo.vod_content.replace(/<[^>]*>/g, '')}
              </p>
            )}
            
            {/* Cast */}
            {featuredVideo.vod_actor && (
              <div className="text-sm text-gray-300">
                <span className="font-medium">主演: </span>
                {featuredVideo.vod_actor}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Link href={`/video/${featuredVideo.vod_id}`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  <Play className="h-5 w-5 mr-2 fill-current" />
                  立即播放
                </Button>
              </Link>
              <Link href={`/video/${featuredVideo.vod_id}`}>
                <Button size="lg" variant="outline" className="border-white/20 bg-white/10 hover:bg-white/20 text-white px-8 py-3 text-lg backdrop-blur-sm">
                  <Info className="h-5 w-5 mr-2" />
                  详细信息
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}