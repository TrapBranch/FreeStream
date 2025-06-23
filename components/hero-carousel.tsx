'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { VideoItem } from '@/lib/api';
import { Play, Star, Calendar, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';

interface HeroCarouselProps {
  videos: VideoItem[];
}

export default function HeroCarousel({ videos }: HeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const autoplayRef = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      duration: 30
    },
    [autoplayRef.current]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!videos || videos.length === 0) {
    return null;
  }

  const carouselVideos = videos.slice(0, 5);

  return (
    <div 
      className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-2xl group"
      onMouseEnter={() => setIsNavVisible(true)}
      onMouseLeave={() => setIsNavVisible(false)}
    >
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {carouselVideos.map((video, index) => (
            <div key={video.vod_id} className="flex-[0_0_100%] relative h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                {video.vod_pic ? (
                  <Image
                    src={video.vod_pic}
                    alt={video.vod_name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700" />
                )}
              </div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

              {/* Content */}
              <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-6 lg:px-12">
                  <div className="max-w-2xl space-y-6">
                    {/* Badges */}
                    <div className="flex items-center gap-3">
                      {video.type_name && (
                        <Badge className="bg-blue-600/95 hover:bg-blue-700 text-white px-4 py-2 text-sm font-bold shadow-xl backdrop-blur-sm border border-blue-400/30">
                          {video.type_name}
                        </Badge>
                      )}
                      {video.vod_year && (
                        <Badge variant="outline" className="border-slate-300/50 text-slate-100 bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-sm font-medium shadow-lg">
                          <Calendar className="h-4 w-4 mr-2" />
                          {video.vod_year}
                        </Badge>
                      )}
                      {video.vod_area && (
                        <Badge variant="outline" className="border-slate-300/50 text-slate-100 bg-slate-800/80 backdrop-blur-sm px-4 py-2 text-sm font-medium shadow-lg">
                          <Globe className="h-4 w-4 mr-2" />
                          {video.vod_area}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl lg:text-6xl font-bold text-slate-50 leading-tight drop-shadow-2xl">
                      {video.vod_name}
                    </h1>

                    {/* Rating */}
                    {video.vod_remarks && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-amber-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                          <Star className="h-5 w-5 text-amber-50 fill-current" />
                          <span className="text-amber-50 font-medium">{video.vod_remarks}</span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {video.vod_content && (
                      <p className="text-lg text-slate-200 leading-relaxed line-clamp-3 drop-shadow-lg max-w-xl">
                        {video.vod_content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                      <Link href={`/video/${video.vod_id}`}>
                        <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 shadow-xl">
                          <Play className="h-6 w-6 mr-3 fill-current" />
                          立即播放
                        </Button>
                      </Link>
                      
                      <Link href={`/video/${video.vod_id}`}>
                        <Button size="lg" variant="outline" className="bg-slate-800/70 border-slate-300/60 text-slate-100 backdrop-blur-sm font-semibold px-8 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:bg-slate-700/80 shadow-lg">
                          了解更多
                        </Button>
                      </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="flex items-center gap-6 text-sm text-slate-400 pt-2">
                      {video.vod_actor && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400/70">主演:</span>
                          <span className="font-medium text-slate-200">{video.vod_actor.split(',')[0]}</span>
                        </div>
                      )}
                      {video.vod_director && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400/70">导演:</span>
                          <span className="font-medium text-slate-200">{video.vod_director}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Navigation Sidebar */}
      <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-80 max-h-[60vh] transition-all duration-500 ease-out ${
        isNavVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <div className="hidden md:block bg-slate-900/60 backdrop-blur-xl border border-slate-600/20 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-slate-50 font-semibold text-lg mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            精选内容
          </h3>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto scrollbar-hide">
            {carouselVideos.map((video, index) => (
              <div
                key={video.vod_id}
                onClick={() => scrollTo(index)}
                className={`group cursor-pointer p-4 rounded-xl transition-all duration-300 border ${
                  index === selectedIndex
                    ? 'bg-slate-700/40 border-slate-500/40 shadow-lg'
                    : 'bg-slate-800/20 border-slate-600/20 hover:bg-slate-700/30 hover:border-slate-500/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    {video.vod_pic ? (
                      <Image
                        src={video.vod_pic}
                        alt={video.vod_name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-600" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium text-sm leading-tight mb-2 transition-colors duration-200 ${
                      index === selectedIndex ? 'text-slate-50' : 'text-slate-300 group-hover:text-slate-50'
                    }`}>
                      {video.vod_name}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {video.type_name && (
                        <span className="text-xs px-2 py-1 bg-amber-500/80 text-amber-50 rounded-full">
                          {video.type_name}
                        </span>
                      )}
                      {video.vod_year && (
                        <span className="text-xs text-slate-400">
                          {video.vod_year}
                        </span>
                      )}
                    </div>

                    {video.vod_remarks && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-400 fill-current" />
                        <span className="text-xs text-slate-400">{video.vod_remarks}</span>
                      </div>
                    )}
                  </div>

                  {/* Active Indicator */}
                  {index === selectedIndex && (
                    <div className="w-2 h-2 bg-slate-200 rounded-full flex-shrink-0 mt-2" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Buttons - Only visible on hover */}
      <button
        onClick={scrollPrev}
        className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-100 transition-all duration-300 hover:scale-110 z-10 opacity-0 group-hover:opacity-100"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={scrollNext}
        className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-100 transition-all duration-300 hover:scale-110 z-10 opacity-0 group-hover:opacity-100 mr-96"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {carouselVideos.map((_, index) => (
          <Button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-slate-200 scale-125' 
                : 'bg-slate-400/40 hover:bg-slate-300/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
    </div>
  );
} 