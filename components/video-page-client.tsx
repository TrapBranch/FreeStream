'use client';

import { Play, Calendar, Globe, Users, Star, Clock, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VideoGrid from '@/components/video-grid';
import EpisodeListPaginated from '@/components/video/episode-list-paginated';
import Image from 'next/image';
import Link from 'next/link';

interface VideoPageClientProps {
  video: any;
  relatedVideos: any[];
}

export default function VideoPageClient({ video, relatedVideos }: VideoPageClientProps) {

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 lg:px-8 py-4 lg:py-8">
        {/* Video Details */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8 mb-8 lg:mb-12">
          {/* Mobile: Integrated Info and Poster */}
          <div className="lg:hidden mb-6">
            <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-border/30 shadow-xl">
              {/* Mobile Header with Poster and Info */}
              <div className="flex gap-4 mb-4">
                {/* Compact Poster */}
                <div className="w-24 flex-shrink-0">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-card/50 backdrop-blur-xl border border-border/30">
                    {video.vod_pic ? (
                      <Image
                        src={video.vod_pic}
                        alt={video.vod_name}
                        fill
                        className="object-cover"
                        priority
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 backdrop-blur-sm flex items-center justify-center">
                        <Play className="h-6 w-6 text-primary-foreground/80" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg font-bold text-foreground mb-2 leading-tight line-clamp-2">
                    {video.vod_name}
                  </h1>
                  
                  {/* Mobile Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {video.type_name && (
                      <Badge className="bg-gradient-to-r from-blue-500/70 to-purple-600/70 backdrop-blur-md text-primary-foreground px-2 py-0.5 text-xs rounded-full border border-border/30">
                        {video.type_name}
                      </Badge>
                    )}
                    {video.vod_year && (
                      <Badge className="bg-muted/50 backdrop-blur-md border-border/30 text-muted-foreground px-2 py-0.5 text-xs rounded-full">
                        {video.vod_year}
                      </Badge>
                    )}
                    {video.vod_remarks && (
                      <Badge className="bg-gradient-to-r from-yellow-500/70 to-orange-500/70 backdrop-blur-md text-primary-foreground px-2 py-0.5 text-xs rounded-full border border-border/30">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        <span className="truncate max-w-[60px]">{video.vod_remarks}</span>
                      </Badge>
                    )}
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {video.vod_area && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 flex-shrink-0" />
                        <span>{video.vod_area}</span>
                      </div>
                    )}
                    {video.vod_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{video.vod_time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Play Buttons */}
              <div className="flex gap-3">
                <Link href={`/play/${video.vod_id}`} className="flex-1">
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-primary-foreground py-3 text-sm font-semibold rounded-xl shadow-lg border border-border/30"
                  >
                    <Play className="h-4 w-4 mr-2 fill-current" />
                    立即播放
                  </Button>
                </Link>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-border/50 text-foreground bg-muted/50 hover:bg-muted px-4 py-3 text-sm rounded-xl"
                >
                  <Star className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile: Episode List - Full Width */}
          <div className="lg:hidden mb-6">
            {video.vod_play_url && video.vod_play_from && (
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-border/30 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">选集播放</h3>
                  <Badge className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 text-primary-foreground px-3 py-1 text-xs rounded-full">
                    <Tv className="h-3 w-3 mr-1" />
                    共{video.vod_play_url.split('#').length}集
                  </Badge>
                </div>
                <EpisodeListPaginated 
                  videoId={video.vod_id}
                  playFrom={video.vod_play_from}
                  playUrl={video.vod_play_url}
                />
              </div>
            )}
          </div>

          {/* Desktop Layout - Keep Original */}
          {/* Poster - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="relative w-full max-w-sm mx-auto lg:max-w-none">
              <div className="aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl border border-border/30">
                {video.vod_pic ? (
                  <Image
                    src={video.vod_pic}
                    alt={video.vod_name}
                    fill
                    className="object-cover"
                    priority
                    sizes="25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/50 to-secondary/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-muted/50 backdrop-blur-md border border-border/30 flex items-center justify-center">
                      <Play className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Info - Desktop Layout */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div>
              {/* Title with Glass Background */}
              <div className="rounded-3xl p-6 border border-border/30 mb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                  {video.vod_name}
                </h1>
                
                {/* Badges with Glass Effect */}
                <div className="flex flex-wrap gap-3 mb-6">
                  {video.type_name && (
                    <Badge className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 backdrop-blur-md text-primary-foreground px-4 py-2 text-sm font-medium rounded-full border border-border/30 shadow-lg">
                      {video.type_name}
                    </Badge>
                  )}
                  {video.vod_year && (
                    <Badge className="bg-muted/50 backdrop-blur-md border-border/30 text-muted-foreground px-4 py-2 text-sm rounded-full hover:bg-muted transition-all duration-300 shadow-lg">
                      <Calendar className="h-3 w-3 mr-1" />
                      {video.vod_year}
                    </Badge>
                  )}
                  {video.vod_remarks && (
                    <Badge className="bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md text-primary-foreground px-4 py-2 text-sm font-medium rounded-full border border-border/30 shadow-lg">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {video.vod_remarks}
                    </Badge>
                  )}
                </div>

                {/* Play Buttons with Enhanced Glass Effect */}
                <div className="flex flex-wrap gap-4">
                  <Link href={`/play/${video.vod_id}`}>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-full shadow-xl transition-all duration-300 hover:scale-105 border border-border/30"
                    >
                      <Play className="h-6 w-6 mr-3 fill-current" />
                      立即播放
                    </Button>
                  </Link>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-border/50 text-foreground bg-muted/50 hover:bg-muted px-8 py-4 text-lg font-semibold rounded-full shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Star className="h-6 w-6 mr-3" />
                    收藏
                  </Button>
                </div>
              </div>
            </div>

            {/* Details Grid with Glass Effect */}
            <div className="rounded-3xl p-6 border border-border/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {video.vod_area && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 backdrop-blur-sm rounded-2xl border border-border/20 hover:bg-muted/30 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">地区</span>
                      <p className="text-foreground font-semibold">{video.vod_area}</p>
                    </div>
                  </div>
                )}
                {video.vod_lang && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 backdrop-blur-sm rounded-2xl border border-border/20 hover:bg-muted/30 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Globe className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">语言</span>
                      <p className="text-foreground font-semibold">{video.vod_lang}</p>
                    </div>
                  </div>
                )}
                {video.vod_year && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 backdrop-blur-sm rounded-2xl border border-border/20 hover:bg-muted/30 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">年份</span>
                      <p className="text-foreground font-semibold">{video.vod_year}</p>
                    </div>
                  </div>
                )}
                {video.vod_time && (
                  <div className="flex items-center gap-3 p-3 bg-muted/20 backdrop-blur-sm rounded-2xl border border-border/20 hover:bg-muted/30 transition-all duration-300 sm:col-span-2 lg:col-span-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Clock className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">更新时间</span>
                      <p className="text-foreground font-semibold">{video.vod_time}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Cast and Director with Glass Effect */}
            <div className="space-y-4">
              {video.vod_director && (
                <div className="rounded-3xl p-6 border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">导演</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed ml-13 bg-muted/20 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
                    {video.vod_director}
                  </p>
                </div>
              )}

              {video.vod_actor && (
                <div className="rounded-3xl p-6 border border-border/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 backdrop-blur-sm flex items-center justify-center">
                      <Users className="h-5 w-5 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">主演</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed ml-13 bg-muted/20 backdrop-blur-sm rounded-2xl p-4 border border-border/20">
                    {video.vod_actor}
                  </p>
                </div>
              )}
            </div>

            {/* Description with Enhanced Glass Effect */}
            {video.vod_content && (
              <div className="rounded-3xl p-6 border border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <h3 className="text-xl font-semibold text-foreground">
                    剧情简介
                  </h3>
                </div>
                <div className="bg-muted/20 backdrop-blur-sm rounded-2xl p-6 border border-border/20">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {video.vod_content.replace(/<[^>]*>/g, '')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Episode List with Glass Container - Full Width on Desktop */}
        {video.vod_play_url && video.vod_play_from && (
          <div className="hidden lg:block mb-12 rounded-3xl p-6 border border-border/30">
            <EpisodeListPaginated 
              videoId={video.vod_id}
              playFrom={video.vod_play_from}
              playUrl={video.vod_play_url}
            />
          </div>
        )}

        {/* Mobile: Additional Details */}
        <div className="lg:hidden space-y-4 mb-6">
          {/* Description */}
          {video.vod_content && (
            <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-border/30 shadow-lg">
              <h3 className="text-sm font-semibold text-foreground mb-2">剧情简介</h3>
              <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-3 border border-border/20">
                <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4">
                  {video.vod_content.replace(/<[^>]*>/g, '')}
                </p>
              </div>
            </div>
          )}

          {/* Cast Info */}
          {(video.vod_director || video.vod_actor) && (
            <div className="bg-card/50 backdrop-blur-xl rounded-2xl p-4 border border-border/30 shadow-lg space-y-3">
              {video.vod_director && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-red-500" />
                    <h4 className="text-xs font-medium text-foreground">导演</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 ml-5">
                    {video.vod_director}
                  </p>
                </div>
              )}
              {video.vod_actor && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-orange-500" />
                    <h4 className="text-xs font-medium text-foreground">主演</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 ml-5">
                    {video.vod_actor}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related Videos with Glass Container */}
        {relatedVideos.length > 0 && (
          <div className="rounded-3xl p-6 border border-border/30">
            <VideoGrid 
              videos={relatedVideos} 
              title="相关推荐" 
              size="medium"
            />
          </div>
        )}
      </div>
    </div>
  );
} 